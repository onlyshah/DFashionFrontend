import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
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
    return this.http.get<Category[]>(`${this.apiUrlPublic}/categories`, { headers: this.getHeaders() });
  }

  createCategory(category: any): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrlPublic}/categories`, category, { headers: this.getHeaders() });
  }

  updateCategory(id: string, category: any): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrlPublic}/categories/${id}`, category, { headers: this.getHeaders() });
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrlPublic}/categories/${id}`, { headers: this.getHeaders() });
  }

  getBrands(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/brands`, { headers: this.getHeaders() });
  }

  getUsers(params: any = {}): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`, { params, headers: this.getHeaders() });
  }

  // NOTE: Removed getUsersWithFallback() - use getUsers() instead
  // Demo endpoint fallback has been removed - only real API endpoints are supported

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
   * Get general dashboard data from backend API
   * Maps backend response to frontend DashboardMetrics interface
   */
  getGeneralDashboardData(): Observable<DashboardMetrics> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiUrl}/dashboard/metrics`, { headers }).pipe(
      // Fetch additional recent orders data
      switchMap(response => {
        const dashboardMetrics = this.mapDashboardResponse(response);
        console.log('Dashboard metrics fetched:', dashboardMetrics);
        return this.http.get<any>(`${this.apiUrl}/orders/recent`, { headers }).pipe(
          map(ordersResponse => {
            console.log('Orders response received:', ordersResponse);
            // Extract recentOrders array from nested data structure
            const recentOrders = ordersResponse?.data?.recentOrders || [];
            console.log('Extracted recentOrders:', recentOrders);
            dashboardMetrics.recentOrders = recentOrders;
            return dashboardMetrics;
          }),
          catchError((error) => {
            console.error('Error fetching recent orders:', error);
            // If recent orders fail, still return dashboard with empty orders
            dashboardMetrics.recentOrders = [];
            return of(dashboardMetrics);
          })
        );
      }),
      catchError(error => {
        console.error('Failed to load dashboard metrics:', error?.status, error);
        // Return empty metrics on error - no fallback to demo data
        return of(this.getEmptyDashboardMetrics());
      })
    );
  }

  private mapDashboardResponse(response: any): DashboardMetrics {
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
  }

  private getEmptyDashboardMetrics(): DashboardMetrics {
    return {
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
    } as DashboardMetrics;
  }

  /**
   * Generic GET method for flexible API calls
   */
  get(endpoint: string, options?: any): Observable<any> {
    return this.http.get(`${environment.apiUrl}${endpoint}`, {
      ...options,
      headers: this.getHeaders()
    });
  }

  /**
   * Generic POST method for flexible API calls
   */
  post(endpoint: string, body: any, options?: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}${endpoint}`, body, {
      ...options,
      headers: this.getHeaders()
    });
  }

  /**
   * Generic PUT method for flexible API calls
   */
  put(endpoint: string, body: any, options?: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}${endpoint}`, body, {
      ...options,
      headers: this.getHeaders()
    });
  }

  /**
   * Generic PATCH method for flexible API calls
   */
  patch(endpoint: string, body: any, options?: any): Observable<any> {
    return this.http.patch(`${environment.apiUrl}${endpoint}`, body, {
      ...options,
      headers: this.getHeaders()
    });
  }

  /**
   * Get system logs with filtering and pagination
   */
  getSystemLogs(filters?: { level?: string; module?: string; page?: number; limit?: number }): Observable<any> {
    const params = new HttpParams()
      .set('level', filters?.level || '')
      .set('module', filters?.module || '')
      .set('page', (filters?.page || 1).toString())
      .set('limit', (filters?.limit || 50).toString());

    return this.http.get<any>(`${this.apiUrl}/audit-logs`, { params, headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error fetching system logs:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get audit log details
   */
  getAuditLogDetails(logId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/audit-logs/${logId}`, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error fetching audit log details:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get activity logs with pagination
   */
  getActivityLogs(page: number = 1, limit: number = 25): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<any>(`${this.apiUrl}/activity-logs`, { params, headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error fetching activity logs:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get customers list
   */
  getCustomers(page: number = 1, limit: number = 25): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<any>(`${this.apiUrl}/users/customers`, { params, headers: this.getHeaders() }).pipe(
      map(response => {
        // Normalize response structure: wrap in data if needed
        if (response.success && response.data) {
          return { success: true, data: { users: response.data.users || response.data, pagination: response.data.pagination || {} } };
        }
        return response;
      }),
      catchError(error => {
        console.error('Error fetching customers:', error);
        return of({ success: false, data: { users: [], pagination: {} } });
      })
    );
  }

  /**
   * Get vendors list
   */
  getVendors(page: number = 1, limit: number = 25): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<any>(`${this.apiUrl}/users/vendors`, { params, headers: this.getHeaders() }).pipe(
      map(response => {
        if (response.success && response.data) {
          return { success: true, data: { users: response.data.users || response.data, pagination: response.data.pagination || {} } };
        }
        return response;
      }),
      catchError(error => {
        console.error('Error fetching vendors:', error);
        return of({ success: false, data: { users: [], pagination: {} } });
      })
    );
  }

  /**
   * Get creators list
   */
  getCreators(page: number = 1, limit: number = 25): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<any>(`${this.apiUrl}/users/creators`, { params, headers: this.getHeaders() }).pipe(
      map(response => {
        if (response.success && response.data) {
          return { success: true, data: { users: response.data.users || response.data, pagination: response.data.pagination || {} } };
        }
        return response;
      }),
      catchError(error => {
        console.error('Error fetching creators:', error);
        return of({ success: false, data: { users: [], pagination: {} } });
      })
    );
  }

  /**
   * Get admins list
   */
  getAdmins(page: number = 1, limit: number = 25): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<any>(`${this.apiUrl}/users/admins`, { params, headers: this.getHeaders() }).pipe(
      map(response => {
        if (response.success && response.data) {
          return { success: true, data: { users: response.data.users || response.data, pagination: response.data.pagination || {} } };
        }
        return response;
      }),
      catchError(error => {
        console.error('Error fetching admins:', error);
        return of({ success: false, data: { users: [], pagination: {} } });
      })
    );
  }

  /**
   * Get all departments for dropdowns and management
   */
  getDepartments(page: number = 1, limit: number = 100): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<any>(`${this.apiUrl}/departments`, { params, headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error fetching departments:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update user status (activate/deactivate)
   */
  updateUserStatus(id: string, isActive: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${id}/status`, { isActive }, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error updating user status:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Approve vendor
   */
  approveVendor(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${id}/approve`, {}, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error approving vendor:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Reject vendor
   */
  rejectVendor(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${id}/reject`, {}, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error rejecting vendor:', error);
        return throwError(() => error);
      })
    );
  }

  // ==================== ROLES AND PERMISSIONS ====================

  /**
   * Get all roles
   */
  getRoles(page: number = 1, limit: number = 100): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<any>(`${this.apiUrl}/roles`, { params, headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error fetching roles:', error);
        return of({ success: false, data: [], pagination: {} });
      })
    );
  }

  /**
   * Get all permissions
   */
  getPermissions(page: number = 1, limit: number = 100, module?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (module) {
      params = params.set('module', module);
    }
    return this.http.get<any>(`${this.apiUrl}/permissions`, { params, headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error fetching permissions:', error);
        return of({ success: false, data: [], pagination: {} });
      })
    );
  }

  /**
   * Create new role
   */
  createRole(role: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/roles`, role, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error creating role:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update role
   */
  updateRole(roleId: string, role: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/roles/${roleId}`, role, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error updating role:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete role
   */
  deleteRole(roleId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/roles/${roleId}`, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error deleting role:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create new permission
   */
  createPermission(permission: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/permissions`, permission, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error creating permission:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update permission
   */
  updatePermission(permissionId: string, permission: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/permissions/${permissionId}`, permission, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error updating permission:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete permission
   */
  deletePermission(permissionId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/permissions/${permissionId}`, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error deleting permission:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Generic DELETE method for flexible API calls
   */
  delete(endpoint: string, options?: any): Observable<any> {
    return this.http.delete(`${environment.apiUrl}${endpoint}`, {
      ...options,
      headers: this.getHeaders()
    });
  }
}

