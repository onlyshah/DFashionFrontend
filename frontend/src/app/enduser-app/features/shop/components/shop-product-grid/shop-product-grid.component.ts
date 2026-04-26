import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../../../core/models/product.interface';
import { environment } from 'src/environments/environment';

/**
 * Reusable Product Grid Component for Shop
 * Displays products in a clean grid layout with cart/wishlist actions
 * 
 * Purpose: Extract product grid logic from shop.component
 * for better code organization and reusability
 */
@Component({
  selector: 'app-shop-product-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shop-product-grid.component.html',
  styleUrls: ['./shop-product-grid.component.scss']
})
export class ShopProductGridComponent implements OnInit {
  @Input() products: Product[] = [];
  @Input() title: string = '';
  @Input() emptyMessage: string = 'Browse products and add them to your cart';
  @Input() showViewAllButton: boolean = false;
  @Input() imageUrl = environment.apiUrl;

  @Output() productClick = new EventEmitter<Product>();
  @Output() addToWishlist = new EventEmitter<{ product: Product; event: Event }>();
  @Output() addToCart = new EventEmitter<{ product: Product; event: Event }>();
  @Output() viewAll = new EventEmitter<void>();

  ngOnInit() {
    // Component initialization if needed
  }

  onProductClick(product: Product) {
    this.productClick.emit(product);
  }

  onAddToWishlist(product: Product, event: Event) {
    event.stopPropagation();
    this.addToWishlist.emit({ product, event });
  }

  onAddToCart(product: Product, event: Event) {
    event.stopPropagation();
    this.addToCart.emit({ product, event });
  }

  onViewAll() {
    this.viewAll.emit();
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
    const originalPrice = (product as any).originalPrice;
    if (!originalPrice || originalPrice <= product.price) return 0;
    return Math.round(((originalPrice - product.price) / originalPrice) * 100);
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0);
  }
}
