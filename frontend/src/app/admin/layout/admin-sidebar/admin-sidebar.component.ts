import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-admin-sidebar',
    imports: [CommonModule, RouterModule],
    templateUrl: './admin-sidebar.component.html',
    styleUrl: './admin-sidebar.component.scss'
})
export class AdminSidebarComponent implements OnInit {
  currentRoute: string = '';
  expandedMenus: Set<string> = new Set();
  currentUser: any = null;

  // Define which routes have submenus
  private subMenuRoutes = new Map([
    ['/admin/users', true],
    ['/admin/products', true],
    ['/admin/analytics', true],
    ['/admin/settings', true],
    ['/admin/system', true]
  ]);

  constructor(
    private router: Router,
    private adminAuthService: AdminAuthService
  ) {}

  ngOnInit() {
    // Subscribe to current user
    this.adminAuthService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Track current route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.currentRoute = event.url;
          this.updateExpandedMenus();
        }
      });

    // Set initial route
    this.currentRoute = this.router.url;
    this.updateExpandedMenus();
  }

  isActiveRoute(route: string): boolean {
    return this.currentRoute.startsWith(route);
  }

  hasSubMenu(route: string): boolean {
    return this.subMenuRoutes.get(route) || false;
  }

  isMenuExpanded(menuId: string): boolean {
    return this.expandedMenus.has(menuId);
  }

  toggleMenu(menuId: string) {
    if (this.expandedMenus.has(menuId)) {
      this.expandedMenus.delete(menuId);
    } else {
      this.expandedMenus.add(menuId);
    }
  }

  isSuperAdmin(): boolean {
    return this.currentUser?.role === 'super_admin' || this.currentUser?.role === 'admin';
  }

  logout() {
    this.adminAuthService.logout();
    this.router.navigate(['/admin/login']);
  }

  private updateExpandedMenus() {
    // Auto-expand menus based on current route
    if (this.currentRoute.startsWith('/admin/users')) {
      this.expandedMenus.add('user-management');
    }
    if (this.currentRoute.startsWith('/admin/products')) {
      this.expandedMenus.add('product-management');
    }
    if (this.currentRoute.startsWith('/admin/analytics')) {
      this.expandedMenus.add('analytics');
    }
    if (this.currentRoute.startsWith('/admin/settings')) {
      this.expandedMenus.add('settings');
    }
    if (this.currentRoute.startsWith('/admin/system')) {
      this.expandedMenus.add('system-management');
    }
  }
}
