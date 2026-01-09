import { NgModule, Injectable } from '@angular/core';
import { RouterModule, Routes, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AdminLoginComponent } from './auth/admin-login.component';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { PermissionGuard } from './guards/permission.guard';

// Components

@Injectable({ providedIn: 'root' })
export class SuperAdminGuard implements CanActivate {
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    // TODO: implement real super-admin permission check (e.g. via an AuthService).
    // For now allow access to avoid build errors.
    return true;
  }
}
import { SuperAdminDashboardComponent } from './components/super-admin-dashboard/super-admin-dashboard.component';
import { GeneralDashboardComponent } from './components/general-dashboard/general-dashboard.component';
import { OverviewComponent } from './pages/overview/overview.component';
import { AdminPlaceholderComponent } from './pages/admin-placeholder/admin-placeholder.component';
import { UserManagementComponent } from './users/user-management.component';
import { OrderManagementComponent } from './orders/order-management.component';
import { ProductManagementComponent } from './products/product-management.component';
import { CategoryManagementComponent } from './pollux-ui/categories/category-management.component';
import { RoleManagementComponent } from './roles/role-management.component';
import { SettingsComponent } from './settings/settings.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { ReturnsManagementComponent } from './pages/returns-management/returns-management.component';

const routes: Routes = [
  {
    path: 'login',
    component: AdminLoginComponent
  },
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
        canActivate: [SuperAdminGuard, PermissionGuard],
        data: { title: 'User Management', module: 'users' }
      },
      {
        path: 'customers',
        component: UserManagementComponent,
        data: { title: 'Customer Management', permission: 'users:view', role: 'customer' }
      },
      {
        path: 'vendors',
        component: UserManagementComponent,
        data: { title: 'Vendor Management', permission: 'users:view', role: 'vendor' }
      },
      {
        path: 'admins',
        component: UserManagementComponent,
        data: { title: 'Admin Management', permission: 'users:view', role: 'admin' }
      },
      {
        path: 'roles',
        component: RoleManagementComponent,
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
        data: { title: 'Category Management', permission: 'categories:view' }
      },
      {
        path: 'brands',
        component: ProductManagementComponent,
        data: { title: 'Brand Management', permission: 'brands:view', type: 'brands' }
      },
      {
        path: 'attributes',
        component: ProductManagementComponent,
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
        data: { title: 'Stock Management', permission: 'products:view', type: 'stock' }
      },
      {
        path: 'analytics',
        component: AnalyticsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Analytics', module: 'analytics' }
      },
      {
        path: 'analytics/sales',
        component: AnalyticsComponent,
        data: { title: 'Sales Reports', permission: 'analytics:view', type: 'sales' }
      },
      {
        path: 'analytics/users',
        component: AnalyticsComponent,
        data: { title: 'User Analytics', permission: 'analytics:view', type: 'users' }
      },
      {
        path: 'analytics/products',
        component: AnalyticsComponent,
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
        data: { title: 'General Settings', permission: 'settings:view', type: 'general' }
      },
      {
        path: 'settings/payment',
        component: SettingsComponent,
        data: { title: 'Payment Settings', permission: 'settings:view', type: 'payment' }
      },
      {
        path: 'settings/shipping',
        component: SettingsComponent,
        data: { title: 'Shipping Settings', permission: 'settings:view', type: 'shipping' }
      },
      {
        path: 'settings/tax',
        component: SettingsComponent,
        data: { title: 'Tax Settings', permission: 'settings:view', type: 'tax' }
      },
      {
        path: 'orders/returns',
        component: ReturnsManagementComponent,
        data: { title: 'Returns & Refunds', module: 'orders' }
      },
      // Catch-all placeholder for other admin pages not yet implemented
      {
        path: '**',
        component: AdminPlaceholderComponent,
        data: { title: 'Admin - Placeholder' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
