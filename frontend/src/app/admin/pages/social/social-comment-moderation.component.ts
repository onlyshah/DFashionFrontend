import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-social-comment-moderation',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatProgressSpinnerModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Comment Moderation</h1>
        <p>Monitor and moderate social comments</p>
      </div>
      <mat-card *ngIf="loading" class="loading-card">
        <mat-spinner></mat-spinner>
      </mat-card>
      <mat-card *ngIf="!loading && comments.length > 0">
        <mat-card-content>
          <table>
            <thead>
              <tr>
                <th>Author</th>
                <th>Comment</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let comment of comments">
                <td>{{ comment.author?.name || 'Unknown' }}</td>
                <td>{{ comment.text | slice:0:50 }}...</td>
                <td>{{ comment.status }}</td>
                <td>{{ comment.createdAt | date:'short' }}</td>
              </tr>
            </tbody>
          </table>
        </mat-card-content>
      </mat-card>
      <mat-card *ngIf="!loading && comments.length === 0">
        <mat-card-content>
          <div class="empty-state">
            <mat-icon>message</mat-icon>
            <p>No Comments Found</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`.page-container { padding: 24px; } .page-header { margin-bottom: 24px; } .page-header h1 { margin: 0 0 8px 0; font-size: 28px; font-weight: 500; } .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; } table { width: 100%; border-collapse: collapse; } th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; } .loading-card { display: flex; justify-content: center; padding: 40px; }`]
})
export class SocialCommentModerationComponent implements OnInit {
  comments: any[] = [];
  loading = true;

  constructor(private api: AdminApiService) {}

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    console.log('🔄 [Comments] Fetching comments from /api/admin/social/comments');
    this.loading = true;
    this.api.get('/social/comments', { params: { page: 1, limit: 20 } }).subscribe({
      next: (res: any) => {
        console.log('✅ [Comments] Full API Response:', res);
        console.log('✅ [Comments] Response.success:', res?.success);
        console.log('✅ [Comments] Response.data:', res?.data);
        console.log('✅ [Comments] Response.data array length:', res?.data?.length);
        console.log('✅ [Comments] Response.pagination:', res?.pagination);
        console.log('✅ [Comments] Sample comment:', res?.data?.[0]);
        
        this.comments = res?.data || [];
        console.log('✅ [Comments] Assigned comments count:', this.comments.length);
        console.log('✅ [Comments] Comments array:', this.comments);
        
        this.loading = false;
        console.log('✅ [Comments] UI should now display', this.comments.length, 'comments');
      },
      error: (err: any) => {
        console.error('❌ [Comments] API Error:', err);
        console.error('❌ [Comments] Error message:', err?.message);
        console.error('❌ [Comments] Error status:', err?.status);
        console.error('❌ [Comments] Full error object:', err);
        this.comments = [];
        this.loading = false;
      }
    });
  }
}
