import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReturnsService } from '../../../core/services/returns.service';
import { ToastrService } from 'ngx-toastr';

interface Return {
  id: string;
  orderId: string;
  orderNumber: string;
  productName: string;
  quantity: number;
  returnReason: string;
  status: 'pending' | 'approved' | 'rejected' | 'in-transit' | 'received' | 'refunded';
  refundAmount: number;
  createdAt: Date;
  updatedAt: Date;
  trackingNumber?: string;
  refundDate?: Date;
  notes?: string;
  images?: string[];
}

@Component({
  selector: 'app-returns',
  templateUrl: './returns.component.html',
  styleUrls: ['./returns.component.scss']
})
export class ReturnsComponent implements OnInit, OnDestroy {
  returns: Return[] = [];
  selectedReturn: Return | null = null;
  displayedColumns: string[] = ['orderNumber', 'productName', 'status', 'refundAmount', 'createdAt', 'actions'];
  
  isLoading = false;
  showInitiateForm = false;
  showDetailView = false;
  initiateReturnForm!: FormGroup;
  
  // Pagination
  pageSize = 10;
  pageSizeOptions = [5, 10, 25];
  totalReturns = 0;
  currentPage = 1;
  
  // Filters
  selectedStatus: string = 'all';
  searchQuery: string = '';
  statusFilters = [
    { value: 'all', label: 'All Returns' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'in-transit', label: 'In Transit' },
    { value: 'received', label: 'Received' },
    { value: 'refunded', label: 'Refunded' }
  ];
  
  private destroy$ = new Subject<void>();

  constructor(
    private returnsService: ReturnsService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadReturns();
  }

  initializeForm(): void {
    this.initiateReturnForm = this.fb.group({
      orderId: ['', [Validators.required]],
      reason: ['', [Validators.required, Validators.minLength(10)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      images: [[]],
      notes: ['']
    });
  }

  loadReturns(): void {
    this.isLoading = true;
    const filters = {
      page: this.currentPage,
      limit: this.pageSize,
      status: this.selectedStatus !== 'all' ? this.selectedStatus : undefined,
      search: this.searchQuery || undefined
    };

    this.returnsService.getReturns(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.returns = response.returns || [];
          this.totalReturns = response.total || 0;
          this.isLoading = false;
        },
        error: (error: any) => {
          this.toastr.error('Failed to load returns');
          console.error('Error loading returns:', error);
          this.isLoading = false;
        }
      });
  }

  openInitiateReturn(): void {
    this.showInitiateForm = true;
    this.selectedReturn = null;
    this.showDetailView = false;
  }

  submitInitiateReturn(): void {
    if (!this.initiateReturnForm.valid) {
      this.toastr.error('Please fill all required fields');
      return;
    }

    this.isLoading = true;
    const returnData = this.initiateReturnForm.value;

    this.returnsService.initiateReturn(returnData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.toastr.success('Return initiated successfully');
          this.showInitiateForm = false;
          this.initiateReturnForm.reset();
          this.loadReturns();
        },
        error: (error: any) => {
          this.toastr.error(error?.error?.message || 'Failed to initiate return');
          console.error('Error initiating return:', error);
          this.isLoading = false;
        }
      });
  }

  viewReturnDetails(returnItem: Return): void {
    this.selectedReturn = returnItem;
    this.showDetailView = true;
    this.showInitiateForm = false;
  }

  cancelReturn(returnId: string): void {
    if (!confirm('Are you sure you want to cancel this return?')) {
      return;
    }

    this.isLoading = true;
    this.returnsService.cancelReturn(returnId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.toastr.success('Return cancelled successfully');
          this.showDetailView = false;
          this.selectedReturn = null;
          this.loadReturns();
        },
        error: (error: any) => {
          this.toastr.error('Failed to cancel return');
          console.error('Error cancelling return:', error);
          this.isLoading = false;
        }
      });
  }

  trackReturn(returnId: string): void {
    this.isLoading = true;
    this.returnsService.trackReturn(returnId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tracking: any) => {
          if (this.selectedReturn) {
            this.selectedReturn.trackingNumber = tracking.trackingNumber;
            this.toastr.info(`Tracking #: ${tracking.trackingNumber}`);
          }
          this.isLoading = false;
        },
        error: (error: any) => {
          this.toastr.error('Failed to fetch tracking information');
          this.isLoading = false;
        }
      });
  }

  getRefundStatus(returnId: string): void {
    this.isLoading = true;
    this.returnsService.getRefundStatus(returnId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (status: any) => {
          if (this.selectedReturn) {
            this.selectedReturn.status = status.status;
            this.selectedReturn.refundDate = status.refundDate;
          }
          this.toastr.info(`Refund Status: ${status.status}`);
          this.isLoading = false;
        },
        error: (error: any) => {
          this.toastr.error('Failed to fetch refund status');
          this.isLoading = false;
        }
      });
  }

  exportReturns(): void {
    const fileName = `returns-${new Date().toISOString().split('T')[0]}.csv`;
    this.returnsService.getReturns()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.downloadFile(JSON.stringify(data.returns || [], null, 2), fileName);
          this.toastr.success('Returns exported successfully');
        },
        error: (error: any) => {
          this.toastr.error('Failed to export returns');
        }
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadReturns();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadReturns();
  }

  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.loadReturns();
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.loadReturns();
  }

  closeDetailView(): void {
    this.showDetailView = false;
    this.selectedReturn = null;
  }

  closeInitiateForm(): void {
    this.showInitiateForm = false;
    this.initiateReturnForm.reset();
  }

  getStatusClass(status: string): string {
    const statusClasses = {
      'pending': 'status-pending',
      'approved': 'status-approved',
      'rejected': 'status-rejected',
      'in-transit': 'status-in-transit',
      'received': 'status-received',
      'refunded': 'status-refunded'
    };
    return statusClasses[status as keyof typeof statusClasses] || 'status-pending';
  }

  private downloadFile(data: BlobPart, filename: string): void {
    const blob = new Blob([data], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(link.href);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
