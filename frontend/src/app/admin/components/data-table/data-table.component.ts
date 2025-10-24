import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  template?: any;
}

export interface TableAction {
  label: string;
  icon: string;
  action: (item: any) => void;
}

export interface TablePagination {
  pageSize: number;
  currentPage: number;
  totalItems: number;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="data-table-wrapper">
      <!-- Search and Filter Section -->
      <div class="table-header">
        <div class="search-box">
          <i class="typcn typcn-zoom"></i>
          <input 
            type="text" 
            [placeholder]="searchPlaceholder"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearch($event)">
        </div>
        
        <div class="actions">
          <button class="btn-filter" (click)="isFilterOpen = !isFilterOpen">
            <i class="typcn typcn-filter"></i>
            Filter
          </button>
          <button class="btn-export" (click)="exportData.emit()">
            <i class="typcn typcn-download"></i>
            Export
          </button>
        </div>
      </div>

      <!-- Table Section -->
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th *ngFor="let col of columns" 
                  [class.sortable]="col.sortable"
                  (click)="col.sortable && onSort(col.key)">
                {{ col.label }}
                <i *ngIf="col.sortable" class="typcn" 
                   [class.typcn-arrow-sorted-down]="sortColumn === col.key && sortDirection === 'desc'"
                   [class.typcn-arrow-sorted-up]="sortColumn === col.key && sortDirection === 'asc'">
                </i>
              </th>
              <th *ngIf="actions.length">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of displayData">
              <td *ngFor="let col of columns">
                <ng-container *ngIf="!col.template">
                  {{ item[col.key] }}
                </ng-container>
                <ng-container *ngIf="col.template">
                  <ng-container 
                    [ngTemplateOutlet]="col.template"
                    [ngTemplateOutletContext]="{ $implicit: item }">
                  </ng-container>
                </ng-container>
              </td>
              <td *ngIf="actions.length" class="actions-cell">
                <button *ngFor="let action of actions"
                        class="btn-action"
                        (click)="action.action(item)">
                  <i class="typcn" [class]="action.icon"></i>
                  {{ action.label }}
                </button>
              </td>
            </tr>
            <tr *ngIf="!displayData.length" class="empty-row">
              <td [attr.colspan]="columns.length + (actions.length ? 1 : 0)">
                {{ emptyMessage }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Section -->
      <div class="table-footer" *ngIf="pagination">
        <div class="page-info">
          Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ pagination.totalItems }} entries
        </div>
        <div class="pagination">
          <button 
            class="btn-page" 
            [disabled]="pagination.currentPage === 1"
            (click)="onPageChange(pagination.currentPage - 1)">
            <i class="typcn typcn-chevron-left"></i>
          </button>
          
          <button 
            *ngFor="let page of pageNumbers"
            class="btn-page"
            [class.active]="page === pagination.currentPage"
            (click)="onPageChange(page)">
            {{ page }}
          </button>
          
          <button 
            class="btn-page"
            [disabled]="pagination.currentPage === totalPages"
            (click)="onPageChange(pagination.currentPage + 1)">
            <i class="typcn typcn-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .data-table-wrapper {
      background: white;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-sm);
    }

    .table-header {
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-color);
    }

    .search-box {
      position: relative;
      width: 300px;
    }

    .search-box input {
      width: 100%;
      padding: 0.5rem 1rem 0.5rem 2.5rem;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      font-size: 0.875rem;
    }

    .search-box i {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
    }

    .actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-filter, .btn-export {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      background: white;
      color: var(--text-color);
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-filter:hover, .btn-export:hover {
      background: var(--content-bg);
    }

    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      background: var(--content-bg);
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: var(--text-color);
      border-bottom: 1px solid var(--border-color);
    }

    th.sortable {
      cursor: pointer;
      user-select: none;
    }

    th.sortable:hover {
      background: var(--light-bg);
    }

    td {
      padding: 1rem;
      border-bottom: 1px solid var(--border-color);
      color: var(--text-color);
    }

    .empty-row td {
      text-align: center;
      color: var(--text-muted);
      padding: 2rem;
    }

    .actions-cell {
      white-space: nowrap;
    }

    .btn-action {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      border: none;
      background: none;
      color: var(--primary-color);
      cursor: pointer;
      font-size: 0.875rem;
    }

    .btn-action:hover {
      color: var(--primary-dark);
    }

    .table-footer {
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--border-color);
    }

    .page-info {
      color: var(--text-muted);
      font-size: 0.875rem;
    }

    .pagination {
      display: flex;
      gap: 0.25rem;
    }

    .btn-page {
      min-width: 32px;
      height: 32px;
      padding: 0 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      background: white;
      color: var(--text-color);
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-page:hover:not(:disabled) {
      background: var(--content-bg);
    }

    .btn-page.active {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: white;
    }

    .btn-page:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class DataTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() actions: TableAction[] = [];
  @Input() pagination?: TablePagination;
  @Input() searchPlaceholder = 'Search...';
  @Input() emptyMessage = 'No data available';

  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<{column: string, direction: 'asc' | 'desc'}>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() exportData = new EventEmitter<void>();

  searchQuery = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  isFilterOpen = false;

  get displayData(): any[] {
    return this.pagination ? 
      this.data.slice(this.startIndex, this.endIndex) : 
      this.data;
  }

  get startIndex(): number {
    return this.pagination ? 
      (this.pagination.currentPage - 1) * this.pagination.pageSize : 
      0;
  }

  get endIndex(): number {
    return this.pagination ? 
      Math.min(this.startIndex + this.pagination.pageSize, this.pagination.totalItems) :
      this.data.length;
  }

  get totalPages(): number {
    return this.pagination ? 
      Math.ceil(this.pagination.totalItems / this.pagination.pageSize) : 
      1;
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.pagination?.currentPage || 1;
    const range = [];
    
    for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
      range.push(i);
    }
    
    return range;
  }

  onPageChange(page: number): void {
    if (this.pagination && page !== this.pagination.currentPage) {
      this.pageChange.emit(page);
    }
  }

  onSort(column: string): void {
    if (column === this.sortColumn) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    
    this.sortChange.emit({
      column: this.sortColumn,
      direction: this.sortDirection
    });
  }

  onSearch(query: string): void {
    this.searchChange.emit(query);
  }
}