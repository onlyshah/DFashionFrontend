import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminApiService } from '../../services/admin-api.service';
import { AdminAuthService } from '../../services/admin-auth.service';

export interface Coupon {
  _id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses: number;
  usedCount: number;
  minOrderValue: number;
  applicableCategories: string[];
  applicableProducts: string[];
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-coupon-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatTooltipModule
  ],
  templateUrl: './coupon-management.component.html',
  styleUrls: ['./coupon-management.component.scss']
})
export class CouponManagementComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private destroy$ = new Subject<void>();
  
  displayedColumns: string[] = ['code', 'description', 'discount', 'usage', 'validUntil', 'status', 'actions'];
  dataSource = new MatTableDataSource<Coupon>([]);
  isLoading = false;
  totalCoupons = 0;
  pageSize = 10;
  currentPage = 0;
  canCreate = false;
  canEdit = false;
  canDelete = false;
  
  // Filters
  searchControl = new FormControl('');
  statusFilter = new FormControl('');
  typeFilter = new FormControl('');

  constructor(
    private apiService: AdminApiService,
    private authService: AdminAuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.checkPermissions();
    this.setupFilters();
    this.loadCoupons();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupFilters(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.loadCoupons());

    [this.statusFilter, this.typeFilter].forEach(control => {
      control.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.loadCoupons());
    });
  }

  checkPermissions(): void {
    this.canCreate = this.authService.hasPermission('marketing', 'create');
    this.canEdit = this.authService.hasPermission('marketing', 'edit');
    this.canDelete = this.authService.hasPermission('marketing', 'delete');
  }

  loadCoupons(): void {
    this.isLoading = true;
    const params = {
      page: this.currentPage + 1,
      limit: this.pageSize,
      search: this.searchControl.value || '',
      isActive: this.statusFilter.value !== '' ? this.statusFilter.value : '',
      discountType: this.typeFilter.value || ''
    };

    this.apiService.get('/marketing/coupons', { params }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: any) => {
        this.dataSource.data = response.data?.coupons || response.data || [];
        this.totalCoupons = response.data?.pagination?.totalCoupons || response.count || 0;
        this.isLoading = false;
      },
        error: (error: HttpErrorResponse) => {
        console.error('Failed to load coupons:', error);
        this.snackBar.open('Failed to load coupons', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  openCouponDialog(): void {
    // TODO: Implement coupon dialog
    this.snackBar.open('Coming soon', 'Close', { duration: 3000 });
  }

  editCoupon(coupon: Coupon): void {
    // TODO: Implement edit dialog
    this.snackBar.open('Edit coming soon', 'Close', { duration: 3000 });
  }

  toggleCouponStatus(couponId: string, isActive: boolean): void {
    this.isLoading = true;
    this.apiService.patch(`/marketing/coupons/${couponId}`, { isActive }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.snackBar.open('Coupon status updated', 'Close', { duration: 3000 });
        this.loadCoupons();
      },
        error: (error: HttpErrorResponse) => {
        console.error('Failed to update coupon:', error);
        this.snackBar.open('Failed to update coupon', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  deleteCoupon(couponId: string): void {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    
    this.isLoading = true;
    this.apiService.delete(`/marketing/coupons/${couponId}`).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.snackBar.open('Coupon deleted successfully', 'Close', { duration: 3000 });
        this.loadCoupons();
      },
        error: (error: HttpErrorResponse) => {
        console.error('Failed to delete coupon:', error);
        this.snackBar.open('Failed to delete coupon', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  onPaginationChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadCoupons();
  }
}
