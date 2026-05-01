/**
 * 🔍 Advanced Search Component
 * Search for both users and products in one place
 */

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SearchApi } from 'src/app/core/api/search.api';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-searchbar
          placeholder="Search users, products..."
          [(ngModel)]="searchQuery"
          (ionChange)="onSearchChange($event)"
          [showCancelButton]="true"
          cancelButtonText="Cancel"
          debounce="500"
        ></ion-searchbar>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Search Tabs -->
      <ion-segment [(ngModel)]="selectedTab" (ionChange)="onTabChange()" class="search-tabs">
        <ion-segment-button value="all">
          <ion-label>All</ion-label>
        </ion-segment-button>
        <ion-segment-button value="users">
          <ion-label>People</ion-label>
        </ion-segment-button>
        <ion-segment-button value="products">
          <ion-label>Products</ion-label>
        </ion-segment-button>
        <ion-segment-button value="posts">
          <ion-label>Posts</ion-label>
        </ion-segment-button>
      </ion-segment>

      <!-- Loading -->
      <div *ngIf="isLoading" class="ion-text-center ion-padding">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <!-- Users Results -->
      <div *ngIf="searchQuery && (selectedTab === 'all' || selectedTab === 'users') && !isLoading">
        <h3 class="results-header">People</h3>
        <ion-list>
          <ion-item *ngFor="let user of userResults" (click)="openUserProfile(user.id)" button>
            <ion-avatar slot="start">
              <img [src]="user.avatar" />
            </ion-avatar>
            <ion-label>
              <h3>{{ user.fullName || user.username }}</h3>
              <p>@{{ user.username }}</p>
            </ion-label>
            <app-follow-button
              [userId]="user.id"
              (click)="$event.stopPropagation()"
              size="small"
              expand="block"
            ></app-follow-button>
          </ion-item>
        </ion-list>
      </div>

      <!-- Products Results -->
      <div *ngIf="searchQuery && (selectedTab === 'all' || selectedTab === 'products') && !isLoading">
        <h3 class="results-header">Products</h3>
        <div class="products-grid">
          <ion-card
            *ngFor="let product of productResults"
            (click)="openProduct(product.id)"
            class="product-result-card"
          >
            <img [src]="product.images?.[0]" />
            <div class="product-overlay">
              <h4>{{ product.name }}</h4>
              <p class="price">₹{{ product.price }}</p>
            </div>
          </ion-card>
        </div>
      </div>

      <!-- Posts Results -->
      <div *ngIf="searchQuery && (selectedTab === 'all' || selectedTab === 'posts') && !isLoading">
        <h3 class="results-header">Posts</h3>
        <div class="posts-grid">
          <div
            *ngFor="let post of postResults"
            (click)="openPost(post.id)"
            class="post-grid-item"
          >
            <img [src]="post.images?.[0]" />
            <div class="post-overlay">
              <div class="post-stats">
                <span>
                  <ion-icon name="heart"></ion-icon>
                  {{ post.likes || 0 }}
                </span>
                <span>
                  <ion-icon name="chatbubble"></ion-icon>
                  {{ post.comments || 0 }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Trending / Suggestions (when no search) -->
      <div *ngIf="!searchQuery && !isLoading">
        <!-- Trending Users -->
        <h3 class="results-header">Suggested Users</h3>
        <ion-list>
          <ion-item *ngFor="let user of suggestedUsers" (click)="openUserProfile(user.id)" button>
            <ion-avatar slot="start">
              <img [src]="user.avatar" />
            </ion-avatar>
            <ion-label>
              <h3>{{ user.fullName || user.username }}</h3>
              <p>{{ user.followers || 0 }} followers</p>
            </ion-label>
            <app-follow-button
              [userId]="user.id"
              (click)="$event.stopPropagation()"
              size="small"
            ></app-follow-button>
          </ion-item>
        </ion-list>

        <!-- Trending Products -->
        <h3 class="results-header" style="margin-top: 20px;">Trending Products</h3>
        <div class="products-carousel">
          <ion-card
            *ngFor="let product of trendingProducts"
            (click)="openProduct(product.id)"
            class="trending-product-card"
          >
            <img [src]="product.images?.[0]" />
            <ion-card-content>
              <h4>{{ product.name }}</h4>
              <p class="price">₹{{ product.price }}</p>
            </ion-card-content>
          </ion-card>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="searchQuery && userResults.length === 0 && productResults.length === 0 && postResults.length === 0 && !isLoading" class="empty-state">
        <ion-icon name="search-outline" size="large"></ion-icon>
        <p>No results found for "{{ searchQuery }}"</p>
      </div>
    </ion-content>
  `,
  styles: [`
    ion-content {
      --background: #f9f9f9;
    }

    .search-tabs {
      padding: 12px 0;
    }

    .results-header {
      padding: 16px;
      margin: 0;
      font-size: 14px;
      font-weight: bold;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: white;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 4px;
      padding: 4px;
    }

    .product-result-card {
      margin: 0;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      aspect-ratio: 1;
    }

    .product-result-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
      color: white;
      padding: 12px 8px;
      text-align: center;
    }

    .posts-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2px;
      padding: 2px;
    }

    .post-grid-item {
      aspect-ratio: 1;
      position: relative;
      cursor: pointer;
      overflow: hidden;
      background: #e0e0e0;
    }

    .post-grid-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .post-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .post-grid-item:hover .post-overlay {
      opacity: 1;
    }

    .post-stats {
      display: flex;
      gap: 12px;
      color: white;
      font-size: 12px;
      font-weight: bold;
    }

    .post-stats span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .products-carousel {
      display: flex;
      overflow-x: auto;
      gap: 12px;
      padding: 12px 16px;
      scroll-snap-type: x mandatory;
    }

    .trending-product-card {
      flex-shrink: 0;
      width: 160px;
      margin: 0;
      scroll-snap-align: start;
    }

    .trending-product-card img {
      width: 100%;
      height: 160px;
      object-fit: cover;
    }

    .trending-product-card h4 {
      font-size: 13px;
      font-weight: 600;
      margin: 8px 0 4px 0;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .price {
      font-size: 14px;
      font-weight: bold;
      color: #2e7d32;
      margin: 0;
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
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchPageComponent implements OnInit, OnDestroy {
  searchQuery: string = '';
  selectedTab: 'all' | 'users' | 'products' | 'posts' = 'all';
  
  userResults: any[] = [];
  productResults: any[] = [];
  postResults: any[] = [];
  
  suggestedUsers: any[] = [];
  trendingProducts: any[] = [];
  
  isLoading = false;

  private destroy$ = new Subject<void>();
  private searchControl = new FormControl('');

  constructor(
    private searchApi: SearchApi,
    private router: Router,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.loadSuggestions();
    
    this.searchControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(query => {
        if (query) {
          this.performSearch(query);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(event: any) {
    this.searchQuery = event.detail.value;
    this.searchControl.setValue(this.searchQuery);
  }

  onTabChange() {
    // Tab changed
  }

  loadSuggestions() {
    this.searchApi.getSuggestedUsers(5)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.suggestedUsers = response.data || [];
        },
        error: (error) => console.error('Failed to load suggestions:', error)
      });

    this.searchApi.getTrendingProducts(10)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.trendingProducts = response.data || [];
        },
        error: (error) => console.error('Failed to load trending:', error)
      });
  }

  performSearch(query: string) {
    this.isLoading = true;

    this.searchApi.search(query)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.userResults = response.data?.users || [];
          this.productResults = response.data?.products || [];
          this.postResults = response.data?.posts || [];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Search failed:', error);
          this.isLoading = false;
        }
      });
  }

  openUserProfile(userId: string) {
    this.router.navigate(['/profile', userId]);
  }

  openProduct(productId: string) {
    this.router.navigate(['/products', productId]);
  }

  openPost(postId: string) {
    this.router.navigate(['/posts', postId]);
  }
}
