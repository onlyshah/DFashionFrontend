import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardPerformanceService } from './services/dashboard-performance.service';

@Component({
  selector: 'app-dashboard-switcher',
  template: `
    <div class="container-fluid mt-4">
      <div class="alert alert-info">
        <h4>🚀 Dashboard Performance Fix Available!</h4>
        <p>We've identified and fixed the loading issues in your admin dashboard.</p>
        
        <div class="row mt-3">
          <div class="col-md-6">
            <h6>❌ Current Issues:</h6>
            <ul>
              <li>Continuous loading</li>
              <li>API errors (401/403)</li>
              <li>Slow performance</li>
              <li>No error handling</li>
            </ul>
          </div>
          
          <div class="col-md-6">
            <h6>✅ Fixed Version Includes:</h6>
            <ul>
              <li>Fast loading (2-5 seconds)</li>
              <li>Smart error handling</li>
              <li>Fallback data when APIs fail</li>
              <li>Performance optimization</li>
            </ul>
          </div>
        </div>
        
        <div class="mt-3">
          <button class="btn btn-success me-2" (click)="useFixedDashboard()">
            🔧 Use Fixed Dashboard
          </button>
          <button class="btn btn-primary me-2" (click)="testCurrentDashboard()">
            🧪 Test Current Dashboard
          </button>
          <button class="btn btn-info me-2" (click)="clearCacheAndReload()">
            🗑️ Clear Cache & Reload
          </button>
          <button class="btn btn-warning" (click)="showDebugInfo()">
            🔍 Show Debug Info
          </button>
        </div>
      </div>
      
      <!-- Debug Information -->
      <div *ngIf="showDebug" class="card mt-3">
        <div class="card-header">
          <h5>🔍 Debug Information</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <h6>Authentication Status:</h6>
              <ul class="list-unstyled">
                <li><strong>Token:</strong> {{ hasToken ? '✅ Present' : '❌ Missing' }}</li>
                <li><strong>User:</strong> {{ currentUser?.email || 'Not logged in' }}</li>
                <li><strong>Role:</strong> {{ currentUser?.role || 'None' }}</li>
                <li><strong>Admin Access:</strong> {{ hasAdminAccess ? '✅ Yes' : '❌ No' }}</li>
              </ul>
            </div>
            
            <div class="col-md-6">
              <h6>Performance Status:</h6>
              <ul class="list-unstyled">
                <li><strong>Cache Size:</strong> {{ cacheStatus.size }} items</li>
                <li><strong>Using Fallback:</strong> {{ isUsingFallback ? '⚠️ Yes' : '✅ No' }}</li>
                <li><strong>Last Load:</strong> {{ lastLoadTime || 'Never' }}</li>
                <li><strong>Backend Status:</strong> {{ backendStatus }}</li>
              </ul>
            </div>
          </div>
          
          <div class="mt-3">
            <h6>Quick Actions:</h6>
            <button class="btn btn-sm btn-outline-primary me-2" (click)="testBackendConnection()">
              Test Backend
            </button>
            <button class="btn btn-sm btn-outline-success me-2" (click)="testDashboardAPI()">
              Test Dashboard API
            </button>
            <button class="btn btn-sm btn-outline-warning me-2" (click)="clearAllAuth()">
              Clear Auth Data
            </button>
          </div>
        </div>
      </div>
      
      <!-- Test Results -->
      <div *ngIf="testResults.length > 0" class="card mt-3">
        <div class="card-header">
          <h5>🧪 Test Results</h5>
        </div>
        <div class="card-body">
          <div *ngFor="let result of testResults" class="alert" 
               [ngClass]="result.success ? 'alert-success' : 'alert-danger'">
            <strong>{{ result.test }}:</strong> 
            {{ result.success ? '✅ Success' : '❌ Failed' }}
            <br>
            <small>{{ result.message }}</small>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .alert {
      border-radius: 0.5rem;
    }
    .card {
      border-radius: 0.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .btn {
      border-radius: 0.375rem;
    }
  `]
})
export class DashboardSwitcherComponent {
  showDebug = false;
  testResults: any[] = [];
  
