import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarService, AvatarData } from '../../../core/services/avatar.service';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnInit, OnChanges {
  @Input() name: string = '';
  @Input() imageUrl: string | null = null; // Should be user.image if present, else avatar, else default
  @Input() size: number = 40;
  @Input() shape: 'circle' | 'square' = 'circle';
  @Input() showBorder: boolean = false;
  @Input() borderColor: string = '#E5E7EB';
  @Input() clickable: boolean = false;
  @Input() showOnlineStatus: boolean = false;
  @Input() isOnline: boolean = false;

  avatarData: AvatarData | null = null;
  imageLoaded: boolean = false;
  imageError: boolean = false;
  avatarStyles: { [key: string]: string } = {};

  constructor(private avatarService: AvatarService) {}

  ngOnInit() {
    this.initializeAvatar();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['name'] || changes['imageUrl'] || changes['size']) {
      this.initializeAvatar();
    }
  }

  private initializeAvatar() {
    // Fallback logic: image > avatar > default
    let finalImageUrl = this.imageUrl;
    if (!finalImageUrl || finalImageUrl === '') {
      finalImageUrl = '/uploads/default-avatar.svg';
    }
    this.avatarData = this.avatarService.generateAvatarData(this.name, finalImageUrl);
    this.avatarStyles = this.avatarService.generateAvatarStyles(this.name, this.size);
    this.imageLoaded = false;
    this.imageError = false;

    // Add custom styles based on inputs
    this.avatarStyles['border-radius'] = this.shape === 'circle' ? '50%' : '8px';
    
    if (this.showBorder) {
      this.avatarStyles['border'] = `2px solid ${this.borderColor}`;
    }

    if (this.clickable) {
      this.avatarStyles['cursor'] = 'pointer';
    }
  }

  onImageLoad() {
    this.imageLoaded = true;
    this.imageError = false;
  }

  onImageError() {
    this.imageLoaded = false;
    this.imageError = true;
  }

  shouldShowImage(): boolean {
    return !!(this.avatarData?.imageUrl && this.imageLoaded && !this.imageError);
  }

  shouldShowInitials(): boolean {
    return !this.shouldShowImage();
  }

  getInitials(): string {
    return this.avatarData?.initials || 'U';
  }

  getImageUrl(): string {
    return this.avatarData?.imageUrl || '';
  }

  getContainerStyles(): { [key: string]: string } {
    const styles = { ...this.avatarStyles };
    
    // If showing image, remove background color
    if (this.shouldShowImage()) {
      delete styles['background-color'];
    }

    return styles;
  }

  getImageStyles(): { [key: string]: string } {
    return {
      'width': '100%',
      'height': '100%',
      'object-fit': 'cover',
      'border-radius': this.shape === 'circle' ? '50%' : '6px'
    };
  }

  getOnlineStatusStyles(): { [key: string]: string } {
    const statusSize = Math.round(this.size * 0.25);
    const position = Math.round(this.size * 0.05);

    return {
      'width': `${statusSize}px`,
      'height': `${statusSize}px`,
      'background-color': this.isOnline ? '#10B981' : '#6B7280',
      'border': '2px solid #FFFFFF',
      'border-radius': '50%',
      'position': 'absolute',
      'bottom': `${position}px`,
      'right': `${position}px`
    };
  }
}
