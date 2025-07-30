import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

interface NavigationItem {
  id: string;
  title: string;
  icon: string;
  route?: string;
  badge?: string;
  children?: Omit<NavigationItem, 'icon' | 'children' | 'expanded'>[];
  expanded?: boolean;
}

interface Message {
  sender: string;
  senderInitials: string;
  preview: string;
  time: string;
}

interface Notification {
  title: string;
  icon: string;
  type: string;
  time: string;
}

@Component({
  selector: 'app-pollux-admin-layout',
  templateUrl: './pollux-admin-layout.component.html',
  styleUrls: ['../pollux-ui.scss']
})
export class PolluxAdminLayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentUser: any = null;
  pageTitle = 'Dashboard';
  breadcrumbTitle = 'Main Dashboard';
  searchQuery = '';
  sidebarOpen = false;
  isMobile = false;
  currentYear = new Date().getFullYear();
  
  unreadMessages = 0;
  unreadNotifications = 0;
  
  recentMessages: Message[] = [];
  recentNotifications: Notification[] = [];
  
  navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'typcn-device-desktop',
      route: '/dashboard',
      badge: 'new'
    },
    {
      id: 'ecommerce',
      title: 'E-commerce',
      icon: 'typcn-shopping-cart',
      expanded: false,
      children: [
        { id: 'products', title: 'Products', route: '/admin/products' },
        { id: 'categories', title: 'Categories', route: '/admin/categories' },
        { id: 'brands', title: 'Brands', route: '/admin/brands' },
        { id: 'attributes', title: 'Attributes', route: '/admin/attributes' },
        { id: 'orders', title: 'Orders', route: '/admin/orders' }
      ]
    },
    {
      id: 'inventory',
      title: 'Inventory',
      icon: 'typcn-archive',
      expanded: false,
      children: [
        { id: 'stock', title: 'Stock Management', route: '/admin/stock' },
        { id: 'suppliers', title: 'Suppliers', route: '/admin/suppliers' },
        { id: 'warehouses', title: 'Warehouses', route: '/admin/warehouses' }
      ]
    },
    {
      id: 'users',
      title: 'User Management',
      icon: 'typcn-group',
      expanded: false,
      children: [
        { id: 'customers', title: 'Customers', route: '/admin/customers' },
        { id: 'vendors', title: 'Vendors', route: '/admin/vendors' },
        { id: 'admins', title: 'Administrators', route: '/admin/admins' },
        { id: 'roles', title: 'Roles & Permissions', route: '/admin/roles' }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: 'typcn-chart-pie-outline',
      expanded: false,
      children: [
        { id: 'sales-reports', title: 'Sales Reports', route: '/admin/analytics/sales' },
        { id: 'user-analytics', title: 'User Analytics', route: '/admin/analytics/users' },
        { id: 'product-analytics', title: 'Product Analytics', route: '/admin/analytics/products' }
      ]
    },
    {
      id: 'marketing',
      title: 'Marketing',
      icon: 'typcn-megaphone',
      expanded: false,
      children: [
        { id: 'campaigns', title: 'Campaigns', route: '/admin/campaigns' },
        { id: 'coupons', title: 'Coupons', route: '/admin/coupons' },
        { id: 'newsletters', title: 'Newsletters', route: '/admin/newsletters' }
      ]
    },
    {
      id: 'content',
      title: 'Content Management',
      icon: 'typcn-document-text',
      expanded: false,
      children: [
        { id: 'pages', title: 'Pages', route: '/admin/pages' },
        { id: 'blogs', title: 'Blog Posts', route: '/admin/blogs' },
        { id: 'media', title: 'Media Library', route: '/admin/media' }
      ]
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'typcn-cog',
      expanded: false,
      children: [
        { id: 'general', title: 'General Settings', route: '/admin/settings/general' },
        { id: 'payment', title: 'Payment Settings', route: '/admin/settings/payment' },
        { id: 'shipping', title: 'Shipping Settings', route: '/admin/settings/shipping' },
        { id: 'tax', title: 'Tax Settings', route: '/admin/settings/tax' }
      ]
    },
    {
      id: 'system',
      title: 'System',
      icon: 'typcn-cog-outline',
      expanded: false,
      children: [
        { id: 'logs', title: 'System Logs', route: '/admin/system/logs' },
        { id: 'backups', title: 'Backups', route: '/admin/system/backups' },
        { id: 'maintenance', title: 'Maintenance', route: '/admin/system/maintenance' }
      ]
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.checkScreenSize();
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadNotifications();
    this.loadMessages();
    this.setupRouterEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth < 992;
    if (!this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  private loadCurrentUser(): void {
    this.authService.getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  private loadNotifications(): void {
    // Load from database - replace with actual service call
    this.recentNotifications = [
      {
        title: 'New Order Received',
        icon: 'typcn-info',
        type: 'success',
        time: 'Just now'
      },
      {
        title: 'Low Stock Alert',
        icon: 'typcn-warning',
        type: 'warning',
        time: '5 minutes ago'
      },
      {
        title: 'New User Registration',
        icon: 'typcn-user',
        type: 'info',
        time: '10 minutes ago'
      }
    ];
    this.unreadNotifications = this.recentNotifications.length;
  }

  private loadMessages(): void {
    // Load from database - replace with actual service call
    this.recentMessages = [
      {
        sender: 'John Doe',
        senderInitials: 'JD',
        preview: 'Question about order status...',
        time: '2 minutes ago'
      },
      {
        sender: 'Jane Smith',
        senderInitials: 'JS',
        preview: 'Product inquiry for bulk order...',
        time: '15 minutes ago'
      }
    ];
    this.unreadMessages = this.recentMessages.length;
  }

  private setupRouterEvents(): void {
    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.updatePageTitle(event.url);
          if (this.isMobile) {
            this.sidebarOpen = false;
          }
        }
      });
  }

  private updatePageTitle(url: string): void {
    // Update page title based on current route
    const segments = url.split('/').filter(s => s);
    if (segments.length > 1) {
      this.pageTitle = this.formatTitle(segments[segments.length - 1]);
      this.breadcrumbTitle = this.formatTitle(segments[segments.length - 1]);
    } else {
      this.pageTitle = 'Dashboard';
      this.breadcrumbTitle = 'Main Dashboard';
    }
  }

  private formatTitle(segment: string): string {
    return segment.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  toggleSubmenu(item: NavigationItem): void {
    item.expanded = !item.expanded;
  }

  onMenuItemClick(item: NavigationItem): void {
    if (this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      // Implement search functionality
      console.log('Searching for:', this.searchQuery);
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUserInitials(): string {
    if (!this.currentUser) return 'U';
    const names = this.currentUser.fullName?.split(' ') || ['User'];
    return names.length > 1 
      ? names[0][0] + names[1][0] 
      : names[0][0] + names[0][1] || 'U';
  }

  getRoleColor(): string {
    if (!this.currentUser) return '#6c7ae0';
    
    switch (this.currentUser.role?.toLowerCase()) {
      case 'super_admin': return '#ff4d4f';
      case 'admin': return '#6c7ae0';
      case 'vendor': return '#52c41a';
      case 'customer': return '#1890ff';
      default: return '#6c7ae0';
    }
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  getLastLoginTime(): string {
    // Get from user data or session
    return 'Today at 9:30 AM';
  }
}
