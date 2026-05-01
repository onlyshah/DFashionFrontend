/**
 * 📋 Order Confirmation Component
 * Displays successful order details after checkout
 */

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdersApi } from 'src/app/core/api/orders.api';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, IonicModule, DatePipe, DecimalPipe, UpperCasePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Order Confirmation</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Success Check -->
      <div class="success-container" *ngIf="!isLoading">
        <div class="check-icon">
          <ion-icon name="checkmark-circle" color="success"></ion-icon>
        </div>
        <h1>Order Confirmed!</h1>
        <p class="subtitle">Thank you for your purchase</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="ion-text-center ion-padding">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Loading order details...</p>
      </div>

      <!-- Order Details -->
      <div *ngIf="order && !isLoading">
        <!-- Order Number & Date -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Order Details</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="detail-row">
              <span class="label">Order Number</span>
              <span class="value">{{ order.orderNumber }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Order Date</span>
              <span class="value">{{ order.createdAt | date: 'medium' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Status</span>
              <ion-badge [color]="getStatusColor(order.status)">
                {{ order.status | uppercase }}
              </ion-badge>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Delivery Address -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Delivery Address</ion-card-title>
          </ion-card-header>
          <ion-card-content *ngIf="deliveryAddress">
            <p class="address-name">{{ deliveryAddress.firstName }} {{ deliveryAddress.lastName }}</p>
            <p>{{ deliveryAddress.street }}</p>
            <p>{{ deliveryAddress.city }}, {{ deliveryAddress.state }} {{ deliveryAddress.zipCode }}</p>
            <p>📞 {{ deliveryAddress.phoneNumber }}</p>
            <p class="estimate" *ngIf="estimatedDelivery">
              ⏱️ Estimated Delivery: {{ estimatedDelivery | date: 'mediumDate' }}
            </p>
          </ion-card-content>
        </ion-card>

        <!-- Items Ordered -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Items Ordered ({{ order.items?.length }})</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item *ngFor="let item of order.items">
                <ion-avatar slot="start">
                  <img [src]="item.image" onerror="this.src='/assets/placeholder.png'" />
                </ion-avatar>
                <ion-label>
                  <h3>{{ item.productName || item.name }}</h3>
                  <p>Qty: {{ item.quantity }} × ₹{{ item.price }}</p>
                </ion-label>
                <div slot="end" class="price">
                  ₹{{ item.quantity * item.price | number: '1.2-2' }}
                </div>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Price Breakdown -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Price Summary</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="summary-row">
              <span>Subtotal</span>
              <span>₹{{ order.subtotal | number: '1.2-2' }}</span>
            </div>
            <div class="summary-row" *ngIf="order.discount > 0">
              <span>Discount</span>
              <span class="discount">-₹{{ order.discount | number: '1.2-2' }}</span>
            </div>
            <div class="summary-row" *ngIf="order.tax > 0">
              <span>Tax (18%)</span>
              <span>₹{{ order.tax | number: '1.2-2' }}</span>
            </div>
            <div class="summary-row" *ngIf="order.shippingCost > 0">
              <span>Shipping</span>
              <span>₹{{ order.shippingCost | number: '1.2-2' }}</span>
            </div>
            <ion-divider></ion-divider>
            <div class="summary-row total">
              <span>Total Amount</span>
              <span>₹{{ order.totalAmount | number: '1.2-2' }}</span>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Payment Info -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Payment Information</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="detail-row">
              <span class="label">Payment Method</span>
              <span class="value">{{ getPaymentMethodLabel(order.paymentMethod) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Payment Status</span>
              <ion-badge [color]="order.paymentStatus === 'completed' ? 'success' : 'warning'">
                {{ order.paymentStatus | uppercase }}
              </ion-badge>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Tracking Link -->
        <ion-card *ngIf="order.trackingId">
          <ion-card-header>
            <ion-card-title>Track Your Order</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p>Tracking ID: <strong>{{ order.trackingId }}</strong></p>
            <ion-button expand="block" fill="outline" (click)="openTracking()">
              <ion-icon name="open-outline" slot="start"></ion-icon>
              Track on Courier Website
            </ion-button>
          </ion-card-content>
        </ion-card>

        <!-- Actions -->
        <div class="action-buttons">
          <ion-button expand="block" color="primary" (click)="continueShoping()">
            <ion-icon name="cart" slot="start"></ion-icon>
            Continue Shopping
          </ion-button>
          <ion-button expand="block" fill="outline" (click)="downloadInvoice()">
            <ion-icon name="document-text" slot="start"></ion-icon>
            Download Invoice
          </ion-button>
        </div>
      </div>

      <!-- Error State -->
      <ion-card *ngIf="error && !isLoading" color="danger">
        <ion-card-content>
          <p>{{ error }}</p>
          <ion-button expand="block" (click)="goBack()">Go Back</ion-button>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  styles: [`
    .success-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
    }

    .check-icon {
      font-size: 80px;
      margin-bottom: 20px;
    }

    h1 {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .subtitle {
      color: #999;
      font-size: 14px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .label {
      font-weight: 500;
      color: #666;
    }

    .value {
      color: #333;
    }

    .address-name {
      font-weight: bold;
      margin-bottom: 5px;
    }

    .estimate {
      margin-top: 10px;
      padding: 10px;
      background: #f0f8ff;
      border-radius: 4px;
      font-size: 13px;
    }

    .price {
      font-weight: bold;
      color: var(--ion-color-primary);
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
    }

    .summary-row.total {
      font-weight: bold;
      font-size: 16px;
      margin-top: 10px;
      color: var(--ion-color-primary);
    }

    .discount {
      color: var(--ion-color-success);
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin: 20px 0;
      padding: 0 16px;
    }

    ion-card {
      margin-bottom: 15px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderConfirmationComponent implements OnInit, OnDestroy {
  order: any = null;
  deliveryAddress: any = null;
  estimatedDelivery: Date | null = null;
  isLoading = true;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ordersApi: OrdersApi
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

    this.ordersApi.getOrder(orderId)
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
        error: (error) => {
          console.error('❌ Failed to load order:', error);
          this.error = 'Failed to load order details. Please try again.';
          this.isLoading = false;
        }
      });
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'warning',
      'confirmed': 'primary',
      'processing': 'info',
      'shipped': 'secondary',
      'delivered': 'success',
      'cancelled': 'danger'
    };
    return colors[status] || 'medium';
  }

  getPaymentMethodLabel(method: string): string {
    const labels: { [key: string]: string } = {
      'upi': '💳 UPI Payment',
      'card': '💳 Credit/Debit Card',
      'netbanking': '🏦 Net Banking',
      'wallet': '👝 Wallet',
      'cod': '💵 Cash on Delivery'
    };
    return labels[method] || method;
  }

  continueShoping() {
    this.router.navigate(['/mobile/home']);
  }

  downloadInvoice() {
    // TODO: Generate and download invoice PDF
    console.log('📄 Downloading invoice for order:', this.order.id);
  }

  openTracking() {
    if (this.order.trackingId) {
      window.open(`https://www.gsttrack.com/tracking/${this.order.trackingId}`, '_blank');
    }
  }

  goBack() {
    this.router.navigate(['/mobile/home']);
  }
}
