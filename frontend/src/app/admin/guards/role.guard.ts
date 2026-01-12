import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AdminAuthService } from '../services/admin-auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private adminAuthService: AdminAuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    const requiredRoles = route.data['roles'] as string[] | string;
    const user = this.adminAuthService.getCurrentUser();

    if (!user) {
      this.router.navigate(['/admin/login']);
      return false;
    }

    // Convert single role to array for uniform handling
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    // Super admin has access to everything
    if (user.role === 'super_admin') {
      return true;
    }

    // Check if user has any of the required roles
    if (this.adminAuthService.hasRole(roles)) {
      return true;
    }

    console.warn(`RoleGuard: User role "${user.role}" not in allowed roles:`, roles);
    this.router.navigate(['/admin/dashboard']);
    return false;
  }
}
