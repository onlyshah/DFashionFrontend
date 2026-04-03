import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ReviewService, Review, ReviewStats, CreateReviewRequest } from '../../../../../core/services/review.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-product-reviews',
    imports: [CommonModule, FormsModule, IonicModule],
    template: `
    <div class="product-reviews">
      <!-- Review Summary -->
      <div class="review-summary" *ngIf="reviewStats">
        <div class="rating-overview">
          <div class="average-rating">
            <div class="rating-number">{{ reviewStats.averageRating }}</div>
            <div class="stars">
              <span *ngFor="let star of [1,2,3,4,5]" class="star" [class.filled]="star <= Math.floor(reviewStats.averageRating)">
                <i class="fas fa-star"></i>
              </span>
            </div>
            <div class="total-reviews">{{ reviewStats.totalReviews }} reviews</div>
          </div>
          <div class="rating-breakdown">
            <div *ngFor="let rating of [5,4,3,2,1]" class="rating-bar">
              <span class="rating-label">{{ rating }} <i class="fas fa-star"></i></span>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="getRatingPercentage(rating)"></div>
              </div>
              <span class="rating-count">{{ reviewStats.ratingDistribution[rating] }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Write Review Button -->
      <div class="write-review-section" *ngIf="canReview && !hasReviewed">
        <button class="write-review-btn" (click)="openReviewForm()">
          <i class="fas fa-star"></i>
          Write a Review
        </button>
      </div>

      <!-- Review Form -->
      <div class="review-form" *ngIf="showReviewForm">
        <div class="form-header">
          <h4>Write Your Review</h4>
          <button class="close-form" (click)="closeReviewForm()">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form (ngSubmit)="submitReview()" #reviewForm="ngForm">
          <!-- Rating -->
          <div class="form-group">
            <label>Rating</label>
            <div class="rating-input">
              <span *ngFor="let star of [1,2,3,4,5]" class="star-input" (click)="setRating(star)" [class.selected]="star <= newReview.rating">
                <i class="fas fa-star"></i>
              </span>
            </div>
          </div>

          <!-- Title -->
          <div class="form-group">
            <label for="reviewTitle">Review Title</label>
            <input
              type="text"
              id="reviewTitle"
              [(ngModel)]="newReview.title"
              name="title"
              placeholder="Summarize your experience"
              required
              class="form-input">
          </div>

          <!-- Comment -->
          <div class="form-group">
            <label for="reviewComment">Your Review</label>
            <textarea
              id="reviewComment"
              [(ngModel)]="newReview.comment"
              name="comment"
              placeholder="Share details of your experience with this product"
              rows="4"
              required
              class="form-textarea"></textarea>
          </div>

          <!-- Images (Optional) -->
          <div class="form-group">
            <label>Photos (Optional)</label>
            <div class="image-upload">
              <div class="upload-area" (click)="imageInput.click()">
                <i class="fas fa-camera"></i>
                <span>Add Photos</span>
              </div>
              <input
                #imageInput
                type="file"
                accept="image/*"
                multiple
                (change)="onImagesSelected($event)"
                style="display: none">
              <div class="selected-images" *ngIf="selectedImages.length > 0">
                <div *ngFor="let image of selectedImages; let i = index" class="image-preview">
                  <img [src]="image.preview" alt="Review image">
                  <button type="button" (click)="removeImage(i)">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="form-actions">
            <button type="button" class="cancel-btn" (click)="closeReviewForm()">Cancel</button>
            <button type="submit" class="submit-btn" [disabled]="!reviewForm.valid || isSubmitting">
              <span *ngIf="!isSubmitting">Submit Review</span>
              <span *ngIf="isSubmitting">
                <ion-spinner name="crescent"></ion-spinner>
                Submitting...
              </span>
            </button>
          </div>
        </form>
      </div>

      <!-- Reviews List -->
      <div class="reviews-list">
        <div class="reviews-header">
          <h4>Customer Reviews</h4>
          <div class="sort-options">
            <select [(ngModel)]="sortBy" (change)="loadReviews()">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="helpful">Most Helpful</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        <div class="reviews-container">
          <div *ngFor="let review of reviews" class="review-item">
            <!-- Review Header -->
            <div class="review-header">
              <div class="reviewer-info">
                <img [src]="review.user?.avatar || (apiUrl + '/uploads/avatars/default-avatar.svg')" alt="Reviewer" class="reviewer-avatar">
                <div class="reviewer-details">
                  <span class="reviewer-name">{{ review.user?.username || 'Anonymous' }}</span>
                  <div class="review-meta">
                    <div class="review-rating">
                      <span *ngFor="let star of [1,2,3,4,5]" class="star" [class.filled]="star <= review.rating">
                        <i class="fas fa-star"></i>
                      </span>
                    </div>
                    <span class="review-date">{{ formatDate(review.createdAt) }}</span>
                    <span class="verified-badge" *ngIf="review.isVerifiedPurchase">
                      <i class="fas fa-check-circle"></i>
                      Verified Purchase
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Review Content -->
            <div class="review-content">
              <h5 class="review-title">{{ review.title }}</h5>
              <p class="review-text">{{ review.comment }}</p>

              <!-- Review Images -->
              <div class="review-images" *ngIf="review.images && review.images.length > 0">
                <div *ngFor="let image of review.images" class="review-image">
                  <img [src]="image" alt="Review image" (click)="openImageModal(image)">
                </div>
              </div>
            </div>

            <!-- Review Actions -->
            <div class="review-actions">
              <button class="action-btn helpful-btn" (click)="markHelpful(review)" [class.marked]="review.userHelpful">
                <i class="fas fa-thumbs-up"></i>
                Helpful ({{ review.helpful }})
              </button>
              <button class="action-btn report-btn" (click)="reportReview(review)">
                <i class="fas fa-flag"></i>
                Report
              </button>
            </div>
          </div>

          <!-- Load More -->
          <div class="load-more" *ngIf="hasMoreReviews">
            <button class="load-more-btn" (click)="loadMoreReviews()" [disabled]="isLoading">
              <span *ngIf="!isLoading">Load More Reviews</span>
              <span *ngIf="isLoading">
                <ion-spinner name="crescent"></ion-spinner>
                Loading...
              </span>
            </button>
          </div>

          <!-- No Reviews -->
          <div class="no-reviews" *ngIf="reviews.length === 0 && !isLoading">
            <i class="fas fa-comments"></i>
            <h4>No reviews yet</h4>
            <p>Be the first to review this product!</p>
          </div>
        </div>
      </div>
    </div>
    `,
    styles: [`
    .product-reviews {
      max-width: 800px;
      margin: 0 auto;
    }

    /* Review Summary */
    .review-summary {
      background: #fff;
      border: 1px solid #e1e8ed;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }

    .rating-overview {
      display: flex;
      gap: 32px;
    }

    .average-rating {
      text-align: center;
      flex-shrink: 0;
    }

    .rating-number {
      font-size: 48px;
      font-weight: 700;
      color: #333;
      line-height: 1;
    }

    .stars {
      margin: 8px 0;
    }

    .star {
      color: #ddd;
      font-size: 18px;
      margin: 0 2px;
    }

    .star.filled {
      color: #ffb400;
    }

    .total-reviews {
      color: #666;
      font-size: 14px;
    }

    .rating-breakdown {
      flex: 1;
    }

    .rating-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .rating-label {
      min-width: 60px;
      font-size: 14px;
      color: #666;
    }

    .progress-bar {
      flex: 1;
      height: 8px;
      background: #f0f0f0;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: #ffb400;
      border-radius: 4px;
    }

    .rating-count {
      min-width: 30px;
      text-align: right;
      font-size: 14px;
      color: #666;
    }

    /* Write Review Section */
    .write-review-section {
      margin-bottom: 24px;
    }

    .write-review-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .write-review-btn:hover {
      background: #0056b3;
    }

    /* Review Form */
    .review-form {
      background: #fff;
      border: 1px solid #e1e8ed;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }

    .form-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    .form-header h4 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .close-form {
      background: none;
      border: none;
      color: #8e8e8e;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
    }

    .close-form:hover {
      background: #f8f9fa;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
    }

    .rating-input {
      display: flex;
      gap: 4px;
    }

    .star-input {
      font-size: 24px;
      color: #ddd;
      cursor: pointer;
      transition: color 0.2s ease;
    }

    .star-input.selected {
      color: #ffb400;
    }

    .form-input, .form-textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
    }

    .form-input:focus, .form-textarea:focus {
      outline: none;
      border-color: #007bff;
    }

    .image-upload {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .upload-area {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border: 2px dashed #ddd;
      border-radius: 6px;
      cursor: pointer;
      transition: border-color 0.2s ease;
    }

    .upload-area:hover {
      border-color: #007bff;
    }

    .selected-images {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .image-preview {
      position: relative;
      width: 80px;
      height: 80px;
      border-radius: 6px;
      overflow: hidden;
    }

    .image-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-preview button {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 10px;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .cancel-btn {
      padding: 10px 20px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 6px;
      cursor: pointer;
    }

    .submit-btn {
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Reviews List */
    .reviews-list {
      background: #fff;
      border: 1px solid #e1e8ed;
      border-radius: 12px;
      overflow: hidden;
    }

    .reviews-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid #f8f9fa;
    }

    .reviews-header h4 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .sort-options select {
      padding: 6px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      background: white;
    }

    .reviews-container {
      padding: 0 24px 24px;
    }

    .review-item {
      padding: 24px 0;
      border-bottom: 1px solid #f8f9fa;
    }

    .review-item:last-child {
      border-bottom: none;
    }

    .review-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }

    .reviewer-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .reviewer-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    .reviewer-details {
      flex: 1;
    }

    .reviewer-name {
      font-weight: 600;
      color: #333;
      display: block;
    }

    .review-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 4px;
      font-size: 14px;
      color: #666;
    }

    .verified-badge {
      color: #28a745;
      font-size: 12px;
    }

    .review-content {
      margin-bottom: 16px;
    }

    .review-title {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .review-text {
      margin: 0;
      color: #555;
      line-height: 1.5;
    }

    .review-images {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      flex-wrap: wrap;
    }

    .review-image {
      width: 80px;
      height: 80px;
      border-radius: 6px;
      overflow: hidden;
      cursor: pointer;
    }

    .review-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.2s ease;
    }

    .review-image:hover img {
      transform: scale(1.05);
    }

    .review-actions {
      display: flex;
      gap: 16px;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: none;
      border: 1px solid #ddd;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s ease;
    }

    .action-btn:hover {
      background: #f8f9fa;
    }

    .helpful-btn.marked {
      background: #e3f2fd;
      border-color: #2196f3;
      color: #2196f3;
    }

    .load-more {
      text-align: center;
      padding: 24px 0;
    }

    .load-more-btn {
      padding: 12px 24px;
      background: #f8f9fa;
      border: 1px solid #ddd;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .load-more-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .no-reviews {
      text-align: center;
      padding: 48px 24px;
      color: #666;
    }

    .no-reviews i {
      font-size: 48px;
      margin-bottom: 16px;
      display: block;
    }

    .no-reviews h4 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .no-reviews p {
      margin: 0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .rating-overview {
        flex-direction: column;
        gap: 24px;
      }

      .reviews-header {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
      }

      .review-meta {
        flex-wrap: wrap;
      }

      .review-actions {
        flex-direction: column;
      }
    }
    `]
})
export class ProductReviewsComponent implements OnInit, OnDestroy {
  @Input() productId!: string;

