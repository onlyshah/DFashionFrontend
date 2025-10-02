import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';

@Component({
    selector: 'app-admin-layout',
    imports: [CommonModule, RouterOutlet, AdminNavbarComponent, AdminSidebarComponent],
    templateUrl: './admin-layout.component.html',
    styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent implements OnInit {
  pageTitle: string = 'Dashboard';
  breadcrumbHome: string = 'Home';
  breadcrumbCurrent: string = 'Main Dashboard';

  constructor(private router: Router) {}

  ngOnInit() {
    // Update breadcrumb based on current route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.updateBreadcrumb(event.url);
        }
      });

    // Set initial breadcrumb
    this.updateBreadcrumb(this.router.url);
  }

  private updateBreadcrumb(url: string) {
    const segments = url.split('/').filter(segment => segment);

    if (segments.includes('dashboard')) {
      this.pageTitle = 'Dashboard';
      this.breadcrumbCurrent = 'Main Dashboard';
    } else if (segments.includes('users')) {
      this.pageTitle = 'User Management';
      this.breadcrumbCurrent = 'Users';
    } else if (segments.includes('products')) {
      this.pageTitle = 'Product Management';
      this.breadcrumbCurrent = 'Products';
    } else if (segments.includes('orders')) {
      this.pageTitle = 'Order Management';
      this.breadcrumbCurrent = 'Orders';
    } else if (segments.includes('analytics')) {
      this.pageTitle = 'Analytics';
      this.breadcrumbCurrent = 'Reports';
    } else {
      this.pageTitle = 'Admin Panel';
      this.breadcrumbCurrent = 'Dashboard';
    }
  }
}
