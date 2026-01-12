import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount: number;
  category: string;
  subcategory: string;
  brand: string;
  images: ProductImage[];
  sizes: ProductSize[];
  colors: ProductColor[];
  vendor?: any;
  isActive: boolean;
  isFeatured: boolean;
  isApproved?: boolean;
  rating?: {
    average: number;
    count: number;
  };
  analytics?: {
    views: number;
    likes: number;
    shares: number;
    purchases: number;
  };
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductSize {
  size: string;
  stock: number;
}

export interface ProductColor {
  name: string;
  code: string;
  images: string[];
}

export interface ProductFilters {
  search?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  vendor?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdminProductResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalProducts: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminProductService {
  private apiUrl = environment.apiUrl + '/api/admin';
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getProducts(filters: ProductFilters = {}): Observable<AdminProductResponse> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<AdminProductResponse>(`${this.apiUrl}/products`, { params })
      .pipe(
        tap(response => {
          console.log('[AdminProductService] Products fetched:', response.data?.pagination?.totalProducts || 0);
        })
      );
  }

  getProductsWithFallback(filters: ProductFilters = {}): Observable<AdminProductResponse> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<AdminProductResponse>(`${this.apiUrl}/products`, { params }).pipe(
      catchError((err: any) => {
        if (err && err.status === 401) {
          return this.http.get<AdminProductResponse>(`/api/admin/demo/products`, { params });
        }
        return throwError(() => err);
      })
    );
  }

  getProductById(id: string): Observable<{success: boolean; data: Product}> {
    return this.http.get<{success: boolean; data: Product}>(`${this.apiUrl}/products/${id}`);
  }

  updateProductStatus(id: string, isActive: boolean): Observable<{success: boolean; message: string; data: Product}> {
    return this.http.put<{success: boolean; message: string; data: Product}>(`${this.apiUrl}/products/${id}/status`, { isActive });
  }

  updateFeaturedStatus(id: string, isFeatured: boolean): Observable<{success: boolean; message: string; data: Product}> {
    return this.http.put<{success: boolean; message: string; data: Product}>(`${this.apiUrl}/products/${id}/featured`, { isFeatured });
  }

  createProduct(product: Partial<Product>): Observable<{success: boolean; message: string; data: Product}> {
    return this.http.post<{success: boolean; message: string; data: Product}>(`${this.apiUrl}/products`, product);
  }

  updateProduct(id: string, product: Partial<Product>): Observable<{success: boolean; message: string; data: Product}> {
    return this.http.put<{success: boolean; message: string; data: Product}>(`${this.apiUrl}/products/${id}`, product);
  }

  deleteProduct(id: string): Observable<{success: boolean; message: string}> {
    return this.http.delete<{success: boolean; message: string}>(`${this.apiUrl}/products/${id}`);
  }

  approveProduct(id: string): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${id}/approve`, {});
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories`);
  }

  getCategoriesWithFallback(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories`).pipe(
      catchError(() => of([
        { _id: '1', name: 'Men', slug: 'men' },
        { _id: '2', name: 'Women', slug: 'women' },
        { _id: '3', name: 'Children', slug: 'children' },
        { _id: '4', name: 'Accessories', slug: 'accessories' },
        { _id: '5', name: 'Shoes', slug: 'shoes' }
      ]))
    );
  }

  getSubcategories(category: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories/${category}/subcategories`);
  }

  getBrands(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/brands`);
  }

  uploadProductImages(productId: string, files: File[]): Observable<ProductImage[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    return this.http.post<ProductImage[]>(`${this.apiUrl}/${productId}/images`, formData);
  }

  deleteProductImage(productId: string, imageId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${productId}/images/${imageId}`);
  }

  updateInventory(productId: string, inventory: any): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${productId}/inventory`, inventory);
  }

  getProductAnalytics(productId: string, period: string = '30d'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${productId}/analytics?period=${period}`);
  }

  bulkUpdateProducts(productIds: string[], updates: Partial<Product>): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/bulk-update`, { productIds, updates });
  }

  bulkDeleteProducts(productIds: string[]): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/bulk-delete`, { body: { productIds } });
  }

  searchProducts(query: string, filters: ProductFilters = {}): Observable<AdminProductResponse> {
    return this.getProducts({ ...filters, search: query });
  }

  getFeaturedProducts(limit: number = 10): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/featured?limit=${limit}`);
  }

  getProductsByVendor(vendorId: string, filters: ProductFilters = {}): Observable<AdminProductResponse> {
    return this.getProducts({ ...filters, vendor: vendorId });
  }

  updateProductsSubject(products: Product[]): void {
    this.productsSubject.next(products);
  }

  getCurrentProducts(): Product[] {
    return this.productsSubject.value;
  }
}

