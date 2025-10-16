interface DashboardStats {
  overview: any;
  revenue: any;
  monthlyTrends: any[];
  topCustomers: any[];
  _isFallback?: boolean;
}
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, of, timer } from 'rxjs';
import { map, catchError, retry, timeout, shareReplay, switchMap, tap } from 'rxjs/operators';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardPerformanceService {
  private apiUrl = 'http://localhost:3001/api/v1';
  private cache = new Map<string, CacheItem<any>>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly REQUEST_TIMEOUT = 10000; // 10 seconds

  // Loading states
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  // Error states
  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {
    // Clear expired cache every 10 minutes
    timer(0, 10 * 60 * 1000).subscribe(() => {
      this.clearExpiredCache();
    });
  }

  /**
   * Get dashboard stats with caching and error handling
   */
  getDashboardStats(): Observable<any> {
    const cacheKey = 'dashboard-stats';
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log('📋 Using cached dashboard data');
      return of(cached);
    }

    console.log('🔄 Fetching fresh dashboard data');
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    // Try multiple endpoints in order of preference
    const endpoints = [
      `${this.apiUrl}/admin/dashboard`,
      `${this.apiUrl}/admin/dashboard/stats`,
      `${this.apiUrl}/analytics/overview`
    ];

    return this.tryEndpoints(endpoints).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(2),
      tap(data => {
        if (data) {
          this.setCache(cacheKey, data);
          console.log('✅ Dashboard data loaded and cached');
        }
      }),
      catchError(error => {
        console.error('❌ All dashboard endpoints failed:', error);
        this.errorSubject.next('Failed to load dashboard data');
        return of(this.getFallbackData());
      }),
      tap(() => this.loadingSubject.next(false)),
      shareReplay(1)
    );
  }

  /**
   * Try multiple endpoints until one succeeds
   */
  private tryEndpoints(endpoints: string[], index: number = 0): Observable<any> {
    if (index >= endpoints.length) {
      throw new Error('All endpoints failed');
    }

    const endpoint = endpoints[index];
    console.log(`🔍 Trying endpoint ${index + 1}/${endpoints.length}: ${endpoint}`);

    return this.makeRequest(endpoint).pipe(
      catchError(error => {
        console.warn(`⚠️ Endpoint ${endpoint} failed:`, error.message);
        if (index < endpoints.length - 1) {
          return this.tryEndpoints(endpoints, index + 1);
        }
        throw error;
      })
    );
  }

  /**
   * Make HTTP request with proper headers
   */
  private makeRequest(url: string): Observable<any> {
    const headers = this.getAuthHeaders();
    
    return this.http.get<any>(url, { headers }).pipe(
      map(response => {
        if (response && response.success && response.data) {
          return response.data;
        }
        throw new Error('Invalid response format');
      }),
      catchError(this.handleHttpError.bind(this))
    );
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('admin_token') || 
                  sessionStorage.getItem('token');
    
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
      console.log('🔐 Using auth token for request');
    } else {
      console.warn('⚠️ No auth token found');
    }

    return headers;
  }

  /**
   * Handle HTTP errors
   */
  private handleHttpError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 401:
          errorMessage = 'Unauthorized - Please login again';
          this.clearAuthTokens();
          break;
        case 403:
          errorMessage = 'Access forbidden - Insufficient permissions';
          break;
        case 404:
          errorMessage = 'Endpoint not found';
          break;
        case 500:
          errorMessage = 'Server error - Please try again later';
          break;
        case 0:
          errorMessage = 'Network error - Check your connection';
          break;
        default:
          errorMessage = `Server Error: ${error.status} ${error.statusText}`;
      }
    }

    console.error('🚨 HTTP Error:', errorMessage, error);
    throw new Error(errorMessage);
  }

  /**
   * Cache management
   */
  private getFromCache<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  private setCache<T>(key: string, data: T): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + this.CACHE_DURATION
    };
    this.cache.set(key, item);
  }

  private clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  /**
   * Clear authentication tokens
   */
  private clearAuthTokens(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('admin_token');
    sessionStorage.removeItem('token');
  }

  /**
   * Get empty data when APIs fail - no fallback mock data
   */
  private getFallbackData(): DashboardStats {
    console.log('📋 No fallback data - using empty data structure');
    return {
      overview: {
        users: { total: 0, active: 0, inactive: 0 },
        products: { total: 0, active: 0, approved: 0, pending: 0, featured: 0 },
        orders: { total: 0, pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 }
      },
      revenue: { totalRevenue: 0, averageOrderValue: 0 },
      monthlyTrends: [],
      topCustomers: [],
      _isFallback: true
    };
  }

  /**
   * Refresh dashboard data (bypass cache)
   */
  refreshDashboard(): Observable<any> {
    this.cache.delete('dashboard-stats');
    return this.getDashboardStats();
  }

  /**
   * Check if current data is from fallback
   */
  isUsingFallbackData(): boolean {
    const cached = this.getFromCache('dashboard-stats') as DashboardStats | null;
    return !!(cached && cached._isFallback === true);
  }

  /**
   * Get cache status
   */
  getCacheStatus(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}
