import { Route } from '@angular/router';

export const vendorRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./components/products/product-list.component').then(m => m.ProductListComponent)
  }
];
