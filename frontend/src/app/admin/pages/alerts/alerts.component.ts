import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatChipsModule
  ],
  template: `
    <div class="alerts-container">
      <mat-card class="alerts-card">
        <mat-card-header>
          <mat-card-title>Alerts & Notifications</mat-card-title>
          <mat-card-subtitle>System alerts and notifications</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="alerts-list">
            <div class="alert" *ngFor="let alert of alerts" [ngClass]="'alert-' + alert.type">
              <div class="alert-icon">
                <mat-icon>{{ getAlertIcon(alert.type) }}</mat-icon>
              </div>
              <div class="alert-content">
                <h4>{{ alert.title }}</h4>
                <p>{{ alert.message }}</p>
                <small>{{ alert.timestamp | date:'short' }}</small>
              </div>
              <div class="alert-actions">
                <button mat-icon-button (click)="markAsRead(alert)" *ngIf="!alert.read">
                  <mat-icon>done</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="dismissAlert(alert)">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            </div>
            <div *ngIf="alerts.length === 0" class="no-alerts">
              <mat-icon>notifications_none</mat-icon>
              <p>No alerts at this time</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .alerts-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .alerts-card {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .alerts-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .alert {
      display: flex;
      align-items: center;
      padding: 16px;
      border-left: 4px solid;
      border-radius: 4px;
      background-color: #f5f5f5;
      gap: 16px;
    }

    .alert-warning {
      border-color: #ff9800;
      background-color: #fff3e0;
    }

    .alert-error {
      border-color: #f44336;
      background-color: #ffebee;
    }

    .alert-info {
      border-color: #2196f3;
      background-color: #e3f2fd;
    }

    .alert-success {
      border-color: #4caf50;
      background-color: #e8f5e9;
    }

    .alert-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 40px;
    }

    .alert-content {
      flex: 1;
    }

    .alert-content h4 {
      margin: 0 0 8px 0;
      font-weight: 500;
    }

    .alert-content p {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #666;
    }

    .alert-content small {
      color: #999;
      font-size: 12px;
    }

    .alert-actions {
      display: flex;
      gap: 8px;
    }

    .no-alerts {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #999;
    }

    .no-alerts mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ddd;
      margin-bottom: 16px;
    }
  `]
})
export class AlertsComponent implements OnInit {
  alerts: Alert[] = [];

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(): void {
    // Sample alerts - in production, load from API
    this.alerts = [
      {
        id: '1',
        type: 'warning',
        title: 'Low Stock Alert',
        message: 'Product "Premium Shirt" has low stock (5 units remaining)',
        timestamp: new Date(Date.now() - 3600000),
        read: false
      },
      {
        id: '2',
        type: 'info',
        title: 'New Order',
        message: 'Order ORD123456 has been placed by customer Anil Sharma',
        timestamp: new Date(Date.now() - 7200000),
        read: false
      },
      {
        id: '3',
        type: 'success',
        title: 'Payment Received',
        message: 'Payment of ₹5,000 received for order ORD123455',
        timestamp: new Date(Date.now() - 10800000),
        read: true
      }
    ];
  }

  getAlertIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      warning: 'warning',
      error: 'error',
      info: 'info',
      success: 'check_circle'
    };
    return iconMap[type] || 'notifications';
  }

  markAsRead(alert: Alert): void {
    alert.read = true;
  }

  dismissAlert(alert: Alert): void {
    this.alerts = this.alerts.filter(a => a.id !== alert.id);
  }
}
