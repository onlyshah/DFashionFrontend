import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

interface ActiveSession {
  id: string;
  user: string;
  device: string;
  ipAddress: string;
  loginTime: string;
  lastActivity: string;
  status: 'active' | 'idle';
}

@Component({
  selector: 'app-session-management',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Session Management</h1>
        <p>Monitor and manage active user sessions</p>
      </div>
      <mat-card>
        <mat-card-header>
          <mat-card-title>Active Sessions</mat-card-title>
          <mat-card-subtitle>Currently logged-in users</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="table-wrapper">
            <table mat-table [dataSource]="activeSessions" class="sessions-table">
              <!-- User column -->
              <ng-container matColumnDef="user">
                <th mat-header-cell *matHeaderCellDef>User</th>
                <td mat-cell *matCellDef="let element">{{ element.user }}</td>
              </ng-container>

              <!-- Device column -->
              <ng-container matColumnDef="device">
                <th mat-header-cell *matHeaderCellDef>Device</th>
                <td mat-cell *matCellDef="let element">{{ element.device }}</td>
              </ng-container>

              <!-- IP Address column -->
              <ng-container matColumnDef="ipAddress">
                <th mat-header-cell *matHeaderCellDef>IP Address</th>
                <td mat-cell *matCellDef="let element">{{ element.ipAddress }}</td>
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
                  <button mat-icon-button matTooltip="Terminate Session" color="warn">
                    <mat-icon>logout</mat-icon>
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
    .sessions-table {
      width: 100%;
      border-collapse: collapse;
    }
    .sessions-table th {
      background-color: #f5f5f5;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #e0e0e0;
    }
    .sessions-table td {
      padding: 12px;
      border-bottom: 1px solid #f0f0f0;
    }
    .sessions-table tr:hover {
      background-color: #fafafa;
    }
    .status-active { color: #4caf50; font-weight: 500; }
    .status-idle { color: #ff9800; font-weight: 500; }
  `]
})
export class SessionManagementComponent implements OnInit {
  displayedColumns: string[] = ['user', 'device', 'ipAddress', 'status', 'actions'];
  activeSessions: ActiveSession[] = [];

  ngOnInit(): void {
    this.loadActiveSessions();
  }

  private loadActiveSessions(): void {
    // Sample active sessions - replace with API call when backend is ready
    this.activeSessions = [
      {
        id: '1',
        user: 'admin@example.com',
        device: 'Chrome on Windows',
        ipAddress: '192.168.1.100',
        loginTime: '2026-03-07 18:45:30',
        lastActivity: '2026-03-07 18:50:15',
        status: 'active'
      },
      {
        id: '2',
        user: 'admin1@example.com',
        device: 'Safari on Mac',
        ipAddress: '192.168.1.101',
        loginTime: '2026-03-07 17:30:00',
        lastActivity: '2026-03-07 18:20:45',
        status: 'active'
      },
      {
        id: '3',
        user: 'superadmin@example.com',
        device: 'Firefox on Linux',
        ipAddress: '192.168.1.102',
        loginTime: '2026-03-07 08:00:00',
        lastActivity: '2026-03-07 09:15:30',
        status: 'idle'
      }
    ];
  }
}
