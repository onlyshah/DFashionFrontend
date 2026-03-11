import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

interface CreatorRequest {
  id: string;
  creator: string;
  channelName: string;
  request: string;
  type: 'growth' | 'monetization' | 'technical' | 'other';
  urgency: 'urgent' | 'normal' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  dateSubmitted: string;
}

@Component({
  selector: 'app-creator-support',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Creator Support</h1>
        <p>Provide support to content creators and influencers</p>
      </div>
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon class="pending">hourglass_empty</mat-icon>
            <div class="stat-number">{{ pendingRequests }}</div>
            <div class="stat-label">Pending</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon class="progress">autorenew</mat-icon>
            <div class="stat-number">{{ inProgressRequests }}</div>
            <div class="stat-label">In Progress</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon class="completed">check_circle</mat-icon>
            <div class="stat-number">{{ completedRequests }}</div>
            <div class="stat-label">Completed</div>
          </mat-card-content>
        </mat-card>
      </div>
      <mat-card>
        <mat-card-header>
          <mat-card-title>Creator Support Requests</mat-card-title>
          <mat-card-subtitle>{{ requests.length }} total requests</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="table-wrapper">
            <table mat-table [dataSource]="requests" class="requests-table">
              <!-- Creator column -->
              <ng-container matColumnDef="creator">
                <th mat-header-cell *matHeaderCellDef>Creator</th>
                <td mat-cell *matCellDef="let element">{{ element.creator }}</td>
              </ng-container>

              <!-- Channel column -->
              <ng-container matColumnDef="channelName">
                <th mat-header-cell *matHeaderCellDef>Channel</th>
                <td mat-cell *matCellDef="let element">{{ element.channelName }}</td>
              </ng-container>

              <!-- Request column -->
              <ng-container matColumnDef="request">
                <th mat-header-cell *matHeaderCellDef>Request</th>
                <td mat-cell *matCellDef="let element">{{ element.request }}</td>
              </ng-container>

              <!-- Type column -->
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let element">
                  <span [class]="'type-' + element.type">{{ element.type }}</span>
                </td>
              </ng-container>

              <!-- Urgency column -->
              <ng-container matColumnDef="urgency">
                <th mat-header-cell *matHeaderCellDef>Urgency</th>
                <td mat-cell *matCellDef="let element">
                  <span [class]="'urgency-' + element.urgency">{{ element.urgency }}</span>
                </td>
              </ng-container>

              <!-- Status column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let element">
                  <span [class]="'status-' + element.status">{{ element.status }}</span>
                </td>
              </ng-container>

              <!-- Actions column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let element">
                  <button mat-icon-button matTooltip="Contact" color="primary">
                    <mat-icon>mail</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Update Status" color="accent">
                    <mat-icon>update</mat-icon>
                  </button>
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
    .stat-card mat-icon.pending { color: #f44336; }
    .stat-card mat-icon.progress { color: #ff9800; }
    .stat-card mat-icon.completed { color: #4caf50; }
    .stat-number { font-size: 28px; font-weight: bold; color: #333; margin-bottom: 8px; }
    .stat-label { font-size: 12px; color: #999; }
    .table-wrapper { overflow-x: auto; }
    .requests-table { width: 100%; border-collapse: collapse; }
    .requests-table th { background-color: #f5f5f5; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e0e0e0; }
    .requests-table td { padding: 12px; border-bottom: 1px solid #f0f0f0; }
    .requests-table tr:hover { background-color: #fafafa; }
    .type-growth { color: #2196f3; font-weight: 500; }
    .type-monetization { color: #4caf50; font-weight: 500; }
    .type-technical { color: #ff9800; font-weight: 500; }
    .type-other { color: #999; font-weight: 500; }
    .urgency-urgent { color: #f44336; font-weight: bold; }
    .urgency-normal { color: #2196f3; font-weight: 500; }
    .urgency-low { color: #4caf50; font-weight: 500; }
    .status-pending { color: #f44336; font-weight: bold; }
    .status-in-progress { color: #ff9800; font-weight: 500; }
    .status-completed { color: #4caf50; font-weight: 500; }
  `]
})
export class CreatorSupportComponent implements OnInit {
  displayedColumns: string[] = ['creator', 'channelName', 'request', 'type', 'urgency', 'status', 'actions'];
  requests: CreatorRequest[] = [];
  pendingRequests: number = 0;
  inProgressRequests: number = 0;
  completedRequests: number = 0;

  ngOnInit(): void {
    this.loadRequests();
    this.calculateStats();
  }

  private loadRequests(): void {
    this.requests = [
      {
        id: '1',
        creator: 'creator1@example.com',
        channelName: 'Fashion Vibe',
        request: 'Help with content moderation guidelines',
        type: 'technical',
        urgency: 'normal',
        status: 'pending',
        dateSubmitted: '2026-03-07'
      },
      {
        id: '2',
        creator: 'creator2@example.com',
        channelName: 'Style Master',
        request: 'Monetization threshold inquiry',
        type: 'monetization',
        urgency: 'urgent',
        status: 'in-progress',
        dateSubmitted: '2026-03-07'
      },
      {
        id: '3',
        creator: 'creator3@example.com',
        channelName: 'Trend Setter',
        request: 'Channel growth strategies',
        type: 'growth',
        urgency: 'normal',
        status: 'completed',
        dateSubmitted: '2026-03-05'
      },
      {
        id: '4',
        creator: 'creator4@example.com',
        channelName: 'Fashion Forward',
        request: 'Collaboration opportunities',
        type: 'other',
        urgency: 'low',
        status: 'pending',
        dateSubmitted: '2026-03-06'
      },
      {
        id: '5',
        creator: 'creator5@example.com',
        channelName: 'Influencer Pro',
        request: 'Analytics dashboard access',
        type: 'technical',
        urgency: 'urgent',
        status: 'in-progress',
        dateSubmitted: '2026-03-07'
      }
    ];
  }

  private calculateStats(): void {
    this.pendingRequests = this.requests.filter(r => r.status === 'pending').length;
    this.inProgressRequests = this.requests.filter(r => r.status === 'in-progress').length;
    this.completedRequests = this.requests.filter(r => r.status === 'completed').length;
  }
}
