import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Permission {
  id?: string;
  name?: string;
  module?: string;
  action?: string;
  actions?: string[];
}

export interface AdminUser {
  id?: string;
  name?: string;
  role?: string;
  permissions?: (string | Permission)[];
}

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  currentUser$ = new BehaviorSubject<AdminUser | null>(null);

  isLoggedIn(): boolean {
    return !!this.currentUser$.value;
  }
}
