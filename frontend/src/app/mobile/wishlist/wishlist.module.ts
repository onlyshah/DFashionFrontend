import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';

import { WishlistComponent } from '../../enduser-app/features/wishlist/wishlist.component';

const routes: Routes = [
  {
    path: '',
    component: WishlistComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    WishlistComponent
  ]
})
export class WishlistPageModule {}
