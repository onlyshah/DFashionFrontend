import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminApiService } from '../../../services/admin-api.service';

export interface StatisticType {
  id: 'sales' | 'stock' | 'users' | 'vendors';
  name: string;
  icon: string;
}

export interface StatisticsData {
  sales?: {
    todaySales: number;
    salesGrowth: number;
    totalRevenue: number;
  };
  stock?: {
    totalProducts: number;
    lowStockProducts: number;
    outOfStock: number;
  };
  users?: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
  };
  vendors?: {
    totalVendors: number;
    activeVendors: number;
    approvedVendors: number;
  };
}

@Component({
  selector: 'app-statistics-toggle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './statistics-toggle.component.html',
  styleUrls: ['./statistics-toggle.component.scss']
})
export class StatisticsToggleComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  statisticTypes: StatisticType[] = [
    { id: 'sales', name: 'Sales', icon: 'typcn-shopping-cart' },
    { id: 'stock', name: 'Stock', icon: 'typcn-tag' },
    { id: 'users', name: 'Users', icon: 'typcn-group' },
    { id: 'vendors', name: 'Vendors', icon: 'typcn-user' }
  ];

  selectedStatistic: StatisticType = this.statisticTypes[0];
  statisticsData: StatisticsData | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(private adminApiService: AdminApiService) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleStatistic(statistic: StatisticType): void {
    this.selectedStatistic = statistic;
    this.loadStatistics();
  }

  private loadStatistics(): void {
    this.isLoading = true;
    this.error = null;

    this.adminApiService.getGeneralDashboardData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.statisticsData = {
            sales: {
              todaySales: data.todaySales || 0,
              salesGrowth: data.salesGrowth || 0,
              totalRevenue: data.totalRevenue || 0
            },
            stock: {
              totalProducts: data.totalProducts || 0,
              lowStockProducts: data.lowStockProducts || 0,
              outOfStock: 0
            },
            users: {
              totalUsers: data.totalUsers || 0,
              activeUsers: 0,
              newUsers: 0
            },
            vendors: {
              totalVendors: 0,
              activeVendors: 0,
              approvedVendors: 0
            }
          };
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading statistics:', error);
          this.error = 'Failed to load statistics';
          this.isLoading = false;
        }
      });
  }

  getSalesData() {
    return this.statisticsData?.sales || { todaySales: 0, salesGrowth: 0, totalRevenue: 0 };
  }

  getStockData() {
    return this.statisticsData?.stock || { totalProducts: 0, lowStockProducts: 0, outOfStock: 0 };
  }

  getUsersData() {
    return this.statisticsData?.users || { totalUsers: 0, activeUsers: 0, newUsers: 0 };
  }

  getVendorsData() {
    return this.statisticsData?.vendors || { totalVendors: 0, activeVendors: 0, approvedVendors: 0 };
  }
}
