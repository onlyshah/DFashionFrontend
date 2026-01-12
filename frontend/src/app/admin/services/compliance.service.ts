import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ComplianceService {
  private apiUrl = `${environment.apiUrl}/api/compliance`;

  constructor(private http: HttpClient) {}

  getItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/items`);
  }

  getItem(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/items/${id}`);
  }

  createItem(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/items`, payload);
  }

  updateItem(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/items/${id}`, payload);
  }

  deleteItem(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/items/${id}`);
  }
}
