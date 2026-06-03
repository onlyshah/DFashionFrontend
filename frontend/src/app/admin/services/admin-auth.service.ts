import { Injectable } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

/**
 * @deprecated Use AuthService instead
 * Backward compatibility wrapper only
 */
@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  get currentUser$() {
    return this.authService.currentUser$;
  }

  get token$() {
    return this.authService.isAuthenticated$;
  }

  get isAuthenticated() {
    return this.authService.isAuthenticated;
  }

  constructor(private authService: AuthService) {}

  login(email: string, password: string, rememberMe: boolean = false): any {
    return this.authService.login({ email, password }, rememberMe);
  }

  logout(): void {
    return this.authService.logout();
  }

  getCurrentUser(): any {
    return this.authService.currentUser;
  }

  getToken(): string | null {
    return this.authService.getToken();
  }

  hasRole(role: string | string[]): boolean {
    if (Array.isArray(role)) {
      return role.some(r => this.authService.hasRole(r));
    }
    return this.authService.hasRole(role);
  }

  canAccessAdmin(): boolean {
    // Stub implementation - always return true for backward compatibility
    return true;
  }

  hasPermission(module: string, action: string): boolean {
    // Stub implementation - always return true for backward compatibility
    return true;
  }
}
