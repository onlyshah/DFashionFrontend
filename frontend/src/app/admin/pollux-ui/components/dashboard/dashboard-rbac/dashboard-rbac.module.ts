import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRbacComponent } from './dashboard-rbac.component';
import { DashboardAdminComponent } from '../dashboard/dashboard-admin.component';
import { DashboardVendorComponent } from '../dashboard-vendor/dashboard-vendor.component';
import { DashboardUserComponent } from '../dashboard-user/dashboard-user.component';
import { DashboardInfluencerComponent } from '../dashboard-influencer/dashboard-influencer.component';
@NgModule({
  imports: [
    CommonModule,
    DashboardRbacComponent,
    DashboardAdminComponent,
    DashboardVendorComponent,
    DashboardUserComponent,
    DashboardInfluencerComponent
  ],
  exports: [DashboardRbacComponent]
})
export class DashboardRbacModule {}
