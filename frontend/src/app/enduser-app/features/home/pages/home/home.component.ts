import { Component, OnInit, OnDestroy, HostListener, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../../../environments/environment';
import { AuthService } from '../../../../../core/services/auth.service';
import { StoryService } from '../../../../../core/services/story.service';
import { CategoryService } from '../../../../../core/services/category.service';
import { ProductService } from '../../../../../core/services/product.service';
import { PostService } from '../../../../../core/services/post.service';

import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { StoryTrayComponent } from '../../components/stories/story-tray/story-tray.component';
//import { ViewStoriesComponent } from '../../components/stories/view-stories/view-stories.component';
import { FeedComponent } from '../../components/feed/feed.component';
//import { ShopByCategoryComponent } from '../../components/shop-by-category/shop-by-category.component';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        CommonModule,
        IonicModule,
        StoryTrayComponent,
        //ViewStoriesComponent,
        FeedComponent,
        SidebarComponent,
        //ShopByCategoryComponent
    ],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  @Input() platform: 'web' | 'mobile' = 'web';

  isMobile = false;
  // isSidebarOpen = false; // Removed - using mobile-layout component
  // isTabMenuOpen = false; // Removed - using mobile-layout component
  // isSidebarContentOpen = false; // Removed - using mobile-layout component
  // currentSidebarTab = ''; // Removed - using mobile-layout component
  // currentSidebarTitle = ''; // Removed - using mobile-layout component
  // hasNotifications = true; // Removed - using mobile-layout component
  window = window;
  isLiked = false;
  socialStories: any[] = [];
  categories: any[] = [];
  apiUrl = environment.apiUrl;
  currentUser: any = null;

  // Mobile-specific properties
  featuredProducts: any[] = [];
  recentStories: any[] = [];
  trendingPosts: any[] = [];
  trendingProducts: any[] = [];
  featuredBrands: any[] = [];
  newArrivals: any[] = [];
  suggestedUsers: any[] = [];
  topInfluencers: any[] = [];
  isLoading = true;
  isAuthenticated = false;

  // Slider options for mobile
  slideOpts = { initialSlide: 0, speed: 400, spaceBetween: 10, slidesPerView: 1.2, centeredSlides: false, loop: true, autoplay: { delay: 3000 } };
  storySlideOpts = { initialSlide: 0, speed: 400, spaceBetween: 8, slidesPerView: 5.5, freeMode: true, grabCursor: true };
  productSlideOpts = { initialSlide: 0, speed: 400, spaceBetween: 15, slidesPerView: 2.2, freeMode: true, autoplay: { delay: 3000 } };
  brandSlideOpts = { initialSlide: 0, speed: 400, spaceBetween: 12, slidesPerView: 3.5, freeMode: true, autoplay: { delay: 4000 } };
  userSlideOpts = { initialSlide: 0, speed: 400, spaceBetween: 16, slidesPerView: 2.5, freeMode: true, autoplay: { delay: 5000 } };

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private storyService: StoryService,
    private categoryService: CategoryService,
    private productService?: ProductService,
    private postService?: PostService,
    private toastController?: ToastController
  ) {
    // Auto-detect platform from router URL
    if (this.router.url.includes('/mobile/')) {
      this.platform = 'mobile';
    } else {
      this.platform = 'web';
    }
  }

  ngOnInit() {
    if (this.platform === 'mobile') {
      this.loadMobileHomeData();
      this.authService.isAuthenticated$.subscribe(isAuth => {
        this.isAuthenticated = isAuth;
      });
    } else {
      this.checkScreenSize();
      this.loadStories();
      this.loadCategories();
      console.log('🏠 Home component initialized:', { isMobile: this.isMobile, storiesCount: this.socialStories.length });
    }
  }

  ngOnDestroy() {
    if (this.platform === 'web') {
      // Touch event listeners removed - using mobile-layout component
    }
  }

  // Mobile-specific data loading
  async loadMobileHomeData() {
    try {
      this.isLoading = true;
      // Load all data in parallel
      const [products, stories, posts] = await Promise.all([
        this.productService ? this.productService.getProducts().toPromise() : Promise.resolve([]),
        this.storyService.getStories().toPromise(),
        this.postService ? this.postService.getPosts().toPromise() : Promise.resolve([])
      ]);
      this.featuredProducts = (products as any) || [];
      this.recentStories = (stories as any) || [];
      this.trendingPosts = (posts as any) || [];
      this.isLoading = false;
    } catch (error) {
      console.error('Error loading mobile home data:', error);
      this.isLoading = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(_event: any) {
    this.checkScreenSize();
    // Sidebar management removed - using mobile-layout component
  }

  private checkScreenSize() {
    // More comprehensive mobile detection
    const width = window.innerWidth;
    const userAgent = navigator.userAgent;
    const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

    // Consider it mobile if width <= 768px OR if it's a mobile user agent
    this.isMobile = width <= 768 || isMobileUserAgent;

    console.log('📱 Screen size check:', { width, isMobile: this.isMobile, userAgent: userAgent.substring(0, 50) });
  }

  // Mobile navigation methods removed - using mobile-layout component

  // TikTok-style interaction methods
  toggleLike() {
    this.isLiked = !this.isLiked;
    // TODO: Implement like functionality with backend
  }

  openComments() {
    // TODO: Implement comments modal/page
  }

  shareContent() {
    // TODO: Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: 'DFashion',
        text: 'Check out this amazing fashion content!',
        url: window.location.href
      });
    }
  }

  openMusic() {
    // TODO: Implement music/audio functionality
  }

  // Stories functionality
  createStory() {
    // TODO: Implement story creation
  }

  trackByStoryId(index: number, story: any): any {
    return story.id || index;
  }

  // Enhanced touch interactions for mobile app
  onStoryTouchStart(_event: TouchEvent, story: any) {
    story.touching = true;
    // Add haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }

  onStoryTouchEnd(_event: TouchEvent, story: any) {
    story.touching = false;
  }

  // TikTok-style interaction methods
  onLikeClick() {
    this.isLiked = !this.isLiked;
    // TODO: Implement like functionality with backend
  }

  onCommentClick() {
    // TODO: Implement comment functionality
  }

  onShareClick() {
    // TODO: Implement share functionality
  }

  onBookmarkClick() {
    // TODO: Implement bookmark functionality
  }

  // Mobile quick actions navigation methods
  navigateToTrending() {
    // TODO: Implement navigation to trending page
  }

  navigateToNewArrivals() {
    // TODO: Implement navigation to new arrivals page
  }

  navigateToOffers() {
    // TODO: Implement navigation to offers page
  }

  navigateToCategories() {
    // TODO: Implement navigation to categories page
  }

  navigateToWishlist() {
    // TODO: Implement navigation to wishlist page
  }

  navigateToCart() {
    // TODO: Implement navigation to cart page
  }

  // Load stories from API
  private loadStories() {
    // Load sample stories immediately as fallback
    this.loadSampleStories();
    console.log('📖 Sample stories loaded:', this.socialStories.length);

    // Try to load from API (this will override sample stories if successful)
    this.storyService.getStories().subscribe({
      next: (response) => {
        if (response?.success && response?.storyGroups) {
          this.socialStories = response.storyGroups.map((storyGroup: any) => ({
            _id: storyGroup.user?._id || `story_${Date.now()}_${Math.random()}`,
            user: {
              _id: storyGroup.user?._id || `user_${Date.now()}_${Math.random()}`,
              username: storyGroup.user?.username || 'unknown',
              fullName: storyGroup.user?.fullName || storyGroup.user?.username || 'Unknown User',
              avatar: storyGroup.user?.avatar || 'http://localhost:3000/uploads/avatars/default-avatar.svg'
            },
            media: storyGroup.media || [],
            viewed: false,
            createdAt: storyGroup.createdAt || new Date()
          }));
        } else if (response?.success && response?.stories) {
          // Fallback to individual stories if storyGroups not available
          const uniqueUsers = new Map();
          response.stories.forEach((story: any) => {
            if (story.user && !uniqueUsers.has(story.user._id)) {
              uniqueUsers.set(story.user._id, {
                _id: story._id || `story_${Date.now()}_${Math.random()}`,
                user: {
                  _id: story.user._id,
                  username: story.user.username || 'unknown',
                  fullName: story.user.fullName || story.user.username || 'Unknown User',
                  avatar: story.user.avatar || 'http://localhost:3000/uploads/avatars/default-avatar.svg'
                },
                media: story.media || [],
                viewed: false,
                createdAt: story.createdAt || new Date()
              });
            }
          });
          this.socialStories = Array.from(uniqueUsers.values());
        }
        // If no stories from API, sample stories are already loaded
      },
      error: (error) => {
        // API error - sample stories already loaded as fallback
        console.error('Error loading stories from API:', error);
      }
    });
  }

  // Load stories from database only - NO MOCK DATA
  private loadSampleStories() {
    // Initialize empty array - only real database data will be loaded
    this.socialStories = [];
  }

  // Load categories from API
  private loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories.slice(0, 8).map((category: any) => ({
          name: category.name,
          icon: this.getCategoryIcon(category.name)
        }));
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.categories = [];
      }
    });
  }

  // Map category names to icons
  private getCategoryIcon(categoryName: string): string {
    const iconMap: { [key: string]: string } = {
      'Women': 'woman',
      'Men': 'man',
      'Kids': 'happy',
      'Footwear': 'footsteps',
      'Accessories': 'watch',
      'Beauty': 'flower',
      'Sports': 'fitness',
      'Ethnic': 'flower',
      'Winter': 'snow',
      'Summer': 'sunny',
      'Formal': 'business',
      'Vintage': 'time',
      'Sustainable': 'leaf',
      'Designer': 'diamond',
      'Street': 'walk',
      'Work': 'briefcase',
      'Party': 'wine',
      'Travel': 'airplane'
    };
    return iconMap[categoryName] || 'shirt';
  }

  // Navigation methods for end user dashboard
  isEndUser(): boolean {
    const userRole = this.authService.getCurrentUserRole();
    return userRole === 'end_user' || userRole === 'customer';
  }

  navigateToDashboard(): void {
    this.router.navigate(['/user-dashboard']);
    // Sidebar management removed - using mobile-layout component
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
    // Sidebar management removed - using mobile-layout component
  }

  navigateToSettings(): void {
    this.router.navigate(['/profile/settings']);
    // Sidebar management removed - using mobile-layout component
  }
}
