import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

interface RecommendationRule {
  id: string;
  name: string;
  type: string;
  accuracy: number;
  clicks: number;
  conversions: number;
  enabled: boolean;
}

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatSlideToggleModule, ReactiveFormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>AI Recommendations</h1>
        <p>Configure AI-powered product recommendations</p>
      </div>
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-number">{{ totalClicks }}</div>
            <div class="stat-label">Total Clicks</div>
            <div class="stat-sublabel">Last 7 days</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-number">{{ conversionRate }}%</div>
            <div class="stat-label">Conversion Rate</div>
            <div class="stat-sublabel">Up 12% from last week</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-number">{{ avgAccuracy }}%</div>
            <div class="stat-label">Avg Accuracy</div>
            <div class="stat-sublabel">Across all models</div>
          </mat-card-content>
        </mat-card>
      </div>
      <mat-card>
        <mat-card-header>
          <mat-card-title>Recommendation Models</mat-card-title>
          <mat-card-subtitle>{{ rules.length }} active models</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="table-wrapper">
            <table mat-table [dataSource]="rules" class="rules-table">
              <!-- Name column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Model Name</th>
                <td mat-cell *matCellDef="let element">{{ element.name }}</td>
              </ng-container>

              <!-- Type column -->
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let element">{{ element.type }}</td>
              </ng-container>

              <!-- Accuracy column -->
              <ng-container matColumnDef="accuracy">
                <th mat-header-cell *matHeaderCellDef>Accuracy</th>
                <td mat-cell *matCellDef="let element">
                  <span [class]="'accuracy-' + (element.accuracy >= 85 ? 'high' : element.accuracy >= 70 ? 'medium' : 'low')">{{ element.accuracy }}%</span>
                </td>
              </ng-container>

              <!-- Clicks column -->
              <ng-container matColumnDef="clicks">
                <th mat-header-cell *matHeaderCellDef>Clicks</th>
                <td mat-cell *matCellDef="let element">{{ element.clicks }}</td>
              </ng-container>

              <!-- Conversions column -->
              <ng-container matColumnDef="conversions">
                <th mat-header-cell *matHeaderCellDef>Conversions</th>
                <td mat-cell *matCellDef="let element">{{ element.conversions }}</td>
              </ng-container>

              <!-- Enabled column -->
              <ng-container matColumnDef="enabled">
                <th mat-header-cell *matHeaderCellDef>Enabled</th>
                <td mat-cell *matCellDef="let element">
                  <mat-slide-toggle [checked]="element.enabled"></mat-slide-toggle>
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
    .stat-number { font-size: 32px; font-weight: bold; color: #1976d2; margin: 16px 0 8px 0; }
    .stat-label { font-size: 14px; font-weight: 600; color: #333; }
    .stat-sublabel { font-size: 12px; color: #999; margin-top: 4px; }
    .table-wrapper { overflow-x: auto; }
    .rules-table { width: 100%; border-collapse: collapse; }
    .rules-table th { background-color: #f5f5f5; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e0e0e0; }
    .rules-table td { padding: 12px; border-bottom: 1px solid #f0f0f0; }
    .rules-table tr:hover { background-color: #fafafa; }
    .accuracy-high { color: #4caf50; font-weight: bold; }
    .accuracy-medium { color: #ff9800; font-weight: 600; }
    .accuracy-low { color: #f44336; font-weight: 600; }
  `]
})
export class RecommendationsComponent implements OnInit {
  displayedColumns: string[] = ['name', 'type', 'accuracy', 'clicks', 'conversions', 'enabled'];
  rules: RecommendationRule[] = [];
  totalClicks: number = 0;
  conversionRate: number = 0;
  avgAccuracy: number = 0;

  constructor() {}

  ngOnInit(): void {
    this.loadRecommendations();
    this.calculateStats();
  }

  private loadRecommendations(): void {
    this.rules = [
      { id: '1', name: 'Collaborative Filtering', type: 'User-Based', accuracy: 87, clicks: 1250, conversions: 185, enabled: true },
      { id: '2', name: 'Content-Based Filtering', type: 'Item-Based', accuracy: 82, clicks: 980, conversions: 156, enabled: true },
      { id: '3', name: 'Hybrid Model', type: 'Combined', accuracy: 91, clicks: 1680, conversions: 268, enabled: true },
      { id: '4', name: 'Trend-Based Engine', type: 'Trending', accuracy: 78, clicks: 750, conversions: 98, enabled: true },
      { id: '5', name: 'Neural Network', type: 'Deep Learning', accuracy: 89, clicks: 1420, conversions: 227, enabled: false }
    ];
  }

  private calculateStats(): void {
    this.totalClicks = this.rules.reduce((sum, r) => sum + r.clicks, 0);
    const totalConversions = this.rules.reduce((sum, r) => sum + r.conversions, 0);
    this.conversionRate = Math.round((totalConversions / this.totalClicks) * 100);
    this.avgAccuracy = Math.round(this.rules.reduce((sum, r) => sum + r.accuracy, 0) / this.rules.length);
  }
}
