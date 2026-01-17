import { NgModule, Injectable } from '@angular/core';
import { RouterModule, Routes, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Router } from '@angular/router';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { PermissionGuard } from './guards/permission.guard';
import { RoleGuard } from './guards/role.guard';
import { AdminAuthService } from './services/admin-auth.service';

// Components

@Injectable({ providedIn: 'root' })
export class SuperAdminGuard implements CanActivate {
  constructor(
    private adminAuthService: AdminAuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const user = this.adminAuthService.getCurrentUser();
    
    // Allow super_admin or admin roles
    if (user && (user.role === 'super_admin' || user.role === 'admin')) {
      return true;
    }

    // If not super_admin, redirect to dashboard
    console.warn('SuperAdminGuard: User does not have super_admin role');
    this.router.navigate(['/admin/dashboard']);
    return false;
  }
}
import { SuperAdminDashboardComponent } from './pages/components/super-admin-dashboard/super-admin-dashboard.component';
import { GeneralDashboardComponent } from './pages/components/dashboard/general-dashboard/general-dashboard.component';
import { OverviewComponent } from './pages/overview/overview.component';
import { NewslettersComponent } from './pages/marketing/newsletters.component';
import { BlogPostsComponent } from './pages/cms/blog-posts.component';
import { MediaLibraryComponent } from './pages/cms/media-library.component';
import { SuppliersComponent } from './pages/inventory/suppliers.component';
import { WarehousesComponent } from './pages/inventory/warehouses.component';
import { InventoryComponent } from './pages/inventory/inventory.component';
import { InventoryAlertsComponent } from './pages/inventory/inventory-alerts.component';
import { InventoryHistoryComponent } from './pages/inventory/inventory-history.component';
import { SystemLogsComponent } from './pages/system/system-logs.component';
import { BackupsComponent } from './pages/system/backups.component';
import { MaintenanceComponent } from './pages/system/maintenance.component';
import { UserManagementComponent } from './pages/users/user-management.component';
import { OrderManagementComponent } from './pages/orders/order-management.component';
import { ProductManagementComponent } from './pages/products/product-management.component';
import { CategoryManagementComponent } from './pages/categories/category-management.component';
import { RoleManagementComponent } from './pages/role-management/role-management.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { AnalyticsComponent } from './pages/analytics/analytics.component';
import { ReturnsManagementComponent } from './pages/returns-management/returns-management.component';
import { CouponManagementComponent } from './pages/marketing/coupon-management.component';
import { PageManagementComponent } from './pages/cms/page-management.component';
import { CampaignManagementComponent } from './pages/marketing/campaign-management.component';
import { SocialEngagementComponent } from './pages/social/social-engagement.component';
import { CustomersComponent } from './pages/users/customers.component';
import { VendorsComponent } from './pages/users/vendors.component';
import { CreatorsComponent } from './pages/users/creators.component';
import { AdminsComponent } from './pages/users/admins.component';
import { ActivityLogsComponent } from './pages/users/activity-logs.component';
import { AlertsComponent } from './pages/alerts/alerts.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AdminAuthGuard],
    component: GeneralDashboardComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        component: OverviewComponent,
        data: { title: 'Overview' }
      },
      {
        path: 'dashboard',
        component: GeneralDashboardComponent,
        data: { title: 'Dashboard' }
      },
      {
        path: 'dashboard/super',
        component: SuperAdminDashboardComponent,
        canActivate: [SuperAdminGuard],
        data: { title: 'Super Admin Dashboard' }
      },
      {
        path: 'users',
        component: UserManagementComponent,
        canActivate: [PermissionGuard],
        data: { title: 'User Management', module: 'users', roles: ['super_admin', 'admin'] }
      },
      {
        path: 'users/customers',
        component: CustomersComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Customer Management', permission: 'users:view' }
      },
      {
        path: 'users/vendors',
        component: VendorsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Vendor Management', permission: 'users:view' }
      },
      {
        path: 'users/creators',
        component: CreatorsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Creators & Influencers', permission: 'users:view' }
      },
      {
        path: 'users/admins',
        component: AdminsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Admin Users', permission: 'users:view' }
      },
      {
        path: 'activity-logs',
        component: ActivityLogsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Activity Logs', permission: 'logs:view' }
      },
      {
        path: 'customers',
        component: CustomersComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Customer Management', permission: 'users:view', role: 'customer' }
      },
      {
        path: 'vendors',
        component: VendorsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Vendor Management', permission: 'users:view', role: 'vendor' }
      },
      {
        path: 'admins',
        component: AdminsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Admin Management', permission: 'users:view', role: 'admin' }
      },
      {
        path: 'roles',
        component: RoleManagementComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Roles & Permissions', permission: 'roles:manage' }
      },
      {
        path: 'products',
        component: ProductManagementComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Product Management', module: 'products' }
      },
      {
        path: 'categories',
        component: CategoryManagementComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Category Management', permission: 'categories:view' }
      },
      {
        path: 'brands',
        component: ProductManagementComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Brand Management', permission: 'brands:view', type: 'brands' }
      },
      {
        path: 'attributes',
        component: ProductManagementComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Attribute Management', permission: 'attributes:view', type: 'attributes' }
      },
      {
        path: 'orders',
        component: OrderManagementComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Order Management', module: 'orders' }
      },
      {
        path: 'stock',
        component: ProductManagementComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Stock Management', permission: 'products:view', type: 'stock' }
      },
      {
        path: 'analytics',
        component: AnalyticsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Analytics', module: 'analytics' }
      },
      {
        path: 'alerts',
        component: AlertsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Alerts & Notifications', module: 'alerts' }
      },
      // TODO: Implement admin profile page
      // {
      //   path: 'profile',
      //   loadComponent: () => import('./pages/features/profile/pages/profile/profile.component').then(m => m.ProfileComponent),
      //   data: { title: 'Profile' }
      // },
      {
        path: 'analytics/sales',
        component: AnalyticsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Sales Reports', permission: 'analytics:view', type: 'sales' }
      },
      {
        path: 'analytics/users',
        component: AnalyticsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'User Analytics', permission: 'analytics:view', type: 'users' }
      },
      {
        path: 'analytics/products',
        component: AnalyticsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Product Analytics', permission: 'analytics:view', type: 'products' }
      },
      {
        path: 'settings',
        component: SettingsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Settings', module: 'settings' }
      },
      {
        path: 'settings/general',
        component: SettingsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'General Settings', permission: 'settings:view', type: 'general' }
      },
      {
        path: 'settings/payment',
        component: SettingsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Payment Settings', permission: 'settings:view', type: 'payment' }
      },
      {
        path: 'settings/shipping',
        component: SettingsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Shipping Settings', permission: 'settings:view', type: 'shipping' }
      },
      {
        path: 'settings/tax',
        component: SettingsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Tax Settings', permission: 'settings:view', type: 'tax' }
      },
      {
        path: 'orders/returns',
        component: ReturnsManagementComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Returns & Refunds', module: 'orders' }
      },
      // Campaigns (Marketing)
      {
        path: 'campaigns',
        component: CampaignManagementComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Campaigns', permission: 'marketing:view' }
      },
      // Coupons & Promotions (Marketing)
      {
        path: 'coupons',
        component: CouponManagementComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Coupons & Promotions', permission: 'marketing:view' }
      },
      // Newsletters (Marketing)
      {
        path: 'newsletters',
        component: NewslettersComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Newsletters', permission: 'marketing:view' }
      },
      // Pages (Content Management)
      {
        path: 'pages',
        component: PageManagementComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Pages', permission: 'content:view' }
      },
      // Blog Posts (Content Management)
      {
        path: 'blogs',
        component: BlogPostsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Blog Posts', permission: 'content:view' }
      },
      // Media Library (Content Management)
      {
        path: 'media',
        component: MediaLibraryComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Media Library', permission: 'content:view' }
      },
      // Inventory (Main)
      {
        path: 'inventory',
        component: InventoryComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Inventory', permission: 'inventory:view' }
      },
      // Inventory Alerts
      {
        path: 'inventory/alerts',
        component: InventoryAlertsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Inventory Alerts', permission: 'inventory:view' }
      },
      // Inventory History
      {
        path: 'inventory/history',
        component: InventoryHistoryComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Inventory History', permission: 'inventory:view' }
      },
      // Suppliers (Inventory)
      {
        path: 'suppliers',
        component: SuppliersComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Suppliers', permission: 'inventory:view' }
      },
      // Warehouses (Inventory)
      {
        path: 'warehouses',
        component: WarehousesComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Warehouses', permission: 'inventory:view' }
      },
      // System Logs
      {
        path: 'system/logs',
        component: SystemLogsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'System Logs', permission: 'system:view' }
      },
      // Backups
      {
        path: 'system/backups',
        component: BackupsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Backups', permission: 'system:view' }
      },
      // Maintenance
      {
        path: 'system/maintenance',
        component: MaintenanceComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Maintenance', permission: 'system:view' }
      },
      // Social Engagement
      {
        path: 'social',
        component: SocialEngagementComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Social Engagement', permission: 'social:view' }
      },
      // Catch-all: redirect to dashboard
      {
        path: '**',
        redirectTo: 'dashboard'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
