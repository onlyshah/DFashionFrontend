import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AnalyticsService, DashboardStats } from '../services/analytics.service';

@Component({
    selector: 'app-dashboard',
    styleUrls: ['./dashboard.component.scss'],
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    stats: DashboardStats = {
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        newUsersToday: 0,
        ordersToday: 0,
        revenueToday: 0,
        conversionRate: 0
    };

    recentOrders: any[] = [
        {
            orderNumber: 'ORD-2024-001',
            customerName: 'John Doe',
            amount: 2500,
            status: 'confirmed'
        },
        {
            orderNumber: 'ORD-2024-002',
            customerName: 'Jane Smith',
            amount: 1800,
            status: 'shipped'
        },
        {
            orderNumber: 'ORD-2024-003',
            customerName: 'Mike Johnson',
            amount: 3200,
            status: 'delivered'
        }
    ];

    topProducts: any[] = [
        {
            name: 'Classic White Shirt',
            sales: 45,
            revenue: 112500
        },
        {
            name: 'Denim Jeans',
            sales: 38,
            revenue: 95000
        },
        {
            name: 'Summer Dress',
            sales: 32,
            revenue: 80000
        }
    ];

    constructor(
        private analyticsService: AnalyticsService
    ) { }

    ngOnInit(): void {
        this.loadDashboardData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadDashboardData(): void {
        // Load dashboard statistics
        this.analyticsService.getDashboardStats('30d')
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (stats) => {
                    this.stats = stats;
                },
                error: (error) => {
                    console.error('Error loading dashboard stats:', error);
                    // Initialize with empty stats
                    this.stats = {
                        totalUsers: 0,
                        totalProducts: 0,
                        totalOrders: 0,
                        totalRevenue: 0,
                        newUsersToday: 0,
                        ordersToday: 0,
                        revenueToday: 0,
                        conversionRate: 0
                    };
                }
            });
    }

    getStatusColor(status: string): string {
        const statusColors: { [key: string]: string } = {
            'pending': '#ff9800',
            'confirmed': '#2196f3',
            'shipped': '#9c27b0',
            'delivered': '#4caf50',
            'cancelled': '#f44336'
        };
        return statusColors[status] || '#666666';
    }
}
