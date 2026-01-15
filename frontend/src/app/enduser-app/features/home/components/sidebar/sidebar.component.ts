  // ...existing imports...

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ProductService } from '../../../../../core/services/product.service';
import { Product } from '../../../../../core/models/product.interface';
import { TrendingProductsComponent } from '../trending-products/trending-products.component';
import { FeaturedBrandsComponent } from '../featured-brands/featured-brands.component';
import { NewArrivalsComponent } from '../new-arrivals/new-arrivals.component';
import { SuggestedForYouComponent } from '../suggested-for-you/suggested-for-you.component';
import { TopFashionInfluencersComponent } from '../top-fashion-influencers/top-fashion-influencers.component';
import { ShopByCategoryComponent } from '../shop-by-category/shop-by-category.component';

@Component({
    selector: 'app-sidebar',
    imports: [
        CommonModule,
        RouterModule,
        IonicModule,
        TrendingProductsComponent,
        FeaturedBrandsComponent,
        NewArrivalsComponent,
        SuggestedForYouComponent,
        TopFashionInfluencersComponent,
        ShopByCategoryComponent
    ],
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  isMobile(): boolean {
    return window.innerWidth <= 768;
  }
  // Remove unused properties - components handle their own data
  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit() {
    // Components handle their own data loading
    // No need to load data here as each component manages its own state
  }

  // Removed duplicate isMobile method
  // Removed all data loading methods as components handle their own data
  // This keeps the sidebar clean and ensures no mock data is used
}
