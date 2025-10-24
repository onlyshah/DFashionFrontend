import { Component, Input, Output, EventEmitter, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface DataTableColumn<T = any> {
  name: string;
  header: string;
  cell: (element: T) => string | number | null;
  sortable?: boolean;
  width?: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="table-container">
      <table mat-table [dataSource]="dataSource" matSort class="mat-elevation-z1">
        <ng-container *ngFor="let column of columns" [matColumnDef]="column.name">
          <th mat-header-cell *matHeaderCellDef mat-sort-header="{{column.sortable ? column.name : ''}}">{{ column.header }}</th>
          <td mat-cell *matCellDef="let element">{{ column.cell(element) }}</td>
        </ng-container>

        <ng-container matColumnDef="actions" *ngIf="showActions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let element">
            <button mat-icon-button color="primary" (click)="onEdit.emit(element)" *ngIf="allowEdit"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button color="warn" (click)="onDelete.emit(element)" *ngIf="allowDelete"><mat-icon>delete</mat-icon></button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;" (click)="onRowClick.emit(row)"></tr>
      </table>

      <mat-paginator [pageSize]="10" [pageSizeOptions]="[5,10,25,100]" showFirstLastButtons></mat-paginator>
    </div>
  `,
  styles: [
    `
    .table-container { width: 100%; overflow-x: auto; }
    table { width: 100%; }
    `
  ]
})
export class DataTableComponent implements OnChanges {
  @Input() columns: DataTableColumn[] = [];
  @Input() data: any[] = [];
  @Input() showActions = true;
  @Input() allowEdit = true;
  @Input() allowDelete = true;

  @Output() onEdit = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
  @Output() onRowClick = new EventEmitter<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    this.dataSource = new MatTableDataSource(this.data || []);
    // paginator and sort are set in ngAfterViewInit usually; keep simple here
    this.displayedColumns = this.columns.map(c => c.name);
    if (this.showActions) this.displayedColumns.push('actions');
  }
}