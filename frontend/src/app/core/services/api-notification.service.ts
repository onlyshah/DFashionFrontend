import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ApiNotification {
  _id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'order' | 'review' | 'system';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  showMenu?: boolean; // UI state: whether the notification menu is open
  createdAt: Date;
}

export interface NotificationResponse {
  notifications: ApiNotification[];
  total: number;
  unreadCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiNotificationService {
  private readonly API_URL = `${environment.apiUrl}/api`;

  private notificationsSubject = new BehaviorSubject<ApiNotification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  private newNotificationSubject = new Subject<ApiNotification>();

  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();
  public newNotification$ = this.newNotificationSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeWebSocket();
  }

  // Get all notifications for user
  getNotifications(page: number = 1, limit: number = 20): Observable<NotificationResponse> {
    console.log('[ApiNotificationService] Fetching notifications:', { page, limit });
    return this.http.get<NotificationResponse>(`${this.API_URL}/notifications`, {
      params: { page: page.toString(), limit: limit.toString() }
    }).pipe(
      tap(response => {
        console.log('[ApiNotificationService] Notifications loaded:', response.total);
        this.notificationsSubject.next(response.notifications);
        this.unreadCountSubject.next(response.unreadCount);
      })
    );
  }

  // Get unread count only
  getUnreadCount(): Observable<{ count: number }> {
    console.log('[ApiNotificationService] Fetching unread count');
    return this.http.get<{ count: number }>(`${this.API_URL}/notifications/unread-count`).pipe(
      tap(response => {
        console.log('[ApiNotificationService] Unread count:', response.count);
        this.unreadCountSubject.next(response.count);
      })
    );
  }

  // Mark notification as read
  markAsRead(notificationId: string): Observable<{ message: string }> {
    console.log('[ApiNotificationService] Marking notification as read:', notificationId);
    return this.http.put<{ message: string }>(`${this.API_URL}/notifications/${notificationId}/read`, {}).pipe(
      tap(() => {
        // Update local state
        const currentNotifications = this.notificationsSubject.value;
        const updatedNotifications = currentNotifications.map(notification =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        );
        this.notificationsSubject.next(updatedNotifications);

        // Update unread count
        const currentUnread = this.unreadCountSubject.value;
        this.unreadCountSubject.next(Math.max(0, currentUnread - 1));
      })
    );
  }

  // Mark all notifications as read
  markAllAsRead(): Observable<{ message: string }> {
    console.log('[ApiNotificationService] Marking all notifications as read');
    return this.http.put<{ message: string }>(`${this.API_URL}/notifications/mark-all-read`, {}).pipe(
      tap(() => {
        // Update local state
        const currentNotifications = this.notificationsSubject.value;
        const updatedNotifications = currentNotifications.map(notification => ({
          ...notification,
          isRead: true
        }));
        this.notificationsSubject.next(updatedNotifications);
        this.unreadCountSubject.next(0);
      })
    );
  }

  // Delete notification
  deleteNotification(notificationId: string): Observable<{ message: string }> {
    console.log('[ApiNotificationService] Deleting notification:', notificationId);
    return this.http.delete<{ message: string }>(`${this.API_URL}/notifications/${notificationId}`).pipe(
      tap(() => {
        // Update local state
        const currentNotifications = this.notificationsSubject.value;
        const updatedNotifications = currentNotifications.filter(
          notification => notification._id !== notificationId
        );
        this.notificationsSubject.next(updatedNotifications);
      })
    );
  }

  // Create notification (for internal use)
  createNotification(notification: Partial<ApiNotification>): Observable<{ message: string; notification: ApiNotification }> {
    console.log('[ApiNotificationService] Creating notification:', notification);
    return this.http.post<{ message: string; notification: ApiNotification }>(`${this.API_URL}/notifications`, notification);
  }

  // WebSocket initialization for real-time notifications
  private initializeWebSocket(): void {
    // TODO: Implement WebSocket connection for real-time notifications
    // This would connect to a WebSocket endpoint and listen for new notifications
    console.log('[ApiNotificationService] WebSocket initialization placeholder');
  }

  // Handle incoming real-time notification
  private handleNewNotification(notification: ApiNotification): void {
    console.log('[ApiNotificationService] New notification received:', notification);

    // Add to notifications list
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...currentNotifications]);

    // Increment unread count
    const currentUnread = this.unreadCountSubject.value;
    this.unreadCountSubject.next(currentUnread + 1);

    // Emit new notification event
    this.newNotificationSubject.next(notification);
  }
}