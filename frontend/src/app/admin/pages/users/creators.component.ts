import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-creators-management',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatProgressSpinnerModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatTooltipModule, 
    MatChipsModule, MatDialogModule, FormsModule
  ],
  templateUrl: './creators.component.html',
  styleUrls: ['./creators.component.scss']
})
export class CreatorsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['username', 'email', 'fullName', 'status', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  isLoading = false;
  searchFilter = '';
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  totalCreators = 0;
  currentPage = 1;

  constructor(private api: AdminApiService, private dialog: MatDialog) {}

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
    
    this.api.getCreators(page, this.pageSize).subscribe({
      next: (res: any) => {
        console.log('✅ Full API response:', JSON.stringify(res, null, 2));
        console.log('res.data:', res?.data);
        console.log('res.data.users:', res?.data?.users);
        console.log('res.data.users length:', res?.data?.users?.length);
        
        const creators = res?.data?.users || res?.data || [];
        console.log('After extraction, creators:', creators);
        console.log('Creators length:', creators?.length);
        
        this.dataSource.data = creators;
        console.log('DataSource data length after assignment:', this.dataSource.data.length);
        
        this.totalCreators = res?.data?.pagination?.total || creators?.length || 0;
        
        if (this.paginator) {
          this.paginator.length = this.totalCreators;
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error loading creators:', err);
        this.dataSource.data = [];
        this.totalCreators = 0;
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.load(event.pageIndex + 1);
  }

  applyFilter(e: any): void {
    this.searchFilter = e.target.value?.trim().toLowerCase() || '';
    this.dataSource.filter = this.searchFilter;
  }

  deleteCreator(id: number, username: string): void {
    if (confirm(`Delete creator "${username}"? This action cannot be undone.`)) {
      this.isLoading = true;
      this.api.deleteUser(String(id)).subscribe({
        next: () => {
          console.log('✅ Creator deleted successfully');
          this.load(this.currentPage);
        },
        error: (err) => {
          console.error('❌ Error deleting creator:', err);
          this.isLoading = false;
        }
      });
    }
  }

  toggleStatus(id: number, currentStatus: boolean, username: string): void {
    const newStatus = !currentStatus;
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} creator "${username}"?`)) {
      this.isLoading = true;
      this.api.updateUserStatus(String(id), newStatus).subscribe({
        next: () => {
          console.log(`✅ Creator ${action}d successfully`);
          this.load(this.currentPage);
        },
        error: (err) => {
          console.error(`❌ Error ${action}ing creator:`, err);
          this.isLoading = false;
        }
      });
    }
  }

  exportCreators(): void {
    const headers = ['ID', 'Username', 'Email', 'Full Name', 'Status', 'Created At'];
    const rows = this.dataSource.data.map(c => [
      c.id,
      c.username,
      c.email,
      c.fullName || 'N/A',
      c.isActive ? 'Active' : 'Inactive',
      new Date(c.createdAt).toLocaleDateString()
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `creators-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
