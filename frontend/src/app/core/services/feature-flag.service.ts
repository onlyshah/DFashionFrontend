import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

export interface FeatureFlag {
  _id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  type: 'boolean' | 'percentage' | 'user-list' | 'segment' | 'json';
  value?: any;
  rolloutPercentage?: number;
  targetUsers?: string[];
  targetSegments?: string[];
  rules?: Array<{
    name: string;
    condition: string;
    value: any;
  }>;
  variants?: Array<{
    id: string;
    name: string;
    percentage: number;
    value: any;
  }>;
  createdBy: string;
  createdDate: Date;
  updatedBy?: string;
  updatedDate: Date;
  environment: 'development' | 'staging' | 'production';
  tags?: string[];
  notes?: string;
}

export interface FeatureFlagsResponse {
  flags: FeatureFlag[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateFeatureFlagRequest {
  name: string;
  key: string;
  description: string;
  type: string;
  value?: any;
  rolloutPercentage?: number;
  environment: string;
}

export interface UpdateFeatureFlagRequest {
  name?: string;
  description?: string;
  enabled?: boolean;
  value?: any;
  rolloutPercentage?: number;
  targetUsers?: string[];
  targetSegments?: string[];
  variants?: any[];
  notes?: string;
}

export interface FeatureFlagFilters {
  environment?: string;
  enabled?: boolean;
  type?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class FeatureFlagService {
  private readonly API_URL = environment.apiUrl + '/api';

  constructor(private http: HttpClient) {}

  /**
   * Get all feature flags (super admin only)
   */
  getFlags(filters: FeatureFlagFilters = {}): Observable<FeatureFlagsResponse> {
    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    console.log('[FeatureFlagService] Fetching feature flags with filters:', filters);
    return this.http.get<FeatureFlagsResponse>(`${this.API_URL}/super-admin/feature-flags`, { params })
      .pipe(
        tap(response => {
          console.log('[FeatureFlagService] API Response (getFlags):', response);
          console.log('[FeatureFlagService] Total flags:', response.total);
        })
      );
  }

  /**
   * Get a specific feature flag by ID
   */
  getFlag(flagId: string): Observable<{ flag: FeatureFlag }> {
    console.log('[FeatureFlagService] Fetching feature flag by ID:', flagId);
    return this.http.get<{ flag: FeatureFlag }>(`${this.API_URL}/super-admin/feature-flags/${flagId}`)
      .pipe(
        tap(response => {
          console.log('[FeatureFlagService] API Response (getFlag):', response);
          console.log('[FeatureFlagService] Flag loaded:', response.flag?.name);
        })
      );
  }

  /**
   * Get a feature flag by key (for frontend feature detection)
   */
  getFlagByKey(key: string): Observable<{ flag: FeatureFlag }> {
    console.log('[FeatureFlagService] Fetching feature flag by key:', key);
    return this.http.get<{ flag: FeatureFlag }>(`${this.API_URL}/feature-flags/${key}`)
      .pipe(
        tap(response => {
          console.log('[FeatureFlagService] API Response (getFlagByKey):', response);
        })
      );
  }

  /**
   * Create a new feature flag
   */
  createFlag(data: CreateFeatureFlagRequest): Observable<{ message: string; flag: FeatureFlag }> {
    console.log('[FeatureFlagService] Creating feature flag:', data);
    return this.http.post<{ message: string; flag: FeatureFlag }>(`${this.API_URL}/super-admin/feature-flags`, data)
      .pipe(
        tap(response => {
          console.log('[FeatureFlagService] API Response (createFlag):', response);
          console.log('[FeatureFlagService] Flag created:', response.flag?.name);
        })
      );
  }

  /**
   * Update a feature flag
   */
  updateFlag(flagId: string, data: UpdateFeatureFlagRequest): Observable<{ message: string; flag: FeatureFlag }> {
    console.log('[FeatureFlagService] Updating feature flag:', flagId, 'with data:', data);
    return this.http.put<{ message: string; flag: FeatureFlag }>(`${this.API_URL}/super-admin/feature-flags/${flagId}`, data)
      .pipe(
        tap(response => {
          console.log('[FeatureFlagService] API Response (updateFlag):', response);
          console.log('[FeatureFlagService] Flag updated:', response.flag?.name);
        })
      );
  }

  /**
   * Toggle a feature flag on/off
   */
  toggleFlag(flagId: string): Observable<{ message: string; flag: FeatureFlag }> {
    console.log('[FeatureFlagService] Toggling feature flag:', flagId);
    return this.http.post<{ message: string; flag: FeatureFlag }>(`${this.API_URL}/super-admin/feature-flags/${flagId}/toggle`, {})
      .pipe(
        tap(response => {
          console.log('[FeatureFlagService] API Response (toggleFlag):', response);
          console.log('[FeatureFlagService] Flag toggled, enabled:', response.flag?.enabled);
        })
      );
  }

  /**
   * Delete a feature flag
   */
  deleteFlag(flagId: string): Observable<{ message: string }> {
    console.log('[FeatureFlagService] Deleting feature flag:', flagId);
    return this.http.delete<{ message: string }>(`${this.API_URL}/super-admin/feature-flags/${flagId}`)
      .pipe(
        tap(response => {
          console.log('[FeatureFlagService] API Response (deleteFlag):', response);
          console.log('[FeatureFlagService] Flag deleted');
        })
      );
  }

  /**
   * Update rollout percentage (for A/B testing)
   */
  updateRolloutPercentage(flagId: string, percentage: number): Observable<{ message: string; flag: FeatureFlag }> {
    console.log('[FeatureFlagService] Updating rollout percentage for flag:', flagId, 'to:', percentage);
    return this.http.put<{ message: string; flag: FeatureFlag }>(`${this.API_URL}/super-admin/feature-flags/${flagId}/rollout`, { percentage })
      .pipe(
        tap(response => {
          console.log('[FeatureFlagService] API Response (updateRolloutPercentage):', response);
          console.log('[FeatureFlagService] Rollout percentage updated to:', response.flag?.rolloutPercentage);
        })
      );
  }

  /**
   * Get rollout progress (for A/B testing metrics)
   */
  getRolloutProgress(flagId: string): Observable<{ progress: any }> {
    console.log('[FeatureFlagService] Fetching rollout progress for flag:', flagId);
    return this.http.get<{ progress: any }>(`${this.API_URL}/super-admin/feature-flags/${flagId}/rollout-progress`)
      .pipe(
        tap(response => {
          console.log('[FeatureFlagService] API Response (getRolloutProgress):', response);
        })
      );
  }

  /**
   * Add target users to a flag
   */
  addTargetUsers(flagId: string, userIds: string[]): Observable<{ message: string; flag: FeatureFlag }> {
    console.log('[FeatureFlagService] Adding target users to flag:', flagId);
    return this.http.post<{ message: string; flag: FeatureFlag }>(`${this.API_URL}/super-admin/feature-flags/${flagId}/target-users`, { userIds })
      .pipe(
        tap(response => {
          console.log('[FeatureFlagService] API Response (addTargetUsers):', response);
          console.log('[FeatureFlagService] Target users added');
        })
      );
  }

  /**
   * Remove target users from a flag
   */
  removeTargetUsers(flagId: string, userIds: string[]): Observable<{ message: string; flag: FeatureFlag }> {
    console.log('[FeatureFlagService] Removing target users from flag:', flagId);
    return this.http.delete<{ message: string; flag: FeatureFlag }>(`${this.API_URL}/super-admin/feature-flags/${flagId}/target-users`, 
      { body: { userIds } })
      .pipe(
        tap(response => {
          console.log('[FeatureFlagService] API Response (removeTargetUsers):', response);
          console.log('[FeatureFlagService] Target users removed');
        })
      );
  }

  /**
   * Get feature flag analytics
   */
  getAnalytics(flagId: string, startDate?: Date, endDate?: Date): Observable<{ analytics: any }> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate.toISOString());
    if (endDate) params = params.set('endDate', endDate.toISOString());

    console.log('[FeatureFlagService] Fetching analytics for flag:', flagId);
    return this.http.get<{ analytics: any }>(`${this.API_URL}/super-admin/feature-flags/${flagId}/analytics`, { params })
      .pipe(
        tap(response => {
          console.log('[FeatureFlagService] API Response (getAnalytics):', response);
        })
      );
  }

  /**
   * Get feature flag variants for A/B testing
   */
  getVariants(flagId: string): Observable<{ variants: any[] }> {
    console.log('[FeatureFlagService] Fetching variants for flag:', flagId);
    return this.http.get<{ variants: any[] }>(`${this.API_URL}/super-admin/feature-flags/${flagId}/variants`)
      .pipe(
        tap(response => {
          console.log('[FeatureFlagService] API Response (getVariants):', response);
        })
      );
  }

  /**
   * Clone a feature flag
   */
  cloneFlag(flagId: string, newName: string): Observable<{ message: string; flag: FeatureFlag }> {
    console.log('[FeatureFlagService] Cloning feature flag:', flagId, 'with name:', newName);
    return this.http.post<{ message: string; flag: FeatureFlag }>(`${this.API_URL}/super-admin/feature-flags/${flagId}/clone`, { name: newName })
      .pipe(
        tap(response => {
          console.log('[FeatureFlagService] API Response (cloneFlag):', response);
          console.log('[FeatureFlagService] Flag cloned:', response.flag?.name);
        })
      );
  }

  /**
   * Search feature flags
   */
  searchFlags(query: string): Observable<FeatureFlagsResponse> {
    console.log('[FeatureFlagService] Searching feature flags with query:', query);
    const filters: FeatureFlagFilters = { search: query };
    return this.getFlags(filters);
  }
}
