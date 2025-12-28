import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AdminAuthService } from '../services/admin-auth.service';
import { AuthService } from '../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthGuard implements CanActivate, CanActivateChild {

  constructor(
    private adminAuthService: AdminAuthService,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuth(route, state);
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuth(route, state);
  }

  private checkAuth(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    console.log('AdminAuthGuard.checkAuth - Checking route:', state.url);
    console.log('AdminAuthGuard.checkAuth - isAuthenticated:', this.authService.isAuthenticated);
    console.log('AdminAuthGuard.checkAuth - isAdmin():', this.authService.isAdmin());
    console.log('AdminAuthGuard.checkAuth - currentUser:', this.authService.currentUser);

    // Simple and direct approach: Check if user is super admin through regular auth
    if (this.authService.isAuthenticated && this.authService.isAdmin()) {
      console.log('AdminAuthGuard.checkAuth - Super admin access granted via regular auth');
      return of(true);
    }

    // Check admin-specific authentication
    if (this.adminAuthService.isAuthenticated()) {
      console.log('AdminAuthGuard.checkAuth - Admin access granted via admin auth');

      // Check if user can access admin panel
      if (!this.adminAuthService.canAccessAdmin()) {
        console.log('AdminAuthGuard.checkAuth - Cannot access admin, redirecting to admin login');
        this.router.navigate(['/admin/login']);
        return of(false);
      }

      // Check specific permission if required
      const requiredPermission = route.data?.['permission'];
      if (requiredPermission) {
        const [module, action] = requiredPermission.split(':');
        if (!this.adminAuthService.hasPermission(module, action)) {
          console.log('AdminAuthGuard.checkAuth - Insufficient permissions:', requiredPermission);
          this.router.navigate(['/admin/dashboard'], {
            queryParams: { error: 'insufficient_permissions' }
          });
          return of(false);
        }
      }

      return of(true);
    }

    // No valid authentication found
    console.log('AdminAuthGuard.checkAuth - No valid authentication, redirecting to admin login');
    this.router.navigate(['/admin/login'], {
      queryParams: { returnUrl: state.url }
    });
    return of(false);
  }
}
