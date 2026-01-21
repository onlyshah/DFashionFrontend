import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-refund-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Refund Management</h1>
        <p>Process and track refunds</p>
      </div>

      <mat-card class="content-card">
        <mat-card-content>
          <div class="empty-state">
            <mat-icon>undo</mat-icon>
            <p>Refund Management</p>
            <p class="subtitle">Process customer refunds and manage refund status</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { margin: 0 0 8px 0; font-size: 28px; font-weight: 500; }
    .page-header p { margin: 0; color: rgba(0, 0, 0, 0.6); font-size: 14px; }
    .content-card { margin-top: 24px; }
    .empty-state { 
      display: flex; flex-direction: column; align-items: center; 
      justify-content: center; padding: 60px 20px; color: rgba(0, 0, 0, 0.4); 
    }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 16px; }
    .empty-state p { margin: 0; font-size: 16px; }
    .subtitle { font-size: 14px; margin-top: 8px; }
  `]
})
export class RefundManagementComponent implements OnInit {
  ngOnInit() {
    // TODO: Load refunds
  }
}
