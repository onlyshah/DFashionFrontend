import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-social-posts',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatProgressSpinnerModule, MatPaginatorModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Social Posts</h1>
        <p>Manage social media posts and content</p>
      </div>
      <mat-card *ngIf="loading" class="loading-card">
        <mat-spinner></mat-spinner>
      </mat-card>
      <mat-card *ngIf="!loading && posts.length > 0">
        <mat-card-content>
          <table>
            <thead>
              <tr>
                <th>Creator</th>
                <th>Caption</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let post of posts">
                <td>{{ post.creator?.name || 'Unknown' }}</td>
                <td>{{ post.title || post.caption | slice:0:50 }}...</td>
                <td>{{ post.createdAt | date:'short' }}</td>
              </tr>
            </tbody>
          </table>
        </mat-card-content>
      </mat-card>
      <mat-card *ngIf="!loading && posts.length === 0">
        <mat-card-content>
          <div class="empty-state">
            <mat-icon>image</mat-icon>
            <p>No Social Posts Found</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`.page-container { padding: 24px; } .page-header { margin-bottom: 24px; } .page-header h1 { margin: 0 0 8px 0; font-size: 28px; font-weight: 500; } .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; } table { width: 100%; border-collapse: collapse; } th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; } .loading-card { display: flex; justify-content: center; padding: 40px; }`]
})
export class SocialPostsComponent implements OnInit {
  posts: any[] = [];
  loading = true;

  constructor(private api: AdminApiService) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    console.log('� [Social Posts] Fetching posts from /api/admin/social/posts - page 1, limit 20');
    this.api.get('/social/posts', { params: { page: 1, limit: 20 } }).subscribe({
      next: (res: any) => {
        console.log('✅ [Social Posts] Full API Response:', res);
        console.log('✅ [Social Posts] Response.success:', res?.success);
        console.log('✅ [Social Posts] Response.data:', res?.data);
        console.log('✅ [Social Posts] Response.data array length:', res?.data?.length);
        console.log('✅ [Social Posts] Response.pagination:', res?.pagination);
        console.log('✅ [Social Posts] Sample post:', res?.data?.[0]);
        
        this.posts = res?.data || [];
        console.log('✅ [Social Posts] Assigned posts count:', this.posts.length);
        console.log('✅ [Social Posts] Posts array:', this.posts);
        
        this.loading = false;
        console.log('✅ [Social Posts] UI should now display', this.posts.length, 'posts');
      },
      error: (err: any) => {
        console.error('❌ [Social Posts] Error Response:', err);
        console.error('❌ [Social Posts] Error message:', err?.message);
        console.error('❌ [Social Posts] Error status:', err?.status);
        console.error('❌ [Social Posts] Full error object:', err);
        this.posts = [];
        this.loading = false;
      }
    });
  }
}
