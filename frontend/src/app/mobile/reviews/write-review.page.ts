/**
 * ⭐ Write Review Component
 * Create and submit product reviews with ratings and photos
 */

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, ToastController, ActionSheetController, ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface ReviewImage {
  id: string;
  url: string;
  temporary?: boolean;
  file?: File;
}

interface Product {
  id: string;
  name: string;
  image: string;
  brand: string;
  purchasePrice: number;
}

@Component({
  selector: 'app-write-review',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="goBack()">
            <ion-icon name="arrow-back"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Write Review</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="review-content">
      <!-- Product Info -->
      <div *ngIf="product" class="product-section">
        <img [src]="product.image" class="product-image" />
        <div class="product-info">
          <p class="brand">{{ product.brand }}</p>
          <h3>{{ product.name }}</h3>
          <p class="price">₹{{ product.purchasePrice }}</p>
        </div>
      </div>

      <!-- Review Form -->
      <form [formGroup]="reviewForm" (ngSubmit)="submitReview()" class="review-form">
        <!-- Rating Section -->
        <div class="form-section">
          <label class="section-title">
            <ion-icon name="star"></ion-icon>
            Overall Rating
          </label>
          <div class="rating-selector">
            <button
              *ngFor="let star of [5, 4, 3, 2, 1]"
              type="button"
              class="star-button"
              [class.active]="selectedRating === star"
              [class.hovered]="hoverRating >= star"
              (click)="setRating(star)"
              (mouseenter)="hoverRating = star"
              (mouseleave)="hoverRating = 0"
            >
              <ion-icon name="star" [class.filled]="selectedRating >= star"></ion-icon>
              <span class="star-label">{{ star }} Star{{ star > 1 ? 's' : '' }}</span>
            </button>
          </div>
          <input type="hidden" formControlName="rating" [value]="selectedRating" />
        </div>

        <!-- Aspect Ratings (Optional) -->
        <div class="form-section">
          <label class="section-title">Rate These Aspects</label>

          <div class="aspect-rating">
            <div class="aspect-header">
              <span>Quality</span>
              <div class="mini-stars">
                <ion-icon
                  *ngFor="let i of [1, 2, 3, 4, 5]"
                  name="star"
                  [class.filled]="aspectRatings.quality >= i"
                  (click)="setAspectRating('quality', i)"
                ></ion-icon>
              </div>
            </div>
          </div>

          <div class="aspect-rating">
            <div class="aspect-header">
              <span>Fit</span>
              <div class="mini-stars">
                <ion-icon
                  *ngFor="let i of [1, 2, 3, 4, 5]"
                  name="star"
                  [class.filled]="aspectRatings.fit >= i"
                  (click)="setAspectRating('fit', i)"
                ></ion-icon>
              </div>
            </div>
          </div>

          <div class="aspect-rating">
            <div class="aspect-header">
              <span>Delivery Experience</span>
              <div class="mini-stars">
                <ion-icon
                  *ngFor="let i of [1, 2, 3, 4, 5]"
                  name="star"
                  [class.filled]="aspectRatings.delivery >= i"
                  (click)="setAspectRating('delivery', i)"
                ></ion-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- Review Title -->
        <div class="form-section">
          <label for="title" class="section-title">
            <ion-icon name="text"></ion-icon>
            Review Title
          </label>
          <ion-input
            id="title"
            formControlName="title"
            placeholder="Summarize your review in one line"
            maxlength="60"
            clearInput
          ></ion-input>
          <small class="char-count">{{ reviewForm.get('title')?.value?.length || 0 }}/60</small>
        </div>

        <!-- Review Text -->
        <div class="form-section">
          <label for="comment" class="section-title">
            <ion-icon name="document-text"></ion-icon>
            Your Review
          </label>
          <textarea
            id="comment"
            formControlName="comment"
            placeholder="Tell others what you think about this product..."
            rows="5"
            maxlength="500"
            class="review-textarea"
          ></textarea>
          <small class="char-count">{{ reviewForm.get('comment')?.value?.length || 0 }}/500</small>
        </div>

        <!-- Verified Purchase Badge -->
        <div class="form-section verified-badge">
          <ion-icon name="checkmark-circle"></ion-icon>
          <span>Verified Purchase</span>
        </div>

        <!-- Photo Upload -->
        <div class="form-section">
          <label class="section-title">
            <ion-icon name="images"></ion-icon>
            Add Photos (Optional)
          </label>
          <input
            #fileInput
            type="file"
            multiple
            accept="image/*"
            (change)="onImagesSelected($event)"
            hidden
          />

          <!-- Image Preview Grid -->
          <div class="images-grid">
            <div *ngFor="let image of reviewImages; let i = index" class="image-item">
              <img [src]="image.url" />
              <button
                type="button"
                class="remove-image"
                (click)="removeImage(i)"
              >
                <ion-icon name="close-circle"></ion-icon>
              </button>
            </div>

            <!-- Add Photo Button -->
            <button
              type="button"
              class="add-image-button"
              (click)="fileInput.click()"
              [disabled]="reviewImages.length >= 5"
            >
              <ion-icon name="camera"></ion-icon>
              <span>{{ reviewImages.length }}/5</span>
            </button>
          </div>
        </div>

        <!-- Recommend Section -->
        <div class="form-section">
          <label class="section-title">Would you recommend this product?</label>
          <div class="recommend-options">
            <button
              type="button"
              class="recommend-btn"
              [class.selected]="recommendProduct === true"
              (click)="recommendProduct = true"
            >
              <ion-icon name="thumbs-up"></ion-icon>
              Yes, Recommend
            </button>
            <button
              type="button"
              class="recommend-btn"
              [class.selected]="recommendProduct === false"
              (click)="recommendProduct = false"
            >
              <ion-icon name="thumbs-down"></ion-icon>
              No, Don't Recommend
            </button>
          </div>
        </div>

        <!-- Risks & Warnings -->
        <div class="form-section warnings">
          <p class="warning-title">⚠️ Remember:</p>
          <ul>
            <li>Be honest and helpful to other shoppers</li>
            <li>Don't include personal information</li>
            <li>Avoid promotional or offensive language</li>
            <li>This is a verified purchase review</li>
          </ul>
        </div>

        <!-- Submit Button -->
        <div class="submit-section">
          <ion-button
            expand="block"
            (click)="submitReview()"
            [disabled]="!canSubmit() || isSubmitting"
          >
            <ion-spinner *ngIf="isSubmitting" name="crescent" slot="start"></ion-spinner>
            {{ isSubmitting ? 'Submitting...' : 'Submit Review' }}
          </ion-button>
          <ion-button
            expand="block"
            fill="outline"
            (click)="goBack()"
          >
            Cancel
          </ion-button>
        </div>
      </form>
    </ion-content>
  `,
  styles: [`
    .review-content {
      --background: #f9f9f9;
    }

    .product-section {
      display: flex;
      gap: 12px;
      padding: 16px;
      background: white;
      border-bottom: 1px solid #eee;
      align-items: flex-start;
    }

    .product-image {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 6px;
      flex-shrink: 0;
    }

    .product-info {
      flex: 1;
    }

    .product-info .brand {
      font-size: 11px;
      color: #999;
      margin: 0 0 4px 0;
      text-transform: uppercase;
    }

    .product-info h3 {
      font-size: 13px;
      font-weight: bold;
      margin: 0 0 4px 0;
    }

    .product-info .price {
      font-size: 12px;
      color: var(--ion-color-primary);
      font-weight: bold;
      margin: 0;
    }

    .review-form {
      padding: 12px;
    }

    .form-section {
      background: white;
      padding: 16px;
      margin-bottom: 12px;
      border-radius: 8px;
      border: 1px solid #eee;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: bold;
      margin: 0 0 12px 0;
      color: #333;
    }

    .section-title ion-icon {
      color: var(--ion-color-primary);
    }

    /* Rating Selector */
    .rating-selector {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .star-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 8px;
      cursor: pointer;
      transition: all 0.2s;
      flex: 1;
      min-width: 60px;
    }

    .star-button:hover,
    .star-button.hovered,
    .star-button.active {
      border-color: var(--ion-color-primary);
      background: rgba(var(--ion-color-primary-rgb), 0.05);
    }

    .star-button ion-icon {
      font-size: 20px;
      color: #ddd;
      transition: color 0.2s;
    }

    .star-button.hovered ion-icon,
    .star-button.active ion-icon {
      color: var(--ion-color-warning);
    }

    .star-button.active ion-icon.filled,
    .star-button.hovered ion-icon.filled {
      color: var(--ion-color-warning);
    }

    .star-label {
      font-size: 10px;
      text-align: center;
      color: #666;
    }

    /* Aspect Ratings */
    .aspect-rating {
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f0f0f0;
    }

    .aspect-rating:last-child {
      margin-bottom: 0;
      border-bottom: none;
    }

    .aspect-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
    }

    .mini-stars {
      display: flex;
      gap: 2px;
    }

    .mini-stars ion-icon {
      font-size: 16px;
      color: #ddd;
      cursor: pointer;
      transition: color 0.2s;
    }

    .mini-stars ion-icon:hover,
    .mini-stars ion-icon.filled {
      color: var(--ion-color-warning);
    }

    /* Text Inputs */
    ion-input {
      --border-radius: 6px;
      --padding-start: 8px;
      --padding-end: 8px;
      --padding-top: 8px;
      --padding-bottom: 8px;
    }

    .review-textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-family: inherit;
      font-size: 13px;
      resize: vertical;
    }

    .review-textarea:focus {
      outline: none;
      border-color: var(--ion-color-primary);
    }

    .char-count {
      display: block;
      font-size: 11px;
      color: #999;
      margin-top: 4px;
    }

    /* Verified Badge */
    .verified-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: rgba(var(--ion-color-success-rgb), 0.05);
      border: 1px solid rgba(var(--ion-color-success-rgb), 0.2);
    }

    .verified-badge ion-icon {
      color: var(--ion-color-success);
      font-size: 18px;
    }

    .verified-badge span {
      color: var(--ion-color-success);
      font-size: 12px;
      font-weight: bold;
    }

    /* Images Grid */
    .images-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      margin-top: 12px;
    }

    .image-item {
      position: relative;
      aspect-ratio: 1;
      border-radius: 6px;
      overflow: hidden;
      background: #f0f0f0;
    }

    .image-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .remove-image {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 24px;
      height: 24px;
      padding: 0;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.5);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .remove-image ion-icon {
      color: white;
      font-size: 16px;
    }

    .add-image-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      aspect-ratio: 1;
      border: 2px dashed #ddd;
      border-radius: 6px;
      background: rgba(0, 0, 0, 0.02);
      cursor: pointer;
      font-size: 12px;
      color: #666;
      transition: all 0.2s;
    }

    .add-image-button:hover:not(:disabled) {
      border-color: var(--ion-color-primary);
      color: var(--ion-color-primary);
    }

    .add-image-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .add-image-button ion-icon {
      font-size: 18px;
    }

    .add-image-button span {
      font-size: 10px;
    }

    /* Recommend Options */
    .recommend-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 12px;
    }

    .recommend-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 12px;
    }

    .recommend-btn:hover {
      border-color: var(--ion-color-primary);
    }

    .recommend-btn.selected {
      background: rgba(var(--ion-color-primary-rgb), 0.1);
      border-color: var(--ion-color-primary);
      font-weight: bold;
    }

    .recommend-btn ion-icon {
      font-size: 20px;
    }

    /* Warnings */
    .warnings {
      background: rgba(var(--ion-color-warning-rgb), 0.05);
      border: 1px solid rgba(var(--ion-color-warning-rgb), 0.2);
    }

    .warning-title {
      font-size: 12px;
      font-weight: bold;
      margin: 0 0 8px 0;
      color: #333;
    }

    .warnings ul {
      margin: 0;
      padding-left: 16px;
      font-size: 11px;
      color: #666;
      line-height: 1.6;
    }

    .warnings li {
      margin-bottom: 4px;
    }

    /* Submit Section */
    .submit-section {
      background: white;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #eee;
    }

    .submit-section ion-button {
      margin: 6px 0;
    }

    .submit-section ion-button:first-child {
      margin-top: 0;
    }

    ion-spinner {
      width: 16px;
      height: 16px;
      margin-right: 4px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WriteReviewPageComponent implements OnInit, OnDestroy {
  reviewForm: FormGroup;
  product: Product | null = null;
  reviewImages: ReviewImage[] = [];
  selectedRating: number = 0;
  hoverRating: number = 0;
  recommendProduct: boolean | null = null;
  isSubmitting: boolean = false;

  aspectRatings = {
    quality: 0,
    fit: 0,
    delivery: 0
  };

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private toastController: ToastController,
    private formBuilder: FormBuilder
  ) {
    this.reviewForm = this.formBuilder.group({
      rating: [0, [Validators.required, Validators.min(1)]],
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(60)]],
      comment: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.loadProduct(params['id']);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProduct(productId: string) {
    this.http.get(`/api/products/${productId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.product = response.data;
        },
        error: (error) => {
          console.error('Failed to load product:', error);
          this.showToast('Failed to load product', 'danger');
        }
      });
  }

  setRating(rating: number) {
    this.selectedRating = rating;
    this.reviewForm.patchValue({ rating });
  }

  setAspectRating(aspect: string, rating: number) {
    this.aspectRatings = {
      ...this.aspectRatings,
      [aspect]: this.aspectRatings[aspect as keyof typeof this.aspectRatings] === rating ? 0 : rating
    };
  }

  onImagesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    const available = 5 - this.reviewImages.length;

    files.slice(0, available).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        this.reviewImages.push({
          id: Date.now().toString(),
          url: reader.result as string,
          file: file,
          temporary: true
        });
      };
      reader.readAsDataURL(file);
    });

    if (files.length > available) {
      this.showToast(`Maximum 5 images allowed. ${files.length - available} images skipped.`, 'warning');
    }
  }

  removeImage(index: number) {
    this.reviewImages.splice(index, 1);
  }

  canSubmit(): boolean {
    return (
      this.selectedRating > 0 &&
      this.reviewForm.valid &&
      (this.reviewForm.get('title')?.value?.length || 0) >= 5 &&
      (this.reviewForm.get('comment')?.value?.length || 0) >= 10
    );
  }

  submitReview() {
    if (!this.canSubmit() || !this.product) return;

    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('productId', this.product.id);
    formData.append('rating', Math.floor(this.selectedRating).toString());
    formData.append('title', this.reviewForm.get('title')?.value);
    formData.append('comment', this.reviewForm.get('comment')?.value);
    formData.append('recommend', this.recommendProduct !== null ? this.recommendProduct.toString() : 'true');
    formData.append('aspectRatings', JSON.stringify(this.aspectRatings));

    // Add images
    this.reviewImages.forEach((image, index) => {
      if (image.file) {
        formData.append(`images[${index}]`, image.file);
      }
    });

    this.http.post('/api/reviews', formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.showToast('Review submitted successfully! Thank you.', 'success');
          setTimeout(() => {
            this.router.navigate(['/tabs/product', this.product?.id]);
          }, 1500);
        },
        error: (error) => {
          console.error('Failed to submit review:', error);
          this.showToast('Failed to submit review. Please try again.', 'danger');
          this.isSubmitting = false;
        }
      });
  }

  goBack() {
    if (this.product) {
      this.router.navigate(['/tabs/product', this.product.id]);
    } else {
      this.router.navigate(['/tabs/shop']);
    }
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
