import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrderService, Order } from '../../services/order.service';

@Component({
  selector: 'app-completed-orders',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule, 
    MatCardModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Completed Orders</h1>
        <p>Successfully fulfilled and delivered orders</p>
      </div>
      <mat-card class="content-card">
        <mat-card-content>
          <div *ngIf="isLoading" class="loading-spinner">
            <mat-spinner diameter="50"></mat-spinner>
          </div>
          <div *ngIf="!isLoading && orders.length === 0" class="empty-state">
            <mat-icon>check_circle</mat-icon>
            <p>No Completed Orders</p>
            <p class="subtitle">No completed orders at this time</p>
          </div>
          <table *ngIf="!isLoading && orders.length > 0" mat-table [dataSource]="dataSource" class="orders-table">
            <!-- Order Number Column -->
            <ng-container matColumnDef="orderNumber">
              <th mat-header-cell *matHeaderCellDef>Order #</th>
              <td mat-cell *matCellDef="let order">{{ order.orderNumber }}</td>
            </ng-container>
            <!-- Customer Column -->
            <ng-container matColumnDef="customer">
              <th mat-header-cell *matHeaderCellDef>Customer</th>
              <td mat-cell *matCellDef="let order">{{ order.customer?.fullName }}</td>
            </ng-container>
            <!-- Amount Column -->
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let order">₹{{ order.totalAmount }}</td>
            </ng-container>
            <!-- Date Column -->
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let order">{{ formatDate(order.orderDate) }}</td>
            </ng-container>
            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let order">
                <button mat-icon-button (click)="viewOrder(order)" title="View">
                  <mat-icon>visibility</mat-icon>
                </button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { margin: 0 0 8px 0; font-size: 28px; font-weight: 500; }
    .page-header p { margin: 0; color: rgba(0, 0, 0, 0.6); font-size: 14px; }
    .content-card { margin-top: 24px; }
    .empty-state { 
      display: flex; flex-direction: column; align-items: center; 
      justify-content: center; padding: 60px 20px; color: rgba(0, 0, 0, 0.4); 
    }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 16px; }
    .empty-state p { margin: 0; font-size: 16px; }
    .subtitle { font-size: 14px; margin-top: 8px; }
    .loading-spinner { display: flex; justify-content: center; padding: 40px; }
    .orders-table { width: 100%; }
  `]
})
export class CompletedOrdersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  orders: Order[] = [];
  isLoading = false;
  dataSource = new MatTableDataSource<Order>();
  displayedColumns: string[] = ['orderNumber', 'customer', 'amount', 'date', 'actions'];

  constructor(
    private orderService: OrderService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadCompletedOrders();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCompletedOrders(): void {
    this.isLoading = true;
    this.orderService.getOrdersWithFallback({ 
      status: 'delivered',
      page: 1,
      limit: 50 
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        console.log('Completed orders loaded:', response);
        if (response.success && response.data) {
          const orders = (response.data.orders || response.data || []).map((order: any) => ({
            _id: order.id || order._id || '',
            orderNumber: order.order_number || order.orderNumber || `ORD-${order.id}`,
            orderDate: order.created_at || order.orderDate || new Date().toISOString(),
            customer: {
              _id: order.user_id || order.customer?._id || 'unknown-user',
              fullName: order.shipping_address ? JSON.parse(typeof order.shipping_address === 'string' ? order.shipping_address : JSON.stringify(order.shipping_address)).name || 'Unknown' : 'Unknown',
              email: order.customer_email || order.customer?.email || 'N/A',
              phone: ''
            },
            items: order.items || [],
            totalAmount: parseFloat(order.total_amount) || 0,
            paymentMethod: (order.payment_method || 'card') as any,
            paymentStatus: (order.payment_status || 'pending') as any,
            status: (order.status || 'pending') as any,
            shippingAddress: order.shipping_address,
            userId: order.user_id
          }));
          this.orders = orders;
          this.dataSource.data = orders;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading completed orders:', error);
        this.isLoading = false;
        this.snackBar.open('Failed to load completed orders', 'Close', { duration: 3000 });
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  viewOrder(order: Order): void {
    this.snackBar.open('View order feature coming soon', 'Close', { duration: 3000 });
  }
}
