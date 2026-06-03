import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vendor-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="vendor-dashboard-panel">
      <div class="panel-header">
        <h2>Vendor Dashboard</h2>
        <p>Manage your products, orders, and sales performance</p>
      </div>
      <div class="panel-content">
        <div class="metrics-grid">
          <div class="metric-card">
            <h3>Total Sales</h3>
            <p>₹ 0</p>
          </div>
          <div class="metric-card">
            <h3>Products Listed</h3>
            <p>0</p>
          </div>
          <div class="metric-card">
            <h3>Pending Orders</h3>
            <p>0</p>
          </div>
          <div class="metric-card">
            <h3>Rating</h3>
            <p>0/5</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .vendor-dashboard-panel {
      padding: 20px;
    }
    .panel-header h2 {
      margin: 0 0 10px 0;
    }
    .panel-header p {
      color: #666;
      margin: 0;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 30px;
    }
    .metric-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      background: #f9f9f9;
    }
    .metric-card h3 {
      margin: 0 0 10px 0;
      font-size: 16px;
    }
    .metric-card p {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
    }
  `]
})
export class VendorPanelComponent {}
