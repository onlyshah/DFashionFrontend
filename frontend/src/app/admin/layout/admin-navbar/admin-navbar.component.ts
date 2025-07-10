import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';
import { Router } from '@angular/router';

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
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-navbar.component.html',
  styleUrl: './admin-navbar.component.scss'
})
export class AdminNavbarComponent implements OnInit {
  currentUser: any = null;
  messageCount: number = 0;
  notificationCount: number = 0;
  recentMessages: Message[] = [];
  recentNotifications: Notification[] = [];

  constructor(
    private adminAuthService: AdminAuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Subscribe to current user
    this.adminAuthService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Load mock data for messages and notifications
    this.loadMockData();
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
    // Implement sidebar toggle functionality
    document.body.classList.toggle('sidebar-icon-only');
  }

  toggleOffcanvas() {
    // Implement offcanvas toggle for mobile
    document.body.classList.toggle('sidebar-offcanvas-active');
  }

  logout() {
    this.adminAuthService.logout();
    this.router.navigate(['/admin/login']);
  }

  private loadMockData() {
    // Mock messages
    this.recentMessages = [
      {
        sender: 'David Grey',
        content: 'The meeting is cancelled',
        avatar: 'assets/pollux/images/faces/face4.jpg'
      },
      {
        sender: 'Tim Cook',
        content: 'New product launch',
        avatar: 'assets/pollux/images/faces/face2.jpg'
      },
      {
        sender: 'Johnson',
        content: 'Upcoming board meeting',
        avatar: 'assets/pollux/images/faces/face3.jpg'
      }
    ];

    // Mock notifications
    this.recentNotifications = [
      {
        title: 'Application Error',
        time: 'Just now',
        icon: 'typcn typcn-info mx-0',
        iconClass: 'bg-success'
      },
      {
        title: 'Settings',
        time: 'Private message',
        icon: 'typcn typcn-cog-outline mx-0',
        iconClass: 'bg-warning'
      },
      {
        title: 'New user registration',
        time: '2 days ago',
        icon: 'typcn typcn-user mx-0',
        iconClass: 'bg-info'
      }
    ];

    this.messageCount = this.recentMessages.length;
    this.notificationCount = this.recentNotifications.length;
  }
}
