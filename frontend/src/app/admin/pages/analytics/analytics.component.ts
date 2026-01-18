import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
    selector: 'app-analytics',
    templateUrl: './analytics.component.html',
    styleUrls: ['./analytics.component.scss'],
    standalone: false
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  selectedPeriod = '30d';
  periods = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '12m', label: 'Last 12 months' }
  ];

  // Analytics data
  totalRevenue = 0;
  revenueGrowth = 0;
  totalOrders = 0;
  orderGrowth = 0;
  totalCustomers = 0;
  customerGrowth = 0;
  conversionRate = 0;
  conversionChange = 0;

  newCustomers = 0;
  newCustomerGrowth = 0;
  returningCustomers = 0;
  returningCustomerGrowth = 0;
  averageOrderValue = 0;
  aovChange = 0;

  isLoading = false;

  topProducts: any[] = [];
  trafficSources: any[] = [];

  constructor(
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.loadAnalyticsData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPeriodChange(): void {
    this.loadAnalyticsData();
  }

  loadAnalyticsData(): void {
    this.isLoading = true;

    // Load dashboard stats
    this.analyticsService.getDashboardStatsWithFallback().subscribe({
      next: (response) => {
        console.log('Dashboard stats loaded:', response);
        if (response.success && response.data) {
          const data = response.data;

          // Update overview stats
          this.totalCustomers = data?.overview?.users?.total || 0;
          this.totalOrders = data?.overview?.orders?.total || 0;
          this.totalRevenue = data?.revenue?.totalRevenue || 0;
          this.averageOrderValue = data?.revenue?.averageOrderValue || 0;

          // Calculate growth rates from backend data
          this.customerGrowth = data?.growthRates?.customerGrowth || 0;
          this.orderGrowth = data?.growthRates?.orderGrowth || 0;
          this.revenueGrowth = data?.growthRates?.revenueGrowth || 0;
          this.conversionRate = data?.growthRates?.conversionRate || 0;

          // Update top products from analytics
          if (data?.analytics?.topPerformingProducts) {
            this.topProducts = data.analytics.topPerformingProducts;
          }
          // Update traffic sources from analytics
          if (data?.analytics?.trafficSources) {
            this.trafficSources = data.analytics.trafficSources;
          }
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.isLoading = false;
      }
    });

    // Load order analytics
    this.analyticsService.getOrderAnalyticsWithFallback().subscribe({
      next: (response) => {
        if (response.success) {
          const data = response.data;

          // Update order-specific metrics
          if (data.revenueStats) {
            this.totalRevenue = data.revenueStats.totalRevenue || 0;
            this.averageOrderValue = data.revenueStats.averageOrderValue || 0;
            this.totalOrders = data.revenueStats.totalOrders || 0;
          }
        }
      },
      error: (error) => {
        console.error('Error loading order analytics:', error);
      }
    });
  }

  exportReport(type: string): void {
    console.log('Exporting report:', type);
    // Implement export functionality
  }
}
