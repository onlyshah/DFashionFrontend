import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { UserManagementService } from './services/user-management.service';
import { NotificationService } from '../../core/services/notification.service';
import { SuperAdminPanelComponent } from './components/super-admin-panel.component';
import { CustomerDataTableComponent } from './components/customer-data-table.component';

interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  department?: string;
  employeeId?: string;
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  avatar?: string;
  permissions?: string[];
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  usersByRole: { [key: string]: number };
  [key: string]: any; // Allow additional properties
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    SuperAdminPanelComponent,
    CustomerDataTableComponent
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Make Object available in template
  Object = Object;

  currentUser: any = null;
  users: User[] = [];
  filteredUsers: User[] = [];
  userStats: UserStats = {
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    usersByRole: {}
  };
  
  loading = false;
  searchTerm = '';
  selectedRole = '';
  selectedStatus = '';
  
  // Table configuration
  displayedColumns: string[] = [];
  availableRoles = ['super_admin', 'admin', 'manager', 'vendor', 'customer'];
  
  // Permissions
  canViewAllUsers = false;
  canEditUsers = false;
  canDeleteUsers = false;
  
  constructor(
    private authService: AuthService,
    private userManagementService: UserManagementService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.currentUser = user;
          this.setupPermissions();
          this.setupTableColumns();
          this.loadUserData();
        }
      });
  }

  private setupPermissions(): void {
    const userRole = this.currentUser?.role?.toLowerCase();
    
    switch (userRole) {
      case 'super_admin':
        this.canViewAllUsers = true;
        this.canEditUsers = true;
        this.canDeleteUsers = true;
        break;
      case 'admin':
        this.canViewAllUsers = true;
        this.canEditUsers = true;
        this.canDeleteUsers = false;
        break;
      case 'manager':
        this.canViewAllUsers = false;
        this.canEditUsers = false;
        this.canDeleteUsers = false;
        break;
      case 'vendor':
        this.canViewAllUsers = false;
        this.canEditUsers = false;
        this.canDeleteUsers = false;
        break;
      case 'customer':
        this.canViewAllUsers = false;
        this.canEditUsers = false;
        this.canDeleteUsers = false;
        break;
      default:
        this.canViewAllUsers = false;
        this.canEditUsers = false;
        this.canDeleteUsers = false;
    }
  }

  private setupTableColumns(): void {
    const userRole = this.currentUser?.role?.toLowerCase();
    
    // Base columns for all users
    this.displayedColumns = ['avatar', 'fullName', 'email', 'role', 'status'];
    
    // Add additional columns based on role permissions
    if (this.canViewAllUsers) {
      this.displayedColumns.push('lastLogin', 'createdAt');
    }
    
    if (this.canEditUsers || this.canDeleteUsers) {
      this.displayedColumns.push('actions');
    }
    
    // For customers, show customer-specific columns
    if (userRole === 'customer') {
      this.displayedColumns = ['avatar', 'fullName', 'email', 'joinDate', 'orders', 'totalSpent'];
    }
  }

  private loadUserData(): void {
    this.loading = true;
    const userRole = this.currentUser?.role?.toLowerCase();
    
    // Load data based on user role
    if (userRole === 'customer') {
      this.loadCustomerData();
    } else if (this.canViewAllUsers) {
      this.loadAllUsersData();
    } else {
      this.loadLimitedUserData();
    }
  }

  private loadCustomerData(): void {
    // For customers, load customer-specific data (orders, purchases, etc.)
    this.userManagementService.getCustomerData(this.currentUser._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.users = [response.data.customer];
            this.filteredUsers = [...this.users];
            // Map the stats to match UserStats interface
            this.userStats = {
              totalUsers: 1,
              activeUsers: response.data.customer?.isActive ? 1 : 0,
              newUsersThisMonth: 0,
              usersByRole: { [response.data.customer?.role || 'customer']: 1 },
              ...response.data.stats
            };
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading customer data:', error);
          this.notificationService.error('Error', 'Failed to load customer data');
          this.loading = false;
        }
      });
  }

  private loadAllUsersData(): void {
    // For super admin and admin, load all users
    this.userManagementService.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.users = response.data.users;
            this.filteredUsers = [...this.users];
            this.userStats = response.data.stats;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading users data:', error);
          this.notificationService.error('Error', 'Failed to load users data');
          this.loading = false;
        }
      });
  }

  private loadLimitedUserData(): void {
    // For other roles, load limited user data
    this.userManagementService.getLimitedUserData(this.currentUser.role)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.users = response.data.users;
            this.filteredUsers = [...this.users];
            this.userStats = response.data.stats;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading user data:', error);
          this.notificationService.error('Error', 'Failed to load user data');
          this.loading = false;
        }
      });
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchTerm || 
        user.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesRole = !this.selectedRole || user.role === this.selectedRole;
      
      const matchesStatus = !this.selectedStatus || 
        (this.selectedStatus === 'active' && user.isActive) ||
        (this.selectedStatus === 'inactive' && !user.isActive);
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.filteredUsers = [...this.users];
  }

  addNewUser(): void {
    if (!this.canEditUsers) {
      this.notificationService.error('Permission Denied', 'You do not have permission to add users');
      return;
    }

    // Implement add new user functionality
    this.notificationService.info('Add User', 'Add user functionality coming soon');
  }

  editUser(user: User): void {
    if (!this.canEditUsers) {
      this.notificationService.error('Permission Denied', 'You do not have permission to edit users');
      return;
    }

    // Implement edit user functionality
    console.log('Edit user:', user);
  }

  deleteUser(user: User): void {
    if (!this.canDeleteUsers) {
      this.notificationService.error('Permission Denied', 'You do not have permission to delete users');
      return;
    }

    // Implement delete user functionality
    console.log('Delete user:', user);
  }

  toggleUserStatus(user: User): void {
    if (!this.canEditUsers) {
      this.notificationService.error('Permission Denied', 'You do not have permission to modify user status');
      return;
    }

    // Implement toggle user status functionality
    console.log('Toggle status for user:', user);
  }

  getRoleColor(role: string): string {
    const roleColors: { [key: string]: string } = {
      'super_admin': '#e91e63',
      'admin': '#f44336',
      'manager': '#ff9800',
      'vendor': '#2196f3',
      'customer': '#4caf50'
    };
    return roleColors[role] || '#666666';
  }

  getStatusColor(isActive: boolean): string {
    return isActive ? '#4caf50' : '#f44336';
  }

  formatDate(date: Date | string): string {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Dashboard helper methods
  getDashboardTitle(): string {
    const role = this.currentUser?.role;
    switch (role) {
      case 'super_admin': return 'Super Admin Dashboard';
      case 'admin': return 'Admin Dashboard';
      case 'sales_manager': return 'Sales Manager Dashboard';
      case 'sales_executive': return 'Sales Dashboard';
      case 'marketing_manager': return 'Marketing Manager Dashboard';
      case 'marketing_executive': return 'Marketing Dashboard';
      case 'account_manager': return 'Account Manager Dashboard';
      case 'accountant': return 'Accounting Dashboard';
      case 'support_manager': return 'Support Manager Dashboard';
      case 'support_agent': return 'Support Dashboard';
      case 'content_manager': return 'Content Manager Dashboard';
      case 'vendor_manager': return 'Vendor Manager Dashboard';
      case 'vendor': return 'Vendor Dashboard';
      case 'customer': return 'My Account';
      default: return 'Dashboard';
    }
  }

  isAdminRole(): boolean {
    const adminRoles = [
      'admin', 'sales_manager', 'sales_executive', 'marketing_manager',
      'marketing_executive', 'account_manager', 'accountant', 'support_manager',
      'support_agent', 'content_manager', 'vendor_manager'
    ];
    return adminRoles.includes(this.currentUser?.role);
  }

  getRoleOperationsTitle(): string {
    const role = this.currentUser?.role;
    switch (role) {
      case 'admin': return 'Administrative Operations';
      case 'sales_manager':
      case 'sales_executive': return 'Sales Operations';
      case 'marketing_manager':
      case 'marketing_executive': return 'Marketing Operations';
      case 'account_manager':
      case 'accountant': return 'Financial Operations';
      case 'support_manager':
      case 'support_agent': return 'Support Operations';
      case 'content_manager': return 'Content Operations';
      case 'vendor_manager': return 'Vendor Management Operations';
      default: return 'Operations';
    }
  }

  // Permission-based methods
  canManageUsers(): boolean {
    return ['admin', 'support_manager'].includes(this.currentUser?.role);
  }

  canManageProducts(): boolean {
    return ['admin', 'marketing_manager', 'content_manager'].includes(this.currentUser?.role);
  }

  canViewOrders(): boolean {
    return ['admin', 'sales_manager', 'sales_executive', 'account_manager', 'support_manager'].includes(this.currentUser?.role);
  }

  canViewAnalytics(): boolean {
    return ['admin', 'sales_manager', 'marketing_manager', 'account_manager'].includes(this.currentUser?.role);
  }

  canManageContent(): boolean {
    return ['admin', 'content_manager', 'marketing_manager'].includes(this.currentUser?.role);
  }

  canViewReports(): boolean {
    return ['admin', 'account_manager', 'accountant', 'sales_manager'].includes(this.currentUser?.role);
  }

  // Navigation methods
  navigateToUserManagement(): void {
    this.notificationService.info('Navigation', 'User management functionality coming soon');
  }

  navigateToProductManagement(): void {
    this.notificationService.info('Navigation', 'Product management functionality coming soon');
  }

  navigateToOrderManagement(): void {
    this.notificationService.info('Navigation', 'Order management functionality coming soon');
  }

  navigateToAnalytics(): void {
    this.notificationService.info('Navigation', 'Analytics functionality coming soon');
  }

  navigateToContentManagement(): void {
    this.notificationService.info('Navigation', 'Content management functionality coming soon');
  }

  navigateToReports(): void {
    this.notificationService.info('Navigation', 'Reports functionality coming soon');
  }

  // Vendor navigation methods
  navigateToMyProducts(): void {
    this.notificationService.info('Navigation', 'My products functionality coming soon');
  }

  navigateToMyOrders(): void {
    this.notificationService.info('Navigation', 'My orders functionality coming soon');
  }

  navigateToVendorAnalytics(): void {
    this.notificationService.info('Navigation', 'Vendor analytics functionality coming soon');
  }

  navigateToVendorProfile(): void {
    this.notificationService.info('Navigation', 'Vendor profile functionality coming soon');
  }
}
