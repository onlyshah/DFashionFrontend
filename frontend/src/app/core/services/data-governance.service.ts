import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

export interface DataGovernanceRequest {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  requestType: 'data-export' | 'data-deletion' | 'consent-update' | 'rectification' | 'restriction';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  requestedDate: Date;
  completionDeadline: Date;
  completedDate?: Date;
  reason?: string;
  additionalInfo?: string;
  attachments?: string[];
  notes?: string;
}

export interface DataGovernanceResponse {
  requests: DataGovernanceRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ConsentRecord {
  _id: string;
  userId: string;
  consentType: 'marketing' | 'analytics' | 'profiling' | 'cookies' | 'data-sharing';
  given: boolean;
  givenDate: Date;
  revokedDate?: Date;
  source: string;
  metadata?: any;
}

export interface GDPRExportRequest {
  userId: string;
  dataCategories?: string[];
  format?: 'json' | 'csv' | 'pdf';
}

export interface CreateDataGovernanceRequest {
  requestType: string;
  reason?: string;
  additionalInfo?: string;
}

export interface DataGovernanceFilters {
  requestType?: string;
  status?: string;
  priority?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DataGovernanceService {
  private readonly API_URL = environment.apiUrl + '/api';

  constructor(private http: HttpClient) {}

  /**
   * Get all data governance requests (super admin only)
   */
  getRequests(filters: DataGovernanceFilters = {}): Observable<DataGovernanceResponse> {
    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    console.log('[DataGovernanceService] Fetching data governance requests with filters:', filters);
    return this.http.get<DataGovernanceResponse>(`${this.API_URL}/super-admin/data-governance`, { params })
      .pipe(
        tap(response => {
          console.log('[DataGovernanceService] API Response (getRequests):', response);
          console.log('[DataGovernanceService] Total requests:', response.total);
        })
      );
  }

  /**
   * Get a specific data governance request
   */
  getRequest(requestId: string): Observable<{ request: DataGovernanceRequest }> {
    console.log('[DataGovernanceService] Fetching data governance request by ID:', requestId);
    return this.http.get<{ request: DataGovernanceRequest }>(`${this.API_URL}/super-admin/data-governance/${requestId}`)
      .pipe(
        tap(response => {
          console.log('[DataGovernanceService] API Response (getRequest):', response);
        })
      );
  }

  /**
   * Create a data governance request (user-initiated)
   */
  createRequest(data: CreateDataGovernanceRequest): Observable<{ message: string; request: DataGovernanceRequest }> {
    console.log('[DataGovernanceService] Creating data governance request:', data);
    return this.http.post<{ message: string; request: DataGovernanceRequest }>(`${this.API_URL}/data-governance`, data)
      .pipe(
        tap(response => {
          console.log('[DataGovernanceService] API Response (createRequest):', response);
          console.log('[DataGovernanceService] Request created:', response.request?._id);
        })
      );
  }

  /**
   * Approve a data governance request
   */
  approveRequest(requestId: string, notes?: string): Observable<{ message: string; request: DataGovernanceRequest }> {
    console.log('[DataGovernanceService] Approving data governance request:', requestId);
    return this.http.post<{ message: string; request: DataGovernanceRequest }>(`${this.API_URL}/super-admin/data-governance/${requestId}/approve`, { notes })
      .pipe(
        tap(response => {
          console.log('[DataGovernanceService] API Response (approveRequest):', response);
        })
      );
  }

  /**
   * Reject a data governance request
   */
  rejectRequest(requestId: string, reason: string): Observable<{ message: string; request: DataGovernanceRequest }> {
    console.log('[DataGovernanceService] Rejecting data governance request:', requestId);
    return this.http.post<{ message: string; request: DataGovernanceRequest }>(`${this.API_URL}/super-admin/data-governance/${requestId}/reject`, { reason })
      .pipe(
        tap(response => {
          console.log('[DataGovernanceService] API Response (rejectRequest):', response);
        })
      );
  }

  /**
   * Export user data (for GDPR)
   */
  exportUserData(userId: string, format: 'json' | 'csv' | 'pdf' = 'json'): Observable<Blob> {
    let params = new HttpParams();
    params = params.set('format', format);

    console.log('[DataGovernanceService] Exporting user data for user:', userId, 'in format:', format);
    return this.http.get(`${this.API_URL}/super-admin/data-governance/export/${userId}`, { params, responseType: 'blob' })
      .pipe(
        tap(() => {
          console.log('[DataGovernanceService] User data exported');
        })
      );
  }

  /**
   * Delete user data (right to be forgotten)
   */
  deleteUserData(userId: string, reason?: string): Observable<{ message: string }> {
    console.log('[DataGovernanceService] Deleting user data for user:', userId);
    return this.http.post<{ message: string }>(`${this.API_URL}/super-admin/data-governance/delete/${userId}`, { reason })
      .pipe(
        tap(response => {
          console.log('[DataGovernanceService] API Response (deleteUserData):', response);
        })
      );
  }

  /**
   * Get user consent records
   */
  getUserConsents(userId: string): Observable<{ consents: ConsentRecord[] }> {
    console.log('[DataGovernanceService] Fetching consent records for user:', userId);
    return this.http.get<{ consents: ConsentRecord[] }>(`${this.API_URL}/data-governance/consents/${userId}`)
      .pipe(
        tap(response => {
          console.log('[DataGovernanceService] API Response (getUserConsents):', response);
          console.log('[DataGovernanceService] Total consents:', response.consents?.length);
        })
      );
  }

  /**
   * Update user consents
   */
  updateConsents(userId: string, consents: { consentType: string; given: boolean }[]): Observable<{ message: string }> {
    console.log('[DataGovernanceService] Updating consents for user:', userId);
    return this.http.put<{ message: string }>(`${this.API_URL}/data-governance/consents/${userId}`, { consents })
      .pipe(
        tap(response => {
          console.log('[DataGovernanceService] API Response (updateConsents):', response);
        })
      );
  }

  /**
   * Get data processing agreements
   */
  getDataProcessingAgreements(): Observable<{ agreements: any[] }> {
    console.log('[DataGovernanceService] Fetching data processing agreements');
    return this.http.get<{ agreements: any[] }>(`${this.API_URL}/super-admin/data-governance/dpa`)
      .pipe(
        tap(response => {
          console.log('[DataGovernanceService] API Response (getDataProcessingAgreements):', response);
        })
      );
  }

  /**
   * Get data retention policies
   */
  getRetentionPolicies(): Observable<{ policies: any[] }> {
    console.log('[DataGovernanceService] Fetching data retention policies');
    return this.http.get<{ policies: any[] }>(`${this.API_URL}/super-admin/data-governance/retention-policies`)
      .pipe(
        tap(response => {
          console.log('[DataGovernanceService] API Response (getRetentionPolicies):', response);
        })
      );
  }

  /**
   * Get GDPR compliance report
   */
  getComplianceReport(startDate?: Date, endDate?: Date): Observable<{ report: any }> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate.toISOString());
    if (endDate) params = params.set('endDate', endDate.toISOString());

    console.log('[DataGovernanceService] Fetching GDPR compliance report');
    return this.http.get<{ report: any }>(`${this.API_URL}/super-admin/data-governance/compliance-report`, { params })
      .pipe(
        tap(response => {
          console.log('[DataGovernanceService] API Response (getComplianceReport):', response);
        })
      );
  }

  /**
   * Get data breach incidents
   */
  getBreachIncidents(filters: DataGovernanceFilters = {}): Observable<DataGovernanceResponse> {
    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    console.log('[DataGovernanceService] Fetching data breach incidents');
    return this.http.get<DataGovernanceResponse>(`${this.API_URL}/super-admin/data-governance/breach-incidents`, { params })
      .pipe(
        tap(response => {
          console.log('[DataGovernanceService] API Response (getBreachIncidents):', response);
        })
      );
  }
}
