import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { RouterModule } from '@angular/router';

// Angular Material Modules
import { MaterialModule } from '../material.module';

// Routing
import { AdminRoutingModule } from './admin-routing.module';

// Removed Pollux UI Module

// Components
import { SuperAdminDashboardComponent } from './pages/components/super-admin-dashboard/super-admin-dashboard.component';
import { GeneralDashboardComponent } from './pages/components/dashboard/general-dashboard/general-dashboard.component';
import { AdminHeaderComponent } from './pages/components/admin-header/admin-header.component';
import { AdminSidebarComponent } from './pages/components/admin-sidebar/admin-sidebar.component';
import { RoleManagementComponent } from './pages/role-management/role-management.component';
import { UserManagementComponent } from './pages/users/user-management.component';
import { UserDialogComponent } from './pages/users/user-dialog.component';
import { ProductManagementComponent } from './pages/products/product-management.component';
import { ProductDialogComponent } from './pages/products/product-dialog.component';
import { ProductCreateComponent } from './pages/products/product-create.component';
import { ProductDetailComponent } from './pages/products/product-detail.component';
import { ProductVariantsComponent } from './pages/products/product-variants.component';
import { ProductMediaComponent } from './pages/products/product-media.component';
import { ProductTaggingComponent } from './pages/products/product-tagging.component';
import { SubCategoryManagementComponent } from './pages/categories/sub-category-management.component';
import { OrderManagementComponent } from './pages/orders/order-management.component';
import { OrderDetailsComponent } from './pages/orders/order-details.component';
import { AnalyticsComponent } from './pages/analytics/analytics.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { OverviewComponent } from './pages/overview/overview.component';
import { ReturnsManagementComponent } from './pages/returns-management/returns-management.component';
import { AdminLoadingComponent } from './shared/components/loading/loading.component';
import { AdminListComponent } from './pages/admin-list/admin-list.component';

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
    // UserManagementComponent is now standalone
    // OrderManagementComponent is now standalone, import instead
    UserDialogComponent,
    ProductManagementComponent,
    ProductDialogComponent,
    OrderDetailsComponent,
    AnalyticsComponent,
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
    RouterModule,
    AdminRoutingModule,
    MaterialModule,
    AdminHeaderComponent,
    AdminSidebarComponent,
    SuperAdminDashboardComponent,
    GeneralDashboardComponent,
    AdminLoadingComponent,
    AdminListComponent,
    OverviewComponent,
    ReturnsManagementComponent,
    SettingsComponent,
    ProductCreateComponent,
    ProductDetailComponent,
    ProductVariantsComponent,
    ProductMediaComponent,
    ProductTaggingComponent,
    SubCategoryManagementComponent,
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
