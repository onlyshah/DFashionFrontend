import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-social-engagement',
  standalone: true,
  imports: [
    CommonModule, MatTabsModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatProgressSpinnerModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatTooltipModule, MatCardModule, MatChipsModule
  ],
  templateUrl: './social-engagement.component.html',
  styleUrls: ['./social-engagement.component.scss']
})
export class SocialEngagementComponent implements OnInit {
  @ViewChild('postsPaginator') postsPaginator!: MatPaginator;
  @ViewChild('postsSort') postsSort!: MatSort;
  @ViewChild('reelsPaginator') reelsPaginator!: MatPaginator;
  @ViewChild('reelsSort') reelsSort!: MatSort;

  // Posts Table
  postsDisplayedColumns = ['user', 'caption', 'likes', 'comments', 'createdAt', 'actions'];
  postsDataSource = new MatTableDataSource<any>([]);
  postsLoading = false;

  // Reels Table
  reelsDisplayedColumns = ['user', 'title', 'duration', 'views', 'likes', 'createdAt', 'actions'];
  reelsDataSource = new MatTableDataSource<any>([]);
  reelsLoading = false;

  // Summary Stats
  stats = {
    totalPosts: 0,
    totalReels: 0,
    totalEngagement: 0,
    avgEngagementRate: 0
  };
  statsLoading = false;

  selectedTab = 0;

  constructor(private api: AdminApiService) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadPosts();
    this.loadReels();
  }

  ngAfterViewInit(): void {
    this.postsDataSource.paginator = this.postsPaginator;
    this.postsDataSource.sort = this.postsSort;
    this.reelsDataSource.paginator = this.reelsPaginator;
    this.reelsDataSource.sort = this.reelsSort;
  }

  loadStats(): void {
    console.log('🔄 [Social Stats] Fetching stats from /api/admin/social/stats');
    this.statsLoading = true;
    this.api.get('/social/stats').subscribe({
      next: (res: any) => {
        console.log('✅ [Social Stats] Full API Response:', res);
        console.log('✅ [Social Stats] Response.success:', res?.success);
        console.log('✅ [Social Stats] Response.data:', res?.data);
        this.stats = res?.data || {
          totalPosts: 0,
          totalReels: 0,
          totalEngagement: 0,
          avgEngagementRate: 0
        };
        console.log('✅ [Social Stats] Assigned stats:', this.stats);
        this.statsLoading = false;
      },
      error: (err: any) => {
        console.error('❌ [Social Stats] API Error:', err);
        console.error('❌ [Social Stats] Error message:', err?.message);
        this.statsLoading = false;
      }
    });
  }

  loadPosts(): void {
    console.log('🔄 [Social Posts] Fetching posts from /api/admin/social/posts');
    this.postsLoading = true;
    this.api.get('/social/posts', { params: { page: 1, limit: 20 } }).subscribe({
      next: (res: any) => {
        console.log('✅ [Social Posts] Full API Response:', res);
        console.log('✅ [Social Posts] Response.success:', res?.success);
        console.log('✅ [Social Posts] Response.data:', res?.data);
        console.log('✅ [Social Posts] Data array length:', res?.data?.length);
        console.log('✅ [Social Posts] Pagination:', res?.pagination);
        console.log('✅ [Social Posts] Sample post:', res?.data?.[0]);
        
        this.postsDataSource.data = res?.data || [];
        console.log('✅ [Social Posts] DataSource updated with', this.postsDataSource.data.length, 'posts');
        this.postsLoading = false;
      },
      error: (err: any) => {
        console.error('❌ [Social Posts] API Error:', err);
        console.error('❌ [Social Posts] Error message:', err?.message);
        console.error('❌ [Social Posts] Error status:', err?.status);
        this.postsDataSource.data = [];
        this.postsLoading = false;
      }
    });
  }

  loadReels(): void {
    console.log('🔄 [Social Reels] Fetching reels from /api/admin/social/reels');
    this.reelsLoading = true;
    this.api.get('/social/reels', { params: { page: 1, limit: 20 } }).subscribe({
      next: (res: any) => {
        console.log('✅ [Social Reels] Full API Response:', res);
        console.log('✅ [Social Reels] Response.success:', res?.success);
        console.log('✅ [Social Reels] Response.data:', res?.data);
        console.log('✅ [Social Reels] Data array length:', res?.data?.length);
        console.log('✅ [Social Reels] Pagination:', res?.pagination);
        console.log('✅ [Social Reels] Sample reel:', res?.data?.[0]);
        
        this.reelsDataSource.data = res?.data || [];
        console.log('✅ [Social Reels] DataSource updated with', this.reelsDataSource.data.length, 'reels');
        this.reelsLoading = false;
      },
      error: (err: any) => {
        console.error('❌ [Social Reels] API Error:', err);
        console.error('❌ [Social Reels] Error message:', err?.message);
        console.error('❌ [Social Reels] Error status:', err?.status);
        this.reelsDataSource.data = [];
        this.reelsLoading = false;
      }
    });
  }

  applyPostFilter(e: any): void {
    this.postsDataSource.filter = e.target.value.trim().toLowerCase();
  }

  applyReelFilter(e: any): void {
    this.reelsDataSource.filter = e.target.value.trim().toLowerCase();
  }

  deletePost(id: string): void {
    if (confirm('Delete this post?')) {
      this.api.delete(`/social/posts/${id}`).subscribe({
        next: () => this.loadPosts(),
        error: () => {}
      });
    }
  }

  deleteReel(id: string): void {
    if (confirm('Delete this reel?')) {
      this.api.delete(`/social/reels/${id}`).subscribe({
        next: () => this.loadReels(),
        error: () => {}
      });
    }
  }

  togglePostApproval(id: string, currentStatus: boolean): void {
    this.api.patch(`/social/posts/${id}`, { approved: !currentStatus }).subscribe({
      next: () => this.loadPosts(),
      error: () => {}
    });
  }

  toggleReelApproval(id: string, currentStatus: boolean): void {
    this.api.patch(`/social/reels/${id}`, { approved: !currentStatus }).subscribe({
      next: () => this.loadReels(),
      error: () => {}
    });
  }
}
