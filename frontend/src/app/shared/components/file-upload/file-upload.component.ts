import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadService, UploadProgress, UploadResponse, MultipleUploadResponse } from '../../../core/services/file-upload.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss'
})
export class FileUploadComponent implements OnInit, OnDestroy {
  @Input() uploadType: 'image' | 'video' | 'document' | 'media' | 'avatar' | 'product' | 'story' = 'image';
  @Input() multiple: boolean = false;
  @Input() maxFiles: number = 5;
  @Input() uploadTitle: string = 'Upload Files';
  @Input() uploadDescription: string = 'Drag and drop files here or click to browse';
  @Input() autoUpload: boolean = false;

  @Output() filesSelected = new EventEmitter<File[]>();
  @Output() uploadComplete = new EventEmitter<any>();
  @Output() uploadError = new EventEmitter<string>();
  @Output() uploadProgress = new EventEmitter<UploadProgress>();

  selectedFiles: File[] = [];
  uploadedFiles: any[] = [];
  isDragOver = false;
  isUploading = false;
  uploadComplete = false;
  uploadError: string | null = null;
  uploadProgress: UploadProgress | null = null;
  validationErrors: string[] = [];
  acceptedTypes = '';

  private uploadSubscription?: Subscription;
  private progressSubscription?: Subscription;

  constructor(private fileUploadService: FileUploadService) {}

  ngOnInit() {
    this.setAcceptedTypes();
    this.setUploadTexts();

    // Subscribe to upload progress
    this.progressSubscription = this.fileUploadService.uploadProgress$.subscribe(progress => {
      this.uploadProgress = progress;
      if (progress) {
        this.uploadProgress.emit(progress);
      }
    });
  }

  ngOnDestroy() {
    if (this.uploadSubscription) {
      this.uploadSubscription.unsubscribe();
    }
    if (this.progressSubscription) {
      this.progressSubscription.unsubscribe();
    }
  }

  private setAcceptedTypes() {
    switch (this.uploadType) {
      case 'image':
      case 'avatar':
      case 'product':
        this.acceptedTypes = '.jpg,.jpeg,.png,.gif,.webp';
        break;
      case 'video':
        this.acceptedTypes = '.mp4,.avi,.mov,.wmv,.flv,.webm';
        break;
      case 'document':
        this.acceptedTypes = '.pdf,.doc,.docx,.txt';
        break;
      case 'media':
      case 'story':
        this.acceptedTypes = '.jpg,.jpeg,.png,.gif,.webp,.mp4,.avi,.mov,.wmv,.flv,.webm';
        break;
    }
  }

