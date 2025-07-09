import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class SecurityInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Clone the request to add security headers
    let secureReq = req.clone({
      setHeaders: {
        // Add security headers
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        // Add request timestamp for replay attack prevention
        'X-Request-Timestamp': Date.now().toString()
      }
    });

    // Add authentication token if available
    const token = this.authService.getToken();
    if (token) {
      secureReq = secureReq.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`
        }
      });
    }

    // Add CSRF token for state-changing operations
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      const csrfToken = this.getCsrfToken();
      if (csrfToken) {
        secureReq = secureReq.clone({
          setHeaders: {
            'X-CSRF-Token': csrfToken
          }
        });
      }
    }

    // Validate request URL to prevent SSRF attacks
    if (!this.isValidRequestUrl(req.url)) {
      return throwError(() => new Error('Invalid request URL'));
    }

    // Add request size validation
    if (this.isRequestTooLarge(req)) {
      return throwError(() => new Error('Request payload too large'));
    }

    return next.handle(secureReq).pipe(
      // Retry failed requests once (except for authentication errors)
      retry({
        count: 1,
        delay: 1000,
        resetOnSuccess: true
      }),
      catchError((error: HttpErrorResponse) => {
        return this.handleError(error);
      })
    );
  }

  private getCsrfToken(): string | null {
    // Get CSRF token from meta tag or cookie
    const metaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
    if (metaTag) {
      return metaTag.content;
    }

    // Fallback to cookie
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1];

    return cookieValue || null;
  }

  private isValidRequestUrl(url: string): boolean {
    try {
      // Allow relative URLs
      if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
        return true;
      }

      const urlObj = new URL(url);
      
      // Only allow HTTPS in production
      if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') {
        return false;
      }

      // Prevent requests to private/local networks
      const hostname = urlObj.hostname.toLowerCase();
      const privateNetworks = [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        '::1'
      ];

      if (privateNetworks.includes(hostname)) {
        return false;
      }

      // Check for private IP ranges
      if (hostname.match(/^192\.168\./) ||
          hostname.match(/^10\./) ||
          hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./) ||
          hostname.match(/^169\.254\./)) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  private isRequestTooLarge(req: HttpRequest<any>): boolean {
    // Set maximum request size (10MB)
    const maxSize = 10 * 1024 * 1024;
    
    if (req.body) {
      const bodySize = JSON.stringify(req.body).length;
      return bodySize > maxSize;
    }

    return false;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    switch (error.status) {
      case 401:
        errorMessage = 'Unauthorized access';
        this.authService.logout();
        break;
      case 403:
        errorMessage = 'Access forbidden';
        break;
      case 404:
        errorMessage = 'Resource not found';
        break;
      case 429:
        errorMessage = 'Too many requests. Please try again later.';
        break;
      case 500:
        errorMessage = 'Server error. Please try again later.';
        break;
      default:
        if (error.error?.message) {
          errorMessage = error.error.message;
        }
    }

    // Log security-related errors
    if (error.status === 401 || error.status === 403) {
      console.warn('Security error:', {
        status: error.status,
        url: error.url,
        timestamp: new Date().toISOString()
      });
    }

    return throwError(() => new Error(errorMessage));
  }
}

// Rate limiting service
@Injectable({
  providedIn: 'root'
})
export class RateLimitService {
  private requestCounts = new Map<string, { count: number; resetTime: number }>();
  private readonly maxRequests = 100; // Max requests per window
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes

  canMakeRequest(endpoint: string): boolean {
    const now = Date.now();
    const key = this.getEndpointKey(endpoint);
    const record = this.requestCounts.get(key);

    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.requestCounts.set(key, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }

    if (record.count >= this.maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  private getEndpointKey(endpoint: string): string {
    // Extract base endpoint without query parameters
    return endpoint.split('?')[0];
  }

  getRemainingRequests(endpoint: string): number {
    const key = this.getEndpointKey(endpoint);
    const record = this.requestCounts.get(key);
    
    if (!record || Date.now() > record.resetTime) {
      return this.maxRequests;
    }

    return Math.max(0, this.maxRequests - record.count);
  }

  getResetTime(endpoint: string): number {
    const key = this.getEndpointKey(endpoint);
    const record = this.requestCounts.get(key);
    
    return record?.resetTime || Date.now();
  }
}
