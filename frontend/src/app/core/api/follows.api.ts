import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FollowsApi {
  constructor(private http: HttpClient) {}

  getStatus(userId: string): Observable<any> {
    return this.http.get(`/api/follows/${userId}/status`);
  }

  follow(userId: string): Observable<any> {
    return this.http.post(`/api/follows/${userId}`, {});
  }

  unfollow(userId: string): Observable<any> {
    return this.http.delete(`/api/follows/${userId}`);
  }

  getStats(userId: string): Observable<any> {
    return this.http.get(`/api/follows/${userId}/stats`);
  }
}

