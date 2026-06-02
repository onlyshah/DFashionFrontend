import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-create-modal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="create-modal-overlay" (click)="closeModal($event)">
      <div class="create-modal" (click)="$event.stopPropagation()">
        <button class="close-btn" (click)="closeModal()" aria-label="Close">✕</button>
        
        <h2 class="modal-title">Create New</h2>

        <div class="create-options">
          <!-- Create Post -->
          <button class="create-option" routerLink="/create-post" (click)="closeModal()">
            <div class="option-icon">
              <i class="fas fa-image"></i>
            </div>
            <div class="option-content">
              <h3>Create Post</h3>
              <p>Share a photo or video</p>
            </div>
          </button>

          <!-- Create Reel -->
          <button class="create-option" routerLink="/create-reel" (click)="closeModal()">
            <div class="option-icon">
              <i class="fas fa-video"></i>
            </div>
            <div class="option-content">
              <h3>Create Reel</h3>
              <p>Make a short video</p>
            </div>
          </button>

          <!-- Create Story -->
          <button class="create-option" routerLink="/create-story" (click)="closeModal()">
            <div class="option-icon">
              <i class="fas fa-layer-group"></i>
            </div>
            <div class="option-content">
              <h3>Create Story</h3>
              <p>Share a temporary post</p>
            </div>
          </button>

          <!-- Upload Product -->
          <button class="create-option" routerLink="/create-product" (click)="closeModal()">
            <div class="option-icon">
              <i class="fas fa-box"></i>
            </div>
            <div class="option-content">
              <h3>Upload Product</h3>
              <p>Sell something new</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .create-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1100;
      animation: fadeIn 0.2s ease;
    }

    .create-modal {
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15);
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      animation: slideUp 0.3s ease;
    }

    .close-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 32px;
      height: 32px;
      border: none;
      background: #f0f0f0;
      border-radius: 50%;
      cursor: pointer;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      z-index: 10;
    }

    .close-btn:hover {
      background: #e0e0e0;
    }

    .modal-title {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0;
      padding: 24px 24px 16px;
      font-family: 'Playfair Display', Georgia, serif;
    }

    .create-options {
      display: flex;
      flex-direction: column;
      gap: 0;
      padding: 0;
    }

    .create-option {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 24px;
      border: none;
      background: none;
      cursor: pointer;
      transition: all 0.2s ease;
      border-bottom: 1px solid #f0f0f0;
      text-align: left;
    }

    .create-option:last-child {
      border-bottom: none;
    }

    .create-option:hover {
      background: #f9f9f9;
    }

    .create-option:hover .option-icon {
      background: #e8521a;
      color: white;
    }

    .option-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: #e8521a;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .option-content {
      flex: 1;
    }

    .option-content h3 {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 4px;
    }

    .option-content p {
      font-size: 13px;
      color: #8c7e76;
      margin: 0;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .create-modal-overlay {
        align-items: flex-end;
      }

      .create-modal {
        width: 100%;
        max-width: 100%;
        border-radius: 16px 16px 0 0;
        max-height: 70vh;
      }
    }
  `]
})
export class CreateModalComponent {
  @Output() onClose = new EventEmitter<void>();

  closeModal(event?: any): void {
    if (event && event.target !== event.currentTarget) {
      return;
    }
    this.onClose.emit();
  }
}
