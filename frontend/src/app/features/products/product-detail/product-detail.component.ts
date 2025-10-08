import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AuthService } from '../../../core/services/auth.service';
// import { ToastrService } from 'ngx-toastr';
import { ShoppingActionsComponent } from '../../../shared/components/shopping-actions/shopping-actions.component';

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    images: string[];
    brand: string;
    category: string;
    sizes: { size: string; stock: number }[];
    colors: string[];
    rating: { average: number; count: number };
    features: string[];
    specifications: { [key: string]: string };
    isActive: boolean;
    stock: number;
    vendor: {
        _id: string;
        fullName: string;
        businessName: string;
    };
}

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule, ShoppingActionsComponent],
    styles: [`
    .product-detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 30px;
      font-size: 14px;
      color: #636e72;
    }

    .breadcrumb a {
      color: #0984e3;
      text-decoration: none;
      cursor: pointer;
    }

    .breadcrumb a:hover {
      text-decoration: underline;
    }

    .product-detail-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }

    .product-images {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .main-image {
      position: relative;
      aspect-ratio: 1;
      border-radius: 12px;
      overflow: hidden;
      background: #f8f9fa;
    }

    .main-product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-badges {
      position: absolute;
      top: 16px;
      left: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }

    .sale-badge {
      background: #e74c3c;
      color: white;
    }

    .stock-badge {
      background: #00b894;
      color: white;
    }

    .stock-badge.out-of-stock {
      background: #636e72;
    }

    .image-thumbnails {
      display: flex;
      gap: 8px;
      overflow-x: auto;
    }

    .thumbnail {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 8px;
      cursor: pointer;
      border: 2px solid transparent;
      transition: border-color 0.3s ease;
    }

    .thumbnail.active {
      border-color: #0984e3;
    }

    .product-info {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .product-title {
      font-size: 2rem;
      font-weight: 700;
      color: #2d3436;
      margin-bottom: 8px;
    }

    .product-brand {
      color: #636e72;
      font-size: 16px;
      margin-bottom: 16px;
    }

    .product-rating {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .stars {
      display: flex;
      gap: 2px;
    }

    .stars i {
      color: #ddd;
      font-size: 14px;
    }

    .stars i.filled {
      color: #f39c12;
    }

    .rating-text {
      font-size: 14px;
      color: #636e72;
    }

    .price-display {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .current-price {
      font-size: 2rem;
      font-weight: 700;
      color: #2d3436;
    }

    .original-price {
      font-size: 1.25rem;
      color: #636e72;
      text-decoration: line-through;
    }

    .savings {
      color: #00b894;
      font-weight: 600;
    }

    .product-options {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .option-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .option-label {
      font-weight: 600;
      color: #2d3436;
    }

    .size-options {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .size-option {
      padding: 8px 16px;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .size-option:hover:not(:disabled) {
      border-color: #0984e3;
    }

    .size-option.selected {
      border-color: #0984e3;
      background: rgba(9, 132, 227, 0.1);
    }

    .size-option:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .stock-info {
      font-size: 10px;
      color: #e74c3c;
    }

    .color-options {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
    }

    .color-option {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 3px solid #e9ecef;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .color-option.selected {
      border-color: #0984e3;
      transform: scale(1.1);
    }

    .color-option i {
      color: white;
      font-size: 12px;
      text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
    }

    .selected-color-name {
      font-size: 14px;
      color: #636e72;
      text-transform: capitalize;
    }

    .quantity-selector {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .qty-btn {
      width: 36px;
      height: 36px;
      border: 1px solid #ddd;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }

    .qty-btn:hover:not(:disabled) {
      border-color: #0984e3;
    }

    .qty-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .quantity {
      font-weight: 600;
      min-width: 20px;
      text-align: center;
    }

    .max-qty-info {
      font-size: 12px;
      color: #636e72;
    }

    .shopping-actions-container {
      margin: 24px 0;
    }

    .features-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .features-list li {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
      border-bottom: 1px solid #f1f3f4;
    }

    .features-list li:last-child {
      border-bottom: none;
    }

    .features-list i {
      color: #00b894;
      font-size: 12px;
    }

    .vendor-details {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .view-vendor-btn {
      padding: 8px 16px;
      background: #0984e3;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }

    .product-details-tabs {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .tab-headers {
      display: flex;
      border-bottom: 1px solid #e9ecef;
    }

    .tab-header {
      flex: 1;
      padding: 16px 24px;
      border: none;
      background: white;
      cursor: pointer;
      font-weight: 500;
      color: #636e72;
      transition: all 0.3s ease;
    }

    .tab-header.active {
      color: #0984e3;
      border-bottom: 2px solid #0984e3;
    }

    .tab-content {
      padding: 24px;
    }

    .specifications-table {
      display: grid;
      gap: 12px;
    }

    .spec-row {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 16px;
      padding: 12px 0;
      border-bottom: 1px solid #f1f3f4;
    }

    .spec-row:last-child {
      border-bottom: none;
    }

    .spec-label {
      font-weight: 600;
      color: #636e72;
    }

    .spec-value {
      color: #2d3436;
    }

    .loading-container,
    .error-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
    }

    .loading-spinner,
    .error-message {
      text-align: center;
    }

    .loading-spinner i {
      font-size: 2rem;
      color: #0984e3;
      margin-bottom: 16px;
    }

    .error-message i {
      font-size: 3rem;
      color: #e74c3c;
      margin-bottom: 16px;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: #0984e3;
      color: white;
    }

    .btn-primary:hover {
      background: #0770c2;
    }

    @media (max-width: 768px) {
      .product-detail-content {
        grid-template-columns: 1fr;
        gap: 24px;
      }

      .product-title {
        font-size: 1.5rem;
      }

      .current-price {
        font-size: 1.5rem;
      }

      .tab-headers {
        flex-direction: column;
      }

      .tab-header {
        text-align: left;
      }
    }
  `],
    templateUrl: './product-detail.component.html'
})
export class ProductDetailComponent implements OnInit {
    product: Product | null = null;
    loading = true;
    error = '';

