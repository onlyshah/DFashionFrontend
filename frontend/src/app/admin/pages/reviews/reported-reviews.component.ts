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
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminApiService } from '../../services/admin-api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-reported-reviews',
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
    MatCardModule,
    MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Reported Reviews</h1>
        <p>Review flagged and reported content</p>
      </div>
      
      <mat-card class="filters-card">
        <mat-card-content>
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Moderation Status</mat-label>
            <select matNativeControl (change)="loadReports()">
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="isLoading" class="loading-card">
        <mat-card-content>
          <mat-progress-spinner mode="indeterminate" diameter="40"></mat-progress-spinner>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="!isLoading && dataSource.data.length === 0" class="empty-card">
        <mat-card-content>
          <div class="empty-state">
            <mat-icon>flag</mat-icon>
            <p>No reported reviews found</p>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="!isLoading && dataSource.data.length > 0">
        <mat-card-content>
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort class="reports-table">
              <ng-container matColumnDef="productTitle">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Product</th>
                <td mat-cell *matCellDef="let element">{{ element.product_title }}</td>
              </ng-container>

              <ng-container matColumnDef="username">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Reviewer</th>
                <td mat-cell *matCellDef="let element">{{ element.username }}</td>
              </ng-container>

              <ng-container matColumnDef="rating">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Rating</th>
                <td mat-cell *matCellDef="let element">
                  <span class="rating-badge">{{ element.rating }}/5</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="reportReason">
                <th mat-header-cell *matHeaderCellDef>Report Reason</th>
                <td mat-cell *matCellDef="let element">{{ element.report_reason }}</td>
              </ng-container>

              <ng-container matColumnDef="moderationStatus">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                <td mat-cell *matCellDef="let element">
                  <span [ngClass]="'status-badge status-' + element.status">{{ element.status }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Reported</th>
                <td mat-cell *matCellDef="let element">{{ element.created_at | date: 'short' }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
            <mat-paginator [pageSizeOptions]="[10, 20, 50]" showFirstLastButtons></mat-paginator>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { margin: 0 0 8px 0; font-size: 28px; font-weight: 500; }
    .filters-card { margin-bottom: 20px; }
    .filter-field { width: 300px; }
    .loading-card { display: flex; justify-content: center; padding: 40px; }
    .empty-card { display: flex; justify-content: center; padding: 60px 20px; }
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; color: #ccc; margin-bottom: 16px; }
    .table-container { overflow-x: auto; }
    .reports-table { width: 100%; }
    .rating-badge { background: #e8f5e9; color: #2e7d32; padding: 4px 8px; border-radius: 4px; font-weight: 500; }
    .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
    .status-badge.status-pending { background: #fff3e0; color: #e65100; }
    .status-badge.status-approved { background: #e8f5e9; color: #2e7d32; }
    .status-badge.status-rejected { background: #ffebee; color: #c62828; }
  `]
})
export class ReportedReviewsComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private destroy$ = new Subject<void>();
  
  displayedColumns = ['productTitle', 'username', 'rating', 'reportReason', 'moderationStatus', 'createdAt'];
  dataSource = new MatTableDataSource<any>([]);
  isLoading = false;

  constructor(
    private api: AdminApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReports(): void {
    console.log('🔄 [Reported Reviews] Fetching from /api/admin/reported-reviews');
    this.isLoading = true;
    this.api.get('/reported-reviews')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('✅ [Reported Reviews] Full API Response:', response);
          console.log('✅ [Reported Reviews] Response.success:', response?.success);
          console.log('✅ [Reported Reviews] Response.data:', response?.data);
          console.log('✅ [Reported Reviews] Reports array:', response?.data?.reports);
          console.log('✅ [Reported Reviews] Data array length:', response?.data?.reports?.length);
          console.log('✅ [Reported Reviews] Pagination:', response?.data?.total, 'total');
          console.log('✅ [Reported Reviews] Sample report:', response?.data?.reports?.[0]);
          this.dataSource.data = response?.data?.reports || [];
          console.log('✅ [Reported Reviews] DataSource updated with', this.dataSource.data.length, 'rows');
          this.isLoading = false;
        },
        error: (err) => {
          console.error('❌ [Reported Reviews] API Error:', err);
          console.error('❌ [Reported Reviews] Error message:', err?.message);
          console.error('❌ [Reported Reviews] Error status:', err?.status);
          this.dataSource.data = [];
          this.isLoading = false;
          this.snackBar.open('Failed to load reported reviews', 'Close', { duration: 3000 });
        }
      });
  }
}
