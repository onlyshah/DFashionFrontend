import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthorizationService } from '../services/authorization.service';
import { UserRole } from '../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthorizationService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          this.router.navigate(['/auth/login'], {
            queryParams: { returnUrl: state.url }
          });
          return false;
        }

        // Check for required roles
        const requiredRoles = route.data['roles'] as UserRole[];
        if (requiredRoles && !this.authService.hasRole(requiredRoles)) {
          this.router.navigate(['/admin/unauthorized']);
          return false;
        }

        // Check for required permissions
        const requiredPermissions = route.data['permissions'] as string[];
        if (requiredPermissions && !this.authService.hasAllPermissions(requiredPermissions)) {
          this.router.navigate(['/admin/unauthorized']);
          return false;
        }

        // Check for required module access
        const requiredModule = route.data['module'] as string;
        if (requiredModule && !this.authService.canAccessModule(requiredModule)) {
          this.router.navigate(['/admin/unauthorized']);
          return false;
        }

        return true;
      })
    );
  }
}