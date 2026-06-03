import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: 'home',
    loadChildren: () => import('./enduser-app/features/home/home.routes').then(m => m.homeRoutes)
  },
  {
    path: 'explore',
    loadComponent: () => import('./enduser-app/features/explore/explore.component').then(m => m.ExploreComponent)
  },
  {
    path: 'reels',
    loadChildren: () => import('./mobile/reels/reels.routes').then(m => m.reelsRoutes)
  },
  {
    path: 'shop',
    loadChildren: () => import('./enduser-app/features/shop/shop.routes').then(m => m.shopRoutes)
  },
  {
    path: 'products',
    loadComponent: () => import('./enduser-app/features/shop/shop.component').then(m => m.ShopComponent)
  },
  {
    path: 'category/:id',
    redirectTo: '/shop/category/:id',
    pathMatch: 'full'
  },
  {
    path: 'subcategory/:id',
    redirectTo: '/shop/category/:id',
    pathMatch: 'full'
  },
  {
    path: 'brand/:id',
    redirectTo: '/shop',
    pathMatch: 'full'
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./enduser-app/features/shop/pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./enduser-app/features/shop/pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./enduser-app/features/shop/pages/checkout/checkout.component').then(m => m.CheckoutComponent)
  },
  {
    path: 'search',
    loadChildren: () => import('./enduser-app/features/search/search.routes').then(m => m.searchRoutes)
  },
  {
    path: 'posts',
    loadChildren: () => import('./enduser-app/features/posts/posts.routes').then(m => m.postsRoutes),
    data: { title: 'Posts' }
  },
  {
    path: 'post/:id',
    loadComponent: () => import('./enduser-app/features/posts/post-detail.component').then(m => m.PostDetailComponent),
    data: { title: 'Post Detail' }
  },
  {
    path: 'post/:id/comments',
    redirectTo: '/post/:id',
    pathMatch: 'full'
  },
  {
    path: 'shop/product/:id',
    redirectTo: '/products/:id',
    pathMatch: 'full'
  },
  {
    path: 'cart',
    redirectTo: '/shop/cart',
    pathMatch: 'full'
  },
  {
    path: 'wishlist',
    redirectTo: '/shop/wishlist',
    pathMatch: 'full'
  },
  {
    path: 'profile',
    loadChildren: () => import('./enduser-app/features/profile/profile.routes').then(m => m.profileRoutes)
  },
  {
    path: 'settings',
    redirectTo: '/profile/settings',
    pathMatch: 'full'
  },
  {
    path: 'activity',
    loadComponent: () => import('./enduser-app/features/activity/activity.component').then(m => m.ActivityComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'saved',
    loadComponent: () => import('./enduser-app/features/saved/saved.component').then(m => m.SavedComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'report',
    loadComponent: () => import('./enduser-app/features/report/report.component').then(m => m.ReportComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'threads',
    loadComponent: () => import('./enduser-app/features/threads/threads.component').then(m => m.ThreadsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'story',
    loadComponent: () => import('./enduser-app/features/home/components/stories/story-tray/story-tray.component').then(m => m.StoryTrayComponent)
  },
  {
    path: 'tabs',
    loadChildren: () => import('./mobile/tabs/tabs.routes').then(m => m.tabsRoutes)
  },
  {
    path: 'mobile-cart',
    loadChildren: () => import('./mobile/cart/cart.routes').then(m => m.cartRoutes)
  },
  {
    path: 'mobile-orders',
    loadChildren: () => import('./mobile/orders/orders.routes').then(m => m.ordersRoutes)
  },
  {
    path: 'mobile-profile',
    loadChildren: () => import('./mobile/profile/profile.routes').then(m => m.profileRoutes)
  },
  {
    path: 'mobile-stories',
    loadChildren: () => import('./mobile/stories/stories.routes').then(m => m.storiesRoutes)
  },
  {
    path: 'mobile-posts',
    loadChildren: () => import('./mobile/posts/posts.routes').then(m => m.postsRoutes)
  },
  {
    path: 'mobile-search',
    loadChildren: () => import('./mobile/search/search.routes').then(m => m.searchRoutes)
  },
  {
    path: 'mobile-wishlist',
    loadChildren: () => import('./mobile/wishlist/wishlist.routes').then(m => m.wishlistRoutes)
  },
  {
    path: 'mobile-vendor',
    loadChildren: () => import('./mobile/vendor/vendor.routes').then(m => m.vendorRoutes)
  },
  {
    path: 'vendor/dashboard',
    loadComponent: () => import('./enduser-app/features/vendor/pages/dashboard/vendor-dashboard.component').then(m => m.VendorDashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./enduser-app/features/user-dashboard/user-dashboard.component').then(m => m.UserDashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'customer/dashboard',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
