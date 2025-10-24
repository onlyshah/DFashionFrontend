import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    RouterModule
  ],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>
      
      <div class="stat-cards">
        <mat-card *ngFor="let stat of statistics">
          <mat-card-header>
            <mat-card-title>{{ stat.label }}</mat-card-title>
            <mat-icon [color]="stat.trend === 'up' ? 'primary' : 'warn'">
              {{ stat.trend === 'up' ? 'trending_up' : 'trending_down' }}
            </mat-icon>
          </mat-card-header>
          <mat-card-content>
            <h2>{{ stat.value }}</h2>
            <p>{{ stat.change }}% from last month</p>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="action-buttons">
          <button mat-raised-button color="primary" *ngFor="let action of quickActions"
                  [routerLink]="action.route">
            <mat-icon>{{ action.icon }}</mat-icon>
            {{ action.label }}
          </button>
        </div>
      </div>

      <mat-divider></mat-divider>

      <div class="recent-activity">
        <h2>Recent Activity</h2>
        <mat-card *ngFor="let activity of recentActivities">
          <mat-card-header>
            <mat-icon mat-card-avatar>{{ activity.icon }}</mat-icon>
            <mat-card-title>{{ activity.title }}</mat-card-title>
            <mat-card-subtitle>{{ activity.timestamp | date:'medium' }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>{{ activity.description }}</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
    }

    .stat-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;

      mat-card {
        mat-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        h2 {
          font-size: 2em;
          margin: 10px 0;
        }
      }
    }

    .quick-actions {
      margin-bottom: 30px;

      .action-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;

        button {
          mat-icon {
            margin-right: 8px;
          }
        }
      }
    }

    .recent-activity {
      margin-top: 30px;

      mat-card {
        margin-bottom: 10px;
      }
    }

    @media (max-width: 600px) {
      .stat-cards {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
        
        button {
          width: 100%;
        }
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  statistics = [
    { label: 'Total Users', value: '1,234', trend: 'up', change: '+12' },
    { label: 'Active Orders', value: '56', trend: 'up', change: '+8' },
    { label: 'Revenue', value: '$12,345', trend: 'up', change: '+15' },
    { label: 'Pending Tasks', value: '23', trend: 'down', change: '-5' }
  ];

  quickActions = [
    { label: 'New User', icon: 'person_add', route: '/admin/users/create' },
    { label: 'View Orders', icon: 'shopping_cart', route: '/admin/orders' },
    { label: 'Settings', icon: 'settings', route: '/admin/settings' }
  ];

  recentActivities = [
    {
      icon: 'person',
      title: 'New User Registration',
      description: 'John Doe registered as a new user',
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      icon: 'shopping_cart',
      title: 'Order Placed',
      description: 'New order #12345 placed',
      timestamp: new Date(Date.now() - 7200000)
    },
    {
      icon: 'report_problem',
      title: 'System Alert',
      description: 'Server maintenance scheduled',
      timestamp: new Date(Date.now() - 10800000)
    }
  ];

  ngOnInit(): void {
    // TODO: Load real data from services
  }
}