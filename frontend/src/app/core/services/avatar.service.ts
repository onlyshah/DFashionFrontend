import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {

  constructor() { }

  /**
   * Generate initials from a full name
   * @param name - Full name string
   * @returns Initials (first and last name first letters)
   */
  generateInitials(name: string): string {
    if (!name || name.trim() === '') {
      return 'U'; // Default for unknown user
    }

    const cleanName = name.trim();
    const words = cleanName.split(/\s+/);

    if (words.length === 1) {
      // Single word - take first two characters or just first if only one character
      return words[0].substring(0, 2).toUpperCase();
    } else if (words.length >= 2) {
      // Multiple words - take first letter of first and last word
      const firstInitial = words[0].charAt(0);
      const lastInitial = words[words.length - 1].charAt(0);
      return (firstInitial + lastInitial).toUpperCase();
    }

    return 'U';
  }

  /**
   * Generate a background color based on the name
   * @param name - Full name string
   * @returns Hex color string
   */
  generateBackgroundColor(name: string): string {
    if (!name || name.trim() === '') {
      return '#6B7280'; // Default gray color
    }

    // Predefined color palette for consistency
    const colors = [
      '#EF4444', // Red
      '#F97316', // Orange
      '#F59E0B', // Amber
      '#EAB308', // Yellow
      '#84CC16', // Lime
      '#22C55E', // Green
      '#10B981', // Emerald
      '#14B8A6', // Teal
      '#06B6D4', // Cyan
      '#0EA5E9', // Sky
      '#3B82F6', // Blue
      '#6366F1', // Indigo
      '#8B5CF6', // Violet
      '#A855F7', // Purple
      '#D946EF', // Fuchsia
      '#EC4899', // Pink
      '#F43F5E', // Rose
    ];

    // Generate a hash from the name to consistently assign colors
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  /**
   * Generate avatar data object
   * @param name - Full name string
   * @param imageUrl - Optional image URL
   * @returns Avatar data object
   */
  generateAvatarData(name: string, imageUrl?: string): AvatarData {
    return {
      name: name || 'Unknown User',
      initials: this.generateInitials(name),
      backgroundColor: this.generateBackgroundColor(name),
      imageUrl: imageUrl || null,
      hasValidImage: !!imageUrl
    };
  }

  /**
   * Check if an image URL is valid
   * @param imageUrl - Image URL to check
   * @returns Promise<boolean>
   */
  async isImageValid(imageUrl: string): Promise<boolean> {
    if (!imageUrl) return false;

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = imageUrl;
    });
  }

  /**
   * Get initials with proper formatting
   * @param name - Full name string
   * @returns Formatted initials
   */
  getFormattedInitials(name: string): string {
    const initials = this.generateInitials(name);
    return initials.length === 1 ? initials : initials;
  }

  /**
   * Generate CSS styles for avatar
   * @param name - Full name string
   * @param size - Avatar size in pixels
   * @returns CSS style object
   */
  generateAvatarStyles(name: string, size: number = 40): { [key: string]: string } {
    const backgroundColor = this.generateBackgroundColor(name);
    const fontSize = Math.round(size * 0.4); // 40% of avatar size

    return {
      'width': `${size}px`,
      'height': `${size}px`,
      'background-color': backgroundColor,
      'color': '#FFFFFF',
      'font-size': `${fontSize}px`,
      'font-weight': '600',
      'display': 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      'border-radius': '50%',
      'text-transform': 'uppercase',
      'line-height': '1',
      'user-select': 'none'
    };
  }
}

export interface AvatarData {
  name: string;
  initials: string;
  backgroundColor: string;
  imageUrl: string | null;
  hasValidImage: boolean;
}
