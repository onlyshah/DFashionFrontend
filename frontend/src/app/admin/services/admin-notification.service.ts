import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';

/**
 * @deprecated Use NotificationService instead
 * This service is kept for backward compatibility only.
 * All new code should use NotificationService directly.
 */
@Injectable({
  providedIn: 'root'
})
export class AdminNotificationService {
  constructor(private notificationService: NotificationService) {}

  // Delegate to core notification service
  getNotifications(): Observable<any[]> {
    return this.notificationService.getAdminNotifications();
  }

  markAsRead(notificationId: string): Observable<void> {
    return this.notificationService.markAsRead(notificationId);
  }

  markAllAsRead(): Observable<void> {
    return this.notificationService.markAllAsRead();
  }

  deleteNotification(notificationId: string): Observable<void> {
    return this.notificationService.deleteNotification(notificationId);
  }

  clearAll(): Observable<void> {
    return this.notificationService.clearAll();
  }
}