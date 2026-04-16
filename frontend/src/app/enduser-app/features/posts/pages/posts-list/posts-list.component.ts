import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="posts-list-container">
      <h1>Posts</h1>
      <p>Posts list page coming soon...</p>
    </div>
  `,
  styles: [`
    .posts-list-container {
      padding: 20px;
    }
  `]
})
export class PostsListComponent implements OnInit {
  ngOnInit() {
    // TODO: Load posts
  }
}
