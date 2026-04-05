import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IonicModule } from '@ionic/angular';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';
import { CategoryService, Category, Subcategory } from '../../../../../core/services/category.service';

@Component({
    selector: 'app-shop-by-category',
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
  imageUrl = environment.apiUrl
  // No static fallback. All category images and data must come from backend.

  constructor(private router: Router, private http: HttpClient, private categoryService: CategoryService) {}

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

    // Load from API only, do not fallback to static data
    this.subscription.add(
      this.categoryService.getAllCategories().subscribe({
        next: (categories) => {
          // Add default images for categories without images
          const categoriesWithImages = categories.slice(0, 8).map((cat, index) => ({
            ...cat,
            image: cat.image || this.getDefaultCategoryImage(cat.name)
          }));
          this.categories = categoriesWithImages;
          console.log('cat', this.categories);
          this.updateSliderOnCategoriesLoad();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          this.error = 'Failed to load categories';
          this.categories = [];
          this.isLoading = false;
        }
      })
    );
  }

  // Provide default images for categories based on their name
  private getDefaultCategoryImage(categoryName: string): string {
    const name = categoryName.toLowerCase();
    const defaultImages: { [key: string]: string } = {
      'men': '/uploads/categories/men.svg',
      'women': '/uploads/categories/women.svg',
      'kids': '/uploads/categories/kids.svg',
      'accessories': '/uploads/categories/accessories.svg',
      'footwear': '/uploads/categories/shoes.svg',
      'shoes': '/uploads/categories/shoes.svg',
      'bags': '/uploads/categories/bags.svg',
      'beauty': '/uploads/categories/beauty.svg',
      'sportswear': '/uploads/categories/sportswear.svg',
      'ethnic wear': '/uploads/categories/ethnic-wear.svg',
      'ethnic-wear': '/uploads/categories/ethnic-wear.svg',
      'western wear': '/uploads/categories/western-wear.svg',
      'western-wear': '/uploads/categories/western-wear.svg',
      'formal wear': '/uploads/categories/formal-wear.svg',
      'formal-wear': '/uploads/categories/formal-wear.svg',
      'casual wear': '/uploads/categories/casual-wear.svg',
      'casual-wear': '/uploads/categories/casual-wear.svg'
    };

    return defaultImages[name] || '/uploads/categories/fashion.svg';
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
    return category._id || category.name;
  }

  // No static fallback. All images and categories must come from backend.

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
