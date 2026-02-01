import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { StoryService } from '../../../../../src/app/core/services/story.service';
import { CreateStoryRequest } from '../../../../../src/app/core/models/story.model';
import { FileUploadService } from '../../../../../src/app/core/services/file-upload.service';
import { NotificationService } from '../../../../../src/app/core/services/notification.service';

@Component({
    selector: 'app-story-creator',
    imports: [CommonModule, FormsModule, IonicModule],
    template: `
    <div class="story-creator-overlay" *ngIf="isVisible" (click)="close()">
      <div class="story-creator-modal" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <h3>Create Story</h3>
          <button class="close-btn" (click)="close()">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Content -->
        <div class="modal-content">
          <!-- Upload Area -->
          <div class="upload-section" *ngIf="!selectedFile">
            <div class="upload-area" (click)="fileInput.click()" (dragover)="onDragOver($event)" (drop)="onDrop($event)">
              <div class="upload-icon">
                <i class="fas fa-cloud-upload-alt"></i>
              </div>
              <div class="upload-text">
                <h4>Drag & drop your photo or video</h4>
                <p>or click to browse</p>
                <small>Supported formats: JPG, PNG, MP4, MOV (max 100MB)</small>
              </div>
            </div>
            <input
              #fileInput
              type="file"
              accept="image/*,video/*"
              (change)="onFileSelected($event)"
              style="display: none">
          </div>

          <!-- Preview & Edit Area -->
          <div class="preview-section" *ngIf="selectedFile">
            <div class="media-preview">
              <img *ngIf="isImage" [src]="previewUrl" alt="Story preview" class="preview-image">
              <video *ngIf="isVideo" [src]="previewUrl" controls class="preview-video"></video>

              <!-- Text Overlay -->
              <div class="text-overlay" *ngIf="textOverlay">
                <div
                  class="overlay-text"
                  [style.color]="textColor"
                  [style.fontSize]="fontSize + 'px'"
                  [style.fontFamily]="fontFamily"
                  [style.left]="textPosition.x + '%'"
                  [style.top]="textPosition.y + '%'">
                  {{ textOverlay }}
                </div>
              </div>

              <!-- Stickers -->
              <div class="stickers-overlay">
                <div
                  *ngFor="let sticker of stickers; let i = index"
                  class="sticker"
                  [style.left]="sticker.x + '%'"
                  [style.top]="sticker.y + '%'">
                  <img [src]="sticker.url" alt="Sticker" class="sticker-image">
                  <button class="remove-sticker" (click)="removeSticker(i)">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Edit Controls -->
            <div class="edit-controls">
              <!-- Text Controls -->
              <div class="control-group">
                <h5>Add Text</h5>
                <input
                  type="text"
                  placeholder="Enter your text..."
                  [(ngModel)]="textOverlay"
                  class="text-input">
                <div class="text-options">
                  <select [(ngModel)]="textColor" class="color-select">
                    <option value="#ffffff">White</option>
                    <option value="#000000">Black</option>
                    <option value="#ff6b6b">Red</option>
                    <option value="#4ecdc4">Teal</option>
                    <option value="#ffe66d">Yellow</option>
                    <option value="#a8e6cf">Green</option>
                  </select>
                  <input
                    type="range"
                    min="20"
                    max="60"
                    [(ngModel)]="fontSize"
                    class="font-size-slider">
                  <select [(ngModel)]="fontFamily" class="font-select">
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Impact">Impact</option>
                    <option value="Comic Sans MS">Comic Sans</option>
                  </select>
                </div>
              </div>

              <!-- Sticker Controls -->
              <div class="control-group">
                <h5>Add Stickers</h5>
                <div class="sticker-options">
                  <button
                    *ngFor="let sticker of availableStickers"
                    class="sticker-btn"
                    (click)="addSticker(sticker)">
                    <img [src]="sticker.url" alt="Sticker option">
                  </button>
                </div>
              </div>

              <!-- Filter Controls -->
              <div class="control-group">
                <h5>Filters</h5>
                <div class="filter-options">
                  <button
                    *ngFor="let filter of availableFilters"
                    class="filter-btn"
                    [class.active]="selectedFilter === filter.id"
                    (click)="applyFilter(filter.id)">
                    {{ filter.name }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer" *ngIf="selectedFile">
          <div class="story-options">
            <label class="option-checkbox">
              <input type="checkbox" [(ngModel)]="canReply">
              Allow replies
            </label>
            <label class="option-checkbox">
              <input type="checkbox" [(ngModel)]="canShare">
              Allow sharing
            </label>
          </div>
          <div class="action-buttons">
            <button class="cancel-btn" (click)="reset()">Cancel</button>
            <button class="share-btn" (click)="createStory()" [disabled]="isUploading">
              <span *ngIf="!isUploading">Share to Story</span>
              <span *ngIf="isUploading">
                <ion-spinner name="crescent"></ion-spinner>
                Uploading...
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
    `,
    styles: [`
    .story-creator-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .story-creator-modal {
      background: #fff;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid #e1e8ed;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 18px;
      color: #8e8e8e;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: background 0.2s ease;
    }

    .close-btn:hover {
      background: #f8f9fa;
    }

    .modal-content {
      flex: 1;
      overflow-y: auto;
    }

    /* Upload Section */
    .upload-section {
      padding: 40px 20px;
    }

    .upload-area {
      border: 2px dashed #ddd;
      border-radius: 12px;
      padding: 40px 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .upload-area:hover {
      border-color: #007bff;
      background: #f8f9ff;
    }

    .upload-icon {
      font-size: 48px;
      color: #ddd;
      margin-bottom: 16px;
    }

    .upload-text h4 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .upload-text p {
      margin: 0 0 8px 0;
      color: #666;
    }

    .upload-text small {
      color: #999;
    }

    /* Preview Section */
    .preview-section {
      display: flex;
      flex-direction: column;
      height: 500px;
    }

    .media-preview {
      flex: 1;
      position: relative;
      background: #000;
    }

    .preview-image, .preview-video {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .text-overlay, .stickers-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .overlay-text {
      position: absolute;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
      font-weight: bold;
      white-space: nowrap;
      pointer-events: auto;
      cursor: move;
    }

    .sticker {
      position: absolute;
      pointer-events: auto;
    }

    .sticker-image {
      width: 60px;
      height: 60px;
      object-fit: contain;
    }

    .remove-sticker {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #ff6b6b;
      color: white;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      cursor: pointer;
    }

    .edit-controls {
      padding: 16px;
      border-top: 1px solid #e1e8ed;
      background: #f8f9fa;
    }

    .control-group {
      margin-bottom: 16px;
    }

    .control-group h5 {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .text-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      margin-bottom: 8px;
    }

    .text-options {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .color-select, .font-select {
      padding: 4px 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 12px;
    }

    .font-size-slider {
      flex: 1;
      max-width: 100px;
    }

    .sticker-options, .filter-options {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .sticker-btn, .filter-btn {
      width: 40px;
      height: 40px;
      border: 1px solid #ddd;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .sticker-btn:hover, .filter-btn:hover {
      border-color: #007bff;
    }

    .sticker-btn img {
      width: 30px;
      height: 30px;
      object-fit: contain;
    }

    .filter-btn.active {
      border-color: #007bff;
      background: #e7f3ff;
    }

    .modal-footer {
      padding: 16px 20px;
      border-top: 1px solid #e1e8ed;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .story-options {
      display: flex;
      gap: 16px;
    }

    .option-checkbox {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      cursor: pointer;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
    }

    .cancel-btn {
      padding: 8px 16px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .cancel-btn:hover {
      background: #f8f9fa;
    }

    .share-btn {
      padding: 8px 16px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }

    .share-btn:hover:not(:disabled) {
      background: #0056b3;
    }

    .share-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .story-creator-modal {
        width: 95%;
        max-height: 95vh;
      }

      .preview-section {
        height: 400px;
      }

      .text-options {
        flex-direction: column;
        align-items: stretch;
      }

      .font-size-slider {
        max-width: none;
      }

      .modal-footer {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
      }

      .story-options {
        justify-content: center;
      }
    }
    `]
})
export class StoryCreatorComponent {
  @Output() storyCreated = new EventEmitter<any>();
  @Output() closed = new EventEmitter<void>();

