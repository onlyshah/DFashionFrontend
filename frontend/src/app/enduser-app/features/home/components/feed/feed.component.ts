import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../../../../core/services/cart.service';
import { WishlistService } from '../../../../../core/services/wishlist.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { PostService } from '../../../../../core/services/post.service';
import { StoryService } from '../../../../../core/services/story.service';

@Component({
  selector: 'app-feed',
  imports: [CommonModule, FormsModule],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})



export class FeedComponent implements OnInit {
  posts: any[] = [];
  loading = true;
  hasMore = true;
  currentPage = 1;
  pageSize = 10;
  newComment = '';
  imageUrl = environment.apiUrl;
  stories: any[] = [];
  storiesLoading = true;

  // Instagram-style overlay state
  storyViewerOpen = false;
  currentStoryIndex = 0;
  storyProgress = 0;
  selectedPostForOptions: any = null;
  isPostOptionsOpen = false;
  messagesPanelOpen = false;
  messages: any[] = [
    { name: 'Anna', avatar: `${environment.apiUrl}/uploads/avatars/default-avatar.svg`, last: 'Loved your latest post!', active: '1m', unread: 2 },
    { name: 'Riya', avatar: `${environment.apiUrl}/uploads/avatars/default-avatar.svg`, last: 'Can we collaborate?', active: '3m', unread: 0 },
    { name: 'Nina', avatar: `${environment.apiUrl}/uploads/avatars/default-avatar.svg`, last: 'Nice outfit!', active: '5m', unread: 1 }
  ];

  // TrackBy for ngFor
  trackByPostId(index: number, post: any) {
    return post.id;
  }

  // Calculate total unread messages
  getTotalUnreadMessages(): number {
    return this.messages.reduce((total, msg) => total + (msg.unread || 0), 0);
  }

  // Format time ago
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

  // Like/unlike post
  toggleLike(post: any) {
    this.postService.likePost(post.id).subscribe({
      next: (response) => {
        post.isLiked = !post.isLiked;
        post.likes = response.likesCount;
      },
      error: () => {}
    });
  }

  // Focus comment input (no-op for now)
  focusCommentInput(post: any) {
    // Optionally scroll to comment input or set focus
  }

  // Share post
  sharePost(post: any) {
    const url = `${environment.apiUrl}/api/posts/${post.id}/share`;
    this.http.post(url, {}).subscribe();
    // Optionally show share UI
  }

  // Save/unsave post
  toggleSave(post: any) {
    const url = `${environment.apiUrl}/api/posts/${post.id}/save`;
    this.http.post(url, {}).subscribe({
      next: () => {
        post.isSaved = !post.isSaved;
        post.saves = post.isSaved ? post.saves + 1 : post.saves - 1;
      },
      error: () => {}
    });
  }

  // Toggle comments (show/hide)
  toggleComments(post: any) {
    post.showComments = !post.showComments;
  }

  // Add comment to post
  addComment(post: any) {
    const commentText = this.newComment.trim();
    if (!commentText) return;
    this.postService.addComment(post.id, commentText).subscribe({
      next: (res: any) => {
        post.comments = post.comments || [];
        post.comments.push({ text: commentText, createdAt: new Date(), user: 'You' });
        post.commentsCount = (post.commentsCount || 0) + 1;
        this.newComment = '';
      },
      error: () => {}
    });
  }

  // Format price
  formatPrice(price: number): string {
    return price ? `$${price.toFixed(2)}` : '';
  }

  // Add product to cart
  addToCart(product: any) {
    // For now, just show a placeholder action since products aren't loaded
    console.log('Add to cart clicked for post:', product.id);
    // this.cartService.addToCart(product.product || product);
  }

  // Add product to wishlist
  addToWishlist(product: any) {
    // For now, just show a placeholder action since products aren't loaded
    console.log('Add to wishlist clicked for post:', product.id);
    // this.wishlistService.addToWishlist(product.product || product);
  }

  // Buy now (navigate to product page)
  buyNow(product: any) {
    // For now, just show a placeholder action since products aren't loaded
    console.log('Buy now clicked for post:', product.id);
    // const prodId = product.product?._id || product._id;
    // if (prodId) {
    //   this.router.navigate(['/product', prodId]);
    // }
  }

  // Toggle notification for post updates
  toggleNotification(post: any) {
    const url = `${environment.apiUrl}/api/posts/${post.id}/notification`;
    this.http.post(url, {}).subscribe({
      next: () => {
        post.isNotified = !post.isNotified;
      },
      error: () => {}
    });
  }

  // Load more posts (pagination)
  loadMorePosts() {
    if (!this.hasMore || this.loading) return;
    this.fetchPosts(this.currentPage + 1, true);
  }
  constructor(
    private router: Router,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private http: HttpClient,
    private postService: PostService,
    private storyService: StoryService
  ) {}


