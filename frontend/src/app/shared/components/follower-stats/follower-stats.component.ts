/**
 * 👥 Follower Stats Component
 * Displays follower/following counts with tap to view lists
 */

import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FollowsApi } from 'src/app/core/api/follows.api';

@Component({
  selector: 'app-follower-stats',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="stats-container">
      <!-- Followers -->
      <div class="stat-card" (click)="showFollowersList()">
        <div class="stat-number">{{ followers }}</div>
        <div class="stat-label">Followers</div>
      </div>

      <!-- Following -->
      <div class="stat-card" (click)="showFollowingList()">
        <div class="stat-number">{{ following }}</div>
        <div class="stat-label">Following</div>
      </div>

      <!-- Posts -->
      <div class="stat-card" *ngIf="showPostCount">
        <div class="stat-number">{{ postsCount }}</div>
        <div class="stat-label">Posts</div>
      </div>
    </div>
  `,
  styles: [`
    .stats-container {
      display: flex;
      justify-content: space-around;
      gap: 10px;
      padding: 20px 0;
      background: white;
      border-radius: 8px;
    }

    .stat-card {
      flex: 1;
      text-align: center;
      padding: 15px;
      border-radius: 8px;
      background: #f9f9f9;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      background: #f0f0f0;
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .stat-number {
      font-size: 24px;
      font-weight: bold;
      color: var(--ion-color-primary);
      margin-bottom: 5px;
    }

    .stat-label {
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FollowerStatsComponent implements OnInit, OnDestroy {
  @Input() userId!: string;
  @Input() showPostCount: boolean = false;

  followers: number = 0;
  following: number = 0;
  postsCount: number = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private followsApi: FollowsApi,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load follower/following stats
   */
  loadStats() {
    if (!this.userId) return;

    this.followsApi.getStats(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.followers = response.data?.followers || 0;
          this.following = response.data?.following || 0;
        },
        error: (error) => {
          console.error('❌ Failed to load stats:', error);
        }
      });
  }

  /**
   * Show followers list modal
   */
  async showFollowersList() {
    // TODO: Create and show followers list modal
    console.log('📋 Show followers list');
  }

  /**
   * Show following list modal
   */
  async showFollowingList() {
    // TODO: Create and show following list modal
    console.log('📋 Show following list');
  }
}
