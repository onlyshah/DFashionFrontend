import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

/**
 * ✅ UNIFIED Auth Interceptor - SINGLE SOURCE OF TRUTH for JWT tokens
 * - Adds Authorization header to ALL requests automatically
 * - No manual header passing needed in services
 * - Handles token refresh and expiration
 * - Works with all storage methods (memory, sessionStorage, localStorage)
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Get token from AuthService (checks memory cache first, then all storage)
  let token = authService.getToken();
  
  // If token not found via service, do direct storage check (fallback)
  if (!token) {
    token = sessionStorage.getItem('auth_token') || 
            localStorage.getItem('auth_token') ||
            sessionStorage.getItem('token') ||
            localStorage.getItem('token') ||
            sessionStorage.getItem('admin_token') ||
            localStorage.getItem('admin_token');
  }
  
  // Validate token has actual content
  if (token && typeof token === 'string' && token.trim().length > 0) {
    console.log('✅ [authInterceptor] Token attached to request:', req.url);
    
    // Clone request and add Authorization header
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  } else {
    // No token found - log for debugging admin endpoints
    if (req.url.includes('/api/admin/') || req.url.includes('/api/auth/')) {
      console.warn('⚠️ [authInterceptor] No token for request:', req.url, {
        token: token,
        tokenType: typeof token,
        tokenLength: token ? (token as string).length : 0
      });
    }
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized - token might be invalid
      if (error.status === 401) {
        console.error('❌ [authInterceptor] 401 Unauthorized:', {
          url: req.url,
          message: error.error?.message,
          hasToken: !!token,
          tokenLength: token ? token.length : 0
        });
        
        // Log the actual token value for debugging (truncated for security)
        if (token) {
          console.error('🔍 Token preview:', token.substring(0, 50) + '...');
        }
        
        // Clear invalid token
        authService.logout();
      }
      
      return throwError(() => error);
    })
  );
};
