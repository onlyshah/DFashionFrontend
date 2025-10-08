import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

export interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: Date;
    isRead: boolean;
    actionUrl?: string;
    actionText?: string;
}

@Component({
    selector: 'app-shared-dashboard-features',
    standalone: true,
    imports: [CommonModule],
    styles: [`
    // Notification Toast
    .notification-toast {
      position: fixed;
      top: 20px;
      right: 20px;
      min-width: 320px;
      max-width: 400px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      overflow: hidden;
      animation: slideInRight 0.3s ease-out;

      &.toast-success {
        border-left: 4px solid #28a745;
      }

      &.toast-error {
        border-left: 4px solid #dc3545;
      }

      &.toast-warning {
        border-left: 4px solid #ffc107;
      }

      &.toast-info {
        border-left: 4px solid #17a2b8;
      }

      .toast-content {
        display: flex;
        align-items: flex-start;
        padding: 16px;

        .toast-icon {
          margin-right: 12px;
          margin-top: 2px;

          i {
            font-size: 20px;
          }
        }

        .toast-message {
          flex: 1;

          h6 {
            margin: 0 0 4px 0;
            font-size: 14px;
            font-weight: 600;
            color: #333;
          }

          p {
            margin: 0;
            font-size: 13px;
            color: #666;
            line-height: 1.4;
          }
        }

        .toast-close {
          border: none;
          background: none;
          color: #999;
          cursor: pointer;
          padding: 0;
          margin-left: 8px;

          i {
            font-size: 16px;
          }

          &:hover {
            color: #666;
          }
        }
      }

      .toast-progress {
        height: 3px;
        background: linear-gradient(90deg, #007bff, #0056b3);
        animation: progressBar linear;
      }
    }

    // Connection Status
    .connection-status {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #dc3545;
      color: white;
      padding: 8px 16px;
      text-align: center;
      z-index: 9999;
      font-size: 14px;

      .status-content {
        display: flex;
        align-items: center;
        justify-content: center;

        i {
          margin-right: 8px;
          font-size: 16px;
        }
      }
    }

    // Update Banner
    .update-banner {
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background: #007bff;
      color: white;
      border-radius: 8px;
      padding: 12px 16px;
      z-index: 9998;
      animation: slideInUp 0.3s ease-out;

      .update-content {
        display: flex;
        align-items: center;
        justify-content: space-between;

        i {
          margin-right: 8px;
          font-size: 18px;
        }

        .update-btn {
          background: white;
          color: #007bff;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          margin-left: 12px;

          &:hover {
            background: #f8f9fa;
          }
        }

        .dismiss-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          margin-left: 8px;

          i {
            font-size: 16px;
          }

          &:hover {
            opacity: 0.8;
          }
        }
      }
    }

    // Loading Overlay
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;

      .loading-content {
        text-align: center;

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        p {
          color: #666;
          font-size: 14px;
          margin: 0;
        }
      }
    }

    // Error Boundary
    .error-boundary {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 8px;
      padding: 32px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      text-align: center;
      z-index: 10001;
      max-width: 400px;
      width: 90%;

      .error-content {
        i {
          font-size: 48px;
          color: #dc3545;
          margin-bottom: 16px;
        }

        h3 {
          color: #333;
          margin-bottom: 8px;
        }

        p {
          color: #666;
          margin-bottom: 24px;
          line-height: 1.5;
        }

        .error-actions {
          display: flex;
          gap: 12px;
          justify-content: center;

          button {
            padding: 8px 16px;
            border-radius: 4px;
            border: none;
            font-weight: 600;
            cursor: pointer;

            &.retry-btn {
              background: #007bff;
              color: white;

              &:hover {
                background: #0056b3;
              }
            }

            &.report-btn {
              background: #6c757d;
              color: white;

              &:hover {
                background: #545b62;
              }
            }
          }
        }
      }
    }

    // Animations
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideInUp {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes progressBar {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    // Mobile Responsive
    @media (max-width: 768px) {
      .notification-toast {
        top: 10px;
        right: 10px;
        left: 10px;
        min-width: auto;
        max-width: none;
      }

      .update-banner {
        bottom: 10px;
        left: 10px;
        right: 10px;

        .update-content {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;

          .update-btn {
            margin-left: 0;
            align-self: stretch;
          }
        }
      }

      .error-boundary {
        width: 95%;
        padding: 24px;
      }
    }
  `],
    templateUrl: './shared-dashboard-features.component.html'
})
export class SharedDashboardFeaturesComponent implements OnInit, OnDestroy {
    @Input() currentUser: any;
    @Input() availableFeatures: string[] = [];

