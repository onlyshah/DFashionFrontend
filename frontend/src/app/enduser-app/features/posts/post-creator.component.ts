import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PostService } from '../../../core/services/post.service';
import { CreatePostRequest } from '../../../core/models/post.model';
import { ProductService } from '../../../core/services/product.service';
import { FileUploadService } from '../../../core/services/file-upload.service';
import { NotificationService } from '../../../core/services/notification.service';

interface TaggedProduct {
  _id: string;
  name: string;
  price: number;
  images: { url: string }[];
  position: { x: number; y: number };
  size?: string;
  color?: string;
}

@Component({
    selector: 'app-post-creator',
    imports: [CommonModule, FormsModule, IonicModule],
    template: `
    <div class="post-creator-overlay" *ngIf="isVisible" (click)="close()">
      <div class="post-creator-modal" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <h3>Create Post</h3>
          <button class="close-btn" (click)="close()">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Content -->
        <div class="modal-content">
          <!-- Media Upload Section -->
          <div class="upload-section">
            <div class="selected-media" *ngIf="selectedFiles.length > 0">
              <div class="media-grid">
                <div *ngFor="let file of selectedFiles; let i = index" class="media-item">
                  <img *ngIf="file.type.startsWith('image/')" [src]="file.preview" alt="Selected media" class="media-preview">
                  <video *ngIf="file.type.startsWith('video/')" [src]="file.preview" class="media-preview"></video>
                  <button class="remove-media" (click)="removeMedia(i)">
                    <i class="fas fa-times"></i>
                  </button>
                  <div class="media-type" *ngIf="file.type.startsWith('video/')">
                    <i class="fas fa-play"></i>
                  </div>
                </div>
              </div>
            </div>

            <div class="upload-area" *ngIf="selectedFiles.length === 0" (click)="fileInput.click()">
              <div class="upload-icon">
                <i class="fas fa-images"></i>
              </div>
              <div class="upload-text">
                <h4>Add photos or videos</h4>
                <p>Share your style with the community</p>
              </div>
            </div>

            <input
              #fileInput
              type="file"
              accept="image/*,video/*"
              multiple
              (change)="onFilesSelected($event)"
              style="display: none">
          </div>

          <!-- Caption Section -->
          <div class="caption-section">
            <textarea
              [(ngModel)]="caption"
              placeholder="Write a caption..."
              class="caption-input"
              rows="3"
              maxlength="2200"></textarea>
            <div class="caption-footer">
              <span class="char-count">{{ caption.length }}/2200</span>
              <button class="emoji-btn" (click)="toggleEmojiPicker()">
                <i class="fas fa-smile"></i>
              </button>
            </div>
          </div>

          <!-- Product Tagging Section -->
          <div class="tagging-section">
            <div class="tagging-header">
              <h5>Tag Products</h5>
              <button class="add-product-btn" (click)="openProductSearch()">
                <i class="fas fa-plus"></i>
                Add Product
              </button>
            </div>

            <div class="tagged-products" *ngIf="taggedProducts.length > 0">
              <div *ngFor="let product of taggedProducts; let i = index" class="tagged-product-item">
                <img [src]="product.images[0]?.url" alt="Product" class="product-thumb">
                <div class="product-info">
                  <span class="product-name">{{ product.name }}</span>
                  <span class="product-price">{{ product.price }}</span>
                </div>
                <div class="position-controls">
                  <label>X: <input type="number" [(ngModel)]="product.position.x" min="0" max="100" class="pos-input"></label>
                  <label>Y: <input type="number" [(ngModel)]="product.position.y" min="0" max="100" class="pos-input"></label>
                </div>
                <button class="remove-product" (click)="removeTaggedProduct(i)">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Hashtags Section -->
          <div class="hashtags-section">
            <input
              type="text"
              [(ngModel)]="hashtagInput"
              placeholder="Add hashtags (press Enter or comma to add)"
              class="hashtag-input"
              (keyup.enter)="addHashtag()"
              (keyup)="onHashtagInput($event)">
            <div class="hashtags-list">
              <span *ngFor="let hashtag of hashtags; let i = index" class="hashtag-chip">
                #{{ hashtag }}
                <button (click)="removeHashtag(i)">
                  <i class="fas fa-times"></i>
                </button>
              </span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <div class="post-options">
            <label class="option-toggle">
              <input type="checkbox" [(ngModel)]="isPublic">
              Public post
            </label>
            <label class="option-toggle">
              <input type="checkbox" [(ngModel)]="allowComments">
              Allow comments
            </label>
            <label class="option-toggle">
              <input type="checkbox" [(ngModel)]="allowSharing">
              Allow sharing
            </label>
          </div>
          <div class="action-buttons">
            <button class="draft-btn" (click)="saveDraft()">Save Draft</button>
            <button class="share-btn" (click)="createPost()" [disabled]="isUploading || selectedFiles.length === 0">
              <span *ngIf="!isUploading">Share Post</span>
              <span *ngIf="isUploading">
                <ion-spinner name="crescent"></ion-spinner>
                Posting...
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Search Modal -->
    <div class="product-search-overlay" *ngIf="showProductSearch" (click)="closeProductSearch()">
      <div class="product-search-modal" (click)="$event.stopPropagation()">
        <div class="search-header">
          <input
            type="text"
            [(ngModel)]="productSearchQuery"
            placeholder="Search products..."
            class="search-input"
            (input)="searchProducts()">
          <button class="close-search" (click)="closeProductSearch()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="search-results">
          <div *ngFor="let product of searchResults" class="search-product" (click)="tagProduct(product)">
            <img [src]="product.images[0]?.url" alt="Product" class="search-product-image">
            <div class="search-product-info">
              <span class="search-product-name">{{ product.name }}</span>
              <span class="search-product-price">{{ product.price }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    `,
    styles: [`
    .post-creator-overlay {
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

    .post-creator-modal {
      background: #fff;
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
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
      max-height: 500px;
    }

    /* Upload Section */
    .upload-section {
      padding: 20px;
      border-bottom: 1px solid #f8f9fa;
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
      margin: 0;
      color: #666;
    }

    .selected-media {
      margin-bottom: 16px;
    }

    .media-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
    }

    .media-item {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
    }

    .media-preview {
      width: 100%;
      height: 150px;
      object-fit: cover;
      display: block;
    }

    .remove-media {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .media-type {
      position: absolute;
      bottom: 8px;
      right: 8px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
    }

    /* Caption Section */
    .caption-section {
      padding: 20px;
      border-bottom: 1px solid #f8f9fa;
    }

    .caption-input {
      width: 100%;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 12px;
      font-size: 14px;
      resize: vertical;
      font-family: inherit;
    }

    .caption-input:focus {
      outline: none;
      border-color: #007bff;
    }

    .caption-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 8px;
    }

    .char-count {
      font-size: 12px;
      color: #8e8e8e;
    }

    .emoji-btn {
      background: none;
      border: none;
      color: #8e8e8e;
      cursor: pointer;
      padding: 4px;
    }

    /* Tagging Section */
    .tagging-section {
      padding: 20px;
      border-bottom: 1px solid #f8f9fa;
    }

    .tagging-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .tagging-header h5 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
    }

    .add-product-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
    }

    .tagged-products {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .tagged-product-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .product-thumb {
      width: 40px;
      height: 40px;
      border-radius: 6px;
      object-fit: cover;
    }

    .product-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .product-name {
      font-size: 14px;
      font-weight: 500;
    }

    .product-price {
      font-size: 12px;
      color: #8e8e8e;
    }

    .position-controls {
      display: flex;
      gap: 8px;
    }

    .pos-input {
      width: 50px;
      padding: 4px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 12px;
    }

    .remove-product {
      background: none;
      border: none;
      color: #8e8e8e;
      cursor: pointer;
      padding: 4px;
    }

    /* Hashtags Section */
    .hashtags-section {
      padding: 20px;
    }

    .hashtag-input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      margin-bottom: 12px;
    }

    .hashtags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .hashtag-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: #e3f2fd;
      color: #1976d2;
      border-radius: 16px;
      font-size: 14px;
    }

    .hashtag-chip button {
      background: none;
      border: none;
      color: #1976d2;
      cursor: pointer;
      padding: 0;
    }

    .modal-footer {
      padding: 16px 20px;
      border-top: 1px solid #e1e8ed;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .post-options {
      display: flex;
      gap: 16px;
    }

    .option-toggle {
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

    .draft-btn {
      padding: 8px 16px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 6px;
      cursor: pointer;
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
    }

    .share-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Product Search Modal */
    .product-search-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1100;
    }

    .product-search-modal {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 400px;
      max-height: 80vh;
      overflow: hidden;
    }

    .search-header {
      padding: 16px;
      border-bottom: 1px solid #e1e8ed;
      display: flex;
      gap: 12px;
    }

    .search-input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
    }

    .close-search {
      background: none;
      border: none;
      color: #8e8e8e;
      cursor: pointer;
      padding: 8px;
    }

    .search-results {
      max-height: 300px;
      overflow-y: auto;
    }

    .search-product {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      cursor: pointer;
      border-bottom: 1px solid #f8f9fa;
      transition: background 0.2s ease;
    }

    .search-product:hover {
      background: #f8f9fa;
    }

    .search-product-image {
      width: 40px;
      height: 40px;
      border-radius: 6px;
      object-fit: cover;
    }

    .search-product-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .search-product-name {
      font-size: 14px;
      font-weight: 500;
    }

    .search-product-price {
      font-size: 12px;
      color: #8e8e8e;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .post-creator-modal {
        width: 95%;
        max-height: 95vh;
      }

      .media-grid {
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      }

      .modal-footer {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
      }

      .post-options {
        justify-content: center;
      }
    }
    `]
})
export class PostCreatorComponent {
  @Output() postCreated = new EventEmitter<any>();
  @Output() closed = new EventEmitter<void>();

