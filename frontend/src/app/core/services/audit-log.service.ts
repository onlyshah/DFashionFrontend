import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

export interface AuditLog {
  _id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  resource: {
    type: string;
    id: string;
    name?: string;
  };
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure';
  errorMessage?: string;
  duration?: number; // milliseconds
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ActivityTimeline {
  date: Date;
  activities: AuditLog[];
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  module?: string;
  resourceType?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private readonly API_URL = environment.apiUrl + '/api';

  constructor(private http: HttpClient) {}

  /**
   * Get all audit logs (super admin only)
   */
  getAuditLogs(filters: AuditLogFilters = {}): Observable<AuditLogsResponse> {
    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        if (value instanceof Date) {
          params = params.set(key, value.toISOString());
        } else {
          params = params.set(key, value.toString());
        }
      }
    });

    console.log('[AuditLogService] Fetching audit logs with filters:', filters);
    return this.http.get<AuditLogsResponse>(`${this.API_URL}/super-admin/audit-logs`, { params })
      .pipe(
        tap(response => {
          console.log('[AuditLogService] API Response (getAuditLogs):', response);
          console.log('[AuditLogService] Total logs:', response.total);
        })
      );
  }

  /**
   * Get audit logs for a specific user
   */
  getUserAuditLogs(userId: string, filters: AuditLogFilters = {}): Observable<AuditLogsResponse> {
    filters.userId = userId;
    console.log('[AuditLogService] Fetching audit logs for user:', userId);
    return this.getAuditLogs(filters);
  }

  /**
   * Get audit logs for a specific resource
   */
  getResourceAuditLogs(resourceType: string, resourceId: string): Observable<AuditLogsResponse> {
    let params = new HttpParams();
    params = params.set('resourceType', resourceType);
    params = params.set('resourceId', resourceId);

    console.log('[AuditLogService] Fetching audit logs for resource:', resourceType, resourceId);
    return this.http.get<AuditLogsResponse>(`${this.API_URL}/super-admin/audit-logs/resource`, { params })
      .pipe(
        tap(response => {
          console.log('[AuditLogService] API Response (getResourceAuditLogs):', response);
        })
      );
  }

  /**
   * Get activity timeline (grouped by date)
   */
  getActivityTimeline(filters: AuditLogFilters = {}): Observable<{ timeline: ActivityTimeline[] }> {
    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        if (value instanceof Date) {
          params = params.set(key, value.toISOString());
        } else {
          params = params.set(key, value.toString());
        }
      }
    });

    console.log('[AuditLogService] Fetching activity timeline');
    return this.http.get<{ timeline: ActivityTimeline[] }>(`${this.API_URL}/super-admin/audit-logs/timeline`, { params })
      .pipe(
        tap(response => {
          console.log('[AuditLogService] API Response (getActivityTimeline):', response);
        })
      );
  }

  /**
   * Get audit log statistics
   */
  getStatistics(startDate?: Date, endDate?: Date): Observable<{ statistics: any }> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate.toISOString());
    if (endDate) params = params.set('endDate', endDate.toISOString());

    console.log('[AuditLogService] Fetching audit log statistics');
    return this.http.get<{ statistics: any }>(`${this.API_URL}/super-admin/audit-logs/statistics`, { params })
      .pipe(
        tap(response => {
          console.log('[AuditLogService] API Response (getStatistics):', response);
        })
      );
  }

  /**
   * Export audit logs as CSV/Excel
   */
  exportAuditLogs(filters: AuditLogFilters = {}, format: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        if (value instanceof Date) {
          params = params.set(key, value.toISOString());
        } else {
          params = params.set(key, value.toString());
        }
      }
    });

    params = params.set('format', format);

    console.log('[AuditLogService] Exporting audit logs as:', format);
    return this.http.get(`${this.API_URL}/super-admin/audit-logs/export`, { params, responseType: 'blob' })
      .pipe(
        tap(() => {
          console.log('[AuditLogService] Audit logs exported');
        })
      );
  }

  /**
   * Get audit log detail by ID
   */
  getAuditLogDetail(logId: string): Observable<{ log: AuditLog }> {
    console.log('[AuditLogService] Fetching audit log detail:', logId);
    return this.http.get<{ log: AuditLog }>(`${this.API_URL}/super-admin/audit-logs/${logId}`)
      .pipe(
        tap(response => {
          console.log('[AuditLogService] API Response (getAuditLogDetail):', response);
        })
      );
  }

  /**
   * Search audit logs
   */
  searchAuditLogs(query: string, filters: AuditLogFilters = {}): Observable<AuditLogsResponse> {
    console.log('[AuditLogService] Searching audit logs with query:', query);
    const searchFilters = { ...filters };
    let params = new HttpParams();
    params = params.set('q', query);

    Object.keys(searchFilters).forEach(key => {
      const value = (searchFilters as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<AuditLogsResponse>(`${this.API_URL}/super-admin/audit-logs/search`, { params })
      .pipe(
        tap(response => {
          console.log('[AuditLogService] API Response (searchAuditLogs):', response);
        })
      );
  }

  /**
   * Get available actions for filtering
   */
  getAvailableActions(): Observable<{ actions: string[] }> {
    console.log('[AuditLogService] Fetching available actions');
    return this.http.get<{ actions: string[] }>(`${this.API_URL}/super-admin/audit-logs/actions`)
      .pipe(
        tap(response => {
          console.log('[AuditLogService] API Response (getAvailableActions):', response);
        })
      );
  }

  /**
   * Get available modules for filtering
   */
  getAvailableModules(): Observable<{ modules: string[] }> {
    console.log('[AuditLogService] Fetching available modules');
    return this.http.get<{ modules: string[] }>(`${this.API_URL}/super-admin/audit-logs/modules`)
      .pipe(
        tap(response => {
          console.log('[AuditLogService] API Response (getAvailableModules):', response);
        })
      );
  }
}
