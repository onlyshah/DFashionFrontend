import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminApiService } from '../../services/admin-api.service';
import { BlogPostDialogComponent } from './blog-post-dialog.component';

@Component({
  selector: 'app-blog-posts',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatPaginatorModule, 
    MatSortModule, 
    MatProgressSpinnerModule, 
    MatButtonModule, 
    MatIconModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './blog-posts.component.html',
  styleUrls: ['./blog-posts.component.scss']
})
export class BlogPostsComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  private destroy$ = new Subject<void>();
  
  displayedColumns = ['title', 'author', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  isLoading = false;

  constructor(
    private api: AdminApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void { 
    this.load(); 
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.isLoading = true;
    this.api.get('/content/blogs')
      .pipe(takeUntil(this.destroy$))
      .subscribe({ 
        next: (r: any) => { 
          this.dataSource.data = r?.data || []; 
          this.isLoading = false; 
        }, 
        error: (err) => { 
          console.error('Error loading blog posts:', err);
          this.dataSource.data = []; 
          this.isLoading = false;
          this.snackBar.open('Failed to load blog posts', 'Close', { duration: 3000 });
        } 
      });
  }

  applyFilter(e: any): void { 
    this.dataSource.filter = e.target.value.trim().toLowerCase(); 
  }

  openBlogDialog(blog?: any): void {
    const dialogRef = this.dialog.open(BlogPostDialogComponent, {
      width: '700px',
      data: blog || null,
      disableClose: false
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          if (blog) {
            this.updateBlogPost(blog._id, result);
          } else {
            this.createBlogPost(result);
          }
        }
      });
  }

  createBlogPost(formData: any): void {
    this.isLoading = true;
    this.api.post('/content/blogs', formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.snackBar.open('Blog post created successfully', 'Close', { duration: 3000 });
          this.load();
        },
        error: (err) => {
          console.error('Error creating blog post:', err);
          this.isLoading = false;
          this.snackBar.open(err.error?.message || 'Failed to create blog post', 'Close', { duration: 3000 });
        }
      });
  }

  updateBlogPost(id: string, formData: any): void {
    this.isLoading = true;
    this.api.put(`/content/blogs/${id}`, formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.snackBar.open('Blog post updated successfully', 'Close', { duration: 3000 });
          this.load();
        },
        error: (err) => {
          console.error('Error updating blog post:', err);
          this.isLoading = false;
          this.snackBar.open(err.error?.message || 'Failed to update blog post', 'Close', { duration: 3000 });
        }
      });
  }
  
  delete(id: string): void {
    if (confirm('Delete this blog post? This action cannot be undone.')) {
      this.isLoading = true;
      this.api.delete(`/content/blogs/${id}`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({ 
          next: () => {
            this.snackBar.open('Blog post deleted successfully', 'Close', { duration: 3000 });
            this.load();
          }, 
          error: (err) => {
            console.error('Error deleting blog post:', err);
            this.isLoading = false;
            this.snackBar.open(err.error?.message || 'Failed to delete blog post', 'Close', { duration: 3000 });
          }
        });
    }
  }
}
