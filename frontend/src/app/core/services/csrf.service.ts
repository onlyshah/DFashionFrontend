import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CsrfService {
  private csrfToken = new BehaviorSubject<string | null>(null);
  private readonly CSRF_HEADER_NAME = 'X-CSRF-Token';
  private readonly CSRF_COOKIE_NAME = 'XSRF-TOKEN';
  private readonly CSRF_META_NAME = 'csrf-token';

  constructor(private http: HttpClient) {
    this.initializeCsrfToken();
  }

  /**
   * Initialize CSRF token from various sources
   */
  private initializeCsrfToken(): void {
    // Try to get token from meta tag first
    const metaToken = this.getTokenFromMeta();
    if (metaToken) {
      this.csrfToken.next(metaToken);
      return;
    }

    // Try to get token from cookie
    const cookieToken = this.getTokenFromCookie();
    if (cookieToken) {
      this.csrfToken.next(cookieToken);
      return;
    }

    // If no token found, fetch from server
    this.fetchCsrfToken().subscribe({
      next: (token) => this.csrfToken.next(token),
      error: (error) => console.error('Failed to fetch CSRF token:', error)
    });
  }

  /**
   * Get CSRF token from meta tag
   */
  private getTokenFromMeta(): string | null {
    const metaTag = document.querySelector(`meta[name="${this.CSRF_META_NAME}"]`) as HTMLMetaElement;
    return metaTag?.content || null;
  }

  /**
   * Get CSRF token from cookie
   */
  private getTokenFromCookie(): string | null {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${this.CSRF_COOKIE_NAME}=`))
      ?.split('=')[1];

    return cookieValue ? decodeURIComponent(cookieValue) : null;
  }

  /**
   * Fetch CSRF token from server
   */
  private fetchCsrfToken(): Observable<string> {
    return this.http.get<{ csrfToken: string }>(`${environment.apiUrl}/api/csrf-token`)
      .pipe(
        tap(response => {
          // Store token in meta tag for future use
          this.setTokenInMeta(response.csrfToken);
        }),
        catchError(error => {
          console.error('CSRF token fetch failed:', error);
          return throwError(() => error);
        })
      )
      .pipe(
        tap(response => response.csrfToken)
      ) as Observable<string>;
  }

  /**
   * Set CSRF token in meta tag
   */
  private setTokenInMeta(token: string): void {
    let metaTag = document.querySelector(`meta[name="${this.CSRF_META_NAME}"]`) as HTMLMetaElement;
    
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.name = this.CSRF_META_NAME;
      document.head.appendChild(metaTag);
    }
    
    metaTag.content = token;
  }

  /**
   * Get current CSRF token
   */
  getToken(): string | null {
    return this.csrfToken.value;
  }

  /**
   * Get CSRF token as Observable
   */
  getToken$(): Observable<string | null> {
    return this.csrfToken.asObservable();
  }

  /**
   * Refresh CSRF token
   */
  refreshToken(): Observable<string> {
    return this.fetchCsrfToken().pipe(
      tap(token => this.csrfToken.next(token))
    );
  }

  /**
   * Get headers with CSRF token for HTTP requests
   */
  getHeaders(): HttpHeaders {
    const token = this.getToken();
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(this.CSRF_HEADER_NAME, token);
    }

    return headers;
  }

  /**
   * Validate if request needs CSRF protection
   */
  needsCsrfProtection(method: string): boolean {
    const protectedMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
    return protectedMethods.includes(method.toUpperCase());
  }

  /**
   * Generate a secure random token (client-side fallback)
   */
  generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate CSRF token format
   */
  isValidTokenFormat(token: string): boolean {
    // Token should be a hex string of specific length
    const tokenRegex = /^[a-f0-9]{64}$/i;
    return tokenRegex.test(token);
  }

  /**
   * Clear CSRF token (for logout)
   */
  clearToken(): void {
    this.csrfToken.next(null);
    
    // Remove from meta tag
    const metaTag = document.querySelector(`meta[name="${this.CSRF_META_NAME}"]`);
    if (metaTag) {
      metaTag.remove();
    }

    // Clear cookie (if possible)
    document.cookie = `${this.CSRF_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}

/**
 * CSRF Token Interceptor
 */
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';

@Injectable()
export class CsrfInterceptor implements HttpInterceptor {

  constructor(private csrfService: CsrfService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only add CSRF token for state-changing operations
    if (!this.csrfService.needsCsrfProtection(req.method)) {
      return next.handle(req);
    }

    const token = this.csrfService.getToken();
    
    if (!token) {
      console.warn('CSRF token not available for protected request');
      return next.handle(req);
    }

    // Clone request and add CSRF token
    const csrfReq = req.clone({
      headers: req.headers.set('X-CSRF-Token', token)
    });

    return next.handle(csrfReq);
  }
}

/**
 * CSRF Guard for route protection
 */
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CsrfGuard implements CanActivate {

  constructor(
    private csrfService: CsrfService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const token = this.csrfService.getToken();
    
    if (!token) {
      console.warn('CSRF token required but not available');
      // Attempt to refresh token
      this.csrfService.refreshToken().subscribe({
        next: () => {
          // Token refreshed, allow navigation
          return true;
        },
        error: () => {
          // Failed to get token, redirect to login
          this.router.navigate(['/auth/login']);
          return false;
        }
      });
      return false;
    }

    return true;
  }
}

/**
 * Double Submit Cookie Pattern Implementation
 */
@Injectable({
  providedIn: 'root'
})
export class DoubleSubmitCookieService {
  private readonly COOKIE_NAME = 'csrf-token';
  private readonly HEADER_NAME = 'X-CSRF-Token';

  /**
   * Set CSRF token in both cookie and return for header
   */
  setDoubleSubmitToken(token: string): void {
    // Set secure cookie
    const cookieOptions = [
      `${this.COOKIE_NAME}=${token}`,
      'Path=/',
      'SameSite=Strict',
      'Secure', // Only over HTTPS
      'HttpOnly=false' // Accessible to JavaScript for header
    ];

    document.cookie = cookieOptions.join('; ');
  }

  /**
   * Get token for header submission
   */
  getTokenForHeader(): string | null {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${this.COOKIE_NAME}=`))
      ?.split('=')[1];

    return cookieValue || null;
  }

  /**
   * Validate double submit pattern
   */
  validateDoubleSubmit(headerToken: string): boolean {
    const cookieToken = this.getTokenForHeader();
    return cookieToken === headerToken && !!cookieToken;
  }

  /**
   * Clear double submit tokens
   */
  clearTokens(): void {
    document.cookie = `${this.COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}
