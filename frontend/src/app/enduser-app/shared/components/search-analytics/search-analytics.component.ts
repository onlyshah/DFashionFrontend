import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { SearchService } from '../../../core/services/search.service';

interface SearchInsight {
    totalSearches: number;
    uniqueQueries: number;
    topCategories: Array<{ name: string; count: number; percentage: number }>;
    topBrands: Array<{ name: string; count: number; percentage: number }>;
    searchTrends: Array<{ query: string; growth: number; searches: number }>;
    clickThroughRate: number;
    conversionRate: number;
    averageSearchTime: number;
    popularFilters: Array<{ filter: string; usage: number }>;
    searchPatterns: {
        peakHours: Array<{ hour: number; searches: number }>;
        weeklyPattern: Array<{ day: string; searches: number }>;
    };
}

@Component({
    selector: 'app-search-analytics',
    standalone: true,
    imports: [CommonModule, IonicModule],
    styles: [`
    .search-analytics-container {
      padding: 1rem;
      background: var(--ion-color-light);
      border-radius: 12px;
      margin: 1rem 0;
    }

    .analytics-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;

      h3 {
        margin: 0;
        color: var(--ion-color-dark);
        font-size: 1.25rem;
        font-weight: 600;
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
      gap: 1rem;

      p {
        margin: 0;
        color: var(--ion-color-medium);
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--ion-color-primary);
      margin-bottom: 0.25rem;
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--ion-color-medium);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .insight-section {
      margin-bottom: 2rem;

      h4 {
        margin: 0 0 1rem 0;
        color: var(--ion-color-dark);
        font-size: 1rem;
        font-weight: 600;
      }
    }

    .category-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .category-item {
      background: white;
      padding: 0.75rem;
      border-radius: 6px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    }

    .category-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .category-name {
      font-weight: 500;
      color: var(--ion-color-dark);
    }

    .category-count {
      font-size: 0.875rem;
      color: var(--ion-color-medium);
    }

    .category-bar {
      height: 4px;
      background: var(--ion-color-light-shade);
      border-radius: 2px;
      overflow: hidden;
    }

    .category-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--ion-color-primary), var(--ion-color-secondary));
      transition: width 0.3s ease;
    }

    .trends-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .trend-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
      padding: 0.75rem;
      border-radius: 6px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    }

    .trend-query {
      font-weight: 500;
      color: var(--ion-color-dark);
    }

    .trend-stats {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .trend-searches {
      font-size: 0.875rem;
      color: var(--ion-color-medium);
    }

    .trend-growth {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.875rem;
      font-weight: 500;

      &.positive {
        color: var(--ion-color-success);
      }

      &.negative {
        color: var(--ion-color-danger);
      }
    }

    .filters-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .filter-chip {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: white;
      padding: 0.5rem 0.75rem;
      border-radius: 20px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
      font-size: 0.875rem;
    }

    .filter-name {
      color: var(--ion-color-dark);
    }

    .filter-usage {
      color: var(--ion-color-primary);
      font-weight: 500;
    }

    .patterns-container {
      background: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .pattern-chart h5 {
      margin: 0 0 1rem 0;
      color: var(--ion-color-dark);
      font-size: 0.875rem;
      font-weight: 600;
    }

    .hours-chart {
      display: flex;
      align-items: end;
      gap: 2px;
      height: 60px;
    }

    .hour-bar {
      flex: 1;
      background: var(--ion-color-primary);
      border-radius: 2px 2px 0 0;
      position: relative;
      min-height: 4px;
      opacity: 0.8;
      transition: all 0.3s ease;

      &:hover {
        opacity: 1;
        transform: translateY(-2px);
      }
    }

    .hour-label {
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.625rem;
      color: var(--ion-color-medium);
    }

    .no-data {
      text-align: center;
      padding: 2rem;
      color: var(--ion-color-medium);

      h4 {
        margin: 1rem 0 0.5rem 0;
        color: var(--ion-color-dark);
      }

      p {
        margin: 0;
        font-size: 0.875rem;
      }
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .trend-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .hours-chart {
        height: 40px;
      }
    }
  `],
    templateUrl: './search-analytics.component.html'
})
export class SearchAnalyticsComponent implements OnInit, OnDestroy {
    insights: SearchInsight | null = null;
    isLoading = false;
    private destroy$ = new Subject<void>();

    constructor(private searchService: SearchService) { }

    ngOnInit(): void {
        this.loadInsights();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadInsights(): void {
        this.isLoading = true;

        this.searchService.getSearchInsights()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.insights = data;
                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error loading search insights:', error);
                    this.isLoading = false;
                }
            });
    }

    refreshData(): void {
        this.loadInsights();
    }

    getHourPercentage(searches: number): number {
        if (!this.insights?.searchPatterns.peakHours) return 0;

        const maxSearches = Math.max(...this.insights.searchPatterns.peakHours.map(h => h.searches));
        return maxSearches > 0 ? (searches / maxSearches) * 100 : 0;
    }
}
