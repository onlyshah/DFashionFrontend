import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AdminAuthService } from '../services/admin-auth.service';

@Component({
    selector: 'app-header',
    styleUrls: ['./header.component.scss'],
    standalone: false,
    templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
    @Output() sidenavToggle = new EventEmitter<void>();

    currentUser: any = null;
    pageTitle: string = 'Dashboard';
    searchQuery: string = '';
    notificationCount: number = 3;

    notifications: any[] = [];

    constructor(
        private adminAuthService: AdminAuthService
    ) { }

    ngOnInit(): void {
        // Subscribe to current user
        this.adminAuthService.currentUser$.subscribe(user => {
            this.currentUser = user;
        });

        // Update notification count
        this.updateNotificationCount();
    }

    toggleSidenav(): void {
        this.sidenavToggle.emit();
    }

    onSearch(): void {
        if (this.searchQuery.trim()) {
            console.log('Searching for:', this.searchQuery);
            // Implement search functionality
        }
    }

    onNotificationClick(notification: any): void {
        // Mark as read
        notification.read = true;
        this.updateNotificationCount();

        // Handle notification click (navigate to relevant page)
        console.log('Notification clicked:', notification);
    }

    markAllAsRead(): void {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        this.updateNotificationCount();
    }

    private updateNotificationCount(): void {
        this.notificationCount = this.notifications.filter(n => !n.read).length;
    }

    logout(): void {
        this.adminAuthService.logout();
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
}
