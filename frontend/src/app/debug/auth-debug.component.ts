import { Component, OnInit } from '@angular/core';
import { AuthDebugService } from '../core/services/auth-debug.service';
import { AuthService } from '../core/services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-auth-debug',
  template: `
    <div class="container mt-4">
      <div class="card">
        <div class="card-header">
          <h3>🔍 Authentication Debug Panel</h3>
          <p class="mb-0">Use this panel to diagnose authentication issues</p>
        </div>
        
        <div class="card-body">
          <!-- Current Status -->
          <div class="row mb-4">
            <div class="col-md-6">
              <h5>📊 Current Status</h5>
              <ul class="list-group">
                <li class="list-group-item d-flex justify-content-between">
                  <span>Authentication Status</span>
                  <span class="badge" [ngClass]="isAuthenticated ? 'bg-success' : 'bg-danger'">
                    {{ isAuthenticated ? 'Authenticated' : 'Not Authenticated' }}
                  </span>
                </li>
                <li class="list-group-item d-flex justify-content-between" *ngIf="currentUser">
                  <span>User Role</span>
                  <span class="badge bg-info">{{ currentUser.role }}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between" *ngIf="currentUser">
                  <span>Username</span>
                  <span>{{ currentUser.username || currentUser.email }}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between">
                  <span>Token Present</span>
                  <span class="badge" [ngClass]="hasToken ? 'bg-success' : 'bg-warning'">
                    {{ hasToken ? 'Yes' : 'No' }}
                  </span>
                </li>
              </ul>
            </div>
            
            <div class="col-md-6">
              <h5>🎭 Role Permissions</h5>
              <div *ngIf="currentUser">
                <p><strong>Current Role:</strong> {{ currentUser.role }}</p>
                <div class="alert alert-info">
                  <strong>Can Access:</strong>
                  <ul class="mb-0 mt-2">
                    <li *ngFor="let permission of getUserPermissions()">{{ permission }}</li>
                  </ul>
                </div>
              </div>
              <div *ngIf="!currentUser" class="alert alert-warning">
                Please login to see role permissions
              </div>
            </div>
          </div>
          
          <!-- Debug Actions -->
          <div class="row mb-4">
            <div class="col-12">
              <h5>🔧 Debug Actions</h5>
              <div class="btn-group me-2 mb-2" role="group">
                <button class="btn btn-primary" (click)="runFullDiagnostic()">
                  🚀 Run Full Diagnostic
                </button>
                <button class="btn btn-info" (click)="testApiEndpoints()">
                  🧪 Test API Endpoints
                </button>
                <button class="btn btn-secondary" (click)="checkAuthStatus()">
                  📊 Check Auth Status
                </button>
              </div>
              
              <div class="btn-group me-2 mb-2" role="group">
                <button class="btn btn-warning" (click)="clearAllAuth()">
                  🗑️ Clear All Auth Data
                </button>
                <button class="btn btn-success" (click)="refreshPage()">
                  🔄 Refresh Page
                </button>
              </div>
            </div>
          </div>
          
          <!-- Quick Tests -->
          <div class="row mb-4">
            <div class="col-12">
              <h5>⚡ Quick API Tests</h5>
              <div class="row">
                <div class="col-md-4 mb-2">
                  <button class="btn btn-outline-primary w-100" (click)="testEndpoint('/auth/verify')">
                    Test Auth Verify
                  </button>
                </div>
                <div class="col-md-4 mb-2">
                  <button class="btn btn-outline-success w-100" (click)="testEndpoint('/cart-new/total-count')">
                    Test Cart Count
                  </button>
                </div>
                <div class="col-md-4 mb-2">
                  <button class="btn btn-outline-warning w-100" (click)="testEndpoint('/admin/dashboard')">
                    Test Admin Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Console Instructions -->
          <div class="alert alert-info">
            <h6>📝 Instructions:</h6>
            <ol class="mb-0">
              <li>Open browser console (F12) to see detailed debug output</li>
              <li>Click "Run Full Diagnostic" to get complete analysis</li>
              <li>Check the console for specific error messages and solutions</li>
              <li>Use "Clear All Auth Data" if you need to start fresh</li>
            </ol>
          </div>
          
          <!-- Test Results -->
          <div *ngIf="testResults.length > 0" class="mt-4">
            <h5>📋 Test Results</h5>
            <div class="list-group">
              <div *ngFor="let result of testResults" 
                   class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{{ result.endpoint }}</strong>
                  <br>
                  <small class="text-muted">{{ result.method }} {{ result.url }}</small>
                </div>
                <div>
                  <span class="badge" [ngClass]="result.success ? 'bg-success' : 'bg-danger'">
                    {{ result.success ? 'SUCCESS' : 'FAILED' }}
                  </span>
                  <br>
                  <small *ngIf="!result.success" class="text-danger">
                    {{ result.status }} - {{ result.error }}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .btn-group .btn {
      margin-right: 0;
    }
    
    .list-group-item {
      border: 1px solid rgba(0,0,0,.125);
    }
    
    .alert {
      border-radius: 0.375rem;
    }
    
    .badge {
      font-size: 0.75em;
    }
  `]
})
export class AuthDebugComponent implements OnInit {
  isAuthenticated = false;
  currentUser: any = null;
  hasToken = false;
  testResults: any[] = [];

