import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  isLoading = false;
  isVerifying = true;
  isTokenValid = false;
  errorMessage: string = '';
  successMessage: string = '';
  resetToken: string = '';
  userEmail: string = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Check if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Get token from URL query params
    this.route.queryParams.subscribe(params => {
      this.resetToken = params['token'];

      if (!this.resetToken) {
        this.errorMessage = 'Invalid reset link. Please request a new password reset.';
        this.isVerifying = false;
        return;
      }

      // Verify the token
      this.verifyToken();
    });
  }

  async verifyToken() {
    try {
      const response = await this.authService.verifyResetToken(this.resetToken);

      if (response.success) {
        this.isTokenValid = true;
        this.userEmail = response.data?.email || '';
      } else {
        this.errorMessage = response.message || 'Invalid or expired reset token.';
      }
    } catch (error: any) {
      this.errorMessage = error.error?.message || 'Failed to verify token. Please request a new password reset.';
    } finally {
      this.isVerifying = false;
    }
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) return null;

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  async onSubmit() {
    if (this.resetPasswordForm.valid && this.isTokenValid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        const { password, confirmPassword } = this.resetPasswordForm.value;
        const response = await this.authService.resetPassword(
          this.resetToken,
          password,
          confirmPassword
        );

        if (response.success) {
          this.successMessage = response.message || 'Password reset successfully! Redirecting to login...';
          this.resetPasswordForm.reset();

          // Redirect to login after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        } else {
          this.errorMessage = response.message || 'Failed to reset password. Please try again.';
        }
      } catch (error: any) {
        this.errorMessage = error.error?.message || error.message || 'An error occurred. Please try again.';
      } finally {
        this.isLoading = false;
      }
    } else {
      this.resetPasswordForm.markAllAsTouched();
    }
  }

  getErrorMessage(field: string): string {
    const control = this.resetPasswordForm.get(field);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) {
      return `${field === 'confirmPassword' ? 'Confirm Password' : 'Password'} is required`;
    }
    if (control.errors['minlength']) {
      return 'Password must be at least 6 characters long';
    }
    return '';
  }

  getFormError(): string {
    if (this.resetPasswordForm.errors && this.resetPasswordForm.errors['passwordMismatch']) {
      return 'Passwords do not match';
    }
    return '';
  }

  togglePasswordVisibility(field: string): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  // Helpers used in template for password strength checks
  passwordValue(): string {
    return this.resetPasswordForm.get('password')?.value ?? '';
  }

  hasNumber(): boolean {
    return /[0-9]/.test(this.passwordValue());
  }

  hasUppercase(): boolean {
    return /[A-Z]/.test(this.passwordValue());
  }

  lengthOK(): boolean {
    return (this.passwordValue().length ?? 0) >= 6;
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
