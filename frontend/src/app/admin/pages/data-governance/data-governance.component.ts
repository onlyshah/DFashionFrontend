import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataGovernanceService } from '../../../core/services/data-governance.service';
import { ToastrService } from 'ngx-toastr';

interface DataRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  requestType: 'export' | 'delete' | 'update_consent';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  createdAt: Date;
  completedAt?: Date;
  expiresAt: Date;
  dataPath?: string;
  downloadUrl?: string;
  reason?: string;
  resultSummary?: {
    recordsProcessed: number;
    recordsDeleted?: number;
    sizeInMB?: number;
  };
}

interface UserConsent {
  id: string;
  userId: string;
  consentType: string;
  consentVersion: string;
  given: boolean;
  givenAt?: Date;
  revokedAt?: Date;
  ipAddress?: string;
}

@Component({
  selector: 'app-data-governance',
  templateUrl: './data-governance.component.html',
  styleUrls: ['./data-governance.component.scss']
})
export class DataGovernanceComponent implements OnInit, OnDestroy {
  requests: DataRequest[] = [];
  selectedRequest: DataRequest | null = null;
  selectedUserConsents: UserConsent[] = [];
  displayedColumns: string[] = ['userName', 'requestType', 'status', 'createdAt', 'expiresAt', 'actions'];
  
  isLoading = false;
  showDetailView = false;
  showConsentManager = false;
  
  filterForm!: FormGroup;
  consentFilterForm!: FormGroup;
  
  // Pagination
  pageSize = 15;
  pageSizeOptions = [10, 15, 25];
  totalRequests = 0;
  currentPage = 1;
  
  // Filters
  selectedStatus: string = 'all';
  selectedType: string = 'all';
  searchQuery: string = '';
  
  statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' }
  ];

  typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'export', label: 'Data Export' },
    { value: 'delete', label: 'Data Deletion' },
    { value: 'update_consent', label: 'Consent Update' }
  ];

  consentTypes = [
    { id: 'marketing', label: 'Marketing Communications' },
    { id: 'analytics', label: 'Analytics & Tracking' },
    { id: 'profiling', label: 'User Profiling' },
    { id: 'third_party', label: 'Third-Party Sharing' },
    { id: 'cookies', label: 'Non-Essential Cookies' }
  ];
  
  private destroy$ = new Subject<void>();

  constructor(
    private dataGovernanceService: DataGovernanceService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initializeFilters();
    this.loadRequests();
  }

  initializeFilters(): void {
    this.filterForm = this.fb.group({
      status: ['all'],
      requestType: ['all'],
      searchQuery: ['']
    });

    this.consentFilterForm = this.fb.group({
      consentType: [''],
      given: ['all']
    });
  }

  loadRequests(): void {
    this.isLoading = true;
    const filters = {
      page: this.currentPage,
      limit: this.pageSize,
      status: this.selectedStatus !== 'all' ? this.selectedStatus : undefined,
      type: this.selectedType !== 'all' ? this.selectedType : undefined,
      search: this.searchQuery || undefined
    };

    this.dataGovernanceService.getRequests(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.requests = response.requests || [];
          this.totalRequests = response.total || 0;
          this.isLoading = false;
        },
        error: (error: any) => {
          this.toastr.error('Failed to load data requests');
          this.isLoading = false;
        }
      });
  }

  viewRequestDetails(request: DataRequest): void {
    this.selectedRequest = request;
    this.showDetailView = true;
  }

  downloadDataExport(request: DataRequest): void {
    if (!request.downloadUrl) {
      this.toastr.error('Download URL not available');
      return;
    }

    window.open(request.downloadUrl, '_blank');
  }

  approveRequest(request: DataRequest): void {
    if (!confirm(`Approve ${request.requestType} request for ${request.userName}?`)) {
      return;
    }

    this.isLoading = true;
    this.dataGovernanceService.approveRequest(request.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated: any) => {
          request.status = 'processing';
          this.toastr.success('Request approved and processing started');
          this.isLoading = false;
        },
        error: (error: any) => {
          this.toastr.error('Failed to approve request');
          this.isLoading = false;
        }
      });
  }

  rejectRequest(request: DataRequest): void {
    if (!confirm(`Reject ${request.requestType} request for ${request.userName}?`)) {
      return;
    }

    const reason = prompt('Reason for rejection:');
    if (!reason) return;

    this.isLoading = true;
    this.dataGovernanceService.rejectRequest(request.id, reason)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated: any) => {
          request.status = 'rejected';
          this.toastr.success('Request rejected');
          this.isLoading = false;
        },
        error: (error: any) => {
          this.toastr.error('Failed to reject request');
          this.isLoading = false;
        }
      });
  }

  viewUserConsents(request: DataRequest): void {
    this.isLoading = true;
    this.dataGovernanceService.getUserConsents(request.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (consents: any) => {
          this.selectedUserConsents = consents;
          this.showConsentManager = true;
          this.isLoading = false;
        },
        error: (error: any) => {
          this.toastr.error('Failed to load user consents');
          this.isLoading = false;
        }
      });
  }

  updateConsent(consent: UserConsent, given: boolean): void {
    this.isLoading = true;
    this.dataGovernanceService.updateConsents(consent.userId, [{ consentType: consent.consentType, given }])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated: any) => {
          consent.given = given;
          this.toastr.success('Consent updated successfully');
          this.isLoading = false;
        },
        error: (error: any) => {
          this.toastr.error('Failed to update consent');
          this.isLoading = false;
        }
      });
  }

  exportRequests(): void {
    const fileName = `data-governance-requests-${new Date().toISOString().split('T')[0]}.csv`;
    this.dataGovernanceService.getRequests()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.downloadFile(JSON.stringify(data.requests || [], null, 2), fileName);
          this.toastr.success('Requests exported successfully');
        },
        error: (error: any) => {
          this.toastr.error('Failed to export requests');
        }
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadRequests();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadRequests();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadRequests();
  }

  closeDetailView(): void {
    this.showDetailView = false;
    this.selectedRequest = null;
  }

  closeConsentManager(): void {
    this.showConsentManager = false;
    this.selectedUserConsents = [];
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'pending': 'status-pending',
      'processing': 'status-processing',
      'completed': 'status-completed',
      'rejected': 'status-rejected'
    };
    return classes[status] || 'status-pending';
  }

  getTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'export': 'download',
      'delete': 'delete',
      'update_consent': 'check_circle'
    };
    return icons[type] || 'info';
  }

  isRequestExpired(request: DataRequest): boolean {
    return new Date(request.expiresAt) < new Date();
  }

  getConsentLabel(consentId: string): string {
    const consent = this.consentTypes.find(c => c.id === consentId);
    return consent ? consent.label : consentId;
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