  constructor(
    private authDebugService: AuthDebugService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.updateStatus();
  }

  updateStatus(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUser = this.authService.getCurrentUser();
    this.hasToken = !!this.authService.getToken();
  }

  getUserPermissions(): string[] {
    if (!this.currentUser) return [];
    
    const permissions: { [key: string]: string[] } = {
      'customer': [
        'View and manage cart',
        'View and manage wishlist', 
        'Place orders',
        'View order history',
        'Update profile'
      ],
      'vendor': [
        'Manage own products',
        'View vendor orders',
        'Update vendor profile',
        'View sales analytics'
      ],
      'admin': [
        'Access admin dashboard',
        'Manage users',
        'Manage products',
        'View analytics'
      ],
      'super_admin': [
        'Full system access',
        'All admin features',
        'User management',
        'System configuration'
      ]
    };
    
    return permissions[this.currentUser.role] || ['No specific permissions'];
  }

  async runFullDiagnostic(): Promise<void> {
    console.log('🚀 Running Full Authentication Diagnostic...');
    await this.authDebugService.runFullDiagnostic();
    this.updateStatus();
  }

  checkAuthStatus(): void {
    this.authDebugService.debugAuthStatus();
    this.updateStatus();
  }

  async testApiEndpoints(): Promise<void> {
    await this.authDebugService.testApiEndpoints();
    this.updateStatus();
  }

  async testEndpoint(endpoint: string): Promise<void> {
    const apiUrl = 'http://localhost:3001/api';
    
    try {
      console.log(`🧪 Testing endpoint: ${endpoint}`);
      const response = await this.http.get(`${apiUrl}${endpoint}`).toPromise();
      
      this.testResults.unshift({
        endpoint: endpoint.split('/').pop(),
        method: 'GET',
        url: endpoint,
        success: true,
        status: 200,
        response: response
      });
      
      console.log(`✅ ${endpoint}: SUCCESS`, response);
      
    } catch (error: any) {
      this.testResults.unshift({
        endpoint: endpoint.split('/').pop(),
        method: 'GET', 
        url: endpoint,
        success: false,
        status: error.status,
        error: error.error?.message || error.message
      });
      
      console.log(`❌ ${endpoint}: FAILED`, error);
    }
    
    // Keep only last 10 results
    this.testResults = this.testResults.slice(0, 10);
  }

  clearAllAuth(): void {
    console.log('🗑️ Clearing all authentication data...');
    localStorage.clear();
    sessionStorage.clear();
    this.testResults = [];
    this.updateStatus();
    console.log('✅ All auth data cleared');
  }

  refreshPage(): void {
    window.location.reload();
  }
}