  apiUrl = environment.apiUrl;

  reviews: Review[] = [];
  reviewStats: ReviewStats | null = null;
  currentUser: any = null;
  canReview = false;
  hasReviewed = false;
  showReviewForm = false;
  isLoading = false;
  hasMoreReviews = true;
  currentPage = 1;
  sortBy: 'newest' | 'oldest' | 'helpful' | 'rating' = 'newest';

  // Review form
  newReview: CreateReviewRequest = {
    productId: '',
    rating: 0,
    title: '',
    comment: ''
  };
  selectedImages: Array<{ file: File; preview: string }> = [];
  isSubmitting = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.newReview.productId = this.productId;

    // Subscribe to current user
    this.subscriptions.push(
      this.authService.currentUser$.subscribe((user: any) => {
        this.currentUser = user;
        if (user) {
          this.checkReviewEligibility();
        }
      })
    );

    this.loadReviewStats();
    this.loadReviews();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private checkReviewEligibility() {
    this.reviewService.canReviewProduct(this.productId).subscribe({
      next: (response: any) => {
        this.canReview = response.canReview;
        this.hasReviewed = response.hasReviewed;
        console.log('📝 Review eligibility checked:', { canReview: this.canReview, hasReviewed: this.hasReviewed });
      },
      error: (error: any) => {
        console.error('❌ Error checking review eligibility:', error);
      }
    });
  }

