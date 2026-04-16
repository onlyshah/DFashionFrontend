import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductStateService, ProductState } from '../../../../../core/services/product-state.service';

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
    styleUrls: ['./product-card.component.scss'],
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCardComponent implements OnInit {
  @Input() product!: Product;
  @Input() showDescription: boolean = true;
  @Input() showRating: boolean = true;
  @Input() showActions: boolean = true;
  @Input() priceSize: 'small' | 'medium' | 'large' = 'medium';

  @Output() productClick = new EventEmitter<Product>();
  @Output() wishlistToggle = new EventEmitter<{ product: Product; newState: boolean }>();
  @Output() cartToggle = new EventEmitter<{ product: Product; newState: boolean }>();
  @Output() buyNow = new EventEmitter<Product>();

  // State observables
  productState$: Observable<ProductState> | null = null;
  isInCart = false;
  isInWishlist = false;
  isLoading = false;

  constructor(private productStateService: ProductStateService) {}

  ngOnInit(): void {
    if (this.product?._id) {
      this.productState$ = this.productStateService.getProductState$(this.product._id);
      this.productState$.subscribe(state => {
        this.isInCart = state.isInCart;
        this.isInWishlist = state.isInWishlist;
      });
    }
  }

  onProductClick(): void {
    this.productClick.emit(this.product);
  }

  onWishlistToggle(event: Event): void {
    event.stopPropagation();
    const newState = !this.isInWishlist;
    this.wishlistToggle.emit({ product: this.product, newState });
  }

  onCartToggle(event: Event): void {
    event.stopPropagation();
    const newState = !this.isInCart;
    this.cartToggle.emit({ product: this.product, newState });
  }

  onBuyNow(event: Event): void {
    event.stopPropagation();
    this.buyNow.emit(this.product);
  }

  getCartButtonText(): string {
    return this.isLoading ? 'Loading...' : (this.isInCart ? 'Remove from Cart' : 'Add to Cart');
  }

  getCartButtonColor(): string {
    return this.isInCart ? 'danger' : 'primary';
  }
}
