import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Story {
  _id: string;
  user: {
    _id: string;
    username: string;
    fullName: string;
    avatar?: string;
  };
  media: {
    type: 'image' | 'video';
    url: string;
  }[];
  viewed?: boolean;
  createdAt: Date;
}

export interface CurrentUser {
  _id: string;
  username: string;
  fullName: string;
  avatar?: string;
}

@Component({
  selector: 'app-view-add-stories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-add-stories.component.html',
  styleUrls: ['./view-add-stories.component.scss']
})
export class ViewAddStoriesComponent implements OnInit {
  @Input() stories: Story[] = [];
  @Input() showAddStory: boolean = true;
  @Input() addStoryText: string = 'Your Story';
  @Input() defaultAvatar: string = 'http://localhost:9000/uploads/avatars/default-avatar.png';
  @Input() currentUser: CurrentUser | null = null;

  @Output() storyClick = new EventEmitter<{story: Story, index: number}>();
  @Output() createStory = new EventEmitter<void>();

  ngOnInit() {
  // Component initialization
  console.log('ViewAddStories API data:', this.stories);
  }

  onStoryClick(story: Story, index: number) {
    this.storyClick.emit({ story, index });
  }

  onCreateStory() {
    this.createStory.emit();
  }

  onImageError(event: any) {
    event.target.src = this.defaultAvatar;
  }
}
