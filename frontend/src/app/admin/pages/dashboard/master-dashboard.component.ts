import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { AdminPanelComponent } from './panels/admin-panel.component';
import { VendorPanelComponent } from './panels/vendor-panel.component';
import { UserPanelComponent } from './panels/user-panel.component';
import { InfluencerPanelComponent } from './panels/influencer-panel.component';
import { DefaultPanelComponent } from './panels/default-panel.component';

@Component({
  selector: 'app-master-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AdminPanelComponent,
    VendorPanelComponent,
    UserPanelComponent,
    InfluencerPanelComponent,
    DefaultPanelComponent
  ],
  template: `
    <div class="master-dashboard">
      <app-admin-panel *ngIf="userRole === 'admin' || userRole === 'super_admin'"></app-admin-panel>
      <app-vendor-panel *ngIf="userRole === 'vendor'"></app-vendor-panel>
      <app-user-panel *ngIf="userRole === 'user' || userRole === 'customer'"></app-user-panel>
      <app-influencer-panel *ngIf="userRole === 'influencer' || userRole === 'creator'"></app-influencer-panel>
      <app-default-panel *ngIf="!isKnownRole"></app-default-panel>
    </div>
  `,
  styles: [`
    .master-dashboard {
      width: 100%;
      padding: 0;
      margin: 0;
    }
  `]
})
export class MasterDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  userRole: string = '';
  isKnownRole = false;

  private readonly KNOWN_ROLES = ['admin', 'super_admin', 'vendor', 'user', 'customer', 'influencer', 'creator'];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.userRole = user?.role || 'user';
      this.isKnownRole = this.KNOWN_ROLES.includes(this.userRole);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
