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
  selector: 'app-admin-product-reviews',
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
        <h1>Product Reviews</h1>
        <p>Manage product reviews and ratings</p>
      </div>
      
      <mat-card class="filters-card">
        <mat-card-content>
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Search</mat-label>
            <input matInput (keyup)="applyFilter($event)" placeholder="Search by product or user">
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
            <mat-icon>rate_review</mat-icon>
            <p>No reviews found</p>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="!isLoading && dataSource.data.length > 0">
        <mat-card-content>
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort class="reviews-table">
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

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                <td mat-cell *matCellDef="let element">
                  <span [ngClass]="'status-badge status-' + element.status">{{ element.status }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
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
    .reviews-table { width: 100%; }
    .rating-badge { background: #e8f5e9; color: #2e7d32; padding: 4px 8px; border-radius: 4px; font-weight: 500; }
    .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
    .status-badge.status-pending { background: #fff3e0; color: #e65100; }
    .status-badge.status-approved { background: #e8f5e9; color: #2e7d32; }
    .status-badge.status-rejected { background: #ffebee; color: #c62828; }
  `]
})
export class ProductReviewsComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private destroy$ = new Subject<void>();
  
  displayedColumns = ['productTitle', 'username', 'rating', 'status', 'createdAt'];
  dataSource = new MatTableDataSource<any>([]);
  isLoading = false;

  constructor(
    private api: AdminApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReviews(): void {
    console.log('🔄 [Product Reviews] Fetching from /api/admin/reviews');
    this.isLoading = true;
    this.api.get('/reviews')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('✅ [Product Reviews] Full API Response:', response);
          console.log('✅ [Product Reviews] Response.success:', response?.success);
          console.log('✅ [Product Reviews] Response.data:', response?.data);
          console.log('✅ [Product Reviews] Reviews array:', response?.data?.reviews);
          console.log('✅ [Product Reviews] Data array length:', response?.data?.reviews?.length);
          console.log('✅ [Product Reviews] Pagination:', response?.data?.total, 'total', 'page', response?.data?.page);
          console.log('✅ [Product Reviews] Sample review:', response?.data?.reviews?.[0]);
          this.dataSource.data = response?.data?.reviews || [];
          console.log('✅ [Product Reviews] DataSource updated with', this.dataSource.data.length, 'rows');
          this.isLoading = false;
        },
        error: (err) => {
          console.error('❌ [Product Reviews] API Error:', err);
          console.error('❌ [Product Reviews] Error message:', err?.message);
          console.error('❌ [Product Reviews] Error status:', err?.status);
          this.dataSource.data = [];
          this.isLoading = false;
          this.snackBar.open('Failed to load reviews', 'Close', { duration: 3000 });
        }
      });
  }

  applyFilter(event: any): void {
    this.dataSource.filter = event.target.value.trim().toLowerCase();
  }
}
