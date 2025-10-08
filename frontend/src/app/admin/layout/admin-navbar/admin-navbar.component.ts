import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';
import { UiAnimationService } from '../../services/ui-animation.service';
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
    selector: 'app-admin-navbar',
    imports: [CommonModule, RouterModule],
    templateUrl: './admin-navbar.component.html',
    styleUrl: './admin-navbar.component.scss'
})
export class AdminNavbarComponent implements OnInit, AfterViewInit {
  currentUser: any = null;
  messageCount: number = 0;
  notificationCount: number = 0;
  recentMessages: Message[] = [];
  recentNotifications: Notification[] = [];
 imageUrl = environment.apiUrl
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

    // Load real data for messages and notifications
    this.loadData();
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
    this.uiAnimationService.toggleSidebar();
  }

  toggleOffcanvas() {
    this.uiAnimationService.toggleMobileSidebar();
  }

  logout() {
    this.adminAuthService.logout();
    this.router.navigate(['/admin/login']);
  }

  private loadData() {
    // Load real messages and notifications from API
    this.loadMessages();
    this.loadNotifications();
  }

  private loadMessages() {
    // TODO: Replace with actual API call
    // this.adminApiService.getMessages().subscribe(messages => {
    //   this.recentMessages = messages;
    //   this.messageCount = messages.length;
    // });

    // Temporary empty state until API is implemented
    this.recentMessages = [];
    this.messageCount = 0;
  }

  private loadNotifications() {
    // TODO: Replace with actual API call
    // this.adminApiService.getNotifications().subscribe(notifications => {
    //   this.recentNotifications = notifications;
    //   this.notificationCount = notifications.length;
    // });

    // Temporary empty state until API is implemented
    this.recentNotifications = [];
    this.notificationCount = 0;
  }
}
