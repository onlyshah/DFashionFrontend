import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-influencer-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="influencer-dashboard-panel">
      <div class="panel-header">
        <h2>Creator Dashboard</h2>
        <p>Manage your collaborations, earnings, and follower engagement</p>
      </div>
      <div class="panel-content">
        <div class="metrics-grid">
          <div class="metric-card">
            <h3>Total Followers</h3>
            <p>0</p>
          </div>
          <div class="metric-card">
            <h3>Earnings</h3>
            <p>₹ 0</p>
          </div>
          <div class="metric-card">
            <h3>Collaborations</h3>
            <p>0</p>
          </div>
          <div class="metric-card">
            <h3>Engagement Rate</h3>
            <p>0%</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .influencer-dashboard-panel {
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
export class InfluencerPanelComponent {}
