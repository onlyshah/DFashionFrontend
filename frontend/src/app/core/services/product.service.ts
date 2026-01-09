import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Product } from '../models/product.interface';

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  rating?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = environment.apiUrl + '/api'; // Use environment configuration

  constructor(private http: HttpClient) {}

  getProducts(filters: ProductFilters = {}): Observable<ProductsResponse> {
    let params = new HttpParams();
    
    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    console.log('[ProductService] Fetching products with filters:', filters, 'from API:', `${this.API_URL}/products`);
    return this.http.get<ProductsResponse>(`${this.API_URL}/products`, { params })
      .pipe(
        tap(response => {
          console.log('[ProductService] API Response (getProducts):', response);
          console.log('[ProductService] Total products:', response.total);
        })
      );
  }

  getProduct(id: string): Observable<{ product: Product }> {
    console.log('[ProductService] Fetching product by ID:', id);
    return this.http.get<{ product: Product }>(`${this.API_URL}/products/${id}`)
      .pipe(
        tap(response => {
          console.log('[ProductService] API Response (getProduct):', response);
          console.log('[ProductService] Product loaded:', response.product?.name);
        })
      );
  }

  createProduct(productData: any): Observable<{ message: string; product: Product }> {
    console.log('[ProductService] Creating product:', productData);
    return this.http.post<{ message: string; product: Product }>(`${this.API_URL}/products`, productData)
      .pipe(
        tap(response => {
          console.log('[ProductService] API Response (createProduct):', response);
          console.log('[ProductService] Product created:', response.product?.name);
        })
      );
  }

  updateProduct(id: string, productData: any): Observable<{ message: string; product: Product }> {
    console.log('[ProductService] Updating product:', id, 'with data:', productData);
    return this.http.put<{ message: string; product: Product }>(`${this.API_URL}/products/${id}`, productData)
      .pipe(
        tap(response => {
          console.log('[ProductService] API Response (updateProduct):', response);
          console.log('[ProductService] Product updated:', response.product?.name);
        })
      );
  }

  deleteProduct(id: string): Observable<{ message: string }> {
    console.log('[ProductService] Deleting product:', id);
    return this.http.delete<{ message: string }>(`${this.API_URL}/products/${id}`)
      .pipe(
        tap(response => {
          console.log('[ProductService] API Response (deleteProduct):', response);
          console.log('[ProductService] Product deleted');
        })
      );
  }

  addReview(productId: string, reviewData: any): Observable<{ message: string }> {
    console.log('[ProductService] Adding review for product:', productId, 'with data:', reviewData);
    return this.http.post<{ message: string }>(`${this.API_URL}/products/${productId}/review`, reviewData)
      .pipe(
        tap(response => {
          console.log('[ProductService] API Response (addReview):', response);
          console.log('[ProductService] Review added');
        })
      );
  }



  searchProducts(query: string, filters: ProductFilters = {}): Observable<ProductsResponse> {
    console.log('[ProductService] Searching products with query:', query, 'filters:', filters);
    const searchFilters = { ...filters, search: query };
    return this.getProducts(searchFilters);
  }

  // Advanced search with full search engine capabilities
  advancedSearch(query: string, filters: any = {}, options: any = {}): Observable<any> {
    let params = new HttpParams();

    if (query) params = params.set('q', query);

    // Add filters
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          params = params.set(key, value.join(','));
        } else {
          params = params.set(key, value.toString());
        }
      }
    });

    // Add options
    Object.keys(options).forEach(key => {
      const value = options[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<any>(`${this.API_URL}/search`, { params });
  }

  getCategories(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.API_URL}/categories`);
  }

  getBrands(): Observable<{ brands: string[] }> {
    return this.http.get<{ brands: string[] }>(`${this.API_URL}/products/brands`);
  }

  // Featured Brands
  getFeaturedBrands(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.API_URL}/brands/featured`);
  }

  // New Arrivals
  getNewArrivals(): Observable<{ success: boolean; data: Product[] }> {
    return this.http.get<{ success: boolean; data: Product[] }>(`${this.API_URL}/products/new-arrivals`);
  }

  // Get suggested users for sidebar
  getSuggestedUsers(): Observable<any> {
    return this.http.get(`${this.API_URL}/api/users/suggested`);
  }

  // Get top influencers for sidebar
  getTopInfluencers(): Observable<any> {
    return this.http.get(`${this.API_URL}/api/users/influencers`);
  }

  // Get product by ID
  getProductById(id: string): Observable<any> {
    return this.http.get(`${this.API_URL}/products/${id}`);
  }

  // Product interactions
  toggleProductLike(productId: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.API_URL}/products/${productId}/like`, {});
  }

  shareProduct(productId: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.API_URL}/products/${productId}/share`, {});
  }

  // Category products
  getCategoryProducts(categorySlug: string, filters: ProductFilters = {}): Observable<ProductsResponse> {
    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ProductsResponse>(`${this.API_URL}/products/category/${categorySlug}`, { params });
  }
}
