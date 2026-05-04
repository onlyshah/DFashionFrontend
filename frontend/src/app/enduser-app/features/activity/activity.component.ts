import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="activity-container">
      <div class="activity-header">
        <h1>Your Activity</h1>
        <p>Track your likes, comments, and interactions</p>
      </div>

      <div class="activity-content">
        <div class="activity-section">
          <div class="section-icon">📊</div>
          <div class="section-info">
            <h3>Activity Timeline</h3>
            <p>View all your recent interactions, likes, comments, and follows</p>
          </div>
        </div>

        <div class="activity-section">
          <div class="section-icon">❤️</div>
          <div class="section-info">
            <h3>Your Likes</h3>
            <p>See posts and content you've liked</p>
          </div>
        </div>

        <div class="activity-section">
          <div class="section-icon">💬</div>
          <div class="section-info">
            <h3>Your Comments</h3>
            <p>View all comments you've posted</p>
          </div>
        </div>

        <div class="activity-section">
          <div class="section-icon">👥</div>
          <div class="section-info">
            <h3>Your Follows</h3>
            <p>Manage accounts you follow</p>
          </div>
        </div>

        <button class="back-btn" (click)="goBack()">
          <i class="fas fa-arrow-left"></i> Back
        </button>
      </div>
    </div>
  `,
  styles: [`
    .activity-container {
      min-height: 100vh;
      background: #f0f0f0;
      padding: 20px;
    }

    .activity-header {
      margin-bottom: 30px;
    }

    .activity-header h1 {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 8px;
      color: #111;
    }

    .activity-header p {
      font-size: 14px;
      color: #666;
      margin: 0;
    }

    .activity-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .activity-section {
      background: #fff;
      padding: 16px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .activity-section:hover {
      background: #f9f9f9;
    }

    .section-icon {
      font-size: 28px;
      min-width: 40px;
      text-align: center;
    }

    .section-info h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #111;
    }

    .section-info p {
      margin: 4px 0 0;
      font-size: 13px;
      color: #888;
    }

    .back-btn {
      margin-top: 20px;
      padding: 12px 16px;
      background: #f0f0f0;
      border: 1px solid #ddd;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s ease;
    }

    .back-btn:hover {
      background: #e9e9e9;
    }
  `]
})
export class ActivityComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Check authentication
    this.subscription.add(
      this.authService.currentUser$.subscribe(user => {
        if (!user) {
          this.router.navigate(['/auth/login']);
        }
      })
    );
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
