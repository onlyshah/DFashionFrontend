import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImagePlaceholderService {

  constructor() { }

  /**
   * Get placeholder image URL for products
   */
  getProductPlaceholder(width: number = 300, height: number = 300): string {
    return `https://via.placeholder.com/${width}x${height}/f8f9fa/6c757d?text=Product+Image`;
  }

  /**
   * Get placeholder image URL for user avatars
   */
  getUserAvatarPlaceholder(size: number = 100): string {
    return `https://via.placeholder.com/${size}x${size}/e9ecef/495057?text=User`;
  }

  /**
   * Get placeholder image URL for brands
   */
  getBrandPlaceholder(width: number = 200, height: number = 100): string {
    return `https://via.placeholder.com/${width}x${height}/f8f9fa/6c757d?text=Brand+Logo`;
  }

  /**
   * Get placeholder image URL for stories
   */
  getStoryPlaceholder(size: number = 100): string {
    return `https://via.placeholder.com/${size}x${size}/e9ecef/495057?text=Story`;
  }

  /**
   * Handle image error and replace with placeholder
   */
  onImageError(event: any, type: 'product' | 'avatar' | 'brand' | 'story' = 'product'): void {
    const img = event.target;
    
    switch (type) {
      case 'product':
        img.src = this.getProductPlaceholder();
        break;
      case 'avatar':
        img.src = this.getUserAvatarPlaceholder();
        break;
      case 'brand':
        img.src = this.getBrandPlaceholder();
        break;
      case 'story':
        img.src = this.getStoryPlaceholder();
        break;
      default:
        img.src = this.getProductPlaceholder();
    }
    
    // Add a class to indicate this is a placeholder
    img.classList.add('placeholder-image');
  }

  /**
   * Create a data URL for a simple colored placeholder
   */
  createColorPlaceholder(width: number, height: number, color: string = '#f8f9fa', textColor: string = '#6c757d', text: string = 'Image'): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return this.getProductPlaceholder(width, height);
    
    // Fill background
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
    
    // Add text
    ctx.fillStyle = textColor;
    ctx.font = `${Math.min(width, height) / 8}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);
    
    return canvas.toDataURL();
  }
}
