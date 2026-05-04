import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from '../../../../../core/services/auth.service';
import { CartService } from '../../../../../core/services/cart.service';
import { WishlistService } from '../../../../../core/services/wishlist.service';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-shop-category',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Route & Category
  categoryId: string = '';
  category: any = null;

  // Products
  products: any[] = [];
  totalCount: number = 0;
  isLoading: boolean = false;

  // Filters
  maxPrice: number = 5000;
  selectedSizes: string[] = [];
  selectedRating: number = 0;
  sortBy: string = 'popularity';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 12;

  // Options
  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  ratings = [4, 3, 2, 1];

  // Cart loading
  addingToCartProductId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private cartService: CartService,
    public wishlistService: WishlistService
  ) {}

  ngOnInit() {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.categoryId = params.get('id') || '';
        this.currentPage = 1;
        
        if (this.categoryId) {
          this.loadCategory();
          this.loadProducts();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load category details from API
   */
  loadCategory() {
    if (!this.categoryId) return;

    this.http.get<any>(`${environment.apiUrl}/api/categories/${this.categoryId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Category loaded:', response);
          // Handle: { success: true, data: {...} } format
          this.category = response?.data || response;
          console.log('✅ Category details:', this.category);
        },
        error: (err) => {
          console.error('❌ Category load failed:', err);
          console.log('⚠️ Continuing without category details...');
          // Fallback - show generic header
          this.category = { id: this.categoryId, name: 'Products' };
        }
      });
  }

  /**
   * Load products for this category
   */
  loadProducts() {
    if (!this.categoryId) return;
    this.isLoading = true;

    const params = new HttpParams()
      .set('category_id', this.categoryId)
      .set('sort_by', this.sortBy)
      .set('max_price', this.maxPrice.toString())
      .set('page', this.currentPage.toString())
      .set('limit', this.pageSize.toString());

    // Backend supports: category_id, brand_id, min_price, max_price, sort_by, sort_order, search, is_featured
    this.http.get<any>(`${environment.apiUrl}/api/products`, { params })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Products loaded:', response);
          
          // Backend returns: { success: true, data: [...], pagination: { total, totalPages, page, limit } }
          const data = response?.data || response?.rows || response;
          const pagination = response?.pagination || {};
          
          if (Array.isArray(data)) {
            this.products = data;
            this.totalCount = pagination?.total || data.length;
          } else {
            this.products = [];
            this.totalCount = 0;
          }
          
          console.log(`✅ Loaded ${this.products.length} products, total: ${this.totalCount}`);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('❌ Products load failed:', err);
          this.products = [];
          this.totalCount = 0;
          this.isLoading = false;
        }
      });
  }

  /**
   * Handle filter changes
   */
  onFilterChange() {
    this.currentPage = 1;
    this.loadProducts();
  }

  toggleSize(size: string) {
    const idx = this.selectedSizes.indexOf(size);
    if (idx > -1) {
      this.selectedSizes.splice(idx, 1);
    } else {
      this.selectedSizes.push(size);
    }
    this.onFilterChange();
  }

  /**
   * Pagination
   */
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
      window.scrollTo(0, 0);
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  get pageNumbers(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  /**
   * Add product to cart
   */
  addToCart(product: any, event: Event) {
    event.stopPropagation();

    if (!this.authService.isAuthenticated) {
      alert('Please login to add items to cart');
      this.router.navigate(['/auth/login']);
      return;
    }

    const productId = product?.id || product?._id;
    if (!productId) {
      alert('Unable to add product to cart');
      return;
    }

    this.addingToCartProductId = productId;

    this.cartService.addToCart(productId, 1)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response?.success) {
            alert(`${product.name || 'Product'} added to cart!`);
          } else {
            alert('Failed to add product to cart');
          }
          this.addingToCartProductId = null;
        },
        error: (err) => {
          console.error('❌ Error adding to cart:', err);
          alert('Failed to add product to cart. Please try again.');
          this.addingToCartProductId = null;
        }
      });
  }

  /**
   * Toggle wishlist
   */
  toggleWishlist(product: any, event: Event) {
    event.stopPropagation();

    if (!this.authService.isAuthenticated) {
      alert('Please login to use wishlist');
      this.router.navigate(['/auth/login']);
      return;
    }

    const productId = product?.id || product?._id;
    if (!productId) return;

    this.wishlistService.toggleWishlist(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (err) => {
          console.error('Toggle wishlist failed:', err);
        }
      });
  }

  /**
   * Navigate to product detail
   */
  viewProduct(product: any) {
    const productId = product?.id || product?._id;
    if (!productId) return;
    this.router.navigate(['/products', productId]);
  }

  /**
   * Get product image URL
   */
  getProductImage(product: any): string {
    if (Array.isArray(product?.images) && product.images.length > 0) {
      const img = product.images[0];
      return typeof img === 'string' ? img : img?.url || '/assets/placeholder.jpg';
    }
    return product?.image || product?.thumbnail || '/assets/placeholder.jpg';
  }

  /**
   * Check if product is in wishlist
   */
  isInWishlist(product: any): boolean {
    const productId = product?.id || product?._id;
    return !!productId && this.wishlistService.isInWishlist(productId);
  }

  /**
   * Check if product is being added to cart
   */
  isAddingToCart(product: any): boolean {
    const productId = product?.id || product?._id;
    return this.addingToCartProductId === productId;
  }

  /**
   * Format currency
   */
  formatPrice(price: number): string {
    return (price || 0).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    });
  }
}
