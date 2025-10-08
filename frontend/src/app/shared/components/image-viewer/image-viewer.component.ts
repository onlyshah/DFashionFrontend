import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-image-viewer',
    styleUrls: ['./image-viewer.component.scss'],
    templateUrl: './image-viewer.component.html'
})
export class ImageViewerComponent {
    @Input() images: string[] = [];
    @Input() currentIndex: number = 0;
    @Input() alt: string = '';
    @Input() showIndicators: boolean = true;
    @Input() autoPlay: boolean = false;
    @Input() autoPlayInterval: number = 3000;

    @Output() imageChange = new EventEmitter<number>();
    @Output() fullscreenToggle = new EventEmitter<boolean>();

    fullscreen: boolean = false;
    imageLoaded: boolean = false;
    private autoPlayTimer?: any;

    get currentImage(): string {
        return this.images[this.currentIndex] || '';
    }

    ngOnInit(): void {
        if (this.autoPlay && this.images.length > 1) {
            this.startAutoPlay();
        }
    }

    ngOnDestroy(): void {
        this.stopAutoPlay();
    }

    onImageLoad(): void {
        this.imageLoaded = true;
    }

    onImageError(): void {
        this.imageLoaded = true;
        // Could emit error event or show placeholder
    }

    previousImage(): void {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.imageLoaded = false;
            this.imageChange.emit(this.currentIndex);
            this.restartAutoPlay();
        }
    }

    nextImage(): void {
        if (this.currentIndex < this.images.length - 1) {
            this.currentIndex++;
            this.imageLoaded = false;
            this.imageChange.emit(this.currentIndex);
            this.restartAutoPlay();
        }
    }

    goToImage(index: number): void {
        if (index >= 0 && index < this.images.length) {
            this.currentIndex = index;
            this.imageLoaded = false;
            this.imageChange.emit(this.currentIndex);
            this.restartAutoPlay();
        }
    }

    toggleFullscreen(): void {
        this.fullscreen = !this.fullscreen;
        this.fullscreenToggle.emit(this.fullscreen);
    }

    closeFullscreen(): void {
        this.fullscreen = false;
        this.fullscreenToggle.emit(this.fullscreen);
    }

    private startAutoPlay(): void {
        this.autoPlayTimer = setInterval(() => {
            if (this.currentIndex < this.images.length - 1) {
                this.nextImage();
            } else {
                this.goToImage(0); // Loop back to first image
            }
        }, this.autoPlayInterval);
    }

    private stopAutoPlay(): void {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }

    private restartAutoPlay(): void {
        if (this.autoPlay) {
            this.stopAutoPlay();
            this.startAutoPlay();
        }
    }
}
