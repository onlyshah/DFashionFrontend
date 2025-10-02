import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-admin-loading',
    imports: [CommonModule],
    template: `
    <div class="loading-container" [class.fullscreen]="fullscreen">
      <div class="loading-content">
        <!-- Modern Spinner -->
        <div class="modern-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
        </div>
        
        <!-- Loading Text -->
        <div class="loading-text">
          <h3>{{ title }}</h3>
          <p>{{ message }}</p>
        </div>
        
        <!-- Progress Bar (if progress is provided) -->
        <div class="progress-container" *ngIf="progress !== undefined">
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="progress"></div>
          </div>
          <span class="progress-text">{{ progress }}%</span>
        </div>
      </div>
    </div>
  `,
    styleUrls: ['./loading.component.scss']
})
export class AdminLoadingComponent {
  @Input() title: string = 'Loading';
  @Input() message: string = 'Please wait while we prepare your content...';
  @Input() fullscreen: boolean = false;
  @Input() progress?: number;
}
