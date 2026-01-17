import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-activity-logs',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatProgressSpinnerModule,
    MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatTooltipModule, FormsModule
  ],
  templateUrl: './activity-logs.component.html',
  styleUrls: ['./activity-logs.component.scss']
})
export class ActivityLogsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['user', 'action', 'resource', 'status', 'ipAddress', 'timestamp'];
  dataSource = new MatTableDataSource<any>([]);
  isLoading = false;
  searchFilter = '';
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  totalLogs = 0;
  currentPage = 1;

  constructor(private api: AdminApiService) {}

  ngOnInit(): void {
    this.load(1);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  load(page: number = 1): void {
    this.isLoading = true;
    this.currentPage = page;
    
    this.api.getActivityLogs(page, this.pageSize).subscribe({
      next: (res: any) => {
        console.log('✅ Activity Logs Response:', res);
        
        // Extract logs from response
        const logs = res?.data?.logs || res?.data || [];
        console.log('📋 Logs to display:', logs);
        
        this.dataSource.data = logs;
        this.totalLogs = res?.data?.pagination?.total || logs?.length || 0;
        
        // Update paginator if available
        if (this.paginator) {
          this.paginator.length = this.totalLogs;
        }
        
        console.log('✅ Total logs:', this.totalLogs, 'Data source length:', this.dataSource.data.length);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error loading activity logs:', err);
        this.dataSource.data = [];
        this.totalLogs = 0;
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    console.log('📄 Page event:', event);
    this.pageSize = event.pageSize;
    this.load(event.pageIndex + 1);
  }

  applyFilter(e: any): void {
    this.searchFilter = e.target.value?.trim().toLowerCase() || '';
    this.dataSource.filter = this.searchFilter;
  }

  getStatusIcon(status: string): string {
    switch (status?.toLowerCase()) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  }
}
