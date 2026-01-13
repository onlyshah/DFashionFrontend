import { Component, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SearchService } from '../../../core/services/search.service';

@Component({
    selector: 'app-visual-search',
    imports: [CommonModule, IonicModule],
    templateUrl: './visual-search.component.html',
    styleUrls: ['./visual-search.component.scss']
})
export class VisualSearchComponent {
  @Output() searchResults = new EventEmitter<any>();
  @Output() searchError = new EventEmitter<string>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  isProcessing = false;
  processingMessage = '';
  previewImage: string | null = null;
  selectedFile: File | null = null;
  errorMessage = '';
  supportsBarcodeScanner = false;

  constructor(private searchService: SearchService) {
    this.checkBarcodeSupport();
  }

  private checkBarcodeSupport(): void {
    // Check if device supports barcode scanning
    this.supportsBarcodeScanner = 'BarcodeDetector' in window || 
                                  navigator.mediaDevices?.getUserMedia !== undefined;
  }

  openCamera(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.setAttribute('capture', 'environment');
      this.fileInput.nativeElement.click();
    }
  }

  selectImage(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.removeAttribute('capture');
      this.fileInput.nativeElement.click();
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.showError('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.showError('Image size must be less than 10MB');
      return;
    }

    this.selectedFile = file;
    this.createPreview(file);
    this.clearError();
  }

  private createPreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewImage = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  searchWithImage(): void {
    if (!this.selectedFile) return;

    this.isProcessing = true;
    this.processingMessage = 'Analyzing image...';
    this.clearError();

    this.searchService.searchByImage(this.selectedFile).subscribe({
      next: (result) => {
        this.isProcessing = false;
        this.searchResults.emit(result);
        this.clearPreview();
      },
      error: (error) => {
        this.isProcessing = false;
        const errorMsg = 'Visual search failed. Please try again.';
        this.showError(errorMsg);
        this.searchError.emit(errorMsg);
      }
    });
  }

  async scanBarcode(): Promise<void> {
    if (!this.supportsBarcodeScanner) {
      this.showError('Barcode scanning is not supported on this device');
      return;
    }

    try {
      this.isProcessing = true;
      this.processingMessage = 'Starting barcode scanner...';

      // Use modern Barcode Detection API if available
      if ('BarcodeDetector' in window) {
        await this.scanWithBarcodeDetector();
      } else {
        // Fallback to camera-based scanning
        await this.scanWithCamera();
      }
    } catch (error) {
      console.error('Barcode scanning error:', error);
      this.showError('Barcode scanning failed. Please try again.');
    } finally {
      this.isProcessing = false;
    }
  }

  private async scanWithBarcodeDetector(): Promise<void> {
    // Implementation would use BarcodeDetector API
    // This is a placeholder for the actual implementation
    this.showError('Barcode scanning feature coming soon!');
  }

  private async scanWithCamera(): Promise<void> {
    // Implementation would use camera stream for barcode detection
    // This is a placeholder for the actual implementation
    this.showError('Camera-based barcode scanning feature coming soon!');
  }

  clearPreview(): void {
    this.previewImage = null;
    this.selectedFile = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => this.clearError(), 5000);
  }

  private clearError(): void {
    this.errorMessage = '';
  }
}
