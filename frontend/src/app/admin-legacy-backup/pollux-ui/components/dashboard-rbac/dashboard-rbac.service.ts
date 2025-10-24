import { Injectable } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class DashboardRbacService {
  getRoleForUser(user: any): string {
    // If no user is provided, treat as regular end-user to show user dashboard by default
    if (!user) return 'user';
    if (user.role === 'admin') return 'admin';
    if (user.role === 'vendor') return 'vendor';
    if (user.isInfluencer) return 'influencer';
    return 'user';
  }
}
