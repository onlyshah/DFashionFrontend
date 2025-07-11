import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  duration?: number; // for videos in seconds
  aspectRatio?: number;
  size?: number; // file size in bytes
}

export interface MediaError {
  id: string;
  type: 'load_error' | 'network_error' | 'format_error';
  message: string;
  fallbackUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private mediaErrors = new BehaviorSubject<MediaError[]>([]);
  public mediaErrors$ = this.mediaErrors.asObservable();

  // Fallback images for different scenarios
  private readonly fallbackImages = {
    user: '/assets/images/default-avatar.svg',
    product: '/assets/images/default-product.svg',
    post: '/assets/images/default-post.svg',
    story: '/assets/images/default-story.svg'
  };

  // Backup fallback images (simple colored placeholders)
  private readonly backupFallbacks = {
    user: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xMiAxNEM5LjMzIDEzLjk5IDcuMDEgMTUuNjIgNiAxOEMxMC4wMSAyMCAxMy45OSAyMCAxOCAxOEMxNi45OSAxNS42MiAxNC42NyAxMy45OSAxMiAxNFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cjwvc3ZnPgo=',
    product: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyOEMxNi42ODYzIDI4IDEzLjUwNTQgMjYuNjgzOSAxMS4xNzE2IDI0LjM1MDNDOC44Mzc4NCAyMi4wMTY3IDcuNTIxNzMgMTguODM1OCA3LjUyMTczIDE1LjUyMTdDNy41MjE3MyAxMi4yMDc2IDguODM3ODQgOS4wMjY3IDExLjE3MTYgNi42OTMwNEMxMy41MDU0IDQuMzU5MzggMTYuNjg2MyAzLjA0MzQ4IDIwIDMuMDQzNDhDMjMuMzEzNyAzLjA0MzQ4IDI2LjQ5NDYgNC4zNTkzOCAyOC44Mjg0IDYuNjkzMDRDMzEuMTYyMiA5LjAyNjcgMzIuNDc4MyAxMi4yMDc2IDMyLjQ3ODMgMTUuNTIxN0MzMi40NzgzIDE4LjgzNTggMzEuMTYyMiAyMi4wMTY3IDI4LjgyODQgMjQuMzUwM0MyNi40OTQ2IDI2LjY4MzkgMjMuMzEzNyAyOCAyMCAyOFoiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+',
    post: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkJGQ0ZEIi8+CjxwYXRoIGQ9Ik0yMCAyOEMxNi42ODYzIDI4IDEzLjUwNTQgMjYuNjgzOSAxMS4xNzE2IDI0LjM1MDNDOC44Mzc4NCAyMi4wMTY3IDcuNTIxNzMgMTguODM1OCA3LjUyMTczIDE1LjUyMTdDNy41MjE3MyAxMi4yMDc2IDguODM3ODQgOS4wMjY3IDExLjE3MTYgNi42OTMwNEMxMy41MDU0IDQuMzU5MzggMTYuNjg2MyAzLjA0MzQ4IDIwIDMuMDQzNDhDMjMuMzEzNyAzLjA0MzQ4IDI2LjQ5NDYgNC4zNTkzOCAyOC44Mjg0IDYuNjkzMDRDMzEuMTYyMiA5LjAyNjcgMzIuNDc4MyAxMi4yMDc2IDMyLjQ3ODMgMTUuNTIxN0MzMi40NzgzIDE4LjgzNTggMzEuMTYyMiAyMi4wMTY3IDI4LjgyODQgMjQuMzUwM0MyNi40OTQ2IDI2LjY4MzkgMjMuMzEzNyAyOCAyMCAyOFoiIGZpbGw9IiNFNUU3RUIiLz4KPC9zdmc+',
    story: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkVGM0Y0Ii8+CjxwYXRoIGQ9Ik0yMCAyOEMxNi42ODYzIDI4IDEzLjUwNTQgMjYuNjgzOSAxMS4xNzE2IDI0LjM1MDNDOC44Mzc4NCAyMi4wMTY3IDcuNTIxNzMgMTguODM1OCA3LjUyMTczIDE1LjUyMTdDNy41MjE3MyAxMi4yMDc2IDguODM3ODQgOS4wMjY3IDExLjE3MTYgNi42OTMwNEMxMy41MDU0IDQuMzU5MzggMTYuNjg2MyAzLjA0MzQ4IDIwIDMuMDQzNDhDMjMuMzEzNyAzLjA0MzQ4IDI2LjQ5NDYgNC4zNTkzOCAyOC44Mjg0IDYuNjkzMDRDMzEuMTYyMiA5LjAyNjcgMzIuNDc4MyAxMi4yMDc2IDMyLjQ3ODMgMTUuNTIxN0MzMi40NzgzIDE4LjgzNTggMzEuMTYyMiAyMi4wMTY3IDI4LjgyODQgMjQuMzUwM0MyNi40OTQ2IDI2LjY4MzkgMjMuMzEzNyAyOCAyMCAyOFoiIGZpbGw9IiNGQ0E1QTUiLz4KPC9zdmc+'
  };

