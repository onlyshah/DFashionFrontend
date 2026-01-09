export interface AdminMenuItem {
  key?: string;
  title: string;
  icon?: string;
  route?: string;
  children?: AdminMenuItem[];
  adminOnly?: boolean;
}

export const ADMIN_MENU: AdminMenuItem[] = [
  { key: 'overview', title: 'Overview', icon: 'typcn typcn-home', route: '/admin/overview' },
  { key: 'analytics', title: 'Sales Analytics', icon: 'typcn typcn-chart-bar', route: '/admin/analytics' },
  { key: 'social', title: 'Social Engagement', icon: 'typcn typcn-social-instagram', route: '/admin/social' },
  { key: 'alerts', title: 'Alerts & Notifications', icon: 'typcn typcn-bell', route: '/admin/alerts' },

  {
    key: 'users',
    title: 'Users & Roles',
    icon: 'typcn typcn-user',
    children: [
      { title: 'Customers', route: '/admin/users/customers' },
      { title: 'Sellers / Vendors', route: '/admin/users/vendors' },
      { title: 'Creators / Influencers', route: '/admin/users/creators' },
      { title: 'Admin Users', route: '/admin/users/admins' },
      { title: 'Roles & Permissions', route: '/admin/roles' },
      { title: 'Activity Logs', route: '/admin/activity-logs' }
    ]
  },

  {
    key: 'products',
    title: 'Product Management',
    icon: 'typcn typcn-shopping-bag',
    children: [
      { title: 'All Products', route: '/admin/products' },
      { title: 'Add New Product', route: '/admin/products/new' },
      { title: 'Categories', route: '/admin/categories' },
      { title: 'Sub-Categories', route: '/admin/sub-categories' },
      { title: 'Product Variants', route: '/admin/products/variants' },
      { title: 'Product Media (Images & Videos)', route: '/admin/products/media' },
      { title: 'Product Tagging', route: '/admin/products/tagging' }
    ]
  },

  {
    key: 'inventory',
    title: 'Inventory & Warehouse',
    icon: 'typcn typcn-box',
    children: [
      { title: 'Inventory List', route: '/admin/inventory' },
      { title: 'Stock Alerts', route: '/admin/inventory/alerts' },
      { title: 'Warehouses', route: '/admin/warehouses' },
      { title: 'Suppliers', route: '/admin/suppliers' },
      { title: 'Inventory History', route: '/admin/inventory/history' }
    ]
  },

  {
    key: 'orders',
    title: 'Order Management',
    icon: 'typcn typcn-shopping-cart',
    children: [
      { title: 'All Orders', route: '/admin/orders' },
      { title: 'Pending Orders', route: '/admin/orders/pending' },
      { title: 'Completed Orders', route: '/admin/orders/completed' },
      { title: 'Cancelled Orders', route: '/admin/orders/cancelled' },
      { title: 'Returns & Refunds', route: '/admin/orders/returns' },
      { title: 'Invoices', route: '/admin/invoices' }
    ]
  },

  {
    key: 'payments',
    title: 'Payments & Billing',
    icon: 'typcn typcn-credit-card',
    children: [
      { title: 'Transactions', route: '/admin/payments/transactions' },
      { title: 'Payment Methods', route: '/admin/payments/methods' },
      { title: 'Refund Management', route: '/admin/payments/refunds' },
      { title: 'Seller Payouts', route: '/admin/payments/payouts' },
      { title: 'Wallet & COD', route: '/admin/payments/wallet' }
    ]
  },

  {
    key: 'socialFeed',
    title: 'Social Feed',
    icon: 'typcn typcn-th-small-outline',
    children: [
      { title: 'All Posts', route: '/admin/social/posts' },
      { title: 'Video Feed (Reels / Shorts)', route: '/admin/social/videos' },
      { title: 'Product-Tagged Posts', route: '/admin/social/tagged' },
      { title: 'Hashtags', route: '/admin/social/hashtags' },
      { title: 'Reported Content', route: '/admin/social/reported' },
      { title: 'Comment Moderation', route: '/admin/social/comments' }
    ]
  },

  {
    key: 'creators',
    title: 'Creators & Influencers',
    icon: 'typcn typcn-star',
    children: [
      { title: 'Creator Profiles', route: '/admin/creators' },
      { title: 'Verification Requests', route: '/admin/creators/verification' },
      { title: 'Affiliate Products', route: '/admin/creators/affiliate' },
      { title: 'Commissions', route: '/admin/creators/commissions' },
      { title: 'Performance Analytics', route: '/admin/creators/analytics' },
      { title: 'Sponsored Content', route: '/admin/creators/sponsored' }
    ]
  },

  {
    key: 'live',
    title: 'Live Commerce',
    icon: 'typcn typcn-record',
    children: [
      { title: 'Live Streams', route: '/admin/live' },
      { title: 'Schedule Live', route: '/admin/live/schedule' },
      { title: 'Pinned Products', route: '/admin/live/pinned' },
      { title: 'Live Orders', route: '/admin/live/orders' },
      { title: 'Live Chat Moderation', route: '/admin/live/chat' },
      { title: 'Stream Analytics', route: '/admin/live/analytics' }
    ]
  },

  {
    key: 'marketing',
    title: 'Marketing & Promotions',
    icon: 'typcn typcn-megaphone',
    children: [
      { title: 'Campaigns', route: '/admin/marketing/campaigns' },
      { title: 'Coupons & Promo Codes', route: '/admin/marketing/coupons' },
      { title: 'Flash Sales', route: '/admin/marketing/flash-sales' },
      { title: 'Push Notifications', route: '/admin/marketing/push' },
      { title: 'Email & SMS Marketing', route: '/admin/marketing/email-sms' }
    ]
  },

  {
    key: 'reviews',
    title: 'Reviews & Ratings',
    icon: 'typcn typcn-thumbs-up',
    children: [
      { title: 'Product Reviews', route: '/admin/reviews/products' },
      { title: 'Creator Ratings', route: '/admin/reviews/creators' },
      { title: 'Reported Reviews', route: '/admin/reviews/reported' },
      { title: 'Disputes', route: '/admin/reviews/disputes' }
    ]
  },

  {
    key: 'reports',
    title: 'Reports & Analytics',
    icon: 'typcn typcn-chart-line',
    children: [
      { title: 'Sales Reports', route: '/admin/reports/sales' },
      { title: 'Product Performance', route: '/admin/reports/products' },
      { title: 'User Behavior', route: '/admin/reports/users' },
      { title: 'Social Engagement Reports', route: '/admin/reports/social' },
      { title: 'Creator Performance', route: '/admin/reports/creators' }
    ]
  },

  {
    key: 'cms',
    title: 'CMS & Content',
    icon: 'typcn typcn-book',
    children: [
      { title: 'Pages', route: '/admin/cms/pages' },
      { title: 'Banners & Sliders', route: '/admin/cms/banners' },
      { title: 'Blogs / Announcements', route: '/admin/cms/blogs' },
      { title: 'Help Center', route: '/admin/cms/help' }
    ]
  },

  {
    key: 'settings',
    title: 'Settings',
    icon: 'typcn typcn-cog',
    children: [
      { title: 'General Settings', route: '/admin/settings/general' },
      { title: 'Branding', route: '/admin/settings/branding' },
      { title: 'Tax & Shipping', route: '/admin/settings/tax-shipping' },
      { title: 'Currency & Localization', route: '/admin/settings/currency' },
      { title: 'Notification Settings', route: '/admin/settings/notifications' },
      { title: 'API & Webhooks', route: '/admin/settings/api' }
    ]
  },

  {
    key: 'security',
    title: 'Security & Compliance',
    icon: 'typcn typcn-lock-closed',
    children: [
      { title: 'Authentication', route: '/admin/security/auth' },
      { title: 'Session Management', route: '/admin/security/sessions' },
      { title: 'Privacy & Compliance', route: '/admin/security/privacy' },
      { title: 'Audit Logs', route: '/admin/security/audit-logs' }
    ]
  },

  {
    key: 'support',
    title: 'Support',
    icon: 'typcn typcn-headphones',
    children: [
      { title: 'Support Tickets', route: '/admin/support/tickets' },
      { title: 'Customer Queries', route: '/admin/support/customers' },
      { title: 'Seller Support', route: '/admin/support/sellers' },
      { title: 'Creator Support', route: '/admin/support/creators' }
    ]
  },

  {
    key: 'ai',
    title: 'AI & Automation',
    icon: 'typcn typcn-cog-outline',
    children: [
      { title: 'Recommendations', route: '/admin/ai/recommendations' },
      { title: 'Content Moderation', route: '/admin/ai/moderation' },
      { title: 'Trend Analysis', route: '/admin/ai/trends' },
      { title: 'Chatbot Setting', route: '/admin/ai/chatbot' }
    ]
  }
];
