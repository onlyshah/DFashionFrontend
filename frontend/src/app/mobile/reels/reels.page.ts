import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { register } from 'swiper/element/bundle';
import { ReelsApi } from 'src/app/core/api/reels.api';

@Component({
  selector: 'app-reels',
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [NO_ERRORS_SCHEMA],
  templateUrl: './reels.page.html',
  styleUrls: ['./reels.page.scss'],
})
export class ReelsPage implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private reelsApi: ReelsApi
  ) {
    register();
  }

  @ViewChildren('videoPlayer') videoPlayers!: QueryList<ElementRef<HTMLVideoElement>>;

  reels: any[] = [];
  isLoading = true;
  currentIndex = 0;
  isPlaying: boolean[] = [];
  progress: number[] = [];

  // Swiper configuration for vertical reels
  reelsSlideOpts = {
    direction: 'vertical',
    slidesPerView: 1,
    spaceBetween: 0,
    speed: 300,
    followFinger: true,
    threshold: 50,
    longSwipesRatio: 0.1,
    longSwipesMs: 300,
    freeMode: false,
    mousewheel: {
      enabled: true,
      sensitivity: 1
    },
    keyboard: {
      enabled: true,
      onlyInViewport: true
    }
  };

  ngOnInit() {
    console.log('📱 Reels Page: Initializing...');
    this.loadReels();
  }

  ngOnDestroy() {
    // Pause all videos when leaving
    this.pauseAllVideos();
  }

  async loadReels() {
    try {
      console.log('📱 Reels: Loading reels...');
      this.isLoading = true;

      const response = await this.reelsApi.listReels().toPromise() as any;
      
      if (response.success) {
        this.reels = response.data.reels;
        this.isPlaying = new Array(this.reels.length).fill(false);
        this.progress = new Array(this.reels.length).fill(0);
        
        console.log('📱 Reels: Loaded', this.reels.length, 'reels');
        
        // Auto-play first video after a short delay
        setTimeout(() => {
          this.playVideoAtIndex(0);
        }, 500);
      } else {
        console.error('❌ Failed to load reels:', response.message);
      }
    } catch (error) {
      console.error('❌ Error loading reels:', error);
      // No mock data - only use database data
      this.reels = [];
    } finally {
      this.isLoading = false;
    }
  }

  // Removed mock data - only use database data

  onSlideChange(event: any) {
    const newIndex = event.detail[0].activeIndex;
    console.log('📱 Reels: Slide changed to index', newIndex);
    
    // Pause previous video
    this.pauseVideoAtIndex(this.currentIndex);
    
    // Update current index
    this.currentIndex = newIndex;
    
    // Play new video
    this.playVideoAtIndex(newIndex);
  }

  playVideoAtIndex(index: number) {
    if (this.videoPlayers && this.videoPlayers.toArray()[index]) {
      const video = this.videoPlayers.toArray()[index].nativeElement;
      video.currentTime = 0;
      video.play().then(() => {
        this.isPlaying[index] = true;
        console.log('📱 Reels: Playing video at index', index);
      }).catch(error => {
        console.error('❌ Error playing video:', error);
      });
    }
  }

  pauseVideoAtIndex(index: number) {
    if (this.videoPlayers && this.videoPlayers.toArray()[index]) {
      const video = this.videoPlayers.toArray()[index].nativeElement;
      video.pause();
      this.isPlaying[index] = false;
      console.log('📱 Reels: Paused video at index', index);
    }
  }

  pauseAllVideos() {
    this.videoPlayers?.forEach((videoRef, index) => {
      videoRef.nativeElement.pause();
      this.isPlaying[index] = false;
    });
  }

  togglePlayPause(video: HTMLVideoElement) {
    const index = this.getCurrentVideoIndex(video);
    if (video.paused) {
      video.play();
      this.isPlaying[index] = true;
    } else {
      video.pause();
      this.isPlaying[index] = false;
    }
  }

  onVideoLoaded(video: HTMLVideoElement, index: number) {
    console.log('📱 Reels: Video loaded at index', index);
    // Auto-play if it's the current video
    if (index === this.currentIndex) {
      this.playVideoAtIndex(index);
    }
  }

  onTimeUpdate(video: HTMLVideoElement, reel: any) {
    const index = this.getCurrentVideoIndex(video);
    if (video.duration) {
      this.progress[index] = (video.currentTime / video.duration) * 100;
    }
  }

  getCurrentVideoIndex(video: HTMLVideoElement): number {
    const videos = this.videoPlayers?.toArray() || [];
    return videos.findIndex(ref => ref.nativeElement === video);
  }

  getProgress(index: number): number {
    return this.progress[index] || 0;
  }

  // User Interactions
  onLikeReel(reel: any, index: number) {
    console.log('📱 Reels: Like reel', reel.id);
    reel.isLiked = !reel.isLiked;
    if (reel.isLiked) {
      reel.analytics.likes++;
    } else {
      reel.analytics.likes = Math.max(0, reel.analytics.likes - 1);
    }
  }

  onCommentReel(reel: any) {
    console.log('📱 Reels: Comment on reel', reel.id);
    // Navigate to comments or open comments modal
  }

  onShareReel(reel: any) {
    console.log('📱 Reels: Share reel', reel.id);
    // Open share options
  }

  onSaveReel(reel: any, index: number) {
    console.log('📱 Reels: Save reel', reel.id);
    reel.isSaved = !reel.isSaved;
    if (reel.isSaved) {
      reel.analytics.saves++;
    } else {
      reel.analytics.saves = Math.max(0, reel.analytics.saves - 1);
    }
  }

  onUserClick(user: any) {
    console.log('📱 Reels: User clicked', user.username);
    // Navigate to user profile
  }

  onFollowUser(user: any, event: Event) {
    event.stopPropagation();
    console.log('📱 Reels: Follow user', user.username);
    user.isFollowing = !user.isFollowing;
  }

  onProductClick(product: any) {
    console.log('📱 Reels: Product clicked', product.name);
    // Navigate to product detail
  }

  onHashtagClick(hashtag: string) {
    console.log('📱 Reels: Hashtag clicked', hashtag);
    // Navigate to hashtag feed
  }

  onMoreOptions(reel: any) {
    console.log('📱 Reels: More options for reel', reel.id);
    // Open action sheet with options
  }

  onCameraClick() {
    console.log('📱 Reels: Camera clicked');
    // Navigate to create reel
  }

  onCreateReel() {
    console.log('📱 Reels: Create reel clicked');
    // Navigate to create reel
  }

  formatCount(count: number): string {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  }

  formatCaption(caption: string): string {
    // Convert hashtags and mentions to clickable elements
    return caption
      .replace(/#(\w+)/g, '<span class="hashtag-link">#$1</span>')
      .replace(/@(\w+)/g, '<span class="mention-link">@$1</span>');
  }
}
