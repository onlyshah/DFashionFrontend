import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';

/**
 * Reusable Explore Feed Component
 * Displays content in a feed/masonry layout for discovery
 * 
 * Purpose: Extract feed display logic from explore.component
 * for better code organization and reusability
 */
@Component({
  selector: 'app-explore-feed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './explore-feed.component.html',
  styleUrls: ['./explore-feed.component.scss']
})
export class ExploreFeedComponent implements OnInit {
  @Input() feedItems: any[] = [];
  @Input() title: string = '';
  @Input() feedType: 'trending' | 'inspiration' | 'featured' = 'trending';
  @Input() emptyMessage: string = 'Discover new trends and shop styles from creators';
  @Input() imageUrl = environment.apiUrl;

  @Output() itemClick = new EventEmitter<any>();
  @Output() shopClick = new EventEmitter<any>();
  @Output() viewClick = new EventEmitter<any>();

  ngOnInit() {
    // Component initialization if needed
  }

  onItemClick(item: any) {
    this.itemClick.emit(item);
  }

  onShopClick(item: any, event: Event) {
    event.stopPropagation();
    this.shopClick.emit(item);
  }

  onViewClick(item: any, event: Event) {
    event.stopPropagation();
    this.viewClick.emit(item);
  }

  getPrimaryImage(item: any): string {
    if (item?.image) {
      return item.image.startsWith('http')
        ? item.image
        : `${this.imageUrl}${item.image.startsWith('/') ? '' : '/'}${item.image}`;
    }
    if (item?.images && item.images.length > 0) {
      const primary = item.images.find((img: any) => img.isPrimary);
      const imageUrl = primary ? primary.url : item.images[0].url;
      return imageUrl.startsWith('http')
        ? imageUrl
        : `${this.imageUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }
    return `${this.imageUrl}/uploads/products/default.jpg`;
  }

  getItemTitle(item: any): string {
    return item?.title || item?.name || 'Untitled';
  }

  getItemDescription(item: any): string {
    return item?.description || item?.subtitle || '';
  }

  getTags(item: any): string[] {
    return item?.tags || [];
  }
}
