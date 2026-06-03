import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderService as CoreOrderService } from '../../core/services/order.service';
import { environment } from '../../../environments/environment';

export interface Order {
  _id?: string;
  id?: string;
  orderNumber?: string;
  order_number?: string;
  customer?: { _id: string; fullName: string };
  user_id?: string;
  shipping_address?: any;
  items?: any[];
  total?: number;
  totalAmount?: number;
  status?: string;
  orderDate?: string;
  created_at?: string;
  [key: string]: any;
}

/**
 * @deprecated Use CoreOrderService instead
 * Admin-specific OrderService wrapper with additional methods
 */
@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly API_URL = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private coreOrderService: CoreOrderService
  ) {}

  getUserOrders(page: number = 1, limit: number = 20): Observable<any> {
    return this.coreOrderService.getUserOrders(page, limit);
  }

  getOrderById(orderId: string): Observable<any> {
    return this.coreOrderService.getOrderById(orderId);
  }

  createOrder(orderData: Partial<Order>): Observable<Order> {
    return this.coreOrderService.createOrder(orderData);
  }

  updateOrderStatus(orderId: string, status: string): Observable<Order> {
    return this.coreOrderService.updateOrderStatus(orderId, status);
  }

  cancelOrder(orderId: string, reason?: string): Observable<Order> {
    return this.coreOrderService.cancelOrder(orderId, reason);
  }

  getOrderTracking(orderId: string): Observable<any> {
    return this.coreOrderService.getOrderTracking(orderId);
  }

  // Admin-specific methods
  getOrdersWithFallback(filters: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/api/orders/search`, filters);
  }

  deleteOrder(orderId: string): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/api/orders/${orderId}`);
  }

  addTrackingNumber(orderId: string, trackingNumber: string): Observable<any> {
    return this.http.patch<any>(`${this.API_URL}/api/orders/${orderId}/tracking`, { trackingNumber });
  }
}
