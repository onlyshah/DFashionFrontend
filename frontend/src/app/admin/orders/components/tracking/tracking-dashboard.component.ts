import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';

interface DeliveryMetrics {
  total: number;
  inTransit: number;
  delivered: number;
  delayed: number;
  avgDeliveryTime: number;
  onTimeDeliveryRate: number;
}

interface Shipment {
  id: string;
  orderId: string;
  customerName: string;
  status: 'processing' | 'in-transit' | 'out-for-delivery' | 'delivered' | 'delayed';
  carrier: string;
  trackingNumber: string;
  estimatedDelivery: Date;
  currentLocation: string;
  progress: number;
}

@Component({
  selector: 'app-tracking-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatProgressBarModule,
    RouterModule
  ],
  template: `
    <div class="tracking-container">
      <header class="page-header">
        <div class="header-content">
          <h1>Shipment Tracking</h1>
          <p class="subtitle">Monitor deliveries and shipment status</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" routerLink="/admin/orders">
            <mat-icon>shopping_cart</mat-icon>
            View Orders
          </button>
        </div>
      </header>

      <div class="metrics-overview">
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-value">{{ metrics.total }}</div>
            <div class="metric-label">Total Shipments</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-value">{{ metrics.inTransit }}</div>
            <div class="metric-label">In Transit</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-value">{{ metrics.delivered }}</div>
            <div class="metric-label">Delivered</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-value">{{ metrics.onTimeDeliveryRate | number:'1.1-1' }}%</div>
            <div class="metric-label">On-Time Delivery Rate</div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="shipments-table-card">
        <mat-card-header>
          <mat-card-title>Active Shipments</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="activeShipments" class="shipments-table">
            <ng-container matColumnDef="orderId">
              <th mat-header-cell *matHeaderCellDef>Order ID</th>
              <td mat-cell *matCellDef="let shipment">
                <a [routerLink]="['/admin/orders/detail', shipment.orderId]" class="order-link">
                  #{{ shipment.orderId }}
                </a>
              </td>
            </ng-container>

            <ng-container matColumnDef="customerName">
              <th mat-header-cell *matHeaderCellDef>Customer</th>
              <td mat-cell *matCellDef="let shipment">{{ shipment.customerName }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let shipment">
                <div class="status-cell">
                  <span class="status-badge" [class]="shipment.status">
                    {{ shipment.status | titlecase }}
                  </span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="tracking">
              <th mat-header-cell *matHeaderCellDef>Tracking Info</th>
              <td mat-cell *matCellDef="let shipment">
                <div class="tracking-info">
                  <div>{{ shipment.carrier }}</div>
                  <div class="tracking-number">{{ shipment.trackingNumber }}</div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="progress">
              <th mat-header-cell *matHeaderCellDef>Progress</th>
              <td mat-cell *matCellDef="let shipment">
                <div class="progress-cell">
                  <mat-progress-bar
                    [value]="shipment.progress"
                    [color]="getProgressColor(shipment)">
                  </mat-progress-bar>
                  <span class="progress-text">{{ shipment.progress }}%</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="estimatedDelivery">
              <th mat-header-cell *matHeaderCellDef>Est. Delivery</th>
              <td mat-cell *matCellDef="let shipment">
                {{ shipment.estimatedDelivery | date:'mediumDate' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let shipment">
                <button mat-icon-button (click)="viewDetails(shipment)">
                  <mat-icon>visibility</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>

      <div class="delivery-maps">
        <mat-card class="map-card">
          <mat-card-header>
            <mat-card-title>Delivery Map</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <!-- TODO: Implement map visualization -->
            <div class="placeholder-map"></div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .tracking-container {
      padding: 20px;
      max-width: 1600px;
      margin: 0 auto;
    }

    .page-header {
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

    .metrics-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .metric-card {
      .metric-value {
        font-size: 2rem;
        font-weight: 500;
        margin-bottom: 8px;
      }

      .metric-label {
        color: rgba(0, 0, 0, 0.6);
        font-size: 0.9rem;
      }
    }

    .shipments-table-card {
      margin-bottom: 24px;
    }

    .shipments-table {
      width: 100%;

      .order-link {
        color: #1976d2;
        text-decoration: none;
        font-weight: 500;

        &:hover {
          text-decoration: underline;
        }
      }

      .status-cell {
        .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 500;

          &.processing { background: #e3f2fd; color: #1565c0; }
          &.in-transit { background: #f0f4c3; color: #827717; }
          &.out-for-delivery { background: #e8f5e9; color: #2e7d32; }
          &.delivered { background: #e8f5e9; color: #2e7d32; }
          &.delayed { background: #ffebee; color: #c62828; }
        }
      }

      .tracking-info {
        .tracking-number {
          font-family: monospace;
          color: rgba(0, 0, 0, 0.6);
          font-size: 0.875rem;
        }
      }

      .progress-cell {
        display: flex;
        align-items: center;
        gap: 12px;

        mat-progress-bar {
          flex: 1;
        }

        .progress-text {
          min-width: 48px;
          text-align: right;
          font-size: 0.875rem;
          color: rgba(0, 0, 0, 0.6);
        }
      }
    }

    .delivery-maps {
      .map-card {
        min-height: 400px;
      }
    }

    .placeholder-map {
      width: 100%;
      height: 300px;
      background: rgba(0, 0, 0, 0.04);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(0, 0, 0, 0.6);

      &::after {
        content: "Map visualization coming soon";
      }
    }

    @media (max-width: 600px) {
      .tracking-container {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        align-items: stretch;

        .header-actions {
          width: 100%;

          button {
            width: 100%;
          }
        }
      }

      .shipments-table {
        display: block;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
    }
  `]
})
export class TrackingDashboardComponent implements OnInit {
  metrics: DeliveryMetrics = {
    total: 156,
    inTransit: 45,
    delivered: 98,
    delayed: 13,
    avgDeliveryTime: 3.2,
    onTimeDeliveryRate: 94.2
  };

