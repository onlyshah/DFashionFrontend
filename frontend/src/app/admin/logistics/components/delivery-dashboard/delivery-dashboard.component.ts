import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogisticsService } from '../../services/logistics.service';
import { DeliveryOrder } from '../../services/logistics.service';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { WebSocketService } from '../../../../core/services/websocket.service';

@Component({
    selector: 'app-delivery-dashboard',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="delivery-dashboard">
            <header class="dashboard-header">
                <h1>Logistics Dashboard</h1>
                <div class="stats-bar">
                    <div class="stat-item">
                        <span class="label">Pending</span>
                        <span class="value">{{(pendingCount$ | async) || 0}}</span>
                    </div>
                    <div class="stat-item">
                        <span class="label">In Transit</span>
                        <span class="value">{{(inTransitCount$ | async) || 0}}</span>
                    </div>
                    <div class="stat-item">
                        <span class="label">Delivered</span>
                        <span class="value">{{(deliveredCount$ | async) || 0}}</span>
                    </div>
                </div>
            </header>

            <div class="orders-grid" *ngIf="orders$ | async as orders">
                <div class="order-card" *ngFor="let order of orders">
                    <div class="order-header">
                        <span class="order-id">Order #{{order.orderId}}</span>
                        <span class="order-status" [class]="order.status">{{order.status}}</span>
                    </div>
                    <div class="order-body">
                        <div class="location-info">
                            <div class="pickup">
                                <strong>Pickup:</strong>
                                <p>{{order.pickupLocation.address}}</p>
                            </div>
                            <div class="delivery">
                                <strong>Delivery:</strong>
                                <p>{{order.dropLocation.address}}</p>
                            </div>
                        </div>
                        <div class="delivery-time">
                            <p>ETA: {{order.estimatedDelivery | date:'short'}}</p>
                        </div>
                    </div>
                    <div class="order-footer">
                        <button class="btn btn-sm" (click)="assignDriver(order)">
                            {{order.assignedTo ? 'Reassign' : 'Assign Driver'}}
                        </button>
                        <button class="btn btn-sm" (click)="viewTracking(order)">Track</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .delivery-dashboard {
            padding: 20px;
        }

        .dashboard-header {
            margin-bottom: 24px;
        }

        .stats-bar {
            display: flex;
            gap: 24px;
            margin-top: 16px;
        }

        .stat-item {
            background: white;
            padding: 16px;
            border-radius: 8px;
            min-width: 150px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .orders-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
        }

        .order-card {
            background: white;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .order-status {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.875rem;
        }

        .order-status.pending { background: #fff3cd; }
        .order-status.picked { background: #cfe2ff; }
        .order-status.in-transit { background: #d1e7dd; }
        .order-status.delivered { background: #198754; color: white; }
        .order-status.failed { background: #dc3545; color: white; }
    `]
})
export class DeliveryDashboardComponent implements OnInit, OnDestroy {
    orders$: Observable<DeliveryOrder[]>;
    pendingCount$!: Observable<number>;
    inTransitCount$!: Observable<number>;
    deliveredCount$!: Observable<number>;
    private destroy$ = new Subject<void>();

    constructor(
        private logisticsService: LogisticsService,
        private webSocketService: WebSocketService
    ) {
        this.orders$ = this.logisticsService.orders$;
        this.initializeCounters();
    }

    private initializeCounters(): void {
        // Initialize status counters from the orders stream
        this.pendingCount$ = this.orders$.pipe(
            map(orders => orders.filter(o => o.status === 'pending').length)
        );
        this.inTransitCount$ = this.orders$.pipe(
            map(orders => orders.filter(o => o.status === 'in-transit').length)
        );
        this.deliveredCount$ = this.orders$.pipe(
            map(orders => orders.filter(o => o.status === 'delivered').length)
        );
    }

    ngOnInit(): void {
        this.logisticsService.loadOrders();
        this.setupWebSocket();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private setupWebSocket(): void {
        this.webSocketService.onOrderUpdate()
            .pipe(takeUntil(this.destroy$))
            .subscribe(message => {
                this.logisticsService.loadOrders();
            });
    }

    assignDriver(order: DeliveryOrder): void {
        // TODO: Open driver assignment dialog
        this.logisticsService.assignOrder(order.id, 'selectedDriverId')
            .subscribe(() => {
                // Notification handled by error interceptor
            });
    }

    viewTracking(order: DeliveryOrder): void {
        // TODO: Open tracking dialog with map view
    }
}