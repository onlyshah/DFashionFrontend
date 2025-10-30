import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AdminAuthService } from './admin-auth.service';

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  action: string; // 'view', 'create', 'edit', 'delete', 'manage'
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  level: number; // 1: Super Admin, 2: Admin, 3: Manager, 4: User
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private currentUserRole = new BehaviorSubject<Role | null>(null);
  public currentUserRole$ = this.currentUserRole.asObservable();

  // Define all available permissions
  private allPermissions: Permission[] = [
    // Dashboard Permissions
    { id: 'dashboard:view', name: 'View Dashboard', description: 'Access to main dashboard', module: 'dashboard', action: 'view' },
    
    // User Management Permissions
    { id: 'users:view', name: 'View Users', description: 'View user list and details', module: 'users', action: 'view' },
    { id: 'users:create', name: 'Create Users', description: 'Create new users', module: 'users', action: 'create' },
    { id: 'users:edit', name: 'Edit Users', description: 'Edit user information', module: 'users', action: 'edit' },
    { id: 'users:delete', name: 'Delete Users', description: 'Delete users', module: 'users', action: 'delete' },
    { id: 'users:manage', name: 'Manage Users', description: 'Full user management access', module: 'users', action: 'manage' },
    
    // Role Management Permissions (Super Admin Only)
    { id: 'roles:view', name: 'View Roles', description: 'View roles and permissions', module: 'roles', action: 'view' },
    { id: 'roles:create', name: 'Create Roles', description: 'Create new roles', module: 'roles', action: 'create' },
    { id: 'roles:edit', name: 'Edit Roles', description: 'Edit role permissions', module: 'roles', action: 'edit' },
    { id: 'roles:delete', name: 'Delete Roles', description: 'Delete roles', module: 'roles', action: 'delete' },
    { id: 'roles:manage', name: 'Manage Roles', description: 'Full role management access', module: 'roles', action: 'manage' },
    
    // Product Management Permissions
    { id: 'products:view', name: 'View Products', description: 'View product list and details', module: 'products', action: 'view' },
    { id: 'products:create', name: 'Create Products', description: 'Create new products', module: 'products', action: 'create' },
    { id: 'products:edit', name: 'Edit Products', description: 'Edit product information', module: 'products', action: 'edit' },
    { id: 'products:delete', name: 'Delete Products', description: 'Delete products', module: 'products', action: 'delete' },
    { id: 'products:manage', name: 'Manage Products', description: 'Full product management access', module: 'products', action: 'manage' },
    
    // Order Management Permissions
    { id: 'orders:view', name: 'View Orders', description: 'View order list and details', module: 'orders', action: 'view' },
    { id: 'orders:edit', name: 'Edit Orders', description: 'Edit order status and details', module: 'orders', action: 'edit' },
    { id: 'orders:delete', name: 'Delete Orders', description: 'Delete orders', module: 'orders', action: 'delete' },
    { id: 'orders:manage', name: 'Manage Orders', description: 'Full order management access', module: 'orders', action: 'manage' },
    
    // Analytics Permissions
    { id: 'analytics:view', name: 'View Analytics', description: 'Access to analytics and reports', module: 'analytics', action: 'view' },
    { id: 'analytics:export', name: 'Export Analytics', description: 'Export analytics data', module: 'analytics', action: 'export' },
    
    // System Management Permissions (Super Admin Only)
    { id: 'system:view', name: 'View System Info', description: 'View system information', module: 'system', action: 'view' },
    { id: 'system:logs', name: 'View System Logs', description: 'Access system logs', module: 'system', action: 'logs' },
    { id: 'system:monitoring', name: 'System Monitoring', description: 'Access system monitoring', module: 'system', action: 'monitoring' },
    { id: 'system:backup', name: 'System Backup', description: 'Perform system backup/restore', module: 'system', action: 'backup' },
    { id: 'system:maintenance', name: 'System Maintenance', description: 'System maintenance mode', module: 'system', action: 'maintenance' },
    { id: 'system:manage', name: 'Manage System', description: 'Full system management access', module: 'system', action: 'manage' },
    
    // Settings Permissions
    { id: 'settings:view', name: 'View Settings', description: 'View application settings', module: 'settings', action: 'view' },
    { id: 'settings:edit', name: 'Edit Settings', description: 'Edit application settings', module: 'settings', action: 'edit' },
    { id: 'settings:manage', name: 'Manage Settings', description: 'Full settings management access', module: 'settings', action: 'manage' }
  ];

  // Define default roles
  private defaultRoles: Role[] = [
    {
      id: 'super_admin',
      name: 'super_admin',
      displayName: 'Super Administrator',
      description: 'Full system access with all permissions',
      permissions: this.allPermissions.map(p => p.id), // All permissions
      level: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'admin',
      name: 'admin',
      displayName: 'Administrator',
      description: 'Administrative access with most permissions',
      permissions: this.allPermissions.filter(p => !p.module.includes('system') && !p.module.includes('roles')).map(p => p.id),
      level: 2,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'manager',
      name: 'manager',
      displayName: 'Manager',
      description: 'Management access with limited permissions',
      permissions: [
        'dashboard:view',
        'users:view', 'users:edit',
        'products:view', 'products:create', 'products:edit',
        'orders:view', 'orders:edit',
        'analytics:view',
        'settings:view'
      ],
      level: 3,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'customer',
      name: 'customer',
      displayName: 'Customer',
      description: 'Basic customer access',
      permissions: ['dashboard:view'],
      level: 4,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  constructor(private adminAuthService: AdminAuthService) {
    // Subscribe to current user and set role
    this.adminAuthService.currentUser$.subscribe(user => {
      if (user && user.role) {
        const role = this.getRoleByName(user.role);
        this.currentUserRole.next(role);
      } else {
        this.currentUserRole.next(null);
      }
    });
  }

  // Get all permissions
  getAllPermissions(): Permission[] {
    return this.allPermissions;
  }

  // Get all roles
  getAllRoles(): Role[] {
    return this.defaultRoles;
  }

  // Get role by name
  getRoleByName(roleName: string): Role | null {
    return this.defaultRoles.find(role => role.name === roleName) || null;
  }

  // Check if user has specific permission
  hasPermission(permission: string): boolean {
    const currentRole = this.currentUserRole.value;
    if (!currentRole) return false;
    
    // Super admin has all permissions
    if (currentRole.name === 'super_admin') return true;
    
    return currentRole.permissions.includes(permission);
  }

  // Check if user has any of the specified permissions
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  // Check if user has all specified permissions
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  // Check if user can access module
  canAccessModule(module: string): boolean {
    const currentRole = this.currentUserRole.value;
    if (!currentRole) return false;
    
    // Super admin can access all modules
    if (currentRole.name === 'super_admin') return true;
    
    return currentRole.permissions.some(permission => permission.startsWith(`${module}:`));
  }

  // Check if user is super admin
  isSuperAdmin(): boolean {
    const currentRole = this.currentUserRole.value;
    return currentRole?.name === 'super_admin' || false;
  }

  // Check if user is admin or higher
  isAdmin(): boolean {
    const currentRole = this.currentUserRole.value;
    return (currentRole?.level ?? 999) <= 2;
  }

  // Check if user can manage other users
  canManageUsers(): boolean {
    return this.hasPermission('users:manage') || this.hasPermission('users:edit');
  }

  // Check if user can manage roles (Super Admin only)
  canManageRoles(): boolean {
    return this.hasPermission('roles:manage');
  }

  // Check if user can access system management
  canAccessSystemManagement(): boolean {
    return this.canAccessModule('system');
  }

  // Get permissions by module
  getPermissionsByModule(module: string): Permission[] {
    return this.allPermissions.filter(permission => permission.module === module);
  }

  // Get user's permissions for a specific module
  getUserPermissionsForModule(module: string): Permission[] {
    const currentRole = this.currentUserRole.value;
    if (!currentRole) return [];
    
    return this.allPermissions.filter(permission => 
      permission.module === module && currentRole.permissions.includes(permission.id)
    );
  }

  // Update user role (Super Admin only)
  updateUserRole(userId: string, newRoleName: string): Observable<boolean> {
    // This would typically make an API call
    // For now, return a mock observable
    return new Observable(observer => {
      if (this.isSuperAdmin()) {
        // Simulate API call
        setTimeout(() => {
          observer.next(true);
          observer.complete();
        }, 1000);
      } else {
        observer.error('Insufficient permissions');
      }
    });
  }

  // Create new role (Super Admin only)
  createRole(role: Partial<Role>): Observable<Role> {
    return new Observable(observer => {
      if (this.isSuperAdmin()) {
        const newRole: Role = {
          id: Date.now().toString(),
          name: role.name || '',
          displayName: role.displayName || '',
          description: role.description || '',
          permissions: role.permissions || [],
          level: role.level || 4,
          isActive: role.isActive !== false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        this.defaultRoles.push(newRole);
        observer.next(newRole);
        observer.complete();
      } else {
        observer.error('Insufficient permissions');
      }
    });
  }

  // Update role (Super Admin only)
  updateRole(roleId: string, updates: Partial<Role>): Observable<Role> {
    return new Observable(observer => {
      if (this.isSuperAdmin()) {
        const roleIndex = this.defaultRoles.findIndex(role => role.id === roleId);
        if (roleIndex !== -1) {
          this.defaultRoles[roleIndex] = {
            ...this.defaultRoles[roleIndex],
            ...updates,
            updatedAt: new Date()
          };
          observer.next(this.defaultRoles[roleIndex]);
          observer.complete();
        } else {
          observer.error('Role not found');
        }
      } else {
        observer.error('Insufficient permissions');
      }
    });
  }

  // Delete role (Super Admin only)
  deleteRole(roleId: string): Observable<boolean> {
    return new Observable(observer => {
      if (this.isSuperAdmin()) {
        const roleIndex = this.defaultRoles.findIndex(role => role.id === roleId);
        if (roleIndex !== -1 && this.defaultRoles[roleIndex].name !== 'super_admin') {
          this.defaultRoles.splice(roleIndex, 1);
          observer.next(true);
          observer.complete();
        } else {
          observer.error('Cannot delete this role');
        }
      } else {
        observer.error('Insufficient permissions');
      }
    });
  }
}
