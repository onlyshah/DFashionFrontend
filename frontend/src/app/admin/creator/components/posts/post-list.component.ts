import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';

interface Post {
  id: string;
  title: string;
  status: 'published' | 'draft' | 'scheduled';
  category: string;
  publishDate: Date;
  likes: number;
  comments: number;
  shares: number;
}

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatMenuModule,
    RouterModule
  ],
  template: `
    <div class="post-list-container">
      <header class="page-header">
        <div class="header-content">
          <h1>Posts</h1>
          <p class="subtitle">Manage your blog posts and articles</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" routerLink="new">
            <mat-icon>add</mat-icon>
            Create New Post
          </button>
        </div>
      </header>

      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="posts" class="posts-table">
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Title</th>
              <td mat-cell *matCellDef="let post">
                <div class="title-cell">
                  <span class="post-title">{{ post.title }}</span>
                  <span class="post-category">{{ post.category }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let post">
                <mat-chip [color]="getStatusColor(post.status)" selected>
                  {{ post.status }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="publishDate">
              <th mat-header-cell *matHeaderCellDef>Published</th>
              <td mat-cell *matCellDef="let post">
                {{ post.publishDate | date:'medium' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="engagement">
              <th mat-header-cell *matHeaderCellDef>Engagement</th>
              <td mat-cell *matCellDef="let post">
                <div class="engagement-metrics">
                  <span class="metric">
                    <mat-icon>thumb_up</mat-icon>
                    {{ post.likes }}
                  </span>
                  <span class="metric">
                    <mat-icon>comment</mat-icon>
                    {{ post.comments }}
                  </span>
                  <span class="metric">
                    <mat-icon>share</mat-icon>
                    {{ post.shares }}
                  </span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let post">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item [routerLink]="['edit', post.id]">
                    <mat-icon>edit</mat-icon>
                    <span>Edit</span>
                  </button>
                  <button mat-menu-item (click)="previewPost(post)">
                    <mat-icon>visibility</mat-icon>
                    <span>Preview</span>
                  </button>
                  <button mat-menu-item (click)="sharePost(post)">
                    <mat-icon>share</mat-icon>
                    <span>Share</span>
                  </button>
                  <mat-divider></mat-divider>
                  <button mat-menu-item color="warn" (click)="deletePost(post)">
                    <mat-icon color="warn">delete</mat-icon>
                    <span class="text-warn">Delete</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .post-list-container {
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

    .posts-table {
      width: 100%;
    }

    .title-cell {
      display: flex;
      flex-direction: column;

      .post-title {
        font-weight: 500;
      }

      .post-category {
        font-size: 0.875rem;
        color: rgba(0, 0, 0, 0.6);
      }
    }

    .engagement-metrics {
      display: flex;
      gap: 16px;

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

    .text-warn {
      color: #f44336;
    }

    @media (max-width: 600px) {
      .post-list-container {
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

      .engagement-metrics {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
})
export class PostListComponent implements OnInit {
  displayedColumns = ['title', 'status', 'publishDate', 'engagement', 'actions'];

  posts: Post[] = [
    {
      id: '1',
      title: 'Summer Fashion Trends 2023',
      status: 'published',
      category: 'Fashion Trends',
      publishDate: new Date(),
      likes: 1234,
      comments: 89,
      shares: 45
    },
    {
      id: '2',
      title: 'Sustainable Fashion Guide',
      status: 'draft',
      category: 'Sustainability',
      publishDate: new Date(),
      likes: 0,
      comments: 0,
      shares: 0
    },
    {
      id: '3',
      title: 'Designer Spotlight: New Collection',
      status: 'scheduled',
      category: 'Designer Focus',
      publishDate: new Date(Date.now() + 86400000),
      likes: 0,
      comments: 0,
      shares: 0
    }
  ];

  ngOnInit(): void {
    // TODO: Load posts from service
  }

  getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'published':
        return 'primary';
      case 'draft':
        return 'accent';
      case 'scheduled':
        return 'warn';
      default:
        return 'primary';
    }
  }

  previewPost(post: Post): void {
    // TODO: Implement preview functionality
    console.log('Preview post:', post);
  }

  sharePost(post: Post): void {
    // TODO: Implement share functionality
    console.log('Share post:', post);
  }

  deletePost(post: Post): void {
    // TODO: Implement delete functionality
    console.log('Delete post:', post);
  }
}