import { Routes } from '@angular/router';
import { DashboardRbacGuard } from './dashboard-rbac.guard';
import { DashboardRbacComponent } from './dashboard-rbac.component';
export const dashboardRbacRoutes: Routes = [
  {
    path: '',
    component: DashboardRbacComponent,
    canActivate: [DashboardRbacGuard]
  }
];
