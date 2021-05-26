import re
from werkzeug.utils import secure_filename
import os
import pandas as pd
from cdm_souffleur.model import atc_to_rxnorm
from cdm_souffleur.model.code_mapping import CodeMapping, CodeMappingEncoder, ScoredConcept, MappingTarget, \
    MappingStatus, TargetConcept
from cdm_souffleur.model.concept import Concept
from cdm_souffleur.model.conceptVocabularyModel import Source_To_Concept_Map
from cdm_souffleur.model.mapped_concepts import mapped_concept
from cdm_souffleur.model.source_code import SourceCode
from cdm_souffleur.services.web_socket_service import socketio, emit_status
from cdm_souffleur.services.solr_core_service import create_core
from cdm_souffleur.utils import InvalidUsage
from cdm_souffleur.utils.async_directive import fire_and_forget
from cdm_souffleur.utils.constants import UPLOAD_SOURCE_CODES_FOLDER, CONCEPT_IDS, SOURCE_CODE_TYPE_STRING, SOLR_PATH, \
    SOLR_FILTERS
import pysolr
from cdm_souffleur import app, json
import logging
import os.path
from os import path

CONCEPT_TERM = "C"

logging.basicConfig(level=logging.INFO)

saved_import_results = {}
fetched_vocabularies = {}

def create_source_codes(current_user, codes, source_code_column, source_name_column, source_frequency_column,
                        auto_concept_id_column, concept_ids_or_atc, additional_info_columns):
    source_codes = []
    for row in codes:
        if 'selected' in row:
            if row['selected']:
                source_codes.append(add_source_code(row, source_code_column, source_name_column, source_frequency_column,
                                            auto_concept_id_column, concept_ids_or_atc, additional_info_columns, row))
    return source_codes


def add_source_code(row, source_code_column, source_name_column, source_frequency_column, auto_concept_id_column,
                    concept_ids_or_atc, additional_info_columns, code):
    new_code = SourceCode()
    new_code.code = code
    if not source_code_column:
        new_code.source_code = ''
    else:
        new_code.source_code = row[source_code_column]
    new_code.source_name = row[source_name_column]
    if source_frequency_column:
        new_code.source_frequency = int(row[source_frequency_column])
    else:
        new_code.source_frequency = -1
    if auto_concept_id_column:
        if concept_ids_or_atc == CONCEPT_IDS:
            for concept_id in row[auto_concept_id_column].split(';'):
                if concept_id != "":
                    new_code.source_auto_assigned_concept_ids = new_code.source_auto_assigned_concept_ids.add(
                        int(concept_id))
        else:
            concept_id_2_query = atc_to_rxnorm.select().where(atc_to_rxnorm.concept_code == row[auto_concept_id_column])
            for item in concept_id_2_query:
                new_code.source_auto_assigned_concept_ids = new_code.source_auto_assigned_concept_ids.add(
                    item.concept_id_2)
    if additional_info_columns:
        new_code.source_additional_info.append({additional_info_columns: row[additional_info_columns]})
    return new_code


def load_codes_to_server(file, delimiter, current_user):
    try:
        if file:
            filename = secure_filename(file.filename)
            try:
                os.makedirs(f"{UPLOAD_SOURCE_CODES_FOLDER}/{current_user}")
                print(f"Directory {UPLOAD_SOURCE_CODES_FOLDER}/{current_user} created")
            except FileExistsError:
                print(f"Directory {UPLOAD_SOURCE_CODES_FOLDER}/{current_user} already exist")
            file.save(f"{UPLOAD_SOURCE_CODES_FOLDER}/{current_user}/{filename}")
            file.close()
            codes_file = csv_to_json(f"{UPLOAD_SOURCE_CODES_FOLDER}/{current_user}/{filename}", delimiter)
    except Exception as error:
        raise InvalidUsage('Codes were not loaded', 400)
    return codes_file


def csv_to_json(filepath, delimiter):
    json_file = []
    data = pd.read_csv(filepath, delimiter=delimiter).fillna('')
    for row in data.iterrows():
        json_row = {}
        for col in data.columns:
            json_row[col] = row[1][col]
        json_file.append(json_row)
    return json_file


def create_derived_index(current_user, source_codes):
    solr = pysolr.Solr(f"http://{app.config['SOLR_HOST']}:{app.config['SOLR_PORT']}/solr/{current_user}",
                       always_commit=True)
    for item in source_codes:
        solr.add({
            "term": item.source_name,
            "type": SOURCE_CODE_TYPE_STRING,
        })
    return


