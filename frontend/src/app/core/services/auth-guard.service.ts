import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      map(isAuth => {
        if (isAuth) {
          return true;
        } else {
          // Don't redirect automatically, just return false
          console.log('🔐 User not authenticated, access denied');
          return false;
        }
      }),
      catchError(() => {
        console.log('🔐 Authentication check failed');
        return of(false);
      })
    );
  }

  canActivateAdmin(): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      map(isAuth => {
        if (!isAuth) {
          console.log('🔐 User not authenticated for admin access');
          return false;
        }

        const user = this.authService.currentUserValue;
        const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
        
        if (!isAdmin) {
          console.log('🔐 User not authorized for admin access');
          return false;
        }

        return true;
      }),
      catchError(() => {
        console.log('🔐 Admin authentication check failed');
        return of(false);
      })
    );
  }

  requireAuth(action: string = 'access this feature'): boolean {
    if (!this.authService.isAuthenticated) {
      console.log(`🔐 Authentication required to ${action}`);
      return false;
    }
    return true;
  }

  requireAdminAuth(action: string = 'access admin features'): boolean {
    if (!this.authService.isAuthenticated) {
      console.log(`🔐 Authentication required to ${action}`);
      return false;
    }

    const user = this.authService.currentUserValue;
    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
    
    if (!isAdmin) {
      console.log(`🔐 Admin privileges required to ${action}`);
      return false;
    }

    return true;
  }

  // Safe method to check authentication without triggering API calls
  isAuthenticatedSync(): boolean {
    const token = localStorage.getItem('token');
    return !!token && this.authService.isAuthenticated;
  }

  // Safe method to get current user without triggering API calls
  getCurrentUserSync(): any {
    return this.authService.currentUserValue;
  }
}
