import { Injectable } from '@angular/core';
import { canAccessDashboard } from './dashboard-rbac.utils';

@Injectable({ providedIn: 'root' })
export class DashboardRbacActions {
  getDashboardForRole(role: string): string {
    switch (role) {
      case 'admin':
        return 'dashboard-admin';
      case 'vendor':
        return 'dashboard-vendor';
      case 'user':
        return 'dashboard-user';
      case 'influencer':
        return 'dashboard-influencer';
      default:
        // Fallback to user dashboard so there's always a usable dashboard
        return 'dashboard-user';
    }
  }

  canAccess(role: string, requiredRole: string): boolean {
    return canAccessDashboard(role, requiredRole);
  }
}
