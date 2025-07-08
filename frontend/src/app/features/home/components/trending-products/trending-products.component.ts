import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IonicModule } from '@ionic/angular';
import { TrendingService } from '../../../../core/services/trending.service';
import { SocialInteractionsService } from '../../../../core/services/social-interactions.service';
import { CartService } from '../../../../core/services/cart.service';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { Product } from '../../../../core/models/product.interface';

@Component({
  selector: 'app-trending-products',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './trending-products.component.html',
  styleUrls: ['./trending-products.component.scss']
})
export class TrendingProductsComponent implements OnInit, OnDestroy {
  trendingProducts: Product[] = [];
  isLoading = true;
  error: string | null = null;
  likedProducts = new Set<string>();
  private subscription: Subscription = new Subscription();

  // Section interaction properties
  isSectionLiked = false;
  isSectionBookmarked = false;
  sectionLikes = 365;
  sectionComments = 105;
  isMobile = false;

  constructor(
    private trendingService: TrendingService,
    private socialService: SocialInteractionsService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('🔵 TrendingProductsComponent ngOnInit called');
    this.loadTrendingProducts();
    this.subscribeTrendingProducts();
    this.subscribeLikedProducts();
    this.checkMobileDevice();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private subscribeTrendingProducts() {
    this.subscription.add(
      this.trendingService.trendingProducts$.subscribe(products => {
        this.trendingProducts = products;
        this.isLoading = false;
      })
    );
  }

  private subscribeLikedProducts() {
    this.subscription.add(
      this.socialService.likedProducts$.subscribe(likedProducts => {
        this.likedProducts = new Set(likedProducts);
      })
    );
  }

  private async loadTrendingProducts() {
    try {
      this.isLoading = true;
      this.error = null;
      await this.trendingService.loadTrendingProducts();
    } catch (error) {
      console.error('Error loading trending products:', error);
      this.error = 'Failed to load trending products';
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
        if (this.likedProducts.has(product._id)) {
          this.likedProducts.delete(product._id);
        } else {
          this.likedProducts.add(product._id);
        }
      }
    } catch (error) {
      console.error('Error liking product:', error);
    }
  }

  async onShareProduct(product: Product, event: Event) {
    event.stopPropagation();
    try {
      const productUrl = `${window.location.origin}/product/${product._id}`;
      
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `Check out this amazing ${product.name} from ${product.brand}!`,
          url: productUrl
        });
      } else {
        await navigator.clipboard.writeText(productUrl);
        console.log('Product URL copied to clipboard');
      }
      
      await this.socialService.shareProduct(product._id, {
        platform: 'copy_link',
        message: `Check out this amazing ${product.name} from ${product.brand}!`
      });
    } catch (error) {
      console.error('Error sharing product:', error);
    }
  }

  async onAddToCart(product: Product, event: Event) {
    event.stopPropagation();
    try {
      await this.cartService.addToCart(product._id, 1);
      console.log('Product added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }

  async onAddToWishlist(product: Product, event: Event) {
    event.stopPropagation();
    try {
      await this.wishlistService.addToWishlist(product._id);
      console.log('Product added to wishlist');
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  onRetry() {
    this.loadTrendingProducts();
  }

  onViewAll() {
    this.router.navigate(['/products'], {
      queryParams: { category: 'trending' }
    });
  }

  isProductLiked(productId: string): boolean {
    return this.likedProducts.has(productId);
  }

  trackByProductId(index: number, product: Product): string {
    return product._id;
  }

  // Section interaction methods
  toggleSectionLike() {
    this.isSectionLiked = !this.isSectionLiked;
    if (this.isSectionLiked) {
      this.sectionLikes++;
    } else {
      this.sectionLikes--;
    }
  }

  toggleSectionBookmark() {
    this.isSectionBookmarked = !this.isSectionBookmarked;
  }

  openComments() {
    console.log('Opening comments for trending products section');
  }

  shareSection() {
    if (navigator.share) {
      navigator.share({
        title: 'Trending Products',
        text: 'Check out these trending fashion products!',
        url: window.location.href
      });
    } else {
      console.log('Sharing trending products section');
    }
  }

  openMusicPlayer() {
    console.log('Opening music player');
  }

  formatCount(count: number): string {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  }

  private checkMobileDevice() {
    this.isMobile = window.innerWidth <= 768;
  }
}
