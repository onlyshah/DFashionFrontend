import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { ViewAddStoriesComponent } from '../../components/view-add-stories/view-add-stories.component';
import { FeedComponent } from '../../components/feed/feed.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TrendingProductsComponent } from '../../components/trending-products/trending-products.component';
import { FeaturedBrandsComponent } from '../../components/featured-brands/featured-brands.component';
import { NewArrivalsComponent } from '../../components/new-arrivals/new-arrivals.component';
import { SuggestedForYouComponent } from '../../components/suggested-for-you/suggested-for-you.component';
import { TopFashionInfluencersComponent } from '../../components/top-fashion-influencers/top-fashion-influencers.component';

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
    TopFashionInfluencersComponent
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

  // Instagram Stories Data - Enhanced for responsive design and mobile app
  instagramStories = [
    {
      id: 1,
      username: 'zara',
      avatar: '/assets/images/default-avatar.svg',
      hasStory: true,
      viewed: false,
      touching: false
    },
    {
      id: 2,
      username: 'nike',
      avatar: '/assets/images/default-avatar.svg',
      hasStory: true,
      viewed: false,
      touching: false
    },
    {
      id: 3,
      username: 'adidas',
      avatar: '/assets/images/default-avatar.svg',
      hasStory: true,
      viewed: true,
      touching: false
    },
    {
      id: 4,
      username: 'h&m',
      avatar: '/assets/images/default-avatar.svg',
      hasStory: true,
      viewed: false,
      touching: false
    },
    {
      id: 5,
      username: 'uniqlo',
      avatar: '/assets/images/default-avatar.svg',
      hasStory: true,
      viewed: false,
      touching: false
    },
    {
      id: 6,
      username: 'gucci',
      avatar: '/assets/images/default-avatar.svg',
      hasStory: true,
      viewed: true,
      touching: false
    },
    {
      id: 7,
      username: 'prada',
      avatar: '/assets/images/default-avatar.svg',
      hasStory: true,
      viewed: false,
      touching: false
    },
    {
      id: 8,
      username: 'versace',
      avatar: '/assets/images/default-avatar.svg',
      hasStory: true,
      viewed: false,
      touching: false
    }
  ];

  // Categories Data
  categories = [
    { name: 'Women', icon: 'woman' },
    { name: 'Men', icon: 'man' },
    { name: 'Kids', icon: 'happy' },
    { name: 'Shoes', icon: 'footsteps' },
    { name: 'Bags', icon: 'bag' },
    { name: 'Accessories', icon: 'watch' },
    { name: 'Beauty', icon: 'flower' },
    { name: 'Sports', icon: 'fitness' }
  ];

  constructor() {}

  ngOnInit() {
    this.checkScreenSize();
    console.log('Home component initialized:', {
      isMobile: this.isMobile,
      instagramStories: this.instagramStories.length
    });
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
}
