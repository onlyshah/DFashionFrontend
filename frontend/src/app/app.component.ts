import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { SharedModule } from './shared/shared.module';
import { AuthService } from './core/services/auth.service';
import { MobileOptimizationService } from './core/services/mobile-optimization.service';
import { LayoutService } from './core/services/layout.service';
import { ReelsApi } from './core/api/reels.api';
import { Subscription, filter } from 'rxjs';
import { MobileLayoutComponent } from './enduser-app/shared/components/mobile-layout/mobile-layout.component';
import { ViewReelsComponent } from './enduser-app/features/home/components/reels/view-reels/view-reels.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule, MobileLayoutComponent, ViewReelsComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'DFashion';
  showHeader = false;
  isMobile = false;
  reelsViewerVisible = false;
  reelsViewerIndex = 0;
  reelsViewerData: any[] = [];
  isLoadingReels = false;
  isLoggedIn = false;
  isAuthRoute = false;
  private subscription = new Subscription();

  constructor(
    private router: Router,
    private authService: AuthService,
    private mobileOptimizationService: MobileOptimizationService,
    private layoutService: LayoutService,
    private reelsApi: ReelsApi
  ) {}

  toggleSidebar(): void {
    // Removed - sidebar navigation consolidated to top header
  }

  closeSidebar(): void {
    // Removed - sidebar navigation consolidated to top header
  }

  toggleMoreMenu(): void {
    // Removed - all account actions moved to Profile dropdown
  }

  closeMoreMenu(): void {
    // Removed - all account actions moved to Profile dropdown
  }

  openCreateModal(): void {
    // Removed - create functionality moved to header CreateModalComponent
  }

  openReelsViewer(): void {
    this.isLoadingReels = true;
    this.reelsApi.getAllReels()
      .subscribe({
        next: (response: any) => {
          this.reelsViewerData = response.data?.reels || response.data || [];
          this.reelsViewerVisible = true;
          this.reelsViewerIndex = 0;
          this.isLoadingReels = false;
          this.closeSidebar();
        },
        error: (error) => {
          console.error('❌ Error loading reels:', error);
          this.reelsViewerData = [];
          this.reelsViewerVisible = true;
          this.isLoadingReels = false;
          this.closeSidebar();
        }
      });
  }

  closeReelsViewer(): void {
    this.reelsViewerVisible = false;
  }

  changeReelsViewerIndex(index: number): void {
    this.reelsViewerIndex = index;
  }

  switchAppearance(): void {
    // Removed - moved to Profile dropdown component
  }

  switchAccounts(): void {
    // Removed - moved to Profile dropdown component
  }

  logout(): void {
    // Removed - moved to Profile dropdown component
  }

  ngOnInit(): void {
    this.authService.restoreSession();

    // Check authentication state - user is logged in if currentUser$ is not null
    this.subscription.add(
      this.authService.currentUser$.subscribe(user => {
        this.isLoggedIn = !!user;
        console.log('Auth State Changed - isLoggedIn:', this.isLoggedIn);
      })
    );

    // Detect mobile using public method
    this.subscription.add(
      this.mobileOptimizationService.getDeviceInfo$().subscribe(info => {
        this.isMobile = info.isMobile;
        console.log('Device Info - isMobile:', this.isMobile, 'screenWidth:', info.screenWidth);
      })
    );

    // Subscribe to layout state - LayoutService automatically manages updates on route change
    this.subscription.add(
      this.layoutService.layoutState$.subscribe(state => {
        this.showHeader = state.showHeader;
        console.log('Layout State - showHeader:', this.showHeader);
      })
    );

    // Track auth routes so mobile bottom nav is hidden on login/register paths
    this.updateRouteFlags(this.router.url);
    this.subscription.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: NavigationEnd) => {
        this.updateRouteFlags(event.urlAfterRedirects || event.url);
      })
    );
  }

  private updateRouteFlags(url: string): void {
    const normalizedUrl = url.toLowerCase();
    // Hide bottom nav on auth/login/register pages
    this.isAuthRoute = normalizedUrl.includes('/auth') || 
                       normalizedUrl.includes('/login') || 
                       normalizedUrl.includes('/register') ||
                       normalizedUrl.includes('/forgot-password') ||
                       normalizedUrl.includes('/reset-password');
    console.log('Route:', url, '| isAuthRoute:', this.isAuthRoute, '| showBottomNav:', this.showMobileBottomNav);
  }

  get showMobileBottomNav(): boolean {
    return this.isLoggedIn && !this.isAuthRoute;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

