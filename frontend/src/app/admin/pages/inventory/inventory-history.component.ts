import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AdminApiService } from '../../services/admin-api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-inventory-history',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './inventory-history.component.html',
  styleUrls: ['./inventory-history.component.scss']
})
export class InventoryHistoryComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private destroy$ = new Subject<void>();

  displayedColumns = ['transactionId', 'product', 'type', 'quantity', 'warehouse', 'user', 'timestamp'];
  dataSource = new MatTableDataSource<any>([]);
  isLoading = false;

  constructor(private api: AdminApiService) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadHistory(): void {
    this.isLoading = true;
    this.api.get('/admin/inventory/history')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.dataSource.data = response?.data || [];
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load inventory history:', err);
          this.dataSource.data = [];
          this.isLoading = false;
        }
      });
  }

  applyFilter(event: any): void {
    this.dataSource.filter = event.target.value.trim().toLowerCase();
  }

  getTransactionTypeIcon(type: string): string {
    switch (type?.toLowerCase()) {
      case 'in':
      case 'receipt':
        return 'arrow_downward';
      case 'out':
      case 'sale':
        return 'arrow_upward';
      case 'adjustment':
        return 'edit';
      case 'return':
        return 'undo';
      default:
        return 'info';
    }
  }

  getTransactionTypeColor(type: string): string {
    switch (type?.toLowerCase()) {
      case 'in':
      case 'receipt':
        return 'accent';
      case 'out':
      case 'sale':
        return 'warn';
      case 'adjustment':
        return 'primary';
      case 'return':
        return 'info';
      default:
        return 'primary';
    }
  }

  viewDetails(transaction: any): void {
    console.log('View transaction details:', transaction);
    // TODO: Implement detail view modal
  }

  refreshHistory(): void {
    this.loadHistory();
  }
}
