import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

interface SellerIssue {
  id: string;
  seller: string;
  storeName: string;
  issue: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'resolved';
  reportedDate: string;
}

@Component({
  selector: 'app-seller-support',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Seller Support</h1>
        <p>Assist sellers with platform issues</p>
      </div>
      <mat-card>
        <mat-card-header>
          <mat-card-title>Seller Issues & Requests</mat-card-title>
          <mat-card-subtitle>{{ issues.length }} total requests</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="table-wrapper">
            <table mat-table [dataSource]="issues" class="issues-table">
              <!-- Seller column -->
              <ng-container matColumnDef="seller">
                <th mat-header-cell *matHeaderCellDef>Seller</th>
                <td mat-cell *matCellDef="let element">{{ element.seller }}</td>
              </ng-container>

              <!-- Store Name column -->
              <ng-container matColumnDef="storeName">
                <th mat-header-cell *matHeaderCellDef>Store Name</th>
                <td mat-cell *matCellDef="let element">{{ element.storeName }}</td>
              </ng-container>

              <!-- Issue column -->
              <ng-container matColumnDef="issue">
                <th mat-header-cell *matHeaderCellDef>Issue</th>
                <td mat-cell *matCellDef="let element">{{ element.issue }}</td>
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
                  <button mat-icon-button matTooltip="Assign" color="primary">
                    <mat-icon>assignment</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Resolve" color="accent">
                    <mat-icon>done</mat-icon>
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
    .table-wrapper { overflow-x: auto; }
    .issues-table { width: 100%; border-collapse: collapse; }
    .issues-table th { background-color: #f5f5f5; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e0e0e0; }
    .issues-table td { padding: 12px; border-bottom: 1px solid #f0f0f0; }
    .issues-table tr:hover { background-color: #fafafa; }
    .priority-high { color: #f44336; font-weight: bold; }
    .priority-medium { color: #ff9800; font-weight: 500; }
    .priority-low { color: #4caf50; font-weight: 500; }
    .status-pending { color: #f44336; font-weight: bold; }
    .status-in-progress { color: #ff9800; font-weight: 500; }
    .status-resolved { color: #4caf50; font-weight: 500; }
  `]
})
export class SellerSupportComponent implements OnInit {
  displayedColumns: string[] = ['seller', 'storeName', 'issue', 'category', 'priority', 'status', 'actions'];
  issues: SellerIssue[] = [];

  ngOnInit(): void {
    this.loadIssues();
  }

  private loadIssues(): void {
    this.issues = [
      {
        id: '1',
        seller: 'seller1@example.com',
        storeName: 'Fashion Hub',
        issue: 'Unable to update inventory',
        category: 'Technical',
        priority: 'high',
        status: 'pending',
        reportedDate: '2026-03-07'
      },
      {
        id: '2',
        seller: 'seller2@example.com',
        storeName: 'Trendy Wear',
        issue: 'Payment settlement delayed',
        category: 'Billing',
        priority: 'high',
        status: 'in-progress',
        reportedDate: '2026-03-06'
      },
      {
        id: '3',
        seller: 'seller3@example.com',
        storeName: 'Clothe Zone',
        issue: 'Product listing issue',
        category: 'Product',
        priority: 'medium',
        status: 'resolved',
        reportedDate: '2026-03-05'
      },
      {
        id: '4',
        seller: 'seller4@example.com',
        storeName: 'Fashion First',
        issue: 'Discount code not working',
        category: 'Marketing',
        priority: 'medium',
        status: 'resolved',
        reportedDate: '2026-03-04'
      },
      {
        id: '5',
        seller: 'seller5@example.com',
        storeName: 'Style Shop',
        issue: 'Order fulfillment question',
        category: 'Operations',
        priority: 'low',
        status: 'pending',
        reportedDate: '2026-03-07'
      }
    ];
  }
}
