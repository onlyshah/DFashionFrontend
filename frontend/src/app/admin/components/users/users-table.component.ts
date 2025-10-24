import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent, TableColumn } from '../data-table/data-table.component';
import { AdminDataService } from '../../services/admin-data.service';

@Component({
  selector: 'app-users-table',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  template: `
    <app-data-table
      [columns]="columns"
      [data]="users"
      [actions]="actions"
      [pagination]="pagination"
      searchPlaceholder="Search users..."
      (pageChange)="onPageChange($event)"
      (sortChange)="onSortChange($event)"
      (searchChange)="onSearch($event)"
      (exportData)="exportUsers()">
    </app-data-table>
  `
})
export class UsersTableComponent implements OnInit {
  columns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'lastLogin', label: 'Last Login', sortable: true }
  ];

  actions = [
    {
      label: 'Edit',
      icon: 'typcn-pencil',
      action: (user: any) => this.editUser(user)
    },
    {
      label: 'Delete',
      icon: 'typcn-trash',
      action: (user: any) => this.deleteUser(user)
    }
  ];

  users: any[] = [];
  pagination = {
    pageSize: 10,
    currentPage: 1,
    totalItems: 0
  };

  private searchQuery = '';
  private sortField = 'name';
  private sortOrder: 'asc' | 'desc' = 'asc';

  constructor(private adminService: AdminDataService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    const params = {
      page: this.pagination.currentPage,
      limit: this.pagination.pageSize,
      search: this.searchQuery,
      sortField: this.sortField,
      sortOrder: this.sortOrder
    };

    this.adminService.getUsers(params).subscribe({
      next: (response) => {
        this.users = response.data;
        this.pagination.totalItems = response.total;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        // Here you would typically show an error notification
      }
    });
  }

  onPageChange(page: number): void {
    this.pagination.currentPage = page;
    this.loadUsers();
  }

  onSortChange(event: { column: string; direction: 'asc' | 'desc' }): void {
    this.sortField = event.column;
    this.sortOrder = event.direction;
    this.loadUsers();
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    this.pagination.currentPage = 1; // Reset to first page
    this.loadUsers();
  }

  editUser(user: any): void {
    // Implementation for editing user
    console.log('Edit user:', user);
  }

  deleteUser(user: any): void {
    if (confirm(`Are you sure you want to delete user ${user.name}?`)) {
      this.adminService.deleteUser(user.id).subscribe({
        next: () => {
          this.loadUsers(); // Reload the table
          // Show success notification
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          // Show error notification
        }
      });
    }
  }

  exportUsers(): void {
    this.adminService.generateReport('users').subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users-report.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error exporting users:', error);
        // Show error notification
      }
    });
  }
}