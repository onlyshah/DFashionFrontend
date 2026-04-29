import { Injectable, Inject, forwardRef, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError, map } from 'rxjs';
import { Router } from '@angular/router';

import { User, LoginRequest, RegisterRequest } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { ValidationService } from './validation.service';
import { ProductStateService } from './product-state.service';

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
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly USER_STORAGE_KEY = 'currentUser';
  private sessionRestored = false;
  
  // ✅ Cache token in memory to survive navigation
  private cachedToken: string | null = null;
  private rememberMe = false;

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
    private validationService: ValidationService,
    private productStateService: ProductStateService,
    private injector: Injector
  ) {
    this.restoreSession();
    this.setupSessionTimeout();
  }

  restoreSession(): void {
    if (this.sessionRestored) {
      return;
    }
    this.sessionRestored = true;

    const accessToken = this.getToken();
    const refreshToken = this.getRefreshToken();

    if (accessToken && !this.isTokenExpired(accessToken)) {
      this.setUserFromToken(accessToken);
      this.isAuthenticatedSubject.next(true);
      this.setupTokenRefresh(accessToken);
      return;
    }

    if (refreshToken) {
      this.refreshAccessToken().subscribe({
        next: (newAccessToken) => {
          this.setUserFromToken(newAccessToken);
          this.isAuthenticatedSubject.next(true);
          this.setupTokenRefresh(newAccessToken);
        },
        error: () => {
          this.clearAuth();
        }
      });
      return;
    }

    if (accessToken) {
      this.clearAuth();
      return;
    }

    this.isAuthenticatedSubject.next(false);
  }

  login(credentials: LoginRequest, rememberMe: boolean = false): Observable<any> {
    this.rememberMe = rememberMe;

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
        console.log('📦 Response structure check:', {
          hasData: !!response.data,
          hasToken: !!(response.data?.accessToken || response.data?.token || response.accessToken || response.token),
          tokenValue: response.data?.accessToken || response.data?.token
            ? (response.data?.accessToken || response.data?.token).substring(0, 30) + '...'
            : 'MISSING',
          hasRefreshToken: !!(response.data?.refreshToken || response.refreshToken),
          hasUser: !!response.data?.user,
          rememberMe: this.rememberMe
        });

          // Handle backend response format: { success: true, data: { accessToken, refreshToken, user } }
          const authData = response.data || response;
          console.log('🔍 authData extraction:', {
            source: response.data ? 'response.data' : 'response root',
            tokenInAuthData: (authData.accessToken || authData.token) ? 'PRESENT' : 'MISSING',
            refreshTokenInAuthData: authData.refreshToken ? 'PRESENT' : 'MISSING',
            willCall: 'setToken()'
          });
          
          this.handleSuccessfulLogin(response);
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
          this.handleSuccessfulLogin(response);
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
          this.handleSuccessfulLogin(response);
        })
      );
  }



  logout(): void {
    this.clearAuth();
    this.router.navigate(['/auth/login']);
  }

  private clearAuth(): void {
    // ✅ Clear memory cache
    this.cachedToken = null;
    
    // Clear all token keys from storage
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_STORAGE_KEY);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(this.USER_STORAGE_KEY);
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('refresh_token');
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
          const cartService = this.injector.get(CartService);
          cartService.loadCartCountOnLogin();
          cartService.refreshCartOnLogin();
        });

        import('./wishlist.service').then(({ WishlistService }) => {
          const wishlistService = this.injector.get(WishlistService);
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
          const cartService = this.injector.get(CartService);
          cartService.clearCartData();
        });

        import('./wishlist.service').then(({ WishlistService }) => {
          const wishlistService = this.injector.get(WishlistService);
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

  setRememberMe(remember: boolean) {
    this.rememberMe = remember;
  }

  getToken(): string | null {
    // PRIORITY 1: Return cache if available (fastest)
    if (this.cachedToken && this.cachedToken.trim()) {
      console.log('✅ getToken: Returning from MEMORY CACHE (length: ' + this.cachedToken.length + ')');
      return this.cachedToken;
    }

    // PRIORITY 2: Check all storage locations
    const sessionToken = sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
    const localToken = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    const legacySessionAccessToken = sessionStorage.getItem('auth_token');
    const legacyLocalAccessToken = localStorage.getItem('auth_token');
    const legacySessionToken = sessionStorage.getItem('token');
    const legacyLocalToken = localStorage.getItem('token');
    const refreshAccessToken = localStorage.getItem('access_token');
    const adminSessionToken = sessionStorage.getItem('admin_token');
    const adminLocalToken = localStorage.getItem('admin_token');

    console.log('🔍 getToken: Storage check:', {
      sessionToken: sessionToken ? sessionToken.substring(0, 20) + '...' : null,
      localToken: localToken ? localToken.substring(0, 20) + '...' : null,
      legacySessionAccessToken: legacySessionAccessToken ? 'found' : null,
      legacyLocalAccessToken: legacyLocalAccessToken ? 'found' : null,
      legacySessionToken: legacySessionToken ? 'found' : null,
      legacyLocalToken: legacyLocalToken ? 'found' : null,
      refreshAccessToken: refreshAccessToken ? 'found' : null,
      adminSessionToken: adminSessionToken ? 'found' : null,
      adminLocalToken: adminLocalToken ? 'found' : null
    });

    const token = sessionToken || 
                  localToken ||
                  legacySessionAccessToken ||
                  legacyLocalAccessToken ||
                  legacySessionToken ||
                  legacyLocalToken ||
                  adminSessionToken ||
                  adminLocalToken;

    // If token found in storage, cache it for next time
    if (token && token.trim()) {
      console.log('✅ getToken: Found in storage, caching (length: ' + token.length + ')');
      this.cachedToken = token;
      return token;
    }

    console.log('❌ getToken: NO TOKEN FOUND ANYWHERE');
    return null;
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY) ||
      sessionStorage.getItem(this.REFRESH_TOKEN_KEY) ||
      localStorage.getItem('refresh_token') ||
      sessionStorage.getItem('refresh_token');
  }

  setUserFromToken(token: string): User | null {
    const decoded = this.decodeJWT<any>(token);

    if (!decoded) {
      return null;
    }

    const user: any = {
      id: decoded.userId,
      _id: decoded.userId,
      email: decoded.email,
      username: decoded.username || decoded.email?.split('@')?.[0] || 'user',
      fullName: decoded.fullName || decoded.username || decoded.email || 'User',
      avatar: decoded.avatar || null,
      role: decoded.role,
      isActive: decoded.isActive ?? true,
      token,
      accessToken: token,
      refreshToken: this.getRefreshToken()
    };

    this.persistCurrentUser(user);
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
    return user;
  }

  private persistCurrentUser(user: any): void {
    try {
      localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem('currentUser', JSON.stringify(user));
      sessionStorage.removeItem(this.USER_STORAGE_KEY);
      sessionStorage.removeItem('currentUser');
    } catch (error) {
      console.warn('Could not persist current user', error);
    }
  }

  private decodeJWT<T>(token: string): T | null {
    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(base64);
      return JSON.parse(json) as T;
    } catch {
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    const payload = this.decodeJWT<any>(token);
    if (!payload?.exp) {
      return false;
    }
    return payload.exp * 1000 <= Date.now();
  }

  private setToken(token: string, refreshToken?: string | null): void {
    console.log('📝 setToken() called with:', {
      isNull: token === null,
      isUndefined: token === undefined,
      isEmpty: token === '',
      length: token ? token.length : 0
    });

    if (!token) {
      console.error('❌ CRITICAL: setToken called with falsy value! Token:', token);
      return;
    }
    
    // ✅ CRITICAL: Cache token in memory IMMEDIATELY
    this.cachedToken = token;
    console.log('✅ Token cached in memory (length: ' + token.length + ')');

    console.log('💾 About to store token...');
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('token', token);
    sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('token');

    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem('refresh_token', refreshToken);
      sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
      sessionStorage.removeItem('refresh_token');
      console.log('✅ Refresh token stored in localStorage');
    }

    console.log('✅ Token stored in localStorage (key: accessToken, length: ' + token.length + ')');
    console.log('🔍 Verification - localStorage.getItem(accessToken) length:', localStorage.getItem(this.ACCESS_TOKEN_KEY)?.length || 'NULL');
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
    return ['admin', 'super_admin', 'super admin', 'manager'].includes(role || '');
  }

  isSuperAdmin(): boolean {
    const user = this.currentUserValue;
    return user?.role?.toLowerCase() === 'super_admin' || user?.role?.toLowerCase() === 'super admin';
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
    // Handle both response formats: { data: { accessToken, refreshToken, user } } and top-level tokens
    const authData = response.data || response;
    const accessToken = authData.accessToken || authData.token || response.accessToken || response.token;
    const refreshToken = authData.refreshToken || response.refreshToken;
    const user = authData.user || response.user || null;

    if (accessToken) {
      this.setToken(accessToken, refreshToken);
      this.setupTokenRefresh(accessToken);
      console.log('✅ Access token stored successfully in handleSuccessfulLogin');
    }

    if (user) {
      const enrichedUser = { ...user, token: accessToken, accessToken, refreshToken };
      this.currentUserSubject.next(enrichedUser);
      this.isAuthenticatedSubject.next(true);
      this.persistCurrentUser(enrichedUser);
      console.log('✅ User subject updated:', {
        email: enrichedUser.email,
        role: enrichedUser.role,
        storage: 'localStorage'
      });
    } else if (accessToken) {
      this.setUserFromToken(accessToken);
    }

    this.refreshUserDataOnLogin();
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
        this.refreshAccessToken().subscribe({
          next: (newToken) => {
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
    return this.decodeJWT<any>(token);
  }

  refreshAccessToken(): Observable<string> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<any>(`${this.API_URL}/api/auth/refresh-token`, { refreshToken })
      .pipe(
        map(response => {
          const authData = response.data || response;
          const accessToken = authData.accessToken || authData.token || response.accessToken || response.token;
          const newRefreshToken = authData.refreshToken || response.refreshToken || refreshToken;
          const user = authData.user || response.user || null;

          if (!accessToken) {
            throw new Error('Refresh response did not include an access token');
          }

          this.setToken(accessToken, newRefreshToken);

          if (user) {
            const enrichedUser = { ...user, token: accessToken, accessToken, refreshToken: newRefreshToken };
            this.currentUserSubject.next(enrichedUser);
            this.persistCurrentUser(enrichedUser);
          } else {
            this.setUserFromToken(accessToken);
          }

          this.isAuthenticatedSubject.next(true);
          return accessToken;
        }),
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
