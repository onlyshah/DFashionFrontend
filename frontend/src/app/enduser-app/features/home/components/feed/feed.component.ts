import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../../../../core/services/cart.service';
import { WishlistService } from '../../../../../core/services/wishlist.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

import { StoriesListComponent } from '../../../stories/stories-list.component';
@Component({
  selector: 'app-feed',
  imports: [CommonModule, FormsModule, StoriesListComponent],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})



export class FeedComponent implements OnInit {
  posts: any[] = [];
  loading = true;
  hasMore = true;
  currentPage = 1;
  newComment = '';
  imageUrl = environment.apiUrl;
  stories: any[] = [];
  storiesLoading = true;

  // TrackBy for ngFor
  trackByPostId(index: number, post: any) {
    return post.id;
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
    const url = `${environment.apiUrl}/api/posts/${post.id}/like`;
    this.http.post(url, {}).subscribe({
      next: () => {
        post.isLiked = !post.isLiked;
        post.likes = post.isLiked ? post.likes + 1 : post.likes - 1;
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
    const url = `${environment.apiUrl}/api/posts/${post.id}/comment`;
    this.http.post(url, { text: commentText }).subscribe({
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
    this.cartService.addToCart(product.product || product);
  }

  // Add product to wishlist
  addToWishlist(product: any) {
    this.wishlistService.addToWishlist(product.product || product);
  }

  // Buy now (navigate to product page)
  buyNow(product: any) {
    const prodId = product.product?._id || product._id;
    if (prodId) {
      this.router.navigate(['/product', prodId]);
    }
  }

  // Load more posts (pagination)
  loadMorePosts() {
    if (!this.hasMore || this.loading) return;
    this.loading = true;
    this.currentPage++;
    this.http.get<any>(`${environment.apiUrl}/api/posts?page=${this.currentPage}`).subscribe({
      next: (res: any) => {
        console.log('post',res)
        if (!res?.posts || !Array.isArray(res.posts) || res.posts.length === 0) {
          this.hasMore = false;
          this.loading = false;
          return;
        }
        const base = environment.apiUrl.replace(/\/$/, '');
        const newPosts = res.posts.map((p: any) => {
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
        this.posts = [...this.posts, ...newPosts];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.hasMore = false;
      }
    });
  }
  constructor(
    private router: Router,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private http: HttpClient

  ) {}


  ngOnInit() {
    this.loadPosts();
    this.loadStories();
    // Debug: log feed data after loading
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

  openStory(event: { story: any, index: number }) {
    const { story, index } = event;
    this.router.navigate(['/stories', story.user._id], {
      queryParams: { index, storyId: story._id }
    });
  }

loadPosts() {
  this.loading = true;
  this.http.get<any>(`${environment.apiUrl}/api/posts`).subscribe({
    next: (res: any) => {
      const base = environment.apiUrl.replace(/\/$/, ''); // remove trailing slash
      if (!res?.posts || !Array.isArray(res.posts)) {
        this.posts = [];
        this.loading = false;
        return;
      }

      this.posts = res.posts.map((p: any) => {
        const mediaItem = p.media && p.media.length ? p.media[0] : null;
        const mediaPath = mediaItem?.url || '/uploads/default-post.jpg';
        const mediaUrl = `${base}${mediaPath}`; // full URL to image/video
        const mediaType = mediaItem?.type || 'image';

        // user/avatar fallback to server default
        const userObj = p.user || null;
        const userAvatar = userObj?.avatar
          ? `${base}${userObj.avatar}`
          : `${base}/uploads/avatars/default-avatar.svg`;
        const mappedUser = userObj
          ? { ...userObj, avatar: userAvatar }
          : { username: 'Unknown User', avatar: `${base}/uploads/avatars/default-avatar.svg` };

        // map product items so template can use product.image, product.name, product.price
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

      this.loading = false; // ✅ put here
    },
    error: () => {
      this.posts = [];
      this.loading = false;
    }
  });
}
}
