import { Route } from '@angular/router';

export const marketingRoutes: Route[] = [
    {
        path: '',
        children: [
            {
                path: '',
                loadComponent: () => import('./components/campaigns/campaign-dashboard.component')
                    .then(m => m.CampaignDashboardComponent)
            },
            {
                path: 'campaigns',
                loadComponent: () => import('./components/campaigns').then(m => m.CampaignListComponent)
            },
            {
                path: 'analytics',
                loadComponent: () => import('./components/analytics/marketing-analytics.component')
                    .then(m => m.MarketingAnalyticsComponent)
            }
        ]
    }
];