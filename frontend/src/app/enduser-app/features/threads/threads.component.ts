import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-threads',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="threads-container">
      <div class="threads-header">
        <h1>Threads</h1>
        <p>Conversations and discussions</p>
      </div>

      <div class="threads-content">
        <div *ngIf="threads.length === 0" class="empty-state">
          <div class="empty-icon">💬</div>
          <h3>No threads yet</h3>
          <p>Start a conversation or join a discussion</p>
        </div>

        <div class="thread-item" *ngFor="let thread of threads">
          <div class="thread-avatar">
            <img [src]="thread.avatar" [alt]="thread.name">
          </div>
          <div class="thread-info">
            <h4>{{ thread.name }}</h4>
            <p>{{ thread.lastMessage }}</p>
            <span class="thread-time">{{ thread.time }}</span>
          </div>
          <div class="thread-status" *ngIf="thread.unread">
            <span class="unread-badge">{{ thread.unread }}</span>
          </div>
        </div>

        <button class="back-btn" (click)="goBack()">
          <i class="fas fa-arrow-left"></i> Back
        </button>
      </div>
    </div>
  `,
  styles: [`
    .threads-container {
      min-height: 100vh;
      background: #f0f0f0;
      padding: 20px;
    }

    .threads-header {
      margin-bottom: 30px;
    }

    .threads-header h1 {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 8px;
      color: #111;
    }

    .threads-header p {
      font-size: 14px;
      color: #666;
      margin: 0;
    }

    .threads-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .empty-state {
      background: #fff;
      padding: 60px 20px;
      border-radius: 12px;
      text-align: center;
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0 0 8px;
      font-size: 18px;
      color: #111;
    }

    .empty-state p {
      margin: 0;
      font-size: 14px;
      color: #888;
    }

    .thread-item {
      background: #fff;
      padding: 16px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .thread-item:hover {
      background: #f9f9f9;
    }

    .thread-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
    }

    .thread-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .thread-info {
      flex: 1;
      min-width: 0;
    }

    .thread-info h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #111;
    }

    .thread-info p {
      margin: 4px 0 0;
      font-size: 13px;
      color: #888;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .thread-time {
      font-size: 12px;
      color: #aaa;
      display: block;
      margin-top: 4px;
    }

    .thread-status {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .unread-badge {
      background: #667eea;
      color: #fff;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
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
export class ThreadsComponent implements OnInit, OnDestroy {
  threads: any[] = [];
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
        } else {
          this.loadThreads();
        }
      })
    );
  }

  loadThreads(): void {
    // TODO: Load threads from API
    // For now, show empty state
    this.threads = [];
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
