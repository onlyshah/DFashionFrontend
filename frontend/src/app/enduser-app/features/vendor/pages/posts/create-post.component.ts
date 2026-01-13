import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UploadService, UploadProgress } from '../../../../core/services/upload.service';

@Component({
    selector: 'app-create-post',
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    styles: [`
    .create-post-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      margin-bottom: 30px;
    }

    .header h1 {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .header p {
      color: #666;
    }

    .post-form {
      background: white;
      border-radius: 8px;
      padding: 30px;
      border: 1px solid #eee;
    }

    .form-section {
      margin-bottom: 30px;
    }

    .form-section h3 {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 15px;
    }

    .upload-area {
      border: 2px dashed #ddd;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .upload-area:hover {
      border-color: #007bff;
      background: #f8f9ff;
    }

    .upload-area.has-files {
      padding: 20px;
    }

    .upload-content i {
      font-size: 3rem;
      color: #ddd;
      margin-bottom: 15px;
    }

    .upload-content p {
      font-size: 1.1rem;
      margin-bottom: 5px;
    }

    .upload-content span {
      color: #666;
      font-size: 0.9rem;
    }

    .file-preview {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 15px;
    }

    .file-item {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
    }

    .file-item img,
    .file-item video {
      width: 100%;
      height: 150px;
      object-fit: cover;
    }

    .remove-file {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(0,0,0,0.7);
      color: white;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      cursor: pointer;
    }

    textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-family: inherit;
      resize: vertical;
    }

    .char-count {
      text-align: right;
      color: #666;
      font-size: 0.85rem;
      margin-top: 5px;
    }

    .search-input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      margin-bottom: 10px;
    }

    .product-results {
      max-height: 200px;
      overflow-y: auto;
      border: 1px solid #eee;
      border-radius: 6px;
    }

    .product-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      cursor: pointer;
      border-bottom: 1px solid #f5f5f5;
    }

    .product-item:hover {
      background: #f8f9fa;
    }

    .product-item img {
      width: 50px;
      height: 50px;
      object-fit: cover;
      border-radius: 4px;
    }

    .product-info h4 {
      font-size: 0.9rem;
      margin-bottom: 2px;
    }

    .product-info p {
      color: #666;
      font-size: 0.85rem;
    }

    .tagged-products {
      margin-top: 15px;
    }

    .tagged-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 10px;
    }

    .tagged-item {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f8f9fa;
      padding: 8px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
    }

    .tagged-item img {
      width: 24px;
      height: 24px;
      object-fit: cover;
      border-radius: 50%;
    }

    .tagged-item button {
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      margin-left: 5px;
    }

    .hashtag-input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
    }

    .hashtags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }

    .hashtag {
      background: #007bff;
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .hashtag button {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 1.1rem;
    }

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .setting-item {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    .btn-primary, .btn-secondary {
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f8f9fa;
      color: #6c757d;
      border: 1px solid #dee2e6;
    }

    .btn-secondary:hover {
      background: #e9ecef;
    }

    @media (max-width: 768px) {
      .form-actions {
        flex-direction: column;
      }

      .file-preview {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      }
    }
  `],
    templateUrl: './create-post.component.html'
})
export class CreatePostComponent implements OnInit {
    postForm: FormGroup;
    selectedFiles: any[] = [];
    taggedProducts: any[] = [];
    hashtags: string[] = [];
    searchResults: any[] = [];
    uploadProgress: UploadProgress | null = null;
    isUploading = false;
    uploading = false;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private http: HttpClient,
        private uploadService: UploadService
    ) {
        this.postForm = this.fb.group({
            caption: ['', [Validators.required, Validators.maxLength(2000)]],
            allowComments: [true],
            allowSharing: [true]
        });
    }

    ngOnInit() {
        // Subscribe to upload progress
        this.uploadService.getUploadProgress().subscribe(progress => {
            this.uploadProgress = progress;
            this.isUploading = progress?.status === 'uploading';
        });
    }

    async onFileSelect(event: any) {
        const files = Array.from(event.target.files) as File[];

        // Validate files
        const validation = this.uploadService.validateFiles(files, 'any', 10);
        if (!validation.isValid) {
            alert(validation.errors.join('\n'));
            return;
        }

        // Add files to selection with previews
        for (const file of files) {
            try {
                const preview = await this.uploadService.createFilePreview(file);
                const fileType = this.uploadService.getFileType(file);

                this.selectedFiles.push({
                    file,
                    preview,
                    type: file.type,
                    name: file.name,
                    size: this.uploadService.formatFileSize(file.size),
                    fileType,
                    uploaded: false,
                    url: null
                });
            } catch (error) {
                console.error('Error creating preview:', error);
            }
        }
    }

    removeFile(index: number) {
        this.selectedFiles.splice(index, 1);
    }

    // Upload selected media files
    async uploadMedia(): Promise<any[]> {
        if (this.selectedFiles.length === 0) {
            return [];
        }

        const filesToUpload = this.selectedFiles
            .filter(file => !file.uploaded)
            .map(file => file.file);

        if (filesToUpload.length === 0) {
            // All files already uploaded
            return this.selectedFiles.map(file => ({
                url: file.url,
                type: file.fileType
            })).filter(media => media.url);
        }

        try {
            this.isUploading = true;
            const response = await this.uploadService.uploadPostMedia(filesToUpload).toPromise();

            if (response?.success && response.data.media) {
                // Update selected files with upload results
                response.data.media.forEach((uploadedMedia, index) => {
                    const fileIndex = this.selectedFiles.findIndex(file => !file.uploaded);
                    if (fileIndex !== -1) {
                        this.selectedFiles[fileIndex].uploaded = true;
                        this.selectedFiles[fileIndex].url = uploadedMedia.url;
                    }
                });

                return response.data.media.map(media => ({
                    url: media.url,
                    type: media.type || 'image'
                }));
            }

            throw new Error(response?.message || 'Upload failed');
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        } finally {
            this.isUploading = false;
        }
    }

    searchProducts(event: any) {
        const query = event.target.value;
        if (query.length > 2) {
            // Search products from API
            this.searchResults = [];
        } else {
            this.searchResults = [];
        }
    }

    addProductTag(product: any) {
        if (!this.taggedProducts.find(p => p._id === product._id)) {
            this.taggedProducts.push(product);
        }
        this.searchResults = [];
    }

    removeProductTag(index: number) {
        this.taggedProducts.splice(index, 1);
    }

    addHashtag(event: any) {
        const tag = event.target.value.trim().replace('#', '');
        if (tag && !this.hashtags.includes(tag)) {
            this.hashtags.push(tag);
            event.target.value = '';
        }
    }

    removeHashtag(index: number) {
        this.hashtags.splice(index, 1);
    }

    saveDraft() {
        // TODO: Implement save as draft functionality
        console.log('Saving as draft...');
    }

    async onSubmit() {
        if (!this.postForm.valid) {
            alert('Please fill in all required fields');
            return;
        }

        if (this.selectedFiles.length === 0) {
            alert('Please select at least one media file');
            return;
        }

        try {
            this.uploading = true;

            // Upload media files first
            const mediaUrls = await this.uploadMedia();

            const postData = {
                caption: this.postForm.value.caption,
                media: mediaUrls,
                products: this.taggedProducts.map(p => ({
                    product: p._id,
                    position: { x: 50, y: 50 } // Default position
                })),
                hashtags: this.hashtags,
                settings: {
                    allowComments: this.postForm.value.allowComments,
                    allowSharing: this.postForm.value.allowSharing
                }
            };

            // TODO: Implement actual post creation API
            console.log('Creating post:', postData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            alert('Post created successfully!');
            this.router.navigate(['/vendor/posts']);
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post. Please try again.');
        } finally {
            this.uploading = false;
        }
    }
}
