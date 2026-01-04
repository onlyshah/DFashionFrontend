import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  errorMessage: string = '';
  successMessage: string = '';
  emailSent = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    // Check if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  async onSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        const { email } = this.forgotPasswordForm.value;
        const response = await this.authService.forgotPassword(email);

        if (response.success) {
          this.successMessage = response.message || 'Password reset link sent to your email. Please check your inbox.';
          this.emailSent = true;
          this.forgotPasswordForm.reset();

          // Redirect to login after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Failed to send reset link. Please try again.';
        }
      } catch (error: any) {
        this.errorMessage = error.error?.message || error.message || 'An error occurred. Please try again.';
      } finally {
        this.isLoading = false;
      }
    } else {
      this.forgotPasswordForm.markAllAsTouched();
    }
  }

  getErrorMessage(field: string): string {
    const control = this.forgotPasswordForm.get(field);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    if (control.errors['email']) {
      return 'Please enter a valid email address';
    }
    return '';
  }

  goBack(): void {
    this.router.navigate(['/auth/login']);
  }
}
