import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  template: `
    <div class="stat-card">
      <div class="stat-header">
        <p class="stat-title">{{ title }}</p>
        <span class="stat-change" [class.positive]="change > 0" [class.negative]="change < 0">
          {{ change }}%
          <i class="typcn" [class.typcn-arrow-up-thick]="change > 0" [class.typcn-arrow-down-thick]="change < 0"></i>
        </span>
      </div>
      <h3 class="stat-value">{{ value }}</h3>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .stat-card {
      background: #fff;
      border-radius: var(--border-radius, 8px);
      padding: var(--card-padding, 25px);
      box-shadow: var(--shadow-sm);
    }
    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .stat-title {
      color: var(--text-muted);
      margin: 0;
    }
    .stat-change {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.875rem;
    }
    .stat-change.positive { color: var(--success-color); }
    .stat-change.negative { color: var(--danger-color); }
    .stat-value {
      font-size: 1.75rem;
      font-weight: 600;
      margin: 0 0 1rem;
    }
  `]
})
export class StatCardComponent {
  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() change: number = 0;
}