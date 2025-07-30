import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { IonicModule } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { AdminAuthService } from '../../../admin/services/admin-auth.service';
import { PermissionService } from '../../../admin/services/permission.service';
import { RBACService } from '../../../core/services/rbac.service';

// Dashboard Feature Components
import { AdminDashboardFeaturesComponent } from './features/admin-dashboard-features.component';
import { UserSocialDashboardComponent } from './features/user-social-dashboard.component';
import { SharedDashboardFeaturesComponent } from './features/shared-dashboard-features.component';

// RBAC Directives
import {
  HasPermissionDirective,
  HasFeatureDirective,
  HasRoleDirective,
  IsAdminDirective,
  IsSuperAdminDirective,
  IsVendorDirective,
  IsCustomerDirective
} from '../../../core/directives/has-permission.directive';

export interface DashboardUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  avatar?: string;
  permissions?: string[];
  department?: string;
}

export interface DashboardConfig {
  showSidebar: boolean;
  showTopBar: boolean;
  layout: 'admin' | 'social' | 'mobile';
  theme: 'light' | 'dark';
  features: string[];
}

@Component({
  selector: 'app-unified-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    IonicModule,
    AdminDashboardFeaturesComponent,
    UserSocialDashboardComponent,
    SharedDashboardFeaturesComponent,
    HasPermissionDirective,
    HasFeatureDirective,
    HasRoleDirective,
    IsAdminDirective,
    IsSuperAdminDirective,
    IsVendorDirective,
    IsCustomerDirective
  ],
  templateUrl: './unified-dashboard.component.html',
  styleUrls: ['./unified-dashboard.component.scss']
})
export class UnifiedDashboardComponent implements OnInit, OnDestroy {
  currentUser: DashboardUser | null = null;
  dashboardConfig: DashboardConfig = {
    showSidebar: true,
    showTopBar: true,
    layout: 'social',
    theme: 'light',
    features: []
  };

  // UI State
  isMobile = false;
  sidebarOpen = true;
  showUserMenu = false;
  notificationCount = 0;
  
  // Role-based feature flags
  isAdmin = false;
  isSuperAdmin = false;
  isVendor = false;
  isEndUser = false;

  // Available features based on role
  availableFeatures: string[] = [];
  
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private adminAuthService: AdminAuthService,
    private permissionService: PermissionService,
    private rbacService: RBACService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.checkMobileView();
    this.loadCurrentUser();
    this.setupResponsiveListener();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private checkMobileView() {
    this.isMobile = window.innerWidth <= 768;
    this.updateLayoutForDevice();
  }

  private setupResponsiveListener() {
    window.addEventListener('resize', () => {
      this.checkMobileView();
    });
  }

  private loadCurrentUser() {
    // Try admin auth first
    const adminSub = this.adminAuthService.currentUser$.subscribe(adminUser => {
      if (adminUser) {
        this.setAdminUser(adminUser);
        return;
      }
      
      // Fallback to regular auth
      const authSub = this.authService.currentUser$.subscribe(user => {
        if (user) {
          this.setRegularUser(user);
        } else {
          this.handleUnauthenticated();
        }
      });
      this.subscriptions.push(authSub);
    });
    this.subscriptions.push(adminSub);
  }

  private setAdminUser(user: any) {
    this.currentUser = {
      id: user.id || user._id,
      email: user.email,
      fullName: user.fullName || user.name || user.email,
      role: user.role,
      avatar: user.avatar,
      permissions: user.permissions || [],
      department: user.department
    };

    this.determineUserRole();
    this.configureAdminDashboard();
    this.loadAvailableFeatures();
  }

  private setRegularUser(user: any) {
    this.currentUser = {
      id: user.id || user._id,
      email: user.email,
      fullName: user.fullName || user.name || user.email,
      role: user.role || 'customer',
      avatar: user.avatar,
      permissions: []
    };

    this.determineUserRole();
    this.configureSocialDashboard();
    this.loadAvailableFeatures();
  }

