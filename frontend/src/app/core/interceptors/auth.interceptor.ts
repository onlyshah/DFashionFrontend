import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError, switchMap } from 'rxjs';

/**
 * ✅ UNIFIED Auth Interceptor - SINGLE SOURCE OF TRUTH for JWT tokens
 * - Adds Authorization header to ALL requests automatically
 * - No manual header passing needed in services
 * - Handles token refresh and expiration
 * - Works with all storage methods (memory, sessionStorage, localStorage)
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  const attachToken = (request: typeof req, token: string) => request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  const token = authService.getToken();
  const authedRequest = token && token.trim().length > 0 ? attachToken(req, token) : req;

  return next(authedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthEndpoint =
        req.url.includes('/api/auth/login') ||
        req.url.includes('/api/auth/refresh-token') ||
        req.url.includes('/api/auth/register');

      if (error.status === 401 && !isAuthEndpoint) {
        console.warn('⚠️ [authInterceptor] 401 received, attempting refresh:', req.url);

        return authService.refreshAccessToken().pipe(
          switchMap((newToken) => {
            const retryRequest = attachToken(req, newToken);
            return next(retryRequest);
          }),
          catchError((refreshError) => {
            console.error('❌ [authInterceptor] Refresh failed, logging out:', refreshError);
            authService.logout();
            return throwError(() => error);
          })
        );
      }
      
      return throwError(() => error);
    })
  );
};
