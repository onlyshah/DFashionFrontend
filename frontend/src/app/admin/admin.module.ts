import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';



// Routing
import { AdminRoutingModule } from './admin-routing.module';

// Pollux UI Module
import { PolluxUiModule } from './pollux-ui/pollux-ui.module';

// Components
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
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
import { SidebarComponent } from './layout/sidebar.component';
import { HeaderComponent } from './layout/header.component';
import { AdminLoadingComponent } from './shared/components/loading/loading.component';

// Services
import { AdminAuthService } from './services/admin-auth.service';
import { AdminApiService } from './services/admin-api.service';
///import { UserService } from './services/user.service';
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
    // Layout Components (old ones, keeping for compatibility)
    SidebarComponent,
    HeaderComponent,

    // Auth Components
    AdminLoginComponent,

    // Dashboard Components (old one, keeping for compatibility)
    
    // User Management
    UserManagementComponent,
    UserDialogComponent,
    
    // Product Management
    ProductManagementComponent,
    ProductDialogComponent,
    
    // Order Management
    OrderManagementComponent,
    OrderDetailsComponent,
    
    // Analytics
    AnalyticsComponent,
    
    // Settings
    SettingsComponent,

    // Pipes
    RolePipe,
    StatusPipe,
    AdminCurrencyFormatPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AdminRoutingModule,

    // Pollux UI Module
    PolluxUiModule,

    // Angular Material Modules
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatMenuModule,
    MatBadgeModule,
    MatTabsModule,
    MatDividerModule,

    // Standalone Components
    AdminLoadingComponent,
    AdminLayoutComponent,
    AdminDashboardComponent,
    RoleManagementComponent
  ],
  providers: [
    AdminAuthService,
    AdminApiService,
    //UserService,
    AdminProductService,
    OrderService,
    AnalyticsService,
    AdminAuthGuard,
    PermissionGuard
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class AdminModule { }
