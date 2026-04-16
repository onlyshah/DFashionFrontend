/**
 * 📋 Order History Component
 * View all orders with filtering, tracking, and reorder functionality
 */

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  totalPrice: number;
  paymentMethod: string;
  deliveryAddress: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  createdAt: string;
  trackingNumber?: string;
  canCancel: boolean;
  canReturn: boolean;
  vendorId?: string;
}

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="goBack()">
            <ion-icon name="arrow-back"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Order History</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="order-history-content">
      <!-- Filter Tabs -->
      <ion-segment
        value="all"
        (ionChange)="currentFilter = $event.detail.value || 'all'"
        class="order-filters"
      >
        <ion-segment-button value="all">All</ion-segment-button>
        <ion-segment-button value="active">Active</ion-segment-button>
        <ion-segment-button value="delivered">Delivered</ion-segment-button>
        <ion-segment-button value="cancelled">Cancelled</ion-segment-button>
      </ion-segment>

      <!-- Search Bar -->
      <div class="search-section">
        <ion-searchbar
          [value]="searchQuery"
          placeholder="Search orders by number..."
          clearInput
          debounce="300"
          (ionInput)="searchQuery = $event.detail.value || ''; filterOrders()"
        ></ion-searchbar>
      </div>

      <!-- Orders List -->
      <div *ngIf="filteredOrders.length > 0" class="orders-list">
        <div
          *ngFor="let order of filteredOrders"
          class="order-card"
          (click)="viewOrderDetails(order)"
        >
          <!-- Order Header -->
          <div class="order-header">
            <div class="order-info">
              <p class="order-number">Order #{{ order.orderNumber }}</p>
              <p class="order-date">{{ formatDate(order.createdAt) }}</p>
            </div>

            <ion-badge [color]="getStatusColor(order.status)">
              {{ formatStatus(order.status) }}
            </ion-badge>
          </div>

          <!-- Order Items Preview -->
          <div class="items-preview">
            <img
              *ngFor="let item of order.items.slice(0, 3)"
              [src]="item.productImage"
              class="item-image"
              [title]="item.productName"
            />
            <div *ngIf="order.items.length > 3" class="more-items">
              +{{ order.items.length - 3 }}
            </div>
          </div>

          <!-- Order Details -->
          <div class="order-details">
            <div class="detail-row">
              <span class="label">Items</span>
              <span class="value">{{ order.items.length }} Item{{ order.items.length > 1 ? 's' : '' }}</span>
            </div>

            <div class="detail-row">
              <span class="label">Total</span>
              <span class="value">₹{{ order.totalPrice }}</span>
            </div>

            <div class="detail-row" *ngIf="order.estimatedDelivery && order.status !== 'delivered'">
              <span class="label">Est. Delivery</span>
              <span class="value">{{ formatDate(order.estimatedDelivery) }}</span>
            </div>

            <div class="detail-row" *ngIf="order.actualDelivery && order.status === 'delivered'">
              <span class="label">Delivered</span>
              <span class="value">{{ formatDate(order.actualDelivery) }}</span>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions">
            <ion-button
              expand="block"
              fill="clear"
              size="small"
              (click)="trackOrder($event, order)"
              *ngIf="['shipped', 'processing', 'confirmed'].includes(order.status)"
            >
              <ion-icon name="location" slot="start"></ion-icon>
              Track
            </ion-button>

            <ion-button
              expand="block"
              fill="clear"
              size="small"
              (click)="viewOrderDetails(order)"
            >
              <ion-icon name="eye" slot="start"></ion-icon>
              Details
            </ion-button>

            <ion-button
              expand="block"
              fill="clear"
              size="small"
              color="danger"
              (click)="cancelOrder($event, order)"
              *ngIf="order.canCancel"
            >
              <ion-icon name="close-circle" slot="start"></ion-icon>
              Cancel
            </ion-button>

            <ion-button
              expand="block"
              fill="clear"
              size="small"
              (click)="initiateReturn($event, order)"
              *ngIf="order.canReturn"
            >
              <ion-icon name="repeat" slot="start"></ion-icon>
              Return
            </ion-button>

            <ion-button
              expand="block"
              fill="clear"
              size="small"
              (click)="reorder($event, order)"
              *ngIf="order.status === 'delivered'"
            >
              <ion-icon name="refresh" slot="start"></ion-icon>
              Reorder
            </ion-button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="filteredOrders.length === 0" class="empty-state">
        <ion-icon name="receipt"></ion-icon>
        <h2>No Orders Found</h2>
        <p *ngIf="currentFilter === 'all' && !searchQuery">
          You haven't placed any orders yet
        </p>
        <p *ngIf="searchQuery">
          No orders match your search
        </p>
        <ion-button fill="outline" (click)="startShopping()">
          <ion-icon name="bag" slot="start"></ion-icon>
          Start Shopping
        </ion-button>
      </div>

      <!-- Order Statistics -->
      <div class="stats-section" *ngIf="orders.length > 0">
        <h3>Statistics</h3>
        <div class="stats-grid">
          <div class="stat-box">
            <p class="stat-number">{{ getTotalOrders() }}</p>
            <p class="stat-label">Total Orders</p>
          </div>
          <div class="stat-box">
            <p class="stat-number">₹{{ getTotalSpent() }}</p>
            <p class="stat-label">Amount Spent</p>
          </div>
          <div class="stat-box">
            <p class="stat-number">{{ getDeliveredCount() }}</p>
            <p class="stat-label">Delivered</p>
          </div>
          <div class="stat-box">
            <p class="stat-number">{{ getPendingCount() }}</p>
            <p class="stat-label">In Transit</p>
          </div>
        </div>
      </div>

      <!-- Help Section -->
      <div class="help-section">
        <h3>Need Help?</h3>
        <ion-button expand="block" fill="outline" (click)="contactSupport()">
          <ion-icon name="chatbubble" slot="start"></ion-icon>
          Contact Support
        </ion-button>
        <ion-button expand="block" fill="outline" (click)="viewFAQ()">
          <ion-icon name="help-circle" slot="start"></ion-icon>
          FAQ
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    .order-history-content {
      --background: #f9f9f9;
    }

    .order-filters {
      --background: white;
      border-bottom: 1px solid #eee;
    }

    .search-section {
      padding: 8px;
      background: white;
      border-bottom: 1px solid #eee;
    }

    .search-section ion-searchbar {
      --border-radius: 6px;
      --padding-start: 4px;
      --padding-end: 4px;
    }

    .orders-list {
      padding: 12px;
    }

    .order-card {
      background: white;
      border-radius: 8px;
      margin-bottom: 12px;
      overflow: hidden;
      border: 1px solid #eee;
      transition: box-shadow 0.2s;
    }

    .order-card:active {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 12px;
      border-bottom: 1px solid #f0f0f0;
    }

    .order-info {
      flex: 1;
    }

    .order-number {
      font-size: 13px;
      font-weight: bold;
      margin: 0 0 4px 0;
      color: #333;
    }

    .order-date {
      font-size: 11px;
      color: #999;
      margin: 0;
    }

    .items-preview {
      display: flex;
      gap: 4px;
      padding: 12px;
      border-bottom: 1px solid #f0f0f0;
      background: #fafafa;
      align-items: center;
    }

    .item-image {
      width: 40px;
      height: 40px;
      border-radius: 4px;
      object-fit: cover;
      border: 1px solid #eee;
    }

    .more-items {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e8e8e8;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
      color: #666;
    }

    .order-details {
      padding: 12px;
      border-bottom: 1px solid #f0f0f0;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      padding: 6px 0;
      border-bottom: 1px solid #f9f9f9;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .label {
      color: #999;
      font-weight: 500;
    }

    .value {
      color: #333;
      font-weight: bold;
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 4px;
      padding: 8px;
    }

    .quick-actions ion-button {
      margin: 0;
      --padding-start: 2px;
      --padding-end: 2px;
      font-size: 10px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 60vh;
      text-align: center;
      color: #999;
    }

    .empty-state ion-icon {
      font-size: 64px;
      opacity: 0.3;
      margin-bottom: 16px;
    }

    .empty-state h2 {
      font-size: 18px;
      margin: 0 0 8px 0;
    }

    .empty-state p {
      font-size: 13px;
      margin: 0 0 16px 0;
    }

    .empty-state ion-button {
      margin-top: 8px;
    }

    .stats-section {
      background: white;
      padding: 16px;
      margin: 12px;
      border-radius: 8px;
      border: 1px solid #eee;
    }

    .stats-section h3 {
      font-size: 14px;
      font-weight: bold;
      margin: 0 0 12px 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .stat-box {
      text-align: center;
      padding: 12px;
      background: #f9f9f9;
      border-radius: 6px;
      border: 1px solid #eee;
    }

    .stat-number {
      font-size: 16px;
      font-weight: bold;
      margin: 0 0 4px 0;
      color: #333;
    }

    .stat-label {
      font-size: 11px;
      color: #999;
      margin: 0;
    }

    .help-section {
      background: white;
      padding: 16px;
      margin: 12px;
      border-radius: 8px;
      border: 1px solid #eee;
    }

    .help-section h3 {
      font-size: 14px;
      font-weight: bold;
      margin: 0 0 12px 0;
    }

    .help-section ion-button {
      margin: 6px 0;
    }

    .help-section ion-button:first-of-type {
      margin-top: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderHistoryPageComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  currentFilter: string | any = 'all';
  searchQuery: string = '';
  isLoading: boolean = true;

  get filteredOrders(): Order[] {
    let result = this.orders;

    // Filter by status
    if (this.currentFilter === 'all') {
      result = result;
    } else if (this.currentFilter === 'active') {
      result = result.filter(o => !['delivered', 'cancelled'].includes(o.status));
    } else if (this.currentFilter === 'delivered') {
      result = result.filter(o => o.status === 'delivered');
    } else if (this.currentFilter === 'cancelled') {
      result = result.filter(o => o.status === 'cancelled');
    }

    // Filter by search
    if (this.searchQuery.trim()) {
      result = result.filter(o =>
        o.orderNumber.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    return result;
  }

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrders() {
    this.http.get('/api/orders')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.orders = response.data || [];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load orders:', error);
          this.isLoading = false;
          this.showToast('Failed to load orders', 'danger');
        }
      });
  }

  filterOrders() {
    // Filtering is done via getter
  }

  viewOrderDetails(order: Order) {
    this.router.navigate(['/tabs/order-detail', order.id]);
  }

  trackOrder(event: Event, order: Order) {
    event.stopPropagation();
    this.router.navigate(['/tabs/order-tracking', order.id]);
  }

  async cancelOrder(event: Event, order: Order) {
    event.stopPropagation();

    const alert = await this.alertController.create({
      header: 'Cancel Order',
      message: 'Are you sure you want to cancel this order?',
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Yes, Cancel',
          handler: () => {
            this.http.post(`/api/orders/${order.id}/cancel`, {})
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: () => {
                  order.status = 'cancelled';
                  this.showToast('Order cancelled successfully', 'success');
                },
                error: (error) => {
                  console.error('Failed to cancel order:', error);
                  this.showToast('Failed to cancel order', 'danger');
                }
              });
          }
        }
      ]
    });

    await alert.present();
  }

  async initiateReturn(event: Event, order: Order) {
    event.stopPropagation();
    this.router.navigate(['/tabs/returns'], { state: { orderId: order.id } });
  }

  reorder(event: Event, order: Order) {
    event.stopPropagation();

    const cartItems = order.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      size: item.size,
      color: item.color
    }));

    this.http.post('/api/cart/bulk-add', { items: cartItems })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showToast('Items added to cart', 'success');
          this.router.navigate(['/tabs/cart']);
        },
        error: (error) => {
          console.error('Failed to reorder:', error);
          this.showToast('Failed to add items to cart', 'danger');
        }
      });
  }

  startShopping() {
    this.router.navigate(['/tabs/shop']);
  }

  contactSupport() {
    this.router.navigate(['/support']);
  }

  viewFAQ() {
    console.log('📖 View FAQ');
  }

  getTotalOrders(): number {
    return this.orders.length;
  }

  getTotalSpent(): number {
    return this.orders.reduce((sum, order) => sum + order.totalPrice, 0);
  }

  getDeliveredCount(): number {
    return this.orders.filter(o => o.status === 'delivered').length;
  }

  getPendingCount(): number {
    return this.orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;
  }

  goBack() {
    this.router.navigate(['/tabs/profile']);
  }

  formatStatus(status: string): string {
    return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'warning',
      'confirmed': 'primary',
      'processing': 'primary',
      'shipped': 'info',
      'delivered': 'success',
      'cancelled': 'danger'
    };
    return colors[status] || 'medium';
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
