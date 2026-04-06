import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SearchPageRoutingModule } from './search-routing.module';
import { SearchComponent } from '../../enduser-app/features/search/pages/search/search.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchPageRoutingModule,
    SearchComponent
  ]
})
export class SearchPageModule {}
