import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfileComponent } from '../../enduser-app/features/profile/pages/profile/profile.component';
import { UserProfilePageComponent } from './user-profile.page';

const routes: Routes = [
  {
    path: '',
    component: ProfileComponent
  },
  {
    path: ':id',
    component: UserProfilePageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfilePageRoutingModule {}
