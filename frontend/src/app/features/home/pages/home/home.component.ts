import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

import { ViewAddStoriesComponent } from '../../../../shared/components/view-add-stories/view-add-stories.component';
import { FeedComponent } from '../../components/feed/feed.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TrendingProductsComponent } from '../../components/trending-products/trending-products.component';
import { FeaturedBrandsComponent } from '../../components/featured-brands/featured-brands.component';
import { NewArrivalsComponent } from '../../components/new-arrivals/new-arrivals.component';
import { SuggestedForYouComponent } from '../../components/suggested-for-you/suggested-for-you.component';
import { TopFashionInfluencersComponent } from '../../components/top-fashion-influencers/top-fashion-influencers.component';
import { ShopByCategoryComponent } from '../../components/shop-by-category/shop-by-category.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ViewAddStoriesComponent,
    FeedComponent,
    SidebarComponent,
    TrendingProductsComponent,
    FeaturedBrandsComponent,
    NewArrivalsComponent,
    SuggestedForYouComponent,
    TopFashionInfluencersComponent,
    ShopByCategoryComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  isMobile = false;
  isSidebarOpen = false;
  isTabMenuOpen = false;
  isSidebarContentOpen = false;
  currentSidebarTab = '';
  currentSidebarTitle = '';
  hasNotifications = true; // Example notification state
  window = window; // For template access

  // TikTok-style interaction states
  isLiked = false;

  // Instagram Stories Data - Will be loaded from API
  instagramStories: any[] = [];

  // Categories Data - Will be loaded from API
  categories: any[] = [];

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.checkScreenSize();
    this.loadStories();
    this.loadCategories();
    // Prevent body scroll when sidebar is open
    document.addEventListener('touchmove', this.preventScroll, { passive: false });
  }

  ngOnDestroy() {
    document.removeEventListener('touchmove', this.preventScroll);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
    if (!this.isMobile && this.isSidebarOpen) {
      this.closeSidebar();
    }
  }

  private checkScreenSize() {
    // More comprehensive mobile detection
    const width = window.innerWidth;
    const userAgent = navigator.userAgent;
    const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

    // Consider it mobile if width <= 768px OR if it's a mobile user agent
    this.isMobile = width <= 768 || isMobileUserAgent;

    console.log('Screen size check:', {
      width: width,
      height: window.innerHeight,
      isMobile: this.isMobile,
      isMobileUserAgent: isMobileUserAgent,
      userAgent: userAgent
    });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.toggleBodyScroll();
  }

  closeSidebar() {
    this.isSidebarOpen = false;
    this.toggleBodyScroll();
  }

  private toggleBodyScroll() {
    if (this.isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  private preventScroll = (e: TouchEvent) => {
    if (this.isSidebarOpen || this.isTabMenuOpen || this.isSidebarContentOpen) {
      e.preventDefault();
    }
  }

  // Tab Menu Methods
  toggleTabMenu() {
    this.isTabMenuOpen = !this.isTabMenuOpen;
    this.toggleBodyScroll();
  }

  closeTabMenu() {
    this.isTabMenuOpen = false;
    this.toggleBodyScroll();
  }

  openSidebarTab(tabType: string) {
    this.currentSidebarTab = tabType;
    this.isSidebarContentOpen = true;
    this.isTabMenuOpen = false;

    // Set title based on tab type
    const titles: { [key: string]: string } = {
      'trending': 'Trending Products',
      'brands': 'Featured Brands',
      'arrivals': 'New Arrivals',
      'suggested': 'Suggested for You',
      'influencers': 'Fashion Influencers',
      'categories': 'Categories'
    };

    this.currentSidebarTitle = titles[tabType] || 'Discover';
    this.toggleBodyScroll();
  }

  closeSidebarContent() {
    this.isSidebarContentOpen = false;
    this.currentSidebarTab = '';
    this.toggleBodyScroll();
  }

  // TikTok-style interaction methods
  toggleLike() {
    this.isLiked = !this.isLiked;
    // TODO: Implement like functionality with backend
    console.log('Like toggled:', this.isLiked);
  }

  openComments() {
    // TODO: Implement comments modal/page
    console.log('Opening comments...');
  }

  shareContent() {
    // TODO: Implement share functionality
    console.log('Sharing content...');
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
    console.log('Opening music...');
  }

  // Stories functionality
  createStory() {
    console.log('Create story clicked');
    // TODO: Implement story creation
  }

  viewStory(story: any) {
    console.log('View story:', story);
    // TODO: Implement story viewer
  }

  trackByStoryId(index: number, story: any): any {
    return story.id || index;
  }

  // Enhanced touch interactions for mobile app
  onStoryTouchStart(event: TouchEvent, story: any) {
    story.touching = true;
    // Add haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }

  onStoryTouchEnd(event: TouchEvent, story: any) {
    story.touching = false;
  }

  // TikTok-style interaction methods
  onLikeClick() {
    this.isLiked = !this.isLiked;
    console.log('Like clicked:', this.isLiked);
    // TODO: Implement like functionality with backend
  }

  onCommentClick() {
    console.log('Comment clicked');
    // TODO: Implement comment functionality
  }

  onShareClick() {
    console.log('Share clicked');
    // TODO: Implement share functionality
  }

  onBookmarkClick() {
    console.log('Bookmark clicked');
    // TODO: Implement bookmark functionality
  }

  // Mobile quick actions navigation methods
  navigateToTrending() {
    console.log('Navigate to trending');
    // TODO: Implement navigation to trending page
  }

  navigateToNewArrivals() {
    console.log('Navigate to new arrivals');
    // TODO: Implement navigation to new arrivals page
  }

  navigateToOffers() {
    console.log('Navigate to offers');
    // TODO: Implement navigation to offers page
  }

  navigateToCategories() {
    console.log('Navigate to categories');
    // TODO: Implement navigation to categories page
  }

  navigateToWishlist() {
    console.log('Navigate to wishlist');
    // TODO: Implement navigation to wishlist page
  }

  navigateToCart() {
    console.log('Navigate to cart');
    // TODO: Implement navigation to cart page
  }

  // Load stories from API
  private loadStories() {
    // Load sample stories immediately as fallback
    this.loadSampleStories();

    // Try to load from API (this will override sample stories if successful)
    this.http.get<any>(`${this.apiUrl}/api/stories`).subscribe({
      next: (response) => {
        if (response?.success && response?.storyGroups) {
          this.instagramStories = response.storyGroups.map((storyGroup: any) => ({
            _id: storyGroup.user?._id || `story_${Date.now()}_${Math.random()}`,
            user: {
              _id: storyGroup.user?._id || `user_${Date.now()}_${Math.random()}`,
              username: storyGroup.user?.username || 'unknown',
              fullName: storyGroup.user?.fullName || storyGroup.user?.username || 'Unknown User',
              avatar: storyGroup.user?.avatar || '/assets/images/default-avatar.svg'
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
                  avatar: story.user.avatar || '/assets/images/default-avatar.svg'
                },
                media: story.media || [],
                viewed: false,
                createdAt: story.createdAt || new Date()
              });
            }
          });
          this.instagramStories = Array.from(uniqueUsers.values());
        }
        // If no stories from API, sample stories are already loaded
      },
      error: (error) => {
        // API error - sample stories already loaded as fallback
        console.error('Error loading stories from API:', error);
      }
    });
  }

  // Load sample stories for demonstration
  private loadSampleStories() {
    this.instagramStories = [
      {
        _id: 'story_1',
        user: {
          _id: 'user_1',
          username: 'fashionista_maya',
          fullName: 'Maya Sharma',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616c9c0e6e0?w=150&h=150&fit=crop&crop=face'
        },
        media: [
          {
            type: 'image' as const,
            url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop'
          }
        ],
        viewed: false,
        createdAt: new Date()
      },
      {
        _id: 'story_2',
        user: {
          _id: 'user_2',
          username: 'style_guru_raj',
          fullName: 'Raj Patel',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        },
        media: [
          {
            type: 'image' as const,
            url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=600&fit=crop'
          }
        ],
        viewed: false,
        createdAt: new Date()
      },
      {
        _id: 'story_3',
        user: {
          _id: 'user_3',
          username: 'trendy_priya',
          fullName: 'Priya Singh',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
        },
        media: [
          {
            type: 'image' as const,
            url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=600&fit=crop'
          }
        ],
        viewed: true,
        createdAt: new Date()
      },
      {
        _id: 'story_4',
        user: {
          _id: 'user_4',
          username: 'fashion_forward',
          fullName: 'Arjun Kumar',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        },
        media: [
          {
            type: 'image' as const,
            url: 'https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=400&h=600&fit=crop'
          }
        ],
        viewed: false,
        createdAt: new Date()
      },
      {
        _id: 'story_5',
        user: {
          _id: 'user_5',
          username: 'chic_neha',
          fullName: 'Neha Gupta',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
        },
        media: [
          {
            type: 'image' as const,
            url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=600&fit=crop'
          }
        ],
        viewed: false,
        createdAt: new Date()
      }
    ];
  }

  // Load categories from API
  private loadCategories() {
    this.http.get<any>(`${this.apiUrl}/api/v1/categories`).subscribe({
      next: (response) => {
        if (response?.success && response?.data) {
          this.categories = response.data.slice(0, 8).map((category: any) => ({
            name: category.name,
            icon: this.getCategoryIcon(category.name)
          }));
        } else {
          console.warn('No categories found');
          this.categories = [];
        }
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
}
