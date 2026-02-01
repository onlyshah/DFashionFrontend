import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuditLogService } from '../../../core/services/audit-log.service';
import { ToastrService } from 'ngx-toastr';

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  actionType: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'IMPORT';
  module: string;
  resourceType: string;
  resourceId: string;
  resourceName: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  status: 'success' | 'failure';
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  details?: string;
}

interface AuditTimeline {
  date: Date;
  logs: AuditLog[];
}

@Component({
  selector: 'app-audit-logs',
  templateUrl: './audit-logs.component.html',
  styleUrls: ['./audit-logs.component.scss']
})
export class AuditLogsComponent implements OnInit, OnDestroy {
  logs: AuditLog[] = [];
  timeline: AuditTimeline[] = [];
  selectedLog: AuditLog | null = null;
  displayedColumns: string[] = ['timestamp', 'userName', 'action', 'module', 'resourceName', 'status', 'actions'];
  
  isLoading = false;
  showDetailView = false;
  showTimelineView = false;
  showStatistics = false;
  
  filterForm!: FormGroup;
  
  // Pagination
  pageSize = 20;
  pageSizeOptions = [10, 20, 50];
  totalLogs = 0;
  currentPage = 1;
  
  // Filters
  selectedActionType: string = 'all';
  selectedModule: string = 'all';
  selectedStatus: string = 'all';
  dateRange: { start: Date; end: Date } | null = null;
  
  actionTypeOptions = [
    { value: 'all', label: 'All Actions' },
    { value: 'CREATE', label: 'Create' },
    { value: 'READ', label: 'Read' },
    { value: 'UPDATE', label: 'Update' },
    { value: 'DELETE', label: 'Delete' },
    { value: 'LOGIN', label: 'Login' },
    { value: 'LOGOUT', label: 'Logout' },
    { value: 'EXPORT', label: 'Export' },
    { value: 'IMPORT', label: 'Import' }
  ];

  moduleOptions = [
    { value: 'all', label: 'All Modules' },
    { value: 'products', label: 'Products' },
    { value: 'users', label: 'Users' },
    { value: 'orders', label: 'Orders' },
    { value: 'payments', label: 'Payments' },
    { value: 'admins', label: 'Admin Users' },
    { value: 'roles', label: 'Roles & Permissions' },
    { value: 'promotions', label: 'Promotions' },
    { value: 'content', label: 'Content & CMS' },
    { value: 'system', label: 'System' }
  ];

  statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'success', label: 'Success' },
    { value: 'failure', label: 'Failure' }
  ];

  statistics: any = {
    totalActions: 0,
    successfulActions: 0,
    failedActions: 0,
    topUsers: [],
    topModules: [],
    actionBreakdown: []
  };
  
  private destroy$ = new Subject<void>();

  constructor(
    private auditLogService: AuditLogService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initializeFilters();
    this.loadLogs();
    this.loadStatistics();
  }

  initializeFilters(): void {
    this.filterForm = this.fb.group({
      userId: [''],
      actionType: ['all'],
      module: ['all'],
      status: ['all'],
      startDate: [''],
      endDate: [''],
      searchQuery: ['']
    });
  }

  loadLogs(): void {
    this.isLoading = true;
    const filters = {
      page: this.currentPage,
      limit: this.pageSize,
      actionType: this.selectedActionType !== 'all' ? this.selectedActionType : undefined,
      module: this.selectedModule !== 'all' ? this.selectedModule : undefined,
      status: this.selectedStatus !== 'all' ? this.selectedStatus : undefined,
      startDate: this.dateRange?.start,
      endDate: this.dateRange?.end,
      search: this.filterForm.get('searchQuery')?.value || undefined
    };

    this.auditLogService.getAuditLogs(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.logs = response.logs || [];
          this.totalLogs = response.total || 0;
          this.isLoading = false;
        },
        error: (error: any) => {
          this.toastr.error('Failed to load audit logs');
          this.isLoading = false;
        }
      });
  }

  loadTimeline(): void {
    this.isLoading = true;
    this.auditLogService.getActivityTimeline()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.timeline = response.timeline || [];
          this.showTimelineView = true;
          this.isLoading = false;
        },
        error: (error: any) => {
          this.toastr.error('Failed to load timeline');
          this.isLoading = false;
        }
      });
  }

  loadStatistics(): void {
    this.auditLogService.getStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats: any) => {
          this.statistics = stats;
        },
        error: (error: any) => {
          console.error('Failed to load statistics:', error);
        }
      });
  }

  viewLogDetails(log: AuditLog): void {
    this.selectedLog = log;
    this.showDetailView = true;
  }

  searchLogs(): void {
    this.currentPage = 1;
    this.loadLogs();
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadLogs();
  }

  clearFilters(): void {
    this.filterForm.reset({
      actionType: 'all',
      module: 'all',
      status: 'all'
    });
    this.selectedActionType = 'all';
    this.selectedModule = 'all';
    this.selectedStatus = 'all';
    this.dateRange = null;
    this.currentPage = 1;
    this.loadLogs();
  }

  exportLogs(): void {
    const fileName = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    const filters = {
      actionType: this.selectedActionType !== 'all' ? this.selectedActionType : undefined,
      module: this.selectedModule !== 'all' ? this.selectedModule : undefined,
      status: this.selectedStatus !== 'all' ? this.selectedStatus : undefined,
      startDate: this.dateRange?.start,
      endDate: this.dateRange?.end
    };

    this.auditLogService.exportAuditLogs(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.downloadFile(data, fileName);
          this.toastr.success('Audit logs exported successfully');
        },
        error: (error: any) => {
          this.toastr.error('Failed to export logs');
        }
      });
  }

  searchAuditLogs(query: string): void {
    if (!query.trim()) {
      this.loadLogs();
      return;
    }

    this.isLoading = true;
    this.auditLogService.searchAuditLogs(query)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.logs = response.logs || [];
          this.totalLogs = response.total || 0;
          this.isLoading = false;
        },
        error: (error: any) => {
          this.toastr.error('Search failed');
          this.isLoading = false;
        }
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadLogs();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadLogs();
  }

  closeDetailView(): void {
    this.showDetailView = false;
    this.selectedLog = null;
  }

  toggleStatistics(): void {
    this.showStatistics = !this.showStatistics;
  }

  toggleTimelineView(): void {
    if (!this.showTimelineView) {
      this.loadTimeline();
    } else {
      this.showTimelineView = false;
    }
  }

  getActionTypeIcon(actionType: string): string {
    const icons: { [key: string]: string } = {
      'CREATE': 'add_circle',
      'READ': 'visibility',
      'UPDATE': 'edit',
      'DELETE': 'delete',
      'LOGIN': 'login',
      'LOGOUT': 'logout',
      'EXPORT': 'download',
      'IMPORT': 'upload'
    };
    return icons[actionType] || 'info';
  }

  getStatusClass(status: string): string {
    return status === 'success' ? 'status-success' : 'status-failure';
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
