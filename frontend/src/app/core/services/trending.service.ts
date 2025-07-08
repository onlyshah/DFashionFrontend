import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product } from '../models/product.interface';
import { FeaturedBrand } from '../models/featured-brand.interface';
import { Influencer } from '../models/influencer.interface';

export { FeaturedBrand } from '../models/featured-brand.interface';

@Injectable({
  providedIn: 'root'
})
export class TrendingService {
  private apiUrl = environment.apiUrl;

  // BehaviorSubjects for caching data
  private trendingProductsSubject = new BehaviorSubject<Product[]>([]);
  private suggestedProductsSubject = new BehaviorSubject<Product[]>([]);
  private newArrivalsSubject = new BehaviorSubject<Product[]>([]);
  private featuredBrandsSubject = new BehaviorSubject<FeaturedBrand[]>([]);
  private influencersSubject = new BehaviorSubject<Influencer[]>([]);

  // Public observables
  public trendingProducts$ = this.trendingProductsSubject.asObservable();
  public suggestedProducts$ = this.suggestedProductsSubject.asObservable();
  public newArrivals$ = this.newArrivalsSubject.asObservable();
  public featuredBrands$ = this.featuredBrandsSubject.asObservable();
  public influencers$ = this.influencersSubject.asObservable();

  constructor(private http: HttpClient) {}

  // API methods
  getTrendingProducts(page: number = 1, limit: number = 12): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/v1/products/trending?page=${page}&limit=${limit}`);
  }

  getSuggestedProducts(page: number = 1, limit: number = 12): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/v1/products/suggested?page=${page}&limit=${limit}`);
  }

  getNewArrivals(page: number = 1, limit: number = 12): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/v1/products/new-arrivals?page=${page}&limit=${limit}`);
  }

  getFeaturedBrands(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/v1/products/featured-brands`);
  }

  getInfluencers(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/v1/users/influencers?page=${page}&limit=${limit}`);
  }

  // Load and cache trending products
  async loadTrendingProducts(page: number = 1, limit: number = 12): Promise<void> {
    console.log('🔵 TrendingService.loadTrendingProducts called');
    try {
      const response = await this.getTrendingProducts(page, limit).toPromise();
      if (response?.success && response?.products) {
        this.trendingProductsSubject.next(response.products);
      }
    } catch (error) {
      console.error('Error loading trending products:', error);
      this.trendingProductsSubject.next([]);
    }
  }

  // Load and cache suggested products
  async loadSuggestedProducts(page: number = 1, limit: number = 12): Promise<void> {
    try {
      const response = await this.getSuggestedProducts(page, limit).toPromise();
      if (response?.success && response?.products) {
        this.suggestedProductsSubject.next(response.products);
      }
    } catch (error) {
      console.error('Error loading suggested products:', error);
      this.suggestedProductsSubject.next([]);
    }
  }

  // Load and cache new arrivals
  async loadNewArrivals(page: number = 1, limit: number = 12): Promise<void> {
    try {
      const response = await this.getNewArrivals(page, limit).toPromise();
      if (response?.success && response?.products) {
        this.newArrivalsSubject.next(response.products);
      }
    } catch (error) {
      console.error('Error loading new arrivals:', error);
      this.newArrivalsSubject.next([]);
    }
  }

  // Load and cache featured brands
  async loadFeaturedBrands(): Promise<void> {
    try {
      const response = await this.getFeaturedBrands().toPromise();
      if (response?.success && response?.brands) {
        this.featuredBrandsSubject.next(response.brands);
      }
    } catch (error) {
      console.error('Error loading featured brands:', error);
      this.featuredBrandsSubject.next([]);
    }
  }

  // Load and cache top influencers
  async loadTopInfluencers(): Promise<void> {
    try {
      const response = await this.getInfluencers().toPromise();
      if (response?.success && response?.data) {
        this.influencersSubject.next(response.data);
      }
    } catch (error) {
      console.error('Error loading influencers:', error);
      this.influencersSubject.next([]);
    }
  }

  // Clear all cached data
  clearCache(): void {
    this.trendingProductsSubject.next([]);
    this.suggestedProductsSubject.next([]);
    this.newArrivalsSubject.next([]);
    this.featuredBrandsSubject.next([]);
    this.influencersSubject.next([]);
  }

  // Get current cached data
  getCurrentTrendingProducts(): Product[] {
    return this.trendingProductsSubject.value;
  }

  getCurrentSuggestedProducts(): Product[] {
    return this.suggestedProductsSubject.value;
  }

  getCurrentNewArrivals(): Product[] {
    return this.newArrivalsSubject.value;
  }

  getCurrentFeaturedBrands(): FeaturedBrand[] {
    return this.featuredBrandsSubject.value;
  }

  getCurrentInfluencers(): Influencer[] {
    return this.influencersSubject.value;
  }
}
