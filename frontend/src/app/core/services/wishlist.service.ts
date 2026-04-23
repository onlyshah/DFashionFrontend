import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ProductStateService } from './product-state.service';
import { AuthService } from './auth.service';

export interface WishlistProduct {
  _id?: string;
  id: string;
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
}

export interface WishlistItem {
  _id?: string;
  id: string;
  productId: string;
  product: WishlistProduct;
  addedAt: Date;
  addedFrom?: string;
  size?: string;
  color?: string;
}

export interface WishlistResponse {
  success: boolean;
  data: {
    items: WishlistItem[];
    summary: {
      totalItems: number;
      totalValue: number;
      totalSavings: number;
      itemCount: number;
    };
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  message?: string;
}

interface WishlistMutationResponse {
  success: boolean;
  message: string;
  itemExists?: boolean;
  data?: {
    id?: string;
    productId?: string;
    addedAt?: string;
  } | null;
  statusCode?: number;
}

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private readonly API_URL = environment.apiUrl;
  private readonly wishlistItemsSubject = new BehaviorSubject<WishlistItem[]>([]);
  private readonly wishlistCountSubject = new BehaviorSubject<number>(0);
  private wishlistIds = new Set<string>();

  public wishlistItems$ = this.wishlistItemsSubject.asObservable();
  public wishlistCount$ = this.wishlistCountSubject.asObservable();

  constructor(
    private http: HttpClient,
    private productStateService: ProductStateService,
    private authService: AuthService
  ) {
    this.initializeWishlist();
  }

