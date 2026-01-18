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
import { MatChipsModule } from '@angular/material/chips';
import { AdminApiService } from '../../services/admin-api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-inventory-alerts',
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
    MatChipsModule
  ],
  templateUrl: './inventory-alerts.component.html',
  styleUrls: ['./inventory-alerts.component.scss']
})
export class InventoryAlertsComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private destroy$ = new Subject<void>();

  displayedColumns = ['type', 'product', 'status', 'message', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  isLoading = false;
  alertSummary: any = {
    critical: 0,
    warning: 0,
    info: 0
  };

  constructor(private api: AdminApiService) {}

  ngOnInit(): void {
    this.loadAlertSummary();
    this.loadAlerts();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAlertSummary(): void {
    this.api.get('/inventory/alerts/summary')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('Alert summary loaded:', response);
          this.alertSummary = response?.data || {
            critical: 0,
            warning: 0,
            info: 0
          };
        },
        error: (err) => {
          console.error('Failed to load alert summary:', err);
        }
      });
  }

  loadAlerts(): void {
    this.isLoading = true;
    this.api.get('/inventory/alerts')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.dataSource.data = response?.data || [];
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load alerts:', err);
          this.dataSource.data = [];
          this.isLoading = false;
        }
      });
  }

  applyFilter(event: any): void {
    this.dataSource.filter = event.target.value.trim().toLowerCase();
  }

  getAlertColor(type: string): string {
    switch (type?.toLowerCase()) {
      case 'critical':
        return 'warn';
      case 'warning':
        return 'accent';
      default:
        return 'primary';
    }
  }

  acknowledgeAlert(id: string): void {
    this.api.put(`/inventory/alerts/${id}`, { acknowledged: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadAlerts();
        },
        error: (err) => {
          console.error('Failed to acknowledge alert:', err);
        }
      });
  }

  deleteAlert(id: string): void {
    if (confirm('Delete this alert?')) {
      this.api.delete(`/inventory/alerts/${id}`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadAlerts();
          },
          error: (err) => {
            console.error('Failed to delete alert:', err);
          }
        });
    }
  }

  refreshAlerts(): void {
    this.loadAlertSummary();
    this.loadAlerts();
  }
}
