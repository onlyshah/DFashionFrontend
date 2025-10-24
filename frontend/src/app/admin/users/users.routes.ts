import { Route } from '@angular/router';
import { RoleGuard } from '../shared/guards/role.guard';
import { UserRole } from '../shared/models/role.model';

export const usersRoutes: Route[] = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('../components/users/user-list.component').then(m => m.UserListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('../components/users').then(m => m.UserFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('../components/users').then(m => m.UserDetailComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('../components/users').then(m => m.UserFormComponent)
      }
    ]
  }
];