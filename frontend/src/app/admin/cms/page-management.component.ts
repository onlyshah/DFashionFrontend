import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminApiService } from '../services/admin-api.service';
import { AdminAuthService } from '../services/admin-auth.service';

export interface Page {
  _id: string;
  title: string;
  slug: string;
  content: string;
  description: string;
  featuredImage?: string;
  status: 'draft' | 'published';
  author: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-page-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatTooltipModule
  ],
  templateUrl: './page-management.component.html',
  styleUrls: ['./page-management.component.scss']
})
export class PageManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  pages: Page[] = [];
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
    this.loadPages();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkPermissions(): void {
    this.canCreate = this.authService.hasPermission('content', 'create');
    this.canEdit = this.authService.hasPermission('content', 'edit');
    this.canDelete = this.authService.hasPermission('content', 'delete');
  }

  loadPages(): void {
    this.isLoading = true;
    const params: any = {};
    if (this.searchQuery) params.search = this.searchQuery;
    if (this.filterStatus) params.status = this.filterStatus;

    this.apiService.get('/cms/pages', { params }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: any) => {
        this.pages = response.data?.pages || [];
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Failed to load pages:', error);
        this.snackBar.open('Failed to load pages', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  createPage(): void {
    this.snackBar.open('Page creation coming soon', 'Close', { duration: 3000 });
  }

  editPage(page: Page): void {
    this.snackBar.open('Page edit coming soon', 'Close', { duration: 3000 });
  }

  deletePage(pageId: string): void {
    if (!confirm('Are you sure you want to delete this page?')) return;
    
    this.isLoading = true;
    this.apiService.delete(`/cms/pages/${pageId}`).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.snackBar.open('Page deleted successfully', 'Close', { duration: 3000 });
        this.loadPages();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Failed to delete page:', error);
        this.snackBar.open('Failed to delete page', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }
}
