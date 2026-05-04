import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, OnChanges, SimpleChanges, OnDestroy, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-view-reels',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './view-reels.component.html',
  styleUrls: ['./view-reels.component.scss']
})
export class ViewReelsComponent implements OnChanges, OnDestroy {
  @Input() visible = false;
  @Input() reels: any[] = [];
  @Input() currentIndex = 0;
  @Output() close = new EventEmitter<void>();
  @Output() changeIndex = new EventEmitter<number>();
  @ViewChildren('reelVideo') videoPlayers!: QueryList<ElementRef<HTMLVideoElement>>;

  reelProgress = 0;
  isPaused = false;
  isDragging = false;
  private progressTimer: any = null;
  private reelTimer: any = null;
  private touchStartX = 0;

  apiUrl = environment.apiUrl;

  constructor(
    private router: Router
  ) {}

  get currentReel() {
    return this.reels?.[this.currentIndex] || null;
  }

  get hasPrevious() {
    return this.currentIndex > 0;
  }

  get hasNext() {
    return this.currentIndex < (this.reels?.length || 0) - 1;
  }

  get currentMediaUrl(): string {
    return this.currentReel?.media?.url || this.currentReel?.mediaUrl || '/uploads/default-reel.svg';
  }

  get currentMediaType(): 'image' | 'video' {
    return this.currentReel?.media?.type || this.currentReel?.mediaType || 'video';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] || changes['currentIndex'] || changes['reels']) {
      this.resetPlayback();
    }
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  onClose(): void {
    this.clearTimers();
    this.close.emit();
  }

  goPrevious(): void {
    if (this.hasPrevious) {
      this.changeIndex.emit(this.currentIndex - 1);
      this.resetPlayback();
    }
  }

  goNext(): void {
    if (this.hasNext) {
      this.changeIndex.emit(this.currentIndex + 1);
      this.resetPlayback();
    } else {
      this.onClose();
    }
  }

  onMediaLoad(): void {
    this.startPlayback();
  }

  onMediaError(event: Event): void {
    const target = event.target as HTMLImageElement | HTMLVideoElement;
    if (target) {
      (target as HTMLImageElement).src = '/uploads/default-reel.svg';
    }
  }

  onPointerDown(event: MouseEvent | PointerEvent | TouchEvent): void {
    this.isPaused = true;
    this.clearTimers();
    this.touchStartX = this.getClientX(event);
    this.pauseVideo();
  }

  onPointerUp(event: MouseEvent | PointerEvent | TouchEvent): void {
    const endX = this.getClientX(event);
    const deltaX = endX - this.touchStartX;
    this.isPaused = false;

    if (Math.abs(deltaX) > 42) {
      if (deltaX > 0) {
        this.goPrevious();
      } else {
        this.goNext();
      }
      return;
    }

    this.startPlayback();
  }

  onTapZone(side: 'left' | 'right'): void {
    if (side === 'left') {
      this.goPrevious();
    } else {
      this.goNext();
    }
  }

  togglePause(): void {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.clearTimers();
      this.pauseVideo();
    } else {
      this.startPlayback();
    }
  }

  likeReel(): void {
    if (!this.currentReel) return;
    this.currentReel.isLiked = !this.currentReel.isLiked;
    if (this.currentReel.isLiked) {
      this.currentReel.analytics.likes++;
    } else {
      this.currentReel.analytics.likes = Math.max(0, this.currentReel.analytics.likes - 1);
    }
  }

  saveReel(): void {
    if (!this.currentReel) return;
    this.currentReel.isSaved = !this.currentReel.isSaved;
  }

  commentReel(): void {
    console.log('📱 Reels: Comment on reel', this.currentReel?.id);
  }

  shareReel(): void {
    console.log('📱 Reels: Share reel', this.currentReel?.id);
  }

  private startPlayback(): void {
    if (this.currentMediaType === 'video') {
      this.playVideo();
    } else {
      // For images, auto-advance after 5 seconds
      this.reelTimer = setTimeout(() => this.goNext(), 5000);
    }
  }

  private playVideo(): void {
    const video = this.videoPlayers?.first?.nativeElement;
    if (video && !this.isPaused) {
      video.play().catch(err => console.error('Play error:', err));
      this.progressTimer = setInterval(() => {
        if (video && !this.isPaused) {
          this.reelProgress = (video.currentTime / video.duration) * 100;
          if (this.reelProgress >= 100) {
            this.reelProgress = 100;
            clearInterval(this.progressTimer);
            this.goNext();
          }
        }
      }, 100);
    }
  }

  private pauseVideo(): void {
    const video = this.videoPlayers?.first?.nativeElement;
    if (video) {
      video.pause();
    }
  }

  private resetPlayback(): void {
    this.reelProgress = 0;
    this.isPaused = false;
    this.clearTimers();
    setTimeout(() => {
      if (this.visible) {
        this.startPlayback();
      }
    }, 100);
  }

  private clearTimers(): void {
    clearInterval(this.progressTimer);
    clearTimeout(this.reelTimer);
  }

  private getClientX(event: MouseEvent | PointerEvent | TouchEvent): number {
    if (event instanceof TouchEvent) {
      return event.touches[0]?.clientX || 0;
    }
    return (event as MouseEvent | PointerEvent).clientX || 0;
  }

  formatCount(count: number): string {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  }

  getCreatorName(): string {
    return this.currentReel?.creator?.username || this.currentReel?.user?.username || 'Unknown';
  }

  getCreatorAvatar(): string {
    return this.currentReel?.creator?.avatar || this.currentReel?.user?.avatar || '/uploads/default-avatar.svg';
  }
}
