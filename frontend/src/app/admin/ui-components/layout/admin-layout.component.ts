import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Layout state
  sidebarMinimized = false;
  currentRoute = '';
  
  // User data
  currentUser: any = null;
  
  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    // Listen to route changes for breadcrumb
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
      });

    // Initialize layout
    this.initializeLayout();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeLayout(): void {
    // Add any initialization logic here
    this.loadUserData();
  }

  private loadUserData(): void {
    // Load current user data
    // This should be replaced with actual user service
    this.currentUser = {
      name: 'Admin User',
      email: 'admin@dfashion.com',
      avatar: 'assets/images/faces/face5.jpg',
      lastLogin: new Date()
    };
  }

  onSidebarToggle(): void {
    this.sidebarMinimized = !this.sidebarMinimized;
  }

  onLogout(): void {
    // Implement logout logic
    this.router.navigate(['/auth/login']);
  }
}
