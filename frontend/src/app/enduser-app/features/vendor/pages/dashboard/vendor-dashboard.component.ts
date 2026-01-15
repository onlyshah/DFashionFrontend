import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../../core/services/auth.service';
import { VendorService, VendorStats, MonthlyRevenue } from '../../../../../core/services/vendor.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-vendor-dashboard',
    imports: [CommonModule, RouterModule],
    styles: [`
    .vendor-dashboard {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .dashboard-header {
      margin-bottom: 30px;
    }

    .dashboard-header h1 {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .dashboard-header p {
      color: #666;
      font-size: 1.1rem;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 3rem;
      margin-bottom: 2rem;
    }

    .loading-spinner {
      text-align: center;
      color: #666;
    }

    .loading-spinner i {
      font-size: 2rem;
      margin-bottom: 1rem;
      color: #007bff;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .stat-card {
      background: white;
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      background: #007bff;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
    }

    .stat-content h3 {
      font-size: 1.8rem;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .stat-content p {
      color: #666;
      font-size: 0.9rem;
    }

    .quick-actions, .recent-activity, .vendor-menu {
      margin-bottom: 40px;
    }

    .quick-actions h2, .recent-activity h2, .vendor-menu h2 {
      font-size: 1.4rem;
      font-weight: 600;
      margin-bottom: 20px;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .action-card {
      background: white;
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s;
    }

    .action-card:hover {
      border-color: #007bff;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,123,255,0.15);
    }

    .action-icon {
      width: 50px;
      height: 50px;
      background: #f8f9fa;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #007bff;
      font-size: 1.2rem;
    }

    .action-content h3 {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .action-content p {
      color: #666;
      font-size: 0.9rem;
    }

    .activity-list {
      background: white;
      border: 1px solid #eee;
      border-radius: 8px;
      overflow: hidden;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      border-bottom: 1px solid #f5f5f5;
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      background: #f8f9fa;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #007bff;
    }

    .activity-content p {
      margin-bottom: 4px;
      font-weight: 500;
    }

    .activity-time {
      color: #666;
      font-size: 0.85rem;
    }

    .menu-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .menu-item {
      background: white;
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s;
    }

    .menu-item:hover {
      border-color: #007bff;
      background: #f8f9ff;
    }

    .menu-item i {
      font-size: 1.5rem;
      color: #007bff;
    }

    .menu-item span {
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }

      .menu-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `],
    templateUrl: './vendor-dashboard.component.html'
})
export class VendorDashboardComponent implements OnInit {
    currentUser: any = null;
    stats: VendorStats = {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        lowStockProducts: 0,
        recentOrdersCount: 0
    };
    monthlyRevenue: MonthlyRevenue[] = [];
    loading = false;

    recentActivity: Array<{
        icon: string;
        message: string;
        timestamp: Date;
    }> = [];

    constructor(
        private authService: AuthService,
        private vendorService: VendorService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        this.loadUserData();
        this.loadDashboardData();
    }

    loadUserData() {
        this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
        });
    }

    loadDashboardData() {
        this.loading = true;

        this.vendorService.getDashboardStats().subscribe({
            next: (response) => {
                if (response.success && response.data) {
                    this.stats = response.data.stats;
                    this.monthlyRevenue = response.data.monthlyRevenue;
                    this.vendorService.updateStats(this.stats);
                    this.generateRecentActivity();
                } else {
                    this.snackBar.open('Failed to load dashboard data', 'Close', { duration: 3000 });
                }
                this.loading = false;
            },
            error: (error) => {
                console.error('Dashboard data loading error:', error);
                this.snackBar.open('Failed to load dashboard data', 'Close', { duration: 3000 });
                this.loading = false;
            }
        });
    }

    generateRecentActivity() {
        this.recentActivity = [];

        if (this.stats.recentOrdersCount > 0) {
            this.recentActivity.push({
                icon: 'fas fa-shopping-cart text-primary',
                message: `${this.stats.recentOrdersCount} new orders in the last 30 days`,
                timestamp: new Date()
            });
        }

        if (this.stats.lowStockProducts > 0) {
            this.recentActivity.push({
                icon: 'fas fa-exclamation-triangle text-warning',
                message: `${this.stats.lowStockProducts} products are running low on stock`,
                timestamp: new Date()
            });
        }

        if (this.stats.pendingOrders > 0) {
            this.recentActivity.push({
                icon: 'fas fa-clock text-info',
                message: `${this.stats.pendingOrders} orders are pending processing`,
                timestamp: new Date()
            });
        }

        // Add some default activities if none exist
        if (this.recentActivity.length === 0) {
            this.recentActivity = [
                {
                    icon: 'fas fa-chart-line text-success',
                    message: 'Dashboard loaded successfully',
                    timestamp: new Date()
                }
            ];
        }
    }

    formatCurrency(amount: number): string {
        return this.vendorService.formatCurrency(amount);
    }

    refreshData() {
        this.loadDashboardData();
    }
}
