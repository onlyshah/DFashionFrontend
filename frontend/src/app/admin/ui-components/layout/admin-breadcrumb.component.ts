import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

interface BreadcrumbItem {
  label: string;
  url: string;
  active: boolean;
}

@Component({
  selector: 'app-admin-breadcrumb',
  templateUrl: './admin-breadcrumb.component.html',
  styleUrls: ['./admin-breadcrumb.component.scss']
})
export class AdminBreadcrumbComponent implements OnChanges {
  @Input() currentRoute = '';
  
  breadcrumbs: BreadcrumbItem[] = [];
  pageTitle = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentRoute']) {
      this.generateBreadcrumbs();
    }
  }

  private generateBreadcrumbs(): void {
    // Reset breadcrumbs
    this.breadcrumbs = [];
    
    // Always add home
    this.breadcrumbs.push({
      label: 'Home',
      url: '/admin/dashboard',
      active: false
    });

    // Skip if we're on the dashboard
    if (this.currentRoute === '/admin/dashboard') {
      this.pageTitle = 'Dashboard';
      this.breadcrumbs[0].active = true;
      return;
    }

    // Split the URL into segments
    const segments = this.currentRoute.split('/').filter(segment => segment);
    
    // Remove 'admin' from segments if present
    const routeSegments = segments[0] === 'admin' ? segments.slice(1) : segments;
    
    // Generate breadcrumbs based on URL segments
    let currentUrl = '/admin';
    
    routeSegments.forEach((segment, index) => {
      currentUrl += `/${segment}`;
      
      // Format the label (capitalize and replace hyphens with spaces)
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Add breadcrumb
      this.breadcrumbs.push({
        label,
        url: currentUrl,
        active: index === routeSegments.length - 1
      });
      
      // Set page title to the last segment
      if (index === routeSegments.length - 1) {
        this.pageTitle = label;
      }
    });
  }
}
