import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CatalogApi {
  constructor(private http: HttpClient) {}

  getCategories(): Observable<any> {
    return this.http.get('/api/categories');
  }

  getProducts(url: string): Observable<any> {
    return this.http.get(url);
  }
}

