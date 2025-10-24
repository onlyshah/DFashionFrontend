import { Route } from '@angular/router';

export const financeRoutes: Route[] = [
    {
        path: '',
        children: [
            {
                path: '',
                loadComponent: () => import('./components/finance/finance-dashboard.component')
                    .then(m => m.FinanceDashboardComponent)
            },
            {
                path: 'transactions',
                loadComponent: () => import('./components/transactions/transaction-list.component')
                    .then(m => m.TransactionListComponent)
            },
            {
                path: 'reports',
                loadComponent: () => import('./components/reports/financial-reports.component')
                    .then(m => m.FinancialReportsComponent)
            }
        ]
    }
];