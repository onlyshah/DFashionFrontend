import { Component, OnInit } from '@angular/core';
import { faHome, faSearch } from '@fortawesome/free-solid-svg-icons';
import { UnifiedApiService } from 'src/app/core/services/unified-api.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';

// Interfaces
interface Category {
  name: string;
  slug: string;
  image: string;
  itemCount: number;
}

interface Brand {
  name: string;
  slug: string;
  logo: string;
  description: string;
}

@Component({
    selector: 'app-explore',
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './explore.component.html',
    styleUrls: ['./explore.component.scss']
})

export class ExploreComponent implements OnInit {
  searchQuery = '';
  categories: Category[] = [];
  trendingItems: any[] = [];
  featuredBrands: Brand[] = [];
  styleInspiration: any[] = [];
  apiUrl = environment.apiUrl;
  faHome = faHome;
  faSearch = faSearch;
  constructor(private unifiedApi: UnifiedApiService) {}

  ngOnInit() {
    this.loadCategories();
    this.loadTrendingItems();
    this.loadFeaturedBrands();
    this.loadStyleInspiration();
  }

  loadCategories() {
    this.unifiedApi.getCategories().subscribe(response => {
      this.categories = response?.data || response?.categories || [];
    }, error => {
      this.categories = [];
    });
  }

  loadTrendingItems() {
    this.unifiedApi.getTrendingProducts().subscribe(response => {
      this.trendingItems = response?.data || response?.products || [];
      console.log('trendingData', this.trendingItems);
    }, error => {
      this.trendingItems = [];
    });
  }

  loadFeaturedBrands() {
    this.unifiedApi.getFeaturedBrands().subscribe(response => {
      this.featuredBrands = response?.data || response?.brands || [];
       console.log('this.featuredBrands',this.featuredBrands)
    }, error => {
      this.featuredBrands = [];
    });
  }

  loadStyleInspiration() {
    this.unifiedApi.getStyleInspiration().subscribe((response: any) => {
      this.styleInspiration = response?.data || response?.inspirations || [];
      console.log('this.styleInspiration', this.styleInspiration);
    }, (error: any) => {
      this.styleInspiration = [];
    });
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      // Navigate to search results
      console.log('Searching for:', this.searchQuery);
      // TODO: Implement search navigation
    }
  }

  navigateToCategory(categorySlug: string) {
    // Navigate to category page
    console.log('Navigate to category:', categorySlug);
    // TODO: Implement category navigation
  }

  exploreBrand(brandSlug: string) {
    console.log('Explore brand:', brandSlug);
    // TODO: Implement brand exploration
  }

  viewInspiration(inspirationId: number) {
    console.log('View inspiration:', inspirationId);
    // TODO: Implement inspiration view
  }

  getPrimaryImage(data: any): string {
  if (!data?.images || data.images.length === 0) {
    return this.apiUrl + '/uploads/products/default.jpg'; // fallback placeholder
  }
  const primary = data.images.find((img: any) => img.isPrimary);
  return this.apiUrl + (primary ? primary.url : data.images[0].url);
}

}
