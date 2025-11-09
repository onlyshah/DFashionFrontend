import { NgModule, Injectable } from '@angular/core';
import { RouterModule, Routes, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AdminLoginComponent } from './auth/admin-login.component';
import { AdminAuthGuard } from './guards/admin-auth.guard';

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
import { UserManagementComponent } from './users/user-management.component';
import { OrderManagementComponent } from './orders/order-management.component';
import { ProductManagementComponent } from './products/product-management.component';
import { CategoryManagementComponent } from './pollux-ui/categories/category-management.component';
import { RoleManagementComponent } from './roles/role-management.component';
import { SettingsComponent } from './settings/settings.component';
import { AnalyticsComponent } from './analytics/analytics.component';

const routes: Routes = [
  {
    path: 'login',
    component: AdminLoginComponent
  },
  {
    path: '',
    canActivate: [AdminAuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        children: [
          {
            path: '',
            component: GeneralDashboardComponent,
            data: { title: 'Dashboard' }
          },
          {
            path: 'super',
            component: SuperAdminDashboardComponent,
            canActivate: [SuperAdminGuard],
            data: { title: 'Super Admin Dashboard' }
          }
        ]
      },
      {
        path: 'users',
        component: UserManagementComponent,
        canActivate: [SuperAdminGuard],
        data: { title: 'User Management' }
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
        data: { title: 'Product Management', permission: 'products:view' }
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
        data: { title: 'Order Management', permission: 'orders:view' }
      },
      {
        path: 'analytics',
        component: AnalyticsComponent,
        data: { title: 'Analytics', permission: 'analytics:view' }
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
        data: { title: 'Settings', permission: 'settings:view' }
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
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
