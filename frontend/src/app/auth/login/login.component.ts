import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RBACService } from '../../core/services/rbac.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage: string = '';
  showPassword = false;
  apiUrl = '/api';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private rbacService: RBACService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Check if already logged in
    if (this.authService.isAuthenticated) {
      const user = this.authService.currentUser;
      this.redirectBasedOnRole(user?.role);
    }
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        const { email, password, rememberMe } = this.loginForm.value;
        const credentials = { email, password, rememberMe };
        
        const response = await this.authService.login(credentials).toPromise();

        if (response?.success || response?.data) {
          console.log('Login response:', response);
          // Load user permissions
          const user = response.data?.user || response.user;
          this.rbacService.initializeUser(user);

          // Redirect based on role
          this.redirectBasedOnRole(user?.role);
        } else {
          this.errorMessage = response?.message || 'Login failed. Please try again.';
        }
      } catch (error: any) {
        this.errorMessage = error.error?.message || error.message || 'Login failed. Please try again.';
      } finally {
        this.isLoading = false;
      }
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  redirectBasedOnRole(role?: string): void {
    // Route based on user role
    const roleRoutes: { [key: string]: string } = {
      'super_admin': '/admin/dashboard',
      'admin': '/admin/dashboard',
      'manager': '/admin/dashboard',
      'vendor': '/vendor/dashboard',
      'customer': '/user-dashboard'
    };

    const redirectUrl = roleRoutes[role || 'customer'] || '/home';
    this.router.navigate([redirectUrl]);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    if (control.errors['email']) {
      return 'Please enter a valid email address';
    }
    if (control.errors['minlength']) {
      return 'Password must be at least 6 characters';
    }
    return '';
  }
}