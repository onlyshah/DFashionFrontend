/**
 * Unified Navigation Service
 * Handles cross-platform routing (Mobile & Web)
 * Automatically selects correct route based on device/platform
 */

import { Injectable } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { Platform } from '@angular/cdk/platform';

@Injectable({
  providedIn: 'root'
})
export class UnifiedNavigationService {
  
  private isMobileApp: boolean;

  constructor(
    private router: Router,
    private platform: Platform
  ) {
    // Detect if running in mobile app (Ionic)
    this.isMobileApp = this.platform.ANDROID || this.platform.IOS;
  }

  /**
   * Detect if current environment is mobile
   */
  private isMobileEnvironment(): boolean {
    return this.isMobileApp || 
           window.innerWidth < 768 ||
           /mobile|tablet|android|ios|iphone|ipad/i.test(navigator.userAgent);
  }

  /**
   * ✅ PRIMARY: View product (handles both web & mobile)
   * Web: /products/:id
   * Mobile: /tabs/product/:id
   */
  viewProduct(
    productId: string,
    options?: { source?: string; metadata?: any; postId?: string | null }
  ): Promise<boolean> {
    const route = this.isMobileEnvironment() 
      ? `/tabs/product/${productId}`
      : `/products/${productId}`;

    const navigationExtras: NavigationExtras = {};
    if (options?.source) {
      navigationExtras.queryParams = { source: options.source };
    }

    console.log(`🔗 Navigating to product: ${route}`);
    return this.router.navigate([route], navigationExtras);
  }

  /**
   * ✅ View post/social content
   * Web: /posts/:id
   * Mobile: /tabs/posts/:id
   */
  viewPost(
    postId: string,
    options?: { type?: 'post' | 'reel' | 'story' }
  ): Promise<boolean> {
    let route: string;

    if (this.isMobileEnvironment()) {
      // Mobile routing
      if (options?.type === 'reel') {
        route = `/tabs/reels/${postId}`;
      } else if (options?.type === 'story') {
        route = `/tabs/stories/${postId}`;
      } else {
        route = `/tabs/posts/${postId}`;
      }
    } else {
      // Web routing
      route = `/posts/${postId}`;
    }

    console.log(`🔗 Navigating to post: ${route}`);
    return this.router.navigate([route]);
  }

  /**
   * ✅ View user profile
   * Web: /profile/:userId
   * Mobile: /tabs/profile/:userId
   */
  viewProfile(userId: string): Promise<boolean> {
    const route = this.isMobileEnvironment()
      ? `/tabs/profile/${userId}`
      : `/profile/${userId}`;

    return this.router.navigate([route]);
  }

  /**
   * ✅ CRITICAL: Navigate to checkout
   * Web: /shop/checkout
   * Mobile: /tabs/checkout/:cartId
   */
  goToCheckout(cartId?: string): Promise<boolean> {
    let route: string;

    if (this.isMobileEnvironment()) {
      route = cartId 
        ? `/tabs/checkout/${cartId}`
        : `/tabs/checkout`;
    } else {
      route = '/shop/checkout';
    }

    console.log(`🔗 Navigating to checkout: ${route}`);
    return this.router.navigate([route]);
  }

  /**
   * ✅ View shopping cart
   * Web: /shop/cart
   * Mobile: /tabs/cart
   */
  viewCart(): Promise<boolean> {
    const route = this.isMobileEnvironment()
      ? `/tabs/cart`
      : `/shop/cart`;

    return this.router.navigate([route]);
  }

  /**
   * ✅ View wishlist
   * Web: /shop/wishlist
   * Mobile: /tabs/wishlist
   */
  viewWishlist(): Promise<boolean> {
    const route = this.isMobileEnvironment()
      ? `/tabs/wishlist`
      : `/shop/wishlist`;

    return this.router.navigate([route]);
  }

  /**
   * ✅ Search/Discover
   * Web: /search
   * Mobile: /tabs/search
   */
  search(query?: string): Promise<boolean> {
    const route = this.isMobileEnvironment()
      ? `/tabs/search`
      : `/search`;

    const navigationExtras: NavigationExtras = {};
    if (query) {
      navigationExtras.queryParams = { q: query };
    }

    return this.router.navigate([route], navigationExtras);
  }

  /**
   * ✅ View order confirmation
   * Web: /shop/order-confirmation/:orderId
   * Mobile: /tabs/order-confirmation/:orderId
   */
  viewOrderConfirmation(orderId: string): Promise<boolean> {
    const route = this.isMobileEnvironment()
      ? `/tabs/order-confirmation/${orderId}`
      : `/shop/order-confirmation/${orderId}`;

    return this.router.navigate([route]);
  }

