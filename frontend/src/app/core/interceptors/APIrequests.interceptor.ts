import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';

/**
 * ✅ API Request Interceptor - Normalizes responses & logging
 * NOTE: Auth headers are handled by authInterceptor (single source of truth)
 * This interceptor only handles response normalization
 */
export const apiRequestsInterceptor: HttpInterceptorFn = (req, next) => {
  try {
    console.groupCollapsed(`API Request: ${req.method} ${req.url}`);
    const headers = req.headers.keys().reduce((acc, k) => {
      const value = k === 'Authorization' ? 'Bearer [REDACTED]' : req.headers.get(k);
      return { ...acc, [k]: value };
    }, {});
    console.log('Request headers:', headers);
    console.log('Request body:', req.body);
  } catch (e) {
    console.warn('Failed to log request', e);
  }

  return next(req).pipe(
    map((event: any) => {
      // Normalize successful HttpResponse bodies
      if (event instanceof HttpResponse) {
        const body = event.body;
        if (body && body.data && body.data.data) {
          // some endpoints nested payload under data.data — unwrap to data
          body.data = body.data.data;
        }
        // Ensure top-level standardized shape exists
        if (body && !('success' in body)) {
          event = event.clone({ body: { success: true, message: body.message || '', data: body.data ?? body } });
        }
      }
      return event;
    }),
    tap({
      next: (event) => {
        try {
          if ((event as any)?.status) {
            console.log('Response:', event);
            console.groupEnd();
          }
        } catch (e) {
          console.warn('Failed to log response', e);
        }
      },
      error: (err: any) => {
        try {
          // Normalize error shape for downstream code
          if (err instanceof HttpErrorResponse) {
            const body = err.error || {};
            const message = body.message || err.message || 'Server Error';
            const normalized = { success: false, message, data: null };
            // attach normalized payload for subscribers
            (err as any).normalized = normalized;
            console.error('HTTP Error:', normalized, err);
          } else {
            console.error('HTTP Error:', err);
          }
        } catch (e) {
          console.warn('Failed to log error', e);
        } finally {
          try { console.groupEnd(); } catch {}
        }
      }
    })
  );
};
