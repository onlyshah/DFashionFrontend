import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InfluencerDashboardApi {
  constructor(private http: HttpClient) {}

  getDashboard(token: string | null): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token || ''}`
    });
    return this.http.get(`${environment.apiUrl}/influencer/dashboard`, { headers });
  }
}