  isVisible = false;
  selectedFiles: Array<{ file: File; preview: string; type: string }> = [];
  caption = '';
  taggedProducts: TaggedProduct[] = [];
  hashtags: string[] = [];
  hashtagInput = '';
  isPublic = true;
  allowComments = true;
  allowSharing = true;
  isUploading = false;

  // Product search
  showProductSearch = false;
  productSearchQuery = '';
  searchResults: any[] = [];

  constructor(
    private postService: PostService,
    private productService: ProductService,
    private fileUploadService: FileUploadService,
    private notificationService: NotificationService
  ) {}

  open() {
    this.isVisible = true;
    console.log('✍️ Post creator opened');
  }

  close() {
    this.reset();
    this.isVisible = false;
    this.closed.emit();
    console.log('✍️ Post creator closed');
  }

  reset() {
    this.selectedFiles = [];
    this.caption = '';
    this.taggedProducts = [];
    this.hashtags = [];
    this.hashtagInput = '';
    this.isPublic = true;
    this.allowComments = true;
    this.allowSharing = true;
    this.isUploading = false;
    this.showProductSearch = false;
    this.productSearchQuery = '';
    this.searchResults = [];
  }

  onFilesSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    this.processFiles(files);
  }

  private processFiles(files: File[]) {
    const maxFiles = 10;
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
    const maxSize = 50 * 1024 * 1024; // 50MB per file

    if (this.selectedFiles.length + files.length > maxFiles) {
      this.notificationService.error('Too many files', `You can only upload up to ${maxFiles} files.`);
      return;
    }

    files.forEach(file => {
      if (!validTypes.includes(file.type)) {
        this.notificationService.error('Invalid file type', `${file.name} is not a supported file type.`);
        return;
      }

      if (file.size > maxSize) {
        this.notificationService.error('File too large', `${file.name} is larger than 50MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedFiles.push({
          file,
          preview: e.target?.result as string,
          type: file.type
        });
      };
      reader.readAsDataURL(file);
    });

    console.log('📁 Files selected:', files.length, 'Total files:', this.selectedFiles.length);
  }

  removeMedia(index: number) {
    this.selectedFiles.splice(index, 1);
    console.log('📁 Media removed, remaining files:', this.selectedFiles.length);
  }

  addHashtag() {
    const hashtag = this.hashtagInput.trim().replace(/^#/, '');
    if (hashtag && !this.hashtags.includes(hashtag)) {
      this.hashtags.push(hashtag);
      this.hashtagInput = '';
      console.log('🏷️ Hashtag added:', hashtag);
    }
  }

  onHashtagInput(event: any) {
    if (event.key === ',') {
      event.preventDefault();
      this.addHashtag();
    }
  }

  removeHashtag(index: number) {
    this.hashtags.splice(index, 1);
    console.log('🏷️ Hashtag removed');
  }

  openProductSearch() {
    this.showProductSearch = true;
    console.log('🔍 Product search opened');
  }

  closeProductSearch() {
    this.showProductSearch = false;
    this.productSearchQuery = '';
    this.searchResults = [];
    console.log('🔍 Product search closed');
  }

  searchProducts() {
    if (this.productSearchQuery.trim()) {
      this.productService.searchProducts(this.productSearchQuery, { limit: 10 }).subscribe({
        next: (response: any) => {
          this.searchResults = response.products;
          console.log('🔍 Product search results:', this.searchResults.length);
        },
        error: (error: any) => {
          console.error('❌ Error searching products:', error);
          this.searchResults = [];
        }
      });
    } else {
      this.searchResults = [];
    }
  }

  tagProduct(product: any) {
    const taggedProduct: TaggedProduct = {
      _id: product._id,
      name: product.name,
      price: product.price,
      images: product.images,
      position: { x: 50, y: 50 } // Default center position
    };

    this.taggedProducts.push(taggedProduct);
    this.closeProductSearch();
    console.log('🏷️ Product tagged:', product.name);
  }

  removeTaggedProduct(index: number) {
    this.taggedProducts.splice(index, 1);
    console.log('🏷️ Tagged product removed');
  }

  toggleEmojiPicker() {
    // TODO: Implement emoji picker
    console.log('😊 Emoji picker toggled');
  }

  createPost() {
    if (this.selectedFiles.length === 0) {
      this.notificationService.error('No media selected', 'Please add at least one photo or video.');
      return;
    }

    this.isUploading = true;
    console.log('📤 Creating post...');

    // Upload all files first
    this.fileUploadService.uploadPostMedia(this.selectedFiles.map(f => f.file)).subscribe({
      next: (uploadResult: any) => {
        console.log('✅ All files uploaded');

        // Prepare post data
        const postData: CreatePostRequest = {
          caption: this.caption || '',
          media: (uploadResult.data.media || []).map((media: any) => ({
            url: media.url,
            type: media.type,
            alt: 'Post media'
          })),
        products: this.taggedProducts.map(product => ({
          product: {
            _id: product._id,
            name: product.name,
            price: product.price,
            images: product.images.map((img: any) => ({
              url: img.url,
              isPrimary: img.isPrimary || false
            })),
            brand: 'Unknown' // TODO: Add brand to TaggedProduct
          },
          position: product.position,
          size: product.size,
          color: product.color
        })),
        hashtags: this.hashtags,
        visibility: this.isPublic ? 'public' : 'private'
      };

      // Create the post
      this.postService.createPost(postData).subscribe({
        next: (response: any) => {
          console.log('✅ Post created:', response.post._id);
          this.notificationService.success('Post created!', 'Your post has been shared.');
          this.postCreated.emit(response.post);
          this.close();
        },
        error: (error: any) => {
          console.error('❌ Error creating post:', error);
          this.notificationService.error('Failed to create post', 'Please try again.');
          this.isUploading = false;
        }
      });
    },
    error: (error: any) => {
      console.error('❌ Error uploading files:', error);
      this.notificationService.error('Upload failed', 'Please try again.');
      this.isUploading = false;
    }
  });

  }

  saveDraft() {
    // TODO: Implement draft saving
    console.log('💾 Post saved as draft');
    this.notificationService.info('Draft saved', 'Your post has been saved as a draft.');
  }
}