import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadComponent } from './file-upload.component';
import { UploadProgress } from '../../../core/services/file-upload.service';

@Component({
  selector: 'app-file-upload-example',
  standalone: true,
  imports: [CommonModule, FileUploadComponent],
  template: `
    <div class="container mt-4">
      <h2>File Upload Examples</h2>
      
      <!-- Avatar Upload -->
      <div class="row mb-4">
        <div class="col-md-6">
          <h4>Avatar Upload</h4>
          <app-file-upload
            uploadType="avatar"
            [multiple]="false"
            [autoUpload]="true"
            (uploadComplete)="onAvatarUploaded($event)"
            (uploadError)="onUploadError($event)">
          </app-file-upload>
        </div>
      </div>
      
      <!-- Product Images Upload -->
      <div class="row mb-4">
        <div class="col-md-8">
          <h4>Product Images Upload</h4>
          <app-file-upload
            uploadType="product"
            [multiple]="true"
            [maxFiles]="5"
            uploadTitle="Upload Product Images"
            uploadDescription="Add up to 5 high-quality product images"
            (filesSelected)="onProductFilesSelected($event)"
            (uploadComplete)="onProductImagesUploaded($event)"
            (uploadProgress)="onUploadProgress($event)"
            (uploadError)="onUploadError($event)">
          </app-file-upload>
        </div>
      </div>
      
      <!-- Story Media Upload -->
      <div class="row mb-4">
        <div class="col-md-6">
          <h4>Story Media Upload</h4>
          <app-file-upload
            uploadType="story"
            [multiple]="false"
            uploadTitle="Share Your Story"
            uploadDescription="Upload a photo or video for your story"
            (uploadComplete)="onStoryUploaded($event)"
            (uploadError)="onUploadError($event)">
          </app-file-upload>
        </div>
      </div>
      
      <!-- Multiple Images Upload -->
      <div class="row mb-4">
        <div class="col-md-8">
          <h4>Multiple Images Upload</h4>
          <app-file-upload
            uploadType="image"
            [multiple]="true"
            [maxFiles]="10"
            uploadTitle="Upload Images"
            uploadDescription="Select multiple images to upload"
            (uploadComplete)="onMultipleImagesUploaded($event)"
            (uploadError)="onUploadError($event)">
          </app-file-upload>
        </div>
      </div>
      
      <!-- Upload Results -->
      <div class="row" *ngIf="uploadResults.length > 0">
        <div class="col-12">
          <h4>Upload Results</h4>
          <div class="alert alert-success">
            <h6>Successfully Uploaded Files:</h6>
            <ul>
              <li *ngFor="let result of uploadResults">
                <strong>{{ result.originalName }}</strong> - 
                <a [href]="result.url" target="_blank">View File</a>
                ({{ formatFileSize(result.size) }})
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- Upload Errors -->
      <div class="row" *ngIf="uploadErrors.length > 0">
        <div class="col-12">
          <div class="alert alert-danger">
            <h6>Upload Errors:</h6>
            <ul>
              <li *ngFor="let error of uploadErrors">{{ error }}</li>
            </ul>
            <button class="btn btn-sm btn-outline-danger" (click)="clearErrors()">
              Clear Errors
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
    }
    
    h4 {
      color: #333;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e9ecef;
    }
    
    .row {
      margin-bottom: 30px;
    }
    
    .alert {
      margin-top: 20px;
    }
    
    .alert ul {
      margin-bottom: 0;
      padding-left: 20px;
    }
    
    .alert li {
      margin-bottom: 5px;
    }
    
    a {
      color: #007bff;
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
  `]
})
export class FileUploadExampleComponent {
  uploadResults: any[] = [];
  uploadErrors: string[] = [];

  onAvatarUploaded(response: any) {
    console.log('Avatar uploaded:', response);
    if (response.data) {
      this.uploadResults.push(response.data);
    }
  }

  onProductFilesSelected(files: File[]) {
    console.log('Product files selected:', files);
  }

  onProductImagesUploaded(response: any) {
    console.log('Product images uploaded:', response);
    if (response.data && response.data.images) {
      this.uploadResults.push(...response.data.images);
    }
  }

  onStoryUploaded(response: any) {
    console.log('Story uploaded:', response);
    if (response.data) {
      this.uploadResults.push(response.data);
    }
  }

  onMultipleImagesUploaded(response: any) {
    console.log('Multiple images uploaded:', response);
    if (response.data && response.data.images) {
      this.uploadResults.push(...response.data.images);
    }
  }

  onUploadProgress(progress: UploadProgress) {
    console.log('Upload progress:', progress);
  }

  onUploadError(error: string) {
    console.error('Upload error:', error);
    this.uploadErrors.push(error);
  }

  clearErrors() {
    this.uploadErrors = [];
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