  private setUploadTexts() {
    if (!this.uploadTitle || this.uploadTitle === 'Upload Files') {
      switch (this.uploadType) {
        case 'avatar':
          this.uploadTitle = 'Upload Avatar';
          this.uploadDescription = 'Choose a profile picture';
          break;
        case 'product':
          this.uploadTitle = 'Upload Product Images';
          this.uploadDescription = 'Add images for your product (max 5)';
          break;
        case 'story':
          this.uploadTitle = 'Upload Story Media';
          this.uploadDescription = 'Share a photo or video';
          break;
        case 'video':
          this.uploadTitle = 'Upload Video';
          this.uploadDescription = 'Choose a video file';
          break;
        case 'document':
          this.uploadTitle = 'Upload Document';
          this.uploadDescription = 'Choose a document file';
          break;
        default:
          this.uploadTitle = 'Upload Images';
          this.uploadDescription = 'Choose image files';
      }
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = Array.from(event.dataTransfer?.files || []);
    this.handleFiles(files);
  }

  onFileSelected(event: any) {
    const files = Array.from(event.target.files || []);
    this.handleFiles(files);

    // Reset the input
    event.target.value = '';
  }

  private handleFiles(files: File[]) {
    this.validationErrors = [];
    this.uploadError = null;

    if (!this.multiple && files.length > 1) {
      this.validationErrors.push('Only one file is allowed');
      return;
    }

    if (this.multiple && files.length > this.maxFiles) {
      this.validationErrors.push(`Maximum ${this.maxFiles} files allowed`);
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    files.forEach(file => {
      const validation = this.validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        this.validationErrors.push(...validation.errors);
      }
    });

    if (validFiles.length > 0) {
      if (this.multiple) {
        this.selectedFiles = [...this.selectedFiles, ...validFiles];
        if (this.selectedFiles.length > this.maxFiles) {
          this.selectedFiles = this.selectedFiles.slice(0, this.maxFiles);
          this.validationErrors.push(`Only first ${this.maxFiles} files selected`);
        }
      } else {
        this.selectedFiles = [validFiles[0]];
      }

      this.filesSelected.emit(this.selectedFiles);

      if (this.autoUpload) {
        this.startUpload();
      }
    }
  }

  private validateFile(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const allowedTypes = this.fileUploadService.getAllowedTypes(this.getValidationType());
    const maxSize = this.fileUploadService.getMaxFileSize(this.getValidationType());
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    if (!allowedTypes.includes(extension)) {
      errors.push(`${file.name}: Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
    }

    if (file.size > maxSize) {
      errors.push(`${file.name}: File too large. Max size: ${this.fileUploadService.formatFileSize(maxSize)}`);
    }

    return { valid: errors.length === 0, errors };
  }

  private getValidationType(): 'image' | 'video' | 'document' {
    switch (this.uploadType) {
      case 'video':
        return 'video';
      case 'document':
        return 'document';
      default:
        return 'image';
    }
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.filesSelected.emit(this.selectedFiles);
  }

  clearFiles() {
    this.selectedFiles = [];
    this.uploadedFiles = [];
    this.uploadComplete = false;
    this.uploadError = null;
    this.validationErrors = [];
    this.fileUploadService.resetProgress();
    this.filesSelected.emit(this.selectedFiles);
  }

  startUpload() {
    if (this.selectedFiles.length === 0) return;

    this.isUploading = true;
    this.uploadError = null;
    this.uploadComplete = false;

    // Choose the appropriate upload method based on type
    let uploadObservable;

    switch (this.uploadType) {
      case 'avatar':
        uploadObservable = this.fileUploadService.uploadAvatar(this.selectedFiles[0]);
        break;
      case 'product':
        uploadObservable = this.fileUploadService.uploadProductImages(this.selectedFiles);
        break;
      case 'story':
        uploadObservable = this.fileUploadService.uploadStoryMedia(this.selectedFiles[0]);
        break;
      case 'media':
        uploadObservable = this.fileUploadService.uploadPostMedia(this.selectedFiles);
        break;
      default:
        if (this.multiple) {
          uploadObservable = this.fileUploadService.uploadMultipleImages(this.selectedFiles);
        } else {
          uploadObservable = this.fileUploadService.uploadImage(this.selectedFiles[0]);
        }
    }

    this.uploadSubscription = uploadObservable.subscribe({
      next: (response) => {
        if (response) {
          this.handleUploadSuccess(response);
        }
      },
      error: (error) => {
        this.handleUploadError(error);
      }
    });
  }

  private handleUploadSuccess(response: UploadResponse | MultipleUploadResponse) {
    this.isUploading = false;
    this.uploadComplete = true;

    if ('data' in response && response.data) {
      if (Array.isArray(response.data.files)) {
        this.uploadedFiles = response.data.files;
      } else if (Array.isArray(response.data.images)) {
        this.uploadedFiles = response.data.images;
      } else if (Array.isArray(response.data.media)) {
        this.uploadedFiles = response.data.media;
      } else {
        this.uploadedFiles = [response.data];
      }
    }

    this.uploadComplete.emit(response);
  }

  private handleUploadError(error: any) {
    this.isUploading = false;
    this.uploadError = error.error?.message || error.message || 'Upload failed';
    this.uploadError.emit(this.uploadError);
  }

  resetUpload() {
    this.clearFiles();
    this.uploadComplete = false;
    this.uploadError = null;
  }

  // UI Helper Methods
  getUploadIcon(): string {
    switch (this.uploadType) {
      case 'video': return 'typcn typcn-video';
      case 'document': return 'typcn typcn-document';
      case 'avatar': return 'typcn typcn-user';
      default: return 'typcn typcn-image';
    }
  }

  getAllowedTypesText(): string {
    const types = this.fileUploadService.getAllowedTypes(this.getValidationType());
    return types.join(', ').toUpperCase();
  }

  getMaxSizeText(): string {
    const maxSize = this.fileUploadService.getMaxFileSize(this.getValidationType());
    return this.fileUploadService.formatFileSize(maxSize);
  }

  getProgressBarClass(): string {
    if (!this.uploadProgress) return 'bg-primary';

    if (this.uploadProgress.status === 'error') return 'bg-danger';
    if (this.uploadProgress.status === 'completed') return 'bg-success';
    return 'bg-primary';
  }

  isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  getFilePreview(file: File): string {
    return URL.createObjectURL(file);
  }

  getFileIcon(file: File): string {
    if (file.type.startsWith('video/')) return 'typcn typcn-video';
    if (file.type.includes('pdf')) return 'typcn typcn-document';
    if (file.type.includes('word')) return 'typcn typcn-document-text';
    return 'typcn typcn-document';
  }

  formatFileSize(bytes: number): string {
    return this.fileUploadService.formatFileSize(bytes);
  }
}
