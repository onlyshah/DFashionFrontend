import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="product-detail-container">
      <div class="product-header">
        <button class="back-btn" (click)="goBack()">
          <i class="fas fa-arrow-left"></i>
          Back
        </button>
        <h1>Product Details</h1>
      </div>

      <div class="product-content" *ngIf="product">
        <div class="product-image">
          <img [src]="getProductImage(product)" [alt]="product.name">
        </div>
        <div class="product-info">
          <h2>{{ product.name }}</h2>
          <p class="price">₹{{ product.price }}</p>
          <p class="description">{{ product.description }}</p>

          <div class="product-actions">
            <button class="btn-cart">Add to Cart</button>
            <button class="btn-wishlist">Add to Wishlist</button>
            <button class="btn-buy">Buy Now</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-detail-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .product-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .back-btn {
      background: #f8f9fa;
      border: 1px solid #ddd;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: background 0.2s;
    }

    .back-btn:hover {
      background: #e9ecef;
    }

    .product-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .product-image img {
      width: 100%;
      border-radius: 8px;
    }

    .product-info h2 {
      font-size: 2rem;
      margin-bottom: 1rem;
      color: #333;
    }

    .price {
      font-size: 1.5rem;
      font-weight: 700;
      color: #e91e63;
      margin-bottom: 1rem;
    }

    .description {
      color: #666;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .product-actions {
      display: flex;
      gap: 1rem;
    }

    .btn-cart, .btn-wishlist, .btn-buy {
      padding: 1rem 2rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-cart {
      background: #007bff;
      color: white;
    }

    .btn-cart:hover {
      background: #0056b3;
    }

    .btn-wishlist {
      background: #f8f9fa;
      color: #666;
      border: 1px solid #ddd;
    }

    .btn-wishlist:hover {
      background: #e9ecef;
    }

    .btn-buy {
      background: #28a745;
      color: white;
    }

    .btn-buy:hover {
      background: #218838;
    }

    @media (max-width: 768px) {
      .product-content {
        grid-template-columns: 1fr;
      }

      .product-actions {
        flex-direction: column;
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  productId: string | null = null;
  product: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.productId = params['id'];
      if (this.productId) {
        this.loadProduct();
      }
    });
  }

  loadProduct() {
    if (!this.productId) return;

    this.loading = true;
    this.productService.getProductById(this.productId).subscribe({
      next: (response) => {
        this.product = response?.data || null;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.product = null;
        this.loading = false;
      }
    });
  }

  getProductImage(product: any): string {
    return product?.images?.[0]?.url || '/assets/images/default-product.svg';
  }

  goBack() {
    this.router.navigate(['/']);
  }
}