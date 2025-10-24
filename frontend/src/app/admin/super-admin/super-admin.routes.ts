import { Route } from '@angular/router';
import { RoleGuard } from '../shared/guards/role.guard';
import { UserRole } from '../shared/models/role.model';

export const superAdminRoutes: Route[] = [
  {
    path: 'permissions',
    loadComponent: () => import('./components/permissions/permissions-list.component')
      .then(m => m.PermissionsListComponent)
  },
  {
    path: 'roles',
    children: [
      {
        path: '',
        loadComponent: () => import('./components/roles/roles-list.component').then(m => m.RolesListComponent)
      },
      {
        path: 'create',
  loadComponent: () => import('./components/roles').then(m => m.RoleFormComponent)
      },
      {
        path: 'edit/:id',
  loadComponent: () => import('./components/roles').then(m => m.RoleFormComponent)
      }
    ]
  },
  {
    path: 'permissions',
    children: [
      {
        path: '',
        loadComponent: () => import('./components/permissions/permissions-list.component').then(m => m.PermissionsListComponent)
      },
      {
        path: 'create',
        loadComponent: () => import('./components/permissions/permission-form.component').then(m => m.PermissionFormComponent)
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./components/permissions/permission-form.component').then(m => m.PermissionFormComponent)
      }
    ]
  },
  {
    path: 'audit-logs',
    loadComponent: () => import('./components/audit/audit-logs.component').then(m => m.AuditLogsComponent)
  },
  {
    path: 'platform-settings',
    children: [
      {
        path: '',
        loadComponent: () => import('./components/platform/platform-settings.component').then(m => m.PlatformSettingsComponent)
      },
      {
        path: 'integrations',
        loadComponent: () => import('./components/platform/platform-integrations.component').then(m => m.PlatformIntegrationsComponent)
      },
      {
        path: 'monetization',
  loadComponent: () => import('./components/platform').then(m => m.MonetizationSettingsComponent)
      }
    ]
  }
];