  displayedColumns = [
    'orderId',
    'customerName',
    'status',
    'tracking',
    'progress',
    'estimatedDelivery',
    'actions'
  ];

  activeShipments: Shipment[] = [
    {
      id: 'SH1001',
      orderId: '1001',
      customerName: 'John Smith',
      status: 'in-transit',
      carrier: 'FedEx',
      trackingNumber: 'FX1234567890',
      estimatedDelivery: new Date(Date.now() + 2 * 86400000),
      currentLocation: 'Chicago, IL',
      progress: 45
    },
    {
      id: 'SH1002',
      orderId: '1002',
      customerName: 'Emma Wilson',
      status: 'out-for-delivery',
      carrier: 'UPS',
      trackingNumber: 'UPS987654321',
      estimatedDelivery: new Date(Date.now() + 86400000),
      currentLocation: 'Los Angeles, CA',
      progress: 85
    },
    {
      id: 'SH1003',
      orderId: '1003',
      customerName: 'Michael Johnson',
      status: 'delayed',
      carrier: 'USPS',
      trackingNumber: 'USPS54321678',
      estimatedDelivery: new Date(Date.now() + 3 * 86400000),
      currentLocation: 'Miami, FL',
      progress: 30
    }
  ];

  ngOnInit(): void {
    // TODO: Load tracking data from service
    this.initializeMap();
  }

  getProgressColor(shipment: Shipment): 'primary' | 'accent' | 'warn' {
    if (shipment.status === 'delayed') return 'warn';
    if (shipment.status === 'delivered') return 'primary';
    return 'accent';
  }

  viewDetails(shipment: Shipment): void {
    // TODO: Implement shipment details view
    console.log('View shipment details:', shipment);
  }

  private initializeMap(): void {
    // TODO: Initialize map visualization
    // Recommended: Use Google Maps or Mapbox integration
  }
}