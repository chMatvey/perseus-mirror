import { NgModule } from '@angular/core';
import { CdmComponent } from './cdm.component';
import { SharedModule } from '@shared/shared.module';
import { ToolbarModule } from '../toolbar/toolbar.module';
import { RouterModule } from '@angular/router';
import { CdmRoutingModule } from './cdm-routing.module';
import { BridgeService } from '@services/bridge.service';
import { CommonService } from '@services/common.service';
import { CommonUtilsService } from '@services/common-utils.service';
import { ConceptTransformationService } from '@services/concept-transformation.sevice';
import { EtlConfigurationService } from '@services/etl-configuration.service';
import { DataService } from '@services/data.service';
import { DrawService } from '@services/draw.service';
import { PerseusApiService } from '@services/perseus/perseus-api.service';
import { PerseusLookupService } from '@services/perseus/perseus-lookup.service';
import { ReportGenerationService } from '@services/report/report-generation.service';
import { StoreService } from '@services/store.service';
import { UploadService } from '@services/upload.service';
import { VocabulariesService } from '@services/vocabularies.service';
import { VocabularyObserverService } from '@services/athena/vocabulary-observer.service';
import { OverlayService } from '@services/overlay/overlay.service';
import { VocabularySearchService } from '@services/athena/vocabulary-search.service';
import { VocabularySearchStateService } from '@services/athena/vocabulary-search-state.service';
import { ScanDataService } from '@services/white-rabbit/scan-data.service';
import { ScanDataStateService } from '@services/white-rabbit/scan-data-state.service';
import { ScanDataUploadService } from '@services/white-rabbit/scan-data-upload.service';
import { FakeDataService } from '@services/white-rabbit/fake-data.service';
import { FakeDataStateService } from '@services/white-rabbit/fake-data-state.service';
import { CdmBuilderService } from '@services/cdm-builder/cdm-builder.service';
import { CdmStateService } from '@services/cdm-builder/cdm-state.service';
import { DataQualityCheckService } from '@services/data-quality-check/data-quality-check.service';
import { DataQualityCheckStateService } from '@services/data-quality-check/data-quality-check-state.service';
import { ICON_NAMES } from './icons';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MappingGuard } from '@guards/mapping/mapping.guard';
import { BreadcrumbService } from '@services/breadcrumb/breadcrumb.service';
import { CanRedirectService } from '@services/breadcrumb/can-redirect.service';
import { CanRedirectMappingCodesService } from '@services/breadcrumb/can-redirect-mapping-codes.service';
import { ImportCodesService } from '@services/usagi/import-codes.service';
import { ResetStateService } from '@services/state/reset-state.service';
import { AuthFacadeService } from '@services/state/auth-facade.service';
import { ScoredConceptsCacheService } from '@services/usagi/scored-concepts-cache.service';
import { CanRedirectMappingService } from '@services/breadcrumb/can-redirect-mapping.service';

@NgModule({
  declarations: [
    CdmComponent,
  ],
  imports: [
    SharedModule,
    ToolbarModule,
    RouterModule,
    CdmRoutingModule
  ],
  providers: [
    BridgeService,
    CommonService,
    CommonUtilsService,
    ConceptTransformationService,
    EtlConfigurationService,
    DataService,
    DrawService,
    PerseusApiService,
    PerseusLookupService,
    ReportGenerationService,
    StoreService,
    UploadService,
    VocabulariesService,
    VocabularyObserverService,
    OverlayService,
    VocabularySearchService,
    VocabularySearchStateService,
    ScanDataService,
    ScanDataStateService,
    ScanDataUploadService,
    FakeDataService,
    FakeDataStateService,
    CdmBuilderService,
    CdmStateService,
    DataQualityCheckService,
    DataQualityCheckStateService,
    MappingGuard,
    ImportCodesService,
    ScoredConceptsCacheService,
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 3000 } },
    BreadcrumbService,
    { provide: CanRedirectService, useClass: CanRedirectMappingCodesService, multi: true },
    { provide: CanRedirectService, useClass: CanRedirectMappingService, multi: true },
    ResetStateService,
    AuthFacadeService
  ],
  bootstrap: [CdmComponent],
})
export class CdmModule {

  constructor(private matIconRegistry: MatIconRegistry,
              private domSanitizer: DomSanitizer) {
    this.addIcons()
  }

  private addIcons() {
    ICON_NAMES.forEach(key => {
      this.matIconRegistry.addSvgIcon(
        key,
        this.domSanitizer.bypassSecurityTrustResourceUrl(`./assets/icons/${key}.svg`)
      );
    });
  }
}
