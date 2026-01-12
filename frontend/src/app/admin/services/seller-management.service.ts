import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SellerManagementService {
  private apiUrl = `${environment.apiUrl}/api/sellers`;

  constructor(private http: HttpClient) {}

  getSellers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  getSeller(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createSeller(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, payload);
  }

  updateSeller(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
  }

  deleteSeller(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  approveSeller(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectSeller(id: string, reason: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/reject`, { reason });
  }
}