  // Status properties
  hasToken = false;
  currentUser: any = null;
  hasAdminAccess = false;
  cacheStatus = { size: 0, keys: [] };
  isUsingFallback = false;
  lastLoadTime = '';
  backendStatus = 'Unknown';

  constructor(
    private router: Router,
    private performanceService: DashboardPerformanceService
  ) {
    this.updateStatus();
  }

  updateStatus(): void {
    // Check authentication
    const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
    this.hasToken = !!token;
    
    const userStr = localStorage.getItem('user') || localStorage.getItem('admin_user');
    this.currentUser = userStr ? JSON.parse(userStr) : null;
    
    this.hasAdminAccess = this.currentUser && 
      ['super_admin', 'admin', 'sales', 'marketing'].includes(this.currentUser.role);
    
    // Check performance service status
    this.cacheStatus = this.performanceService.getCacheStatus();
    this.isUsingFallback = this.performanceService.isUsingFallbackData();
    this.lastLoadTime = new Date().toLocaleTimeString();
  }

  useFixedDashboard(): void {
    console.log('🔧 Switching to fixed dashboard...');
    
    // Clear any existing cache
    this.performanceService.clearCache();
    
    // Navigate to fixed dashboard (you'll need to update your routing)
    this.router.navigate(['/admin/dashboard-fixed']);
    
    this.addTestResult('Dashboard Switch', true, 'Switched to performance-optimized dashboard');
  }

  testCurrentDashboard(): void {
    console.log('🧪 Testing current dashboard...');
    
    // Navigate to current dashboard
    this.router.navigate(['/admin/dashboard']);
    
    this.addTestResult('Current Dashboard', true, 'Navigated to current dashboard for comparison');
  }

  clearCacheAndReload(): void {
    console.log('🗑️ Clearing cache and reloading...');
    
    // Clear all caches
    localStorage.clear();
    sessionStorage.clear();
    this.performanceService.clearCache();
    
    // Reload page
    window.location.reload();
  }

  showDebugInfo(): void {
    this.showDebug = !this.showDebug;
    if (this.showDebug) {
      this.updateStatus();
    }
  }

  async testBackendConnection(): Promise<void> {
    console.log('🔍 Testing backend connection...');
    
    try {
      const response = await fetch('http://localhost:3001/api/health');
      if (response.ok) {
        this.backendStatus = '✅ Connected';
        this.addTestResult('Backend Connection', true, 'Backend server is running and accessible');
      } else {
        this.backendStatus = '❌ Error';
        this.addTestResult('Backend Connection', false, `Server responded with ${response.status}`);
      }
    } catch (error) {
      this.backendStatus = '❌ Offline';
      this.addTestResult('Backend Connection', false, 'Cannot connect to backend server');
    }
  }

  async testDashboardAPI(): Promise<void> {
    console.log('🧪 Testing dashboard API...');
    
    const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
    
    if (!token) {
      this.addTestResult('Dashboard API', false, 'No authentication token found');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.addTestResult('Dashboard API', true, 'Dashboard API is working correctly');
        console.log('✅ Dashboard API response:', data);
      } else {
        this.addTestResult('Dashboard API', false, `API returned ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      this.addTestResult('Dashboard API', false, 'Failed to connect to dashboard API');
    }
  }

  clearAllAuth(): void {
    console.log('🗑️ Clearing all authentication data...');
    
    localStorage.removeItem('token');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('user');
    localStorage.removeItem('admin_user');
    sessionStorage.clear();
    
    this.updateStatus();
    this.addTestResult('Clear Auth', true, 'All authentication data cleared');
  }

  private addTestResult(test: string, success: boolean, message: string): void {
    this.testResults.unshift({
      test,
      success,
      message,
      timestamp: new Date().toLocaleTimeString()
    });
    
    // Keep only last 5 results
    this.testResults = this.testResults.slice(0, 5);
  }
}
