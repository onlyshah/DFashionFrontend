import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="user-dashboard-panel">
      <div class="panel-header">
        <h2>Your Dashboard</h2>
        <p>View your orders, wishlist, and account settings</p>
      </div>
      <div class="panel-content">
        <div class="metrics-grid">
          <div class="metric-card">
            <h3>Total Orders</h3>
            <p>0</p>
          </div>
          <div class="metric-card">
            <h3>Wishlist Items</h3>
            <p>0</p>
          </div>
          <div class="metric-card">
            <h3>Pending Orders</h3>
            <p>0</p>
          </div>
          <div class="metric-card">
            <h3>Spent</h3>
            <p>₹ 0</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-dashboard-panel {
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
export class UserPanelComponent {}
