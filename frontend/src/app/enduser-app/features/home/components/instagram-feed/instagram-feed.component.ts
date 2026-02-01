import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { PostService, PostsResponse } from '../../../../../core/services/post.service';
import { StoryService, StoriesResponse } from '../../../../../core/services/story.service';
import { Post } from '../../../../../core/models/post.model';
import { Story } from '../../../../../core/models/story.model';
import { FollowService } from '../../../../../core/services/follow.service';
import { ApiNotificationService } from '../../../../../core/services/api-notification.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { ViewAddStoriesComponent } from '../view-add-stories/view-add-stories.component';
import { Subscription, forkJoin } from 'rxjs';

interface FeedItem {
  type: 'story' | 'post';
  data: Story | Post;
  createdAt: Date;
}

@Component({
    selector: 'app-instagram-feed',
    imports: [CommonModule, FormsModule, IonicModule, ViewAddStoriesComponent],
    template: `
    <div class="instagram-feed">
      <!-- Stories Bar -->
      <div class="stories-section" *ngIf="stories.length > 0">
        <div class="stories-container">
          <app-view-add-stories
            [stories]="stories"
            [currentUser]="currentUser"
            (storyClick)="onStoryClick($event)">
          </app-view-add-stories>
        </div>
      </div>

      <!-- Posts Feed -->
      <div class="posts-section">
        <div class="posts-container">
          <!-- Create Post Button -->
          <div class="create-post-card" (click)="openPostCreator()">
            <div class="create-post-content">
              <img [src]="currentUser?.avatar || '/assets/default-avatar.png'" alt="Your avatar" class="user-avatar">
              <div class="create-post-input">
                <span>What's on your mind? Share your style...</span>
              </div>
              <div class="create-post-actions">
                <button class="photo-btn">
                  <i class="fas fa-camera"></i>
                  Photo
                </button>
                <button class="product-btn">
                  <i class="fas fa-tag"></i>
                  Tag Product
                </button>
              </div>
            </div>
          </div>

          <!-- Posts List -->
          <div class="posts-list">
            <div *ngFor="let post of posts; trackBy: trackByPostId" class="post-card">
              <!-- Post Header -->
              <div class="post-header">
                <div class="user-info">
                  <img [src]="post.user?.avatar || '/assets/default-avatar.png'" alt="User avatar" class="user-avatar">
                  <div class="user-details">
                    <span class="username">{{ post.user?.username }}</span>
                    <span class="timestamp">{{ getTimeAgo(post.createdAt) }}</span>
                  </div>
                </div>
                <button class="more-btn" (click)="showPostOptions(post)">
                  <i class="fas fa-ellipsis-h"></i>
                </button>
              </div>

              <!-- Post Media -->
              <div class="post-media" *ngIf="post.media && post.media.length > 0">
                <div class="media-container">
                  <img [src]="post.media[0].url" [alt]="post.media[0].alt" class="post-image">
                  <div class="media-overlay" *ngIf="post.media.length > 1">
                    <span>+{{ post.media.length - 1 }} more</span>
                  </div>
                </div>
              </div>

              <!-- Post Actions -->
              <div class="post-actions">
                <div class="left-actions">
                  <button
                    class="action-btn like-btn"
                    [class.liked]="post.isLiked"
                    (click)="toggleLike(post)">
                    <i class="fas" [class]="post.isLiked ? 'fa-heart liked' : 'fa-heart'"></i>
                  </button>
                  <button class="action-btn comment-btn" (click)="openComments(post)">
                    <i class="fas fa-comment"></i>
                  </button>
                  <button class="action-btn share-btn" (click)="sharePost(post)">
                    <i class="fas fa-share"></i>
                  </button>
                </div>
                <button
                  class="action-btn save-btn"
                  [class.saved]="post.isSaved"
                  (click)="toggleSave(post)">
                  <i class="fas" [class]="post.isSaved ? 'fa-bookmark' : 'fa-bookmark'"></i>
                </button>
              </div>

              <!-- Post Stats -->
              <div class="post-stats">
                <span class="likes-count">{{ post.likes?.length || 0 }} likes</span>
              </div>

              <!-- Post Caption -->
              <div class="post-caption" *ngIf="post.caption">
                <span class="username">{{ post.user?.username }}</span>
                <span class="caption-text">{{ post.caption }}</span>
              </div>

              <!-- Tagged Products -->
              <div class="tagged-products" *ngIf="post.products && post.products.length > 0">
                <div class="products-grid">
                  <div *ngFor="let taggedProduct of post.products" class="tagged-product" (click)="viewTaggedProduct(taggedProduct)">
                    <img [src]="taggedProduct.product?.images?.[0]?.url" [alt]="taggedProduct.product?.name" class="product-image">
                    <div class="product-info">
                      <span class="product-name">{{ taggedProduct.product?.name }}</span>
                      <span class="product-price">{{ '$' + taggedProduct.product?.price }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Comments Preview -->
              <div class="comments-section" *ngIf="post.comments && post.comments.length > 0">
                <div class="view-comments" (click)="openComments(post)">
                  View all {{ post.comments.length }} comments
                </div>
                <div *ngFor="let comment of post.comments.slice(0, 2)" class="comment">
                  <span class="comment-user">{{ comment.user?.username }}</span>
                  <span class="comment-text">{{ comment.text }}</span>
                </div>
              </div>

              <!-- Add Comment -->
              <div class="add-comment">
                <img [src]="currentUser?.avatar || '/assets/default-avatar.png'" alt="Your avatar" class="comment-avatar">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  class="comment-input"
                  (keyup.enter)="addComment(post, $event.target.value); $event.target.value = ''">
              </div>
            </div>
          </div>

          <!-- Loading & Infinite Scroll -->
          <div class="loading-section" *ngIf="isLoading">
            <ion-spinner name="crescent"></ion-spinner>
            <span>Loading more posts...</span>
          </div>

          <ion-infinite-scroll (ionInfinite)="loadMorePosts($event)" *ngIf="!isLoading && hasMorePosts">
            <ion-infinite-scroll-content></ion-infinite-scroll-content>
          </ion-infinite-scroll>
        </div>
      </div>
    </div>
    `,
    styles: [`
    .instagram-feed {
      max-width: 600px;
      margin: 0 auto;
      background: #fff;
      min-height: 100vh;
    }

    /* Stories Section */
    .stories-section {
      border-bottom: 1px solid #e1e8ed;
      background: #fff;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .stories-container {
      padding: 16px;
    }

    /* Create Post Card */
    .create-post-card {
      background: #fff;
      border: 1px solid #e1e8ed;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .create-post-card:hover {
      background: #f8f9fa;
    }

    .create-post-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    .create-post-input {
      flex: 1;
      padding: 12px 16px;
      background: #f8f9fa;
      border-radius: 22px;
      border: 1px solid #e1e8ed;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .create-post-input:hover {
      background: #e9ecef;
    }

    .create-post-input span {
      color: #8e8e8e;
      font-size: 14px;
    }

    .create-post-actions {
      display: flex;
      gap: 8px;
    }

    .photo-btn, .product-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .photo-btn {
      background: #1877f2;
      color: white;
    }

    .product-btn {
      background: #ff6b6b;
      color: white;
    }

    /* Post Cards */
    .post-card {
      background: #fff;
      border: 1px solid #e1e8ed;
      border-radius: 12px;
      margin-bottom: 16px;
      overflow: hidden;
    }

    .post-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .username {
      font-weight: 600;
      font-size: 14px;
      color: #262626;
    }

    .timestamp {
      font-size: 12px;
      color: #8e8e8e;
    }

    .more-btn {
      background: none;
      border: none;
      color: #8e8e8e;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: background 0.2s ease;
    }

    .more-btn:hover {
      background: #f8f9fa;
    }

    /* Post Media */
    .post-media {
      position: relative;
    }

    .media-container {
      position: relative;
    }

    .post-image {
      width: 100%;
      height: auto;
      display: block;
    }

    .media-overlay {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    /* Post Actions */
    .post-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
    }

    .left-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .action-btn {
      background: none;
      border: none;
      color: #8e8e8e;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .action-btn:hover {
      background: #f8f9fa;
    }

    .like-btn.liked .fa-heart {
      color: #ed4956;
    }

    .save-btn.saved .fa-bookmark {
      color: #262626;
    }

    /* Post Stats */
    .post-stats {
      padding: 0 16px 8px;
    }

    .likes-count {
      font-weight: 600;
      font-size: 14px;
      color: #262626;
    }

    /* Post Caption */
    .post-caption {
      padding: 0 16px 12px;
      line-height: 1.4;
    }

    .caption-text {
      margin-left: 8px;
    }

    /* Tagged Products */
    .tagged-products {
      padding: 0 16px 12px;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 8px;
    }

    .tagged-product {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      background: #f8f9fa;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .tagged-product:hover {
      background: #e9ecef;
    }

    .product-image {
      width: 40px;
      height: 40px;
      border-radius: 6px;
      object-fit: cover;
    }

    .product-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .product-name {
      font-size: 12px;
      font-weight: 500;
      color: #262626;
      line-height: 1.2;
    }

    .product-price {
      font-size: 11px;
      color: #8e8e8e;
    }

    /* Comments Section */
    .comments-section {
      padding: 0 16px;
      border-top: 1px solid #f8f9fa;
    }

    .view-comments {
      color: #8e8e8e;
      font-size: 14px;
      cursor: pointer;
      margin-bottom: 8px;
    }

    .comment {
      margin-bottom: 4px;
    }

    .comment-user {
      font-weight: 600;
      margin-right: 8px;
      font-size: 14px;
    }

    .comment-text {
      font-size: 14px;
    }

    /* Add Comment */
    .add-comment {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-top: 1px solid #f8f9fa;
    }

    .comment-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }

    .comment-input {
      flex: 1;
      border: none;
      outline: none;
      background: none;
      font-size: 14px;
      color: #262626;
    }

    .comment-input::placeholder {
      color: #8e8e8e;
    }

    /* Loading */
    .loading-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 20px;
      color: #8e8e8e;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .instagram-feed {
        max-width: 100%;
      }

      .create-post-actions {
        display: none;
      }

      .products-grid {
        grid-template-columns: 1fr;
      }
    }
    `]
})
export class InstagramFeedComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  stories: Story[] = [];
  currentUser: any = null;
  isLoading = false;
  hasMorePosts = true;
  currentPage = 1;
  private subscriptions: Subscription[] = [];

  constructor(
    private postService: PostService,
    private storyService: StoryService,
    private followService: FollowService,
    private notificationService: ApiNotificationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('🚀 InstagramFeed Component Initialized');

    // Subscribe to current user
    this.subscriptions.push(
      this.authService.currentUser$.subscribe((user: any) => {
        this.currentUser = user;
      })
    );

    // Subscribe to new notifications
    this.subscriptions.push(
      this.notificationService.newNotification$.subscribe((notification: any) => {
        this.handleNewNotification(notification);
      })
    );

    this.loadInitialData();
  }

  ngOnDestroy() {
    console.log('🔌 InstagramFeed Component Destroyed');
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadInitialData() {
    this.isLoading = true;

    // Load stories and posts in parallel
    forkJoin({
      stories: this.storyService.getStories(1, 10),
      posts: this.postService.getPosts(1, 10)
    }).subscribe({
      next: (results) => {
        this.stories = results.stories.stories || [];
        this.posts = results.posts.posts || [];
        this.isLoading = false;
        console.log('📊 Initial feed data loaded - Stories:', this.stories.length, 'Posts:', this.posts.length);
      },
      error: (error: any) => {
        console.error('❌ Error loading initial feed data:', error);
        this.isLoading = false;
      }
    });
  }

  loadMorePosts(event: InfiniteScrollCustomEvent) {
    if (this.isLoading || !this.hasMorePosts) {
      event.target.complete();
      return;
    }

    this.currentPage++;
    this.isLoading = true;

    this.postService.getPosts(this.currentPage, 10).subscribe({
      next: (response: PostsResponse) => {
        if (response.posts && response.posts.length > 0) {
          this.posts = [...this.posts, ...response.posts];
          this.hasMorePosts = this.currentPage < response.pagination.pages;
        } else {
          this.hasMorePosts = false;
        }
        this.isLoading = false;
        event.target.complete();
        console.log('📄 Loaded more posts - Page:', this.currentPage, 'Total posts:', this.posts.length);
      },
      error: (error: any) => {
        console.error('❌ Error loading more posts:', error);
        this.isLoading = false;
        event.target.complete();
      }
    });
  }

  onStoryClick(story: Story) {
    console.log('📖 Story clicked:', story._id);
    // Navigate to story viewer
    this.router.navigate(['/story', story._id]);
  }

  openPostCreator() {
    console.log('✍️ Opening post creator');
    // TODO: Open post creation modal/component
    // this.router.navigate(['/create-post']);
  }

  toggleLike(post: Post) {
    console.log('❤️ Toggling like for post:', post._id);
    this.postService.likePost(post._id).subscribe({
      next: (response: any) => {
        // Update local post state
        post.isLiked = !post.isLiked;
        if (post.likes) {
          post.isLiked ? post.likes.push({ user: this.currentUser?._id, likedAt: new Date() }) :
                         post.likes = post.likes.filter((like: any) => like.user !== this.currentUser?._id);
        }
        console.log('✅ Like toggled, new count:', post.likes?.length);
      },
      error: (error: any) => {
        console.error('❌ Error toggling like:', error);
      }
    });
  }

  toggleSave(post: Post) {
    console.log('💾 Toggling save for post:', post._id);
    this.postService.savePost(post._id).subscribe({
      next: (response: any) => {
        post.isSaved = !post.isSaved;
        console.log('✅ Post save toggled');
      },
      error: (error: any) => {
        console.error('❌ Error toggling save:', error);
      }
    });
  }

  openComments(post: Post) {
    console.log('💬 Opening comments for post:', post._id);
    // TODO: Open comments modal or navigate to post detail
    // this.router.navigate(['/post', post._id]);
  }

  sharePost(post: Post) {
    console.log('🔗 Sharing post:', post._id);
    this.postService.sharePost(post._id).subscribe({
      next: (response: any) => {
        console.log('✅ Post shared');
        // TODO: Show share options or copy link
      },
      error: (error: any) => {
        console.error('❌ Error sharing post:', error);
      }
    });
  }

  addComment(post: Post, commentText: string) {
    if (!commentText.trim()) return;

    console.log('💬 Adding comment to post:', post._id);
    this.postService.addComment(post._id, commentText).subscribe({
      next: (response: any) => {
        // Add comment to local post state
        if (post.comments) {
          post.comments.push({
            _id: response.comment._id,
            user: {
              _id: this.currentUser?._id,
              username: this.currentUser?.username,
              fullName: this.currentUser?.fullName,
              avatar: this.currentUser?.avatar
            },
            text: commentText,
            likes: [],
            replies: [],
            createdAt: new Date(),
            commentedAt: new Date()
          });
        }
        console.log('✅ Comment added');
      },
      error: (error: any) => {
        console.error('❌ Error adding comment:', error);
      }
    });
  }

  viewTaggedProduct(taggedProduct: any) {
    console.log('🏷️ Viewing tagged product:', taggedProduct.product?._id);
    this.router.navigate(['/products', taggedProduct.product?._id]);
  }

  showPostOptions(post: Post) {
    console.log('⚙️ Showing options for post:', post._id);
    // TODO: Show post options menu (report, hide, etc.)
  }

  private handleNewNotification(notification: any) {
    console.log('🔔 New notification received:', notification);
    // Handle real-time notifications (likes, comments, follows, etc.)
    // Could show toast or update relevant post data
  }

  getTimeAgo(date: Date | string): string {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return postDate.toLocaleDateString();
  }

  trackByPostId(index: number, post: Post): string {
    return post._id;
  }
}