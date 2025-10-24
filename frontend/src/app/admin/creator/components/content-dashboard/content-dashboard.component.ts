import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-content-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatChipsModule,
    RouterModule
  ],
  template: `
    <div class="content-dashboard">
      <header class="dashboard-header">
        <div class="header-content">
          <h1>Content Dashboard</h1>
          <p class="subtitle">Manage your content and track performance</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" routerLink="create">
            <mat-icon>add</mat-icon>
            Create New Content
          </button>
        </div>
      </header>

      <div class="metrics-grid">
        <mat-card *ngFor="let metric of contentMetrics">
          <mat-card-content>
            <div class="metric-content">
              <div class="metric-info">
                <h3>{{ metric.label }}</h3>
                <p class="metric-value">{{ metric.value }}</p>
                <p *ngIf="metric.change" class="metric-change" 
                   [class.positive]="metric.trend === 'up'"
                   [class.negative]="metric.trend === 'down'">
                  <mat-icon>{{ metric.trend === 'up' ? 'trending_up' : 'trending_down' }}</mat-icon>
                  {{ metric.change }}
                </p>
              </div>
              <mat-icon [style.color]="metric.color">{{ metric.icon }}</mat-icon>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="content-grid">
        <mat-card class="content-performance">
          <mat-card-header>
            <mat-card-title>Content Performance</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="recentContent">
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef>Title</th>
                <td mat-cell *matCellDef="let content">{{ content.title }}</td>
              </ng-container>

              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let content">
                  <mat-chip [color]="getContentTypeColor(content.type)" selected>
                    {{ content.type }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="views">
                <th mat-header-cell *matHeaderCellDef>Views</th>
                <td mat-cell *matCellDef="let content">{{ content.views }}</td>
              </ng-container>

              <ng-container matColumnDef="engagement">
                <th mat-header-cell *matHeaderCellDef>Engagement</th>
                <td mat-cell *matCellDef="let content">{{ content.engagement }}%</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let content">
                  <mat-chip [color]="getStatusColor(content.status)" selected>
                    {{ content.status }}
                  </mat-chip>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </mat-card-content>
        </mat-card>

        <div class="side-section">
          <mat-card class="engagement-card">
            <mat-card-header>
              <mat-card-title>Engagement Overview</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="engagement-metrics">
                <div class="engagement-metric" *ngFor="let metric of engagementMetrics">
                  <div class="metric-header">
                    <span>{{ metric.label }}</span>
                    <span class="metric-value" [style.color]="metric.color">
                      {{ metric.value }}
                    </span>
                  </div>
                  <mat-progress-bar
                    [value]="metric.percentage"
                    [color]="metric.trend === 'up' ? 'primary' : 'warn'">
                  </mat-progress-bar>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="draft-card">
            <mat-card-header>
              <mat-card-title>Draft Content</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="draft-list">
                <div class="draft-item" *ngFor="let draft of draftContent">
                  <div class="draft-info">
                    <h4>{{ draft.title }}</h4>
                    <p>Last edited {{ draft.lastEdited | date:'short' }}</p>
                  </div>
                  <button mat-icon-button [routerLink]="['edit', draft.id]">
                    <mat-icon>edit</mat-icon>
                  </button>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .content-dashboard {
      padding: 20px;
      max-width: 1600px;
      margin: 0 auto;
    }

    .dashboard-header {
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
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .metric-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 16px;

      .metric-info {
        flex: 1;

        h3 {
          margin: 0;
          color: rgba(0, 0, 0, 0.6);
          font-size: 1rem;
        }

        .metric-value {
          font-size: 2rem;
          font-weight: 500;
          margin: 8px 0;
        }

        .metric-change {
          display: flex;
          align-items: center;
          gap: 4px;
          margin: 0;
          font-size: 0.875rem;

          &.positive {
            color: #4caf50;
          }

          &.negative {
            color: #f44336;
          }
        }
      }

      mat-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
      }
    }

    .content-grid {
      display: grid;
      grid-template-columns: 3fr 2fr;
      gap: 20px;
    }

    .side-section {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    table {
      width: 100%;
    }

    .engagement-metrics {
      .engagement-metric {
        margin-bottom: 16px;

        .metric-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;

          .metric-value {
            font-weight: 500;
          }
        }
      }
    }

    .draft-list {
      .draft-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);

        &:last-child {
          border-bottom: none;
        }

        .draft-info {
          h4 {
            margin: 0;
            font-size: 1rem;
          }

          p {
            margin: 4px 0 0;
            font-size: 0.875rem;
            color: rgba(0, 0, 0, 0.6);
          }
        }
      }
    }

    @media (max-width: 1200px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 600px) {
      .content-dashboard {
        padding: 16px;
      }

      .dashboard-header {
        flex-direction: column;
        align-items: stretch;

        .header-actions {
          width: 100%;

          button {
            width: 100%;
          }
        }
      }

      .metrics-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ContentDashboardComponent implements OnInit {
  contentMetrics = [
    {
      label: 'Total Posts',
      value: '1,234',
      icon: 'article',
      color: '#2196f3',
      trend: 'up',
      change: '+12%'
    },
    {
      label: 'Total Views',
      value: '45.2K',
      icon: 'visibility',
      color: '#4caf50',
      trend: 'up',
      change: '+8.5%'
    },
    {
      label: 'Engagement Rate',
      value: '18.6%',
      icon: 'thumb_up',
      color: '#ff9800',
      trend: 'down',
      change: '-2.1%'
    },
    {
      label: 'Avg. Time on Page',
      value: '4:32',
      icon: 'schedule',
      color: '#9c27b0'
    }
  ];

  displayedColumns = ['title', 'type', 'views', 'engagement', 'status'];

  recentContent = [
    {
      title: 'Summer Fashion Trends 2023',
      type: 'article',
      views: 1234,
      engagement: 86,
      status: 'published'
    },
    {
      title: 'Street Style Lookbook',
      type: 'gallery',
      views: 892,
      engagement: 92,
      status: 'published'
    },
    {
      title: 'Sustainable Fashion Guide',
      type: 'article',
      views: 567,
      engagement: 78,
      status: 'draft'
    }
  ];

  engagementMetrics = [
    {
      label: 'Likes',
      value: '12.5K',
      percentage: 85,
      trend: 'up',
      color: '#4caf50'
    },
    {
      label: 'Comments',
      value: '3.2K',
      percentage: 65,
      trend: 'up',
      color: '#2196f3'
    },
    {
      label: 'Shares',
      value: '2.8K',
      percentage: 45,
      trend: 'down',
      color: '#ff9800'
    },
    {
      label: 'Saves',
      value: '1.5K',
      percentage: 35,
      trend: 'up',
      color: '#9c27b0'
    }
  ];

  draftContent = [
    {
      id: '1',
      title: 'Autumn Collection Preview',
      lastEdited: new Date(Date.now() - 3600000)
    },
    {
      id: '2',
      title: 'Sustainable Fashion Tips',
      lastEdited: new Date(Date.now() - 7200000)
    },
    {
      id: '3',
      title: 'Designer Interview Series',
      lastEdited: new Date(Date.now() - 10800000)
    }
  ];

  ngOnInit(): void {
    // TODO: Load content metrics and data
  }

  getContentTypeColor(type: string): 'primary' | 'accent' | 'warn' {
    switch (type) {
      case 'article':
        return 'primary';
      case 'gallery':
        return 'accent';
      default:
        return 'warn';
    }
  }

  getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'published':
        return 'primary';
      case 'draft':
        return 'accent';
      default:
        return 'warn';
    }
  }
}