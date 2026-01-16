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

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser') || 'null'));
    this.currentUser = this.currentUserSubject.asObservable();
    
    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(!!this.currentUserValue);
    this.isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string, rememberMe: boolean = false): Promise<any> {
    return this.http.post<any>(`${environment.apiUrl}/api/auth/login`, { email, password })
      .pipe(
        tap(response => {
          if (response.data && response.data.token) {
            const userData = { 
              token: response.data.token, 
              user: response.data.user,
              data: response.data
            };

            // Store in appropriate storage based on rememberMe
            if (rememberMe) {
              localStorage.setItem('currentUser', JSON.stringify(userData));
              localStorage.setItem('token', response.data.token);
              sessionStorage.removeItem('currentUser');
              sessionStorage.removeItem('token');
            } else {
              sessionStorage.setItem('currentUser', JSON.stringify(userData));
              sessionStorage.setItem('token', response.data.token);
              localStorage.removeItem('currentUser');
              localStorage.removeItem('token');
            }

            // Also store admin_token if user is admin or super_admin
            if (response.data.user.role === 'admin' || response.data.user.role === 'super_admin') {
              if (rememberMe) {
                localStorage.setItem('admin_token', response.data.token);
                localStorage.setItem('admin_user', JSON.stringify(response.data.user));
                sessionStorage.removeItem('admin_token');
                sessionStorage.removeItem('admin_user');
              } else {
                sessionStorage.setItem('admin_token', response.data.token);
                sessionStorage.setItem('admin_user', JSON.stringify(response.data.user));
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_user');
              }
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
    return this.http.post<any>(`${environment.apiUrl}/auth/register`, userData).toPromise();
  }

  logout() {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
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
    return this.http.post<any>(`${environment.apiUrl}/auth/refresh-token`, {
      refreshToken: this.currentUserValue?.refreshToken
    }).pipe(
      tap(response => {
        if (response.data && response.data.token) {
          const user = { ...this.currentUserValue, ...response.data };
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
      })
    ).toPromise();
  }

  getCurrentUser() {
    return this.currentUserValue;
  }

  getToken(): string | null {
    return this.currentUserValue?.token || localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  getPermissions(): string[] {
    return this.currentUserValue?.permissions || [];
  }

  hasPermission(permission: string): boolean {
    const permissions = this.getPermissions();
    return permissions.includes(permission) || permissions.includes('*');
  }
}