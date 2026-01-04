import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { AdminAuthService } from '../../admin/services/admin-auth.service';

export interface UserRole {
  id: string;
  name: string;
  level: number;
  permissions: string[];
  features: string[];
  description?: string;
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

  private readonly roleDefinitions: { [key: string]: UserRole } = {
    super_admin: {
      id: 'super_admin',
      name: 'Super Administrator',
      level: 1,
      permissions: ['*'],
      features: [
        'user-management', 'role-management', 'system-monitoring', 'system-logs',
        'application-settings', 'analytics', 'product-management', 'order-management',
        'content-management', 'vendor-management', 'financial-reports', 'security-settings',
        'backup-restore', 'api-management'
      ],
      description: 'Full system access and control'
    },
    admin: {
      id: 'admin',
      name: 'Administrator',
      level: 2,
      permissions: [
        'users:view','users:create','users:update',
        'products:view','products:create','products:update','products:delete',
        'orders:view','orders:update',
        'content:view','content:create','content:update','content:delete',
        'analytics:view','reports:view'
      ],
      features: ['user-management','product-management','order-management','content-management','analytics'],
      description: 'Administrative access to core features'
    },
    vendor: {
      id: 'vendor',
      name: 'Vendor',
      level: 3,
      permissions: ['products:view','products:create','products:update','orders:view','analytics:view:own','profile:update'],
      features: ['vendor-products','vendor-orders','vendor-analytics','social-feed','stories','posts','profile','notifications'],
      description: 'Vendor-specific features and product management'
    },
    customer: {
      id: 'customer',
      name: 'Customer',
      level: 4,
      permissions: ['profile:view','profile:update','orders:view:own','wishlist:manage','cart:manage','reviews:create'],
      features: ['social-feed','stories','posts','shopping','wishlist','cart','orders','profile','notifications'],
      description: 'Customer shopping and social features'
    },
    manager: {
      id: 'manager',
      name: 'Manager',
      level: 2,
      permissions: ['users:view','users:update','products:view','products:update','orders:view','orders:update','analytics:view','reports:view'],
      features: ['user-management','product-management','order-management','analytics'],
      description: 'Management access to assigned areas'
    }
  };

  private readonly featureAccessControl: FeatureAccess[] = [
    { feature: 'user-management', enabled: true, roles: ['super_admin','admin','manager'], permissions: ['users:view'] },
    { feature: 'role-management', enabled: true, roles: ['super_admin'], permissions: ['roles:manage'] },
    { feature: 'system-monitoring', enabled: true, roles: ['super_admin'], permissions: ['system:monitor'] },
    { feature: 'system-logs', enabled: true, roles: ['super_admin'], permissions: ['system:logs'] },
    { feature: 'application-settings', enabled: true, roles: ['super_admin'], permissions: ['settings:manage'] },
    { feature: 'product-management', enabled: true, roles: ['super_admin','admin','manager'], permissions: ['products:view'] },
    { feature: 'order-management', enabled: true, roles: ['super_admin','admin','manager'], permissions: ['orders:view'] },
    { feature: 'vendor-products', enabled: true, roles: ['vendor'], permissions: ['products:view'] },
    { feature: 'vendor-orders', enabled: true, roles: ['vendor'], permissions: ['orders:view:own'] },
    { feature: 'social-feed', enabled: true, roles: ['customer','vendor'], permissions: [] },
    { feature: 'stories', enabled: true, roles: ['customer','vendor'], permissions: [] },
    { feature: 'posts', enabled: true, roles: ['customer','vendor'], permissions: [] },
    { feature: 'shopping', enabled: true, roles: ['customer'], permissions: [] },
    { feature: 'wishlist', enabled: true, roles: ['customer'], permissions: ['wishlist:manage'] },
    { feature: 'cart', enabled: true, roles: ['customer'], permissions: ['cart:manage'] }
  ];

  constructor(private authService: AuthService, private adminAuthService: AdminAuthService) {
    this.initializeRoleTracking();
  }

  private initializeRoleTracking() {
    this.adminAuthService.currentUser$.subscribe(adminUser => {
      if (adminUser) {
        const permissions: string[] = Array.isArray(adminUser.permissions)
          ? adminUser.permissions.flatMap(p => {
              if (typeof p === 'string') return [p];
              if (p && typeof p === 'object') {
                if ('actions' in p && Array.isArray((p as any).actions)) {
                  return (p as any).actions.map((action: string) => `${(p as any).module}:${action}`);
                }
                if ('id' in p && 'name' in p) {
                  return [(p as any).id || (p as any).name || `${(p as any).module}:${(p as any).action}` || 'unknown'];
                }
                return [`${(p as any).module || 'unknown'}:${(p as any).action || (p as any).actions || 'unknown'}`];
              }
              return ['unknown'];
            })
          : [];
        this.setUserRole(adminUser.role, permissions);
      }
    });

    this.authService.currentUser$.subscribe(user => {
      if (user && !this.currentUserRole$.value) {
        const permissions = (user as any).permissions || [];
        this.setUserRole(user.role || 'customer', permissions);
      }
    });
  }

  private setUserRole(roleName: string, customPermissions: string[] = []) {
    const role = this.roleDefinitions[roleName?.toLowerCase()];
    if (!role) return;
    this.currentUserRole$.next(role);
    const allPermissions = role.permissions.includes('*') ? ['*'] : [...role.permissions, ...customPermissions];
    this.userPermissions$.next(allPermissions);
    this.userFeatures$.next(role.features);
  }

  public initializeUser(userData: any): void {
    if (!userData) return;
    this.setUserRole(userData.role || 'customer', Array.isArray(userData.permissions) ? userData.permissions : []);
  }

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
      map(permissions => permissions.includes('*') ? true : permissions.includes(permission))
    );
  }

  hasAnyPermission(permissions: string[]): Observable<boolean> {
    return this.userPermissions$.pipe(
      map(userPermissions => userPermissions.includes('*') ? true : permissions.some(p => userPermissions.includes(p)))
    );
  }

  hasAllPermissions(permissions: string[]): Observable<boolean> {
    return this.userPermissions$.pipe(
      map(userPermissions => userPermissions.includes('*') ? true : permissions.every(p => userPermissions.includes(p)))
    );
  }

  hasFeature(feature: string): Observable<boolean> {
    return combineLatest([this.currentUserRole$, this.userFeatures$]).pipe(
      map(([role, features]) => {
        if (!role) return false;
        const featureAccess = this.featureAccessControl.find((f: FeatureAccess) => f.feature === feature);
        if (!featureAccess || !featureAccess.enabled) return false;
        if (!featureAccess.roles.includes(role.id)) return false;
        if (featureAccess.permissions && featureAccess.permissions.length > 0) {
          const userPermissions = this.userPermissions$.value;
          if (userPermissions.includes('*')) return true;
          return featureAccess.permissions.some(p => userPermissions.includes(p));
        }
        return features.includes(feature);
      })
    );
  }

  hasRole(roleName: string): Observable<boolean> {
    return this.currentUserRole$.pipe(map(role => role?.id === roleName.toLowerCase()));
  }

  hasMinimumRoleLevel(level: number): Observable<boolean> {
    return this.currentUserRole$.pipe(map(role => role ? role.level <= level : false));
  }

  isAdmin(): Observable<boolean> {
    return this.currentUserRole$.pipe(map(role => role ? ['super_admin','admin','manager'].includes(role.id) : false));
  }

  isSuperAdmin(): Observable<boolean> { return this.hasRole('super_admin'); }
  isVendor(): Observable<boolean> { return this.hasRole('vendor'); }
  isCustomer(): Observable<boolean> { return this.hasRole('customer'); }

  // Sync helpers
  hasPermissionSync(permission: string): boolean {
    const permissions = this.userPermissions$.value; return permissions.includes('*') ? true : permissions.includes(permission);
  }

  hasFeatureSync(feature: string): boolean {
    const role = this.currentUserRole$.value; const features = this.userFeatures$.value;
    if (!role) return false;
    const featureAccess = this.featureAccessControl.find((f: FeatureAccess) => f.feature === feature);
    if (!featureAccess || !featureAccess.enabled) return false;
    if (!featureAccess.roles.includes(role.id)) return false;
    if (featureAccess.permissions && featureAccess.permissions.length > 0) {
      const userPermissions = this.userPermissions$.value; if (userPermissions.includes('*')) return true;
      return featureAccess.permissions.some(p => userPermissions.includes(p));
    }
    return features.includes(feature);
  }

  hasRoleSync(roleName: string): boolean { const role = this.currentUserRole$.value; return role?.id === roleName.toLowerCase(); }

  // Role utils
  getAllRoles(): UserRole[] { return Object.values(this.roleDefinitions); }
  getRoleDefinition(roleName: string): UserRole | null { return this.roleDefinitions[roleName.toLowerCase()] || null; }
  getFeatureAccessControl(): FeatureAccess[] { return this.featureAccessControl; }

  // Debug
  getCurrentRoleSync(): UserRole | null { return this.currentUserRole$.value; }
  getUserPermissionsSync(): string[] { return this.userPermissions$.value; }
  getUserFeaturesSync(): string[] { return this.userFeatures$.value; }
}
