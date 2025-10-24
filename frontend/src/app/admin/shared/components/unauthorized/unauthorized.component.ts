import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-content">
        <i class="typcn typcn-lock-closed icon"></i>
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        <div class="actions">
          <button class="btn-primary" routerLink="/admin/dashboard">
            Go to Dashboard
          </button>
          <button class="btn-secondary" (click)="goBack()">
            Go Back
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      min-height: calc(100vh - 64px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: var(--content-bg);
    }

    .unauthorized-content {
      text-align: center;
      background: white;
      padding: 3rem;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-lg);
      max-width: 400px;
      width: 100%;
    }

    .icon {
      font-size: 4rem;
      color: var(--danger-color);
      margin-bottom: 1.5rem;
    }

    h1 {
      margin: 0 0 1rem;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-color);
    }

    p {
      margin: 0 0 2rem;
      color: var(--text-muted);
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .btn-primary,
    .btn-secondary {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: var(--border-radius);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
    }

    .btn-primary {
      background: var(--primary-color);
      color: white;
    }

    .btn-primary:hover {
      background: var(--primary-dark);
    }

    .btn-secondary {
      background: var(--light-bg);
      color: var(--text-color);
    }

    .btn-secondary:hover {
      background: var(--content-bg);
    }
  `]
})
export class UnauthorizedComponent {
  goBack(): void {
    window.history.back();
  }
}