import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-social-reported-content',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatProgressSpinnerModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Reported Content</h1>
        <p>Review and manage reported social content</p>
      </div>
      <mat-card *ngIf="loading" class="loading-card">
        <mat-spinner></mat-spinner>
      </mat-card>
      <mat-card *ngIf="!loading && reports.length > 0">
        <mat-card-content>
          <table>
            <thead>
              <tr>
                <th>Content Type</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Reporter</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let report of reports">
                <td>{{ report.content_type }}</td>
                <td>{{ report.report_reason }}</td>
                <td>{{ report.status }}</td>
                <td>{{ report.reporter?.name || 'Unknown' }}</td>
              </tr>
            </tbody>
          </table>
        </mat-card-content>
      </mat-card>
      <mat-card *ngIf="!loading && reports.length === 0">
        <mat-card-content>
          <div class="empty-state">
            <mat-icon>flag</mat-icon>
            <p>No Reported Content</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`.page-container { padding: 24px; } .page-header { margin-bottom: 24px; } .page-header h1 { margin: 0 0 8px 0; font-size: 28px; font-weight: 500; } .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; } table { width: 100%; border-collapse: collapse; } th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; } .loading-card { display: flex; justify-content: center; padding: 40px; }`]
})
export class SocialReportedContentComponent implements OnInit {
  reports: any[] = [];
  loading = true;

  constructor(private api: AdminApiService) {}

  ngOnInit(): void {
    this.loadReported();
  }

  loadReported(): void {
    this.loading = true;
    console.log('📡 [Reported] Calling GET /api/admin/social/reported');
    this.api.get('/social/reported', { params: { page: 1, limit: 20, status: 'pending' } }).subscribe({
      next: (res: any) => {
        console.log('✅ [Reported] Full API Response:', res);
        console.log('✅ [Reported] Data:', res?.data);
        this.reports = res?.data || [];
        console.log('✅ [Reported] Loaded', this.reports.length, 'reports');
        this.loading = false;
      },
      error: (err: any) => {
        console.error('❌ [Reported] Error:', err);
        this.reports = [];
        this.loading = false;
      }
    });
  }
}
