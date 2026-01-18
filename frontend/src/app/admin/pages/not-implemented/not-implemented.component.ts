import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  selector: 'app-not-implemented',
  templateUrl: './not-implemented.component.html',
  styleUrls: ['./not-implemented.component.scss']
})
export class NotImplementedComponent implements OnInit {
  title = 'Feature';
  actions: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: AdminApiService
  ) {}

  ngOnInit(): void {
    const dataTitle = this.route.snapshot.data?.['title'];
    this.title = dataTitle || this.title;

    // Load quick actions to ensure the page shows real data
    this.api.get('/demo/quick-actions').subscribe({
      next: (resp: any) => {
        if (resp && resp.data) {
          this.actions = resp.data;
        }
      },
      error: (err) => {
        console.error('Failed to load quick actions:', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/overview']);
  }
}
