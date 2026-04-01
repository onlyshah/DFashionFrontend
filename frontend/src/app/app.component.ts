import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SharedModule } from './shared/shared.module';
import { AuthService } from './core/services/auth.service';
import { MobileOptimizationService } from './core/services/mobile-optimization.service';
import { LayoutService } from './core/services/layout.service';
import { Subscription } from 'rxjs';
import { MobileLayoutComponent } from './enduser-app/shared/components/mobile-layout/mobile-layout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule, MobileLayoutComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'DFashion';
  showHeader = false;
  isMobile = false;
  sidebarExpanded = false;
  messageCount = 2;
  notificationCount = 7;
  moreMenuOpen = false;
  createMenuOpen = false;
  isLoggedIn = false;
  private subscription = new Subscription();

  constructor(
    private router: Router,
    private authService: AuthService,
    private mobileOptimizationService: MobileOptimizationService,
    private layoutService: LayoutService
  ) {}

  toggleSidebar(): void {
    this.sidebarExpanded = !this.sidebarExpanded;
  }

  closeSidebar(): void {
    this.sidebarExpanded = false;
  }

  toggleMoreMenu(): void {
    this.moreMenuOpen = !this.moreMenuOpen;
  }

  closeMoreMenu(): void {
    this.moreMenuOpen = false;
  }

  openCreateModal(): void {
    this.createMenuOpen = !this.createMenuOpen;
    this.moreMenuOpen = false;
  }

  switchAppearance(): void {
    console.log('Switch appearance');
  }

  switchAccounts(): void {
    // Implement switch accounts logic
    console.log('Switch accounts');
  }

  logout(): void {
    // Implement logout logic
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  ngOnInit(): void {
    // Check authentication state - user is logged in if currentUser$ is not null
    this.subscription.add(
      this.authService.currentUser$.subscribe(user => {
        this.isLoggedIn = !!user;
      })
    );

    // Detect mobile using public method
    this.subscription.add(
      this.mobileOptimizationService.getDeviceInfo$().subscribe(info => {
        this.isMobile = info.isMobile;
      })
    );

    // Subscribe to layout state - LayoutService automatically manages updates on route change
    this.subscription.add(
      this.layoutService.layoutState$.subscribe(state => {
        this.showHeader = state.showHeader;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

