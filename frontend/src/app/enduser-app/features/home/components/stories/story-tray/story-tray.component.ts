import { Component, OnDestroy, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PostService } from '../../../../../../core/services/post.service';
import { StoryService } from '../../../../../../core/services/story.service';
import { environment } from 'src/environments/environment';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-story-tray',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './story-tray.component.html',
  styleUrls: ['./story-tray.component.scss']
})
export class StoryTrayComponent implements OnInit, OnDestroy {
  @ViewChild('storiesContainer', { static: false }) storiesContainer!: ElementRef<HTMLDivElement>;
  @Input() stories: any[] = [];
  @Input() showAddStory = true;
  @Input() addStoryText = 'Your Story';

  itemsPerPage = 6;
  currentPage = 0;
  @Input() currentUser: any = null;
  @Output() storyClick = new EventEmitter<any>();
  @Output() createStory = new EventEmitter<void>();

  posts: any[] = [];
  loading = true;
  storyLoading = true;
  page = 1;
  hasMore = true;

  apiUrl = environment.apiUrl;

  refreshSub?: Subscription;

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

  onCreateStory(): void {
    this.createStory.emit();
  }

  onStoryClick(story: any, index: number): void {
    this.storyClick.emit({ story, index });
    this.openStory(story);
  }

  scrollLeft(): void {
    if (!this.storiesContainer) return;
    const container = this.storiesContainer.nativeElement;
    const step = Math.floor(container.clientWidth);
    this.currentPage = Math.max(0, this.currentPage - 1);
    container.scrollBy({ left: -step, behavior: 'smooth' });
  }

  scrollRight(): void {
    if (!this.storiesContainer) return;
    const container = this.storiesContainer.nativeElement;
    const step = Math.floor(container.clientWidth);
    this.currentPage = Math.min(Math.ceil(this.stories.length / this.itemsPerPage) - 1, this.currentPage + 1);
    container.scrollBy({ left: step, behavior: 'smooth' });
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
        this.stories = res.stories || [];
        this.storyLoading = false;
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
          mediaUrl: post.media?.[0]?.url ? `${environment.apiUrl}${post.media[0].url}` : '/assets/default-post.jpg',
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

  toggleLike(post: any): void {
    this.postService.likePost(post._id).subscribe({
      next: (res: any) => {
        post.isLiked = !post.isLiked;
        post.likes = res.likesCount ?? post.likes + (post.isLiked ? 1 : -1);
      }
    });
  }

  openStory(story: any): void {
    this.storyService.viewStory(story._id).subscribe();
    this.storyClick.emit({ story });
    window.alert(`Open story for ${story.user?.username || 'unknown'}`);
  }

  getTimeAgo(dateStr: string | Date): string {
    if (!dateStr) return 'now';
    const date = new Date(dateStr);
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s`; if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`; return `${Math.floor(diff / 86400)}d`;
  }
}
