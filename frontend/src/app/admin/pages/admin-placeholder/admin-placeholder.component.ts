import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-admin-placeholder',
  templateUrl: './admin-placeholder.component.html',
  styleUrls: ['./admin-placeholder.component.scss']
})
export class AdminPlaceholderComponent {
  title = 'Admin Page';
  path = '';
  team: any[] = [];

  constructor(private route: ActivatedRoute, private router: Router, private api: AdminApiService) {
    const dataTitle = this.route.snapshot.data?.['title'];
    this.title = dataTitle || this.title;
    this.path = this.route.snapshot.url.map(s => s.path).join('/');
  }

  ngOnInit(): void {
    this.loadTeamData();
  }

  private loadTeamData(): void {
    // Load real team members data from backend
    this.api.get('/team').subscribe({
      next: (resp: any) => {
        if (resp && resp.data && Array.isArray(resp.data)) {
          this.team = resp.data;
        } else {
          this.team = [];
        }
      },
      error: (err) => {
        console.error('Failed to load team members:', err);
        this.team = [];
      }
    });
  }

  goToOverview(): void {
    this.router.navigate(['/admin/overview']);
  }
}
