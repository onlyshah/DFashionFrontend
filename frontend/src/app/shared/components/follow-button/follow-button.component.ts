/**
 * 👥 Follow Button Component
 * Reusable follow/unfollow button with live status
 */

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FollowsApi } from 'src/app/core/api/follows.api';

@Component({
  selector: 'app-follow-button',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-button
      [expand]="expand"
      [color]="isFollowing ? 'secondary' : 'primary'"
      [fill]="isFollowing ? 'outline' : 'solid'"
      (click)="toggleFollow()"
      [disabled]="isLoading"
      [size]="size"
    >
      <ion-spinner name="crescent" *ngIf="isLoading" style="width: 20px; height: 20px; margin-right: 5px;"></ion-spinner>
      <ion-icon name="person-add" *ngIf="!isFollowing && !isLoading" slot="start"></ion-icon>
      <ion-icon name="checkmark" *ngIf="isFollowing && !isLoading" slot="start"></ion-icon>
      {{ isFollowing ? 'Following' : 'Follow' }}
    </ion-button>
  `,
  styles: [`
    ion-button {
      text-transform: capitalize;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FollowButtonComponent implements OnInit, OnDestroy {
  @Input() userId!: string;
  @Input() expand: 'block' | 'full' | undefined = undefined;
  @Input() size: 'small' | 'default' | 'large' = 'default';
  
  @Output() followStatusChanged = new EventEmitter<boolean>();

  isFollowing = false;
  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private followsApi: FollowsApi,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.checkFollowStatus();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Check if current user is following this user
   */
  checkFollowStatus() {
    if (!this.userId) return;

    this.followsApi.getStatus(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.isFollowing = response.data?.isFollowing || false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('❌ Failed to check follow status:', error);
        }
      });
  }

  /**
   * Toggle follow/unfollow
   */
  toggleFollow() {
    if (!this.userId || this.isLoading) return;

    this.isLoading = true;

    if (this.isFollowing) {
      this.unfollowUser();
    } else {
      this.followUser();
    }
  }

  /**
   * Follow user
   */
  private followUser() {
    this.followsApi.follow(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isFollowing = true;
          this.isLoading = false;
          this.followStatusChanged.emit(true);
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('❌ Failed to follow user:', error);
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Unfollow user
   */
  private unfollowUser() {
    this.followsApi.unfollow(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isFollowing = false;
          this.isLoading = false;
          this.followStatusChanged.emit(false);
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('❌ Failed to unfollow user:', error);
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }
}
