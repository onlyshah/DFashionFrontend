import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
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

  // Get all products with filters (Admin API)
  getProducts(filters: ProductFilters = {}): Observable<AdminProductResponse> {
    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    console.log('[AdminProductService] Fetching products with filters:', filters, 'from API:', `${this.apiUrl}/products`);
    return this.http.get<AdminProductResponse>(`${this.apiUrl}/products`, { params })
      .pipe(
        tap(response => {
          console.log('[AdminProductService] API Response (getProducts):', response);
          console.log('[AdminProductService] Total products:', response.data?.pagination?.totalProducts || 0);
        })
      );
  }

  // Get product by ID (Admin API)
  getProductById(id: string): Observable<{success: boolean; data: Product}> {
    console.log('[AdminProductService] Fetching product by ID:', id, 'from API:', `${this.apiUrl}/products/${id}`);
    return this.http.get<{success: boolean; data: Product}>(`${this.apiUrl}/products/${id}`)
      .pipe(
        tap(response => {
          console.log('[AdminProductService] API Response (getProductById):', response);
          console.log('[AdminProductService] Product loaded:', response.data?.name);
        })
      );
  }

  // Update product status (Admin API)
  updateProductStatus(id: string, isActive: boolean): Observable<{success: boolean; message: string; data: Product}> {
    console.log('[AdminProductService] Updating product status:', id, 'isActive:', isActive);
    return this.http.put<{success: boolean; message: string; data: Product}>(`${this.apiUrl}/products/${id}/status`, { isActive })
      .pipe(
        tap(response => {
          console.log('[AdminProductService] API Response (updateProductStatus):', response);
          console.log('[AdminProductService] Product status updated:', response.data?.name, 'isActive:', response.data?.isActive);
        })
      );
  }

  // Toggle featured status (Admin API)
  updateFeaturedStatus(id: string, isFeatured: boolean): Observable<{success: boolean; message: string; data: Product}> {
    console.log('[AdminProductService] Updating featured status:', id, 'isFeatured:', isFeatured);
    return this.http.put<{success: boolean; message: string; data: Product}>(`${this.apiUrl}/products/${id}/featured`, { isFeatured })
      .pipe(
        tap(response => {
          console.log('[AdminProductService] API Response (updateFeaturedStatus):', response);
          console.log('[AdminProductService] Featured status updated:', response.data?.name, 'isFeatured:', response.data?.isFeatured);
        })
      );
  }

  // Create product (Admin API)
  createProduct(product: Partial<Product>): Observable<{success: boolean; message: string; data: Product}> {
    console.log('[AdminProductService] Creating product:', product);
    return this.http.post<{success: boolean; message: string; data: Product}>(`${this.apiUrl}/products`, product)
      .pipe(
        tap(response => {
          console.log('[AdminProductService] API Response (createProduct):', response);
          console.log('[AdminProductService] Product created successfully:', response.data?.name, 'ID:', response.data?._id);
        })
      );
  }

  // Update product (Admin API)
  updateProduct(id: string, product: Partial<Product>): Observable<{success: boolean; message: string; data: Product}> {
    console.log('[AdminProductService] Updating product:', id, 'with data:', product);
    return this.http.put<{success: boolean; message: string; data: Product}>(`${this.apiUrl}/products/${id}`, product)
      .pipe(
        tap(response => {
          console.log('[AdminProductService] API Response (updateProduct):', response);
          console.log('[AdminProductService] Product updated successfully:', response.data?.name);
        })
      );
  }

  // Delete product (Admin API)
  deleteProduct(id: string): Observable<{success: boolean; message: string}> {
    console.log('[AdminProductService] Deleting product:', id);
    return this.http.delete<{success: boolean; message: string}>(`${this.apiUrl}/products/${id}`)
      .pipe(
        tap(response => {
          console.log('[AdminProductService] API Response (deleteProduct):', response);
          console.log('[AdminProductService] Product deleted successfully');
        })
      );
  }

  // Approve product (for vendor products)
  approveProduct(id: string): Observable<Product> {
    console.log('[AdminProductService] Approving product:', id);
    return this.http.patch<Product>(`${this.apiUrl}/${id}/approve`, {})
      .pipe(
        tap(response => {
          console.log('[AdminProductService] API Response (approveProduct):', response);
          console.log('[AdminProductService] Product approved successfully');
        })
      );
  }

  // Get product categories
  getCategories(): Observable<any[]> {
    console.log('[AdminProductService] Fetching product categories');
    return this.http.get<any[]>(`${this.apiUrl}/categories`)
      .pipe(
        tap(response => {
          console.log('[AdminProductService] API Response (getCategories):', response);
          console.log('[AdminProductService] Categories fetched:', (response as any).length || 0);
        })
      );
  }

  // Get subcategories by category
  getSubcategories(category: string): Observable<any[]> {
    console.log('[AdminProductService] Fetching subcategories for:', category);
    return this.http.get<any[]>(`${this.apiUrl}/categories/${category}/subcategories`)
      .pipe(
        tap(response => {
          console.log('[AdminProductService] API Response (getSubcategories):', response);
          console.log('[AdminProductService] Subcategories fetched:', (response as any).length || 0);
        })
      );
  }

  // Get product brands
  getBrands(): Observable<string[]> {
    console.log('[AdminProductService] Fetching brands');
    return this.http.get<string[]>(`${this.apiUrl}/brands`)
      .pipe(
        tap(response => {
          console.log('[AdminProductService] API Response (getBrands):', response);
          console.log('[AdminProductService] Brands fetched:', (response as any).length || 0);
        })
      );
  }

  // Upload product images
  uploadProductImages(productId: string, files: File[]): Observable<ProductImage[]> {
    console.log('[AdminProductService] Uploading product images:', productId, 'files:', files.length);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    
    return this.http.post<ProductImage[]>(`${this.apiUrl}/${productId}/images`, formData)
      .pipe(
        tap(response => {
          console.log('[AdminProductService] API Response (uploadProductImages):', response);
          console.log('[AdminProductService] Images uploaded:', (response as any).length || 0);
        })
      );
  }

  // Delete product image
  deleteProductImage(productId: string, imageId: string): Observable<void> {
    console.log('[AdminProductService] Deleting product image:', productId, 'image:', imageId);
    return this.http.delete<void>(`${this.apiUrl}/${productId}/images/${imageId}`)
      .pipe(
        tap(response => {
          console.log('[AdminProductService] API Response (deleteProductImage):', response);
          console.log('[AdminProductService] Image deleted');
        })
      );
  }

  // Update product inventory
  updateInventory(productId: string, inventory: any): Observable<Product> {
    console.log('[AdminProductService] Updating product inventory:', productId, 'inventory:', inventory);
    return this.http.patch<Product>(`${this.apiUrl}/${productId}/inventory`, inventory)
      .pipe(
        tap(response => {
          console.log('[AdminProductService] API Response (updateInventory):', response);
          console.log('[AdminProductService] Inventory updated');
        })
      );
  }

  // Get product analytics
  getProductAnalytics(productId: string, period: string = '30d'): Observable<any> {
    console.log('[AdminProductService] Fetching product analytics:', productId, 'period:', period);
    return this.http.get<any>(`${this.apiUrl}/${productId}/analytics?period=${period}`)
      .pipe(
        tap(response => {
          console.log('[AdminProductService] API Response (getProductAnalytics):', response);
          console.log('[AdminProductService] Analytics fetched');
        })
      );
  }

  // Bulk operations
  bulkUpdateProducts(productIds: string[], updates: Partial<Product>): Observable<any> {
    console.log('[AdminProductService] Bulk updating products:', productIds.length, 'products');
    return this.http.patch<any>(`${this.apiUrl}/bulk-update`, {
      productIds,
      updates
    })
      .pipe(
        tap(response => {
          console.log('[AdminProductService] API Response (bulkUpdateProducts):', response);
          console.log('[AdminProductService] Bulk update completed');
        })
      );
  }

  bulkDeleteProducts(productIds: string[]): Observable<any> {
    console.log('[AdminProductService] Bulk deleting products:', productIds.length, 'products');
    return this.http.delete<any>(`${this.apiUrl}/bulk-delete`, {
      body: { productIds }
    })
      .pipe(
        tap(response => {
          console.log('[AdminProductService] API Response (bulkDeleteProducts):', response);
          console.log('[AdminProductService] Bulk delete completed');
        })
      );
  }

  // Search products
  searchProducts(query: string, filters: ProductFilters = {}): Observable<AdminProductResponse> {
    console.log('[AdminProductService] Searching products:', query, 'filters:', filters);
    const searchFilters = { ...filters, search: query };
    return this.getProducts(searchFilters);
  }

  // Get featured products
  getFeaturedProducts(limit: number = 10): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/featured?limit=${limit}`);
  }

  // Get products by vendor
  getProductsByVendor(vendorId: string, filters: ProductFilters = {}): Observable<AdminProductResponse> {
    const vendorFilters = { ...filters, vendor: vendorId };
    return this.getProducts(vendorFilters);
  }

  // Update products subject
  updateProductsSubject(products: Product[]): void {
    this.productsSubject.next(products);
  }

  // Get current products
  getCurrentProducts(): Product[] {
    return this.productsSubject.value;
  }
}
