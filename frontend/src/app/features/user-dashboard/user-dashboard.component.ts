// ...existing code...
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
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
// ...existing code...

// ...existing code...
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
