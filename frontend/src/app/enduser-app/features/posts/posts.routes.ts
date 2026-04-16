import { Routes } from '@angular/router';
import { PostsListComponent } from './pages/posts-list/posts-list.component';
import { PostDetailPageComponent } from './pages/post-detail/post-detail.component';

/**
 * Posts Feature Routes
 * Social media posts: listing, detail, interactions
 */
export const postsRoutes: Routes = [
  {
    path: '',
    component: PostsListComponent,
    data: { title: 'Posts' }
  },
  {
    path: ':id',
    component: PostDetailPageComponent,
    data: { title: 'Post Detail' }
  }
];
