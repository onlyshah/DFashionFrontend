import { Injectable } from '@angular/core';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiSecurityService {
  private requestCounts = new Map<string, { count: number; resetTime: number }>();
  private readonly MAX_REQUESTS_PER_MINUTE = 60;
  private readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

  constructor() {}

  /**
   * Get secure headers for API requests
   */
  getSecureHeaders(): HttpHeaders {
    let headers = new HttpHeaders();

    // Security headers
    headers = headers.set('X-Content-Type-Options', 'nosniff');
    headers = headers.set('X-Frame-Options', 'DENY');
    headers = headers.set('X-XSS-Protection', '1; mode=block');
    headers = headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers = headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers = headers.set('Pragma', 'no-cache');
    headers = headers.set('Expires', '0');

    // Request tracking
    headers = headers.set('X-Request-ID', this.generateRequestId());
    headers = headers.set('X-Request-Timestamp', Date.now().toString());

    // API version
    headers = headers.set('X-API-Version', '1.0');

    return headers;
  }

  /**
   * Validate request parameters
   */
  validateRequestParams(params: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!params) {
      return { isValid: true, errors: [] };
    }

    // Check for SQL injection patterns
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (typeof value === 'string') {
        if (this.containsSqlInjection(value)) {
          errors.push(`Invalid characters in parameter: ${key}`);
        }
        if (this.containsXssPatterns(value)) {
          errors.push(`Potentially dangerous content in parameter: ${key}`);
        }
      }
    });

    // Check parameter count (prevent parameter pollution)
    if (Object.keys(params).length > 50) {
      errors.push('Too many parameters');
    }

    // Check parameter name length
    Object.keys(params).forEach(key => {
      if (key.length > 100) {
        errors.push(`Parameter name too long: ${key}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Rate limiting check
   */
  checkRateLimit(endpoint: string): { allowed: boolean; retryAfter?: number } {
    const key = this.getEndpointKey(endpoint);
    const now = Date.now();
    const record = this.requestCounts.get(key);

    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.requestCounts.set(key, {
        count: 1,
        resetTime: now + this.RATE_LIMIT_WINDOW
      });
      return { allowed: true };
    }

    if (record.count >= this.MAX_REQUESTS_PER_MINUTE) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      return { allowed: false, retryAfter };
    }

    record.count++;
    return { allowed: true };
  }

  /**
   * Sanitize request payload
   */
  sanitizePayload(payload: any): any {
    if (typeof payload === 'string') {
      return this.sanitizeString(payload);
    }

    if (Array.isArray(payload)) {
      return payload.map(item => this.sanitizePayload(item));
    }

    if (payload && typeof payload === 'object') {
      const sanitized: any = {};
      Object.keys(payload).forEach(key => {
        // Sanitize key name
        const sanitizedKey = this.sanitizeString(key);
        sanitized[sanitizedKey] = this.sanitizePayload(payload[key]);
      });
      return sanitized;
    }

    return payload;
  }

  /**
   * Validate API response
   */
  validateResponse(response: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!response) {
      errors.push('Empty response');
      return { isValid: false, errors };
    }

    // Check response structure
    if (typeof response !== 'object') {
      errors.push('Invalid response format');
    }

    // Check for potential XSS in response data
    if (this.containsXssInObject(response)) {
      errors.push('Response contains potentially dangerous content');
    }

    // Check response size (prevent DoS)
    const responseSize = JSON.stringify(response).length;
    if (responseSize > 10 * 1024 * 1024) { // 10MB limit
      errors.push('Response too large');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate secure request ID
   */
  private generateRequestId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get endpoint key for rate limiting
   */
  private getEndpointKey(endpoint: string): string {
    // Remove query parameters and normalize
    const baseEndpoint = endpoint.split('?')[0];
    return baseEndpoint.toLowerCase();
  }

  /**
   * Check for SQL injection patterns
   */
  private containsSqlInjection(value: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
      /(--|\/\*|\*\/)/g,
      /(\b(SCRIPT|JAVASCRIPT|VBSCRIPT)\b)/gi,
      /(\bEXEC\s*\()/gi
    ];

    return sqlPatterns.some(pattern => pattern.test(value));
  }

  /**
   * Check for XSS patterns
   */
  private containsXssPatterns(value: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<img[^>]+src[^>]*>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi
    ];

    return xssPatterns.some(pattern => pattern.test(value));
  }

  /**
   * Check for XSS in object recursively
   */
  private containsXssInObject(obj: any): boolean {
    if (typeof obj === 'string') {
      return this.containsXssPatterns(obj);
    }

    if (Array.isArray(obj)) {
      return obj.some(item => this.containsXssInObject(item));
    }

    if (obj && typeof obj === 'object') {
      return Object.values(obj).some(value => this.containsXssInObject(value));
    }

    return false;
  }

  /**
   * Sanitize string input
   */
  private sanitizeString(input: string): string {
    if (!input) return '';

    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/script/gi, '') // Remove script keyword
      .replace(/['"`;\\]/g, '') // Remove SQL injection characters
      .trim()
      .substring(0, 1000); // Limit length
  }

  /**
   * Validate file upload security
   */
  validateFileUpload(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push('File size exceeds 10MB limit');
    }

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

    // Check for double extensions
    const extensionCount = (file.name.match(/\./g) || []).length;
    if (extensionCount > 1) {
      errors.push('Multiple file extensions not allowed');
    }

    // Check filename for dangerous patterns
    if (this.containsXssPatterns(file.name)) {
      errors.push('Filename contains invalid characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate secure API key for client-side operations
   */
  generateApiKey(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  }

  /**
   * Validate API endpoint URL
   */
  validateEndpointUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);

      // Only allow HTTPS in production
      if (environment.production && urlObj.protocol !== 'https:') {
        return false;
      }

      // Check if URL is in allowed domains
      const allowedDomains = [
        environment.apiUrl,
        'localhost:3001',
        '127.0.0.1:3001'
      ];

      const isAllowed = allowedDomains.some(domain => {
        return url.startsWith(domain) || url.includes(domain);
      });

      return isAllowed;
    } catch {
      return false;
    }
  }

  /**
   * Clean up expired rate limit records
   */
  cleanupRateLimits(): void {
    const now = Date.now();
    this.requestCounts.forEach((record, key) => {
      if (now > record.resetTime) {
        this.requestCounts.delete(key);
      }
    });
  }

  /**
   * Get rate limit status for endpoint
   */
  getRateLimitStatus(endpoint: string): { remaining: number; resetTime: number } {
    const key = this.getEndpointKey(endpoint);
    const record = this.requestCounts.get(key);

    if (!record || Date.now() > record.resetTime) {
      return {
        remaining: this.MAX_REQUESTS_PER_MINUTE,
        resetTime: Date.now() + this.RATE_LIMIT_WINDOW
      };
    }

    return {
      remaining: Math.max(0, this.MAX_REQUESTS_PER_MINUTE - record.count),
      resetTime: record.resetTime
    };
  }
}
