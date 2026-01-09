import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { RolePermissionsService } from '../services/role-permissions.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private rolePermissionsService: RolePermissionsService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    return this.authService.currentUser$.pipe(
      take(1),
      map((user: User | null) => {
        // Check if user is authenticated
        if (!user) {
          this.router.navigate(['/admin/login']);
          return false;
        }

        // Super Admin can access everything
        if (user.role === 'super_admin') {
          return true;
        }

        // Get the module requirement from route data
        const requiredModule = route.data?.['module'] || this.extractModuleFromUrl(state.url);
        const requiredAction = route.data?.['action'] || 'view';

        if (!requiredModule) {
          return true; // No specific module requirement
        }

        // Check if user has the required permission for this module
        const hasPermission = this.rolePermissionsService.hasModulePermission(
          user.role || '',
          requiredModule,
          requiredAction as any
        );

        if (!hasPermission) {
          this.showAccessDeniedMessage(`You do not have ${requiredAction} permission for this module.`);
          this.router.navigate(['/admin/dashboard']);
          return false;
        }

        return true;
      })
    );
  }

  private extractModuleFromUrl(url: string): string {
    // Extract module from URL: /admin/products -> products
    const match = url.match(/\/admin\/([a-z-]+)/);
    return match ? match[1] : '';
  }

  private showAccessDeniedMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
}
