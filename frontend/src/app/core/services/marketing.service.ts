import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FlashSale {
  _id: string;
  title: string;
  description: string;
  discountPercent: number;
  startDate: Date;
  endDate: Date;
  productIds: string[];
  bannerImage: string;
  status: 'scheduled' | 'active' | 'ended';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Campaign {
  _id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'social';
  description: string;
  targetAudience: string[];
  budget: number;
  startDate?: Date;
  endDate?: Date;
  channels: string[];
  status: 'draft' | 'scheduled' | 'active' | 'ended';
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MarketingService {
  private apiUrl = `${environment.apiUrl}/marketing`;

  constructor(private http: HttpClient) {}

  // ============ FLASH SALES ============

  // Get all flash sales
  getFlashSales(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    }
    return this.http.get<any>(`${this.apiUrl}/flash-sales`, { params: httpParams });
  }

  // Get single flash sale
  getFlashSale(saleId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/flash-sales/${saleId}`);
  }

  // Create flash sale
  createFlashSale(data: {
    title: string;
    description?: string;
    discountPercent: number;
    startDate: Date;
    endDate: Date;
    productIds?: string[];
    bannerImage?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/flash-sales`, data);
  }

  // Update flash sale
  updateFlashSale(saleId: string, data: Partial<FlashSale>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/flash-sales/${saleId}`, data);
  }

  // Delete flash sale
  deleteFlashSale(saleId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/flash-sales/${saleId}`);
  }

  // ============ CAMPAIGNS ============

  // Get all campaigns
  getCampaigns(params?: {
    type?: string;
    page?: number;
    limit?: number;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.type) httpParams = httpParams.set('type', params.type);
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    }
    return this.http.get<any>(`${this.apiUrl}/campaigns`, { params: httpParams });
  }

  // Get single campaign
  getCampaign(campaignId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/campaigns/${campaignId}`);
  }

  // Create campaign
  createCampaign(data: {
    name: string;
    type: string;
    description?: string;
    targetAudience?: string[];
    budget?: number;
    startDate?: Date;
    endDate?: Date;
    channels?: string[];
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/campaigns`, data);
  }

  // Update campaign
  updateCampaign(campaignId: string, data: Partial<Campaign>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/campaigns/${campaignId}`, data);
  }

  // Delete campaign
  deleteCampaign(campaignId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/campaigns/${campaignId}`);
  }

  // Get campaign metrics
  getCampaignMetrics(campaignId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/campaigns/${campaignId}/metrics`);
  }

  // ============ BANNERS ============

  // Get all banners
  getBanners(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/banners`);
  }

  // Create banner
  createBanner(data: {
    title: string;
    image: string;
    link?: string;
    position?: string;
    startDate?: Date;
    endDate?: Date;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/banners`, data);
  }
}
