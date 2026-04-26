import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { UnifiedApiService } from '../../../core/services/unified-api.service';
import { Product } from '../../../core/models/product.interface';
import { environment } from 'src/environments/environment';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { WishlistService } from '../../../core/services/wishlist.service';

interface Category {
  id: string;
  name: string;
  image: string;
  subcategories: Array<string | { name: string }>;
  productCount: number;
}

interface Brand {
  id: string;
  name: string;
  logo: string;
  isPopular: boolean;
}

interface ShopProduct extends Product {
  isNew?: boolean;
  isTrending?: boolean;
}

@Component({
    selector: 'app-shop',
    imports: [CommonModule, FormsModule],
    templateUrl: './shop.component.html',
    styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit {
  searchQuery = '';
  categories: Category[] = [];
  featuredBrands: Brand[] = [];
  trendingProducts: ShopProduct[] = [];
  newArrivals: ShopProduct[] = [];
  imageUrl = environment.apiUrl;
  loading = true;
  viewMode: 'all' | 'trending' | 'new-arrivals' | 'brands' | 'categories' = 'all';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private unifiedApi: UnifiedApiService,
    private cartService: CartService,
    private authService: AuthService,
    private wishlistService: WishlistService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const mode = params.get('section') || params.get('filter') || 'all';
      this.viewMode = this.normalizeViewMode(mode);
      this.loadShopData();
    });
  }

  loadShopData() {
    this.loading = true;
    const tasks: Promise<any>[] = [];

    switch (this.viewMode) {
      case 'trending':
        tasks.push(this.loadTrendingProducts());
        break;
      case 'new-arrivals':
        tasks.push(this.loadNewArrivals());
        break;
      case 'brands':
        tasks.push(this.loadFeaturedBrands());
        break;
      case 'categories':
        tasks.push(this.loadCategories());
        break;
      default:
        tasks.push(
          this.loadFeaturedBrands(),
          this.loadTrendingProducts(),
          this.loadNewArrivals(),
          this.loadCategories()
        );
        break;
    }

    Promise.all(tasks).finally(() => {
      this.loading = false;
    });
  }

  loadFeaturedBrands() {
    return this.unifiedApi.getFeaturedBrands().toPromise().then(
      (response) => {
        this.featuredBrands = response?.data || response?.brands || [];
      }
    ).catch(error => {
      console.error('Error loading featured brands:', error);
      this.featuredBrands = [];
    });
  }

  loadTrendingProducts() {
    return this.unifiedApi.getTrendingProducts().toPromise().then(
      (response) => {
        this.trendingProducts = (response?.data || response?.products || []).map((product: Product) => ({
          ...product,
          isTrending: true,
          isNew: false
        }));
      }
    ).catch(error => {
      console.error('Error loading trending products:', error);
      this.trendingProducts = [];
    });
  }

  loadNewArrivals() {
    return this.unifiedApi.getNewArrivals().toPromise().then(
      (response) => {
        this.newArrivals = (response?.data || response?.products || []).map((product: Product) => ({
          ...product,
          isNew: true,
          isTrending: false
        }));
      }
    ).catch(error => {
      console.error('Error loading new arrivals:', error);
      this.newArrivals = [];
    });
  }

  loadCategories() {
    return this.unifiedApi.getCategories().toPromise().then(
      (response) => {
        this.categories = response?.data || response?.categories || [];
      }
    ).catch(error => {
      console.error('Error loading categories:', error);
      this.categories = [];
    });
  }

  search() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
    }
  }

  // Add any additional product/cart/wishlist logic from both components here as needed

  navigateToCategory(categoryId: string) {
    this.router.navigate(['/category', categoryId]);
  }

  navigateToBrand(brandId: string) {
    this.router.navigate(['/brand', brandId]);
  }

  viewAllCategories() {
    this.router.navigate(['/products'], { queryParams: { filter: 'categories' } });
  }

  viewAllBrands() {
    this.router.navigate(['/products'], { queryParams: { filter: 'brands' } });
  }

  viewProduct(product: any) {
    const productId = this.getProductId(product);
    if (!productId) {
      console.warn('Cannot navigate: no product ID');
      return;
    }
    this.router.navigate(['/products', productId]);
  }

  likeProduct(product: any, event: Event) {
    event.stopPropagation();
    // Implement like functionality
    product.isLiked = !product.isLiked;
    if (product.isLiked) {
      product.likesCount = (product.likesCount || 0) + 1;
    } else {
      product.likesCount = Math.max((product.likesCount || 1) - 1, 0);
    }
  }

  shareProduct(product: any, event: Event) {
    event.stopPropagation();
    // Implement share functionality
    const productId = this.getProductId(product);
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.origin + '/product/' + productId
      });
    }
  }

  commentOnProduct(product: any, event: Event) {
    event.stopPropagation();
    const productId = this.getProductId(product);
    if (!productId) {
      return;
    }
    this.router.navigate(['/product', productId], {
      queryParams: { action: 'comment' }
    });
  }

  viewAllTrending() {
    this.router.navigate(['/products'], { queryParams: { filter: 'trending' } });
  }

  backToShop() {
    this.router.navigate(['/products']);
  }

  viewAllNew() {
    this.router.navigate(['/products'], { queryParams: { filter: 'new-arrivals' } });
  }

  goToExplore() {
    this.router.navigate(['/explore']);
  }

  addToWishlist(product: Product, event: Event) {
    event.stopPropagation();
    if (!this.isAuthenticated()) {
      this.showLoginPrompt('add to wishlist');
      return;
    }

    const productId = this.getProductId(product);
    if (!productId) {
      return;
    }

    this.wishlistService.toggleWishlist(productId).subscribe({
      next: () => {
        const isNowInWishlist = this.isInWishlist(product);
        this.showSuccessMessage(`${product.name} ${isNowInWishlist ? 'added to wishlist' : 'removed from wishlist'}!`);
      },
      error: (error) => {
        this.showSuccessMessage(error?.status === 401 ? 'Please login to save items' : 'Failed to update wishlist');
      }
    });
  }

  quickAddToCart(product: Product, event: Event) {
    event.stopPropagation();
    if (!this.isAuthenticated()) {
      this.showLoginPrompt('add to cart');
      return;
    }

    const productId = product._id || (product as any).id;
    if (!productId) {
      return;
    }

    this.cartService.toggleCart(productId, { quantity: 1 }).subscribe({
      next: () => {
        const inCart = this.cartService.isInCart(productId);
        this.showSuccessMessage(`${product.name} ${inCart ? 'added to cart' : 'removed from cart'}!`);
      },
      error: () => {
        this.showSuccessMessage('Something went wrong');
      }
    });
  }

  isInCart(product: Product): boolean {
    const productId = this.getProductId(product);
    return !!productId && this.cartService.isInCart(productId);
  }

  isInWishlist(product: Product): boolean {
    const productId = this.getProductId(product);
    return !!productId && this.wishlistService.isInWishlist(productId);
  }

  getWishlistIcon(product: Product): string {
    return this.isInWishlist(product) ? 'fas fa-heart' : 'far fa-heart';
  }

  getProductImage(product: Product): string {
    const imagePath = product?.images?.[0]?.url;
    if (!imagePath) {
      return `${this.imageUrl}/uploads/default/placeholder.jpg`;
    }
    return imagePath.startsWith('http')
      ? imagePath
      : `${this.imageUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  }

  getDiscountPercentage(product: Product): number {
    if (!product.originalPrice || product.originalPrice <= product.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0);
  }

  private isAuthenticated(): boolean {
    return this.authService.isAuthenticated;
  }

  private getProductId(product: Product): string {
    return (product as any)?.id || (product as any)?._id || '';
  }

  private normalizeViewMode(mode: string): 'all' | 'trending' | 'new-arrivals' | 'brands' | 'categories' {
    if (mode === 'trending' || mode === 'new-arrivals' || mode === 'brands' || mode === 'categories') {
      return mode;
    }
    return 'all';
  }

  private showLoginPrompt(action: string) {
  const message = 'Please login to ' + action;
  if (confirm(message + '. Would you like to login now?')) {
      this.router.navigate(['/auth/login']);
    }
  }

  private showSuccessMessage(message: string) {
    this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    }).then(toast => toast.present());
  }
}
