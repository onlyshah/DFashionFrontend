import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  // Default redirect to login
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  
  // Auth routes - layout managed by LayoutService (no header)
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },

  // Main routes - layout managed by LayoutService (with header)
  {
    path: 'home',
    loadChildren: () => import('./enduser-app/features/home/home.routes').then(m => m.homeRoutes)
  },
  {
    path: 'shop',
    loadChildren: () => import('./enduser-app/features/shop/shop.routes').then(m => m.shopRoutes)
  },
  {
    path: 'category/:category',
    loadComponent: () => import('./enduser-app/features/category/category.component').then(m => m.CategoryComponent)
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./enduser-app/features/shop/pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  {
    path: 'search',
    loadChildren: () => import('./enduser-app/features/search/search.routes').then(m => m.searchRoutes)
  },
  {
    path: 'profile',
    loadChildren: () => import('./enduser-app/features/profile/profile.routes').then(m => m.profileRoutes)
  },
  {
    path: 'story',
    loadChildren: () => import('./enduser-app/features/stories/stories.module').then(m => m.StoriesModule)
  },
  /*
  {
    path: 'tabs',
    loadChildren: () => import('./mobile/tabs/tabs.module').then(m => m.TabsPageModule)
  },
  */
  // MOBILE ROUTES TEMPORARILY DISABLED DUE TO COMPILATION ISSUES
  // TODO: Fix standalone component declarations in mobile modules
  /*
  {
    path: 'mobile-cart',
    loadChildren: () => import('./mobile/cart/cart.module').then(m => m.CartPageModule)
  },
  {
    path: 'mobile-orders',
    loadChildren: () => import('./mobile/orders/orders.module').then(m => m.OrdersPageModule)
  },
  {
    path: 'mobile-profile',
    loadChildren: () => import('./mobile/profile/profile.module').then(m => m.ProfilePageModule)
  },
  {
    path: 'mobile-stories',
    loadChildren: () => import('./mobile/stories/stories.module').then(m => m.StoriesPageModule)
  },
  {
    path: 'mobile-posts',
    loadChildren: () => import('./mobile/posts/posts.module').then(m => m.PostsPageModule)
  },
  {
    path: 'mobile-search',
    loadChildren: () => import('./mobile/search/search.module').then(m => m.SearchPageModule)
  },
  {
    path: 'mobile-wishlist',
    loadChildren: () => import('./mobile/wishlist/wishlist.module').then(m => m.WishlistPageModule)
  },
  {
    path: 'mobile-vendor',
    loadChildren: () => import('./mobile/vendor/vendor.module').then(m => m.VendorPageModule)
  },
  */
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
  // Admin routes - separate
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  // Wildcard
  {
    path: '**',
    redirectTo: '/home'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { 
      preloadingStrategy: PreloadAllModules,
      enableTracing: false // Set to true for debugging
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }