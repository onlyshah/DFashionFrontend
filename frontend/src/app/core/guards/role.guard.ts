import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, take } from 'rxjs/operators';

import { RBACService } from '../services/rbac.service';
import { AuthService } from '../services/auth.service';
import { AdminAuthService } from '../../admin/services/admin-auth.service';

export interface RouteRoleConfig {
  roles?: string[];
  permissions?: string[];
  features?: string[];
  requireAll?: boolean;
  redirectTo?: string;
  minRoleLevel?: number;
}

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate, CanActivateChild {

  constructor(
    private rbacService: RBACService,
    private authService: AuthService,
    private adminAuthService: AdminAuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkAccess(route, state);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkAccess(childRoute, state);
  }

  private checkAccess(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // Check if user is authenticated first
    const isAdminRoute = state.url.startsWith('/admin');
    const authCheck = isAdminRoute 
      ? this.adminAuthService.isAuthenticated()
      : this.authService.isAuthenticated();

    return authCheck.pipe(
      take(1),
      map(isAuthenticated => {
        if (!isAuthenticated) {
          this.redirectToLogin(isAdminRoute);
          return false;
        }

        // Get role configuration from route data
        const roleConfig: RouteRoleConfig = route.data['roles'] || {};
        
        // If no role configuration, allow access
        if (!this.hasRoleConfig(roleConfig)) {
          return true;
        }

        // Check role-based access
        return this.checkRoleAccess(roleConfig, state.url);
      }),
      catchError(error => {
        console.error('Role guard error:', error);
        this.redirectToLogin(isAdminRoute);
        return of(false);
      })
    );
  }

  private hasRoleConfig(config: RouteRoleConfig): boolean {
    return !!(
      config.roles?.length ||
      config.permissions?.length ||
      config.features?.length ||
      config.minRoleLevel !== undefined
    );
  }

  private checkRoleAccess(config: RouteRoleConfig, url: string): boolean {
    let hasAccess = true;

    // Check minimum role level
    if (config.minRoleLevel !== undefined) {
      const currentRole = this.rbacService.getCurrentRoleSync();
      if (!currentRole || currentRole.level > config.minRoleLevel) {
        hasAccess = false;
      }
    }

    // Check specific roles
    if (config.roles?.length && hasAccess) {
      const currentRole = this.rbacService.getCurrentRoleSync();
      if (!currentRole || !config.roles.includes(currentRole.id)) {
        hasAccess = false;
      }
    }

    // Check permissions
    if (config.permissions?.length && hasAccess) {
      if (config.requireAll) {
        hasAccess = config.permissions.every(permission => 
          this.rbacService.hasPermissionSync(permission)
        );
      } else {
        hasAccess = config.permissions.some(permission => 
          this.rbacService.hasPermissionSync(permission)
        );
      }
    }

    // Check features
    if (config.features?.length && hasAccess) {
      if (config.requireAll) {
        hasAccess = config.features.every(feature => 
          this.rbacService.hasFeatureSync(feature)
        );
      } else {
        hasAccess = config.features.some(feature => 
          this.rbacService.hasFeatureSync(feature)
        );
      }
    }

    // Handle access denial
    if (!hasAccess) {
      this.handleAccessDenied(config, url);
    }

    return hasAccess;
  }

  private handleAccessDenied(config: RouteRoleConfig, url: string) {
    if (config.redirectTo) {
      this.router.navigate([config.redirectTo]);
    } else {
      // Default redirect based on user role
      const currentRole = this.rbacService.getCurrentRoleSync();
      
      if (currentRole) {
        switch (currentRole.id) {
          case 'super_admin':
          case 'admin':
          case 'manager':
            this.router.navigate(['/admin/dashboard']);
            break;
          case 'vendor':
            this.router.navigate(['/vendor/dashboard']);
            break;
          case 'customer':
            this.router.navigate(['/home']);
            break;
          default:
            this.router.navigate(['/unauthorized']);
        }
      } else {
        this.router.navigate(['/unauthorized']);
      }
    }
  }

  private redirectToLogin(isAdminRoute: boolean) {
    if (isAdminRoute) {
      this.router.navigate(['/admin/auth/login']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
}

// Helper function to create route data with role configuration
export function requireRoles(roles: string[], redirectTo?: string): RouteRoleConfig {
  return { roles, redirectTo };
}

export function requirePermissions(
  permissions: string[], 
  requireAll = false, 
  redirectTo?: string
): RouteRoleConfig {
  return { permissions, requireAll, redirectTo };
}

export function requireFeatures(
  features: string[], 
  requireAll = false, 
  redirectTo?: string
): RouteRoleConfig {
  return { features, requireAll, redirectTo };
}

export function requireMinRoleLevel(
  minRoleLevel: number, 
  redirectTo?: string
): RouteRoleConfig {
  return { minRoleLevel, redirectTo };
}

export function requireSuperAdmin(redirectTo?: string): RouteRoleConfig {
  return { roles: ['super_admin'], redirectTo };
}

export function requireAdmin(redirectTo?: string): RouteRoleConfig {
  return { roles: ['super_admin', 'admin', 'manager'], redirectTo };
}

export function requireVendor(redirectTo?: string): RouteRoleConfig {
  return { roles: ['vendor'], redirectTo };
}

export function requireCustomer(redirectTo?: string): RouteRoleConfig {
  return { roles: ['customer'], redirectTo };
}

// Advanced role configurations
export function requireAdminOrVendor(redirectTo?: string): RouteRoleConfig {
  return { roles: ['super_admin', 'admin', 'manager', 'vendor'], redirectTo };
}

export function requireUserManagement(redirectTo?: string): RouteRoleConfig {
  return { 
    permissions: ['users:view'], 
    features: ['user-management'], 
    redirectTo 
  };
}

export function requireProductManagement(redirectTo?: string): RouteRoleConfig {
  return { 
    permissions: ['products:view'], 
    features: ['product-management'], 
    redirectTo 
  };
}

export function requireSystemAccess(redirectTo?: string): RouteRoleConfig {
  return { 
    permissions: ['system:monitor'], 
    features: ['system-monitoring'], 
    redirectTo 
  };
}
