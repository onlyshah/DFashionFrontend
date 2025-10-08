import { Injectable } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class DashboardRbacService {
  getRoleForUser(user: any): string {
    if (!user) return '';
    if (user.role === 'admin') return 'admin';
    if (user.role === 'vendor') return 'vendor';
    if (user.isInfluencer) return 'influencer';
    return 'user';
  }
}
