import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthDebugService {
  private apiUrl = 'http://localhost:3001/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Debug authentication status
   */
  debugAuthStatus(): void {
    console.log('=== 🔍 AUTH DEBUG STATUS ===');
    
    // Check tokens
    const regularToken = localStorage.getItem('token');
    const adminToken = localStorage.getItem('admin_token');
    const sessionToken = sessionStorage.getItem('token');
    
    console.log('📱 Storage Tokens:');
    console.log('  Regular Token:', regularToken ? regularToken.substring(0, 20) + '...' : 'NONE');
    console.log('  Admin Token:', adminToken ? adminToken.substring(0, 20) + '...' : 'NONE');
    console.log('  Session Token:', sessionToken ? sessionToken.substring(0, 20) + '...' : 'NONE');
    
    // Check users
    const regularUser = localStorage.getItem('user');
    const adminUser = localStorage.getItem('admin_user');
    
    console.log('👤 Stored Users:');
    if (regularUser) {
      const user = JSON.parse(regularUser);
      console.log('  Regular User:', user.username || user.email, 'Role:', user.role);
    } else {
      console.log('  Regular User: NONE');
    }
    
    if (adminUser) {
      const user = JSON.parse(adminUser);
      console.log('  Admin User:', user.username || user.email, 'Role:', user.role);
    } else {
      console.log('  Admin User: NONE');
    }
    
    // Check auth service status
    console.log('🔐 Auth Service Status:');
    console.log('  Is Authenticated:', this.authService.isAuthenticated());
    console.log('  Current User:', this.authService.getCurrentUser());
    console.log('  Service Token:', this.authService.getToken() ? 'EXISTS' : 'NONE');
    
    console.log('=== END AUTH DEBUG ===');
  }

  /**
   * Test API endpoints with current authentication
   */
  async testApiEndpoints(): Promise<void> {
    console.log('=== 🧪 API ENDPOINT TESTS ===');
    
    const endpoints = [
      { name: 'Auth Verify', url: '/auth/verify', method: 'GET' },
      { name: 'Cart Total Count', url: '/cart-new/total-count', method: 'GET' },
      { name: 'Cart New', url: '/cart-new', method: 'GET' },
      { name: 'Admin Dashboard', url: '/admin/dashboard', method: 'GET' },
      { name: 'User Profile', url: '/auth/me', method: 'GET' }
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 Testing: ${endpoint.name} (${endpoint.method} ${endpoint.url})`);
        
        const response = await this.http.get(`${this.apiUrl}${endpoint.url}`).toPromise();
        console.log(`✅ ${endpoint.name}: SUCCESS`, response);
        
      } catch (error: any) {
        console.log(`❌ ${endpoint.name}: FAILED`);
        console.log(`   Status: ${error.status} ${error.statusText}`);
        console.log(`   Message: ${error.error?.message || error.message}`);
        
        if (error.status === 401) {
          console.log('   🔐 Authentication required - check token');
        } else if (error.status === 403) {
          console.log('   🚫 Access forbidden - check user role');
        }
      }
    }
    
    console.log('=== END API TESTS ===');
  }

  /**
   * Check user role compatibility with endpoints
   */
  checkRoleCompatibility(): void {
    console.log('=== 🎭 ROLE COMPATIBILITY CHECK ===');
    
    const user = this.authService.getCurrentUser();
    if (!user) {
      console.log('❌ No user logged in');
      return;
    }
    
    console.log(`👤 Current User: ${user.username || user.email} (Role: ${user.role})`);
    
    const roleEndpoints = {
      'customer': [
        '/cart-new/*',
        '/wishlist/*',
        '/orders/*',
        '/checkout/*'
      ],
      'vendor': [
        '/vendor/*',
        '/products/* (own products)',
        '/orders/* (vendor orders)'
      ],
      'admin': [
        '/admin/dashboard',
        '/admin/users',
        '/admin/products',
        '/admin/orders'
      ],
      'super_admin': [
        'ALL ENDPOINTS (universal access)'
      ]
    };
    
    console.log(`✅ Accessible endpoints for role "${user.role}":`);
    const userEndpoints = roleEndpoints[user.role as keyof typeof roleEndpoints] || [];
    userEndpoints.forEach(endpoint => {
      console.log(`   - ${endpoint}`);
    });
    
    if (user.role === 'super_admin') {
      console.log('🌟 Super Admin has access to ALL endpoints');
    }
    
    console.log('=== END ROLE CHECK ===');
  }

  /**
   * Suggest fixes for common auth issues
   */
  suggestFixes(): void {
    console.log('=== 💡 SUGGESTED FIXES ===');
    
    const regularToken = localStorage.getItem('token');
    const adminToken = localStorage.getItem('admin_token');
    const user = this.authService.getCurrentUser();
    
    if (!regularToken && !adminToken) {
      console.log('🔧 FIX 1: No tokens found - Please login');
      console.log('   - For customer features: Use /auth/login');
      console.log('   - For admin features: Use /admin/login');
    }
    
    if (!user) {
      console.log('🔧 FIX 2: No user data - Clear storage and re-login');
      console.log('   localStorage.clear(); sessionStorage.clear();');
    }
    
    if (user && user.role === 'customer') {
      console.log('🔧 FIX 3: Customer role detected');
      console.log('   - Can access: cart, wishlist, orders, checkout');
      console.log('   - Cannot access: admin dashboard, user management');
      console.log('   - For admin access: Login with admin account');
    }
    
    if (user && ['admin', 'super_admin'].includes(user.role)) {
      console.log('🔧 FIX 4: Admin role detected');
      console.log('   - Can access: admin dashboard, management features');
      console.log('   - For customer features: May need customer role or dual login');
    }
    
    console.log('🔧 FIX 5: General troubleshooting:');
    console.log('   - Check backend is running on port 3001');
    console.log('   - Verify CORS settings allow your frontend origin');
    console.log('   - Check network tab for actual HTTP requests');
    console.log('   - Verify token format and expiration');
    
    console.log('=== END SUGGESTIONS ===');
  }

  /**
   * Complete authentication diagnostic
   */
  async runFullDiagnostic(): Promise<void> {
    console.log('🚀 Starting Full Authentication Diagnostic...\n');
    
    this.debugAuthStatus();
    console.log('\n');
    
    this.checkRoleCompatibility();
    console.log('\n');
    
    await this.testApiEndpoints();
    console.log('\n');
    
    this.suggestFixes();
    console.log('\n');
    
    console.log('✅ Diagnostic Complete! Check the logs above for issues and solutions.');
  }
}
