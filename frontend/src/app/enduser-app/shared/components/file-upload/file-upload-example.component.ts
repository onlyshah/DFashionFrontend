import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadComponent } from './file-upload.component';
import { UploadProgress } from '../../../../core/services/file-upload.service';

@Component({
    selector: 'app-file-upload-example',
    standalone: true,
    imports: [CommonModule, FileUploadComponent],
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
  `],
    templateUrl: './file-upload-example.component.html'
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
