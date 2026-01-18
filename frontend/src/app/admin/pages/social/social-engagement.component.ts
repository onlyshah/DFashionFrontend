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
    this.statsLoading = true;
    this.api.get('/social/stats').subscribe({
      next: (res: any) => {
        this.stats = res?.data || {
          totalPosts: 0,
          totalReels: 0,
          totalEngagement: 0,
          avgEngagementRate: 0
        };
        this.statsLoading = false;
      },
      error: () => {
        this.statsLoading = false;
      }
    });
  }

  loadPosts(): void {
    this.postsLoading = true;
    this.api.get('/social/posts').subscribe({
      next: (res: any) => {
        this.postsDataSource.data = res?.data || [];
        this.postsLoading = false;
      },
      error: () => {
        this.postsDataSource.data = [];
        this.postsLoading = false;
      }
    });
  }

  loadReels(): void {
    this.reelsLoading = true;
    this.api.get('/social/reels').subscribe({
      next: (res: any) => {
        this.reelsDataSource.data = res?.data || [];
        this.reelsLoading = false;
      },
      error: () => {
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
