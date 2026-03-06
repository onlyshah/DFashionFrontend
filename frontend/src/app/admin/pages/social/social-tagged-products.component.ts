import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-social-tagged-products',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatProgressSpinnerModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Tagged Products</h1>
        <p>Manage products tagged in social content</p>
      </div>
      <mat-card *ngIf="loading" class="loading-card">
        <mat-spinner></mat-spinner>
      </mat-card>
      <mat-card *ngIf="!loading && products.length > 0">
        <mat-card-content>
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Mentions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let product of products">
                <td>{{ product.name }}</td>
                <td>{{ product.sku }}</td>
                <td>{{ product.price }}</td>
                <td>{{ product.mentions }}</td>
              </tr>
            </tbody>
          </table>
        </mat-card-content>
      </mat-card>
      <mat-card *ngIf="!loading && products.length === 0">
        <mat-card-content>
          <div class="empty-state">
            <mat-icon>local_offer</mat-icon>
            <p>No Tagged Products Found</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`.page-container { padding: 24px; } .page-header { margin-bottom: 24px; } .page-header h1 { margin: 0 0 8px 0; font-size: 28px; font-weight: 500; } .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; } table { width: 100%; border-collapse: collapse; } th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; } .loading-card { display: flex; justify-content: center; padding: 40px; }`]
})
export class SocialTaggedProductsComponent implements OnInit {
  products: any[] = [];
  loading = true;

  constructor(private api: AdminApiService) {}

  ngOnInit(): void {
    this.loadTaggedProducts();
  }

  loadTaggedProducts(): void {
    this.loading = true;
    console.log('📡 [Tagged Products] Calling GET /api/admin/social/tagged');
    this.api.get('/social/tagged', { params: { page: 1, limit: 20 } }).subscribe({
      next: (res: any) => {
        console.log('✅ [Tagged Products] Full API Response:', res);
        console.log('✅ [Tagged Products] Data:', res?.data);
        this.products = res?.data || [];
        console.log('✅ [Tagged Products] Loaded', this.products.length, 'products');
        this.loading = false;
      },
      error: (err: any) => {
        console.error('❌ [Tagged Products] Error:', err);
        this.products = [];
        this.loading = false;
      }
    });
  }
}
