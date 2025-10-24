import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../services/admin-data.service';
import { SalesChartComponent } from '../charts/sales-chart.component';
import { TransactionsChartComponent } from '../charts/transactions-chart.component';
import { IncomeChartComponent } from '../charts/income-chart.component';
import { StatCardComponent } from '../stat-card/stat-card.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SalesChartComponent,
    TransactionsChartComponent,
    IncomeChartComponent,
    StatCardComponent
  ],
  template: `
    <div class="analytics-container">
      <!-- Time Period Selector -->
      <div class="period-selector">
        <select [(ngModel)]="selectedPeriod" (ngModelChange)="loadAnalytics()">
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <!-- Stats Overview -->
      <div class="stats-grid">
        <app-stat-card
          title="Total Sales"
          [value]="analytics?.totalSales || 0"
          [change]="analytics?.salesGrowth || 0"
          icon="shopping-cart"
          colorClass="primary">
        </app-stat-card>

        <app-stat-card
          title="Total Revenue"
          [value]="analytics?.totalRevenue || 0"
          [change]="analytics?.revenueGrowth || 0"
          icon="credit-card"
          colorClass="success">
        </app-stat-card>

        <app-stat-card
          title="Total Orders"
          [value]="analytics?.totalOrders || 0"
          [change]="analytics?.ordersGrowth || 0"
          icon="shopping-bag"
          colorClass="info">
        </app-stat-card>

        <app-stat-card
          title="Average Order Value"
          [value]="analytics?.averageOrderValue || 0"
          [change]="analytics?.aovGrowth || 0"
          icon="chart-bar"
          colorClass="warning">
        </app-stat-card>
      </div>

      <!-- Charts Grid -->
      <div class="charts-grid">
        <div class="chart-card sales-chart">
          <h3>Sales Overview</h3>
          <app-sales-chart [data]="salesChartData"></app-sales-chart>
        </div>

        <div class="chart-card transactions-chart">
          <h3>Transactions History</h3>
          <app-transactions-chart [data]="transactionsChartData"></app-transactions-chart>
        </div>

        <div class="chart-card income-chart">
          <h3>Income Analysis</h3>
          <app-income-chart [data]="incomeChartData"></app-income-chart>
        </div>
      </div>

      <!-- Performance Metrics -->
      <div class="metrics-grid">
        <div class="metric-card">
          <h4>Top Products</h4>
          <div class="metric-list">
            <div class="metric-item" *ngFor="let product of analytics?.topProducts">
              <span class="product-name">{{ product.name }}</span>
              <span class="product-sales">{{ product.sales }}</span>
              <span class="product-growth" [class.positive]="product.growth > 0" [class.negative]="product.growth < 0">
                {{ product.growth }}%
              </span>
            </div>
          </div>
        </div>

        <div class="metric-card">
          <h4>Sales by Category</h4>
          <div class="metric-list">
            <div class="metric-item" *ngFor="let category of analytics?.salesByCategory">
              <span class="category-name">{{ category.name }}</span>
              <span class="category-sales">{{ category.sales | currency }}</span>
              <span class="category-percentage">{{ category.percentage }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analytics-container {
      padding: 1.5rem;
    }

    .period-selector {
      margin-bottom: 1.5rem;
    }

    .period-selector select {
      padding: 0.5rem 1rem;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      background: white;
      font-size: 0.875rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .chart-card {
      background: white;
      padding: 1.5rem;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-sm);
    }

    .chart-card h3 {
      margin: 0 0 1rem;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .metric-card {
      background: white;
      padding: 1.5rem;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-sm);
    }

    .metric-card h4 {
      margin: 0 0 1rem;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .metric-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .metric-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.875rem;
    }

    .product-name, .category-name {
      flex: 1;
      font-weight: 500;
    }

    .product-sales, .category-sales {
      margin: 0 1rem;
      color: var(--text-muted);
    }

    .product-growth {
      font-weight: 500;
    }

    .product-growth.positive {
      color: var(--success-color);
    }

    .product-growth.negative {
      color: var(--danger-color);
    }

    .category-percentage {
      font-weight: 500;
      color: var(--primary-color);
    }

    @media (max-width: 768px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AnalyticsComponent implements OnInit {
  selectedPeriod = 'month';
  analytics: any = null;
  salesChartData: any = null;
  transactionsChartData: any = null;
  incomeChartData: any = null;

  constructor(private adminService: AdminDataService) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.adminService.getAnalytics(this.selectedPeriod).subscribe({
      next: (data) => {
        this.analytics = data;
        this.updateChartData(data);
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
        // Show error notification
      }
    });
  }

  private updateChartData(data: any): void {
    // Update chart data based on analytics response
    // Each chart component will receive properly formatted data
    this.salesChartData = {
      labels: data.salesChart.labels,
      datasets: data.salesChart.datasets
    };

    this.transactionsChartData = {
      labels: data.transactionsChart.labels,
      datasets: data.transactionsChart.datasets
    };

    this.incomeChartData = {
      labels: data.incomeChart.labels,
      datasets: data.incomeChart.datasets
    };
  }
}