import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReturnDialogComponent } from './return-dialog.component';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-returns-management',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './returns-management.component.html',
  styleUrls: ['./returns-management.component.scss']
})
export class ReturnsManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  returns: any[] = [];
  isLoading = false;
  selectedReturn: any = null;
  page = 1;
  limit = 10;
  total = 0;
  
  filterStatus = '';
  searchTerm = '';
  
  statuses = ['pending', 'approved', 'rejected', 'refunded'];
  Math = Math;

  constructor(
    private adminApi: AdminApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadReturns();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReturns(): void {
    this.isLoading = true;
    const params: any = {
      page: this.page,
      limit: this.limit
    };
    
    if (this.filterStatus) params.status = this.filterStatus;
    if (this.searchTerm) params.search = this.searchTerm;

    this.adminApi
      .get('/orders/returns', { params })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Returns loaded:', response);
          this.returns = response.data || [];
          this.total = response.pagination?.total || 0;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading returns:', err);
          this.isLoading = false;
          this.snackBar.open('Failed to load returns', 'Close', { duration: 3000 });
        }
      });
  }

  openReturnDialog(returnItem?: any): void {
    const dialogRef = this.dialog.open(ReturnDialogComponent, {
      width: '600px',
      data: returnItem || null,
      disableClose: false
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          if (returnItem) {
            this.updateReturn(returnItem._id, result);
          } else {
            this.createReturn(result);
          }
        }
      });
  }

  createReturn(formData: any): void {
    this.isLoading = true;
    this.adminApi.post('/orders/returns', formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.snackBar.open('Return request created successfully', 'Close', { duration: 3000 });
          this.loadReturns();
        },
        error: (err) => {
          console.error('Error creating return:', err);
          this.isLoading = false;
          this.snackBar.open(err.error?.message || 'Failed to create return request', 'Close', { duration: 3000 });
        }
      });
  }

  updateReturn(returnId: string, formData: any): void {
    this.isLoading = true;
    this.adminApi.put(`/orders/returns/${returnId}`, formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.snackBar.open('Return request updated successfully', 'Close', { duration: 3000 });
          this.loadReturns();
        },
        error: (err) => {
          console.error('Error updating return:', err);
          this.isLoading = false;
          this.snackBar.open(err.error?.message || 'Failed to update return request', 'Close', { duration: 3000 });
        }
      });
  }

  onStatusChange(returnId: string, newStatus: string): void {
    this.isLoading = true;
    this.adminApi
      .put(`/orders/returns/${returnId}`, { status: newStatus })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const index = this.returns.findIndex(r => r._id === returnId);
          if (index !== -1) {
            this.returns[index].status = newStatus;
          }
          this.snackBar.open('Return status updated', 'Close', { duration: 3000 });
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error updating return status:', err);
          this.isLoading = false;
          this.snackBar.open('Failed to update return status', 'Close', { duration: 3000 });
        }
      });
  }

  deleteReturn(returnId: string): void {
    if (confirm('Delete this return request? This action cannot be undone.')) {
      this.isLoading = true;
      this.adminApi.delete(`/orders/returns/${returnId}`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Return request deleted successfully', 'Close', { duration: 3000 });
            this.loadReturns();
          },
          error: (err) => {
            console.error('Error deleting return:', err);
            this.isLoading = false;
            this.snackBar.open(err.error?.message || 'Failed to delete return request', 'Close', { duration: 3000 });
          }
        });
    }
  }

  approveReturn(returnId: string): void {
    this.onStatusChange(returnId, 'approved');
  }

  rejectReturn(returnId: string): void {
    this.onStatusChange(returnId, 'rejected');
  }

  refundReturn(returnId: string): void {
    this.onStatusChange(returnId, 'refunded');
  }

  selectReturn(ret: any): void {
    this.selectedReturn = ret;
  }

  onSearch(): void {
    this.page = 1;
    this.loadReturns();
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadReturns();
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadReturns();
    }
  }

  nextPage(): void {
    if (this.page * this.limit < this.total) {
      this.page++;
      this.loadReturns();
    }
  }
}
