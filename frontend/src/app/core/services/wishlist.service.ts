import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, combineLatest } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface WishlistItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    images: Array<{ url: string; alt?: string; isPrimary?: boolean }>;
    price: number;
    originalPrice?: number;
    brand: string;
    category: string;
    isActive: boolean;
    rating?: {
      average: number;
      count: number;
    };
    vendor: {
      _id: string;
      username: string;
      fullName: string;
      vendorInfo: {
        businessName: string;
      };
    };
    analytics?: {
      views: number;
      likes: number;
    };
  };
  size?: string;
  color?: string;
  price: number;
  originalPrice?: number;
  addedFrom: string;
  addedAt: Date;
  updatedAt: Date;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  isAvailable: boolean;
  vendor: string;
  likes?: Array<{
    user: {
      _id: string;
      username: string;
      fullName: string;
      avatar?: string;
    };
    likedAt: Date;
  }>;
}

export interface WishlistSummary {
  totalItems: number;
  totalValue: number;
  totalSavings: number;
  itemCount: number;
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
  private wishlistItemsSubject = new BehaviorSubject<WishlistItem[] | null>(null);
  private wishlistSummarySubject = new BehaviorSubject<WishlistSummary>({
    totalItems: 0,
    totalValue: 0,
    totalSavings: 0,
    itemCount: 0
  });
  private wishlistCountSubject = new BehaviorSubject<number>(0);

  // Public observables
  public wishlistItems$ = this.wishlistItemsSubject.asObservable();
  public wishlistCount$ = this.wishlistCountSubject.asObservable();
  public wishlistSummary$ = this.wishlistSummarySubject.asObservable();

  // Backwards-compatible observable names expected by older components
  public wishlist$ = combineLatest([this.wishlistItems$, this.wishlistSummary$]).pipe(
    map(([items, summary]) => ({ items: items || [], summary }))
  );
  public wishlistItemCount$ = this.wishlistCount$;

  constructor(private http: HttpClient) {
    this.initializeWishlist();
  }

  private initializeWishlist(): void {
    const token = localStorage.getItem('token');
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
    const token = localStorage.getItem('token');
    const options = token ? {
      headers: { 'Authorization': `Bearer ${token}` }
    } : {};

    return this.http.get<WishlistResponse>(`${this.API_URL}/api/wishlist?page=${page}&limit=${limit}`, options).pipe(
      tap(response => {
        if (response && response.success && response.data && Array.isArray(response.data.items)) {
          this.wishlistItemsSubject.next(response.data.items);
          this.wishlistCountSubject.next(response.data.pagination?.totalItems || response.data.items.length);
        } else {
          this.wishlistItemsSubject.next([]);
          this.wishlistCountSubject.next(0);
        }
      })
    );
  }

  addToWishlist(productId: string, size?: string, color?: string, source?: string): Observable<any> {
    const token = localStorage.getItem('token');
    const options = token ? {
      headers: { 'Authorization': `Bearer ${token}` }
    } : {};

    const payload: any = { productId };
    if (typeof size !== 'undefined') payload.size = size;
    if (typeof color !== 'undefined') payload.color = color;
    if (typeof source !== 'undefined') payload.addedFrom = source;

    return this.http.post(`${this.API_URL}/api/wishlist`, payload, options).pipe(
      tap(() => {
        this.loadWishlist(); // Refresh wishlist after adding
      })
    );
  }

  removeFromWishlist(productId: string): Observable<any> {
    const token = localStorage.getItem('token');
    const options = token ? {
      headers: { 'Authorization': `Bearer ${token}` }
    } : {};

    return this.http.delete(`${this.API_URL}/api/wishlist/${productId}`, options).pipe(
      tap(() => {
        this.loadWishlist(); // Refresh wishlist after removing
      })
    );
  }

  clearWishlist(): Observable<any> {
    const token = localStorage.getItem('token');
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
    const token = localStorage.getItem('token');
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
    const items = this.wishlistItemsSubject.value || [];
    return items.some((item: any) => item.product && item.product._id === productId);
  }

  toggleWishlist(productId: string): Observable<any> {
    if (this.isInWishlist(productId)) {
      return this.removeFromWishlist(productId);
    } else {
      return this.addToWishlist(productId);
    }
  }

  // Public loader used by components; returns an Observable so callers can subscribe.
  public loadWishlist(): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ No authentication token, using local storage fallback');
      this.loadWishlistFromLocalStorage();
      return of({ success: false, message: 'No auth token' });
    }

    return this.getWishlist().pipe(
      catchError((error: any) => {
        console.error('Failed to load wishlist:', error);
        if (error && error.status === 401) {
          console.log('❌ Authentication failed, clearing token');
          localStorage.removeItem('token');
        }
        this.loadWishlistFromLocalStorage();
        return of({ success: false, error });
      })
    );
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

  // Backwards-compatible quick-add helpers used by older components
  addFromPost(productId: string, size?: string, color?: string) {
    return this.addToWishlist(productId, size, color, 'post');
  }

  addFromStory(productId: string, size?: string, color?: string) {
    return this.addToWishlist(productId, size, color, 'story');
  }

  addFromProduct(productId: string, size?: string, color?: string) {
    return this.addToWishlist(productId, size, color, 'product');
  }

  addFromCart(productId: string, size?: string, color?: string) {
    return this.addToWishlist(productId, size, color, 'cart');
  }

  // Helpers for login/logout flows used across the app
  refreshWishlistOnLogin() {
    this.loadWishlist().subscribe({ next: () => {}, error: () => {} });
  }

  clearWishlistOnLogout() {
    this.wishlistItemsSubject.next([]);
    this.wishlistCountSubject.next(0);
  }
}

// Backwards-compatible export: preserve the old symbol name for callers that
// expect `WishlistNewService` while using the canonical implementation.
export { WishlistService as WishlistNewService };
