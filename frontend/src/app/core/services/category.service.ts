import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Subcategory {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: string;
  _id?: string;
}

export interface Category {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parentCategory?: string | null;
  subcategories?: Subcategory[];
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;
  
  // Cache for categories - shared across all subscribers
  private categoriesCache$: Observable<Category[]> | null = null;
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  
  // Cache for single category by ID
  private categoryCache: Map<string, Observable<Category>> = new Map();

  constructor(private http: HttpClient) {}

  /**
   * Get all categories with caching
   * @returns Observable of category array from database
   */
  getAllCategories(): Observable<Category[]> {
    // If cache doesn't exist, create it
    if (!this.categoriesCache$) {
      console.log('[CategoryService] Fetching all categories from API:', this.apiUrl);
      this.categoriesCache$ = this.http.get<any>(`${this.apiUrl}`)
        .pipe(
          map(response => {
            console.log('[CategoryService] API Response (getAllCategories):', response);
            return response.data || [];
          }),
          tap((categories: any[]) => {
            console.log('[CategoryService] Categories loaded and cached:', categories.length, 'categories');
            categories.forEach((cat: any) => {
              console.log(`  - ${cat.name} (${cat._id}): ${cat.subcategories?.length || 0} subcategories`);
            });
            this.categoriesSubject.next(categories);
          }),
          shareReplay(1) // Share and cache the result
        );
    } else {
      console.log('[CategoryService] Returning cached categories');
    }
    return this.categoriesCache$;
  }

  /**
   * Get category by ID
   * @param categoryId - ID of the category
   * @returns Observable of single category
   */
  getCategoryById(categoryId: string): Observable<Category> {
    // Check if already in cache
    if (this.categoryCache.has(categoryId)) {
      console.log('[CategoryService] Returning cached category by ID:', categoryId);
      return this.categoryCache.get(categoryId)!;
    }

    // Fetch from API
    console.log('[CategoryService] Fetching category by ID:', categoryId, 'from API:', `${this.apiUrl}/${categoryId}`);
    const category$ = this.http.get<any>(`${this.apiUrl}/${categoryId}`)
      .pipe(
        map(response => {
          console.log('[CategoryService] API Response (getCategoryById):', response);
          return response.data;
        }),
        tap(category => {
          console.log('[CategoryService] Category by ID cached:', category.name, 'with', category.subcategories?.length || 0, 'subcategories');
        }),
        shareReplay(1)
      );

    // Cache it
    this.categoryCache.set(categoryId, category$);
    return category$;
  }

  /**
   * Get category by slug
   * @param slug - Slug of the category
   * @returns Observable of single category
   */
  getCategoryBySlug(slug: string): Observable<Category> {
    console.log('[CategoryService] Fetching category by slug:', slug, 'from API:', `${this.apiUrl}/${slug}`);
    return this.http.get<any>(`${this.apiUrl}/${slug}`)
      .pipe(
        map(response => {
          console.log('[CategoryService] API Response (getCategoryBySlug):', response);
          return response.data;
        }),
        tap(category => {
          console.log('[CategoryService] Category by slug loaded:', category.name, 'with', category.subcategories?.length || 0, 'subcategories');
        })
      );
  }

  /**
   * Get subcategories for a parent category
   * @param parentCategoryId - ID of parent category
   * @returns Observable of subcategory array
   */
  getSubcategoriesByParent(parentCategoryId: string): Observable<Subcategory[]> {
    console.log('[CategoryService] Fetching subcategories for parent:', parentCategoryId);
    return this.http.get<any>(`${this.apiUrl}/${parentCategoryId}/subcategories`)
      .pipe(
        map(response => {
          console.log('[CategoryService] API Response (getSubcategoriesByParent):', response);
          return response.data || [];
        }),
        tap(subcategories => {
          console.log('[CategoryService] Subcategories loaded:', subcategories.length, 'found');
        })
      );
  }

