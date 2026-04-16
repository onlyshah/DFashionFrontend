/**
 * 📋 Order Confirmation Page (Web)
 * Desktop-optimized order confirmation with details and next steps
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-order-confirmation-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="confirmation-container">
      <!-- Success Header -->
      <div class="success-header" *ngIf="!isLoading">
        <div class="success-icon">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="39" fill="#10B981" opacity="0.1" stroke="#10B981" stroke-width="2"/>
            <path d="M33 43L37 47L47 37" stroke="#10B981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1>Order Confirmed!</h1>
        <p class="subtitle">Thank you for your purchase. We'll keep you updated on your order status via email.</p>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading your order details...</p>
      </div>

      <!-- Order Summary -->
      <div *ngIf="order && !isLoading" class="order-summary">
        <div class="summary-grid">
          <!-- Left Column -->
          <div class="left-column">
            <!-- Order Details Card -->
            <div class="info-card">
              <h3>Order Details</h3>
              <div class="detail-row">
                <span class="label">Order Number:</span>
                <span class="value">#{{ order.orderNumber }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Order Date:</span>
                <span class="value">{{ order.createdAt | date: 'medium' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Total Amount:</span>
                <span class="value highlight">₹{{ order.totalAmount | number: '1.2-2' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Status:</span>
                <span class="badge" [ngClass]="'status-' + order.status">
                  {{ order.status | titlecase }}
                </span>
              </div>
            </div>

            <!-- Delivery Address Card -->
            <div class="info-card">
              <h3>Delivery Address</h3>
              <div *ngIf="deliveryAddress" class="address-block">
                <p class="name">{{ deliveryAddress.firstName }} {{ deliveryAddress.lastName }}</p>
                <p>{{ deliveryAddress.street }}</p>
                <p>{{ deliveryAddress.city }}, {{ deliveryAddress.state }} {{ deliveryAddress.zipCode }}</p>
                <p class="phone">📞 {{ deliveryAddress.phoneNumber }}</p>
                <p class="estimate" *ngIf="estimatedDelivery">
                  📅 Estimated Delivery: <strong>{{ estimatedDelivery | date: 'mediumDate' }}</strong>
                </p>
              </div>
            </div>

            <!-- Items Ordered -->
            <div class="info-card">
              <h3>Items Ordered ({{ order.items?.length }})</h3>
              <div class="items-list">
                <div *ngFor="let item of order.items" class="item-row">
                  <img [src]="getImageUrl(item.image)" class="item-image" />
                  <div class="item-info">
                    <p class="item-name">{{ item.productName || item.name }}</p>
                    <p class="item-sku">SKU: {{ item.sku }}</p>
                    <p class="item-qty">Qty: {{ item.quantity }}</p>
                  </div>
                  <div class="item-price">
                    <p class="unit-price">₹{{ item.price | number: '1.2-2' }}</p>
                    <p class="total-price">₹{{ (item.quantity * item.price) | number: '1.2-2' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="right-column">
            <!-- Timeline (Delivery Stages) -->
            <div class="timeline-card">
              <h3>Delivery Timeline</h3>
              <div class="timeline">
                <div class="timeline-item completed">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <p class="timeline-title">Order Confirmed</p>
                    <p class="timeline-time">{{ order.createdAt | date: 'short' }}</p>
                  </div>
                </div>
                <div class="timeline-item" [class.completed]="order.status === 'shipped' || order.status === 'delivered'">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <p class="timeline-title">Processing</p>
                    <p class="timeline-time">1-2 business days</p>
                  </div>
                </div>
                <div class="timeline-item" [class.completed]="order.status === 'shipped' || order.status === 'delivered'">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <p class="timeline-title">In Transit</p>
                    <p class="timeline-time">{{ estimatedDelivery | date: 'mediumDate' }}</p>
                  </div>
                </div>
                <div class="timeline-item" [class.completed]="order.status === 'delivered'">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <p class="timeline-title">Delivered</p>
                    <p class="timeline-time">Track your package</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Price Summary -->
            <div class="price-summary-card">
              <h3>Price Summary</h3>
              <div class="price-row">
                <span>Subtotal</span>
                <span>₹{{ (order.totalAmount - (order.tax || 0) - (order.shipping || 50)) | number: '1.2-2' }}</span>
              </div>
              <div class="price-row" *ngIf="order.discount">
                <span>Discount</span>
                <span class="discount">-₹{{ order.discount | number: '1.2-2' }}</span>
              </div>
              <div class="price-row" *ngIf="order.tax">
                <span>Tax</span>
                <span>₹{{ order.tax | number: '1.2-2' }}</span>
              </div>
              <div class="price-row" *ngIf="order.shipping">
                <span>Shipping</span>
                <span>₹{{ order.shipping | number: '1.2-2' }}</span>
              </div>
              <div class="price-row total">
                <span>Total Amount</span>
                <span>₹{{ order.totalAmount | number: '1.2-2' }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <button class="btn btn-primary" (click)="trackOrder()">
                🚚 Track Order
              </button>
              <button class="btn btn-secondary" (click)="downloadInvoice()">
                📄 Download Invoice
              </button>
              <button class="btn btn-secondary" (click)="continueShoppingShop()">
                🛍️ Continue Shopping
              </button>
            </div>

            <!-- Help Section -->
            <div class="help-section">
              <h4>Need Help?</h4>
              <p>Our customer support team is available 24/7</p>
              <a href="/support" class="help-link">📞 Contact Support</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !isLoading" class="error-state">
        <p class="error-message">{{ error }}</p>
        <button class="btn btn-primary" (click)="retryLoad()">Try Again</button>
      </div>
    </div>
  `,
  styles: [`
    .confirmation-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #ffffff;
    }

    .success-header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 30px;
      border-bottom: 1px solid #eaeaea;
    }

    .success-icon {
      margin-bottom: 20px;
    }

    .success-header h1 {
      font-size: 32px;
      color: #1a1a1a;
      margin-bottom: 10px;
    }

    .subtitle {
      font-size: 16px;
      color: #666666;
    }

    .loading-state {
      text-align: center;
      padding: 60px 20px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #eeeeee;
      border-top: 4px solid #ff6b6b;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .order-summary {
      margin-top: 30px;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 30px;
    }

    @media (max-width: 1024px) {
      .summary-grid {
        grid-template-columns: 1fr;
      }
    }

    .info-card {
      background: #f9f9f9;
      border: 1px solid #eeeeee;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .info-card h3 {
      font-size: 18px;
      margin-bottom: 15px;
      color: #1a1a1a;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 14px;
    }

    .label {
      color: #666666;
      font-weight: 500;
    }

    .value {
      color: #1a1a1a;
      font-weight: 500;
    }

    .value.highlight {
      font-size: 18px;
      color: #10b981;
    }

    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .badge.status-pending {
      background: #fef08a;
      color: #92400e;
    }

    .badge.status-processing {
      background: #dbeafe;
      color: #1e40af;
    }

    .badge.status-shipped {
      background: #c7d2fe;
      color: #3730a3;
    }

    .badge.status-delivered {
      background: #dcfce7;
      color: #166534;
    }

    .address-block {
      line-height: 1.8;
      color: #444;
    }

    .address-block .name {
      font-weight: 600;
      font-size: 15px;
      margin-bottom: 5px;
    }

    .address-block .phone {
      margin-top: 10px;
    }

    .address-block .estimate {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #ddd;
      color: #10b981;
    }

    .items-list {
      border-top: 1px solid #ddd;
    }

    .item-row {
      display: flex;
      gap: 15px;
      padding: 15px 0;
      border-bottom: 1px solid #eeeeee;
    }

    .item-row:last-child {
      border-bottom: none;
    }

    .item-image {
      width: 60px;
      height: 60px;
      border-radius: 4px;
      object-fit: cover;
    }

    .item-info {
      flex: 1;
    }

    .item-name {
      font-weight: 600;
      margin-bottom: 4px;
    }

    .item-sku,
    .item-qty {
      font-size: 12px;
      color: #666;
    }

    .item-price {
      text-align: right;
    }

    .unit-price {
      font-size: 12px;
      color: #999;
    }

    .total-price {
      font-weight: 600;
      font-size: 15px;
    }

    .timeline-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 8px;
      padding: 25px;
      margin-bottom: 20px;
    }

    .timeline-card h3 {
      color: white;
      margin-bottom: 20px;
    }

    .timeline {
      position: relative;
      padding-left: 20px;
    }

    .timeline-item {
      margin-bottom: 25px;
      position: relative;
      opacity: 0.6;
    }

    .timeline-item.completed {
      opacity: 1;
    }

    .timeline-dot {
      width: 12px;
      height: 12px;
      background: white;
      border-radius: 50%;
      position: absolute;
      left: -26px;
      top: 0;
    }

    .timeline-item.completed .timeline-dot {
      background: #10b981;
    }

    .timeline-title {
      font-weight: 600;
      margin-bottom: 4px;
    }

    .timeline-time {
      font-size: 12px;
      opacity: 0.8;
    }

    .price-summary-card {
      background: #f9f9f9;
      border: 1px solid #eeeeee;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .price-summary-card h3 {
      margin-bottom: 15px;
    }

    .price-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 14px;
    }

    .price-row.total {
      border-top: 2px solid #ddd;
      padding-top: 10px;
      margin-top: 10px;
      font-weight: 600;
      font-size: 16px;
      color: #10b981;
    }

    .discount {
      color: #10b981;
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 20px;
    }

    .btn {
      padding: 12px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary {
      background: #10b981;
      color: white;
    }

    .btn-primary:hover {
      background: #059669;
    }

    .btn-secondary {
      background: white;
      color: #10b981;
      border: 2px solid #10b981;
    }

    .btn-secondary:hover {
      background: #f0fdf4;
    }

    .help-section {
      background: #f0fdf4;
      border-left: 4px solid #10b981;
      padding: 15px;
      border-radius: 4px;
    }

    .help-section h4 {
      margin-bottom: 5px;
      color: #166534;
    }

    .help-section p {
      font-size: 13px;
      color: #4b7c59;
      margin-bottom: 10px;
    }

    .help-link {
      color: #047857;
      text-decoration: none;
      font-weight: 600;
      display: inline-block;
    }

    .error-state {
      text-align: center;
      padding: 40px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
    }

    .error-message {
      color: #991b1b;
      margin-bottom: 20px;
    }
  `]
})
export class OrderConfirmationPageComponent implements OnInit, OnDestroy {
  order: any = null;
  deliveryAddress: any = null;
  estimatedDelivery: Date | null = null;
  isLoading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadOrderDetails();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrderDetails() {
    const orderId = this.route.snapshot.paramMap.get('id');
    
    if (!orderId) {
      this.error = 'Order ID not found';
      this.isLoading = false;
      return;
    }

    this.http.get(`${environment.apiUrl}/api/orders/${orderId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.order = response.data;
          this.deliveryAddress = response.data?.shippingAddress;
          
          // Calculate estimated delivery (5-7 business days)
          const delivery = new Date();
          delivery.setDate(delivery.getDate() + 7);
          this.estimatedDelivery = delivery;

          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Failed to load order:', error);
          this.error = 'Failed to load order details. Please try again.';
          this.isLoading = false;
        }
      });
  }

  trackOrder() {
    if (this.order) {
      this.router.navigate(['/orders', this.order._id, 'tracking']);
    }
  }

  downloadInvoice() {
    if (this.order) {
      this.http.get(`${environment.apiUrl}/api/orders/${this.order._id}/invoice`, {
        responseType: 'blob'
      }).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `invoice-${this.order.orderNumber}.pdf`;
          link.click();
        },
        error: (error) => console.error('Failed to download invoice:', error)
      });
    }
  }

  continueShoppingShop() {
    this.router.navigate(['/shop']);
  }

  retryLoad() {
    this.error = null;
    this.isLoading = true;
    this.loadOrderDetails();
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '/assets/placeholder.png';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return environment.apiUrl + imagePath;
    return environment.apiUrl + '/uploads/' + imagePath;
  }
}
