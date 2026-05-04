import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-saved',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="saved-container">
      <div class="saved-header">
        <h1>Saved</h1>
        <p>Posts, products, and items you've saved</p>
      </div>

      <div class="saved-content">
        <div class="saved-section">
          <div class="section-icon">📌</div>
          <div class="section-info">
            <h3>Saved Posts</h3>
            <p>Social media posts you want to keep</p>
          </div>
        </div>

        <div class="saved-section">
          <div class="section-icon">🛍️</div>
          <div class="section-info">
            <h3>Saved Products</h3>
            <p>Fashion items you're interested in</p>
          </div>
        </div>

        <div class="saved-section">
          <div class="section-icon">⭐</div>
          <div class="section-info">
            <h3>Collections</h3>
            <p>Organize saved items into collections</p>
          </div>
        </div>

        <div class="saved-section">
          <div class="section-icon">📸</div>
          <div class="section-info">
            <h3>Saved Stories</h3>
            <p>Stories you've bookmarked</p>
          </div>
        </div>

        <button class="back-btn" (click)="goBack()">
          <i class="fas fa-arrow-left"></i> Back
        </button>
      </div>
    </div>
  `,
  styles: [`
    .saved-container {
      min-height: 100vh;
      background: #f0f0f0;
      padding: 20px;
    }

    .saved-header {
      margin-bottom: 30px;
    }

    .saved-header h1 {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 8px;
      color: #111;
    }

    .saved-header p {
      font-size: 14px;
      color: #666;
      margin: 0;
    }

    .saved-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .saved-section {
      background: #fff;
      padding: 16px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .saved-section:hover {
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
export class SavedComponent implements OnInit, OnDestroy {
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
