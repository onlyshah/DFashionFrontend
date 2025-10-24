import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, firstValueFrom, forkJoin } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { StorageService } from './storage.service';
import { ToastController } from '@ionic/angular';
import { environment } from '../../../environments/environment';

export interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    originalPrice?: number;
    images: { url: string; isPrimary: boolean }[];
    brand: string;
    discount?: number;
  };
  quantity: number;
  size?: string;
  color?: string;
  addedAt: Date;
}

export interface CartSummary {
  itemCount: number;
  totalQuantity: number;
  subtotal: number;
  discount: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly API_URL = environment.apiUrl;
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  private cartSummary = new BehaviorSubject<CartSummary | null>(null);
  private cartItemCount = new BehaviorSubject<number>(0);
  private cartTotalAmount = new BehaviorSubject<number>(0);
  private showCartTotalPrice = new BehaviorSubject<boolean>(false);
  private totalItemCount = new BehaviorSubject<number>(0); // Combined cart + wishlist count
  private isLoadingCart = false;
  private useLocalStorageOnly = false; // Use real database integration only

  public cartItems$ = this.cartItems.asObservable();
  public cartSummary$ = this.cartSummary.asObservable();
  public cartItemCount$ = this.cartItemCount.asObservable();
  public cartTotalAmount$ = this.cartTotalAmount.asObservable();
  public totalItemCount$ = this.totalItemCount.asObservable();
  public showCartTotalPrice$ = this.showCartTotalPrice.asObservable();

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private toastController: ToastController
  ) {
    // Initialize cart on service creation - but only load from storage for guest users
    this.initializeCart();
  }

  private initializeCart() {
    const token = localStorage.getItem('token');
    if (token) {
      // User is authenticated, load from API
      this.loadCart();
    } else {
      // Guest user, load from local storage only
      console.log('🔄 Guest user detected, loading cart from local storage only...');
      this.loadCartFromStorage();
    }
  }

  // Get cart from API
  getCart(): Observable<{ success: boolean; cart: any; summary: any }> {
    const token = localStorage.getItem('token');
    const options = token ? {
      headers: { 'Authorization': `Bearer ${token}` }
    } : {};
    return this.http.get<{ success: boolean; cart: any; summary: any }>(`${this.API_URL}/api/cart-new`, options);
  }

  // Get cart count only (lightweight endpoint) - returns total quantities
  getCartCount(): Observable<{ success: boolean; count: number; totalItems: number; itemCount: number; totalAmount: number; showTotalPrice: boolean }> {
    const token = localStorage.getItem('token');
    const options = token ? {
      headers: { 'Authorization': `Bearer ${token}` }
    } : {};
    return this.http.get<{ success: boolean; count: number; totalItems: number; itemCount: number; totalAmount: number; showTotalPrice: boolean }>(`${this.API_URL}/cart-new/count`, options);
  }

  // Get total count for logged-in user (cart + wishlist)
  getTotalCount(): Observable<any> {
    const token = localStorage.getItem('token');
    const options = token ? {
      headers: { 'Authorization': `Bearer ${token}` }
    } : {};
    return this.http.get<any>(`${this.API_URL}/api/cart-new/total-count`, options);
  }

  // Debug cart data
  debugCart(): Observable<any> {
    const token = localStorage.getItem('token');
    const options = token ? {
      headers: { 'Authorization': `Bearer ${token}` }
    } : {};
    return this.http.get<any>(`${this.API_URL}/cart-new/debug`, options).pipe(
      catchError(error => {
        console.log('🔍 Debug endpoint not available, skipping debug');
        return of({ success: false, message: 'Debug endpoint not available' });
      })
    );
  }

  // Recalculate cart totals
  recalculateCart(): Observable<any> {
    const token = localStorage.getItem('token');
    const options = token ? {
      headers: { 'Authorization': `Bearer ${token}` }
    } : {};
    return this.http.post<any>(`${this.API_URL}/cart-new/recalculate`, {}, options).pipe(
      catchError(error => {
        console.log('🔧 Recalculate endpoint not available, skipping recalculation');
        return of({ success: false, message: 'Recalculate endpoint not available' });
      })
    );
  }

  // Load cart and update local state
  loadCart() {
    // Always use real database integration
    const token = localStorage.getItem('token');

    if (token) {
      // User is logged in - load from API
      console.log('🔄 User authenticated, loading cart from API...');
      this.loadCartFromAPI();
    } else {
      // Guest user - require authentication for cart functionality
      console.log('🔄 Guest user detected, cart requires authentication');
      this.cartItems.next([]);
      this.cartSummary.next(null);
      this.updateCartCount();
    }
  }

  // Load cart from API for logged-in users
  private loadCartFromAPI() {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ No authentication token, using local storage fallback');
      this.loadCartFromStorage();
      return;
    }

    // Prevent multiple simultaneous API calls
    if (this.isLoadingCart) {
      console.log('🔄 Cart already loading, skipping duplicate request');
      return;
    }

    this.isLoadingCart = true;

    this.getCart().subscribe({
      next: (response) => {
        this.isLoadingCart = false;
        if (response.success && response.cart) {
          const items = response.cart.items || [];
          this.cartItems.next(items);
          this.cartSummary.next(response.summary);
          this.updateCartCount();
          console.log('✅ Cart loaded from API:', items.length, 'items');
          console.log('🛒 Cart items details:', items.map((item: any) => ({
            id: item._id,
            name: item.product?.name,
            quantity: item.quantity,
            price: item.product?.price
          })));
        } else {
          // No cart data from API, initialize empty cart
          this.cartItems.next([]);
          this.cartSummary.next(null);
          this.updateCartCount();
          console.log('❌ No cart data from API');
        }
      },
      error: (error) => {
        this.isLoadingCart = false;
        console.error('❌ API cart error:', error);

        if (error.status === 401) {
          console.log('❌ Authentication failed, clearing token');
          localStorage.removeItem('token');
          this.cartItems.next([]);
          this.cartSummary.next(null);
          this.updateCartCount();
        } else if (error.status === 500) {
          console.log('❌ Server error, using local storage fallback');
          this.loadCartFromStorage();
        } else {
          console.log('❌ API error, using local storage fallback');
          this.loadCartFromStorage();
        }
      }
    });
  }

  private async loadCartFromStorage() {
    try {
      // Check if storage service is available
      if (!this.storageService) {
        console.log('Storage service not available, using empty cart');
        this.cartItems.next([]);
        this.updateCartCount();
        return;
      }

      // Wait a bit for storage to initialize
      await new Promise(resolve => setTimeout(resolve, 100));
      const cart = await this.storageService.getCart();
      this.cartItems.next(cart || []);
      this.updateCartCount();
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      this.cartItems.next([]);
      this.updateCartCount();
    }
  }

  private async saveCartToStorage() {
    try {
      if (!this.storageService) {
        console.log('Storage service not available, skipping cart save');
        return;
      }
      await this.storageService.setCart(this.cartItems.value);
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }

  private updateCartCount() {
    const items = this.cartItems.value || [];
    const count = items.reduce((total, item) => total + item.quantity, 0);
    this.cartItemCount.next(count);
    console.log('🛒 Cart count updated:', count);
  }

  // Method to refresh cart on user login
  refreshCartOnLogin() {
    console.log('🔄 Refreshing cart on login...');
    this.loadCartFromAPI();
  }

  // Method to refresh total count (cart + wishlist) for logged-in user
  refreshTotalCount() {
    const token = localStorage.getItem('token');
    if (token) {
      // Skip debug for now and go directly to getting total count
      console.log('🔄 Refreshing total count for logged-in user...');
      this.getTotalCountAfterRecalculation();
    } else {
      // No token, set all counts to 0
      this.resetAllCounts();
    }
  }

  private getTotalCountAfterRecalculation() {
    // Only refresh if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('🔒 No authentication token, skipping cart count refresh');
      this.resetAllCounts();
      return;
    }

    this.getTotalCount().subscribe({
      next: (response) => {
        if (response.success) {
          const data = response.data;

          // Update cart count with TOTAL QUANTITY (not just item count)
          this.cartItemCount.next(data.cart.quantityTotal || 0);
          this.cartTotalAmount.next(data.cart.totalAmount || 0);
          this.showCartTotalPrice.next(data.showCartTotalPrice || false);

          // Update TOTAL COUNT (cart + wishlist)
          this.totalItemCount.next(data.totalCount || 0);

          console.log('🔢 Total count refreshed for user:', response.username, {
            cartQuantityTotal: data.cart.quantityTotal,
            cartItemCount: data.cart.itemCount,
            wishlistItems: data.wishlist.itemCount,
            totalCount: data.totalCount,
            cartTotal: data.cart.totalAmount,
            showPrice: data.showCartTotalPrice
          });
        }
      },
      error: (error) => {
        console.error('❌ Error refreshing total count:', error);
        if (error.status === 401) {
          console.log('❌ Authentication failed, clearing token');
          localStorage.removeItem('token');
          this.resetAllCounts();
        } else if (error.status === 404) {
          console.log('❌ Total count endpoint not found, using fallback');
          // Fallback: Load cart directly to get counts
          this.loadCartFromAPI();
        } else {
          // For other errors, reset counts to avoid showing stale data
          this.resetAllCounts();
        }
      }
    });
  }

  // Method to refresh only cart count (lightweight) - kept for backward compatibility
  refreshCartCount() {
    this.refreshTotalCount(); // Use the new total count method
  }

  // Reset all counts to 0
  private resetAllCounts() {
    this.cartItemCount.next(0);
    this.cartTotalAmount.next(0);
    this.showCartTotalPrice.next(false);
    this.totalItemCount.next(0);
    console.log('🔄 All counts reset to 0');
  }

  // Method to clear cart on logout
  clearCartOnLogout() {
    console.log('🔄 Clearing cart on logout...');
    this.cartItems.next([]);
    this.cartSummary.next(null);
    this.resetAllCounts();
  }

  // Temporary method to enable/disable API calls
  setUseLocalStorageOnly(useLocalOnly: boolean) {
    this.useLocalStorageOnly = useLocalOnly;
    console.log('🔧 Cart API calls', useLocalOnly ? 'DISABLED' : 'ENABLED');
    if (useLocalOnly) {
      console.log('🔧 Cart will use local storage only');
    }
  }

  // Add item to cart via API
  addToCart(productId: string, quantity: number = 1, size?: string, color?: string): Observable<{ success: boolean; message: string }> {
    const payload = { productId, quantity, size, color };
    const token = localStorage.getItem('token');
    const options = token ? {
      headers: { 'Authorization': `Bearer ${token}` }
    } : {};
  return this.http.post<{ success: boolean; message: string }>(`${this.API_URL}/api/cart-new/add`, payload, options).pipe(
      tap(response => {
        if (response.success) {
          // Immediately refresh cart to get updated count
          this.loadCartFromAPI();
        }
      })
    );
  }

  // Backwards-compatible wrappers used by older components (CartNewService API)
  addFromWishlist(productId: string, quantity: number = 1, size?: string, color?: string) {
    return this.addToCart(productId, quantity, size, color);
  }

  addFromProduct(productId: string, quantity: number = 1, size?: string, color?: string) {
    return this.addToCart(productId, quantity, size, color);
  }

  addFromPost(productId: string, quantity: number = 1, size?: string, color?: string) {
    return this.addToCart(productId, quantity, size, color);
  }
  // Backwards-compatible wrappers finished. (Do not close the class here.)
  // Fallback method to add item to cart when called with a product object (tries API then local storage)
    async addToCartLocal(product: any, quantity: number = 1, size?: string, color?: string): Promise<boolean> {
      try {
        const productId = (product && (product._id || product.id)) || String(product);

        // Try API first (if authenticated), otherwise fall back to local storage
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const response = await this.addToCart(productId, quantity, size, color).toPromise();
            if (response?.success) {
              await this.showToast('Item added to cart', 'success');
              this.loadCart(); // Refresh cart from API
              return true;
            }
          } catch (apiError) {
            console.log('API not available or failed, using local storage fallback', apiError);
          }
        }

        // Fallback to local storage (for guest users or when API fails)
        const cartItem: CartItem = {
          _id: `${productId}_${size || 'default'}_${color || 'default'}`,
          product: {
            _id: productId,
            name: product?.name || '',
            price: product?.price || 0,
            originalPrice: product?.originalPrice,
            images: product?.images || [],
            brand: product?.brand || '',
            discount: product?.discount
          },
          quantity,
          size,
          color,
          addedAt: new Date()
        };

        const currentCart = [...(this.cartItems.value || [])];
        const existingItemIndex = currentCart.findIndex((item: CartItem) =>
          item.product._id === productId &&
          (item.size || 'default') === (size || 'default') &&
          (item.color || 'default') === (color || 'default')
        );

        if (existingItemIndex >= 0) {
          currentCart[existingItemIndex] = {
            ...currentCart[existingItemIndex],
            quantity: currentCart[existingItemIndex].quantity + quantity
          };
        } else {
          currentCart.push(cartItem);
        }

        this.cartItems.next(currentCart);
        this.updateCartCount();
        await this.saveCartToStorage();
        await this.showToast('Item added to cart', 'success');
        return true;
      } catch (error) {
        console.error('Error adding to cart (local):', error);
        await this.showToast('Failed to add item to cart', 'danger');
        return false;
      }
    }

  // Legacy method
  async updateQuantity(itemId: string, quantity: number): Promise<void> {
    try {
      if (quantity <= 0) {
        await this.removeFromCartLegacy(itemId);
        return;
      }

      const response = await firstValueFrom(this.updateCartItem(itemId, quantity));
      if (response?.success) {
        this.loadCart(); // Refresh cart
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      await this.showToast('Failed to update quantity', 'danger');
    }
  }
  updateCartItem(itemId: string, quantity: number): Observable<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token');
    const options = token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : {};
    return this.http.put<{ success: boolean; message: string }>(`${this.API_URL}/api/cart-new/update/${itemId}`, { quantity }, options).pipe(
      tap((response: any) => {
        if (response.success) {
          // Immediately refresh cart to get updated count
          this.loadCartFromAPI();
        }
      }),
      catchError(error => {
        console.error('Error updating cart item:', error);
        return of({ success: false, message: 'Update failed' });
      })
    );
  }
  async removeFromCartLegacy(itemId: string): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const options = token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {};

      const response = await firstValueFrom(
        this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/api/cart-new/remove/${itemId}`, options).pipe(
          tap((res: any) => {
            if (res.success) {
              this.loadCartFromAPI();
            }
          }),
          catchError(error => {
            console.error('Error removing cart item:', error);
            return of({ success: false, message: 'Remove failed' });
          })
        )
      );

      // optional: handle response if needed
      return;
    } catch (error) {
      console.error('Error in removeFromCartLegacy:', error);
    }
  }

  // Observable-based API for removing a single item (used by many components)
  removeFromCart(itemId: string): Observable<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token');
    const options = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

    return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/api/cart-new/remove/${itemId}`, options).pipe(
      tap((res: any) => {
        if (res?.success) {
          // Refresh cart state after successful removal
          this.loadCartFromAPI();
        }
      }),
      catchError(error => {
        console.error('Error removing cart item:', error);
        return of({ success: false, message: 'Remove failed' });
      })
    );
  }

  // Bulk remove items - try a bulk API endpoint, fall back to sequential deletes
  bulkRemoveFromCart(itemIds: string[]): Observable<{ success: boolean; message: string; removedCount?: number }> {
    const token = localStorage.getItem('token');
    const options = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

    // Try a single bulk API call first
    return this.http.post<{ success: boolean; message: string; removedCount?: number }>(`${this.API_URL}/api/cart-new/bulk-remove`, { ids: itemIds }, options).pipe(
      tap((res: any) => {
        if (res?.success) {
          this.loadCartFromAPI();
        }
      }),
      map((res: any) => ({ success: !!res?.success, message: res?.message || '', removedCount: res?.removedCount || 0 })),
      catchError(err => {
        // Fallback: perform sequential deletes and aggregate the results
        console.warn('Bulk remove API failed, falling back to sequential removes', err);
        const deleteCalls = itemIds.map(id =>
          this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/api/cart-new/remove/${id}`, options).pipe(
            catchError(e => of({ success: false, message: 'remove failed' }))
          )
        );

        return forkJoin(deleteCalls).pipe(
          map((results: any[]) => {
            const removedCount = results.filter(r => r && r.success).length;
            const allSuccess = results.every(r => r && r.success);
            if (removedCount > 0) {
              this.loadCartFromAPI();
            }
            return { success: allSuccess, message: allSuccess ? 'Bulk remove successful' : 'Some removes failed', removedCount };
          })
        );
      })
    );
  }

  // Clear cart via API
  clearCartAPI(): Observable<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token');
    const options = token ? {
      headers: { 'Authorization': `Bearer ${token}` }
    } : {};
    return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/cart-new/clear`, options);
  }

  async clearCart(): Promise<void> {
    try {
      const response = await this.clearCartAPI().toPromise();
      if (response?.success) {
        this.cartItems.next([]);
        this.cartSummary.next(null);
        this.updateCartCount();
        await this.showToast('Cart cleared', 'success');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      await this.showToast('Failed to clear cart', 'danger');
    }
  }

  getCartTotal(): number {
    const summary = this.cartSummary.value;
    if (summary) {
      return summary.total;
    }

    // Fallback calculation
    return this.cartItems.value.reduce((total, item) => {
      const price = item.product.price;
      return total + (price * item.quantity);
    }, 0);
  }

  // Get total count (cart + wishlist items) for the logged-in user
  getTotalItemCount(): number {
    return this.totalItemCount.value;
  }

  // Get cart item count only
  getCartItemCount(): number {
    return this.cartItemCount.value;
  }

  // Get cart total amount
  getCartTotalAmount(): number {
    return this.cartTotalAmount.value;
  }

  // Check if cart total price should be displayed (when cart has 4+ products)
  shouldShowCartTotalPrice(): boolean {
    return this.showCartTotalPrice.value;
  }

  isInCart(productId: string, size?: string, color?: string): boolean {
    return this.cartItems.value.some(item =>
      item.product._id === productId &&
      (item.size || 'default') === (size || 'default') &&
      (item.color || 'default') === (color || 'default')
    );
  }

  getCartItem(productId: string, size?: string, color?: string): CartItem | undefined {
    return this.cartItems.value.find(item =>
      item.product._id === productId &&
      (item.size || 'default') === (size || 'default') &&
      (item.color || 'default') === (color || 'default')
    );
  }

  // Load cart count on user login
  async loadCartCountOnLogin(): Promise<void> {
    try {
      // Get token with fallback to localStorage
      let token: string | null = null;

      if (!this.storageService) {
        console.warn('Storage service not available, using localStorage fallback');
        token = localStorage.getItem('token');
      } else {
        token = await this.storageService.get('token');
      }

      if (!token) {
        this.cartItemCount.next(0);
        this.cartTotalAmount.next(0);
        return;
      }

      const response = await this.http.get<any>(`${this.API_URL}/api/cart-new`, {
        headers: { Authorization: `Bearer ${token}` }
      }).toPromise();

      if (response?.success && response?.cart) {
        const itemCount = response.cart.items?.length || 0;
        const totalAmount = response.cart.total || 0;

        this.cartItemCount.next(itemCount);
        this.cartTotalAmount.next(totalAmount);

        // Update total item count (cart + wishlist)
        this.updateTotalItemCount();
      }
    } catch (error) {
      console.error('Error loading cart count:', error);
      this.cartItemCount.next(0);
      this.cartTotalAmount.next(0);
    }
  }

  // Update total item count (cart + wishlist combined)
  private updateTotalItemCount(): void {
    const cartCount = this.cartItemCount.value;
    // We'll get wishlist count from wishlist service
    this.totalItemCount.next(cartCount);
  }

  // Clear cart data on logout
  clearCartData(): void {
    this.cartItems.next([]);
    this.cartSummary.next(null);
    this.cartItemCount.next(0);
    this.cartTotalAmount.next(0);
    this.totalItemCount.next(0);
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }

}