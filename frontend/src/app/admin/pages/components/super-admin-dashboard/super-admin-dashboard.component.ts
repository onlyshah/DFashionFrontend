import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminApiService } from '../../../services/admin-api.service';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';

interface SuperAdminStats {
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
  }>;
  metrics: {
    totalRevenue: number;
    newUsers: number;
    activeUsers: number;
    pendingOrders: number;
  };
}

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './super-admin-dashboard.component.html',
  styleUrls: ['./super-admin-dashboard.component.scss']
})
export class SuperAdminDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  isLoading = true;
  dashboardData: SuperAdminStats | null = null;
  stats: any = {
    totalUsers: 0,
    totalRevenue: 0,
    activeVendors: 0,
    systemHealth: 0,
    userGrowth: 0,
    revenueGrowth: 0,
    vendorGrowth: 0
  };
  recentActivities: any[] = [];

  constructor(private adminApiService: AdminApiService) {}

  ngOnInit(): void {
    console.log('🚀 SuperAdminDashboard Component Initialized');
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    console.log('🔌 SuperAdminDashboard Component Destroyed');
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    console.log('📊 Loading dashboard data...');
    
    // Load data from multiple API endpoints
    const dashboardMetrics$ = this.adminApiService.getGeneralDashboardData().pipe(
      takeUntil(this.destroy$)
    );

    const users$ = this.adminApiService.getUsers().pipe(
      takeUntil(this.destroy$)
    );

    // Combine all API calls
    forkJoin({
      metrics: dashboardMetrics$,
      users: users$
    }).subscribe({
      next: (response: any) => {
        console.log('✅ API Response - Dashboard Metrics:', response.metrics);
        console.log('✅ API Response - Users:', response.users);

        // Process dashboard metrics
        if (response.metrics) {
          this.stats.totalUsers = response.metrics.totalUsers || 0;
          this.stats.totalRevenue = response.metrics.totalRevenue || 0;
          this.stats.userGrowth = response.metrics.userGrowth || 0;
          this.stats.revenueGrowth = response.metrics.revenueGrowth || 0;
        }

        // Process users data
        if (response.users && response.users.data) {
          this.stats.activeVendors = response.users.data.filter((u: any) => u.role === 'vendor').length || 0;
        }

        // Calculate system health
        this.stats.systemHealth = 100;

        // Process recent activities from recentOrders in dashboard metrics
        if (response.metrics && response.metrics.recentOrders && Array.isArray(response.metrics.recentOrders)) {
          this.recentActivities = response.metrics.recentOrders.slice(0, 5).map((order: any) => {
            let timestamp = new Date();
            if (order.createdAt) {
              const parsed = new Date(order.createdAt);
              if (!isNaN(parsed.getTime())) {
                timestamp = parsed;
              }
            }
            
            const activity = {
              id: order.id,
              orderNumber: order.orderNumber,
              timestamp,
              user: order.customer || 'Unknown',
              status: order.status || 'pending'
            };
            console.log('Activity mapped:', activity);
            return activity;
          });
          console.log('All recentActivities:', this.recentActivities);
        } else {
          console.warn('⚠️ RecentOrders not found in metrics response');
          this.recentActivities = [];
        }

        console.log('📈 Processed Stats:', this.stats);
        console.log('📋 Recent Activities:', this.recentActivities);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('❌ Error loading dashboard data:', error);
        this.isLoading = false;
        // Set default values
        this.stats = {
          totalUsers: 0,
          totalRevenue: 0,
          activeVendors: 0,
          systemHealth: 0,
          userGrowth: 0,
          revenueGrowth: 0,
          vendorGrowth: 0
        };
      }
    });
  }
}