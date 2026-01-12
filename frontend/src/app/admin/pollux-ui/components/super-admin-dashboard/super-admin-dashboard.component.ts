import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminApiService } from '../../../services/admin-api.service';
import { AdminHeaderComponent } from '../../../components/admin-header/admin-header.component';
import { AdminSidebarComponent } from '../../../components/admin-sidebar/admin-sidebar.component';

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
  imports: [CommonModule, AdminHeaderComponent, AdminSidebarComponent],
  templateUrl: './super-admin-dashboard.component.html',
  styleUrls: ['./super-admin-dashboard.component.scss']
})
export class SuperAdminDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  isLoading = true;
  dashboardData: SuperAdminStats | null = null;
  stats: any = null;
  recentActivities: any[] = [];

  constructor(private adminApiService: AdminApiService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.adminApiService.getSuperAdminStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: SuperAdminStats) => {
          this.dashboardData = data;
          this.isLoading = false;
        },
        error: (error: Error) => {
          console.error('Error loading dashboard data:', error);
          this.isLoading = false;
        }
      });
  }
}