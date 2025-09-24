import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  images: string[];
  brand?: string;
  rating?: {
    average: number;
    count: number;
  };
  isWishlisted?: boolean;
  isFeatured?: boolean;
  discount?: number;
}

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() showDescription: boolean = true;
  @Input() showRating: boolean = true;
  @Input() showActions: boolean = true;
  @Input() priceSize: 'small' | 'medium' | 'large' = 'medium';

  @Output() productClick = new EventEmitter<Product>();
  @Output() wishlistToggle = new EventEmitter<Product>();
  @Output() addToCart = new EventEmitter<Product>();
  @Output() buyNow = new EventEmitter<Product>();

  onProductClick(): void {
    this.productClick.emit(this.product);
  }

  onWishlistToggle(event: Event): void {
    event.stopPropagation();
    this.wishlistToggle.emit(this.product);
  }

  onAddToCart(event: Event): void {
    event.stopPropagation();
    this.addToCart.emit(this.product);
  }

  onBuyNow(event: Event): void {
    event.stopPropagation();
    this.buyNow.emit(this.product);
  }
}
