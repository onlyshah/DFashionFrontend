import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface SecurityConfig {
  // Authentication
  maxLoginAttempts: number;
  lockoutDuration: number;
  sessionTimeout: number;
  tokenRefreshInterval: number;
  
  // Rate Limiting
  maxRequestsPerMinute: number;
  rateLimitWindow: number;
  
  // File Upload
  maxFileSize: number;
  allowedFileTypes: string[];
  allowedFileExtensions: string[];
  
  // Input Validation
  maxInputLength: number;
  maxParameterCount: number;
  maxParameterNameLength: number;
  
  // Response Validation
  maxResponseSize: number;
  
  // CSP
  enableCSP: boolean;
  cspReportingEndpoint?: string;
  
  // XSS Protection
  enableXssProtection: boolean;
  allowedHtmlTags: string[];
  
  // CSRF Protection
  enableCsrfProtection: boolean;
  csrfTokenExpiry: number;
}

@Injectable({
  providedIn: 'root'
})
export class SecurityConfigService {
  private config: SecurityConfig;

  constructor() {
    this.config = this.getDefaultConfig();
    this.loadEnvironmentConfig();
  }

  /**
   * Get security configuration
   */
  getConfig(): SecurityConfig {
    return { ...this.config };
  }

  /**
   * Update security configuration
   */
  updateConfig(updates: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get default security configuration
   */
  private getDefaultConfig(): SecurityConfig {
    return {
      // Authentication
      maxLoginAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutes
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      tokenRefreshInterval: 5 * 60 * 1000, // 5 minutes
      
      // Rate Limiting
      maxRequestsPerMinute: 60,
      rateLimitWindow: 60 * 1000, // 1 minute
      
      // File Upload
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedFileTypes: [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 'application/json'
      ],
      allowedFileExtensions: [
        '.jpg', '.jpeg', '.png', '.gif', '.webp',
        '.pdf', '.txt', '.json'
      ],
      
      // Input Validation
      maxInputLength: 1000,
      maxParameterCount: 50,
      maxParameterNameLength: 100,
      
      // Response Validation
      maxResponseSize: 10 * 1024 * 1024, // 10MB
      
      // CSP
      enableCSP: true,
      cspReportingEndpoint: environment.production ? `${environment.apiUrl}/api/security/csp-violation` : undefined,
      
      // XSS Protection
      enableXssProtection: true,
      allowedHtmlTags: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
      
      // CSRF Protection
      enableCsrfProtection: true,
      csrfTokenExpiry: 60 * 60 * 1000 // 1 hour
    };
  }

  /**
   * Load environment-specific configuration
   */
  private loadEnvironmentConfig(): void {
    if (environment.production) {
      // Production security settings (more restrictive)
      this.updateConfig({
        maxLoginAttempts: 3,
        lockoutDuration: 30 * 60 * 1000, // 30 minutes
        sessionTimeout: 15 * 60 * 1000, // 15 minutes
        maxRequestsPerMinute: 30,
        maxFileSize: 5 * 1024 * 1024, // 5MB
        maxInputLength: 500,
        maxParameterCount: 25
      });
    } else {
      // Development security settings (less restrictive for debugging)
      this.updateConfig({
        maxLoginAttempts: 10,
        lockoutDuration: 5 * 60 * 1000, // 5 minutes
        sessionTimeout: 60 * 60 * 1000, // 1 hour
        maxRequestsPerMinute: 120,
        enableCSP: false // Disable CSP in development for easier debugging
      });
    }
  }

  /**
   * Validate security configuration
   */
  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate authentication settings
    if (this.config.maxLoginAttempts < 1 || this.config.maxLoginAttempts > 20) {
      errors.push('maxLoginAttempts must be between 1 and 20');
    }

    if (this.config.lockoutDuration < 60000 || this.config.lockoutDuration > 3600000) {
      errors.push('lockoutDuration must be between 1 minute and 1 hour');
    }

    if (this.config.sessionTimeout < 300000 || this.config.sessionTimeout > 7200000) {
      errors.push('sessionTimeout must be between 5 minutes and 2 hours');
    }

    // Validate rate limiting
    if (this.config.maxRequestsPerMinute < 1 || this.config.maxRequestsPerMinute > 1000) {
      errors.push('maxRequestsPerMinute must be between 1 and 1000');
    }

    // Validate file upload settings
    if (this.config.maxFileSize < 1024 || this.config.maxFileSize > 100 * 1024 * 1024) {
      errors.push('maxFileSize must be between 1KB and 100MB');
    }

    if (this.config.allowedFileTypes.length === 0) {
      errors.push('allowedFileTypes cannot be empty');
    }

    // Validate input validation settings
    if (this.config.maxInputLength < 10 || this.config.maxInputLength > 10000) {
      errors.push('maxInputLength must be between 10 and 10000');
    }

    if (this.config.maxParameterCount < 1 || this.config.maxParameterCount > 200) {
      errors.push('maxParameterCount must be between 1 and 200');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get security headers configuration
   */
  getSecurityHeaders(): { [key: string]: string } {
    const headers: { [key: string]: string } = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };

    if (this.config.enableXssProtection) {
      headers['X-XSS-Protection'] = '1; mode=block';
    }

    if (environment.production) {
      headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
    }

    return headers;
  }

  /**
   * Get Content Security Policy configuration
   */
  getCSPConfig(): string {
    if (!this.config.enableCSP) {
      return '';
    }

    const directives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com data:",
      `connect-src 'self' ${environment.apiUrl} ${environment.socketUrl}`,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'"
    ];

    if (environment.production) {
      directives.push('upgrade-insecure-requests');
      directives.push('block-all-mixed-content');
    }

    if (this.config.cspReportingEndpoint) {
      directives.push(`report-uri ${this.config.cspReportingEndpoint}`);
    }

    return directives.join('; ');
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(feature: keyof SecurityConfig): boolean {
    return !!this.config[feature];
  }

  /**
   * Get feature configuration value
   */
  getFeatureConfig<T>(feature: keyof SecurityConfig): T {
    return this.config[feature] as T;
  }

  /**
   * Reset configuration to defaults
   */
  resetToDefaults(): void {
    this.config = this.getDefaultConfig();
    this.loadEnvironmentConfig();
  }

  /**
   * Export configuration for backup
   */
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Import configuration from backup
   */
  importConfig(configJson: string): { success: boolean; error?: string } {
    try {
      const importedConfig = JSON.parse(configJson);
      const validation = this.validateConfig();
      
      if (!validation.isValid) {
        return {
          success: false,
          error: `Invalid configuration: ${validation.errors.join(', ')}`
        };
      }

      this.config = { ...this.getDefaultConfig(), ...importedConfig };
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid JSON format'
      };
    }
  }
}
