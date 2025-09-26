import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../core/services/auth.service';
import { RewardDashboardComponent } from '../../shared/components/reward-dashboard/reward-dashboard.component';
import { CustomerDashboardComponent } from '../customer-dashboard/customer-dashboard.component';

interface UserStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  likesReceived: number;
  totalRewards: number;
  availableCredits: number;
}

interface RecentActivity {
  type: string;
  description: string;
  timestamp: Date;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    RewardDashboardComponent,
    CustomerDashboardComponent
  ],
  template: `
    <!-- Show new responsive customer dashboard for web, keep mobile design for mobile -->
    <app-customer-dashboard *ngIf="!isMobile"></app-customer-dashboard>

    <!-- Original mobile-optimized dashboard -->
    <div class="user-dashboard" *ngIf="isMobile">
      <!-- Instagram-style Header -->
      <div class="dashboard-header">
        <div class="header-content">
          <button class="back-btn" (click)="goBack()">
            <ion-icon name="arrow-back-outline"></ion-icon>
          </button>
          <h1>Your Dashboard</h1>
          <button class="settings-btn" (click)="openSettings()">
            <ion-icon name="settings-outline"></ion-icon>
          </button>
        </div>
      </div>

      <!-- User Profile Summary -->
      <div class="profile-summary">
        <div class="profile-avatar">
          <img src="http://localhost:9000/uploads/avatars/default-avatar.png" alt="Profile">
          <div class="status-indicator online"></div>
        </div>
        <div class="profile-info">
          <h2>{{ currentUser?.fullName || 'Fashion Enthusiast' }}</h2>
          <p>{{ '@' + (currentUser?.username || 'user') }}</p>
          <div class="user-badge">
            <ion-icon name="star"></ion-icon>
            <span>Fashion Explorer</span>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card posts">
          <div class="stat-icon">
            <ion-icon name="images-outline"></ion-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ userStats.postsCount }}</div>
            <div class="stat-label">Posts</div>
          </div>
        </div>

        <div class="stat-card followers">
          <div class="stat-icon">
            <ion-icon name="people-outline"></ion-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ userStats.followersCount }}</div>
            <div class="stat-label">Followers</div>
          </div>
        </div>

        <div class="stat-card likes">
          <div class="stat-icon">
            <ion-icon name="heart-outline"></ion-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ userStats.likesReceived }}</div>
            <div class="stat-label">Likes</div>
          </div>
        </div>

        <div class="stat-card rewards">
          <div class="stat-icon">
            <ion-icon name="gift-outline"></ion-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ userStats.availableCredits }}</div>
            <div class="stat-label">Credits</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h3>Quick Actions</h3>
        <div class="actions-grid">
          <button class="action-btn create-post" (click)="createPost()">
            <div class="action-icon">
              <ion-icon name="add-circle-outline"></ion-icon>
            </div>
            <span>Create Post</span>
          </button>

          <button class="action-btn create-story" (click)="createStory()">
            <div class="action-icon">
              <ion-icon name="camera-outline"></ion-icon>
            </div>
            <span>Add Story</span>
          </button>

          <button class="action-btn shop" (click)="goShopping()">
            <div class="action-icon">
              <ion-icon name="bag-outline"></ion-icon>
            </div>
            <span>Shop</span>
          </button>

          <button class="action-btn rewards" (click)="viewRewards()">
            <div class="action-icon">
              <ion-icon name="trophy-outline"></ion-icon>
            </div>
            <span>Rewards</span>
          </button>
        </div>
      </div>

      <!-- Tabbed Content -->
      <mat-tab-group class="dashboard-tabs" animationDuration="300ms">
        <!-- Activity Tab -->
        <mat-tab label="Activity">
          <div class="tab-content">
            <div class="recent-activity">
              <h4>Recent Activity</h4>
              <div class="activity-list" *ngIf="recentActivity.length > 0; else noActivity">
                <div class="activity-item" *ngFor="let activity of recentActivity">
                  <div class="activity-icon" [style.background-color]="activity.color">
                    <ion-icon [name]="activity.icon"></ion-icon>
                  </div>
                  <div class="activity-content">
                    <p>{{ activity.description }}</p>
                    <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
                  </div>
                </div>
              </div>
              <ng-template #noActivity>
                <div class="empty-state">
                  <ion-icon name="time-outline"></ion-icon>
                  <p>No recent activity</p>
                  <span>Start engaging to see your activity here!</span>
                </div>
              </ng-template>
            </div>
          </div>
        </mat-tab>

        <!-- Rewards Tab -->
        <mat-tab label="Rewards">
          <div class="tab-content">
            <app-reward-dashboard 
              [rewardSummary]="rewardSummary"
              [recentRewards]="recentRewards">
            </app-reward-dashboard>
          </div>
        </mat-tab>

        <!-- Analytics Tab -->
        <mat-tab label="Analytics">
          <div class="tab-content">
            <div class="analytics-section">
              <h4>Your Performance</h4>
              
              <div class="analytics-cards">
                <mat-card class="analytics-card">
                  <mat-card-header>
                    <mat-card-title>Engagement Rate</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="metric-value">8.5%</div>
                    <div class="metric-trend positive">
                      <ion-icon name="trending-up"></ion-icon>
                      +2.3% from last week
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="analytics-card">
                  <mat-card-header>
                    <mat-card-title>Content Views</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="metric-value">1.2K</div>
                    <div class="metric-trend positive">
                      <ion-icon name="trending-up"></ion-icon>
                      +15% this month
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="analytics-card">
                  <mat-card-header>
                    <mat-card-title>Shopping Influence</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="metric-value">$245</div>
                    <div class="metric-trend positive">
                      <ion-icon name="trending-up"></ion-icon>
                      Sales generated
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {
  currentUser: any = null;
  isMobile = false;

  userStats: UserStats = {
    postsCount: 0,
    followersCount: 0,
    followingCount: 0,
    likesReceived: 0,
    totalRewards: 0,
    availableCredits: 0
  };

  recentActivity: RecentActivity[] = [];
  rewardSummary: any = null;
  recentRewards: any[] = [];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();
    this.loadUserData();
    this.loadUserStats();
    this.loadRecentActivity();
    this.loadRewardData();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  loadUserData(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  loadUserStats(): void {
    // TODO: Load from API
    this.userStats = {
      postsCount: 12,
      followersCount: 156,
      followingCount: 89,
      likesReceived: 342,
      totalRewards: 1250,
      availableCredits: 850
    };
  }

  loadRecentActivity(): void {
    // TODO: Load from API
    this.recentActivity = [
      {
        type: 'post_like',
        description: 'Your post received 5 new likes',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        icon: 'heart',
        color: '#e91e63'
      },
      {
        type: 'reward_earned',
        description: 'Earned 10 credits for creating a post',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        icon: 'gift',
        color: '#4caf50'
      },
      {
        type: 'purchase',
        description: 'Purchased "Summer Dress" for $89.99',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        icon: 'bag',
        color: '#2196f3'
      }
    ];
  }

  loadRewardData(): void {
    // TODO: Load from API
    this.rewardSummary = {
      totalCredits: 1250,
      availableCredits: 850,
      usedCredits: 400,
      totalEarnings: 2500,
      referralCode: 'USER001',
      referralCount: 3
    };

    this.recentRewards = [
      {
        type: 'post_like',
        credits: 1,
        description: 'Liked a post',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        type: 'content_creation',
        credits: 10,
        description: 'Created a new post',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      }
    ];
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    }
  }

  // Navigation methods
  goBack(): void {
    this.router.navigate(['/home']);
  }

  openSettings(): void {
    this.router.navigate(['/profile/settings']);
  }

  createPost(): void {
    this.router.navigate(['/vendor/posts/create']);
  }

  createStory(): void {
    this.router.navigate(['/vendor/stories/create']);
  }

  goShopping(): void {
    this.router.navigate(['/shop']);
  }

  viewRewards(): void {
    // Scroll to rewards tab or navigate to dedicated rewards page
    const tabGroup = document.querySelector('mat-tab-group');
    if (tabGroup) {
      // Switch to rewards tab (index 1)
      (tabGroup as any).selectedIndex = 1;
    }
  }
}
