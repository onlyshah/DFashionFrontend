import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ValidationService } from '../../../core/services/validation.service';

export interface SecureFormField {
  name: string;
  type: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'textarea' | 'select' | 'file';
  label: string;
  placeholder?: string;
  required?: boolean;
  validators?: any[];
  options?: { value: any; label: string }[]; // For select fields
  accept?: string; // For file fields
  maxSize?: number; // For file fields (in MB)
}

@Component({
  selector: 'app-secure-form',
  template: `
    <form [formGroup]="secureForm" (ngSubmit)="onSubmit()" class="secure-form">
      <div *ngFor="let field of fields" class="form-field">
        
        <!-- Text, Email, Password, Tel, URL, Number inputs -->
        <div *ngIf="['text', 'email', 'password', 'tel', 'url', 'number'].includes(field.type)" 
             class="input-group">
          <label [for]="field.name" class="form-label">
            {{ field.label }}
            <span *ngIf="field.required" class="required">*</span>
          </label>
          
          <input
            [id]="field.name"
            [formControlName]="field.name"
            [type]="field.type"
            [placeholder]="field.placeholder || ''"
            class="form-control"
            [class.is-invalid]="isFieldInvalid(field.name)"
            [attr.data-testid]="field.name + '-input'"
            autocomplete="off"
            spellcheck="false"
            (blur)="onFieldBlur(field.name)"
            (input)="onFieldInput(field.name, $event)"
          />
          
          <!-- Password strength indicator -->
          <div *ngIf="field.type === 'password' && getFieldValue(field.name)" 
               class="password-strength">
            <div class="strength-meter">
              <div class="strength-bar" 
                   [ngClass]="getPasswordStrength(getFieldValue(field.name))"></div>
            </div>
            <small class="strength-text">
              {{ getPasswordStrengthText(getFieldValue(field.name)) }}
            </small>
          </div>
        </div>

        <!-- Textarea -->
        <div *ngIf="field.type === 'textarea'" class="input-group">
          <label [for]="field.name" class="form-label">
            {{ field.label }}
            <span *ngIf="field.required" class="required">*</span>
          </label>
          
          <textarea
            [id]="field.name"
            [formControlName]="field.name"
            [placeholder]="field.placeholder || ''"
            class="form-control"
            [class.is-invalid]="isFieldInvalid(field.name)"
            [attr.data-testid]="field.name + '-input'"
            rows="4"
            maxlength="1000"
            (blur)="onFieldBlur(field.name)"
            (input)="onFieldInput(field.name, $event)"
          ></textarea>
          
          <small class="char-count">
            {{ getFieldValue(field.name)?.length || 0 }}/1000
          </small>
        </div>

        <!-- Select -->
        <div *ngIf="field.type === 'select'" class="input-group">
          <label [for]="field.name" class="form-label">
            {{ field.label }}
            <span *ngIf="field.required" class="required">*</span>
          </label>
          
          <select
            [id]="field.name"
            [formControlName]="field.name"
            class="form-control"
            [class.is-invalid]="isFieldInvalid(field.name)"
            [attr.data-testid]="field.name + '-select'"
          >
            <option value="">Select {{ field.label }}</option>
            <option *ngFor="let option of field.options" [value]="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <!-- File Upload -->
        <div *ngIf="field.type === 'file'" class="input-group">
          <label [for]="field.name" class="form-label">
            {{ field.label }}
            <span *ngIf="field.required" class="required">*</span>
          </label>
          
          <input
            [id]="field.name"
            type="file"
            [accept]="field.accept || '*'"
            class="form-control"
            [class.is-invalid]="isFieldInvalid(field.name)"
            [attr.data-testid]="field.name + '-input'"
            (change)="onFileSelect(field.name, $event)"
          />
          
          <small class="file-info">
            Max size: {{ field.maxSize || 5 }}MB
            <span *ngIf="field.accept">
              | Allowed: {{ field.accept }}
            </span>
          </small>
        </div>

        <!-- Field Errors -->
        <div *ngIf="isFieldInvalid(field.name)" class="field-errors">
          <small *ngFor="let error of getFieldErrors(field.name)" 
                 class="error-message"
                 [attr.data-testid]="field.name + '-error'">
            {{ error }}
          </small>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button
          type="submit"
          class="btn btn-primary"
          [disabled]="secureForm.invalid || isSubmitting"
          [attr.data-testid]="submitButtonTestId"
        >
          <span *ngIf="isSubmitting" class="spinner"></span>
          {{ submitText }}
        </button>
        
        <button
          *ngIf="showCancelButton"
          type="button"
          class="btn btn-secondary"
          (click)="onCancel()"
          [disabled]="isSubmitting"
        >
          Cancel
        </button>
      </div>

      <!-- Security Notice -->
      <div class="security-notice">
        <small>
          <i class="icon-shield"></i>
          Your information is protected with enterprise-grade security.
        </small>
      </div>
    </form>
  `,
  styleUrls: ['./secure-form.component.scss']
})
export class SecureFormComponent implements OnInit {
  @Input() fields: SecureFormField[] = [];
  @Input() submitText = 'Submit';
  @Input() submitButtonTestId = 'submit-button';
  @Input() showCancelButton = false;
  @Input() initialValues: any = {};

