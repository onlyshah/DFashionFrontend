import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface SuggestedUser {
  id: string;
  username: string;
  fullName: string;
  avatar: string;
  followedBy: string;
  isFollowing: boolean;
  isInfluencer?: boolean;
  followerCount?: number;
  category?: string;
}

@Component({
  selector: 'app-suggested-for-you',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './suggested-for-you.component.html',
  styleUrls: ['./suggested-for-you.component.scss']
})
export class SuggestedForYouComponent implements OnInit, OnDestroy {
  suggestedUsers: SuggestedUser[] = [];
  isLoading = false;
  error: string | null = null;
  
  // Slider properties
  currentSlide = 0;
  maxSlide = 0;
  slideOffset = 0;
  cardWidth = 200;
  visibleCards = 3;
  
  // Auto-slide properties
  autoSlideInterval: any = null;
  isAutoSliding = true;
  autoSlideDelay = 4000;
  isPaused = false;
  
  // Section interaction properties
  isSectionLiked = false;
  isSectionBookmarked = false;
  sectionLikes = 1247;
  sectionComments = 89;
  sectionShares = 23;
  
  // Mobile detection
  isMobile = false;
  
  private apiUrl = environment.apiUrl;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.checkMobileDevice();
    this.updateResponsiveSettings();
    this.setupResizeListener();
    this.loadSuggestedUsers();
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  private async loadSuggestedUsers() {
    try {
      this.isLoading = true;
      this.error = null;
      
      // Load from API
      const response = await this.http.get<any>(`${this.apiUrl}/api/v1/users/suggested`).toPromise();
      if (response?.success && response?.data) {
        this.suggestedUsers = response.data;
        this.updateSliderOnUsersLoad();
      } else {
        console.warn('No suggested users found');
        this.suggestedUsers = [];
      }
    } catch (error) {
      console.error('Error loading suggested users:', error);
      this.suggestedUsers = [];
      this.error = 'Failed to load suggested users';
    } finally {
      this.isLoading = false;
    }
  }

  onUserClick(user: SuggestedUser) {
    this.router.navigate(['/profile', user.username]);
  }

  onFollowClick(user: SuggestedUser, event: Event) {
    event.stopPropagation();
    user.isFollowing = !user.isFollowing;
    // TODO: Implement actual follow/unfollow API call
  }

  onFollowUser(user: SuggestedUser, event: Event) {
    this.onFollowClick(user, event);
  }

  formatFollowerCount(count: number): string {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  }

  onRetry() {
    this.loadSuggestedUsers();
  }

  trackByUserId(index: number, user: SuggestedUser): string {
    return user.id;
  }

  // Auto-sliding methods
  private startAutoSlide() {
    if (!this.isAutoSliding || this.isPaused) return;
    
    this.stopAutoSlide();
    this.autoSlideInterval = setInterval(() => {
      if (!this.isPaused && this.suggestedUsers.length > this.visibleCards) {
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
      this.cardWidth = 180;
      this.visibleCards = 1;
    } else if (width <= 768) {
      this.cardWidth = 200;
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
    this.maxSlide = Math.max(0, this.suggestedUsers.length - this.visibleCards);
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

  // Update slider when users load
  private updateSliderOnUsersLoad() {
    setTimeout(() => {
      this.updateSliderLimits();
      this.currentSlide = 0;
      this.slideOffset = 0;
      this.startAutoSlide();
    }, 100);
  }

  // Section interaction methods
  toggleSectionLike() {
    this.isSectionLiked = !this.isSectionLiked;
    if (this.isSectionLiked) {
      this.sectionLikes++;
    } else {
      this.sectionLikes--;
    }
  }

  toggleSectionBookmark() {
    this.isSectionBookmarked = !this.isSectionBookmarked;
  }

  openComments() {
    console.log('Opening comments for suggested users section');
  }

  shareSection() {
    if (navigator.share) {
      navigator.share({
        title: 'Suggested for You',
        text: 'Discover amazing fashion creators!',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      console.log('Link copied to clipboard');
    }
  }

  openMusicPlayer() {
    console.log('Opening music player for suggested users');
  }

  formatCount(count: number): string {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  }

  private checkMobileDevice() {
    this.isMobile = window.innerWidth <= 768;
  }
}
