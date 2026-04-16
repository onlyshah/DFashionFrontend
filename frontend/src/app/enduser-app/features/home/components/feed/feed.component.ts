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
    const url = `${environment.apiUrl}/api/posts/${postId}/share`;
    this.http.post(url, {}).subscribe({
      next: () => {
        post.shares = (post.shares || 0) + 1;
      },
      error: (err) => console.error('Share failed:', err)
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
    const url = `${environment.apiUrl}/api/posts/${postId}/save`;
    this.http.post(url, {}).subscribe({
      next: () => {
        post.isSaved = !post.isSaved;
        post.saves = post.isSaved ? post.saves + 1 : post.saves - 1;
      },
      error: (err) => console.error('Save failed:', err)
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
    const productId = product.id || product._id || product.product?._id;
    if (!productId) {
      console.warn('Cannot add to cart: no product ID');
      return;
    }
    
    this.cartService.addToCart(productId, 1).subscribe({
      next: (response) => {
        if (response.itemExists) {
          // Show prompt to increase quantity
          if (confirm(`${product.name || 'Product'} is already in your cart (qty: ${response.currentQuantity || 1}). Would you like to increase the quantity?`)) {
            const newQty = (response.currentQuantity || 1) + 1;
            this.cartService.updateCartItemQuantity(productId, newQty).subscribe({
              next: () => alert(`Quantity updated to ${newQty}`),
              error: (err) => console.error('Failed to update quantity:', err)
            });
          }
        } else {
          alert(`✓ ${product.name || 'Product'} added to cart!`);
        }
      },
      error: (err) => console.error('Error adding to cart:', err)
    });
  }

  // Add product to wishlist
  addToWishlist(product: any) {
    const productId = product.id || product._id || product.product?._id;
    if (!productId) {
      console.warn('Cannot add to wishlist: no product ID');
      return;
    }
    
    this.wishlistService.addToWishlist(productId).subscribe({
      next: (response) => {
        if (response.itemExists) {
          alert('✓ This product is already in your wishlist');
        } else {
          alert(`✓ ${product.name || 'Product'} added to wishlist!`);
        }
      },
      error: (err) => console.error('Error adding to wishlist:', err)
    });
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
    const url = `${environment.apiUrl}/api/posts/${postId}/notification`;
    this.http.post(url, {}).subscribe({
      next: () => {
        post.isNotified = !post.isNotified;
      },
      error: (err) => console.error('Notification toggle failed:', err)
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
          id: p.id || p._id,
          caption: p.caption || p.content,
          content: p.caption || p.content,
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

