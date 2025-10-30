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

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser') || 'null'));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string, rememberMe: boolean = false): Promise<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          if (response.token) {
            if (rememberMe) {
              localStorage.setItem('currentUser', JSON.stringify(response));
            } else {
              sessionStorage.setItem('currentUser', JSON.stringify(response));
            }
            this.currentUserSubject.next(response);
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
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  forgotPassword(email: string): Promise<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/forgot-password`, { email }).toPromise();
  }

  resetPassword(token: string, password: string): Promise<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/reset-password`, { token, password }).toPromise();
  }

  refreshToken(): Promise<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/refresh-token`, {
      refreshToken: this.currentUserValue?.refreshToken
    }).pipe(
      tap(response => {
        if (response.token) {
          const user = { ...this.currentUserValue, ...response };
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
      })
    ).toPromise();
  }
}