import { Routes } from '@angular/router';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { DashboardPageComponent } from './pages/dashboard/dashboard-page.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: DashboardPageComponent,
  },
];

export const adminRoutingProviders = [
  provideRouter(adminRoutes, withComponentInputBinding()),
];
