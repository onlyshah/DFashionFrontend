import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../../../core/services/auth.service';
import { AdminHeaderComponent } from '../../../../../admin/pages/components/admin-header/admin-header.component';
import { AdminSidebarComponent } from '../../../../../admin/pages/components/admin-sidebar/admin-sidebar.component';
import { MasterDashboardComponent } from '../../../dashboard/master-dashboard.component';
import { Router, NavigationEnd } from '@angular/router';
import { RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-general-dashboard',
  standalone: true,
  imports: [CommonModule, AdminHeaderComponent, AdminSidebarComponent, RouterModule, MasterDashboardComponent],
  templateUrl: './general-dashboard.component.html',
  styleUrls: ['./general-dashboard.component.scss']
})
export class GeneralDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();
  
  isChildRoute = false;
  userRole$ = this.authService.userRole$;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.isAuthenticated$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isAuthenticated => {
      if (!isAuthenticated) {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  ngOnInit(): void {
    this.detectChildRoute();
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.detectChildRoute();
    });
  }

  private detectChildRoute(): void {
    const urlSegments = this.router.url.split('/').filter(s => s);
    this.isChildRoute = urlSegments.length > 2 || (urlSegments.length === 2 && urlSegments[1] !== 'dashboard');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    const dropdowns = document.querySelectorAll('.dropdown-toggle');
    dropdowns.forEach(dropdown => {
      if (dropdown) {
        import('bootstrap').then(bootstrap => {
          new bootstrap.Dropdown(dropdown);
        });
      }
    });
  }
}
