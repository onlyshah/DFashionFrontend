import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./features/home/home.routes').then(m => m.homeRoutes)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: 'shop',
    loadChildren: () => import('./features/shop/shop.routes').then(m => m.shopRoutes)
  },
  {
    path: 'category/:category',
    loadComponent: () => import('./features/category/category.component').then(m => m.CategoryComponent)
  },
  {
    path: 'products',
    loadChildren: () => import('./features/products/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  {
    path: 'search',
    loadChildren: () => import('./features/search/search.routes').then(m => m.searchRoutes)
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.routes').then(m => m.profileRoutes)
  },
  {
    path: 'story',
    loadChildren: () => import('./features/story/story.routes').then(m => m.storyRoutes)
  },
  // Mobile routes (for mobile app compatibility)
  {
    path: 'tabs',
    loadChildren: () => import('./mobile/tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'admin',
    canActivate: [AuthGuard],
    loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes)
  },
  {
    path: 'mobile-cart',
    loadChildren: () => import('./mobile/cart/cart.module').then(m => m.CartPageModule)
  },
  {
    path: 'mobile-checkout',
    loadChildren: () => import('./mobile/checkout/checkout.module').then(m => m.CheckoutPageModule)
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

  // Vendor dashboard route
  {
    path: 'vendor/dashboard',
    loadComponent: () => import('./vendor/dashboard/vendor-dashboard.component').then(m => m.VendorDashboardComponent),
    canActivate: [AuthGuard]
  },

  // Influencer dashboard route
  {
    path: 'influencer/dashboard',
    loadComponent: () => import('./influencer/dashboard/influencer-dashboard.component').then(m => m.InfluencerDashboardComponent),
    canActivate: [AuthGuard]
  },

  // Admin routes (web-only) — now using standalone AdminLayoutComponent
  {
    path: 'admin',
    loadComponent: () => import('./admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent)
  },

  // Unified Dashboard Route
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },

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
