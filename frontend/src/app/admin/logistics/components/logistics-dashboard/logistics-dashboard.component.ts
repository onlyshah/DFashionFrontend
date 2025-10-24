import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';

interface LogisticsMetric {
  label: string;
  value: number | string;
  icon: string;
  color?: string;
  trend?: 'up' | 'down';
  change?: string;
}

interface ShipmentStatus {
  label: string;
  count: number;
  color: string;
}

@Component({
  selector: 'app-logistics-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTabsModule,
    RouterModule
  ],
  template: `
    <div class="logistics-dashboard">
      <header class="dashboard-header">
        <div class="header-content">
          <h1>Logistics Dashboard</h1>
          <p class="subtitle">Real-time shipping and inventory management</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" routerLink="/admin/logistics/shipments/new">
            <mat-icon>local_shipping</mat-icon>
            Create Shipment
          </button>
        </div>
      </header>

      <div class="metrics-grid">
        <mat-card *ngFor="let metric of logisticsMetrics">
          <mat-card-content>
            <div class="metric-content">
              <div class="metric-info">
                <h3>{{ metric.label }}</h3>
                <p class="metric-value">{{ metric.value }}</p>
                <p *ngIf="metric.trend" class="metric-change" [class.positive]="metric.trend === 'up'" [class.negative]="metric.trend === 'down'">
                  <mat-icon>{{ metric.trend === 'up' ? 'trending_up' : 'trending_down' }}</mat-icon>
                  {{ metric.change }}
                </p>
              </div>
              <mat-icon [ngStyle]="{'color': metric.color}">{{ metric.icon }}</mat-icon>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="content-grid">
        <mat-card class="shipment-status-card">
          <mat-card-header>
            <mat-card-title>Shipment Status Overview</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="status-grid">
              <div *ngFor="let status of shipmentStatus" class="status-item">
                <div class="status-header">
                  <span class="status-label">{{ status.label }}</span>
                  <span class="status-count" [style.color]="status.color">{{ status.count }}</span>
                </div>
                <mat-progress-bar [value]="getProgressValue(status.count)" [color]="status.color === '#f44336' ? 'warn' : 'primary'">
                </mat-progress-bar>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="inventory-alerts-card">
          <mat-card-header>
            <mat-card-title>Inventory Alerts</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="alerts-list">
              <div *ngFor="let alert of inventoryAlerts" class="alert-item" [class]="alert.severity">
                <mat-icon>{{ getAlertIcon(alert.severity) }}</mat-icon>
                <div class="alert-content">
                  <h4>{{ alert.title }}</h4>
                  <p>{{ alert.message }}</p>
                </div>
                <button mat-icon-button>
                  <mat-icon>more_vert</mat-icon>
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="shipments-section">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Recent Shipments</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="recentShipments" class="shipments-table">
              <ng-container matColumnDef="trackingId">
                <th mat-header-cell *matHeaderCellDef>Tracking ID</th>
                <td mat-cell *matCellDef="let shipment">{{ shipment.trackingId }}</td>
              </ng-container>

              <ng-container matColumnDef="destination">
                <th mat-header-cell *matHeaderCellDef>Destination</th>
                <td mat-cell *matCellDef="let shipment">{{ shipment.destination }}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let shipment">
                  <mat-chip [color]="getStatusColor(shipment.status)" selected>
                    {{ shipment.status }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="eta">
                <th mat-header-cell *matHeaderCellDef>ETA</th>
                <td mat-cell *matCellDef="let shipment">{{ shipment.eta | date }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .logistics-dashboard {
      padding: 20px;
      max-width: 1600px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;

      h1 {
        margin: 0;
        font-size: 2rem;
        font-weight: 500;
      }

      .subtitle {
        margin: 4px 0 0;
        color: rgba(0, 0, 0, 0.6);
      }
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .metric-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 16px;

      .metric-info {
        flex: 1;

        h3 {
          margin: 0;
          color: rgba(0, 0, 0, 0.6);
          font-size: 1rem;
        }

        .metric-value {
          font-size: 2rem;
          font-weight: 500;
          margin: 8px 0;
        }

        .metric-change {
          display: flex;
          align-items: center;
          gap: 4px;
          margin: 0;
          font-size: 0.875rem;

          &.positive {
            color: #4caf50;
          }

          &.negative {
            color: #f44336;
          }
        }
      }

      mat-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
      }
    }

    .content-grid {
      display: grid;
      grid-template-columns: 3fr 2fr;
      gap: 20px;
      margin-bottom: 24px;
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .status-item {
      .status-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .status-count {
        font-weight: 500;
      }
    }

    .alerts-list {
      .alert-item {
        display: flex;
        align-items: flex-start;
        padding: 12px;
        border-radius: 4px;
        margin-bottom: 8px;
        gap: 12px;

        &.critical {
          background: #ffebee;
          color: #c62828;
        }

        &.warning {
          background: #fff3e0;
          color: #ef6c00;
        }

        &.info {
          background: #e3f2fd;
          color: #1565c0;
        }

        .alert-content {
          flex: 1;

          h4 {
            margin: 0 0 4px;
            font-size: 1rem;
          }

          p {
            margin: 0;
            font-size: 0.875rem;
          }
        }
      }
    }

    .shipments-table {
      width: 100%;
    }

    @media screen and (max-width: 1200px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
    }

    @media screen and (max-width: 600px) {
      .logistics-dashboard {
        padding: 16px;
      }

      .dashboard-header {
        flex-direction: column;
        align-items: stretch;

        .header-actions {
          width: 100%;

          button {
            width: 100%;
          }
        }
      }

      .metrics-grid {
        grid-template-columns: 1fr;
      }

      .status-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LogisticsDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  displayedColumns = ['trackingId', 'destination', 'status', 'eta'];

  logisticsMetrics: LogisticsMetric[] = [
    {
      label: 'Active Shipments',
      value: 248,
      icon: 'local_shipping',
      color: '#2196f3',
      trend: 'up',
      change: '+12%'
    },
    {
      label: 'Delayed Shipments',
      value: 15,
      icon: 'warning',
      color: '#f44336',
      trend: 'down',
      change: '-5%'
    },
    {
      label: 'On-Time Delivery Rate',
      value: '94.8%',
      icon: 'schedule',
      color: '#4caf50',
      trend: 'up',
      change: '+2.3%'
    },
    {
      label: 'Average Transit Time',
      value: '3.2 days',
      icon: 'timer',
      color: '#ff9800'
    }
  ];

  shipmentStatus: ShipmentStatus[] = [
    { label: 'In Transit', count: 156, color: '#2196f3' },
    { label: 'Delivered', count: 892, color: '#4caf50' },
    { label: 'Pending', count: 47, color: '#ff9800' },
    { label: 'Delayed', count: 15, color: '#f44336' }
  ];

  inventoryAlerts = [
    {
      severity: 'critical',
      title: 'Low Stock Alert',
      message: 'Summer Collection items running low in warehouse B3'
    },
    {
      severity: 'warning',
      title: 'Delivery Delay',
      message: 'Weather conditions affecting deliveries in Northeast region'
    },
    {
      severity: 'info',
      title: 'New Carrier Partnership',
      message: 'Integration with FastShip carrier services completed'
    }
  ];

  recentShipments = [
    {
      trackingId: 'SHP-2023-001',
      destination: 'New York, NY',
      status: 'in_transit',
      eta: new Date(2023, 9, 25)
    },
    {
      trackingId: 'SHP-2023-002',
      destination: 'Los Angeles, CA',
      status: 'delivered',
      eta: new Date(2023, 9, 23)
    },
    {
      trackingId: 'SHP-2023-003',
      destination: 'Chicago, IL',
      status: 'delayed',
      eta: new Date(2023, 9, 26)
    },
    {
      trackingId: 'SHP-2023-004',
      destination: 'Miami, FL',
      status: 'pending',
      eta: new Date(2023, 9, 27)
    }
  ];

  ngOnInit(): void {
    // TODO: Initialize real-time data streams
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getProgressValue(count: number): number {
    const maxCount = Math.max(...this.shipmentStatus.map(status => status.count));
    return (count / maxCount) * 100;
  }

  getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'in_transit':
        return 'primary';
      case 'delivered':
        return 'primary';
      case 'delayed':
        return 'warn';
      case 'pending':
        return 'accent';
      default:
        return 'primary';
    }
  }

  getAlertIcon(severity: string): string {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  }
}