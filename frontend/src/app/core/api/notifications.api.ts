import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationsApi {
  constructor(private http: HttpClient) {}

  list(page: number, limit: number = 20): Observable<any> {
    return this.http.get(`/api/notifications?page=${page}&limit=${limit}`);
  }

  markRead(notificationId: string): Observable<any> {
    return this.http.patch(`/api/notifications/${notificationId}`, { read: true });
  }

  markAllRead(): Observable<any> {
    return this.http.patch('/api/notifications/mark-all-read', {});
  }
}

