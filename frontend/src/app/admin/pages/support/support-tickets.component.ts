import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';

interface SupportTicket {
  id: string;
  ticketNo: string;
  subject: string;
  customer: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdDate: string;
  lastUpdate: string;
}

@Component({
  selector: 'app-support-tickets',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatChipsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Support Tickets</h1>
        <p>Track and manage support requests</p>
        <button mat-raised-button color="primary" class="new-ticket-btn">+ New Ticket</button>
      </div>
      <mat-card>
        <mat-card-header>
          <mat-card-title>All Support Tickets</mat-card-title>
          <mat-card-subtitle>{{ tickets.length }} total tickets</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="table-wrapper">
            <table mat-table [dataSource]="tickets" class="tickets-table">
              <!-- Ticket No column -->
              <ng-container matColumnDef="ticketNo">
                <th mat-header-cell *matHeaderCellDef>Ticket #</th>
                <td mat-cell *matCellDef="let element">{{ element.ticketNo }}</td>
              </ng-container>

              <!-- Subject column -->
              <ng-container matColumnDef="subject">
                <th mat-header-cell *matHeaderCellDef>Subject</th>
                <td mat-cell *matCellDef="let element">{{ element.subject }}</td>
              </ng-container>

              <!-- Customer column -->
              <ng-container matColumnDef="customer">
                <th mat-header-cell *matHeaderCellDef>Customer</th>
                <td mat-cell *matCellDef="let element">{{ element.customer }}</td>
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
                  <button mat-icon-button matTooltip="View" color="primary">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Edit" color="accent">
                    <mat-icon>edit</mat-icon>
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
    .page-header { margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
    .page-header h1 { margin: 0 0 8px 0; font-size: 28px; font-weight: 500; }
    .page-header p { margin: 0; color: #666; }
    .new-ticket-btn { margin-top: 8px; }
    .table-wrapper { overflow-x: auto; }
    .tickets-table { width: 100%; border-collapse: collapse; }
    .tickets-table th { background-color: #f5f5f5; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e0e0e0; }
    .tickets-table td { padding: 12px; border-bottom: 1px solid #f0f0f0; }
    .tickets-table tr:hover { background-color: #fafafa; }
    .priority-critical { color: #f44336; font-weight: bold; }
    .priority-high { color: #ff9800; font-weight: bold; }
    .priority-medium { color: #2196f3; font-weight: 500; }
    .priority-low { color: #4caf50; font-weight: 500; }
    .status-open { color: #2196f3; font-weight: 500; }
    .status-in-progress { color: #ff9800; font-weight: 500; }
    .status-resolved { color: #4caf50; font-weight: 500; }
    .status-closed { color: #999; font-weight: 500; }
  `]
})
export class SupportTicketsComponent implements OnInit {
  displayedColumns: string[] = ['ticketNo', 'subject', 'customer', 'priority', 'status', 'actions'];
  tickets: SupportTicket[] = [];

  ngOnInit(): void {
    this.loadTickets();
  }

  private loadTickets(): void {
    this.tickets = [
      {
        id: '1',
        ticketNo: '#TK001',
        subject: 'Order not received',
        customer: 'customer1@example.com',
        priority: 'high',
        status: 'in-progress',
        createdDate: '2026-03-07',
        lastUpdate: '2026-03-07'
      },
      {
        id: '2',
        ticketNo: '#TK002',
        subject: 'Payment issue',
        customer: 'customer2@example.com',
        priority: 'critical',
        status: 'open',
        createdDate: '2026-03-07',
        lastUpdate: '2026-03-07'
      },
      {
        id: '3',
        ticketNo: '#TK003',
        subject: 'Product defective',
        customer: 'john.doe@example.com',
        priority: 'high',
        status: 'open',
        createdDate: '2026-03-06',
        lastUpdate: '2026-03-07'
      },
      {
        id: '4',
        ticketNo: '#TK004',
        subject: 'Account access issue',
        customer: 'jane.smith@example.com',
        priority: 'medium',
        status: 'resolved',
        createdDate: '2026-03-05',
        lastUpdate: '2026-03-07'
      },
      {
        id: '5',
        ticketNo: '#TK005',
        subject: 'Refund requested',
        customer: 'buyer@example.com',
        priority: 'medium',
        status: 'closed',
        createdDate: '2026-03-01',
        lastUpdate: '2026-03-05'
      }
    ];
  }
}
