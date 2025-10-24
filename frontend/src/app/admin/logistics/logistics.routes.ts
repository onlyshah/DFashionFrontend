import { Route } from '@angular/router';

export const logisticsRoutes: Route[] = [
    {
        path: '',
        children: [
            {
                path: '',
                loadComponent: () => import('./components/delivery/delivery-dashboard.component')
                    .then(m => m.DeliveryDashboardComponent)
            },
            {
                path: 'orders',
                loadComponent: () => import('./components/orders/order-list.component')
                    .then(m => m.OrderListComponent)
            },
            {
                path: 'tracking',
                loadComponent: () => import('./components/tracking/tracking-dashboard.component')
                    .then(m => m.TrackingDashboardComponent)
            }
        ]
    }
];