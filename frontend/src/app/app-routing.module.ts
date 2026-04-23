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
    path: 'explore',
    loadComponent: () => import('./enduser-app/features/explore/explore.component').then(m => m.ExploreComponent)
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
    path: 'category/:category',
    loadComponent: () => import('./enduser-app/features/category/category.component').then(m => m.CategoryComponent)
  },
  {
    path: 'subcategory/:id',
    loadComponent: () => import('./enduser-app/features/shop/pages/category/category.component').then(m => m.CategoryComponent)
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
  // ✨ NEW: Posts routing (social media posts)
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
  // 🔄 STANDARDIZED: Redirect duplicate product route to primary route
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
    path: 'story',
    loadComponent: () => import('./enduser-app/features/home/components/stories/story-tray/story-tray.component').then(m => m.StoryTrayComponent)
  },
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
