/**
 * ✏️ Create Story Component
 * Quick story creation with auto-posting after 24 hours
 */

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ContentCreationApi } from 'src/app/core/api/content-creation.api';

@Component({
  selector: 'app-create-story',
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
        <ion-title>New Story</ion-title>
        <ion-buttons slot="end">
          <ion-button
            [disabled]="!selectedImage || isUploading"
            (click)="publishStory()"
            strong
          >
            {{ isUploading ? 'Posting...' : 'Post' }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="story-container">
        <!-- Image Selection -->
        <div *ngIf="!selectedImage" class="upload-section">
          <div class="upload-area">
            <ion-icon name="image" class="upload-icon"></ion-icon>
            <h2>Create a Story</h2>
            <p>Share a photo that disappears in 24 hours</p>

            <input
              type="file"
              #fileInput
              accept="image/*"
              (change)="onFileSelected($event)"
              style="display: none"
            />

            <ion-button
              expand="block"
              fill="solid"
              (click)="fileInput.click()"
              class="upload-btn"
            >
              <ion-icon name="cloud-upload" slot="start"></ion-icon>
              Choose Photo
            </ion-button>
          </div>
        </div>

        <!-- Story Preview & Editor -->
        <div *ngIf="selectedImage" class="story-editor">
          <!-- Image Preview -->
          <div class="image-container">
            <img [src]="selectedImage" class="story-image" />

            <!-- Text Overlay Toolbar -->
            <div class="overlay-toolbar">
              <button
                class="tool-btn"
                (click)="isAddingText = !isAddingText"
                [class.active]="isAddingText"
              >
                <ion-icon name="text"></ion-icon>
              </button>

              <button class="tool-btn" (click)="toggleEmoji()">
                <ion-icon name="happy"></ion-icon>
              </button>

              <button class="tool-btn" (click)="rotateBrightness()">
                <ion-icon name="sunny"></ion-icon>
              </button>

              <button class="tool-btn" (click)="changeUploadImage()">
                <ion-icon name="image"></ion-icon>
              </button>
            </div>

            <!-- Text Input -->
            <div *ngIf="isAddingText" class="text-input-section">
              <ion-input
                placeholder="Add text..."
                [(ngModel)]="overlayText"
                class="overlay-input"
              ></ion-input>
              <div class="color-picker">
                <button
                  *ngFor="let color of textColors"
                  [style.background-color]="color"
                  (click)="textColor = color"
                  [class.selected]="textColor === color"
                ></button>
              </div>
            </div>

            <!-- Emoji Picker -->
            <div *ngIf="showEmojiPicker" class="emoji-section">
              <div class="emoji-grid">
                <button
                  *ngFor="let emoji of emojis"
                  (click)="addEmoji(emoji)"
                  class="emoji-btn"
                >
                  {{ emoji }}
                </button>
              </div>
            </div>

            <!-- Overlay Text Display -->
            <div
              *ngIf="overlayText"
              class="text-overlay"
              [style.color]="textColor"
            >
              {{ overlayText }}
            </div>
          </div>

          <!-- Options -->
          <div class="options-section">
            <ion-list>
              <ion-item>
                <ion-label>Tag Friends</ion-label>
                <ion-button fill="clear" slot="end">
                  <ion-icon name="add" slot="icon-only"></ion-icon>
                </ion-button>
              </ion-item>

              <ion-item>
                <ion-label>Add Location</ion-label>
                <ion-input
                  placeholder="Location"
                  [(ngModel)]="storyLocation"
                ></ion-input>
              </ion-item>

              <ion-item>
                <ion-label>Share to Feed as Post</ion-label>
                <ion-checkbox
                  slot="start"
                  [(ngModel)]="shareToFeed"
                ></ion-checkbox>
              </ion-item>

              <ion-item>
                <ion-label>Hide from specific people</ion-label>
                <ion-button fill="clear" slot="end">
                  <ion-icon name="settings" slot="icon-only"></ion-icon>
                </ion-button>
              </ion-item>
            </ion-list>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <ion-button
              expand="block"
              fill="outline"
              (click)="changeUploadImage()"
            >
              Choose Different Photo
            </ion-button>
            <ion-button
              expand="block"
              [disabled]="isUploading"
              (click)="publishStory()"
            >
              <ion-spinner name="crescent" *ngIf="isUploading"></ion-spinner>
              {{ isUploading ? 'Posting Story...' : 'Post Story' }}
            </ion-button>
          </div>

          <input
            type="file"
            #fileInputChange
            accept="image/*"
            (change)="onFileSelected($event)"
            style="display: none"
          />
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    ion-content {
      --background: #fff;
    }

    .story-container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .upload-section {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .upload-area {
      text-align: center;
      width: 100%;
    }

    .upload-icon {
      font-size: 80px;
      color: #ccc;
      margin-bottom: 20px;
    }

    .upload-area h2 {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .upload-area p {
      color: #999;
      margin-bottom: 30px;
    }

    .upload-btn {
      margin-top: 20px;
    }

    .story-editor {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .image-container {
      position: relative;
      flex: 1;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .story-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .overlay-toolbar {
      position: absolute;
      bottom: 20px;
      left: 20px;
      right: 20px;
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .tool-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s;
    }

    .tool-btn:hover,
    .tool-btn.active {
      background: rgba(255, 255, 255, 0.4);
    }

    .text-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 32px;
      font-weight: bold;
      text-align: center;
      max-width: 80%;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }

    .text-input-section {
      position: absolute;
      bottom: 100px;
      left: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      border-radius: 8px;
      padding: 12px;
      color: white;
    }

    .overlay-input {
      width: 100%;
      color: white;
    }

    .color-picker {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .color-picker button {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      transition: border 0.2s;
    }

    .color-picker button.selected {
      border-color: white;
    }

    .emoji-section {
      position: absolute;
      bottom: 100px;
      left: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      border-radius: 8px;
      padding: 12px;
      max-height: 120px;
      overflow-y: auto;
    }

    .emoji-grid {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 8px;
    }

    .emoji-btn {
      font-size: 24px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
    }

    .emoji-btn:hover {
      transform: scale(1.2);
    }

    .options-section {
      flex-shrink: 0;
      max-height: 300px;
      overflow-y: auto;
      border-top: 1px solid #eee;
    }

    ion-item {
      --padding-end: 0;
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 16px;
      background: #f9f9f9;
      border-top: 1px solid #eee;
    }

    ion-button {
      margin: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateStoryComponent implements OnInit, OnDestroy {
  selectedImage: string | null = null;
  isUploading: boolean = false;

  // Text overlay
  isAddingText: boolean = false;
  overlayText: string = '';
  textColor: string = '#ffffff';
  textColors = ['#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];

  // Emoji
  showEmojiPicker: boolean = false;
  emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '❤️', '🔥', '💯', '🙌', '🎉', '🎊', '🎁', '✨'];

  // Metadata
  storyLocation: string = '';
  shareToFeed: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private contentCreationApi: ContentCreationApi,
    private toastController: ToastController,
    private modalController: ModalController
  ) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.selectedImage = e.target.result;
      };

      reader.readAsDataURL(file);
    }
  }

  changeUploadImage() {
    // Trigger hidden file input for changing image
  }

  rotateBrightness() {
    // Implement brightness adjustment
  }

  toggleEmoji() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(emoji: string) {
    this.overlayText += emoji;
  }

  publishStory() {
    if (!this.selectedImage || this.isUploading) return;

    this.isUploading = true;

    const formData = new FormData();
    formData.append('image', this.selectedImage);
    formData.append('text', this.overlayText);
    formData.append('location', this.storyLocation);
    formData.append('shareToFeed', this.shareToFeed.toString());

    this.contentCreationApi.createStory(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.isUploading = false;
          this.showToast('Story posted successfully!', 'success');
          this.close();
        },
        error: (error) => {
          console.error('Failed to post story:', error);
          this.isUploading = false;
          this.showToast('Failed to post story', 'danger');
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
