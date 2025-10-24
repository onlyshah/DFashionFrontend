import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  conversionRate: number;
}

interface ChannelMetrics {
  channel: string;
  visitors: number;
  conversions: number;
  revenue: number;
  cpa: number;
}

@Component({
  selector: 'app-marketing-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="analytics-container">
      <header class="page-header">
        <div class="header-content">
          <h1>Marketing Analytics</h1>
          <p class="subtitle">Track your marketing performance and ROI</p>
        </div>
        <div class="header-actions">
          <mat-form-field appearance="outline" class="date-range">
            <mat-label>Date Range</mat-label>
            <mat-date-range-input [rangePicker]="picker">
              <input matStartDate placeholder="Start date">
              <input matEndDate placeholder="End date">
            </mat-date-range-input>
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-date-range-picker #picker></mat-date-range-picker>
          </mat-form-field>
        </div>
      </header>

      <div class="metrics-overview">
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-value">\${{ summary.totalRevenue | number:'1.0-0' }}</div>
            <div class="metric-label">Total Revenue</div>
            <div class="metric-trend positive">
              <mat-icon>trending_up</mat-icon>
              <span>+12.5%</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-value">{{ summary.totalOrders | number }}</div>
            <div class="metric-label">Total Orders</div>
            <div class="metric-trend positive">
              <mat-icon>trending_up</mat-icon>
              <span>+8.3%</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-value">\${{ summary.avgOrderValue | number:'1.0-0' }}</div>
            <div class="metric-label">Average Order Value</div>
            <div class="metric-trend negative">
              <mat-icon>trending_down</mat-icon>
              <span>-2.1%</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-value">{{ summary.conversionRate | number:'1.1-1' }}%</div>
            <div class="metric-label">Conversion Rate</div>
            <div class="metric-trend positive">
              <mat-icon>trending_up</mat-icon>
              <span>+1.5%</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="channel-performance">
        <mat-card-header>
          <mat-card-title>Channel Performance</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table class="performance-table">
            <thead>
              <tr>
                <th>Channel</th>
                <th>Visitors</th>
                <th>Conversions</th>
                <th>Revenue</th>
                <th>Cost per Acquisition</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let metric of channelMetrics">
                <td>{{ metric.channel }}</td>
                <td>{{ metric.visitors | number }}</td>
                <td>{{ metric.conversions | number }}</td>
                <td>\${{ metric.revenue | number:'1.0-0' }}</td>
                <td>\${{ metric.cpa | number:'1.2-2' }}</td>
              </tr>
            </tbody>
          </table>
        </mat-card-content>
      </mat-card>

      <div class="charts-grid">
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Revenue Trends</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <!-- TODO: Implement chart -->
            <div class="placeholder-chart"></div>
          </mat-card-content>
        </mat-card>

        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Traffic Sources</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <!-- TODO: Implement chart -->
            <div class="placeholder-chart"></div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .analytics-container {
      padding: 20px;
      max-width: 1600px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;

      h1 {
        margin: 0;
        font-size: 2rem;
        font-weight: 500;
      }

      .subtitle {
        margin: 4px 0 0;
        color: rgba(0, 0, 0, 0.6);
      }

      .date-range {
        min-width: 240px;
      }
    }

    .metrics-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .metric-card {
      .metric-value {
        font-size: 2rem;
        font-weight: 500;
        margin-bottom: 8px;
      }

      .metric-label {
        color: rgba(0, 0, 0, 0.6);
        font-size: 0.9rem;
        margin-bottom: 12px;
      }

      .metric-trend {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.875rem;

        &.positive {
          color: #4caf50;
        }

        &.negative {
          color: #f44336;
        }

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }
    }

    .channel-performance {
      margin-bottom: 24px;

      .performance-table {
        width: 100%;
        border-collapse: collapse;

        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid rgba(0, 0, 0, 0.12);
        }

        th {
          font-weight: 500;
          color: rgba(0, 0, 0, 0.87);
        }

        td {
          color: rgba(0, 0, 0, 0.87);
        }
      }
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 20px;

      .chart-card {
        min-height: 400px;
      }
    }

    .placeholder-chart {
      width: 100%;
      height: 300px;
      background: rgba(0, 0, 0, 0.04);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(0, 0, 0, 0.6);

      &::after {
        content: "Chart coming soon";
      }
    }

    @media (max-width: 600px) {
      .analytics-container {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        align-items: stretch;

        .date-range {
          width: 100%;
        }
      }

      .charts-grid {
        grid-template-columns: 1fr;
      }

      .performance-table {
        display: block;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
    }
  `]
})
export class MarketingAnalyticsComponent implements OnInit {
  summary: AnalyticsSummary = {
    totalRevenue: 125750,
    totalOrders: 1450,
    avgOrderValue: 86.72,
    conversionRate: 2.8
  };

  channelMetrics: ChannelMetrics[] = [
    {
      channel: 'Organic Search',
      visitors: 45000,
      conversions: 540,
      revenue: 46800,
      cpa: 0
    },
    {
      channel: 'Social Media',
      visitors: 32000,
      conversions: 384,
      revenue: 33600,
      cpa: 12.50
    },
    {
      channel: 'Email Marketing',
      visitors: 15000,
      conversions: 285,
      revenue: 24700,
      cpa: 5.20
    },
    {
      channel: 'Paid Search',
      visitors: 28000,
      conversions: 241,
      revenue: 20650,
      cpa: 18.75
    }
  ];

  ngOnInit(): void {
    // TODO: Load analytics data from service
    this.initializeCharts();
  }

  private initializeCharts(): void {
    // TODO: Initialize charts using a charting library
    // Recommended libraries: Chart.js, D3.js, or NGX-Charts
  }
}