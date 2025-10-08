import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Subscription } from 'rxjs';

import { AdminApiService } from '../../../../admin/services/admin-api.service';
import { PermissionService } from '../../../../admin/services/permission.service';

export interface AdminStats {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    newUsersToday: number;
    ordersToday: number;
    revenueToday: number;
    systemHealth: 'good' | 'warning' | 'critical';
}

export interface QuickAction {
    title: string;
    description: string;
    icon: string;
    route: string;
    permission: string;
    color: string;
}

@Component({
    selector: 'app-admin-dashboard-features',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatGridListModule,
        MatProgressBarModule,
        MatSlideToggleModule
    ],
    styles: [`
    .admin-dashboard-features {
      max-width: 1200px;
      margin: 0 auto;
    }

    .welcome-section {
      margin-bottom: 32px;

      h1 {
        font-size: 28px;
        font-weight: 600;
        color: #333;
        margin-bottom: 8px;
      }

      p {
        color: #6c757d;
        font-size: 16px;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 32px;

      .stat-card {
        .stat-content {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .stat-info {
            h3 {
              font-size: 32px;
              font-weight: 700;
              margin: 0 0 8px 0;
              color: #333;
            }

            p {
              font-size: 14px;
              color: #6c757d;
              margin: 0 0 8px 0;
            }

            .stat-change {
              display: flex;
              align-items: center;
              font-size: 12px;
              font-weight: 600;

              mat-icon {
                font-size: 16px;
                margin-right: 4px;
              }

              &.positive {
                color: #28a745;
              }

              &.negative {
                color: #dc3545;
              }

              &.neutral {
                color: #6c757d;
              }
            }
          }

          .stat-icon {
            width: 60px;
            height: 60px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;

            mat-icon {
              color: white;
              font-size: 28px;
            }
          }
        }
      }
    }

    .quick-actions-card {
      margin-bottom: 32px;

      .quick-actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;

        .quick-action-btn {
          height: 80px;
          display: flex;
          align-items: center;
          padding: 16px;
          color: white;
          border: none;

          mat-icon {
            font-size: 24px;
            margin-right: 12px;
          }

          .action-text {
            text-align: left;

            .action-title {
              display: block;
              font-weight: 600;
              margin-bottom: 4px;
            }

            .action-desc {
              display: block;
              font-size: 12px;
              opacity: 0.9;
            }
          }
        }
      }
    }

    .system-health-card {
      margin-bottom: 32px;

      .health-indicators {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 20px;

        .health-item {
          text-align: center;

          .health-label {
            font-size: 12px;
            color: #6c757d;
            margin-bottom: 8px;
          }

          .health-status {
            font-weight: 600;
            padding: 4px 8px;
            border-radius: 4px;

            &.good {
              background: #d4edda;
              color: #155724;
            }

            &.warning {
              background: #fff3cd;
              color: #856404;
            }

            &.critical {
              background: #f8d7da;
              color: #721c24;
            }
          }

          .health-value {
            font-weight: 600;
            color: #333;
          }
        }
      }
    }

    .recent-activity-card {
      .activity-list {
        .activity-item {
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #e9ecef;

          &:last-child {
            border-bottom: none;
          }

          .activity-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;

            mat-icon {
              color: white;
              font-size: 20px;
            }
          }

          .activity-content {
            flex: 1;

            .activity-title {
              font-weight: 600;
              color: #333;
              margin-bottom: 4px;
            }

            .activity-description {
              font-size: 14px;
              color: #6c757d;
              margin-bottom: 4px;
            }

            .activity-time {
              font-size: 12px;
              color: #adb5bd;
            }
          }
        }
      }
    }

    // Super Admin Styles
    .super-admin-section {
      margin-top: 32px;

      .role-management-card,
      .system-config-card,
      .security-overview-card {
        margin-bottom: 32px;
      }

      .role-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;

        .role-stat {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          background: #f8f9fa;

          .role-info {
            h4 {
              font-size: 24px;
              font-weight: 700;
              margin: 0 0 4px 0;
              color: #333;
            }

            p {
              font-size: 14px;
              color: #6c757d;
              margin: 0;
            }
          }

          .role-actions {
            button {
              color: #007bff;
            }
          }
        }
      }

      .config-options {
        .config-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          border-bottom: 1px solid #e9ecef;

          &:last-child {
            border-bottom: none;
          }

          .config-info {
            h6 {
              font-size: 14px;
              font-weight: 600;
              margin: 0 0 4px 0;
              color: #333;
            }

            p {
              font-size: 12px;
              color: #6c757d;
              margin: 0;
            }
          }
        }
      }

      .security-metrics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;

        .security-metric {
          display: flex;
          align-items: center;

          .metric-icon {
            width: 50px;
            height: 50px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 16px;

            mat-icon {
              color: white;
              font-size: 24px;
            }
          }

          .metric-info {
            h4 {
              font-size: 24px;
              font-weight: 700;
              margin: 0 0 4px 0;
              color: #333;
            }

            p {
              font-size: 12px;
              color: #6c757d;
              margin: 0;
            }
          }
        }
      }
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .quick-actions-grid {
        grid-template-columns: 1fr;
      }

      .health-indicators {
        grid-template-columns: repeat(2, 1fr);
      }

      .super-admin-section {
        .role-stats {
          grid-template-columns: 1fr;
        }

        .security-metrics {
          grid-template-columns: 1fr;
        }
      }
    }
  `],
    templateUrl: './admin-dashboard-features.component.html'
})
export class AdminDashboardFeaturesComponent implements OnInit, OnDestroy {
    @Input() currentUser: any;
    @Input() availableFeatures: string[] = [];

