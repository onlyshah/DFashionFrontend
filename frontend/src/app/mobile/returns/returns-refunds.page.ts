/**
 * 🔄 Returns & Refunds Component
 * Process returns and track refund status
 */

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Return {
  id: string;
  orderId: string;
  orderNumber: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  reason: string;
  status: 'initiated' | 'approved' | 'shipped' | 'received' | 'refunded' | 'rejected';
  refundAmount: number;
  refundStatus: 'pending' | 'processing' | 'completed' | 'failed';
  pickupScheduled?: string;
  trackingNumber?: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-returns-refunds',
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
        <ion-title>Returns & Refunds</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="returns-content">
      <!-- Filter Tabs -->
      <ion-segment
        value="all"
        (ionChange)="currentFilter = $event.detail.value || 'all'"
        class="return-filters"
      >
        <ion-segment-button value="all">All</ion-segment-button>
        <ion-segment-button value="active">Active</ion-segment-button>
        <ion-segment-button value="completed">Completed</ion-segment-button>
      </ion-segment>

      <!-- Returns List -->
      <div *ngIf="filteredReturns.length > 0" class="returns-list">
        <div *ngFor="let returnItem of filteredReturns" class="return-card">
          <!-- Return Header -->
          <div class="return-header">
            <img [src]="returnItem.productImage" class="product-image" />

            <div class="return-info">
              <h3>{{ returnItem.productName }}</h3>
              <p class="order-number">Order #{{ returnItem.orderNumber }}</p>
              <p class="reason">Reason: {{ returnItem.reason }}</p>
            </div>

            <ion-badge [color]="getStatusColor(returnItem.status)">
              {{ formatStatus(returnItem.status) }}
            </ion-badge>
          </div>

          <!-- Return Timeline -->
          <div class="return-timeline">
            <div class="timeline-step" [class.completed]="isStepCompleted(returnItem, 'initiated')">
              <div class="step-marker"></div>
              <p class="step-label">Initiated</p>
            </div>
            <div class="timeline-line" [class.completed]="isStepCompleted(returnItem, 'approved')"></div>

            <div class="timeline-step" [class.completed]="isStepCompleted(returnItem, 'approved')">
              <div class="step-marker"></div>
              <p class="step-label">Approved</p>
            </div>
            <div class="timeline-line" [class.completed]="isStepCompleted(returnItem, 'shipped')"></div>

            <div class="timeline-step" [class.completed]="isStepCompleted(returnItem, 'shipped')">
              <div class="step-marker"></div>
              <p class="step-label">Pickup</p>
            </div>
            <div class="timeline-line" [class.completed]="isStepCompleted(returnItem, 'received')"></div>

            <div class="timeline-step" [class.completed]="isStepCompleted(returnItem, 'received')">
              <div class="step-marker"></div>
              <p class="step-label">Received</p>
            </div>
            <div class="timeline-line" [class.completed]="isStepCompleted(returnItem, 'refunded')"></div>

            <div class="timeline-step" [class.completed]="isStepCompleted(returnItem, 'refunded')">
              <div class="step-marker"></div>
              <p class="step-label">Refunded</p>
            </div>
          </div>

          <!-- Return Details -->
          <div class="return-details">
            <div class="detail-row">
              <span class="label">Quantity</span>
              <span class="value">{{ returnItem.quantity }}</span>
            </div>

            <div class="detail-row">
              <span class="label">Refund Amount</span>
              <span class="value">₹{{ returnItem.refundAmount }}</span>
            </div>

            <div class="detail-row">
              <span class="label">Refund Status</span>
              <ion-badge [color]="getRefundStatusColor(returnItem.refundStatus)">
                {{ formatRefundStatus(returnItem.refundStatus) }}
              </ion-badge>
            </div>

            <div *ngIf="returnItem.pickupScheduled" class="detail-row">
              <span class="label">Pickup Scheduled</span>
              <span class="value">{{ formatDate(returnItem.pickupScheduled) }}</span>
            </div>

            <div *ngIf="returnItem.trackingNumber" class="detail-row">
              <span class="label">Tracking Number</span>
              <span class="value">{{ returnItem.trackingNumber }}</span>
            </div>

            <div *ngIf="returnItem.comments" class="detail-row full">
              <span class="label">Comments</span>
              <p class="comments">{{ returnItem.comments }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="return-actions">
            <ion-button
              expand="block"
              fill="outline"
              size="small"
              (click)="viewDetails(returnItem)"
            >
              <ion-icon name="eye" slot="start"></ion-icon>
              View Details
            </ion-button>

            <ion-button
              expand="block"
              fill="outline"
              size="small"
              *ngIf="returnItem.status === 'initiated'"
              (click)="cancelReturn(returnItem)"
              color="danger"
            >
              <ion-icon name="close-circle" slot="start"></ion-icon>
              Cancel
            </ion-button>

            <ion-button
              expand="block"
              fill="outline"
              size="small"
              (click)="contactSupport(returnItem)"
            >
              <ion-icon name="chatbubble" slot="start"></ion-icon>
              Support
            </ion-button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="filteredReturns.length === 0" class="empty-state">
        <ion-icon name="repeat"></ion-icon>
        <h2>No Returns</h2>
        <p>You don't have any returns or refunds</p>
      </div>

      <!-- Initiate Return Button -->
      <div class="initiate-return-section">
        <ion-button expand="block" (click)="initiateNewReturn()">
          <ion-icon name="add" slot="start"></ion-icon>
          Initiate New Return
        </ion-button>
      </div>

      <!-- Refund FAQ -->
      <div class="faq-section">
        <h3>Frequently Asked Questions</h3>

        <div class="faq-item">
          <h4>How long does the refund take?</h4>
          <p>Refunds are typically processed within 5-7 business days after we receive your item.</p>
        </div>

        <div class="faq-item">
          <h4>Can I return an item?</h4>
          <p>Most items can be returned within 30 days of purchase. Items must be unused and in original packaging.</p>
        </div>

        <div class="faq-item">
          <h4>How do I track my return?</h4>
          <p>Once your return is initiated, you'll receive a pickup date and tracking number via email.</p>
        </div>

        <div class="faq-item">
          <h4>What if my refund is delayed?</h4>
          <p>Contact our support team and we'll investigate the issue immediately.</p>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .returns-content {
      --background: #f9f9f9;
    }

    .return-filters {
      --background: white;
      border-bottom: 1px solid #eee;
    }

    .returns-list {
      padding: 12px;
    }

    .return-card {
      background: white;
      border-radius: 8px;
      margin-bottom: 12px;
      overflow: hidden;
      border: 1px solid #eee;
    }

    .return-header {
      display: flex;
      gap: 12px;
      padding: 12px;
      align-items: flex-start;
      border-bottom: 1px solid #f0f0f0;
    }

    .product-image {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 6px;
      flex-shrink: 0;
    }

    .return-info {
      flex: 1;
    }

    .return-info h3 {
      font-size: 13px;
      font-weight: bold;
      margin: 0 0 4px 0;
    }

    .order-number {
      font-size: 11px;
      color: #999;
      margin: 0 0 4px 0;
    }

    .reason {
      font-size: 12px;
      color: #666;
      margin: 0;
    }

    .return-timeline {
      display: flex;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
      overflow-x: auto;
      gap: 4px;
    }

    .timeline-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 50px;
      flex-shrink: 0;
    }

    .step-marker {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #ddd;
      margin-bottom: 4px;
      transition: background 0.3s;
    }

    .timeline-step.completed .step-marker {
      background: var(--ion-color-success);
    }

    .step-label {
      font-size: 10px;
      text-align: center;
      margin: 0;
      color: #666;
    }

    .timeline-step.completed .step-label {
      color: var(--ion-color-success);
      font-weight: bold;
    }

    .timeline-line {
      height: 2px;
      width: 30px;
      background: #ddd;
      flex-shrink: 0;
    }

    .timeline-line.completed {
      background: var(--ion-color-success);
    }

    .return-details {
      padding: 12px;
      border-bottom: 1px solid #f0f0f0;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      font-size: 12px;
      border-bottom: 1px solid #f9f9f9;
    }

    .detail-row.full {
      flex-direction: column;
      align-items: flex-start;
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

    .comments {
      margin: 6px 0 0 0;
      padding: 6px;
      background: #f9f9f9;
      border-radius: 4px;
      font-size: 11px;
      line-height: 1.4;
    }

    .return-actions {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      padding: 8px;
    }

    .return-actions ion-button {
      margin: 0;
      --padding-start: 4px;
      --padding-end: 4px;
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

    .initiate-return-section {
      padding: 16px;
    }

    .initiate-return-section ion-button {
      margin: 0;
    }

    .faq-section {
      background: white;
      padding: 16px;
      margin: 12px;
      border-radius: 8px;
    }

    .faq-section h3 {
      font-size: 14px;
      font-weight: bold;
      margin: 0 0 16px 0;
    }

    .faq-item {
      margin-bottom: 16px;
    }

    .faq-item:last-child {
      margin-bottom: 0;
    }

    .faq-item h4 {
      font-size: 12px;
      font-weight: bold;
      margin: 0 0 6px 0;
      color: #333;
    }

    .faq-item p {
      font-size: 12px;
      color: #666;
      margin: 0;
      line-height: 1.5;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReturnsRefundsPageComponent implements OnInit, OnDestroy {
  returns: Return[] = [];
  currentFilter: string | any = 'all';
  isLoading: boolean = true;

  get filteredReturns(): Return[] {
    if (this.currentFilter === 'all') return this.returns;
    if (this.currentFilter === 'active') {
      return this.returns.filter(r => !['refunded', 'rejected'].includes(r.status));
    }
    if (this.currentFilter === 'completed') {
      return this.returns.filter(r => ['refunded', 'rejected'].includes(r.status));
    }
    return this.returns;
  }

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastController: ToastController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.loadReturns();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReturns() {
    this.http.get('/api/returns')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.returns = response.data || [];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load returns:', error);
          this.isLoading = false;
        }
      });
  }

  isStepCompleted(returnItem: Return, step: string): boolean {
    const steps = ['initiated', 'approved', 'shipped', 'received', 'refunded'];
    const currentIndex = steps.indexOf(returnItem.status);
    const stepIndex = steps.indexOf(step as any);
    return stepIndex <= currentIndex;
  }

  viewDetails(returnItem: Return) {
    console.log('👁️ View return details:', returnItem.id);
  }

  cancelReturn(returnItem: Return) {
    const confirm = window.confirm('Are you sure you want to cancel this return?');
    if (!confirm) return;

    this.http.post(`/api/returns/${returnItem.id}/cancel`, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.returns = this.returns.filter(r => r.id !== returnItem.id);
          this.showToast('Return cancelled', 'success');
        },
        error: (error) => {
          console.error('Failed to cancel return:', error);
          this.showToast('Failed to cancel', 'danger');
        }
      });
  }

  contactSupport(returnItem: Return) {
    this.router.navigate(['/support'], { state: { returnId: returnItem.id } });
  }

  initiateNewReturn() {
    console.log('🔄 Initiate new return');
    // Navigate to order list to select product for return
    this.router.navigate(['/tabs/orders']);
  }

  goBack() {
    this.router.navigate(['/tabs/profile']);
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'initiated': 'warning',
      'approved': 'primary',
      'shipped': 'primary',
      'received': 'info',
      'refunded': 'success',
      'rejected': 'danger'
    };
    return colors[status] || 'medium';
  }

  getRefundStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'warning',
      'processing': 'primary',
      'completed': 'success',
      'failed': 'danger'
    };
    return colors[status] || 'medium';
  }

  formatStatus(status: string): string {
    return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  formatRefundStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
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
