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
  selector: 'app-creator-ratings',
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
        <h1>Creator Ratings</h1>
        <p>View creator performance ratings</p>
      </div>
      
      <mat-card class="filters-card">
        <mat-card-content>
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Search</mat-label>
            <input matInput (keyup)="applyFilter($event)" placeholder="Search by creator name">
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
            <mat-icon>star_rate</mat-icon>
            <p>No creator ratings found</p>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="!isLoading && dataSource.data.length > 0">
        <mat-card-content>
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort class="ratings-table">
              <ng-container matColumnDef="displayName">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Creator</th>
                <td mat-cell *matCellDef="let element">{{ element.display_name }}</td>
              </ng-container>

              <ng-container matColumnDef="qualityScore">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Quality</th>
                <td mat-cell *matCellDef="let element">
                  <span class="score-badge">{{ element.content_quality | number: '1.1-1' }}/5</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="engagementScore">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Engagement</th>
                <td mat-cell *matCellDef="let element">
                  <span class="score-badge">{{ element.engagement | number: '1.1-1' }}/5</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="professionalismScore">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Professionalism</th>
                <td mat-cell *matCellDef="let element">
                  <span class="score-badge">{{ element.professionalism | number: '1.1-1' }}/5</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="verified">
                <th mat-header-cell *matHeaderCellDef>Verified</th>
                <td mat-cell *matCellDef="let element">
                  <mat-icon [ngClass]="element.verified ? 'verified' : 'not-verified'">
                    {{ element.verified ? 'verified_user' : 'person' }}
                  </mat-icon>
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
    .ratings-table { width: 100%; }
    .score-badge { background: #e3f2fd; color: #1565c0; padding: 4px 8px; border-radius: 4px; font-weight: 500; }
    .verified { color: #4caf50; }
    .not-verified { color: #999; }
  `]
})
export class CreatorRatingsComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private destroy$ = new Subject<void>();
  
  displayedColumns = ['displayName', 'qualityScore', 'engagementScore', 'professionalismScore', 'verified', 'createdAt'];
  dataSource = new MatTableDataSource<any>([]);
  isLoading = false;

  constructor(
    private api: AdminApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadRatings();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRatings(): void {
    console.log('🔄 [Creator Ratings] Fetching from /api/admin/creator-ratings');
    this.isLoading = true;
    this.api.get('/creator-ratings')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('✅ [Creator Ratings] Full API Response:', response);
          console.log('✅ [Creator Ratings] Response.success:', response?.success);
          console.log('✅ [Creator Ratings] Response.data:', response?.data);
          console.log('✅ [Creator Ratings] Ratings array:', response?.data?.ratings);
          console.log('✅ [Creator Ratings] Data array length:', response?.data?.ratings?.length);
          console.log('✅ [Creator Ratings] Pagination:', response?.data?.total, 'total');
          console.log('✅ [Creator Ratings] Sample rating:', response?.data?.ratings?.[0]);
          this.dataSource.data = response?.data?.ratings || [];
          console.log('✅ [Creator Ratings] DataSource updated with', this.dataSource.data.length, 'rows');
          this.isLoading = false;
        },
        error: (err) => {
          console.error('❌ [Creator Ratings] API Error:', err);
          console.error('❌ [Creator Ratings] Error message:', err?.message);
          console.error('❌ [Creator Ratings] Error status:', err?.status);
          this.dataSource.data = [];
          this.isLoading = false;
          this.snackBar.open('Failed to load creator ratings', 'Close', { duration: 3000 });
        }
      });
  }

  applyFilter(event: any): void {
    this.dataSource.filter = event.target.value.trim().toLowerCase();
  }
}
