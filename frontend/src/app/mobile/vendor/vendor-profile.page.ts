/**
 * 🛍️ Vendor Profile Component
 * Display seller info, products, ratings, and follow/contact options
 */

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, ActionSheetController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

interface Vendor {
  id: string;
  name: string;
  logo: string;
  coverImage: string;
  description: string;
  rating: number;
  reviewCount: number;
  productCount: number;
  followerCount: number;
  followersYouKnow?: number;
  phoneNumber: string;
  email: string;
  address: string;
  website?: string;
  established: string;
  isFollowing: boolean;
  isVerified: boolean;
  responseTime: string;
  shippingTime: string;
  returnPolicy: string;
  policies?: {
    qualityGuarantee: boolean;
    easyReturn: boolean;
    securePayment: boolean;
  };
}

interface VendorProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  inStock: number;
}

@Component({
  selector: 'app-vendor-profile',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="goBack()">
            <ion-icon name="arrow-back"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Seller Profile</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="openMenu()">
            <ion-icon name="ellipsis-vertical"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="vendor-content">
      <!-- Cover Image -->
      <div class="cover-section" *ngIf="vendor">
        <img [src]="getImageUrl(vendor.coverImage)" class="cover-image" />
      </div>

      <!-- Vendor Info Card -->
      <div class="vendor-card" *ngIf="vendor">
        <div class="vendor-header">
          <img [src]="getImageUrl(vendor.logo)" class="vendor-logo" />
          <div class="vendor-title">
            <h2>{{ vendor.name }}</h2>
            <div class="verified" *ngIf="vendor.isVerified">
              <ion-icon name="checkmark-circle"></ion-icon>
              <span>Verified Seller</span>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="stats-grid">
          <div class="stat">
            <p class="stat-value">{{ vendor.rating }}</p>
            <p class="stat-label">
              <ion-icon name="star"></ion-icon>
              Rating
            </p>
          </div>
          <div class="stat">
            <p class="stat-value">{{ vendor.reviewCount }}</p>
            <p class="stat-label">Reviews</p>
          </div>
          <div class="stat">
            <p class="stat-value">{{ vendor.productCount }}+</p>
            <p class="stat-label">Products</p>
          </div>
          <div class="stat">
            <p class="stat-value">{{ formatNumber(vendor.followerCount) }}</p>
            <p class="stat-label">Followers</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <ion-button
            expand="block"
            [color]="vendor.isFollowing ? 'medium' : 'primary'"
            (click)="toggleFollow()"
          >
            <ion-icon [name]="vendor.isFollowing ? 'checkmark' : 'add'" slot="start"></ion-icon>
            {{ vendor.isFollowing ? 'Following' : 'Follow' }}
          </ion-button>
          <ion-button
            expand="block"
            fill="outline"
            (click)="contactSeller()"
          >
            <ion-icon name="chatbubble" slot="start"></ion-icon>
            Contact
          </ion-button>
          <ion-button
            expand="block"
            fill="outline"
            (click)="visitWebsite()"
            *ngIf="vendor.website"
          >
            <ion-icon name="open" slot="start"></ion-icon>
            Visit Website
          </ion-button>
        </div>

        <!-- Description -->
        <div class="description">
          <p>{{ vendor.description }}</p>
        </div>
      </div>

      <!-- Trust & Policies -->
      <div class="trust-section" *ngIf="vendor">
        <h3>Why Trust This Seller</h3>
        <div class="trust-items">
          <div class="trust-item" *ngIf="vendor.policies?.qualityGuarantee">
            <ion-icon name="checkmark-circle"></ion-icon>
            <div>
              <p class="trust-title">Quality Guarantee</p>
              <p class="trust-desc">100% authentic products guaranteed</p>
            </div>
          </div>
          <div class="trust-item" *ngIf="vendor.policies?.easyReturn">
            <ion-icon name="repeat"></ion-icon>
            <div>
              <p class="trust-title">Easy Returns</p>
              <p class="trust-desc">{{ vendor.returnPolicy }}</p>
            </div>
          </div>
          <div class="trust-item" *ngIf="vendor.policies?.securePayment">
            <ion-icon name="shield-checkmark"></ion-icon>
            <div>
              <p class="trust-title">Secure Payment</p>
              <p class="trust-desc">Encrypted & protected transactions</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Seller Details -->
      <div class="details-section" *ngIf="vendor">
        <h3>Seller Details</h3>

        <div class="detail-item">
          <span class="detail-label">Joined</span>
          <span class="detail-value">{{ formatDate(vendor.established) }}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">Response Time</span>
          <span class="detail-value">{{ vendor.responseTime }}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">Shipping Time</span>
          <span class="detail-value">{{ vendor.shippingTime }}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">Location</span>
          <span class="detail-value">{{ vendor.address }}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">Contact</span>
          <div class="contact-links">
            <ion-button fill="clear" size="small" (click)="callSeller()">
              <ion-icon name="call" slot="start"></ion-icon>
              {{ vendor.phoneNumber }}
            </ion-button>
            <ion-button fill="clear" size="small" (click)="emailSeller()">
              <ion-icon name="mail" slot="start"></ion-icon>
              Email
            </ion-button>
          </div>
        </div>
      </div>

      <!-- Recent Reviews -->
      <div class="reviews-section" *ngIf="vendorReviews.length > 0">
        <h3>Customer Reviews</h3>

        <div *ngFor="let review of vendorReviews.slice(0, 3)" class="review-item">
          <div class="review-header">
            <p class="reviewer-name">{{ review.reviewerName }}</p>
            <div class="rating">
              <ion-icon *ngFor="let i of [1,2,3,4,5]" 
                name="star"
                [class.filled]="i <= review.rating">
              </ion-icon>
            </div>
          </div>
          <p class="review-title">{{ review.title }}</p>
          <p class="review-text">{{ review.comment }}</p>
          <p class="review-date">{{ formatDate(review.createdAt) }}</p>
        </div>
      </div>

      <!-- Products -->
      <div class="products-section" *ngIf="vendorProducts.length > 0">
        <h3>Featured Products</h3>
        <div class="products-grid">
          <div
            *ngFor="let product of vendorProducts"
            class="product-card"
            (click)="viewProduct(product)"
          >
            <div class="product-image">
              <img [src]="getImageUrl(product.image) || getProductPlaceholder()" />
              <div *ngIf="product.originalPrice" class="discount-badge">
                {{ calculateDiscount(product.price, product.originalPrice) }}% OFF
              </div>
            </div>
            <div class="product-info">
              <p class="product-name">{{ product.name }}</p>
              <div class="rating">
                <ion-icon name="star" class="filled"></ion-icon>
                <span class="rating-value">{{ product.rating }}</span>
                <span class="review-count">({{ product.reviewCount }})</span>
              </div>
              <div class="price-section">
                <span class="price">₹{{ product.price }}</span>
                <span class="original-price" *ngIf="product.originalPrice">
                  ₹{{ product.originalPrice }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <ion-button
          expand="block"
          fill="outline"
          (click)="viewAllProducts()"
          class="view-all-btn"
        >
          View All {{ vendor?.productCount }} Products
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    .vendor-content {
      --background: #f9f9f9;
    }

    .cover-section {
      position: relative;
      height: 120px;
      overflow: hidden;
      background: #ddd;
    }

    .cover-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .vendor-card {
      background: white;
      margin: -40px 12px 12px 12px;
      border-radius: 8px;
      padding: 16px;
      position: relative;
      z-index: 10;
      border: 1px solid #eee;
    }

    .vendor-header {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      align-items: flex-start;
    }

    .vendor-logo {
      width: 70px;
      height: 70px;
      border-radius: 8px;
      object-fit: cover;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .vendor-title h2 {
      font-size: 16px;
      font-weight: bold;
      margin: 4px 0;
    }

    .verified {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: var(--ion-color-success);
    }

    .verified ion-icon {
      font-size: 14px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin: 16px 0;
      padding: 12px;
      background: #f9f9f9;
      border-radius: 6px;
      text-align: center;
    }

    .stat-value {
      font-size: 14px;
      font-weight: bold;
      margin: 0;
      color: #333;
    }

    .stat-label {
      font-size: 10px;
      color: #999;
      margin: 4px 0 0 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2px;
    }

    .stat-label ion-icon {
      font-size: 12px;
      color: var(--ion-color-warning);
    }

    .action-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin: 16px 0;
    }

    .action-buttons ion-button {
      margin: 0;
      --border-radius: 6px;
    }

    .action-buttons ion-button:nth-child(3) {
      grid-column: 1 / -1;
    }

    .description {
      padding: 12px 0;
      border-top: 1px solid #eee;
      margin-top: 12px;
    }

    .description p {
      font-size: 13px;
      color: #666;
      line-height: 1.5;
      margin: 0;
    }

    /* Trust Section */
    .trust-section,
    .details-section,
    .reviews-section,
    .products-section {
      background: white;
      margin: 12px;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #eee;
    }

    .trust-section h3,
    .details-section h3,
    .reviews-section h3,
    .products-section h3 {
      font-size: 14px;
      font-weight: bold;
      margin: 0 0 12px 0;
    }

    .trust-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .trust-item {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .trust-item ion-icon {
      font-size: 20px;
      color: var(--ion-color-success);
      margin-top: 2px;
      flex-shrink: 0;
    }

    .trust-title {
      font-size: 12px;
      font-weight: bold;
      margin: 0 0 2px 0;
    }

    .trust-desc {
      font-size: 11px;
      color: #999;
      margin: 0;
    }

    /* Details Section */
    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
      font-size: 12px;
    }

    .detail-item:last-child {
      border-bottom: none;
    }

    .detail-label {
      color: #999;
      font-weight: 500;
    }

    .detail-value {
      color: #333;
      font-weight: bold;
    }

    .contact-links {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .contact-links ion-button {
      --padding-start: 6px;
      --padding-end: 6px;
    }

    /* Reviews Section */
    .review-item {
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f0f0f0;
    }

    .review-item:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .reviewer-name {
      font-size: 12px;
      font-weight: bold;
      margin: 0;
    }

    .rating {
      display: flex;
      gap: 2px;
    }

    .rating ion-icon {
      font-size: 12px;
      color: #ddd;
    }

    .rating ion-icon.filled {
      color: var(--ion-color-warning);
    }

    .review-title {
      font-size: 12px;
      font-weight: bold;
      margin: 4px 0;
      color: #333;
    }

    .review-text {
      font-size: 11px;
      color: #666;
      margin: 4px 0;
      line-height: 1.4;
    }

    .review-date {
      font-size: 10px;
      color: #999;
      margin: 4px 0 0 0;
    }

    /* Products Section */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }

    .product-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .product-card:active {
      transform: scale(0.98);
    }

    .product-image {
      position: relative;
      aspect-ratio: 1;
      border-radius: 6px;
      overflow: hidden;
      background: #f0f0f0;
      margin-bottom: 8px;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .discount-badge {
      position: absolute;
      top: 4px;
      right: 4px;
      background: var(--ion-color-danger);
      color: white;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 9px;
      font-weight: bold;
    }

    .product-info {
      padding: 0 4px;
    }

    .product-name {
      font-size: 11px;
      margin: 0 0 4px 0;
      color: #333;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .rating-value {
      font-size: 10px;
      font-weight: bold;
      margin-left: 2px;
    }

    .review-count {
      font-size: 9px;
      color: #999;
      margin-left: 2px;
    }

    .price-section {
      display: flex;
      gap: 6px;
      margin-top: 4px;
      align-items: center;
    }

    .price {
      font-size: 12px;
      font-weight: bold;
      color: #333;
    }

    .original-price {
      font-size: 10px;
      color: #999;
      text-decoration: line-through;
    }

    .view-all-btn {
      margin-top: 8px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VendorProfilePageComponent implements OnInit, OnDestroy {
  vendor: Vendor | null = null;
  vendorProducts: VendorProduct[] = [];
  vendorReviews: any[] = [];
  isLoading: boolean = true;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private toastController: ToastController,
    private actionSheet: ActionSheetController
  ) {}

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.loadVendorProfile(params['id']);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadVendorProfile(vendorId: string) {
    this.http.get(`/api/vendors/${vendorId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.vendor = response.data;
          this.loadVendorProducts(vendorId);
          this.loadVendorReviews(vendorId);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load vendor:', error);
          this.isLoading = false;
          this.showToast('Failed to load vendor profile', 'danger');
        }
      });
  }

  loadVendorProducts(vendorId: string) {
    this.http.get(`/api/vendors/${vendorId}/products?limit=6`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.vendorProducts = response.data || [];
        },
        error: (error) => console.error('Failed to load vendor products:', error)
      });
  }

  loadVendorReviews(vendorId: string) {
    this.http.get(`/api/vendors/${vendorId}/reviews?limit=5`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.vendorReviews = response.data || [];
        },
        error: (error) => console.error('Failed to load vendor reviews:', error)
      });
  }

  /**
   * Properly construct image URLs with API base URL for relative paths
   */
  getImageUrl(imagePath: string | undefined): string {
    if (!imagePath) {
      return this.getProductPlaceholder();
    }

    // If it's already an absolute URL, return as-is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // If it's a relative path, prepend the API URL
    if (imagePath.startsWith('/')) {
      return environment.apiUrl + imagePath;
    }

    // Default fallback
    return this.getProductPlaceholder();
  }

  /**
   * Get product placeholder image
   */
  getProductPlaceholder(): string {
    return environment.apiUrl + '/uploads/products/placeholder-product.png';
  }

  toggleFollow() {
    if (!this.vendor) return;

    const endpoint = this.vendor.isFollowing ? 'unfollow' : 'follow';
    this.http.post(`/api/vendors/${this.vendor.id}/${endpoint}`, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.vendor!.isFollowing = !this.vendor!.isFollowing;
          const message = this.vendor?.isFollowing ? 'Following seller' : 'Unfollowed seller';
          this.showToast(message, 'success');
        },
        error: (error) => {
          console.error('Failed to toggle follow:', error);
          this.showToast('Failed to update', 'danger');
        }
      });
  }

  contactSeller() {
    if (!this.vendor) return;
    this.router.navigate(['/tabs/messages'], { state: { vendorId: this.vendor.id } });
  }

  callSeller() {
    if (this.vendor?.phoneNumber) {
      window.location.href = `tel:${this.vendor.phoneNumber}`;
    }
  }

  emailSeller() {
    if (this.vendor?.email) {
      window.location.href = `mailto:${this.vendor.email}`;
    }
  }

  visitWebsite() {
    if (this.vendor?.website) {
      window.open(this.vendor.website, '_blank');
    }
  }

  viewProduct(product: VendorProduct) {
    this.router.navigate(['/tabs/product', product.id]);
  }

  viewAllProducts() {
    if (this.vendor) {
      this.router.navigate(['/tabs/vendor', this.vendor.id, 'products']);
    }
  }

  openMenu() {
    console.log('🔧 Open menu');
  }

  goBack() {
    this.router.navigate(['/tabs/shop']);
  }

  formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  calculateDiscount(price: number, originalPrice: number): number {
    return Math.round(((originalPrice - price) / originalPrice) * 100);
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
