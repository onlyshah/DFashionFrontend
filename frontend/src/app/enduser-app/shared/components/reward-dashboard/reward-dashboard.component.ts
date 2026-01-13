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
    styleUrls: ['./reward-dashboard.component.scss'],
    templateUrl: './reward-dashboard.component.html'
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
