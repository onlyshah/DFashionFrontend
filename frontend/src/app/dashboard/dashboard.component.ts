import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { RBACService } from '../core/services/rbac.service';
import { AuthService } from '../auth/services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface DashboardModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  permissions?: string[];
  requiredRole?: string[];
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-wrapper">
      <!-- Header -->
      <div class="dashboard-header">
        <div class="header-content">
          <div>
            <h1>Welcome, {{ userName }}!</h1>
            <p class="role-badge">{{ userRole | titlecase }}</p>
          </div>
          <button class="logout-btn" (click)="logout()" title="Logout">
            <span>🚪</span> Logout
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading dashboard...</p>
      </div>

      <!-- Dashboard Content -->
      <div *ngIf="!isLoading" class="dashboard-container">
        <!-- Section Title -->
        <div class="dashboard-section">
          <h2>Available Modules</h2>
          <p class="subtitle">Access the modules you have permission to use</p>
        </div>

        <!-- Modules Grid -->
        <div class="modules-grid">
          <div
            *ngFor="let module of availableModules"
            class="module-card"
            (click)="navigateToModule(module.route)"
            [style.border-top-color]="module.color"
            role="button"
            tabindex="0"
            (keyup.enter)="navigateToModule(module.route)"
          >
            <div class="module-icon">{{ module.icon }}</div>
            <h3>{{ module.name }}</h3>
            <p>{{ module.description }}</p>
            <div class="module-action">
              <span>Access Module →</span>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="availableModules.length === 0" class="empty-state">
          <div class="empty-icon">🔒</div>
          <h3>No Modules Available</h3>
          <p>You don't have access to any modules. Please contact your administrator.</p>
        </div>

        <!-- Quick Stats (for admins) -->
        <div *ngIf="hasRole('admin') || hasRole('super_admin')" class="quick-stats">
          <h2>Dashboard Overview</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">—</div>
              <div class="stat-label">Total Users</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">—</div>
              <div class="stat-label">Active Orders</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">—</div>
              <div class="stat-label">Revenue</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">—</div>
              <div class="stat-label">Growth</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-wrapper {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 20px;
    }

    .dashboard-header {
      background: white;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      color: #333;
      margin: 0;
    }

    .role-badge {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      margin-top: 8px;
    }

    .logout-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;

      &:hover {
        background: #c82333;
        transform: translateY(-2px);
      }

      span {
        margin-right: 8px;
      }
    }

    .loading-state {
      text-align: center;
      padding: 60px 20px;

      .spinner {
        width: 50px;
        height: 50px;
        border: 4px solid rgba(0, 0, 0, 0.1);
        border-top-color: #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
      }

      p {
        color: #666;
        font-size: 16px;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    }

    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-section {
      background: white;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 30px;

      h2 {
        font-size: 24px;
        font-weight: 700;
        color: #333;
        margin: 0 0 10px 0;
      }

      .subtitle {
        color: #666;
        margin: 0;
      }
    }

    .modules-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 30px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .module-card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      border-top: 4px solid;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      }

      .module-icon {
        font-size: 40px;
        margin-bottom: 15px;
      }

      h3 {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        margin: 0 0 10px 0;
      }

      p {
        font-size: 14px;
        color: #666;
        margin: 0 0 15px 0;
        line-height: 1.5;
      }

      .module-action {
        color: #667eea;
        font-weight: 600;
        font-size: 14px;
      }
    }

    .empty-state {
      background: white;
      border-radius: 12px;
      padding: 60px 30px;
      text-align: center;

      .empty-icon {
        font-size: 60px;
        margin-bottom: 20px;
      }

      h3 {
        font-size: 20px;
        font-weight: 600;
        color: #333;
        margin: 0 0 10px 0;
      }

      p {
        color: #666;
        margin: 0;
      }
    }

    .quick-stats {
      background: white;
      border-radius: 12px;
      padding: 30px;

      h2 {
        font-size: 24px;
        font-weight: 700;
        color: #333;
        margin: 0 0 25px 0;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 25px;
      border-radius: 12px;
      text-align: center;

      .stat-value {
        font-size: 32px;
        font-weight: 700;
        margin-bottom: 10px;
      }

      .stat-label {
        font-size: 14px;
        opacity: 0.9;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  userName: string = 'User';
  userRole: string = '';
  availableModules: DashboardModule[] = [];
  isLoading = true;
  
  private destroy$ = new Subject<void>();

  // All available modules with permissions
  private readonly allModules: DashboardModule[] = [
    {
      id: 'users',
      name: 'User Management',
      description: 'Manage system users and permissions',
      icon: '👥',
      route: '/admin/users',
      requiredRole: ['super_admin', 'admin', 'manager'],
      color: '#667eea'
    },
    {
      id: 'roles',
      name: 'Roles & Permissions',
      description: 'Manage roles and assign permissions',
      icon: '🔐',
      route: '/admin/roles',
      requiredRole: ['super_admin'],
      color: '#764ba2'
    },
    {
      id: 'products',
      name: 'Products',
      description: 'Manage product catalog',
      icon: '📦',
      route: '/admin/products',
      requiredRole: ['super_admin', 'admin', 'vendor'],
      color: '#f093fb'
    },
    {
      id: 'orders',
      name: 'Orders',
      description: 'View and manage orders',
      icon: '📋',
      route: '/admin/orders',
      requiredRole: ['super_admin', 'admin', 'manager'],
      color: '#4facfe'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      description: 'View business analytics and reports',
      icon: '📊',
      route: '/admin/analytics',
      requiredRole: ['super_admin', 'admin', 'manager'],
      color: '#43e97b'
    },
    {
      id: 'content',
      name: 'Content Management',
      description: 'Manage posts, stories, and feeds',
      icon: '📝',
      route: '/admin/content',
      requiredRole: ['super_admin', 'admin'],
      color: '#fa709a'
    },
    {
      id: 'vendor',
      name: 'Vendor Management',
      description: 'Manage vendor accounts and verification',
      icon: '🏪',
      route: '/admin/vendor',
      requiredRole: ['super_admin', 'admin'],
      color: '#fee140'
    },
    {
      id: 'settings',
      name: 'System Settings',
      description: 'Configure system settings',
      icon: '⚙️',
      route: '/admin/settings',
      requiredRole: ['super_admin'],
      color: '#30b0c6'
    }
  ];

  constructor(
    private router: Router,
    private rbacService: RBACService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboard(): void {
    const user = this.authService.getCurrentUser();
    
    if (user) {
      this.userName = user?.user?.fullName || user?.fullName || 'User';
      this.userRole = user?.user?.role || user?.role || 'customer';
    }

    // Filter modules based on user role
    this.availableModules = this.allModules.filter(module => {
      if (!module.requiredRole) return true;
      return module.requiredRole.includes(this.userRole);
    });

    this.isLoading = false;
  }

  navigateToModule(route: string): void {
    this.router.navigate([route]);
  }

  hasPermission(permission: string): boolean {
    return this.rbacService.hasPermissionSync(permission);
  }

  hasRole(role: string): boolean {
    return this.rbacService.hasRoleSync(role);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}