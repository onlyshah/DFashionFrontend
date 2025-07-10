import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stats-card',
  templateUrl: './stats-card.component.html',
  styleUrls: ['./stats-card.component.scss']
})
export class StatsCardComponent {
  @Input() title: string = '';
  @Input() value: string = '';
  @Input() growth: number = 0;
  @Input() icon: string = '';
  @Input() color: 'primary' | 'success' | 'info' | 'warning' | 'danger' = 'primary';
  @Input() isLoading: boolean = false;

  get isPositiveGrowth(): boolean {
    return this.growth > 0;
  }

  get isNegativeGrowth(): boolean {
    return this.growth < 0;
  }

  get growthIcon(): string {
    return this.isPositiveGrowth ? 'typcn-arrow-up' : 'typcn-arrow-down';
  }

  get growthClass(): string {
    if (this.isPositiveGrowth) return 'text-success';
    if (this.isNegativeGrowth) return 'text-danger';
    return 'text-muted';
  }

  get cardColorClass(): string {
    return `card-${this.color}`;
  }

  get iconColorClass(): string {
    return `text-${this.color}`;
  }
}
