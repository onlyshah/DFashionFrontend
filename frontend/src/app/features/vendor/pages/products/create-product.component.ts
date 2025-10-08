import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UploadService, UploadProgress } from '../../../../core/services/upload.service';

@Component({
    selector: 'app-create-product',
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    styles: [`
    .create-product-container {
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

    .product-form {
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
      margin-bottom: 20px;
      color: #333;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
    }

    .upload-area {
      border: 2px dashed #ddd;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 20px;
    }

    .upload-area:hover {
      border-color: #007bff;
      background: #f8f9ff;
    }

    .upload-area i {
      font-size: 3rem;
      color: #ddd;
      margin-bottom: 15px;
    }

    .upload-area p {
      font-size: 1.1rem;
      margin-bottom: 5px;
    }

    .upload-area span {
      color: #666;
      font-size: 0.9rem;
    }

    .image-preview {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 15px;
    }

    .image-item {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
    }

    .image-item img {
      width: 100%;
      height: 120px;
      object-fit: cover;
    }

    .remove-image {
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

    .checkbox-group {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
    }

    .checkbox-group label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .color-group {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
    }

    .color-option {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .color-swatch {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid #ddd;
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
      .form-row {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `],
    templateUrl: './create-product.component.html'
})
export class CreateProductComponent implements OnInit {
    productForm: FormGroup;
    selectedImages: any[] = [];
    selectedSizes: string[] = [];
    selectedColors: string[] = [];
    uploading = false;
    uploadProgress: UploadProgress | null = null;
    isUploading = false;

    availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    availableColors = [
        { name: 'Black', value: '#000000' },
        { name: 'White', value: '#FFFFFF' },
        { name: 'Red', value: '#FF0000' },
        { name: 'Blue', value: '#0000FF' },
        { name: 'Green', value: '#008000' },
        { name: 'Yellow', value: '#FFFF00' }
    ];

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private uploadService: UploadService
    ) {
        this.productForm = this.fb.group({
            name: ['', Validators.required],
            brand: [''],
            category: ['', Validators.required],
            description: ['', Validators.required],
            price: ['', [Validators.required, Validators.min(1)]],
            originalPrice: [''],
            stock: ['', [Validators.required, Validators.min(0)]],
            sku: ['']
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
        const validation = this.uploadService.validateFiles(files, 'image', 5);
        if (!validation.isValid) {
            alert(validation.errors.join('\n'));
            return;
        }

        // Add files to selection with previews
        for (const file of files) {
            if (this.selectedImages.length < 5) {
                try {
                    const preview = await this.uploadService.createFilePreview(file);
                    this.selectedImages.push({
                        file,
                        preview,
                        name: file.name,
                        size: this.uploadService.formatFileSize(file.size),
                        uploaded: false,
                        url: null
                    });
                } catch (error) {
                    console.error('Error creating preview:', error);
                }
            }
        }
    }

    removeImage(index: number) {
        this.selectedImages.splice(index, 1);
    }

    // Upload selected images
    async uploadImages(): Promise<string[]> {
        if (this.selectedImages.length === 0) {
            return [];
        }

        const filesToUpload = this.selectedImages
            .filter(img => !img.uploaded)
            .map(img => img.file);

        if (filesToUpload.length === 0) {
            // All images already uploaded
            return this.selectedImages.map(img => img.url).filter(url => url);
        }

        try {
            this.isUploading = true;
            const response = await this.uploadService.uploadProductImages(filesToUpload).toPromise();

            if (response?.success && response.data.images) {
                // Update selected images with upload results
                response.data.images.forEach((uploadedImage, index) => {
                    const imageIndex = this.selectedImages.findIndex(img => !img.uploaded);
                    if (imageIndex !== -1) {
                        this.selectedImages[imageIndex].uploaded = true;
                        this.selectedImages[imageIndex].url = uploadedImage.url;
                    }
                });

                return response.data.images.map(img => img.url);
            }

            throw new Error(response?.message || 'Upload failed');
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        } finally {
            this.isUploading = false;
        }
    }

    onSizeChange(event: any) {
        const size = event.target.value;
        if (event.target.checked) {
            this.selectedSizes.push(size);
        } else {
            this.selectedSizes = this.selectedSizes.filter(s => s !== size);
        }
    }

    onColorChange(event: any) {
        const color = event.target.value;
        if (event.target.checked) {
            this.selectedColors.push(color);
        } else {
            this.selectedColors = this.selectedColors.filter(c => c !== color);
        }
    }

    saveDraft() {
        console.log('Saving as draft...');
        alert('Draft saved successfully!');
    }

    async onSubmit() {
        if (!this.productForm.valid) {
            alert('Please fill in all required fields');
            return;
        }

        if (this.selectedImages.length === 0) {
            alert('Please select at least one product image');
            return;
        }

        try {
            this.uploading = true;

            // Upload images first
            const imageUrls = await this.uploadImages();

            const productData = {
                ...this.productForm.value,
                images: imageUrls.map(url => ({ url })),
                sizes: this.selectedSizes,
                colors: this.selectedColors
            };

            // TODO: Implement actual product creation API
            console.log('Creating product:', productData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            alert('Product created successfully!');
            this.router.navigate(['/vendor/products']);
        } catch (error) {
            console.error('Error creating product:', error);
            alert('Failed to create product. Please try again.');
        } finally {
            this.uploading = false;
        }
    }
}
