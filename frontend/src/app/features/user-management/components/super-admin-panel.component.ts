import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';

import { UserManagementService } from '../services/user-management.service';
import { NotificationService } from '../../../core/services/notification.service';

interface SystemStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  systemHealth: {
    cpu: number;
    memory: number;
    storage: number;
    uptime: string;
  };
  recentActivity: Array<{
    type: string;
    message: string;
    timestamp: Date;
    severity: 'info' | 'warning' | 'error';
  }>;
}

@Component({
  selector: 'app-super-admin-panel',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="super-admin-panel" *ngIf="isSuperAdmin">
      <div class="panel-header">
        <h2>
          <mat-icon>admin_panel_settings</mat-icon>
          Super Admin Control Panel
        </h2>
        <p>Complete system overview and management tools</p>
      </div>

      <mat-tab-group class="admin-tabs">
        <!-- System Overview Tab -->
        <mat-tab label="System Overview">
          <div class="tab-content">
            <!-- System Health Cards -->
            <div class="health-grid">
              <mat-card class="health-card">
                <mat-card-content>
                  <div class="health-item">
                    <div class="health-icon cpu">
                      <mat-icon>memory</mat-icon>
                    </div>
                    <div class="health-details">
                      <h3>{{ systemStats.systemHealth.cpu }}%</h3>
                      <p>CPU Usage</p>
                      <div class="health-bar">
                        <div class="health-progress" 
                             [style.width.%]="systemStats.systemHealth.cpu"
                             [class.warning]="systemStats.systemHealth.cpu > 70"
                             [class.danger]="systemStats.systemHealth.cpu > 90">
                        </div>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="health-card">
                <mat-card-content>
                  <div class="health-item">
                    <div class="health-icon memory">
                      <mat-icon>storage</mat-icon>
                    </div>
                    <div class="health-details">
                      <h3>{{ systemStats.systemHealth.memory }}%</h3>
                      <p>Memory Usage</p>
                      <div class="health-bar">
                        <div class="health-progress" 
                             [style.width.%]="systemStats.systemHealth.memory"
                             [class.warning]="systemStats.systemHealth.memory > 70"
                             [class.danger]="systemStats.systemHealth.memory > 90">
                        </div>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="health-card">
                <mat-card-content>
                  <div class="health-item">
                    <div class="health-icon storage">
                      <mat-icon>hard_drive</mat-icon>
                    </div>
                    <div class="health-details">
                      <h3>{{ systemStats.systemHealth.storage }}%</h3>
                      <p>Storage Usage</p>
                      <div class="health-bar">
                        <div class="health-progress" 
                             [style.width.%]="systemStats.systemHealth.storage"
                             [class.warning]="systemStats.systemHealth.storage > 70"
                             [class.danger]="systemStats.systemHealth.storage > 90">
                        </div>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="health-card">
                <mat-card-content>
                  <div class="health-item">
                    <div class="health-icon uptime">
                      <mat-icon>schedule</mat-icon>
                    </div>
                    <div class="health-details">
                      <h3>{{ systemStats.systemHealth.uptime }}</h3>
                      <p>System Uptime</p>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <!-- System Stats -->
            <div class="stats-overview">
              <mat-card class="overview-card">
                <mat-card-header>
                  <mat-card-title>System Statistics</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="stats-grid">
                    <div class="stat-item">
                      <div class="stat-value">{{ systemStats.totalUsers }}</div>
                      <div class="stat-label">Total Users</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-value">{{ systemStats.totalProducts }}</div>
                      <div class="stat-label">Total Products</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-value">{{ systemStats.totalOrders }}</div>
                      <div class="stat-label">Total Orders</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-value">\${{ formatNumber(systemStats.totalRevenue) }}</div>
                      <div class="stat-label">Total Revenue</div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <!-- User Management Tab -->
        <mat-tab label="User Management">
          <div class="tab-content">
            <div class="management-actions">
              <button mat-raised-button color="primary" (click)="exportAllUsers()">
                <mat-icon>download</mat-icon>
                Export All Users
              </button>
              <button mat-raised-button color="accent" (click)="bulkUserActions()">
                <mat-icon>group</mat-icon>
                Bulk Actions
              </button>
              <button mat-raised-button color="warn" (click)="systemMaintenance()">
                <mat-icon>build</mat-icon>
                System Maintenance
              </button>
            </div>

            <!-- Role Distribution Chart -->
            <mat-card class="chart-card">
              <mat-card-header>
                <mat-card-title>User Role Distribution</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="role-distribution">
                  <div *ngFor="let role of getRoleDistribution()" class="role-item">
                    <div class="role-info">
                      <span class="role-name">{{ role.name | titlecase }}</span>
                      <span class="role-count">{{ role.count }}</span>
                    </div>
                    <div class="role-bar">
                      <div class="role-progress" 
                           [style.width.%]="role.percentage"
                           [style.background-color]="getRoleColor(role.name)">
                      </div>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- System Logs Tab -->
        <mat-tab label="System Logs">
          <div class="tab-content">
            <mat-card class="logs-card">
              <mat-card-header>
                <mat-card-title>Recent System Activity</mat-card-title>
                <button mat-icon-button (click)="refreshLogs()">
                  <mat-icon>refresh</mat-icon>
                </button>
              </mat-card-header>
              <mat-card-content>
                <div class="logs-container">
                  <div *ngFor="let activity of systemStats.recentActivity" 
                       class="log-entry"
                       [class]="'log-' + activity.severity">
                    <div class="log-icon">
                      <mat-icon>{{ getLogIcon(activity.type) }}</mat-icon>
                    </div>
                    <div class="log-content">
                      <div class="log-message">{{ activity.message }}</div>
                      <div class="log-timestamp">{{ formatDate(activity.timestamp) }}</div>
                    </div>
                    <mat-chip class="severity-chip" [class]="'chip-' + activity.severity">
                      {{ activity.severity | titlecase }}
                    </mat-chip>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Advanced Settings Tab -->
        <mat-tab label="Advanced Settings">
          <div class="tab-content">
            <div class="settings-grid">
              <mat-card class="setting-card">
                <mat-card-header>
                  <mat-card-title>Database Management</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="setting-actions">
                    <button mat-stroked-button (click)="backupDatabase()">
                      <mat-icon>backup</mat-icon>
                      Backup Database
                    </button>
                    <button mat-stroked-button (click)="optimizeDatabase()">
                      <mat-icon>tune</mat-icon>
                      Optimize Database
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="setting-card">
                <mat-card-header>
                  <mat-card-title>Security Settings</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="setting-actions">
                    <button mat-stroked-button (click)="auditSecurity()">
                      <mat-icon>security</mat-icon>
                      Security Audit
                    </button>
                    <button mat-stroked-button (click)="resetSessions()">
                      <mat-icon>logout</mat-icon>
                      Reset All Sessions
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="setting-card">
                <mat-card-header>
                  <mat-card-title>System Configuration</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="setting-actions">
                    <button mat-stroked-button (click)="editConfig()">
                      <mat-icon>settings</mat-icon>
                      Edit Configuration
                    </button>
                    <button mat-stroked-button (click)="restartServices()">
                      <mat-icon>restart_alt</mat-icon>
                      Restart Services
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styleUrls: ['./super-admin-panel.component.scss']
})
export class SuperAdminPanelComponent implements OnInit {
  @Input() currentUser: any;
  @Input() userStats: any;

