import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IonicModule } from '@ionic/angular';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ImageFallbackDirective } from '../../../../shared/directives/image-fallback.directive';

interface Influencer {
  _id: string;
  username: string;
  fullName: string;
  avatar: string;
  bio?: string;
  followersCount: number;
  postsCount: number;
  engagement?: number;
  isFollowing: boolean;
  isInfluencer: boolean;
  socialStats?: {
    followersCount: number;
    followingCount: number;
    postsCount: number;
    likesReceived: number;
    commentsReceived: number;
    sharesReceived: number;
  };
  category?: string;
  isVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Component({
  selector: 'app-top-fashion-influencers',
  standalone: true,
  imports: [CommonModule, IonicModule, CarouselModule, ImageFallbackDirective],
  templateUrl: './top-fashion-influencers.component.html',
  styleUrls: ['./top-fashion-influencers.component.scss']
})
export class TopFashionInfluencersComponent implements OnInit, OnDestroy {
  topInfluencers: Influencer[] = [];
  isLoading = true;
  error: string | null = null;
  private subscription: Subscription = new Subscription();

  // Slider properties
  currentSlide = 0;
  slideOffset = 0;
  cardWidth = 200;
  visibleCards = 4;
  maxSlide = 0;
  
  // Auto-sliding properties
  autoSlideInterval: any;
  autoSlideDelay = 4500;
  isAutoSliding = true;
  isPaused = false;

  // Section interaction properties
  isSectionLiked = false;
  isSectionBookmarked = false;
  sectionLikes = 1247;
  sectionComments = 89;
  isMobile = false;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.loadInfluencers();
    this.updateResponsiveSettings();
    this.setupResizeListener();
    this.checkMobileDevice();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.stopAutoSlide();
  }

  private loadInfluencers() {
    this.isLoading = true;
    this.error = null;

    this.http.get<any>(`${environment.apiUrl}/api/v1/users/influencers`).subscribe({
      next: (response) => {
        if (response?.success && response?.data) {
          this.topInfluencers = response.data.slice(0, 8);
          this.updateSliderOnInfluencersLoad();
        } else {
          console.warn('No influencers found');
          this.topInfluencers = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading influencers:', error);
        this.topInfluencers = [];
        this.error = 'Failed to load influencers';
        this.isLoading = false;
      }
    });
  }

  onInfluencerClick(influencer: Influencer) {
    this.router.navigate(['/profile', influencer._id]);
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
    this.loadInfluencers();
  }

  trackByInfluencerId(_index: number, influencer: Influencer): string {
    return influencer._id;
  }

  // Auto-sliding methods
  private startAutoSlide() {
    if (!this.isAutoSliding || this.isPaused) return;
    
    this.stopAutoSlide();
    this.autoSlideInterval = setInterval(() => {
      if (!this.isPaused && this.topInfluencers.length > this.visibleCards) {
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

  // Responsive and slider methods
  private updateResponsiveSettings() {
    const width = window.innerWidth;

    if (width <= 768) {
      this.cardWidth = 246; // 230px card + 16px gap
      this.visibleCards = 1;
    } else if (width <= 1024) {
      this.cardWidth = 247; // 235px card + 12px gap
      this.visibleCards = 2;
    } else if (width <= 1200) {
      this.cardWidth = 252; // 238px card + 14px gap
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

  updateSliderLimits() {
    this.maxSlide = Math.max(0, this.topInfluencers.length - this.visibleCards);
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
    }, 3000);
  }

  private updateSliderOnInfluencersLoad() {
    if (this.topInfluencers.length > 0) {
      this.updateSliderLimits();
      this.currentSlide = 0;
      this.slideOffset = 0;
      this.startAutoSlide();
    }
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
    console.log('Opening comments for influencers section');
  }

  shareSection() {
    if (navigator.share) {
      navigator.share({
        title: 'Top Fashion Influencers',
        text: 'Check out these amazing fashion influencers!',
        url: window.location.href
      });
    } else {
      console.log('Sharing influencers section');
    }
  }

  openMusicPlayer() {
    console.log('Opening music player');
  }

  formatCount(count: number): string {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  }

  onFollowInfluencer(influencer: Influencer, event: Event) {
    event.stopPropagation();
    influencer.isFollowing = !influencer.isFollowing;
    console.log(`${influencer.isFollowing ? 'Following' : 'Unfollowed'} ${influencer.username}`);
  }

  private checkMobileDevice() {
    this.isMobile = window.innerWidth <= 768;
  }
}
