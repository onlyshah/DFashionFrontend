import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

export interface Return {
  _id: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    reason: string;
  }>;
  reason: string;
  status: 'initiated' | 'approved' | 'shipped' | 'received' | 'refunded' | 'rejected';
  refundAmount: number;
  refundStatus: 'pending' | 'processed' | 'failed';
  initiatedDate: Date;
  approvedDate?: Date;
  refundDate?: Date;
  trackingNumber?: string;
  notes: string;
  images?: string[];
}

export interface ReturnsResponse {
  returns: Return[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InitiateReturnRequest {
  orderId: string;
  items: Array<{
    productId: string;
    quantity: number;
    reason: string;
  }>;
  reason: string;
  images?: string[];
}

export interface ReturnFilters {
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReturnsService {
  private readonly API_URL = environment.apiUrl + '/api';

  constructor(private http: HttpClient) {}

  /**
   * Get all returns for the current user
   */
  getReturns(filters: ReturnFilters = {}): Observable<ReturnsResponse> {
    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    console.log('[ReturnsService] Fetching returns with filters:', filters);
    return this.http.get<ReturnsResponse>(`${this.API_URL}/returns`, { params })
      .pipe(
        tap(response => {
          console.log('[ReturnsService] API Response (getReturns):', response);
          console.log('[ReturnsService] Total returns:', response.total);
        })
      );
  }

  /**
   * Get a specific return by ID
   */
  getReturn(returnId: string): Observable<{ return: Return }> {
    console.log('[ReturnsService] Fetching return by ID:', returnId);
    return this.http.get<{ return: Return }>(`${this.API_URL}/returns/${returnId}`)
      .pipe(
        tap(response => {
          console.log('[ReturnsService] API Response (getReturn):', response);
          console.log('[ReturnsService] Return loaded:', response.return?._id);
        })
      );
  }

  /**
   * Initiate a return for an order
   */
  initiateReturn(data: InitiateReturnRequest): Observable<{ message: string; return: Return }> {
    console.log('[ReturnsService] Initiating return:', data);
    return this.http.post<{ message: string; return: Return }>(`${this.API_URL}/returns`, data)
      .pipe(
        tap(response => {
          console.log('[ReturnsService] API Response (initiateReturn):', response);
          console.log('[ReturnsService] Return initiated:', response.return?._id);
        })
      );
  }

  /**
   * Update return status (admin/user cancel)
   */
  updateReturnStatus(returnId: string, status: string, notes?: string): Observable<{ message: string; return: Return }> {
    console.log('[ReturnsService] Updating return status:', returnId, 'to:', status);
    return this.http.put<{ message: string; return: Return }>(`${this.API_URL}/returns/${returnId}/status`, { status, notes })
      .pipe(
        tap(response => {
          console.log('[ReturnsService] API Response (updateReturnStatus):', response);
          console.log('[ReturnsService] Return status updated to:', response.return?.status);
        })
      );
  }

  /**
   * Get return reasons (dropdown options)
   */
  getReturnReasons(): Observable<{ reasons: string[] }> {
    console.log('[ReturnsService] Fetching return reasons');
    return this.http.get<{ reasons: string[] }>(`${this.API_URL}/returns/reasons`)
      .pipe(
        tap(response => {
          console.log('[ReturnsService] API Response (getReturnReasons):', response);
        })
      );
  }

  /**
   * Track return shipment
   */
  trackReturn(returnId: string): Observable<{ tracking: any }> {
    console.log('[ReturnsService] Tracking return:', returnId);
    return this.http.get<{ tracking: any }>(`${this.API_URL}/returns/${returnId}/track`)
      .pipe(
        tap(response => {
          console.log('[ReturnsService] API Response (trackReturn):', response);
        })
      );
  }

  /**
   * Get return refund status
   */
  getRefundStatus(returnId: string): Observable<{ refundStatus: any }> {
    console.log('[ReturnsService] Fetching refund status for return:', returnId);
    return this.http.get<{ refundStatus: any }>(`${this.API_URL}/returns/${returnId}/refund-status`)
      .pipe(
        tap(response => {
          console.log('[ReturnsService] API Response (getRefundStatus):', response);
        })
      );
  }

  /**
   * Cancel a return (only if status is 'initiated')
   */
  cancelReturn(returnId: string): Observable<{ message: string }> {
    console.log('[ReturnsService] Cancelling return:', returnId);
    return this.http.delete<{ message: string }>(`${this.API_URL}/returns/${returnId}`)
      .pipe(
        tap(response => {
          console.log('[ReturnsService] API Response (cancelReturn):', response);
        })
      );
  }

  /**
   * Upload return images/documents
   */
  uploadReturnImages(returnId: string, files: File[]): Observable<{ message: string; images: string[] }> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    console.log('[ReturnsService] Uploading return images for return:', returnId);
    return this.http.post<{ message: string; images: string[] }>(`${this.API_URL}/returns/${returnId}/upload-images`, formData)
      .pipe(
        tap(response => {
          console.log('[ReturnsService] API Response (uploadReturnImages):', response);
          console.log('[ReturnsService] Images uploaded:', response.images?.length);
        })
      );
  }

  /**
   * Generate return label
   */
  generateReturnLabel(returnId: string): Observable<{ label: any }> {
    console.log('[ReturnsService] Generating return label for return:', returnId);
    return this.http.get<{ label: any }>(`${this.API_URL}/returns/${returnId}/label`)
      .pipe(
        tap(response => {
          console.log('[ReturnsService] API Response (generateReturnLabel):', response);
        })
      );
  }
}
