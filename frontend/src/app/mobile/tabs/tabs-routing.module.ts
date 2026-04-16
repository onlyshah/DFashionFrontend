import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'categories',
        loadChildren: () => import('../categories/categories.module').then(m => m.CategoriesPageModule)
      },
      {
        path: 'stories',
        loadChildren: () => import('../stories/stories.module').then(m => m.StoriesPageModule)
      },
      {
        path: 'reels',
        loadChildren: () => import('../reels/reels.module').then(m => m.ReelsPageModule)
      },
      {
        path: 'posts',
        loadChildren: () => import('../posts/posts.module').then(m => m.PostsPageModule)
      },
      {
        path: 'wishlist',
        loadChildren: () => import('../wishlist/wishlist.module').then(m => m.WishlistPageModule)
      },
      {
        path: 'cart',
        loadChildren: () => import('../cart/cart.module').then(m => m.CartPageModule)
      },
      // ✨ NEW: Checkout route (CRITICAL for e-commerce flow)
      {
        path: 'checkout/:id',
        loadChildren: () => import('../checkout/checkout.module').then(m => m.CheckoutPageModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule)
      },
      {
        path: 'shop',
        loadComponent: () => import('../shop/shop.page').then(m => m.ShopPageComponent)
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'vendor',
    loadChildren: () => import('../vendor/vendor.module').then(m => m.VendorPageModule)
  },
  {
    path: 'wishlist',
    loadChildren: () => import('../wishlist/wishlist.module').then(m => m.WishlistPageModule)
  },
  {
    path: 'orders',
    loadChildren: () => import('../orders/orders.module').then(m => m.OrdersPageModule)
  },
  {
    path: 'order-confirmation/:id',
    loadComponent: () => import('../order-confirmation/order-confirmation.component').then(m => m.OrderConfirmationComponent)
  },
  {
    path: 'create-post',
    loadComponent: () => import('../create-post/create-post.page').then(m => m.CreatePostComponent)
  },
  {
    path: 'create-story',
    loadComponent: () => import('../create-post/create-story.page').then(m => m.CreateStoryComponent)
  },
  {
    path: 'create-reel',
    loadComponent: () => import('../create-post/create-reel.page').then(m => m.CreateReelComponent)
  },
  {
    path: 'go-live',
    loadComponent: () => import('../create-post/go-live.page').then(m => m.GoLiveComponent)
  },
  {
    path: 'notifications',
    loadComponent: () => import('../notifications/notifications.page').then(m => m.NotificationsPageComponent)
  },
  {
    path: 'messages',
    loadComponent: () => import('../messages/messages.page').then(m => m.MessagesPageComponent)
  },
  {
    path: 'order-tracking/:id',
    loadComponent: () => import('../order-tracking/order-tracking.page').then(m => m.OrderTrackingComponent)
  },
  {
    path: 'product/:id',
    loadComponent: () => import('../product/product-detail.page').then(m => m.ProductDetailPageComponent)
  },
  {
    path: 'payment-methods',
    loadComponent: () => import('../payment/payment-methods.page').then(m => m.PaymentMethodsPageComponent)
  },
  {
    path: 'returns',
    loadComponent: () => import('../returns/returns-refunds.page').then(m => m.ReturnsRefundsPageComponent)
  },
  {
    path: 'review/:id',
    loadComponent: () => import('../reviews/write-review.page').then(m => m.WriteReviewPageComponent)
  },
  {
    path: 'vendor/:id',
    loadComponent: () => import('../vendor/vendor-profile.page').then(m => m.VendorProfilePageComponent)
  },
  {
    path: 'order-history',
    loadComponent: () => import('../orders/order-history.page').then(m => m.OrderHistoryPageComponent)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
