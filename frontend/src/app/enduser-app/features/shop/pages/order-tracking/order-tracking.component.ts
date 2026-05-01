/**
 * 📍 Order Tracking Page (Web)
 * Real-time order tracking with timeline and map
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil, interval } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ShopApi } from 'src/app/core/api/shop.api';

@Component({
  selector: 'app-order-tracking-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tracking-container">
      <div class="page-header">
        <h1>Order Tracking</h1>
        <p>Track your order in real-time</p>
      </div>

      <div *ngIf="!isLoading && order" class="tracking-content">
        <div class="tracking-header">
          <div class="order-info">
            <h2>Order #{{ order.orderNumber }}</h2>
            <p class="order-date">{{ order.createdAt | date: 'medium' }}</p>
          </div>
          <div class="order-status" [ngClass]="'status-' + order.status">
            {{ order.status | titlecase }}
          </div>
        </div>

        <div class="tracking-grid">
          <!-- Timeline -->
          <div class="timeline-section">
            <h3>Delivery Timeline</h3>
            <div class="timeline">
              <div *ngFor="let event of trackingEvents" class="timeline-item" [class.completed]="event.completed">
                <div class="timeline-dot" [class.completed]="event.completed"></div>
                <div class="timeline-content">
                  <p class="event-title">{{ event.title }}</p>
                  <p class="event-time">{{ event.date | date: 'short' }}</p>
                  <p class="event-description" *ngIf="event.description">{{ event.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Current Status -->
          <div class="status-section">
            <h3>Current Status</h3>
            <div class="status-card">
              <div class="status-icon">📦</div>
              <div class="status-details">
                <p class="current-status">{{ currentStatus?.title }}</p>
                <p class="status-location" *ngIf="currentStatus?.location">📍 {{ currentStatus.location }}</p>
                <p class="status-time" *ngIf="currentStatus?.date">{{ currentStatus?.date | date: 'medium' }}</p>
              </div>
            </div>

            <!-- Shipment Details -->
            <div class="shipment-info">
              <h4>Shipment Details</h4>
              <div class="info-row">
                <span>Carrier</span>
                <span>{{ order.carrier || 'Standard Shipping' }}</span>
              </div>
              <div class="info-row">
                <span>Tracking Number</span>
                <span>{{ order.trackingNumber || 'Not available yet' }}</span>
              </div>
              <div class="info-row">
                <span>Estimated Delivery</span>
                <span>{{ estimatedDelivery | date: 'mediumDate' }}</span>
              </div>
            </div>
          </div>

          <!-- Items -->
          <div class="items-section">
            <h3>Items in this Order ({{ order.items?.length }})</h3>
            <div class="items-list">
              <div *ngFor="let item of order.items" class="item-row">
                <img [src]="getImageUrl(item.image)" class="item-image" />
                <div class="item-info">
                  <p class="item-name">{{ item.productName }}</p>
                  <p class="item-qty">Qty: {{ item.quantity }}</p>
                </div>
                <p class="item-price">₹{{ (item.quantity * item.price) | number: '1.2-2' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Delivery Address -->
        <div class="delivery-section">
          <h3>Being Delivered To</h3>
          <div class="address-card">
            <p class="name">{{ order.shippingAddress?.firstName }} {{ order.shippingAddress?.lastName }}</p>
            <p>{{ order.shippingAddress?.street }}</p>
            <p>{{ order.shippingAddress?.city }}, {{ order.shippingAddress?.state }} {{ order.shippingAddress?.zipCode }}</p>
            <p class="phone">📞 {{ order.shippingAddress?.phoneNumber }}</p>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Loading tracking information...</p>
      </div>
    </div>
  `,
  styles: [`
    .tracking-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .page-header {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
    }

    .page-header h1 {
      font-size: 28px;
      margin-bottom: 8px;
    }

    .tracking-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 8px;
    }

    .order-info h2 {
      margin: 0;
      font-size: 20px;
    }

    .order-date {
      color: #666;
      margin: 5px 0 0 0;
    }

    .order-status {
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
    }

    .order-status.status-pending {
      background: #fef08a;
      color: #92400e;
    }

    .order-status.status-processing {
      background: #dbeafe;
      color: #1e40af;
    }

    .order-status.status-shipped {
      background: #c7d2fe;
      color: #3730a3;
    }

    .order-status.status-delivered {
      background: #dcfce7;
      color: #166534;
    }

    .tracking-grid {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 30px;
      margin-bottom: 30px;
    }

    @media (max-width: 768px) {
      .tracking-grid {
        grid-template-columns: 1fr;
      }
    }

    .timeline-section h3,
    .status-section h3,
    .items-section h3,
    .delivery-section h3 {
      font-size: 18px;
      margin-bottom: 20px;
    }

    .timeline {
      position: relative;
      padding-left: 30px;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 5px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #eee;
    }

    .timeline-item {
      margin-bottom: 30px;
      position: relative;
    }

    .timeline-item.completed::before {
      content: '';
      position: absolute;
      left: -30px;
      top: 0;
      width: 100%;
      height: 100%;
      background: rgba(16, 185, 129, 0.05);
      border-radius: 4px;
    }

    .timeline-dot {
      width: 12px;
      height: 12px;
      background: #ddd;
      border-radius: 50%;
      position: absolute;
      left: -33px;
      top: 0;
      border: 2px solid white;
    }

    .timeline-dot.completed {
      background: #10b981;
    }

    .event-title {
      font-weight: 600;
      margin-bottom: 4px;
    }

    .event-time {
      font-size: 12px;
      color: #999;
    }

    .event-description {
      font-size: 13px;
      color: #666;
      margin-top: 4px;
    }

    .status-card {
      background: #f0fdf4;
      border: 1px solid #dcfce7;
      border-radius: 8px;
      padding: 20px;
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
    }

    .status-icon {
      font-size: 32px;
    }

    .current-status {
      font-weight: 600;
      font-size: 16px;
      margin: 0;
    }

    .status-location {
      color: #666;
      margin: 4px 0;
    }

    .status-time {
      color: #999;
      font-size: 12px;
      margin: 4px 0 0 0;
    }

    .shipment-info {
      background: #f9f9f9;
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 15px;
    }

    .shipment-info h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
      font-size: 13px;
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .info-row span:first-child {
      color: #666;
    }

    .items-list {
      background: #f9f9f9;
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 15px;
    }

    .item-row {
      display: flex;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
      align-items: center;
    }

    .item-row:last-child {
      border-bottom: none;
    }

    .item-image {
      width: 50px;
      height: 50px;
      border-radius: 4px;
      object-fit: cover;
    }

    .item-info {
      flex: 1;
    }

    .item-name {
      font-weight: 500;
      margin: 0;
    }

    .item-qty {
      font-size: 12px;
      color: #999;
      margin: 4px 0 0 0;
    }

    .item-price {
      font-weight: 600;
    }

    .delivery-section {
      background: #f9f9f9;
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 25px;
    }

    .address-card {
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 15px;
      line-height: 1.8;
    }

    .address-card .name {
      font-weight: 600;
      margin-bottom: 8px;
    }

    .address-card .phone {
      margin-top: 8px;
    }

    .loading {
      text-align: center;
      padding: 60px 20px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #eee;
      border-top: 4px solid #10b981;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class OrderTrackingPageComponent implements OnInit, OnDestroy {
  order: any = null;
  trackingEvents: any[] = [];
  currentStatus: any = null;
  estimatedDelivery: Date = new Date();
  isLoading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private shopApi: ShopApi
  ) {}

  ngOnInit() {
    this.loadTrackingInfo();
    // Reload every 30 seconds for real-time updates
    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadTrackingInfo());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTrackingInfo() {
    const orderId = this.route.snapshot.paramMap.get('id');
    
    if (!orderId) return;

    this.shopApi.getOrderTracking(orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.order = response.data?.order;
          this.trackingEvents = response.data?.events || [];
          this.currentStatus = this.trackingEvents[this.trackingEvents.length - 1];
          
          const delivery = new Date();
          delivery.setDate(delivery.getDate() + 5);
          this.estimatedDelivery = delivery;
          
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load tracking info:', error);
          this.isLoading = false;
        }
      });
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '/assets/placeholder.png';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return environment.apiUrl + imagePath;
    return environment.apiUrl + '/uploads/' + imagePath;
  }
}
