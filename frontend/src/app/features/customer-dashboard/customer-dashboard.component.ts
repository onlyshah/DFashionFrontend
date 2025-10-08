import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { IonicModule } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { RewardDashboardComponent } from '../../shared/components/reward-dashboard/reward-dashboard.component';

interface CustomerStats {
  ordersCount: number;
  wishlistCount: number;
  cartCount: number;
  rewardsCount: number;
  totalSpent: number;
  savedAmount: number;
}

interface RecentOrder {
  id: string;
  productName: string;
  productImage: string;
  amount: number;
  status: 'delivered' | 'shipped' | 'processing' | 'cancelled';
  orderDate: Date;
}

interface QuickAction {
  title: string;
  icon: string;
  route: string;
  color: string;
  description: string;
}

@Component({
    selector: 'app-customer-dashboard',
    imports: [
        CommonModule,
        RouterModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatTabsModule,
        MatGridListModule,
        MatProgressBarModule,
        IonicModule,
        //RewardDashboardComponent
    ],
    templateUrl: './customer-dashboard.component.html',
    styleUrls: ['./customer-dashboard.component.scss']
})
export class CustomerDashboardComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  isMobile = false;
  isTablet = false;
  
  customerStats: CustomerStats | null = null;
  recentOrders: RecentOrder[] = [];
  quickActions: QuickAction[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    public router: Router,
    private authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();
    this.loadUserData();
    this.loadCustomerStats();
    this.loadRecentOrders();
    this.loadQuickActions();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    const width = window.innerWidth;
    this.isMobile = width <= 768;
    this.isTablet = width > 768 && width <= 1024;
  }

  private loadUserData(): void {
    const sub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.subscriptions.push(sub);
  }

  private loadCustomerStats(): void {
    this.apiService.get<CustomerStats>('/api/customer/stats').subscribe({
      next: (res) => {
        if (res.success) {
          this.customerStats = res.data;
        }
      },
      error: () => {
        this.customerStats = null;
      }
    });
  }

  private loadRecentOrders(): void {
    this.apiService.get<RecentOrder[]>('/api/customer/recent-orders').subscribe({
      next: (res) => {
        if (res.success) {
          this.recentOrders = res.data;
        }
      },
      error: () => {
        this.recentOrders = [];
      }
    });
  }

  private loadQuickActions(): void {
    this.apiService.get<QuickAction[]>('/api/customer/quick-actions').subscribe({
      next: (res) => {
        if (res.success) {
          this.quickActions = res.data;
        }
      },
      error: () => {
        this.quickActions = [];
      }
    });
  }

  // Navigation methods
  navigateToAction(action: QuickAction): void {
    this.router.navigate([action.route]);
  }

  viewAllOrders(): void {
    this.router.navigate(['/orders']);
  }

  viewOrderDetails(order: RecentOrder): void {
    this.router.navigate(['/orders', order.id]);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToSettings(): void {
    this.router.navigate(['/settings']);
  }

  // Utility methods
  getStatusColor(status: string): string {
    const colors = {
      'delivered': '#4CAF50',
      'shipped': '#2196F3',
      'processing': '#FF9800',
      'cancelled': '#F44336'
    };
    return colors[status as keyof typeof colors] || '#757575';
  }

  getStatusIcon(status: string): string {
    const icons = {
      'delivered': 'check_circle',
      'shipped': 'local_shipping',
      'processing': 'hourglass_empty',
      'cancelled': 'cancel'
    };
    return icons[status as keyof typeof icons] || 'help';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  }

  getGridCols(): number {
    if (this.isMobile) return 2;
    if (this.isTablet) return 3;
    return 4;
  }

  getStatsGridCols(): number {
    if (this.isMobile) return 2;
    return 4;
  }

  // Handle image loading errors
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = '/uploadsplaceholder-product.svg';
    }
  }

  // Navigation helper methods
  goBack(): void {
    this.router.navigate(['/home']);
  }

  // Utility method to check if user has any activity
  hasActivity(): boolean {
    return !!this.customerStats && (
      (this.customerStats.ordersCount > 0) ||
      (this.customerStats.wishlistCount > 0) ||
      (this.customerStats.cartCount > 0)
    );
  }

  // Get greeting based on time of day
  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }
}
