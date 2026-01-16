import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Get the appropriate token based on the request URL
  let token = null;

  // Check if this is an admin route
  if (req.url.includes('/api/admin/')) {
    // Try sessionStorage first (session-based), then localStorage (persistent)
    token = sessionStorage.getItem('admin_token') || 
            localStorage.getItem('admin_token') || 
            authService.getToken() || 
            sessionStorage.getItem('token');
  } else {
    // For regular routes, check sessionStorage first, then localStorage
    token = sessionStorage.getItem('token') || 
            localStorage.getItem('token') || 
            authService.getToken();
  }

  console.log('🔐 Auth Interceptor:', {
    url: req.url,
    isAdminRoute: req.url.includes('/admin/'),
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
    storage: token ? (
      sessionStorage.getItem('admin_token') || 
      sessionStorage.getItem('token') ? 'sessionStorage' : 'localStorage'
    ) : 'none'
  });

  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }

  return next(req);
};