@fire_and_forget
def create_concept_mapping(current_user, codes, filters, source_code_column, source_name_column, source_frequency_column,
                           auto_concept_id_column, concept_ids_or_atc, additional_info_columns):
    try:
        source_codes = create_source_codes(current_user, codes, source_code_column, source_name_column,
                                           source_frequency_column, auto_concept_id_column, concept_ids_or_atc,
                                           additional_info_columns)
        emit_status(current_user, f"import_codes_status", "Started creating index", 0)
        create_core(current_user)
        create_derived_index(current_user, source_codes)
        emit_status(current_user, f"import_codes_status", "Index created", 1)
        global_mapping_list = []
        for source_code in source_codes:
            code_mapping = CodeMapping()
            code_mapping.sourceCode = source_code
            code_mapping.sourceCode.source_auto_assigned_concept_ids = list(
                code_mapping.sourceCode.source_auto_assigned_concept_ids)
            emit_status(current_user, f"import_codes_status", f"Searching {source_code.source_name}", 1)
            scored_concepts = search(current_user, filters, source_code.source_name, source_code.source_auto_assigned_concept_ids)
            if len(scored_concepts):
                target_concept = MappingTarget(concept=scored_concepts[0].concept, createdBy='<auto>')
                code_mapping.targetConcepts = [target_concept]
                code_mapping.matchScore = scored_concepts[0].match_score
            else:
                code_mapping.targetConcept = None
                code_mapping.matchScore = 0
            if len(source_code.source_auto_assigned_concept_ids) == 1 and len(scored_concepts):
                code_mapping.mappingStatus = MappingStatus.AUTO_MAPPED_TO_1
            elif len(source_code.source_auto_assigned_concept_ids) > 1 and len(scored_concepts):
                code_mapping.mappingStatus = MappingStatus.AUTO_MAPPED
            global_mapping_list.append(code_mapping)
        saved_import_results[current_user] = global_mapping_list
        emit_status(current_user, f"import_codes_status", "Import finished", 2)
    except Exception as error:
        emit_status(current_user, f"import_codes_status", error.__str__(), 4)
    return


def get_saved_code_mapping(current_user):
    result = json.dumps(saved_import_results[current_user], cls=CodeMappingEncoder)
    saved_import_results.pop(current_user, None)
    return result


def create_target_concept(concept):
    return TargetConcept(concept.concept_id,
                         concept.concept_name,
                         concept.concept_class_id,
                         concept.vocabulary_id,
                         concept.concept_code,
                         concept.domain_id,
                         concept.valid_start_date.strftime("%Y-%m-%d"),
                         concept.valid_end_date.strftime("%Y-%m-%d"),
                         concept.invalid_reason,
                         concept.standard_concept,
                         "",
                         concept.parent_count,
                         concept.parent_count)


def search(current_user, filters, query, source_auto_assigned_concept_ids):
    solr = pysolr.Solr(f"http://{app.config['SOLR_HOST']}:{app.config['SOLR_PORT']}/solr/{current_user}",
                       always_commit=True)
    scored_concepts = []
    if filters:
        filter_queries = create_filter_queries(filters, source_auto_assigned_concept_ids)
    words = '+'.join(re.split('[^a-zA-Z]', query))
    results = solr.search(f"term:{words}", fl='concept_id, term, score', fq=filter_queries, rows=100).docs
    for item in results:
        if 'concept_id' in item:
            target_concept = Concept.select().where(Concept.concept_id == item['concept_id']).get()
            concept = create_target_concept(target_concept)
            scored_concepts.append(ScoredConcept(item['score'], concept, item['term']))
    return scored_concepts


def create_filter_queries(filters, source_auto_assigned_concept_ids):
    queries = []
    create_or_filter_query(queries, filters['filterByConceptClass'], filters['conceptClasses'], 'concept_class_id')
    create_or_filter_query(queries, filters['filterByVocabulary'], filters['vocabularies'], 'vocabulary_id')
    create_or_filter_query(queries, filters['filterByDomain'], filters['domains'], 'domain_id')
    if filters['filterStandardConcepts']:
        queries.append('standard_concept:S')
    if source_auto_assigned_concept_ids and len(source_auto_assigned_concept_ids):
        create_or_filter_query(queries, filters['filterByUserSelectedConceptsAtcCode'], source_auto_assigned_concept_ids, 'concept_id')
    if filters['includeSourceTerms']:
        queries.append(f'term_type:{CONCEPT_TERM}')
    return queries


def create_or_filter_query(queries, filter_applied, values, field_name):
    def add_field_name(item, field_name):
        return f"{field_name}:{item}"
    if filter_applied:
        values_with_field_name = [add_field_name(item, field_name) for item in values]
        query = " OR ".join(values_with_field_name)
        if query:
            queries.append(query)
    return queries


