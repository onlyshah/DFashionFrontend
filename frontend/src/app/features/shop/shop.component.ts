import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.interface';
import { environment } from 'src/environments/environment';

interface Category {
  id: string;
  name: string;
  image: string;
  subcategories: string[];
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
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit {
  searchQuery = '';
  categories: Category[] = [];
  featuredBrands: Brand[] = [];
  trendingProducts: ShopProduct[] = [];
  newArrivals: ShopProduct[] = [];
    imageUrl = environment.apiUrl

  constructor(
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadFeaturedBrands();
    this.loadTrendingProducts();
    this.loadNewArrivals();
  }

  loadCategories() {
    // Load categories from real API
    this.productService.getCategories().subscribe({
      next: (response) => {
        this.categories = response?.data || [];
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.categories = [];
      }
    });
  }

  loadFeaturedBrands() {
    // Load from real API
    this.productService.getFeaturedBrands().subscribe({
      next: (response) => {
        this.featuredBrands = response?.data || [];
      },
      error: (error) => {
        console.error('Error loading featured brands:', error);
        this.featuredBrands = [];
      }
    });
  }

  loadTrendingProducts() {
    // Load from real API
    this.productService.getTrendingProducts().subscribe({
      next: (response) => {
        this.trendingProducts = (response?.data || []).map((product: Product) => ({
          ...product,
          isTrending: true,
          isNew: false
        }));
      },
      error: (error) => {
        console.error('Error loading trending products:', error);
        this.trendingProducts = [];
      }
    });
  }

  loadNewArrivals() {
    // Load from real API
    this.productService.getNewArrivals().subscribe({
      next: (response) => {
        this.newArrivals = (response?.data || []).map((product: Product) => ({
          ...product,
          isNew: true,
          isTrending: false
        }));
      },
      error: (error) => {
        console.error('Error loading new arrivals:', error);
        this.newArrivals = [];
      }
    });
  }

  search() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
    }
  }

  navigateToCategory(categoryId: string) {
    this.router.navigate(['/category', categoryId]);
  }

  navigateToBrand(brandId: string) {
    this.router.navigate(['/brand', brandId]);
  }

  viewProduct(product: any) {
    this.router.navigate(['/product', product._id]);
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
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.origin + '/product/' + product._id
      });
    }
  }

  commentOnProduct(product: any, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/product', product._id], {
      queryParams: { action: 'comment' }
    });
  }

  viewAllTrending() {
    this.router.navigate(['/category/trending']);
  }

  viewAllNew() {
    this.router.navigate(['/category/new-arrivals']);
  }

  addToWishlist(product: Product, event: Event) {
    event.stopPropagation();
    // TODO: Check authentication first
    if (!this.isAuthenticated()) {
      this.showLoginPrompt('add to wishlist');
      return;
    }
    // TODO: Implement wishlist API call
    console.log('Add to wishlist:', product);
  this.showSuccessMessage(product.name + ' added to wishlist!');
  }

  quickAddToCart(product: Product, event: Event) {
    event.stopPropagation();
    // TODO: Check authentication first
    if (!this.isAuthenticated()) {
      this.showLoginPrompt('add to cart');
      return;
    }
    // TODO: Implement add to cart API call
    console.log('Add to cart:', product);
  this.showSuccessMessage(product.name + ' added to cart!');
  }

  getProductImage(product: Product): string {
    return this.imageUrl+product.images[0]?.url || '/uploads/default/placeholder.jpg';
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
    // TODO: Implement actual authentication check
    return localStorage.getItem('authToken') !== null;
  }

  private showLoginPrompt(action: string) {
  const message = 'Please login to ' + action;
  if (confirm(message + '. Would you like to login now?')) {
      this.router.navigate(['/auth/login']);
    }
  }

  private showSuccessMessage(message: string) {
    // TODO: Implement proper toast/notification system
    alert(message);
  }
}