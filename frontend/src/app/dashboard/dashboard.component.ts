import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { RBACService } from '../core/services/rbac.service';
import { AuthService } from '../core/services/auth.service';
import { AdminAuthService } from '../admin/services/admin-auth.service';
import { UnifiedDashboardComponent } from '../shared/components/unified-dashboard/unified-dashboard.component';

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
  `],
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
    private subscriptions: Subscription[] = [];

    constructor(
        private router: Router,
        private rbacService: RBACService,
        private authService: AuthService,
        private adminAuthService: AdminAuthService
    ) { }

    ngOnInit() {
        this.checkAuthentication();
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    private checkAuthentication() {
        // Check if user is authenticated
        const adminAuthSub = this.adminAuthService.isAuthenticated().subscribe(isAdminAuth => {
            if (isAdminAuth) {
                // Admin user is authenticated, dashboard will handle the rest
                return;
            }

            // Check regular user authentication
            const authSub = this.authService.isAuthenticated().subscribe(isAuth => {
                if (!isAuth) {
                    // Not authenticated, redirect to login
                    this.router.navigate(['/auth/login']);
                }
                // User is authenticated, dashboard will handle the rest
            });
            this.subscriptions.push(authSub);
        });
        this.subscriptions.push(adminAuthSub);
    }
}
