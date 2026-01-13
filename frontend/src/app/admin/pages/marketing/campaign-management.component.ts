import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminApiService } from '../../services/admin-api.service';
import { AdminAuthService } from '../../services/admin-auth.service';

export interface Campaign {
  _id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  status: 'planning' | 'active' | 'completed';
  channels: string[];
  metrics?: { impressions: number; clicks: number; conversions: number };
  createdAt: string;
}

@Component({
  selector: 'app-campaign-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule
  ],
  templateUrl: './campaign-management.component.html',
  styleUrls: ['./campaign-management.component.scss']
})
export class CampaignManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  campaigns: Campaign[] = [];
  isLoading = false;
  searchQuery = '';
  filterStatus = '';
  canCreate = false;
  canEdit = false;
  canDelete = false;

  constructor(
    private apiService: AdminApiService,
    private authService: AdminAuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.checkPermissions();
    this.loadCampaigns();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkPermissions(): void {
    this.canCreate = this.authService.hasPermission('marketing', 'create');
    this.canEdit = this.authService.hasPermission('marketing', 'edit');
    this.canDelete = this.authService.hasPermission('marketing', 'delete');
  }

  loadCampaigns(): void {
    this.isLoading = true;
    const params: any = {};
    if (this.searchQuery) params.search = this.searchQuery;
    if (this.filterStatus) params.status = this.filterStatus;

    this.apiService.get('/marketing/campaigns', { params }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: any) => {
        this.campaigns = response.data?.campaigns || response.data || [];
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Failed to load campaigns:', error);
        this.snackBar.open('Failed to load campaigns', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  createCampaign(): void {
    this.snackBar.open('Campaign creation coming soon', 'Close', { duration: 3000 });
  }

  editCampaign(campaign: Campaign): void {
    this.snackBar.open('Campaign edit coming soon', 'Close', { duration: 3000 });
  }

  deleteCampaign(campaignId: string): void {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    
    this.isLoading = true;
    this.apiService.delete(`/marketing/campaigns/${campaignId}`).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.snackBar.open('Campaign deleted successfully', 'Close', { duration: 3000 });
        this.loadCampaigns();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Failed to delete campaign:', error);
        this.snackBar.open('Failed to delete campaign', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }
}
