import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class XssProtectionService {

  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.sanitize(1, html) || '';
  }

  /**
   * Sanitize URL to prevent XSS attacks
   */
  sanitizeUrl(url: string): SafeUrl {
    return this.sanitizer.sanitize(4, url) || '';
  }

  /**
   * Sanitize resource URL (for iframes, etc.)
   */
  sanitizeResourceUrl(url: string): SafeResourceUrl {
    return this.sanitizer.sanitize(5, url) || '';
  }

  /**
   * Strip all HTML tags from content
   */
  stripHtml(html: string): string {
    if (!html) return '';
    
    // Create a temporary div element
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Return only text content
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  /**
   * Escape HTML special characters
   */
  escapeHtml(text: string): string {
    if (!text) return '';
    
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    };
    
    return text.replace(/[&<>"'`=\/]/g, (s) => map[s]);
  }

  /**
   * Validate and sanitize user input
   */
  sanitizeUserInput(input: string, allowedTags: string[] = []): string {
    if (!input) return '';
    
    // First escape HTML
    let sanitized = this.escapeHtml(input);
    
    // If specific tags are allowed, restore them
    if (allowedTags.length > 0) {
      allowedTags.forEach(tag => {
        const escapedTag = this.escapeHtml(`<${tag}>`);
        const escapedClosingTag = this.escapeHtml(`</${tag}>`);
        
        sanitized = sanitized
          .replace(new RegExp(escapedTag, 'gi'), `<${tag}>`)
          .replace(new RegExp(escapedClosingTag, 'gi'), `</${tag}>`);
      });
    }
    
    return sanitized;
  }

  /**
   * Remove dangerous attributes from HTML
   */
  removeDangerousAttributes(html: string): string {
    if (!html) return '';
    
    const dangerousAttributes = [
      'onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout',
      'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset',
      'onselect', 'onkeydown', 'onkeypress', 'onkeyup',
      'javascript:', 'vbscript:', 'data:', 'about:'
    ];
    
    let sanitized = html;
    
    dangerousAttributes.forEach(attr => {
      const regex = new RegExp(`\\s*${attr}\\s*=\\s*[^\\s>]*`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });
    
    return sanitized;
  }

  /**
   * Validate URL to prevent XSS through URL manipulation
   */
  isValidUrl(url: string): boolean {
    if (!url) return false;
    
    try {
      const urlObj = new URL(url);
      
      // Only allow HTTP and HTTPS protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }
      
      // Check for dangerous patterns
      const dangerousPatterns = [
        /javascript:/i,
        /vbscript:/i,
        /data:/i,
        /about:/i,
        /<script/i,
        /onload=/i,
        /onerror=/i
      ];
      
      return !dangerousPatterns.some(pattern => pattern.test(url));
    } catch {
      return false;
    }
  }

  /**
   * Sanitize JSON data to prevent XSS in API responses
   */
  sanitizeJsonData(data: any): any {
    if (typeof data === 'string') {
      return this.sanitizeUserInput(data);
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeJsonData(item));
    }
    
    if (data && typeof data === 'object') {
      const sanitized: any = {};
      Object.keys(data).forEach(key => {
        sanitized[key] = this.sanitizeJsonData(data[key]);
      });
      return sanitized;
    }
    
    return data;
  }

  /**
   * Content Security Policy helper
   */
  generateCSPNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  }

  /**
   * Validate file upload to prevent XSS through file uploads
   */
  validateFileUpload(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'application/json'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      errors.push('File type not allowed');
    }
    
    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.txt', '.json'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      errors.push('File extension not allowed');
    }
    
    // Check for double extensions (e.g., .jpg.exe)
    const extensionCount = (file.name.match(/\./g) || []).length;
    if (extensionCount > 1) {
      errors.push('Multiple file extensions not allowed');
    }
    
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push('File size too large');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize search query to prevent XSS in search results
   */
  sanitizeSearchQuery(query: string): string {
    if (!query) return '';
    
    return query
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/script/gi, '') // Remove script keyword
      .trim()
      .substring(0, 100); // Limit length
  }

  /**
   * Encode data for safe inclusion in HTML attributes
   */
  encodeForAttribute(data: string): string {
    if (!data) return '';
    
    return data
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Encode data for safe inclusion in JavaScript
   */
  encodeForJavaScript(data: string): string {
    if (!data) return '';
    
    return data
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e');
  }

  /**
   * Validate and sanitize CSS to prevent XSS through styles
   */
  sanitizeCSS(css: string): string {
    if (!css) return '';
    
    // Remove dangerous CSS properties and values
    const dangerousPatterns = [
      /expression\s*\(/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /data:/gi,
      /import/gi,
      /@import/gi,
      /behavior:/gi,
      /-moz-binding/gi
    ];
    
    let sanitized = css;
    dangerousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
    
    return sanitized;
  }
}

/**
 * XSS Protection Directive
 */
import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appXssProtection]'
})
export class XssProtectionDirective implements OnInit {
  @Input() allowedTags: string[] = [];

  constructor(
    private el: ElementRef,
    private xssProtection: XssProtectionService
  ) {}

  ngOnInit() {
    const element = this.el.nativeElement;
    
    if (element.innerHTML) {
      element.innerHTML = this.xssProtection.sanitizeUserInput(
        element.innerHTML,
        this.allowedTags
      );
    }
    
    if (element.textContent) {
      element.textContent = this.xssProtection.sanitizeUserInput(
        element.textContent
      );
    }
  }
}

/**
 * Safe HTML Pipe for templates
 */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'safeHtml'
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private xssProtection: XssProtectionService) {}

  transform(html: string, allowedTags: string[] = []): SafeHtml {
    const sanitized = this.xssProtection.sanitizeUserInput(html, allowedTags);
    return this.xssProtection.sanitizeHtml(sanitized);
  }
}
