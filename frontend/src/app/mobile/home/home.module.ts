
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { HomePage } from './home.page';

// Import Swiper modules
import { register } from 'swiper/element/bundle';

// Import PolluxSidebarModule and SharedModule
import { PolluxSidebarModule } from '../../admin/pollux-ui/components/pollux-sidebar/pollux-sidebar.module';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: HomePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    PolluxSidebarModule,
    SharedModule
  ],
  declarations: [HomePage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomePageModule {
  constructor() {
    // Register Swiper custom elements
    register();
  }
}
