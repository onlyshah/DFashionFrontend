import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

interface ContentToModerate {
  id: string;
  user: string;
  contentType: string;
  content: string;
  riskLevel: 'high' | 'medium' | 'low';
  reason: string;
  submittedDate: string;
}

@Component({
  selector: 'app-content-moderation',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Content Moderation</h1>
        <p>Manage AI-assisted content moderation</p>
      </div>
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-number">{{ pendingReview }}</div>
            <div class="stat-label">Pending Review</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-number">{{ highRisk }}</div>
            <div class="stat-label">High Risk</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-number">{{ moderationAccuracy }}%</div>
            <div class="stat-label">AI Accuracy</div>
          </mat-card-content>
        </mat-card>
      </div>
      <mat-card>
        <mat-card-header>
          <mat-card-title>Content Review Queue</mat-card-title>
          <mat-card-subtitle>{{ contentItems.length }} items flagged by AI</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="table-wrapper">
            <table mat-table [dataSource]="contentItems" class="content-table">
              <!-- User column -->
              <ng-container matColumnDef="user">
                <th mat-header-cell *matHeaderCellDef>User</th>
                <td mat-cell *matCellDef="let element">{{ element.user }}</td>
              </ng-container>

              <!-- Type column -->
              <ng-container matColumnDef="contentType">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let element">{{ element.contentType }}</td>
              </ng-container>

              <!-- Content column -->
              <ng-container matColumnDef="content">
                <th mat-header-cell *matHeaderCellDef>Content Preview</th>
                <td mat-cell *matCellDef="let element">{{ element.content | slice:0:50 }}...</td>
              </ng-container>

              <!-- Risk Level column -->
              <ng-container matColumnDef="riskLevel">
                <th mat-header-cell *matHeaderCellDef>Risk Level</th>
                <td mat-cell *matCellDef="let element">
                  <span [class]="'risk-' + element.riskLevel">{{ element.riskLevel }}</span>
                </td>
              </ng-container>

              <!-- Reason column -->
              <ng-container matColumnDef="reason">
                <th mat-header-cell *matHeaderCellDef>Flagged Reason</th>
                <td mat-cell *matCellDef="let element">{{ element.reason }}</td>
              </ng-container>

              <!-- Actions column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let element">
                  <button mat-icon-button matTooltip="Approve" color="primary">
                    <mat-icon>check</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Reject" color="warn">
                    <mat-icon>close</mat-icon>
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
    .stat-number { font-size: 32px; font-weight: bold; color: #1976d2; margin: 16px 0 8px 0; }
    .stat-label { font-size: 14px; color: #666; }
    .table-wrapper { overflow-x: auto; }
    .content-table { width: 100%; border-collapse: collapse; }
    .content-table th { background-color: #f5f5f5; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e0e0e0; }
    .content-table td { padding: 12px; border-bottom: 1px solid #f0f0f0; }
    .content-table tr:hover { background-color: #fafafa; }
    .risk-high { color: #f44336; font-weight: bold; }
    .risk-medium { color: #ff9800; font-weight: bold; }
    .risk-low { color: #2196f3; font-weight: 500; }
  `]
})
export class ContentModerationComponent implements OnInit {
  displayedColumns: string[] = ['user', 'contentType', 'content', 'riskLevel', 'reason', 'actions'];
  contentItems: ContentToModerate[] = [];
  pendingReview: number = 0;
  highRisk: number = 0;
  moderationAccuracy: number = 92;

  ngOnInit(): void {
    this.loadContent();
    this.calculateStats();
  }

  private loadContent(): void {
    this.contentItems = [
      { id: '1', user: 'user123@example.com', contentType: 'Comment', content: 'This product is amazing! Best purchase ever...', riskLevel: 'low', reason: 'None', submittedDate: '2026-03-07' },
      { id: '2', user: 'user456@example.com', contentType: 'Review', content: 'Contains potentially offensive language...', riskLevel: 'high', reason: 'Hate Speech Detected', submittedDate: '2026-03-07' },
      { id: '3', user: 'user789@example.com', contentType: 'Post', content: 'Check out this deal for cheap items...', riskLevel: 'medium', reason: 'Spam Keywords Detected', submittedDate: '2026-03-07' },
      { id: '4', user: 'user101@example.com', contentType: 'Comment', content: 'Great quality and fast shipping!...', riskLevel: 'low', reason: 'None', submittedDate: '2026-03-06' },
      { id: '5', user: 'user202@example.com', contentType: 'Review', content: 'Buy now before stock runs out immediately...', riskLevel: 'medium', reason: 'Urgency Tactic Detected', submittedDate: '2026-03-06' }
    ];
  }

  private calculateStats(): void {
    this.pendingReview = this.contentItems.length;
    this.highRisk = this.contentItems.filter(c => c.riskLevel === 'high').length;
  }
}
