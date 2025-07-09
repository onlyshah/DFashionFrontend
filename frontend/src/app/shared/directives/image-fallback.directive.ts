import { Directive, ElementRef, Input, Renderer2, OnInit } from '@angular/core';

@Directive({
  selector: '[appImageFallback]',
  standalone: true
})
export class ImageFallbackDirective implements OnInit {
  @Input('appImageFallback') userName: string = '';
  @Input() fallbackSize: number = 40;

  constructor(
    private el: ElementRef<HTMLImageElement>,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.setupImageFallback();
  }

  private setupImageFallback() {
    const img = this.el.nativeElement;
    
    // Listen for image load errors
    this.renderer.listen(img, 'error', () => {
      this.showInitialsPlaceholder();
    });

    // Check if image is already broken
    if (img.complete && img.naturalWidth === 0) {
      this.showInitialsPlaceholder();
    }
  }

  private showInitialsPlaceholder() {
    const img = this.el.nativeElement;
    const initials = this.generateInitials(this.userName);
    const backgroundColor = this.generateBackgroundColor(this.userName);
    
    // Hide the broken image
    this.renderer.setStyle(img, 'display', 'none');
    
    // Create initials placeholder
    const placeholder = this.renderer.createElement('div');
    this.renderer.addClass(placeholder, 'image-fallback-placeholder');
    
    // Set styles
    this.renderer.setStyle(placeholder, 'width', img.style.width || `${this.fallbackSize}px`);
    this.renderer.setStyle(placeholder, 'height', img.style.height || `${this.fallbackSize}px`);
    this.renderer.setStyle(placeholder, 'background-color', backgroundColor);
    this.renderer.setStyle(placeholder, 'color', '#FFFFFF');
    this.renderer.setStyle(placeholder, 'display', 'flex');
    this.renderer.setStyle(placeholder, 'align-items', 'center');
    this.renderer.setStyle(placeholder, 'justify-content', 'center');
    this.renderer.setStyle(placeholder, 'border-radius', '50%');
    this.renderer.setStyle(placeholder, 'font-weight', '600');
    this.renderer.setStyle(placeholder, 'font-size', `${Math.round(this.fallbackSize * 0.4)}px`);
    this.renderer.setStyle(placeholder, 'text-transform', 'uppercase');
    this.renderer.setStyle(placeholder, 'line-height', '1');
    this.renderer.setStyle(placeholder, 'user-select', 'none');
    this.renderer.setStyle(placeholder, 'font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    
    // Copy classes from original image
    const imgClasses = img.className;
    if (imgClasses) {
      this.renderer.setAttribute(placeholder, 'class', `image-fallback-placeholder ${imgClasses}`);
    }
    
    // Set initials text
    this.renderer.setProperty(placeholder, 'textContent', initials);
    
    // Insert placeholder after the image
    const parent = img.parentNode;
    if (parent) {
      this.renderer.insertBefore(parent, placeholder, img.nextSibling);
    }
  }

  private generateInitials(name: string): string {
    if (!name || name.trim() === '') {
      return 'U';
    }

    const cleanName = name.trim();
    const words = cleanName.split(/\s+/);

    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    } else if (words.length >= 2) {
      const firstInitial = words[0].charAt(0);
      const lastInitial = words[words.length - 1].charAt(0);
      return (firstInitial + lastInitial).toUpperCase();
    }

    return 'U';
  }

  private generateBackgroundColor(name: string): string {
    if (!name || name.trim() === '') {
      return '#6B7280';
    }

    const colors = [
      '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
      '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
      '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E'
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }
}
