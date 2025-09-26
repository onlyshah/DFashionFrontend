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
  templateUrl: './super-admin-panel.component.html',
  styleUrls: ['./super-admin-panel.component.css']
})

// ...existing code...
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
