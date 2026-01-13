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
    loadChildren: () => import('./enduser-app/features/home/home.routes').then(m => m.homeRoutes)
  },
  {
    path: 'auth',
    loadChildren: () => import('./enduser-app/features/auth/auth.routes').then(m => m.authRoutes)
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
    path: 'products',
    loadChildren: () => import('./enduser-app/features/shop/shop.routes').then(m => m.shopRoutes)
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
    loadChildren: () => import('./enduser-app/features/story/story.routes').then(m => m.storyRoutes)
  },
  // Mobile routes (for mobile app compatibility)
  {
    path: 'tabs',
    loadChildren: () => import('./mobile/tabs/tabs.module').then(m => m.TabsPageModule)
  },
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

  // Admin routes (web-only)
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },

  // Unified Dashboard Route
  {
    path: 'dashboard',
    loadComponent: () => import('./admin/pages/components/dashboard/general-dashboard/general-dashboard.component').then(m => m.GeneralDashboardComponent),
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
