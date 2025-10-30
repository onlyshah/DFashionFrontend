import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { 
    RBACService,
    AuthService,
    LoadingService,
    ErrorHandlingService 
} from '../core/services';
import { AdminAuthService } from '../admin/services/admin-auth.service';
import { UnifiedDashboardComponent } from '../admin/components/unified-dashboard/unified-dashboard.component';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        UnifiedDashboardComponent
    ],
    styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1000;
      background: #ffffff;
      overflow: hidden;
    }

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.9);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .spinner-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.95);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .spinner-border {
      width: 3rem;
      height: 3rem;
      color: #844fc1;
    }

    .alert {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      min-width: 300px;
      max-width: 500px;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `],
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
    private subscriptions: Subscription[] = [];
    isLoading = false;
    error: string | null = null;

    constructor(
        private router: Router,
        private rbacService: RBACService,
        private authService: AuthService,
        private adminAuthService: AdminAuthService,
        private loadingService: LoadingService,
        private errorHandlingService: ErrorHandlingService
    ) { 
        // Initialize error handling for unified dashboard
        this.handleError = this.handleError.bind(this);
        this.handleLoading = this.handleLoading.bind(this);
    }

    ngOnInit() {
        this.checkAuthentication();
        this.setupSubscriptions();
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    handleError(error: string): void {
        this.errorHandlingService.handleError(error);
    }

    handleLoading(loading: boolean): void {
        this.loadingService.show();
    }

    clearError(): void {
        this.errorHandlingService.clearError();
    }

    private setupSubscriptions(): void {
        // Subscribe to loading state
        const loadingSub = this.loadingService.isLoading$.subscribe(
            (loading: boolean) => this.isLoading = loading
        );
        this.subscriptions.push(loadingSub);

        // Subscribe to error state
        const errorSub = this.errorHandlingService.error$.subscribe(
            (error: string | null) => this.error = error
        );
        this.subscriptions.push(errorSub);
    }

    private async checkAuthentication(): Promise<void> {
        try {
            const isAdminAuth = await this.adminAuthService.isAuthenticated();
            if (isAdminAuth) {
                return; // Admin is authenticated
            }

            const isAuth = this.authService.isAuthenticated;
            if (!isAuth) {
                await this.router.navigate(['/auth/login']);
            }
        } catch (error) {
            this.handleError(error instanceof Error ? error.message : 'Authentication failed');
        }
    }
}
