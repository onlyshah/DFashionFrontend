/**
 * ⭐ Write Review Page (Web)
 * Create product reviews with ratings, photos, and recommendations
 */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { ShopApi } from 'src/app/core/api/shop.api';

@Component({
  selector: 'app-write-review-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="review-container">
      <div class="page-header">
        <h1>Write a Review</h1>
        <p>Share your experience with this product</p>
      </div>

      <div class="review-content">
        <!-- Product Info -->
        <div *ngIf="product" class="product-info">
          <img [src]="getImageUrl(product.image)" class="product-image" />
          <div class="product-details">
            <h2>{{ product.name }}</h2>
            <p class="product-brand">by {{ product.brand }}</p>
            <p class="product-sku">SKU: {{ product.sku }}</p>
          </div>
        </div>

        <!-- Review Form -->
        <form [formGroup]="reviewForm" (ngSubmit)="submitReview()" class="review-form">
          <!-- Overall Rating -->
          <div class="form-section">
            <label>Overall Rating *</label>
            <div class="rating-selector">
              <div *ngFor="let i of [5,4,3,2,1]" class="star" 
                   (click)="setRating(i)"
                   [class.active]="currentRating >= i">
                ⭐
              </div>
            </div>
            <p class="rating-text">{{ getRatingText(currentRating) }}</p>
          </div>

          <!-- Aspect Ratings -->
          <div class="form-section">
            <label>How would you rate these aspects? (Optional)</label>
            <div class="aspect-ratings">
              <div class="aspect-item">
                <span>Quality</span>
                <div class="mini-rating">
                  <span *ngFor="let i of [5,4,3,2,1]" 
                        (click)="setAspectRating('quality', i)"
                        [class.active]="aspectRatings['quality'] >= i">★</span>
                </div>
              </div>
              <div class="aspect-item">
                <span>Fit/Comfort</span>
                <div class="mini-rating">
                  <span *ngFor="let i of [5,4,3,2,1]" 
                        (click)="setAspectRating('fit', i)"
                        [class.active]="aspectRatings['fit'] >= i">★</span>
                </div>
              </div>
              <div class="aspect-item">
                <span>Delivery</span>
                <div class="mini-rating">
                  <span *ngFor="let i of [5,4,3,2,1]" 
                        (click)="setAspectRating('delivery', i)"
                        [class.active]="aspectRatings['delivery'] >= i">★</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Review Title -->
          <div class="form-section">
            <label>Review Title (Max 60 characters) *</label>
            <input type="text" 
                   formControlName="title" 
                   placeholder="Summarize your review in one sentence"
                   (input)="onTitleChange($event)"
                   maxlength="60" />
            <p class="char-count">{{ reviewForm.get('title')?.value?.length || 0 }}/60</p>
          </div>

          <!-- Review Text -->
          <div class="form-section">
            <label>Your Review (Max 500 characters) *</label>
            <textarea formControlName="text" 
                      placeholder="Share details about the product, your experience, etc..."
                      rows="6"
                      (input)="onTextChange($event)"
                      maxlength="500"></textarea>
            <p class="char-count">{{ reviewForm.get('text')?.value?.length || 0 }}/500</p>
          </div>

          <!-- Photo Upload -->
          <div class="form-section">
            <label>Add Photos (Max 5 images)</label>
            <div class="photo-upload">
              <div class="upload-area" (click)="fileInput.click()">
                <p>📸 Click to upload or drag and drop</p>
                <p class="small">PNG, JPG, GIF up to 5MB each</p>
              </div>
              <input type="file" #fileInput multiple accept="image/*" 
                     (change)="onFilesSelected($event)" style="display:none" />
              
              <!-- Uploaded Photos -->
              <div *ngIf="uploadedPhotos.length > 0" class="uploaded-photos">
                <div *ngFor="let photo of uploadedPhotos; let i = index" class="photo-item">
                  <img [src]="photo.preview" />
                  <button type="button" class="remove-btn" (click)="removePhoto(i)">✕</button>
                </div>
              </div>
            </div>
            <p class="small">{{ uploadedPhotos.length }}/5 photos added</p>
          </div>

          <!-- Checkboxes -->
          <div class="form-section checkbox-group">
            <div class="checkbox-item">
              <input type="checkbox" formControlName="recommend" id="recommend" />
              <label for="recommend">I would recommend this product to others</label>
            </div>
            <div class="checkbox-item">
              <input type="checkbox" formControlName="verifiedPurchase" id="verified" />
              <label for="verified">I purchased this product on this platform</label>
            </div>
          </div>

          <!-- Content Guidelines -->
          <div class="guidelines">
            <h4>Content Guidelines</h4>
            <ul>
              <li>✓ Be honest and helpful</li>
              <li>✓ Include specific details</li>
              <li>✓ Be respectful to the seller</li>
              <li>✗ Don't include contact details</li>
              <li>✗ Don't post multiple reviews</li>
              <li>✗ Don't include external links</li>
            </ul>
          </div>

          <!-- Submit -->
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="!reviewForm.valid || isSubmitting">
              {{ isSubmitting ? 'Publishing...' : 'Publish Review' }}
            </button>
            <button type="button" class="btn btn-secondary" (click)="cancel()">
              Cancel
            </button>
          </div>

          <p *ngIf="successMessage" class="success-message">{{ successMessage }}</p>
          <p *ngIf="errorMessage" class="error-message">{{ errorMessage }}</p>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .review-container {
      max-width: 800px;
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

    .page-header p {
      color: #666;
    }

    .review-content {
      background: white;
    }

    .product-info {
      display: flex;
      gap: 20px;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 8px;
      margin-bottom: 30px;
      align-items: center;
    }

    .product-image {
      width: 100px;
      height: 100px;
      border-radius: 6px;
      object-fit: cover;
    }

    .product-details h2 {
      margin: 0;
      font-size: 18px;
    }

    .product-brand {
      color: #666;
      font-size: 14px;
      margin: 4px 0;
    }

    .product-sku {
      color: #999;
      font-size: 12px;
      margin: 4px 0 0 0;
    }

    .review-form {
      background: white;
    }

    .form-section {
      margin-bottom: 25px;
    }

    .form-section label {
      display: block;
      font-weight: 600;
      margin-bottom: 12px;
      color: #333;
    }

    .form-section input,
    .form-section textarea,
    .form-section select {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      font-family: inherit;
    }

    .form-section input:focus,
    .form-section textarea:focus {
      outline: none;
      border-color: #ff6b6b;
      box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
    }

    .form-section textarea {
      resize: vertical;
    }

    .char-count {
      text-align: right;
      font-size: 12px;
      color: #999;
      margin-top: 4px;
    }

    .rating-selector {
      display: flex;
      gap: 15px;
      font-size: 32px;
      cursor: pointer;
    }

    .star {
      opacity: 0.3;
      transition: opacity 0.3s;
    }

    .star:hover,
    .star.active {
      opacity: 1;
    }

    .rating-text {
      margin-top: 8px;
      color: #666;
      font-size: 14px;
    }

    .aspect-ratings {
      background: #f9f9f9;
      padding: 15px;
      border-radius: 6px;
    }

    .aspect-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }

    .aspect-item:last-child {
      border-bottom: none;
    }

    .mini-rating {
      display: flex;
      gap: 5px;
      font-size: 16px;
      cursor: pointer;
    }

    .mini-rating span {
      opacity: 0.3;
      transition: opacity 0.3s;
    }

    .mini-rating span:hover,
    .mini-rating span.active {
      opacity: 1;
    }

    .photo-upload {
      border: 2px dashed #ddd;
      border-radius: 8px;
      overflow: hidden;
    }

    .upload-area {
      padding: 40px 20px;
      text-align: center;
      cursor: pointer;
      background: #f9f9f9;
      transition: background 0.3s;
    }

    .upload-area:hover {
      background: #f0f0f0;
    }

    .upload-area p {
      margin: 8px 0;
    }

    .upload-area .small {
      font-size: 12px;
      color: #999;
    }

    .uploaded-photos {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 10px;
      padding: 15px;
      background: #f9f9f9;
    }

    .photo-item {
      position: relative;
      width: 80px;
      height: 80px;
      border-radius: 6px;
      overflow: hidden;
    }

    .photo-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .remove-btn {
      position: absolute;
      top: 2px;
      right: 2px;
      background: rgba(0,0,0,0.6);
      color: white;
      border: none;
      width: 24px;
      height: 24px;
      border-radius: 12px;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .small {
      font-size: 12px;
      color: #999;
      margin-top: 8px;
    }

    .checkbox-group {
      background: #f9f9f9;
      padding: 15px;
      border-radius: 6px;
    }

    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }

    .checkbox-item:last-child {
      margin-bottom: 0;
    }

    .checkbox-item input {
      width: auto;
    }

    .checkbox-item label {
      margin: 0;
      font-weight: normal;
    }

    .guidelines {
      background: #f0fdf4;
      border-left: 4px solid #10b981;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 25px;
    }

    .guidelines h4 {
      margin-top: 0;
      color: #166534;
    }

    .guidelines ul {
      margin: 10px 0 0 0;
      padding-left: 20px;
      color: #4b7c59;
      font-size: 13px;
    }

    .guidelines li {
      margin-bottom: 4px;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary {
      background: #ff6b6b;
      color: white;
      flex: 1;
    }

    .btn-primary:hover:not(:disabled) {
      background: #ff5252;
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: white;
      color: #ff6b6b;
      border: 2px solid #ff6b6b;
      flex: 1;
    }

    .btn-secondary:hover {
      background: #fff5f5;
    }

    .success-message {
      color: #10b981;
      background: #f0fdf4;
      border: 1px solid #dcfce7;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 15px;
    }

    .error-message {
      color: #dc2626;
      background: #fef2f2;
      border: 1px solid #fecaca;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 15px;
    }
  `]
})
export class WriteReviewPageComponent implements OnInit {
  product: any = null;
  reviewForm: FormGroup;
  currentRating = 0;
  aspectRatings = { quality: 0, fit: 0, delivery: 0 };
  uploadedPhotos: any[] = [];
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private shopApi: ShopApi,
    private fb: FormBuilder
  ) {
    this.reviewForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      text: ['', [Validators.required, Validators.minLength(20)]],
      recommend: [false],
      verifiedPurchase: [true]
    });
  }

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('productId');
    if (productId) {
      this.loadProduct(productId);
    }
  }

  loadProduct(id: string) {
    this.shopApi.getProduct(id)
      .subscribe({
        next: (response: any) => {
          this.product = response.data;
        },
        error: (error) => {
          console.error('Failed to load product:', error);
          this.errorMessage = 'Could not load product details';
        }
      });
  }

  setRating(rating: number) {
    this.currentRating = rating;
  }

  getRatingText(rating: number): string {
    const texts = {
      0: 'Select a rating',
      1: 'Poor',
      2: 'Average',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return texts[rating as keyof typeof texts] || '';
  }

  setAspectRating(aspect: string, rating: number) {
    this.aspectRatings = { ...this.aspectRatings, [aspect]: rating };
  }

  onTitleChange(event: any) {
    const value = event.target.value;
    this.reviewForm.patchValue({ title: value.slice(0, 60) });
  }

  onTextChange(event: any) {
    const value = event.target.value;
    this.reviewForm.patchValue({ text: value.slice(0, 500) });
  }

  onFilesSelected(event: any) {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length && this.uploadedPhotos.length < 5; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.uploadedPhotos.push({
          file,
          preview: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto(index: number) {
    this.uploadedPhotos.splice(index, 1);
  }

  submitReview() {
    if (!this.reviewForm.valid || this.currentRating === 0) {
      this.errorMessage = 'Please fill in all required fields and select a rating';
      return;
    }

    if (!this.product) {
      this.errorMessage = 'Product information not available';
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('productId', this.product._id);
    formData.append('title', this.reviewForm.get('title')?.value);
    formData.append('text', this.reviewForm.get('text')?.value);
    formData.append('rating', this.currentRating.toString());
    formData.append('aspectQuality', this.aspectRatings.quality.toString());
    formData.append('aspectFit', this.aspectRatings.fit.toString());
    formData.append('aspectDelivery', this.aspectRatings.delivery.toString());
    formData.append('recommend', this.reviewForm.get('recommend')?.value);
    formData.append('verifiedPurchase', this.reviewForm.get('verifiedPurchase')?.value);

    this.uploadedPhotos.forEach((photo, index) => {
      formData.append(`photos`, photo.file);
    });

    this.shopApi.createReview(formData)
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.successMessage = 'Review published successfully!';
          setTimeout(() => {
            this.router.navigate(['/products', this.product._id]);
          }, 2000);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = error.error?.message || 'Failed to submit review';
        }
      });
  }

  cancel() {
    if (this.product) {
      this.router.navigate(['/products', this.product._id]);
    } else {
      this.router.navigate(['/shop']);
    }
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '/assets/placeholder.png';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return environment.apiUrl + imagePath;
    return environment.apiUrl + '/uploads/' + imagePath;
  }
}
