
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { MaterialModule } from 'src/app/material.module';
import { map, Observable, shareReplay, Subject, takeUntil } from 'rxjs';
import { AdminAuthService, AdminUser } from 'src/app/admin/services/admin-auth.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
@Component({
  selector: 'app-pollux-sidebar',
  templateUrl: './pollux-sidebar.component.html',
  styleUrls: ['./pollux-sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule]
})
export class PolluxSidebarComponent  implements OnInit, OnDestroy {
  trackByChild(index: number, child: any) {
    return child.route || child.title || index;
  }
  
  @ViewChild('drawer') drawer!: MatSidenav;

  private destroy$ = new Subject<void>();
  currentUser$: Observable<AdminUser | null>;
  currentUser: AdminUser | null = null;
  pageTitle = 'Dashboard';

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => (result as { matches: boolean }).matches),
      shareReplay()
    );

  navigationItems: any[] = [
    { title: 'Dashboard', icon: 'typcn-device-desktop', route: '/admin/dashboard', badge: 'new', permission: 'dashboard:view', roles: ['admin', 'super_admin'] },
    {
      title: 'Users', icon: 'typcn-user-outline', id: 'users', expanded: false, permission: 'users:view', roles: ['admin', 'super_admin'], children: [
        { title: 'All Users', route: '/admin/users', permission: 'users:view', roles: ['admin', 'super_admin'] },
        { title: 'Add User', route: '/admin/users/new', permission: 'users:create', roles: ['admin', 'super_admin'] }
      ]
    },
    {
      title: 'Products', icon: 'typcn-shopping-bag', id: 'products', expanded: false, permission: 'products:view', roles: ['admin', 'super_admin', 'vendor'], children: [
        { title: 'All Products', route: '/admin/products', permission: 'products:view', roles: ['admin', 'super_admin', 'vendor'] },
        { title: 'Add Product', route: '/admin/products/new', permission: 'products:create', roles: ['admin', 'super_admin', 'vendor'] }
      ]
    },
    { title: 'Orders', icon: 'typcn-clipboard', route: '/admin/orders', permission: 'orders:view', roles: ['admin', 'super_admin', 'vendor'] },
    { title: 'Analytics', icon: 'typcn-chart-pie-outline', route: '/admin/analytics', permission: 'analytics:view', roles: ['admin', 'super_admin'] },
    { title: 'Settings', icon: 'typcn-cog-outline', route: '/admin/settings', permission: 'settings:view', roles: ['admin', 'super_admin'] },
    { title: 'Profile', icon: 'typcn-user', route: '/admin/profile', roles: ['admin', 'super_admin', 'vendor', 'customer', 'influencer'] },
    // Quick Actions in Sidebar for admin and super_admin
    { title: 'Add Product', icon: 'typcn-plus', route: '/admin/products/new', quickAction: true, roles: ['admin', 'super_admin'] },
    { title: 'Add User', icon: 'typcn-plus', route: '/admin/users/new', quickAction: true, roles: ['admin', 'super_admin'] },
    { title: 'View Orders', icon: 'typcn-shopping-cart', route: '/admin/orders', quickAction: true, roles: ['admin', 'super_admin'] },
    { title: 'View Analytics', icon: 'typcn-chart-pie-outline', route: '/admin/analytics', quickAction: true, roles: ['admin', 'super_admin'] }
  ];

  // Show all links for super_admin


  constructor(
    private breakpointObserver: BreakpointObserver,
    public authService: AdminAuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.currentUser = user;
    });

    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updatePageTitle();
      }
    });

    this.updatePageTitle();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Permissions and Roles ────────────────────────────────────────────────

  hasPermission(permission: string): boolean {
    if (!permission || !this.currentUser) return true;
    const [module, action] = permission.split(':');
    return this.authService.hasPermission(module, action);
  }

  canShow(item: any): boolean {
    // Always show for super_admin
    if (this.currentUser && this.currentUser.role === 'super_admin') return true;
    // Always show for admin
    if (this.currentUser && this.currentUser.role === 'admin') return !item.roles || item.roles.includes('admin');
    // Otherwise, check roles as before
    return this.currentUser && item.roles && item.roles.includes(this.currentUser.role);
  }

  getVisibleNavigationItems(): any[] {
    return this.navigationItems.filter(item => this.canShow(item));
  }

  // ─── UI Interaction ──────────────────────────────────────────────────────

  toggleSubmenu(item: any) {
    item.expanded = !item.expanded;
  }

  onMenuItemClick(): void {
    this.isHandset$.pipe(takeUntil(this.destroy$)).subscribe(isHandset => {
      if (isHandset && this.drawer) {
        this.drawer.close();
      }
    });
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }

  onLogout(): void {
    this.authService.logout();
  }

  private updatePageTitle(): void {
    const url = this.router.url;
    const routeTitleMap: { [key: string]: string } = {
      '/admin/dashboard': 'Dashboard',
      '/admin/users': 'User Management',
      '/admin/products': 'Product Management',
      '/admin/orders': 'Order Management',
      '/admin/analytics': 'Analytics',
      '/admin/settings': 'Settings',
      '/admin/profile': 'Profile'
    };

    this.pageTitle = routeTitleMap[url] || 'Admin Panel';
  }

  // ─── User Info Helpers ───────────────────────────────────────────────────

  getUserInitials(): string {
    if (!this.currentUser?.fullName) return 'AD';
    const names = this.currentUser.fullName.split(' ');
    return names.length >= 2 ? (names[0][0] + names[1][0]).toUpperCase() : names[0][0].toUpperCase();
  }

  getRoleColor(): string {
    const roleColors: { [key: string]: string } = {
      'super_admin': '#e91e63',
      'admin': '#9c27b0',
      'sales_manager': '#2196f3',
      'marketing_manager': '#ff9800',
      'account_manager': '#4caf50',
      'support_manager': '#795548'
    };
    return roleColors[this.currentUser?.role || ''] || '#666';
  }

  getRoleDisplayName(): string {
    const roleDisplayNames: { [key: string]: string } = {
      'super_admin': 'Super Admin',
      'admin': 'Admin',
      'sales_manager': 'Sales Manager',
      'sales_executive': 'Sales Executive',
      'marketing_manager': 'Marketing Manager',
      'marketing_executive': 'Marketing Executive',
      'account_manager': 'Account Manager',
      'accountant': 'Accountant',
      'support_manager': 'Support Manager',
      'support_agent': 'Support Agent',
      'content_manager': 'Content Manager',
      'vendor_manager': 'Vendor Manager'
    };
    return roleDisplayNames[this.currentUser?.role || ''] || this.currentUser?.role?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  }
}
