/**
 * 📺 Go Live Component
 * Live streaming functionality for social selling
 */

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-go-live',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="close()">
            <ion-icon name="close" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Go Live</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Setup Phase -->
      <div *ngIf="!isLive" class="setup-phase">
        <!-- Camera Preview -->
        <div class="camera-preview">
          <video #cameraPreview autoplay playsinline muted class="preview-video"></video>
          <div class="preview-controls">
            <button class="control-btn" (click)="switchCamera()">
              <ion-icon name="camera-reverse"></ion-icon>
            </button>
            <button class="control-btn" (click)="toggleMute()">
              <ion-icon [name]="isMuted ? 'mic-off' : 'mic'"></ion-icon>
            </button>
          </div>
        </div>

        <!-- Live Details Form -->
        <div class="form-section">
          <!-- Title -->
          <ion-item>
            <ion-label position="floating">Live Title</ion-label>
            <ion-input
              [(ngModel)]="liveTitle"
              placeholder="What are you streaming?"
              maxlength="150"
            ></ion-input>
          </ion-item>

          <div class="char-count">{{ liveTitle.length }}/150</div>

          <!-- Description -->
          <ion-item>
            <ion-label position="floating">Description</ion-label>
            <ion-textarea
              [(ngModel)]="liveDescription"
              placeholder="Add details about your stream..."
              rows="3"
              maxlength="500"
            ></ion-textarea>
          </ion-item>

          <div class="char-count">{{ liveDescription.length }}/500</div>

          <!-- Category -->
          <ion-item>
            <ion-label>Category</ion-label>
            <ion-select [(ngModel)]="selectedCategory">
              <ion-select-option value="fashion">Fashion</ion-select-option>
              <ion-select-option value="beauty">Beauty</ion-select-option>
              <ion-select-option value="lifestyle">Lifestyle</ion-select-option>
              <ion-select-option value="entertainment">Entertainment</ion-select-option>
              <ion-select-option value="shopping">Shopping</ion-select-option>
              <ion-select-option value="other">Other</ion-select-option>
            </ion-select>
          </ion-item>

          <!-- Thumbnail -->
          <ion-item>
            <ion-label>Thumbnail</ion-label>
            <ion-thumbnail slot="end" *ngIf="thumbnailPreview">
              <img [src]="thumbnailPreview" />
            </ion-thumbnail>
            <input
              type="file"
              #thumbnailInput
              accept="image/*"
              (change)="onThumbnailSelected($event)"
              style="display: none"
            />
            <ion-button fill="clear" (click)="thumbnailInput.click()">
              <ion-icon name="image" slot="icon-only"></ion-icon>
            </ion-button>
          </ion-item>

          <!-- Notify Followers -->
          <ion-item>
            <ion-label>Notify Followers</ion-label>
            <ion-checkbox
              slot="start"
              [(ngModel)]="notifyFollowers"
            ></ion-checkbox>
          </ion-item>

          <!-- Shopping Integration -->
          <ion-item button (click)="selectProductsForShop()">
            <ion-icon name="bag" slot="start"></ion-icon>
            <ion-label>
              <h3>Add Products for Sale</h3>
              <p *ngIf="selectedProducts.length > 0">{{ selectedProducts.length }} products selected</p>
              <p *ngIf="selectedProducts.length === 0">Tap to add products for live shopping</p>
            </ion-label>
          </ion-item>
        </div>

        <!-- Share Location Toggle -->
        <ion-item>
          <ion-label>Share Location</ion-label>
          <ion-checkbox
            slot="start"
            [(ngModel)]="shareLocation"
          ></ion-checkbox>
        </ion-item>

        <!-- Start Live Button -->
        <ion-button
          expand="block"
          class="start-live-btn"
          (click)="startLive()"
          [disabled]="!liveTitle.trim() || isStarting"
        >
          <ion-spinner name="crescent" *ngIf="isStarting"></ion-spinner>
          {{ isStarting ? 'Starting...' : 'Start Live Stream' }}
        </ion-button>
      </div>

      <!-- Live Streaming Phase -->
      <div *ngIf="isLive" class="live-phase">
        <!-- Live Video -->
        <div class="live-video-container">
          <video #liveVideo autoplay playsinline class="live-video"></video>

          <!-- Live Badge -->
          <div class="live-badge">
            <span class="live-indicator"></span>
            <span>LIVE</span>
            <span class="viewer-count">{{ viewerCount }} watching</span>
          </div>

          <!-- Controls Overlay -->
          <div class="live-controls">
            <ion-button
              fill="clear"
              color="light"
              (click)="toggleCamera()"
            >
              <ion-icon [name]="isCameraOn ? 'camera' : 'camera-off'"></ion-icon>
            </ion-button>

            <ion-button
              fill="clear"
              color="light"
              (click)="toggleMute()"
            >
              <ion-icon [name]="isMuted ? 'mic-off' : 'mic'"></ion-icon>
            </ion-button>

            <ion-button
              fill="clear"
              color="light"
              (click)="toggleFullscreen()"
            >
              <ion-icon name="expand"></ion-icon>
            </ion-button>

            <ion-button
              fill="clear"
              color="light"
              (click)="openSettings()"
            >
              <ion-icon name="settings"></ion-icon>
            </ion-button>

            <ion-button
              fill="clear"
              color="danger"
              (click)="endLive()"
            >
              <ion-icon name="stop-circle"></ion-icon>
            </ion-button>
          </div>
        </div>

        <!-- Live Info Sidebar -->
        <div class="live-info">
          <div class="stream-title">
            <h2>{{ liveTitle }}</h2>
            <p class="category">{{ selectedCategory }}</p>
          </div>

          <!-- Live Chat -->
          <div class="live-chat">
            <div class="chat-messages" #chatMessagesContainer>
              <div
                *ngFor="let message of chatMessages"
                class="chat-message"
              >
                <strong>{{ message.userName }}:</strong>
                <span>{{ message.content }}</span>
              </div>
            </div>

            <div class="chat-input">
              <input
                type="text"
                placeholder="Add a comment..."
                [(ngModel)]="chatInput"
                (keyup.enter)="sendChatMessage()"
              />
              <ion-button
                fill="clear"
                size="small"
                (click)="sendChatMessage()"
              >
                <ion-icon name="send"></ion-icon>
              </ion-button>
            </div>
          </div>

          <!-- Active Products -->
          <div *ngIf="selectedProducts.length > 0" class="active-products">
            <h4>Featured Products</h4>
            <div class="products-carousel">
              <div
                *ngFor="let product of selectedProducts"
                class="product-card"
              >
                <img [src]="product.image" />
                <p class="product-name">{{ product.name }}</p>
                <p class="product-price">₹{{ product.price }}</p>
                <ion-button size="small" fill="solid">
                  Buy
                </ion-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    ion-content {
      --background: #000;
    }

    .setup-phase {
      padding: 16px;
    }

    .camera-preview {
      position: relative;
      width: 100%;
      aspect-ratio: 9 / 16;
      background: #222;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 20px;
    }

    .preview-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .preview-controls {
      position: absolute;
      bottom: 12px;
      right: 12px;
      display: flex;
      gap: 8px;
    }

    .control-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.5);
      border: none;
      color: white;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .form-section {
      background: #1a1a1a;
      border-radius: 12px;
      padding: 12px;
      margin-bottom: 16px;
    }

    ion-item {
      --background: transparent;
      --padding-start: 0;
      --padding-end: 0;
      border-bottom: 1px solid #333;
      margin-bottom: 12px;
    }

    ion-item:last-child {
      border-bottom: none;
    }

    .char-count {
      text-align: right;
      font-size: 11px;
      color: #666;
      margin-top: 4px;
      margin-bottom: 12px;
    }

    .start-live-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin-top: 20px;
    }

    .live-phase {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 12px;
      height: 100%;
      padding: 12px;
    }

    .live-video-container {
      position: relative;
      background: #000;
      border-radius: 12px;
      overflow: hidden;
    }

    .live-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .live-badge {
      position: absolute;
      top: 16px;
      left: 16px;
      background: rgba(255, 0, 0, 0.8);
      color: white;
      padding: 6px 12px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: bold;
      font-size: 12px;
    }

    .live-indicator {
      width: 8px;
      height: 8px;
      background: white;
      border-radius: 50%;
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .viewer-count {
      font-size: 11px;
      opacity: 0.9;
    }

    .live-controls {
      position: absolute;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
    }

    .live-controls ion-button {
      margin: 0;
    }

    .live-info {
      background: #1a1a1a;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      color: white;
    }

    .stream-title {
      padding: 12px;
      border-bottom: 1px solid #333;
    }

    .stream-title h2 {
      font-size: 14px;
      margin: 0 0 6px 0;
    }

    .category {
      font-size: 11px;
      color: #999;
      margin: 0;
      text-transform: capitalize;
    }

    .live-chat {
      flex: 1;
      display: flex;
      flex-direction: column;
      border-bottom: 1px solid #333;
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      font-size: 12px;
    }

    .chat-message {
      margin-bottom: 8px;
      line-height: 1.3;
    }

    .chat-message strong {
      color: #667eea;
      margin-right: 4px;
    }

    .chat-input {
      display: flex;
      gap: 8px;
      padding: 8px;
      border-top: 1px solid #333;
    }

    .chat-input input {
      flex: 1;
      background: #222;
      border: none;
      border-radius: 20px;
      padding: 8px 12px;
      color: white;
      font-size: 12px;
      outline: none;
    }

    .chat-input input::placeholder {
      color: #666;
    }

    .active-products {
      padding: 12px;
      border-top: 1px solid #333;
    }

    .active-products h4 {
      font-size: 12px;
      margin: 0 0 8px 0;
      text-transform: uppercase;
      color: #999;
    }

    .products-carousel {
      display: flex;
      gap: 8px;
      overflow-x: auto;
    }

    .product-card {
      flex: 0 0 80px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .product-card img {
      width: 100%;
      aspect-ratio: 1;
      border-radius: 8px;
      object-fit: cover;
    }

    .product-name {
      font-size: 10px;
      margin: 0;
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 100%;
    }

    .product-price {
      font-size: 11px;
      font-weight: bold;
      color: #667eea;
      margin: 0;
    }

    @media (max-width: 768px) {
      .live-phase {
        grid-template-columns: 1fr;
      }

      .live-info {
        display: none;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoLiveComponent implements OnInit, OnDestroy {
  // Setup State
  liveTitle: string = '';
  liveDescription: string = '';
  selectedCategory: string = 'fashion';
  thumbnailPreview: string | null = null;
  notifyFollowers: boolean = true;
  shareLocation: boolean = false;
  selectedProducts: any[] = [];

  // Live State
  isLive: boolean = false;
  isStarting: boolean = false;
  isCameraOn: boolean = true;
  isMuted: boolean = false;
  viewerCount: number = 0;

  // Chat
  chatInput: string = '';
  chatMessages: any[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastController: ToastController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.initializeCamera();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeCamera() {
    // Initialize camera stream
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: true
    }).then(stream => {
      const video = document.querySelector('video[#cameraPreview]') as HTMLVideoElement;
      if (video) {
        video.srcObject = stream;
      }
    }).catch(error => {
      console.error('Failed to access camera:', error);
      this.showToast('Camera access denied', 'danger');
    });
  }

  switchCamera() {
    console.log('📱 Switch camera');
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
  }

  onThumbnailSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.thumbnailPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  selectProductsForShop() {
    console.log('🛍️ Select products for shopping');
  }

  startLive() {
    if (!this.liveTitle.trim()) return;

    this.isStarting = true;

    const formData = new FormData();
    formData.append('title', this.liveTitle);
    formData.append('description', this.liveDescription);
    formData.append('category', this.selectedCategory);
    formData.append('notifyFollowers', this.notifyFollowers.toString());
    formData.append('shareLocation', this.shareLocation.toString());

    this.selectedProducts.forEach(product => {
      formData.append('products', product.id);
    });

    this.http.post('/api/live/start', formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.isStarting = false;
          this.isLive = true;
          this.showToast('Live stream started!', 'success');
          // Initialize WebSocket or similar for live updates
        },
        error: (error) => {
          console.error('Failed to start live stream:', error);
          this.isStarting = false;
          this.showToast('Failed to start stream', 'danger');
        }
      });
  }

  toggleCamera() {
    this.isCameraOn = !this.isCameraOn;
  }

  toggleFullscreen() {
    console.log('📺 Toggle fullscreen');
  }

  openSettings() {
    console.log('⚙️ Open live settings');
  }

  sendChatMessage() {
    if (!this.chatInput.trim()) return;

    // Send chat message
    this.http.post('/api/live/chat', {
      content: this.chatInput
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.chatInput = '';
        },
        error: (error) => console.error('Failed to send chat message:', error)
      });
  }

  endLive() {
    this.http.post('/api/live/end', {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.showToast('Live stream ended', 'success');
          this.close();
        },
        error: (error) => {
          console.error('Failed to end live stream:', error);
          this.showToast('Failed to end stream', 'danger');
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
