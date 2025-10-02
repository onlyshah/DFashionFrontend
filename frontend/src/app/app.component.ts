import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { HeaderComponent } from './shared/components/header/header.component';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { MobileLayoutComponent } from './shared/components/mobile-layout/mobile-layout.component';
import { AuthService } from './core/services/auth.service';
import { DataFlowService } from './core/services/data-flow.service';
import { MobileOptimizationService } from './core/services/mobile-optimization.service';
import { LayoutService } from './core/services/layout.service';

@Component({
    selector: 'app-root',
    imports: [CommonModule, RouterOutlet, HeaderComponent, NotificationComponent, MobileLayoutComponent],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'DFashion';
  showHeader = true;
  isMobile = false;
  appState: any = null;

  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private dataFlowService: DataFlowService,
    private mobileService: MobileOptimizationService,
    private layoutService: LayoutService
  ) {}

  ngOnInit() {
    // Initialize data flow service
    this.initializeDataFlow();

    // Subscribe to device info for mobile detection
    this.subscriptions.push(
      this.mobileService.getDeviceInfo$().subscribe(deviceInfo => {
        this.isMobile = deviceInfo.isMobile;
      })
    );

    // Subscribe to app state
    this.subscriptions.push(
      this.dataFlowService.getAppState$().subscribe(state => {
        this.appState = state;
      })
    );

    // Use layout service to manage header visibility and prevent overlapping
    this.subscriptions.push(
      this.layoutService.layoutState$.subscribe(layoutState => {
        this.showHeader = layoutState.showHeader;
      })
    );

    // Initialize layout service (it will handle header visibility automatically)
    this.layoutService.refreshLayout();

    // Add debug helper for overlapping issues in development mode
    if (window.location.hostname === 'localhost') {
      import('./test-overlapping-fix').then(module => {
        const OverlappingTestHelper = module.OverlappingTestHelper;
        // Run tests and add debug overlay
        OverlappingTestHelper.runAllTests(this.layoutService);
      }).catch(err => console.error('Failed to load overlapping test helper:', err));
    }

    // Initialize auth state
    this.authService.initializeAuth();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.dataFlowService.destroy();
  }

  private initializeDataFlow() {
    // Only load data if user is authenticated
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        // Load analytics for authenticated users
        this.dataFlowService.loadAnalytics().subscribe({
          next: () => console.log('Analytics loaded for authenticated user'),
          error: (error) => console.error('Failed to load analytics:', error)
        });

        // Load personalized recommendations for authenticated users
        this.dataFlowService.loadRecommendations().subscribe({
          next: () => console.log('Personalized recommendations loaded'),
          error: (error) => console.error('Failed to load recommendations:', error)
        });
      } else {
        // For unauthenticated users, only load basic public data
        console.log('User not authenticated, skipping personalized data loading');

        // You can load public/general recommendations here if needed
        // this.loadPublicRecommendations();
      }
    });
  }
}
