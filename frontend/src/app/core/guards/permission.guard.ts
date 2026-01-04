import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, take } from 'rxjs/operators';

import { RBACService } from '../services/rbac.service';
import { AuthService } from '../../auth/services/auth.service';

export interface PermissionConfig {
  permissions?: string[];
  requireAll?: boolean; // If true, user must have ALL permissions; if false, ANY permission
}

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate, CanActivateChild {

  constructor(
    private rbacService: RBACService,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.checkPermissions(route, state);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.checkPermissions(childRoute, state);
  }

  private checkPermissions(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    // Check if user is authenticated
    if (!this.authService.isLoggedIn()) {
      return of(this.router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      }));
    }

    // Get permission configuration from route data
    const permissionConfig: PermissionConfig = route.data['permissions'] || {};

    // If no permissions configured, allow access
    if (!permissionConfig.permissions || permissionConfig.permissions.length === 0) {
      return of(true);
    }

    // Check user permissions
    return this.rbacService.getUserPermissions().pipe(
      take(1),
      map(userPermissions => {
        return this.hasPermissions(userPermissions, permissionConfig);
      }),
      catchError(error => {
        console.error('Permission check error:', error);
        return of(false);
      })
    );
  }

  private hasPermissions(
    userPermissions: string[],
    config: PermissionConfig
  ): boolean | UrlTree {
    if (!config.permissions || config.permissions.length === 0) {
      return true;
    }

    // Check if user has wildcard permission
    if (userPermissions.includes('*')) {
      return true;
    }

    // Check required permissions
    const requireAll = config.requireAll !== false;
    
    if (requireAll) {
      // User must have ALL permissions
      return config.permissions.every(permission =>
        userPermissions.includes(permission)
      );
    } else {
      // User must have ANY permission
      return config.permissions.some(permission =>
        userPermissions.includes(permission)
      );
    }
  }
}