def save_codes(current_user, codes, mapping_params, mapped_codes, vocabulary_name):
    for item in mapped_codes:
        if item['approved']:
            source_concept_id = 0
            source_code = item['sourceCode']['source_code']
            source_code_description = item['sourceCode']['source_name']
            for concept in item['targetConcepts']:
                mapped_code = Source_To_Concept_Map(source_concept_id=source_concept_id,
                                            source_code=source_code,
                                            source_vocabulary_id=vocabulary_name,
                                            source_code_description=source_code_description,
                                            target_concept_id=concept['concept']['conceptId'],
                                            target_vocabulary_id= "None" if concept['concept']['vocabularyId'] == "0" else concept['concept']['vocabularyId'],
                                            valid_start_date="1970-01-01",
                                            valid_end_date="2099-12-31",
                                            invalid_reason="",
                                            username=current_user)
                mapped_code.save()

    save_source_codes_and_mapped_concepts_in_db(current_user, codes, mapping_params, mapped_codes, vocabulary_name)
    return True


def save_source_codes_and_mapped_concepts_in_db(current_user, codes, mapping_params, mapped_codes, vocabulary_name):
    source_and_mapped_codes_dict = {'codes': codes, 'mappingParams': mapping_params, 'codeMappings': mapped_codes}
    source_and_mapped_codes_string = json.dumps(source_and_mapped_codes_dict)

    saved_mapped_concepts = mapped_concept.select().where(
        (mapped_concept.username == current_user) & (mapped_concept.name == vocabulary_name))
    if saved_mapped_concepts.exists():
        saved_mapped_concepts = saved_mapped_concepts.get()
        saved_mapped_concepts.codes_and_mapped_concepts = source_and_mapped_codes_string
        saved_mapped_concepts.save()
    else:
        new_saved_mapped_concepts = mapped_concept(name=vocabulary_name,
                                                   codes_and_mapped_concepts=source_and_mapped_codes_string,
                                                   username=current_user)
        new_saved_mapped_concepts.save()
    return


def get_vocabulary_list_for_user(current_user):
    result = []
    saved_mapped_concepts = mapped_concept.select().where(mapped_concept.username == current_user)
    if saved_mapped_concepts.exists():
        for item in saved_mapped_concepts:
            result.append(item.name)
    return result

@fire_and_forget
def load_mapped_concepts_by_vocabulary_name(vocabulary_name, current_user):
    try:
        emit_status(current_user, f"import_codes_status", "Fetching saved source codes", 0)
        saved_mapped_concepts = mapped_concept.select().where(
            (mapped_concept.username == current_user) & (mapped_concept.name == vocabulary_name))
        if saved_mapped_concepts.exists():
            codes_and_saved_mappings_string = saved_mapped_concepts.get().codes_and_mapped_concepts
            codes_and_saved_mappings = json.loads(codes_and_saved_mappings_string)
            codes = codes_and_saved_mappings['codes']
            params = codes_and_saved_mappings['mappingParams']
            source_codes = create_source_codes(current_user, codes,
                                               params['sourceCode'],
                                               params['sourceName'],
                                               params['sourceFrequency'],
                                               params['autoConceptId'],
                                               params['conceptIdOrAtc'] if 'conceptIdOrAtc' in params else '',
                                               params['additionalInfo'])
            emit_status(current_user, f"import_codes_status", "Started creating main index", 1)
            create_core(current_user)
            emit_status(current_user, f"import_codes_status", "Started creating derived index", 1)
            create_derived_index(current_user, source_codes)
            emit_status(current_user, f"import_codes_status", "Process finished", 2)
            fetched_vocabularies[current_user] = codes_and_saved_mappings
        else:
            raise InvalidUsage('Vocabulary not found', 404)
    except Exception as error:
        emit_status(current_user, f"import_codes_status", error.__str__(), 4)
    return


def get_vocabulary_data(current_user):
    result = fetched_vocabularies[current_user]
    fetched_vocabularies.pop(current_user, None)
    return result


def get_filters(current_user):
    core_name = current_user if path.exists(f'{SOLR_PATH}/{current_user}') else 'concepts'
    solr = pysolr.Solr(f"http://{app.config['SOLR_HOST']}:{app.config['SOLR_PORT']}/solr/{core_name}",
                       always_commit=True)
    facets = {}
    for key in SOLR_FILTERS:
        params = {
            'facet': 'on',
            'facet.field': key,
            'rows': '0',
        }
        results = solr.search("*:*", **params)
        facets_string_values = [x for x in results.facets['facet_fields'][key]if not isinstance(x, int)]
        facets[SOLR_FILTERS[key]] = sorted(facets_string_values)
    return facets


