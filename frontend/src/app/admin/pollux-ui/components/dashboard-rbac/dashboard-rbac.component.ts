import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardAdminComponent } from '../dashboard/dashboard-admin.component';
import { DashboardVendorComponent } from '../dashboard-vendor/dashboard-vendor.component';
import { DashboardUserComponent } from '../dashboard-user/dashboard-user.component';
import { DashboardInfluencerComponent } from '../dashboard-influencer/dashboard-influencer.component';
import { DashboardRbacActions } from './dashboard-rbac.actions';
import { selectDashboardComponent } from './dashboard-rbac.selectors';

@Component({
  selector: 'app-dashboard-rbac',
  templateUrl: './dashboard-rbac.component.html',
  styleUrls: ['./dashboard-rbac.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DashboardAdminComponent,
    DashboardVendorComponent,
    DashboardUserComponent,
    DashboardInfluencerComponent
  ]
})
export class DashboardRbacComponent implements OnInit {
  @Input() role: string = '';
  dashboardComponent: string = '';

  constructor(private rbacActions: DashboardRbacActions) {}

  ngOnInit(): void {
    this.dashboardComponent = selectDashboardComponent(this.role);
  }

  canAccess(requiredRole: string): boolean {
    return this.rbacActions.canAccess(this.role, requiredRole);
  }
}
