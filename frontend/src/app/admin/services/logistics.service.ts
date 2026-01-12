import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LogisticsService {
  private apiUrl = `${environment.apiUrl}/api/logistics`;

  constructor(private http: HttpClient) {}

  getShipments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/shipments`);
  }

  getShipment(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/shipments/${id}`);
  }

  updateShipment(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/shipments/${id}`, payload);
  }

  trackShipment(trackingId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/track/${trackingId}`);
  }
}
