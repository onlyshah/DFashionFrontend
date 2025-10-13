import { Component, OnInit, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule } from '@angular/forms';
import { AdminAuthService } from '../../../services/admin-auth.service';
import { UiAnimationService } from '../../../services/ui-animation.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

interface Message {
  sender: string;
  content: string;
  avatar: string;
}

interface Notification {
  title: string;
  time: string;
  icon: string;
  iconClass: string;
}

@Component({
  selector: 'app-pollux-navbar',
  templateUrl: './pollux-navbar.component.html',
  styleUrls: ['./pollux-navbar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, FormsModule]
})
export class PolluxNavbarComponent implements OnInit, AfterViewInit {
  @Output() sidenavToggle = new EventEmitter<void>();
  currentUser: any = null;
  pageTitle: string = 'Dashboard';
  searchQuery: string = '';
  notificationCount: number = 0;
  recentNotifications: any[] = [];
  imageUrl = environment.apiUrl;

  constructor(
    private adminAuthService: AdminAuthService,
    private uiAnimationService: UiAnimationService,
    private router: Router
  ) {}

  ngOnInit() {
    // Subscribe to current user
    this.adminAuthService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    // Load notifications
    this.loadNotifications();
    this.updateNotificationCount();
  }

  ngAfterViewInit() {
    // Initialize animations after view is ready
    this.uiAnimationService.initializeAllAnimations();
  }


  getCurrentDate(): string {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric'
    };
    return now.toLocaleDateString('en-US', options);
  }

  getLastLoginTime(): string {
    // This would typically come from user data
    return '23 hours ago';
  }


  toggleSidebar() {
    this.sidenavToggle.emit();
    this.uiAnimationService.toggleSidebar();
  }

  toggleOffcanvas() {
    this.uiAnimationService.toggleMobileSidebar();
  }


  logout() {
    this.adminAuthService.logout();
    this.router.navigate(['/admin/login']);
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      // Implement search functionality
      console.log('Searching for:', this.searchQuery);
    }
  }

  onNotificationClick(notification: any): void {
    notification.read = true;
    this.updateNotificationCount();
    // Handle notification click (navigate to relevant page)
    console.log('Notification clicked:', notification);
  }

  markAllAsRead(): void {
    this.recentNotifications.forEach(notification => {
      notification.read = true;
    });
    this.updateNotificationCount();
  }

  private updateNotificationCount(): void {
    this.notificationCount = this.recentNotifications.filter(n => !n.read).length;
  }

  formatNotificationTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }

  private loadNotifications() {
    // TODO: Replace with actual API call
    // this.adminApiService.getNotifications().subscribe(notifications => {
    //   this.recentNotifications = notifications;
    //   this.updateNotificationCount();
    // });
    // Temporary mock notifications
    this.recentNotifications = [
      { title: 'Order Placed', message: 'Order #1234 placed', time: new Date().toISOString(), read: false },
      { title: 'New User', message: 'A new user registered', time: new Date(Date.now() - 3600000).toISOString(), read: false },
      { title: 'Stock Alert', message: 'Product X is low on stock', time: new Date(Date.now() - 7200000).toISOString(), read: true }
    ];
    this.updateNotificationCount();
  }
}
