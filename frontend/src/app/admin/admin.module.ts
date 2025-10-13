import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

// Angular Material Modules
import { MaterialModule } from '../material.module';

// Routing
import { AdminRoutingModule } from './admin-routing.module';

// Pollux UI Module
import { PolluxUiModule } from './pollux-ui/pollux-ui.module';

// Components
import { PolluxAdminLayoutComponent } from '../admin/pollux-ui/layout/pollux-admin-layout.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { RoleManagementComponent } from './pages/role-management/role-management.component';
import { AdminLoginComponent } from './auth/admin-login.component';
import { UserManagementComponent } from './users/user-management.component';
import { UserDialogComponent } from './users/user-dialog.component';
import { ProductManagementComponent } from './products/product-management.component';
import { ProductDialogComponent } from './products/product-dialog.component';
import { OrderManagementComponent } from './orders/order-management.component';
import { OrderDetailsComponent } from './orders/order-details.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { SettingsComponent } from './settings/settings.component';
import { PolluxSidebarComponent } from '../admin/pollux-ui/components/pollux-sidebar/pollux-sidebar.component';
// import { PolluxNavbarComponent } from './pollux-ui/components/pollux-navbar/pollux-navbar.component';
import { AdminLoadingComponent } from './shared/components/loading/loading.component';

// Services
import { AdminAuthService } from './services/admin-auth.service';
import { AdminApiService } from './services/admin-api.service';
import { AdminProductService } from './services/product.service';
import { OrderService } from './services/order.service';
import { AnalyticsService } from './services/analytics.service';

// Guards
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { PermissionGuard } from './guards/permission.guard';

// Pipes
import { RolePipe } from './pipes/role.pipe';
import { StatusPipe } from './pipes/status.pipe';
import { CurrencyFormatPipe as AdminCurrencyFormatPipe } from './pipes/currency-format.pipe';

@NgModule({
  declarations: [
  // PolluxSidebarComponent, // Standalone, import instead
  // PolluxNavbarComponent,
    AdminLoginComponent,
    UserManagementComponent,
    UserDialogComponent,
    ProductManagementComponent,
    ProductDialogComponent,
    OrderManagementComponent,
    OrderDetailsComponent,
    AnalyticsComponent,
    SettingsComponent,
    RolePipe,
    StatusPipe,
    AdminCurrencyFormatPipe,
  // AdminLoadingComponent, // Standalone, import instead
  // AdminLayoutComponent, // Standalone, import instead
  // AdminDashboardComponent, // Standalone, import instead
  // RoleManagementComponent, // Standalone, import instead
  
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AdminRoutingModule,
    PolluxUiModule,
    MaterialModule,
    PolluxSidebarComponent,
    AdminLoadingComponent,
   PolluxAdminLayoutComponent,
    AdminDashboardComponent,
    RoleManagementComponent,
    
  ],
  providers: [
    AdminAuthService,
    AdminApiService,
    AdminProductService,
    OrderService,
    AnalyticsService,
    AdminAuthGuard,
    PermissionGuard,
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AdminModule {}