  private loadReviewStats() {
    this.reviewService.getProductReviewStats(this.productId).subscribe({
      next: (stats: ReviewStats) => {
        this.reviewStats = stats;
        console.log('📊 Review stats loaded:', stats);
      },
      error: (error: any) => {
        console.error('❌ Error loading review stats:', error);
      }
    });
  }

  loadReviews() {
    this.isLoading = true;
    this.currentPage = 1;

    this.reviewService.getProductReviews(this.productId, 1, 10, this.sortBy).subscribe({
      next: (response: any) => {
        this.reviews = response.reviews;
        this.hasMoreReviews = response.reviews.length === 10;
        this.isLoading = false;
        console.log('📝 Reviews loaded:', this.reviews.length);
      },
      error: (error: any) => {
        console.error('❌ Error loading reviews:', error);
        this.isLoading = false;
      }
    });
  }

  loadMoreReviews() {
    if (this.isLoading || !this.hasMoreReviews) return;

    this.isLoading = true;
    this.currentPage++;

    this.reviewService.getProductReviews(this.productId, this.currentPage, 10, this.sortBy).subscribe({
      next: (response: any) => {
        this.reviews = [...this.reviews, ...response.reviews];
        this.hasMoreReviews = response.reviews.length === 10;
        this.isLoading = false;
        console.log('📝 More reviews loaded, total:', this.reviews.length);
      },
      error: (error: any) => {
        console.error('❌ Error loading more reviews:', error);
        this.isLoading = false;
      }
    });
  }

