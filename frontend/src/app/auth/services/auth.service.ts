import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  public isAuthenticated$: Observable<boolean>;
  private isAuthenticatedSubject: BehaviorSubject<boolean>;
  private rememberMe: boolean = false;
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly USER_STORAGE_KEY = 'currentUser';

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem(this.USER_STORAGE_KEY) || localStorage.getItem('currentUser') || 'null'));
    this.currentUser = this.currentUserSubject.asObservable();
    
    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(!!this.currentUserValue);
    this.isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  login(credentials: { email: string; password: string }, rememberMe: boolean = false): Promise<any> {
    const { email, password } = credentials;
    return this.http.post<any>(`${environment.apiUrl}/api/auth/login`, { email, password })
      .pipe(
        tap(response => {
          const authData = response.data || response;
          const accessToken = authData.accessToken || authData.token || response.accessToken || response.token;
          const refreshToken = authData.refreshToken || response.refreshToken;

          if (accessToken) {
            const userData = {
              token: accessToken,
              accessToken,
              refreshToken,
              user: authData.user,
              data: authData
            };

            localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(userData));
            localStorage.setItem('currentUser', JSON.stringify(userData));
            localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
            localStorage.setItem('auth_token', accessToken);
            localStorage.setItem('token', accessToken);
            sessionStorage.removeItem(this.USER_STORAGE_KEY);
            sessionStorage.removeItem('currentUser');
            sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
            sessionStorage.removeItem('auth_token');
            sessionStorage.removeItem('token');

            if (refreshToken) {
              localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
              localStorage.setItem('refresh_token', refreshToken);
              sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
              sessionStorage.removeItem('refresh_token');
            }

            // Also store admin_token if user is admin or super_admin
            if (authData.user?.role === 'admin' || authData.user?.role === 'super_admin') {
              localStorage.setItem('admin_token', accessToken);
              localStorage.setItem('admin_user', JSON.stringify(authData.user));
              sessionStorage.removeItem('admin_token');
              sessionStorage.removeItem('admin_user');
            }

            this.currentUserSubject.next(userData);
            this.isAuthenticatedSubject.next(true);

            console.log('✅ Login successful:', {
              email: response.data.user.email,
              role: response.data.user.role,
              storage: rememberMe ? 'localStorage (Remember Me)' : 'sessionStorage',
              tokenStored: true
            });
          }
        })
      ).toPromise();
  }

  register(userData: any): Promise<any> {
    return this.http.post<any>(`${environment.apiUrl}/api/auth/register`, userData).toPromise();
  }

  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem(this.USER_STORAGE_KEY);
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token');
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem(this.USER_STORAGE_KEY);
    sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  // Forgot Password - Send reset link
  forgotPassword(email: string): Promise<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/forgot-password`, { email }).toPromise();
  }

  // Verify Reset Token
  verifyResetToken(token: string): Promise<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/verify-reset-token`, { token }).toPromise();
  }

  // Reset Password with Token
  resetPassword(token: string, password: string, confirmPassword: string): Promise<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/reset-password`, { 
      token, 
      password, 
      confirmPassword 
    }).toPromise();
  }

  refreshToken(): Promise<any> {
    return this.http.post<any>(`${environment.apiUrl}/api/auth/refresh-token`, {
      refreshToken: this.getRefreshToken()
    }).pipe(
      tap(response => {
        const authData = response.data || response;
        const accessToken = authData.accessToken || authData.token || response.accessToken || response.token;
        const refreshToken = authData.refreshToken || response.refreshToken;

        if (accessToken) {
          const user = { ...this.currentUserValue, ...authData, accessToken, token: accessToken, refreshToken };
          localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
          localStorage.setItem('auth_token', accessToken);
          localStorage.setItem('token', accessToken);
          if (refreshToken) {
            localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
            localStorage.setItem('refresh_token', refreshToken);
          }
          this.currentUserSubject.next(user);
        }
      })
    ).toPromise();
  }

  getCurrentUser() {
    return this.currentUserValue;
  }

  setRememberMe(value: boolean): void {
    this.rememberMe = value;
  }

  getToken(): string | null {
    return this.currentUserValue?.accessToken ||
      this.currentUserValue?.token ||
      localStorage.getItem(this.ACCESS_TOKEN_KEY) ||
      localStorage.getItem('auth_token') ||
      localStorage.getItem('token') ||
      sessionStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return this.currentUserValue?.refreshToken ||
      localStorage.getItem(this.REFRESH_TOKEN_KEY) ||
      localStorage.getItem('refresh_token') ||
      sessionStorage.getItem('refresh_token');
  }

  getPermissions(): string[] {
    return this.currentUserValue?.permissions || [];
  }

  hasPermission(permission: string): boolean {
    const permissions = this.getPermissions();
    return permissions.includes(permission) || permissions.includes('*');
  }
}
