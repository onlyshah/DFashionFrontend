import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-social-videos',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatProgressSpinnerModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Social Videos</h1>
        <p>Manage video content and streaming</p>
      </div>
      <mat-card *ngIf="loading" class="loading-card">
        <mat-spinner></mat-spinner>
      </mat-card>
      <mat-card *ngIf="!loading && videos.length > 0">
        <mat-card-content>
          <table>
            <thead>
              <tr>
                <th>Creator</th>
                <th>Video URL</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let video of videos">
                <td>{{ video.creator?.name || 'Unknown' }}</td>
                <td>{{ video.videoUrl | slice:0:50 }}...</td>
                <td>{{ video.createdAt | date:'short' }}</td>
              </tr>
            </tbody>
          </table>
        </mat-card-content>
      </mat-card>
      <mat-card *ngIf="!loading && videos.length === 0">
        <mat-card-content>
          <div class="empty-state">
            <mat-icon>videocam</mat-icon>
            <p>No Videos Found</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`.page-container { padding: 24px; } .page-header { margin-bottom: 24px; } .page-header h1 { margin: 0 0 8px 0; font-size: 28px; font-weight: 500; } .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; } table { width: 100%; border-collapse: collapse; } th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; } .loading-card { display: flex; justify-content: center; padding: 40px; }`]
})
export class SocialVideosComponent implements OnInit {
  videos: any[] = [];
  loading = true;

  constructor(private api: AdminApiService) {}

  ngOnInit(): void {
    this.loadVideos();
  }

  loadVideos(): void {
    console.log('🔄 [Social Videos] Fetching videos/reels from /api/admin/social/reels');
    this.loading = true;
    this.api.get('/social/reels', { params: { page: 1, limit: 20 } }).subscribe({
      next: (res: any) => {
        console.log('✅ [Social Videos] Full API Response:', res);
        console.log('✅ [Social Videos] Response.success:', res?.success);
        console.log('✅ [Social Videos] Response.data:', res?.data);
        console.log('✅ [Social Videos] Response.data array length:', res?.data?.length);
        console.log('✅ [Social Videos] Response.pagination:', res?.pagination);
        console.log('✅ [Social Videos] Sample video:', res?.data?.[0]);
        
        this.videos = res?.data || [];
        console.log('✅ [Social Videos] Assigned videos count:', this.videos.length);
        console.log('✅ [Social Videos] Videos array:', this.videos);
        
        this.loading = false;
        console.log('✅ [Social Videos] UI should now display', this.videos.length, 'videos');
      },
      error: (err: any) => {
        console.error('❌ [Social Videos] API Error:', err);
        console.error('❌ [Social Videos] Error message:', err?.message);
        console.error('❌ [Social Videos] Error status:', err?.status);
        console.error('❌ [Social Videos] Full error object:', err);
        this.videos = [];
        this.loading = false;
      }
    });
  }
}
