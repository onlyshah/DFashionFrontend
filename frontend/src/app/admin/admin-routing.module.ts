import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Old components (keeping for fallback)
import { RoleManagementComponent } from './pages/role-management/role-management.component';
import { AdminLoginComponent } from './auth/admin-login.component';
import { UserManagementComponent } from './users/user-management.component';
import { OrderManagementComponent } from './orders/order-management.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { SettingsComponent } from './settings/settings.component';
// New Pollux UI components
import { PolluxAdminLayoutComponent } from './pollux-ui/layout/pollux-admin-layout.component';
import { PolluxDashboardComponent } from './pollux-ui/dashboard/pollux-dashboard.component';
import { ProductManagementComponent as PolluxProductManagementComponent } from './pollux-ui/products/product-management.component';
import { CategoryManagementComponent } from './pollux-ui/categories/category-management.component';
import { AdminAuthGuard } from './guards/admin-auth.guard';

const routes: Routes = [
  {
    path: 'login',
    component: AdminLoginComponent
  },
  {
    path: '',
    component: PolluxAdminLayoutComponent,
    canActivate: [AdminAuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: PolluxDashboardComponent,
        data: { title: 'Dashboard', permission: 'dashboard:view' }
      },
      {
        path: 'users',
        component: UserManagementComponent,
        data: { title: 'User Management', permission: 'users:view' }
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
        component: PolluxProductManagementComponent,
        data: { title: 'Product Management', permission: 'products:view' }
      },
      {
        path: 'categories',
        component: CategoryManagementComponent,
        data: { title: 'Category Management', permission: 'categories:view' }
      },
      {
        path: 'brands',
        component: PolluxProductManagementComponent,
        data: { title: 'Brand Management', permission: 'brands:view', type: 'brands' }
      },
      {
        path: 'attributes',
        component: PolluxProductManagementComponent,
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
