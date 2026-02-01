import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminUserService } from '../../../core/services/admin-user.service';
import { ToastrService } from 'ngx-toastr';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  status: 'active' | 'suspended' | 'inactive';
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
  department?: string;
  phone?: string;
  profileImage?: string;
  twoFactorEnabled: boolean;
  loginAttempts?: number;
}

interface Role {
  id: string;
  name: string;
  permissions: string[];
  description: string;
}

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit, OnDestroy {
  adminUsers: AdminUser[] = [];
  selectedUser: AdminUser | null = null;
  availableRoles: Role[] = [];
  displayedColumns: string[] = ['name', 'email', 'role', 'status', 'lastLogin', 'actions'];
  
  isLoading = false;
  showCreateForm = false;
  showDetailView = false;
  showPermissionsManager = false;
  
  createAdminForm!: FormGroup;
  permissionsForm!: FormGroup;
  
  // Pagination
  pageSize = 15;
  pageSizeOptions = [10, 15, 25];
  totalUsers = 0;
  currentPage = 1;
  
  // Filters
  selectedRole: string = 'all';
  selectedStatus: string = 'all';
  searchQuery: string = '';
  
  statusOptions = [
    { value: 'all', label: 'All Users' },
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'inactive', label: 'Inactive' }
  ];

  allPermissions = [
    'manage_products',
    'manage_users',
    'manage_orders',
    'manage_payments',
    'manage_admins',
    'manage_roles',
    'manage_promotions',
    'manage_cms',
    'manage_analytics',
    'manage_compliance',
    'manage_logistics',
    'manage_returns',
    'manage_support',
    'view_audit_logs',
    'manage_feature_flags',
    'manage_data_governance',
    'system_settings',
    'view_reports'
  ];
  
  private destroy$ = new Subject<void>();

  constructor(
    private adminUserService: AdminUserService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadAdminUsers();
    this.loadRoles();
  }

  initializeForm(): void {
    this.createAdminForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      role: ['', [Validators.required]],
      department: [''],
      phone: ['', [Validators.pattern(/^[\+]?[0-9]{10,}$/)]],
      sendInvitation: [true]
    });

    this.permissionsForm = this.fb.group({
      selectedPermissions: [[]]
    });
  }

  loadAdminUsers(): void {
    this.isLoading = true;
    const filters = {
      page: this.currentPage,
      limit: this.pageSize,
      role: this.selectedRole !== 'all' ? this.selectedRole : undefined,
      status: this.selectedStatus !== 'all' ? this.selectedStatus : undefined,
      search: this.searchQuery || undefined
    };

    this.adminUserService.getAdmins(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.adminUsers = response.admins || [];
          this.totalUsers = response.total || 0;
          this.isLoading = false;
        },
        error: (error: any) => {
          this.toastr.error('Failed to load admin users');
          this.isLoading = false;
        }
      });
  }

  loadRoles(): void {
    this.adminUserService.getAvailableRoles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (roles: any) => {
          this.availableRoles = roles.roles || [];
        },
        error: (error: any) => {
          console.error('Failed to load roles:', error);
        }
      });
  }

  openCreateAdmin(): void {
    this.showCreateForm = true;
    this.selectedUser = null;
    this.showDetailView = false;
  }

  submitCreateAdmin(): void {
    if (!this.createAdminForm.valid) {
      this.toastr.error('Please fill all required fields');
      return;
    }

    this.isLoading = true;
    const adminData = this.createAdminForm.value;

    this.adminUserService.createAdmin(adminData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.toastr.success('Admin user created successfully');
          this.showCreateForm = false;
          this.createAdminForm.reset({ sendInvitation: true });
          this.loadAdminUsers();
        },
        error: (error: any) => {
          this.toastr.error(error?.error?.message || 'Failed to create admin');
          this.isLoading = false;
        }
      });
  }

  viewUserDetails(user: AdminUser): void {
    this.selectedUser = user;
    this.showDetailView = true;
    this.showCreateForm = false;
    this.permissionsForm.patchValue({
      selectedPermissions: user.permissions
    });
  }

  openPermissionsManager(user: AdminUser): void {
    this.selectedUser = user;
    this.showPermissionsManager = true;
    this.permissionsForm.patchValue({
      selectedPermissions: user.permissions
    });
  }

  updatePermissions(user: AdminUser): void {
    if (!this.permissionsForm.valid) {
      this.toastr.error('Please select at least one permission');
      return;
    }

    this.isLoading = true;
    const permissions = this.permissionsForm.get('selectedPermissions')?.value || [];

    this.adminUserService.updateAdmin(user.id, { permissions })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated: any) => {
          user.permissions = updated.permissions;
          this.toastr.success('Permissions updated successfully');
          this.showPermissionsManager = false;
          this.isLoading = false;
        },
        error: (error: any) => {
          this.toastr.error('Failed to update permissions');
          this.isLoading = false;
        }
      });
  }

  suspendUser(user: AdminUser): void {
    if (!confirm(`Are you sure you want to suspend ${user.name}?`)) {
      return;
    }

    this.isLoading = true;
    this.adminUserService.suspendAdmin(user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated: any) => {
          user.status = 'suspended';
          this.toastr.success('Admin user suspended successfully');
          this.isLoading = false;
        },
        error: (error: any) => {
          this.toastr.error('Failed to suspend user');
          this.isLoading = false;
        }
      });
  }

  reactivateUser(user: AdminUser): void {
    this.isLoading = true;
    this.adminUserService.updateAdmin(user.id, { status: 'active' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated: any) => {
          user.status = 'active';
          this.toastr.success('Admin user reactivated successfully');
          this.isLoading = false;
        },
        error: (error: any) => {
          this.toastr.error('Failed to reactivate user');
          this.isLoading = false;
        }
      });
  }

  resetPassword(user: AdminUser): void {
    if (!confirm(`Send password reset email to ${user.email}?`)) {
      return;
    }

    this.isLoading = true;
    this.adminUserService.resetAdminPassword(user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.toastr.success('Password reset email sent');
          this.isLoading = false;
        },
        error: (error: any) => {
          this.toastr.error('Failed to send reset email');
          this.isLoading = false;
        }
      });
  }

  deleteUser(user: AdminUser): void {
    if (!confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      return;
    }

    this.isLoading = true;
    this.adminUserService.deleteAdmin(user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.toastr.success('Admin user deleted successfully');
          this.showDetailView = false;
          this.selectedUser = null;
          this.loadAdminUsers();
        },
        error: (error: any) => {
          this.toastr.error('Failed to delete user');
          this.isLoading = false;
        }
      });
  }

  togglePermission(permission: string): void {
    const selected = this.permissionsForm.get('selectedPermissions')?.value || [];
    const index = selected.indexOf(permission);
    
    if (index > -1) {
      selected.splice(index, 1);
    } else {
      selected.push(permission);
    }
    
    this.permissionsForm.patchValue({ selectedPermissions: [...selected] });
  }

  isPermissionSelected(permission: string): boolean {
    const selected = this.permissionsForm.get('selectedPermissions')?.value || [];
    return selected.includes(permission);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadAdminUsers();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadAdminUsers();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadAdminUsers();
  }

  closeDetailView(): void {
    this.showDetailView = false;
    this.selectedUser = null;
  }

  closeCreateForm(): void {
    this.showCreateForm = false;
    this.createAdminForm.reset({ sendInvitation: true });
  }

  closePermissionsManager(): void {
    this.showPermissionsManager = false;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'active': 'status-active',
      'suspended': 'status-suspended',
      'inactive': 'status-inactive'
    };
    return classes[status] || 'status-active';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
