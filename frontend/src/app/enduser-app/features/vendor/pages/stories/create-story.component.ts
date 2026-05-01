import { Component, OnInit, Input, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ActionSheetController, LoadingController, ToastController, Camera, CameraResultType, CameraSource } from '@ionic/angular';
import { Camera as CapacitorCamera, CameraResultType as CapCameraResultType, CameraSource as CapCameraSource } from '@capacitor/camera';

@Component({
    selector: 'app-create-story',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
    templateUrl: './create-story.component.html',
    styleUrls: ['./create-story.component.scss']
})
export class CreateStoryComponent implements OnInit {
  @Input() platform: 'web' | 'mobile' = 'web';
  storyForm: FormGroup;
  selectedMedia: any = null;
  taggedProducts: any[] = [];
  searchResults: any[] = [];
  uploading = false;
  isUploading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    @Optional() private actionSheetController?: ActionSheetController,
    @Optional() private loadingController?: LoadingController,
    @Optional() private toastController?: ToastController
  ) {
    // Auto-detect platform
    if (this.router.url.includes('/mobile/')) {
      this.platform = 'mobile';
    } else {
      this.platform = 'web';
    }
    
    this.storyForm = this.fb.group({
      caption: ['', [Validators.maxLength(500)]],
      allowReplies: [true],
      showViewers: [true],
      highlightProducts: [true],
      duration: ['24']
    });
  }

  ngOnInit() {}

  async presentMediaActionSheet() {
    if (this.platform === 'mobile' && this.actionSheetController) {
      const actionSheet = await this.actionSheetController.create({
        header: 'Add Story Media',
        buttons: [
          {
            text: 'Camera',
            icon: 'camera',
            handler: () => {
              this.takePicture(CapCameraSource.Camera);
            }
          },
          {
            text: 'Photo Library',
            icon: 'images',
            handler: () => {
              this.takePicture(CapCameraSource.Photos);
            }
          },
          {
            text: 'Cancel',
            icon: 'close',
            role: 'cancel'
          }
        ]
      });
      await actionSheet.present();
    }
  }

  async takePicture(source: any) {
    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CapCameraResultType.DataUrl,
        source: source
      });

      const imageData = image.dataUrl;
      this.selectedMedia = {
        preview: imageData,
        type: 'image/jpeg',
        name: 'story-media.jpg'
      };

      if (this.platform === 'mobile' && this.toastController) {
        const toast = await this.toastController.create({
          message: 'Photo selected successfully!',
          duration: 2000,
          color: 'success',
          position: 'bottom'
        });
        toast.present();
      }
    } catch (error) {
      console.error('Error taking picture:', error);
    }
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedMedia = {
          file,
          preview: e.target.result,
          type: file.type,
          name: file.name
        };
      };
      reader.readAsDataURL(file);
    }
  }

  removeMedia() {
    this.selectedMedia = null;
  }

  searchProducts(event: any) {
    const query = event.target.value;
    if (query.length > 2) {
      // TODO: Implement actual product search API
      this.searchResults = [
        {
          _id: '1',
          name: 'Summer Dress',
          price: 2999,
          images: [{ url: '/uploadsproduct1.jpg' }]
        },
        {
          _id: '2',
          name: 'Casual Shirt',
          price: 1599,
          images: [{ url: '/uploadsproduct2.jpg' }]
        }
      ].filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
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

  saveDraft() {
    console.log('Saving as draft...');
  }

  async onSubmit() {
    if (this.storyForm.valid && this.selectedMedia) {
      this.uploading = true;
      this.isUploading = true;
      
      if (this.platform === 'mobile' && this.loadingController) {
        const loading = await this.loadingController.create({
          message: 'Uploading story...',
          spinner: 'crescent'
        });
        await loading.present();
      }
      
      const storyData = {
        media: {
          type: this.selectedMedia.type.startsWith('image') ? 'image' : 'video',
          url: this.selectedMedia.preview
        },
        caption: this.storyForm.value.caption,
        products: this.taggedProducts.map(p => ({
          product: p._id,
          position: { x: 50, y: 50 }
        })),
        settings: {
          allowReplies: this.storyForm.value.allowReplies,
          showViewers: this.storyForm.value.showViewers,
          highlightProducts: this.storyForm.value.highlightProducts
        },
        duration: parseInt(this.storyForm.value.duration)
      };

      // Simulate API call
      setTimeout(() => {
        this.uploading = false;
        this.isUploading = false;
        const successMsg = 'Story created successfully!';
        
        if (this.platform === 'mobile' && this.toastController) {
          this.toastController.create({
            message: successMsg,
            duration: 2000,
            color: 'success',
            position: 'bottom'
          }).then(toast => toast.present());
        } else {
          alert(successMsg);
        }
        
        const target = this.platform === 'mobile' ? '/tabs/vendor/stories' : '/vendor/stories';
        this.router.navigate([target]);
      }, 2000);
    }
  }
}
