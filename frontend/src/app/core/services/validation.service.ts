import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() { }

  /**
   * Sanitize input to prevent XSS attacks
   */
  sanitizeInput(input: string): string {
    if (!input) return '';
    
    return input
      .replace(/[<>]/g, '') // Remove < and > characters
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/script/gi, '') // Remove script tags
      .trim();
  }

  /**
   * Validate email format with enhanced security
   */
  static emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const isValid = emailRegex.test(control.value);
      
      // Additional security checks
      const hasValidLength = control.value.length <= 254; // RFC 5321 limit
      const noConsecutiveDots = !control.value.includes('..');
      const noStartEndDots = !control.value.startsWith('.') && !control.value.endsWith('.');
      
      return isValid && hasValidLength && noConsecutiveDots && noStartEndDots 
        ? null 
        : { invalidEmail: true };
    };
  }

  /**
   * Strong password validator
   */
  static strongPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const password = control.value;
      const errors: ValidationErrors = {};
      
      // Minimum 8 characters
      if (password.length < 8) {
        errors['minLength'] = true;
      }
      
      // Maximum 128 characters (prevent DoS)
      if (password.length > 128) {
        errors['maxLength'] = true;
      }
      
      // At least one uppercase letter
      if (!/[A-Z]/.test(password)) {
        errors['uppercase'] = true;
      }
      
      // At least one lowercase letter
      if (!/[a-z]/.test(password)) {
        errors['lowercase'] = true;
      }
      
      // At least one number
      if (!/\d/.test(password)) {
        errors['number'] = true;
      }
      
      // At least one special character
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors['specialChar'] = true;
      }
      
      // No common passwords
      const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
      if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
        errors['commonPassword'] = true;
      }
      
      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  /**
   * Username validator with security considerations
   */
  static usernameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const username = control.value;
      const errors: ValidationErrors = {};
      
      // Length validation
      if (username.length < 3) {
        errors['minLength'] = true;
      }
      
      if (username.length > 30) {
        errors['maxLength'] = true;
      }
      
      // Only alphanumeric and underscore allowed
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        errors['invalidCharacters'] = true;
      }
      
      // Cannot start with number
      if (/^\d/.test(username)) {
        errors['startsWithNumber'] = true;
      }
      
      // Reserved usernames
      const reservedUsernames = ['admin', 'root', 'user', 'test', 'guest', 'api', 'www'];
      if (reservedUsernames.includes(username.toLowerCase())) {
        errors['reserved'] = true;
      }
      
      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  /**
   * Phone number validator
   */
  static phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      // Remove all non-digit characters for validation
      const phoneDigits = control.value.replace(/\D/g, '');
      
      // Check length (10-15 digits for international numbers)
      if (phoneDigits.length < 10 || phoneDigits.length > 15) {
        return { invalidPhone: true };
      }
      
      return null;
    };
  }

  /**
   * Credit card validator (basic Luhn algorithm)
   */
  static creditCardValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const cardNumber = control.value.replace(/\s/g, '');
      
      // Check if all digits
      if (!/^\d+$/.test(cardNumber)) {
        return { invalidCard: true };
      }
      
      // Check length (13-19 digits)
      if (cardNumber.length < 13 || cardNumber.length > 19) {
        return { invalidCard: true };
      }
      
      // Luhn algorithm
      let sum = 0;
      let isEven = false;
      
      for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber.charAt(i));
        
        if (isEven) {
          digit *= 2;
          if (digit > 9) {
            digit -= 9;
          }
        }
        
        sum += digit;
        isEven = !isEven;
      }
      
      return sum % 10 === 0 ? null : { invalidCard: true };
    };
  }

  /**
   * URL validator with security checks
   */
  static urlValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      try {
        const url = new URL(control.value);
        
        // Only allow HTTP and HTTPS
        if (!['http:', 'https:'].includes(url.protocol)) {
          return { invalidUrl: true };
        }
        
        // Prevent localhost and private IPs in production
        const hostname = url.hostname.toLowerCase();
        if (hostname === 'localhost' || 
            hostname.startsWith('127.') || 
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.') ||
            hostname.startsWith('172.')) {
          return { privateUrl: true };
        }
        
        return null;
      } catch {
        return { invalidUrl: true };
      }
    };
  }

  /**
   * File upload validator
   */
  static fileValidator(allowedTypes: string[], maxSizeMB: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const file = control.value as File;
      const errors: ValidationErrors = {};
      
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        errors['invalidType'] = true;
      }
      
      // Check file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        errors['fileTooLarge'] = true;
      }
      
      // Check for potentially dangerous file extensions
      const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.js', '.vbs'];
      const fileName = file.name.toLowerCase();
      if (dangerousExtensions.some(ext => fileName.endsWith(ext))) {
        errors['dangerousFile'] = true;
      }
      
      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  /**
   * SQL injection prevention for search terms
   */
  sanitizeSearchTerm(searchTerm: string): string {
    if (!searchTerm) return '';
    
    return searchTerm
      .replace(/['"`;\\]/g, '') // Remove SQL injection characters
      .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b/gi, '') // Remove SQL keywords
      .trim()
      .substring(0, 100); // Limit length
  }

  /**
   * HTML content sanitizer for user-generated content
   */
  sanitizeHtmlContent(content: string): string {
    if (!content) return '';
    
    // Allow only safe HTML tags
    const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'];
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
    
    return content.replace(tagRegex, (match, tagName) => {
      return allowedTags.includes(tagName.toLowerCase()) ? match : '';
    });
  }
}
