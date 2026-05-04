import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UnifiedApiService } from '../../../core/services/unified-api.service';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { Product } from '../../../core/models/product.interface';
import { CategoryService } from '../../../core/services/category.service';
@Component({
    selector: 'app-category',
    imports: [CommonModule, FormsModule],
    styles: [`
    .category-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .category-header {
      margin-bottom: 30px;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      font-size: 0.9rem;
      color: #666;
    }

    .breadcrumb span {
      cursor: pointer;
    }

    .breadcrumb span:hover {
      color: #007bff;
    }

    .breadcrumb .current {
      color: #333;
      font-weight: 500;
    }

    .category-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 8px;
      color: #333;
    }

    .category-description {
      font-size: 1.1rem;
      color: #666;
      margin: 0;
    }

    .filters-section {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 30px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .filter-row {
      display: flex;
      align-items: center;
      gap: 24px;
      flex-wrap: wrap;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .filter-group label {
      font-weight: 500;
      color: #333;
      white-space: nowrap;
    }

    .filter-group select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.9rem;
      min-width: 150px;
    }

    .results-count {
      margin-left: auto;
      font-weight: 500;
      color: #666;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }

    .product-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }

    .product-image {
      position: relative;
      height: 300px;
      overflow: hidden;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .product-card:hover .product-image img {
      transform: scale(1.05);
    }

    .product-actions {
      position: absolute;
      top: 12px;
      right: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .product-card:hover .product-actions {
      opacity: 1;
    }

    .btn-wishlist, .btn-quick-view {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 50%;
      background: rgba(255,255,255,0.9);
      color: #333;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .btn-wishlist:hover, .btn-quick-view:hover {
      background: #007bff;
      color: white;
    }

    .discount-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      background: #ff4757;
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .product-info {
      padding: 20px;
    }

    .product-name {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 4px;
      color: #333;
      line-height: 1.3;
    }

    .product-brand {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 8px;
    }

    .product-rating {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .stars {
      display: flex;
      gap: 2px;
    }

    .stars i {
      font-size: 0.8rem;
      color: #ffc107;
    }

    .rating-count {
      font-size: 0.8rem;
      color: #666;
    }

    .product-price {
      margin-bottom: 16px;
    }

    .current-price {
      font-size: 1.2rem;
      font-weight: 700;
      color: #333;
    }

    .original-price {
      font-size: 0.9rem;
      color: #999;
      text-decoration: line-through;
      margin-left: 8px;
    }

    .btn-add-cart {
      width: 100%;
      padding: 12px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-add-cart:hover {
      background: #0056b3;
    }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
    }

    .empty-content i {
      font-size: 4rem;
      color: #ddd;
      margin-bottom: 20px;
    }

    .empty-content h2 {
      font-size: 1.5rem;
      margin-bottom: 10px;
    }

    .empty-content p {
      color: #666;
      margin-bottom: 30px;
    }

    .btn-primary {
      background: #007bff;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
    }

    .loading-state {
      text-align: center;
      padding: 80px 20px;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .category-header h1 {
        font-size: 2rem;
      }

      .filter-row {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .filter-group {
        justify-content: space-between;
      }

      .results-count {
        margin-left: 0;
        text-align: center;
      }

      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 16px;
      }
    }
  `],
    templateUrl: './category.component.html'
})
export class CategoryComponent implements OnInit {
   // Category data
  categoryId: string = '';
  categorySlug: string = '';
  category: any = null;

  // Products
  products: Product[] = [];
  filteredProducts: Product[] = [];
  totalCount: number = 0;
  loading: boolean = false;

  // Filters
  sortBy: string = 'featured';
  maxPrice: number = 5000;
  priceRange: string = '';
  selectedSizes: string[] = [];
  selectedSize: string = '';
  selectedRating: number = 0;

  // Pagination
  currentPage: number = 1;
  pageSize: number = 12;

  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private unifiedApi: UnifiedApiService,
    private productService: ProductService,
    private authService: AuthService,
    private cartService: CartService,
    private wishlistService: WishlistService,
   private categoryService: CategoryService  // ← add this
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      // Handles both /shop/category/:id (UUID) and /category/:slug
      const id = params.get('id');
      const slug = params.get('slug') || params.get('category');

