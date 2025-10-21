import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdminNotification } from '../pollux-ui/models/admin-types';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminNotificationService {
  private notificationsSubject = new BehaviorSubject<AdminNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<AdminNotification[]> {
    return this.http.get<AdminNotification[]>(`${environment.apiUrl}/api/admin/notifications`)
      .pipe(
        map(notifications => {
          this.notificationsSubject.next(notifications);
          return notifications;
        })
      );
  }

  markAsRead(notificationId: string): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/api/admin/notifications/${notificationId}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/api/admin/notifications/mark-all-read`, {});
  }

  deleteNotification(notificationId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/admin/notifications/${notificationId}`);
  }

  clearAll(): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/admin/notifications`);
  }
}