import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PermissionService } from '../../services/permission.service';
import { UiAnimationService } from '../../services/ui-animation.service';

declare var bootstrap: any;

export interface SystemLog {
  id: string;
  timestamp: Date;
  level: 'error' | 'warning' | 'info' | 'debug';
  module: string;
  message: string;
  details?: string;
  user?: string;
  ip?: string;
  userAgent?: string;
  stackTrace?: string;
  metadata?: any;
}

@Component({
  selector: 'app-system-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './system-logs.component.html',
  styleUrl: './system-logs.component.scss'
})
export class SystemLogsComponent implements OnInit {
  logs: SystemLog[] = [];
  filteredLogs: SystemLog[] = [];
  selectedLog: SystemLog | null = null;
  selectedLogLevel = '';
  selectedModule = '';
  currentPage = 1;
  itemsPerPage = 50;
  totalPages = 1;

  private logDetailsModal: any;

  constructor(
    private permissionService: PermissionService,
    private uiAnimationService: UiAnimationService
  ) {}

  ngOnInit() {
    this.checkPermissions();
    this.loadLogs();
    this.initializeModal();
  }

  private checkPermissions() {
    if (!this.permissionService.hasPermission('system:logs')) {
      this.uiAnimationService.showNotification('Access denied: Insufficient permissions', 'error');
      return;
    }
  }

  private initializeModal() {
    setTimeout(() => {
      const modalElement = document.getElementById('logDetailsModal');
      if (modalElement && typeof bootstrap !== 'undefined') {
        this.logDetailsModal = new bootstrap.Modal(modalElement);
      }
    }, 100);
  }

  private loadLogs() {
    // TODO: Replace with actual API call to get system logs
    // this.adminApiService.getSystemLogs().subscribe(logs => {
    //   this.logs = logs;
    //   this.filterLogs();
    // });

    // Empty logs until API is implemented
    this.logs = [];
    this.filterLogs();
  }



  filterLogs() {
    this.filteredLogs = this.logs.filter(log => {
      const levelMatch = !this.selectedLogLevel || log.level === this.selectedLogLevel;
      const moduleMatch = !this.selectedModule || log.module === this.selectedModule;
      return levelMatch && moduleMatch;
    });

    this.totalPages = Math.ceil(this.filteredLogs.length / this.itemsPerPage);
    this.currentPage = 1;
    this.updatePaginatedLogs();
  }

  private updatePaginatedLogs() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredLogs = this.filteredLogs.slice(startIndex, endIndex);
  }

  refreshLogs() {
    this.uiAnimationService.showNotification('Refreshing logs...', 'info', 1000);
    this.loadLogs();
  }

  exportLogs() {
    const csvContent = this.convertLogsToCSV(this.filteredLogs);
    this.downloadCSV(csvContent, 'system-logs.csv');
    this.uiAnimationService.showNotification('Logs exported successfully', 'success');
  }

  exportSingleLog() {
    if (this.selectedLog) {
      const csvContent = this.convertLogsToCSV([this.selectedLog]);
      this.downloadCSV(csvContent, `log-${this.selectedLog.id}.csv`);
      this.uiAnimationService.showNotification('Log exported successfully', 'success');
    }
  }

  private convertLogsToCSV(logs: SystemLog[]): string {
    const headers = ['Timestamp', 'Level', 'Module', 'User', 'Message', 'Details', 'IP', 'User Agent'];
    const csvRows = [headers.join(',')];

    logs.forEach(log => {
      const row = [
        log.timestamp.toISOString(),
        log.level,
        log.module,
        log.user || '',
        `"${log.message.replace(/"/g, '""')}"`,
        `"${(log.details || '').replace(/"/g, '""')}"`,
        log.ip || '',
        `"${(log.userAgent || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  private downloadCSV(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  viewLogDetails(log: SystemLog) {
    this.selectedLog = log;
    if (this.logDetailsModal) {
      this.logDetailsModal.show();
    }
  }

  getLogRowClass(level: string): string {
    switch (level) {
      case 'error': return 'table-danger';
      case 'warning': return 'table-warning';
      case 'info': return '';
      case 'debug': return 'table-light';
      default: return '';
    }
  }

  getLogLevelBadge(level: string): string {
    switch (level) {
      case 'error': return 'badge-danger';
      case 'warning': return 'badge-warning';
      case 'info': return 'badge-info';
      case 'debug': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  }

  getLogAlertClass(level: string): string {
    switch (level) {
      case 'error': return 'alert-danger';
      case 'warning': return 'alert-warning';
      case 'info': return 'alert-info';
      case 'debug': return 'alert-light';
      default: return 'alert-light';
    }
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedLogs();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}
