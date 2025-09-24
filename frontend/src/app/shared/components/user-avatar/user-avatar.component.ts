import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.scss']
})
export class UserAvatarComponent {
  @Input() avatarUrl?: string;
  readonly BACKEND_AVATAR_PLACEHOLDER = '/uploads/placeholder-avatar.png';
  @Input() displayName: string = '';
  @Input() size: 'small' | 'medium' | 'large' | 'xlarge' = 'medium';
  @Input() showStatus: boolean = false;
  @Input() isOnline: boolean = false;
  @Input() backgroundColor?: string;

  imageError: boolean = false;

  get initials(): string {
    if (!this.displayName) return '?';
    
    const names = this.displayName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  // Removed duplicate backgroundColor getter

  onImageError(): void {
    this.imageError = true;
  }

  get fallbackAvatarUrl(): string {
    // Always use backend URL prefix
    // If avatarUrl is already a full URL, don't double-prefix
    const base = (window as any).environment?.apiUrl || (window as any).env?.apiUrl || 'http://localhost:9000';
    return base + this.BACKEND_AVATAR_PLACEHOLDER;
  }

  get fullAvatarUrl(): string | undefined {
    if (!this.avatarUrl) return undefined;
    // If already absolute URL, return as is
    if (/^https?:\/\//.test(this.avatarUrl)) return this.avatarUrl;
    const base = (window as any).environment?.apiUrl || (window as any).env?.apiUrl || 'http://localhost:9000';
    return base + this.avatarUrl;
  }
}
