import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  newUsersToday: number;
  ordersToday: number;
  revenueToday: number;
  conversionRate: number;
}

export interface SalesData {
  date: string;
  sales: number;
  orders: number;
  revenue: number;
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  userGrowth: number;
  usersByRole: { [key: string]: number };
  usersByDepartment: { [key: string]: number };
}

export interface ProductAnalytics {
  totalProducts: number;
  activeProducts: number;
  featuredProducts: number;
  productsByCategory: { [key: string]: number };
  topSellingProducts: any[];
  lowStockProducts: any[];
}

export interface OrderAnalytics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  ordersByStatus: { [key: string]: number };
  ordersByPaymentMethod: { [key: string]: number };
}

export interface RevenueAnalytics {
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  revenueByCategory: { [key: string]: number };
  revenueByMonth: SalesData[];
}

export interface TrafficAnalytics {
  totalViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  averageSessionDuration: number;
  topPages: any[];
  trafficSources: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/api/admin`;

  constructor(private http: HttpClient) {}

  // Get authentication headers
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('admin_token') ||
                  localStorage.getItem('token') ||
                  sessionStorage.getItem('token');

    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // Dashboard Statistics (Admin API)
  getDashboardStats(): Observable<{success: boolean; data: any}> {
    return this.http.get<{success: boolean; data: any}>(`${this.apiUrl}/dashboard/metrics`, {
      headers: this.getAuthHeaders()
    });
  }

  // Use real API endpoint - no fallback to demo
  getDashboardStatsWithFallback(): Observable<{success: boolean; data: any}> {
    return this.http.get<{success: boolean; data: any}>(`${this.apiUrl}/dashboard/metrics`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((err: any) => {
        // Return error - no fallback to demo data
        return throwError(() => err);
      })
    );
  }



  // Sales Analytics
  getSalesData(period: string = '30d'): Observable<SalesData[]> {
    return this.http.get<SalesData[]>(`${this.apiUrl}/sales?period=${period}`, {
      headers: this.getAuthHeaders()
    });
  }

  getSalesStats(period: string = '30d'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/sales/stats?period=${period}`, {
      headers: this.getAuthHeaders()
    });
  }

  // User Analytics
  getUserAnalytics(period: string = '30d'): Observable<UserAnalytics> {
    return this.http.get<UserAnalytics>(`${this.apiUrl}/users?period=${period}`, {
      headers: this.getAuthHeaders()
    });
  }

  getUserGrowth(period: string = '12m'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/growth?period=${period}`, {
      headers: this.getAuthHeaders()
    });
  }

  getUserActivity(period: string = '7d'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/activity?period=${period}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Product Analytics
  getProductAnalytics(period: string = '30d'): Observable<ProductAnalytics> {
    return this.http.get<ProductAnalytics>(`${this.apiUrl}/products?period=${period}`, {
      headers: this.getAuthHeaders()
    });
  }

  getTopSellingProducts(limit: number = 10, period: string = '30d'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products/top-selling?limit=${limit}&period=${period}`, {
      headers: this.getAuthHeaders()
    });
  }

  getProductPerformance(productId: string, period: string = '30d'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/products/${productId}/performance?period=${period}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Order Analytics
  getOrderAnalytics(period: string = '30d'): Observable<{success: boolean; data: any}> {
    return this.http.get<{success: boolean; data: any}>(`${this.apiUrl}/orders?period=${period}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Use real API endpoint - no fallback to demo
  getOrderAnalyticsWithFallback(period: string = '30d'): Observable<{success: boolean; data: any}> {
    return this.http.get<{success: boolean; data: any}>(`${this.apiUrl}/orders/recent`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((err: any) => {
        // Return error - no fallback to demo data
        return throwError(() => err);
      })
    );
  }

  getOrderTrends(period: string = '12m'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/orders/trends?period=${period}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Revenue Analytics
  getRevenueAnalytics(period: string = '30d'): Observable<RevenueAnalytics> {
    return this.http.get<RevenueAnalytics>(`${this.apiUrl}/revenue?period=${period}`, {
      headers: this.getAuthHeaders()
    });
  }

  getRevenueByCategory(period: string = '30d'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/revenue/by-category?period=${period}`, {
      headers: this.getAuthHeaders()
    });
  }

  getRevenueByVendor(period: string = '30d'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/revenue/by-vendor?period=${period}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Traffic Analytics
  getTrafficAnalytics(period: string = '30d'): Observable<TrafficAnalytics> {
    return this.http.get<TrafficAnalytics>(`${this.apiUrl}/traffic?period=${period}`, {
      headers: this.getAuthHeaders()
    });
  }

  getPageViews(period: string = '7d'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/traffic/page-views?period=${period}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Conversion Analytics
  getConversionRates(period: string = '30d'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/conversion?period=${period}`, {
      headers: this.getAuthHeaders()
    });
  }

  getFunnelAnalytics(period: string = '30d'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/conversion/funnel?period=${period}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Customer Analytics
  getCustomerAnalytics(period: string = '30d'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/customers?period=${period}`, {
      headers: this.getAuthHeaders()
    });
  }

  getCustomerLifetimeValue(period: string = '12m'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/customers/lifetime-value?period=${period}`, {
      headers: this.getAuthHeaders()
    });
  }

  getCustomerRetention(period: string = '12m'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/customers/retention?period=${period}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Inventory Analytics
  getInventoryAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/inventory`, {
      headers: this.getAuthHeaders()
    });
  }

  getLowStockProducts(threshold: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inventory/low-stock?threshold=${threshold}`, {
      headers: this.getAuthHeaders()
    });
  }

  getStockMovement(period: string = '30d'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inventory/movement?period=${period}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Marketing Analytics
  getMarketingAnalytics(period: string = '30d'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/marketing?period=${period}`, {
      headers: this.getAuthHeaders()
    });
  }

  getCampaignPerformance(period: string = '30d'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/marketing/campaigns?period=${period}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Financial Analytics
  getFinancialAnalytics(period: string = '30d'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/financial?period=${period}`, {
      headers: this.getAuthHeaders()
    });
  }

  getProfitAnalysis(period: string = '30d'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/financial/profit?period=${period}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Export Analytics
  exportAnalyticsReport(type: string, period: string = '30d', format: 'csv' | 'excel' | 'pdf' = 'csv'): Observable<Blob> {
    let params = new HttpParams()
      .set('type', type)
      .set('period', period)
      .set('format', format);

    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob',
      headers: this.getAuthHeaders()
    });
  }

  // Real-time Analytics
  getRealTimeStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/real-time`, {
      headers: this.getAuthHeaders()
    });
  }

  // Custom Analytics
  getCustomAnalytics(query: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/custom`, query, {
      headers: this.getAuthHeaders()
    });
  }

  // Comparative Analytics
  getComparativeAnalytics(periods: string[]): Observable<any> {
    let params = new HttpParams();
    periods.forEach(period => {
      params = params.append('periods', period);
    });

    return this.http.get<any>(`${this.apiUrl}/comparative`, { params, headers: this.getAuthHeaders() });
  }
}
