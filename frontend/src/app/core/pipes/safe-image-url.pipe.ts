import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment';

/**
 * 🖼️ Pipe to safely construct image URLs with API base URL
 * Handles both absolute and relative paths
 * 
 * Usage in template:
 * <img [src]="imagePath | safeImageUrl" />
 */
@Pipe({
  name: 'safeImageUrl',
  standalone: true
})
export class SafeImageUrlPipe implements PipeTransform {
  transform(imagePath: string | undefined | null, placeholder: string = '/uploads/products/placeholder-product.png'): string {
    // Return placeholder for empty values
    if (!imagePath) {
      return environment.apiUrl + placeholder;
    }

    // If it's already an absolute URL, return as-is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // If it's a relative path, prepend the API URL
    if (imagePath.startsWith('/')) {
      return environment.apiUrl + imagePath;
    }

    // If it's just a filename without path, assume it's in uploads
    return environment.apiUrl + '/uploads/' + imagePath;
  }
}
