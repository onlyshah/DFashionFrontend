import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';

interface Story {
  id: string;
  thumbnailUrl: string;
  title: string;
  duration: number;
  views: number;
  status: 'active' | 'expired' | 'scheduled';
  publishDate: Date;
  expiryDate: Date;
}

@Component({
  selector: 'app-story-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatMenuModule,
    RouterModule,
    MatChipsModule
  ],
  template: `
    <div class="story-list-container">
      <header class="page-header">
        <div class="header-content">
          <h1>Stories</h1>
          <p class="subtitle">Manage your fashion stories and highlights</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" routerLink="new">
            <mat-icon>add</mat-icon>
            Create New Story
          </button>
        </div>
      </header>

      <div class="stories-grid">
        <mat-card *ngFor="let story of stories" class="story-card">
          <div class="story-thumbnail" [style.backgroundImage]="'url(' + story.thumbnailUrl + ')'">
            <mat-chip [color]="getStatusColor(story.status)" selected>
              {{ story.status }}
            </mat-chip>
          </div>
          <mat-card-content>
            <h3>{{ story.title }}</h3>
            <div class="story-metrics">
              <span class="metric">
                <mat-icon>schedule</mat-icon>
                {{ story.duration }}s
              </span>
              <span class="metric">
                <mat-icon>visibility</mat-icon>
                {{ story.views }}
              </span>
            </div>
            <div class="story-dates">
              <span class="date">Published: {{ story.publishDate | date:'short' }}</span>
              <span class="date">Expires: {{ story.expiryDate | date:'short' }}</span>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" (click)="previewStory(story)">
              <mat-icon>visibility</mat-icon>
              Preview
            </button>
            <button mat-button [matMenuTriggerFor]="menu">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item [routerLink]="['edit', story.id]">
                <mat-icon>edit</mat-icon>
                <span>Edit</span>
              </button>
              <button mat-menu-item (click)="shareStory(story)">
                <mat-icon>share</mat-icon>
                <span>Share</span>
              </button>
              <button mat-menu-item (click)="addToHighlights(story)">
                <mat-icon>stars</mat-icon>
                <span>Add to Highlights</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item color="warn" (click)="deleteStory(story)">
                <mat-icon color="warn">delete</mat-icon>
                <span class="text-warn">Delete</span>
              </button>
            </mat-menu>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .story-list-container {
      padding: 20px;
      max-width: 1600px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;

      h1 {
        margin: 0;
        font-size: 2rem;
        font-weight: 500;
      }

      .subtitle {
        margin: 4px 0 0;
        color: rgba(0, 0, 0, 0.6);
      }
    }

    .stories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .story-card {
      .story-thumbnail {
        height: 200px;
        background-size: cover;
        background-position: center;
        position: relative;
        display: flex;
        align-items: flex-start;
        justify-content: flex-end;
        padding: 12px;
      }

      h3 {
        margin: 16px 0 8px;
        font-size: 1.1rem;
        font-weight: 500;
      }
    }

    .story-metrics {
      display: flex;
      gap: 16px;
      margin-bottom: 8px;

      .metric {
        display: flex;
        align-items: center;
        gap: 4px;
        color: rgba(0, 0, 0, 0.6);
        font-size: 0.875rem;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }
    }

    .story-dates {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
    }

    .text-warn {
      color: #f44336;
    }

    @media (max-width: 600px) {
      .story-list-container {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        align-items: stretch;

        .header-actions {
          width: 100%;

          button {
            width: 100%;
          }
        }
      }

      .stories-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class StoryListComponent implements OnInit {
  stories: Story[] = [
    {
      id: '1',
      thumbnailUrl: 'assets/images/story1.jpg',
      title: 'Summer Collection Preview',
      duration: 15,
      views: 2543,
      status: 'active',
      publishDate: new Date(),
      expiryDate: new Date(Date.now() + 86400000)
    },
    {
      id: '2',
      thumbnailUrl: 'assets/images/story2.jpg',
      title: 'Behind the Scenes: Fashion Week',
      duration: 30,
      views: 1892,
      status: 'expired',
      publishDate: new Date(Date.now() - 172800000),
      expiryDate: new Date(Date.now() - 86400000)
    },
    {
      id: '3',
      thumbnailUrl: 'assets/images/story3.jpg',
      title: 'New Arrivals Sneak Peek',
      duration: 20,
      views: 0,
      status: 'scheduled',
      publishDate: new Date(Date.now() + 86400000),
      expiryDate: new Date(Date.now() + 172800000)
    }
  ];

  ngOnInit(): void {
    // TODO: Load stories from service
  }

  getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'active':
        return 'primary';
      case 'expired':
        return 'warn';
      case 'scheduled':
        return 'accent';
      default:
        return 'primary';
    }
  }

  previewStory(story: Story): void {
    // TODO: Implement preview functionality
    console.log('Preview story:', story);
  }

  shareStory(story: Story): void {
    // TODO: Implement share functionality
    console.log('Share story:', story);
  }

  addToHighlights(story: Story): void {
    // TODO: Implement add to highlights functionality
    console.log('Add to highlights:', story);
  }

  deleteStory(story: Story): void {
    // TODO: Implement delete functionality
    console.log('Delete story:', story);
  }
}