  getWishlist(page: number = 1, limit: number = 100): Observable<WishlistResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<WishlistResponse>(
      `${this.API_URL}/api/wishlist?page=${page}&limit=${limit}`,
      headers ? { headers } : {}
    ).pipe(
      map((response) => ({
        ...response,
        data: {
          ...response?.data,
          items: this.normalizeItems(response?.data?.items || [])
        }
      })),
      tap((response) => {
        this.applyWishlistState(response?.data?.items || []);
      })
    );
  }

  addToWishlist(productId: string): Observable<WishlistMutationResponse> {
    if (!productId) {
      return throwError(() => new Error('Product ID is required'));
    }

    if (!this.getAuthToken()) {
      return throwError(() => ({ status: 401, message: 'Please login to save items' }));
    }

    if (this.isInWishlist(productId)) {
      return of({
        success: true,
        message: 'Already in wishlist',
        data: { productId }
      });
    }

    const previousItems = this.wishlistItemsSubject.getValue();
    this.optimisticallyAdd(productId);

    return this.http.post<WishlistMutationResponse>(
      `${this.API_URL}/api/wishlist/add`,
      {
        user_id: (this.authService.currentUserValue as any)?.id || (this.authService.currentUserValue as any)?._id,
        product_id: productId,
        productId
      },
      this.getRequestOptions()
    ).pipe(
      switchMap((response) => this.reloadWishlistState().pipe(map(() => response))),
      catchError((error) => {
        if (error?.status === 409) {
          return this.reloadWishlistState().pipe(map(() => ({
            success: true,
            message: error?.error?.message || 'Already in wishlist',
            itemExists: true,
            data: error?.error?.data || { productId }
          })));
        }

        this.applyWishlistState(previousItems);
        return throwError(() => error);
      })
    );
  }

  removeFromWishlist(productId: string): Observable<WishlistMutationResponse> {
    if (!productId) {
      return throwError(() => new Error('Product ID is required'));
    }

    if (!this.getAuthToken()) {
      return throwError(() => ({ status: 401, message: 'Please login to save items' }));
    }

    if (!this.isInWishlist(productId)) {
      return of({
        success: true,
        message: 'Removed from wishlist'
      });
    }

    const previousItems = this.wishlistItemsSubject.getValue();
    this.optimisticallyRemove(productId);

    return this.http.delete<WishlistMutationResponse>(
      `${this.API_URL}/api/wishlist/remove`,
      {
        ...this.getRequestOptions(),
        body: {
          user_id: (this.authService.currentUserValue as any)?.id || (this.authService.currentUserValue as any)?._id,
          product_id: productId,
          productId
        }
      }
    ).pipe(
      switchMap((response) => this.reloadWishlistState().pipe(map(() => response))),
      catchError((error) => {
        this.applyWishlistState(previousItems);
        return throwError(() => error);
      })
    );
  }

  toggleWishlist(productId: string): Observable<WishlistMutationResponse> {
    return this.isInWishlist(productId)
      ? this.removeFromWishlist(productId)
      : this.addToWishlist(productId);
  }

  isInWishlist(productId: string): boolean {
    return !!productId && this.wishlistIds.has(productId);
  }

  isProductInWishlist(productId: string): boolean {
    return this.isInWishlist(productId);
  }

  getWishlistCount(): number {
    return this.wishlistCountSubject.getValue();
  }

  getCurrentCount(): number {
    return this.wishlistCountSubject.getValue();
  }

  clearWishlist(): Observable<any> {
    const items = this.wishlistItemsSubject.getValue();
    if (!items.length) {
      return of({ success: true, message: 'Wishlist cleared' });
    }

    return this.getWishlist(1, 1000).pipe(
      map(() => ({ success: true, message: 'Wishlist refreshed' }))
    );
  }

  moveToCart(productId: string, quantity: number = 1, size?: string, color?: string): Observable<any> {
    return this.http.post(
      `${this.API_URL}/api/wishlist/move-to-cart`,
      { productId, product_id: productId, quantity, size, color },
      this.getRequestOptions()
    );
  }

  syncWithServer(): Observable<WishlistResponse> {
    return this.reloadWishlistState().pipe(
      switchMap(() => this.getWishlist(1, 1000))
    );
  }

  private initializeWishlist(): void {
    this.authService.isAuthenticated$.subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this.reloadWishlistState().subscribe({
          error: (error) => {
            if (error?.status === 401) {
              this.resetWishlistState();
            }
          }
        });
      } else {
        this.resetWishlistState();
      }
    });

    if (this.getAuthToken()) {
      this.reloadWishlistState().subscribe({
        error: () => this.resetWishlistState()
      });
    }
  }

  private getAuthToken(): string | null {
    return this.authService.getToken();
  }

  private getAuthHeaders(): HttpHeaders | undefined {
    const token = this.getAuthToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
  }

  private getRequestOptions(): { headers?: HttpHeaders } {
    const headers = this.getAuthHeaders();
    return headers ? { headers } : {};
  }

  private reloadWishlistState(): Observable<void> {
    if (!this.getAuthToken()) {
      this.resetWishlistState();
      return of(void 0);
    }

    return this.getWishlist(1, 1000).pipe(
      map(() => void 0),
      catchError((error) => {
        if (error?.status === 401) {
          this.resetWishlistState();
        }
        return throwError(() => error);
      })
    );
  }

  private normalizeItems(items: any[]): WishlistItem[] {
    return (items || []).map((item) => {
      const product = item?.product || {};
      const productId = item?.productId || item?.product_id || product?.id || product?._id;
      const rawImages = Array.isArray(product.images) ? product.images : [];

      return {
        _id: item?.id || item?._id,
        id: item?.id || item?._id,
        productId,
        product: {
          _id: productId,
          id: productId,
          name: product?.name || '',
          price: Number(product?.price || 0),
          originalPrice: product?.originalPrice != null ? Number(product.originalPrice) : undefined,
          images: rawImages.map((image: any, index: number) => {
            if (typeof image === 'string') {
              return { url: image, isPrimary: index === 0 };
            }

            return {
              url: image?.url || '',
              alt: image?.alt,
              isPrimary: !!image?.isPrimary || index === 0
            };
          }).filter((image: { url: string }) => !!image.url),
          brand: product?.brand || '',
          discount: Number(product?.discount || 0),
          rating: {
            average: Number(product?.rating?.average || 0),
            count: Number(product?.rating?.count || 0)
          },
          analytics: {
            views: Number(product?.analytics?.views || 0),
            likes: Number(product?.analytics?.likes || 0)
          },
          isActive: product?.isActive !== false
        },
        addedAt: new Date(item?.addedAt || item?.added_at || Date.now()),
        addedFrom: item?.addedFrom || item?.added_from || item?.source || '',
        size: item?.size,
        color: item?.color
      };
    }).filter((item) => !!item.id && !!item.productId);
  }

  private applyWishlistState(items: WishlistItem[]): void {
    const normalizedItems = this.normalizeItems(items);
    this.wishlistItemsSubject.next(normalizedItems);
    this.wishlistCountSubject.next(normalizedItems.length);
    this.wishlistIds = new Set(normalizedItems.map((item) => item.productId));
    this.syncProductState();
  }

  private resetWishlistState(): void {
    this.wishlistItemsSubject.next([]);
    this.wishlistCountSubject.next(0);
    this.wishlistIds = new Set<string>();
    this.syncProductState();
  }

  private syncProductState(): void {
    const wishlistIds = Array.from(this.wishlistIds);
    this.productStateService.initializeStates(
      this.productStateService.getProductsInCart(),
      wishlistIds
    );
  }

  private optimisticallyAdd(productId: string): void {
    const currentItems = this.wishlistItemsSubject.getValue();
    const nextItems: WishlistItem[] = [
      {
        id: `optimistic-${productId}`,
        productId,
        product: {
          id: productId,
          name: '',
          price: 0,
          images: [],
          brand: '',
          discount: 0,
          rating: {
            average: 0,
            count: 0
          },
          analytics: {
            views: 0,
            likes: 0
          },
          isActive: true
        },
        addedAt: new Date()
      },
      ...currentItems
    ];

    this.wishlistIds.add(productId);
    this.applyWishlistState(nextItems);
  }

  private optimisticallyRemove(productId: string): void {
    const nextItems = this.wishlistItemsSubject.getValue().filter((item) => item.productId !== productId);
    this.wishlistIds.delete(productId);
    this.applyWishlistState(nextItems);
  }
}
