import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, merge } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ProductState {
  productId: string;
  isInCart: boolean;
  isInWishlist: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductStateService {
  // Map to track product states
  private productStatesMap = new Map<string, BehaviorSubject<ProductState>>();
  private stateChangeSubject = new Subject<ProductState>();

  // Observable for state changes
  public stateChange$ = this.stateChangeSubject.asObservable();

  constructor() {}

  /**
   * Get or create a product state observable
   */
  getProductState$(productId: string): Observable<ProductState> {
    if (!this.productStatesMap.has(productId)) {
      this.productStatesMap.set(productId, new BehaviorSubject<ProductState>({
        productId,
        isInCart: false,
        isInWishlist: false
      }));
    }
    return this.productStatesMap.get(productId)!.asObservable();
  }

  /**
   * Get current product state (synchronous)
   */
  getProductStateSync(productId: string): ProductState {
    if (!this.productStatesMap.has(productId)) {
      return { productId, isInCart: false, isInWishlist: false };
    }
    return this.productStatesMap.get(productId)!.getValue();
  }

  /**
   * Set cart state for a product
   */
  setCartState(productId: string, isInCart: boolean): void {
    const currentState = this.getProductStateSync(productId);
    const newState = { ...currentState, isInCart };
    this.updateProductState(newState);
  }

  /**
   * Set wishlist state for a product
   */
  setWishlistState(productId: string, isInWishlist: boolean): void {
    const currentState = this.getProductStateSync(productId);
    const newState = { ...currentState, isInWishlist };
    this.updateProductState(newState);
  }

  /**
   * Update product state
   */
  private updateProductState(state: ProductState): void {
    if (!this.productStatesMap.has(state.productId)) {
      this.productStatesMap.set(state.productId, new BehaviorSubject(state));
    } else {
      this.productStatesMap.get(state.productId)!.next(state);
    }
    this.stateChangeSubject.next(state);
  }

  /**
   * Initialize product states from cart and wishlist items
   */
  initializeStates(cartProductIds: string[], wishlistProductIds: string[]): void {
    const cartSet = new Set(cartProductIds);
    const wishlistSet = new Set(wishlistProductIds);

    // Update existing products
    this.productStatesMap.forEach((subject, productId) => {
      subject.next({
        productId,
        isInCart: cartSet.has(productId),
        isInWishlist: wishlistSet.has(productId)
      });
    });
  }

  /**
   * Clear all product states
   */
  clear(): void {
    this.productStatesMap.clear();
  }

  /**
   * Get all products in cart
   */
  getProductsInCart(): string[] {
    const result: string[] = [];
    this.productStatesMap.forEach((subject, productId) => {
      if (subject.getValue().isInCart) {
        result.push(productId);
      }
    });
    return result;
  }

  /**
   * Get all products in wishlist
   */
  getProductsInWishlist(): string[] {
    const result: string[] = [];
    this.productStatesMap.forEach((subject, productId) => {
      if (subject.getValue().isInWishlist) {
        result.push(productId);
      }
    });
    return result;
  }
}
