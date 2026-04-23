import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UnifiedApiService } from '../../../../../core/services/unified-api.service';
import { Product } from '../../../../../core/models/product.interface';
import { SocialInteractionsService } from '../../../../../core/services/social-interactions.service';
import { CartService } from '../../../../../core/services/cart.service';
import { WishlistService } from '../../../../../core/services/wishlist.service';
import { ProductStateService } from '../../../../../core/services/product-state.service';
import { IonicModule } from '@ionic/angular';
//import { ImageFallbackDirective } from '../../../../shared/directives/image-fallback.directive';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-trending-products',
    imports: [CommonModule, IonicModule],
    templateUrl: './trending-products.component.html',
    styleUrls: ['./trending-products.component.scss']
})
export class TrendingProductsComponent implements OnInit, OnDestroy {
  trendingProducts: Product[] = [];
  isLoading = true;
  error: string | null = null;
  likedProducts = new Set<string>();
  loadingProductIds = new Set<string>(); // Track which products are currently loading
  private subscription: Subscription = new Subscription();

  // Slider properties
  currentSlide = 0;
  slideOffset = 0;
  cardWidth = 256; // Width of each product card (240px) +gap (16px)
  visibleCards = 2; // Number of cards visible at once
  maxSlide = 0;

  // Auto-sliding properties
  autoSlideInterval: any;
  autoSlideDelay = 3500; // 3.5 seconds for trending products
  isAutoSliding = true;
  isPaused = false;
  imageUrl = environment.apiUrl

  backendProductPlaceholder = environment.apiUrl + '/uploads/default-product.svg';

  getProductImageUrl(product: Product): string {
    if (!product || !product.images || product.images.length === 0) {
      return this.backendProductPlaceholder;
    }

    const url = (product.images[0] as any)?.url || product.images[0];
    
    // If already absolute URL, return as-is
    if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
      return url;
    }

    // If relative path, prepend API URL
    if (typeof url === 'string' && url.startsWith('/')) {
      return environment.apiUrl + url;
    }

