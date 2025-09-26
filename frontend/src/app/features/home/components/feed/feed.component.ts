import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {
  posts: any[] = [];
  loading = true;
  hasMore = true;
  currentPage = 1;
  newComment = '';

  constructor(
    private router: Router,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private http: HttpClient

  ) {}

  ngOnInit() {
  this.loadPosts();
  }

  loadPosts() {
    this.loading = true;
    // TODO: Replace with real API call to backend for posts
    // Example:
    this.http.get<any[]>(`${environment.apiUrl}/api/posts`).subscribe({
      next: (data:any) => {
        this.posts = data;
        this.loading = false;
      },
      error: (err:any) => {
        this.posts = [];
        this.loading = false;
      }
    });
    this.posts = [];
    this.loading = false;
  }




  loadMorePosts() {
    this.currentPage++;
    this.loadPosts();
  }

  trackByPostId(index: number, post: any): string {
    return post._id;
  }

  // Instagram-style Actions
  toggleLike(post: any) {
    post.isLiked = !post.isLiked;
    post.likes += post.isLiked ? 1 : -1;
  }

  toggleSave(post: any) {
    post.isSaved = !post.isSaved;
  }

  toggleComments(post: any) {
    // Navigate to post detail or show comments modal
    console.log('Toggle comments for post:', post._id);
  }

  sharePost(post: any) {
    // Implement share functionality
    console.log('Share post:', post._id);
  }

  addComment(post: any) {
    if (this.newComment.trim()) {
      post.comments += 1;
      console.log('Add comment:', this.newComment, 'to post:', post._id);
      this.newComment = '';
    }
  }

  focusCommentInput(post: any) {
    // Focus on comment input
    console.log('Focus comment input for post:', post._id);
  }

  toggleVideoPlay(event: Event) {
    const video = event.target as HTMLVideoElement;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  showProductDetails(product: any) {
    console.log('Show product details:', product);
  }

  viewProduct(product: any) {
    this.router.navigate(['/product', product._id]);
  }

  formatLikesCount(likes: number): string {
    if (likes === 1) return '1 like';
    if (likes < 1000) return `${likes} likes`;
    if (likes < 1000000) return `${(likes / 1000).toFixed(1)}K likes`;
    return `${(likes / 1000000).toFixed(1)}M likes`;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  }

  getTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w`;
  }

  // E-commerce Actions
  addToCart(product: any) {
    console.log('Adding to cart:', product);
    this.cartService.addToCart(product._id, 1, undefined, undefined).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Product added to cart!');
        } else {
          alert('Failed to add product to cart');
        }
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        alert('Error adding product to cart');
      }
    });
  }

  addToWishlist(product: any) {
    console.log('Adding to wishlist:', product);
    this.wishlistService.addToWishlist(product._id).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Product added to wishlist!');
        } else {
          alert('Failed to add product to wishlist');
        }
      },
      error: (error) => {
        console.error('Error adding to wishlist:', error);
        alert('Error adding product to wishlist');
      }
    });
  }

  buyNow(product: any) {
    console.log('Buying product:', product);
    this.router.navigate(['/checkout'], {
      queryParams: {
        productId: product._id,
        source: 'feed'
      }
    });
  }
}
