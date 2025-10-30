import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { AdminAuthService } from '../../admin/services/admin-auth.service';
import { Permission as PermissionServicePermission } from '../../admin/services/permission.service';
import { Permission as AdminPermission } from '../../admin/services/admin-auth.service';

export interface UserRole {
  id: string;
  name: string;
  level: number;
  permissions: string[];
  features: string[];
  description?: string;
}

export interface RolePermission {
  resource: string;
  actions: string[];
  conditions?: any;
}

export interface FeatureAccess {
  feature: string;
  enabled: boolean;
  roles: string[];
  permissions?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RBACService {
  private currentUserRole$ = new BehaviorSubject<UserRole | null>(null);
  private userPermissions$ = new BehaviorSubject<string[]>([]);
  private userFeatures$ = new BehaviorSubject<string[]>([]);

  // Role definitions
  private readonly roleDefinitions: { [key: string]: UserRole } = {
    'super_admin': {
      id: 'super_admin',
      name: 'Super Administrator',
      level: 1,
      permissions: ['*'], // All permissions
      features: [
        'user-management',
        'role-management',
        'system-monitoring',
        'system-logs',
        'application-settings',
        'analytics',
        'product-management',
        'order-management',
        'content-management',
        'vendor-management',
        'financial-reports',
        'security-settings',
        'backup-restore',
        'api-management'
      ],
      description: 'Full system access and control'
    },
    'admin': {
      id: 'admin',
      name: 'Administrator',
      level: 2,
      permissions: [
        'users:view', 'users:create', 'users:update',
        'products:view', 'products:create', 'products:update', 'products:delete',
        'orders:view', 'orders:update',
        'content:view', 'content:create', 'content:update', 'content:delete',
        'analytics:view',
        'reports:view'
      ],
      features: [
        'user-management',
        'product-management',
        'order-management',
        'content-management',
        'analytics'
      ],
      description: 'Administrative access to core features'
    },
    'vendor': {
      id: 'vendor',
      name: 'Vendor',
      level: 3,
      permissions: [
        'products:view', 'products:create', 'products:update',
        'orders:view',
        'analytics:view:own',
        'profile:update'
      ],
      features: [
        'vendor-products',
        'vendor-orders',
        'vendor-analytics',
        'social-feed',
        'stories',
        'posts',
        'profile',
        'notifications'
      ],
      description: 'Vendor-specific features and product management'
    },
    'customer': {
      id: 'customer',
      name: 'Customer',
      level: 4,
      permissions: [
        'profile:view', 'profile:update',
        'orders:view:own',
        'wishlist:manage',
        'cart:manage',
        'reviews:create'
      ],
      features: [
        'social-feed',
        'stories',
        'posts',
        'shopping',
        'wishlist',
        'cart',
        'orders',
        'profile',
        'notifications'
      ],
      description: 'Customer shopping and social features'
    },
    'manager': {
      id: 'manager',
      name: 'Manager',
      level: 2,
      permissions: [
        'users:view', 'users:update',
        'products:view', 'products:update',
        'orders:view', 'orders:update',
        'analytics:view',
        'reports:view'
      ],
      features: [
        'user-management',
        'product-management',
        'order-management',
        'analytics'
      ],
      description: 'Management access to assigned areas'
    }
  };

  // Feature access control
  private readonly featureAccessControl: FeatureAccess[] = [
    {
      feature: 'user-management',
      enabled: true,
      roles: ['super_admin', 'admin', 'manager'],
      permissions: ['users:view']
    },
    {
      feature: 'role-management',
      enabled: true,
      roles: ['super_admin'],
      permissions: ['roles:manage']
    },
    {
      feature: 'system-monitoring',
      enabled: true,
      roles: ['super_admin'],
      permissions: ['system:monitor']
    },
    {
      feature: 'system-logs',
      enabled: true,
      roles: ['super_admin'],
      permissions: ['system:logs']
    },
    {
      feature: 'application-settings',
      enabled: true,
      roles: ['super_admin'],
      permissions: ['settings:manage']
    },
    {
      feature: 'product-management',
      enabled: true,
      roles: ['super_admin', 'admin', 'manager'],
      permissions: ['products:view']
    },
    {
      feature: 'order-management',
      enabled: true,
      roles: ['super_admin', 'admin', 'manager'],
      permissions: ['orders:view']
    },
    {
      feature: 'vendor-products',
      enabled: true,
      roles: ['vendor'],
      permissions: ['products:view']
    },
    {
      feature: 'vendor-orders',
      enabled: true,
      roles: ['vendor'],
      permissions: ['orders:view:own']
    },
    {
      feature: 'social-feed',
      enabled: true,
      roles: ['customer', 'vendor'],
      permissions: []
    },
    {
      feature: 'stories',
      enabled: true,
      roles: ['customer', 'vendor'],
      permissions: []
    },
    {
      feature: 'posts',
      enabled: true,
      roles: ['customer', 'vendor'],
      permissions: []
    },
    {
      feature: 'shopping',
      enabled: true,
      roles: ['customer'],
      permissions: []
    },
    {
      feature: 'wishlist',
      enabled: true,
      roles: ['customer'],
      permissions: ['wishlist:manage']
    },
    {
      feature: 'cart',
      enabled: true,
      roles: ['customer'],
      permissions: ['cart:manage']
    }
  ];

  constructor(
    private authService: AuthService,
    private adminAuthService: AdminAuthService
  ) {
    this.initializeRoleTracking();
  }

  private initializeRoleTracking() {
    // Track admin users
    this.adminAuthService.currentUser$.subscribe(adminUser => {
      if (adminUser) {
        const permissions: string[] = Array.isArray(adminUser.permissions)
          ? adminUser.permissions.flatMap(p => {
              if (typeof p === 'string') {
                return [p];
              } else if (p && typeof p === 'object') {
                // Handle AdminPermission object with module and actions array
                if ('actions' in p && Array.isArray((p as any).actions)) {
                  return (p as any).actions.map((action: string) => `${(p as any).module}:${action}`);
                }
                // Handle PermissionServicePermission object with id, name, module, action
                if ('id' in p && 'name' in p) {
                  return [(p as any).id || (p as any).name || `${(p as any).module}:${(p as any).action}` || 'unknown'];
                }
                // Fallback for any other object structure
                return [`${(p as any).module || 'unknown'}:${(p as any).action || (p as any).actions || 'unknown'}`];
              }
              return ['unknown'];
            })
          : [];
        this.setUserRole(adminUser.role, permissions);
      }
    });

    // Track regular users
    this.authService.currentUser$.subscribe(user => {
      if (user && !this.currentUserRole$.value) {
        const permissions = (user as any).permissions || [];
        this.setUserRole(user.role || 'customer', permissions);
      }
    });
  }

  private setUserRole(roleName: string, customPermissions: string[] = []) {
    const role = this.roleDefinitions[roleName.toLowerCase()];
    if (role) {
      this.currentUserRole$.next(role);
      
      // Combine role permissions with custom permissions
      const allPermissions = role.permissions.includes('*') 
        ? ['*'] 
        : [...role.permissions, ...customPermissions];
      
      this.userPermissions$.next(allPermissions);
      this.userFeatures$.next(role.features);
    }
  }

  /**
   * Initialize user in RBAC system after successful login
   * This method is called from the login component to set up user permissions
   */
  public initializeUser(userData: any): void {
    console.log('🔐 Initializing RBAC for user:', userData);

    if (userData && userData.role) {
      // Set user role and permissions
      this.setUserRole(userData.role, userData.permissions || []);

      // Store additional user data if needed
      console.log('✅ RBAC initialized for role:', userData.role);
    } else {
      console.warn('⚠️ No role found in user data, defaulting to customer');
      this.setUserRole('customer', []);
    }
  }

  // Public API
  getCurrentRole(): Observable<UserRole | null> {
    return this.currentUserRole$.asObservable();
  }

  getUserPermissions(): Observable<string[]> {
    return this.userPermissions$.asObservable();
  }

  getUserFeatures(): Observable<string[]> {
    return this.userFeatures$.asObservable();
  }

  hasPermission(permission: string): Observable<boolean> {
    return this.userPermissions$.pipe(
      map(permissions => {
        if (permissions.includes('*')) return true;
        return permissions.includes(permission);
      })
    );
  }

  hasAnyPermission(permissions: string[]): Observable<boolean> {
    return this.userPermissions$.pipe(
      map(userPermissions => {
        if (userPermissions.includes('*')) return true;
        return permissions.some(permission => userPermissions.includes(permission));
      })
    );
  }

  hasAllPermissions(permissions: string[]): Observable<boolean> {
    return this.userPermissions$.pipe(
      map(userPermissions => {
        if (userPermissions.includes('*')) return true;
        return permissions.every(permission => userPermissions.includes(permission));
      })
    );
  }

  hasFeature(feature: string): Observable<boolean> {
    return combineLatest([
      this.currentUserRole$,
      this.userFeatures$
    ]).pipe(
      map(([role, features]) => {
        if (!role) return false;
        
        // Check if feature is enabled for this role
        const featureAccess = this.featureAccessControl.find(f => f.feature === feature);
        if (!featureAccess || !featureAccess.enabled) return false;
        
        // Check role access
        if (!featureAccess.roles.includes(role.id)) return false;
        
        // Check permission requirements if any
        if (featureAccess.permissions && featureAccess.permissions.length > 0) {
          const userPermissions = this.userPermissions$.value;
          if (userPermissions.includes('*')) return true;
          return featureAccess.permissions.some(permission => 
            userPermissions.includes(permission)
          );
        }
        
        return features.includes(feature);
      })
    );
  }

  hasRole(roleName: string): Observable<boolean> {
    return this.currentUserRole$.pipe(
      map(role => role?.id === roleName.toLowerCase())
    );
  }

  hasMinimumRoleLevel(level: number): Observable<boolean> {
    return this.currentUserRole$.pipe(
      map(role => role ? role.level <= level : false)
    );
  }

  isAdmin(): Observable<boolean> {
    return this.currentUserRole$.pipe(
      map(role => role ? ['super_admin', 'admin', 'manager'].includes(role.id) : false)
    );
  }

  isSuperAdmin(): Observable<boolean> {
    return this.hasRole('super_admin');
  }

  isVendor(): Observable<boolean> {
    return this.hasRole('vendor');
  }

  isCustomer(): Observable<boolean> {
    return this.hasRole('customer');
  }

  // Synchronous methods for immediate checks (use with caution)
  hasPermissionSync(permission: string): boolean {
    const permissions = this.userPermissions$.value;
    if (permissions.includes('*')) return true;
    return permissions.includes(permission);
  }

  hasFeatureSync(feature: string): boolean {
    const role = this.currentUserRole$.value;
    const features = this.userFeatures$.value;
    
    if (!role) return false;
    
    const featureAccess = this.featureAccessControl.find(f => f.feature === feature);
    if (!featureAccess || !featureAccess.enabled) return false;
    
    if (!featureAccess.roles.includes(role.id)) return false;
    
    if (featureAccess.permissions && featureAccess.permissions.length > 0) {
      const userPermissions = this.userPermissions$.value;
      if (userPermissions.includes('*')) return true;
      return featureAccess.permissions.some(permission => 
        userPermissions.includes(permission)
      );
    }
    
    return features.includes(feature);
  }

  hasRoleSync(roleName: string): boolean {
    const role = this.currentUserRole$.value;
    return role?.id === roleName.toLowerCase();
  }

  // Role management (for super admin)
  getAllRoles(): UserRole[] {
    return Object.values(this.roleDefinitions);
  }

  getRoleDefinition(roleName: string): UserRole | null {
    return this.roleDefinitions[roleName.toLowerCase()] || null;
  }

  getFeatureAccessControl(): FeatureAccess[] {
    return this.featureAccessControl;
  }

  // Debug methods
  getCurrentRoleSync(): UserRole | null {
    return this.currentUserRole$.value;
  }

  getUserPermissionsSync(): string[] {
    return this.userPermissions$.value;
  }

  getUserFeaturesSync(): string[] {
    return this.userFeatures$.value;
  }
}
