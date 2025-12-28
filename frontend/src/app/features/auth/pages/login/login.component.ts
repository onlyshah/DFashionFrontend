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

          console.log('📱 Login component - received user data:', userData);
          console.log('📱 Login component - user role:', userData?.role);
          console.log('📱 Login component - authService.isAdmin():', this.authService.isAdmin());

          this.notificationService.success(
            'Login Successful!',
            `Welcome back, ${userData.fullName || userData.username}!`
          );

          // Initialize RBAC with user data
          this.rbacService.initializeUser(userData);

          // Add a small delay to ensure authService has processed the user before navigating
          setTimeout(() => {
            console.log('📱 Login component - about to redirect, authService.currentUser:', this.authService.currentUser);
            // Unified role-based redirection
            this.redirectBasedOnRole(userData.role);
          }, 100);
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
    console.log('🔄 redirectBasedOnRole() called with role:', userRole);
    const roleLC = userRole?.toLowerCase();
    console.log('🔄 Role (lowercase):', roleLC);

    switch (roleLC) {
      case 'super_admin':
      case 'super admin':
        console.log('🔄 Navigating to admin dashboard for super_admin');
        this.navigateOrReload(['/admin/dashboard']);
        break;

      case 'admin':
      case 'administrator':
        console.log('🔄 Navigating to admin dashboard for admin');
        this.navigateOrReload(['/admin/dashboard']);
        break;

      case 'manager':
        console.log('🔄 Navigating to admin dashboard for manager');
        this.navigateOrReload(['/admin/dashboard']);
        break;

      case 'vendor':
      case 'seller':
        console.log('🔄 Navigating to vendor dashboard');
        this.navigateOrReload(['/vendor/dashboard']);
        break;

      case 'customer':
      case 'user':
      case 'end_user':
      case 'enduser':
        // End users go to home page first (Instagram-like flow)
        console.log('🔄 Navigating to home for customer');
        this.navigateOrReload(['/home']);
        break;

      default:
        // Default to home page for unknown roles
        console.log('🔄 Unknown role, navigating to home');
        this.navigateOrReload(['/home']);
        break;
    }
  }

  // Attempt router navigation; on ChunkLoadError fall back to full reload to target URL
  private navigateOrReload(commands: any[]): void {
    const url = Array.isArray(commands) ? commands.join('/') : commands;
    this.router.navigate(commands).then(success => {
      console.log('🔄 Navigation result for', commands, success);
    }).catch((error) => {
      console.error('❌ Navigation failed, attempting full reload. Error:', error);
      const isChunkError = error && (error.name === 'ChunkLoadError' || /Loading chunk/i.test(error.message || ''));
      if (isChunkError) {
        // Force full reload to fetch updated lazy chunks
        window.location.href = url.startsWith('/') ? url : '/' + url;
      }
    });
  }
}
