import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-admin-placeholder',
  template: `
    <div class="admin-placeholder">
      <h2>{{ title }}</h2>
      <p>This is a placeholder admin page for <strong>{{ path }}</strong>.</p>
    </div>
  `,
  styles: [
    `.admin-placeholder { padding: 24px; }`,
  ]
})
export class AdminPlaceholderComponent {
  title = 'Admin Page';
  path = '';
  constructor(private route: ActivatedRoute) {
    const dataTitle = this.route.snapshot.data?.['title'];
    this.title = dataTitle || this.title;
    this.path = this.route.snapshot.url.map(s => s.path).join('/');
  }
}