    // Notification system
    activeNotification: Notification | null = null;
    toastDuration = 5000;

    // App state
    isOnline = navigator.onLine;
    updateAvailable = false;
    isGlobalLoading = false;
    loadingMessage = 'Loading...';
    globalError: any = null;

    private subscriptions: Subscription[] = [];
    private notificationQueue: Notification[] = [];
    private toastTimeout?: number;

    constructor(private snackBar: MatSnackBar) { }

    ngOnInit() {
        this.setupConnectionListener();
        this.setupErrorHandler();
        this.checkForUpdates();
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
        }
    }

    private setupConnectionListener() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showNotification({
                id: 'connection-restored',
                type: 'success',
                title: 'Connection Restored',
                message: 'You are back online!',
                timestamp: new Date(),
                isRead: false
            });
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    private setupErrorHandler() {
        window.addEventListener('error', (event) => {
            this.handleGlobalError({
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.handleGlobalError({
                message: 'Unhandled Promise Rejection',
                error: event.reason
            });
        });
    }

    private checkForUpdates() {
        // Check for service worker updates
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                this.updateAvailable = true;
            });
        }
    }

    // Notification Methods
    showNotification(notification: Notification) {
        if (this.activeNotification) {
            this.notificationQueue.push(notification);
            return;
        }

        this.activeNotification = notification;

        this.toastTimeout = window.setTimeout(() => {
            this.dismissNotification();
        }, this.toastDuration);
    }

    dismissNotification() {
        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
        }

        this.activeNotification = null;

        // Show next notification in queue
        if (this.notificationQueue.length > 0) {
            const nextNotification = this.notificationQueue.shift();
            if (nextNotification) {
                setTimeout(() => {
                    this.showNotification(nextNotification);
                }, 300);
            }
        }
    }

    getNotificationIcon(type: string): string {
        switch (type) {
            case 'success': return 'typcn typcn-tick';
            case 'error': return 'typcn typcn-times';
            case 'warning': return 'typcn typcn-warning';
            case 'info': return 'typcn typcn-info';
            default: return 'typcn typcn-info';
        }
    }

    // Loading Methods
    showGlobalLoading(message = 'Loading...') {
        this.isGlobalLoading = true;
        this.loadingMessage = message;
    }

    hideGlobalLoading() {
        this.isGlobalLoading = false;
    }

    // Error Handling
    handleGlobalError(error: any) {
        console.error('Global error:', error);
        this.globalError = error;
    }

    retryLastAction() {
        this.globalError = null;
        // Implement retry logic based on the last action
        window.location.reload();
    }

    reportError() {
        // Implement error reporting
        this.showNotification({
            id: 'error-reported',
            type: 'info',
            title: 'Error Reported',
            message: 'Thank you for reporting this issue. Our team will investigate.',
            timestamp: new Date(),
            isRead: false
        });
        this.globalError = null;
    }

    // Update Methods
    updateApp() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then(registration => {
                if (registration && registration.waiting) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                }
            });
        }
    }

    dismissUpdate() {
        this.updateAvailable = false;
    }

    // Public API for other components
    public showSuccess(title: string, message: string) {
        this.showNotification({
            id: Date.now().toString(),
            type: 'success',
            title,
            message,
            timestamp: new Date(),
            isRead: false
        });
    }

    public showError(title: string, message: string) {
        this.showNotification({
            id: Date.now().toString(),
            type: 'error',
            title,
            message,
            timestamp: new Date(),
            isRead: false
        });
    }

    public showWarning(title: string, message: string) {
        this.showNotification({
            id: Date.now().toString(),
            type: 'warning',
            title,
            message,
            timestamp: new Date(),
            isRead: false
        });
    }

    public showInfo(title: string, message: string) {
        this.showNotification({
            id: Date.now().toString(),
            type: 'info',
            title,
            message,
            timestamp: new Date(),
            isRead: false
        });
    }
}
