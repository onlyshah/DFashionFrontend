import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IonicModule } from '@ionic/angular';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  productCount?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  parentCategory?: string;
  subcategories?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

@Component({
  selector: 'app-shop-by-category',
  standalone: true,
  imports: [CommonModule, IonicModule, CarouselModule],
  templateUrl: './shop-by-category.component.html',
  styleUrls: ['./shop-by-category.component.scss']
})
export class ShopByCategoryComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  isLoading = true;
  error: string | null = null;
  private subscription: Subscription = new Subscription();

  // Slider properties
  currentSlide = 0;
  slideOffset = 0;
  cardWidth = 200; // Width of each category card including margin
  visibleCards = 4; // Number of cards visible at once
  maxSlide = 0;
  
  // Auto-sliding properties
  autoSlideInterval: any;
  autoSlideDelay = 4500; // 4.5 seconds for categories
  isAutoSliding = true;
  isPaused = false;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.loadCategories();
    this.updateResponsiveSettings();
    this.setupResizeListener();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.stopAutoSlide();
  }

  private async loadCategories() {
    try {
      this.isLoading = true;
      this.error = null;

      // Load from API
      const response = await this.http.get<any>(`${environment.apiUrl}/api/v1/categories`).toPromise();
      if (response?.success && response?.data) {
        this.categories = response.data.slice(0, 8); // Limit to 8 categories for display
        this.updateSliderOnCategoriesLoad();
      } else {
        console.warn('No categories found');
        this.categories = [];
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      this.categories = [];
      this.error = 'Failed to load categories';
    } finally {
      this.isLoading = false;
    }
  }

  onCategoryClick(category: Category) {
    this.router.navigate(['/category', category._id]);
  }

  formatProductCount(count?: number): string {
    if (!count) return '0';
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  }

  onRetry() {
    this.loadCategories();
  }

  trackByCategoryId(index: number, category: Category): string {
    return category._id;
  }

  // Auto-sliding methods
  private startAutoSlide() {
    if (!this.isAutoSliding || this.isPaused) return;
    
    this.stopAutoSlide();
    this.autoSlideInterval = setInterval(() => {
      if (!this.isPaused && this.categories.length > this.visibleCards) {
        this.autoSlideNext();
      }
    }, this.autoSlideDelay);
  }

  private stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  private autoSlideNext() {
    if (this.currentSlide >= this.maxSlide) {
      this.currentSlide = 0;
    } else {
      this.currentSlide++;
    }
    this.updateSlideOffset();
  }

  pauseAutoSlide() {
    this.isPaused = true;
    this.stopAutoSlide();
  }

  resumeAutoSlide() {
    this.isPaused = false;
    this.startAutoSlide();
  }

  // Responsive methods
  private updateResponsiveSettings() {
    const width = window.innerWidth;
    const sidebarWidth = width * 0.21; // 21% of screen width

    if (width <= 480) {
      this.cardWidth = 160;
      this.visibleCards = 1;
    } else if (width <= 768) {
      this.cardWidth = 180;
      this.visibleCards = 2;
    } else if (width <= 1024) {
      // Calculate based on 21% sidebar width - 3 cards per row
      const availableWidth = sidebarWidth - 40; // Minus padding
      this.cardWidth = Math.floor(availableWidth / 3) - 3; // 3 cards with gap
      this.visibleCards = 3;
    } else if (width <= 1200) {
      const availableWidth = sidebarWidth - 40;
      this.cardWidth = Math.floor(availableWidth / 3) - 3.5;
      this.visibleCards = 3;
    } else {
      const availableWidth = sidebarWidth - 40;
      this.cardWidth = Math.floor(availableWidth / 3) - 4;
      this.visibleCards = 3;
    }
    this.updateSliderLimits();
    this.updateSlideOffset();
  }

  private setupResizeListener() {
    window.addEventListener('resize', () => {
      this.updateResponsiveSettings();
    });
  }

  // Slider methods
  updateSliderLimits() {
    this.maxSlide = Math.max(0, this.categories.length - this.visibleCards);
  }

  slidePrev() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.updateSlideOffset();
      this.restartAutoSlideAfterInteraction();
    }
  }

  slideNext() {
    if (this.currentSlide < this.maxSlide) {
      this.currentSlide++;
      this.updateSlideOffset();
      this.restartAutoSlideAfterInteraction();
    }
  }

  private updateSlideOffset() {
    this.slideOffset = -this.currentSlide * this.cardWidth;
  }

  private restartAutoSlideAfterInteraction() {
    this.stopAutoSlide();
    setTimeout(() => {
      this.startAutoSlide();
    }, 2000);
  }

  // Update slider when categories load
  private updateSliderOnCategoriesLoad() {
    setTimeout(() => {
      this.updateSliderLimits();
      this.currentSlide = 0;
      this.slideOffset = 0;
      this.startAutoSlide();
    }, 100);
  }
}
