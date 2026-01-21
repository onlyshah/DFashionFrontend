import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminApiService, DashboardMetrics } from '../../services/admin-api.service';
import { AnalyticsService } from '../../services/analytics.service';

interface OverviewMetric {
  title: string;
  value: number | string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
  color: string;
}

interface RecentOrder {
  id: string;
  customer: string;
  amount: number;
  date: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
}

@Component({
  selector: 'app-admin-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class OverviewComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Loading state
  isLoading = true;
  error: string | null = null;

  // Dashboard metrics
  dashboardData: DashboardMetrics | null = null;

  // Metrics for display
  metrics: OverviewMetric[] = [];

  // Recent orders
  recentOrders: RecentOrder[] = [];

  // Summary statistics
  totalRevenue = 0;
  totalOrders = 0;
  totalCustomers = 0;
  totalProducts = 0;
  revenueGrowth = 0;
  orderGrowth = 0;
  customerGrowth = 0;

  constructor(
    private adminApiService: AdminApiService,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.loadOverviewData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadOverviewData(): void {
    this.isLoading = true;
    this.error = null;

    // Fetch general dashboard data with fallback
    this.adminApiService.getGeneralDashboardData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: DashboardMetrics) => {
          this.dashboardData = data;
          console.log('Overview data loaded:', data);
          this.totalRevenue = data.totalRevenue;
          this.totalOrders = data.totalOrders;
          this.totalCustomers = data.totalCustomers;
          this.totalProducts = data.totalProducts;
          this.revenueGrowth = data.revenueGrowth;
          this.orderGrowth = data.orderGrowth;
          this.customerGrowth = data.userGrowth;

          // Build metrics array
          this.buildMetrics();

          // Fetch analytics data for charts
          this.loadAnalyticsData();
        },
        error: (error: any) => {
          console.error('Error loading overview data:', error);
          this.error = 'Failed to load overview data. Please try again.';
          this.isLoading = false;
        }
      });
  }

  private loadAnalyticsData(): void {
    // Fetch order analytics for recent orders
    this.analyticsService.getOrderAnalyticsWithFallback()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success && response.data.recentOrders) {
            this.recentOrders = response.data.recentOrders.slice(0, 5);
          } else {
            this.recentOrders = [];
          }
          this.isLoading = false;
        },
        error: (error: any) => {
          console.warn('Error loading analytics:', error);
          this.recentOrders = [];
          this.isLoading = false;
        }
      });
  }

  private buildMetrics(): void {
    this.metrics = [
      {
        title: 'Total Revenue',
        value: `$${this.formatNumber(this.totalRevenue)}`,
        change: this.revenueGrowth,
        trend: this.revenueGrowth >= 0 ? 'up' : 'down',
        icon: 'trending_up',
        color: 'primary'
      },
      {
        title: 'Total Orders',
        value: this.totalOrders.toString(),
        change: this.orderGrowth,
        trend: this.orderGrowth >= 0 ? 'up' : 'down',
        icon: 'shopping_cart',
        color: 'accent'
      },
      {
        title: 'Total Customers',
        value: this.totalCustomers.toString(),
        change: this.customerGrowth,
        trend: this.customerGrowth >= 0 ? 'up' : 'down',
        icon: 'people',
        color: 'success'
      },
      {
        title: 'Active Products',
        value: this.totalProducts.toString(),
        change: 2.5,
        trend: 'up',
        icon: 'inventory_2',
        color: 'warning'
      }
    ];
  }

  private formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  getStatusBadgeClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'completed': 'badge-success',
      'processing': 'badge-info',
      'pending': 'badge-warning',
      'cancelled': 'badge-danger'
    };
    return statusMap[status] || 'badge-secondary';
  }

  getTrendIcon(trend: 'up' | 'down' | 'neutral'): string {
    return trend === 'up' ? 'trending_up' : trend === 'down' ? 'trending_down' : 'trending_flat';
  }
}
