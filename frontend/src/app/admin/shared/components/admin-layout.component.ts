import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthorizationService } from '../services/authorization.service';
import { UserRole } from '../models/role.model';
import { NotificationsDropdownComponent } from '../../components/dropdown/notifications-dropdown.component';
import { MessagesDropdownComponent } from '../../components/dropdown/messages-dropdown.component';
import { ProfileDropdownComponent } from '../../components/dropdown/profile-dropdown.component';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  requiredRole?: UserRole[];
  requiredPermission?: string;
  children?: MenuItem[];
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NotificationsDropdownComponent,
    MessagesDropdownComponent,
    ProfileDropdownComponent
  ],
  template: `
    <div class="admin-layout" [class.nav-collapsed]="isNavCollapsed">
      <!-- Sidebar -->
      <nav class="sidebar">
        <div class="sidebar-header">
          <img src="assets/images/logo.png" alt="Logo" class="logo">
          <button class="nav-toggle" (click)="toggleNav()">
            <i class="typcn" [class.typcn-chevron-left]="!isNavCollapsed"
                           [class.typcn-chevron-right]="isNavCollapsed"></i>
          </button>
        </div>

        <div class="nav-items">
          <ng-container *ngFor="let item of menuItems">
            <ng-container *ngIf="canShowMenuItem(item)">
              <!-- Menu Item -->
              <div class="nav-item" *ngIf="!item.children"
                   [routerLink]="item.route"
                   routerLinkActive="active"
                   [class.collapsed]="isNavCollapsed">
                <i class="typcn" [class]="item.icon"></i>
                <span class="label" *ngIf="!isNavCollapsed">{{ item.label }}</span>
              </div>

              <!-- Menu Group -->
              <div class="nav-group" *ngIf="item.children"
                   [class.expanded]="item.expanded"
                   [class.collapsed]="isNavCollapsed">
                <div class="nav-group-header" (click)="toggleGroup(item)">
                  <i class="typcn" [class]="item.icon"></i>
                  <span class="label" *ngIf="!isNavCollapsed">{{ item.label }}</span>
                  <i class="typcn" [class.typcn-chevron-right]="!item.expanded"
                                 [class.typcn-chevron-down]="item.expanded"
                                 *ngIf="!isNavCollapsed"></i>
                </div>

                <div class="nav-group-items" *ngIf="item.expanded && !isNavCollapsed">
                  <div class="nav-item" *ngFor="let child of item.children"
                       [routerLink]="child.route"
                       routerLinkActive="active"
                       [class.collapsed]="isNavCollapsed">
                    <i class="typcn" [class]="child.icon"></i>
                    <span class="label">{{ child.label }}</span>
                  </div>
                </div>
              </div>
            </ng-container>
          </ng-container>
        </div>
      </nav>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Header -->
        <header class="header">
          <div class="header-left">
            <button class="menu-toggle" (click)="toggleNav()">
              <i class="typcn typcn-th-menu"></i>
            </button>
            <div class="search-box">
              <i class="typcn typcn-zoom"></i>
              <input type="text" placeholder="Search...">
            </div>
          </div>

          <div class="header-right">
            <app-notifications-dropdown></app-notifications-dropdown>
            <app-messages-dropdown></app-messages-dropdown>
            <app-profile-dropdown
              [userName]="currentUser?.firstName + ' ' + currentUser?.lastName"
              [userRole]="currentUser?.role"
              [profileImage]="currentUser?.avatar"
              [options]="profileOptions">
            </app-profile-dropdown>
          </div>
        </header>

        <!-- Page Content -->
        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      height: 100vh;
      background: var(--body-bg);
    }

    .sidebar {
      width: 260px;
      background: var(--sidebar-bg);
      color: var(--sidebar-text);
      transition: width 0.3s ease;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
    }

    .nav-collapsed .sidebar {
      width: 60px;
    }

    .sidebar-header {
      height: 64px;
      padding: 0 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-color);
    }

    .logo {
      height: 32px;
      transition: all 0.3s ease;
    }

    .nav-collapsed .logo {
      width: 32px;
      overflow: hidden;
    }

    .nav-toggle {
      width: 28px;
      height: 28px;
      border: none;
      background: none;
      color: var(--sidebar-text);
      cursor: pointer;
    }

    .nav-items {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 0;
    }

    .nav-item {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      color: var(--sidebar-text);
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
    }

    .nav-item:hover {
      background: var(--sidebar-hover);
    }

    .nav-item.active {
      background: var(--primary-color);
      color: white;
    }

    .nav-item i {
      font-size: 1.25rem;
      margin-right: 1rem;
      width: 20px;
      text-align: center;
    }

    .nav-group {
      margin-bottom: 0.5rem;
    }

    .nav-group-header {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .nav-group-header:hover {
      background: var(--sidebar-hover);
    }

    .nav-group-header i {
      font-size: 1.25rem;
      margin-right: 1rem;
      width: 20px;
      text-align: center;
    }

    .nav-group-items {
      padding-left: 1rem;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .header {
      height: 64px;
      background: white;
      border-bottom: 1px solid var(--border-color);
      padding: 0 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .menu-toggle {
      width: 40px;
      height: 40px;
      border: none;
      background: none;
      color: var(--text-color);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .search-box {
      position: relative;
      width: 300px;
    }

    .search-box input {
      width: 100%;
      padding: 0.5rem 1rem 0.5rem 2.5rem;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      font-size: 0.875rem;
    }

    .search-box i {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .content {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
    }

    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        z-index: 100;
        transform: translateX(-100%);
      }

      .nav-collapsed .sidebar {
        transform: translateX(0);
      }

      .search-box {
        display: none;
      }
    }
  `]
})
export class AdminLayoutComponent {
  isNavCollapsed = false;
  currentUser = this.authService.currentUser;

