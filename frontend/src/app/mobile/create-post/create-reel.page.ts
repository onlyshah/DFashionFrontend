/**
 * 🎬 Create Reel Component
 * TikTok/Instagram Reels style short video creation
 */

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ContentCreationApi } from 'src/app/core/api/content-creation.api';

@Component({
  selector: 'app-create-reel',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="close()">
            <ion-icon name="close" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>New Reel</ion-title>
        <ion-buttons slot="end">
          <ion-button
            [disabled]="!selectedVideo || isUploading"
            (click)="publishReel()"
            strong
          >
            {{ isUploading ? 'Posting...' : 'Post' }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="reel-container">
        <!-- Video Selection -->
        <div *ngIf="!selectedVideo" class="upload-section">
          <div class="upload-area">
            <ion-icon name="videocam" class="upload-icon"></ion-icon>
            <h2>Create a Reel</h2>
            <p>Share a short video (15 sec - 10 min)</p>

            <input
              type="file"
              #fileInput
              accept="video/*"
              (change)="onVideoSelected($event)"
              style="display: none"
            />

            <div class="button-group">
              <ion-button
                expand="block"
                fill="solid"
                (click)="fileInput.click()"
                class="upload-btn"
              >
                <ion-icon name="cloud-upload" slot="start"></ion-icon>
                Choose Video
              </ion-button>

              <ion-button
                expand="block"
                fill="outline"
                (click)="recordVideo()"
                class="record-btn"
              >
                <ion-icon name="radio-button-on" slot="start"></ion-icon>
                Record Reel
              </ion-button>
            </div>
          </div>
        </div>

        <!-- Reel Editor -->
        <div *ngIf="selectedVideo" class="reel-editor">
          <!-- Video Preview -->
          <div class="video-container">
            <video
              [src]="selectedVideo"
              controls
              class="video-preview"
            ></video>

            <!-- Duration overlay -->
            <div class="video-info">
              Duration: {{ videoDuration }}s
            </div>
          </div>

          <!-- Editor Tabs -->
          <ion-tabs [(selectedIndex)]="editorTab">
            <!-- Caption -->
            <ion-tab>
              <ng-template ionTabLabel>
                <ion-icon name="create"></ion-icon>
                <span>Caption</span>
              </ng-template>

              <div class="tab-content">
                <ion-item>
                  <ion-textarea
                    placeholder="Write a caption..."
                    [(ngModel)]="caption"
                    rows="6"
                  ></ion-textarea>
                </ion-item>

                <div class="character-count">
                  {{ caption.length }}/2200
                </div>

                <!-- Hashtags -->
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

                <!-- Music -->
                <ion-item button (click)="selectMusic()">
                  <ion-icon name="musical-notes" slot="start"></ion-icon>
                  <ion-label>
                    <h3>Add Music</h3>
                    <p *ngIf="selectedMusic">{{ selectedMusic }}</p>
                    <p *ngIf="!selectedMusic">Select or create music</p>
                  </ion-label>
                </ion-item>
              </div>
            </ion-tab>

            <!-- Effects -->
            <ion-tab>
              <ng-template ionTabLabel>
                <ion-icon name="sparkles"></ion-icon>
                <span>Effects</span>
              </ng-template>

              <div class="tab-content">
                <h3>Video Effects</h3>

                <!-- Filter Section -->
                <div class="section">
                  <h4>Filters</h4>
                  <div class="filter-grid">
                    <button
                      *ngFor="let filter of filters"
                      (click)="applyFilter(filter)"
                      [class.selected]="selectedFilter === filter"
                      class="filter-btn"
                    >
                      <span class="filter-preview" [style.filter]="filter.css"></span>
                      <p>{{ filter.name }}</p>
                    </button>
                  </div>
                </div>

                <!-- Speed Control -->
                <div class="section">
                  <h4>Video Speed</h4>
                  <div class="speed-options">
                    <button
                      *ngFor="let speed of speeds"
                      (click)="setSpeed(speed)"
                      [class.selected]="videoSpeed === speed"
                    >
                      {{ speed }}x
                    </button>
                  </div>
                </div>

                <!-- Transitions -->
                <div class="section">
                  <h4>Transitions</h4>
                  <div class="transition-grid">
                    <button
                      *ngFor="let transition of transitions"
                      (click)="applyTransition(transition)"
                    >
                      {{ transition }}
                    </button>
                  </div>
                </div>
              </div>
            </ion-tab>

            <!-- Audio -->
            <ion-tab>
              <ng-template ionTabLabel>
                <ion-icon name="volume-high"></ion-icon>
                <span>Audio</span>
              </ng-template>

              <div class="tab-content">
                <h3>Audio Settings</h3>

                <ion-item>
                  <ion-range
                    [(ngModel)]="audioVolume"
                    min="0"
                    max="100"
                    slot="start"
                  >
                    <span slot="start">
                      <ion-icon name="volume-low"></ion-icon>
                    </span>
                    <span slot="end">
                      <ion-icon name="volume-high"></ion-icon>
                    </span>
                  </ion-range>
                </ion-item>

                <!-- Music Volume -->
                <div class="section">
                  <h4>Music Volume</h4>
                  <ion-item>
                    <ion-range
                      [(ngModel)]="musicVolume"
                      min="0"
                      max="100"
                    ></ion-range>
                  </ion-item>
                </div>

                <!-- Original Audio -->
                <ion-item>
                  <ion-label>Original Audio</ion-label>
                  <ion-toggle
                    [(ngModel)]="useOriginalAudio"
                  ></ion-toggle>
                </ion-item>
              </div>
            </ion-tab>

            <!-- Share -->
            <ion-tab>
              <ng-template ionTabLabel>
                <ion-icon name="share-social"></ion-icon>
                <span>Share</span>
              </ng-template>

              <div class="tab-content">
                <ion-list>
                  <ion-item>
                    <ion-label>Share to Feed</ion-label>
                    <ion-checkbox
                      slot="start"
                      [(ngModel)]="shareToFeed"
                    ></ion-checkbox>
                  </ion-item>

                  <ion-item>
                    <ion-label>Feature on Reels Tab</ion-label>
                    <ion-checkbox
                      slot="start"
                      [(ngModel)]="featureOnReels"
                    ></ion-checkbox>
                  </ion-item>

                  <ion-item>
                    <ion-label>Allow Comments</ion-label>
                    <ion-checkbox
                      slot="start"
                      [(ngModel)]="allowComments"
                    ></ion-checkbox>
                  </ion-item>

                  <ion-item>
                    <ion-label>Allow Likes</ion-label>
                    <ion-checkbox
                      slot="start"
                      [(ngModel)]="allowLikes"
                    ></ion-checkbox>
                  </ion-item>

                  <ion-item>
                    <ion-label>Allow Shares</ion-label>
                    <ion-checkbox
                      slot="start"
                      [(ngModel)]="allowShares"
                    ></ion-checkbox>
                  </ion-item>
                </ion-list>
              </div>
            </ion-tab>
          </ion-tabs>

          <!-- Publish Button -->
          <div class="action-section">
            <ion-button
              expand="block"
              [disabled]="isUploading"
              (click)="publishReel()"
            >
              <ion-spinner name="crescent" *ngIf="isUploading"></ion-spinner>
              {{ isUploading ? 'Publishing...' : 'Publish Reel' }}
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    ion-content {
      --background: #fff;
    }

    .reel-container {
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

    .button-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 20px;
    }

    .reel-editor {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .video-container {
      position: relative;
      width: 100%;
      height: 300px;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .video-preview {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .video-info {
      position: absolute;
      bottom: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
    }

    ion-tabs {
      flex: 1;
      overflow: hidden;
    }

    .tab-content {
      padding: 16px;
      overflow-y: auto;
      height: 100%;
    }

    .character-count {
      text-align: right;
      font-size: 12px;
      color: #999;
      margin-top: 8px;
      padding: 0 16px;
    }

    .hashtags-section {
      padding: 0 16px;
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

    .section {
      margin-bottom: 20px;
    }

    .section h4 {
      font-size: 13px;
      font-weight: bold;
      margin-bottom: 12px;
      padding: 0 0;
    }

    .filter-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .filter-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      background: none;
      border: 2px solid #ddd;
      border-radius: 8px;
      padding: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-btn:hover,
    .filter-btn.selected {
      border-color: var(--ion-color-primary);
      background: rgba(var(--ion-color-primary-rgb), 0.05);
    }

    .filter-preview {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 4px;
    }

    .filter-btn p {
      font-size: 11px;
      margin: 0;
      text-align: center;
    }

    .speed-options,
    .transition-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }

    .speed-options button,
    .transition-grid button {
      padding: 12px 8px;
      border: 2px solid #ddd;
      border-radius: 8px;
      background: white;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .speed-options button:hover,
    .speed-options button.selected,
    .transition-grid button:hover {
      border-color: var(--ion-color-primary);
      background: rgba(var(--ion-color-primary-rgb), 0.05);
    }

    .action-section {
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
export class CreateReelComponent implements OnInit, OnDestroy {
  selectedVideo: string | null = null;
  videoDuration: number = 0;
  isUploading: boolean = false;
  editorTab: number = 0;

  // Caption & Metadata
  caption: string = '';
  suggestedHashtags = ['#reels', '#trending', '#foryou', '#viral', '#fashion', '#entertainment'];

  // Music
  selectedMusic: string | null = null;

  // Effects
  filters = [
    { name: 'Normal', css: 'none' },
    { name: 'Brighten', css: 'brightness(1.2)' },
    { name: 'Dark', css: 'brightness(0.8)' },
    { name: 'Warm', css: 'sepia(0.5)' },
    { name: 'Cool', css: 'hue-rotate(200deg)' },
    { name: 'B&W', css: 'grayscale(1)' }
  ];
  selectedFilter: any = null;

  speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
  videoSpeed: number = 1;

  transitions = ['Fade', 'Slide', 'Zoom', 'Bounce', 'Spin'];

  // Audio
  audioVolume: number = 100;
  musicVolume: number = 100;
  useOriginalAudio: boolean = true;

  // Share Options
  shareToFeed: boolean = true;
  featureOnReels: boolean = true;
  allowComments: boolean = true;
  allowLikes: boolean = true;
  allowShares: boolean = true;

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

  onVideoSelected(event: any) {
    const file: File = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.selectedVideo = e.target.result;

        // Get video duration
        const video = new (window as any).Video();
        video.onloadedmetadata = () => {
          this.videoDuration = Math.floor(video.duration);
        };
        video.src = e.target.result;
      };

      reader.readAsDataURL(file);
    }
  }

  recordVideo() {
    console.log('📹 Open video recorder');
    // Implement video recording capability
  }

  selectMusic() {
    console.log('🎵 Open music selection');
    // Implement music selection modal
  }

  applyFilter(filter: any) {
    this.selectedFilter = filter;
  }

  setSpeed(speed: number) {
    this.videoSpeed = speed;
  }

  applyTransition(transition: string) {
    console.log('✨ Apply transition:', transition);
  }

  addHashtag(tag: string) {
    if (!this.caption.includes(tag)) {
      this.caption += ' ' + tag;
    }
  }

  publishReel() {
    if (!this.selectedVideo || this.isUploading) return;

    this.isUploading = true;

    const formData = new FormData();
    formData.append('caption', this.caption);
    formData.append('shareToFeed', this.shareToFeed.toString());
    formData.append('featureOnReels', this.featureOnReels.toString());
    formData.append('allowComments', this.allowComments.toString());
    formData.append('allowLikes', this.allowLikes.toString());
    formData.append('allowShares', this.allowShares.toString());
    formData.append('audioVolume', this.audioVolume.toString());
    formData.append('musicVolume', this.musicVolume.toString());

    this.contentCreationApi.createReel(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.isUploading = false;
          this.showToast('Reel published successfully!', 'success');
          this.close();
        },
        error: (error) => {
          console.error('Failed to publish reel:', error);
          this.isUploading = false;
          this.showToast('Failed to publish reel', 'danger');
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
