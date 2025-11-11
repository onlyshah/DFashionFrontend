import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  department: string;
  employeeId: string;
  permissions: Permission[];
  avatar?: string;
  lastLogin?: string;
}

export interface Permission {
  module: string;
  actions: string[];
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: AdminUser;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private apiUrl = `${environment.apiUrl}/api`;
  private currentUserSubject = new BehaviorSubject<AdminUser | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {
    // Check for existing token on service initialization
    const token = localStorage.getItem('admin_token');
    const user = localStorage.getItem('admin_user');
    
    if (token && user) {
      this.tokenSubject.next(token);
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  // Admin Login
  login(email: string, password: string): Observable<LoginResponse> {
    const loginData = { email, password };
    console.log('Attempting login with:', { email });
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/admin/login`, loginData, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(
      tap(response => {
        if (response.success) {
          localStorage.setItem('admin_token', response.data.token);
          localStorage.setItem('admin_user', JSON.stringify(response.data.user));
          this.tokenSubject.next(response.data.token);
          this.currentUserSubject.next(response.data.user);
        }
      }),
      catchError((error: any) => throwError(() => error))
    );
  }

  // Vendor Login
  loginVendor(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/vendor/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        if (response.success) {
          localStorage.setItem('vendor_token', response.data.token);
          localStorage.setItem('vendor_user', JSON.stringify(response.data.user));
          this.tokenSubject.next(response.data.token);
          this.currentUserSubject.next(response.data.user);
        }
      }),
      catchError((error: any) => throwError(() => error))
    );
  }

  // Customer Login
  loginCustomer(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/customer/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        if (response.success) {
          localStorage.setItem('customer_token', response.data.token);
          localStorage.setItem('customer_user', JSON.stringify(response.data.user));
          this.tokenSubject.next(response.data.token);
          this.currentUserSubject.next(response.data.user);
        }
      }),
      catchError((error: any) => throwError(() => error))
    );
  }

  // Influencer Login
  loginInfluencer(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/influencer/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        if (response.success) {
          localStorage.setItem('influencer_token', response.data.token);
          localStorage.setItem('influencer_user', JSON.stringify(response.data.user));
          this.tokenSubject.next(response.data.token);
          this.currentUserSubject.next(response.data.user);
        }
      }),
      catchError((error: any) => throwError(() => error))
    );
  }
// ...existing code...

  // Logout
  logout(): void {
    // Clear local storage
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    
    // Clear subjects
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
    
    // Redirect to login
    this.router.navigate(['/admin/login']);
  }

  // Get current user
  getCurrentUser(): AdminUser | null {
    // First check admin-specific user
    const adminUser = this.currentUserSubject.value;
    if (adminUser) {
      return adminUser;
    }

    // Also check regular auth service for super admin users
    if (this.authService.isAuthenticated) {
      const regularUser = this.authService.currentUserValue;
      if (regularUser && (regularUser.role === 'admin' || regularUser.role === 'super_admin')) {
        // Convert regular user to admin user format
        return {
          id: regularUser._id,
          email: regularUser.email,
          fullName: regularUser.username || regularUser.email,
          role: regularUser.role,
          department: 'Administration',
          employeeId: regularUser._id,
          permissions: [], // Super admin has all permissions
          avatar: regularUser.avatar
        };
      }
    }

    return null;
  }

  // Get current token
  getToken(): string | null {
    return this.tokenSubject.value;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    // First check admin-specific authentication
    const adminToken = this.getToken();
    const adminUser = this.getCurrentUser();

    if (adminToken && adminUser) {
      return true;
    }

    // Also check regular auth service for super admin users
    if (this.authService.isAuthenticated) {
      const regularUser = this.authService.currentUserValue;

      if (regularUser && (regularUser.role === 'admin' || regularUser.role === 'super_admin')) {
        return true;
      }
    }

    return false;
  }

  // Check if user has specific permission
  public hasPermission(module: string, action: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    return user.permissions?.some(permission => 
      permission.module === module && permission.actions.includes(action)
    ) || false;
  }

  // Check if user has any of the specified roles
  public hasRole(roles: string | string[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.includes(user.role);
  }

  // Verify token with server
  public verifyToken(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => 'No token found');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/auth/verify`, { headers }).pipe(
      tap(response => {
        if (response && (response as any).data?.user) {
          this.currentUserSubject.next((response as any).data.user);
        }
      }),
      catchError((error: any) => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  // Get authorization headers
  public getAuthHeaders(): HttpHeaders {
    let token = this.getToken();
    if (!token && this.authService.isAuthenticated) {
      const regularUser = this.authService.currentUserValue;
      if (regularUser && (regularUser.role === 'admin' || regularUser.role === 'super_admin')) {
        token = localStorage.getItem('token') || sessionStorage.getItem('token');
      }
    }
    if (!token) {
      return new HttpHeaders();
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Refresh user data
  public refreshUserData(): Observable<AdminUser> {
    return this.verifyToken().pipe(
      map((response: any) => response.data.user)
    );
  }

  // Update user profile
  public updateProfile(profileData: Partial<AdminUser>): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${this.apiUrl}/admin/profile`, profileData, { headers }).pipe(
      tap(response => {
        if (response && (response as any).success) {
          const currentUser = this.getCurrentUser();
          if (currentUser) {
            const updatedUser = { ...currentUser, ...profileData };
            this.currentUserSubject.next(updatedUser);
            localStorage.setItem('admin_user', JSON.stringify(updatedUser));
          }
        }
      })
    );
  }

  // Change password
  public changePassword(currentPassword: string, newPassword: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/admin/change-password`, {
      currentPassword,
      newPassword
    }, { headers });
  }

  // Get user permissions for display
  public getUserPermissions(): Permission[] {
    const user = this.getCurrentUser();
    return user?.permissions || [];
  }

  // Check if user can access admin panel
  public canAccessAdmin(): boolean {
    const adminRoles = [
      'super_admin', 'admin', 'sales_manager', 'marketing_manager',
      'account_manager', 'support_manager', 'sales_executive',
      'marketing_executive', 'account_executive', 'support_executive'
    ];
    if (this.hasRole(adminRoles)) {
      return true;
    }
    if (this.authService.isAuthenticated) {
      const regularUser = this.authService.currentUserValue;
      if (regularUser && (regularUser.role === 'admin' || regularUser.role === 'super_admin')) {
        return true;
      }
    }
    return false;
  }

  // Get user's department
  public getUserDepartment(): string {
    const user = this.getCurrentUser();
    return user?.department || '';
  }

  // Get user's role display name
  public getRoleDisplayName(): string {
    const user = this.getCurrentUser();
    if (!user) return '';
    const roleNames: { [key: string]: string } = {
      'super_admin': 'Super Administrator',
      'admin': 'Administrator',
      'sales_manager': 'Sales Manager',
      'marketing_manager': 'Marketing Manager',
      'account_manager': 'Account Manager',
      'support_manager': 'Support Manager',
      'sales_executive': 'Sales Executive',
      'marketing_executive': 'Marketing Executive',
      'account_executive': 'Account Executive',
      'support_executive': 'Support Executive'
    };
    return roleNames[user.role] || user.role;
  }

  // Auto-logout on token expiration
  private setupTokenExpiration(): void {
    setTimeout(() => {
      this.logout();
    }, 8 * 60 * 60 * 1000); // 8 hours
  }
}
