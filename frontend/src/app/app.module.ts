import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Core Services
import { AuthService } from './core/services/auth.service';
import { ApiService } from './core/services/api.service';
import { StorageService } from './core/services/storage.service';
import { TrendingService } from './core/services/trending.service';
import { SocialInteractionsService } from './core/services/social-interactions.service';
import { CartService } from './core/services/cart.service';
import { WishlistService } from './core/services/wishlist.service';

// Shared Components
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule.forRoot({
      mode: 'ios', // Use iOS mode for consistent styling
      rippleEffect: true,
      animated: true
    }),
    IonicStorageModule.forRoot(),
    AppRoutingModule,
    SharedModule,
    FontAwesomeModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    AuthService,
    ApiService,
    StorageService,
    TrendingService,
    SocialInteractionsService,
    CartService,
    WishlistService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas);
  }
}
