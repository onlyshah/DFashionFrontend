import { Component, AfterViewInit, OnDestroy, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PostService } from '../../../../../../core/services/post.service';
import { StoryService } from '../../../../../../core/services/story.service';
import { ViewStoriesComponent } from '../view-stories/view-stories.component';
import { environment } from 'src/environments/environment';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-story-tray',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, ViewStoriesComponent],
  templateUrl: './story-tray.component.html',
  styleUrls: ['./story-tray.component.scss']
})
export class StoryTrayComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('storiesContainer', { static: false }) storiesContainer!: ElementRef<HTMLDivElement>;
  @Input() stories: any[] = [];
  @Input() showAddStory = true;
  @Input() addStoryText = 'Your Story';

  itemsPerPage = 6;
  currentPage = 0;
  @Input() currentUser: any = null;

  imageUrl = environment.apiUrl;
  canScrollLeft = false;
  canScrollRight = false;
  isDragging = false;
  dragStartX = 0;
  scrollStartX = 0;
  viewerVisible = false;
  viewerIndex = 0;
  @Output() createStory = new EventEmitter<void>();

  posts: any[] = [];
  loading = true;
  storyLoading = true;
  page = 1;
  hasMore = true;

  apiUrl = environment.apiUrl;

  refreshSub?: Subscription;
  private seenStoryIds = new Set<string>();

  constructor(
    private storyService: StoryService,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    this.loadStories();
    this.loadPosts();

    // refresh feed every 10 seconds for near-real-time experience
    this.refreshSub = interval(10000).subscribe(() => {
      this.loadStories();
      this.loadPosts(false);
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.updateScrollButtons(), 0);
  }

  onCreateStory(): void {
    this.createStory.emit();
  }

  onStoryClick(story: any, index: number, isOwn = false): void {
    const storyId = story?._id || story?.id;
    if (storyId) {
      this.markStoryViewed(storyId);
      this.seenStoryIds.add(storyId);
      this.stories = this.stories.map(item => {
        const itemId = item?._id || item?.id;
        return itemId === storyId ? { ...item, is_seen: true, unseen: false } : item;
      });
    }
    this.viewerIndex = index;
    this.viewerVisible = true;
  }

  scrollLeft(): void {
    if (!this.storiesContainer) return;
    const container = this.storiesContainer.nativeElement;
    const step = Math.floor(container.clientWidth * 0.8);
    container.scrollBy({ left: -step, behavior: 'smooth' });
    setTimeout(() => this.updateScrollButtons(), 220);
  }

  scrollRight(): void {
    if (!this.storiesContainer) return;
    const container = this.storiesContainer.nativeElement;
    const step = Math.floor(container.clientWidth * 0.8);
    container.scrollBy({ left: step, behavior: 'smooth' });
    setTimeout(() => this.updateScrollButtons(), 220);
  }

  onStoryScroll(): void {
    this.updateScrollButtons();
  }

  startDrag(event: PointerEvent): void {
    if (!this.storiesContainer) return;
    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.scrollStartX = this.storiesContainer.nativeElement.scrollLeft;
    this.storiesContainer.nativeElement.setPointerCapture(event.pointerId);
  }

  onDrag(event: PointerEvent): void {
    if (!this.isDragging || !this.storiesContainer) return;
    const delta = this.dragStartX - event.clientX;
    // Only scroll if moved more than 5px (to distinguish from clicks)
    if (Math.abs(delta) > 5) {
      this.storiesContainer.nativeElement.scrollLeft = this.scrollStartX + delta;
      this.updateScrollButtons();
    }
  }

  endDrag(): void {
    console.log('Drag ended');
    this.isDragging = false;
  }

  updateScrollButtons(): void {
    if (!this.storiesContainer) return;
    const container = this.storiesContainer.nativeElement;
    this.canScrollLeft = container.scrollLeft > 8;
    this.canScrollRight = container.scrollLeft + container.clientWidth < container.scrollWidth - 8;
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }

  loadStories(): void {
    if (this.stories && this.stories.length > 0) {
      this.storyLoading = false;
      return;
    }

    this.storyLoading = true;
    this.storyService.getStories(1, 20).subscribe({
      next: (res: any) => {
        const stories = res?.stories || res?.data || [];
        this.stories = stories.map((story: any) => this.normalizeStory(story));
        this.seenStoryIds = new Set(this.stories.filter((story: any) => this.isStorySeen(story)).map((story: any) => story._id || story.id));
        this.storyLoading = false;
        setTimeout(() => this.updateScrollButtons(), 0);
      },
      error: () => {
        this.stories = [];
        this.storyLoading = false;
      }
    });
  }

  loadPosts(reset = true): void {
    if (reset) {
      this.page = 1;
      this.hasMore = true;
      this.posts = [];
    }

    this.loading = true;
    this.postService.getPosts(this.page, 10).subscribe({
      next: (res: any) => {
        const newPosts = (res.posts || []).map((post: any) => ({
          ...post,
          user: post.user || { username: 'Unknown', avatar: `${environment.apiUrl}/uploads/avatars/default-avatar.svg` },
          mediaType: post.media?.[0]?.type || 'image',
          mediaUrl: post.media?.[0]?.url ? `${environment.apiUrl}${post.media[0].url}` : '/uploads/default-post.jpg',
          likes: Array.isArray(post.likes) ? post.likes.length : (typeof post.likes === 'number' ? post.likes : 0),
          commentsCount: Array.isArray(post.comments) ? post.comments.length : (post.commentsCount || 0)
        }));

        this.posts = reset ? newPosts : [...this.posts, ...newPosts];
        this.hasMore = newPosts.length >= 10;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadMore(): void {
    if (!this.hasMore || this.loading) return;
    this.page++;
    this.loadPosts(false);
  }

  closeViewer(): void {
    this.viewerVisible = false;
  }

  changeViewerIndex(index: number): void {
    this.viewerIndex = index;
    const story = this.stories?.[index];
    const storyId = story?._id || story?.id;
    if (storyId) {
      this.markStoryViewed(storyId);
      this.seenStoryIds.add(storyId);
    }
  }

  toggleLike(post: any): void {
    this.postService.likePost(post._id).subscribe({
      next: (res: any) => {
        post.isLiked = !post.isLiked;
        post.likes = res.likesCount ?? post.likes + (post.isLiked ? 1 : -1);
      }
    });
  }

  openStory(story: any, isOwn = false): void {
    // This method handles API calls and story analytics only.
    // The actual viewer modal opens in onStoryClick().
    console.log('Story clicked - API call and additional logic here');
    if (!story) {
      return;
    }

    // Mark story as viewed (API call)
    this.markStoryViewed(story._id);
  }

  isStorySeen(story: any): boolean {
    const storyId = story?._id || story?.id;
    return !!storyId && (story?.is_seen === true || story?.unseen === false || this.seenStoryIds.has(storyId));
  }

  private normalizeStory(story: any): any {
    const storyId = story?._id || story?.id;
    const media = story?.media || {};
    const mediaUrl = media?.url || story?.mediaUrl || story?.media_url || '/uploads/default-story.svg';
    const mediaType = media?.type || story?.mediaType || story?.media_type || (String(mediaUrl).match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image');
    return {
      ...story,
      _id: storyId,
      id: storyId,
      media: {
        type: mediaType,
        url: mediaUrl,
        thumbnail: media?.thumbnail || story?.thumbnailUrl || story?.thumbnail_url || null,
        duration: media?.duration || story?.duration || null
      },
      mediaUrl,
      mediaType,
      productId: story?.productId || story?.product_id || story?.products?.[0]?.product?._id || null,
      product_id: story?.productId || story?.product_id || story?.products?.[0]?.product?._id || null,
      user: {
        ...(story?.user || {}),
        avatar: story?.user?.avatar || `${environment.apiUrl}/uploads/avatars/default-avatar.svg`
      },
      is_seen: story?.is_seen === true || story?.unseen === false,
      unseen: story?.unseen !== undefined ? story.unseen : !(story?.is_seen === true)
    };
  }

  private markStoryViewed(storyId: string) {
    this.storyService.viewStory(storyId).subscribe({
      next: () => {},
      error: () => {}
    });
  }

  getTimeAgo(dateStr: string | Date): string {
    if (!dateStr) return 'now';
    const date = new Date(dateStr);
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s`; if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`; return `${Math.floor(diff / 86400)}d`;
  }
}
