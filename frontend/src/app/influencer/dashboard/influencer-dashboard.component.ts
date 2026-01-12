import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface InfluencerMetric {
  title: string;
  value: number | string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
}

interface FollowerData {
  date: string;
  count: number;
}

interface Campaign {
  id: string;
  name: string;
  platform: string;
  startDate: string;
  endDate: string | null;
  status: 'active' | 'completed' | 'pending';
  engagement: number;
  reach: number;
  impressions: number;
}

interface Post {
  id: string;
  title: string;
  platform: string;
  postedDate: string;
  likes: number;
  comments: number;
  shares: number;
  engagement: number;
}

@Component({
  selector: 'app-influencer-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './influencer-dashboard.component.html',
  styleUrls: ['./influencer-dashboard.component.scss']
})
export class InfluencerDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Loading and error states
  isLoading = true;
  error: string | null = null;

  // Key metrics
  metrics: InfluencerMetric[] = [];

  // Performance data
  totalFollowers = 0;
  totalEngagement = 0;
  totalReach = 0;
  avgEngagementRate = 0;

  // Detailed metrics
  followerGrowth = 0;
  engagementChange = 0;
  reachChange = 0;

  // Data collections
  campaigns: Campaign[] = [];
  recentPosts: Post[] = [];
  platformStats: any[] = [];
  followerGrowthChart: FollowerData[] = [];

  // Selected filters
  selectedPlatform = 'all';
  selectedPeriod = '30d';

  platforms = [
    { value: 'all', label: 'All Platforms' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'twitter', label: 'Twitter' }
  ];

  periods = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadInfluencerData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load all influencer dashboard data from API
   */
  private loadInfluencerData(): void {
    this.isLoading = true;
    this.error = null;

    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any>(`${environment.apiUrl}/influencer/dashboard`, { headers })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success && response.data) {
            this.populateDashboardData(response.data);
          } else {
            this.error = 'Failed to load dashboard data';
            this.resetToEmptyData();
          }
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading influencer data:', error);
          this.error = 'Unable to load dashboard. Please try again later.';
          this.resetToEmptyData();
          this.isLoading = false;
        }
      });
  }

  /**
   * Populate dashboard with API response data
   */
  private populateDashboardData(data: any): void {
    this.totalFollowers = data.totalFollowers || 0;
    this.totalEngagement = data.totalEngagement || 0;
    this.totalReach = data.totalReach || 0;
    this.avgEngagementRate = data.avgEngagementRate || 0;
    this.followerGrowth = data.followerGrowth || 0;
    this.engagementChange = data.engagementChange || 0;
    this.reachChange = data.reachChange || 0;

    this.campaigns = data.campaigns || [];
    this.recentPosts = data.recentPosts || [];
    this.platformStats = data.platformStats || [];
    this.followerGrowthChart = data.followerGrowthChart || [];

    this.buildMetrics();
  }

  /**
   * Reset dashboard to empty state when data cannot be loaded
   */
  private resetToEmptyData(): void {
    this.totalFollowers = 0;
    this.totalEngagement = 0;
    this.totalReach = 0;
    this.avgEngagementRate = 0;
    this.followerGrowth = 0;
    this.engagementChange = 0;
    this.reachChange = 0;
    this.campaigns = [];
    this.recentPosts = [];
    this.platformStats = [];
    this.followerGrowthChart = [];
    this.buildMetrics();
  }

  /**
   * Build metrics array for display
   */
  private buildMetrics(): void {
    this.metrics = [
      {
        title: 'Total Followers',
        value: this.formatNumber(this.totalFollowers),
        change: this.followerGrowth,
        trend: this.followerGrowth >= 0 ? 'up' : 'down',
        icon: 'people'
      },
      {
        title: 'Total Engagement',
        value: this.formatNumber(this.totalEngagement),
        change: this.engagementChange,
        trend: this.engagementChange >= 0 ? 'up' : 'down',
        icon: 'favorite'
      },
      {
        title: 'Total Reach',
        value: this.formatNumber(this.totalReach),
        change: this.reachChange,
        trend: this.reachChange >= 0 ? 'up' : 'down',
        icon: 'trending_up'
      },
      {
        title: 'Avg Engagement Rate',
        value: this.avgEngagementRate.toFixed(2) + '%',
        change: this.engagementChange,
        trend: this.engagementChange >= 0 ? 'up' : 'down',
        icon: 'analytics'
      }
    ];
  }

  /**
   * Format large numbers for display
   */
  private formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  /**
   * Get trend icon based on trend direction
   */
  getTrendIcon(trend: 'up' | 'down' | 'neutral'): string {
    return trend === 'up' ? 'trending_up' : trend === 'down' ? 'trending_down' : 'trending_flat';
  }

  /**
   * Get platform color
   */
  getPlatformColor(platform: string): string {
    const colors: { [key: string]: string } = {
      'instagram': '#E1306C',
      'tiktok': '#000000',
      'youtube': '#FF0000',
      'twitter': '#1DA1F2'
    };
    return colors[platform.toLowerCase()] || '#999999';
  }

  /**
   * Refresh dashboard data
   */
  refreshData(): void {
    this.loadInfluencerData();
  }

  /**
   * Export data to CSV
   */
  exportData(): void {
    const csv = this.generateCSV();
    this.downloadCSV(csv, 'influencer-dashboard.csv');
  }

  private generateCSV(): string {
    let csv = 'Influencer Dashboard Report\n\n';
    csv += 'Followers,' + this.totalFollowers + '\n';
    csv += 'Engagement,' + this.totalEngagement + '\n';
    csv += 'Reach,' + this.totalReach + '\n';
    csv += 'Engagement Rate,' + this.avgEngagementRate + '%\n\n';

    csv += 'Recent Posts\n';
    csv += 'Title,Platform,Likes,Comments,Shares,Engagement\n';
    this.recentPosts.forEach(post => {
      csv += `"${post.title}",${post.platform},${post.likes},${post.comments},${post.shares},${post.engagement}\n`;
    });

    return csv;
  }

  private downloadCSV(csv: string, filename: string): void {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