    adminStats: AdminStats = {
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        newUsersToday: 0,
        ordersToday: 0,
        revenueToday: 0,
        systemHealth: 'good'
    };

    statsCards: any[] = [];
    quickActions: QuickAction[] = [];
    systemHealth: any = {};
    recentActivities: any[] = [];

    // Super Admin specific data
    isSuperAdmin = false;
    roleStats: any[] = [];
    systemConfig: any = {
        maintenanceMode: false,
        allowRegistration: true,
        emailNotifications: true
    };
    securityMetrics: any = {
        successfulLogins: 0,
        failedLogins: 0,
        blockedIPs: 0
    };

    private subscriptions: Subscription[] = [];

    constructor(
        private router: Router,
        private adminApiService: AdminApiService,
        private permissionService: PermissionService
    ) { }

    ngOnInit() {
        this.checkSuperAdminStatus();
        this.loadDashboardData();
        this.setupStatsCards();
        this.setupQuickActions();
        this.loadSystemHealth();
        this.loadRecentActivities();

        if (this.isSuperAdmin) {
            this.loadSuperAdminData();
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    private loadDashboardData() {
        // Load real dashboard data from API
        const sub = this.adminApiService.getDashboardStats().subscribe({
            next: (stats) => {
                this.adminStats = stats;
                this.setupStatsCards();
            },
            error: (error) => {
                console.error('Failed to load dashboard stats:', error);
                // Use default values
                this.setupStatsCards();
            }
        });
        this.subscriptions.push(sub);
    }

    private setupStatsCards() {
        this.statsCards = [
            {
                title: 'Total Users',
                value: this.adminStats.totalUsers,
                icon: 'people',
                color: '#007bff',
                change: `+${this.adminStats.newUsersToday} today`,
                changeType: 'positive',
                changeIcon: 'trending_up'
            },
            {
                title: 'Total Products',
                value: this.adminStats.totalProducts,
                icon: 'inventory',
                color: '#28a745',
                change: 'Active products',
                changeType: 'neutral',
                changeIcon: 'info'
            },
            {
                title: 'Total Orders',
                value: this.adminStats.totalOrders,
                icon: 'shopping_cart',
                color: '#ffc107',
                change: `+${this.adminStats.ordersToday} today`,
                changeType: 'positive',
                changeIcon: 'trending_up'
            },
            {
                title: 'Total Revenue',
                value: this.adminStats.totalRevenue,
                icon: 'attach_money',
                color: '#17a2b8',
                change: `+$${this.adminStats.revenueToday} today`,
                changeType: 'positive',
                changeIcon: 'trending_up'
            }
        ];
    }

    private setupQuickActions() {
        this.quickActions = [
            {
                title: 'Manage Users',
                description: 'View and manage user accounts',
                icon: 'people',
                route: '/admin/users',
                permission: 'users:view',
                color: '#007bff'
            },
            {
                title: 'Add Product',
                description: 'Create new product listing',
                icon: 'add_box',
                route: '/admin/products/create',
                permission: 'products:create',
                color: '#28a745'
            },
            {
                title: 'View Orders',
                description: 'Monitor recent orders',
                icon: 'receipt_long',
                route: '/admin/orders',
                permission: 'orders:view',
                color: '#ffc107'
            },
            {
                title: 'System Settings',
                description: 'Configure application settings',
                icon: 'settings',
                route: '/admin/settings',
                permission: 'settings:manage',
                color: '#6f42c1'
            }
        ].filter(action => this.hasPermission(action.permission));
    }

    private loadSystemHealth() {
        this.systemHealth = {
            server: 'good',
            database: 'good',
            apiResponseTime: 45,
            activeUsers: 127
        };
    }

    private loadRecentActivities() {
        this.recentActivities = [
            {
                title: 'New user registered',
                description: 'john.doe@example.com joined the platform',
                timestamp: new Date(),
                icon: 'person_add',
                color: '#007bff'
            },
            {
                title: 'Product updated',
                description: 'Nike Air Max 270 details modified',
                timestamp: new Date(Date.now() - 300000),
                icon: 'edit',
                color: '#28a745'
            },
            {
                title: 'Order completed',
                description: 'Order #12345 has been fulfilled',
                timestamp: new Date(Date.now() - 600000),
                icon: 'check_circle',
                color: '#ffc107'
            }
        ];
    }

    navigateToAction(action: QuickAction) {
        if (this.hasPermission(action.permission)) {
            this.router.navigate([action.route]);
        }
    }

    hasFeature(feature: string): boolean {
        return this.availableFeatures.includes(feature);
    }

    hasPermission(permission: string): boolean {
        return this.permissionService.hasPermission(permission);
    }

    // Super Admin Methods
    private checkSuperAdminStatus() {
        this.isSuperAdmin = this.currentUser?.role === 'super_admin';
    }

    private loadSuperAdminData() {
        this.loadRoleStats();
        this.loadSystemConfig();
        this.loadSecurityMetrics();
    }

    private loadRoleStats() {
        // Load role statistics from API
        this.roleStats = [
            { id: 'super_admin', name: 'Super Admins', count: 1 },
            { id: 'admin', name: 'Administrators', count: 5 },
            { id: 'manager', name: 'Managers', count: 12 },
            { id: 'vendor', name: 'Vendors', count: 45 },
            { id: 'customer', name: 'Customers', count: 1250 }
        ];
    }

    private loadSystemConfig() {
        // Load system configuration from API
        const sub = this.adminApiService.getSystemConfig().subscribe({
            next: (config) => {
                this.systemConfig = config;
            },
            error: (error) => {
                console.error('Failed to load system config:', error);
            }
        });
        this.subscriptions.push(sub);
    }

    private loadSecurityMetrics() {
        // Load security metrics from API
        this.securityMetrics = {
            successfulLogins: 1247,
            failedLogins: 23,
            blockedIPs: 5
        };
    }

    // Super Admin Actions
    manageRole(roleId: string) {
        this.router.navigate(['/admin/roles', roleId]);
    }

    toggleMaintenanceMode(event: any) {
        this.systemConfig.maintenanceMode = event.checked;
        // TODO: Call API to update maintenance mode
        console.log('Maintenance mode:', event.checked);
    }

    toggleRegistration(event: any) {
        this.systemConfig.allowRegistration = event.checked;
        // TODO: Call API to update registration setting
        console.log('Allow registration:', event.checked);
    }

    toggleEmailNotifications(event: any) {
        this.systemConfig.emailNotifications = event.checked;
        // TODO: Call API to update email notifications
        console.log('Email notifications:', event.checked);
    }
}
