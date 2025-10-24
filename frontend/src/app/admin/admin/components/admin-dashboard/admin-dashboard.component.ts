import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    RouterModule
  ],
  template: `
    <div class="admin-dashboard">
      <header class="dashboard-header">
        <h1>Admin Dashboard</h1>
      </header>

      <div class="dashboard-content">
        <div class="quick-stats">
          <mat-card *ngFor="let stat of quickStats">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-info">
                  <h3>{{ stat.label }}</h3>
                  <p class="stat-value">{{ stat.value }}</p>
                </div>
                <mat-icon [style.color]="stat.color">{{ stat.icon }}</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="dashboard-grid">
          <mat-card class="system-health">
            <mat-card-header>
              <mat-card-title>System Health</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="health-metrics">
                <div *ngFor="let metric of healthMetrics" class="health-metric">
                  <span>{{ metric.name }}</span>
                  <mat-progress-bar
                    [value]="metric.value"
                    [color]="metric.status">
                  </mat-progress-bar>
                  <span class="metric-value">{{ metric.value }}%</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="recent-activity">
            <mat-card-header>
              <mat-card-title>Recent Activity</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-list>
                <mat-list-item *ngFor="let activity of recentActivity">
                  <mat-icon matListItemIcon [style.color]="activity.color">
                    {{ activity.icon }}
                  </mat-icon>
                  <div matListItemTitle>{{ activity.title }}</div>
                  <div matListItemLine>{{ activity.time | date:'short' }}</div>
                </mat-list-item>
              </mat-list>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      padding: 20px;
      height: 100%;
    }

    .dashboard-header {
      margin-bottom: 24px;

      h1 {
        margin: 0;
        font-size: 2rem;
        font-weight: 500;
      }
    }

    .quick-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 24px;

      mat-card {
        .stat-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;

          .stat-info {
            h3 {
              margin: 0;
              color: rgba(0, 0, 0, 0.6);
              font-size: 1rem;
            }

            .stat-value {
              font-size: 2rem;
              font-weight: 500;
              margin: 8px 0 0;
            }
          }

          mat-icon {
            font-size: 36px;
            width: 36px;
            height: 36px;
          }
        }
      }
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;

      .health-metrics {
        .health-metric {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
          gap: 12px;

          span {
            min-width: 100px;
          }

          mat-progress-bar {
            flex: 1;
          }

          .metric-value {
            min-width: 50px;
            text-align: right;
          }
        }
      }
    }

    .recent-activity {
      mat-list-item {
        margin-bottom: 8px;
      }
    }

    @media (max-width: 1200px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 600px) {
      .admin-dashboard {
        padding: 16px;
      }

      .quick-stats {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminDashboardComponent {
  quickStats = [
    {
      label: 'Total Users',
      value: '12,458',
      icon: 'group',
      color: '#2196f3'
    },
    {
      label: 'Active Sessions',
      value: '1,285',
      icon: 'devices',
      color: '#4caf50'
    },
    {
      label: 'System Load',
      value: '67%',
      icon: 'memory',
      color: '#ff9800'
    },
    {
      label: 'Error Rate',
      value: '0.12%',
      icon: 'error_outline',
      color: '#f44336'
    }
  ];

  healthMetrics = [
    {
      name: 'Server CPU',
      value: 65,
      status: 'primary'
    },
    {
      name: 'Memory Usage',
      value: 82,
      status: 'warn'
    },
    {
      name: 'Storage',
      value: 45,
      status: 'primary'
    },
    {
      name: 'Network',
      value: 92,
      status: 'warn'
    }
  ];

  recentActivity = [
    {
      title: 'System backup completed',
      time: new Date(),
      icon: 'backup',
      color: '#4caf50'
    },
    {
      title: 'New user role created',
      time: new Date(Date.now() - 3600000),
      icon: 'admin_panel_settings',
      color: '#2196f3'
    },
    {
      title: 'Security alert detected',
      time: new Date(Date.now() - 7200000),
      icon: 'security',
      color: '#f44336'
    },
    {
      title: 'Database optimization',
      time: new Date(Date.now() - 10800000),
      icon: 'storage',
      color: '#ff9800'
    }
  ];
}