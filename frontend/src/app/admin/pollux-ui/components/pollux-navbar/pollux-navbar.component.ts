import { Component, OnInit, AfterViewInit, OnDestroy, Output, EventEmitter, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminApiService } from '../../../services/admin-api.service';
import { AnalyticsService } from '../../../services/analytics.service';
import { RevenueAnalytics, ProductAnalytics, TrafficAnalytics } from '../../../services/analytics.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Subscription, Subject, BehaviorSubject, Observable, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, map as rxMap } from 'rxjs/operators';
import { AdminAuthService } from '../../../services/admin-auth.service';
import { UiAnimationService } from '../../../services/ui-animation.service';
import { Router, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { map, shareReplay } from 'rxjs/operators';
import { HostListener } from '@angular/core';
import Chart from 'chart.js/auto';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { environment } from 'src/environments/environment';
import { AdminUser } from 'src/app/admin/services/admin-auth.service';
import { filter } from 'rxjs/operators';
import { AdminNotification } from '../../models/admin-types';
import { AdminNotificationService } from '../../../services/admin-notification.service';
import { QuickAction, NavbarAnalyticsData } from '../../../models/analytics.model';

@Component({
  selector: 'app-pollux-navbar',
  templateUrl: './pollux-navbar.component.html',
  styleUrls: ['./pollux-navbar.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MaterialModule, 
    FormsModule,
    MatBadgeModule,
    MatMenuModule,
    MatIconModule,
    MatDividerModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  encapsulation: ViewEncapsulation.None
})
export class PolluxNavbarComponent implements OnInit, AfterViewInit, OnDestroy {
  analyticsData: NavbarAnalyticsData = {
    totalSales: 0,
    todaysSales: 0,
    activeUsers: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    monthlyGrowth: 0,
    customerRetention: 0,
    cartAbandonment: 0,
    weeklyRevenue: [],
    trafficSources: {},
    topProducts: []
  };
  quickActions: QuickAction[] = [];
  private salesTrends$ = new BehaviorSubject<any[]>([]);
  // Expose outputs and inputs that layout expects
  @Output('menuToggle') sidenavToggle = new EventEmitter<void>();
  @Input() sidebarOpen: boolean | undefined;
  
  private subscriptions = new Subscription();
  private searchSubject = new Subject<string>();
  private analyticsInterval: any;
  private orderUpdateInterval: any;
  currentUser: AdminUser | null = null;
  pageTitle: string = 'Dashboard';
  breadcrumbs: Array<{ label: string; link?: string; icon?: string }> = [];
  searchQuery: string = '';
  isSearching: boolean = false;
  searchResults: any[] = [];
  notificationCount: number = 0;
  recentNotifications: Array<AdminNotification> = [];
  private isLoadingNotifications = false;
  imageUrl = environment.apiUrl;
  isDarkMode = false;

  private revenueChart: Chart | null = null;
  private trafficChart: Chart | null = null;
  // move concrete definitions (chartInstances, searchCache, performanceMetrics) are declared later in file

  constructor(
    private adminAuthService: AdminAuthService,
    private uiAnimationService: UiAnimationService,
    private adminNotificationService: AdminNotificationService,
    private router: Router,
    private snackBar: MatSnackBar,
    private breakpointObserver: BreakpointObserver,
    private dialog: MatDialog,
    private adminApiService: AdminApiService,
    private analyticsService: AnalyticsService
  ) {
    // Initialize dark mode from localStorage
    this.isDarkMode = localStorage.getItem('theme') === 'dark';
    this.applyTheme();

    // Initialize responsive layout observables
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(map(result => result.matches), shareReplay());
    
    this.isTablet$ = this.breakpointObserver.observe([Breakpoints.Tablet])
      .pipe(map(result => result.matches), shareReplay());
    
    this.isDesktop$ = this.breakpointObserver.observe([Breakpoints.Web, Breakpoints.WebLandscape])
      .pipe(map(result => result.matches), shareReplay());
    
    this.isMobile$ = merge(this.isHandset$, this.isTablet$)
      .pipe(map(isSmall => isSmall), shareReplay());

    // Initialize analytics in ngOnInit
  }

  fetchAnalyticsData(): void {
    // safe no-op: prefer using the detailed loader later in the file
    if ((this.analyticsService as any).getDashboardStats) {
      (this.analyticsService as any).getDashboardStats().subscribe({ next: () => {}, error: () => {} });
    }
  }

  fetchQuickActions(): void {
    // Fetch quick actions from backend and assign to UI
    this.subscriptions.add(
      this.adminApiService.getQuickActions().subscribe({
        next: (actions) => {
          this.quickActions = Array.isArray(actions) ? actions : [];
        },
        error: (err: HttpErrorResponse) => {
          console.error('Failed to load quick actions:', err);
          this.quickActions = [];
        }
      })
    );
  }

  private notificationRefreshInterval = 30000; // 30 seconds

  ngOnInit(): void {
      // Fetch analytics data dynamically from backend
      this.fetchAnalyticsData();
      // Fetch quick actions dynamically from backend
      this.fetchQuickActions();
    this.subscriptions.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        this.updateBreadcrumbs();
      })
    );

    // Set up notification auto-refresh
    this.subscriptions.add(
      new Subscription(() => {
        setInterval(() => {
          if (document.visibilityState === 'visible') {
            this.loadNotifications();
          }
        }, this.notificationRefreshInterval);
      })
    );

    // Subscribe to current user
    this.subscriptions.add(
      this.adminAuthService.currentUser$.subscribe({
        next: (user) => {
          this.currentUser = user;
          if (user) {
            this.pageTitle = `Welcome, ${user.fullName}`;
          }
        },
        error: (error) => {
          console.error('Error fetching user data:', error);
          this.router.navigate(['/admin/login']);
        }
      })
    );

    // Set up search debounce
    this.subscriptions.add(
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(searchTerm => {
        this.performSearch(searchTerm);
      })
    );

    // Load notifications
    this.loadNotifications();
    this.updateNotificationCount();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.searchCache.clear();
    this.performanceMetrics.clear();
    this.clearSearch();
    
    // Clear all intervals and timeouts
    if (this.notificationRefreshTimeout) {
      clearTimeout(this.notificationRefreshTimeout);
    }
    if (this.orderUpdateInterval) {
      clearInterval(this.orderUpdateInterval);
    }
    if (this.analyticsInterval) {
      clearInterval(this.analyticsInterval);
    }

    // Properly destroy chart instances
    this.chartInstances.forEach(chart => {
      chart.destroy();
    });
    this.chartInstances.clear();

    // Clean up observables
    this.salesTrends$.complete();

  // Clear stubs
  this.chartInstances.clear();
  this.searchCache.clear();
  this.performanceMetrics.clear();

    // Remove event listeners
    window.removeEventListener('online', this.onNetworkOnline);
    window.removeEventListener('offline', this.onNetworkOffline);
  }

  private notificationRefreshTimeout: any;

  // NOTE: Removed seedSalesTrends() - was generating mock data
  // Real sales trends are loaded from API in loadAnalyticsData() method

  private initializeCharts(): void {
    try {
      const revenueCtx = document.getElementById('revenueChart') as HTMLCanvasElement;
      const trafficCtx = document.getElementById('trafficSourcesChart') as HTMLCanvasElement;

      if (revenueCtx) {
        this.revenueChart = new Chart(revenueCtx, this.getRevenueChartConfig());
        this.chartInstances.set('revenue', this.revenueChart);
      } else {
        console.warn('Revenue chart canvas not found, retrying in 1s...');
        setTimeout(() => this.initializeCharts(), 1000);
        return;
      }

      if (trafficCtx) {
        this.trafficChart = new Chart(trafficCtx, this.getTrafficSourcesConfig());
        this.chartInstances.set('traffic', this.trafficChart);
      } else {
        console.warn('Traffic chart canvas not found, retrying in 1s...');
        setTimeout(() => this.initializeCharts(), 1000);
        return;
      }

      this.logPerformanceMetric('charts-initialization', performance.now());
    } catch (error) {
      console.error('Error initializing charts:', error);
      this.showNetworkStatus('Failed to initialize charts', 'error');
    }
  }

  private startAnalyticsMonitoring(): void {
    const refreshInterval = 300000; // 5 minutes

    this.analyticsInterval = setInterval(() => {
      this.fetchAnalyticsData();

      // Update charts if they exist
      if (this.revenueChart && this.analyticsData.weeklyRevenue) {
        this.revenueChart.data.datasets[0].data = this.analyticsData.weeklyRevenue;
        this.revenueChart.update();
      }
    }, refreshInterval);
  }

  ngAfterViewInit() {
    // Initialize animations after view is ready
    this.uiAnimationService.initializeAllAnimations();
    
    // Initialize charts and start monitoring only if chart canvases exist on this view
    const hasRevenueCanvas = !!document.getElementById('revenueChart');
    const hasTrafficCanvas = !!document.getElementById('trafficSourcesChart');
    if (hasRevenueCanvas && hasTrafficCanvas) {
      this.initializeCharts();
      this.startAnalyticsMonitoring();
    }
  }


  getCurrentDate(): string {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric'
    };
    return now.toLocaleDateString('en-US', options);
  }

  getLastLoginTime(): string {
    if (this.currentUser?.lastLogin) {
      return this.formatNotificationTime(this.currentUser.lastLogin);
    }
    return 'Never logged in';
  }


  toggleSidebar() {
    this.sidenavToggle.emit();
    this.uiAnimationService.toggleSidebar();
  }

  toggleOffcanvas() {
    this.uiAnimationService.toggleMobileSidebar();
  }


  logout() {
    this.adminAuthService.logout();
    this.router.navigate(['/admin/login']);
  }

  onSearch(): void {
    this.isSearching = true;
    this.searchSubject.next(this.searchQuery);
  }

  searchError: string | null = null;

  private performSearch(searchTerm: string): void {
    const searchStartTime = performance.now();
    this.searchError = null;
    
    if (!searchTerm.trim()) {
      this.searchResults = [];
      this.isSearching = false;
      return;
    }
    
    this.logPerformanceMetric('search-start', searchStartTime);

    // Check cache first
    const cachedResults = this.getCachedResults(searchTerm);
    if (cachedResults) {
      this.searchResults = cachedResults;
      this.isSearching = false;
      return;
    }

    // Simulate API call with error handling
    try {
      // In real implementation, this would be an API call
      setTimeout(() => {
        const results = [
          { 
            title: 'Products', 
            icon: 'inventory',
            items: this.filterItems('products', searchTerm)
          },
          { 
            title: 'Orders', 
            icon: 'shopping_cart',
            items: this.filterItems('orders', searchTerm)
          },
          { 
            title: 'Customers', 
            icon: 'people',
            items: this.filterItems('customers', searchTerm)
          }
        ].filter(section => section.items.length > 0); // Only show sections with matches

        this.searchResults = results;
        this.cacheResults(searchTerm, results);
        this.isSearching = false;
      }, 300);
    } catch (error) {
      console.error('Search error:', error);
      this.searchResults = [];
      this.isSearching = false;
      this.searchError = 'An error occurred while searching. Please try again.';
      this.showNetworkStatus('Search failed', 'error');
    }
  }

  onNotificationClick(notification: AdminNotification): void {
    this.trackEvent('notification', 'click', notification.id?.toString());
    if (!notification.read && notification.id) {
      this.subscriptions.add(
        this.adminNotificationService.markAsRead(notification.id).subscribe({
          next: () => {
            notification.read = true;
            this.updateNotificationCount();
            if (notification.link) {
              this.router.navigateByUrl(notification.link);
            }
          },
          error: (error) => {
            console.error('Error marking notification as read:', error);
          }
        })
      );
    } else if (notification.link) {
      this.router.navigateByUrl(notification.link);
    }
  }

  markAllAsRead(): void {
    this.subscriptions.add(
      this.adminNotificationService.markAllAsRead().subscribe({
        next: () => {
          this.recentNotifications.forEach(notification => {
            notification.read = true;
          });
          this.updateNotificationCount();
        },
        error: (error) => {
          console.error('Error marking all notifications as read:', error);
        }
      })
    );
  }

  private updateNotificationCount(): void {
      if (Array.isArray(this.recentNotifications)) {
        this.notificationCount = this.recentNotifications.filter(n => !n.read).length;
      } else {
        console.warn('recentNotifications is not an array:', this.recentNotifications);
        this.notificationCount = 0;
        this.recentNotifications = [];
      }
  }

  private getCachedResults(searchTerm: string): any[] | null {
    const cached = this.searchCache.get(searchTerm);
    const now = Date.now();
    if (cached && (now - this.lastSearchTime) < this.searchCacheTimeout) {
      return cached;
    }
    return null;
  }

  private cacheResults(searchTerm: string, results: any[]): void {
    this.searchCache.set(searchTerm, results);
    this.lastSearchTime = Date.now();

    // Clean up old cache entries
    if (this.searchCache.size > 20) {
      const oldestKey = Array.from(this.searchCache.keys())[0];
      this.searchCache.delete(oldestKey);
    }
  }

  private filterItems(section: string, searchTerm: string): any[] {
    const term = searchTerm.toLowerCase();
    const sectionData = {
      products: [
        { title: 'Summer Collection 2025', link: '/admin/products/summer-2025' },
        { title: 'New Arrivals', link: '/admin/products/new-arrivals' },
        { title: 'Best Sellers', link: '/admin/products/best-sellers' },
        { title: 'Discounted Items', link: '/admin/products/discounted' }
      ],
      orders: [
        { title: 'Recent Orders', link: '/admin/orders/recent' },
        { title: 'Pending Shipments', link: '/admin/orders/pending' },
        { title: 'Completed Orders', link: '/admin/orders/completed' },
        { title: 'Cancelled Orders', link: '/admin/orders/cancelled' }
      ],
      customers: [
        { title: 'VIP Customers', link: '/admin/customers/vip' },
        { title: 'New Registrations', link: '/admin/customers/new' },
        { title: 'Active Customers', link: '/admin/customers/active' },
        { title: 'Customer Support', link: '/admin/customers/support' }
      ]
    };

    return sectionData[section as keyof typeof sectionData]
      .filter(item => item.title.toLowerCase().includes(term));
  }

  private getBreadcrumbIcon(segment: string): string {
    const iconMap: { [key: string]: string } = {
      'dashboard': 'dashboard',
      'products': 'inventory',
      'orders': 'shopping_cart',
      'customers': 'people',
      'campaigns': 'campaign',
      'users': 'group',
      'settings': 'settings',
      'reports': 'assessment',
      'content': 'article',
      'analytics': 'analytics',
      'new': 'add',
      'edit': 'edit',
      'view': 'visibility',
      'categories': 'category',
      'brands': 'branding_watermark'
    };
    return iconMap[segment.toLowerCase()] || 'chevron_right';
  }

  formatNotificationTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }

  searchCache: Map<string, any[]> = new Map();
  searchCacheTimeout = 5 * 60 * 1000; // 5 minutes
  lastSearchTime: number = 0;
  private touchStartX: number | null = null;
  private touchStartY: number | null = null;
  isOnline: boolean = navigator.onLine;
  isHandset$: Observable<boolean>;
  isTablet$: Observable<boolean>;
  isDesktop$: Observable<boolean>;
  isMobile$: Observable<boolean>;
  
  private chartInstances = new Map<string, Chart>();

  // Live order tracking
  recentOrders: any[] = [];

  @HostListener('window:online')
  onNetworkOnline() {
    this.isOnline = true;
    this.loadNotifications(); // Reload notifications when coming back online
    this.showNetworkStatus('Connected to network');
  }

  @HostListener('window:offline')
  onNetworkOffline() {
    this.isOnline = false;
    this.showNetworkStatus('Connection lost', 'error');
  }

  private showNetworkStatus(message: string, type: 'success' | 'error' = 'success') {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: type === 'error' ? 'error-snackbar' : 'success-snackbar',
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  private performanceMetrics: Map<string, number[]> = new Map();

  private logPerformanceMetric(operation: string, startTime: number) {
    const duration = performance.now() - startTime;
    if (!this.performanceMetrics.has(operation)) {
      this.performanceMetrics.set(operation, []);
    }
    const metrics = this.performanceMetrics.get(operation)!;
    metrics.push(duration);
    
    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }

    // Log if performance is degrading
    const avgDuration = metrics.reduce((a, b) => a + b, 0) / metrics.length;
    if (duration > avgDuration * 1.5) {
      console.warn(`Performance degradation detected in ${operation}. Current: ${duration.toFixed(2)}ms, Avg: ${avgDuration.toFixed(2)}ms`);
    }
  }

  @HostListener('window:keydown', ['$event'])
  @HostListener('touchstart', ['$event'])
  handleTouchStart(event: TouchEvent) {
    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
  }

  @HostListener('touchend', ['$event'])
  handleTouchEnd(event: TouchEvent) {
    if (!this.touchStartX || !this.touchStartY) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;

    // If horizontal swipe is greater than vertical movement and exceeds threshold
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        // Swipe right - open sidebar
        this.toggleSidebar();
      } else {
        // Swipe left - close sidebar if open
        if (this.sidebarOpen) {
          this.toggleSidebar();
        }
      }
    }

    this.touchStartX = null;
    this.touchStartY = null;
  }

  handleKeyboardShortcut(event: KeyboardEvent) {
    // Ctrl/Cmd + / to focus search
    if ((event.ctrlKey || event.metaKey) && event.key === '/') {
      event.preventDefault();
      this.focusSearch();
    }
    // Ctrl/Cmd + Q to open quick actions
    else if ((event.ctrlKey || event.metaKey) && event.key === 'q') {
      event.preventDefault();
      this.openQuickActions();
    }
    // Esc to clear search
    else if (event.key === 'Escape' && this.searchQuery) {
      this.clearSearch();
    }
  }

  private focusSearch(): void {
    const searchInput = document.querySelector('.navbar-search-input') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      // Announce to screen readers
      this.announceToScreenReader('Search box activated');
    }
  }

  private announceToScreenReader(message: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }

  private openQuickActions(): void {
    const quickActionsButton = document.querySelector('.quick-actions-btn') as HTMLButtonElement;
    if (quickActionsButton) {
      quickActionsButton.click();
    }
  }

  private clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.isSearching = false;
    this.trackEvent('search', 'clear');
  }

  private initializeAnalytics(): void {
    // Load real analytics data from API
    this.loadAnalyticsData();
    
    // Refresh analytics every 30 seconds
    this.analyticsInterval = setInterval(() => {
      this.loadAnalyticsData();
    }, 30000);

    // Load real order data from API
    this.loadRecentOrders();
    
    // Refresh orders every 30 seconds
    this.orderUpdateInterval = setInterval(() => {
      this.loadRecentOrders();
    }, 30000);
  }

  private loadAnalyticsData(): void {
    // Call real analytics API instead of generating mock data
    this.adminApiService.get('/analytics/dashboard').subscribe({
      next: (response: any) => {
        if (response && response.data) {
          const data = response.data;
          this.analyticsData.activeUsers = data.activeUsers || 0;
          this.analyticsData.todaysSales = data.todaysSales || 0;
          this.analyticsData.conversionRate = data.conversionRate || 0;
          this.analyticsData.averageOrderValue = data.averageOrderValue || 0;
          this.analyticsData.weeklyRevenue = data.weeklyRevenue || [];
          this.analyticsData.monthlyGrowth = data.monthlyGrowth || 0;
          this.analyticsData.customerRetention = data.customerRetention || 0;
          this.analyticsData.cartAbandonment = data.cartAbandonment || 0;
          this.analyticsData.topProducts = data.topProducts || [];
          this.updateCharts();
          this.logPerformanceMetric('analytics-update', performance.now());
        }
      },
      error: (error: any) => {
        console.error('Failed to load analytics data:', error);
        // Show empty data instead of mock data on error
        this.analyticsData = {
          activeUsers: 0,
          todaysSales: 0,
          conversionRate: 0,
          averageOrderValue: 0,
          monthlyGrowth: 0,
          weeklyRevenue: [],
          customerRetention: 0,
          cartAbandonment: 0,
          topProducts: []
        };
      }
    });
  }

  private loadRecentOrders(): void {
    // Load real orders from API
    this.adminApiService.get('/orders', { params: { limit: 5, sort: '-createdAt' } }).subscribe({
      next: (response: any) => {
        if (response && response.data && Array.isArray(response.data)) {
          this.recentOrders = response.data.map((order: any) => ({
            id: order._id || order.id,
            customer: order.customerName || order.customer?.fullName || 'Unknown',
            amount: order.totalAmount || order.amount || 0,
            status: order.status || 'Pending',
            timestamp: order.createdAt ? new Date(order.createdAt) : new Date()
          }));
        }
      },
      error: (error: any) => {
        console.error('Failed to load recent orders:', error);
        this.recentOrders = [];
      }
    });
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
    this.trackEvent('theme', 'toggle', this.isDarkMode ? 'dark' : 'light');
  }

  private applyTheme(): void {
    // Add transition class before changing theme
    document.body.classList.add('theme-transition');
    
    // Update theme classes
    document.body.classList.toggle('dark-theme', this.isDarkMode);
    const theme = this.isDarkMode ? 'dark' : 'light';
    document.body.setAttribute('data-theme', theme);
    
    // Apply theme-specific chart styles
    this.updateChartThemes(theme);

    // Update Material components and custom variables
    const style = document.documentElement.style;
    if (this.isDarkMode) {
      style.setProperty('--primary-bg', '#1a1a1a');
      style.setProperty('--secondary-bg', '#2d2d2d');
      style.setProperty('--text-primary', '#ffffff');
      style.setProperty('--text-secondary', '#b3b3b3');
      style.setProperty('--border-color', '#404040');
    } else {
      style.setProperty('--primary-bg', '#ffffff');
      style.setProperty('--secondary-bg', '#f5f5f5');
      style.setProperty('--text-primary', '#000000');
      style.setProperty('--text-secondary', '#666666');
      style.setProperty('--border-color', '#e0e0e0');
    }

    // Remove transition class after animation
    setTimeout(() => {
      document.body.classList.remove('theme-transition');
    }, 300);
  }

  private trackEvent(category: string, action: string, label?: string): void {
    // Google Analytics tracking
    if ((window as any).gtag) {
      (window as any).gtag('event', action, {
        event_category: category,
        event_label: label
      });
    }

    // Performance tracking for user interactions
    const eventTime = performance.now();
    this.logPerformanceMetric(`${category}-${action}`, eventTime);
  }

  getQuickStats(): { label: string; value: string | number; icon: string; color: string }[] {
    return [
      {
        label: 'Active Users',
        value: this.analyticsData.activeUsers,
        icon: 'people',
        color: 'primary'
      },
      {
        label: "Today's Sales",
        value: `$${this.analyticsData.todaysSales.toLocaleString()}`,
        icon: 'payments',
        color: 'accent'
      },
      {
        label: 'Conversion Rate',
        value: `${Number(this.analyticsData.conversionRate).toFixed(2)}%`,
        icon: 'trending_up',
        color: 'warn'
      },
      {
        label: 'Avg. Order Value',
        value: `$${this.analyticsData.averageOrderValue.toLocaleString()}`,
        icon: 'shopping_cart',
        color: 'success'
      }
    ];
  }

  getLatestOrders(): any[] {
    return this.recentOrders.map(order => ({
      ...order,
      statusColor: this.getOrderStatusColor(order.status)
    }));
  }

  private getOrderStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'orange';
      case 'shipped':
        return 'blue';
      case 'delivered':
        return 'green';
      default:
        return 'grey';
    }
  }

  private updateCharts(): void {
    try {
      const startTime = performance.now();
      
      // Update revenue chart
      const revenueChart = this.chartInstances.get('revenue');
      if (revenueChart) {
        revenueChart.data.datasets[0].data = this.analyticsData.weeklyRevenue;
        revenueChart.update('none'); // Use 'none' for better performance
        this.logPerformanceMetric('chart-update-revenue', startTime);
      }
      
      // Update traffic sources chart
      const trafficChart = this.chartInstances.get('traffic');
      if (trafficChart) {
        trafficChart.data.datasets[0].data = Object.values(this.analyticsData.trafficSources);
        trafficChart.update('none'); // Use 'none' for better performance
        this.logPerformanceMetric('chart-update-traffic', startTime);
      }
    } catch (error) {
      console.error('Error updating charts:', error);
      this.showNetworkStatus('Failed to update analytics charts', 'error');
    }

    // Update sales trends
    this.salesTrends$.next([
      { label: 'Revenue', value: this.analyticsData.todaysSales, trend: this.analyticsData.monthlyGrowth },
      { label: 'Orders', value: Math.floor(this.analyticsData.todaysSales / this.analyticsData.averageOrderValue), trend: 5.2 },
      { label: 'Customers', value: this.analyticsData.activeUsers, trend: 3.8 }
    ]);
  }

  private maxRetries = 3;
  private baseRetryDelay = 2000; // 2 seconds base delay
  
  private getRetryDelay(retryCount: number): number {
    // Exponential backoff with jitter
    const exponentialDelay = this.baseRetryDelay * Math.pow(2, retryCount);
    const jitter = Math.random() * 1000; // Add random delay up to 1 second
    return Math.min(exponentialDelay + jitter, 10000); // Cap at 10 seconds
  }

  private getRevenueChartConfig(): any {
    return {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Weekly Revenue',
          data: this.analyticsData.weeklyRevenue,
          fill: true,
          borderColor: '#4CAF50',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { mode: 'index' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    };
  }

  getTrafficSourcesConfig(): any {
    return {
      type: 'doughnut',
      data: {
        labels: Object.keys(this.analyticsData.trafficSources),
        datasets: [{
          data: Object.values(this.analyticsData.trafficSources),
          backgroundColor: [
            '#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#F44336'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right' }
        }
      }
    };
  }

  private updateChartThemes(theme: 'light' | 'dark'): void {
    const textColor = theme === 'dark' ? '#ffffff' : '#000000';
    const gridColor = theme === 'dark' ? '#404040' : '#e0e0e0';
    
    Chart.defaults.color = textColor;
    Chart.defaults.borderColor = gridColor;

    // Update existing charts with new theme
    this.chartInstances.forEach(chart => {
      if (chart.options && chart.options.scales) {
        Object.values(chart.options.scales).forEach((scale: any) => {
          scale.grid.color = gridColor;
          scale.ticks.color = textColor;
        });
      }
      chart.update();
    });
  }

  getSalesTrends(): Observable<any[]> {
    return this.salesTrends$.asObservable();
  }

  private loadNotifications(retryCount = 0): void {
    this.isLoadingNotifications = true;
    this.subscriptions.add(
      this.adminNotificationService.getNotifications().subscribe({
        next: (notifications) => {
          this.recentNotifications = notifications;
          this.updateNotificationCount();
          this.isLoadingNotifications = false;
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
          
          if (retryCount < this.maxRetries) {
            const delay = this.getRetryDelay(retryCount);
            console.log(`Retrying notification load (${retryCount + 1}/${this.maxRetries}) in ${delay}ms...`);
            setTimeout(() => {
              this.loadNotifications(retryCount + 1);
            }, delay);
          } else {
            this.recentNotifications = [];
            this.updateNotificationCount();
            this.isLoadingNotifications = false;
          }
        }
      })
    );
  }

  private updateBreadcrumbs(): void {
    const urlSegments = this.router.url.split('/').filter(segment => segment);
    this.breadcrumbs = [];
    let path = '';
    
    // Announce navigation to screen readers
    this.announceToScreenReader('Navigation updated');

    urlSegments.forEach((segment, index) => {
      path += `/${segment}`;
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      
      // Skip 'admin' in breadcrumb display
      if (segment !== 'admin') {
        const icon = this.getBreadcrumbIcon(segment);
        this.breadcrumbs.push({
          label,
          icon,
          link: index === urlSegments.length - 1 ? '' : path // Last item is not clickable
        });
      }
    });

    // Update page title based on current route
    this.pageTitle = this.breadcrumbs.length > 0 
      ? this.breadcrumbs[this.breadcrumbs.length - 1].label 
      : 'Dashboard';
  }
}
