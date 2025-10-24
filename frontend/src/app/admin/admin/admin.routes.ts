import { Route } from '@angular/router';

export const adminRoutes: Route[] = [
    {
        path: '',
        children: [
            {
                path: '',
                loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component')
                    .then(m => m.AdminDashboardComponent)
            },
            {
                path: 'users',
                loadComponent: () => import('./components/users/user-list.component')
                    .then(m => m.UserListComponent)
            },
            {
                path: 'system',
                loadComponent: () => import('./components/system/system-settings.component')
                    .then(m => m.SystemSettingsComponent)
            }
        ]
    }
];