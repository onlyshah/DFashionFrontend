import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { DashboardPerformanceService } from '../../../services/dashboard-performance.service';

@Component({
    selector: 'app-dashboard-switcher',
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
  `],
    templateUrl: './dashboard-switcher.component.html'
})
// DEPRECATED: This is a DEBUG/TEST component marked for removal
// It provides testing utilities and should be replaced with proper dashboard routing
export class DashboardSwitcherComponent {
    showDebug = false;
    testResults: any[] = [];

    // Status properties
    hasToken = false;
    currentUser: any = null;
    hasAdminAccess = false;
    cacheStatus: { size: number; keys: string[] } = { size: 0, keys: [] };
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
            const response = await fetch(`${environment.apiUrl}/api/health`);
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
            const response = await fetch(`${environment.apiUrl}/api/admin/dashboard/stats`, {
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
