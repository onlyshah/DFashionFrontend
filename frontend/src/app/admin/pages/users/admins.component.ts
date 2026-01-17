import { Component, OnInit, ViewChild } from '@angular/core';
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
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-admins-management',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatProgressSpinnerModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatTooltipModule, 
    MatChipsModule, MatDialogModule, FormsModule
  ],
  templateUrl: './admins.component.html',
  styleUrls: ['./admins.component.scss']
})
export class AdminsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['name', 'email', 'role', 'lastLogin', 'status', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  isLoading = false;
  searchFilter = '';
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  totalAdmins = 0;

  constructor(private api: AdminApiService) {}

  ngOnInit(): void {
    this.load();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  load(page: number = 1): void {
    this.isLoading = true;
    this.api.getAdmins(page, this.pageSize).subscribe({
      next: (res: any) => {
        console.log('✅ Admins loaded:', res);
        this.dataSource.data = res?.data?.users || res?.data || [];
        this.totalAdmins = res?.data?.pagination?.total || res?.data?.length || 0;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error loading admins:', err);
        this.dataSource.data = [];
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.load(event.pageIndex + 1);
  }

  applyFilter(e: any): void {
    this.searchFilter = e.target.value.trim().toLowerCase();
    this.dataSource.filter = this.searchFilter;
  }

  deleteAdmin(id: string, name: string): void {
    if (confirm(`Are you sure you want to delete admin: ${name}?`)) {
      this.isLoading = true;
      this.api.deleteUser(id).subscribe({
        next: () => {
          console.log('✅ Admin deleted');
          this.load(1);
        },
        error: (err) => {
          console.error('❌ Error deleting admin:', err);
          this.isLoading = false;
        }
      });
    }
  }

  toggleStatus(id: string, currentStatus: boolean): void {
    const newStatus = !currentStatus;
    this.api.updateUserStatus(id, newStatus).subscribe({
      next: () => {
        console.log(`✅ Status updated to ${newStatus ? 'Active' : 'Inactive'}`);
        this.load(1);
      },
      error: (err) => {
        console.error('❌ Error updating status:', err);
      }
    });
  }

  exportAdmins(): void {
    const csvContent = this.generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admins-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  private generateCSV(): string {
    const headers = ['Name', 'Email', 'Role', 'Last Login', 'Status'];
    const rows = this.dataSource.data.map(a => [
      a.fullName || a.username || '-',
      a.email,
      a.role || '-',
      a.lastLogin ? new Date(a.lastLogin).toLocaleDateString() : '-',
      a.isActive ? 'Active' : 'Inactive'
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    return csv;
  }
}