  /**
   * ✅ View order tracking
   * Web: /shop/order-tracking/:orderId
   * Mobile: /tabs/order-tracking/:orderId
   */
  viewOrderTracking(orderId: string): Promise<boolean> {
    const route = this.isMobileEnvironment()
      ? `/tabs/order-tracking/${orderId}`
      : `/shop/order-tracking/${orderId}`;

    return this.router.navigate([route]);
  }

  /**
   * ✅ View orders history
   * Web: /profile/orders
   * Mobile: /tabs/orders
   */
  viewOrders(): Promise<boolean> {
    const route = this.isMobileEnvironment()
      ? `/tabs/orders`
      : `/profile/orders`;

    return this.router.navigate([route]);
  }

  /**
   * ✅ Create new content
   * Web: /create-post, /create-story, /create-reel
   * Mobile: /tabs/create-post, /tabs/create-story, /tabs/create-reel
   */
  createContent(type: 'post' | 'story' | 'reel' | 'live' = 'post'): Promise<boolean> {
    let route: string;

    if (this.isMobileEnvironment()) {
      route = `/tabs/create-${type}`;
    } else {
      route = `/create-${type}`;
    }

    return this.router.navigate([route]);
  }

  /**
   * ✅ View product categories
   * Web: /shop or /categories
   * Mobile: /tabs/categories
   */
  viewCategories(): Promise<boolean> {
    const route = this.isMobileEnvironment()
      ? `/tabs/categories`
      : `/shop`;

    return this.router.navigate([route]);
  }

  /**
   * ✅ View category products
   * Web: /category/:name
   * Mobile: /tabs/categories/:name (or route to products)
   */
  viewCategory(categoryName: string): Promise<boolean> {
    const route = this.isMobileEnvironment()
      ? `/tabs/categories/${categoryName}`
      : `/category/${categoryName}`;

    return this.router.navigate([route]);
  }

  /**
   * ✅ View payment methods
   * Web: /shop/payment-methods
   * Mobile: /tabs/payment-methods
   */
  viewPaymentMethods(): Promise<boolean> {
    const route = this.isMobileEnvironment()
      ? `/tabs/payment-methods`
      : `/shop/payment-methods`;

    return this.router.navigate([route]);
  }

  /**
   * ✅ Write product review
   * Web: /shop/write-review/:productId
   * Mobile: /tabs/review/:productId
   */
  writeReview(productId: string): Promise<boolean> {
    const route = this.isMobileEnvironment()
      ? `/tabs/review/${productId}`
      : `/shop/write-review/${productId}`;

    return this.router.navigate([route]);
  }

  /**
   * ✅ View returns/refunds
   * Web: /profile/returns
   * Mobile: /tabs/returns
   */
  viewReturns(): Promise<boolean> {
    const route = this.isMobileEnvironment()
      ? `/tabs/returns`
      : `/profile/returns`;

    return this.router.navigate([route]);
  }

  /**
   * ✅ Go home
   */
  goHome(): Promise<boolean> {
    const route = this.isMobileEnvironment()
      ? `/tabs/home`
      : `/home`;

    return this.router.navigate([route]);
  }

  /**
   * ✅ Generic navigate method for custom routes
   * Falls back to standard routing
   */
  navigate(commands: any[], extras?: NavigationExtras): Promise<boolean> {
    return this.router.navigate(commands, extras);
  }

  /**
   * ✅ Back navigation
   */
  goBack(): void {
    window.history.back();
  }

  /**
   * The CRITICAL Flow: Post → Product → Cart → Checkout
   * One function to handle complete social-to-commerce conversion
   */
  async executeSocialToCommerceFlow(
    postId: string,
    productId: string,
    quantity: number = 1
  ): Promise<void> {
    console.log(`🔄 Starting social-to-commerce flow:`, {
      postId,
      productId,
      quantity
    });

    try {
      // Step 1: Navigate to product
      await this.viewProduct(productId, { source: 'post', metadata: { postId } });
      
      // User will manually add to cart or click "Buy Now"
      // Step 2: Add to cart (done by component)
      // Step 3: Navigate to cart (done by component)
      // Step 4: Navigate to checkout (done by component)
      
      console.log(`✅ Social-to-commerce flow initiated`);
    } catch (error) {
      console.error('❌ Flow error:', error);
    }
  }

  /**
   * Platform detection utilities
   */
  isPlatformMobile(): boolean {
    return this.isMobileEnvironment();
  }

  getPlatformRoute(webRoute: string, mobileRoute: string): string {
    return this.isMobileEnvironment() ? mobileRoute : webRoute;
  }
}
