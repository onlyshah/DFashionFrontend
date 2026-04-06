import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';

interface AuditLog {
  id: string;
  user: string;
  action: string;
  resource: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

@Component({
  selector: 'app-security-audit-logs',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatPaginatorModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Audit Logs</h1>
        <p>Review system activities and changes</p>
      </div>
      <mat-card>
        <mat-card-header>
          <mat-card-title>System Activity Log</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="table-wrapper">
            <table mat-table [dataSource]="auditLogs" class="audit-table">
              <!-- User column -->
              <ng-container matColumnDef="user">
                <th mat-header-cell *matHeaderCellDef>User</th>
                <td mat-cell *matCellDef="let element">{{ element.user }}</td>
              </ng-container>

              <!-- Action column -->
              <ng-container matColumnDef="action">
                <th mat-header-cell *matHeaderCellDef>Action</th>
                <td mat-cell *matCellDef="let element">{{ element.action }}</td>
              </ng-container>

              <!-- Resource column -->
              <ng-container matColumnDef="resource">
                <th mat-header-cell *matHeaderCellDef>Resource</th>
                <td mat-cell *matCellDef="let element">{{ element.resource }}</td>
              </ng-container>

              <!-- Timestamp column -->
              <ng-container matColumnDef="timestamp">
                <th mat-header-cell *matHeaderCellDef>Timestamp</th>
                <td mat-cell *matCellDef="let element">{{ element.timestamp }}</td>
              </ng-container>

              <!-- Status column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let element">
                  <span [class]="'status-' + element.status">{{ element.status }}</span>
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
    .audit-table {
      width: 100%;
      border-collapse: collapse;
    }
    .audit-table th {
      background-color: #f5f5f5;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #e0e0e0;
    }
    .audit-table td {
      padding: 12px;
      border-bottom: 1px solid #f0f0f0;
    }
    .audit-table tr:hover {
      background-color: #fafafa;
    }
    .status-success { color: #4caf50; font-weight: 500; }
    .status-warning { color: #ff9800; font-weight: 500; }
    .status-error { color: #f44336; font-weight: 500; }
  `]
})
export class AuditLogsComponent implements OnInit {
  displayedColumns: string[] = ['user', 'action', 'resource', 'timestamp', 'status'];
  auditLogs: AuditLog[] = [];

  ngOnInit(): void {
    this.loadAuditLogs();
  }

  private loadAuditLogs(): void {
    // Sample audit logs - replace with API call when backend is ready
    this.auditLogs = [
      {
        id: '1',
        user: 'admin@example.com',
        action: 'LOGIN',
        resource: 'Authentication',
        timestamp: '2026-03-07 18:45:30',
        status: 'success'
      },
      {
        id: '2',
        user: 'admin1@example.com',
        action: 'UPDATE',
        resource: 'Product #123',
        timestamp: '2026-03-07 18:30:15',
        status: 'success'
      },
      {
        id: '3',
        user: 'admin@example.com',
        action: 'DELETE',
        resource: 'User Account',
        timestamp: '2026-03-07 17:20:45',
        status: 'warning'
      },
      {
        id: '4',
        user: 'superadmin@example.com',
        action: 'ROLE_CHANGE',
        resource: 'User Permission',
        timestamp: '2026-03-07 16:15:30',
        status: 'success'
      },
      {
        id: '5',
        user: 'unknown',
        action: 'FAILED_LOGIN',
        resource: 'Authentication',
        timestamp: '2026-03-07 15:45:00',
        status: 'error'
      }
    ];
  }
}
