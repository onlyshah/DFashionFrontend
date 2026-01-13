import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Pollux UI Components
import { PolluxDashboardComponent } from './dashboard/pollux-dashboard.component';
import { UnifiedDashboardComponent } from '../components/unified-dashboard/unified-dashboard.component';
import { ProductManagementComponent } from './products/product-management.component';
import { CategoryManagementComponent } from '../categories/category-management.component';

// Shared Components
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    PolluxDashboardComponent,
    ProductManagementComponent,
    CategoryManagementComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    SharedModule,
    UnifiedDashboardComponent
  ],
  exports: [
    PolluxDashboardComponent,
    ProductManagementComponent,
    CategoryManagementComponent
  ]
})
export class PolluxUiModule { }
