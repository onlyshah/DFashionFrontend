import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Invoices</h1>
        <p>Generate and manage order invoices</p>
      </div>
      <mat-card class="content-card">
        <mat-card-content>
          <div *ngIf="invoices.length === 0" class="empty-state">
            <mat-icon>description</mat-icon>
            <p>No Invoices</p>
            <p class="subtitle" *ngIf="!isLoading">View and download order invoices for customers</p>
            <p class="subtitle" *ngIf="isLoading">Loading invoices...</p>
          </div>
          <div *ngIf="invoices.length > 0" class="invoice-list">
            <table mat-table [dataSource]="invoices" class="table">
              <ng-container matColumnDef="invoiceNumber">
                <th mat-header-cell *matHeaderCellDef>Invoice #</th>
                <td mat-cell *matCellDef="let element">{{ element.invoiceNumber }}</td>
              </ng-container>
              <ng-container matColumnDef="customerName">
                <th mat-header-cell *matHeaderCellDef>Customer</th>
                <td mat-cell *matCellDef="let element">{{ element.customerName }}</td>
              </ng-container>
              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Amount</th>
                <td mat-cell *matCellDef="let element">{{ element.amount | currency }}</td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let element">
                  <span class="status-badge" [ngClass]="'status-' + element.status">{{ element.status }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let element">{{ element.createdAt | date: 'short' }}</td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let element">
                  <button mat-icon-button matTooltip="Download"><mat-icon>download</mat-icon></button>
                  <button mat-icon-button matTooltip="View"><mat-icon>visibility</mat-icon></button>
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
    .page-header p { margin: 0; color: rgba(0, 0, 0, 0.6); font-size: 14px; }
    .content-card { margin-top: 24px; }
    .empty-state { 
      display: flex; flex-direction: column; align-items: center; 
      justify-content: center; padding: 60px 20px; color: rgba(0, 0, 0, 0.4); 
    }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 16px; }
    .empty-state p { margin: 0; font-size: 16px; }
    .subtitle { font-size: 14px; margin-top: 8px; }
    .table { width: 100%; }
    .status-badge { 
      padding: 4px 8px; border-radius: 4px; font-size: 12px; 
      font-weight: 500; text-transform: capitalize;
    }
    .status-pending { background: #fff3cd; color: #856404; }
    .status-completed { background: #d4edda; color: #155724; }
    .status-shipped { background: #d1ecf1; color: #0c5460; }
    .status-cancelled { background: #f8d7da; color: #721c24; }
  `]
})
export class InvoicesComponent implements OnInit {
  invoices: any[] = [];
  isLoading = true;
  displayedColumns = ['invoiceNumber', 'customerName', 'amount', 'status', 'createdAt', 'actions'];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    console.log('🔄 [Invoices] Fetching invoices from API - /api/admin/invoices');
    this.isLoading = true;
    this.http.get<any>('/api/admin/invoices').subscribe({
      next: (response) => {
        console.log('✅ [Invoices] Full API Response:', response);
        console.log('✅ [Invoices] Response success:', response?.success);
        console.log('✅ [Invoices] Response data:', response?.data);
        console.log('✅ [Invoices] Invoices array (data.invoices):', response?.data?.invoices);
        console.log('✅ [Invoices] Invoices array length:', response?.data?.invoices?.length);
        console.log('✅ [Invoices] Pagination:', response?.data?.pagination || response?.pagination);
        
        this.invoices = response.data?.invoices || [];
        console.log('✅ [Invoices] Assigned invoices count:', this.invoices.length);
        console.log('✅ [Invoices] Sample invoice:', this.invoices[0]);
        
        this.isLoading = false;
        console.log('✅ [Invoices] UI should now display', this.invoices.length, 'invoices');
      },
      error: (err) => {
        console.error('❌ [Invoices] API Error:', err);
        console.error('❌ [Invoices] Error message:', err?.message);
        console.error('❌ [Invoices] Error status:', err?.status);
        console.error('❌ [Invoices] Full error object:', err);
        this.invoices = [];
        this.isLoading = false;
      }
    });
  }
}

