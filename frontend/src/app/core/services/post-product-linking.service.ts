/**
 * Post-Product Linking Service
 * Connects social media posts to e-commerce products
 * Enables "Buy Now" flow from posts
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface PostProduct {
  productId: string;
  postId: string;
  position: number;
  linkedAt: Date;
}

export interface PostWithProducts {
  _id: string;
  content: string;
  image?: string;
  products: any[];           // Linked product details
  productIds: string[];      // Product IDs for backend linking
  userId: string;
  likes: number;
  shares: number;
  comments: number;
  createdAt: Date;
  source?: string;           // Track if created from post
}

@Injectable({
  providedIn: 'root'
})
export class PostProductLinkingService {
  
  private apiUrl = `${environment.apiUrl}/api`;
  private linkedProducts$ = new BehaviorSubject<PostProduct[]>([]);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Create a post with linked products
   * Called when user creates post with selected products
   */
  createPostWithProducts(
    postData: any,
    productIds: string[]
  ): Observable<PostWithProducts> {
    const payload = {
      ...postData,
      productIds: productIds,
      source: 'social'
    };

    return this.http.post<PostWithProducts>(
      `${this.apiUrl}/posts/with-products`,
      payload
    ).pipe(
      tap(post => {
        console.log('✅ Post created with products:', post);
      })
    );
  }

  /**
   * Get a post with all linked products
   * Used when viewing post detail
   */
  getPostWithProducts(postId: string): Observable<PostWithProducts> {
    return this.http.get<PostWithProducts>(
      `${this.apiUrl}/posts/${postId}/with-products`
    ).pipe(
      tap(post => {
        if (post.products && post.products.length > 0) {
          console.log(`✅ Loaded post with ${post.products.length} products`);
        }
      })
    );
  }

  /**
   * Link products to an existing post
   * For editing posts to add more products
   */
  linkProductsToPost(
    postId: string,
    productIds: string[]
  ): Observable<PostWithProducts> {
    return this.http.put<PostWithProducts>(
      `${this.apiUrl}/posts/${postId}/link-products`,
      { productIds }
    ).pipe(
      tap(post => {
        console.log('✅ Products linked to post');
      })
    );
  }

  /**
   * Unlink a product from a post
   */
  unlinkProductFromPost(postId: string, productId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/posts/${postId}/products/${productId}`
    );
  }

  /**
   * Get all posts that link to a specific product
   * Used to show "Featured in Posts" on product page
   */
  getPostsForProduct(productId: string): Observable<PostWithProducts[]> {
    return this.http.get<PostWithProducts[]>(
      `${this.apiUrl}/products/${productId}/posts`
    );
  }

  /**
   * CRITICAL: Navigate from post to product
   * Used by "Buy Now" button in post detail
   * 
   * This is the KEY method connecting social → e-commerce
   */
  navigateToProductFromPost(
    postId: string,
    productId: string,
    metadata?: any
  ): void {
    // Track user interaction
    this.trackPostProductInteraction(postId, productId, 'buy_click', metadata);

    // Navigate based on platform
    const isMobile = this.isMobileDevice();
    const route = isMobile 
      ? `/tabs/product/${productId}`
      : `/products/${productId}`;

    this.router.navigate([route], {
      queryParams: {
        source: 'post',
        postId: postId,
        timestamp: Date.now()
      }
    });
  }

  /**
   * Add product to cart from post
   * One-click checkout from social content
   */
  addToCartFromPost(
    postId: string,
    productId: string,
    quantity: number = 1
  ): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/cart/add-from-post`,
      {
        productId,
        quantity,
        source: 'post',
        postId
      }
    ).pipe(
      tap(() => {
        console.log(`✅ Added to cart from post: ${productId}`);
        this.trackPostProductInteraction(postId, productId, 'add_to_cart');
      })
    );
  }

  /**
   * Track user interactions for analytics
   * Helps understand social-to-commerce conversion
   */
  trackPostProductInteraction(
    postId: string,
    productId: string,
    action: 'view' | 'buy_click' | 'add_to_cart' | 'purchase' | 'product_view',
    metadata?: any
  ): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/analytics/post-product-interaction`,
      {
        postId,
        productId,
        action,
        timestamp: new Date(),
        metadata
      }
    ).pipe(
      tap(() => console.log('Analytics recorded:', action)),
      catchError(err => {
        console.warn('Analytics tracking failed:', err);
        return of(undefined);
      })
    );
  }

  /**
   * Get trending products from posts
   * Shows which products are popular on social
   */
  getTrendingProductsFromPosts(limit: number = 10): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/posts/trending-products?limit=${limit}`
    );
  }

  /**
   * Search posts by product
   * Helpful for discovering posts about a product
   */
  searchPostsByProduct(
    productId: string,
    filters?: any
  ): Observable<PostWithProducts[]> {
    const params = new URLSearchParams();
    params.set('productId', productId);

    if (filters) {
      if (filters.sort) params.set('sort', filters.sort);
      if (filters.limit) params.set('limit', filters.limit.toString());
    }

    return this.http.get<PostWithProducts[]>(
      `${this.apiUrl}/posts/search?${params.toString()}`
    );
  }

  /**
   * Get related posts for a product
   * Show "Featured in these posts" on product page
   */
  getRelatedPostsForProduct(productId: string): Observable<PostWithProducts[]> {
    return this.http.get<PostWithProducts[]>(
      `${this.apiUrl}/products/${productId}/related-posts`
    );
  }

  /**
   * Platform detection helper
   */
  private isMobileDevice(): boolean {
    const userAgent = navigator.userAgent || navigator.vendor;
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent.toLowerCase()
    );
  }

  /**
   * Get featured products for a post
   * Returns first N products
   */
  getFeaturedProducts(postId: string, limit: number = 3): Observable<any[]> {
    return this.getPostWithProducts(postId).pipe(
      map(post => post.products ? post.products.slice(0, limit) : [])
    );
  }
}
