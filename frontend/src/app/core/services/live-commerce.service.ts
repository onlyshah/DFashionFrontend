import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LiveCommerceService {
  private apiUrl = `${environment.apiUrl}/live`;

  constructor(private http: HttpClient) {}

  // Get all live streams
  getLiveStreams(params?: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`, { params });
  }

  // Get single live stream
  getLiveStream(streamId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${streamId}`);
  }

  // Start a live stream
  startLiveStream(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/start`, data);
  }

  // Schedule a live stream
  scheduleLiveStream(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/schedule`, data);
  }

  // End/stop a live stream
  stopLiveStream(streamId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${streamId}/stop`, {});
  }

  // Get pinned products for stream
  getPinnedProducts(streamId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${streamId}/pinned-products`);
  }

  // Pin product to stream
  pinProduct(streamId: string, productId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${streamId}/pin-product`, { productId });
  }

  // Get live orders
  getLiveOrders(streamId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${streamId}/orders`);
  }

  // Get live chat messages
  getLiveChat(streamId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${streamId}/chat`);
  }

  // Send chat message
  sendChatMessage(streamId: string, message: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${streamId}/chat`, { message });
  }

  // Get stream analytics
  getStreamAnalytics(streamId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${streamId}/analytics`);
  }

  // Update stream
  updateLiveStream(streamId: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${streamId}`, data);
  }

  // Delete live stream
  deleteLiveStream(streamId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${streamId}`);
  }
}
