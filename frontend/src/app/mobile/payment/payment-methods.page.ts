/**
 * 💳 Payment Methods Component
 * Manage saved payment methods (cards, wallets, UPI, etc.)
 */

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'wallet' | 'netbanking';
  isDefault: boolean;
  lastUsed?: string;

  // Card fields
  cardNumber?: string;
  cardHolderName?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cvv?: string;
  bankName?: string;

  // UPI fields
  upiId?: string;

  // Wallet fields
  walletProvider?: string;
  walletBalance?: number;

  // NetBanking fields
  bankCode?: string;
}

@Component({
  selector: 'app-payment-methods',
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
        <ion-title>Payment Methods</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="payment-methods-content">
      <!-- Default Payment Method -->
      <div *ngIf="defaultMethod" class="section">
        <h3>Default Payment Method</h3>
        <div class="payment-card default-card">
          <div class="payment-type-icon">
            <ion-icon [name]="getIcon(defaultMethod.type)"></ion-icon>
          </div>

          <div class="payment-info">
            <p class="payment-label">{{ formatType(defaultMethod.type) }}</p>
            <p class="payment-details">{{ getPaymentDetails(defaultMethod) }}</p>
            <p class="last-used" *ngIf="defaultMethod.lastUsed">
              Last used: {{ formatDate(defaultMethod.lastUsed) }}
            </p>
          </div>

          <div class="actions">
            <ion-button fill="clear" size="small" (click)="editMethod(defaultMethod)">
              <ion-icon name="create" slot="icon-only"></ion-icon>
            </ion-button>
            <ion-button fill="clear" size="small" color="danger" (click)="deleteMethod(defaultMethod)">
              <ion-icon name="trash" slot="icon-only"></ion-icon>
            </ion-button>
          </div>
        </div>
      </div>

      <!-- Other Payment Methods -->
      <div *ngIf="otherMethods.length > 0" class="section">
        <h3>Other Payment Methods</h3>
        <div
          *ngFor="let method of otherMethods"
          class="payment-card"
        >
          <div class="payment-type-icon">
            <ion-icon [name]="getIcon(method.type)"></ion-icon>
          </div>

          <div class="payment-info">
            <p class="payment-label">{{ formatType(method.type) }}</p>
            <p class="payment-details">{{ getPaymentDetails(method) }}</p>
          </div>

          <div class="actions">
            <ion-button
              fill="clear"
              size="small"
              (click)="setDefault(method)"
            >
              <ion-icon name="checkmark-circle-outline" slot="icon-only"></ion-icon>
            </ion-button>
            <ion-button fill="clear" size="small" (click)="editMethod(method)">
              <ion-icon name="create" slot="icon-only"></ion-icon>
            </ion-button>
            <ion-button fill="clear" size="small" color="danger" (click)="deleteMethod(method)">
              <ion-icon name="trash" slot="icon-only"></ion-icon>
            </ion-button>
          </div>
        </div>
      </div>

      <!-- Add New Payment Method -->
      <div class="section add-payment-section">
        <h3>Add Payment Method</h3>

        <ion-list>
          <ion-item button (click)="addPaymentMethod('card')">
            <ion-icon name="card" slot="start"></ion-icon>
            <ion-label>
              <h3>Credit / Debit Card</h3>
              <p>Visa, Mastercard, Rupay</p>
            </ion-label>
            <ion-icon name="chevron-forward" slot="end"></ion-icon>
          </ion-item>

          <ion-item button (click)="addPaymentMethod('upi')">
            <ion-icon name="phone-portrait" slot="start"></ion-icon>
            <ion-label>
              <h3>UPI</h3>
              <p>Google Pay, PhonePe, PayTM</p>
            </ion-label>
            <ion-icon name="chevron-forward" slot="end"></ion-icon>
          </ion-item>

          <ion-item button (click)="addPaymentMethod('wallet')">
            <ion-icon name="wallet" slot="start"></ion-icon>
            <ion-label>
              <h3>Digital Wallet</h3>
              <p>PayTM, Amazon Pay</p>
            </ion-label>
            <ion-icon name="chevron-forward" slot="end"></ion-icon>
          </ion-item>

          <ion-item button (click)="addPaymentMethod('netbanking')">
            <ion-icon name="home" slot="start"></ion-icon>
            <ion-label>
              <h3>Net Banking</h3>
              <p>Bank transfer</p>
            </ion-label>
            <ion-icon name="chevron-forward" slot="end"></ion-icon>
          </ion-item>
        </ion-list>
      </div>

      <!-- Empty State -->
      <div *ngIf="paymentMethods.length === 0" class="empty-state">
        <ion-icon name="card-outline"></ion-icon>
        <h2>No Payment Methods</h2>
        <p>Add a payment method to proceed with checkout</p>
      </div>
    </ion-content>
  `,
  styles: [`
    .payment-methods-content {
      --background: #f9f9f9;
      padding: 12px;
    }

    .section {
      margin-bottom: 20px;
    }

    .section h3 {
      font-size: 14px;
      font-weight: bold;
      margin: 0 0 12px 0;
      color: #333;
    }

    .payment-card {
      display: flex;
      align-items: center;
      gap: 12px;
      background: white;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 8px;
      border: 1px solid #eee;
    }

    .payment-card.default-card {
      border: 2px solid var(--ion-color-primary);
      background: rgba(var(--ion-color-primary-rgb), 0.02);
    }

    .payment-type-icon {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      flex-shrink: 0;
    }

    .payment-info {
      flex: 1;
    }

    .payment-label {
      font-size: 13px;
      font-weight: bold;
      margin: 0 0 4px 0;
      color: #333;
    }

    .payment-details {
      font-size: 12px;
      color: #666;
      margin: 0 0 4px 0;
    }

    .last-used {
      font-size: 11px;
      color: #999;
      margin: 0;
    }

    .actions {
      display: flex;
      gap: 4px;
    }

    .actions ion-button {
      margin: 0;
    }

    .add-payment-section ion-list {
      background: white;
      border-radius: 8px;
      overflow: hidden;
    }

    ion-item {
      --padding-start: 12px;
      --padding-end: 12px;
      --min-height: 56px;
    }

    ion-item ion-icon[slot="start"] {
      margin-right: 12px;
      font-size: 24px;
    }

    ion-item h3 {
      font-size: 13px;
      font-weight: bold;
      margin: 0;
    }

    ion-item p {
      font-size: 12px;
      color: #999;
      margin: 2px 0 0 0;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 50vh;
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
      font-size: 14px;
      margin: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentMethodsPageComponent implements OnInit, OnDestroy {
  paymentMethods: PaymentMethod[] = [];
  isLoading: boolean = true;

  get defaultMethod(): PaymentMethod | undefined {
    return this.paymentMethods.find(m => m.isDefault);
  }

  get otherMethods(): PaymentMethod[] {
    return this.paymentMethods.filter(m => !m.isDefault);
  }

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastController: ToastController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.loadPaymentMethods();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPaymentMethods() {
    this.http.get('/api/payment-methods')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.paymentMethods = response.data || [];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load payment methods:', error);
          this.isLoading = false;
        }
      });
  }

  async addPaymentMethod(type: string) {
    console.log('💳 Add payment method:', type);
    // Open modal to add payment method
  }

  async editMethod(method: PaymentMethod) {
    console.log('✏️ Edit payment method:', method.id);
    // Open modal to edit payment method
  }

  setDefault(method: PaymentMethod) {
    this.http.patch(`/api/payment-methods/${method.id}/set-default`, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Update UI
          this.paymentMethods.forEach(m => m.isDefault = false);
          method.isDefault = true;
          this.showToast('Default payment method updated', 'success');
        },
        error: (error) => {
          console.error('Failed to set default:', error);
          this.showToast('Failed to update', 'danger');
        }
      });
  }

  deleteMethod(method: PaymentMethod) {
    const confirm = window.confirm('Are you sure you want to delete this payment method?');
    if (!confirm) return;

    this.http.delete(`/api/payment-methods/${method.id}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.paymentMethods = this.paymentMethods.filter(m => m.id !== method.id);
          this.showToast('Payment method deleted', 'success');
        },
        error: (error) => {
          console.error('Failed to delete:', error);
          this.showToast('Failed to delete', 'danger');
        }
      });
  }

  goBack() {
    this.router.navigate(['/tabs/profile']);
  }

  getIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'card': 'card',
      'upi': 'phone-portrait',
      'wallet': 'wallet',
      'netbanking': 'home'
    };
    return icons[type] || 'card';
  }

  formatType(type: string): string {
    const types: { [key: string]: string } = {
      'card': 'Card',
      'upi': 'UPI',
      'wallet': 'Wallet',
      'netbanking': 'Net Banking'
    };
    return types[type] || type;
  }

  getPaymentDetails(method: PaymentMethod): string {
    if (method.type === 'card' && method.cardNumber) {
      return `${method.bankName || 'Card'} •••• ${method.cardNumber.slice(-4)}`;
    }
    if (method.type === 'upi' && method.upiId) {
      return method.upiId;
    }
    if (method.type === 'wallet' && method.walletProvider) {
      return `${method.walletProvider} (₹${method.walletBalance || 0})`;
    }
    if (method.type === 'netbanking' && method.bankName) {
      return method.bankName;
    }
    return 'Payment Method';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
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
