/**
 * 🔔 Notifications Component
 * Unified notifications for social + shopping activities
 */

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NotificationsApi } from 'src/app/core/api/notifications.api';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'message' | 'order' | 'product' | 'post';
  title: string;
  message: string;
  image?: string;
  userAvatar?: string;
  userName?: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionData?: any;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Notifications</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="markAllAsRead()" *ngIf="unreadCount > 0">
            <span class="unread-badge">{{ unreadCount }}</span>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Filter Tabs -->
      <ion-segment
        value="all"
        (ionChange)="onFilterChange($event)"
        class="notification-filters"
      >
        <ion-segment-button value="all">All</ion-segment-button>
        <ion-segment-button value="social">Social</ion-segment-button>
        <ion-segment-button value="shopping">Shopping</ion-segment-button>
        <ion-segment-button value="messages">Messages</ion-segment-button>
      </ion-segment>

      <!-- Notifications List -->
      <ion-list *ngIf="filteredNotifications.length > 0">
        <ion-item
          *ngFor="let notification of filteredNotifications"
          [class.unread]="!notification.read"
          (click)="onNotificationTap(notification)"
          button
        >
          <!-- Avatar -->
          <ion-avatar slot="start" *ngIf="notification.userAvatar">
            <img [src]="notification.userAvatar" />
          </ion-avatar>

          <!-- Icon for system notifications -->
          <div slot="start" *ngIf="!notification.userAvatar" class="notification-icon">
            <ion-icon [name]="getIconForType(notification.type)"></ion-icon>
          </div>

          <!-- Content -->
          <ion-label>
            <h2 class="notification-title">{{ notification.title }}</h2>
            <p class="notification-message">{{ notification.message }}</p>
            <p class="notification-time">{{ formatTime(notification.timestamp) }}</p>
          </ion-label>

          <!-- Image Thumbnail -->
          <ion-thumbnail slot="end" *ngIf="notification.image">
            <img [src]="notification.image" />
          </ion-thumbnail>

          <!-- Unread Indicator -->
          <div slot="end" *ngIf="!notification.read" class="unread-dot"></div>

          <!-- Action Button -->
          <ion-button
            slot="end"
            fill="clear"
            size="small"
            (click)="onAction(notification, $event)"
          >
            <ion-icon name="arrow-forward"></ion-icon>
          </ion-button>
        </ion-item>
      </ion-list>

      <!-- Empty State -->
      <div *ngIf="filteredNotifications.length === 0" class="empty-state">
        <ion-icon name="notifications-off"></ion-icon>
        <h2>No Notifications</h2>
        <p>You're all caught up!</p>
      </div>

      <!-- Infinite Scroll -->
      <ion-infinite-scroll
        (ionInfinite)="loadMore($event)"
        threshold="500px"
      >
        <ion-infinite-scroll-content></ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </ion-content>
  `,
  styles: [`
    .notification-filters {
      --background: white;
      border-bottom: 1px solid #eee;
    }

    ion-list {
      padding: 0;
    }

    ion-item {
      --border-color: #f0f0f0;
      --padding-start: 12px;
      --padding-end: 12px;
      min-height: 80px;
      transition: background-color 0.2s;
    }

    ion-item.unread {
      --background: rgba(0, 0, 0, 0.02);
      font-weight: 500;
    }

    ion-item:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    ion-avatar {
      width: 48px;
      height: 48px;
      margin-right: 12px;
    }

    .notification-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      margin-right: 12px;
    }

    ion-label {
      margin: 0;
    }

    .notification-title {
      font-size: 14px;
      font-weight: bold;
      margin: 0;
      color: #333;
    }

    .notification-message {
      font-size: 13px;
      color: #666;
      margin: 6px 0 4px 0;
      line-height: 1.3;
    }

    .notification-time {
      font-size: 11px;
      color: #999;
      margin: 0;
    }

    ion-thumbnail {
      width: 56px;
      height: 56px;
      border-radius: 8px;
      margin-left: 8px;
    }

    .unread-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--ion-color-primary);
      margin-left: 8px;
    }

    ion-button {
      margin: 0;
    }

    .unread-badge {
      display: inline-block;
      background: var(--ion-color-danger);
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
      margin-left: 8px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 50vh;
      text-align: center;
      color: #999;
    }

    .empty-state ion-icon {
      font-size: 64px;
      opacity: 0.3;
      margin-bottom: 16px;
    }

    .empty-state h2 {
      font-size: 18px;
      margin: 0 0 8px 0;
    }

    .empty-state p {
      font-size: 14px;
      margin: 0;
    }

    ion-infinite-scroll-content {
      padding: 20px 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsPageComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  currentFilter: string = 'all';
  isLoading: boolean = true;
  pageNum: number = 1;

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  private destroy$ = new Subject<void>();

  constructor(
    private notificationsApi: NotificationsApi,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadNotifications();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotifications() {
    this.notificationsApi.list(this.pageNum, 20)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.notifications.push(...response.data || []);
          this.applyFilter();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load notifications:', error);
          this.isLoading = false;
        }
      });
  }

  loadMore(event: any) {
    this.pageNum++;
    this.notificationsApi.list(this.pageNum, 20)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.notifications.push(...response.data || []);
          this.applyFilter();
          event.target.complete();
        },
        error: (error) => {
          console.error('Failed to load more notifications:', error);
          event.target.complete();
        }
      });
  }

  onFilterChange(event: any) {
    this.currentFilter = event.detail.value;
    this.applyFilter();
  }

  applyFilter() {
    if (this.currentFilter === 'all') {
      this.filteredNotifications = this.notifications;
    } else if (this.currentFilter === 'social') {
      this.filteredNotifications = this.notifications.filter(n =>
        ['like', 'comment', 'follow'].includes(n.type)
      );
    } else if (this.currentFilter === 'shopping') {
      this.filteredNotifications = this.notifications.filter(n =>
        ['order', 'product'].includes(n.type)
      );
    } else if (this.currentFilter === 'messages') {
      this.filteredNotifications = this.notifications.filter(n =>
        n.type === 'message'
      );
    }
  }

  onNotificationTap(notification: Notification) {
    // Mark as read
    if (!notification.read) {
      notification.read = true;

      this.notificationsApi.markRead(notification.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          error: (error) => console.error('Failed to mark notification as read:', error)
        });
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      this.router.navigate([notification.actionUrl], { state: notification.actionData });
    }
  }

  onAction(notification: Notification, event: Event) {
    event.stopPropagation();
    this.onNotificationTap(notification);
  }

  markAllAsRead() {
    this.notificationsApi.markAllRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notifications.forEach(n => n.read = true);
        },
        error: (error) => console.error('Failed to mark all as read:', error)
      });
  }

  getIconForType(type: string): string {
    const icons: { [key: string]: string } = {
      'like': 'heart',
      'comment': 'chatbubble',
      'follow': 'person-add',
      'message': 'mail',
      'order': 'bag',
      'product': 'pricetag',
      'post': 'images'
    };

    return icons[type] || 'notifications';
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  }
}
