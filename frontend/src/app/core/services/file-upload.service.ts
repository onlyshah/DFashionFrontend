import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpProgressEvent, HttpResponse } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface UploadProgress {
  percentage: number;
  loaded: number;
  total: number;
  status: 'uploading' | 'completed' | 'error';
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    filename: string;
    originalName: string;
    size: number;
    url: string;
    path: string;
    type?: string;
    mimetype?: string;
  };
}

export interface MultipleUploadResponse {
  success: boolean;
  message: string;
  data: {
    files?: any[];
    images?: any[];
    media?: any[];
    count: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private baseUrl = `${environment.apiUrl}/upload`;
  private uploadProgress = new BehaviorSubject<UploadProgress | null>(null);
  public uploadProgress$ = this.uploadProgress.asObservable();

  // Allowed file types
  private allowedImageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  private allowedVideoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
  private allowedDocumentTypes = ['pdf', 'doc', 'docx', 'txt'];

  // Maximum file sizes (in bytes)
  private maxImageSize = 5 * 1024 * 1024; // 5MB
  private maxVideoSize = 50 * 1024 * 1024; // 50MB
  private maxDocumentSize = 10 * 1024 * 1024; // 10MB

  constructor(private http: HttpClient) {}

  /**
   * Upload single image
   */
  uploadImage(file: File): Observable<UploadResponse> {
    if (!this.validateFile(file, 'image')) {
      throw new Error('Invalid image file');
    }

    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<UploadResponse>(`${this.baseUrl}/image`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => this.handleUploadEvent(event)),
      catchError(error => {
        this.uploadProgress.next({ percentage: 0, loaded: 0, total: 0, status: 'error' });
        throw error;
      })
    );
  }

