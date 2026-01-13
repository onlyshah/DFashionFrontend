import { MaterialModule } from './material.module';
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
import { CmsComponent } from './admin/pages/cms/cms.component';
import { ComplianceComponent } from './admin/pages/compliance/compliance.component';
import { PromotionListComponent } from './admin/pages/promotions/promotion-list/promotion-list.component';
import { LogisticsComponent } from './admin/pages/logistics/logistics.component';
import { SellerManagementComponent } from './admin/pages/seller-management/seller-management.component';

// Core Services
import { AuthService } from './core/services/auth.service';
import { ApiService } from './core/services/api.service';
import { StorageService } from './core/services/storage.service';
import { TrendingService } from './core/services/trending.service';
import { SocialInteractionsService } from './core/services/social-interactions.service';
import { CartService } from './core/services/cart.service';
import { WishlistService } from './core/services/wishlist.service';
import { CmsService } from './admin/services/cms.service';
import { ComplianceService } from './admin/services/compliance.service';
import { PromotionService } from './admin/services/promotion.service';
import { LogisticsService } from './admin/services/logistics.service';
import { SellerManagementService } from './admin/services/seller-management.service';

// Shared Components
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    CmsComponent,
    ComplianceComponent,
    PromotionListComponent,
    LogisticsComponent,
    SellerManagementComponent
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
  FontAwesomeModule,
  MaterialModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    AuthService,
    ApiService,
    StorageService,
    TrendingService,
    SocialInteractionsService,
    CartService,
    WishlistService,
    CmsService, ComplianceService, PromotionService, LogisticsService, SellerManagementService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas);
  }
}
