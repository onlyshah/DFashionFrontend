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
  visibleCards = 2; // Number of cards visible at once
  maxSlide = 0;

  // Auto-sliding properties
  autoSlideInterval: any;
  autoSlideDelay = 4500; // 4.5 seconds for categories
  isAutoSliding = true;
  isPaused = false;

  // Default category images mapping
  private defaultCategoryImages = {
    'Women': 'assets/images/fashion-post-1.jpg',
    'Men': 'assets/images/fashion-post-2.jpg',
    'Kids': 'assets/images/story-1.jpg',
    'Ethnic': 'assets/images/story-2.jpg'
  };

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

  private loadCategories() {
    this.isLoading = true;
    this.error = null;

    // Load from API
    this.subscription.add(
      this.http.get<any>(`${environment.apiUrl}/api/v1/categories`).subscribe({
        next: (response) => {
          if (response?.success && response?.data) {
            this.categories = response.data.slice(0, 8); // Limit to 8 categories for slider
            this.updateSliderOnCategoriesLoad();
          } else {
            console.warn('No categories found');
            this.categories = this.getDefaultCategories(); // Use default categories if none found
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          this.categories = this.getDefaultCategories(); // Use default categories on error
          this.error = 'Failed to load categories';
          this.isLoading = false;
        }
      })
    );
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

  trackByCategoryId(_index: number, category: Category): string {
    return category._id;
  }

  getDefaultCategoryImage(categoryName: string): string {
    return this.defaultCategoryImages[categoryName as keyof typeof this.defaultCategoryImages] || 'assets/images/categories/default.jpg';
  }

  private getDefaultCategories(): Category[] {
    return [
      {
        _id: 'women',
        name: 'Women',
        description: 'Fashion for Women',
        image: this.getDefaultCategoryImage('Women'),
        productCount: 150,
        isActive: true,
        isFeatured: true
      },
      {
        _id: 'men',
        name: 'Men',
        description: 'Fashion for Men',
        image: this.getDefaultCategoryImage('Men'),
        productCount: 120,
        isActive: true,
        isFeatured: true
      },
      {
        _id: 'kids',
        name: 'Kids',
        description: 'Fashion for Kids',
        image: this.getDefaultCategoryImage('Kids'),
        productCount: 80,
        isActive: true,
        isFeatured: true
      },
      {
        _id: 'ethnic',
        name: 'Ethnic',
        description: 'Traditional Wear',
        image: this.getDefaultCategoryImage('Ethnic'),
        productCount: 90,
        isActive: true,
        isFeatured: true
      }
    ];
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

    if (width <= 768) {
      this.cardWidth = 236; // 220px card + 16px gap
      this.visibleCards = 1;
    } else if (width <= 1024) {
      this.cardWidth = 242; // 230px card + 12px gap
      this.visibleCards = 2;
    } else if (width <= 1200) {
      this.cardWidth = 249; // 235px card + 14px gap
      this.visibleCards = 2;
    } else {
      this.cardWidth = 256; // 240px card + 16px gap
      this.visibleCards = 2;
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
