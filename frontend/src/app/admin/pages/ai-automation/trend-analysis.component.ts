import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

interface Trend {
  id: string;
  productName: string;
  category: string;
  growthRate: number;
  searchVolume: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  momentum: 'rising' | 'stable' | 'declining';
  lastUpdated: string;
}

@Component({
  selector: 'app-trend-analysis',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Trend Analysis</h1>
        <p>Analyze market trends and emerging patterns</p>
      </div>
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon class="trending-up">trending_up</mat-icon>
            <div class="stat-number">{{ risingTrends }}</div>
            <div class="stat-label">Rising Trends</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon class="trending-neutral">trending_flat</mat-icon>
            <div class="stat-number">{{ stableTrends }}</div>
            <div class="stat-label">Stable Trends</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon class="trending-down">trending_down</mat-icon>
            <div class="stat-number">{{ decliningTrends }}</div>
            <div class="stat-label">Declining Trends</div>
          </mat-card-content>
        </mat-card>
      </div>
      <mat-card>
        <mat-card-header>
          <mat-card-title>Current Market Trends</mat-card-title>
          <mat-card-subtitle>{{ trends.length }} active trends detected</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="table-wrapper">
            <table mat-table [dataSource]="trends" class="trends-table">
              <!-- Product column -->
              <ng-container matColumnDef="productName">
                <th mat-header-cell *matHeaderCellDef>Product / Category</th>
                <td mat-cell *matCellDef="let element">{{ element.productName }}</td>
              </ng-container>

              <!-- Category column -->
              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef>Category</th>
                <td mat-cell *matCellDef="let element">{{ element.category }}</td>
              </ng-container>

              <!-- Growth Rate column -->
              <ng-container matColumnDef="growthRate">
                <th mat-header-cell *matHeaderCellDef>Growth Rate</th>
                <td mat-cell *matCellDef="let element">
                  <span [class]="'growth-' + (element.growthRate > 0 ? 'positive' : 'negative')">{{ element.growthRate > 0 ? '+' : '' }}{{ element.growthRate }}%</span>
                </td>
              </ng-container>

              <!-- Search Volume column -->
              <ng-container matColumnDef="searchVolume">
                <th mat-header-cell *matHeaderCellDef>Search Volume</th>
                <td mat-cell *matCellDef="let element">{{ element.searchVolume | number }}</td>
              </ng-container>

              <!-- Sentiment column -->
              <ng-container matColumnDef="sentiment">
                <th mat-header-cell *matHeaderCellDef>Sentiment</th>
                <td mat-cell *matCellDef="let element">
                  <span [class]="'sentiment-' + element.sentiment">{{ element.sentiment }}</span>
                </td>
              </ng-container>

              <!-- Momentum column -->
              <ng-container matColumnDef="momentum">
                <th mat-header-cell *matHeaderCellDef>Momentum</th>
                <td mat-cell *matCellDef="let element">
                  <span [class]="'momentum-' + element.momentum">{{ element.momentum }}</span>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { margin: 0 0 8px 0; font-size: 28px; font-weight: 500; }
    .page-header p { margin: 0; color: #666; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { text-align: center; }
    .stat-card mat-icon { font-size: 32px; width: 32px; height: 32px; margin: 8px auto; }
    .stat-card mat-icon.trending-up { color: #4caf50; }
    .stat-card mat-icon.trending-neutral { color: #2196f3; }
    .stat-card mat-icon.trending-down { color: #f44336; }
    .stat-number { font-size: 28px; font-weight: bold; color: #333; margin-bottom: 8px; }
    .stat-label { font-size: 12px; color: #999; }
    .table-wrapper { overflow-x: auto; }
    .trends-table { width: 100%; border-collapse: collapse; }
    .trends-table th { background-color: #f5f5f5; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e0e0e0; }
    .trends-table td { padding: 12px; border-bottom: 1px solid #f0f0f0; }
    .trends-table tr:hover { background-color: #fafafa; }
    .growth-positive { color: #4caf50; font-weight: bold; }
    .growth-negative { color: #f44336; font-weight: bold; }
    .sentiment-positive { color: #4caf50; font-weight: 500; }
    .sentiment-neutral { color: #2196f3; font-weight: 500; }
    .sentiment-negative { color: #f44336; font-weight: 500; }
    .momentum-rising { color: #4caf50; font-weight: 500; }
    .momentum-stable { color: #2196f3; font-weight: 500; }
    .momentum-declining { color: #ff9800; font-weight: 500; }
  `]
})
export class TrendAnalysisComponent implements OnInit {
  displayedColumns: string[] = ['productName', 'category', 'growthRate', 'searchVolume', 'sentiment', 'momentum'];
  trends: Trend[] = [];
  risingTrends: number = 0;
  stableTrends: number = 0;
  decliningTrends: number = 0;

  ngOnInit(): void {
    this.loadTrends();
    this.calculateStats();
  }

  private loadTrends(): void {
    this.trends = [
      { id: '1', productName: 'Sustainable Fashion', category: 'Eco-Friendly', growthRate: 45, searchVolume: 12500, sentiment: 'positive', momentum: 'rising', lastUpdated: '2026-03-07' },
      { id: '2', productName: 'Oversized Blazers', category: 'Outerwear', growthRate: 32, searchVolume: 8900, sentiment: 'positive', momentum: 'rising', lastUpdated: '2026-03-07' },
      { id: '3', productName: 'Vintage Jeans', category: 'Denim', growthRate: 18, searchVolume: 6200, sentiment: 'positive', momentum: 'stable', lastUpdated: '2026-03-07' },
      { id: '4', productName: 'Minimalist Aesthetics', category: 'Style', growthRate: 12, searchVolume: 5100, sentiment: 'neutral', momentum: 'stable', lastUpdated: '2026-03-07' },
      { id: '5', productName: 'Fast Fashion', category: 'Budget', growthRate: -25, searchVolume: 4200, sentiment: 'negative', momentum: 'declining', lastUpdated: '2026-03-07' }
    ];
  }

  private calculateStats(): void {
    this.risingTrends = this.trends.filter(t => t.momentum === 'rising').length;
    this.stableTrends = this.trends.filter(t => t.momentum === 'stable').length;
    this.decliningTrends = this.trends.filter(t => t.momentum === 'declining').length;
  }
}
