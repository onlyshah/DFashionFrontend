import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

interface CustomerQuery {
  id: string;
  customer: string;
  email: string;
  subject: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'new' | 'replied' | 'resolved';
  createdDate: string;
}

@Component({
  selector: 'app-customer-support',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Customer Support</h1>
        <p>Manage customer inquiries and issues</p>
      </div>
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-number">{{ newQueries }}</div>
            <div class="stat-label">New Queries</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-number">{{ repliedQueries }}</div>
            <div class="stat-label">Replied</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-number">{{ resolvedQueries }}</div>
            <div class="stat-label">Resolved</div>
          </mat-card-content>
        </mat-card>
      </div>
      <mat-card>
        <mat-card-header>
          <mat-card-title>Customer Inquiries</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="table-wrapper">
            <table mat-table [dataSource]="queries" class="queries-table">
              <!-- Customer column -->
              <ng-container matColumnDef="customer">
                <th mat-header-cell *matHeaderCellDef>Customer</th>
                <td mat-cell *matCellDef="let element">{{ element.customer }}</td>
              </ng-container>

              <!-- Subject column -->
              <ng-container matColumnDef="subject">
                <th mat-header-cell *matHeaderCellDef>Subject</th>
                <td mat-cell *matCellDef="let element">{{ element.subject }}</td>
              </ng-container>

              <!-- Category column -->
              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef>Category</th>
                <td mat-cell *matCellDef="let element">{{ element.category }}</td>
              </ng-container>

              <!-- Priority column -->
              <ng-container matColumnDef="priority">
                <th mat-header-cell *matHeaderCellDef>Priority</th>
                <td mat-cell *matCellDef="let element">
                  <span [class]="'priority-' + element.priority">{{ element.priority }}</span>
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
                  <button mat-icon-button matTooltip="Reply" color="primary">
                    <mat-icon>reply</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Mark Resolved">
                    <mat-icon>check_circle</mat-icon>
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
    .queries-table { width: 100%; border-collapse: collapse; }
    .queries-table th { background-color: #f5f5f5; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e0e0e0; }
    .queries-table td { padding: 12px; border-bottom: 1px solid #f0f0f0; }
    .queries-table tr:hover { background-color: #fafafa; }
    .priority-high { color: #ff9800; font-weight: bold; }
    .priority-medium { color: #2196f3; font-weight: 500; }
    .priority-low { color: #4caf50; font-weight: 500; }
    .status-new { color: #f44336; font-weight: bold; }
    .status-replied { color: #2196f3; font-weight: 500; }
    .status-resolved { color: #4caf50; font-weight: 500; }
  `]
})
export class CustomerSupportComponent implements OnInit {
  displayedColumns: string[] = ['customer', 'subject', 'category', 'priority', 'status', 'actions'];
  queries: CustomerQuery[] = [];
  newQueries: number = 0;
  repliedQueries: number = 0;
  resolvedQueries: number = 0;

  ngOnInit(): void {
    this.loadQueries();
    this.calculateStats();
  }

  private loadQueries(): void {
    this.queries = [
      {
        id: '1',
        customer: 'John Doe',
        email: 'john@example.com',
        subject: 'How to use promo codes?',
        category: 'Billing',
        priority: 'low',
        status: 'new',
        createdDate: '2026-03-07'
      },
      {
        id: '2',
        customer: 'Jane Smith',
        email: 'jane@example.com',
        subject: 'Product quality concern',
        category: 'Product',
        priority: 'high',
        status: 'replied',
        createdDate: '2026-03-06'
      },
      {
        id: '3',
        customer: 'Mike Johnson',
        email: 'mike@example.com',
        subject: 'Shipping delay',
        category: 'Shipping',
        priority: 'medium',
        status: 'resolved',
        createdDate: '2026-03-05'
      },
      {
        id: '4',
        customer: 'Alice Brown',
        email: 'alice@example.com',
        subject: 'Account verification',
        category: 'Account',
        priority: 'high',
        status: 'new',
        createdDate: '2026-03-07'
      },
      {
        id: '5',
        customer: 'Bob Wilson',
        email: 'bob@example.com',
        subject: 'Refund status inquiry',
        category: 'Refund',
        priority: 'medium',
        status: 'replied',
        createdDate: '2026-03-04'
      }
    ];
  }

  private calculateStats(): void {
    this.newQueries = this.queries.filter(q => q.status === 'new').length;
    this.repliedQueries = this.queries.filter(q => q.status === 'replied').length;
    this.resolvedQueries = this.queries.filter(q => q.status === 'resolved').length;
  }
}
