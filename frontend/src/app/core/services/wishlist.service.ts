import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ProductStateService } from './product-state.service';
import { AuthService } from './auth.service';

export interface WishlistItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    originalPrice?: number;
    images: Array<{ url: string; alt?: string; isPrimary: boolean }>;
    brand: string;
    discount: number;
    rating: {
      average: number;
      count: number;
    };
    analytics: {
      views: number;
      likes: number;
    };
    isActive?: boolean;
  };
  addedAt: Date;
  addedFrom?: string;
  size?: string;
  color?: string;
}

export interface WishlistResponse {
  success: boolean;
  data: {
    items: WishlistItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private readonly API_URL = environment.apiUrl;
  private wishlistItemsSubject = new BehaviorSubject<WishlistItem[]>([]);
  private wishlistCountSubject = new BehaviorSubject<number>(0);

  // Public observables
  public wishlistItems$ = this.wishlistItemsSubject.asObservable();
  public wishlistCount$ = this.wishlistCountSubject.asObservable();

  constructor(
    private http: HttpClient,
    private productStateService: ProductStateService,
    private authService: AuthService
  ) {
    this.initializeWishlist();
  }

  /**
   * Get authentication token from AuthService (handles all storage scenarios)
   */
  private getAuthToken(): string | null {
    return this.authService.getToken();
  }

  private initializeWishlist(): void {
    const token = this.getAuthToken();
    if (token) {
      // User is authenticated, load from API
      this.loadWishlist();
    } else {
      // Guest user, load from local storage only
      console.log('🔄 Guest user detected, loading wishlist from local storage only...');
      this.loadWishlistFromLocalStorage();
    }
  }

  getWishlist(page: number = 1, limit: number = 12): Observable<WishlistResponse> {
    const token = this.getAuthToken();
    const options = token ? {
      headers: { 'Authorization': `Bearer ${token}` }
    } : {};

    return this.http.get<WishlistResponse>(`${this.API_URL}/api/wishlist?page=${page}&limit=${limit}`, options).pipe(
      tap(response => {
        if (response && response.success && response.data && Array.isArray(response.data.items)) {
          this.wishlistItemsSubject.next(response.data.items);
          this.wishlistCountSubject.next(response.data.pagination?.totalItems || response.data.items.length);
          
          // Update product state service with current wishlist items
          response.data.items.forEach(item => {
            const productId = item.product?._id;
            if (productId) {
              this.productStateService.setWishlistState(productId, true);
            }
          });
        } else {
          this.wishlistItemsSubject.next([]);
          this.wishlistCountSubject.next(0);
        }
      })
    );
  }

  // Check if product already exists in wishlist
  isProductInWishlist(productId: string): boolean {
    const items = this.wishlistItemsSubject.getValue();
    return items.some((item: any) => item._id === productId || item.product?._id === productId);
  }

  addToWishlist(productId: string): Observable<any> {
    // Check if already in wishlist
    if (this.isProductInWishlist(productId)) {
      return of({
        success: false,
        message: 'This product is already in your wishlist',
        itemExists: true
      });
    }

    const token = this.getAuthToken();
    const options = token ? {
      headers: { 'Authorization': `Bearer ${token}` }
    } : {};

    return this.http.post(`${this.API_URL}/api/wishlist/add`, {
      productId
    }, options).pipe(
      tap(() => {
        // Update product state to reflect it's in wishlist
        this.productStateService.setWishlistState(productId, true);
        this.loadWishlist(); // Refresh wishlist after adding
      })
    );
  }

  removeFromWishlist(productId: string): Observable<any> {
    const token = this.getAuthToken();
    const options = token ? {
      headers: { 'Authorization': `Bearer ${token}` }
    } : {};

    return this.http.delete(`${this.API_URL}/api/wishlist/remove/${productId}`, options).pipe(
      tap(() => {
        // Update product state to reflect it's not in wishlist
        this.productStateService.setWishlistState(productId, false);
        this.loadWishlist(); // Refresh wishlist after removing
      })
    );
  }

  clearWishlist(): Observable<any> {
    const token = this.getAuthToken();
    // If there's no token, just clear local data and return success
    if (!token) {
      this.wishlistItemsSubject.next([]);
      this.wishlistCountSubject.next(0);
      return of({ success: true, message: 'Wishlist cleared locally (no auth)' });
    }

    const headers = { Authorization: `Bearer ${token}` };

    return this.http.delete(`${this.API_URL}/api/wishlist`, { headers }).pipe(
      tap(() => {
        this.wishlistItemsSubject.next([]);
        this.wishlistCountSubject.next(0);
      }),
      catchError((error: any) => {
        // Handle specific statuses quietly
        if (error && error.status === 401) {
          // Token invalid/expired — remove it and clear local data
          localStorage.removeItem('token');
          this.wishlistItemsSubject.next([]);
          this.wishlistCountSubject.next(0);
          return of({ success: true, message: 'Wishlist cleared locally (auth expired)' });
        }

        if (error && error.status === 403) {
          // Forbidden — user likely doesn't have 'end_user' role. Clear local data silently.
          this.wishlistItemsSubject.next([]);
          this.wishlistCountSubject.next(0);
          return of({ success: true, message: 'Wishlist cleared locally (forbidden)' });
        }

        // For other errors, avoid noisy full error logs — keep a concise message and clear local data
        console.warn('clearWishlist: server error, cleared local wishlist for resiliency');
        this.wishlistItemsSubject.next([]);
        this.wishlistCountSubject.next(0);
        return of({ success: true, message: 'Wishlist cleared locally (server error)' });
      })
    );
  }

  moveToCart(productId: string, quantity: number = 1, size?: string, color?: string): Observable<any> {
    const token = this.getAuthToken();
    const options = token ? {
      headers: { 'Authorization': `Bearer ${token}` }
    } : {};

    return this.http.post(`${this.API_URL}/api/wishlist/move-to-cart/${productId}`, {
      quantity,
      size,
      color
    }, options).pipe(
      tap(() => {
        this.loadWishlist(); // Refresh wishlist after moving
      })
    );
  }

  getWishlistCount(): number {
    return this.wishlistCountSubject.value;
  }

  isInWishlist(productId: string): boolean {
    const items = this.wishlistItemsSubject.value;
    return items.some(item => item.product._id === productId);
  }

  toggleWishlist(productId: string): Observable<any> {
    if (this.isInWishlist(productId)) {
      return this.removeFromWishlist(productId);
    } else {
      return this.addToWishlist(productId);
    }
  }

  private loadWishlist(): void {
    const token = this.getAuthToken();
    if (!token) {
      console.log('❌ No authentication token, using local storage fallback');
      this.loadWishlistFromLocalStorage();
      return;
    }

    this.getWishlist().subscribe({
      next: (response) => {
        // Wishlist is already updated in the tap operator
      },
      error: (error) => {
        console.error('Failed to load wishlist:', error);
        if (error.status === 401) {
          console.log('❌ Authentication failed, clearing token');
          localStorage.removeItem('token');
        }
        // Use localStorage as fallback
        this.loadWishlistFromLocalStorage();
      }
    });
  }

  private loadWishlistFromLocalStorage(): void {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        const wishlistData = JSON.parse(savedWishlist);
        this.wishlistItemsSubject.next(wishlistData.items || []);
        this.wishlistCountSubject.next(wishlistData.items?.length || 0);
      }
    } catch (error) {
      console.error('Failed to load wishlist from localStorage:', error);
    }
  }

  // Get current wishlist count
  getCurrentCount(): number {
    return this.wishlistCountSubject.value;
  }

  // Sync with server when online
  syncWithServer(): Observable<any> {
    return this.getWishlist().pipe(
      tap((response: any) => {
        if (response && response.success) {
          const items = response.data?.items || [];
          this.wishlistItemsSubject.next(items);
          this.wishlistCountSubject.next(items.length);
        }
      })
    );
  }
}