  openReviewForm() {
    this.showReviewForm = true;
    console.log('📝 Review form opened');
  }

  closeReviewForm() {
    this.showReviewForm = false;
    this.resetReviewForm();
    console.log('📝 Review form closed');
  }

  setRating(rating: number) {
    this.newReview.rating = rating;
  }

  onImagesSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImages.push({
          file,
          preview: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    });
    console.log('🖼️ Images selected for review:', files.length);
  }

  removeImage(index: number) {
    this.selectedImages.splice(index, 1);
    console.log('🖼️ Image removed from review');
  }

  submitReview() {
    if (this.newReview.rating === 0 || !this.newReview.title.trim() || !this.newReview.comment.trim()) {
      this.notificationService.error('Incomplete review', 'Please fill in all required fields.');
      return;
    }

    this.isSubmitting = true;
    console.log('📤 Submitting review...');

    // Prepare review data
    const reviewData: CreateReviewRequest = {
      ...this.newReview,
      images: this.selectedImages.map(img => img.preview) // In real implementation, upload images first
    };

    this.reviewService.createReview(reviewData).subscribe({
      next: (response: any) => {
        console.log('✅ Review submitted:', response.review._id);
        this.notificationService.success('Review submitted!', 'Thank you for your feedback.');
        this.closeReviewForm();
        this.loadReviews(); // Reload reviews
        this.loadReviewStats(); // Reload stats
        this.hasReviewed = true;
      },
      error: (error: any) => {
        console.error('❌ Error submitting review:', error);
        this.notificationService.error('Failed to submit review', 'Please try again.');
        this.isSubmitting = false;
      }
    });
  }

  private resetReviewForm() {
    this.newReview = {
      productId: this.productId,
      rating: 0,
      title: '',
      comment: ''
    };
    this.selectedImages = [];
    this.isSubmitting = false;
  }

  markHelpful(review: Review) {
    this.reviewService.markHelpful(review._id).subscribe({
      next: (response: any) => {
        review.helpful = response.helpfulCount;
        review.userHelpful = true;
        console.log('👍 Review marked as helpful');
      },
      error: (error: any) => {
        console.error('❌ Error marking review as helpful:', error);
      }
    });
  }

  reportReview(review: Review) {
    const reason = prompt('Why are you reporting this review?');
    if (reason) {
      this.reviewService.reportReview(review._id, reason).subscribe({
        next: () => {
          this.notificationService.success('Review reported', 'Thank you for your feedback.');
          console.log('🚩 Review reported');
        },
        error: (error: any) => {
          console.error('❌ Error reporting review:', error);
          this.notificationService.error('Failed to report review', 'Please try again.');
        }
      });
    }
  }

  openImageModal(imageUrl: string) {
    // TODO: Implement image modal
    console.log('🖼️ Opening image modal:', imageUrl);
  }

  getRatingPercentage(rating: number): number {
    if (!this.reviewStats) return 0;
    const total = this.reviewStats.totalReviews;
    return total > 0 ? (this.reviewStats.ratingDistribution[rating as keyof typeof this.reviewStats.ratingDistribution] / total) * 100 : 0;
  }

  formatDate(date: Date | string): string {
    const now = new Date();
    const reviewDate = new Date(date);
    const diffInDays = Math.floor((now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  }
}