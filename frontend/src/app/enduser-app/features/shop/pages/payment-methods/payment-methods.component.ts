/**
 * 💳 Payment Methods Page (Web)
 * Manage saved payment methods - cards, UPI, wallets, net banking
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-payment-methods-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="payment-methods-container">
      <div class="page-header">
        <h1>Payment Methods</h1>
        <p>Manage your payment options for faster checkout</p>
      </div>

      <div class="content-wrapper">
        <!-- Left: Payment Methods List -->
        <div class="methods-list">
          <div class="list-header">
            <h2>Saved Payment Methods ({{ paymentMethods.length }})</h2>
            <button class="btn btn-add" (click)="toggleAddNewForm()">
              + Add New Payment Method
            </button>
          </div>

          <!-- Add New Form -->
          <div *ngIf="showAddForm" class="add-method-form">
            <h3>Add New Payment Method</h3>
            <form [formGroup]="addPaymentForm" (ngSubmit)="submitAddPayment()">
              <div class="form-group">
                <label>Payment Type</label>
                <select formControlName="type" (change)="onTypeChange()">
                  <option value="">Select payment type</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="upi">UPI</option>
                  <option value="wallet">Wallet</option>
                  <option value="net_banking">Net Banking</option>
                </select>
              </div>

              <!-- Card Fields -->
              <div *ngIf="addPaymentForm.get('type')?.value?.includes('card')" class="card-fields">
                <div class="form-group">
                  <label>Card Number</label>
                  <input type="text" formControlName="cardNumber" placeholder="1234 5678 9012 3456" />
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Card Holder Name</label>
                    <input type="text" formControlName="cardHolderName" placeholder="Name on card" />
                  </div>
                  <div class="form-group">
                    <label>Email</label>
                    <input type="email" formControlName="email" />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Expiry (MM/YY)</label>
                    <input type="text" formControlName="expiry" placeholder="MM/YY" />
                  </div>
                  <div class="form-group">
                    <label>CVV</label>
                    <input type="text" formControlName="cvv" placeholder="CVV" />
                  </div>
                </div>
              </div>

              <!-- UPI Fields -->
              <div *ngIf="addPaymentForm.get('type')?.value === 'upi'" class="upi-fields">
                <div class="form-group">
                  <label>UPI ID</label>
                  <input type="text" formControlName="upiId" placeholder="yourname@bankname" />
                </div>
              </div>

              <!-- Wallet Fields -->
              <div *ngIf="addPaymentForm.get('type')?.value === 'wallet'" class="wallet-fields">
                <div class="form-group">
                  <label>Wallet Provider</label>
                  <select formControlName="walletProvider">
                    <option value="">Select wallet</option>
                    <option value="paytm">Paytm</option>
                    <option value="phonepe">PhonePe</option>
                    <option value="googlepay">Google Pay</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Phone Number</label>
                  <input type="tel" formControlName="phoneNumber" />
                </div>
              </div>

              <!-- Net Banking Fields -->
              <div *ngIf="addPaymentForm.get('type')?.value === 'net_banking'" class="netbanking-fields">
                <div class="form-group">
                  <label>Bank Name</label>
                  <select formControlName="bankName">
                    <option value="">Select bank</option>
                    <option value="sbi">State Bank of India (SBI)</option>
                    <option value="hdfc">HDFC Bank</option>
                    <option value="icici">ICICI Bank</option>
                    <option value="axis">Axis Bank</option>
                  </select>
                </div>
              </div>

              <div class="form-group checkbox">
                <input type="checkbox" formControlName="setAsDefault" id="default-payment" />
                <label for="default-payment">Set as default payment method</label>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn btn-primary" [disabled]="!addPaymentForm.valid || isSubmitting">
                  {{ isSubmitting ? 'Adding...' : 'Add Payment Method' }}
                </button>
                <button type="button" class="btn btn-secondary" (click)="toggleAddNewForm()">
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <!-- Payment Methods Cards -->
          <div class="methods-grid" *ngIf="paymentMethods.length > 0">
            <div *ngFor="let method of paymentMethods" class="method-card" [class.default]="method.isDefault">
              <div class="card-header">
                <div class="card-type-badge">
                  <span class="badge" [ngClass]="'badge-' + method.type">
                    {{ getPaymentTypeLabel(method.type) }}
                  </span>
                </div>
                <div class="card-actions">
                  <button class="btn-icon" (click)="editMethod(method)" title="Edit">✏️</button>
                  <button class="btn-icon" (click)="deleteMethod(method._id)" title="Delete">🗑️</button>
                </div>
              </div>

              <div class="card-content">
                <!-- Card Display -->
                <div *ngIf="method.type.includes('card')" class="card-display">
                  <p class="card-number">•••• •••• •••• {{ method.cardNumber?.slice(-4) }}</p>
                  <p class="card-holder">{{ method.cardHolderName }}</p>
                  <p class="card-expiry">Expires: {{ method.expiry }}</p>
                </div>

                <!-- UPI Display -->
                <div *ngIf="method.type === 'upi'" class="upi-display">
                  <p class="upi-id">{{ method.upiId }}</p>
                </div>

                <!-- Wallet Display -->
                <div *ngIf="method.type === 'wallet'" class="wallet-display">
                  <p class="wallet-provider">{{ method.walletProvider | titlecase }}</p>
                  <p class="phone-number">{{ method.phoneNumber }}</p>
                </div>

                <!-- Net Banking Display -->
                <div *ngIf="method.type === 'net_banking'" class="netbanking-display">
                  <p class="bank-name">{{ method.bankName | titlecase }}</p>
                </div>
              </div>

              <div class="card-footer">
                <span *ngIf="method.isDefault" class="default-badge">✓ Default Payment Method</span>
                <button *ngIf="!method.isDefault" class="btn-small" (click)="setAsDefault(method._id)">
                  Set as Default
                </button>
                <span class="last-used">Last used: {{ method.lastUsed | date: 'short' }}</span>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="paymentMethods.length === 0 && !showAddForm" class="empty-state">
            <p>No payment methods saved yet</p>
            <button class="btn btn-primary" (click)="toggleAddNewForm()">Add Payment Method</button>
          </div>
        </div>

        <!-- Right: Recommended Methods & Info -->
        <div class="sidebar">
          <!-- Security Info -->
          <div class="info-box">
            <h3>🔒 Security</h3>
            <ul>
              <li>All payment data is encrypted</li>
              <li>We never store your full card details</li>
              <li>Secure PCI-DSS compliant system</li>
              <li>2-factor authentication available</li>
            </ul>
          </div>

          <!-- Tips -->
          <div class="info-box">
            <h3>💡 Tips</h3>
            <ul>
              <li>Save multiple payment methods for convenience</li>
              <li>Set a default for faster checkout</li>
              <li>Remove old or unused methods</li>
              <li>Update expiry dates before they expire</li>
            </ul>
          </div>

          <!-- Help -->
          <div class="help-box">
            <h3>Need Help?</h3>
            <p>Having issues with your payment method?</p>
            <a href="/support" class="help-link">Contact Support</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-methods-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .page-header {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eaeaea;
    }

    .page-header h1 {
      font-size: 28px;
      margin-bottom: 8px;
    }

    .page-header p {
      color: #666;
    }

    .content-wrapper {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 30px;
    }

    @media (max-width: 1024px) {
      .content-wrapper {
        grid-template-columns: 1fr;
      }
      
      .sidebar {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
      }
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
    }

    .list-header h2 {
      font-size: 18px;
      margin: 0;
    }

    .btn {
      padding: 10px 20px;
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

    .btn-add {
      background: #10b981;
      color: white;
    }

    .add-method-form {
      background: #f9f9f9;
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 25px;
      margin-bottom: 30px;
    }

    .add-method-form h3 {
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-group label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: #333;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    .checkbox {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .checkbox input {
      width: auto;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }

    .form-actions button {
      flex: 1;
    }

    .methods-grid {
      display: grid;
      gap: 15px;
    }

    .method-card {
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      transition: all 0.3s;
    }

    .method-card:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .method-card.default {
      border-color: #10b981;
      background: #f0fdf4;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 15px;
    }

    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }

    .badge-credit_card,
    .badge-debit_card {
      background: #1e40af;
      color: white;
    }

    .badge-upi {
      background: #7c3aed;
      color: white;
    }

    .badge-wallet {
      background: #d97706;
      color: white;
    }

    .badge-net_banking {
      background: #059669;
      color: white;
    }

    .card-actions {
      display: flex;
      gap: 8px;
    }

    .btn-icon {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.3s;
    }

    .btn-icon:hover {
      opacity: 1;
    }

    .card-content {
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
    }

    .card-display,
    .upi-display,
    .wallet-display,
    .netbanking-display {
      line-height: 1.6;
    }

    .card-number {
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 2px;
      margin-bottom: 8px;
    }

    .card-holder,
    .upi-id,
    .wallet-provider,
    .phone-number,
    .bank-name {
      color: #333;
    }

    .card-expiry {
      font-size: 12px;
      color: #999;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #666;
    }

    .default-badge {
      background: #10b981;
      color: white;
      padding: 4px 10px;
      border-radius: 4px;
    }

    .btn-small {
      background: #10b981;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
    }

    .btn-small:hover {
      background: #059669;
    }

    .last-used {
      text-align: right;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: #f9f9f9;
      border-radius: 8px;
      border: 2px dashed #ddd;
    }

    .sidebar {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .info-box,
    .help-box {
      background: #f9f9f9;
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 20px;
    }

    .info-box h3,
    .help-box h3 {
      margin-bottom: 12px;
      font-size: 16px;
    }

    .info-box ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .info-box li {
      padding: 6px 0;
      font-size: 13px;
      color: #666;
    }

    .info-box li:before {
      content: "✓ ";
      color: #10b981;
      font-weight: bold;
      margin-right: 6px;
    }

    .help-box {
      background: #f0fdf4;
      border-left: 4px solid #10b981;
    }

    .help-box p {
      margin-bottom: 12px;
      font-size: 13px;
    }

    .help-link {
      color: #10b981;
      text-decoration: none;
      font-weight: 600;
    }

    .help-link:hover {
      text-decoration: underline;
    }
  `]
})
export class PaymentMethodsPageComponent implements OnInit, OnDestroy {
  paymentMethods: any[] = [];
  showAddForm = false;
  isSubmitting = false;
  addPaymentForm: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.addPaymentForm = this.fb.group({
      type: ['', Validators.required],
      cardNumber: [''],
      cardHolderName: [''],
      email: [''],
      expiry: [''],
      cvv: [''],
      upiId: [''],
      walletProvider: [''],
      phoneNumber: [''],
      bankName: [''],
      setAsDefault: [false]
    });
  }

  ngOnInit() {
    this.loadPaymentMethods();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPaymentMethods() {
    this.http.get(`${environment.apiUrl}/api/payment-methods`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.paymentMethods = response.data || [];
        },
        error: (error) => console.error('Failed to load payment methods:', error)
      });
  }

  toggleAddNewForm() {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.addPaymentForm.reset();
    }
  }

  onTypeChange() {
    // Clear form based on selected type
    const type = this.addPaymentForm.get('type')?.value;
    if (!type?.includes('card')) {
      this.addPaymentForm.controls['cardNumber'].reset();
      this.addPaymentForm.controls['cardHolderName'].reset();
      this.addPaymentForm.controls['expiry'].reset();
      this.addPaymentForm.controls['cvv'].reset();
    }
    if (type !== 'upi') {
      this.addPaymentForm.controls['upiId'].reset();
    }
  }

  submitAddPayment() {
    if (!this.addPaymentForm.valid) return;

    this.isSubmitting = true;
    const payload = this.addPaymentForm.value;

    this.http.post(`${environment.apiUrl}/api/payment-methods`, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.showAddForm = false;
          this.addPaymentForm.reset();
          this.loadPaymentMethods();
        },
        error: () => {
          this.isSubmitting = false;
        }
      });
  }

  editMethod(method: any) {
    console.log('Edit method:', method);
    // TODO: Implement edit functionality
  }

  deleteMethod(methodId: string) {
    if (!confirm('Are you sure you want to delete this payment method?')) return;

    this.http.delete(`${environment.apiUrl}/api/payment-methods/${methodId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadPaymentMethods();
        },
        error: (error) => console.error('Failed to delete payment method:', error)
      });
  }

  setAsDefault(methodId: string) {
    this.http.patch(`${environment.apiUrl}/api/payment-methods/${methodId}/default`, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadPaymentMethods();
        },
        error: (error) => console.error('Failed to set default:', error)
      });
  }

  getPaymentTypeLabel(type: string): string {
    const labels: {[key: string]: string} = {
      'credit_card': 'Credit Card',
      'debit_card': 'Debit Card',
      'upi': 'UPI',
      'wallet': 'Wallet',
      'net_banking': 'Net Banking'
    };
    return labels[type] || type;
  }
}
