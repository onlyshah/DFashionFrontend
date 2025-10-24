import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';

interface Order {
  id: string;
  customerName: string;
  orderDate: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: number;
  paymentStatus: 'paid' | 'pending' | 'failed';
  shippingAddress: string;
}

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatMenuModule,
    RouterModule
  ],
  template: `
    <div class="order-list-container">
      <header class="page-header">
        <div class="header-content">
          <h1>Orders</h1>
          <p class="subtitle">Manage customer orders and fulfillment</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="exportOrders()">
            <mat-icon>download</mat-icon>
            Export Orders
          </button>
        </div>
      </header>

      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="orders" matSort class="orders-table">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Order ID</th>
              <td mat-cell *matCellDef="let order">
                <a [routerLink]="['detail', order.id]" class="order-link">
                  #{{ order.id }}
                </a>
              </td>
            </ng-container>

            <ng-container matColumnDef="customerName">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Customer</th>
              <td mat-cell *matCellDef="let order">{{ order.customerName }}</td>
            </ng-container>

            <ng-container matColumnDef="orderDate">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Order Date</th>
              <td mat-cell *matCellDef="let order">
                {{ order.orderDate | date:'medium' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
              <td mat-cell *matCellDef="let order">
                <mat-chip [color]="getStatusColor(order.status)" selected>
                  {{ order.status }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="total">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Total</th>
              <td mat-cell *matCellDef="let order">
                \${{ order.total | number:'1.2-2' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="items">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Items</th>
              <td mat-cell *matCellDef="let order">{{ order.items }}</td>
            </ng-container>

            <ng-container matColumnDef="paymentStatus">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Payment</th>
              <td mat-cell *matCellDef="let order">
                <mat-chip [color]="getPaymentStatusColor(order.paymentStatus)" selected>
                  {{ order.paymentStatus }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let order">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item [routerLink]="['detail', order.id]">
                    <mat-icon>visibility</mat-icon>
                    <span>View Details</span>
                  </button>
                  <button mat-menu-item (click)="updateStatus(order)">
                    <mat-icon>update</mat-icon>
                    <span>Update Status</span>
                  </button>
                  <button mat-menu-item (click)="printInvoice(order)">
                    <mat-icon>receipt</mat-icon>
                    <span>Print Invoice</span>
                  </button>
                  <button mat-menu-item (click)="sendNotification(order)">
                    <mat-icon>notifications</mat-icon>
                    <span>Send Notification</span>
                  </button>
                  <mat-divider></mat-divider>
                  <button mat-menu-item color="warn" (click)="cancelOrder(order)">
                    <mat-icon color="warn">cancel</mat-icon>
                    <span class="text-warn">Cancel Order</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <mat-paginator
            [pageSize]="10"
            [pageSizeOptions]="[5, 10, 25, 100]"
            showFirstLastButtons>
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .order-list-container {
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

    .orders-table {
      width: 100%;

      .order-link {
        color: #1976d2;
        text-decoration: none;
        font-weight: 500;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .mat-column-actions {
      width: 48px;
      text-align: center;
    }

    .text-warn {
      color: #f44336;
    }

    @media (max-width: 600px) {
      .order-list-container {
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

      .orders-table {
        display: block;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
    }
  `]
})
export class OrderListComponent implements OnInit {
  displayedColumns = ['id', 'customerName', 'orderDate', 'status', 'total', 'items', 'paymentStatus', 'actions'];

  orders: Order[] = [
    {
      id: '1001',
      customerName: 'John Smith',
      orderDate: new Date(),
      status: 'pending',
      total: 299.99,
      items: 3,
      paymentStatus: 'paid',
      shippingAddress: '123 Main St, City, State 12345'
    },
    {
      id: '1002',
      customerName: 'Emma Wilson',
      orderDate: new Date(Date.now() - 86400000),
      status: 'processing',
      total: 159.50,
      items: 2,
      paymentStatus: 'paid',
      shippingAddress: '456 Oak Ave, City, State 12345'
    },
    {
      id: '1003',
      customerName: 'Michael Johnson',
      orderDate: new Date(Date.now() - 172800000),
      status: 'shipped',
      total: 499.99,
      items: 5,
      paymentStatus: 'paid',
      shippingAddress: '789 Pine Rd, City, State 12345'
    }
  ];

  ngOnInit(): void {
    // TODO: Load orders from service
  }

  getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'delivered':
        return 'primary';
      case 'shipped':
      case 'processing':
        return 'accent';
      case 'cancelled':
        return 'warn';
      default:
        return 'primary';
    }
  }

  getPaymentStatusColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'paid':
        return 'primary';
      case 'pending':
        return 'accent';
      case 'failed':
        return 'warn';
      default:
        return 'primary';
    }
  }

  exportOrders(): void {
    // TODO: Implement export functionality
    console.log('Export orders');
  }

  updateStatus(order: Order): void {
    // TODO: Implement status update dialog
    console.log('Update status:', order);
  }

  printInvoice(order: Order): void {
    // TODO: Implement invoice printing
    console.log('Print invoice:', order);
  }

  sendNotification(order: Order): void {
    // TODO: Implement notification sending
    console.log('Send notification:', order);
  }

  cancelOrder(order: Order): void {
    // TODO: Implement order cancellation
    console.log('Cancel order:', order);
  }
}