  /**
   * Get subcategories by parent category name
   * @param parentName - Name of parent category
   * @returns Observable of subcategory array
   */
  getSubcategoriesByParentName(parentName: string): Observable<Subcategory[]> {
    console.log('[CategoryService] Fetching subcategories for parent name:', parentName);
    return this.getAllCategories()
      .pipe(
        map(categories => {
          const parentCategory = categories.find(
            cat => cat.name.toLowerCase() === parentName.toLowerCase()
          );
          const subcats = parentCategory?.subcategories || [];
          console.log('[CategoryService] Subcategories by name found:', subcats.length, 'for parent:', parentName);
          return subcats;
        })
      );
  }

  /**
   * Create a new category (admin only)
   * @param categoryData - Category data to create
   * @returns Observable of created category
   */
  createCategory(categoryData: Partial<Category>): Observable<Category> {
    console.log('[CategoryService] Creating new category:', categoryData);
    return this.http.post<any>(`${this.apiUrl}`, categoryData)
      .pipe(
        tap(response => {
          console.log('[CategoryService] Category created successfully:', response);
          this.invalidateCache();
        }),
        map(response => response.data)
      );
  }

  /**
   * Update a category (admin only)
   * @param categoryId - ID of category to update
   * @param categoryData - Updated category data
   * @returns Observable of updated category
   */
  updateCategory(categoryId: string, categoryData: Partial<Category>): Observable<Category> {
    console.log('[CategoryService] Updating category:', categoryId, 'with data:', categoryData);
    return this.http.put<any>(`${this.apiUrl}/${categoryId}`, categoryData)
      .pipe(
        tap(response => {
          console.log('[CategoryService] Category updated successfully:', response);
          this.invalidateCache();
          this.categoryCache.delete(categoryId); // Remove from individual cache
        }),
        map(response => response.data)
      );
  }

  /**
   * Delete a category (admin only)
   * @param categoryId - ID of category to delete
   * @returns Observable of delete response
   */
  deleteCategory(categoryId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${categoryId}`)
      .pipe(
        tap(() => {
          this.invalidateCache(); // Invalidate cache on delete
          this.categoryCache.delete(categoryId); // Remove from single category cache
        })
      );
  }

  /**
   * Reorder categories
   * @param categoryIds - Array of category IDs in new order
   * @returns Observable of reorder response
   */
  reorderCategories(categoryIds: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/reorder`, { categoryIds })
      .pipe(
        tap(() => this.invalidateCache()) // Invalidate cache on reorder
      );
  }

  /**
   * Get all unique subcategories across all categories
   * @returns Observable of all subcategories
   */
  getAllSubcategories(): Observable<Subcategory[]> {
    return this.getAllCategories()
      .pipe(
        map(categories => {
          const allSubcategories: Subcategory[] = [];
          categories.forEach(category => {
            if (category.subcategories && Array.isArray(category.subcategories)) {
              allSubcategories.push(...category.subcategories);
            }
          });
          return allSubcategories;
        })
      );
  }

  /**
   * Search categories by name
   * @param query - Search query
   * @returns Observable of matching categories
   */
  searchCategories(query: string): Observable<Category[]> {
    return this.getAllCategories()
      .pipe(
        map(categories =>
          categories.filter(cat =>
            cat.name.toLowerCase().includes(query.toLowerCase()) ||
            cat.slug.toLowerCase().includes(query.toLowerCase())
          )
        )
      );
  }

  /**
   * Get featured categories
   * @returns Observable of featured categories
   */
  getFeaturedCategories(): Observable<Category[]> {
    return this.getAllCategories()
      .pipe(
        map(categories => categories.filter(cat => cat.isFeatured === true))
      );
  }

  /**
   * Invalidate the categories cache
   */
  invalidateCache(): void {
    this.categoriesCache$ = null;
    this.categoryCache.clear();
    this.categoriesSubject.next([]);
  }

  /**
   * Get cached categories as BehaviorSubject
   * @returns BehaviorSubject of categories
   */
  getCategoriesSubject(): BehaviorSubject<Category[]> {
    return this.categoriesSubject;
  }
}