  isVisible = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isImage = false;
  isVideo = false;
  isUploading = false;

  // Text overlay
  textOverlay = '';
  textColor = '#ffffff';
  fontSize = 32;
  fontFamily = 'Arial';
  textPosition = { x: 50, y: 50 };

  // Stickers
  stickers: Array<{ url: string; x: number; y: number }> = [];
  availableStickers = [
    { url: '/assets/stickers/heart.png' },
    { url: '/assets/stickers/star.png' },
    { url: '/assets/stickers/fire.png' },
    { url: '/assets/stickers/clap.png' },
    { url: '/assets/stickers/100.png' }
  ];

  // Filters
  selectedFilter = 'none';
  availableFilters = [
    { id: 'none', name: 'None' },
    { id: 'vintage', name: 'Vintage' },
    { id: 'blackwhite', name: 'B&W' },
    { id: 'sepia', name: 'Sepia' },
    { id: 'bright', name: 'Bright' }
  ];

  // Story options
  canReply = true;
  canShare = true;

  // Story data
  caption = '';
  taggedProducts: any[] = [];
  isPublic = true;

  constructor(
    private storyService: StoryService,
    private fileUploadService: FileUploadService,
    private notificationService: NotificationService
  ) {}

  open() {
    this.isVisible = true;
    console.log('📖 Story creator opened');
  }

