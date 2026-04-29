import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of, throwError } from 'rxjs';
import { catchError, finalize, map, switchMap, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import { ProductStateService } from './product-state.service';
import { AuthService } from './auth.service';

export interface CartProductImage {
  url: string;
  isPrimary: boolean;
}

export interface CartProduct {
  _id: string;
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: CartProductImage[];
  brand: string;
  discount?: number;
}

export interface CartItem {
  _id: string;
  id: string;
  product: CartProduct;
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  addedAt: Date;
  price?: number;
  subtotal?: number;
}

export interface CartSummary {
  itemCount: number;
  totalQuantity: number;
  subtotal: number;
  discount: number;
  total: number;
  taxAmount?: number;
  shippingCost?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface CartPayload {
  cartId?: string | null;
  items: any[];
  summary?: any;
}

interface ToggleCartOptions {
  quantity?: number;
  size?: string;
  color?: string;
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
  private totalItemCount = new BehaviorSubject<number>(0);

  private cartProductIds = new Set<string>();
  private isLoadingCart = false;

  public cartItems$ = this.cartItems.asObservable();
  public cartSummary$ = this.cartSummary.asObservable();
  public cartItemCount$ = this.cartItemCount.asObservable();
  public cartTotalAmount$ = this.cartTotalAmount.asObservable();
  public totalItemCount$ = this.totalItemCount.asObservable();
  public showCartTotalPrice$ = this.showCartTotalPrice.asObservable();

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private toastController: ToastController,
    private productStateService: ProductStateService,
    private authService: AuthService
  ) {
    this.initializeCart();
  }

  private getAuthToken(): string | null {
    return this.authService.getToken();
  }

  private getAuthHeaders(): HttpHeaders | undefined {
    const token = this.getAuthToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
  }

  private initializeCart(): void {
    if (this.getAuthToken()) {
      this.loadCart();
      this.refreshTotalCount();
    } else {
      this.loadCartFromStorage();
    }
  }

  getCart(): Observable<ApiResponse<CartPayload>> {
    const headers = this.getAuthHeaders();
    return this.http.get<ApiResponse<CartPayload>>(`${this.API_URL}/api/cart`, headers ? { headers } : {});
  }

  getCartCount(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.API_URL}/api/cart/count`, headers ? { headers } : {});
  }

  getTotalCount(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.API_URL}/api/cart/total-count`, headers ? { headers } : {});
  }

  debugCart(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.API_URL}/api/cart/debug`, headers ? { headers } : {}).pipe(
      catchError(() => of({ success: false, message: 'Debug endpoint not available' }))
    );
  }

  recalculateCart(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.API_URL}/api/cart/recalculate`, {}, headers ? { headers } : {}).pipe(
      catchError(() => of({ success: false, message: 'Recalculate endpoint not available' }))
    );
  }

  loadCart(): void {
    if (!this.getAuthToken()) {
      this.loadCartFromStorage();
      return;
    }

    this.loadCartFromAPI();
  }

  refreshCartOnLogin(): void {
    this.loadCartFromAPI();
    this.refreshTotalCount();
  }

  clearCartOnLogout(): void {
    this.clearCartData();
  }

  refreshTotalCount(): void {
    if (!this.getAuthToken()) {
      this.resetAllCounts();
      return;
    }

    this.getTotalCount().subscribe({
      next: (response) => {
        if (!response?.success || !response?.data) {
          this.resetAllCounts();
          return;
        }

        const data = response.data;
        this.cartItemCount.next(data?.cart?.quantityTotal || 0);
        this.cartTotalAmount.next(data?.cart?.totalAmount || 0);
        this.showCartTotalPrice.next(!!data?.showCartTotalPrice);
        // ✅ FIX: Show only cart items, NOT cart + wishlist combined
        this.totalItemCount.next(data?.cart?.quantityTotal || 0);
      },
      error: (error) => {
        console.error('Error refreshing total count:', error);
        if (error?.status === 401) {
          this.resetAllCounts();
        }
      }
    });
  }

  refreshCartCount(): void {
    this.refreshTotalCount();
  }

  setUseLocalStorageOnly(_useLocalOnly: boolean): void {
    // Legacy no-op. Cart is API-first and falls back to storage only for guests.
  }

  isProductInCart(productId: string): boolean {
    return this.isInCart(productId);
  }

  getCartItems(): CartItem[] {
    return this.cartItems.getValue();
  }

  getCartItemByProductId(productId: string): CartItem | undefined {
    return this.cartItems.getValue().find(item => item.productId === productId);
  }

  addToCart(productId: string, quantity: number = 1, size?: string, color?: string): Observable<{ success: boolean; message: string; itemExists?: boolean; currentQuantity?: number }> {
    const existingItem = this.getCartItemByProductId(productId);

    if (existingItem) {
      return this.updateCartItem(existingItem._id, existingItem.quantity + quantity).pipe(
        map((response: any) => ({
          success: !!response?.success,
          message: response?.message || 'Cart updated'
        }))
      );
    }

    const currentUser: any = this.authService.currentUserValue;
    const userId = currentUser?.id || currentUser?._id;
    const headers = this.getAuthHeaders();
    const payload = {
      user_id: userId,
      product_id: productId,
      productId,
      quantity,
      size,
      color
    };

    this.cartProductIds.add(productId);
    this.productStateService.setCartState(productId, true);

    return this.http.post<{ success: boolean; message: string }>(
      `${this.API_URL}/api/cart/add`,
      payload,
      headers ? { headers } : {}
    ).pipe(
      tap((response) => {
        if (!response?.success) {
          throw new Error(response?.message || 'Failed to add item to cart');
        }
      }),
      switchMap((response) => this.reloadCartState().pipe(map(() => response))),
      catchError((error) => {
        this.cartProductIds.delete(productId);
        this.productStateService.setCartState(productId, false);
        return throwError(() => error);
      })
    );
  }

  removeProductFromCart(productId: string): Observable<{ success: boolean; message: string }> {
    const existingItem = this.getCartItemByProductId(productId);

    if (existingItem) {
      return this.removeCartItem(existingItem, productId);
    }

    return this.removeCartItem(undefined, productId);
  }

  toggleCart(productId: string, options: ToggleCartOptions = {}): Observable<{ success: boolean; message: string }> {
    if (this.isInCart(productId, options.size, options.color)) {
      return this.removeProductFromCart(productId);
    }

    return this.addToCart(productId, options.quantity || 1, options.size, options.color).pipe(
      map((response) => ({ success: response.success, message: response.message }))
    );
  }

  updateCartItemQuantity(productId: string, newQuantity: number): Observable<any> {
    const item = this.getCartItemByProductId(productId);
    if (!item) {
      return throwError(() => new Error('Cart item not found'));
    }

    return this.updateCartItem(item._id, newQuantity);
  }

  async addToCartLegacy(product: any, quantity: number = 1, size?: string, color?: string): Promise<boolean> {
    const productId = product?._id || product?.id;
    if (!productId) {
      return false;
    }

    try {
      await this.addToCart(productId, quantity, size, color).toPromise();
      await this.showToast('Item added to cart', 'success');
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      await this.showToast('Failed to add item to cart', 'danger');
      return false;
    }
  }

  removeFromCart(itemId: string): Observable<{ success: boolean; message: string }> {
    const item = this.cartItems.getValue().find(cartItem => cartItem._id === itemId || cartItem.id === itemId);
    if (!item) {
      return of({ success: true, message: 'Item already removed from cart' });
    }

    return this.removeCartItem(item, item.productId);
  }

  bulkRemoveFromCart(itemIds: string[]): Observable<{ success: boolean; message: string; removedCount: number }> {
    const headers = this.getAuthHeaders();
    const previousItems = this.cartItems.getValue();
    const previousSummary = this.cartSummary.getValue();
    const idSet = new Set(itemIds);
    const nextItems = previousItems.filter(item => !idSet.has(item._id) && !idSet.has(item.id));

    this.applyLocalCartState(nextItems, this.buildSummaryFromItems(nextItems, previousSummary));
    this.syncProductState(nextItems);

    return this.http.delete<{ success: boolean; message: string; removedCount: number }>(
      `${this.API_URL}/api/cart/bulk-remove`,
      {
        body: { itemIds, item_ids: itemIds },
        ...(headers ? { headers } : {})
      }
    ).pipe(
      switchMap((response) => this.reloadCartState().pipe(map(() => ({
        ...response,
        removedCount: response?.removedCount ?? itemIds.length
      })))),
      catchError((error) => {
        this.applyLocalCartState(previousItems, previousSummary);
        this.syncProductState(previousItems);
        return throwError(() => error);
      })
    );
  }

  async removeFromCartLegacy(itemId: string): Promise<void> {
    try {
      await this.removeFromCart(itemId).toPromise();
      await this.showToast('Item removed from cart', 'success');
    } catch (error) {
      console.error('Error removing from cart:', error);
      await this.showToast('Failed to remove item from cart', 'danger');
    }
  }

  updateCartItem(itemId: string, quantity: number): Observable<{ success: boolean; message: string }> {
    const headers = this.getAuthHeaders();
    const currentItems = this.cartItems.getValue();
    const previousSummary = this.cartSummary.getValue();
    const existingItem = currentItems.find(item => item._id === itemId || item.id === itemId);

    if (!existingItem) {
      return throwError(() => new Error('Cart item not found'));
    }

    const nextItems = quantity <= 0
      ? currentItems.filter(item => item._id !== itemId && item.id !== itemId)
      : currentItems.map(item => item._id === itemId || item.id === itemId ? { ...item, quantity } : item);

    this.applyLocalCartState(nextItems, this.buildSummaryFromItems(nextItems, previousSummary));
    this.syncProductState(nextItems);

    return this.http.put<{ success: boolean; message: string }>(
      `${this.API_URL}/api/cart/update/${itemId}`,
      { quantity },
      headers ? { headers } : {}
    ).pipe(
      switchMap((response) => this.reloadCartState().pipe(map(() => response))),
      catchError((error) => {
        this.applyLocalCartState(currentItems, previousSummary);
        this.syncProductState(currentItems);
        return throwError(() => error);
      })
    );
  }

  async updateQuantity(itemId: string, quantity: number): Promise<void> {
    try {
      await this.updateCartItem(itemId, quantity).toPromise();
    } catch (error) {
      console.error('Error updating quantity:', error);
      await this.showToast('Failed to update quantity', 'danger');
    }
  }

  clearCartAPI(): Observable<{ success: boolean; message: string }> {
    const headers = this.getAuthHeaders();
    return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/api/cart/clear`, headers ? { headers } : {});
  }

  async clearCart(): Promise<void> {
    try {
      await this.clearCartAPI().toPromise();
      this.clearCartData();
      await this.showToast('Cart cleared', 'success');
    } catch (error) {
      console.error('Error clearing cart:', error);
      await this.showToast('Failed to clear cart', 'danger');
    }
  }

  getCartTotal(): number {
    return this.cartSummary.getValue()?.total || 0;
  }

  getTotalItemCount(): number {
    return this.totalItemCount.getValue();
  }

  getCartItemCount(): number {
    return this.cartItemCount.getValue();
  }

  getCartTotalAmount(): number {
    return this.cartTotalAmount.getValue();
  }

  shouldShowCartTotalPrice(): boolean {
    return this.showCartTotalPrice.getValue();
  }

  isInCart(productId: string, size?: string, color?: string): boolean {
    if (!this.cartProductIds.has(productId)) {
      return false;
    }

    if (!size && !color) {
      return true;
    }

    return this.cartItems.getValue().some(item =>
      item.productId === productId &&
      (item.size || 'default') === (size || 'default') &&
      (item.color || 'default') === (color || 'default')
    );
  }

  getCartItem(productId: string, size?: string, color?: string): CartItem | undefined {
    return this.cartItems.getValue().find(item =>
      item.productId === productId &&
      (item.size || 'default') === (size || 'default') &&
      (item.color || 'default') === (color || 'default')
    );
  }

  async loadCartCountOnLogin(): Promise<void> {
    try {
      this.refreshTotalCount();
      this.loadCart();
    } catch (error) {
      console.error('Error loading cart count:', error);
      this.resetAllCounts();
    }
  }

  clearCartData(): void {
    this.cartProductIds.clear();
    this.cartItems.next([]);
    this.cartSummary.next(null);
    this.productStateService.clear();
    this.resetAllCounts();
  }

  private loadCartFromAPI(): void {
    if (this.isLoadingCart) {
      return;
    }

    this.isLoadingCart = true;
    this.getCart().pipe(finalize(() => {
      this.isLoadingCart = false;
    })).subscribe({
      next: (response) => {
        const normalizedItems = this.normalizeCartItems(response?.data?.items || []);
        const normalizedSummary = this.normalizeSummary(response?.data?.summary, normalizedItems);
        this.applyLocalCartState(normalizedItems, normalizedSummary);
        this.syncProductState(normalizedItems);
      },
      error: (error) => {
        console.error('API cart error:', error);
        if (error?.status === 401) {
          this.clearCartData();
          return;
        }

        this.loadCartFromStorage();
      }
    });
  }

  private async loadCartFromStorage(): Promise<void> {
    try {
      const cart = await this.storageService?.getCart?.();
      const normalizedItems = this.normalizeCartItems(cart || []);
      this.applyLocalCartState(normalizedItems, this.buildSummaryFromItems(normalizedItems));
      this.syncProductState(normalizedItems);
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      this.applyLocalCartState([], null);
    }
  }

  private async saveCartToStorage(): Promise<void> {
    try {
      if (!this.storageService?.setCart) {
        return;
      }

      await this.storageService.setCart(this.cartItems.getValue());
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }

  private reloadCartState(): Observable<void> {
    return this.getCart().pipe(
      tap((response) => {
        const normalizedItems = this.normalizeCartItems(response?.data?.items || []);
        const normalizedSummary = this.normalizeSummary(response?.data?.summary, normalizedItems);
        this.applyLocalCartState(normalizedItems, normalizedSummary);
        this.syncProductState(normalizedItems);
        this.refreshTotalCount();
        this.saveCartToStorage();
      }),
      map(() => void 0)
    );
  }

  private applyLocalCartState(items: CartItem[], summary: CartSummary | null): void {
    this.cartItems.next(items);
    this.cartSummary.next(summary);
    this.cartProductIds = new Set(items.map(item => item.productId));

    const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);
    const totalAmount = summary?.total ?? items.reduce((total, item) => {
      const unitPrice = item.price ?? item.product.price ?? 0;
      return total + (unitPrice * item.quantity);
    }, 0);

    this.cartItemCount.next(totalQuantity);
    this.cartTotalAmount.next(totalAmount);
  }

  private syncProductState(items: CartItem[]): void {
    const productIds = items.map(item => item.productId);
    this.productStateService.initializeStates(productIds, this.productStateService.getProductsInWishlist());
    productIds.forEach(productId => this.productStateService.setCartState(productId, true));

    const currentSet = new Set(productIds);
    this.productStateService.getProductsInCart()
      .filter(productId => !currentSet.has(productId))
      .forEach(productId => this.productStateService.setCartState(productId, false));
  }

  private normalizeCartItems(items: any[]): CartItem[] {
    return (items || []).map((item) => {
      const rawProduct = item?.product || {};
      const productId = rawProduct._id || rawProduct.id || item.productId || item.product_id;
      const itemId = item._id || item.id;
      const rawImages = Array.isArray(rawProduct.images) ? rawProduct.images : [];

      const normalizedImages: CartProductImage[] = rawImages.map((image: any, index: number) => {
        if (typeof image === 'string') {
          return { url: image, isPrimary: index === 0 };
        }

        return {
          url: image?.url || '',
          isPrimary: !!image?.isPrimary || !!image?.is_primary || index === 0
        };
      }).filter((image: CartProductImage) => !!image.url);

      return {
        _id: itemId,
        id: itemId,
        productId,
        product: {
          _id: productId,
          id: productId,
          name: rawProduct.name || item.name || '',
          price: Number(rawProduct.price ?? item.price ?? 0),
          originalPrice: rawProduct.originalPrice,
          images: normalizedImages,
          brand: rawProduct.brand || '',
          discount: rawProduct.discount
        },
        quantity: Number(item.quantity || 0),
        size: item.size || item.selectedSize || item.selected_size,
        color: item.color || item.selectedColor || item.selected_color,
        addedAt: new Date(item.addedAt || item.added_at || Date.now()),
        price: Number(item.price ?? rawProduct.price ?? 0),
        subtotal: Number(item.subtotal || ((item.price ?? rawProduct.price ?? 0) * (item.quantity || 0)))
      };
    }).filter((item) => !!item.productId);
  }

  private normalizeSummary(summary: any, items: CartItem[]): CartSummary {
    if (!summary) {
      return this.buildSummaryFromItems(items);
    }

    const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);
    return {
      itemCount: Number(summary.itemCount ?? summary.itemsCount ?? items.length),
      totalQuantity: Number(summary.totalQuantity ?? totalQuantity),
      subtotal: Number(summary.subtotal ?? 0),
      discount: Number(summary.discount ?? 0),
      total: Number(summary.total ?? summary.totalAmount ?? 0),
      taxAmount: Number(summary.taxAmount ?? summary.tax ?? 0),
      shippingCost: Number(summary.shippingCost ?? summary.shipping ?? 0)
    };
  }

  private buildSummaryFromItems(items: CartItem[], fallback?: CartSummary | null): CartSummary {
    const subtotal = items.reduce((total, item) => total + ((item.price ?? item.product.price ?? 0) * item.quantity), 0);
    const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);

    return {
      itemCount: items.length,
      totalQuantity,
      subtotal,
      discount: fallback?.discount || 0,
      total: subtotal,
      taxAmount: fallback?.taxAmount || 0,
      shippingCost: fallback?.shippingCost || 0
    };
  }

  private removeCartItem(item?: CartItem, productId?: string): Observable<{ success: boolean; message: string }> {
    const currentUser: any = this.authService.currentUserValue;
    const userId = currentUser?.id || currentUser?._id;
    const headers = this.getAuthHeaders();
    const previousItems = this.cartItems.getValue();
    const previousSummary = this.cartSummary.getValue();
    const resolvedItemId = item?._id || item?.id;
    const resolvedProductId = productId || item?.productId;

    const nextItems = resolvedItemId
      ? previousItems.filter(cartItem => cartItem._id !== resolvedItemId && cartItem.id !== resolvedItemId)
      : previousItems.filter(cartItem => cartItem.productId !== resolvedProductId);

    this.applyLocalCartState(nextItems, this.buildSummaryFromItems(nextItems, previousSummary));

    if (resolvedProductId) {
      const stillExists = nextItems.some(cartItem => cartItem.productId === resolvedProductId);
      if (!stillExists) {
        this.cartProductIds.delete(resolvedProductId);
        this.productStateService.setCartState(resolvedProductId, false);
      }
    }

    const request$ = resolvedItemId
      ? this.http.delete<{ success: boolean; message: string }>(
          `${this.API_URL}/api/cart/remove/${encodeURIComponent(resolvedItemId)}`,
          headers ? { headers } : {}
        )
      : this.http.delete<{ success: boolean; message: string }>(
          `${this.API_URL}/api/cart/remove`,
          {
            body: {
              user_id: userId,
              product_id: resolvedProductId,
              productId: resolvedProductId
            },
            ...(headers ? { headers } : {})
          }
        );

    return request$.pipe(
      switchMap((response) => this.reloadCartState().pipe(map(() => response))),
      catchError((error) => {
        this.applyLocalCartState(previousItems, previousSummary);
        this.syncProductState(previousItems);
        return throwError(() => error);
      })
    );
  }

  private resetAllCounts(): void {
    this.cartItemCount.next(0);
    this.cartTotalAmount.next(0);
    this.showCartTotalPrice.next(false);
    this.totalItemCount.next(0);
  }

  private showToast(message: string, color: string) {
    if (!this.toastController?.create) {
      return Promise.resolve();
    }

    return this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    }).then((toast) => toast.present());
  }
}
