import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface DeliveryOrder {
    id: string;
    orderId: string;
    status: 'pending' | 'picked' | 'in-transit' | 'delivered' | 'failed';
    pickupLocation: {
        address: string;
        coordinates: [number, number];
    };
    dropLocation: {
        address: string;
        coordinates: [number, number];
    };
    assignedTo?: string;
    estimatedDelivery: Date;
    actualDelivery?: Date;
    trackingUpdates: {
        status: string;
        location: string;
        timestamp: Date;
        note?: string;
    }[];
}

@Injectable({
    providedIn: 'root'
})
export class LogisticsService {
    private apiUrl = `${environment.apiUrl}/logistics`;
    private ordersSubject = new BehaviorSubject<DeliveryOrder[]>([]);
    public orders$ = this.ordersSubject.asObservable();

    constructor(private http: HttpClient) {
        this.loadOrders();
    }

    loadOrders(): void {
        this.http.get<DeliveryOrder[]>(`${this.apiUrl}/orders`)
            .subscribe(orders => this.ordersSubject.next(orders));
    }

    getOrder(id: string): Observable<DeliveryOrder> {
        return this.http.get<DeliveryOrder>(`${this.apiUrl}/orders/${id}`);
    }

    assignOrder(orderId: string, driverId: string): Observable<DeliveryOrder> {
        return this.http.patch<DeliveryOrder>(`${this.apiUrl}/orders/${orderId}/assign`, { driverId })
            .pipe(map(order => {
                this.updateOrderInState(order);
                return order;
            }));
    }

    updateOrderStatus(orderId: string, status: DeliveryOrder['status'], note?: string): Observable<DeliveryOrder> {
        return this.http.patch<DeliveryOrder>(`${this.apiUrl}/orders/${orderId}/status`, { status, note })
            .pipe(map(order => {
                this.updateOrderInState(order);
                return order;
            }));
    }

    addTrackingUpdate(orderId: string, update: { status: string; location: string; note?: string }): Observable<DeliveryOrder> {
        return this.http.post<DeliveryOrder>(`${this.apiUrl}/orders/${orderId}/tracking`, update)
            .pipe(map(order => {
                this.updateOrderInState(order);
                return order;
            }));
    }

    private updateOrderInState(order: DeliveryOrder): void {
        const orders = this.ordersSubject.value;
        const index = orders.findIndex(o => o.id === order.id);
        if (index !== -1) {
            orders[index] = order;
            this.ordersSubject.next([...orders]);
        }
    }
}