  /**
   * Upload multiple images
   */
  uploadMultipleImages(files: File[]): Observable<MultipleUploadResponse> {
    if (!files || files.length === 0) {
      throw new Error('No files selected');
    }

    // Validate all files
    files.forEach(file => {
      if (!this.validateFile(file, 'image')) {
        throw new Error(`Invalid file: ${file.name}`);
      }
    });

    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    return this.http.post<MultipleUploadResponse>(`${this.baseUrl}/multiple`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => this.handleUploadEvent(event)),
      catchError(error => {
        this.uploadProgress.next({ percentage: 0, loaded: 0, total: 0, status: 'error' });
        throw error;
      })
    );
  }

  /**
   * Upload product images (vendor only)
   */
  uploadProductImages(files: File[]): Observable<MultipleUploadResponse> {
    if (!files || files.length === 0) {
      throw new Error('No files selected');
    }

    if (files.length > 5) {
      throw new Error('Maximum 5 product images allowed');
    }

    // Validate all files
    files.forEach(file => {
      if (!this.validateFile(file, 'image')) {
        throw new Error(`Invalid file: ${file.name}`);
      }
    });

    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    return this.http.post<MultipleUploadResponse>(`${this.baseUrl}/product-images`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => this.handleUploadEvent(event)),
      catchError(error => {
        this.uploadProgress.next({ percentage: 0, loaded: 0, total: 0, status: 'error' });
        throw error;
      })
    );
  }

  /**
   * Upload user avatar
   */
  uploadAvatar(file: File): Observable<UploadResponse> {
    if (!this.validateFile(file, 'image')) {
      throw new Error('Invalid avatar image');
    }

    const formData = new FormData();
    formData.append('avatar', file);

    return this.http.post<UploadResponse>(`${this.baseUrl}/avatar`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => this.handleUploadEvent(event)),
      catchError(error => {
        this.uploadProgress.next({ percentage: 0, loaded: 0, total: 0, status: 'error' });
        throw error;
      })
    );
  }

  /**
   * Upload post media (images/videos)
   */
  uploadPostMedia(files: File[]): Observable<MultipleUploadResponse> {
    if (!files || files.length === 0) {
      throw new Error('No files selected');
    }

    if (files.length > 10) {
      throw new Error('Maximum 10 media files allowed');
    }

    // Validate all files
    files.forEach(file => {
      const isImage = this.isImageFile(file);
      const isVideo = this.isVideoFile(file);
      
      if (!isImage && !isVideo) {
        throw new Error(`Invalid file type: ${file.name}`);
      }

      if (isImage && !this.validateFile(file, 'image')) {
        throw new Error(`Invalid image file: ${file.name}`);
      }

      if (isVideo && !this.validateFile(file, 'video')) {
        throw new Error(`Invalid video file: ${file.name}`);
      }
    });

    const formData = new FormData();
    files.forEach(file => {
      formData.append('media', file);
    });

    return this.http.post<MultipleUploadResponse>(`${this.baseUrl}/post-media`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => this.handleUploadEvent(event)),
      catchError(error => {
        this.uploadProgress.next({ percentage: 0, loaded: 0, total: 0, status: 'error' });
        throw error;
      })
    );
  }

  /**
   * Upload story media (single image/video)
   */
  uploadStoryMedia(file: File): Observable<UploadResponse> {
    const isImage = this.isImageFile(file);
    const isVideo = this.isVideoFile(file);
    
    if (!isImage && !isVideo) {
      throw new Error('Invalid file type for story');
    }

    if (isImage && !this.validateFile(file, 'image')) {
      throw new Error('Invalid image file');
    }

    if (isVideo && !this.validateFile(file, 'video')) {
      throw new Error('Invalid video file');
    }

    const formData = new FormData();
    formData.append('media', file);

    return this.http.post<UploadResponse>(`${this.baseUrl}/story-media`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => this.handleUploadEvent(event)),
      catchError(error => {
        this.uploadProgress.next({ percentage: 0, loaded: 0, total: 0, status: 'error' });
        throw error;
      })
    );
  }

  /**
   * Validate file based on type
   */
  private validateFile(file: File, type: 'image' | 'video' | 'document'): boolean {
    const fileExtension = this.getFileExtension(file.name);
    
    switch (type) {
      case 'image':
        return this.allowedImageTypes.includes(fileExtension) && file.size <= this.maxImageSize;
      case 'video':
        return this.allowedVideoTypes.includes(fileExtension) && file.size <= this.maxVideoSize;
      case 'document':
        return this.allowedDocumentTypes.includes(fileExtension) && file.size <= this.maxDocumentSize;
      default:
        return false;
    }
  }

  /**
   * Check if file is an image
   */
  private isImageFile(file: File): boolean {
    const extension = this.getFileExtension(file.name);
    return this.allowedImageTypes.includes(extension);
  }

  /**
   * Check if file is a video
   */
  private isVideoFile(file: File): boolean {
    const extension = this.getFileExtension(file.name);
    return this.allowedVideoTypes.includes(extension);
  }

  /**
   * Get file extension
   */
  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  /**
   * Handle upload events and progress
   */
  private handleUploadEvent(event: HttpEvent<any>): any {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        if (event.total) {
          const percentage = Math.round(100 * event.loaded / event.total);
          this.uploadProgress.next({
            percentage,
            loaded: event.loaded,
            total: event.total,
            status: 'uploading'
          });
        }
        break;
      case HttpEventType.Response:
        this.uploadProgress.next({
          percentage: 100,
          loaded: event.body?.data?.size || 0,
          total: event.body?.data?.size || 0,
          status: 'completed'
        });
        return event.body;
    }
    return null;
  }

  /**
   * Reset upload progress
   */
  resetProgress(): void {
    this.uploadProgress.next(null);
  }

  /**
   * Get allowed file types for display
   */
  getAllowedTypes(type: 'image' | 'video' | 'document' | 'all'): string[] {
    switch (type) {
      case 'image':
        return this.allowedImageTypes;
      case 'video':
        return this.allowedVideoTypes;
      case 'document':
        return this.allowedDocumentTypes;
      case 'all':
        return [...this.allowedImageTypes, ...this.allowedVideoTypes, ...this.allowedDocumentTypes];
      default:
        return [];
    }
  }

  /**
   * Get maximum file size for display
   */
  getMaxFileSize(type: 'image' | 'video' | 'document'): number {
    switch (type) {
      case 'image':
        return this.maxImageSize;
      case 'video':
        return this.maxVideoSize;
      case 'document':
        return this.maxDocumentSize;
      default:
        return this.maxImageSize;
    }
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
