import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrdersApi {
  constructor(private http: HttpClient) {}

  getOrderTracking(orderId: string): Observable<any> {
    return this.http.get(`/api/orders/${orderId}/tracking`);
  }

  listOrders(): Observable<any> {
    return this.http.get('/api/orders');
  }

  getOrder(orderId: string): Observable<any> {
    return this.http.get(`/api/orders/${orderId}`);
  }

  createOrder(orderPayload: any): Observable<any> {
    return this.http.post('/api/orders', orderPayload);
  }

  cancelOrder(orderId: string): Observable<any> {
    return this.http.post(`/api/orders/${orderId}/cancel`, {});
  }
}
