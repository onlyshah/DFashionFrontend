import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TrendingService } from '../../../../core/services/trending.service';
import { Product } from '../../../../core/models/product.interface';
import { SocialInteractionsService } from '../../../../core/services/social-interactions.service';
import { CartService } from '../../../../core/services/cart.service';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { IonicModule } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-new-arrivals',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './new-arrivals.component.html',
  styleUrls: ['./new-arrivals.component.scss']
})
export class NewArrivalsComponent implements OnInit, OnDestroy {
  newArrivals: Product[] = [];
  isLoading = true;
  error: string | null = null;
  likedProducts = new Set<string>();
  private subscription: Subscription = new Subscription();

  // Slider properties
  currentSlide = 0;
  slideOffset = 0;
  cardWidth = 256; // Width of each product card including margin (240px + 16px gap)
  visibleCards = 2; // Number of cards visible at once in sidebar
  maxSlide = 0;

  // Auto-sliding properties
  autoSlideInterval: any;
  autoSlideDelay = 4000; // 4 seconds for products
  isAutoSliding = true;
  isPaused = false;
   imageUrl = environment.apiUrl
  constructor(
    private trendingService: TrendingService,
    private socialService: SocialInteractionsService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadNewArrivals();
    this.subscribeNewArrivals();
    this.subscribeLikedProducts();
    this.updateResponsiveSettings();
    this.setupResizeListener();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.stopAutoSlide();
  }

  private subscribeNewArrivals() {
    this.subscription.add(
      this.trendingService.newArrivals$.subscribe(products => {
        this.newArrivals = products;
        console.log('New Arrivals API data:', this.newArrivals,
         
        );
        this.isLoading = false;
        this.updateSliderOnProductsLoad();
      })
    );
  }

  private subscribeLikedProducts() {
    this.subscription.add(
      this.socialService.likedProducts$.subscribe(likedProducts => {
        this.likedProducts = likedProducts;
      })
    );
  }

  private async loadNewArrivals() {
    try {
      this.isLoading = true;
      this.error = null;
      await this.trendingService.loadNewArrivals(1, 6);
    } catch (error) {
      console.error('Error loading new arrivals:', error);
      this.error = 'Failed to load new arrivals';
      this.isLoading = false;
    }
  }

  onProductClick(product: Product) {
    this.router.navigate(['/product', product._id]);
  }

  async onLikeProduct(product: Product, event: Event) {
    event.stopPropagation();
    try {
      const result = await this.socialService.likeProduct(product._id);
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
    try {
      const productUrl = `${window.location.origin}/product/${product._id}`;
      await navigator.clipboard.writeText(productUrl);

      await this.socialService.shareProduct(product._id, {
        platform: 'copy_link',
        message: `Check out this fresh arrival: ${product.name} from ${product.brand}!`
      });

      console.log('Product link copied to clipboard!');
    } catch (error) {
      console.error('Error sharing product:', error);
    }
  }

  onAddToCart(product: Product, event: Event) {
    event.stopPropagation();
    try {
      this.cartService.addToCart(product._id, 1);
      console.log('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }

  onAddToWishlist(product: Product, event: Event) {
    event.stopPropagation();
    try {
      this.wishlistService.addToWishlist(product._id);
      console.log('Product added to wishlist!');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
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

  getDaysAgo(createdAt: Date): number {
    const now = new Date();
    const created = new Date(createdAt);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  onRetry() {
    this.loadNewArrivals();
  }

  onViewAll() {
    this.router.navigate(['/products'], { 
      queryParams: { filter: 'new-arrivals' } 
    });
  }

  isProductLiked(productId: string): boolean {
    return this.likedProducts.has(productId);
  }

  trackByProductId(_index: number, product: Product): string {
    return product._id;
  }

  // Auto-sliding methods
  private startAutoSlide() {
    if (!this.isAutoSliding || this.isPaused) return;

    this.stopAutoSlide();
    this.autoSlideInterval = setInterval(() => {
      if (!this.isPaused && this.newArrivals.length > this.visibleCards) {
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
    this.maxSlide = Math.max(0, this.newArrivals.length - this.visibleCards);
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
