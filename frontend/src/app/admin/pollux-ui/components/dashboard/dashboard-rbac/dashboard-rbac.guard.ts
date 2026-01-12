import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { DashboardRbacService } from './dashboard-rbac.service';
@Injectable({ providedIn: 'root' })
export class DashboardRbacGuard implements CanActivate {
  constructor(private rbacService: DashboardRbacService, private router: Router) {}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = { role: 'admin', isInfluencer: false }; // Replace with real user
    const role = this.rbacService.getRoleForUser(user);
    if (!role) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