  close() {
    this.reset();
    this.isVisible = false;
    this.closed.emit();
    console.log('📖 Story creator closed');
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.processFile(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  private processFile(file: File) {
    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!validTypes.includes(file.type)) {
      this.notificationService.error('Invalid file type', 'Please select a valid image or video file.');
      return;
    }

    if (file.size > maxSize) {
      this.notificationService.error('File too large', 'Please select a file smaller than 100MB.');
      return;
    }

    this.selectedFile = file;
    this.isImage = file.type.startsWith('image/');
    this.isVideo = file.type.startsWith('video/');

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    console.log('📁 File selected:', file.name, 'Type:', file.type, 'Size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
  }

  addSticker(sticker: { url: string }) {
    this.stickers.push({
      url: sticker.url,
      x: Math.random() * 80 + 10, // Random position between 10-90%
      y: Math.random() * 80 + 10
    });
    console.log('🏷️ Sticker added, total stickers:', this.stickers.length);
  }

  removeSticker(index: number) {
    this.stickers.splice(index, 1);
    console.log('🏷️ Sticker removed, remaining stickers:', this.stickers.length);
  }

  applyFilter(filterId: string) {
    this.selectedFilter = filterId;
    console.log('🎨 Filter applied:', filterId);
    // TODO: Apply CSS filter to preview
  }

  createStory() {
    if (!this.selectedFile) {
      this.notificationService.error('No file selected', 'Please select a photo or video first.');
      return;
    }

    this.isUploading = true;
    console.log('📤 Creating story...');

    // First upload the file
    this.fileUploadService.uploadStoryMedia(this.selectedFile).subscribe({
      next: (uploadResponse: any) => {
        console.log('✅ File uploaded:', uploadResponse);

        // Create story data
        const storyData: CreateStoryRequest = {
          media: {
            type: this.selectedFile!.type.startsWith('image/') ? 'image' : 'video',
            url: uploadResponse?.data?.url || uploadResponse?.url || '',
          },
          caption: this.caption || undefined,
          products: this.taggedProducts.length > 0 ? this.taggedProducts.map(product => ({
            product: {
              _id: product._id,
              name: product.name,
              price: product.price,
              images: product.images,
              brand: 'Unknown'
            },
            position: product.position,
            size: product.size,
            color: product.color
          })) : undefined,
          settings: {
            allowComments: this.canReply,
            allowSharing: this.canShare,
            visibility: this.isPublic ? 'public' : 'private'
          }
        };

        // Create the story
        this.storyService.createStory(storyData).subscribe({
          next: (response: any) => {
            console.log('✅ Story created:', response.story._id);
            this.notificationService.success('Story created!', 'Your story has been shared.');
            this.storyCreated.emit(response.story);
            this.close();
          },
          error: (error: any) => {
            console.error('❌ Error creating story:', error);
            this.notificationService.error('Failed to create story', 'Please try again.');
            this.isUploading = false;
          }
        });
      },
      error: (error) => {
        console.error('❌ Error uploading file:', error);
        this.notificationService.error('Upload failed', 'Please try again.');
        this.isUploading = false;
      }
    });
  }

  reset() {
    this.selectedFile = null;
    this.previewUrl = null;
    this.isImage = false;
    this.isVideo = false;
    this.textOverlay = '';
    this.stickers = [];
    this.selectedFilter = 'none';
    this.canReply = true;
    this.canShare = true;
    this.isUploading = false;
    console.log('🔄 Story creator reset');
  }
}