      if (id) {
        this.categoryId = id;
        this.categorySlug = '';
      } else if (slug) {
        this.categorySlug = slug;
        this.categoryId = '';
      }

      this.currentPage = 1;
      this.resetFilters();
      this.loadCategory();
      this.loadProducts();
    });
  }

  // ── Data loading ──────────────────────────────────────────

 loadCategory() {
  if (!this.categoryId && !this.categorySlug) return;

  if (this.categoryId) {
    // UUID route — use CategoryService.getCategoryById
    this.categoryService.getCategoryById(this.categoryId).subscribe({
      next: (cat) => this.category = cat,
      error: (err) => console.error('Category load failed:', err)
    });
  } else {
    // Slug route — use CategoryService.getCategoryBySlug
    this.categoryService.getCategoryBySlug(this.categorySlug).subscribe({
      next: (cat) => this.category = cat,
      error: (err) => console.error('Category load failed:', err)
    });
  }
}

  loadProducts() {
    if (!this.categoryId && !this.categorySlug) return;
    this.loading = true;

    // UUID-based category (from /shop/category/:id)
    if (this.categoryId) {
      const params: any = {
        category: this.categoryId,
        sort: this.sortBy,
        maxPrice: this.maxPrice,
        page: this.currentPage,
        limit: this.pageSize,
      };
      if (this.selectedSizes.length) params.sizes = this.selectedSizes.join(',');
      if (this.selectedRating) params.minRating = this.selectedRating;

      this.productService.getProducts(params).subscribe({
        next: (res: any) => {
          this.products = res?.data?.products || res?.products || res?.data || [];
          this.totalCount = res?.data?.total || res?.total || this.products.length;
          this.applyFilters();
          this.loading = false;
        },
        error: (err: any) => {
          console.error('Products load failed:', err);
          this.products = [];
          this.filteredProducts = [];
          this.loading = false;
        }
      });
      return;
    }

    // Slug-based category (from /category/:slug)
    if (this.categorySlug === 'trending') {
      this.unifiedApi.getTrendingProducts(this.currentPage, this.pageSize).subscribe({
        next: (res: any) => {
          this.products = res?.data || res?.products || [];
          this.totalCount = this.products.length;
          this.applyFilters();
          this.loading = false;
        },
        error: (err: any) => {
          console.error('Error loading trending:', err);
          this.products = [];
          this.filteredProducts = [];
          this.loading = false;
        }
      });
      return;
    }

    this.productService.getCategoryProducts(this.categorySlug).subscribe({
      next: (res: any) => {
        this.products = res?.data || res?.products || [];
        this.totalCount = this.products.length;
        this.applyFilters();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading products:', err);
        this.products = [];
        this.filteredProducts = [];
        this.loading = false;
      }
    });
  }

  // ── Filters & sorting ─────────────────────────────────────

  applyFilters() {
    let filtered = [...this.products];

    // Price range filter (slider)
    if (this.maxPrice < 5000) {
      filtered = filtered.filter(p => p.price <= this.maxPrice);
    }

    // Price range filter (dropdown)
    if (this.priceRange) {
      if (this.priceRange === '10000+') {
        filtered = filtered.filter(p => p.price >= 10000);
      } else {
        const [min, max] = this.priceRange.split('-').map(Number);
        filtered = filtered.filter(p => p.price >= min && p.price <= max);
      }
    }

    // Size filter
    const activeSize = this.selectedSizes.length
      ? this.selectedSizes
      : this.selectedSize
      ? [this.selectedSize]
      : [];

    if (activeSize.length) {
      filtered = filtered.filter(p =>
        (p as any).sizes?.some((s: any) =>
          activeSize.includes(typeof s === 'string' ? s : s.size)
        )
      );
    }

    // Rating filter
    if (this.selectedRating) {
      filtered = filtered.filter(p =>
        (p.rating?.average || 0) >= this.selectedRating
      );
    }

    // Sorting
    switch (this.sortBy) {
      case 'price-low':
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
        break;
      case 'newest':
        filtered.sort((a, b) =>
          new Date((b as any).createdAt || 0).getTime() -
          new Date((a as any).createdAt || 0).getTime()
        );
        break;
      default:
        break;
    }

    this.filteredProducts = filtered;
    this.totalCount = filtered.length;
  }

  onSortChange() {
    this.currentPage = 1;
    // If UUID-based, reload from API with new sort
    if (this.categoryId) {
      this.loadProducts();
    } else {
      this.applyFilters();
    }
  }

  onFilterChange() {
    this.currentPage = 1;
    if (this.categoryId) {
      this.loadProducts();
    } else {
      this.applyFilters();
    }
  }

  toggleSize(size: string) {
    const idx = this.selectedSizes.indexOf(size);
    if (idx > -1) this.selectedSizes.splice(idx, 1);
    else this.selectedSizes.push(size);
    this.onFilterChange();
  }

  resetFilters() {
    this.sortBy = 'featured';
    this.maxPrice = 5000;
    this.priceRange = '';
    this.selectedSizes = [];
    this.selectedSize = '';
    this.selectedRating = 0;
  }

  clearFilters() {
    this.resetFilters();
    this.filteredProducts = [...this.products];
  }

  // ── Pagination ────────────────────────────────────────────

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    if (this.categoryId) {
      this.loadProducts();
    }
    window.scrollTo(0, 0);
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    // Show first, last, and pages around current
    const pages: number[] = [1];
    if (this.currentPage > 3) pages.push(-1); // ellipsis
    for (let i = Math.max(2, this.currentPage - 1); i <= Math.min(total - 1, this.currentPage + 1); i++) {
      pages.push(i);
    }
    if (this.currentPage < total - 2) pages.push(-1); // ellipsis
    pages.push(total);
    return pages;
  }

  // ── Display helpers ───────────────────────────────────────

  getCategoryDisplayName(): string {
    if (this.category?.name) return this.category.name;
    const names: { [key: string]: string } = {
      women: "Women's Fashion",
      men: "Men's Fashion",
      kids: "Kids' Fashion",
      ethnic: 'Ethnic Wear',
      trending: 'Trending Products',
      all: 'All Products'
    };
    return names[this.categorySlug] ||
      (this.categorySlug
        ? this.categorySlug.charAt(0).toUpperCase() + this.categorySlug.slice(1)
        : 'Products');
  }

  getCategoryDescription(): string {
    if (this.category?.description) return this.category.description;
    const descs: { [key: string]: string } = {
      women: "Discover the latest trends in women's fashion",
      men: "Explore stylish and comfortable men's clothing",
      kids: 'Fun and comfortable clothing for children',
      ethnic: 'Traditional and ethnic wear for special occasions',
      trending: 'The most popular products right now',
      all: 'Browse our complete collection'
    };
    return descs[this.categorySlug] || 'Explore our collection';
  }

  getProductImage(product: Product): string {
    return (product as any)?.images?.[0]?.url ||
           (product as any)?.image ||
           '/uploads/placeholder.jpg';
  }

  getDiscountPercentage(product: Product): number {
    if (!product.originalPrice || product.originalPrice <= product.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating || 0)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.floor(rating || 0)).fill(0);
  }

  // ── Actions ───────────────────────────────────────────────

  viewProduct(product: Product) {
    const id = (product as any)?.id || (product as any)?._id;
    if (!id) return;
    this.router.navigate(['/products', id]);
  }

  addToCart(product: Product, event?: Event) {
    event?.stopPropagation();
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }
    const id = (product as any)?.id || (product as any)?._id;
    if (!id) return;
    this.cartService.addToCart(id, 1).subscribe({
      next: () => console.log('Added to cart:', product.name),
      error: (err: any) => console.error('Cart error:', err)
    });
  }

  toggleWishlist(product: Product, event?: Event) {
    event?.stopPropagation();
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }
    const id = (product as any)?.id || (product as any)?._id;
    if (!id) return;
    this.wishlistService.toggleWishlist(id).subscribe({
      next: () => console.log('Wishlist toggled:', product.name),
      error: (err: any) => console.error('Wishlist error:', err)
    });
  }

  isInWishlist(product: Product): boolean {
    const id = (product as any)?.id || (product as any)?._id;
    return !!id && this.wishlistService.isInWishlist(id);
  }

  quickView(product: Product, event: Event) {
    event.stopPropagation();
    const id = (product as any)?.id || (product as any)?._id;
    if (!id) return;
    this.router.navigate(['/products', id]);
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
