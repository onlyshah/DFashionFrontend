import { Route } from '@angular/router';

export const creatorRoutes: Route[] = [
    {
        path: '',
        children: [
            {
                path: '',
                loadComponent: () => import('./components/content-dashboard/content-dashboard.component')
                    .then(m => m.ContentDashboardComponent)
            },
            {
                path: 'posts',
                loadComponent: () => import('./components/posts/post-list.component')
                    .then(m => m.PostListComponent)
            },
            {
                path: 'stories',
                loadComponent: () => import('./components/stories/story-list.component')
                    .then(m => m.StoryListComponent)
            }
        ]
    }
];