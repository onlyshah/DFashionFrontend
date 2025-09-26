import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { EcommerceService } from '../../../../core/services/ecommerce.service';
import { AuthService } from '../../../../core/services/auth.service';

export interface Story {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  timestamp: Date;
  isViewed: boolean;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  caption: string;
  mediaUrls: string[];
  mediaType: 'image' | 'video' | 'carousel';
  likes: number;
  comments: number;
  timestamp: Date;
  isLiked: boolean;
  isSaved: boolean;
  location?: string;
  tags: string[];
}

export interface TrendingProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  brand: string;
  rating: number;
  isWishlisted: boolean;
}

@Component({
  selector: 'app-user-social-dashboard',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="user-social-dashboard" [class.mobile]="isMobile">
      
      <!-- Stories Section -->
      <div class="stories-section" *ngIf="hasFeature('stories')">
        <div class="stories-container">
          <!-- Add Story Button -->
          <div class="story-item add-story" (click)="createStory()">
            <div class="story-avatar">
              <img [src]="currentUser?.avatar || '/uploadsdefault-avatar.png'" 
                   [alt]="currentUser?.fullName">
              <div class="add-icon">
                <ion-icon name="add"></ion-icon>
              </div>
            </div>
            <span class="story-username">Your story</span>
          </div>

          <!-- User Stories -->
          <div class="story-item" 
               *ngFor="let story of stories" 
               (click)="viewStory(story)">
            <div class="story-avatar" [class.viewed]="story.isViewed">
              <img [src]="story.userAvatar" [alt]="story.username">
            </div>
            <span class="story-username">{{ story.username }}</span>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="main-content">
        
        <!-- Left Sidebar (Desktop only) -->
        <aside class="left-sidebar" *ngIf="!isMobile">
          <!-- User Profile Card -->
          <div class="profile-card">
            <div class="profile-header">
              <img [src]="currentUser?.avatar || '/uploadsdefault-avatar.png'" 
                   [alt]="currentUser?.fullName"
                   class="profile-avatar">
              <div class="profile-info">
                <h4>{{ currentUser?.fullName }}</h4>
                <p>{{ currentUser?.email }}</p>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions">
            <h6>Quick Actions</h6>
            <button class="action-btn" (click)="navigateToWishlist()" *ngIf="hasFeature('wishlist')">
              <ion-icon name="heart"></ion-icon>
              <span>Wishlist</span>
            </button>
            <button class="action-btn" (click)="navigateToCart()" *ngIf="hasFeature('cart')">
              <ion-icon name="bag"></ion-icon>
              <span>Shopping Cart</span>
            </button>
            <button class="action-btn" (click)="navigateToOrders()" *ngIf="hasFeature('orders')">
              <ion-icon name="receipt"></ion-icon>
              <span>My Orders</span>
            </button>
          </div>

          <!-- Trending Products -->
          <div class="trending-section" *ngIf="hasFeature('shopping')">
            <h6>Trending Now</h6>
            <div class="trending-products">
              <div class="trending-item" *ngFor="let product of trendingProducts">
                <img [src]="product.imageUrl" [alt]="product.name">
                <div class="product-info">
                  <h6>{{ product.name }}</h6>
                  <div class="price">
                    <span class="current-price">\${{ product.price }}</span>
                    <span class="original-price" *ngIf="product.originalPrice">
                      \${{ product.originalPrice }}
                    </span>
                  </div>
                </div>
                <button class="wishlist-btn" 
                        [class.active]="product.isWishlisted"
                        (click)="toggleWishlist(product)">
                  <ion-icon name="heart"></ion-icon>
                </button>
              </div>
            </div>
          </div>
        </aside>

        <!-- Feed Content -->
        <main class="feed-content">
          
          <!-- Create Post Section -->
          <div class="create-post-section" *ngIf="hasFeature('posts')">
            <div class="create-post-card">
              <div class="create-post-header">
                <img [src]="currentUser?.avatar || '/uploadsdefault-avatar.png'" 
                     [alt]="currentUser?.fullName"
                     class="user-avatar">
                <input type="text" 
                       placeholder="What's on your mind?" 
                       class="post-input"
                       (click)="createPost()">
              </div>
              <div class="create-post-actions">
                <button class="action-btn" (click)="createPost('image')">
                  <ion-icon name="image"></ion-icon>
                  <span>Photo</span>
                </button>
                <button class="action-btn" (click)="createPost('video')">
                  <ion-icon name="videocam"></ion-icon>
                  <span>Video</span>
                </button>
                <button class="action-btn" (click)="createPost('product')" *ngIf="isVendor">
                  <ion-icon name="storefront"></ion-icon>
                  <span>Product</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Posts Feed -->
          <div class="posts-feed" *ngIf="hasFeature('social-feed')">
            <div class="post-card" *ngFor="let post of posts">
              
              <!-- Post Header -->
              <div class="post-header">
                <div class="user-info">
                  <img [src]="post.userAvatar" [alt]="post.username" class="user-avatar">
                  <div class="user-details">
                    <h6>{{ post.username }}</h6>
                    <span class="post-time">{{ post.timestamp | date:'short' }}</span>
                    <span class="post-location" *ngIf="post.location">• {{ post.location }}</span>
                  </div>
                </div>
                <button class="more-btn">
                  <ion-icon name="ellipsis-horizontal"></ion-icon>
                </button>
              </div>

              <!-- Post Media -->
              <div class="post-media">
                <img *ngIf="post.mediaType === 'image'" 
                     [src]="post.mediaUrls[0]" 
                     [alt]="post.caption">
                
                <div *ngIf="post.mediaType === 'carousel'" class="carousel-container">
                  <img [src]="post.mediaUrls[0]" [alt]="post.caption">
                  <div class="carousel-indicator">
                    <span *ngFor="let media of post.mediaUrls; let i = index" 
                          [class.active]="i === 0"></span>
                  </div>
                </div>

                <video *ngIf="post.mediaType === 'video'" 
                       [src]="post.mediaUrls[0]" 
                       controls>
                </video>
              </div>

              <!-- Post Actions -->
              <div class="post-actions">
                <div class="action-buttons">
                  <button class="action-btn" 
                          [class.active]="post.isLiked"
                          (click)="toggleLike(post)">
                    <ion-icon [name]="post.isLiked ? 'heart' : 'heart-outline'"></ion-icon>
                  </button>
                  <button class="action-btn" (click)="openComments(post)">
                    <ion-icon name="chatbubble-outline"></ion-icon>
                  </button>
                  <button class="action-btn" (click)="sharePost(post)">
                    <ion-icon name="paper-plane-outline"></ion-icon>
                  </button>
                </div>
                <button class="save-btn" 
                        [class.active]="post.isSaved"
                        (click)="toggleSave(post)">
                  <ion-icon [name]="post.isSaved ? 'bookmark' : 'bookmark-outline'"></ion-icon>
                </button>
              </div>

              <!-- Post Stats -->
              <div class="post-stats">
                <div class="likes-count" *ngIf="post.likes > 0">
                  {{ post.likes }} {{ post.likes === 1 ? 'like' : 'likes' }}
                </div>
              </div>

              <!-- Post Caption -->
              <div class="post-caption" *ngIf="post.caption">
                <span class="username">{{ post.username }}</span>
                <span class="caption-text">{{ post.caption }}</span>
                <div class="hashtags" *ngIf="post.tags.length > 0">
                  <span *ngFor="let tag of post.tags" class="hashtag">#{{ tag }}</span>
                </div>
              </div>

              <!-- Comments Preview -->
              <div class="comments-preview" *ngIf="post.comments > 0">
                <button class="view-comments-btn" (click)="openComments(post)">
                  View all {{ post.comments }} comments
                </button>
              </div>
            </div>
          </div>

          <!-- Loading More -->
          <div class="loading-more" *ngIf="isLoadingMore">
            <ion-spinner></ion-spinner>
            <span>Loading more posts...</span>
          </div>
        </main>

        <!-- Right Sidebar (Desktop only) -->
        <aside class="right-sidebar" *ngIf="!isMobile && hasFeature('shopping')">
          <!-- Suggested Products -->
          <div class="suggested-section">
            <h6>Suggested for You</h6>
            <div class="suggested-products">
              <div class="suggested-item" *ngFor="let product of suggestedProducts">
                <img [src]="product.imageUrl" [alt]="product.name">
                <div class="product-details">
                  <h6>{{ product.name }}</h6>
                  <p>{{ product.brand }}</p>
                  <div class="price">\${{ product.price }}</div>
                </div>
                <button class="add-to-cart-btn" (click)="addToCart(product)">
                  <ion-icon name="bag-add"></ion-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- Featured Brands -->
          <div class="brands-section">
            <h6>Featured Brands</h6>
            <div class="brand-list">
              <div class="brand-item" *ngFor="let brand of featuredBrands">
                <img [src]="brand.logo" [alt]="brand.name">
                <span>{{ brand.name }}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  `,
  styleUrls: ['./user-social-dashboard.component.scss']
})
export class UserSocialDashboardComponent implements OnInit, OnDestroy {
  @Input() currentUser: any;
  @Input() availableFeatures: string[] = [];
  @Input() isMobile = false;

  stories: Story[] = [];
  posts: Post[] = [];
  trendingProducts: TrendingProduct[] = [];
  suggestedProducts: TrendingProduct[] = [];
  featuredBrands: any[] = [];
  
  isLoadingMore = false;
  isVendor = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private ecommerceService: EcommerceService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.checkUserRole();
    this.loadSocialContent();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private checkUserRole() {
    this.isVendor = this.currentUser?.role === 'vendor';
  }

  private loadSocialContent() {
    this.loadStories();
    this.loadPosts();
    this.loadTrendingProducts();
    this.loadSuggestedProducts();
    this.loadFeaturedBrands();
  }

  private loadStories() {
    // Load stories from API
    this.stories = [];
  }

  private loadPosts() {
    // Load posts from API
    this.posts = [];
  }

  private loadTrendingProducts() {
    if (this.hasFeature('shopping')) {
      const sub = this.ecommerceService.getTrendingProducts().subscribe({
        next: (products) => {
          this.trendingProducts = products.slice(0, 5);
        },
        error: (error) => {
          console.error('Failed to load trending products:', error);
        }
      });
      this.subscriptions.push(sub);
    }
  }

  private loadSuggestedProducts() {
    if (this.hasFeature('shopping')) {
      const sub = this.ecommerceService.getSuggestedProducts().subscribe({
        next: (products) => {
          this.suggestedProducts = products.slice(0, 8);
        },
        error: (error) => {
          console.error('Failed to load suggested products:', error);
        }
      });
      this.subscriptions.push(sub);
    }
  }

  private loadFeaturedBrands() {
    if (this.hasFeature('shopping')) {
      const sub = this.ecommerceService.getFeaturedBrands().subscribe({
        next: (brands) => {
          this.featuredBrands = brands.slice(0, 6);
        },
        error: (error) => {
          console.error('Failed to load featured brands:', error);
        }
      });
      this.subscriptions.push(sub);
    }
  }

  // UI Actions
  createStory() {
    this.router.navigate(['/create/story']);
  }

  viewStory(story: Story) {
    this.router.navigate(['/stories', story.id]);
  }

  createPost(type?: string) {
    if (type) {
      this.router.navigate(['/create/post'], { queryParams: { type } });
    } else {
      this.router.navigate(['/create/post']);
    }
  }

  toggleLike(post: Post) {
    post.isLiked = !post.isLiked;
    post.likes += post.isLiked ? 1 : -1;
    // TODO: Call API to update like status
  }

  toggleSave(post: Post) {
    post.isSaved = !post.isSaved;
    // TODO: Call API to update save status
  }

  openComments(post: Post) {
    this.router.navigate(['/post', post.id, 'comments']);
  }

  sharePost(post: Post) {
    // TODO: Implement share functionality
  }

  toggleWishlist(product: TrendingProduct) {
    product.isWishlisted = !product.isWishlisted;
    // TODO: Call API to update wishlist status
  }

  addToCart(product: TrendingProduct) {
    // TODO: Call API to add to cart
  }

  // Navigation
  navigateToWishlist() {
    this.router.navigate(['/wishlist']);
  }

  navigateToCart() {
    this.router.navigate(['/cart']);
  }

  navigateToOrders() {
    this.router.navigate(['/orders']);
  }

  hasFeature(feature: string): boolean {
    return this.availableFeatures.includes(feature);
  }
}
