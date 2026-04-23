import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, OnChanges, SimpleChanges, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { CartService } from '../../../../../../core/services/cart.service';
import { WishlistService } from '../../../../../../core/services/wishlist.service';
import { StoryService } from '../../../../../../core/services/story.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-view-stories',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './view-stories.component.html',
  styleUrls: ['./view-stories.component.scss']
})
export class ViewStoriesComponent implements OnChanges, OnDestroy {
  @Input() visible = false;
  @Input() stories: any[] = [];
  @Input() currentIndex = 0;
  @Output() close = new EventEmitter<void>();
  @Output() changeIndex = new EventEmitter<number>();
  @ViewChild('storyVideo') storyVideo?: ElementRef<HTMLVideoElement>;

  storyProgress = 0;
  isPaused = false;
  isDragging = false;
  private progressTimer: any = null;
  private storyTimer: any = null;
  private touchStartX = 0;
  private lastViewedStoryId: string | null = null;

  constructor(
    private router: Router,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private storyService: StoryService
  ) {}

  get currentStory() {
    return this.stories?.[this.currentIndex] || null;
  }

  get hasPrevious() {
    return this.currentIndex > 0;
  }

  get hasNext() {
    return this.currentIndex < (this.stories?.length || 0) - 1;
  }

  get currentMediaUrl(): string {
    return this.currentStory?.media?.url || this.currentStory?.mediaUrl || '/uploads/default-story.svg';
  }

  get currentMediaType(): 'image' | 'video' {
    return this.currentStory?.media?.type || this.currentStory?.mediaType || 'image';
  }

  get currentProductId(): string | null {
    return this.currentStory?.productId || this.currentStory?.product_id || this.currentStory?.products?.[0]?.product?._id || this.currentStory?.products?.[0]?.product?.id || null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] || changes['currentIndex'] || changes['stories']) {
      this.resetPlayback();
    }
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  onClose(): void {
    this.close.emit();
  }

  goPrevious(): void {
    if (this.hasPrevious) {
      this.changeIndex.emit(this.currentIndex - 1);
    }
  }

  goNext(): void {
    if (this.hasNext) {
      this.changeIndex.emit(this.currentIndex + 1);
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
      (target as HTMLImageElement).src = '/uploads/default-story.svg';
    }
  }

  onPointerDown(event: MouseEvent | PointerEvent | TouchEvent): void {
    this.isPaused = true;
    this.clearTimers();
    this.touchStartX = this.getClientX(event);
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

  likeStory(): void {
    const storyId = this.currentStory?._id || this.currentStory?.id;
    if (!storyId) return;
    this.storyService.likeStory(storyId).subscribe({
      next: () => {
        this.currentStory.isLiked = !this.currentStory.isLiked;
        this.currentStory.analytics = this.currentStory.analytics || {};
        this.currentStory.analytics.likes = Math.max(0, (this.currentStory.analytics.likes || 0) + (this.currentStory.isLiked ? 1 : -1));
      },
      error: () => {}
    });
  }

  shareStory(): void {
    const storyId = this.currentStory?._id || this.currentStory?.id;
    if (!storyId) return;

    const url = `${window.location.origin}/stories/${storyId}`;
    if (navigator.share) {
      navigator.share({ title: 'DFashion Story', url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url).catch(() => {});
    }

    this.storyService.shareStory(storyId).subscribe({ error: () => {} });
  }

  commentStory(): void {
    const storyId = this.currentStory?._id || this.currentStory?.id;
    if (!storyId) return;
    const text = window.prompt('Reply to story');
    if (!text?.trim()) return;
    this.storyService.commentOnStory(storyId, text.trim()).subscribe({ error: () => {} });
  }

  addToCart(): void {
    const productId = this.currentProductId;
    if (!productId) return;
    this.cartService.addToCart(productId, 1).subscribe({ error: () => {} });
  }

  toggleWishlist(): void {
    const productId = this.currentProductId;
    if (!productId) return;
    this.wishlistService.toggleWishlist(productId).subscribe({ error: () => {} });
  }

  buyNow(): void {
    const productId = this.currentProductId;
    if (!productId) return;
    this.router.navigate(['/products', productId], { queryParams: { from: 'story' } });
  }

  openProduct(): void {
    this.buyNow();
  }

  getViewerUserAvatar(): string {
    return this.currentStory?.user?.avatar || `${environment.apiUrl}/uploads/avatars/default-avatar.svg`;
  }

  getStoryDurationMs(): number {
    const duration = Number(this.currentStory?.media?.duration || this.currentStory?.duration || 0);
    if (this.currentMediaType === 'video') {
      return duration > 0 ? duration * 1000 : 7000;
    }
    return duration > 0 ? duration * 1000 : 5000;
  }

  private resetPlayback(): void {
    this.clearTimers();
    this.storyProgress = 0;
    this.lastViewedStoryId = null;
    if (this.visible && this.currentStory) {
      queueMicrotask(() => this.startPlayback());
    }
  }

  private startPlayback(): void {
    if (!this.visible || !this.currentStory || this.isPaused) return;

    const storyId = this.currentStory._id || this.currentStory.id;
    if (storyId && storyId !== this.lastViewedStoryId) {
      this.lastViewedStoryId = storyId;
      this.storyService.viewStory(storyId).subscribe({ error: () => {} });
    }

    this.clearTimers();
    this.storyProgress = 0;

    if (this.currentMediaType === 'video') {
      this.playVideo();
    }

    const durationMs = this.getStoryDurationMs();
    const startedAt = Date.now();

    this.progressTimer = setInterval(() => {
      if (this.isPaused) return;
      const elapsed = Date.now() - startedAt;
      this.storyProgress = Math.min(100, (elapsed / durationMs) * 100);
      if (this.storyProgress >= 100) {
        this.clearTimers();
        this.goNext();
      }
    }, 50);
  }

  private playVideo(): void {
    const video = this.storyVideo?.nativeElement;
    if (!video) return;
    video.currentTime = 0;
    video.muted = true;
    video.play().catch(() => {});
  }

  private pauseVideo(): void {
    const video = this.storyVideo?.nativeElement;
    video?.pause();
  }

  private clearTimers(): void {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
    if (this.storyTimer) {
      clearTimeout(this.storyTimer);
      this.storyTimer = null;
    }
  }

  private getClientX(event: MouseEvent | PointerEvent | TouchEvent): number {
    if ('touches' in event && event.touches?.length) {
      return event.touches[0].clientX;
    }
    if ('changedTouches' in event && event.changedTouches?.length) {
      return event.changedTouches[0].clientX;
    }
    return (event as PointerEvent | MouseEvent).clientX || 0;
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.visible) return;
    if (event.key === 'ArrowLeft') {
      this.goPrevious();
    } else if (event.key === 'ArrowRight') {
      this.goNext();
    } else if (event.key === 'Escape') {
      this.onClose();
    } else if (event.key === ' ') {
      event.preventDefault();
      this.togglePause();
    }
  }
}
