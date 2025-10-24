import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';

interface ModeratorMetric {
  label: string;
  value: number;
  icon: string;
  color?: string;
  trend?: 'up' | 'down';
  change?: string;
}

interface ContentReport {
  id: string;
  type: 'comment' | 'post' | 'product' | 'user';
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  reportedAt: Date;
  reporter: string;
  content: string;
}

@Component({
  selector: 'app-moderator-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTabsModule,
    MatBadgeModule,
    RouterModule
  ],
  template: `
    <div class="moderator-dashboard">
      <header class="dashboard-header">
        <div class="header-content">
          <h1>Moderator Dashboard</h1>
          <p class="subtitle">Content moderation and community management</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="accent" matBadge="5" matBadgeColor="warn">
            <mat-icon>notifications</mat-icon>
            New Reports
          </button>
        </div>
      </header>

      <div class="metrics-grid">
        <mat-card *ngFor="let metric of moderatorMetrics">
          <mat-card-content>
            <div class="metric-content">
              <div class="metric-info">
                <h3>{{ metric.label }}</h3>
                <p class="metric-value">{{ metric.value }}</p>
                <p *ngIf="metric.trend" class="metric-change" [class.positive]="metric.trend === 'up'" [class.negative]="metric.trend === 'down'">
                  <mat-icon>{{ metric.trend === 'up' ? 'trending_up' : 'trending_down' }}</mat-icon>
                  {{ metric.change }}
                </p>
              </div>
              <mat-icon [ngStyle]="{'color': metric.color}">{{ metric.icon }}</mat-icon>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="content-grid">
        <mat-card class="reports-card">
          <mat-card-header>
            <mat-card-title>Recent Content Reports</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="contentReports" class="reports-table">
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let report">
                  <mat-chip [color]="getTypeColor(report.type)" selected>
                    {{ report.type | titlecase }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="reason">
                <th mat-header-cell *matHeaderCellDef>Reason</th>
                <td mat-cell *matCellDef="let report">{{ report.reason }}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let report">
                  <mat-chip [color]="getStatusColor(report.status)" selected>
                    {{ report.status | titlecase }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="reportedAt">
                <th mat-header-cell *matHeaderCellDef>Reported</th>
                <td mat-cell *matCellDef="let report">{{ report.reportedAt | date:'short' }}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let report">
                  <button mat-icon-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="reviewReport(report)">
                      <mat-icon>visibility</mat-icon>
                      <span>Review</span>
                    </button>
                    <button mat-menu-item (click)="resolveReport(report)">
                      <mat-icon>check_circle</mat-icon>
                      <span>Resolve</span>
                    </button>
                    <button mat-menu-item (click)="dismissReport(report)">
                      <mat-icon>block</mat-icon>
                      <span>Dismiss</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </mat-card-content>
        </mat-card>

        <div class="side-section">
          <mat-card class="activity-card">
            <mat-card-header>
              <mat-card-title>Moderation Activity</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="activity-timeline">
                <div *ngFor="let activity of recentActivity" class="activity-item">
                  <div class="activity-icon">
                    <mat-icon [ngStyle]="{'color': getActivityColor(activity.type)}">
                      {{ getActivityIcon(activity.type) }}
                    </mat-icon>
                  </div>
                  <div class="activity-content">
                    <p class="activity-text">{{ activity.text }}</p>
                    <span class="activity-time">{{ activity.time | date:'shortTime' }}</span>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="quick-actions-card">
            <mat-card-header>
              <mat-card-title>Quick Actions</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="quick-actions-grid">
                <button mat-raised-button color="primary">
                  <mat-icon>people</mat-icon>
                  User Reports
                </button>
                <button mat-raised-button color="accent">
                  <mat-icon>comment</mat-icon>
                  Comments
                </button>
                <button mat-raised-button color="warn">
                  <mat-icon>report</mat-icon>
                  Flagged Content
                </button>
                <button mat-raised-button>
                  <mat-icon>history</mat-icon>
                  Activity Log
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .moderator-dashboard {
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

    .reports-table {
      width: 100%;
    }

    .side-section {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .activity-timeline {
      .activity-item {
        display: flex;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);

        &:last-child {
          border-bottom: none;
        }

        .activity-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.04);
        }

        .activity-content {
          flex: 1;

          .activity-text {
            margin: 0;
            font-size: 0.875rem;
          }

          .activity-time {
            font-size: 0.75rem;
            color: rgba(0, 0, 0, 0.6);
          }
        }
      }
    }

    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;

      button {
        width: 100%;
      }
    }

    @media screen and (max-width: 1200px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
    }

    @media screen and (max-width: 600px) {
      .moderator-dashboard {
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

      .quick-actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ModeratorDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  displayedColumns = ['type', 'reason', 'status', 'reportedAt', 'actions'];

  moderatorMetrics: ModeratorMetric[] = [
    {
      label: 'Pending Reports',
      value: 24,
      icon: 'warning',
      color: '#f44336',
      trend: 'up',
      change: '+8'
    },
    {
      label: 'Resolved Today',
      value: 156,
      icon: 'check_circle',
      color: '#4caf50',
      trend: 'up',
      change: '+12%'
    },
    {
      label: 'Active Users',
      value: 8427,
      icon: 'group',
      color: '#2196f3'
    },
    {
      label: 'Response Time',
      value: 18,
      icon: 'timer',
      color: '#ff9800',
      trend: 'down',
      change: '-5 min'
    }
  ];

  contentReports: ContentReport[] = [
    {
      id: 'REP-001',
      type: 'comment',
      reason: 'Inappropriate content',
      status: 'pending',
      reportedAt: new Date(),
      reporter: 'user123',
      content: 'This comment contains inappropriate language...'
    },
    {
      id: 'REP-002',
      type: 'post',
      reason: 'Spam',
      status: 'resolved',
      reportedAt: new Date(Date.now() - 3600000),
      reporter: 'user456',
      content: 'Multiple promotional links detected...'
    },
    {
      id: 'REP-003',
      type: 'product',
      reason: 'Counterfeit item',
      status: 'pending',
      reportedAt: new Date(Date.now() - 7200000),
      reporter: 'user789',
      content: 'Suspected fake branded product...'
    }
  ];

  recentActivity = [
    {
      type: 'review',
      text: 'Reviewed and approved product listing #12345',
      time: new Date(Date.now() - 1800000)
    },
    {
      type: 'warning',
      text: 'Issued warning to user @fashionista22',
      time: new Date(Date.now() - 3600000)
    },
    {
      type: 'block',
      text: 'Temporarily suspended account for policy violation',
      time: new Date(Date.now() - 7200000)
    },
    {
      type: 'resolve',
      text: 'Resolved comment dispute on post #89012',
      time: new Date(Date.now() - 10800000)
    }
  ];

  ngOnInit(): void {
    // TODO: Initialize real-time updates
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getTypeColor(type: string): 'primary' | 'accent' | 'warn' {
    switch (type) {
      case 'comment':
        return 'primary';
      case 'post':
        return 'accent';
      case 'product':
      case 'user':
        return 'warn';
      default:
        return 'primary';
    }
  }

  getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'resolved':
        return 'primary';
      case 'pending':
        return 'accent';
      case 'dismissed':
        return 'warn';
      default:
        return 'primary';
    }
  }

  getActivityColor(type: string): string {
    switch (type) {
      case 'review':
        return '#2196f3';
      case 'warning':
        return '#ff9800';
      case 'block':
        return '#f44336';
      case 'resolve':
        return '#4caf50';
      default:
        return '#2196f3';
    }
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'review':
        return 'visibility';
      case 'warning':
        return 'warning';
      case 'block':
        return 'block';
      case 'resolve':
        return 'check_circle';
      default:
        return 'info';
    }
  }

  reviewReport(report: ContentReport): void {
    // TODO: Implement review logic
    console.log('Reviewing report:', report.id);
  }

  resolveReport(report: ContentReport): void {
    // TODO: Implement resolve logic
    console.log('Resolving report:', report.id);
  }

  dismissReport(report: ContentReport): void {
    // TODO: Implement dismiss logic
    console.log('Dismissing report:', report.id);
  }
}