  @Output() formSubmit = new EventEmitter<any>();
  @Output() formCancel = new EventEmitter<void>();
  @Output() fieldChange = new EventEmitter<{ field: string; value: any }>();

  secureForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private validationService: ValidationService
  ) {}

  ngOnInit() {
    this.buildForm();
  }

  private buildForm() {
    const formControls: any = {};

    this.fields.forEach(field => {
      const validators = this.buildValidators(field);
      const initialValue = this.initialValues[field.name] || '';
      
      formControls[field.name] = [initialValue, validators];
    });

    this.secureForm = this.fb.group(formControls);
  }

  private buildValidators(field: SecureFormField): any[] {
    const validators: any[] = [];

    if (field.required) {
      validators.push(Validators.required);
    }

    // Add type-specific validators
    switch (field.type) {
      case 'email':
        validators.push(ValidationService.emailValidator());
        break;
      case 'password':
        validators.push(ValidationService.strongPasswordValidator());
        break;
      case 'tel':
        validators.push(ValidationService.phoneValidator());
        break;
      case 'url':
        validators.push(ValidationService.urlValidator());
        break;
      case 'file':
        if (field.accept && field.maxSize) {
          const allowedTypes = field.accept.split(',').map(type => type.trim());
          validators.push(ValidationService.fileValidator(allowedTypes, field.maxSize));
        }
        break;
    }

    // Add custom validators if provided
    if (field.validators) {
      validators.push(...field.validators);
    }

    return validators;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.secureForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldErrors(fieldName: string): string[] {
    const field = this.secureForm.get(fieldName);
    if (!field || !field.errors) return [];

    const errors: string[] = [];
    const fieldConfig = this.fields.find(f => f.name === fieldName);

    Object.keys(field.errors).forEach(errorKey => {
      switch (errorKey) {
        case 'required':
          errors.push(`${fieldConfig?.label} is required`);
          break;
        case 'invalidEmail':
          errors.push('Please enter a valid email address');
          break;
        case 'minLength':
          errors.push('Password must be at least 8 characters long');
          break;
        case 'maxLength':
          errors.push('Password cannot exceed 128 characters');
          break;
        case 'uppercase':
          errors.push('Password must contain at least one uppercase letter');
          break;
        case 'lowercase':
          errors.push('Password must contain at least one lowercase letter');
          break;
        case 'number':
          errors.push('Password must contain at least one number');
          break;
        case 'specialChar':
          errors.push('Password must contain at least one special character');
          break;
        case 'commonPassword':
          errors.push('Please choose a more secure password');
          break;
        case 'invalidPhone':
          errors.push('Please enter a valid phone number');
          break;
        case 'invalidUrl':
          errors.push('Please enter a valid URL');
          break;
        case 'invalidCard':
          errors.push('Please enter a valid credit card number');
          break;
        case 'invalidType':
          errors.push('File type not allowed');
          break;
        case 'fileTooLarge':
          errors.push(`File size exceeds ${fieldConfig?.maxSize || 5}MB limit`);
          break;
        case 'dangerousFile':
          errors.push('File type not allowed for security reasons');
          break;
        default:
          errors.push(`Invalid ${fieldConfig?.label?.toLowerCase()}`);
      }
    });

    return errors;
  }

  getFieldValue(fieldName: string): any {
    return this.secureForm.get(fieldName)?.value;
  }

  onFieldBlur(fieldName: string) {
    const field = this.secureForm.get(fieldName);
    if (field) {
      field.markAsTouched();
    }
  }

  onFieldInput(fieldName: string, event: any) {
    let value = event.target.value;
    
    // Sanitize input
    if (typeof value === 'string') {
      value = this.validationService.sanitizeInput(value);
      
      // Update form control with sanitized value
      if (value !== event.target.value) {
        this.secureForm.get(fieldName)?.setValue(value);
      }
    }

    this.fieldChange.emit({ field: fieldName, value });
  }

  onFileSelect(fieldName: string, event: any) {
    const file = event.target.files[0];
    if (file) {
      this.secureForm.get(fieldName)?.setValue(file);
      this.fieldChange.emit({ field: fieldName, value: file });
    }
  }

  getPasswordStrength(password: string): string {
    if (!password) return '';
    
    let score = 0;
    
    // Length
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Character types
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
    
    if (score < 3) return 'weak';
    if (score < 5) return 'medium';
    return 'strong';
  }

  getPasswordStrengthText(password: string): string {
    const strength = this.getPasswordStrength(password);
    switch (strength) {
      case 'weak': return 'Weak password';
      case 'medium': return 'Medium strength';
      case 'strong': return 'Strong password';
      default: return '';
    }
  }

  onSubmit() {
    if (this.secureForm.valid) {
      this.isSubmitting = true;
      
      // Sanitize form data before submission
      const formData = { ...this.secureForm.value };
      Object.keys(formData).forEach(key => {
        if (typeof formData[key] === 'string') {
          formData[key] = this.validationService.sanitizeInput(formData[key]);
        }
      });

      this.formSubmit.emit(formData);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.secureForm.controls).forEach(key => {
        this.secureForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel() {
    this.formCancel.emit();
  }

  // Public method to reset form
  resetForm() {
    this.secureForm.reset();
    this.isSubmitting = false;
  }

  // Public method to set submission state
  setSubmitting(isSubmitting: boolean) {
    this.isSubmitting = isSubmitting;
  }
}
