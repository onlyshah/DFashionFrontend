import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VendorApi {
  constructor(private http: HttpClient) {}

  getVendor(vendorId: string): Observable<any> {
    return this.http.get(`/api/vendors/${vendorId}`);
  }

  getVendorProducts(vendorId: string, limit: number = 6): Observable<any> {
    return this.http.get(`/api/vendors/${vendorId}/products?limit=${limit}`);
  }

  getVendorReviews(vendorId: string, limit: number = 5): Observable<any> {
    return this.http.get(`/api/vendors/${vendorId}/reviews?limit=${limit}`);
  }

  vendorAction(vendorId: string, endpoint: string): Observable<any> {
    return this.http.post(`/api/vendors/${vendorId}/${endpoint}`, {});
  }
}

