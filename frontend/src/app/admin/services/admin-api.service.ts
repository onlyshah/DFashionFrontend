import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AdminAuthService } from './admin-auth.service';
import { AuthService } from '../../core/services/auth.service';

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

  constructor(
    private http: HttpClient,
    private adminAuth: AdminAuthService,
    private authService: AuthService
  ) {}

  /**
   * âœ… NOTE: Authorization headers are handled by authInterceptor
   * No need to manually add headers in this service
   * All HTTP requests automatically get Bearer token via interceptor
   */

  getProducts(params: any = {}): Observable<any> {
    console.log('ðŸ“¡ API Call: GET /api/admin/products', params);
    return this.http.get(`${this.apiUrl}/products`, { params }).pipe(
      catchError(error => {
        console.error('âŒ Error fetching products:', error);
        return of({ success: false, data: [] });
      })
    );
  }

  createProduct(product: any): Observable<any> {
    console.log('ðŸ“¡ API Call: POST /api/admin/products', product);
    return this.http.post(`${this.apiUrl}/products`, product).pipe(
      catchError(error => {
        console.error('âŒ Error creating product:', error);
        return of({ success: false, error: error.message });
      })
    );
  }

  updateProduct(id: string, product: any): Observable<any> {
    console.log(`ðŸ“¡ API Call: PUT /api/admin/products/${id}`, product);
    return this.http.put(`${this.apiUrl}/products/${id}`, product).pipe(
      catchError(error => {
        console.error('âŒ Error updating product:', error);
        return of({ success: false, error: error.message });
      })
    );
  }

  deleteProduct(id: string): Observable<any> {
    console.log(`ðŸ“¡ API Call: DELETE /api/admin/products/${id}`);
    return this.http.delete(`${this.apiUrl}/products/${id}`).pipe(
      catchError(error => {
        console.error('âŒ Error deleting product:', error);
        return of({ success: false, error: error.message });
      })
    );
  }

  getCategories(): Observable<any[]> {
    console.log('ðŸ“¡ API Call: GET /api/categories');
    return this.http.get<any[]>(`${this.apiUrlPublic}/categories`).pipe(
      catchError(error => {
        console.error('âŒ Error fetching categories:', error);
        return of([]);
      })
    );
  }

  createCategory(category: any): Observable<any> {
    console.log('ðŸ“¡ API Call: POST /api/categories', category);
    return this.http.post<any>(`${this.apiUrlPublic}/categories`, category).pipe(
      catchError(error => {
        console.error('âŒ Error creating category:', error);
        return of({ success: false, error: error.message });
      })
    );
  }

  updateCategory(id: string, category: any): Observable<any> {
    console.log(`ðŸ“¡ API Call: PUT /api/categories/${id}`, category);
    return this.http.put<any>(`${this.apiUrlPublic}/categories/${id}`, category).pipe(
      catchError(error => {
        console.error('âŒ Error updating category:', error);
        return of({ success: false, error: error.message });
      })
    );
  }

  deleteCategory(id: string): Observable<any> {
    console.log(`ðŸ“¡ API Call: DELETE /api/categories/${id}`);
    return this.http.delete(`${this.apiUrlPublic}/categories/${id}`).pipe(
      catchError(error => {
        console.error('âŒ Error deleting category:', error);
        return of({ success: false, error: error.message });
      })
    );
  }

  /**
   * Get all categories with nested sub-categories (Admin view)
   */
  getAdminCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories`).pipe(
      catchError(error => {
        console.error('Error fetching admin categories:', error);
        return of({ success: false, data: [], error: error.message });
      })
    );
  }

  /**
   * Get sub-categories for a specific category
   */
  getSubCategories(categoryId: number | string): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories/${categoryId}/subcategories`).pipe(
      catchError(error => {
        console.error(`Error fetching sub-categories for category ${categoryId}:`, error);
        return of({ success: false, data: [], categoryId, error: error.message });
      })
    );
  }

  /**
   * Create a new category
   */
  createAdminCategory(category: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/categories`, category).pipe(
      catchError(error => {
        console.error('Error creating category:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create a new sub-category
   */
  createSubCategory(categoryId: number | string, subCategory: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/categories/${categoryId}/sub-categories`, subCategory).pipe(
      catchError(error => {
        console.error(`Error creating sub-category for category ${categoryId}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update a category
   */
  updateAdminCategory(categoryId: number | string, category: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/categories/${categoryId}`, category).pipe(
      catchError(error => {
        console.error(`Error updating category ${categoryId}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a category
   */
  deleteAdminCategory(categoryId: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${categoryId}`).pipe(
      catchError(error => {
        console.error(`Error deleting category ${categoryId}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update a sub-category
   */
  updateSubCategory(categoryId: number | string, subCategoryId: number | string, subCategory: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/categories/${categoryId}/sub-categories/${subCategoryId}`, subCategory).pipe(
      catchError(error => {
        console.error(`Error updating sub-category ${subCategoryId}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a sub-category
   */
  deleteSubCategory(categoryId: number | string, subCategoryId: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${categoryId}/sub-categories/${subCategoryId}`).pipe(
      catchError(error => {
        console.error(`Error deleting sub-category ${subCategoryId}:`, error);
        return throwError(() => error);
      })
    );
  }

  getBrands(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/brands`);
  }

  // NOTE: Removed getUsersWithFallback() - use getUsers() instead
  // Demo endpoint fallback has been removed - only real API endpoints are supported

  createUser(user: any): Observable<any> {
    console.log('ðŸ“¡ API Call: POST /api/admin/users', user);
    return this.http.post(`${this.apiUrl}/users`, user).pipe(
      catchError(error => {
        console.error('âŒ Error creating user:', error);
        return of({ success: false, error: error.message });
      })
    );
  }

  updateUser(id: string, user: any): Observable<any> {
    console.log(`ðŸ“¡ API Call: PUT /api/admin/users/${id}`, user);
    return this.http.put(`${this.apiUrl}/users/${id}`, user).pipe(
      catchError(error => {
        console.error('âŒ Error updating user:', error);
        return of({ success: false, error: error.message });
      })
    );
  }

  deleteUser(id: string): Observable<any> {
    console.log(`ðŸ“¡ API Call: DELETE /api/admin/users/${id}`);
    return this.http.delete(`${this.apiUrl}/users/${id}`).pipe(
      catchError(error => {
        console.error('âŒ Error deleting user:', error);
        return of({ success: false, error: error.message });
      })
    );
  }

  activateUser(id: string): Observable<any> {
    console.log(`ðŸ“¡ API Call: PUT /api/admin/users/${id}/activate`);
    return this.http.put(`${this.apiUrl}/users/${id}/activate`, {}).pipe(
      catchError(error => {
        console.error('âŒ Error activating user:', error);
        return of({ success: false, error: error.message });
      })
    );
  }

  getSuperAdminStats(): Observable<any> {
    console.log('ðŸ“¡ API Call: GET /api/admin/dashboard/super-admin');
    return this.http.get(`${this.apiUrl}/dashboard/super-admin`);
  }

  /**
   * Get dashboard metrics
   */
  getDashboardMetrics(): Observable<any> {
    console.log('ðŸ“¡ API Call: GET /api/admin/dashboard/metrics');
    return this.http.get<any>(`${this.apiUrl}/dashboard/metrics`).pipe(
      catchError(error => {
        console.error('âŒ Error fetching dashboard metrics:', error);
        return of({ success: false, data: {} });
      })
    );
  }

  /**
   * Get orders list
   */
  getOrders(params: any = {}): Observable<any> {
    console.log('ðŸ“¡ API Call: GET /api/admin/orders', params);
    return this.http.get<any>(`${this.apiUrl}/orders`, { params }).pipe(
      catchError(error => {
        console.error('âŒ Error fetching orders:', error);
        return of({ success: false, data: [] });
      })
    );
  }

  /**
   * Get general dashboard data from backend API
   * Maps backend response to frontend DashboardMetrics interface
   */
  getGeneralDashboardData(): Observable<DashboardMetrics> {
    return this.http.get<any>(`${this.apiUrl}/dashboard/metrics`).pipe(
      // Fetch additional recent orders data
      switchMap(response => {
        const dashboardMetrics = this.mapDashboardResponse(response);
        console.log('Dashboard metrics fetched:', dashboardMetrics);
        return this.http.get<any>(`${this.apiUrl}/orders/recent`).pipe(
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
    return this.http.get(`${this.apiUrl}${endpoint}`, {
      ...options
    });
  }

  /**
   * Generic POST method for flexible API calls
   */
  post(endpoint: string, body: any, options?: any): Observable<any> {
    return this.http.post(`${this.apiUrl}${endpoint}`, body, {
      ...options
    });
  }

  /**
   * Generic PUT method for flexible API calls
   */
  put(endpoint: string, body: any, options?: any): Observable<any> {
    return this.http.put(`${this.apiUrl}${endpoint}`, body, {
      ...options
    });
  }

  /**
   * Generic PATCH method for flexible API calls
   */
  patch(endpoint: string, body: any, options?: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}${endpoint}`, body, {
      ...options
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

    return this.http.get<any>(`${this.apiUrl}/audit-logs`, { params }).pipe(
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
    return this.http.get<any>(`${this.apiUrl}/audit-logs/${logId}`).pipe(
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

    return this.http.get<any>(`${this.apiUrl}/activity-logs`, { params }).pipe(
      catchError(error => {
        console.error('Error fetching activity logs:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get all users list
   */
  getUsers(options: { page?: number; limit?: number; search?: string; role?: string; department?: string; isActive?: string; sortBy?: string; sortOrder?: string } = {}): Observable<any> {
    const params = new HttpParams()
      .set('page', (options.page || 1).toString())
      .set('limit', (options.limit || 25).toString())
      .set('search', options.search || '')
      .set('role', options.role || '')
      .set('department', options.department || '')
      .set('isActive', options.isActive || '')
      .set('sortBy', options.sortBy || '')
      .set('sortOrder', options.sortOrder || '');

    return this.http.get<any>(`${this.apiUrl}/users`, { params }).pipe(
      map(response => {
        // Normalize response structure: wrap users in data property for consistency
        if (response.success && response.data) {
          return { success: true, data: response.data.users || response.data };
        }
        return response;
      }),
      catchError(error => {
        console.error('Error fetching users:', error);
        return of({ success: false, data: [] });
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

    return this.http.get<any>(`${this.apiUrl}/users/vendors`, { params }).pipe(
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

    return this.http.get<any>(`${this.apiUrl}/users/creators`, { params }).pipe(
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

    return this.http.get<any>(`${this.apiUrl}/users/admins`, { params }).pipe(
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

    return this.http.get<any>(`${this.apiUrl}/departments`, { params }).pipe(
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
    return this.http.patch(`${this.apiUrl}/users/${id}/status`, { isActive }).pipe(
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
    return this.http.patch(`${this.apiUrl}/users/${id}/approve`, {}).pipe(
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
    return this.http.patch(`${this.apiUrl}/users/${id}/reject`, {}).pipe(
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
    return this.http.get<any>(`${this.apiUrl}/roles`, { params }).pipe(
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
    return this.http.get<any>(`${this.apiUrl}/permissions`, { params }).pipe(
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
    return this.http.post<any>(`${this.apiUrl}/roles`, role).pipe(
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
    return this.http.put<any>(`${this.apiUrl}/roles/${roleId}`, role).pipe(
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
    return this.http.delete<any>(`${this.apiUrl}/roles/${roleId}`).pipe(
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
    return this.http.post<any>(`${this.apiUrl}/permissions`, permission).pipe(
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
    return this.http.put<any>(`${this.apiUrl}/permissions/${permissionId}`, permission).pipe(
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
    return this.http.delete<any>(`${this.apiUrl}/permissions/${permissionId}`).pipe(
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
    return this.http.delete(`${this.apiUrl}${endpoint}`, {
      ...options
    });
  }

  // ==================== CUSTOMER MANAGEMENT ====================

  /**
   * Get aggregated customers list (EndUsers only) with metrics
   */
  getCustomers(params: any = {}): Observable<any> {
    console.log('ðŸ“¡ API Call: GET /api/admin/users/customers', params);
    const httpParams = new HttpParams()
      .set('page', (params.page || 1).toString())
      .set('limit', (params.limit || 25).toString())
      .set('search', params.search || '')
      .set('status', params.status || '');

    return this.http.get<any>(`${this.apiUrl}/users/customers`, { params: httpParams }).pipe(
      catchError(error => {
        console.error('âŒ Error fetching customers:', error);
        return of({ success: false, data: [] });
      })
    );
  }

  /**
   * Block a customer
   */
  blockCustomer(customerId: string): Observable<any> {
    console.log(`ðŸ“¡ API Call: PATCH /api/admin/users/customers/${customerId}/block`);
    return this.http.patch(`${this.apiUrl}/users/customers/${customerId}/block`, {}).pipe(
      catchError(error => {
        console.error(`âŒ Error blocking customer:`, error);
        return of({ success: false, error: error.message });
      })
    );
  }

  /**
   * Unblock a customer
   */
  unblockCustomer(customerId: string): Observable<any> {
    console.log(`ðŸ“¡ API Call: PATCH /api/admin/users/customers/${customerId}/unblock`);
    return this.http.patch(`${this.apiUrl}/users/customers/${customerId}/unblock`, {}).pipe(
      catchError(error => {
        console.error(`âŒ Error unblocking customer:`, error);
        return of({ success: false, error: error.message });
      })
    );
  }

  /**
   * Block or Unblock customer (wrapper method)
   */
  blockUnblockCustomer(customerId: string, endpoint: 'block' | 'unblock'): Observable<any> {
    return endpoint === 'block' ? this.blockCustomer(customerId) : this.unblockCustomer(customerId);
  }

  /**
   * Reset customer password
   */
  resetCustomerPassword(customerId: string, newPassword: string): Observable<any> {
    console.log(`ðŸ“¡ API Call: POST /api/admin/users/customers/${customerId}/reset-password`);
    return this.http.post(
      `${this.apiUrl}/users/customers/${customerId}/reset-password`,
      { password: newPassword }
    ).pipe(
      catchError(error => {
        console.error(`âŒ Error resetting customer password:`, error);
        return of({ success: false, error: error.message });
      })
    );
  }

  /**
   * Get customer posts
   */
  getCustomerPosts(customerId: string, page: number = 1, limit: number = 25): Observable<any> {
    console.log(`ðŸ“¡ API Call: GET /api/admin/users/customers/${customerId}/posts`);
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<any>(`${this.apiUrl}/users/customers/${customerId}/posts`, { params }).pipe(
      catchError(error => {
        console.error(`âŒ Error fetching customer posts:`, error);
        return of({ success: false, data: [] });
      })
    );
  }

  /**
   * Delete a customer post
   */
  deleteCustomerPost(customerId: string, postId: string): Observable<any> {
    console.log(`ðŸ“¡ API Call: DELETE /api/admin/users/customers/${customerId}/posts/${postId}`);
    return this.http.delete(`${this.apiUrl}/users/customers/${customerId}/posts/${postId}`).pipe(
      catchError(error => {
        console.error(`âŒ Error deleting customer post:`, error);
        return of({ success: false, error: error.message });
      })
    );
  }

  /**
   * Get customer engagement metrics
   */
  getCustomerEngagement(customerId: string): Observable<any> {
    console.log(`ðŸ“¡ API Call: GET /api/admin/users/customers/${customerId}/engagement`);
    return this.http.get<any>(`${this.apiUrl}/users/customers/${customerId}/engagement`).pipe(
      catchError(error => {
        console.error(`âŒ Error fetching customer engagement:`, error);
        return of({ success: false, data: {} });
      })
    );
  }

  /**
   * Update customer details
   */
  updateCustomer(customerId: string, customerData: any): Observable<any> {
    console.log(`ðŸ“¡ API Call: PATCH /api/admin/users/customers/${customerId}`, customerData);
    return this.http.patch(`${this.apiUrl}/users/customers/${customerId}`, customerData).pipe(
      catchError(error => {
        console.error(`âŒ Error updating customer:`, error);
        return of({ success: false, error: error.message });
      })
    );
  }

  /**
   * Delete a customer (soft delete)
   */
  deleteCustomer(customerId: string): Observable<any> {
    console.log(`ðŸ“¡ API Call: DELETE /api/admin/users/customers/${customerId}`);
    return this.http.delete(`${this.apiUrl}/users/customers/${customerId}`).pipe(
      catchError(error => {
        console.error(`âŒ Error deleting customer:`, error);
        return of({ success: false, error: error.message });
      })
    );
  }
}



