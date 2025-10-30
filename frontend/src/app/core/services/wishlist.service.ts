import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

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
  };
  addedAt: Date;
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

  addToWishlist(productId: string): Observable<any> {
    const token = localStorage.getItem('token');
    const options = token ? {
      headers: { 'Authorization': `Bearer ${token}` }
    } : {};

    return this.http.post(`${this.API_URL}/api/wishlist`, {
      productId
    }, options).pipe(
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
    const token = localStorage.getItem('token');
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
