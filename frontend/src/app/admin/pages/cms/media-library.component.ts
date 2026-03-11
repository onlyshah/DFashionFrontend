import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-media-library',
  standalone: true,
  imports: [CommonModule, MatGridListModule, MatProgressSpinnerModule, MatButtonModule, MatIconModule, MatCardModule],
  template: `
    <div class="admin-media">
      <div class="media-header">
        <h2>Media Library</h2>
        <button mat-raised-button color="primary">
          <mat-icon>upload</mat-icon>
          Upload Media
        </button>
      </div>
      <div *ngIf="isLoading" class="loading"><mat-spinner></mat-spinner></div>
      <div class="grid" *ngIf="!isLoading && items.length > 0">
        <div class="item" *ngFor="let m of items">
          <div class="item-image">
            <img *ngIf="m.url" [src]="m.url" alt="{{ m.name }}" />
            <div *ngIf="!m.url" class="no-image"><mat-icon>insert_drive_file</mat-icon></div>
          </div>
          <div class="item-meta">
            <div class="item-name">{{ m.name || m.filename }}</div>
            <div class="item-info">{{ m.type }} • {{ formatSize(m.size) }}</div>
            <div class="item-date">{{ m.uploadedDate }}</div>
            <div class="item-actions">
              <button mat-icon-button><mat-icon>download</mat-icon></button>
              <button mat-icon-button color="warn"><mat-icon>delete</mat-icon></button>
            </div>
          </div>
        </div>
      </div>
      <div class="empty-state" *ngIf="!isLoading && items.length === 0">
        <mat-icon>image_not_supported</mat-icon>
        <h3>No Media Files</h3>
        <p>Upload images and documents to your media library</p>
        <button mat-raised-button color="primary"><mat-icon>upload</mat-icon>Upload Your First File</button>
      </div>
    </div>
  `,
  styles: [`
    .admin-media { padding: 24px; }
    .media-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .media-header h2 { margin: 0; font-size: 24px; }
    .loading { display: flex; justify-content: center; padding: 40px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
    .item { border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
    .item-image { height: 140px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; }
    .item-image img { width: 100%; height: 100%; object-fit: cover; }
    .no-image mat-icon { font-size: 40px; color: #ccc; }
    .item-meta { padding: 12px; }
    .item-name { font-weight: 600; font-size: 12px; color: #333; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .item-info { font-size: 11px; color: #999; }
    .item-date { font-size: 10px; color: #bbb; margin: 4px 0 8px 0; }
    .item-actions { display: flex; gap: 4px; }
    .empty-state { text-align: center; padding: 60px 20px; }
    .empty-state mat-icon { font-size: 48px; color: #ccc; margin-bottom: 16px; }
    .empty-state h3 { margin: 16px 0 8px; }
    .empty-state p { color: #999; margin-bottom: 24px; }
  `]
})
export class MediaLibraryComponent implements OnInit {
  items: any[] = [];
  isLoading = false;

  constructor(private api: AdminApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.api.get('/cms/media').subscribe({ 
      next: (r: any) => { this.items = r?.data || this.getSampleMedia(); this.isLoading = false; }, 
      error: () => { this.items = this.getSampleMedia(); this.isLoading = false; } 
    });
  }

  private getSampleMedia(): any[] {
    return [
      { id: '1', name: 'Summer Dress', filename: 'dress-01.jpg', url: 'https://via.placeholder.com/180x140?text=Summer', type: 'Image', size: 2048576, uploadedDate: '2026-03-07' },
      { id: '2', name: 'Casual Wear', filename: 'casual-02.jpg', url: 'https://via.placeholder.com/180x140?text=Casual', type: 'Image', size: 1572864, uploadedDate: '2026-03-07' },
      { id: '3', name: 'Winter Jacket', filename: 'jacket-03.jpg', url: 'https://via.placeholder.com/180x140?text=Winter', type: 'Image', size: 3145728, uploadedDate: '2026-03-06' },
      { id: '4', name: 'Catalog PDF', filename: 'catalog.pdf', url: '', type: 'Document', size: 5242880, uploadedDate: '2026-03-06' },
      { id: '5', name: 'Footwear', filename: 'shoes-05.jpg', url: 'https://via.placeholder.com/180x140?text=Shoes', type: 'Image', size: 1835008, uploadedDate: '2026-03-05' },
      { id: '6', name: 'Accessories', filename: 'acc-06.jpg', url: 'https://via.placeholder.com/180x140?text=Accessories', type: 'Image', size: 1048576, uploadedDate: '2026-03-05' }
    ];
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
