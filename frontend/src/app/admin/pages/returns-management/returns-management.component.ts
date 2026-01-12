import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-returns-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
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

  constructor(private http: HttpClient) {}

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

    this.http
      .get<any>(`${environment.apiUrl}/returns`, { params })
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
        }
      });
  }

  onStatusChange(returnId: string, newStatus: string): void {
    this.http
      .put<any>(`${environment.apiUrl}/returns/${returnId}`, { status: newStatus })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const index = this.returns.findIndex(r => r._id === returnId);
          if (index !== -1) {
            this.returns[index].status = newStatus;
          }
        },
        error: (err) => console.error('Error updating return status:', err)
      });
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
