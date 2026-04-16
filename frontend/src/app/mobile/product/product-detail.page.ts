/**
 * 🛍️ Product Detail Page Component
 * Complete product view with images, reviews, ratings, and related products
 */

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  category: string;
  brand: string;
  vendorId: string;
  vendorName: string;
  vendorRating: number;
  stock: number;
  size?: string[];
  colors?: { name: string; images: string[] }[];
  tags: string[];
  reviews: Review[];
  relatedProducts: Product[];
  specifications: { key: string; value: string }[];
  returnPolicy: String;
  warranty?: string;
  shipping: {
    free: boolean;
    cost?: number;
    estimatedDays: number;
  };
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  helpful: number;
  notHelpful: number;
  verified: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-product-detail',
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
        <ion-buttons slot="end">
          <ion-button (click)="toggleWishlist()">
            <ion-icon [name]="isWishlisted ? 'heart' : 'heart-outline'" color="danger"></ion-icon>
          </ion-button>
          <ion-button (click)="shareProduct()">
            <ion-icon name="share-social"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content *ngIf="!isLoading && product" class="product-detail-content">
      <!-- Image Carousel -->
      <div class="image-carousel">
        <img [src]="selectedImage" class="main-image" />

        <!-- Discount Badge -->
        <div *ngIf="product.discount" class="discount-badge">
          {{ product.discount }}% OFF
        </div>

        <!-- Thumbnail Strip -->
        <div class="thumbnail-strip">
          <img
            *ngFor="let img of product.images"
            [src]="img"
            (click)="selectedImage = img"
            class="thumbnail"
            [class.active]="selectedImage === img"
          />
        </div>
      </div>

      <!-- Product Info Section -->
      <div class="product-info">
        <!-- Brand & Name -->
        <p class="brand">{{ product.brand }}</p>
        <h1 class="product-name">{{ product.name }}</h1>

        <!-- Rating -->
        <div class="rating-section">
          <div class="rating-stars">
            <ion-icon
              *ngFor="let star of [1, 2, 3, 4, 5]"
              [name]="star <= product.rating ? 'star' : 'star-outline'"
              [class.filled]="star <= product.rating"
            ></ion-icon>
          </div>
          <p class="rating-text">
            {{ product.rating }} ({{ product.reviewCount }} reviews)
          </p>
        </div>

        <!-- Price Section -->
        <div class="price-section">
          <div class="price-display">
            <span class="current-price">₹{{ product.price }}</span>
            <span *ngIf="product.originalPrice" class="original-price">
              ₹{{ product.originalPrice }}
            </span>
          </div>
          <p class="savings" *ngIf="product.originalPrice">
            Save ₹{{ product.originalPrice - product.price }}
          </p>
        </div>

        <!-- Vendor Info -->
        <div class="vendor-section">
          <div class="vendor-info">
            <h4>Sold by {{ product.vendorName }}</h4>
            <div class="vendor-rating">
              <ion-icon name="star" class="filled"></ion-icon>
              <span>{{ product.vendorRating }}/5</span>
            </div>
          </div>
          <ion-button fill="outline" size="small" (click)="viewVendor()">
            Visit Store
          </ion-button>
        </div>

        <!-- Size Selection -->
        <div *ngIf="product.size && product.size.length > 0" class="size-section">
          <h3>Size</h3>
          <div class="size-options">
            <button
              *ngFor="let size of product.size"
              (click)="selectedSize = size"
              [class.selected]="selectedSize === size"
              class="size-btn"
            >
              {{ size }}
            </button>
          </div>
        </div>

        <!-- Color Selection -->
        <div *ngIf="product.colors && product.colors.length > 0" class="color-section">
          <h3>Color</h3>
          <div class="color-options">
            <button
              *ngFor="let color of product.colors"
              (click)="selectedColor = color.name"
              [class.selected]="selectedColor === color.name"
              class="color-btn"
            >
              <img [src]="color.images[0]" [title]="color.name" />
            </button>
          </div>
        </div>

        <!-- Stock Status -->
        <div class="stock-status" [class.low-stock]="product.stock < 5">
          <ion-icon [name]="product.stock > 0 ? 'checkmark-circle' : 'close-circle'"></ion-icon>
          <span>
            {{ product.stock > 0
              ? product.stock < 5
                ? product.stock + ' items left'
                : 'In Stock'
              : 'Out of Stock' }}
          </span>
        </div>

        <!-- Shipping Info -->
        <div class="shipping-info">
          <ion-icon name="truck"></ion-icon>
          <div class="shipping-details">
            <p class="shipping-cost">
              {{ product.shipping.free ? 'Free Shipping' : '₹' + product.shipping.cost }}
            </p>
            <p class="shipping-time">
              Delivery in {{ product.shipping.estimatedDays }} days
            </p>
          </div>
        </div>

        <!-- Add to Cart & Buy Now -->
        <div class="action-buttons">
          <ion-button
            expand="block"
            fill="outline"
            (click)="addToCart()"
            [disabled]="product.stock === 0 || isAddingToCart"
          >
            <ion-icon name="bag-add" slot="start"></ion-icon>
            Add to Cart
          </ion-button>

          <ion-button
            expand="block"
            (click)="buyNow()"
            [disabled]="product.stock === 0 || isAddingToCart"
          >
            Buy Now
          </ion-button>
        </div>

        <!-- Highlights -->
        <div class="highlights">
          <h3>Highlights</h3>
          <ul>
            <li *ngFor="let tag of product.tags">
              <ion-icon name="checkmark"></ion-icon>
              {{ tag }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Description Tabs -->
      <ion-segment
        value="description"
        (ionChange)="currentTab = $event.detail.value || 'description'"
        class="product-tabs"
      >
        <ion-segment-button value="description">
          Description
        </ion-segment-button>
        <ion-segment-button value="specifications">
          Specifications
        </ion-segment-button>
        <ion-segment-button value="reviews">
          Reviews
        </ion-segment-button>
      </ion-segment>

      <!-- Description Tab -->
      <div *ngIf="currentTab === 'description'" class="tab-content">
        <div class="description-section">
          <h3>Product Description</h3>
          <p>{{ product.description }}</p>

          <div class="policies">
            <h4>Return Policy</h4>
            <p>{{ product.returnPolicy }}</p>

            <h4 *ngIf="product.warranty">Warranty</h4>
            <p *ngIf="product.warranty">{{ product.warranty }}</p>
          </div>
        </div>
      </div>

      <!-- Specifications Tab -->
      <div *ngIf="currentTab === 'specifications'" class="tab-content">
        <div class="specifications-section">
          <h3>Specifications</h3>
          <div class="spec-item" *ngFor="let spec of product.specifications">
            <span class="spec-key">{{ spec.key }}</span>
            <span class="spec-value">{{ spec.value }}</span>
          </div>
        </div>
      </div>

      <!-- Reviews Tab -->
      <div *ngIf="currentTab === 'reviews'" class="tab-content">
        <div class="reviews-section">
          <!-- Review Summary -->
          <div class="review-summary">
            <div class="rating-stats">
              <div class="rating-number">{{ product.rating }}</div>
              <div class="rating-stars-large">
                <ion-icon
                  *ngFor="let star of [1, 2, 3, 4, 5]"
                  [name]="star <= product.rating ? 'star' : 'star-outline'"
                  [class.filled]="star <= product.rating"
                ></ion-icon>
              </div>
              <p class="total-reviews">{{ product.reviewCount }} reviews</p>
            </div>

            <div class="rating-bars">
              <div class="rating-bar-item" *ngFor="let i of [5, 4, 3, 2, 1]">
                <span class="bar-label">{{ i }} ⭐</span>
                <div class="bar">
                  <div class="bar-fill" [style.width]="getPercentage(i) + '%'"></div>
                </div>
                <span class="bar-count">{{ getReviewCount(i) }}</span>
              </div>
            </div>
          </div>

          <!-- Write Review Button -->
          <ion-button expand="block" fill="outline" (click)="writeReview()">
            <ion-icon name="pencil" slot="start"></ion-icon>
            Write a Review
          </ion-button>

          <!-- Reviews List -->
          <div class="reviews-list">
            <div class="review-item" *ngFor="let review of product.reviews">
              <div class="review-header">
                <img [src]="review.userAvatar" class="reviewer-avatar" />
                <div class="reviewer-info">
                  <p class="reviewer-name">{{ review.userName }}</p>
                  <div class="review-rating">
                    <ion-icon
                      *ngFor="let star of [1, 2, 3, 4, 5]"
                      [name]="star <= review.rating ? 'star' : 'star-outline'"
                      [class.filled]="star <= review.rating"
                      class="small"
                    ></ion-icon>
                  </div>
                </div>
                <ion-badge *ngIf="review.verified" color="success">
                  ✓ Verified
                </ion-badge>
              </div>

              <h4 class="review-title">{{ review.title }}</h4>
              <p class="review-content">{{ review.content }}</p>

              <div *ngIf="review.images && review.images.length > 0" class="review-images">
                <img *ngFor="let img of review.images" [src]="img" class="review-image" />
              </div>

              <p class="review-time">{{ formatTime(review.createdAt) }}</p>

              <div class="review-actions">
                <button (click)="markHelpful(review)">
                  <ion-icon name="thumbs-up-outline"></ion-icon>
                  Helpful ({{ review.helpful }})
                </button>
                <button (click)="markNotHelpful(review)">
                  <ion-icon name="thumbs-down-outline"></ion-icon>
                  Not Helpful ({{ review.notHelpful }})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Products -->
      <div class="related-products">
        <h3>Related Products</h3>
        <div class="products-grid">
          <div
            *ngFor="let relatedProduct of product.relatedProducts.slice(0, 4)"
            class="product-card"
            (click)="viewProduct(relatedProduct.id)"
          >
            <div class="product-image">
              <img [src]="relatedProduct.images[0]" />
              <div *ngIf="relatedProduct.discount" class="discount-badge-small">
                {{ relatedProduct.discount }}%
              </div>
            </div>
            <p class="product-name-small">{{ relatedProduct.name }}</p>
            <div class="product-price-small">
              <span>₹{{ relatedProduct.price }}</span>
              <span *ngIf="relatedProduct.originalPrice" class="strikethrough">
                ₹{{ relatedProduct.originalPrice }}
              </span>
            </div>
            <div class="product-rating-small">
              <ion-icon name="star" class="filled"></ion-icon>
              <span>{{ relatedProduct.rating }} ({{ relatedProduct.reviewCount }})</span>
            </div>
          </div>
        </div>
      </div>
    </ion-content>

    <!-- Loading State -->
    <div *ngIf="isLoading" class="loading-state">
      <ion-spinner></ion-spinner>
    </div>
  `,
  styles: [`
    .product-detail-content {
      --background: #f9f9f9;
    }

    .image-carousel {
      position: relative;
      background: white;
      padding: 12px;
    }

    .main-image {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: 8px;
    }

    .discount-badge {
      position: absolute;
      top: 20px;
      right: 20px;
      background: #ff6b6b;
      color: white;
      padding: 8px 12px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 12px;
    }

    .thumbnail-strip {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      overflow-x: auto;
    }

    .thumbnail {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 6px;
      border: 2px solid transparent;
      cursor: pointer;
      flex-shrink: 0;
    }

    .thumbnail.active {
      border-color: var(--ion-color-primary);
    }

    .product-info {
      background: white;
      padding: 16px;
      margin-bottom: 12px;
    }

    .brand {
      font-size: 12px;
      color: #999;
      margin: 0 0 4px 0;
      text-transform: uppercase;
    }

    .product-name {
      font-size: 18px;
      font-weight: bold;
      margin: 0 0 12px 0;
      line-height: 1.4;
    }

    .rating-section {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .rating-stars {
      display: flex;
      gap: 2px;
    }

    .rating-stars ion-icon {
      font-size: 16px;
      color: #ddd;
    }

    .rating-stars ion-icon.filled {
      color: #ffc700;
    }

    .rating-text {
      font-size: 12px;
      color: #666;
      margin: 0;
    }

    .price-section {
      margin-bottom: 16px;
    }

    .price-display {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }

    .current-price {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }

    .original-price {
      font-size: 16px;
      color: #999;
      text-decoration: line-through;
    }

    .savings {
      font-size: 12px;
      color: #ff6b6b;
      margin: 4px 0 0 0;
    }

    .vendor-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: #f9f9f9;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .vendor-info h4 {
      font-size: 13px;
      margin: 0 0 4px 0;
    }

    .vendor-rating {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #666;
    }

    .vendor-rating ion-icon {
      font-size: 14px;
      color: #ffc700;
    }

    .size-section,
    .color-section {
      margin-bottom: 16px;
    }

    .size-section h3,
    .color-section h3 {
      font-size: 13px;
      font-weight: bold;
      margin: 0 0 8px 0;
    }

    .size-options,
    .color-options {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .size-btn {
      padding: 8px 16px;
      border: 1px solid #ddd;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
    }

    .size-btn:hover {
      border-color: var(--ion-color-primary);
    }

    .size-btn.selected {
      background: var(--ion-color-primary);
      color: white;
      border-color: var(--ion-color-primary);
    }

    .color-btn {
      width: 48px;
      height: 48px;
      padding: 0;
      border: 2px solid #ddd;
      border-radius: 6px;
      background: none;
      cursor: pointer;
      overflow: hidden;
    }

    .color-btn img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .color-btn.selected {
      border-color: var(--ion-color-primary);
    }

    .stock-status {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: #e8f5e9;
      border-radius: 6px;
      color: #31a24c;
      font-size: 13px;
      margin-bottom: 16px;
    }

    .stock-status.low-stock {
      background: #fff3e0;
      color: #f57c00;
    }

    .stock-status ion-icon {
      font-size: 18px;
    }

    .shipping-info {
      display: flex;
      gap: 12px;
      padding: 12px;
      background: #f0f8ff;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .shipping-info ion-icon {
      font-size: 20px;
      color: var(--ion-color-primary);
    }

    .shipping-details p {
      font-size: 12px;
      margin: 0;
    }

    .shipping-cost {
      font-weight: bold;
    }

    .shipping-time {
      color: #666;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }

    .action-buttons ion-button {
      flex: 1;
      margin: 0;
    }

    .highlights {
      background: #f9f9f9;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 12px;
    }

    .highlights h3 {
      font-size: 13px;
      margin: 0 0 8px 0;
      font-weight: bold;
    }

    .highlights ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .highlights li {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      padding: 4px 0;
      color: #666;
    }

    .highlights ion-icon {
      color: #31a24c;
      font-size: 16px;
    }

    .product-tabs {
      --background: white;
      margin: 12px 0;
    }

    .tab-content {
      background: white;
      padding: 16px;
      margin-bottom: 12px;
      border-radius: 8px;
    }

    .description-section h3,
    .specifications-section h3,
    .reviews-section h3 {
      font-size: 14px;
      font-weight: bold;
      margin: 0 0 12px 0;
    }

    .description-section p {
      font-size: 13px;
      line-height: 1.6;
      color: #666;
      margin-bottom: 16px;
    }

    .policies h4 {
      font-size: 12px;
      font-weight: bold;
      margin: 12px 0 6px 0;
    }

    .spec-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
      font-size: 12px;
    }

    .spec-key {
      font-weight: bold;
      color: #333;
    }

    .spec-value {
      color: #666;
    }

    .review-summary {
      background: #f9f9f9;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      display: flex;
      gap: 20px;
    }

    .rating-stats {
      text-align: center;
    }

    .rating-number {
      font-size: 32px;
      font-weight: bold;
      color: #333;
    }

    .rating-stars-large {
      display: flex;
      justify-content: center;
      gap: 2px;
      margin: 4px 0;
    }

    .rating-stars-large ion-icon {
      font-size: 18px;
      color: #ddd;
    }

    .rating-stars-large ion-icon.filled {
      color: #ffc700;
    }

    .total-reviews {
      font-size: 12px;
      color: #666;
      margin: 0;
    }

    .rating-bars {
      flex: 1;
    }

    .rating-bar-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 12px;
    }

    .bar-label {
      width: 30px;
    }

    .bar {
      flex: 1;
      height: 6px;
      background: #eee;
      border-radius: 3px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      background: #ffc700;
    }

    .bar-count {
      width: 30px;
      text-align: right;
    }

    .reviews-list {
      margin-top: 16px;
    }

    .review-item {
      padding: 12px;
      border-bottom: 1px solid #eee;
      margin-bottom: 12px;
    }

    .review-header {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
      align-items: flex-start;
    }

    .reviewer-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }

    .reviewer-info {
      flex: 1;
    }

    .reviewer-name {
      font-size: 12px;
      font-weight: bold;
      margin: 0 0 4px 0;
    }

    .review-rating {
      display: flex;
      gap: 2px;
    }

    .review-rating ion-icon {
      font-size: 12px;
      color: #ddd;
    }

    .review-rating ion-icon.filled {
      color: #ffc700;
    }

    .review-title {
      font-size: 13px;
      font-weight: bold;
      margin: 0 0 6px 0;
    }

    .review-content {
      font-size: 12px;
      color: #666;
      line-height: 1.5;
      margin: 0 0 8px 0;
    }

    .review-images {
      display: flex;
      gap: 6px;
      margin: 8px 0;
    }

    .review-image {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 4px;
    }

    .review-time {
      font-size: 11px;
      color: #999;
      margin: 6px 0;
    }

    .review-actions {
      display: flex;
      gap: 12px;
      margin-top: 8px;
    }

    .review-actions button {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
    }

    .review-actions ion-icon {
      font-size: 14px;
    }

    .related-products {
      background: white;
      padding: 16px;
      margin-bottom: 20px;
    }

    .related-products h3 {
      font-size: 14px;
      font-weight: bold;
      margin: 0 0 12px 0;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .product-card {
      cursor: pointer;
      transition: transform 0.2s;
    }

    .product-card:active {
      transform: scale(0.98);
    }

    .product-image {
      position: relative;
      aspect-ratio: 1;
      border-radius: 6px;
      overflow: hidden;
      background: #f9f9f9;
      margin-bottom: 6px;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .discount-badge-small {
      position: absolute;
      top: 6px;
      right: 6px;
      background: #ff6b6b;
      color: white;
      padding: 4px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: bold;
    }

    .product-name-small {
      font-size: 11px;
      margin: 0 0 4px 0;
      line-height: 1.3;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .product-price-small {
      font-size: 12px;
      font-weight: bold;
      color: #333;
      margin-bottom: 4px;
    }

    .strikethrough {
      color: #999;
      text-decoration: line-through;
      margin-left: 6px;
    }

    .product-rating-small {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: #666;
    }

    .product-rating-small ion-icon {
      font-size: 12px;
      color: #ffc700;
    }

    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailPageComponent implements OnInit, OnDestroy {
  @ViewChild('reviewsSection', { read: ElementRef }) reviewsSection!: ElementRef;

  product: Product | null = null;
  selectedImage: string = '';
  selectedSize: string = '';
  selectedColor: string = '';
  currentTab: string | any = 'description';
  isLoading: boolean = true;
  isAddingToCart: boolean = false;
  isWishlisted: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toastController: ToastController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.activatedRoute.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.loadProduct(params['id']);
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
          if (this.product?.images?.length) {
            this.selectedImage = this.product.images[0];
          }
          this.selectedSize = this.product?.size?.[0] || '';
          this.selectedColor = this.product?.colors?.[0]?.name || '';
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load product:', error);
          this.isLoading = false;
        }
      });
  }

  goBack() {
    this.router.navigate(['/tabs/shop']);
  }

  toggleWishlist() {
    this.isWishlisted = !this.isWishlisted;
    this.showToast(this.isWishlisted ? 'Added to Wishlist' : 'Removed from Wishlist');
  }

  shareProduct() {
    if (navigator.share && this.product) {
      navigator.share({
        title: this.product.name,
        text: this.product.description,
        url: window.location.href
      });
    }
  }

  addToCart() {
    if (!this.product) return;

    this.isAddingToCart = true;

    this.http.post('/api/cart/add', {
      productId: this.product.id,
      quantity: 1,
      size: this.selectedSize,
      color: this.selectedColor
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isAddingToCart = false;
          this.showToast('Added to cart!', 'success');
        },
        error: (error) => {
          console.error('Failed to add to cart:', error);
          this.isAddingToCart = false;
          this.showToast('Failed to add to cart', 'danger');
        }
      });
  }

  buyNow() {
    this.addToCart();
    setTimeout(() => {
      this.router.navigate(['/tabs/checkout']);
    }, 500);
  }

  viewVendor() {
    if (this.product) {
      this.router.navigate(['/vendor', this.product.vendorId]);
    }
  }

  viewProduct(productId: string) {
    this.router.navigate(['/product', productId]);
  }

  writeReview() {
    if (this.product) {
      this.router.navigate(['/review'], { state: { productId: this.product.id } });
    }
  }

  markHelpful(review: Review) {
    review.helpful++;
  }

  markNotHelpful(review: Review) {
    review.notHelpful++;
  }

  getPercentage(rating: number): number {
    if (!this.product) return 0;
    const count = this.getReviewCount(rating);
    return (count / this.product.reviewCount) * 100;
  }

  getReviewCount(rating: number): number {
    if (!this.product) return 0;
    return this.product.reviews.filter(r => r.rating === rating).length;
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
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
