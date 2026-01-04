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
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          if (response.data && response.data.token) {
            const userData = { 
              token: response.data.token, 
              user: response.data.user,
              data: response.data
            };
            if (rememberMe) {
              localStorage.setItem('currentUser', JSON.stringify(userData));
            } else {
              sessionStorage.setItem('currentUser', JSON.stringify(userData));
            }
            this.currentUserSubject.next(userData);
            this.isAuthenticatedSubject.next(true);
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