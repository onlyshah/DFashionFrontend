import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShopApi {
  private readonly apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  getOrderTracking(orderId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders/${orderId}/tracking`);
  }

  getOrder(orderId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders/${orderId}`);
  }

  downloadOrderInvoice(orderId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/orders/${orderId}/invoice`, {
      responseType: 'blob'
    });
  }

  getPaymentMethods(): Observable<any> {
    return this.http.get(`${this.apiUrl}/payment-methods`);
  }

  addPaymentMethod(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/payment-methods`, payload);
  }

  deletePaymentMethod(methodId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/payment-methods/${methodId}`);
  }

  setDefaultPaymentMethod(methodId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/payment-methods/${methodId}/default`, {});
  }

  getProduct(productId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/products/${productId}`);
  }

  createReview(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/reviews`, formData);
  }
}
