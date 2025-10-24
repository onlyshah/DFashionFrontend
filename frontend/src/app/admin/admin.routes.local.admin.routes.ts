import { Route } from '@angular/router';

export const adminRoutes: Route[] = [
  {
    path: '',
  loadComponent: () => import('./components/users').then(m => m.UserListComponent)
  }
];
