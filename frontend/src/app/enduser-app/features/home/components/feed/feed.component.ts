import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../../../../core/services/cart.service';
import { WishlistService } from '../../../../../core/services/wishlist.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { environment } from 'src/environments/environment';
import { PostService } from '../../../../../core/services/post.service';
import { StoryService } from '../../../../../core/services/story.service';
import { HomeApi } from 'src/app/core/api/home.api';

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

  // Get brand image URL
  getBrandImageUrl(product: any): string {
    if (product?.brandImage) {
      return product.brandImage.startsWith('http') 
        ? product.brandImage 
        : `${this.imageUrl}${product.brandImage}`;
    }
    if (product?.brandLogo) {
      return product.brandLogo.startsWith('http') 
        ? product.brandLogo 
        : `${this.imageUrl}${product.brandLogo}`;
    }
    // Fallback to default brand placeholder
    return `${this.imageUrl}/uploads/brands/default-brand.png`;
  }

  // Share post
  sharePost(post: any) {
    const postId = post.id || post._id;
    if (!postId) {
      console.warn('Cannot share post: no ID found', post);
      return;
    }
    this.postService.sharePost(postId).subscribe({
      next: () => {
        post.shares = (post.shares || 0) + 1;
      },
      error: (err: any) => console.error('Share failed:', err)
    });
  }

  // Open post options menu
  openPostOptions(post: any, event: Event): void {
    event.stopPropagation();
    this.selectedPostForOptions = post;
    this.isPostOptionsOpen = true;
  }

  // Close post options menu
  closePostOptions(): void {
    this.isPostOptionsOpen = false;
    this.selectedPostForOptions = null;
  }

  // Save post option
  onSavePost(): void {
    if (this.selectedPostForOptions) {
      this.toggleSave(this.selectedPostForOptions);
      this.closePostOptions();
    }
  }

  // Share post option
  onSharePostOption(): void {
    if (this.selectedPostForOptions) {
      this.sharePost(this.selectedPostForOptions);
      this.closePostOptions();
    }
  }

  // Report post option
  onReportPost(): void {
    if (this.selectedPostForOptions) {
      alert('Report post: ' + (this.selectedPostForOptions.caption || 'Post'));
      this.closePostOptions();
    }
  }

  // Copy post URL option
  onCopyPostUrl(): void {
    if (this.selectedPostForOptions) {
      const postId = this.selectedPostForOptions.id || this.selectedPostForOptions._id;
      const postUrl = `${window.location.origin}/post/${postId}`;
      navigator.clipboard.writeText(postUrl).then(() => {
        alert('Post URL copied to clipboard!');
        this.closePostOptions();
      });
    }
  }

  // Save/unsave post
  toggleSave(post: any) {
    const postId = post.id || post._id;
    if (!postId) {
      console.warn('Cannot save post: no ID found', post);
      return;
    }
    this.postService.savePost(postId).subscribe({
      next: () => {
        post.isSaved = !post.isSaved;
        post.saves = post.isSaved ? post.saves + 1 : post.saves - 1;
      },
      error: (err: any) => console.error('Save failed:', err)
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

  /**
   * Map backend error codes to user-friendly messages
   */
  getErrorMessage(errorCode: string, defaultMessage?: string): string {
    const errorMap: { [key: string]: string } = {
      'MISSING_PRODUCT_ID': 'Product ID is missing or invalid.',
      'MISSING_USER_ID': 'User ID is missing. Please login again.',
      'PRODUCT_NOT_FOUND': 'Product not found. It may have been deleted.',
      'USER_NOT_FOUND': 'User not found. Please login again.',
      'PRODUCT_INACTIVE': 'This product is no longer available.',
      'USER_INACTIVE': 'Your account is inactive. Please contact support.',
      'OUT_OF_STOCK': 'This product is out of stock.',
      'INSUFFICIENT_STOCK': 'Not enough items in stock for the requested quantity.',
      'INVALID_QUANTITY': 'Please enter a valid quantity (at least 1).',
      'ALREADY_IN_WISHLIST': 'Product is already in your wishlist.',
      'ALREADY_IN_CART': 'Product is already in your cart. Use cart to change quantity.',
      'WISHLIST_ITEM_NOT_FOUND': 'Wishlist item not found.',
      'UNAUTHORIZED_WISHLIST_ACCESS': 'You do not have permission to modify this item.',
      'UNAUTHORIZED': 'Please log in to continue.',
      'CART_ITEM_NOT_FOUND': 'Cart item not found.',
      'SERVER_ERROR': 'Server error. Please try again later.',
      'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again.'
    };
    
    return errorMap[errorCode] || defaultMessage || 'An error occurred. Please try again.';
  }

  // Add product to cart
  addToCart(product: any) {
    const productId = product.id || product._id || product.product?._id;
    if (!productId) {
      this.notificationService.error('Error', 'Cannot add to cart: Product ID is missing');
      return;
    }
    
    this.cartService.addToCart(productId, 1).subscribe({
      next: (response) => {
        if (response.itemExists) {
          // Product already in cart
          this.notificationService.info('Already in Cart', `${product.name || 'Product'} is already in your cart (qty: ${response.currentQuantity || 1})`);
        } else {
          this.notificationService.success('Success', `${product.name || 'Product'} added to cart!`);
        }
      },
      error: (err: any) => {
        const errorCode = err?.code || 'UNKNOWN_ERROR';
        const errorMsg = this.getErrorMessage(errorCode, err?.message);
        this.notificationService.error('Error', errorMsg);
        console.error('[FeedComponent] Error adding to cart:', err);
      }
    });
  }

  // Toggle product in wishlist (add or remove)
  toggleWishlist(product: any) {
    const productId = product.id || product._id || product.product?._id;
    if (!productId) {
      this.notificationService.error('Error', 'Cannot add to wishlist: Product ID is missing');
      return;
    }
    
    this.wishlistService.toggleWishlist(productId).subscribe({
      next: (response: any) => {
        // Determine if product was added or removed based on current state
        const isNowInWishlist = this.wishlistService.isInWishlist(productId);
        if (response?.code === 'ALREADY_IN_WISHLIST') {
          // This means it tried to add but was already there
          this.notificationService.info('Already Saved', 'Item is already in your wishlist');
        } else if (isNowInWishlist) {
          this.notificationService.success('Added!', 'Item saved to wishlist');
        } else {
          this.notificationService.success('Removed', 'Item removed from wishlist');
        }
      },
      error: (err: any) => {
        const errorCode = err?.code || 'UNKNOWN_ERROR';
        const errorMsg = this.getErrorMessage(errorCode, err?.message);
        this.notificationService.error('Error', errorMsg);
        console.error('[FeedComponent] Error toggling wishlist:', err);
      }
    });
  }

  isProductInWishlist(product: any): boolean {
    const productId = product.id || product._id || product.product?._id;
    return !!productId && this.wishlistService.isInWishlist(productId);
  }

  // Buy now (navigate to product page)
  buyNow(product: any) {
    const productId = product.id || product._id || product.product?._id;
    if (!productId) {
      console.warn('Cannot buy: no product ID found', product);
      return;
    }
    // Navigate to product detail page
    this.router.navigate(['/products', productId], {
      queryParams: { from: 'post' }
    });
  }

  // Navigate to product detail from product card
  goToProductDetail(product: any) {
    const productId = product.id || product._id || product.product?._id;
    if (!productId) {
      console.warn('Cannot navigate: no product ID');
      return;
    }
    this.router.navigate(['/products', productId]);
  }

  // Toggle notification for post updates
  toggleNotification(post: any) {
    const postId = post.id || post._id;
    if (!postId) {
      console.warn('Cannot toggle notification: no post ID found', post);
      return;
    }
    this.homeApi.togglePostNotification(postId).subscribe({
      next: () => {
        post.isNotified = !post.isNotified;
      },
      error: (err: any) => console.error('Notification toggle failed:', err)
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
    private notificationService: NotificationService,
    private postService: PostService,
    private storyService: StoryService,
    private homeApi: HomeApi
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
    this.homeApi.getStoryPreview().subscribe({
      next: (res: any) => {
        this.stories = Array.isArray(res?.data) ? res.data : [];
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
      const posts = Array.isArray(res?.data) ? res.data : [];

      const mappedPosts = posts.map((p: any) => {
        const mediaItem = p.media && p.media.length ? p.media[0] : null;
        const mediaPath = mediaItem?.url || (p.images && p.images.length ? p.images[0] : '/uploads/default-post.jpg');
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
          // p.products may be an array of product IDs, product objects,
          // or wrapper objects like { product: { ... } } depending on backend.
          const prodData = pr?.product ? pr.product : (pr?.name ? pr : null);
          const prodImage = prodData?.image || prodData?.imageUrl
            ? `${base}${prodData.image || prodData.imageUrl}`
            : `${base}/uploads/default-product.svg`;
          return {
            // if pr already contains meta (like quantity), preserve it
            ...(typeof pr === 'object' && !prodData ? pr : {}),
            image: prodImage,
            name: prodData?.name || 'Unnamed Product',
            price: prodData?.price ?? null,
            product: prodData
          };
        });

        return {
          id: p.id || p._id,
          caption: p.caption || p.content,
          content: p.caption || p.content,
          mediaType,
          mediaUrl,
          hashtags: p.hashtags || [],
          mentions: p.mentions || [],
          user: mappedUser,
          products: mappedProducts,
          likes: Array.isArray(p.likes) ? p.likes.length : (typeof p.likes === 'number' ? p.likes : 0),
          comments: p.comments || [],
          commentsCount: Array.isArray(p.comments) ? p.comments.length : (p.commentsCount || 0),
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
onImageError(event: Event) {
  const target = event?.target as HTMLImageElement | null;
  if (!target) return;
  const dataset: any = (target.dataset as DOMStringMap) || {};
  if (!dataset.fallback) {
    target.src = `${this.imageUrl}/uploads/default-post.jpg`;
    dataset.fallback = 'true';
  }
}
}

