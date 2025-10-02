import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class UnifiedApiService {
  constructor(private http: HttpClient) {}
  private apiUrl = environment.apiUrl;
  getTrendingProducts(page: number = 1, limit: number = 12): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/content/trending`, { params: this.paginate(page, limit) });
  }

  getFeaturedBrands(page: number = 1, limit: number = 12): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/content/featured-brands`, { params: this.paginate(page, limit) });
  }

  getNewArrivals(page: number = 1, limit: number = 12): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/content/new-arrivals`, { params: this.paginate(page, limit) });
  }

  getSuggestedProducts(page: number = 1, limit: number = 12): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/content/suggested`, { params: this.paginate(page, limit) });
  }

  getTopInfluencers(page: number = 1, limit: number = 12): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/content/influencers`, { params: this.paginate(page, limit) });
  }

  getCategories(page: number = 1, limit: number = 100): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/content/categories`, { params: this.paginate(page, limit) });
  }

  getStyleInspiration(page: number = 1, limit: number = 12): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/content/style-inspiration`, { params: this.paginate(page, limit) });
  }

  private paginate(page: number, limit: number): HttpParams {
    let params = new HttpParams();
    params = params.set('page', page.toString());
    params = params.set('limit', limit.toString());
    return params;
  }
}
