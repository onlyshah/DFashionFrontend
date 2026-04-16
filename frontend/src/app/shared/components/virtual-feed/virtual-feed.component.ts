/**
 * 📜 Virtual Scrolling Feed Component
 * Efficient rendering of large lists using CDK Virtual Scrolling
 */

import { Component, Input, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-virtual-feed',
  standalone: true,
  imports: [CommonModule, ScrollingModule],
  template: `
    <cdk-virtual-scroll-viewport
      [itemSize]="itemHeight"
      class="feed-viewport"
      (scrolledIndexChange)="onScrolledIndexChange($event)"
    >
      <div *cdkVirtualFor="let item of items; let idx = index" class="feed-item">
        <ng-container *ngTemplateOutlet="itemTemplate; context: { $implicit: item, index: idx }"></ng-container>
      </div>

      <!-- Loading indicator at bottom -->
      <div *ngIf="isLoading" class="loading-indicator">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Loading more...</p>
      </div>

      <!-- Empty state -->
      <div *ngIf="items.length === 0 && !isLoading" class="empty-state">
        <p>{{ emptyMessage }}</p>
      </div>
    </cdk-virtual-scroll-viewport>
  `,
  styles: [`
    .feed-viewport {
      height: 100%;
      width: 100%;
    }

    .feed-item {
      height: 100%;
      display: flex;
      align-items: center;
      margin-bottom: 1px;
      background: white;
    }

    .loading-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      gap: 10px;
    }

    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      color: #999;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VirtualFeedComponent implements OnInit, OnDestroy {
  @Input() items: any[] = [];
  @Input() itemHeight: number = 400; // Height of each item in pixels
  @Input() itemTemplate: any;
  @Input() isLoading: boolean = false;
  @Input() emptyMessage: string = 'No items to display';
  @Input() onLoadMore: (() => void) | null = null;
  @Input() loadThreshold: number = 3; // Load more when 3 items from bottom

  private destroy$ = new Subject<void>();

  ngOnInit() {
    // Component initialization
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handle scroll events to load more items
   */
  onScrolledIndexChange(index: number) {
    const totalHeight = this.items.length * this.itemHeight;
    const itemsFromBottom = this.items.length - (index + this.loadThreshold);

    // Trigger load more when near bottom
    if (itemsFromBottom < this.loadThreshold && this.onLoadMore && !this.isLoading) {
      this.onLoadMore();
    }
  }
}
