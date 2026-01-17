import { Injectable, Inject, forwardRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError, of, map, timer, interval } from 'rxjs';
import { Router } from '@angular/router';
import { switchMap, takeUntil } from 'rxjs/operators';

import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { ValidationService } from './validation.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private tokenExpirationTimer: any;
  private sessionTimeoutTimer: any;
  private refreshTokenTimer: any;
  private loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public isSuperAdmin$ = this.currentUser$.pipe(map(user => user?.role === 'super_admin'));
  public userRole$ = this.currentUser$.pipe(map(user => user?.role));

  // Synchronous access to current user for guards and components
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  constructor(
    private http: HttpClient,
    private router: Router,
    private validationService: ValidationService
  ) {
    this.initializeAuth();
    this.setupSessionTimeout();
  }

  initializeAuth(): void {
    const token = this.getToken();
    if (token) {
      this.getCurrentUser().subscribe({
        next: (response) => {
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
        },
        error: () => {
          // Clear invalid token without redirecting
          this.clearAuth();
        }
      });
    }
  }

  login(credentials: LoginRequest): Observable<any> {
    // Validate credentials
    if (!this.validateCredentials(credentials)) {
      return throwError(() => new Error('Invalid credentials format'));
    }

    // Check for account lockout
    if (this.isAccountLocked(credentials.email)) {
      return throwError(() => new Error('Account temporarily locked due to multiple failed attempts'));
    }

    // Sanitize input
    const sanitizedCredentials = {
      email: this.validationService.sanitizeInput(credentials.email),
      password: credentials.password // Don't sanitize password as it might contain special chars
    };

    console.log('🔐 AuthService.login() called');
    console.log('🌐 API_URL:', this.API_URL);

    return this.loginWithRetry(sanitizedCredentials, this.API_URL).pipe(
      tap(response => {
        if (response.success) {
          this.clearLoginAttempts(credentials.email);
          this.handleSuccessfulLogin(response);
        }
      }),
      catchError(error => {
        this.recordFailedLogin(credentials.email);
        return throwError(() => error);
      })
    );
  }

  private loginWithRetry(credentials: LoginRequest, apiUrl: string): Observable<any> {
    return this.http.post<any>(`${apiUrl}/api/auth/login`, credentials)
      .pipe(
        tap(response => {
          console.log('✅ Login response received:', response);
          // Handle backend response format: { success: true, data: { token, user } }
          const authData = response.data || response;
          this.setToken(authData.token);
          this.currentUserSubject.next(authData.user);
          this.isAuthenticatedSubject.next(true);

          // Trigger cart and wishlist refresh after successful login
          this.refreshUserDataOnLogin();
        }),
        catchError(error => {
          console.error('❌ Login error:', error);
          console.error('❌ Error details:', JSON.stringify(error, null, 2));

          // No demo mode - use real authentication only

          // For mobile apps, try alternative URLs if available
          if (this.isMobileApp()) {
            console.log('📱 Mobile app detected, using direct IP');
            // Already using direct IP, no fallback needed
          }

          return throwError(() => error);
        })
      );
  }

  private tryFallbackUrls(credentials: LoginRequest, fallbackUrls: string[]): Observable<any> {
    if (fallbackUrls.length === 0) {
      return throwError(() => new Error('All API URLs failed'));
    }

    const [firstUrl, ...remainingUrls] = fallbackUrls;
    console.log('🔄 Trying fallback URL:', firstUrl);

    return this.http.post<any>(`${firstUrl}/api/auth/login`, credentials)
      .pipe(
        tap(response => {
          console.log('✅ Login successful with fallback URL:', firstUrl);
          const authData = response.data || response;
          this.setToken(authData.token);
          this.currentUserSubject.next(authData.user);
          this.isAuthenticatedSubject.next(true);
          this.refreshUserDataOnLogin();
        }),
        catchError(error => {
          console.error('❌ Fallback URL failed:', firstUrl, error);
          if (remainingUrls.length > 0) {
            return this.tryFallbackUrls(credentials, remainingUrls);
          }
          return throwError(() => error);
        })
      );
  }

  private isMobileApp(): boolean {
    return window.location.protocol === 'capacitor:' ||
           window.location.protocol === 'ionic:' ||
           (window as any).Capacitor !== undefined;
  }
  // Demo mode removed - use real authentication only





  register(userData: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/api/auth/register`, userData)
      .pipe(
        tap(response => {
          // Handle backend response format: { success: true, data: { token, user } }
          const authData = response.data || response;
          this.setToken(authData.token);
          this.currentUserSubject.next(authData.user);
          this.isAuthenticatedSubject.next(true);
        })
      );
  }



  logout(): void {
    this.clearAuth();
    this.router.navigate(['/auth/login']);
  }

  private clearAuth(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);

    // Clear cart and wishlist data on logout
    this.clearUserDataOnLogout();
  }

  // Method to refresh user data (cart, wishlist) after login
  private refreshUserDataOnLogin(): void {
    // Use setTimeout to avoid circular dependency issues
    setTimeout(() => {
      try {
        // Import services dynamically to avoid circular dependency
        import('./cart.service').then(({ CartService }) => {
          const cartService = new CartService(this.http, null as any, null as any);
          cartService.loadCartCountOnLogin();
        });

        import('./wishlist.service').then(({ WishlistService }) => {
          const wishlistService = new WishlistService(this.http);
          wishlistService.syncWithServer().subscribe();
        });
      } catch (error) {
        console.error('Error refreshing user data on login:', error);
      }
    }, 100);
  }

  // Method to clear user data on logout
  private clearUserDataOnLogout(): void {
    setTimeout(() => {
      try {
        // Import services dynamically to avoid circular dependency
        import('./cart.service').then(({ CartService }) => {
          const cartService = new CartService(this.http, null as any, null as any);
          cartService.clearCartData();
        });

        import('./wishlist.service').then(({ WishlistService }) => {
          const wishlistService = new WishlistService(this.http);
          wishlistService.clearWishlist().subscribe({
            next: () => console.log('✅ Wishlist cleared on logout'),
            error: (error) => console.warn('⚠️ Could not clear wishlist on logout:', error)
          });
        });
      } catch (error) {
        console.error('Error clearing user data on logout:', error);
      }
    }, 100);
  }

  getCurrentUser(): Observable<{ user: User }> {
    return this.http.get<any>(`${this.API_URL}/api/auth/me`).pipe(
      map(response => {
        // Handle backend response format: { success: true, data: { user } }
        return response.data || response;
      })
    );
  }

  private rememberMe: boolean = false;

  setRememberMe(remember: boolean) {
    this.rememberMe = remember;
  }

  getToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  private setToken(token: string): void {
    if (!token) {
      console.warn('⚠️ setToken called with empty/null token!');
      return;
    }
    
    if (this.rememberMe) {
      localStorage.setItem('token', token);
      sessionStorage.removeItem('token');
      console.log('✅ Token stored in localStorage (Remember Me enabled)');
    } else {
      sessionStorage.setItem('token', token);
      localStorage.removeItem('token');
      console.log('✅ Token stored in sessionStorage');
    }
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Enhanced role checking methods for unified login system
   */
  isAdmin(): boolean {
    const user = this.currentUserValue;
    const role = user?.role?.toLowerCase();
    return ['admin', 'super_admin', 'manager'].includes(role || '');
  }

  isSuperAdmin(): boolean {
    const user = this.currentUserValue;
    return user?.role?.toLowerCase() === 'super_admin';
  }

  isManager(): boolean {
    const user = this.currentUserValue;
    return user?.role?.toLowerCase() === 'manager';
  }

  isVendor(): boolean {
    const user = this.currentUserValue;
    return user?.role?.toLowerCase() === 'vendor';
  }

  isCustomer(): boolean {
    const user = this.currentUserValue;
    const role = user?.role?.toLowerCase();
    return ['customer', 'user', 'end_user'].includes(role || '');
  }

  /**
   * Get current user's role
   */
  getCurrentUserRole(): string | null {
    return this.currentUserValue?.role || null;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const userRole = this.getCurrentUserRole();
    return userRole?.toLowerCase() === role.toLowerCase();
  }

  /**
   * Get user's role level for hierarchy comparison
   */
  getUserRoleLevel(): number {
    const role = this.getCurrentUserRole()?.toLowerCase();
    const roleLevels: { [key: string]: number } = {
      'super_admin': 1,
      'admin': 2,
      'manager': 2,
      'vendor': 3,
      'customer': 4,
      'user': 4,
      'end_user': 4
    };
    return roleLevels[role || ''] || 5;
  }

  // Helper methods for checking authentication before actions
  requireAuth(action: string = 'perform this action'): boolean {
    if (!this.isAuthenticated) {
      this.showLoginPrompt(action);
      return false;
    }
    return true;
  }

  requireSuperAdminAuth(action: string = 'perform this action'): boolean {
    if (!this.isAuthenticated) {
      this.showLoginPrompt(action);
      return false;
    }

    if (!this.isAdmin()) {
      this.showRoleError('super admin', action);
      return false;
    }

    return true;
  }

  requireCustomerAuth(action: string = 'perform this action'): boolean {
    if (!this.isAuthenticated) {
      this.showLoginPrompt(action);
      return false;
    }

    if (!this.isCustomer()) {
      this.showRoleError('customer', action);
      return false;
    }

    return true;
  }

  private showLoginPrompt(action: string): void {
    // Silently handle login requirement - no popup
    console.log(`Login required to ${action}`);
    // Optionally redirect to login page without confirmation
    // this.router.navigate(['/auth/login'], {
    //   queryParams: { returnUrl: this.router.url }
    // });
  }

  private showRoleError(requiredRole: string, action: string): void {
    // Removed popup alert - silently handle role restrictions
    console.log(`Access denied: Only ${requiredRole}s can ${action}`);
  }

  // Social interaction methods with authentication checks
  canLike(): boolean {
    return this.requireCustomerAuth('like posts');
  }

  canComment(): boolean {
    return this.requireCustomerAuth('comment on posts');
  }

  canAddToCart(): boolean {
    return this.requireCustomerAuth('add items to cart');
  }

  canAddToWishlist(): boolean {
    return this.requireCustomerAuth('add items to wishlist');
  }

  canBuy(): boolean {
    return this.requireCustomerAuth('purchase items');
  }

  // Get auth headers for API calls
  getAuthHeaders(): { [key: string]: string } {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // Security Methods
  private validateCredentials(credentials: LoginRequest): boolean {
    if (!credentials.email || !credentials.password) {
      return false;
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(credentials.email)) {
      return false;
    }

    // Check password length
    if (credentials.password.length < 6 || credentials.password.length > 128) {
      return false;
    }

    return true;
  }

  private isAccountLocked(email: string): boolean {
    const attempts = this.loginAttempts.get(email);
    if (!attempts) return false;

    const now = Date.now();
    const timeSinceLastAttempt = now - attempts.lastAttempt;

    // Clear old attempts if lockout period has passed
    if (timeSinceLastAttempt > this.LOCKOUT_DURATION) {
      this.loginAttempts.delete(email);
      return false;
    }

    return attempts.count >= this.MAX_LOGIN_ATTEMPTS;
  }

  private recordFailedLogin(email: string): void {
    const now = Date.now();
    const attempts = this.loginAttempts.get(email) || { count: 0, lastAttempt: 0 };

    // Reset count if last attempt was more than lockout duration ago
    if (now - attempts.lastAttempt > this.LOCKOUT_DURATION) {
      attempts.count = 0;
    }

    attempts.count++;
    attempts.lastAttempt = now;
    this.loginAttempts.set(email, attempts);

    console.warn(`Failed login attempt ${attempts.count} for ${email}`);
  }

  private clearLoginAttempts(email: string): void {
    this.loginAttempts.delete(email);
  }

  private handleSuccessfulLogin(response: any): void {
    // Handle both response formats: { data: { token, user } } and { token, user }
    const authData = response.data || response;
    
    if (authData.token) {
      this.setToken(authData.token);
      this.setupTokenRefresh(authData.token);
      console.log('✅ Token stored successfully in handleSuccessfulLogin');
    }

    if (authData.user) {
      this.currentUserSubject.next(authData.user);
      this.isAuthenticatedSubject.next(true);
      console.log('✅ User subject updated:', {
        email: authData.user.email,
        role: authData.user.role,
        storage: this.rememberMe ? 'localStorage' : 'sessionStorage'
      });

      // Note: Redirect is now handled by the login component to ensure 
      // consistency with role-based routing. Do not redirect here.
    }

    this.resetSessionTimeout();
  }

  private redirectAfterLogin(user: any): void {
    // Note: This method is deprecated. Redirection is now handled by the login component.
    // Keeping for backward compatibility but disabled.
    return;
    /*
    // Clear any existing navigation to prevent overlapping
    setTimeout(() => {
      const role = user.role;

      switch (role) {
        case 'super_admin':
        case 'admin':
          this.router.navigate(['/dashboard'], { replaceUrl: true });
          break;
        case 'vendor':
          this.router.navigate(['/vendor/dashboard'], { replaceUrl: true });
          break;
        case 'end_user':
        case 'customer':
          this.router.navigate(['/home'], { replaceUrl: true });
          break;
        default:
          this.router.navigate(['/home'], { replaceUrl: true });
          break;
      }
    }, 100); // Small delay to ensure proper navigation
    */
  }

  // Token Management
  private setupTokenRefresh(token: string): void {
    this.clearTimers();

    // Decode token to get expiration
    const payload = this.decodeToken(token);
    if (payload && payload.exp) {
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const timeUntilExpiration = expirationTime - now;

      // Refresh token 5 minutes before expiration
      const refreshTime = Math.max(timeUntilExpiration - this.TOKEN_REFRESH_INTERVAL, 60000);

      this.refreshTokenTimer = setTimeout(() => {
        this.refreshToken().subscribe({
          next: (newToken) => {
            this.setToken(newToken);
            this.setupTokenRefresh(newToken);
          },
          error: () => {
            this.logout();
          }
        });
      }, refreshTime);
    }
  }

  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  private refreshToken(): Observable<string> {
    return this.http.post<{ token: string }>(`${this.API_URL}/api/auth/refresh`, {})
      .pipe(
        map(response => response.token),
        catchError(error => {
          console.error('Token refresh failed:', error);
          return throwError(() => error);
        })
      );
  }

  // Session Management
  private setupSessionTimeout(): void {
    this.resetSessionTimeout();

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, () => this.resetSessionTimeout(), true);
    });
  }

  private resetSessionTimeout(): void {
    if (this.sessionTimeoutTimer) {
      clearTimeout(this.sessionTimeoutTimer);
    }

    this.sessionTimeoutTimer = setTimeout(() => {
      this.handleSessionTimeout();
    }, this.SESSION_TIMEOUT);
  }

  private handleSessionTimeout(): void {
    console.warn('Session timeout - logging out user');
    this.logout();
    // Show session timeout message
    alert('Your session has expired. Please log in again.');
  }

  private clearTimers(): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    if (this.sessionTimeoutTimer) {
      clearTimeout(this.sessionTimeoutTimer);
    }
    if (this.refreshTokenTimer) {
      clearTimeout(this.refreshTokenTimer);
    }
  }
}
