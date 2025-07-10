import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

interface User {
  name: string;
  email: string;
  avatar: string;
  lastLogin: Date;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: Date;
  read: boolean;
}

interface Message {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  avatar: string;
  timestamp: Date;
  read: boolean;
}

@Component({
  selector: 'app-pollux-navbar',
  templateUrl: './pollux-navbar.component.html',
  styleUrls: ['./pollux-navbar.component.scss']
})
export class PolluxNavbarComponent implements OnInit {
  @Input() currentUser: User | null = null;
  @Output() sidebarToggle = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  // Current date for display
  currentDate = new Date();
  
  // Notifications and messages
  notifications: Notification[] = [];
  messages: Message[] = [];
  
  // Dropdown states
  profileDropdownOpen = false;
  notificationDropdownOpen = false;
  messageDropdownOpen = false;

  ngOnInit(): void {
    this.loadNotifications();
    this.loadMessages();
    this.updateCurrentDate();
  }

  private loadNotifications(): void {
    // Mock notifications - replace with actual service
    this.notifications = [
      {
        id: '1',
        title: 'Application Error',
        message: 'System error detected',
        type: 'error',
        timestamp: new Date(),
        read: false
      },
      {
        id: '2',
        title: 'Settings Updated',
        message: 'Configuration changes saved',
        type: 'success',
        timestamp: new Date(Date.now() - 3600000),
        read: false
      },
      {
        id: '3',
        title: 'New User Registration',
        message: 'New customer account created',
        type: 'info',
        timestamp: new Date(Date.now() - 7200000),
        read: true
      }
    ];
  }

  private loadMessages(): void {
    // Mock messages - replace with actual service
    this.messages = [
      {
        id: '1',
        sender: 'David Grey',
        subject: 'Meeting Update',
        preview: 'The meeting is cancelled',
        avatar: 'assets/images/faces/face4.jpg',
        timestamp: new Date(),
        read: false
      },
      {
        id: '2',
        sender: 'Tim Cook',
        subject: 'Product Launch',
        preview: 'New product launch announcement',
        avatar: 'assets/images/faces/face2.jpg',
        timestamp: new Date(Date.now() - 1800000),
        read: false
      },
      {
        id: '3',
        sender: 'Johnson',
        subject: 'Board Meeting',
        preview: 'Upcoming board meeting agenda',
        avatar: 'assets/images/faces/face3.jpg',
        timestamp: new Date(Date.now() - 3600000),
        read: true
      }
    ];
  }

  private updateCurrentDate(): void {
    this.currentDate = new Date();
    // Update every minute
    setInterval(() => {
      this.currentDate = new Date();
    }, 60000);
  }

  onSidebarToggle(): void {
    this.sidebarToggle.emit();
  }

  onLogout(): void {
    this.logout.emit();
  }

  toggleProfileDropdown(): void {
    this.profileDropdownOpen = !this.profileDropdownOpen;
    this.notificationDropdownOpen = false;
    this.messageDropdownOpen = false;
  }

  toggleNotificationDropdown(): void {
    this.notificationDropdownOpen = !this.notificationDropdownOpen;
    this.profileDropdownOpen = false;
    this.messageDropdownOpen = false;
  }

  toggleMessageDropdown(): void {
    this.messageDropdownOpen = !this.messageDropdownOpen;
    this.profileDropdownOpen = false;
    this.notificationDropdownOpen = false;
  }

  markNotificationAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  markMessageAsRead(messageId: string): void {
    const message = this.messages.find(m => m.id === messageId);
    if (message) {
      message.read = true;
    }
  }

  get unreadNotificationCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  get unreadMessageCount(): number {
    return this.messages.filter(m => !m.read).length;
  }

  get formattedDate(): string {
    return this.currentDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  get lastLoginText(): string {
    if (!this.currentUser?.lastLogin) return '';
    
    const now = new Date();
    const lastLogin = new Date(this.currentUser.lastLogin);
    const diffHours = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Last login was less than an hour ago.';
    if (diffHours === 1) return 'Last login was 1 hour ago.';
    return `Last login was ${diffHours} hours ago.`;
  }
}
