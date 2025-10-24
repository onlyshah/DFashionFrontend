import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'draft' | 'completed' | 'scheduled';
  type: 'discount' | 'promotion' | 'event' | 'collection';
  startDate: Date;
  endDate: Date;
  budget: number;
  spent: number;
  reach: number;
  engagement: number;
  conversions: number;
}

@Component({
  selector: 'app-campaign-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatMenuModule,
    RouterModule,
    MatProgressBarModule
  ],
  template: `
    <div class="campaign-list-container">
      <header class="page-header">
        <div class="header-content">
          <h1>Campaigns</h1>
          <p class="subtitle">Manage your marketing campaigns and promotions</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" routerLink="new">
            <mat-icon>add</mat-icon>
            Create New Campaign
          </button>
        </div>
      </header>

      <div class="campaign-grid">
        <mat-card *ngFor="let campaign of campaigns" class="campaign-card">
          <mat-card-header>
            <mat-card-title>{{ campaign.name }}</mat-card-title>
            <mat-card-subtitle>{{ campaign.type | titlecase }}</mat-card-subtitle>
            <mat-chip [color]="getStatusColor(campaign.status)" selected>
              {{ campaign.status }}
            </mat-chip>
          </mat-card-header>

          <mat-card-content>
            <div class="campaign-dates">
              <div class="date-range">
                <span class="label">Duration:</span>
                <span>{{ campaign.startDate | date:'mediumDate' }} - {{ campaign.endDate | date:'mediumDate' }}</span>
              </div>
            </div>

            <div class="budget-section">
              <div class="budget-header">
                <span>Budget Utilization</span>
                <span class="budget-numbers">
                  \${{ campaign.spent | number:'1.0-0' }} / \${{ campaign.budget | number:'1.0-0' }}
                </span>
              </div>
              <mat-progress-bar
                [value]="(campaign.spent / campaign.budget) * 100"
                [color]="getBudgetColor(campaign.spent / campaign.budget)">
              </mat-progress-bar>
            </div>

            <div class="metrics-grid">
              <div class="metric">
                <div class="metric-value">{{ campaign.reach | number }}</div>
                <div class="metric-label">Reach</div>
              </div>
              <div class="metric">
                <div class="metric-value">{{ campaign.engagement | number }}</div>
                <div class="metric-label">Engagement</div>
              </div>
              <div class="metric">
                <div class="metric-value">{{ campaign.conversions | number }}</div>
                <div class="metric-label">Conversions</div>
              </div>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button mat-button color="primary" [routerLink]="['edit', campaign.id]">
              <mat-icon>edit</mat-icon>
              Edit
            </button>
            <button mat-button color="accent" (click)="viewAnalytics(campaign)">
              <mat-icon>analytics</mat-icon>
              Analytics
            </button>
            <button mat-button [matMenuTriggerFor]="menu">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item (click)="duplicateCampaign(campaign)">
                <mat-icon>content_copy</mat-icon>
                <span>Duplicate</span>
              </button>
              <button mat-menu-item (click)="exportReport(campaign)">
                <mat-icon>download</mat-icon>
                <span>Export Report</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item color="warn" (click)="deleteCampaign(campaign)">
                <mat-icon color="warn">delete</mat-icon>
                <span class="text-warn">Delete</span>
              </button>
            </mat-menu>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .campaign-list-container {
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
    }

    .campaign-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 20px;
    }

    .campaign-card {
      mat-card-header {
        margin-bottom: 16px;
        position: relative;

        mat-chip {
          position: absolute;
          right: 0;
          top: 0;
        }
      }
    }

    .campaign-dates {
      margin-bottom: 16px;

      .date-range {
        display: flex;
        gap: 8px;
        color: rgba(0, 0, 0, 0.6);
        font-size: 0.9rem;

        .label {
          font-weight: 500;
        }
      }
    }

    .budget-section {
      margin-bottom: 20px;

      .budget-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 0.9rem;

        .budget-numbers {
          font-weight: 500;
        }
      }
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-top: 20px;

      .metric {
        text-align: center;
        padding: 12px;
        background: rgba(0, 0, 0, 0.04);
        border-radius: 4px;

        .metric-value {
          font-size: 1.5rem;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .metric-label {
          font-size: 0.875rem;
          color: rgba(0, 0, 0, 0.6);
        }
      }
    }

    .text-warn {
      color: #f44336;
    }

    @media (max-width: 600px) {
      .campaign-list-container {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        align-items: stretch;

        .header-actions {
          width: 100%;

          button {
            width: 100%;
          }
        }
      }

      .campaign-grid {
        grid-template-columns: 1fr;
      }

      .metrics-grid {
        grid-template-columns: 1fr;
        gap: 8px;
      }
    }
  `]
})
export class CampaignListComponent implements OnInit {
  campaigns: Campaign[] = [
    {
      id: '1',
      name: 'Summer Sale 2023',
      status: 'active',
      type: 'discount',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 86400000),
      budget: 10000,
      spent: 4500,
      reach: 50000,
      engagement: 15000,
      conversions: 750
    },
    {
      id: '2',
      name: 'Fall Collection Launch',
      status: 'scheduled',
      type: 'collection',
      startDate: new Date(Date.now() + 15 * 86400000),
      endDate: new Date(Date.now() + 30 * 86400000),
      budget: 20000,
      spent: 0,
      reach: 0,
      engagement: 0,
      conversions: 0
    },
    {
      id: '3',
      name: 'Fashion Week Event',
      status: 'completed',
      type: 'event',
      startDate: new Date(Date.now() - 30 * 86400000),
      endDate: new Date(Date.now() - 23 * 86400000),
      budget: 15000,
      spent: 14800,
      reach: 75000,
      engagement: 25000,
      conversions: 1200
    }
  ];

  ngOnInit(): void {
    // TODO: Load campaigns from service
  }

  getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'active':
        return 'primary';
      case 'completed':
        return 'accent';
      case 'scheduled':
        return 'warn';
      default:
        return 'primary';
    }
  }

  getBudgetColor(percentage: number): 'primary' | 'accent' | 'warn' {
    if (percentage >= 0.9) return 'warn';
    if (percentage >= 0.7) return 'accent';
    return 'primary';
  }

  viewAnalytics(campaign: Campaign): void {
    // TODO: Implement analytics view
    console.log('View analytics:', campaign);
  }

  duplicateCampaign(campaign: Campaign): void {
    // TODO: Implement campaign duplication
    console.log('Duplicate campaign:', campaign);
  }

  exportReport(campaign: Campaign): void {
    // TODO: Implement report export
    console.log('Export report:', campaign);
  }

  deleteCampaign(campaign: Campaign): void {
    // TODO: Implement delete functionality
    console.log('Delete campaign:', campaign);
  }
}