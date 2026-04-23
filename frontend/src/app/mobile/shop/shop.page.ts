/**
 * 🛍️ Shop / Products Grid Component
 * Mobile-first product discovery and shopping
 */

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({
  selector: 'app-shop-page',
  standalone: true,
  imports: [CommonModule, IonicModule, ScrollingModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Shop</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="openFilters()">
            <ion-icon name="funnel" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      
      <!-- Search bar -->
      <ion-toolbar color="light">
        <ion-searchbar
          placeholder="Search products..."
          [(ngModel)]="searchQuery"
          (ionChange)="onSearch($event)"
          debounce="500"
        ></ion-searchbar>
      </ion-toolbar>

      <!-- Category horizontal scroll -->
      <ion-toolbar color="light" *ngIf="categories.length > 0" class="categories-scroll">
        <div class="category-chips">
          <ion-chip
            *ngFor="let cat of categories"
            [color]="selectedCategory === cat.id ? 'primary' : 'light'"
            (click)="filterByCategory(cat.id)"
          >
            {{ cat.name }}
          </ion-chip>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Loading -->
      <div *ngIf="isLoading" class="ion-text-center ion-padding">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <!-- Products Grid (Virtual Scrolling) -->
      <cdk-virtual-scroll-viewport
        [itemSize]="itemHeight"
        *ngIf="!isLoading"
        class="products-grid"
      >
        <div *cdkVirtualFor="let product of products" class="product-card-wrapper">
          <ion-card class="product-card" (click)="openProductDetail(product.id)">
            <!-- Image -->
            <div class="product-image-container">
              <img [src]="product.images?.[0]" class="product-image" />
              <div class="discount-badge" *ngIf="product.discount">
                -{{ product.discount }}%
              </div>
              
              <!-- Quick actions -->
              <div class="quick-actions">
                <ion-button
                  size="small"
                  shape="round"
                  (click)="toggleWishlist(product, $event)"
                  [color]="product.isWishlisted ? 'danger' : 'light'"
                >
                  <ion-icon
                    name="heart"
                    [fill]="product.isWishlisted ? 'solid' : 'outline'"
                  ></ion-icon>
                </ion-button>
              </div>
            </div>

            <!-- Info -->
            <ion-card-content class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              
              <!-- Rating -->
              <div class="rating" *ngIf="product.rating">
                <div class="stars">
                  <span *ngFor="let i of getStarArray(product.rating.average)">★</span>
                </div>
                <span class="rating-count">({{ product.rating.count || 0 }})</span>
              </div>

              <!-- Price -->
              <div class="price-section">
                <span class="current-price">₹{{ product.price | number: '1.0-0' }}</span>
                <span class="original-price" *ngIf="product.originalPrice">
                  ₹{{ product.originalPrice | number: '1.0-0' }}
                </span>
              </div>

              <!-- Brand -->
              <p class="brand" *ngIf="product.brand">{{ product.brand }}</p>
            </ion-card-content>

            <!-- Quick add to cart -->
            <ion-button
              expand="block"
              color="primary"
              (click)="quickAddToCart(product, $event)"
              class="add-to-cart-btn"
            >
              <ion-icon name="cart" slot="start"></ion-icon>
              {{ isInCart(product) ? 'Remove from Cart' : 'Add to Cart' }}
            </ion-button>
          </ion-card>
        </div>
      </cdk-virtual-scroll-viewport>

      <!-- Empty state -->
      <div *ngIf="products.length === 0 && !isLoading" class="empty-state">
        <ion-icon name="search" size="large"></ion-icon>
        <p>No products found</p>
      </div>

      <!-- Load more button -->
      <div class="load-more-container" *ngIf="hasMore && products.length > 0">
        <ion-button expand="block" fill="outline" (click)="loadMoreProducts()">
          Load More
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    ion-content {
      --background: #f9f9f9;
    }

    .categories-scroll {
      overflow-x: auto;
      padding: 0;
    }

    .category-chips {
      display: flex;
      gap: 8px;
      padding: 8px 16px;
      overflow-x: auto;
    }

    ion-chip {
      flex-shrink: 0;
    }

    .products-grid {
      height: 100%;
      width: 100%;
    }

    .product-card-wrapper {
      padding: 8px;
      display: inline-block;
      width: 50%;
    }

    .product-card {
      margin: 0;
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .product-card:active {
      transform: scale(0.98);
    }

    .product-image-container {
      position: relative;
      width: 100%;
      padding-bottom: 100%;
      overflow: hidden;
      background: #f0f0f0;
      border-radius: 8px;
    }

    .product-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .discount-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      background: #ff3b30;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }

    .quick-actions {
      position: absolute;
      top: 10px;
      left: 10px;
      display: flex;
      gap: 8px;
    }

    .product-info {
      padding: 12px 8px;
    }

    .product-name {
      font-size: 14px;
      font-weight: 600;
      line-height: 1.3;
      margin-bottom: 6px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 6px;
    }

    .stars {
      color: #ffc107;
      font-size: 12px;
    }

    .rating-count {
      font-size: 12px;
      color: #999;
    }

    .price-section {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 6px;
    }

    .current-price {
      font-size: 16px;
      font-weight: bold;
      color: #2e7d32;
    }

    .original-price {
      font-size: 12px;
      color: #999;
      text-decoration: line-through;
    }

    .brand {
      font-size: 12px;
      color: #666;
      margin: 0;
    }

    .add-to-cart-btn {
      font-size: 12px;
      height: 36px;
      margin-bottom: 8px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      color: #999;
    }

    .load-more-container {
      padding: 20px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShopPageComponent implements OnInit, OnDestroy {
  products: any[] = [];
  categories: any[] = [];
  
  searchQuery: string = '';
  selectedCategory: string | null = null;
  isLoading = true;
  hasMore = true;
  currentPage = 1;
  pageSize = 20;
  itemHeight = 280;

  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCategories() {
    this.http.get('/api/categories')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.categories = response.data || [];
        },
        error: (error) => console.error('Failed to load categories:', error)
      });
  }

  loadProducts() {
    let url = `/api/products?page=${this.currentPage}&limit=${this.pageSize}`;
    
    if (this.selectedCategory) {
      url += `&categoryId=${this.selectedCategory}`;
    }
    
    if (this.searchQuery) {
      url += `&search=${this.searchQuery}`;
    }

    this.http.get(url)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const nextProducts = (response.data || []).map((product: any) => ({
            ...product,
            isWishlisted: !!product?.id && this.wishlistService.isInWishlist(product.id)
          }));

          if (this.currentPage === 1) {
            this.products = nextProducts;
          } else {
            this.products = [...this.products, ...nextProducts];
          }
          this.hasMore = response.pagination?.hasMore || false;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load products:', error);
          this.isLoading = false;
        }
      });
  }

  onSearch(event: any) {
    this.currentPage = 1;
    this.loadProducts();
  }

  filterByCategory(categoryId: string) {
    this.selectedCategory = this.selectedCategory === categoryId ? null : categoryId;
    this.currentPage = 1;
    this.loadProducts();
  }

  loadMoreProducts() {
    this.currentPage++;
    this.loadProducts();
  }

  toggleWishlist(product: any, event: Event) {
    event.stopPropagation();
    const productId = product?.id;
    if (!productId) {
      return;
    }

    this.wishlistService.toggleWishlist(productId).subscribe({
      next: () => {
        product.isWishlisted = this.wishlistService.isInWishlist(productId);
        this.showToast(product.isWishlisted ? 'Added to wishlist' : 'Removed from wishlist', 'success');
      },
      error: (error) => {
        this.showToast(error?.status === 401 ? 'Please login to save items' : 'Something went wrong', 'danger');
      }
    });
  }

  quickAddToCart(product: any, event: Event) {
    event.stopPropagation();
    const productId = product.id || product._id;
    this.cartService.toggleCart(productId, { quantity: 1 }).subscribe({
      next: () => {
        this.showToast(this.cartService.isInCart(productId) ? 'Added to cart' : 'Removed from cart', 'success');
      },
      error: () => {
        this.showToast('Something went wrong', 'danger');
      }
    });
  }

  isInCart(product: any): boolean {
    const productId = product.id || product._id;
    return !!productId && this.cartService.isInCart(productId);
  }

  openProductDetail(productId: string) {
    this.router.navigate(['/products', productId]);
  }

  openFilters() {
    // TODO: Open filter modal
  }

  getStarArray(rating: number): any[] {
    return Array(Math.round(rating)).fill(0);
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
