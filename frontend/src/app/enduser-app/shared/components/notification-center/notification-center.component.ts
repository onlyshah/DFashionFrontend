import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, InfiniteScrollCustomEvent } from '@ionic/angular';
import { ApiNotificationService, ApiNotification } from '../../../../core/services/api-notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-notification-center',
    imports: [CommonModule, IonicModule],
    template: `
    <div class="notification-center">
      <!-- Header -->
      <div class="header">
        <h2>Notifications</h2>
        <div class="header-actions">
          <button class="mark-all-read-btn" (click)="markAllAsRead()" [disabled]="unreadCount === 0">
            Mark all as read
          </button>
          <button class="settings-btn" (click)="openSettings()">
            <i class="fas fa-cog"></i>
          </button>
        </div>
      </div>

      <!-- Notification Stats -->
      <div class="stats-bar" *ngIf="unreadCount > 0">
        <span class="unread-count">{{ unreadCount }} unread</span>
      </div>

      <!-- Notifications List -->
      <div class="notifications-list">
        <div *ngFor="let notification of notifications; trackBy: trackByNotificationId" class="notification-item" [class.unread]="!notification.isRead">
          <!-- Notification Icon -->
          <div class="notification-icon" [ngClass]="getNotificationIconClass(notification.type)">
            <i [class]="getNotificationIcon(notification.type)"></i>
          </div>

          <!-- Notification Content -->
          <div class="notification-content" (click)="handleNotificationClick(notification)">
            <div class="notification-header">
              <span class="notification-title">{{ notification.title }}</span>
              <span class="notification-time">{{ getTimeAgo(notification.createdAt) }}</span>
            </div>
            <p class="notification-message">{{ notification.message }}</p>
            <div class="notification-actions" *ngIf="!notification.isRead">
              <button class="mark-read-btn" (click)="markAsRead(notification._id, $event)">
                Mark as read
              </button>
            </div>
          </div>

          <!-- Notification Menu -->
          <div class="notification-menu">
            <button class="menu-btn" (click)="toggleMenu(notification)">
              <i class="fas fa-ellipsis-v"></i>
            </button>
            <div class="menu-dropdown" *ngIf="notification.showMenu">
              <button class="menu-item" (click)="markAsRead(notification._id)">
                <i class="fas fa-check"></i>
                Mark as read
              </button>
              <button class="menu-item delete" (click)="deleteNotification(notification._id)">
                <i class="fas fa-trash"></i>
                Delete
              </button>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div class="loading-section" *ngIf="isLoading">
          <ion-spinner name="crescent"></ion-spinner>
          <span>Loading notifications...</span>
        </div>

        <!-- Infinite Scroll -->
        <ion-infinite-scroll (ionInfinite)="loadMoreNotifications($event)" *ngIf="!isLoading && hasMoreNotifications">
          <ion-infinite-scroll-content></ion-infinite-scroll-content>
        </ion-infinite-scroll>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="notifications.length === 0 && !isLoading">
          <div class="empty-icon">
            <i class="fas fa-bell-slash"></i>
          </div>
          <h3>No notifications yet</h3>
          <p>When you get notifications, they'll show up here.</p>
        </div>
      </div>
    </div>
    `,
    styles: [`
    .notification-center {
      max-width: 600px;
      margin: 0 auto;
      background: #fff;
      min-height: 100vh;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid #e1e8ed;
      background: #fff;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: #14171a;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .mark-all-read-btn {
      padding: 8px 16px;
      background: #1da1f2;
      color: white;
      border: none;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .mark-all-read-btn:hover:not(:disabled) {
      background: #1a91da;
    }

    .mark-all-read-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .settings-btn {
      width: 36px;
      height: 36px;
      border: none;
      background: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #657786;
      transition: background 0.2s ease;
    }

    .settings-btn:hover {
      background: #e1e8ed;
    }

    .stats-bar {
      padding: 8px 20px;
      background: #e8f5fd;
      border-bottom: 1px solid #e1e8ed;
    }

    .unread-count {
      font-size: 14px;
      font-weight: 500;
      color: #1da1f2;
    }

    .notifications-list {
      padding: 0;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px 20px;
      border-bottom: 1px solid #e1e8ed;
      cursor: pointer;
      transition: background 0.2s ease;
      position: relative;
    }

    .notification-item:hover {
      background: #f5f8fa;
    }

    .notification-item.unread {
      background: #f5f8fa;
      border-left: 3px solid #1da1f2;
    }

    .notification-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 16px;
    }

    .notification-icon.like {
      background: #e0245e;
      color: white;
    }

    .notification-icon.comment {
      background: #1da1f2;
      color: white;
    }

    .notification-icon.follow {
      background: #17bf63;
      color: white;
    }

    .notification-icon.mention {
      background: #794bc4;
      color: white;
    }

    .notification-icon.order {
      background: #ff9500;
      color: white;
    }

    .notification-icon.review {
      background: #ff6b6b;
      color: white;
    }

    .notification-icon.system {
      background: #657786;
      color: white;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
    }

    .notification-title {
      font-weight: 700;
      font-size: 15px;
      color: #14171a;
      flex: 1;
      margin-right: 8px;
    }

    .notification-time {
      font-size: 13px;
      color: #657786;
      flex-shrink: 0;
    }

    .notification-message {
      font-size: 15px;
      color: #14171a;
      line-height: 1.4;
      margin: 0;
      word-wrap: break-word;
    }

    .notification-actions {
      margin-top: 8px;
    }

    .mark-read-btn {
      padding: 4px 8px;
      background: #1da1f2;
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 12px;
      cursor: pointer;
    }

    .notification-menu {
      position: relative;
      flex-shrink: 0;
    }

    .menu-btn {
      width: 32px;
      height: 32px;
      border: none;
      background: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #657786;
      transition: background 0.2s ease;
    }

    .menu-btn:hover {
      background: #e1e8ed;
    }

    .menu-dropdown {
      position: absolute;
      right: 0;
      top: 100%;
      background: white;
      border: 1px solid #e1e8ed;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 20;
      min-width: 140px;
    }

    .menu-item {
      width: 100%;
      padding: 12px 16px;
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #14171a;
      transition: background 0.2s ease;
    }

    .menu-item:hover {
      background: #f5f8fa;
    }

    .menu-item.delete {
      color: #e0245e;
    }

    .menu-item.delete:hover {
      background: #fee;
    }

    .loading-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 32px;
      color: #657786;
    }

    .empty-state {
      text-align: center;
      padding: 64px 20px;
      color: #657786;
    }

    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
      display: block;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: #14171a;
    }

    .empty-state p {
      margin: 0;
      font-size: 15px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .header {
        padding: 12px 16px;
      }

      .header h2 {
        font-size: 18px;
      }

      .notification-item {
        padding: 12px 16px;
      }

      .notification-icon {
        width: 36px;
        height: 36px;
        font-size: 14px;
      }

      .notification-title {
        font-size: 14px;
      }

      .notification-message {
        font-size: 14px;
      }
    }
    `]
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
  notifications: ApiNotification[] = [];
  unreadCount = 0;
  isLoading = false;
  hasMoreNotifications = true;
  currentPage = 1;

  private subscriptions: Subscription[] = [];

  constructor(
    private notificationService: ApiNotificationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('🔔 Notification center initialized');

    // Subscribe to notifications
    this.subscriptions.push(
      this.notificationService.notifications$.subscribe((notifications: ApiNotification[]) => {
        this.notifications = notifications;
      })
    );

    // Subscribe to unread count
    this.subscriptions.push(
      this.notificationService.unreadCount$.subscribe((count: number) => {
        this.unreadCount = count;
      })
    );

    // Subscribe to new notifications
    this.subscriptions.push(
      this.notificationService.newNotification$.subscribe((notification: ApiNotification) => {
        this.handleNewNotification(notification);
      })
    );

    this.loadNotifications();
  }

  ngOnDestroy() {
    console.log('🔌 Notification center destroyed');
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadNotifications() {
    this.isLoading = true;
    this.currentPage = 1;

    this.notificationService.getNotifications(1, 20).subscribe({
      next: (response: any) => {
        this.notifications = response.notifications.map((n: ApiNotification) => ({
          ...n,
          showMenu: false
        }));
        this.hasMoreNotifications = response.notifications.length === 20;
        this.isLoading = false;
        console.log('🔔 Notifications loaded:', this.notifications.length);
      },
      error: (error: any) => {
        console.error('❌ Error loading notifications:', error);
        this.isLoading = false;
      }
    });
  }

  loadMoreNotifications(event: InfiniteScrollCustomEvent) {
    if (this.isLoading || !this.hasMoreNotifications) {
      event.target.complete();
      return;
    }

    this.currentPage++;
    this.isLoading = true;

    this.notificationService.getNotifications(this.currentPage, 20).subscribe({
      next: (response: any) => {
        const newNotifications = response.notifications.map((n: ApiNotification) => ({
          ...n,
          showMenu: false
        }));
        this.notifications = [...this.notifications, ...newNotifications];
        this.hasMoreNotifications = response.notifications.length === 20;
        this.isLoading = false;
        event.target.complete();
        console.log('🔔 More notifications loaded, total:', this.notifications.length);
      },
      error: (error: any) => {
        console.error('❌ Error loading more notifications:', error);
        this.isLoading = false;
        event.target.complete();
      }
    });
  }

  markAsRead(notificationId: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        console.log('✅ Notification marked as read:', notificationId);
      },
      error: (error: any) => {
        console.error('❌ Error marking notification as read:', error);
      }
    });
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        console.log('✅ All notifications marked as read');
      },
      error: (error: any) => {
        console.error('❌ Error marking all notifications as read:', error);
      }
    });
  }

  deleteNotification(notificationId: string) {
    this.notificationService.deleteNotification(notificationId).subscribe({
      next: () => {
        console.log('🗑️ Notification deleted:', notificationId);
      },
      error: (error: any) => {
        console.error('❌ Error deleting notification:', error);
      }
    });
  }

  toggleMenu(notification: ApiNotification) {
    // Close all other menus
    this.notifications.forEach(n => {
      if (n._id !== notification._id) {
        n.showMenu = false;
      }
    });

    notification.showMenu = !notification.showMenu;
  }

  handleNotificationClick(notification: ApiNotification) {
    // Mark as read if not already
    if (!notification.isRead) {
      this.markAsRead(notification._id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'like':
      case 'comment':
        if (notification.data?.postId) {
          this.router.navigate(['/post', notification.data.postId]);
        }
        break;
      case 'follow':
        if (notification.data?.userId) {
          this.router.navigate(['/profile', notification.data.userId]);
        }
        break;
      case 'mention':
        if (notification.data?.postId) {
          this.router.navigate(['/post', notification.data.postId]);
        }
        break;
      case 'order':
        if (notification.data?.orderId) {
          this.router.navigate(['/orders', notification.data.orderId]);
        }
        break;
      case 'review':
        if (notification.data?.productId) {
          this.router.navigate(['/products', notification.data.productId]);
        }
        break;
      default:
        console.log('🔔 Notification clicked:', notification.type);
    }
  }

  private handleNewNotification(notification: ApiNotification) {
    console.log('🔔 New notification received:', notification);
    // The service already handles adding to the list and updating counts
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'like': return 'fas fa-heart';
      case 'comment': return 'fas fa-comment';
      case 'follow': return 'fas fa-user-plus';
      case 'mention': return 'fas fa-at';
      case 'order': return 'fas fa-shopping-bag';
      case 'review': return 'fas fa-star';
      case 'system': return 'fas fa-info-circle';
      default: return 'fas fa-bell';
    }
  }

  getNotificationIconClass(type: string): string {
    return type;
  }

  getTimeAgo(date: Date | string): string {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return notificationDate.toLocaleDateString();
  }

  openSettings() {
    // TODO: Open notification settings
    console.log('⚙️ Opening notification settings');
  }

  trackByNotificationId(index: number, notification: ApiNotification): string {
    return notification._id;
  }
}