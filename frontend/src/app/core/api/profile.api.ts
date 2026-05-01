import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileApi {
  constructor(private http: HttpClient) {}

  getUser(userId: string): Observable<any> {
    return this.http.get(`/api/users/${userId}`);
  }

  getUserPosts(userId: string): Observable<any> {
    return this.http.get(`/api/users/${userId}/posts`);
  }

  getUserOrders(userId: string): Observable<any> {
    return this.http.get(`/api/users/${userId}/orders`);
  }

  getUserTagged(userId: string): Observable<any> {
    return this.http.get(`/api/users/${userId}/tagged`);
  }
}

