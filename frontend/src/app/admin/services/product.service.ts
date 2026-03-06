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
    total: number;
    totalPages: number;
    page: number;
    limit: number;
    // Legacy pagination object support
    pagination?: {
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
          console.log('[AdminProductService] Products fetched:', response.data?.total || response.data?.pagination?.totalProducts || 0);
        })
      );
  }

  getProductsWithFallback(filters: ProductFilters = {}): Observable<AdminProductResponse> {
    // Use real API endpoint - no fallback to demo
    return this.getProducts(filters);
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
    return this.http.get<any[]>(`${environment.apiUrl}/api/categories`);
  }

  getCategoriesWithFallback(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories`).pipe(
      catchError(error => {
        console.error('Error loading categories:', error);
        return throwError(() => error);
      })
    );
  }

  getSubcategories(category: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/categories/${category}/subcategories`);
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

  // ============ SubCategory Management ============

  getSubCategoriesList(categoryId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/categories/${categoryId}/subcategories`);
  }

  createSubCategory(categoryId: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/categories/${categoryId}/subcategories`, data);
  }

  updateSubCategory(categoryId: string, subCategoryId: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/categories/${categoryId}/subcategories/${subCategoryId}`, data);
  }

  deleteSubCategory(categoryId: string, subCategoryId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/categories/${categoryId}/subcategories/${subCategoryId}`);
  }

  getWarehouses(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/inventory/warehouses`).pipe(
      catchError(error => {
        console.error('Error loading warehouses:', error);
        return of({ data: [] });
      })
    );
  }

  getRoles(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/roles`).pipe(
      catchError(error => {
        console.error('Error loading roles:', error);
        return of({ data: [] });
      })
    );
  }

  getDepartments(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/departments`).pipe(
      catchError(error => {
        console.error('Error loading departments:', error);
        return of({ data: [] });
      })
    );
  }

  getReturnReasons(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/returns/reasons`).pipe(
      catchError(error => {
        console.error('Error loading return reasons:', error);
        return of({
          data: [
            { value: 'defective', label: 'Defective Product' },
            { value: 'damaged', label: 'Damaged in Transit' },
            { value: 'wrong-item', label: 'Wrong Item Received' },
            { value: 'sizing-issue', label: 'Sizing Issue' },
            { value: 'color-difference', label: 'Color/Print Difference' },
            { value: 'quality-issue', label: 'Quality Issue' },
            { value: 'changed-mind', label: 'Changed Mind' },
            { value: 'other', label: 'Other' }
          ]
        });
      })
    );
  }

  getOrderStatuses(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/orders/statuses`).pipe(
      catchError(error => {
        console.error('Error loading order statuses:', error);
        return of({
          data: [
            { value: 'pending', label: 'Pending' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'processing', label: 'Processing' },
            { value: 'shipped', label: 'Shipped' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'cancelled', label: 'Cancelled' }
          ]
        });
      })
    );
  }

  getReturnStatuses(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/returns/statuses`).pipe(
      catchError(error => {
        console.error('Error loading return statuses:', error);
        return of({
          data: [
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
            { value: 'refunded', label: 'Refunded' }
          ]
        });
      })
    );
  }

  getSupplierCategories(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/inventory/supplier-categories`).pipe(
      catchError(error => {
        console.error('Error loading supplier categories:', error);
        return of({
          data: [
            { value: 'fabric', label: 'Fabric' },
            { value: 'buttons', label: 'Buttons & Accessories' },
            { value: 'thread', label: 'Thread & Trims' },
            { value: 'packaging', label: 'Packaging' },
            { value: 'machinery', label: 'Machinery' },
            { value: 'chemical', label: 'Chemical & Dyes' },
            { value: 'other', label: 'Other' }
          ]
        });
      })
    );
  }

  getWarehouseTypes(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/inventory/warehouse-types`).pipe(
      catchError(error => {
        console.error('Error loading warehouse types:', error);
        return of({
          data: [
            { value: 'primary', label: 'Primary' },
            { value: 'secondary', label: 'Secondary' },
            { value: 'distribution', label: 'Distribution Center' },
            { value: 'fulfillment', label: 'Fulfillment Center' }
          ]
        });
      })
    );
  }
}