  isSuperAdmin = false;
  loading = false;
  
  systemStats: SystemStats = {
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    systemHealth: {
      cpu: 45,
      memory: 62,
      storage: 38,
      uptime: '15d 8h 32m'
    },
    recentActivity: []
  };

  constructor(
    private userManagementService: UserManagementService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.checkSuperAdminAccess();
    if (this.isSuperAdmin) {
      this.loadSystemStats();
    }
  }

  private checkSuperAdminAccess(): void {
    this.isSuperAdmin = this.currentUser?.role === 'super_admin';
  }

  private loadSystemStats(): void {
    this.loading = true;
    
    // Load system statistics
    // This would typically call multiple services to get comprehensive data
    this.systemStats = {
      ...this.systemStats,
      totalUsers: this.userStats?.totalUsers || 0,
      recentActivity: [
        {
          type: 'user_login',
          message: 'New user login from admin@example.com',
          timestamp: new Date(),
          severity: 'info'
        },
        {
          type: 'system_warning',
          message: 'High memory usage detected',
          timestamp: new Date(Date.now() - 300000),
          severity: 'warning'
        },
        {
          type: 'security',
          message: 'Failed login attempt detected',
          timestamp: new Date(Date.now() - 600000),
          severity: 'error'
        }
      ]
    };
    
    this.loading = false;
  }

  getRoleDistribution(): Array<{name: string, count: number, percentage: number}> {
    if (!this.userStats?.usersByRole) return [];
    
    const total = this.userStats.totalUsers;
    return Object.entries(this.userStats.usersByRole).map(([role, count]) => ({
      name: role,
      count: count as number,
      percentage: total > 0 ? ((count as number) / total) * 100 : 0
    }));
  }

  getRoleColor(role: string): string {
    const colors: { [key: string]: string } = {
      'super_admin': '#e91e63',
      'admin': '#f44336',
      'manager': '#ff9800',
      'vendor': '#2196f3',
      'customer': '#4caf50'
    };
    return colors[role] || '#666666';
  }

  getLogIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'user_login': 'login',
      'system_warning': 'warning',
      'security': 'security',
      'database': 'storage',
      'api': 'api'
    };
    return icons[type] || 'info';
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat().format(num);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString();
  }

  // Action methods
  exportAllUsers(): void {
    this.notificationService.info('Export', 'Exporting all users data...');
  }

  bulkUserActions(): void {
    this.notificationService.info('Bulk Actions', 'Opening bulk user actions...');
  }

  systemMaintenance(): void {
    this.notificationService.info('Maintenance', 'Opening system maintenance panel...');
  }

  refreshLogs(): void {
    this.loadSystemStats();
    this.notificationService.success('Success', 'System logs refreshed');
  }

  backupDatabase(): void {
    this.notificationService.info('Database', 'Starting database backup...');
  }

  optimizeDatabase(): void {
    this.notificationService.info('Database', 'Starting database optimization...');
  }

  auditSecurity(): void {
    this.notificationService.info('Security', 'Starting security audit...');
  }

  resetSessions(): void {
    this.notificationService.warning('Confirm', 'This will log out all users. Are you sure?');
  }

  editConfig(): void {
    this.notificationService.info('Configuration', 'Opening system configuration...');
  }

  restartServices(): void {
    this.notificationService.warning('Confirm', 'This will restart system services. Are you sure?');
  }
}