  // Video library - loaded from API
  private readonly videos: any[] = [];

  // Broken URL patterns to fix
  private readonly brokenUrlPatterns = [
    '/uploads/stories/images/',
    '/uploads/stories/videos/',
    'sample-videos.com',
    'localhost:4200/assets/',
    'file://'
  ];

  constructor() {}

  /**
   * Get a reliable fallback image that always works
   */
  getReliableFallback(type: 'user' | 'product' | 'post' | 'story' = 'post'): string {
    return this.backupFallbacks[type];
  }

  /**
   * Check if an image URL is likely to fail
   */
  isLikelyToFail(url: string): boolean {
    return this.isExternalImageUrl(url) || this.isBrokenUrl(url);
  }

  /**
   * Get a safe image URL with fallback handling and broken URL fixing
   */
  getSafeImageUrl(url: string | undefined, type: 'user' | 'product' | 'post' | 'story' = 'post'): string {
    if (!url || url.trim() === '') {
      return this.backupFallbacks[type]; // Use base64 fallback for empty URLs
    }

    // Fix broken URLs
    const fixedUrl = this.fixBrokenUrl(url, type);
    if (fixedUrl !== url) {
      return fixedUrl;
    }

    // Handle localhost URLs that might be broken
    if (url.includes('localhost:4200/assets/')) {
      const assetPath = url.split('localhost:4200')[1];
      return assetPath;
    }

    // For external images that might fail, provide a more reliable fallback
    if (this.isExternalImageUrl(url)) {
      // Return the URL but we know it might fail and will fallback gracefully
      return url;
    }

    // Check if URL is valid
    try {
      new URL(url);
      return url;
    } catch {
      // If not a valid URL, treat as relative path
      if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
        return url;
      }
      // Return base64 fallback for invalid URLs
      return this.backupFallbacks[type];
    }
  }

  /**
   * Fix broken URLs by replacing them with working alternatives
   */
  private fixBrokenUrl(url: string, type: 'user' | 'product' | 'post' | 'story'): string {
    // Check for broken patterns
    for (const pattern of this.brokenUrlPatterns) {
      if (url.includes(pattern)) {
        // Replace with appropriate fallback or working URL
        if (pattern === '/uploads/stories/images/' || pattern === '/uploads/stories/videos/') {
          return this.getReplacementMediaUrl(url, type);
        }
        if (pattern === 'sample-videos.com') {
          return this.getReliableFallback(type);
        }
        if (pattern === 'localhost:4200/assets/') {
          // Extract the asset path and return it as relative
          const assetPath = url.split('localhost:4200')[1];
          return assetPath;
        }
        if (pattern === 'file://') {
          return this.fallbackImages[type];
        }
      }
    }
    return url;
  }

  /**
   * Get replacement media URL for broken local paths
   */
  private getReplacementMediaUrl(originalUrl: string, type: 'user' | 'product' | 'post' | 'story'): string {
    // Map broken local URLs to working local assets based on content
    const urlMappings: { [key: string]: string } = {
      'summer-collection': '/assets/images/placeholder-product.svg',
      'behind-scenes': '/assets/images/placeholder.svg',
      'customer-spotlight': '/assets/images/default-avatar.svg',
      'styling-tips': '/assets/images/placeholder.svg',
      'design': '/assets/images/placeholder.svg'
    };

    // Try to match content from filename
    for (const [key, replacementUrl] of Object.entries(urlMappings)) {
      if (originalUrl.toLowerCase().includes(key)) {
        return replacementUrl;
      }
    }

    // Return appropriate fallback
    return this.fallbackImages[type];
  }

  /**
   * Handle image load errors with progressive fallback
   */
  handleImageError(event: Event, fallbackType: 'user' | 'product' | 'post' | 'story' = 'post'): void {
    const img = event.target as HTMLImageElement;
    if (!img) return;

    const originalSrc = img.src;

    // First try: Use SVG fallback from assets
    if (!originalSrc.includes(this.fallbackImages[fallbackType]) && !originalSrc.startsWith('data:')) {
      img.src = this.fallbackImages[fallbackType];

      // Only log meaningful errors (not external image failures)
      if (!this.isExternalImageUrl(originalSrc) && !originalSrc.includes('localhost:4200')) {
        this.logMediaError({
          id: originalSrc,
          type: 'load_error',
          message: `Failed to load image: ${originalSrc}`,
          fallbackUrl: this.fallbackImages[fallbackType]
        });
      }
      return;
    }

    // Second try: Use base64 backup fallback if SVG also fails
    if (originalSrc.includes(this.fallbackImages[fallbackType])) {
      img.src = this.backupFallbacks[fallbackType];
      // Only warn for local asset failures, not external
      if (!this.isExternalImageUrl(originalSrc)) {
        console.warn(`SVG fallback failed, using backup for ${fallbackType}:`, originalSrc);
      }
      return;
    }
  }

  /**
   * Check if URL is an external image (Unsplash, etc.)
   */
  private isExternalImageUrl(url: string): boolean {
    const externalDomains = [
      'unsplash.com',
      'images.unsplash.com',
      'picsum.photos',
      'via.placeholder.com',
      'placehold.it',
      'placeholder.com'
    ];

    return externalDomains.some(domain => url.includes(domain));
  }







  /**
   * Check if URL is a video
   */
  isVideoUrl(url: string): boolean {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowerUrl.includes(ext)) || 
           lowerUrl.includes('video') || 
           lowerUrl.includes('.mp4');
  }

  /**
   * Get video thumbnail
   */
  getVideoThumbnail(videoUrl: string): string {
    // For videos, use fallback
    return this.fallbackImages.post;
  }

  /**
   * Get video duration
   */
  getVideoDuration(videoUrl: string): number {
    return 30; // Default 30 seconds
  }

  /**
   * Process media items from database
   */
  processMediaItems(mediaArray: any[]): MediaItem[] {
    if (!mediaArray || !Array.isArray(mediaArray)) {
      return [];
    }

    return mediaArray.map((media, index) => {
      const isVideo = this.isVideoUrl(media.url);
      
      return {
        id: media._id || `media_${index}`,
        type: isVideo ? 'video' : 'image',
        url: this.getSafeImageUrl(media.url),
        thumbnailUrl: isVideo ? this.getVideoThumbnail(media.url) : undefined,
        alt: media.alt || '',
        duration: isVideo ? this.getVideoDuration(media.url) : undefined,
        aspectRatio: media.aspectRatio || (isVideo ? 16/9 : 1),
        size: media.size
      };
    });
  }



  /**
   * Check if URL is broken
   */
  private isBrokenUrl(url: string): boolean {
    return this.brokenUrlPatterns.some(pattern => url.includes(pattern));
  }

  /**
   * Log media errors for debugging (with smart filtering)
   */
  private logMediaError(error: MediaError): void {
    const currentErrors = this.mediaErrors.value;
    this.mediaErrors.next([...currentErrors, error]);

    // Only log to console if it's not an external image failure
    if (!this.isExternalImageUrl(error.id)) {
      console.warn('Media Error:', error);
    }
  }

  /**
   * Clear media errors
   */
  clearMediaErrors(): void {
    this.mediaErrors.next([]);
  }

  /**
   * Preload media for better performance with graceful error handling
   */
  preloadMedia(mediaItems: MediaItem[]): Promise<void[]> {
    const promises = mediaItems.map(media => {
      return new Promise<void>((resolve) => {
        if (media.type === 'image') {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => {
            // Only log errors for non-external images
            if (!this.isExternalImageUrl(media.url)) {
              console.warn(`Failed to preload image: ${media.url}`);
            }
            resolve(); // Resolve anyway to not break the promise chain
          };
          img.src = media.url;
        } else if (media.type === 'video') {
          const video = document.createElement('video');
          video.onloadeddata = () => resolve();
          video.onerror = () => {
            // Only log errors for non-external videos
            if (!this.isExternalImageUrl(media.url)) {
              console.warn(`Failed to preload video: ${media.url}`);
            }
            resolve(); // Resolve anyway to not break the promise chain
          };
          video.src = media.url;
          video.load();
        } else {
          resolve(); // Unknown type, just resolve
        }
      });
    });

    return Promise.all(promises);
  }

  /**
   * Optimize image URL with size parameters
   */
  optimizeImageUrl(url: string, width?: number, height?: number, quality: number = 80): string {
    if (!url || this.isExternalImageUrl(url)) {
      return url; // Don't modify external URLs
    }

    // For local images, we can add optimization parameters if the backend supports it
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    if (quality !== 80) params.append('q', quality.toString());

    const separator = url.includes('?') ? '&' : '?';
    return params.toString() ? `${url}${separator}${params.toString()}` : url;
  }

  /**
   * Get responsive image URLs for different screen sizes
   */
  getResponsiveImageUrls(url: string): { [key: string]: string } {
    if (!url) return {};

    return {
      thumbnail: this.optimizeImageUrl(url, 150, 150, 70),
      small: this.optimizeImageUrl(url, 300, 300, 75),
      medium: this.optimizeImageUrl(url, 600, 600, 80),
      large: this.optimizeImageUrl(url, 1200, 1200, 85),
      original: url
    };
  }

  /**
   * Create a lazy loading image element with proper error handling
   */
  createLazyImage(src: string, alt: string = '', className: string = ''): HTMLImageElement {
    const img = document.createElement('img');
    img.alt = alt;
    img.className = className;
    img.loading = 'lazy';

    // Set up error handling
    img.onerror = (event: string | Event) => {
      if (typeof event === 'string') {
        this.handleImageError(new Event('error'), 'post');
      } else {
        this.handleImageError(event, 'post');
      }
    };

    // Use intersection observer for lazy loading
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          img.src = this.getSafeImageUrl(src);
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '50px' });

    observer.observe(img);
    return img;
  }

  /**
   * Batch preload images with progress tracking
   */
  batchPreloadImages(urls: string[], onProgress?: (loaded: number, total: number) => void): Promise<void> {
    let loaded = 0;
    const total = urls.length;

    const promises = urls.map(url => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = img.onerror = () => {
          loaded++;
          if (onProgress) onProgress(loaded, total);
          resolve();
        };
        img.src = this.getSafeImageUrl(url);
      });
    });

    return Promise.all(promises).then(() => {});
  }
}
