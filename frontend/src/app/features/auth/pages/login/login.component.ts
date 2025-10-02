import { Component } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { RBACService } from '../../../../core/services/rbac.service';

@Component({
    selector: 'app-login',
    imports: [CommonModule, ReactiveFormsModule, 
      RouterModule, MatIconModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private rbacService: RBACService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }







  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      // Trim whitespace from form values
      const formData = {
        ...this.loginForm.value,
        email: this.loginForm.value.email?.trim(),
        password: this.loginForm.value.password?.trim()
      };

  this.authService.setRememberMe(!!formData.rememberMe);
  this.authService.login(formData).subscribe({
        next: (response) => {
          this.loading = false;
          // Handle backend response format: { success: true, data: { token, user } }
          const userData = response.data?.user || response.user;

          this.notificationService.success(
            'Login Successful!',
            `Welcome back, ${userData.fullName || userData.username}!`
          );

          // Initialize RBAC with user data
          this.rbacService.initializeUser(userData);

          // Unified role-based redirection
          this.redirectBasedOnRole(userData.role);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Invalid email or password. Please try again.';
          this.notificationService.error(
            'Login Failed',
            'Invalid email or password. Please check your credentials and try again.'
          );
        }
      });
    }
  }

  /**
   * Unified role-based redirection after successful login
   * Handles all user types through a single method
   */
  private redirectBasedOnRole(userRole: string): void {
    switch (userRole?.toLowerCase()) {
      case 'super_admin':
      case 'super admin':
        this.router.navigate(['/admin/dashboard']);
        break;

      case 'admin':
      case 'administrator':
        this.router.navigate(['/admin/dashboard']);
        break;

      case 'manager':
        this.router.navigate(['/admin/dashboard']);
        break;

      case 'vendor':
      case 'seller':
        this.router.navigate(['/vendor/dashboard']);
        break;

      case 'customer':
      case 'user':
      case 'end_user':
      case 'enduser':
        // End users go to home page first (Instagram-like flow)
        this.router.navigate(['/home']);
        break;

      default:
        // Default to home page for unknown roles
        this.router.navigate(['/home']);
        break;
    }
  }
}
