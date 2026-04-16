/**
 * 👤 User Profile Page
 * Hybrid profile showing social content + shopping history
 */

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-user-profile-page',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Profile</ion-title>
        <ion-buttons slot="end">
          <ion-button *ngIf="isOwnProfile" (click)="openSettings()">
            <ion-icon name="settings" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Loading -->
      <div *ngIf="isLoading" class="ion-text-center ion-padding">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <!-- Profile Header -->
      <div *ngIf="user && !isLoading" class="profile-header">
        <div class="header-top">
          <ion-avatar class="profile-avatar">
            <img [src]="user.avatar" />
          </ion-avatar>
        </div>

        <h1 class="profile-name">{{ user.fullName || user.username }}</h1>
        <p class="profile-username">@{{ user.username }}</p>
        <p class="profile-bio" *ngIf="user.bio">{{ user.bio }}</p>

        <!-- Stats -->
        <app-follower-stats [userId]="user.id"></app-follower-stats>

        <!-- Action Buttons -->
        <div class="profile-actions">
          <app-follow-button
            *ngIf="!isOwnProfile"
            [userId]="user.id"
            expand="block"
            (followStatusChanged)="onFollowStatusChanged($event)"
          ></app-follow-button>

          <ion-button
            *ngIf="!isOwnProfile"
            expand="block"
            fill="outline"
            (click)="sendMessage()"
          >
            <ion-icon name="chatbubble" slot="start"></ion-icon>
            Message
          </ion-button>

          <ion-button
            *ngIf="isOwnProfile"
            expand="block"
            (click)="editProfile()"
          >
            <ion-icon name="create" slot="start"></ion-icon>
            Edit Profile
          </ion-button>
        </div>
      </div>

      <!-- Tabs for content -->
      <ion-segment [(ngModel)]="selectedTab" (ionChange)="onTabChange()" class="profile-tabs">
        <ion-segment-button value="posts">
          <ion-icon name="images"></ion-icon>
          <ion-label>Posts</ion-label>
        </ion-segment-button>
        <ion-segment-button value="order-history">
          <ion-icon name="bag"></ion-icon>
          <ion-label>Orders</ion-label>
        </ion-segment-button>
        <ion-segment-button value="tagged">
          <ion-icon name="pricetag"></ion-icon>
          <ion-label>Tagged</ion-label>
        </ion-segment-button>
      </ion-segment>

      <!-- Posts Grid -->
      <div *ngIf="selectedTab === 'posts'" class="content-grid">
        <div
          *ngFor="let post of userPosts"
          (click)="openPost(post.id)"
          class="grid-item post-item"
        >
          <img [src]="post.images?.[0]" />
          <div class="overlay">
            <div class="stats">
              <span>
                <ion-icon name="heart"></ion-icon>
                {{ post.likes }}
              </span>
              <span>
                <ion-icon name="chatbubble"></ion-icon>
                {{ post.comments }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Order History -->
      <div *ngIf="selectedTab === 'order-history'" class="orders-list">
        <ion-list>
          <ion-item *ngFor="let order of orderHistory" (click)="viewOrder(order.id)">
            <ion-thumbnail slot="start">
              <img [src]="order.itemImage" />
            </ion-thumbnail>
            <ion-label>
              <h3>{{ order.itemName }}</h3>
              <p>{{ order.status | uppercase }}</p>
              <p class="order-date">{{ order.createdAt | date: 'shortDate' }}</p>
            </ion-label>
            <ion-note slot="end">₹{{ order.total }}</ion-note>
          </ion-item>
        </ion-list>
      </div>

      <!-- Tagged Products / Posts -->
      <div *ngIf="selectedTab === 'tagged'" class="content-grid">
        <div
          *ngFor="let item of taggedItems"
          (click)="openItem(item)"
          class="grid-item tagged-item"
        >
          <img [src]="item.image" />
          <div class="overlay tagged-overlay">
            <span class="tag-badge">{{ item.type === 'product' ? '🛍️' : '📷' }}</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="selectedTab === 'posts' && userPosts.length === 0 && !isLoading" class="empty-state">
        <ion-icon name="image" size="large"></ion-icon>
        <p>No posts yet</p>
      </div>

      <div *ngIf="selectedTab === 'order-history' && orderHistory.length === 0 && !isLoading" class="empty-state">
        <ion-icon name="bag" size="large"></ion-icon>
        <p>No orders yet</p>
      </div>

      <div *ngIf="selectedTab === 'tagged' && taggedItems.length === 0 && !isLoading" class="empty-state">
        <ion-icon name="pricetag" size="large"></ion-icon>
        <p>No tagged items yet</p>
      </div>
    </ion-content>
  `,
  styles: [`
    ion-content {
      --background: #f9f9f9;
    }

    .profile-header {
      background: white;
      padding: 24px 16px;
      text-align: center;
      border-bottom: 1px solid #eee;
    }

    .header-top {
      margin-bottom: 16px;
    }

    .profile-avatar {
      width: 96px;
      height: 96px;
      margin: 0 auto;
    }

    .profile-name {
      font-size: 20px;
      font-weight: bold;
      margin: 12px 0 4px 0;
    }

    .profile-username {
      color: #666;
      font-size: 14px;
      margin: 0 0 12px 0;
    }

    .profile-bio {
      font-size: 13px;
      color: #333;
      margin: 8px 0 16px 0;
    }

    .profile-actions {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }

    .profile-actions ion-button {
      flex: 1;
      font-size: 12px;
      height: 40px;
    }

    .profile-tabs {
      padding: 8px 0;
      background: white;
    }

    .content-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2px;
      padding: 2px;
    }

    .grid-item {
      aspect-ratio: 1;
      position: relative;
      cursor: pointer;
      overflow: hidden;
      background: #e0e0e0;
    }

    .grid-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .grid-item:hover .overlay {
      opacity: 1;
    }

    .stats {
      display: flex;
      gap: 12px;
      color: white;
      font-size: 12px;
      font-weight: bold;
    }

    .stats span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .tagged-overlay {
      justify-content: flex-end;
      padding: 8px;
      opacity: 1;
      background: transparent;
    }

    .tag-badge {
      font-size: 20px;
      text-shadow: 0 0 4px rgba(0,0,0,0.5);
    }

    .orders-list {
      padding: 8px 0;
    }

    .orders-list ion-item {
      background: white;
      margin-bottom: 8px;
    }

    .order-date {
      font-size: 11px;
      color: #999;
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
export class UserProfilePageComponent implements OnInit, OnDestroy {
  user: any = null;
  isOwnProfile = false;
  isLoading = true;
  selectedTab: 'posts' | 'order-history' | 'tagged' = 'posts';

  userPosts: any[] = [];
  orderHistory: any[] = [];
  taggedItems: any[] = [];

  private destroy$ = new Subject<void>();
  private userId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id') || this.route.snapshot.paramMap.get('userId');
    
    if (!this.userId) {
      this.router.navigate(['/tabs/home']);
      return;
    }

    this.loadUserProfile();
    this.loadUserPosts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserProfile() {
    this.http.get(`/api/users/${this.userId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.user = response.data;
          // Check if it's own profile
          // this.isOwnProfile = this.user.id === currentUserId;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load profile:', error);
          this.isLoading = false;
        }
      });
  }

  loadUserPosts() {
    this.http.get(`/api/users/${this.userId}/posts`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.userPosts = response.data || [];
        },
        error: (error) => console.error('Failed to load posts:', error)
      });

    this.http.get(`/api/users/${this.userId}/orders`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.orderHistory = response.data || [];
        },
        error: (error) => console.error('Failed to load orders:', error)
      });

    this.http.get(`/api/users/${this.userId}/tagged`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.taggedItems = response.data || [];
        },
        error: (error) => console.error('Failed to load tagged:', error)
      });
  }

  onTabChange() {
    // Tab changed
  }

  openPost(postId: string) {
    this.router.navigate(['/posts', postId]);
  }

  viewOrder(orderId: string) {
    this.router.navigate(['/mobile/order-confirmation', orderId]);
  }

  openItem(item: any) {
    if (item.type === 'product') {
      this.router.navigate(['/products', item.id]);
    } else {
      this.router.navigate(['/posts', item.id]);
    }
  }

  editProfile() {
    // TODO: Navigate to edit profile page
  }

  sendMessage() {
    // TODO: Open direct message
  }

  openSettings() {
    // TODO: Open settings page
  }

  onFollowStatusChanged(status: any) {
    this.showToast(status ? 'Following' : 'Unfollowed', 'success');
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
