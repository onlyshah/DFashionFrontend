import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'success' | 'warning' | 'info';
  icon: string;
}

@Component({
  selector: 'app-notifications-dropdown',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="dropdown">
      <button class="dropdown-toggle" (click)="isOpen = !isOpen">
        <i class="typcn typcn-bell"></i>
        <span class="badge" *ngIf="notifications.length">{{ notifications.length }}</span>
      </button>
      
      <div class="dropdown-menu" [class.show]="isOpen">
        <div class="dropdown-header">
          <h6>Notifications</h6>
        </div>
        
        <div class="dropdown-body">
          <ng-container *ngIf="notifications.length; else empty">
            <a *ngFor="let notification of notifications" class="dropdown-item">
              <div class="icon-wrapper" [ngClass]="notification.type">
                <i class="typcn" [class]="notification.icon"></i>
              </div>
              <div class="content">
                <h6>{{ notification.title }}</h6>
                <p>{{ notification.message }}</p>
                <small>{{ notification.time }}</small>
              </div>
            </a>
          </ng-container>
          
          <ng-template #empty>
            <div class="empty-state">
              <p>No new notifications</p>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dropdown { position: relative; }
    .dropdown-toggle {
      background: none;
      border: none;
      color: var(--dark-color);
      font-size: 1.25rem;
      padding: 0.5rem;
      position: relative;
      cursor: pointer;
    }
    .badge {
      position: absolute;
      top: 0;
      right: 0;
      background: var(--danger-color);
      color: white;
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 1rem;
      min-width: 1.5rem;
      text-align: center;
    }
    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-md);
      width: 320px;
      display: none;
      z-index: 1000;
    }
    .dropdown-menu.show { display: block; }
    .dropdown-header {
      padding: 1rem;
      border-bottom: 1px solid var(--border-color);
    }
    .dropdown-header h6 { margin: 0; }
    .dropdown-body {
      max-height: 400px;
      overflow-y: auto;
    }
    .dropdown-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      text-decoration: none;
      color: inherit;
      transition: background-color 0.2s;
    }
    .dropdown-item:hover { background-color: var(--content-bg); }
    .icon-wrapper {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .icon-wrapper.success { background-color: var(--success-color); color: white; }
    .icon-wrapper.warning { background-color: var(--warning-color); color: white; }
    .icon-wrapper.info { background-color: var(--info-color); color: white; }
    .content h6 { margin: 0 0 0.25rem; }
    .content p { margin: 0 0 0.25rem; color: var(--text-muted); font-size: 0.875rem; }
    .content small { color: var(--text-muted); }
    .empty-state {
      padding: 2rem;
      text-align: center;
      color: var(--text-muted);
    }
  `]
})
export class NotificationsDropdownComponent {
  @Input() notifications: Notification[] = [];
  isOpen = false;
}