    selectedImage = '';
    selectedSize = '';
    selectedColor = '';
    quantity = 1;
    activeTab = 'description';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private productService: ProductService,
        private cartService: CartService,
        private wishlistService: WishlistService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            const productId = params['id'];
            if (productId) {
                this.loadProduct(productId);
            }
        });
    }

    loadProduct(productId: string) {
        this.loading = true;
        this.error = '';

        // Load product from API
        setTimeout(() => {
            this.product = null; // Will be loaded from API
            this.loading = false;
        }, 1000);
    }

    get discountPercentage(): number {
        if (this.product?.originalPrice && this.product.originalPrice > this.product.price) {
            return Math.round(((this.product.originalPrice - this.product.price) / this.product.originalPrice) * 100);
        }
        return 0;
    }

    get savings(): number {
        if (this.product?.originalPrice && this.product.originalPrice > this.product.price) {
            return (this.product.originalPrice - this.product.price) * this.quantity;
        }
        return 0;
    }

    get maxQuantity(): number {
        if (this.product?.sizes && this.selectedSize) {
            const sizeInfo = this.product.sizes.find(s => s.size === this.selectedSize);
            return Math.min(sizeInfo?.stock || 0, 10);
        }
        return Math.min(this.product?.stock || 0, 10);
    }

    selectImage(image: string) {
        this.selectedImage = image;
    }

    selectSize(size: string) {
        this.selectedSize = size;
        this.quantity = 1; // Reset quantity when size changes
    }

    selectColor(color: string) {
        this.selectedColor = color;
    }

    getColorValue(colorName: string): string {
        const colorMap: { [key: string]: string } = {
            'red': '#e74c3c',
            'blue': '#3498db',
            'green': '#2ecc71',
            'black': '#2c3e50',
            'white': '#ecf0f1',
            'yellow': '#f1c40f',
            'purple': '#9b59b6',
            'orange': '#e67e22',
            'pink': '#e91e63',
            'brown': '#8d6e63',
            'gray': '#95a5a6',
            'grey': '#95a5a6'
        };
        return colorMap[colorName.toLowerCase()] || '#ddd';
    }

    increaseQuantity() {
        if (this.quantity < this.maxQuantity) {
            this.quantity++;
        }
    }

    decreaseQuantity() {
        if (this.quantity > 1) {
            this.quantity--;
        }
    }

    onBuyNow() {
        if (!this.product) return;

        // Simulate buy now action
        alert(`Added ${this.quantity} x ${this.product.name} to cart`);
        this.router.navigate(['/checkout']);
    }

    onProductClick() {
        // Handle product click if needed
    }

    viewVendor() {
        if (this.product?.vendor) {
            this.router.navigate(['/vendor', this.product.vendor._id]);
        }
    }

    goHome() {
        this.router.navigate(['/']);
    }

    goToProducts() {
        this.router.navigate(['/products']);
    }

    objectKeys(obj: any): string[] {
        return Object.keys(obj);
    }
}