    // Fallback to placeholder
    return this.backendProductPlaceholder;
  }

  constructor(
    private unifiedApi: UnifiedApiService,
    private socialService: SocialInteractionsService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private productStateService: ProductStateService,
    private router: Router
  ) {
   
  }

  ngOnInit() {
    this.loadTrendingProducts();
    this.subscribeLikedProducts();
    this.updateResponsiveSettings();
    this.setupResizeListener();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.stopAutoSlide();
  }

  private subscribeLikedProducts() {
    this.subscription.add(
      this.socialService.likedProducts$.subscribe(likedProducts => {
        this.likedProducts = likedProducts;
      })
    );
  }

  onLikesChange(likedProducts: Product[] | any[]): void {
    this.likedProducts = new Set(likedProducts.map((product: Product) => product.id || product._id));
  }

  loadTrendingProducts(): void {
    this.isLoading = true;
    this.error = null;
    this.unifiedApi.getTrendingProducts(1, 8).subscribe(
      (response: any) => {
        this.trendingProducts = response?.data || response?.products || [];
        this.isLoading = false;
        this.updateSliderOnProductsLoad();
      },
      (error: any) => {
        this.error = 'Failed to load trending products';
        this.isLoading = false;
      }
    );
  }

  onProductClick(product: Product) {
    const productId = product.id || product._id;
    if (!product || !productId) {
      console.error('Product or product ID is undefined', product);
      return;
    }
    this.router.navigate(['/products', productId]);
  }

  async onLikeProduct(product: Product, event: Event) {
    event.stopPropagation();
    const productId = product.id || product._id;
    if (!productId) return;
    try {
      const result = await this.socialService.likeProduct(productId);
      if (result.success) {
        console.log(result.message);
      } else {
        console.error('Failed to like product:', result.message);
      }
    } catch (error) {
      console.error('Error liking product:', error);
    }
  }

  async onShareProduct(product: Product, event: Event) {
    event.stopPropagation();
    const productId = product.id || product._id;
    if (!productId) return;
    try {
      // For now, copy link to clipboard
      const productUrl = `${window.location.origin}/products/${productId}`;
      await navigator.clipboard.writeText(productUrl);

      // Track the share
      await this.socialService.shareProduct(productId, {
        platform: 'copy_link',
        message: `Check out this amazing ${product.name} from ${product.brand}!`
      });

      console.log('Product link copied to clipboard!');
    } catch (error) {
      console.error('Error sharing product:', error);
    }
  }

  /**
   * Toggle cart state for a product
   */
  onCartToggle(event: Event, product: Product, newState: boolean): void {
    event.stopPropagation();
    event.preventDefault();
    
    const productId = product.id || product._id;
    if (!productId) return;

    this.loadingProductIds.add(productId);

    if (newState) {
      // Add to cart
      this.subscription.add(
        this.cartService.addToCart(productId, 1).subscribe({
          next: (response) => {
            if (response?.success) {
              this.productStateService.setCartState(productId, true);
              console.log('✅ Product added to cart:', productId);
            } else {
              console.warn('⚠️ Unexpected response from addToCart:', response);
              this.productStateService.setCartState(productId, true); // Still update state
            }
            this.loadingProductIds.delete(productId);
          },
          error: (error) => {
            this.productStateService.setCartState(productId, false);
            this.loadingProductIds.delete(productId);
            console.error('❌ Error adding to cart:', error);
          }
        })
      );
    } else {
      // Remove from cart - need to find the cart item ID
      const cartItems = this.cartService.getCartItems() || [];
      const cartItem = cartItems.find((item: any) => item.product?._id === productId || item.product?.id === productId);
      if (cartItem) {
        this.subscription.add(
          this.cartService.removeFromCart(cartItem._id).subscribe({
            next: (response) => {
              if (response?.success) {
                this.productStateService.setCartState(productId, false);
                console.log('✅ Product removed from cart:', productId);
              } else {
                console.warn('⚠️ Unexpected response from removeFromCart:', response);
                this.productStateService.setCartState(productId, false); // Still update state
              }
              this.loadingProductIds.delete(productId);
            },
            error: (error) => {
              this.productStateService.setCartState(productId, true);
              this.loadingProductIds.delete(productId);
              console.error('❌ Error removing from cart:', error);
            }
          })
        );
      } else {
        this.loadingProductIds.delete(productId);
      }
    }
  }

  /**
   * Toggle wishlist state for a product
   */
  onWishlistToggle(event: Event, product: Product, newState: boolean): void {
    event.stopPropagation();
    event.preventDefault();
    
    const productId = product.id || product._id;
    if (!productId) return;

    this.loadingProductIds.add(productId);

    if (newState) {
      // Add to wishlist
      this.subscription.add(
        this.wishlistService.addToWishlist(productId).subscribe({
          next: (response) => {
            if (response?.success) {
              this.productStateService.setWishlistState(productId, true);
              console.log('✅ Product added to wishlist:', productId);
            } else {
              console.warn('⚠️ Unexpected response from addToWishlist:', response);
              this.productStateService.setWishlistState(productId, true); // Still update state
            }
            this.loadingProductIds.delete(productId);
          },
          error: (error) => {
            this.productStateService.setWishlistState(productId, false);
            this.loadingProductIds.delete(productId);
            console.error('❌ Error adding to wishlist:', error);
          }
        })
      );
    } else {
      // Remove from wishlist
      this.subscription.add(
        this.wishlistService.removeFromWishlist(productId).subscribe({
          next: (response) => {
            if (response?.success) {
              this.productStateService.setWishlistState(productId, false);
              console.log('✅ Product removed from wishlist:', productId);
            } else {
              console.warn('⚠️ Unexpected response from removeFromWishlist:', response);
              this.productStateService.setWishlistState(productId, false); // Still update state
            }
            this.loadingProductIds.delete(productId);
          },
          error: (error) => {
            this.productStateService.setWishlistState(productId, true);
            this.loadingProductIds.delete(productId);
            console.error('❌ Error removing from wishlist:', error);
          }
        })
      );
    }
  }

  /**
   * Get cart button text for a product
   */
  getCartButtonText(product: Product): string {
    const productId = product.id || product._id;
    const isLoading = this.loadingProductIds.has(productId);
    const isInCart = this.isProductInCart(product);
    return isLoading ? 'Loading...' : (isInCart ? 'Remove from Cart' : 'Add to Cart');
  }

  /**
   * Check if product is in cart (for template)
   */
  isProductInCart(product: Product): boolean {
    const productId = product.id || product._id;
    return this.productStateService.getProductsInCart().includes(productId);
  }

  /**
   * Check if product is in wishlist (for template)
   */
  isProductInWishlist(product: Product): boolean {
    const productId = product.id || product._id;
    return !!productId && this.wishlistService.isInWishlist(productId);
  }

  getDiscountPercentage(product: Product): number {
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  }

  onRetry() {
    this.loadTrendingProducts();
  }

  onViewAll() {
    this.router.navigate(['/products'], {
      queryParams: { filter: 'trending' }
    });
  }

  isProductLiked(productId: string): boolean {
    return this.likedProducts.has(productId);
  }

  trackByProductId(_index: number, product: Product): string {
    return product.id || product._id;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    // Set a fallback image using backend placeholder
    img.src = this.backendProductPlaceholder;
    img.classList.add('image-error');
  }

  // Auto-sliding methods
  private startAutoSlide() {
    if (!this.isAutoSliding || this.isPaused) return;

    this.stopAutoSlide();
    this.autoSlideInterval = setInterval(() => {
      if (!this.isPaused && this.trendingProducts.length > this.visibleCards) {
        this.autoSlideNext();
      }
    }, this.autoSlideDelay);
  }

  private stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  private autoSlideNext() {
    if (this.currentSlide >= this.maxSlide) {
      this.currentSlide = 0;
    } else {
      this.currentSlide++;
    }
    this.updateSlideOffset();
  }

  pauseAutoSlide() {
    this.isPaused = true;
    this.stopAutoSlide();
  }

  resumeAutoSlide() {
    this.isPaused = false;
    this.startAutoSlide();
  }

  // Responsive methods
  private updateResponsiveSettings() {
    const width = window.innerWidth;

    if (width <= 768) {
      this.cardWidth = 256; // 240px card + 16px gap
      this.visibleCards = 1;
    } else if (width <= 1024) {
      this.cardWidth = 252; // 240px card + 12px gap
      this.visibleCards = 2;
    } else if (width <= 1200) {
      this.cardWidth = 254; // 240px card + 14px gap
      this.visibleCards = 2;
    } else {
      // Desktop sidebar - show 2 products per view
      this.cardWidth = 256; // 240px card + 16px gap
      this.visibleCards = 2;
    }

    this.updateSliderLimits();
    this.updateSlideOffset();
  }

  private setupResizeListener() {
    window.addEventListener('resize', () => {
      this.updateResponsiveSettings();
    });
  }

  // Slider methods
  updateSliderLimits() {
    this.maxSlide = Math.max(0, this.trendingProducts.length - this.visibleCards);
  }

  slidePrev() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.updateSlideOffset();
      this.restartAutoSlideAfterInteraction();
    }
  }

  slideNext() {
    if (this.currentSlide < this.maxSlide) {
      this.currentSlide++;
      this.updateSlideOffset();
      this.restartAutoSlideAfterInteraction();
    }
  }

  private updateSlideOffset() {
    this.slideOffset = -this.currentSlide * this.cardWidth;
  }

  private restartAutoSlideAfterInteraction() {
    this.stopAutoSlide();
    setTimeout(() => {
      this.startAutoSlide();
    }, 2000);
  }

  // Update slider when products load
  private updateSliderOnProductsLoad() {
    setTimeout(() => {
      this.updateSliderLimits();
      this.currentSlide = 0;
      this.slideOffset = 0;
      this.startAutoSlide();
    }, 100);
  }
}
