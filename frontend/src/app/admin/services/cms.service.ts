import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CmsService {
  private apiUrl = `${environment.apiUrl}/api/cms`;

  constructor(private http: HttpClient) {}

  getPages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pages`);
  }

  getPage(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/pages/${id}`);
  }

  createPage(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/pages`, payload);
  }

  updatePage(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/pages/${id}`, payload);
  }

  deletePage(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/pages/${id}`);
  }
}
