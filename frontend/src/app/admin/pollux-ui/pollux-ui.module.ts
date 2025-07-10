import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Layout Components
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { AdminHeaderComponent } from './layout/admin-header.component';
import { AdminSidebarComponent } from './layout/admin-sidebar.component';
import { AdminBreadcrumbComponent } from './layout/admin-breadcrumb.component';
import { AdminFooterComponent } from './layout/admin-footer.component';

// Dashboard Components
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { StatsCardComponent } from './dashboard/stats-card.component';
import { ChartWidgetComponent } from './dashboard/chart-widget.component';

// UI Components
import { CustomButtonComponent } from './components/custom-button.component';
import { DataCardComponent } from './components/data-card.component';

@NgModule({
  declarations: [
    // Layout Components
    AdminLayoutComponent,
    AdminHeaderComponent,
    AdminSidebarComponent,
    AdminBreadcrumbComponent,
    AdminFooterComponent,

    // Dashboard Components
    AdminDashboardComponent,
    StatsCardComponent,
    ChartWidgetComponent,

    // UI Components
    CustomButtonComponent,
    DataCardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    // Layout Components
    AdminLayoutComponent,
    AdminHeaderComponent,
    AdminSidebarComponent,
    AdminBreadcrumbComponent,
    AdminFooterComponent,

    // Dashboard Components
    AdminDashboardComponent,
    StatsCardComponent,
    ChartWidgetComponent,

    // UI Components
    CustomButtonComponent,
    DataCardComponent
  ]
})
export class AdminUIModule { }
