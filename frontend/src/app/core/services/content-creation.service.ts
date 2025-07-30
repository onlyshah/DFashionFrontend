import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ProductTag {
  product: string;
  position: {
    x: number;
    y: number;
  };
  size?: string;
  color?: string;
  isMainProduct?: boolean;
}

export interface ContentCreationData {
  type: 'post' | 'story' | 'reel';
  caption: string;
  media: File[];
  products: ProductTag[]; // Mandatory
  tags?: string[];
  location?: {
    name: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  settings?: {
    allowComments?: boolean;
    allowSharing?: boolean;
  };
}

export interface ContentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ContentCreationService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  /**
   * Validate content before creation
   */
  validateContent(contentData: ContentCreationData): ContentValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if user is logged in (this should be handled by auth guard)
    // But we can add additional validation here

    // Mandatory product tagging validation
    if (!contentData.products || contentData.products.length === 0) {
      errors.push('At least one product must be tagged in your content');
    }

    // Validate product tags
    if (contentData.products && contentData.products.length > 0) {
      contentData.products.forEach((tag, index) => {
        if (!tag.product) {
          errors.push(`Product tag ${index + 1} is missing product reference`);
        }
        
        if (tag.position) {
          if (tag.position.x < 0 || tag.position.x > 100) {
            errors.push(`Product tag ${index + 1} has invalid X position (must be 0-100)`);
          }
          if (tag.position.y < 0 || tag.position.y > 100) {
            errors.push(`Product tag ${index + 1} has invalid Y position (must be 0-100)`);
          }
        }
      });

      // Check for main product
      const mainProducts = contentData.products.filter(tag => tag.isMainProduct);
      if (mainProducts.length === 0) {
        warnings.push('Consider marking one product as the main product for better visibility');
      } else if (mainProducts.length > 1) {
        warnings.push('Only one product should be marked as main product');
      }
    }

    // Media validation
    if (!contentData.media || contentData.media.length === 0) {
      errors.push('At least one media file is required');
    }

    // Caption validation
    if (!contentData.caption || contentData.caption.trim().length === 0) {
      warnings.push('Adding a caption will help engage your audience');
    }

    // Content type specific validation
    switch (contentData.type) {
      case 'story':
        if (contentData.media && contentData.media.length > 1) {
          warnings.push('Stories typically work better with a single media file');
        }
        break;
      case 'reel':
        if (contentData.media && contentData.media.some(file => !file.type.startsWith('video/'))) {
          errors.push('Reels must contain video content only');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Create new content (post, story, or reel)
   */
  createContent(contentData: ContentCreationData): Observable<any> {
    // Validate content first
    const validation = this.validateContent(contentData);
    if (!validation.isValid) {
      return throwError(() => new Error(`Content validation failed: ${validation.errors.join(', ')}`));
    }

    // Create FormData for file upload
    const formData = new FormData();
    
    // Add media files
    contentData.media.forEach((file, index) => {
      formData.append(`media_${index}`, file);
    });

    // Add other data
    formData.append('type', contentData.type);
    formData.append('caption', contentData.caption);
    formData.append('products', JSON.stringify(contentData.products));
    
    if (contentData.tags) {
      formData.append('tags', JSON.stringify(contentData.tags));
    }
    
    if (contentData.location) {
      formData.append('location', JSON.stringify(contentData.location));
    }
    
    if (contentData.settings) {
      formData.append('settings', JSON.stringify(contentData.settings));
    }

    return this.http.post(`${this.apiUrl}/content/create`, formData).pipe(
      map((response: any) => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to create content');
      }),
      catchError(error => {
        console.error('Content creation error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get available products for tagging
   */
  getAvailableProducts(searchTerm?: string, category?: string): Observable<any[]> {
    let url = `${this.apiUrl}/products/available`;
    const params = new URLSearchParams();
    
    if (searchTerm) {
      params.append('search', searchTerm);
    }
    
    if (category) {
      params.append('category', category);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return this.http.get<any>(url).pipe(
      map((response: any) => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to fetch products');
      }),
      catchError(error => {
        console.error('Error fetching products:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get user's content with engagement stats
   */
  getUserContent(userId?: string, type?: 'post' | 'story' | 'reel'): Observable<any[]> {
    let url = `${this.apiUrl}/content/user`;
    const params = new URLSearchParams();
    
    if (userId) {
      params.append('userId', userId);
    }
    
    if (type) {
      params.append('type', type);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return this.http.get<any>(url).pipe(
      map((response: any) => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to fetch content');
      }),
      catchError(error => {
        console.error('Error fetching user content:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Track content engagement (views, clicks, etc.)
   */
  trackEngagement(contentId: string, engagementType: string, metadata?: any): Observable<any> {
    const data = {
      contentId,
      engagementType,
      metadata
    };

    return this.http.post(`${this.apiUrl}/content/track-engagement`, data).pipe(
      map((response: any) => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to track engagement');
      }),
      catchError(error => {
        console.error('Error tracking engagement:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get content analytics for vendor/creator
   */
  getContentAnalytics(timeRange: 'day' | 'week' | 'month' | 'year' = 'week'): Observable<any> {
    return this.http.get(`${this.apiUrl}/content/analytics?timeRange=${timeRange}`).pipe(
      map((response: any) => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to fetch analytics');
      }),
      catchError(error => {
        console.error('Error fetching content analytics:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete content
   */
  deleteContent(contentId: string, contentType: 'post' | 'story' | 'reel'): Observable<any> {
    return this.http.delete(`${this.apiUrl}/content/${contentType}/${contentId}`).pipe(
      map((response: any) => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to delete content');
      }),
      catchError(error => {
        console.error('Error deleting content:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Report content
   */
  reportContent(contentId: string, contentType: 'post' | 'story' | 'reel', reason: string): Observable<any> {
    const data = {
      contentId,
      contentType,
      reason
    };

    return this.http.post(`${this.apiUrl}/content/report`, data).pipe(
      map((response: any) => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Failed to report content');
      }),
      catchError(error => {
        console.error('Error reporting content:', error);
        return throwError(() => error);
      })
    );
  }
}
