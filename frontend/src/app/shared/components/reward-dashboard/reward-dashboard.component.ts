import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';

interface RewardSummary {
  totalCredits: number;
  availableCredits: number;
  usedCredits: number;
  totalEarnings: number;
  referralCode: string;
  referralCount: number;
}

interface RecentReward {
  type: string;
  credits: number;
  description: string;
  createdAt: Date;
  sourceUser?: {
    username: string;
    fullName: string;
  };
}

@Component({
    selector: 'app-reward-dashboard',
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatProgressBarModule,
        MatChipsModule
    ],
    template: `
    <div class="reward-dashboard">
      <!-- Reward Summary Cards -->
      <div class="reward-summary">
        <mat-card class="reward-card total-credits">
          <mat-card-content>
            <div class="card-header">
              <mat-icon>stars</mat-icon>
              <h3>Total Credits</h3>
            </div>
            <div class="card-value">{{ rewardSummary?.totalCredits || 0 }}</div>
            <div class="card-subtitle">Lifetime earned</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="reward-card available-credits">
          <mat-card-content>
            <div class="card-header">
              <mat-icon>account_balance_wallet</mat-icon>
              <h3>Available</h3>
            </div>
            <div class="card-value">{{ rewardSummary?.availableCredits || 0 }}</div>
            <div class="card-subtitle">Ready to use</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="reward-card referrals">
          <mat-card-content>
            <div class="card-header">
              <mat-icon>group_add</mat-icon>
              <h3>Referrals</h3>
            </div>
            <div class="card-value">{{ rewardSummary?.referralCount || 0 }}</div>
            <div class="card-subtitle">Friends joined</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="reward-card earnings">
          <mat-card-content>
            <div class="card-header">
              <mat-icon>trending_up</mat-icon>
              <h3>Earnings</h3>
            </div>
            <div class="card-value">\${{ (rewardSummary?.totalEarnings || 0) / 100 }}</div>
            <div class="card-subtitle">Total value</div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Referral Code Section -->
      <mat-card class="referral-section" *ngIf="rewardSummary?.referralCode">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>share</mat-icon>
            Your Referral Code
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="referral-code-container">
            <div class="referral-code">{{ rewardSummary?.referralCode }}</div>
            <button mat-raised-button color="primary" (click)="copyReferralCode()">
              <mat-icon>content_copy</mat-icon>
              Copy
            </button>
          </div>
          <p class="referral-description">
            Share your code with friends and earn 50 credits when they sign up, 
            plus 5% of their first purchase!
          </p>
        </mat-card-content>
      </mat-card>

      <!-- Recent Rewards -->
      <mat-card class="recent-rewards">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>history</mat-icon>
            Recent Activity
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="reward-list" *ngIf="recentRewards && recentRewards.length > 0; else noRewards">
            <div class="reward-item" *ngFor="let reward of recentRewards">
              <div class="reward-icon">
                <mat-icon [class]="getRewardIconClass(reward.type)">
                  {{ getRewardIcon(reward.type) }}
                </mat-icon>
              </div>
              <div class="reward-details">
                <div class="reward-description">{{ reward.description }}</div>
                <div class="reward-meta">
                  <span class="reward-date">{{ formatDate(reward.createdAt) }}</span>
                  <span class="reward-source" *ngIf="reward.sourceUser">
                    from {{ '@' + reward.sourceUser.username }}
                  </span>
                </div>
              </div>
              <div class="reward-credits" [class.positive]="reward.credits > 0" [class.negative]="reward.credits < 0">
                {{ reward.credits > 0 ? '+' : '' }}{{ reward.credits }}
              </div>
            </div>
          </div>
          <ng-template #noRewards>
            <div class="no-rewards">
              <mat-icon>sentiment_satisfied</mat-icon>
              <p>Start engaging to earn your first rewards!</p>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>

      <!-- Reward Actions -->
      <mat-card class="reward-actions">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>redeem</mat-icon>
            Redeem Credits
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="action-buttons">
            <button mat-raised-button color="primary" [disabled]="(rewardSummary?.availableCredits || 0) < 100">
              <mat-icon>local_offer</mat-icon>
              Get 10% Discount (100 credits)
            </button>
            <button mat-raised-button color="accent" [disabled]="(rewardSummary?.availableCredits || 0) < 250">
              <mat-icon>card_giftcard</mat-icon>
              Free Shipping (250 credits)
            </button>
            <button mat-raised-button [disabled]="(rewardSummary?.availableCredits || 0) < 500">
              <mat-icon>monetization_on</mat-icon>
              \$5 Store Credit (500 credits)
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
    styleUrls: ['./reward-dashboard.component.scss']
})
export class RewardDashboardComponent implements OnInit {
  @Input() rewardSummary: RewardSummary | null = null;
  @Input() recentRewards: RecentReward[] = [];

  ngOnInit(): void {
    // Component initialization
  }

  copyReferralCode(): void {
    if (this.rewardSummary?.referralCode) {
      navigator.clipboard.writeText(this.rewardSummary.referralCode).then(() => {
        // Show success message
        console.log('Referral code copied!');
      });
    }
  }

  getRewardIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'post_like': 'favorite',
      'post_share': 'share',
      'post_comment': 'comment',
      'story_view': 'visibility',
      'reel_view': 'play_circle',
      'product_purchase': 'shopping_cart',
      'referral_signup': 'person_add',
      'referral_purchase': 'group',
      'content_creation': 'create',
      'daily_login': 'login',
      'profile_completion': 'account_circle',
      'first_purchase': 'celebration',
      'review_submission': 'rate_review'
    };
    return iconMap[type] || 'stars';
  }

  getRewardIconClass(type: string): string {
    const classMap: { [key: string]: string } = {
      'post_like': 'like-icon',
      'post_share': 'share-icon',
      'product_purchase': 'purchase-icon',
      'referral_signup': 'referral-icon',
      'content_creation': 'create-icon'
    };
    return classMap[type] || 'default-icon';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
