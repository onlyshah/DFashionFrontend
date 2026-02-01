import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Get the appropriate token based on the request URL
  let token = null;
  let tokenSource = 'none';

  // Check if this is an admin route
  if (req.url.includes('/api/admin/')) {
    // Try sessionStorage first (session-based), then localStorage (persistent)
    if (sessionStorage.getItem('admin_token')) {
      token = sessionStorage.getItem('admin_token');
      tokenSource = 'sessionStorage(admin_token)';
    } else if (localStorage.getItem('admin_token')) {
      token = localStorage.getItem('admin_token');
      tokenSource = 'localStorage(admin_token)';
    } else if (authService.getToken()) {
      token = authService.getToken();
      tokenSource = 'authService.getToken()';
    } else if (sessionStorage.getItem('token')) {
      token = sessionStorage.getItem('token');
      tokenSource = 'sessionStorage(token)';
    } else if (localStorage.getItem('token')) {
      token = localStorage.getItem('token');
      tokenSource = 'localStorage(token)';
    }
  } else {
    // For regular routes, check sessionStorage first, then localStorage
    if (sessionStorage.getItem('token')) {
      token = sessionStorage.getItem('token');
      tokenSource = 'sessionStorage(token)';
    } else if (localStorage.getItem('token')) {
      token = localStorage.getItem('token');
      tokenSource = 'localStorage(token)';
    } else if (authService.getToken()) {
      token = authService.getToken();
      tokenSource = 'authService.getToken()';
    }
  }

  console.log('🔐 Auth Interceptor:', {
    method: req.method,
    url: req.url,
    isAdminRoute: req.url.includes('/admin/'),
    hasToken: !!token,
    tokenSource,
    tokenPreview: token ? token.substring(0, 20) + '...' : 'none'
  });

  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    console.log('✅ Auth header added:', { headerPresent: authReq.headers.has('Authorization') });
    return next(authReq);
  }

  console.warn('⚠️ No token found - request will be sent without authorization');
  return next(req);
};
