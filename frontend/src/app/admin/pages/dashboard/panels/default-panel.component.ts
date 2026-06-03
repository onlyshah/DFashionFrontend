import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-default-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="default-dashboard-panel">
      <div class="panel-header">
        <h2>Dashboard</h2>
        <p>Welcome to DFashion</p>
      </div>
      <div class="panel-content">
        <div class="message">
          <p>Your dashboard is loading...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .default-dashboard-panel {
      padding: 20px;
    }
    .panel-header h2 {
      margin: 0 0 10px 0;
    }
    .panel-header p {
      color: #666;
      margin: 0;
    }
    .message {
      margin-top: 30px;
      padding: 20px;
      background: #f0f0f0;
      border-radius: 8px;
      text-align: center;
    }
  `]
})
export class DefaultPanelComponent {}
