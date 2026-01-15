import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { WishlistNewService, WishlistItem } from '../../../../../core/services/wishlist-new.service';
import { CartService } from '../../../../../core/services/cart.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-wishlist',
    imports: [CommonModule],
    styles: [`
    .wishlist-page {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .wishlist-header {
      margin-bottom: 2rem;
      text-align: center;
    }

    .wishlist-header h1 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: #333;
    }

    .wishlist-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .wishlist-item {
      border: 1px solid #eee;
      border-radius: 12px;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .wishlist-item:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .item-image {
      position: relative;
      aspect-ratio: 1;
      overflow: hidden;
    }

    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .remove-btn {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      color: #dc3545;
    }

    .remove-btn:hover {
      background: #dc3545;
      color: white;
      transform: scale(1.1);
    }

    .item-details {
      padding: 1rem;
    }

    .item-details h3 {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #333;
    }

    .brand {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .price {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      flex-wrap: wrap;
    }

    .current-price {
      font-size: 1.2rem;
      font-weight: 700;
      color: #e91e63;
    }

    .original-price {
      font-size: 1rem;
      color: #999;
      text-decoration: line-through;
    }

    .discount {
      background: #e91e63;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .stars {
      display: flex;
      gap: 2px;
    }

    .stars i {
      color: #ffc107;
      font-size: 0.9rem;
    }

    .item-actions {
      display: flex;
      gap: 0.5rem;
    }

    .add-to-cart-btn {
      flex: 1;
      background: #007bff;
      color: white;
      border: none;
      padding: 0.75rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: background 0.2s;
    }

    .add-to-cart-btn:hover {
      background: #0056b3;
    }

    .view-product-btn {
      flex: 1;
      background: transparent;
      color: #007bff;
      border: 2px solid #007bff;
      padding: 0.75rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .view-product-btn:hover {
      background: #007bff;
      color: white;
    }

    .wishlist-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;
    }

    .clear-wishlist-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .clear-wishlist-btn:hover {
      background: #c82333;
    }

    .continue-shopping-btn {
      background: transparent;
      color: #007bff;
      border: 2px solid #007bff;
      padding: 1rem 2rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .continue-shopping-btn:hover {
      background: #007bff;
      color: white;
    }

    .empty-wishlist {
      text-align: center;
      padding: 4rem 2rem;
      color: #666;
    }

    .empty-wishlist i {
      font-size: 4rem;
      margin-bottom: 1rem;
      color: #e91e63;
    }

    .shop-now-btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 1rem;
    }

    .loading-container {
      text-align: center;
      padding: 4rem 2rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .wishlist-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
      }

      .wishlist-actions {
        flex-direction: column;
        align-items: center;
      }

      .clear-wishlist-btn,
      .continue-shopping-btn {
        width: 100%;
        max-width: 300px;
      }
    }
  `],
    templateUrl: './wishlist.component.html'
})
export class WishlistComponent implements OnInit {
    // Calculate discount percentage for a product
    getDiscount(product: any): number {
        if (!product.originalPrice || product.originalPrice <= product.price) return 0;
        return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    wishlistItems: WishlistItem[] = [];
    isLoading = true;
    imageUrl = environment.apiUrl;
    constructor(
        private wishlistService: WishlistNewService,
        private cartService: CartService,
        private router: Router
    ) { }

    ngOnInit() {
        this.loadWishlist();
        this.subscribeToWishlistUpdates();
    }

    loadWishlist() {
        this.isLoading = true;
        this.wishlistService.loadWishlist().subscribe({
            next: () => {
                this.isLoading = false;
                // Items will be updated via subscription
            },
            error: (error: any) => {
                console.error('Failed to load wishlist:', error);
                this.isLoading = false;
                this.wishlistItems = [];
            }
        });
    }

    subscribeToWishlistUpdates() {
        this.wishlistService.wishlist$.subscribe(wishlist => {
            this.wishlistItems = wishlist?.items || [];
        });
    }

    removeFromWishlist(productId: string) {
        this.wishlistService.removeFromWishlist(productId).subscribe({
            next: () => {
                this.loadWishlist(); // Refresh wishlist
            },
            error: (error) => {
                console.error('Failed to remove from wishlist:', error);
            }
        });
    }

    addToCart(productId: string) {
        this.cartService.addToCart(productId, 1).subscribe({
            next: () => {
                this.showNotification('Added to cart successfully!');
            },
            error: (error) => {
                console.error('Failed to add to cart:', error);
                this.showNotification('Failed to add to cart');
            }
        });
    }

    viewProduct(productId: string) {
        this.router.navigate(['/product', productId]);
    }

    clearWishlist() {
        if (confirm('Are you sure you want to clear your entire wishlist?')) {
            // Remove all items one by one (WishlistNewService does not have clearWishlist)
            const ids = this.wishlistItems.map(item => item.product._id);
            ids.forEach(id => {
                this.removeFromWishlist(id);
            });
            this.wishlistItems = [];
        }
    }

    continueShopping() {
        this.router.navigate(['/']);
    }

    getStars(rating: number): string[] {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars.push('fas fa-star');
            } else if (i - 0.5 <= rating) {
                stars.push('fas fa-star-half-alt');
            } else {
                stars.push('far fa-star');
            }
        }
        return stars;
    }

    private showNotification(message: string) {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      z-index: 10000;
      font-size: 14px;
      animation: slideIn 0.3s ease;
    `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}
