import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-social-hashtags',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatProgressSpinnerModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Hashtags</h1>
        <p>Monitor and manage trending hashtags</p>
      </div>
      <mat-card *ngIf="loading" class="loading-card">
        <mat-spinner></mat-spinner>
      </mat-card>
      <mat-card *ngIf="!loading && hashtags.length > 0">
        <mat-card-content>
          <table>
            <thead>
              <tr>
                <th>Hashtag</th>
                <th>Usage Count</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let tag of hashtags">
                <td>{{ tag.name }}</td>
                <td>{{ tag.usageCount }}</td>
              </tr>
            </tbody>
          </table>
        </mat-card-content>
      </mat-card>
      <mat-card *ngIf="!loading && hashtags.length === 0">
        <mat-card-content>
          <div class="empty-state">
            <mat-icon>local_offer</mat-icon>
            <p>No Hashtags Found</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`.page-container { padding: 24px; } .page-header { margin-bottom: 24px; } .page-header h1 { margin: 0 0 8px 0; font-size: 28px; font-weight: 500; } .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; } table { width: 100%; border-collapse: collapse; } th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; } .loading-card { display: flex; justify-content: center; padding: 40px; }`]
})
export class SocialHashtagsComponent implements OnInit {
  hashtags: any[] = [];
  loading = true;

  constructor(private api: AdminApiService) {}

  ngOnInit(): void {
    this.loadHashtags();
  }

  loadHashtags(): void {
    console.log('🔄 [Hashtags] Fetching hashtags from /api/admin/social/hashtags');
    this.loading = true;
    this.api.get('/social/hashtags', { params: { page: 1, limit: 20 } }).subscribe({
      next: (res: any) => {
        console.log('✅ [Hashtags] Full API Response:', res);
        console.log('✅ [Hashtags] Response.success:', res?.success);
        console.log('✅ [Hashtags] Response.data:', res?.data);
        console.log('✅ [Hashtags] Response.data array length:', res?.data?.length);
        console.log('✅ [Hashtags] Response.pagination:', res?.pagination);
        console.log('✅ [Hashtags] Sample hashtag:', res?.data?.[0]);
        
        this.hashtags = res?.data || [];
        console.log('✅ [Hashtags] Assigned hashtags count:', this.hashtags.length);
        console.log('✅ [Hashtags] Hashtags array:', this.hashtags);
        
        this.loading = false;
        console.log('✅ [Hashtags] UI should now display', this.hashtags.length, 'hashtags');
      },
      error: (err: any) => {
        console.error('❌ [Hashtags] API Error:', err);
        console.error('❌ [Hashtags] Error message:', err?.message);
        console.error('❌ [Hashtags] Error status:', err?.status);
        console.error('❌ [Hashtags] Full error object:', err);
        this.hashtags = [];
        this.loading = false;
      }
    });
  }
}
