import { Route } from '@angular/router';
import { RoleGuard } from './shared/guards/role.guard';
import { AdminLayoutComponent } from './shared/components/admin-layout.component';
import { UserRole } from './shared/models/role.model';

export const adminRoutes: Route[] = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      // Super Admin Routes
      {
        path: 'roles',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.SuperAdmin] },
        loadChildren: () => import('@admin/super-admin').then(m => m.superAdminRoutes)
      },
      // Admin Routes
      {
        path: 'users',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.SuperAdmin, UserRole.Admin] },
        loadChildren: () => import('./users/users.routes').then(m => m.usersRoutes)
      },
      // Vendor Routes
      {
        path: 'products',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.Admin, UserRole.Vendor] },
        loadChildren: () => import('@admin/vendor').then(m => m.vendorRoutes)
      },
      // Creator Routes
      {
        path: 'content',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.Creator, UserRole.Marketing] },
        loadChildren: () => import('@admin/creator').then(m => m.creatorRoutes)
      },
      // Marketing Routes
      {
        path: 'campaigns',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.Marketing] },
        loadChildren: () => import('@admin/marketing').then(m => m.marketingRoutes)
      },
      // Moderator Routes
      {
        path: 'moderation',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.Moderator] },
        loadChildren: () => import('@admin/moderator').then(m => m.moderatorRoutes)
      },
      // Logistics Routes
      {
        path: 'delivery',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.Logistics] },
        loadChildren: () => import('@admin/logistics').then(m => m.logisticsRoutes)
      },
      // Finance Routes
      {
        path: 'finance',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.Finance] },
        loadChildren: () => import('@admin/finance').then(m => m.financeRoutes)
      },
      // Shared Routes
      {
        path: 'dashboard',
        loadComponent: () => import('./shared/components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./shared/components/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./shared/components/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'unauthorized',
        loadComponent: () => import('./shared/components/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
      }
    ]
  }
];
