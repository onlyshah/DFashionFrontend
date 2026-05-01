import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchApi {
  constructor(private http: HttpClient) {}

  getSuggestedUsers(limit: number = 5): Observable<any> {
    return this.http.get(`/api/users/suggested?limit=${limit}`);
  }

  getTrendingProducts(limit: number = 10): Observable<any> {
    return this.http.get(`/api/products/trending?limit=${limit}`);
  }

  search(query: string): Observable<any> {
    return this.http.get(`/api/search?q=${encodeURIComponent(query)}`);
  }
}

