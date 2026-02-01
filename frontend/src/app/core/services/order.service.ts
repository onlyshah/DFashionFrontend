import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrdersResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly API_URL = environment.apiUrl + '/api';

  constructor(private http: HttpClient) {}

  getUserOrders(page: number = 1, limit: number = 20): Observable<OrdersResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    console.log('[OrderService] Fetching user orders from API:', `${this.API_URL}/orders/user`);
    return this.http.get<OrdersResponse>(`${this.API_URL}/orders/user`, { params })
      .pipe(
        tap(response => console.log('[OrderService] User orders response:', response))
      );
  }

  getOrderById(orderId: string): Observable<Order> {
    console.log('[OrderService] Fetching order details for ID:', orderId);
    return this.http.get<Order>(`${this.API_URL}/orders/${orderId}`)
      .pipe(
        tap(order => console.log('[OrderService] Order details response:', order))
      );
  }

  createOrder(orderData: Partial<Order>): Observable<Order> {
    console.log('[OrderService] Creating new order:', orderData);
    return this.http.post<Order>(`${this.API_URL}/orders`, orderData)
      .pipe(
        tap(order => console.log('[OrderService] Order created:', order))
      );
  }

  updateOrderStatus(orderId: string, status: string): Observable<Order> {
    console.log('[OrderService] Updating order status:', orderId, status);
    return this.http.patch<Order>(`${this.API_URL}/orders/${orderId}/status`, { status })
      .pipe(
        tap(order => console.log('[OrderService] Order status updated:', order))
      );
  }

  cancelOrder(orderId: string, reason?: string): Observable<Order> {
    console.log('[OrderService] Cancelling order:', orderId);
    return this.http.patch<Order>(`${this.API_URL}/orders/${orderId}/cancel`, { reason })
      .pipe(
        tap(order => console.log('[OrderService] Order cancelled:', order))
      );
  }

  getOrderTracking(orderId: string): Observable<any> {
    console.log('[OrderService] Fetching order tracking for ID:', orderId);
    return this.http.get(`${this.API_URL}/orders/${orderId}/tracking`)
      .pipe(
        tap(tracking => console.log('[OrderService] Order tracking response:', tracking))
      );
  }
}