  ngOnInit() {
    this.fetchPosts(1);
    this.loadStories();
    setTimeout(() => {
      console.log('Feed posts:', this.posts);
    }, 2000);
  }

  loadStories() {
    this.storiesLoading = true;
    this.http.get<any>(`${environment.apiUrl}/api/stories/preview`).subscribe({
      next: (res: any) => {
        this.stories = Array.isArray(res?.stories) ? res.stories : [];
        this.storiesLoading = false;
      },
      error: () => {
        this.stories = [];
        this.storiesLoading = false;
      }
    });
  }

  openStory(event: { story: any, index: number, isOwn?: boolean }) {
    const { story, index, isOwn } = event;
    const userId = isOwn ? (story?.user?._id || 'me') : story?.user?._id;
    if (!userId) {
      return;
    }

    this.router.navigate(['/stories', userId], {
      queryParams: { index: isOwn ? 0 : index, storyId: story?._id }
    });
  }

loadPosts() {
  this.fetchPosts(this.currentPage);
}

fetchPosts(page: number = 1, append = false) {
  if (this.loading && !(page === 1 && !append)) return;
  this.loading = true;

  this.postService.getPosts(page, this.pageSize).subscribe({
    next: (res: any) => {
      const base = environment.apiUrl.replace(/\/$/, '');
      const posts = Array.isArray(res?.posts) ? res.posts : [];

      const mappedPosts = posts.map((p: any) => {
        const mediaItem = p.media && p.media.length ? p.media[0] : null;
        const mediaPath = mediaItem?.url || '/uploads/default-post.jpg';
        const mediaUrl = `${base}${mediaPath}`;
        const mediaType = mediaItem?.type || 'image';

        const userObj = p.user || null;
        const userAvatar = userObj?.avatar
          ? `${base}${userObj.avatar}`
          : `${base}/uploads/avatars/default-avatar.svg`;
        const mappedUser = userObj
          ? { ...userObj, avatar: userAvatar }
          : { username: 'Unknown User', avatar: `${base}/uploads/avatars/default-avatar.svg` };

        const mappedProducts = (p.products || []).map((pr: any) => {
          const prodData = pr.product || null;
          const prodImage = prodData?.image
            ? `${base}${prodData.image}`
            : `${base}/uploads/default-product.png`;
          return {
            ...pr,
            image: prodImage,
            name: prodData?.name || 'Unnamed Product',
            price: prodData?.price ?? null,
            product: prodData
          };
        });

        return {
          id: p._id,
          caption: p.caption,
          content: p.caption,
          mediaType,
          mediaUrl,
          hashtags: p.hashtags || [],
          mentions: p.mentions || [],
          user: mappedUser,
          products: mappedProducts,
          likes: Array.isArray(p.likes)
            ? p.likes.length
            : (typeof p.likes === 'number' ? p.likes : 0),
          comments: p.comments || [],
          commentsCount: Array.isArray(p.comments)
            ? p.comments.length
            : (p.commentsCount || 0),
          shares: Array.isArray(p.shares) ? p.shares.length : 0,
          saves: Array.isArray(p.saves) ? p.saves.length : 0,
          isLiked: p.isLiked || false,
          isSaved: p.isSaved || false,
          isReel: p.isReel || (mediaType === 'video'),
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          analytics: p.analytics || {},
          engagement: p.engagement || {},
          performance: p.performance || {},
          settings: p.settings || {}
        };
      });

      this.posts = append ? [...this.posts, ...mappedPosts] : mappedPosts;
      this.currentPage = page;
      this.hasMore = posts.length === this.pageSize;
      this.loading = false;
    },
    error: () => {
      if (!append) {
        this.posts = [];
      }
      this.loading = false;
      if (append) {
        this.hasMore = false;
      }
    }
  });
}

openPostCreator() {
  console.log('Open post creator UI');
  // TODO: implement a modal or route to create post
}

showPostOptions(post: any) {
  this.selectedPostForOptions = post;
  this.isPostOptionsOpen = true;
}

closePostOptions() {
  this.isPostOptionsOpen = false;
  this.selectedPostForOptions = null;
}

toggleMessagesPanel() {
  this.messagesPanelOpen = !this.messagesPanelOpen;
}

closeStoryViewer() {
  this.storyViewerOpen = false;
}

onViewerNext() {
  if (this.currentStoryIndex < this.stories.length - 1) {
    this.currentStoryIndex += 1;
  }
}

onViewerPrevious() {
  if (this.currentStoryIndex > 0) {
    this.currentStoryIndex -= 1;
  }
}

viewTaggedProduct(product: any) {
  this.buyNow(product);
}

// Handle image load errors with fallback
onImageError(event: any) {
  if (!event.target.dataset.fallback) {
    event.target.src = `${this.imageUrl}/uploads/default-post.jpg`;
    event.target.dataset.fallback = 'true';
  }
}
}