  menuItems: (MenuItem & { expanded?: boolean })[] = [
    {
      label: 'Dashboard',
      icon: 'typcn-chart-bar',
      route: '/admin/dashboard'
    },
    {
      label: 'User Management',
      icon: 'typcn-user',
      requiredRole: [UserRole.SuperAdmin, UserRole.Admin],
      children: [
        {
          label: 'Users',
          icon: 'typcn-group',
          route: '/admin/users'
        },
        {
          label: 'Roles',
          icon: 'typcn-key',
          route: '/admin/roles',
          requiredRole: [UserRole.SuperAdmin]
        }
      ]
    },
    {
      label: 'Products',
      icon: 'typcn-shopping-cart',
      requiredRole: [UserRole.Admin, UserRole.Vendor],
      children: [
        {
          label: 'All Products',
          icon: 'typcn-th-list',
          route: '/admin/products'
        },
        {
          label: 'Categories',
          icon: 'typcn-tag',
          route: '/admin/categories'
        },
        {
          label: 'Inventory',
          icon: 'typcn-database',
          route: '/admin/inventory'
        }
      ]
    },
    {
      label: 'Content',
      icon: 'typcn-camera',
      requiredRole: [UserRole.Creator, UserRole.Marketing],
      children: [
        {
          label: 'Posts',
          icon: 'typcn-image',
          route: '/admin/posts'
        },
        {
          label: 'Reels',
          icon: 'typcn-video',
          route: '/admin/reels'
        },
        {
          label: 'Live Streams',
          icon: 'typcn-video-camera',
          route: '/admin/live'
        }
      ]
    },
    // Add more menu items for other roles
  ];

  profileOptions = [
    {
      label: 'My Profile',
      icon: 'typcn-user',
      action: () => this.navigateToProfile()
    },
    {
      label: 'Account Settings',
      icon: 'typcn-cog',
      action: () => this.navigateToSettings()
    },
    {
      label: 'Sign Out',
      icon: 'typcn-power',
      action: () => this.signOut()
    }
  ];

  constructor(private authService: AuthorizationService) {}

  toggleNav(): void {
    this.isNavCollapsed = !this.isNavCollapsed;
  }

  toggleGroup(item: MenuItem & { expanded?: boolean }): void {
    item.expanded = !item.expanded;
  }

  canShowMenuItem(item: MenuItem): boolean {
    if (!item.requiredRole && !item.requiredPermission) {
      return true;
    }

    if (item.requiredRole && this.authService.hasRole(item.requiredRole)) {
      return true;
    }

    if (item.requiredPermission && this.authService.hasPermission(item.requiredPermission)) {
      return true;
    }

    return false;
  }

  navigateToProfile(): void {
    // Implement profile navigation
  }

  navigateToSettings(): void {
    // Implement settings navigation
  }

  signOut(): void {
    this.authService.clearCurrentUser();
    // Implement sign out logic
  }
}