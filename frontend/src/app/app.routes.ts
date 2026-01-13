import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Home Route (Public)
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },

  // TODO: Authentication Routes - Create features/auth folder with auth.routes.ts
  // {
  //   path: 'auth',
  //   loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  // },

  // TODO: Home with Auth - Create features/home folder with home.routes.ts
  // {
  //   path: 'home',
  //   loadChildren: () => import('./features/home/home.routes').then(m => m.homeRoutes),
  //   canActivate: [AuthGuard]
  // },

  // TODO: User Dashboard - Create features/user-dashboard folder with user-dashboard.component.ts
  // {
  //   path: 'user-dashboard',
  //   loadComponent: () => import('./features/user-dashboard/user-dashboard.component').then(m => m.UserDashboardComponent),
  //   canActivate: [AuthGuard],
  //   title: 'Dashboard - TrendSpace'
  // },

  // TODO: Customer Dashboard - Create features/customer-dashboard folder with customer-dashboard.component.ts
  // {
  //   path: 'customer/dashboard',
  //   loadComponent: () => import('./features/customer-dashboard/customer-dashboard.component').then(m => m.CustomerDashboardComponent),
  //   canActivate: [AuthGuard],
  //   title: 'Customer Dashboard - TrendSpace'
  // },

  // TODO: Explore Routes - Create features/explore folder with explore.component.ts
  // {
  //   path: 'explore',
  //   loadComponent: () => import('./features/explore/explore.component').then(m => m.ExploreComponent),
  //   title: 'Explore - DFashion'
  // },

  // TODO: Shop Routes - Create features/shop folder with shop.component.ts
  // {
  //   path: 'shop',
  //   loadComponent: () => import('./features/shop/shop.component').then(m => m.ShopComponent),
  //   title: 'Shop - DFashion'
  // },

  // TODO: Category Routes - Create features/category folder with category.component.ts
  // {
  //   path: 'category/:category',
  //   loadComponent: () => import('./features/category/category.component').then(m => m.CategoryComponent),
  //   title: 'Category - DFashion'
  // },

  // TODO: Wishlist Routes - Create features/wishlist folder with wishlist.component.ts
  // {
  //   path: 'wishlist',
  //   loadComponent: () => import('./features/wishlist/wishlist.component').then(m => m.WishlistComponent),
  //   title: 'My Wishlist - DFashion'
  // },

  // TODO: Social Media Routes - Create features/social-media and features/posts folders
  // {
  //   path: 'social',
  //   loadComponent: () => import('./features/social-media/social-media.component').then(m => m.SocialMediaComponent),
  //   title: 'Social Feed - DFashion'
  // },
  // {
  //   path: 'feed',
  //   loadComponent: () => import('./features/posts/social-feed.component').then(m => m.SocialFeedComponent),
  //   title: 'Social Feed - DFashion'
  // },
  // {
  //   path: 'stories',
  //   loadComponent: () => import('./features/stories/stories-viewer.component').then(m => m.StoriesViewerComponent),
  //   title: 'Stories - DFashion'
  // },
  // {
  //   path: 'stories/create',
  //   loadComponent: () => import('./features/stories/story-create.component').then(m => m.StoryCreateComponent),
  //   canActivate: [AuthGuard],
  //   title: 'Create Story - DFashion'
  // },
  // {
  //   path: 'stories/:userId',
  //   loadComponent: () => import('./features/stories/stories-viewer.component').then(m => m.StoriesViewerComponent),
  //   title: 'User Stories - DFashion'
  // },
  // {
  //   path: 'post/:id',
  //   loadComponent: () => import('./features/posts/post-detail.component').then(m => m.PostDetailComponent),
  //   title: 'Post Detail - DFashion'
  // },

  // E-commerce Hub Routes - TODO: Create features/ecommerce folder
  // {
  //   path: 'hub',
  //   loadComponent: () => import('./features/ecommerce/ecommerce-hub.component').then(m => m.EcommerceHubComponent),
  //   title: 'E-commerce Hub - DFashion'
  // },
  // {
  //   path: 'dashboard',
  //   loadComponent: () => import('./features/ecommerce/ecommerce-hub.component').then(m => m.EcommerceHubComponent),
  //   title: 'Dashboard - DFashion'
  // },

  // TODO: Products Routes - Create features/product folder with product-detail component
  // {
  //   path: 'product/:id',
  //   loadComponent: () => import('./features/product/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  // },
  // {
  //   path: 'products/:id',
  //   redirectTo: 'product/:id'
  // },

  // TODO: Shopping Cart & Wishlist - Create features/shop folder with cart component
  // {
  //   path: 'cart',
  //   loadComponent: () => import('./features/shop/pages/cart/cart.component').then(m => m.CartComponent),
  //   canActivate: [AuthGuard],
  //   title: 'Shopping Cart - DFashion'
  // },

  // TODO: Checkout Process - Create features/checkout folder with checkout component
  // {
  //   path: 'checkout',
  //   loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent),
  //   canActivate: [AuthGuard],
  //   title: 'Checkout - DFashion'
  // },

  // TODO: User Management Dashboard - Create features/user-management folder
  // {
  //   path: 'user-management',
  //   loadComponent: () => import('./features/user-management/user-management.component').then(m => m.UserManagementComponent),
  //   canActivate: [AuthGuard],
  //   title: 'User Management - DFashion'
  // },

  // TODO: User Account Management - Create features/profile folder with profile routes
  // {
  //   path: 'account',
  //   canActivate: [AuthGuard],
  //   children: [
  //     {
  //       path: '',
  //       redirectTo: 'profile',
  //       pathMatch: 'full'
  //     },
  //     {
  //       path: 'profile',
  //       loadChildren: () => import('./features/profile/profile.routes').then(m => m.profileRoutes)
  //     },
  //     {
  //       path: 'settings',
  //       loadComponent: () => import('./features/profile/pages/settings/settings.component').then(m => m.SettingsComponent),
  //       title: 'Account Settings - DFashion'
  //     },
  //     {
  //       path: 'orders',
  //       loadComponent: () => import('./features/profile/pages/profile/profile.component').then(m => m.ProfileComponent),
  //       title: 'My Orders - DFashion'
  //     }
  //   ]
  // },

  // TODO: Vendor Dashboard - Create features/vendor folder with vendor routes
  // {
  //   path: 'vendor',
  //   loadChildren: () => import('./features/vendor/vendor.routes').then(m => m.vendorRoutes),
  //   canActivate: [AuthGuard],
  //   title: 'Vendor Dashboard - DFashion'
  // },

  // TODO: Legacy Routes - Create features/shop and features/search folders
  // {
  //   path: 'shop',
  //   loadChildren: () => import('./features/shop/shop.routes').then(m => m.shopRoutes),
  //   canActivate: [AuthGuard]
  // },
  // {
  //   path: 'search',
  //   loadChildren: () => import('./features/search/search.routes').then(m => m.searchRoutes)
  // },
  // Admin Routes
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },

  // TODO: Support & Help - Create features/support folder or use profile as fallback
  // {
  //   path: 'support',
  //   loadComponent: () => import('./features/profile/pages/profile/profile.component').then(m => m.ProfileComponent),
  //   title: 'Support - DFashion'
  // },

  // Wildcard route
  {
    path: '**',
    redirectTo: '/'
  }
];
