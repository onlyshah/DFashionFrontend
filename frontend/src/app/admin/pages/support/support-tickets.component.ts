import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-support-tickets',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Support Tickets</h1>
        <p>Track and manage support requests</p>
      </div>
      <mat-card>
        <mat-card-content>
          <div class="empty-state">
            <mat-icon>confirmation_number</mat-icon>
            <p>Support Tickets</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`.page-container { padding: 24px; } .page-header { margin-bottom: 24px; } .page-header h1 { margin: 0 0 8px 0; font-size: 28px; font-weight: 500; } .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; }`]
})
export class SupportTicketsComponent {}
