import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContentSecurityPolicyService {
  private nonces = new Map<string, string>();

  constructor() {
    this.initializeCSP();
  }

  /**
   * Initialize Content Security Policy
   */
  private initializeCSP(): void {
    if (typeof document !== 'undefined') {
      this.setCSPMetaTag();
      this.setupCSPReporting();
    }
  }

  /**
   * Generate a secure nonce for inline scripts/styles
   */
  generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const nonce = btoa(String.fromCharCode(...array));
    
    // Store nonce for validation
    this.nonces.set(nonce, Date.now().toString());
    
    return nonce;
  }

  /**
   * Validate nonce
   */
  validateNonce(nonce: string): boolean {
    return this.nonces.has(nonce);
  }

  /**
   * Clean up expired nonces (older than 1 hour)
   */
  cleanupNonces(): void {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    this.nonces.forEach((timestamp, nonce) => {
      if (parseInt(timestamp) < oneHourAgo) {
        this.nonces.delete(nonce);
      }
    });
  }

  /**
   * Get CSP policy string
   */
  getCSPPolicy(): string {
    const nonce = this.generateNonce();
    
    const policy = [
      // Default source - only allow same origin
      "default-src 'self'",
      
      // Script sources - allow self, specific CDNs, and nonce
      `script-src 'self' 'nonce-${nonce}' https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com`,
      
      // Style sources - allow self, inline styles with nonce, and specific CDNs
      `style-src 'self' 'nonce-${nonce}' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net`,
      
      // Image sources - allow self, data URLs for small images, and trusted domains
      "img-src 'self' data: https: blob:",
      
      // Font sources - allow self and Google Fonts
      "font-src 'self' https://fonts.gstatic.com data:",
      
      // Connect sources - allow self and API endpoints
      `connect-src 'self' ${environment.apiUrl} ${environment.socketUrl} https://api.stripe.com`,
      
      // Media sources - allow self and trusted CDNs
      "media-src 'self' https:",
      
      // Object sources - block all plugins
      "object-src 'none'",
      
      // Base URI - restrict to self
      "base-uri 'self'",
      
      // Form action - allow self and payment processors
      "form-action 'self' https://checkout.stripe.com",
      
      // Frame ancestors - prevent clickjacking
      "frame-ancestors 'none'",
      
      // Frame sources - allow trusted domains for payment iframes
      "frame-src 'self' https://checkout.stripe.com https://js.stripe.com",
      
      // Worker sources - allow self
      "worker-src 'self' blob:",
      
      // Manifest source - allow self
      "manifest-src 'self'",
      
      // Upgrade insecure requests in production
      environment.production ? "upgrade-insecure-requests" : "",
      
      // Block mixed content in production
      environment.production ? "block-all-mixed-content" : ""
    ].filter(Boolean).join('; ');

    return policy;
  }

  /**
   * Set CSP meta tag
   */
  private setCSPMetaTag(): void {
    // Remove existing CSP meta tag
    const existingTag = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (existingTag) {
      existingTag.remove();
    }

    // Create new CSP meta tag
    const metaTag = document.createElement('meta');
    metaTag.httpEquiv = 'Content-Security-Policy';
    metaTag.content = this.getCSPPolicy();
    document.head.appendChild(metaTag);
  }

  /**
   * Setup CSP violation reporting
   */
  private setupCSPReporting(): void {
    // Listen for CSP violations
    document.addEventListener('securitypolicyviolation', (event) => {
      this.handleCSPViolation(event as SecurityPolicyViolationEvent);
    });
  }

  /**
   * Handle CSP violations
   */
  private handleCSPViolation(event: SecurityPolicyViolationEvent): void {
    const violation = {
      documentURI: event.documentURI,
      referrer: event.referrer,
      blockedURI: event.blockedURI,
      violatedDirective: event.violatedDirective,
      effectiveDirective: event.effectiveDirective,
      originalPolicy: event.originalPolicy,
      sourceFile: event.sourceFile,
      lineNumber: event.lineNumber,
      columnNumber: event.columnNumber,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    // Log violation
    console.warn('CSP Violation:', violation);

    // Send violation report to server (if reporting endpoint is configured)
    if (environment.production) {
      this.reportViolation(violation);
    }
  }

  /**
   * Report CSP violation to server
   */
  private reportViolation(violation: any): void {
    fetch(`${environment.apiUrl}/api/security/csp-violation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(violation)
    }).catch(error => {
      console.error('Failed to report CSP violation:', error);
    });
  }

  /**
   * Create secure inline script with nonce
   */
  createSecureScript(scriptContent: string): HTMLScriptElement {
    const script = document.createElement('script');
    const nonce = this.generateNonce();
    
    script.nonce = nonce;
    script.textContent = scriptContent;
    
    return script;
  }

  /**
   * Create secure inline style with nonce
   */
  createSecureStyle(styleContent: string): HTMLStyleElement {
    const style = document.createElement('style');
    const nonce = this.generateNonce();
    
    style.nonce = nonce;
    style.textContent = styleContent;
    
    return style;
  }

  /**
   * Validate external resource URL against CSP
   */
  isAllowedResource(url: string, directive: string): boolean {
    const allowedDomains = this.getAllowedDomains(directive);
    
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      
      return allowedDomains.some(allowed => {
        if (allowed === "'self'") {
          return urlObj.origin === window.location.origin;
        }
        
        if (allowed.startsWith('*.')) {
          const baseDomain = allowed.substring(2);
          return domain.endsWith(baseDomain);
        }
        
        return domain === allowed || url.startsWith(allowed);
      });
    } catch {
      return false;
    }
  }

  /**
   * Get allowed domains for a specific CSP directive
   */
  private getAllowedDomains(directive: string): string[] {
    const policy = this.getCSPPolicy();
    const directiveMatch = policy.match(new RegExp(`${directive}\\s+([^;]+)`));
    
    if (!directiveMatch) {
      return [];
    }
    
    return directiveMatch[1].split(/\s+/).filter(Boolean);
  }

  /**
   * Update CSP policy dynamically (for SPA route changes)
   */
  updateCSPForRoute(routeSpecificPolicy?: string): void {
    let policy = this.getCSPPolicy();
    
    if (routeSpecificPolicy) {
      policy += '; ' + routeSpecificPolicy;
    }
    
    // Update meta tag
    const metaTag = document.querySelector('meta[http-equiv="Content-Security-Policy"]') as HTMLMetaElement;
    if (metaTag) {
      metaTag.content = policy;
    }
  }

  /**
   * Get CSP policy for specific environments
   */
  getEnvironmentSpecificPolicy(): string {
    if (environment.production) {
      return this.getProductionCSPPolicy();
    } else {
      return this.getDevelopmentCSPPolicy();
    }
  }

  /**
   * Production CSP policy (more restrictive)
   */
  private getProductionCSPPolicy(): string {
    const nonce = this.generateNonce();
    
    return [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}'`,
      `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com",
      `connect-src 'self' ${environment.apiUrl}`,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
      "block-all-mixed-content"
    ].join('; ');
  }

  /**
   * Development CSP policy (less restrictive for debugging)
   */
  private getDevelopmentCSPPolicy(): string {
    const nonce = this.generateNonce();
    
    return [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' 'unsafe-eval'`,
      `style-src 'self' 'nonce-${nonce}' 'unsafe-inline'`,
      "img-src 'self' data: https: http:",
      "font-src 'self' data: https:",
      "connect-src 'self' ws: wss: http: https:",
      "object-src 'none'",
      "base-uri 'self'"
    ].join('; ');
  }
}
