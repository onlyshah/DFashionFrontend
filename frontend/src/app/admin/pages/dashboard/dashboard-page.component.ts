import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  template: `
    <div class="dashboard-container">
      <header class="page-header">
        <h1>Dashboard</h1>
      </header>

      <div class="dashboard-grid">
        <mat-card class="dashboard-card" *ngFor="let module of modules" [routerLink]="module.route">
          <mat-card-content>
            <mat-icon [ngStyle]="{'color': module.color}">{{module.icon}}</mat-icon>
            <h2>{{module.name}}</h2>
            <p>{{module.description}}</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      max-width: 1600px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 24px;

      h1 {
        margin: 0;
        font-size: 2rem;
        font-weight: 500;
      }
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .dashboard-card {
      cursor: pointer;
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-4px);
      }

      mat-card-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 24px;

        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          margin-bottom: 16px;
        }

        h2 {
          margin: 0 0 8px;
          font-size: 1.5rem;
        }

        p {
          margin: 0;
          color: rgba(0, 0, 0, 0.6);
        }
      }
    }

    @media (max-width: 600px) {
      .dashboard-container {
        padding: 16px;
      }

      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardPageComponent {
  modules = [
    {
      name: 'Admin',
      description: 'System administration and user management',
      icon: 'admin_panel_settings',
      route: '/admin/admin',
      color: '#2196f3'
    },
    {
      name: 'Finance',
      description: 'Financial management and transactions',
      icon: 'payments',
      route: '/admin/finance',
      color: '#4caf50'
    },
    {
      name: 'Logistics',
      description: 'Order fulfillment and shipping',
      icon: 'local_shipping',
      route: '/admin/logistics',
      color: '#ff9800'
    },
    {
      name: 'Marketing',
      description: 'Campaigns and promotions',
      icon: 'campaign',
      route: '/admin/marketing',
      color: '#9c27b0'
    },
    {
      name: 'Creator',
      description: 'Content creation and management',
      icon: 'create',
      route: '/admin/creator',
      color: '#f44336'
    },
    {
      name: 'Moderator',
      description: 'Content moderation and community',
      icon: 'security',
      route: '/admin/moderator',
      color: '#607d8b'
    }
  ];
}