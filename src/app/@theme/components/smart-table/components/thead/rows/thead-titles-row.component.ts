import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';

import { Column } from '../../../lib/data-set/column';
import { DataSource } from '../../../lib/data-source/data-source';
import { Grid } from '../../../lib/grid';

@Component({
  selector: '[ng2-st-thead-titles-row]',
  template: `
    <th
      ng2-st-checkbox-select-all
      *ngIf="isMultiSelectVisible"
      [grid]="grid"
      [source]="source"
      [isAllSelected]="isAllSelected"
      (click)="selectAllRows.emit($event)"
    ></th>
    <th ng2-st-actions-title *ngIf="showActionColumnLeft" [grid]="grid"></th>
    <th
      *ngFor="let column of getVisibleColumns(grid.getColumns())"
      class="ng2-smart-th {{ column.id }}"
      [ngClass]="column.class"
      [style.width]="column.width"
      [ngStyle]="{ display: column.show ? '' : 'none' }"
    >
      <ng2-st-column-title [source]="source" [column]="column" (sort)="sort.emit($event)"></ng2-st-column-title>
    </th>
    <th ng2-st-actions-title *ngIf="showActionColumnRight" [grid]="grid"></th>
  `,
})
export class TheadTitlesRowComponent implements OnChanges {
  @Input() grid!: Grid;
  @Input() isAllSelected: boolean = false;
  @Input() source!: DataSource;

  @Output() sort = new EventEmitter<any>();
  @Output() selectAllRows = new EventEmitter<any>();

  isMultiSelectVisible?: boolean;
  showActionColumnLeft?: boolean;
  showActionColumnRight?: boolean;

  ngOnChanges() {
    this.isMultiSelectVisible = this.grid.isMultiSelectVisible();
    this.showActionColumnLeft = this.grid.showActionColumn('left');
    this.showActionColumnRight = this.grid.showActionColumn('right');
  }

  getVisibleColumns(columns: Array<Column>): Array<Column> {
    return (columns || []).filter((column: Column) => !column.hide);
  }
}
