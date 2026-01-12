import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { AdminApiService } from '../services/admin-api.service';
import { UserDialogComponent } from './user-dialog.component';

export interface User {
  _id: string;
  fullName: string;
  email: string;
  username: string;
  role: string;
  department: string;
  employeeId?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
}

@Component({
    selector: 'app-user-management',
    templateUrl: './user-management.component.html',
    styleUrls: ['./user-management.component.scss'],
    standalone: false
})
export class UserManagementComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  // track last known pagination/sort when parent paginator is managed by child component
  currentPage = 1;
  currentLimit = 10;
  currentSortBy = 'createdAt';
  currentSortOrder: 'asc' | 'desc' = 'desc';

  private destroy$ = new Subject<void>();
  
  displayedColumns: string[] = [
    'fullName', 'email', 'role', 'department', 'status', 'lastLogin', 'actions'
  ];
  
  dataSource = new MatTableDataSource<User>([]);
  isLoading = false;
  totalUsers = 0;
  
  // Filters
  searchControl = new FormControl('');
  roleFilter = new FormControl('');
  departmentFilter = new FormControl('');
  statusFilter = new FormControl('');
  
  roles: any[] = [{ value: '', label: 'All Roles' }];
  departments: any[] = [{ value: '', label: 'All Departments' }];
  
  statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' }
  ];

  constructor(
    private apiService: AdminApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadDepartments();
    this.setupFilters();
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupFilters(): void {
    // Search filter
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loadUsers();
    });

    // Other filters
    [this.roleFilter, this.departmentFilter, this.statusFilter].forEach(control => {
      control.valueChanges.pipe(
        takeUntil(this.destroy$)
      ).subscribe(() => {
        this.loadUsers();
      });
    });
  }

  loadRoles(): void {
    this.apiService.get('/admin/roles').subscribe({
      next: (res: any) => {
        const rolesList = (res?.data || []).map((r: any) => ({
          value: r._id || r.name,
          label: r.name || r.displayName
        }));
        this.roles = [{ value: '', label: 'All Roles' }, ...rolesList];
      },
      error: () => {
        console.error('Failed to load roles');
      }
    });
  }

  loadDepartments(): void {
    this.apiService.get('/admin/departments').subscribe({
      next: (res: any) => {
        const deptList = (res?.data || []).map((d: any) => ({
          value: d._id || d.name,
          label: d.name || d.displayName
        }));
        this.departments = [{ value: '', label: 'All Departments' }, ...deptList];
      },
      error: () => {
        console.error('Failed to load departments');
      }
    });
  }

  loadUsers(override?: { page?: number; limit?: number; sortBy?: string; sortOrder?: string }): void {
    this.isLoading = true;
    const page = override?.page ?? this.currentPage;
    const limit = override?.limit ?? this.currentLimit;
    const sortBy = override?.sortBy ?? this.currentSortBy;
    const sortOrder = override?.sortOrder ?? this.currentSortOrder;

    const params = {
      page,
      limit,
      search: this.searchControl.value || '',
      role: this.roleFilter.value || '',
      department: this.departmentFilter.value || '',
      isActive: this.statusFilter.value || '',
      sortBy,
      sortOrder
    };

    this.apiService.getUsers(params).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: any) => {
        console.log('Users loaded:', response);
        this.dataSource.data = response.data?.users || [];
        this.totalUsers = response.data?.pagination?.totalUsers || 0;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Failed to load users:', error);
        this.isLoading = false;
        this.snackBar.open('Failed to load users', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });

        // Initialize empty data on error
        this.dataSource.data = [];
        this.totalUsers = 0;
      }
    });
  }



  

  onPageChange(event: any): void {
    // event expected { pageIndex, pageSize }
    const page = (event && event.pageIndex != null) ? event.pageIndex + 1 : 1;
    const limit = (event && event.pageSize) ? event.pageSize : this.currentLimit;
    this.currentPage = page;
    this.currentLimit = limit;
    this.loadUsers({ page, limit });
  }

  onSortChange(event?: any): void {
    if (event && event.active) {
      this.currentSortBy = event.active;
      this.currentSortOrder = event.direction || 'desc';
    }
    this.loadUsers({ sortBy: this.currentSortBy, sortOrder: this.currentSortOrder });
  }

  

  clearFilters(): void {
    this.searchControl.setValue('');
    this.roleFilter.setValue('');
    this.departmentFilter.setValue('');
    this.statusFilter.setValue('');
  }

  openUserDialog(user?: User): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '600px',
      data: user ? { ...user } : null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  toggleUserStatus(user: User): void {
    const action = user.isActive ? 'deactivate' : 'activate';
    
    if (user.isActive) {
      this.apiService.deleteUser(user._id).subscribe({
        next: () => {
          this.snackBar.open('User deactivated successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadUsers();
        },
        error: (error) => {
          console.error('Failed to deactivate user:', error);
          this.snackBar.open('Failed to deactivate user', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      this.apiService.activateUser(user._id).subscribe({
        next: () => {
          this.snackBar.open('User activated successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadUsers();
        },
        error: (error) => {
          console.error('Failed to activate user:', error);
          this.snackBar.open('Failed to activate user', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user "${user.fullName}"?`)) {
      this.apiService.deleteUser(user._id).subscribe({
        next: () => {
          this.snackBar.open('User deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadUsers();
        },
        error: (error) => {
          console.error('Failed to delete user:', error);
          this.snackBar.open('Failed to delete user', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  exportUsers(): void {
    // Export functionality
    this.snackBar.open('Export feature coming soon!', 'Close', {
      duration: 3000
    });
  }

  getStatusColor(user: User): string {
    if (!user.isActive) return '#f44336';
    if (!user.isVerified) return '#ff9800';
    return '#4caf50';
  }

  getStatusText(user: User): string {
    if (!user.isActive) return 'Inactive';
    if (!user.isVerified) return 'Unverified';
    return 'Active';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getRoleColor(role: string): string {
    const roleColors: { [key: string]: string } = {
      'super_admin': '#e91e63',
      'admin': '#9c27b0',
      'sales_manager': '#2196f3',
      'sales_executive': '#03a9f4',
      'marketing_manager': '#ff9800',
      'marketing_executive': '#ffc107',
      'account_manager': '#4caf50',
      'accountant': '#8bc34a',
      'support_manager': '#795548',
      'support_agent': '#9e9e9e',
      'customer': '#607d8b',
      'vendor': '#ff5722'
    };

    return roleColors[role] || '#666666';
  }

  getDepartmentDisplay(department: string): string {
    if (!department) return 'N/A';
    return department.charAt(0).toUpperCase() + department.slice(1).toLowerCase();
  }
}