  private determineUserRole() {
    if (!this.currentUser) return;

    const role = this.currentUser.role.toLowerCase();
    
    this.isSuperAdmin = role === 'super_admin';
    this.isAdmin = role === 'admin' || this.isSuperAdmin;
    this.isVendor = role === 'vendor';
    this.isEndUser = !this.isAdmin && !this.isVendor;
  }

  private configureAdminDashboard() {
    this.dashboardConfig = {
      showSidebar: true,
      showTopBar: true,
      layout: 'admin',
      theme: 'light',
      features: this.getAdminFeatures()
    };
    this.updateLayoutForDevice();
  }

  private configureSocialDashboard() {
    this.dashboardConfig = {
      showSidebar: false,
      showTopBar: true,
      layout: this.isMobile ? 'mobile' : 'social',
      theme: 'light',
      features: this.getSocialFeatures()
    };
    this.updateLayoutForDevice();
  }

  private updateLayoutForDevice() {
    if (this.isMobile) {
      this.sidebarOpen = false;
      this.dashboardConfig.showSidebar = this.isAdmin; // Only show sidebar for admin on mobile
    } else {
      this.sidebarOpen = this.dashboardConfig.showSidebar;
    }
    this.cdr.detectChanges();
  }

  private getAdminFeatures(): string[] {
    const features = ['profile', 'notifications'];
    
    if (this.isSuperAdmin) {
      return [
        ...features,
        'user-management',
        'role-management', 
        'system-monitoring',
        'system-logs',
        'application-settings',
        'analytics',
        'product-management',
        'order-management',
        'content-management'
      ];
    }
    
    if (this.isAdmin) {
      return [
        ...features,
        'user-management',
        'product-management',
        'order-management',
        'analytics',
        'content-management'
      ];
    }

    return features;
  }

  private getSocialFeatures(): string[] {
    const features = ['profile', 'notifications'];
    
    if (this.isVendor) {
      return [
        ...features,
        'vendor-products',
        'vendor-orders',
        'vendor-analytics',
        'social-feed',
        'stories',
        'posts'
      ];
    }
    
    // End user features
    return [
      ...features,
      'social-feed',
      'stories',
      'posts',
      'shopping',
      'wishlist',
      'cart',
      'orders'
    ];
  }

  private loadAvailableFeatures() {
    this.availableFeatures = this.dashboardConfig.features;
    this.loadNotificationCount();
  }

  private loadNotificationCount() {
    // TODO: Load actual notification count from service
    this.notificationCount = 0;
  }

  private handleUnauthenticated() {
    this.router.navigate(['/auth/login']);
  }

  // UI Event Handlers
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  // Navigation Methods
  navigateToProfile() {
    this.showUserMenu = false;
    if (this.isAdmin) {
      this.router.navigate(['/admin/profile']);
    } else {
      this.router.navigate(['/profile']);
    }
  }

  navigateToSettings() {
    this.showUserMenu = false;
    if (this.isAdmin) {
      this.router.navigate(['/admin/settings']);
    } else {
      this.router.navigate(['/profile/settings']);
    }
  }

  navigateToNotifications() {
    this.router.navigate(['/notifications']);
  }

  logout() {
    this.showUserMenu = false;
    if (this.isAdmin) {
      this.adminAuthService.logout();
    } else {
      this.authService.logout();
    }
    this.router.navigate(['/auth/login']);
  }

  // Feature Access Control
  hasFeature(feature: string): boolean {
    return this.rbacService.hasFeatureSync(feature);
  }

  hasPermission(permission: string): boolean {
    return this.rbacService.hasPermissionSync(permission);
  }

  // Theme and Layout
  toggleTheme() {
    this.dashboardConfig.theme = this.dashboardConfig.theme === 'light' ? 'dark' : 'light';
  }

  getDashboardClasses(): string {
    const classes = [
      `layout-${this.dashboardConfig.layout}`,
      `theme-${this.dashboardConfig.theme}`,
      this.isMobile ? 'mobile' : 'desktop'
    ];
    
    if (this.sidebarOpen && this.dashboardConfig.showSidebar) {
      classes.push('sidebar-open');
    }
    
    return classes.join(' ');
  }
}
