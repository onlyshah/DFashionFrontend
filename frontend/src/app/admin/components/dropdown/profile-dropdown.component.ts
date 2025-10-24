import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

interface ProfileOption {
  label: string;
  icon: string;
  action: () => void;
}

@Component({
  selector: 'app-profile-dropdown',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="dropdown">
      <button class="dropdown-toggle" (click)="isOpen = !isOpen">
        <img [src]="profileImage" [alt]="userName" class="profile-image">
        <span class="profile-name">{{ userName }}</span>
        <i class="typcn typcn-chevron-down"></i>
      </button>
      
      <div class="dropdown-menu" [class.show]="isOpen">
        <div class="dropdown-header">
          <div class="user-info">
            <img [src]="profileImage" [alt]="userName" class="profile-image">
            <div class="details">
              <h6>{{ userName }}</h6>
              <p>{{ userRole }}</p>
            </div>
          </div>
        </div>
        
        <div class="dropdown-body">
          <a *ngFor="let option of options" 
             class="dropdown-item"
             (click)="option.action()">
            <i class="typcn" [class]="option.icon"></i>
            <span>{{ option.label }}</span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dropdown { position: relative; }
    .dropdown-toggle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: none;
      border: none;
      color: var(--dark-color);
      padding: 0.5rem;
      cursor: pointer;
    }
    .profile-image {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
    }
    .profile-name {
      font-size: 0.875rem;
      font-weight: 500;
    }
    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-md);
      width: 280px;
      display: none;
      z-index: 1000;
    }
    .dropdown-menu.show { display: block; }
    .dropdown-header {
      padding: 1rem;
      border-bottom: 1px solid var(--border-color);
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .details h6 { margin: 0 0 0.25rem; }
    .details p { 
      margin: 0;
      color: var(--text-muted);
      font-size: 0.875rem;
    }
    .dropdown-body {
      padding: 0.5rem 0;
    }
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      text-decoration: none;
      color: inherit;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .dropdown-item:hover { background-color: var(--content-bg); }
    .dropdown-item i { font-size: 1.25rem; }
  `]
})
export class ProfileDropdownComponent {
  @Input() profileImage = 'assets/images/default-avatar.png';
  @Input() userName = 'John Doe';
  @Input() userRole = 'Administrator';
  @Input() options: ProfileOption[] = [
    {
      label: 'My Profile',
      icon: 'typcn-user',
      action: () => console.log('Profile clicked')
    },
    {
      label: 'Account Settings',
      icon: 'typcn-cog',
      action: () => console.log('Settings clicked')
    },
    {
      label: 'Sign Out',
      icon: 'typcn-power',
      action: () => console.log('Sign out clicked')
    }
  ];

  isOpen = false;
}