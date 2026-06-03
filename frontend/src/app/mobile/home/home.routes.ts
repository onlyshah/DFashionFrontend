import { Routes } from '@angular/router';
import { register } from 'swiper/element/bundle';
import { HomeComponent } from '../../enduser-app/features/home/pages/home/home.component';

register();

export const homeRoutes: Routes = [
  {
    path: '',
    component: HomeComponent
  }
];
