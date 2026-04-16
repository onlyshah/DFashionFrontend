/**
 * 📦 Order Tracking Component
 * Real-time order status tracking with delivery timeline
 */

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface TrackingStep {
  status: string;
  timestamp: string;
  completed: boolean;
  location?: string;
  description: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'in-transit' | 'delivered' | 'cancelled';
  totalAmount: number;
  items: any[];
  shippingAddress: any;
  trackingNumber?: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  trackingSteps: TrackingStep[];
  carrier?: {
    name: string;
    trackingUrl?: string;
  };
  createdAt: string;
}

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="goBack()">
            <ion-icon name="arrow-back"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Order Tracking</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="order-tracking-content">
      <div *ngIf="!isLoading && order">
        <!-- Order Header -->
        <div class="order-header">
          <div class="order-info-row">
            <div class="info-item">
              <p class="label">Order #</p>
              <h3>{{ order.orderNumber }}</h3>
            </div>
            <div class="info-item">
              <p class="label">Status</p>
              <ion-badge [color]="getStatusColor(order.status)">
                {{ formatStatus(order.status) }}
              </ion-badge>
            </div>
          </div>
        </div>

        <!-- Tracking Timeline -->
        <div class="tracking-section">
          <h3>Tracking Timeline</h3>

          <div class="timeline">
            <div
              *ngFor="let step of order.trackingSteps; let i = index"
              class="timeline-step"
              [class.completed]="step.completed"
            >
              <!-- Connector Line -->
              <div
                *ngIf="i < order.trackingSteps.length - 1"
                class="connector"
                [class.completed]="step.completed"
              ></div>

              <!-- Step Marker -->
              <div class="step-marker">
                <div class="marker-dot" [class.active]="step.completed">
                  <ion-icon *ngIf="step.completed" name="checkmark"></ion-icon>
                </div>
              </div>

              <!-- Step Content -->
              <div class="step-content">
                <h4>{{ step.status }}</h4>
                <p class="timestamp">
                  {{ formatTimestamp(step.timestamp) }}
                </p>
                <p *ngIf="step.location" class="location">
                  📍 {{ step.location }}
                </p>
                <p *ngIf="step.description" class="description">
                  {{ step.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Estimated Delivery -->
        <div class="delivery-section" *ngIf="order.status !== 'delivered'">
          <ion-card class="delivery-card">
            <ion-card-header>
              <ion-card-title class="card-title">
                <ion-icon name="calendar"></ion-icon>
                Estimated Delivery
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <div class="delivery-info">
                <h3>{{ formatDeliveryDate(order.estimatedDelivery) }}</h3>
                <p>Expected by {{ formatDeliveryTime(order.estimatedDelivery) }}</p>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Delivered Info -->
        <div class="delivered-section" *ngIf="order.status === 'delivered' && order.actualDelivery">
          <ion-card class="delivered-card">
            <ion-card-header>
              <ion-card-title class="card-title">
                <ion-icon name="checkmark-circle"></ion-icon>
                Delivered
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p>Delivered on {{ formatDeliveryDate(order.actualDelivery) }}</p>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Shipping Address -->
        <div class="address-section">
          <h3>Shipping Address</h3>
          <ion-card>
            <ion-card-content class="address-content">
              <p class="address-name">{{ order.shippingAddress.name }}</p>
              <p>{{ order.shippingAddress.street }}<br />
                {{ order.shippingAddress.city }}, {{ order.shippingAddress.state }}
                {{ order.shippingAddress.zipCode }}</p>
              <p class="phone">{{ order.shippingAddress.phone }}</p>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Tracking Number & Carrier -->
        <div *ngIf="order.trackingNumber && order.carrier" class="carrier-section">
          <h3>Carrier Information</h3>
          <ion-card>
            <ion-card-content class="carrier-content">
              <div class="carrier-info">
                <p class="label">Carrier</p>
                <p class="value">{{ order.carrier.name }}</p>
              </div>
              <div class="tracking-number">
                <p class="label">Tracking Number</p>
                <p class="value">{{ order.trackingNumber }}</p>
                <ion-button
                  size="small"
                  fill="outline"
                  (click)="trackWithCarrier()"
                >
                  Track with {{ order.carrier.name }}
                </ion-button>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Order Items -->
        <div class="items-section">
          <h3>Order Items ({{ order.items.length }})</h3>

          <div *ngFor="let item of order.items" class="item-card">
            <img [src]="item.image" class="item-image" />
            <div class="item-details">
              <h4>{{ item.name }}</h4>
              <p class="quantity">Qty: {{ item.quantity }}</p>
              <p class="price">₹{{ item.price }}</p>
            </div>
            <div class="item-total">
              <p>₹{{ item.price * item.quantity }}</p>
            </div>
          </div>

          <!-- Price Breakdown -->
          <div class="price-breakdown">
            <div class="breakdown-row">
              <span>Subtotal</span>
              <span>₹{{ getSubtotal(order.items) }}</span>
            </div>
            <div class="breakdown-row">
              <span>Shipping</span>
              <span>₹{{ order.totalAmount - getSubtotal(order.items) - getTax(order.items) }}</span>
            </div>
            <div class="breakdown-row">
              <span>Tax</span>
              <span>₹{{ getTax(order.items) }}</span>
            </div>
            <div class="breakdown-row total">
              <span>Total</span>
              <span>₹{{ order.totalAmount }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions-section">
          <ion-button expand="block" fill="outline" (click)="contactSupport()">
            <ion-icon name="call" slot="start"></ion-icon>
            Contact Support
          </ion-button>

          <ion-button
            expand="block"
            fill="outline"
            *ngIf="order.status === 'delivered'"
            (click)="returnOrder()"
          >
            <ion-icon name="refresh" slot="start"></ion-icon>
            Return Item
          </ion-button>

          <ion-button
            expand="block"
            fill="outline"
            *ngIf="order.status === 'delivered'"
            (click)="reviewOrder()"
          >
            <ion-icon name="star" slot="start"></ion-icon>
            Write Review
          </ion-button>

          <ion-button
            expand="block"
            fill="outline"
            color="danger"
            *ngIf="order.status === 'pending' || order.status === 'confirmed'"
            (click)="cancelOrder()"
          >
            <ion-icon name="close-circle" slot="start"></ion-icon>
            Cancel Order
          </ion-button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-state">
        <ion-spinner name="circular"></ion-spinner>
        <p>Loading order details...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="!isLoading && !order" class="error-state">
        <ion-icon name="alert-circle"></ion-icon>
        <h2>Order Not Found</h2>
        <p>Unable to load order details</p>
        <ion-button (click)="goBack()">Go Back</ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    .order-tracking-content {
      --background: #f9f9f9;
      padding-bottom: 20px;
    }

    .order-header {
      background: #fff;
      padding: 20px 16px;
      border-bottom: 1px solid #eee;
    }

    .order-info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .info-item {
      display: flex;
      flex-direction: column;
    }

    .info-item .label {
      font-size: 12px;
      color: #999;
      margin: 0;
      text-transform: uppercase;
    }

    .info-item h3 {
      font-size: 16px;
      margin: 4px 0 0 0;
      color: #333;
    }

    .tracking-section {
      padding: 20px 16px;
    }

    .tracking-section h3 {
      font-size: 16px;
      font-weight: bold;
      margin: 0 0 20px 0;
      color: #333;
    }

    .timeline {
      position: relative;
      padding-left: 40px;
    }

    .timeline-step {
      position: relative;
      margin-bottom: 24px;
    }

    .timeline-step:last-child {
      margin-bottom: 0;
    }

    .connector {
      position: absolute;
      left: -22px;
      top: 28px;
      width: 2px;
      height: 40px;
      background: #ddd;
    }

    .connector.completed {
      background: var(--ion-color-success);
    }

    .step-marker {
      position: absolute;
      left: -34px;
      top: 0;
    }

    .marker-dot {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #eee;
      border: 2px solid #ddd;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
    }

    .marker-dot.active {
      background: var(--ion-color-success);
      border-color: var(--ion-color-success);
      color: white;
    }

    .step-content h4 {
      font-size: 14px;
      font-weight: bold;
      margin: 0 0 4px 0;
      color: #333;
    }

    .step-content .timestamp {
      font-size: 12px;
      color: #999;
      margin: 0 0 4px 0;
    }

    .step-content .location {
      font-size: 12px;
      color: #666;
      margin: 0 0 2px 0;
    }

    .step-content .description {
      font-size: 12px;
      color: #666;
      margin: 0;
    }

    .delivery-section,
    .delivered-section {
      padding: 0 16px 20px 16px;
    }

    .delivery-card,
    .delivered-card {
      margin: 0;
    }

    .delivered-card {
      --background: rgba(49, 162, 76, 0.1);
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      margin: 0;
    }

    .card-title ion-icon {
      font-size: 18px;
    }

    .delivery-info h3 {
      font-size: 18px;
      font-weight: bold;
      margin: 0 0 4px 0;
      color: var(--ion-color-primary);
    }

    .delivery-info p {
      font-size: 12px;
      color: #666;
      margin: 0;
    }

    .address-section,
    .carrier-section,
    .items-section {
      padding: 20px 16px;
    }

    .address-section h3,
    .carrier-section h3,
    .items-section h3 {
      font-size: 14px;
      font-weight: bold;
      margin: 0 0 12px 0;
      color: #333;
    }

    .address-content {
      padding: 0;
    }

    .address-name {
      font-weight: bold;
      margin: 0 0 6px 0;
    }

    .address-content p {
      font-size: 13px;
      line-height: 1.6;
      margin: 0 0 6px 0;
      color: #666;
    }

    .phone {
      margin-top: 8px;
      font-weight: 500;
    }

    .carrier-content {
      padding: 0;
    }

    .carrier-info,
    .tracking-number {
      margin-bottom: 12px;
    }

    .carrier-info:last-child,
    .tracking-number:last-child {
      margin-bottom: 0;
    }

    .carrier-content .label {
      font-size: 12px;
      color: #999;
      margin: 0 0 4px 0;
      text-transform: uppercase;
    }

    .carrier-content .value {
      font-size: 14px;
      font-weight: bold;
      color: #333;
      margin: 0 0 8px 0;
    }

    .item-card {
      display: flex;
      gap: 12px;
      padding: 12px;
      background: white;
      border-radius: 8px;
      margin-bottom: 8px;
      align-items: center;
    }

    .item-image {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 6px;
    }

    .item-details {
      flex: 1;
    }

    .item-details h4 {
      font-size: 13px;
      font-weight: bold;
      margin: 0 0 4px 0;
    }

    .item-details .quantity {
      font-size: 11px;
      color: #999;
      margin: 0 0 2px 0;
    }

    .item-details .price {
      font-size: 12px;
      color: #666;
      margin: 0;
    }

    .item-total {
      text-align: right;
    }

    .item-total p {
      font-size: 14px;
      font-weight: bold;
      color: #333;
      margin: 0;
    }

    .price-breakdown {
      background: white;
      border-radius: 8px;
      padding: 12px;
      margin-top: 12px;
    }

    .breakdown-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .breakdown-row:last-child {
      border-bottom: none;
    }

    .breakdown-row.total {
      font-weight: bold;
      font-size: 14px;
      padding: 12px 0 0 0;
      margin-top: 8px;
      border-top: 2px solid #f0f0f0;
    }

    .actions-section {
      padding: 20px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    ion-button {
      margin: 0;
    }

    .loading-state,
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 60vh;
      text-align: center;
      color: #999;
    }

    .loading-state ion-spinner {
      margin-bottom: 16px;
    }

    .error-state ion-icon {
      font-size: 64px;
      opacity: 0.3;
      margin-bottom: 16px;
    }

    .error-state h2 {
      font-size: 18px;
      margin: 0 0 8px 0;
    }

    .error-state p {
      font-size: 14px;
      margin: 0 0 20px 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  order: Order | null = null;
  isLoading: boolean = true;
  orderId: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.activatedRoute.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.orderId = params['id'];
        this.loadOrder();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrder() {
    this.http.get(`/api/orders/${this.orderId}/tracking`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.order = response.data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load order:', error);
          this.isLoading = false;
        }
      });
  }

  goBack() {
    this.router.navigate(['/tabs/orders']);
  }

  trackWithCarrier() {
    if (this.order?.carrier?.trackingUrl) {
      window.open(this.order.carrier.trackingUrl, '_blank');
    }
  }

  contactSupport() {
    this.router.navigate(['/support'], { state: { orderId: this.orderId } });
  }

  returnOrder() {
    this.router.navigate(['/returns'], { state: { orderId: this.orderId } });
  }

  reviewOrder() {
    this.router.navigate(['/review'], { state: { orderId: this.orderId } });
  }

  cancelOrder() {
    console.log('❌ Cancel order:', this.orderId);
    // Implement cancel dialog
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'warning',
      'confirmed': 'primary',
      'processing': 'primary',
      'shipped': 'info',
      'in-transit': 'info',
      'delivered': 'success',
      'cancelled': 'danger'
    };
    return colors[status] || 'medium';
  }

  formatStatus(status: string): string {
    return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatDeliveryDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  formatDeliveryTime(date: string): string {
    const deliveryDate = new Date(date);
    const today = new Date();
    const diff = deliveryDate.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `in ${days} days`;
  }

  getSubtotal(items: any[]): number {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getTax(items: any[]): number {
    const subtotal = this.getSubtotal(items);
    return Math.round(subtotal * 0.12); // 12% GST
  }
}
