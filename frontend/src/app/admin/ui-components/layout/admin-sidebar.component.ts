import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface NavigationItem {
  title: string;
  icon: string;
  route?: string;
  badge?: {
    text: string;
    class: string;
  };
  children?: NavigationItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.scss']
})
export class AdminSidebarComponent implements OnInit {
  @Input() minimized = false;
  @Input() currentRoute = '';

  navigationItems: NavigationItem[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initializeNavigation();
  }

  private initializeNavigation(): void {
    this.navigationItems = [
      {
        title: 'Dashboard',
        icon: 'typcn-device-desktop',
        route: '/admin/dashboard',
        badge: {
          text: 'new',
          class: 'badge-danger'
        }
      },
      {
        title: 'User Management',
        icon: 'typcn-user-outline',
        children: [
          {
            title: 'All Users',
            icon: 'typcn-user',
            route: '/admin/users'
          },
          {
            title: 'User Roles',
            icon: 'typcn-key-outline',
            route: '/admin/users/roles'
          },
          {
            title: 'Permissions',
            icon: 'typcn-lock-closed',
            route: '/admin/users/permissions'
          }
        ]
      },
      {
        title: 'Product Management',
        icon: 'typcn-shopping-bag',
        children: [
          {
            title: 'All Products',
            icon: 'typcn-th-large',
            route: '/admin/products'
          },
          {
            title: 'Categories',
            icon: 'typcn-folder',
            route: '/admin/products/categories'
          },
          {
            title: 'Inventory',
            icon: 'typcn-chart-bar',
            route: '/admin/products/inventory'
          }
        ]
      },
      {
        title: 'Order Management',
        icon: 'typcn-document-text',
        children: [
          {
            title: 'All Orders',
            icon: 'typcn-clipboard',
            route: '/admin/orders'
          },
          {
            title: 'Pending Orders',
            icon: 'typcn-time',
            route: '/admin/orders/pending'
          },
          {
            title: 'Completed Orders',
            icon: 'typcn-tick',
            route: '/admin/orders/completed'
          }
        ]
      },
      {
        title: 'Analytics',
        icon: 'typcn-chart-pie-outline',
        children: [
          {
            title: 'Sales Reports',
            icon: 'typcn-chart-line',
            route: '/admin/analytics/sales'
          },
          {
            title: 'User Analytics',
            icon: 'typcn-group',
            route: '/admin/analytics/users'
          },
          {
            title: 'Product Analytics',
            icon: 'typcn-chart-area',
            route: '/admin/analytics/products'
          }
        ]
      },
      {
        title: 'Content Management',
        icon: 'typcn-document',
        children: [
          {
            title: 'Pages',
            icon: 'typcn-document-text',
            route: '/admin/content/pages'
          },
          {
            title: 'Blog Posts',
            icon: 'typcn-pen',
            route: '/admin/content/blog'
          },
          {
            title: 'Media Library',
            icon: 'typcn-image',
            route: '/admin/content/media'
          }
        ]
      },
      {
        title: 'Settings',
        icon: 'typcn-cog-outline',
        children: [
          {
            title: 'General Settings',
            icon: 'typcn-cog',
            route: '/admin/settings/general'
          },
          {
            title: 'Payment Settings',
            icon: 'typcn-credit-card',
            route: '/admin/settings/payment'
          },
          {
            title: 'Email Settings',
            icon: 'typcn-mail',
            route: '/admin/settings/email'
          }
        ]
      }
    ];
  }

  toggleSubmenu(item: NavigationItem): void {
    if (item.children) {
      item.expanded = !item.expanded;
      
      // Close other expanded items
      this.navigationItems.forEach(navItem => {
        if (navItem !== item && navItem.children) {
          navItem.expanded = false;
        }
      });
    }
  }

  navigateTo(route: string): void {
    if (route) {
      this.router.navigate([route]);
    }
  }

  isActive(route: string): boolean {
    return this.currentRoute === route;
  }

  isParentActive(item: NavigationItem): boolean {
    if (!item.children) return false;
    
    return item.children.some(child => 
      child.route && this.currentRoute.startsWith(child.route)
    );
  }
}
