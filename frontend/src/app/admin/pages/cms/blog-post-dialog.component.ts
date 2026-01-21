import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-blog-post-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <div class="blog-dialog">
      <h2 mat-dialog-title>{{ data ? 'Edit Blog Post' : 'Create Blog Post' }}</h2>
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-dialog-content>
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Title</mat-label>
            <input matInput formControlName="title" placeholder="Enter blog title" required>
            <mat-error *ngIf="form.get('title')?.hasError('required')">Title is required</mat-error>
            <mat-error *ngIf="form.get('title')?.hasError('minlength')">Title must be at least 5 characters</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Author</mat-label>
            <input matInput formControlName="author" placeholder="Author name">
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Content</mat-label>
            <textarea matInput 
              formControlName="content" 
              placeholder="Write your blog content here..." 
              rows="8"
              required></textarea>
            <mat-error *ngIf="form.get('content')?.hasError('required')">Content is required</mat-error>
            <mat-error *ngIf="form.get('content')?.hasError('minlength')">Content must be at least 20 characters</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Tags (comma-separated)</mat-label>
            <input matInput formControlName="tags" placeholder="fashion, style, trends...">
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Featured Image URL</mat-label>
            <input matInput formControlName="featuredImage" placeholder="https://example.com/image.jpg">
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Description (SEO)</mat-label>
            <textarea matInput 
              formControlName="description" 
              placeholder="Short description for SEO"
              rows="3"></textarea>
          </mat-form-field>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
          <button mat-button (click)="onCancel()">Cancel</button>
          <button mat-raised-button color="primary" [disabled]="form.invalid">
            {{ data ? 'Update' : 'Create' }}
          </button>
        </mat-dialog-actions>
      </form>
    </div>
  `,
  styles: [`
    .blog-dialog {
      min-width: 400px;
      padding: 20px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    mat-dialog-actions {
      padding: 16px 0 0 0;
    }

    h2 {
      margin: 0 0 20px 0;
      color: #333;
    }
  `]
})
export class BlogPostDialogComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<BlogPostDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.form = this.fb.group({
      title: [this.data?.title || '', [Validators.required, Validators.minLength(5)]],
      author: [this.data?.author || '', Validators.required],
      content: [this.data?.content || '', [Validators.required, Validators.minLength(20)]],
      tags: [this.data?.tags || '', Validators.required],
      featuredImage: [this.data?.featuredImage || ''],
      description: [this.data?.description || '']
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formData = this.form.value;
      // Convert tags string to array
      if (typeof formData.tags === 'string') {
        formData.tags = formData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
      }
      this.dialogRef.close(formData);
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
