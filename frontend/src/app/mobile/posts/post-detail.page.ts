/**
 * 📱 Post Detail Page
 * Full post view with social actions + product tagging
 */

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PostProductLinkingService } from '../../core/services/post-product-linking.service';
import { UnifiedNavigationService } from '../../core/services/unified-navigation.service';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Post</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="openMoreOptions()">
            <ion-icon name="ellipsis-vertical" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Loading -->
      <div *ngIf="isLoading" class="ion-text-center ion-padding">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <!-- Post Card -->
      <div *ngIf="post && !isLoading" class="post-container">
        <!-- User Info Header -->
        <ion-item class="post-header" (click)="openUserProfile()">
          <ion-avatar slot="start">
            <img [src]="post.author?.avatar" />
          </ion-avatar>
          <ion-label>
            <h3>{{ post.author?.fullName || post.author?.username }}</h3>
            <p class="time-ago">{{ getTimeAgo(post.createdAt) }}</p>
          </ion-label>
        </ion-item>

        <!-- Post Images/Video -->
        <div class="post-media-container" *ngIf="post.images?.length > 0">
          <div class="image-carousel">
            <img
              *ngFor="let image of post.images"
              [src]="image"
              class="post-image"
              (click)="openImageViewer(image)"
            />
          </div>
          <div class="image-counter" *ngIf="post.images.length > 1">
            1 / {{ post.images.length }}
          </div>
        </div>

        <!-- Post Caption -->
        <div class="post-caption-section">
          <h3 class="caption-text">{{ post.caption }}</h3>
          <p class="post-date">{{ post.createdAt | date: 'medium' }}</p>
        </div>

        <!-- Tagged Products -->
        <div class="tagged-products" *ngIf="post.taggedProducts?.length > 0">
          <h4>Products</h4>
          <div class="products-scroll">
            <ion-card
              *ngFor="let product of post.taggedProducts"
              (click)="openProduct(product.id)"
              class="product-tag-card"
            >
              <img [src]="product.images?.[0]" />
              <div class="product-info-tag">
                <h5>{{ product.name }}</h5>
                <p class="price">₹{{ product.price }}</p>
                <ion-button size="small" expand="block" (click)="addProductToCart(product)" color="primary">
                  <ion-icon name="cart" slot="start"></ion-icon>
                  Add to Cart
                </ion-button>
              </div>
            </ion-card>
          </div>
        </div>

        <!-- Social Actions -->
        <div class="social-actions">
          <ion-button
            fill="clear"
            [color]="post.isLiked ? 'danger' : 'medium'"
            (click)="toggleLike()"
          >
            <ion-icon
              name="heart"
              [fill]="post.isLiked ? 'solid' : 'outline'"
              slot="start"
            ></ion-icon>
            {{ post.likes }}
          </ion-button>

          <ion-button fill="clear" (click)="openComments()">
            <ion-icon name="chatbubble-outline" slot="start"></ion-icon>
            {{ post.commentCount }}
          </ion-button>

          <ion-button fill="clear" (click)="sharePost()">
            <ion-icon name="share-social-outline" slot="start"></ion-icon>
            Share
          </ion-button>

          <ion-button
            fill="clear"
            [color]="post.isSaved ? 'primary' : 'medium'"
            (click)="toggleSave()"
            slot="end"
          >
            <ion-icon
              name="bookmark"
              [fill]="post.isSaved ? 'solid' : 'outline'"
            ></ion-icon>
          </ion-button>
        </div>

        <!-- Comments Section -->
        <div class="comments-section">
          <h4>Comments</h4>

          <!-- Comment List -->
          <div class="comments-list">
            <div *ngFor="let comment of comments" class="comment-item">
              <ion-avatar slot="start">
                <img [src]="comment.author?.avatar" />
              </ion-avatar>
              <div class="comment-content">
                <div class="comment-header">
                  <strong>{{ comment.author?.username }}</strong>
                  <span class="time">{{ getTimeAgo(comment.createdAt) }}</span>
                </div>
                <p class="comment-text">{{ comment.text }}</p>
                <div class="comment-actions">
                  <span (click)="toggleCommentLike(comment.id)">
                    {{ comment.likes || 0 }} Likes
                  </span>
                  <span (click)="replyToComment(comment.id)">Reply</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Add Comment Input -->
          <div class="add-comment-section">
            <ion-item>
              <ion-avatar slot="start">
                <img [src]="currentUserAvatar" />
              </ion-avatar>
              <ion-input
                placeholder="Write a comment..."
                [(ngModel)]="newCommentText"
                (keyup.enter)="postComment()"
              ></ion-input>
              <ion-button
                (click)="postComment()"
                [disabled]="!newCommentText || isPostingComment"
                fill="clear"
              >
                <ion-icon name="send" slot="icon-only"></ion-icon>
              </ion-button>
            </ion-item>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !isLoading" class="error-state">
        <ion-icon name="alert-circle" size="large"></ion-icon>
        <p>{{ error }}</p>
        <ion-button (click)="goBack()">Go Back</ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    ion-content {
      --background: #fff;
    }

    .post-container {
      background: white;
    }

    .post-header {
      padding: 12px 16px;
      cursor: pointer;
    }

    .time-ago {
      font-size: 12px;
      color: #999;
    }

    .post-media-container {
      position: relative;
      width: 100%;
      background: #f0f0f0;
    }

    .image-carousel {
      display: flex;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
    }

    .post-image {
      width: 100%;
      height: 400px;
      object-fit: cover;
      flex-shrink: 0;
      scroll-snap-align: start;
    }

    .image-counter {
      position: absolute;
      bottom: 12px;
      right: 12px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }

    .post-caption-section {
      padding: 16px;
      border-bottom: 1px solid #eee;
    }

    .caption-text {
      font-size: 14px;
      line-height: 1.5;
      margin: 0 0 8px 0;
    }

    .post-date {
      font-size: 12px;
      color: #999;
      margin: 0;
    }

    .tagged-products {
      padding: 16px;
      border-bottom: 1px solid #eee;
    }

    .tagged-products h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: bold;
    }

    .products-scroll {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
    }

    .product-tag-card {
      flex-shrink: 0;
      width: 140px;
      margin: 0;
      scroll-snap-align: start;
    }

    .product-tag-card img {
      width: 100%;
      height: 140px;
      object-fit: cover;
    }

    .product-info-tag {
      padding: 8px;
    }

    .product-info-tag h5 {
      font-size: 12px;
      font-weight: 600;
      margin: 0 0 4px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .price {
      font-size: 13px;
      font-weight: bold;
      color: #2e7d32;
      margin: 0 0 8px 0;
    }

    .product-info-tag ion-button {
      font-size: 10px;
      height: 32px;
    }

    .social-actions {
      display: flex;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }

    .social-actions ion-button {
      flex: 1;
      font-size: 12px;
    }

    .comments-section {
      padding: 16px;
    }

    .comments-section h4 {
      margin: 0 0 16px 0;
      font-size: 14px;
      font-weight: bold;
    }

    .comments-list {
      margin-bottom: 20px;
      max-height: 400px;
      overflow-y: auto;
    }

    .comment-item {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f0f0f0;
    }

    .comment-item ion-avatar {
      width: 32px;
      height: 32px;
      flex-shrink: 0;
    }

    .comment-content {
      flex: 1;
    }

    .comment-header {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 4px;
    }

    .comment-header strong {
      font-size: 13px;
    }

    .time {
      font-size: 11px;
      color: #999;
    }

    .comment-text {
      font-size: 13px;
      line-height: 1.4;
      margin: 0 0 8px 0;
    }

    .comment-actions {
      display: flex;
      gap: 12px;
      font-size: 11px;
      color: #666;
    }

    .comment-actions span {
      cursor: pointer;
    }

    .add-comment-section {
      position: sticky;
      bottom: 0;
      background: white;
      border-top: 1px solid #eee;
      z-index: 10;
    }

    .add-comment-section ion-item {
      --padding-start: 0;
      --padding-end: 0;
    }

    .error-state {
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
export class PostDetailPageComponent implements OnInit, OnDestroy {
  post: any = null;
  comments: any[] = [];
  newCommentText: string = '';
  isLoading = true;
  isPostingComment = false;
  error: string | null = null;
  currentUserAvatar: string = '';

  private destroy$ = new Subject<void>();
  private postId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toastController: ToastController,
    private postProductLinkingService: PostProductLinkingService,
    private navigationService: UnifiedNavigationService
  ) {}

  ngOnInit() {
    this.postId = this.route.snapshot.paramMap.get('id');
    
    if (!this.postId) {
      this.router.navigate(['/tabs/home']);
      return;
    }

    this.loadPost();
    this.loadComments();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPost() {
    this.http.get(`/api/posts/${this.postId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.post = response.data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load post:', error);
          this.error = 'Failed to load post';
          this.isLoading = false;
        }
      });
  }

  loadComments() {
    this.http.get(`/api/posts/${this.postId}/comments`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.comments = response.data || [];
        },
        error: (error) => console.error('Failed to load comments:', error)
      });
  }

  toggleLike() {
    if (!this.post) return;

    this.http.post(`/api/post-likes/${this.post.id}`, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.post.isLiked = !this.post.isLiked;
          this.post.likes = this.post.isLiked ? (this.post.likes || 0) + 1 : (this.post.likes || 1) - 1;
        },
        error: (error) => console.error('Failed to like post:', error)
      });
  }

  toggleSave() {
    if (!this.post) return;
    
    const postId = this.post.id || this.post._id;
    if (!postId) {
      console.warn('Cannot save post: no ID found', this.post);
      return;
    }

    this.http.post(`/api/posts/${postId}/save`, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.post.isSaved = !this.post.isSaved;
        },
        error: (error) => console.error('Failed to save post:', error)
      });
  }

  postComment() {
    if (!this.newCommentText.trim() || !this.postId) return;

    this.isPostingComment = true;

    this.http.post(`/api/posts/${this.postId}/comments`, {
      text: this.newCommentText
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.comments.unshift(response.data);
          this.newCommentText = '';
          this.isPostingComment = false;
        },
        error: (error) => {
          console.error('Failed to post comment:', error);
          this.isPostingComment = false;
        }
      });
  }

  async openProduct(productId: string) {
    // Track product view from post
    if (this.postId) {
      this.postProductLinkingService.trackPostProductInteraction(
        this.postId,
        productId,
        'product_view'
      ).subscribe();
    }
    
    // Navigate to product detail using unified navigation service
    // This automatically routes to correct path for mobile
    await this.navigationService.viewProduct(productId, { 
      source: 'post', 
      postId: this.postId 
    });
  }

  openUserProfile() {
    if (this.post?.author?.id) {
      this.router.navigate(['/mobile/profile', this.post.author.id]);
    }
  }

  openComments() {
    // Already on comments section, scroll to it
  }

  sharePost() {
    // TODO: Share functionality
  }

  openMoreOptions() {
    // TODO: More options menu
  }

  openImageViewer(image: string) {
    // TODO: Open full-screen image viewer
  }

  toggleCommentLike(commentId: string) {
    // TODO: Like comment
  }

  replyToComment(commentId: string) {
    // TODO: Reply to comment
  }

  async addProductToCart(product: any) {
    if (!this.postId || !product.id) return;

    try {
      const options: any = { source: 'post' };
      if (this.postId) {
        options.postId = this.postId;
      }
      
      // Use product linking service to add to cart with tracking
      await this.postProductLinkingService.addToCartFromPost(
        this.postId!,
        product.id,
        1
      ).toPromise();

      // Show success toast
      const toast = await this.toastController.create({
        message: 'Added to cart!',
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Failed to add to cart:', error);
      const toast = await this.toastController.create({
        message: 'Failed to add to cart',
        duration: 2000,
        position: 'bottom',
        color: 'danger'
      });
      await toast.present();
    }
  }

  goBack() {
    this.router.navigate(['/tabs/home']);
  }

  getTimeAgo(date: string | Date): string {
    if (!date) return '';
    const now = new Date();
    const postDate = new Date(date);
    const diff = Math.floor((now.getTime() - postDate.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return postDate.toLocaleDateString();
  }
}
