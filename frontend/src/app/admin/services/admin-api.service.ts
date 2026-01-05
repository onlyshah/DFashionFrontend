import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AdminAuthService } from './admin-auth.service';

export interface DashboardMetrics {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  monthlyGrowth: number;
  orderGrowth: number;
  revenueGrowth: number;
  userGrowth: number;
  todaySales: number;
  salesGrowth: number;
  lowStockProducts: number;
  totalCustomers: number;
  newCustomers: number;
  recentOrders: Array<{
    id: string;
    customer: string;
    amount: number;
    status: string;
    date: Date;
    products: string;
    total: number;
  }>;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  parent?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  salePrice?: number;
  stock: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  // backend routes are mounted under /api/admin
  private apiUrl = `${environment.apiUrl}/api/admin`;
  private apiUrlPublic = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient, private adminAuth: AdminAuthService) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return new HttpHeaders(headers);
  }

  getProducts(params: any = {}): Observable<any> {
    return this.http.get(`${this.apiUrl}/products`, { params, headers: this.getHeaders() });
  }

  createProduct(product: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/products`, product, { headers: this.getHeaders() });
  }

  updateProduct(id: string, product: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/products/${id}`, product, { headers: this.getHeaders() });
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/products/${id}`, { headers: this.getHeaders() });
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrlPublic}/categories`);
  }

  createCategory(category: any): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrlPublic}/categories`, category);
  }

  updateCategory(id: string, category: any): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrlPublic}/categories/${id}`, category);
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrlPublic}/categories/${id}`);
  }

  getBrands(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/brands`, { headers: this.getHeaders() });
  }

  getUsers(params: any = {}): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`, { params, headers: this.getHeaders() });
  }

  createUser(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, user, { headers: this.getHeaders() });
  }

  updateUser(id: string, user: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}`, user, { headers: this.getHeaders() });
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`, { headers: this.getHeaders() });
  }

  activateUser(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}/activate`, {}, { headers: this.getHeaders() });     
  }

  getSuperAdminStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/super-admin`, { headers: this.getHeaders() });
  }

  /**
   * Get general dashboard data with real statistics from backend
   * Maps backend response to frontend DashboardMetrics interface
   */
  getGeneralDashboardData(): Observable<DashboardMetrics> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiUrl}/dashboard/metrics`, { headers }).pipe(
      map(response => {
        // Map backend response to frontend interface
        const data = response.data || response;
        const overview = data.overview || {};

        return {
          // Users stats
          totalUsers: overview.users?.total || 0,
          totalCustomers: (overview.users?.total || 0) - (overview.users?.vendors || 0),
          newCustomers: overview.users?.new_today || 0,
          userGrowth: 0, // Calculate from data if needed

          // Products stats
          totalProducts: overview.products?.total || 0,
          lowStockProducts: 0, // Would need to calculate from product data

          // Orders stats
          totalOrders: overview.orders?.total || 0,
          orderGrowth: 0, // Calculate from comparison

          // Revenue stats
          totalRevenue: overview.revenue?.total || 0,
          todaySales: overview.revenue?.today || 0,
          salesGrowth: 0, // Calculate from comparison
          revenueGrowth: 0,

          // Recent orders (empty for now, can be enhanced)
          recentOrders: [],
          monthlyGrowth: 0
        } as DashboardMetrics;
      }),
      catchError(error => {
        console.error('Error fetching dashboard data:', error);
        // Return default empty metrics
        return of({
          totalUsers: 0,
          totalOrders: 0,
          totalRevenue: 0,
          totalProducts: 0,
          monthlyGrowth: 0,
          orderGrowth: 0,
          revenueGrowth: 0,
          userGrowth: 0,
          todaySales: 0,
          salesGrowth: 0,
          lowStockProducts: 0,
          totalCustomers: 0,
          newCustomers: 0,
          recentOrders: []
        } as DashboardMetrics);
      })
    );
  }
}
