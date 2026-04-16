import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface SocialInteractionResponse {
  success: boolean;
  message: string;
  isLiked?: boolean;
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
}

export interface Comment {
  _id: string;
  user: {
    _id: string;
    username: string;
    fullName: string;
    avatar?: string;
  };
  text: string;
  likes: string[];
  replies: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ShareData {
  platform: 'facebook' | 'twitter' | 'instagram' | 'whatsapp' | 'email' | 'copy_link';
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SocialInteractionsService {
  private API_URL = environment.apiUrl + '/api'; // Use environment configuration
  
  // Track liked items to update UI immediately
  private likedProductsSubject = new BehaviorSubject<Set<string>>(new Set());
  private likedPostsSubject = new BehaviorSubject<Set<string>>(new Set());
  
  public likedProducts$ = this.likedProductsSubject.asObservable();
  public likedPosts$ = this.likedPostsSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.loadUserLikes();
  }

  // ==================== PRODUCT SOCIAL INTERACTIONS ====================

  /**
   * Like or unlike a product
   */
  async likeProduct(productId: string): Promise<SocialInteractionResponse> {
    try {
      const token = this.authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await this.http.post<SocialInteractionResponse>(
        `${this.API_URL}/ecommerce/products/${productId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      ).toPromise();

      if (response?.success) {
        // Update local state
        const currentLiked = this.likedProductsSubject.value;
        if (response.isLiked) {
          currentLiked.add(productId);
        } else {
          currentLiked.delete(productId);
        }
        this.likedProductsSubject.next(new Set(currentLiked));
      }

      return response || { success: false, message: 'Unknown error' };
    } catch (error) {
      console.error('Error liking product:', error);
      return { success: false, message: 'Failed to like product' };
    }
  }

  /**
   * Share a product
   */
  async shareProduct(productId: string, shareData: ShareData): Promise<SocialInteractionResponse> {
    try {
      const token = this.authService.getToken();
      if (!token) {
        console.warn('User not authenticated for sharing product');
        return { success: false, message: 'Please login to share products' };
      }

      const response = await this.http.post<SocialInteractionResponse>(
        `${this.API_URL}/product-shares/${productId}/share`,
        shareData,
        { headers: { Authorization: `Bearer ${token}` } }
      ).toPromise();

      return response || { success: false, message: 'Unknown error' };
    } catch (error: any) {
      console.error('Error sharing product:', error);
      if (error?.status === 401) {
        return { success: false, message: 'Session expired. Please login again.' };
      }
      return { success: false, message: 'Failed to share product' };
    }
  }

  /**
   * Add comment to product
   */
  async commentOnProduct(productId: string, text: string, rating: number): Promise<SocialInteractionResponse> {
    try {
      const token = this.authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await this.http.post<SocialInteractionResponse>(
  `${this.API_URL}/product-comments`,
        { product: productId, text, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      ).toPromise();

      return response || { success: false, message: 'Unknown error' };
    } catch (error) {
      console.error('Error commenting on product:', error);
      return { success: false, message: 'Failed to add comment' };
    }
  }

  /**
   * Get product comments
   */
  async getProductComments(productId: string, page: number = 1, limit: number = 10): Promise<{ comments: Comment[], total: number }> {
    try {
      const response = await this.http.get<any>(
  `${this.API_URL}/product-comments?product=${productId}&page=${page}&limit=${limit}`
      ).toPromise();

      return {
        comments: response?.data?.comments || [],
        total: response?.data?.total || 0
      };
    } catch (error) {
      console.error('Error fetching product comments:', error);
      return { comments: [], total: 0 };
    }
  }

  // ==================== POST SOCIAL INTERACTIONS ====================

  /**
   * Like or unlike a post
   */
  async likePost(postId: string): Promise<SocialInteractionResponse> {
    try {
      const token = this.authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await this.http.post<SocialInteractionResponse>(
  `${this.API_URL}/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      ).toPromise();

      if (response?.success) {
        // Update local state
        const currentLiked = this.likedPostsSubject.value;
        if (response.isLiked) {
          currentLiked.add(postId);
        } else {
          currentLiked.delete(postId);
        }
        this.likedPostsSubject.next(new Set(currentLiked));
      }

      return response || { success: false, message: 'Unknown error' };
    } catch (error) {
      console.error('Error liking post:', error);
      return { success: false, message: 'Failed to like post' };
    }
  }

  /**
   * Share a post
   */
  async sharePost(postId: string, shareData: ShareData): Promise<SocialInteractionResponse> {
    try {
      const token = this.authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await this.http.post<SocialInteractionResponse>(
  `${this.API_URL}/posts/${postId}/share`,
        shareData,
        { headers: { Authorization: `Bearer ${token}` } }
      ).toPromise();

      return response || { success: false, message: 'Unknown error' };
    } catch (error) {
      console.error('Error sharing post:', error);
      return { success: false, message: 'Failed to share post' };
    }
  }

  /**
   * Add comment to post
   */
  async commentOnPost(postId: string, text: string): Promise<SocialInteractionResponse> {
    try {
      const token = this.authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await this.http.post<SocialInteractionResponse>(
  `${this.API_URL}/posts/${postId}/comment`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      ).toPromise();

      return response || { success: false, message: 'Unknown error' };
    } catch (error) {
      console.error('Error commenting on post:', error);
      return { success: false, message: 'Failed to add comment' };
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Check if user has liked a product
   */
  isProductLiked(productId: string): boolean {
    return this.likedProductsSubject.value.has(productId);
  }

  /**
   * Check if user has liked a post
   */
  isPostLiked(postId: string): boolean {
    return this.likedPostsSubject.value.has(postId);
  }

  /**
   * Load user's liked items on service initialization
   */
  private async loadUserLikes(): Promise<void> {
    try {
      const token = this.authService.getToken();
      if (!token) return;

      // Load liked products
      try {
        const productsResponse = await this.http.get<any>(
          `${this.API_URL}/users/liked-products`,
          { headers: { Authorization: `Bearer ${token}` } }
        ).toPromise();

        if (productsResponse?.success || Array.isArray(productsResponse)) {
          const data = Array.isArray(productsResponse) ? productsResponse : productsResponse?.data || [];
          const likedProductIds = new Set<string>(data.map((item: any) => item._id || item.id));
          this.likedProductsSubject.next(likedProductIds);
        }
      } catch (error: any) {
        // Silently handle 404 - endpoint may not be available
        if (error?.status !== 404) {
          console.warn('⚠️ Could not load liked products:', error?.message);
        }
      }

      // Load liked posts
      try {
        const postsResponse = await this.http.get<any>(
          `${this.API_URL}/users/liked-posts`,
          { headers: { Authorization: `Bearer ${token}` } }
        ).toPromise();

        if (postsResponse?.success || Array.isArray(postsResponse)) {
          const data = Array.isArray(postsResponse) ? postsResponse : postsResponse?.data || [];
          const likedPostIds = new Set<string>(data.map((item: any) => item._id || item.id));
          this.likedPostsSubject.next(likedPostIds);
        }
      } catch (error: any) {
        // Silently handle 404 - endpoint may not be available
        if (error?.status !== 404) {
          console.warn('⚠️ Could not load liked posts:', error?.message);
        }
      }
    } catch (error) {
      console.warn('⚠️ Error loading user likes:', error);
    }
  }

  /**
   * Clear user data on logout
   */
  clearUserData(): void {
    this.likedProductsSubject.next(new Set());
    this.likedPostsSubject.next(new Set());
  }

  /**
   * Generate share URL for different platforms
   */
  generateShareUrl(platform: string, url: string, text: string): string {
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);

    switch (platform) {
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
      case 'twitter':
        return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
      case 'whatsapp':
        return `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
      case 'email':
        return `mailto:?subject=${encodedText}&body=${encodedUrl}`;
      default:
        return url;
    }
  }
}
