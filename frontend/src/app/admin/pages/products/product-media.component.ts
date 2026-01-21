import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-media',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatIconModule,
    MatGridListModule
  ],
  template: `
    <div class="media-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Product Media Management</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div class="upload-section">
            <h3>Upload Images</h3>
            <div class="upload-box">
              <input 
                type="file" 
                #fileInput 
                hidden 
                accept="image/*" 
                multiple 
                (change)="onFilesSelected($event)"
              />
              <button 
                mat-raised-button 
                color="primary" 
                (click)="fileInput.click()"
                [disabled]="isUploading"
              >
                <mat-icon>cloud_upload</mat-icon>
                Select Images
              </button>
              <p class="upload-hint">Drag and drop images here or click to select</p>
            </div>

            <div *ngIf="isUploading" class="progress-section">
              <p>Uploading... {{ uploadProgress }}%</p>
              <mat-progress-bar mode="determinate" [value]="uploadProgress"></mat-progress-bar>
            </div>
          </div>

          <div class="gallery-section" *ngIf="mediaFiles.length > 0">
            <h3>Product Images</h3>
            <mat-grid-list cols="4" rowHeight="200px" gutterSize="16px">
              <mat-grid-tile *ngFor="let media of mediaFiles; let i = index">
                <div class="image-item">
                  <img [src]="media.url" [alt]="media.alt" class="thumbnail" />
                  <div class="image-actions">
                    <button 
                      mat-icon-button 
                      color="primary"
                      (click)="onSetPrimary(i)"
                      *ngIf="!media.isPrimary"
                      title="Set as primary"
                    >
                      <mat-icon>check_circle</mat-icon>
                    </button>
                    <button 
                      mat-icon-button 
                      color="accent"
                      *ngIf="media.isPrimary"
                      disabled
                      title="Primary image"
                    >
                      <mat-icon>verified</mat-icon>
                    </button>
                    <button 
                      mat-icon-button 
                      color="warn"
                      (click)="onDeleteMedia(media._id)"
                      title="Delete"
                    >
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </div>
              </mat-grid-tile>
            </mat-grid-list>
          </div>

          <div *ngIf="mediaFiles.length === 0 && !isUploading" class="no-media">
            <p>No images uploaded yet. Upload your first product image above.</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .media-container {
      padding: 20px;
    }

    .upload-section {
      margin-bottom: 32px;
    }

    .upload-box {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 32px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      background-color: #f9f9f9;
    }

    .upload-box:hover {
      border-color: #1976d2;
      background-color: #f0f7ff;
    }

    .upload-hint {
      color: #666;
      margin-top: 12px;
      font-size: 12px;
    }

    .progress-section {
      margin-top: 16px;
    }

    .gallery-section {
      margin-top: 32px;
    }

    .image-item {
      position: relative;
      overflow: hidden;
      border-radius: 4px;
      background-color: #f5f5f5;
    }

    .thumbnail {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-actions {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      opacity: 0;
      transition: opacity 0.3s;
    }

    .image-item:hover .image-actions {
      opacity: 1;
    }

    .no-media {
      text-align: center;
      padding: 48px;
      color: #999;
    }
  `]
})
export class ProductMediaComponent implements OnInit, OnDestroy {
  mediaFiles: any[] = [];
  isUploading = false;
  uploadProgress = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private productService: AdminProductService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMedia();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadMedia(): void {
    // TODO: Implement backend API call to fetch product media
    this.mediaFiles = [];
  }

  onFilesSelected(event: any): void {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    this.isUploading = true;
    this.uploadProgress = 0;

    // TODO: Implement backend API call to upload images
    // Simulate upload progress
    const interval = setInterval(() => {
      this.uploadProgress += Math.random() * 30;
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        this.uploadProgress = 100;
        this.isUploading = false;
        this.snackBar.open('Images uploaded successfully', 'Close', { duration: 3000 });
        this.loadMedia();
      }
    }, 200);
  }

  onSetPrimary(index: number): void {
    this.mediaFiles.forEach((media, i) => {
      media.isPrimary = i === index;
    });
    this.snackBar.open('Primary image updated', 'Close', { duration: 3000 });
    // TODO: Call backend API to update primary image
  }

  onDeleteMedia(mediaId: string): void {
    if (confirm('Are you sure you want to delete this image?')) {
      // TODO: Call backend API to delete media
      this.mediaFiles = this.mediaFiles.filter(m => m._id !== mediaId);
      this.snackBar.open('Image deleted successfully', 'Close', { duration: 3000 });
    }
  }
}
