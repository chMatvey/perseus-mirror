import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Column, Sort } from '@models/grid/grid';

@Component({
  template: ''
})
export abstract class GridComponent<T> implements OnInit {

  @Input()
  abstract data: T[]

  @Input()
  columns: Column[]

  @Input()
  height = '100%'

  @Input()
  width = '100%'

  @Input()
  loading = false

  sortParams: Sort

  displayedColumns: string[] // For CDK table

  @Output()
  sort = new EventEmitter<Sort>()

  ngOnInit(): void {
    this.displayedColumns = this.columns.map(col => col.field)
  }

  onSort(field: string) {
    if (!this.sortParams || this.sortParams.field !== field || this.sortParams.order === 'desc') {
      this.sortParams = {
        field,
        order: 'asc'
      };
    } else {
      this.sortParams = {
        field,
        order: 'desc'
      };
    }

    this.sort.emit(this.sortParams)
  }
}
