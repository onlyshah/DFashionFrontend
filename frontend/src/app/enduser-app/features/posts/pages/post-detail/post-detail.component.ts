import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-post-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="post-detail-container">
      <h1>Post Detail</h1>
      <p>Post detail page coming soon...</p>
    </div>
  `,
  styles: [`
    .post-detail-container {
      padding: 20px;
    }
  `]
})
export class PostDetailPageComponent implements OnInit {
  ngOnInit() {
    // TODO: Load post details
  }
}
