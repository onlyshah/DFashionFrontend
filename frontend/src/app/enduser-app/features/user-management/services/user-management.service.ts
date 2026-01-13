import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../../../../../../environments/environment';

export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  department?: string;
  employeeId?: string;
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  avatar?: string;
  permissions?: string[];
  // Customer-specific fields
  totalOrders?: number;
  totalSpent?: number;
  wishlistCount?: number;
  cartCount?: number;
  // Vendor-specific fields
  businessName?: string;
  businessType?: string;
  commission?: number;
  // Admin-specific fields
  accessLevel?: string;
  managedDepartments?: string[];
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersThisMonth: number;
  newUsersThisWeek: number;
  usersByRole: { [key: string]: number };
  usersByDepartment?: { [key: string]: number };
  userGrowthData?: Array<{ month: string; count: number }>;
}

export interface CustomerData {
  customer: User;
  orderHistory: any[];
  wishlistItems: any[];
  cartItems: any[];
  recentActivity: any[];
  stats: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate?: Date;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private apiUrl = environment.apiUrl;
  private usersSubject = new BehaviorSubject<User[]>([]);
  private statsSubject = new BehaviorSubject<UserStats | null>(null);

  public users$ = this.usersSubject.asObservable();
  public stats$ = this.statsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get all users (Super Admin and Admin access)
   */
  getAllUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    department?: string;
  }): Observable<ApiResponse<{ users: User[]; stats: UserStats }>> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<{ users: User[]; stats: UserStats }>>(
      `${this.apiUrl}/api/users/management/all`,
      { params: httpParams }
    );
  }

  /**
   * Get customer-specific data (Customer access)
   */
  getCustomerData(customerId: string): Observable<ApiResponse<CustomerData>> {
    return this.http.get<ApiResponse<CustomerData>>(
      `${this.apiUrl}/api/users/customer/${customerId}/profile`
    );
  }

  /**
   * Get limited user data based on role (Manager, Vendor access)
   */
  getLimitedUserData(userRole: string, params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Observable<ApiResponse<{ users: User[]; stats: UserStats }>> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<{ users: User[]; stats: UserStats }>>(
      `${this.apiUrl}/api/users/management/limited/${userRole}`,
      { params: httpParams }
    );
  }

  /**
   * Get user by ID
   */
  getUserById(userId: string): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(
      `${this.apiUrl}/api/users/${userId}`
    );
  }

  /**
   * Create new user (Admin access)
   */
  createUser(userData: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(
      `${this.apiUrl}/api/users`,
      userData
    );
  }

  /**
   * Update user (Admin access)
   */
  updateUser(userId: string, userData: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(
      `${this.apiUrl}/api/users/${userId}`,
      userData
    );
  }

  /**
   * Delete user (Super Admin access)
   */
  deleteUser(userId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/api/users/${userId}`
    );
  }

  /**
   * Toggle user status (Admin access)
   */
  toggleUserStatus(userId: string): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(
      `${this.apiUrl}/api/users/${userId}/toggle-status`,
      {}
    );
  }

  /**
   * Get user statistics
   */
  getUserStats(timeframe: string = '30d'): Observable<ApiResponse<UserStats>> {
    return this.http.get<ApiResponse<UserStats>>(
      `${this.apiUrl}/api/users/stats`,
      { params: { timeframe } }
    );
  }

  /**
   * Get users by role
   */
  getUsersByRole(role: string, params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Observable<ApiResponse<{ users: User[]; stats: UserStats }>> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<{ users: User[]; stats: UserStats }>>(
      `${this.apiUrl}/api/users/role/${role}`,
      { params: httpParams }
    );
  }

  /**
   * Get users by department (Admin access)
   */
  getUsersByDepartment(department: string): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(
      `${this.apiUrl}/api/users/department/${department}`
    );
  }

  /**
   * Bulk update users (Super Admin access)
   */
  bulkUpdateUsers(userIds: string[], updateData: Partial<User>): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${this.apiUrl}/api/users/bulk-update`,
      { userIds, updateData }
    );
  }

  /**
   * Export users data (Admin access)
   */
  exportUsers(format: 'csv' | 'excel' = 'csv', filters?: any): Observable<Blob> {
    let httpParams = new HttpParams().set('format', format);
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get(
      `${this.apiUrl}/api/users/export`,
      { 
        params: httpParams,
        responseType: 'blob'
      }
    );
  }

  /**
   * Get user activity logs (Admin access)
   */
  getUserActivityLogs(userId: string, params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Observable<ApiResponse<any[]>> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/api/users/${userId}/activity-logs`,
      { params: httpParams }
    );
  }

  /**
   * Reset user password (Admin access)
   */
  resetUserPassword(userId: string, newPassword?: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/api/users/${userId}/reset-password`,
      { newPassword }
    );
  }

  /**
   * Send user invitation (Admin access)
   */
  sendUserInvitation(email: string, role: string, additionalData?: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/api/users/invite`,
      { email, role, ...additionalData }
    );
  }

  /**
   * Update local users state
   */
  updateUsers(users: User[]): void {
    this.usersSubject.next(users);
  }

  /**
   * Update local stats state
   */
  updateStats(stats: UserStats): void {
    this.statsSubject.next(stats);
  }

  /**
   * Get current users from local state
   */
  getCurrentUsers(): User[] {
    return this.usersSubject.value;
  }

  /**
   * Get current stats from local state
   */
  getCurrentStats(): UserStats | null {
    return this.statsSubject.value;
  }
}
