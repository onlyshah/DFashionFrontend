import { Component, OnInit, OnDestroy, ElementRef, ViewChild, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { environment } from '../../../../../environments/environment';
import { ImageFallbackDirective } from '../../../../shared/directives/image-fallback.directive';

export interface Story {
  _id: string;
  user: {
    _id: string;
    username: string;
    fullName: string;
    avatar: string;
    isBrand?: boolean; // E-commerce: Brand account indicator
    isVerified?: boolean; // E-commerce: Verified account
  };
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  createdAt: string;
  expiresAt: string;
  views: number;
  isActive: boolean;
  isViewed?: boolean; // Added for story viewing state
  hasNewProducts?: boolean; // E-commerce: Has new products
  products?: Array<{
    _id: string;
    name: string;
    price: number;
    image: string;
  }>;
}

export interface CurrentUser {
  _id: string;
  username: string;
  fullName: string;
  avatar: string;
}

@Component({
  selector: 'app-view-add-stories',
  standalone: true,
  imports: [CommonModule, CarouselModule, ImageFallbackDirective],
  templateUrl: './view-add-stories.component.html',
  styleUrls: ['./view-add-stories.component.scss']
})
export class ViewAddStoriesComponent implements OnInit, OnDestroy {
  @ViewChild('storiesContainer', { static: false }) storiesContainer!: ElementRef;

  // Mobile detection
  isMobile = false;
  @ViewChild('feedCover', { static: false }) feedCover!: ElementRef;
  @ViewChild('storiesSlider', { static: false }) storiesSlider!: ElementRef;

  @Input() stories: Story[] = [];
  @Input() showAddStory: boolean = true;
  @Input() currentUser: CurrentUser | null = null;
  @Output() storyClick = new EventEmitter<{ story: Story; index: number }>();

  isLoadingStories = true;

  currentIndex = 0;
  isOpen = false;
  isRotating = false;
  isDragging = false;
  rotateY = 0;
  targetRotateY = 0;
  targetDirection: 'forward' | 'back' | null = null;
  
  // Touch/drag properties
  dragStartX = 0;
  dragCurrentX = 0;
  minDragPercentToTransition = 0.5;
  minVelocityToTransition = 0.65;
  transitionSpeed = 6;

  // Carousel state properties
  isCarouselInitialized = false;
  isAutoPlaying = true;
  currentSlideIndex = 0;

  // E-commerce Optimized Carousel Options - Mobile Responsive
  customOptions: OwlOptions = {
    loop: false, // Don't loop for better UX with Add Story first
    mouseDrag: true,
    touchDrag: true, // Essential for mobile
    pullDrag: true, // Allow pull drag on mobile
    dots: false,
    nav: false, // Hide nav on mobile, show on desktop
    navSpeed: 500,
    navText: ['<i class="fas fa-chevron-left"></i>', '<i class="fas fa-chevron-right"></i>'],
    margin: 8, // Default margin
    stagePadding: 10, // Add padding for better mobile UX
    autoplay: false,
    autoplayHoverPause: true,
    slideBy: 1, // Slide one item at a time
    freeDrag: true, // Allow free dragging on mobile
    responsive: {
      0: {
        items: 3, // 3 stories visible on small mobile
        nav: false,
        margin: 6,
        stagePadding: 15,
        touchDrag: true,
        mouseDrag: true,
        pullDrag: true
      },
      400: {
        items: 4, // 4 stories on larger mobile
        nav: false,
        margin: 8,
        stagePadding: 12,
        touchDrag: true,
        mouseDrag: true,
        pullDrag: true
      },
      600: {
        items: 5, // 5 stories on tablet
        nav: false,
        margin: 10,
        stagePadding: 10
      },
      768: {
        items: 6, // 6 stories on large tablet
        nav: true,
        margin: 12,
        stagePadding: 0
      },
      940: {
        items: 7, // 7 stories on desktop
        nav: true,
        margin: 12,
        stagePadding: 0
      }
    }
  };

  // Web Layout Carousel Options
  carouselOptions: OwlOptions = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    navText: ['<i class="fas fa-chevron-left"></i>', '<i class="fas fa-chevron-right"></i>'],
    responsive: {
      0: {
        items: 3,
        nav: false,
        margin: 8
      },
      600: {
        items: 4,
        nav: true,
        margin: 10
      },
      768: {
        items: 5,
        nav: true,
        margin: 12
      }
    }
  };

  private subscriptions: Subscription[] = [];
  imageUrl = environment.apiUrl
  constructor(
    private router: Router,
    private http: HttpClient,
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit() {
    // Check screen size for mobile detection
    this.checkScreenSize();

    // Always show stories section, even if empty
    this.isLoadingStories = false;

    // Only load stories if none are provided as input
    if (!this.stories || this.stories.length === 0) {
      this.loadStories();
    }
    this.setupEventListeners();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.removeEventListeners();
  }

  loadStories() {
    // Don't show loading state - show stories section immediately
    this.isLoadingStories = false;

    // Load stories from real API
    this.http.get<any>(`${environment.apiUrl}/api/v1/stories`).subscribe({
      next: (response) => {
        console.log('✅ Stories loaded successfully:', response);
        if (response?.success && response?.storyGroups) {
          // Use storyGroups for better organization
          this.stories = response.storyGroups.map((storyGroup: any) => ({
            _id: storyGroup.user?._id,
            user: {
              _id: storyGroup.user?._id,
              username: storyGroup.user?.username || 'unknown',
              fullName: storyGroup.user?.fullName || 'Unknown User',
              avatar: storyGroup.user?.avatar || 'http://localhost:9000/upload/avatars/default-avatar.png',
              isBrand: false,
              isVerified: false
            },
            mediaUrl: storyGroup.stories?.[0]?.media?.url || '',
            mediaType: storyGroup.stories?.[0]?.media?.type === 'video' ? 'video' : 'image',
            caption: storyGroup.stories?.[0]?.caption || '',
            createdAt: storyGroup.stories?.[0]?.createdAt || new Date().toISOString(),
            expiresAt: storyGroup.stories?.[0]?.expiresAt || new Date().toISOString(),
            views: storyGroup.stories?.[0]?.analytics?.views || 0,
            isActive: true,
            isViewed: false,
            hasNewProducts: storyGroup.stories?.[0]?.products?.length > 0,
            products: storyGroup.stories?.[0]?.products?.map((p: any) => ({
              _id: p.product?._id,
              name: p.product?.name,
              price: p.product?.price,
              image: p.product?.images?.[0]?.url
            })) || []
          }));
        } else if (response?.success && response?.stories) {
          // Fallback to individual stories if storyGroups not available
          const uniqueUsers = new Map();
          response.stories.forEach((story: any) => {
            if (story.user && !uniqueUsers.has(story.user._id)) {
              uniqueUsers.set(story.user._id, {
                _id: story._id,
                user: {
                  _id: story.user._id,
                  username: story.user.username || 'unknown',
                  fullName: story.user.fullName || 'Unknown User',
                  avatar: story.user.avatar || 'http://localhost:9000/upload/avatars/default-avatar.png',
                  isBrand: false,
                  isVerified: false
                },
                mediaUrl: story.media?.url || '',
                mediaType: story.media?.type === 'video' ? 'video' : 'image',
                caption: story.caption || '',
                createdAt: story.createdAt || new Date().toISOString(),
                expiresAt: story.expiresAt || new Date().toISOString(),
                views: story.analytics?.views || 0,
                isActive: true,
                isViewed: false,
                hasNewProducts: story.products?.length > 0,
                products: story.products?.map((p: any) => ({
                  _id: p.product?._id,
                  name: p.product?.name,
                  price: p.product?.price,
                  image: p.product?.images?.[0]?.url
                })) || []
              });
            }
          });
          this.stories = Array.from(uniqueUsers.values());
        } else {
          console.warn('No stories found in response');
          this.stories = [];
        }
        this.isLoadingStories = false;
      },
      error: (error) => {
        console.error('Error loading stories:', error);
        this.stories = [];
        this.isLoadingStories = false;
      }
    });
  }

  // Removed fallback stories - only use database data

  getCurrentStory(): Story {
    return this.stories[this.currentIndex] || this.stories[0];
  }

  getTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  }

  formatNumber(num: number): string {
    if (!num || num === undefined || num === null) {
      return '0';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  openStories(index: number = 0) {
    this.currentIndex = index;
    this.isOpen = true;
    this.showStory(index);
    document.body.style.overflow = 'hidden';

    // Emit story click event
    if (this.stories[index]) {
      this.storyClick.emit({ story: this.stories[index], index });
    }
  }

  closeStories() {
    this.isOpen = false;
    this.pauseAllVideos();
    document.body.style.overflow = 'auto';
    
    // Add closing animation
    if (this.storiesContainer) {
      this.storiesContainer.nativeElement.classList.add('is-closed');
    }
    
    setTimeout(() => {
      if (this.storiesContainer) {
        this.storiesContainer.nativeElement.classList.remove('is-closed');
      }
    }, 300);
  }

  showStory(index: number) {
    this.currentIndex = index;
    this.rotateY = 0;
    
    // Reset container transform
    if (this.storiesContainer) {
      this.storiesContainer.nativeElement.style.transform = 'translateZ(-50vw)';
    }
  }

  nextStory() {
    if (this.currentIndex < this.stories.length - 1) {
      this.targetRotateY = -90;
      this.targetDirection = 'forward';
      this.isRotating = true;
      this.update();
    } else {
      this.closeStories();
    }
  }

  previousStory() {
    if (this.currentIndex > 0) {
      this.targetRotateY = 90;
      this.targetDirection = 'back';
      this.isRotating = true;
      this.update();
    } else {
      this.closeStories();
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (!this.isOpen) return;

    switch (event.key) {
      case 'ArrowLeft':
        this.previousStory();
        break;
      case 'ArrowRight':
        this.nextStory();
        break;
      case 'Escape':
        this.closeStories();
        break;
    }
  }

  onStoryClick(event: MouseEvent) {
    if (this.isRotating) return;

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const width = rect.width;

    if (clickX < width / 2) {
      this.previousStory();
    } else {
      this.nextStory();
    }
  }

  onTouchStart(event: TouchEvent) {
    this.isDragging = true;
    this.dragStartX = event.touches[0].clientX;
    this.dragCurrentX = this.dragStartX;
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isDragging) return;

    this.dragCurrentX = event.touches[0].clientX;
    const dragDistance = this.dragCurrentX - this.dragStartX;
    const dragPercent = Math.abs(dragDistance) / window.innerWidth;

    if (dragPercent > this.minDragPercentToTransition) {
      if (dragDistance > 0) {
        this.previousStory();
      } else {
        this.nextStory();
      }
      this.isDragging = false;
    }
  }

  onTouchEnd(_event: TouchEvent) {
    this.isDragging = false;
  }

  private setupEventListeners() {
    // Add any additional event listeners here
  }

  private removeEventListeners() {
    // Remove any additional event listeners here
  }

  private pauseAllVideos() {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      video.pause();
    });
  }

  private update() {
    if (!this.isRotating) return;

    const diff = this.targetRotateY - this.rotateY;
    this.rotateY += diff * 0.1;

    if (Math.abs(diff) < 0.1) {
      this.rotateY = this.targetRotateY;
      this.isRotating = false;

      if (this.targetDirection === 'forward') {
        this.currentIndex++;
      } else if (this.targetDirection === 'back') {
        this.currentIndex--;
      }

      this.targetRotateY = 0;
      this.targetDirection = null;
    }

    if (this.storiesContainer) {
      this.storiesContainer.nativeElement.style.transform = `translateZ(-50vw) rotateY(${this.rotateY}deg)`;
    }

    if (this.isRotating) {
      requestAnimationFrame(() => this.update());
    }
  }

  hasProducts(): boolean {
    const story = this.getCurrentStory();
    return !!(story?.products && story.products.length > 0);
  }

  getStoryProducts() {
    return this.getCurrentStory().products || [];
  }

  formatPrice(price: number): string {
    return `₹${(price / 100).toLocaleString('en-IN')}`;
  }

  viewProductDetails(product: any) {
    console.log('Viewing product:', product);
    // Navigate to product page or show product modal
    this.router.navigate(['/products', product._id]);
  }

  getCurrentUserAvatar(): string {
    // Use currentUser input if available, otherwise return default avatar
  return this.currentUser?.avatar || 'http://localhost:9000/upload/avatars/default-avatar.png';
  }

  openAddStoryModal() {
    console.log('Opening add story modal');
    // Navigate to add story page or open modal
    this.router.navigate(['/add-story']);
  }

  buyNow() {
    const products = this.getStoryProducts();
    if (products.length > 0) {
      const product = products[0]; // Get first product for now
      console.log('Buying product:', product);
      // Navigate to checkout with product
      this.router.navigate(['/checkout'], {
        queryParams: {
          productId: product._id,
          source: 'story'
        }
      });
    }
  }

  // Direct product navigation
  viewProduct(productId: string): void {
    // Track product click analytics
    this.trackProductClick(productId, 'view_product');

    // Navigate to product detail page
    this.router.navigate(['/shop/product', productId]);
  }

  viewCategory(categoryId: string): void {
    // Navigate to category page
    this.router.navigate(['/shop/category', categoryId]);
  }

  private trackProductClick(productId: string, action: string): void {
    // Track analytics for product clicks from stories
    console.log(`Story product ${action} tracked:`, productId);
    // TODO: Implement analytics tracking API call
  }

  addToWishlist() {
    const products = this.getStoryProducts();
    if (products.length > 0) {
      const product = products[0];
      console.log('Adding to wishlist:', product);

      this.wishlistService.addToWishlist(product._id).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Product added to wishlist!');
          } else {
            alert('Failed to add product to wishlist');
          }
        },
        error: (error) => {
          console.error('Error adding to wishlist:', error);
          alert('Error adding product to wishlist');
        }
      });
    }
  }

  addToCart() {
    const products = this.getStoryProducts();
    if (products.length > 0) {
      const product = products[0];
      console.log('Adding to cart:', product);

      this.cartService.addToCart(product._id, 1, undefined, undefined).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Product added to cart!');
          } else {
            alert('Failed to add product to cart');
          }
        },
        error: (error) => {
          console.error('Error adding to cart:', error);
          alert('Error adding product to cart');
        }
      });
    }
  }

  // Owl Carousel Event Handlers
  onSlideChanged(event: any) {
    // Handle slide change events
    if (event && event.startPosition !== undefined) {
      this.currentSlideIndex = event.startPosition;

      // Log slide change for debugging
      console.log(`Stories slide changed to: ${this.currentSlideIndex}`);

      // Update any slide-specific logic here
      this.updateSlideAnalytics();
    }
  }

  onInitialized(_event: any) {
    // Handle carousel initialization
    this.isCarouselInitialized = true;
    console.log('Stories carousel initialized successfully with auto-sliding enabled');
  }

  // Analytics for slide changes
  private updateSlideAnalytics() {
    // Track slide interactions for analytics
    if (this.stories && this.stories[this.currentSlideIndex]) {
      const currentStory = this.stories[this.currentSlideIndex];
      console.log(`Viewing story from: ${currentStory.user.username}`);
    }
  }

  // Method to toggle auto-play (can be called from template if needed)
  toggleAutoPlay() {
    this.isAutoPlaying = !this.isAutoPlaying;
    // Note: Owl Carousel doesn't have a direct method to toggle autoplay
    // This would require reinitializing the carousel with new options
    console.log(`Auto-play ${this.isAutoPlaying ? 'enabled' : 'disabled'}`);
  }

  // Mobile detection method
  private checkScreenSize() {
    const width = window.innerWidth;
    const userAgent = navigator.userAgent;
    const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

    // Consider it mobile if width <= 768px OR if it's a mobile user agent
    this.isMobile = width <= 768 || isMobileUserAgent;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }
}
