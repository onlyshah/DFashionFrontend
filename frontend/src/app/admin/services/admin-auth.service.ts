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
  private rememberMe = false; // Track "Remember Me" preference

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {
    // Initialize from session/local storage
    this.initializeAuth();
  }

  /**
   * Initialize authentication state from storage
   * Check both sessionStorage (session-based) and localStorage (persistent)
   */
  private initializeAuth(): void {
    // Check for all login types in both storage methods
    const storageOptions = [
      { key: 'admin_token', userKey: 'admin_user' },
      { key: 'vendor_token', userKey: 'vendor_user' },
      { key: 'customer_token', userKey: 'customer_user' },
      { key: 'influencer_token', userKey: 'influencer_user' }
    ];

    for (const option of storageOptions) {
      // Check sessionStorage first (session-based)
      let token = sessionStorage.getItem(option.key);
      let user = sessionStorage.getItem(option.userKey);

      // Fall back to localStorage (persistent)
      if (!token) {
        token = localStorage.getItem(option.key);
      }
      if (!user) {
        user = localStorage.getItem(option.userKey);
      }

      if (token && user) {
        this.tokenSubject.next(token);
        this.currentUserSubject.next(JSON.parse(user));
        return; // Found a valid session
      }
    }
  }

  /**
   * Store token and user data with optional persistence
   */
  private storeAuth(tokenKey: string, userKey: string, token: string, user: AdminUser, rememberMe: boolean = false): void {
    if (rememberMe) {
      // Persistent storage (Remember Me is checked)
      localStorage.setItem(tokenKey, token);
      localStorage.setItem(userKey, JSON.stringify(user));
      sessionStorage.removeItem(tokenKey);
      sessionStorage.removeItem(userKey);
    } else {
      // Session-based storage (Remember Me is unchecked)
      sessionStorage.setItem(tokenKey, token);
      sessionStorage.setItem(userKey, JSON.stringify(user));
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(userKey);
    }

    this.tokenSubject.next(token);
    this.currentUserSubject.next(user);
  }

  /**
   * Clear all authentication data
   */
  private clearAllAuth(): void {
    // Clear all possible storage keys
    const keys = [
      'admin_token', 'admin_user',
      'vendor_token', 'vendor_user',
      'customer_token', 'customer_user',
      'influencer_token', 'influencer_user'
    ];

    keys.forEach(key => {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    });

    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
  }

  // Admin Login
  login(email: string, password: string, rememberMe: boolean = false): Observable<LoginResponse> {
    const loginData = { email, password };
    console.log('🔐 Attempting admin login:', { email, rememberMe });
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/admin/login`, loginData, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(
      tap(response => {
        if (response.success) {
          this.storeAuth('admin_token', 'admin_user', response.data.token, response.data.user, rememberMe);
          console.log('✅ Admin login successful, stored in', rememberMe ? 'localStorage' : 'sessionStorage');
        }
      }),
      catchError((error: any) => {
        console.error('❌ Admin login failed:', error);
        return throwError(() => error);
      })
    );
  }

  // Vendor Login
  loginVendor(email: string, password: string, rememberMe: boolean = false): Observable<LoginResponse> {
    console.log('🔐 Attempting vendor login:', { email, rememberMe });
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/vendor/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        if (response.success) {
          this.storeAuth('vendor_token', 'vendor_user', response.data.token, response.data.user, rememberMe);
          console.log('✅ Vendor login successful, stored in', rememberMe ? 'localStorage' : 'sessionStorage');
        }
      }),
      catchError((error: any) => {
        console.error('❌ Vendor login failed:', error);
        return throwError(() => error);
      })
    );
  }

  // Customer Login
  loginCustomer(email: string, password: string, rememberMe: boolean = false): Observable<LoginResponse> {
    console.log('🔐 Attempting customer login:', { email, rememberMe });
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/customer/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        if (response.success) {
          this.storeAuth('customer_token', 'customer_user', response.data.token, response.data.user, rememberMe);
          console.log('✅ Customer login successful, stored in', rememberMe ? 'localStorage' : 'sessionStorage');
        }
      }),
      catchError((error: any) => {
        console.error('❌ Customer login failed:', error);
        return throwError(() => error);
      })
    );
  }

  // Influencer Login
  loginInfluencer(email: string, password: string, rememberMe: boolean = false): Observable<LoginResponse> {
    console.log('🔐 Attempting influencer login:', { email, rememberMe });
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/influencer/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        if (response.success) {
          this.storeAuth('influencer_token', 'influencer_user', response.data.token, response.data.user, rememberMe);
          console.log('✅ Influencer login successful, stored in', rememberMe ? 'localStorage' : 'sessionStorage');
        }
      }),
      catchError((error: any) => {
        console.error('❌ Influencer login failed:', error);
        return throwError(() => error);
      })
    );
  }

  // Logout
  logout(): void {
    console.log('🚪 Logging out user');
    this.clearAllAuth();
    
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
