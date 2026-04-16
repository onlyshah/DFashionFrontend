/**
 * ✏️ Create Post Component
 * Create social posts with product tagging for hybrid social + shopping
 */

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, ToastController, ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="close()">
            <ion-icon name="close" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>New Post</ion-title>
        <ion-buttons slot="end">
          <ion-button
            [disabled]="!canPublish || isPublishing"
            (click)="publishPost()"
            strong
          >
            {{ isPublishing ? 'Publishing...' : 'Post' }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-tabs [(selectedIndex)]="currentStep">
        <!-- Step 1: Upload Images -->
        <ion-tab>
          <ng-template ionTabLabel>
            <ion-label>
              <ion-icon name="images" class="step-icon" [class.completed]="images.length > 0"></ion-icon>
              <span>Photos</span>
            </ion-label>
          </ng-template>

          <div class="tab-content">
            <!-- Image Upload Area -->
            <div class="image-upload-area">
              <div class="uploaded-images" *ngIf="images.length > 0">
                <div *ngFor="let image of images; let i = index" class="image-preview">
                  <img [src]="image.preview" />
                  <button
                    class="remove-btn"
                    (click)="removeImage(i)"
                    type="button"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <!-- Upload Button -->
              <div class="upload-button-area">
                <input
                  type="file"
                  #fileInput
                  multiple
                  accept="image/*"
                  (change)="onFileSelected($event)"
                  style="display: none"
                />
                <ion-button
                  expand="block"
                  fill="outline"
                  (click)="fileInput.click()"
                >
                  <ion-icon name="cloud-upload" slot="start"></ion-icon>
                  Choose Images
                </ion-button>
              </div>
            </div>

            <!-- Continue Button -->
            <ion-button
              expand="block"
              [disabled]="images.length === 0"
              (click)="nextStep()"
              class="step-nav-btn"
            >
              Continue to Caption
            </ion-button>
          </div>
        </ion-tab>

        <!-- Step 2: Caption & Media Filters -->
        <ion-tab>
          <ng-template ionTabLabel>
            <ion-label>
              <ion-icon name="create" class="step-icon"></ion-icon>
              <span>Caption</span>
            </ion-label>
          </ng-template>

          <div class="tab-content">
            <!-- Caption Input -->
            <ion-item>
              <ion-textarea
                placeholder="Write a caption..."
                [(ngModel)]="caption"
                rows="6"
                maxlength="2200"
              ></ion-textarea>
            </ion-item>

            <div class="character-count">
              {{ caption.length }}/2200
            </div>

            <!-- Hashtags Suggestion -->
            <div class="hashtags-section">
              <h3>Popular Hashtags</h3>
              <div class="hashtags">
                <ion-chip
                  *ngFor="let tag of suggestedHashtags"
                  (click)="addHashtag(tag)"
                >
                  {{ tag }}
                </ion-chip>
              </div>
            </div>

            <!-- Location -->
            <ion-item>
              <ion-icon name="location" slot="start"></ion-icon>
              <ion-label>Add Location</ion-label>
              <ion-input
                placeholder="Location"
                [(ngModel)]="location"
              ></ion-input>
            </ion-item>

            <!-- Navigation Buttons -->
            <div class="step-nav">
              <ion-button fill="outline" (click)="previousStep()">
                Back
              </ion-button>
              <ion-button (click)="nextStep()">
                Tag Products
              </ion-button>
            </div>
          </div>
        </ion-tab>

        <!-- Step 3: Tag Products (for social selling) -->
        <ion-tab>
          <ng-template ionTabLabel>
            <ion-label>
              <ion-icon name="cart" class="step-icon"></ion-icon>
              <span>Products</span>
            </ion-label>
          </ng-template>

          <div class="tab-content">
            <h3>Tag Products (Optional)</h3>
            <p class="helper-text">Tag products in your post for direct shopping</p>

            <!-- Product Search -->
            <ion-searchbar
              placeholder="Search products..."
              [(ngModel)]="productSearchQuery"
              (ionChange)="searchProducts($event)"
            ></ion-searchbar>

            <!-- Product Results -->
            <ion-list>
              <ion-item *ngFor="let product of productSearchResults" button>
                <ion-thumbnail slot="start">
                  <img [src]="product.images?.[0]" />
                </ion-thumbnail>
                <ion-label>
                  <h3>{{ product.name }}</h3>
                  <p>₹{{ product.price }}</p>
                </ion-label>
                <ion-button
                  (click)="tagProduct(product, $event)"
                  fill="outline"
                  size="small"
                >
                  {{ isProductTagged(product.id) ? '✓ Tagged' : 'Tag' }}
                </ion-button>
              </ion-item>
            </ion-list>

            <!-- Tagged Products Display -->
            <div *ngIf="taggedProducts.length > 0" class="tagged-products">
              <h4>Tagged Products</h4>
              <div class="tagged-list">
                <div
                  *ngFor="let product of taggedProducts"
                  class="tagged-item"
                >
                  <img [src]="product.images?.[0]" />
                  <div class="product-details">
                    <p class="product-name">{{ product.name }}</p>
                    <p class="product-price">₹{{ product.price }}</p>
                  </div>
                  <ion-button
                    size="small"
                    fill="clear"
                    color="danger"
                    (click)="untagProduct(product.id)"
                  >
                    <ion-icon name="close" slot="icon-only"></ion-icon>
                  </ion-button>
                </div>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="step-nav">
              <ion-button fill="outline" (click)="previousStep()">
                Back
              </ion-button>
              <ion-button (click)="nextStep()">
                Review & Post
              </ion-button>
            </div>
          </div>
        </ion-tab>

        <!-- Step 4: Review & Publish -->
        <ion-tab>
          <ng-template ionTabLabel>
            <ion-label>
              <ion-icon name="checkmark" class="step-icon"></ion-icon>
              <span>Review</span>
            </ion-label>
          </ng-template>

          <div class="tab-content review-tab">
            <!-- Preview -->
            <div class="post-preview">
              <h3>Preview</h3>

              <!-- Image Preview -->
              <div class="image-carousel">
                <img [src]="images[0]?.preview" class="preview-image" />
              </div>

              <!-- Caption Preview -->
              <div class="caption-preview">
                <strong>Your Caption:</strong>
                <p>{{ caption }}</p>
              </div>

              <!-- Products Preview -->
              <div *ngIf="taggedProducts.length > 0" class="products-preview">
                <strong>Tagged Products ({{ taggedProducts.length }})</strong>
                <div class="products-grid">
                  <img
                    *ngFor="let product of taggedProducts"
                    [src]="product.images?.[0]"
                    class="product-thumb"
                  />
                </div>
              </div>
            </div>

            <!-- Sharing Options -->
            <ion-list>
              <ion-item>
                <ion-label>Share to Feed</ion-label>
                <ion-checkbox slot="start" [(ngModel)]="shareToFeed"></ion-checkbox>
              </ion-item>
              <ion-item>
                <ion-label>Allow Comments</ion-label>
                <ion-checkbox slot="start" [(ngModel)]="allowComments"></ion-checkbox>
              </ion-item>
              <ion-item>
                <ion-label>Allow Likes</ion-label>
                <ion-checkbox slot="start" [(ngModel)]="allowLikes"></ion-checkbox>
              </ion-item>
            </ion-list>

            <!-- Final Actions -->
            <div class="step-nav">
              <ion-button fill="outline" (click)="previousStep()">
                Back
              </ion-button>
              <ion-button
                expand="block"
                [disabled]="isPublishing"
                (click)="publishPost()"
              >
                <ion-spinner name="crescent" *ngIf="isPublishing"></ion-spinner>
                {{ isPublishing ? 'Publishing...' : 'Publish Post' }}
              </ion-button>
            </div>
          </div>
        </ion-tab>
      </ion-tabs>
    </ion-content>
  `,
  styles: [`
    ion-content {
      --background: #fff;
    }

    ion-tabs {
      height: 100%;
    }

    .tab-content {
      padding: 20px 16px;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .image-upload-area {
      display: flex;
      flex-direction: column;
      gap: 20px;
      flex: 1;
    }

    .uploaded-images {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .image-preview {
      position: relative;
      aspect-ratio: 1;
      border-radius: 8px;
      overflow: hidden;
    }

    .image-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .remove-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      border: none;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .remove-btn:hover {
      background: rgba(0, 0, 0, 0.8);
    }

    .character-count {
      text-align: right;
      font-size: 12px;
      color: #999;
      margin-top: 8px;
    }

    .hashtags-section {
      margin: 16px 0;
    }

    .hashtags-section h3 {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .hashtags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    ion-chip {
      cursor: pointer;
    }

    .helper-text {
      font-size: 12px;
      color: #999;
      margin-bottom: 16px;
    }

    .tagged-products {
      margin-top: 20px;
    }

    .tagged-products h4 {
      font-size: 13px;
      font-weight: bold;
      margin-bottom: 12px;
    }

    .tagged-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .tagged-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px;
      background: #f9f9f9;
      border-radius: 8px;
    }

    .tagged-item img {
      width: 48px;
      height: 48px;
      object-fit: cover;
      border-radius: 4px;
    }

    .product-details {
      flex: 1;
    }

    .product-name {
      font-size: 13px;
      font-weight: 600;
      margin: 0;
    }

    .product-price {
      font-size: 12px;
      color: #666;
      margin: 0;
    }

    .step-nav {
      display: flex;
      gap: 8px;
      margin-top: auto;
      padding-top: 20px;
    }

    .step-nav ion-button {
      flex: 1;
    }

    .review-tab {
      overflow-y: auto;
    }

    .post-preview {
      background: #f9f9f9;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
    }

    .post-preview h3 {
      margin-top: 0;
      font-size: 14px;
    }

    .image-carousel {
      width: 100%;
      height: 300px;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 12px;
    }

    .preview-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .caption-preview {
      margin-bottom: 12px;
    }

    .caption-preview strong {
      display: block;
      font-size: 12px;
      margin-bottom: 6px;
      color: #666;
    }

    .caption-preview p {
      font-size: 13px;
      line-height: 1.5;
      margin: 0;
    }

    .products-preview {
      margin-top: 12px;
    }

    .products-preview strong {
      display: block;
      font-size: 12px;
      margin-bottom: 8px;
      color: #666;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .product-thumb {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: 4px;
    }

    .step-icon {
      font-size: 20px;
    }

    .step-icon.completed {
      color: var(--ion-color-success);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreatePostComponent implements OnInit, OnDestroy {
  currentStep: number = 0;

  // Step 1: Images
  images: any[] = [];

  // Step 2: Caption
  caption: string = '';
  location: string = '';
  suggestedHashtags: string[] = ['#fashion', '#ootd', '#style', '#instagood', '#photooftheday', '#trending'];

  // Step 3: Products
  productSearchQuery: string = '';
  productSearchResults: any[] = [];
  taggedProducts: any[] = [];

  // Step 4: Publish
  shareToFeed: boolean = true;
  allowComments: boolean = true;
  allowLikes: boolean = true;

  isPublishing: boolean = false;

  get canPublish(): boolean {
    return this.images.length > 0 && this.caption.trim().length > 0;
  }

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastController: ToastController,
    private modalController: ModalController,
    private fb: FormBuilder
  ) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;

    for (let i = 0; i < Math.min(files.length, 10); i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.images.push({
          file: file,
          preview: e.target.result
        });
      };

      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number) {
    this.images.splice(index, 1);
  }

  nextStep() {
    this.currentStep = Math.min(this.currentStep + 1, 3);
  }

  previousStep() {
    this.currentStep = Math.max(this.currentStep - 1, 0);
  }

  searchProducts(event: any) {
    const query = event.detail.value;

    if (!query.trim()) {
      this.productSearchResults = [];
      return;
    }

    this.http.get(`/api/products?search=${query}&limit=10`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.productSearchResults = response.data || [];
        },
        error: (error) => console.error('Failed to search products:', error)
      });
  }

  tagProduct(product: any, event: Event) {
    event.stopPropagation();

    if (!this.isProductTagged(product.id)) {
      this.taggedProducts.push(product);
    }
  }

  untagProduct(productId: string) {
    this.taggedProducts = this.taggedProducts.filter(p => p.id !== productId);
  }

  isProductTagged(productId: string): boolean {
    return this.taggedProducts.some(p => p.id === productId);
  }

  addHashtag(tag: string) {
    if (!this.caption.includes(tag)) {
      this.caption += ' ' + tag;
    }
  }

  publishPost() {
    if (!this.canPublish || this.isPublishing) return;

    this.isPublishing = true;

    const formData = new FormData();
    formData.append('caption', this.caption);
    formData.append('location', this.location);
    formData.append('allowComments', this.allowComments.toString());
    formData.append('allowLikes', this.allowLikes.toString());

    // Add images
    this.images.forEach((img, idx) => {
      formData.append(`images`, img.file);
    });

    // Add tagged products
    this.taggedProducts.forEach(product => {
      formData.append('taggedProducts', product.id);
    });

    this.http.post('/api/posts', formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.isPublishing = false;
          this.showToast('Post published successfully!', 'success');
          this.close();
          this.router.navigate(['/tabs/home']);
        },
        error: (error) => {
          console.error('Failed to publish post:', error);
          this.isPublishing = false;
          this.showToast('Failed to publish post', 'danger');
        }
      });
  }

  close() {
    this.modalController.dismiss();
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
