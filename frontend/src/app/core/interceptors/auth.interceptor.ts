import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Get the appropriate token based on the request URL
  let token = null;

  // Check if this is an admin route
  if (req.url.includes('/api/admin/')) {
    // Try to get admin token first. If admin_token is missing (user logged in via regular auth),
    // fall back to the regular token stored by AuthService (or sessionStorage).
    token = localStorage.getItem('admin_token') || authService.getToken() || sessionStorage.getItem('token');
  } else {
    // For regular routes, use regular token
    token = authService.getToken() || localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  console.log('🔐 Auth Interceptor:', {
    url: req.url,
    isAdminRoute: req.url.includes('/admin/'),
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
    adminToken: !!localStorage.getItem('admin_token'),
    regularToken: !!localStorage.getItem('token')
  });

  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }

  return next(req);
};
