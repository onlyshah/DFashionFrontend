import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-wallet-cod',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Wallet & COD Management</h1>
        <p>Manage wallet balances and cash on delivery orders</p>
      </div>

      <mat-card class="content-card">
        <mat-card-content>
          <div class="empty-state">
            <mat-icon>account_balance_wallet</mat-icon>
            <p>Wallet & COD</p>
            <p class="subtitle">Manage customer wallets and COD payment tracking</p>
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
export class WalletCodComponent implements OnInit {
  ngOnInit() {
    // TODO: Load wallet and COD data
  }
}
