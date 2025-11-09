import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminApiService, DashboardMetrics } from '../../services/admin-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-general-dashboard',
  standalone: true,
  imports: [CommonModule, AdminHeaderComponent, AdminSidebarComponent],
  templateUrl: './general-dashboard.component.html',
  styleUrls: ['./general-dashboard.component.scss']
})
export class GeneralDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();
  
  isLoading = true;
  error: string | null = null;
  dashboardData: DashboardMetrics | null = null;
  userRole$ = this.authService.userRole$;

  constructor(
    private adminApiService: AdminApiService,
    private authService: AuthService,
    private router: Router
  ) {
    // Check authentication status
    this.authService.isAuthenticated$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isAuthenticated => {
      if (!isAuthenticated) {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    // Initialize Bootstrap dropdowns
    const dropdowns = document.querySelectorAll('.dropdown-toggle');
    dropdowns.forEach(dropdown => {
      if (dropdown) {
        import('bootstrap').then(bootstrap => {
          new bootstrap.Dropdown(dropdown);
        });
      }
    });
  }

  private loadDashboardData(): void {
    this.error = null; // Reset error state
    this.adminApiService.getGeneralDashboardData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: DashboardMetrics) => {
          this.dashboardData = data;
          this.isLoading = false;
        },
        error: (error: any) => { // Handle both Error objects and HTTP errors
          console.error('Error loading dashboard data:', error);
          this.error = error.message || 'Failed to load dashboard data. Please try again later.';
          this.isLoading = false;
        }
      });
  }
}