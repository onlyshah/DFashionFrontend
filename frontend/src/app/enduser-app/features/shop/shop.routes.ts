import { Routes } from '@angular/router';

export const shopRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shop.component').then(m => m.ShopComponent)
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  {
    path: 'category/:category',
    loadComponent: () => import('./pages/category/category.component').then(m => m.CategoryComponent)
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent)
  },
  {
    path: 'wishlist',
    loadComponent: () => import('../wishlist/wishlist.component').then(m => m.WishlistComponent)
  },
  {
    path: 'order-confirmation/:id',
    loadComponent: () => import('./pages/order-confirmation/order-confirmation.component').then(m => m.OrderConfirmationPageComponent)
  },
  {
    path: 'payment-methods',
    loadComponent: () => import('./pages/payment-methods/payment-methods.component').then(m => m.PaymentMethodsPageComponent)
  },
  {
    path: ':id/tracking',
    loadComponent: () => import('./pages/order-tracking/order-tracking.component').then(m => m.OrderTrackingPageComponent)
  },
  {
    path: 'review/:productId',
    loadComponent: () => import('./pages/write-review/write-review.component').then(m => m.WriteReviewPageComponent)
  }
];
