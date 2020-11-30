import { ArrowCache } from './arrow-cache';
import { Row } from './row';
import { IConnection } from '../services/bridge.service';
import { SqlFunction } from '../components/popups/rules-popup/transformation-input/model/sql-string-functions';
import { parse, stringify } from 'flatted';
import { Table } from './table';

export interface ConfigurationOptions {
  name?: string;
  tablesConfiguration?: any;
  mappingsConfiguration?: ArrowCache;
  source?: Table[];
  target?: Table[];
  report?: any;
  version?: any;
  filtered?: any;
  constants?: any;
}

export class Configuration {
  get arrows(): any {
    const rows = parse(this.mappingsConfiguration);
    Object.values(rows).forEach((row: IConnection) => {
      const { source, target, transforms } = row;
      row.source = Object.setPrototypeOf(source, Row.prototype);
      row.target = Object.setPrototypeOf(target, Row.prototype);
      row.transforms = transforms.map(t => new SqlFunction(t));
    });
    return rows;
  }

  get tables(): any {
    return JSON.parse(this.tablesConfiguration);
  }

  get sourceTables(): Table[] {
    const tables = [];
    parse(this.source).map(item => tables.push(new Table(item)));
    return tables;
  }

  get targetTables(): Table[] {
    const tables = [];
    parse(this.target).map(item => tables.push(new Table(item)));
    return tables;
  }

  get reportName(): any {
    return JSON.parse(this.report);
  }

  get cdmVersion(): any {
    return JSON.parse(this.version);
  }

  get isFiltered(): any {
    return JSON.parse(this.filtered);
  }

  get constantsCache(): any {
    if (this.constants) {
      return JSON.parse(this.constants);
    }
    return {};
  }

  name: string;
  mappingsConfiguration: string;
  tablesConfiguration: string;
  source: string;
  target: string;
  report: string;
  version: string;
  filtered: string;
  constants: string;

  constructor(options: ConfigurationOptions = {}) {
    this.name = options.name;
    this.mappingsConfiguration = stringify(options.mappingsConfiguration);
    this.tablesConfiguration = JSON.stringify(options.tablesConfiguration);
    this.source = stringify(options.source);
    this.target = stringify(options.target);
    this.report = JSON.stringify(options.report);
    this.version = JSON.stringify(options.version);
    this.filtered = JSON.stringify(options.filtered);
    this.constants = JSON.stringify(options.constants);
  }
}
