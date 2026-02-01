import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'super_admin' | 'moderator' | 'support_agent';
  permissions: string[];
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: Date;
  createdDate: Date;
  createdBy: string;
  updatedDate?: Date;
  updatedBy?: string;
  department?: string;
  manager?: string;
  notes?: string;
}

export interface AdminUsersResponse {
  admins: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateAdminRequest {
  name: string;
  email: string;
  phone?: string;
  role: string;
  permissions: string[];
  department?: string;
  manager?: string;
}

export interface UpdateAdminRequest {
  name?: string;
  role?: string;
  permissions?: string[];
  status?: string;
  department?: string;
  manager?: string;
  notes?: string;
}

export interface AdminFilters {
  role?: string;
  status?: string;
  department?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {
  private readonly API_URL = environment.apiUrl + '/api';

  constructor(private http: HttpClient) {}

  /**
   * Get all admin users (super admin only)
   */
  getAdmins(filters: AdminFilters = {}): Observable<AdminUsersResponse> {
    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    console.log('[AdminUserService] Fetching admin users with filters:', filters);
    return this.http.get<AdminUsersResponse>(`${this.API_URL}/super-admin/admins`, { params })
      .pipe(
        tap(response => {
          console.log('[AdminUserService] API Response (getAdmins):', response);
          console.log('[AdminUserService] Total admins:', response.total);
        })
      );
  }

  /**
   * Get a specific admin user by ID
   */
  getAdmin(adminId: string): Observable<{ admin: AdminUser }> {
    console.log('[AdminUserService] Fetching admin user by ID:', adminId);
    return this.http.get<{ admin: AdminUser }>(`${this.API_URL}/super-admin/admins/${adminId}`)
      .pipe(
        tap(response => {
          console.log('[AdminUserService] API Response (getAdmin):', response);
          console.log('[AdminUserService] Admin loaded:', response.admin?.name);
        })
      );
  }

  /**
   * Create a new admin user
   */
  createAdmin(data: CreateAdminRequest): Observable<{ message: string; admin: AdminUser }> {
    console.log('[AdminUserService] Creating admin user:', data);
    return this.http.post<{ message: string; admin: AdminUser }>(`${this.API_URL}/super-admin/admins`, data)
      .pipe(
        tap(response => {
          console.log('[AdminUserService] API Response (createAdmin):', response);
          console.log('[AdminUserService] Admin created:', response.admin?.name);
        })
      );
  }

  /**
   * Update an admin user
   */
  updateAdmin(adminId: string, data: UpdateAdminRequest): Observable<{ message: string; admin: AdminUser }> {
    console.log('[AdminUserService] Updating admin user:', adminId, 'with data:', data);
    return this.http.put<{ message: string; admin: AdminUser }>(`${this.API_URL}/super-admin/admins/${adminId}`, data)
      .pipe(
        tap(response => {
          console.log('[AdminUserService] API Response (updateAdmin):', response);
          console.log('[AdminUserService] Admin updated:', response.admin?.name);
        })
      );
  }

  /**
   * Delete an admin user
   */
  deleteAdmin(adminId: string): Observable<{ message: string }> {
    console.log('[AdminUserService] Deleting admin user:', adminId);
    return this.http.delete<{ message: string }>(`${this.API_URL}/super-admin/admins/${adminId}`)
      .pipe(
        tap(response => {
          console.log('[AdminUserService] API Response (deleteAdmin):', response);
          console.log('[AdminUserService] Admin deleted');
        })
      );
  }

  /**
   * Suspend an admin user
   */
  suspendAdmin(adminId: string, reason?: string): Observable<{ message: string; admin: AdminUser }> {
    console.log('[AdminUserService] Suspending admin user:', adminId);
    return this.http.post<{ message: string; admin: AdminUser }>(`${this.API_URL}/super-admin/admins/${adminId}/suspend`, { reason })
      .pipe(
        tap(response => {
          console.log('[AdminUserService] API Response (suspendAdmin):', response);
        })
      );
  }

  /**
   * Reactivate a suspended admin user
   */
  reactivateAdmin(adminId: string): Observable<{ message: string; admin: AdminUser }> {
    console.log('[AdminUserService] Reactivating admin user:', adminId);
    return this.http.post<{ message: string; admin: AdminUser }>(`${this.API_URL}/super-admin/admins/${adminId}/reactivate`, {})
      .pipe(
        tap(response => {
          console.log('[AdminUserService] API Response (reactivateAdmin):', response);
        })
      );
  }

  /**
   * Update admin permissions
   */
  updateAdminPermissions(adminId: string, permissions: string[]): Observable<{ message: string; admin: AdminUser }> {
    console.log('[AdminUserService] Updating admin permissions for:', adminId);
    return this.http.put<{ message: string; admin: AdminUser }>(`${this.API_URL}/super-admin/admins/${adminId}/permissions`, { permissions })
      .pipe(
        tap(response => {
          console.log('[AdminUserService] API Response (updateAdminPermissions):', response);
        })
      );
  }

  /**
   * Get available roles
   */
  getAvailableRoles(): Observable<{ roles: string[] }> {
    console.log('[AdminUserService] Fetching available roles');
    return this.http.get<{ roles: string[] }>(`${this.API_URL}/super-admin/admins/roles`)
      .pipe(
        tap(response => {
          console.log('[AdminUserService] API Response (getAvailableRoles):', response);
        })
      );
  }

  /**
   * Get available permissions
   */
  getAvailablePermissions(): Observable<{ permissions: string[] }> {
    console.log('[AdminUserService] Fetching available permissions');
    return this.http.get<{ permissions: string[] }>(`${this.API_URL}/super-admin/admins/permissions`)
      .pipe(
        tap(response => {
          console.log('[AdminUserService] API Response (getAvailablePermissions):', response);
        })
      );
  }

  /**
   * Reset admin password (send reset link)
   */
  resetAdminPassword(adminId: string): Observable<{ message: string }> {
    console.log('[AdminUserService] Sending password reset for admin:', adminId);
    return this.http.post<{ message: string }>(`${this.API_URL}/super-admin/admins/${adminId}/reset-password`, {})
      .pipe(
        tap(response => {
          console.log('[AdminUserService] API Response (resetAdminPassword):', response);
        })
      );
  }

  /**
   * Search admin users
   */
  searchAdmins(query: string): Observable<AdminUsersResponse> {
    console.log('[AdminUserService] Searching admin users with query:', query);
    let params = new HttpParams();
    params = params.set('search', query);
    return this.http.get<AdminUsersResponse>(`${this.API_URL}/super-admin/admins`, { params })
      .pipe(
        tap(response => {
          console.log('[AdminUserService] API Response (searchAdmins):', response);
        })
      );
  }
}
