import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./posts.page').then(m => m.PostsPage)
  },
  {
    path: ':id',
    loadComponent: () => import('./post-detail.page').then(m => m.PostDetailPageComponent)
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class PostsPageModule { }

