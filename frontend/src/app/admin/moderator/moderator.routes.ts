import { Route } from '@angular/router';

export const moderatorRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./components/moderator-dashboard/moderator-dashboard.component').then(m => m.ModeratorDashboardComponent)
  }
];
