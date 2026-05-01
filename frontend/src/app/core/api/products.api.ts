import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsApi {
  constructor(private http: HttpClient) {}

  getProduct(productId: string): Observable<any> {
    return this.http.get(`/api/products/${productId}`);
  }
}

