import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-campaign-dashboard',
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
        <h1>Marketing Dashboard</h1>
        <button mat-raised-button color="primary" routerLink="/admin/marketing/campaigns/create">
          <mat-icon>add</mat-icon>
          New Campaign
        </button>
      </header>

      <div class="stats-grid">
        <mat-card *ngFor="let stat of campaignStats">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-info">
                <h3>{{ stat.label }}</h3>
                <p class="stat-value">{{ stat.value }}</p>
                <p class="stat-change" [class.positive]="stat.trend === 'up'" [class.negative]="stat.trend === 'down'">
                  <mat-icon>{{ stat.trend === 'up' ? 'trending_up' : 'trending_down' }}</mat-icon>
                  {{ stat.change }}%
                </p>
              </div>
              <mat-icon class="stat-icon" [color]="stat.trend === 'up' ? 'primary' : 'warn'">
                {{ stat.icon }}
              </mat-icon>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="campaign-grid">
        <mat-card class="active-campaigns">
          <mat-card-header>
            <mat-card-title>Active Campaigns</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="campaign-list">
              <div *ngFor="let campaign of activeCampaigns" class="campaign-item">
                <div class="campaign-info">
                  <h4>{{ campaign.name }}</h4>
                  <p>{{ campaign.status }}</p>
                </div>
                <div class="campaign-stats">
                  <span>Reach: {{ campaign.reach }}</span>
                  <span>Engagement: {{ campaign.engagement }}%</span>
                </div>
                <button mat-icon-button [routerLink]="['/admin/marketing/campaigns', campaign.id]">
                  <mat-icon>chevron_right</mat-icon>
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="engagement-metrics">
          <mat-card-header>
            <mat-card-title>Engagement Metrics</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <!-- TODO: Add Chart.js integration for engagement metrics -->
            <p class="placeholder-chart">Engagement Chart Placeholder</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h1 {
        margin: 0;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-info {
      h3 {
        margin: 0;
        color: rgba(0, 0, 0, 0.6);
      }

      .stat-value {
        font-size: 2em;
        margin: 10px 0;
      }

      .stat-change {
        display: flex;
        align-items: center;
        gap: 4px;
        margin: 0;

        &.positive {
          color: #4caf50;
        }

        &.negative {
          color: #f44336;
        }
      }
    }

    .stat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .campaign-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .campaign-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);

      &:last-child {
        border-bottom: none;
      }

      .campaign-info {
        h4 {
          margin: 0;
        }

        p {
          margin: 4px 0 0;
          color: rgba(0, 0, 0, 0.6);
        }
      }

      .campaign-stats {
        display: flex;
        gap: 16px;
        color: rgba(0, 0, 0, 0.6);
      }
    }

    .placeholder-chart {
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.04);
      border-radius: 4px;
    }

    @media (max-width: 768px) {
      .campaign-grid {
        grid-template-columns: 1fr;
      }

      .campaign-stats {
        flex-direction: column;
        gap: 4px;
      }
    }

    @media (max-width: 600px) {
      .dashboard-container {
        padding: 10px;
      }

      .page-header {
        flex-direction: column;
        gap: 10px;
        
        button {
          width: 100%;
        }
      }
    }
  `]
})
export class CampaignDashboardComponent implements OnInit {
  campaignStats = [
    {
      label: 'Active Campaigns',
      value: '12',
      change: '8',
      trend: 'up',
      icon: 'campaign'
    },
    {
      label: 'Total Reach',
      value: '45.2K',
      change: '12',
      trend: 'up',
      icon: 'groups'
    },
    {
      label: 'Engagement Rate',
      value: '3.8%',
      change: '2',
      trend: 'down',
      icon: 'trending_up'
    },
    {
      label: 'Conversion Rate',
      value: '2.1%',
      change: '5',
      trend: 'up',
      icon: 'shopping_cart'
    }
  ];

  activeCampaigns = [
    {
      id: '1',
      name: 'Summer Collection Launch',
      status: 'Active',
      reach: '12.5K',
      engagement: '4.2'
    },
    {
      id: '2',
      name: 'Holiday Season Sale',
      status: 'Scheduled',
      reach: '8.3K',
      engagement: '3.8'
    },
    {
      id: '3',
      name: 'Influencer Partnership',
      status: 'Active',
      reach: '25.1K',
      engagement: '5.1'
    }
  ];

  ngOnInit(): void {
    // TODO: Load real data from services
  }
}