import { NgModule, Injectable } from '@angular/core';
import { RouterModule, Routes, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Router } from '@angular/router';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { PermissionGuard } from './guards/permission.guard';
import { RoleGuard } from './guards/role.guard';
import { AdminAuthService } from './services/admin-auth.service';

// Components

@Injectable({ providedIn: 'root' })
export class SuperAdminGuard implements CanActivate {
  constructor(
    private adminAuthService: AdminAuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const user = this.adminAuthService.getCurrentUser();
    
    // Allow super_admin or admin roles
    if (user && (user.role === 'super_admin' || user.role === 'admin')) {
      return true;
    }

    // If not super_admin, redirect to dashboard
    console.warn('SuperAdminGuard: User does not have super_admin role');
    this.router.navigate(['/admin/dashboard']);
    return false;
  }
}
import { SuperAdminDashboardComponent } from './pages/components/super-admin-dashboard/super-admin-dashboard.component';
import { GeneralDashboardComponent } from './pages/components/dashboard/general-dashboard/general-dashboard.component';
import { OverviewComponent } from './pages/overview/overview.component';
import { NewslettersComponent } from './pages/marketing/newsletters.component';
import { BlogPostsComponent } from './pages/cms/blog-posts.component';
import { MediaLibraryComponent } from './pages/cms/media-library.component';
import { SuppliersComponent } from './pages/inventory/suppliers.component';
import { WarehousesComponent } from './pages/inventory/warehouses.component';
import { InventoryComponent } from './pages/inventory/inventory.component';
import { InventoryAlertsComponent } from './pages/inventory/inventory-alerts.component';
import { InventoryHistoryComponent } from './pages/inventory/inventory-history.component';
import { SystemLogsComponent } from './pages/system/system-logs.component';
import { BackupsComponent } from './pages/system/backups.component';
import { MaintenanceComponent } from './pages/system/maintenance.component';
import { UserManagementComponent } from './pages/users/user-management.component';
import { OrderManagementComponent } from './pages/orders/order-management.component';
import { ProductManagementComponent } from './pages/products/product-management.component';
import { CategoryManagementComponent } from './pages/categories/category-management.component';
import { RoleManagementComponent } from './pages/role-management/role-management.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { AnalyticsComponent } from './pages/analytics/analytics.component';
import { ReturnsManagementComponent } from './pages/returns-management/returns-management.component';
import { CouponManagementComponent } from './pages/marketing/coupon-management.component';
import { PageManagementComponent } from './pages/cms/page-management.component';
import { CampaignManagementComponent } from './pages/marketing/campaign-management.component';
import { SocialEngagementComponent } from './pages/social/social-engagement.component';
import { CustomersComponent } from './pages/users/customers.component';
import { VendorsComponent } from './pages/users/vendors.component';
import { CreatorsComponent } from './pages/users/creators.component';
import { AdminsComponent } from './pages/users/admins.component';
import { ActivityLogsComponent } from './pages/users/activity-logs.component';
import { AlertsComponent } from './pages/alerts/alerts.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AdminAuthGuard],
    component: GeneralDashboardComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        component: OverviewComponent,
        data: { title: 'Overview' }
      },
      {
        path: 'dashboard',
        component: GeneralDashboardComponent,
        data: { title: 'Dashboard' }
      },
      {
        path: 'dashboard/super',
        component: SuperAdminDashboardComponent,
        canActivate: [SuperAdminGuard],
        data: { title: 'Super Admin Dashboard' }
      },
      {
        path: 'users',
        component: UserManagementComponent,
        canActivate: [PermissionGuard],
        data: { title: 'User Management', module: 'users', roles: ['super_admin', 'admin'] }
      },
      {
        path: 'users/customers',
        component: CustomersComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Customer Management', permission: 'users:view' }
      },
      {
        path: 'users/vendors',
        component: VendorsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Vendor Management', permission: 'users:view' }
      },
      {
        path: 'users/creators',
        component: CreatorsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Creators & Influencers', permission: 'users:view' }
      },
      {
        path: 'users/admins',
        component: AdminsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Admin Users', permission: 'users:view' }
      },
      {
        path: 'activity-logs',
        component: ActivityLogsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Activity Logs', permission: 'logs:view' }
      },
      {
        path: 'customers',
        component: CustomersComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Customer Management', permission: 'users:view', role: 'customer' }
      },
      {
        path: 'vendors',
        component: VendorsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Vendor Management', permission: 'users:view', role: 'vendor' }
      },
      {
        path: 'admins',
        component: AdminsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Admin Management', permission: 'users:view', role: 'admin' }
      },
      {
        path: 'roles',
        component: RoleManagementComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Roles & Permissions', permission: 'roles:manage' }
      },
      {
        path: 'products',
        component: ProductManagementComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Product Management', module: 'products' }
      },
      {
        path: 'products/new',
        loadComponent: () => import('./pages/products/product-create.component').then(m => m.ProductCreateComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Create Product', permission: 'products:create' }
      },
      {
        path: 'products/:id',
        loadComponent: () => import('./pages/products/product-detail.component').then(m => m.ProductDetailComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Product Details', permission: 'products:view' }
      },
      {
        path: 'products/variants',
        loadComponent: () => import('./pages/products/product-variants.component').then(m => m.ProductVariantsComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Product Variants', permission: 'products:view' }
      },
      {
        path: 'products/media',
        loadComponent: () => import('./pages/products/product-media.component').then(m => m.ProductMediaComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Product Media', permission: 'products:edit' }
      },
      {
        path: 'products/tagging',
        loadComponent: () => import('./pages/products/product-tagging.component').then(m => m.ProductTaggingComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Product Tagging', permission: 'products:edit' }
      },
      {
        path: 'categories',
        component: CategoryManagementComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Category Management', permission: 'categories:view' }
      },
      {
        path: 'sub-categories',
        loadComponent: () => import('./pages/categories/sub-category-management.component').then(m => m.SubCategoryManagementComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Sub-Category Management', permission: 'categories:view' }
      },
      {
        path: 'brands',
        component: ProductManagementComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Brand Management', permission: 'brands:view', type: 'brands' }
      },
      {
        path: 'attributes',
        component: ProductManagementComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Attribute Management', permission: 'attributes:view', type: 'attributes' }
      },
      {
        path: 'orders',
        component: OrderManagementComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Order Management', module: 'orders' }
      },
      {
        path: 'stock',
        component: ProductManagementComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Stock Management', permission: 'products:view', type: 'stock' }
      },
      {
        path: 'analytics',
        component: AnalyticsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Analytics', module: 'analytics' }
      },
      {
        path: 'alerts',
        component: AlertsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Alerts & Notifications', module: 'alerts' }
      },
      // TODO: Implement admin profile page
      // {
      //   path: 'profile',
      //   loadComponent: () => import('./pages/features/profile/pages/profile/profile.component').then(m => m.ProfileComponent),
      //   data: { title: 'Profile' }
      // },
      {
        path: 'analytics/sales',
        component: AnalyticsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Sales Reports', permission: 'analytics:view', type: 'sales' }
      },
      {
        path: 'analytics/users',
        component: AnalyticsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'User Analytics', permission: 'analytics:view', type: 'users' }
      },
      {
        path: 'analytics/products',
        component: AnalyticsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Product Analytics', permission: 'analytics:view', type: 'products' }
      },
      {
        path: 'settings',
        component: SettingsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Settings', module: 'settings' }
      },
      {
        path: 'settings/general',
        component: SettingsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'General Settings', permission: 'settings:view', type: 'general' }
      },
      {
        path: 'settings/payment',
        component: SettingsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Payment Settings', permission: 'settings:view', type: 'payment' }
      },
      {
        path: 'settings/shipping',
        component: SettingsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Shipping Settings', permission: 'settings:view', type: 'shipping' }
      },
      {
        path: 'settings/tax',
        component: SettingsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Tax Settings', permission: 'settings:view', type: 'tax' }
      },
      {
        path: 'orders/returns',
        component: ReturnsManagementComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Returns & Refunds', module: 'orders' }
      },
      // Campaigns (Marketing)
      {
        path: 'marketing/campaigns',
        component: CampaignManagementComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Campaigns', permission: 'marketing:view' }
      },
      // Coupons & Promotions (Marketing)
      {
        path: 'marketing/coupons',
        component: CouponManagementComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Coupons & Promotions', permission: 'marketing:view' }
      },
      // Newsletters (Marketing)
      {
        path: 'marketing/newsletters',
        component: NewslettersComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Newsletters', permission: 'marketing:view' }
      },
      // Pages (Content Management)
      {
        path: 'pages',
        component: PageManagementComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Pages', permission: 'content:view' }
      },
      // Blog Posts (Content Management)
      {
        path: 'blogs',
        component: BlogPostsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Blog Posts', permission: 'content:view' }
      },
      // Media Library (Content Management)
      {
        path: 'media',
        component: MediaLibraryComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Media Library', permission: 'content:view' }
      },
      // Inventory (Main)
      {
        path: 'inventory',
        component: InventoryComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Inventory', permission: 'inventory:view' }
      },
      // Inventory Alerts
      {
        path: 'inventory/alerts',
        component: InventoryAlertsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Inventory Alerts', permission: 'inventory:view' }
      },
      // Inventory History
      {
        path: 'inventory/history',
        component: InventoryHistoryComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Inventory History', permission: 'inventory:view' }
      },
      // Suppliers (Inventory)
      {
        path: 'suppliers',
        component: SuppliersComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Suppliers', permission: 'inventory:view' }
      },
      // Warehouses (Inventory)
      {
        path: 'warehouses',
        component: WarehousesComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Warehouses', permission: 'inventory:view' }
      },
      // System Logs
      {
        path: 'system/logs',
        component: SystemLogsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'System Logs', permission: 'system:view' }
      },
      // Backups
      {
        path: 'system/backups',
        component: BackupsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Backups', permission: 'system:view' }
      },
      // Maintenance
      {
        path: 'system/maintenance',
        component: MaintenanceComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Maintenance', permission: 'system:view' }
      },
      // Social Engagement
      {
        path: 'social',
        component: SocialEngagementComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Social Engagement', permission: 'social:view' }
      },

      // Social Feed Sub-routes
      {
        path: 'social/posts',
        loadComponent: () => import('./pages/social/social-posts.component').then(m => m.SocialPostsComponent),
        canActivate: [PermissionGuard],
        data: { title: 'All Posts', permission: 'social:view' }
      },
      {
        path: 'social/videos',
        loadComponent: () => import('./pages/social/social-videos.component').then(m => m.SocialVideosComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Video Feed', permission: 'social:view' }
      },
      {
        path: 'social/tagged',
        loadComponent: () => import('./pages/social/social-tagged-products.component').then(m => m.SocialTaggedProductsComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Product-Tagged Posts', permission: 'social:view' }
      },
      {
        path: 'social/hashtags',
        loadComponent: () => import('./pages/social/social-hashtags.component').then(m => m.SocialHashtagsComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Hashtags', permission: 'social:view' }
      },
      {
        path: 'social/reported',
        loadComponent: () => import('./pages/social/social-reported-content.component').then(m => m.SocialReportedContentComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Reported Content', permission: 'social:view' }
      },
      {
        path: 'social/comments',
        loadComponent: () => import('./pages/social/social-comment-moderation.component').then(m => m.SocialCommentModerationComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Comment Moderation', permission: 'social:view' }
      },

      // Payments Sub-routes
      {
        path: 'payments/transactions',
        loadComponent: () => import('./pages/payments/payment-transactions.component').then(m => m.PaymentTransactionsComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Transactions', permission: 'payments:view' }
      },
      {
        path: 'payments/methods',
        loadComponent: () => import('./pages/payments/payment-methods.component').then(m => m.PaymentMethodsComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Payment Methods', permission: 'payments:view' }
      },
      {
        path: 'payments/refunds',
        loadComponent: () => import('./pages/payments/refund-management.component').then(m => m.RefundManagementComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Refund Management', permission: 'payments:view' }
      },
      {
        path: 'payments/payouts',
        loadComponent: () => import('./pages/payments/seller-payouts.component').then(m => m.SellerPayoutsComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Seller Payouts', permission: 'payments:view' }
      },
      {
        path: 'payments/wallet',
        loadComponent: () => import('./pages/payments/wallet-cod.component').then(m => m.WalletCodComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Wallet & COD', permission: 'payments:view' }
      },

      // Orders Sub-routes
      {
        path: 'orders/pending',
        loadComponent: () => import('./pages/orders/pending-orders.component').then(m => m.PendingOrdersComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Pending Orders', permission: 'orders:view' }
      },
      {
        path: 'orders/completed',
        loadComponent: () => import('./pages/orders/completed-orders.component').then(m => m.CompletedOrdersComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Completed Orders', permission: 'orders:view' }
      },
      {
        path: 'orders/cancelled',
        loadComponent: () => import('./pages/orders/cancelled-orders.component').then(m => m.CancelledOrdersComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Cancelled Orders', permission: 'orders:view' }
      },
      {
        path: 'invoices',
        loadComponent: () => import('./pages/orders/invoices.component').then(m => m.InvoicesComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Invoices', permission: 'orders:view' }
      },

      // Live Commerce Routes
      {
        path: 'live',
        loadComponent: () => import('./pages/live-commerce/live-streams.component').then(m => m.LiveStreamsComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Live Streams', permission: 'live:view' }
      },
      {
        path: 'live/schedule',
        loadComponent: () => import('./pages/live-commerce/live-schedule.component').then(m => m.LiveScheduleComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Schedule Live', permission: 'live:view' }
      },
      {
        path: 'live/pinned',
        loadComponent: () => import('./pages/live-commerce/live-pinned-products.component').then(m => m.LivePinnedProductsComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Pinned Products', permission: 'live:view' }
      },
      {
        path: 'live/orders',
        loadComponent: () => import('./pages/live-commerce/live-orders.component').then(m => m.LiveOrdersComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Live Orders', permission: 'live:view' }
      },
      {
        path: 'live/chat',
        loadComponent: () => import('./pages/live-commerce/live-chat-moderation.component').then(m => m.LiveChatModerationComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Live Chat Moderation', permission: 'live:view' }
      },
      {
        path: 'live/analytics',
        loadComponent: () => import('./pages/live-commerce/live-analytics.component').then(m => m.LiveAnalyticsComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Stream Analytics', permission: 'live:view' }
      },

      // Creators Sub-routes
      {
        path: 'creators/verification',
        loadComponent: () => import('./pages/users/creator-verification.component').then(m => m.CreatorVerificationComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Verification Requests', permission: 'creators:view' }
      },
      {
        path: 'creators/affiliate',
        loadComponent: () => import('./pages/users/creator-affiliate.component').then(m => m.CreatorAffiliateComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Affiliate Products', permission: 'creators:view' }
      },
      {
        path: 'creators/commissions',
        loadComponent: () => import('./pages/users/creator-commissions.component').then(m => m.CreatorCommissionsComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Commissions', permission: 'creators:view' }
      },
      {
        path: 'creators/analytics',
        loadComponent: () => import('./pages/users/creator-analytics.component').then(m => m.CreatorAnalyticsComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Performance Analytics', permission: 'creators:view' }
      },
      {
        path: 'creators/sponsored',
        loadComponent: () => import('./pages/users/creator-sponsored.component').then(m => m.CreatorSponsoredComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Sponsored Content', permission: 'creators:view' }
      },

      // Reviews Routes
      {
        path: 'reviews/products',
        loadComponent: () => import('./pages/reviews/product-reviews.component').then(m => m.ProductReviewsComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Product Reviews', permission: 'reviews:view' }
      },
      {
        path: 'reviews/creators',
        loadComponent: () => import('./pages/reviews/creator-ratings.component').then(m => m.CreatorRatingsComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Creator Ratings', permission: 'reviews:view' }
      },
      {
        path: 'reviews/reported',
        loadComponent: () => import('./pages/reviews/reported-reviews.component').then(m => m.ReportedReviewsComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Reported Reviews', permission: 'reviews:view' }
      },
      {
        path: 'reviews/disputes',
        loadComponent: () => import('./pages/reviews/review-disputes.component').then(m => m.ReviewDisputesComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Disputes', permission: 'reviews:view' }
      },

      // Reports Routes
      {
        path: 'reports/sales',
        loadComponent: () => import('./pages/reports/sales-reports.component').then(m => m.SalesReportsComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Sales Reports', permission: 'reports:view' }
      },
      {
        path: 'reports/products',
        loadComponent: () => import('./pages/reports/product-performance-report.component').then(m => m.ProductPerformanceReportComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Product Performance', permission: 'reports:view' }
      },
      {
        path: 'reports/users',
        loadComponent: () => import('./pages/reports/user-behavior-report.component').then(m => m.UserBehaviorReportComponent),
        canActivate: [PermissionGuard],
        data: { title: 'User Behavior', permission: 'reports:view' }
      },
      {
        path: 'reports/social',
        loadComponent: () => import('./pages/reports/social-engagement-report.component').then(m => m.SocialEngagementReportComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Social Engagement Reports', permission: 'reports:view' }
      },
      {
        path: 'reports/creators',
        loadComponent: () => import('./pages/reports/creator-performance-report.component').then(m => m.CreatorPerformanceReportComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Creator Performance', permission: 'reports:view' }
      },

      // Security Routes
      {
        path: 'security/auth',
        loadComponent: () => import('./pages/security/authentication-settings.component').then(m => m.AuthenticationSettingsComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Authentication', permission: 'security:view' }
      },
      {
        path: 'security/sessions',
        loadComponent: () => import('./pages/security/session-management.component').then(m => m.SessionManagementComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Session Management', permission: 'security:view' }
      },
      {
        path: 'security/privacy',
        loadComponent: () => import('./pages/security/privacy-compliance.component').then(m => m.PrivacyComplianceComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Privacy & Compliance', permission: 'security:view' }
      },
      {
        path: 'security/audit-logs',
        loadComponent: () => import('./pages/security/audit-logs.component').then(m => m.AuditLogsComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Audit Logs', permission: 'security:view' }
      },

      // Support Routes
      {
        path: 'support/tickets',
        loadComponent: () => import('./pages/support/support-tickets.component').then(m => m.SupportTicketsComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Support Tickets', permission: 'support:view' }
      },
      {
        path: 'support/customers',
        loadComponent: () => import('./pages/support/customer-support.component').then(m => m.CustomerSupportComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Customer Queries', permission: 'support:view' }
      },
      {
        path: 'support/sellers',
        loadComponent: () => import('./pages/support/seller-support.component').then(m => m.SellerSupportComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Seller Support', permission: 'support:view' }
      },
      {
        path: 'support/creators',
        loadComponent: () => import('./pages/support/creator-support.component').then(m => m.CreatorSupportComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Creator Support', permission: 'support:view' }
      },

      // AI & Automation Routes
      {
        path: 'ai/recommendations',
        loadComponent: () => import('./pages/ai-automation/recommendations.component').then(m => m.RecommendationsComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Recommendations', permission: 'ai:view' }
      },
      {
        path: 'ai/moderation',
        loadComponent: () => import('./pages/ai-automation/content-moderation.component').then(m => m.ContentModerationComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Content Moderation', permission: 'ai:view' }
      },
      {
        path: 'ai/trends',
        loadComponent: () => import('./pages/ai-automation/trend-analysis.component').then(m => m.TrendAnalysisComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Trend Analysis', permission: 'ai:view' }
      },
      {
        path: 'ai/chatbot',
        loadComponent: () => import('./pages/ai-automation/chatbot-settings.component').then(m => m.ChatbotSettingsComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Chatbot Settings', permission: 'ai:view' }
      },

      // Additional Settings Routes
      {
        path: 'settings/branding',
        component: SettingsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Branding', permission: 'settings:view', type: 'branding' }
      },
      {
        path: 'settings/currency',
        component: SettingsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Currency & Localization', permission: 'settings:view', type: 'currency' }
      },
      {
        path: 'settings/notifications',
        component: SettingsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'Notification Settings', permission: 'settings:view', type: 'notifications' }
      },
      {
        path: 'settings/api',
        component: SettingsComponent,
        canActivate: [PermissionGuard],
        data: { title: 'API & Webhooks', permission: 'settings:view', type: 'api' }
      },

      // Additional Marketing Routes
      {
        path: 'marketing/flash-sales',
        loadComponent: () => import('./pages/marketing/flash-sales.component').then(m => m.FlashSalesComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Flash Sales', permission: 'marketing:view' }
      },
      {
        path: 'marketing/push',
        loadComponent: () => import('./pages/marketing/push-notifications.component').then(m => m.PushNotificationsComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Push Notifications', permission: 'marketing:view' }
      },
      {
        path: 'marketing/email-sms',
        loadComponent: () => import('./pages/marketing/email-sms.component').then(m => m.EmailSmsComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Email & SMS Marketing', permission: 'marketing:view' }
      },

      // CMS Help Center
      {
        path: 'cms/help',
        loadComponent: () => import('./pages/cms/help-center.component').then(m => m.HelpCenterComponent),
        canActivate: [PermissionGuard],
        data: { title: 'Help Center', permission: 'content:view' }
      },

      // Catch-all: redirect to dashboard
      {
        path: '**',
        redirectTo: 'dashboard'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
