import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { CartService } from 'src/app/core/services/cart.service';
import { HttpClient } from '@angular/common/http';

/**
 * Mobile Checkout Component
 * Handles the complete checkout flow on mobile:
 * 1. Cart Review
 * 2. Address Selection/Addition
 * 3. Shipping Method
 * 4. Payment Method Selection
 * 5. Order Summary & Confirmation
 */

@Component({
  selector: 'app-mobile-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/mobile/cart"></ion-back-button>
        </ion-buttons>
        <ion-title>Checkout</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Step Indicator -->
      <ion-segment class="checkout-progress" [value]="currentStep" (ionChange)="changeStep($event)">
        <ion-segment-button value="1">
          <ion-label>
            <ion-icon name="checkmark" *ngIf="currentStep > 1"></ion-icon>
            <span *ngIf="currentStep <= 1">1</span>
          </ion-label>
          <ion-label class="step-label">Cart</ion-label>
        </ion-segment-button>
        <ion-segment-button value="2">
          <ion-label>
            <ion-icon name="checkmark" *ngIf="currentStep > 2"></ion-icon>
            <span *ngIf="currentStep <= 2">2</span>
          </ion-label>
          <ion-label class="step-label">Address</ion-label>
        </ion-segment-button>
        <ion-segment-button value="3">
          <ion-label>
            <ion-icon name="checkmark" *ngIf="currentStep > 3"></ion-icon>
            <span *ngIf="currentStep <= 3">3</span>
          </ion-label>
          <ion-label class="step-label">Payment</ion-label>
        </ion-segment-button>
        <ion-segment-button value="4">
          <ion-label>4</ion-label>
          <ion-label class="step-label">Summary</ion-label>
        </ion-segment-button>
      </ion-segment>

      <!-- Step 1: Cart Review -->
      <div *ngIf="currentStep === 1" class="step-content">
        <h2>Order Review</h2>
        <ion-list>
          <ion-item *ngFor="let item of cartItems">
            <ion-avatar slot="start">
              <img [src]="item.product?.images?.[0]?.url" />
            </ion-avatar>
            <ion-label>
              <h3>{{ item.product?.name }}</h3>
              <p>Qty: {{ item.quantity }}</p>
              <p class="price">₹{{ item.product?.price * item.quantity }}</p>
            </ion-label>
          </ion-item>
        </ion-list>

        <ion-card class="order-summary">
          <ion-card-content>
            <div class="summary-row">
              <span>Subtotal</span>
              <span>₹{{ orderSummary.subtotal }}</span>
            </div>
            <div class="summary-row">
              <span>Discount</span>
              <span class="discount">-₹{{ orderSummary.discount }}</span>
            </div>
            <div class="summary-row">
              <span>Shipping</span>
              <span>₹{{ orderSummary.shipping }}</span>
            </div>
            <ion-divider></ion-divider>
            <div class="summary-row total">
              <span>Total</span>
              <span>₹{{ orderSummary.total }}</span>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-button expand="block" color="primary" (click)="nextStep()"
          >Continue to Address</ion-button
        >
      </div>

      <!-- Step 2: Address Selection -->
      <div *ngIf="currentStep === 2" class="step-content">
        <h2>Shipping Address</h2>

        <!-- Saved Addresses -->
        <ion-list *ngIf="savedAddresses.length > 0">
          <ion-radio-group
            [(ngModel)]="selectedAddressId"
            [formControlName]="'selectedAddress'"
          >
            <ion-item *ngFor="let address of savedAddresses">
              <ion-label>
                <p class="address-name">{{ address.firstName }} {{ address.lastName }}</p>
                <p>{{ address.street }}, {{ address.city }} {{ address.zipCode }}</p>
                <p class="phone">{{ address.phoneNumber }}</p>
              </ion-label>
              <ion-radio slot="start" [value]="address.id"></ion-radio>
            </ion-item>
          </ion-radio-group>
        </ion-list>

        <!-- Add New Address Form -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              {{ showAddressForm ? 'Add New Address' : 'Add an Address' }}
            </ion-card-title>
          </ion-card-header>
          <ion-card-content *ngIf="showAddressForm">
            <form [formGroup]="addressForm">
              <ion-item>
                <ion-label position="stacked">First Name</ion-label>
                <ion-input
                  formControlName="firstName"
                  placeholder="First name"
                ></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Last Name</ion-label>
                <ion-input formControlName="lastName" placeholder="Last name"></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Phone</ion-label>
                <ion-input formControlName="phoneNumber" placeholder="Phone number"></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Address</ion-label>
                <ion-input formControlName="street" placeholder="Street address"></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">City</ion-label>
                <ion-input formControlName="city" placeholder="City"></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">State</ion-label>
                <ion-input formControlName="state" placeholder="State"></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">ZIP Code</ion-label>
                <ion-input formControlName="zipCode" placeholder="ZIP code"></ion-input>
              </ion-item>

              <ion-button
                expand="block"
                color="success"
                (click)="saveAddress()"
                [disabled]="!addressForm.valid"
              >
                Save Address
              </ion-button>
            </form>
          </ion-card-content>
          <ion-card-content *ngIf="!showAddressForm">
            <ion-button expand="block" fill="outline" (click)="toggleAddressForm()">
              <ion-icon name="add"></ion-icon>
              Add New Address
            </ion-button>
          </ion-card-content>
        </ion-card>

        <ion-button
          expand="block"
          color="primary"
          (click)="nextStep()"
          [disabled]="!selectedAddressId"
        >
          Continue to Payment
        </ion-button>
      </div>

      <!-- Step 3: Payment Method -->
      <div *ngIf="currentStep === 3" class="step-content">
        <h2>Payment Method</h2>

        <ion-radio-group [(ngModel)]="selectedPaymentMethod">
          <ion-item>
            <ion-label>
              <h3>UPI (Recommended)</h3>
              <p>PayTM, Google Pay, PhonePe, BHIM</p>
            </ion-label>
            <ion-radio slot="start" value="upi"></ion-radio>
          </ion-item>

          <ion-item>
            <ion-label>
              <h3>Credit/Debit Card</h3>
              <p>Visa, Mastercard, American Express</p>
            </ion-label>
            <ion-radio slot="start" value="card"></ion-radio>
          </ion-item>

          <ion-item>
            <ion-label>
              <h3>Net Banking</h3>
              <p>All major Indian banks</p>
            </ion-label>
            <ion-radio slot="start" value="netbanking"></ion-radio>
          </ion-item>

          <ion-item>
            <ion-label>
              <h3>Wallet</h3>
              <p>Amazon Pay, Paytm Wallet</p>
            </ion-label>
            <ion-radio slot="start" value="wallet"></ion-radio>
          </ion-item>
        </ion-radio-group>

        <ion-button expand="block" color="primary" (click)="nextStep()">
          Review Order
        </ion-button>
      </div>

      <!-- Step 4: Order Summary & Confirmation -->
      <div *ngIf="currentStep === 4" class="step-content">
        <h2>Order Summary</h2>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Delivery Address</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p *ngIf="selectedAddress">
              {{ selectedAddress.firstName }} {{ selectedAddress.lastName }}<br />
              {{ selectedAddress.street }}<br />
              {{ selectedAddress.city }}, {{ selectedAddress.state }}
              {{ selectedAddress.zipCode }}<br />
              📞 {{ selectedAddress.phoneNumber }}
            </p>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Payment Method</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p>{{ getPaymentMethodLabel(selectedPaymentMethod) }}</p>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Price Breakdown</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="summary-row">
              <span>Subtotal ({{ cartItems.length }} items)</span>
              <span>₹{{ orderSummary.subtotal }}</span>
            </div>
            <div class="summary-row" *ngIf="orderSummary.discount > 0">
              <span>Discount</span>
              <span class="discount">-₹{{ orderSummary.discount }}</span>
            </div>
            <div class="summary-row">
              <span>Shipping</span>
              <span>₹{{ orderSummary.shipping }}</span>
            </div>
            <ion-divider></ion-divider>
            <div class="summary-row total" style="font-size: 18px; font-weight: bold">
              <span>Total Amount</span>
              <span>₹{{ orderSummary.total }}</span>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-button
          expand="block"
          color="success"
          size="large"
          (click)="placeOrder()"
          [disabled]="isProcessing"
        >
          <ion-spinner name="crescent" *ngIf="isProcessing"></ion-spinner>
          {{ isProcessing ? 'Processing...' : 'Place Order' }}
        </ion-button>

        <ion-button expand="block" fill="outline" (click)="previousStep()">
          Back
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .checkout-progress {
        margin-bottom: 20px;
      }

      .step-label {
        font-size: 10px !important;
      }

      .step-content {
        animation: slideIn 0.3s ease-in-out;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .order-summary {
        margin: 20px 0;
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

      .price {
        font-weight: bold;
        color: var(--ion-color-primary);
      }

      .address-name {
        font-weight: bold;
        margin-bottom: 5px;
      }

      .phone {
        font-size: 12px;
        color: #999;
      }

      ion-button[disabled] {
        --opacity: 0.5;
      }
    `,
  ],
})
export class MobileCheckoutComponent implements OnInit, OnDestroy {
  currentStep: number = 1;
  cartItems: any[] = [];
  savedAddresses: any[] = [];
  selectedAddressId: string = '';
  selectedAddress: any = null;
  selectedPaymentMethod: string = 'upi';
  showAddressForm: boolean = false;
  isProcessing: boolean = false;

  addressForm: FormGroup;

  orderSummary = {
    subtotal: 0,
    discount: 0,
    shipping: 50, // Fixed shipping for now
    total: 0,
  };

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private cartService: CartService,
    private http: HttpClient,
    private toastController: ToastController
  ) {
    this.addressForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
    });
  }

  ngOnInit() {
    this.initializeCheckout();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeCheckout() {
    // Load cart items
    this.cartService.getCart()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.cartItems = response.data?.items || response?.items || [];
          this.calculateOrderSummary();
        },
        error: (error) => {
          console.error('❌ Failed to load cart:', error);
          this.showToast('Failed to load cart items', 'danger');
        }
      });

    // Load user's saved addresses
    this.loadAddresses();
  }

  loadAddresses() {
    this.http.get('/api/addresses')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.savedAddresses = response.data || [];
          if (this.savedAddresses.length > 0) {
            this.selectedAddressId = this.savedAddresses[0].id;
            this.selectedAddress = this.savedAddresses[0];
          }
        },
        error: (error) => {
          console.error('❌ Failed to load addresses:', error);
          this.showToast('Failed to load addresses', 'danger');
        }
      });
  }

  calculateOrderSummary() {
    this.orderSummary.subtotal = this.cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    this.orderSummary.total = this.orderSummary.subtotal - this.orderSummary.discount + this.orderSummary.shipping;
  }

  changeStep(event: any) {
    this.currentStep = parseInt(event.detail.value);
  }

  nextStep() {
    // Update selectedAddress when moving from address step
    if (this.currentStep === 2 && this.selectedAddressId) {
      this.selectedAddress = this.savedAddresses.find(a => a.id === this.selectedAddressId);
    }
    
    if (this.currentStep < 4) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  toggleAddressForm() {
    this.showAddressForm = !this.showAddressForm;
  }

  saveAddress() {
    if (this.addressForm.valid) {
      const addressData = this.addressForm.value;

      this.http.post('/api/addresses', addressData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.savedAddresses.push(response.data);
            this.selectedAddressId = response.data.id;
            this.selectedAddress = response.data;
            this.showAddressForm = false;
            this.addressForm.reset();
            this.showToast('Address saved successfully', 'success');
          },
          error: (error) => {
            console.error('❌ Failed to save address:', error);
            this.showToast('Failed to save address', 'danger');
          }
        });
    }
  }

  placeOrder() {
    if (!this.selectedAddressId || !this.selectedPaymentMethod) {
      this.showToast('Please select address and payment method', 'warning');
      return;
    }

    this.isProcessing = true;

    const orderPayload = {
      items: this.cartItems.map(item => ({
        productId: item.product?.id || item.productId,
        quantity: item.quantity,
        price: item.product?.price || item.price
      })),
      addressId: this.selectedAddressId,
      paymentMethod: this.selectedPaymentMethod,
      totalAmount: this.orderSummary.total,
      shippingCost: this.orderSummary.shipping,
      discount: this.orderSummary.discount
    };

    this.http.post('/api/orders', orderPayload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.showToast('Order placed successfully', 'success');
          
          // Clear cart after successful order
          this.cartService.clearCart().subscribe(
            () => {
              this.isProcessing = false;
              // Redirect to order confirmation
              this.router.navigate(['/mobile/order-confirmation', response.data?.orderId]);
            },
            (error) => {
              console.error('❌ Failed to clear cart:', error);
              this.isProcessing = false;
              this.router.navigate(['/mobile/order-confirmation', response.data?.orderId]);
            }
          );
        },
        error: (error) => {
          console.error('❌ Failed to place order:', error);
          this.isProcessing = false;
          this.showToast(error?.error?.message || 'Failed to place order', 'danger');
        }
      });
  }

  getPaymentMethodLabel(method: string): string {
    const labels: { [key: string]: string } = {
      upi: '💳 UPI Payment',
      card: '💳 Credit/Debit Card',
      netbanking: '🏦 Net Banking',
      wallet: '👝 Wallet',
    };
    return labels[method] || 'Unknown Method';
  }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
