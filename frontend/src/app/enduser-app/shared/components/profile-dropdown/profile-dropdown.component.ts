import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-profile-dropdown',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="profile-dropdown">
      <div class="dropdown-header">
        <img [src]="userProfileImage" alt="Profile" class="profile-avatar">
        <div class="user-info">
          <div class="username">{{ currentUser?.username }}</div>
          <div class="email">{{ currentUser?.email }}</div>
        </div>
      </div>

      <div class="dropdown-divider"></div>

      <!-- Profile Actions -->
      <a routerLink="/profile" class="dropdown-item" (click)="emitClose()">
        <i class="icon fas fa-user"></i>
        <span>My Profile</span>
      </a>

      <!-- Commerce Actions -->
      <a routerLink="/profile/orders" class="dropdown-item" (click)="emitClose()">
        <i class="icon fas fa-shopping-bag"></i>
        <span>Orders</span>
      </a>

      <a routerLink="/profile/wishlist" class="dropdown-item" (click)="emitClose()">
        <i class="icon fas fa-heart"></i>
        <span>Wishlist</span>
      </a>

      <a routerLink="/profile/saved" class="dropdown-item" (click)="emitClose()">
        <i class="icon fas fa-bookmark"></i>
        <span>Saved</span>
      </a>

      <!-- Social Actions -->
      <a routerLink="/profile/activity" class="dropdown-item" (click)="emitClose()">
        <i class="icon fas fa-history"></i>
        <span>Activity</span>
      </a>

      <!-- Dashboard (Role-Aware) -->
      <a *ngIf="userRole === 'vendor' || userRole === 'seller'" routerLink="/dashboard" class="dropdown-item" (click)="emitClose()">
        <i class="icon fas fa-chart-line"></i>
        <span>Seller Dashboard</span>
      </a>

      <a *ngIf="userRole === 'end_user' || userRole === 'customer'" routerLink="/dashboard" class="dropdown-item" (click)="emitClose()">
        <i class="icon fas fa-tachometer-alt"></i>
        <span>Customer Dashboard</span>
      </a>

      <div class="dropdown-divider"></div>

      <!-- Settings & Preferences -->
      <a routerLink="/profile/settings" class="dropdown-item" (click)="emitClose()">
        <i class="icon fas fa-cog"></i>
        <span>Settings</span>
      </a>

      <a routerLink="/profile/appearance" class="dropdown-item" (click)="emitClose()">
        <i class="icon fas fa-palette"></i>
        <span>Appearance</span>
      </a>

      <div class="dropdown-divider"></div>

      <!-- Account Actions -->
      <button class="dropdown-item" (click)="switchAccount()" *ngIf="hasMultipleAccounts">
        <i class="icon fas fa-exchange-alt"></i>
        <span>Switch Account</span>
      </button>

      <button class="dropdown-item logout" (click)="emitLogout()">
        <i class="icon fas fa-sign-out-alt"></i>
        <span>Logout</span>
      </button>
    </div>
  `,
  styles: [`
    .profile-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      width: 260px;
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      margin-top: 8px;
    }

    .dropdown-header {
      display: flex;
      gap: 12px;
      padding: 12px 16px;
      align-items: center;
    }

    .profile-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-info {
      flex: 1;
      min-width: 0;
    }

    .username {
      font-size: 14px;
      font-weight: 600;
      color: #1a1a1a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .email {
      font-size: 12px;
      color: #8c7e76;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .dropdown-divider {
      height: 1px;
      background: #f0f0f0;
      margin: 8px 0;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 10px 16px;
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
      font-size: 14px;
      color: #1a1a1a;
      transition: all 0.15s ease;
      text-decoration: none;
    }

    .dropdown-item .icon {
      width: 20px;
      text-align: center;
      color: #8c7e76;
    }

    .dropdown-item:hover {
      background: #f9f9f9;
      color: #e8521a;
    }

    .dropdown-item:hover .icon {
      color: #e8521a;
    }

    .dropdown-item.logout {
      color: #dc3545;
    }

    .dropdown-item.logout .icon {
      color: #dc3545;
    }

    .dropdown-item.logout:hover {
      background: #fff5f5;
    }

    @media (max-width: 768px) {
      .profile-dropdown {
        width: 240px;
      }
    }
  `]
})
export class ProfileDropdownComponent implements OnInit {
  @Input() currentUser: User | null = null;
  @Output() onLogout = new EventEmitter<void>();
  @Output() onClose = new EventEmitter<void>();

  userRole = 'customer';
  userProfileImage = '/assets/default-avatar.png';
  hasMultipleAccounts = false;
  backendDefaultAvatar = environment.apiUrl + '/uploads/avatars/';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.currentUser) {
      this.loadUserProfile();
    }
  }

  loadUserProfile(): void {
    if (this.currentUser) {
      this.userRole = this.currentUser.role || 'customer';
      this.userProfileImage = this.currentUser.image 
        ? this.backendDefaultAvatar + this.currentUser.image
        : this.currentUser.avatar 
          ? this.backendDefaultAvatar + this.currentUser.avatar
          : this.backendDefaultAvatar + 'default-avatar.svg';
    }
  }

  emitClose(): void {
    this.onClose.emit();
  }

  emitLogout(): void {
    this.onLogout.emit();
  }

  switchAccount(): void {
    console.log('Switch account clicked');
    // TODO: Implement account switching
  }
}
