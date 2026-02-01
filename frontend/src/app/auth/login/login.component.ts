import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { RBACService } from '../../core/services/rbac.service';
import { getRedirectPathForRole } from '../../config/roleRedirectMap';

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
        
        console.log('📝 Login attempt with:', { email, rememberMe });
        
        // Set the rememberMe flag in the auth service before login
        this.authService.setRememberMe(rememberMe);
        
        console.log('🔄 Starting login request...');
        const { firstValueFrom, timeout } = await import('rxjs');
        const loginObservable = this.authService.login({ email, password }).pipe(
          timeout(30000), // 30 second timeout
          tap(resp => console.log('🔄 Login observable emitted:', resp)),
          catchError(err => {
            console.error('🔄 Login observable error:', err);
            throw err;
          })
        );
        
        console.log('🔄 Converting to promise...');
        const response = await firstValueFrom(loginObservable);
        console.log('🔄 Promise resolved with response:', response);

        console.log('📨 Login response received:', response);

        if (response?.success || response?.data) {
          console.log('✅ Login successful, response:', response);
          // Load user permissions
          const user = (this.authService.currentUserValue as any)?.user || response.data?.user || response.user;
          this.rbacService.initializeUser(user);

          // Prefer backend-provided redirectPath, otherwise fallback to role mapping
          const redirectPath = response.data?.redirectPath || response.redirectPath;
          const finalRedirect = redirectPath || getRedirectPathForRole(user?.role, '/home');
          console.log('➡️ Redirect chosen:', { redirectPath, userRole: user?.role, finalRedirect });
          this.router.navigate([finalRedirect]);
        } else {
          this.errorMessage = response?.message || 'Login failed. Please try again.';
          console.error('❌ Login response invalid:', response);
        }
      } catch (error: any) {
        console.error('❌ Login error caught:', error);
        this.errorMessage = error.error?.message || error.message || 'Login failed. Please try again.';
      } finally {
        this.isLoading = false;
      }
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  redirectBasedOnRole(role?: string): void {
    // Use shared role->path mapping from config
    const redirectUrl = getRedirectPathForRole(role, '/home');
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