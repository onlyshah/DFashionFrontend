import { Routes } from '@angular/router';
import { ProfileComponent } from '../../enduser-app/features/profile/pages/profile/profile.component';
import { UserProfilePageComponent } from './user-profile.page';

export const profileRoutes: Routes = [
  {
    path: '',
    component: ProfileComponent
  },
  {
    path: ':id',
    component: UserProfilePageComponent
  }
];
