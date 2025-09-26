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
import { CartService } from '../../core/services/cart.service';
import { WishlistNewService } from '../../core/services/wishlist-new.service';
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
  standalone: true,
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
    RewardDashboardComponent
  ],
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.scss']
})
export class CustomerDashboardComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  isMobile = false;
  isTablet = false;
  
  customerStats: CustomerStats = {
    ordersCount: 0,
    wishlistCount: 0,
    cartCount: 0,
    rewardsCount: 0,
    totalSpent: 0,
    savedAmount: 0
  };

  recentOrders: RecentOrder[] = [];
  quickActions: QuickAction[] = [
    {
      title: 'Browse Products',
      icon: 'storefront',
      route: '/shop',
      color: '#2196F3',
      description: 'Discover new fashion items'
    },
    {
      title: 'My Orders',
      icon: 'receipt_long',
      route: '/orders',
      color: '#4CAF50',
      description: 'Track your purchases'
    },
    {
      title: 'Wishlist',
      icon: 'favorite',
      route: '/wishlist',
      color: '#E91E63',
      description: 'View saved items'
    },
    {
      title: 'Cart',
      icon: 'shopping_cart',
      route: '/cart',
      color: '#FF9800',
      description: 'Complete your purchase'
    },
    {
      title: 'Profile',
      icon: 'person',
      route: '/profile',
      color: '#9C27B0',
      description: 'Manage your account'
    },
    {
      title: 'Support',
      icon: 'help_center',
      route: '/support',
      color: '#607D8B',
      description: 'Get help and support'
    }
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    public router: Router, // Make router public for template access
    private authService: AuthService,
    private cartService: CartService,
    private wishlistService: WishlistNewService
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();
    this.loadUserData();
    this.loadCustomerStats();
    this.loadRecentOrders();
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
    // Load cart count
    const cartSub = this.cartService.cartItemCount$.subscribe(count => {
      this.customerStats.cartCount = count;
    });
    this.subscriptions.push(cartSub);

    // Load wishlist count
    const wishlistSub = this.wishlistService.wishlistItemCount$.subscribe(count => {
      this.customerStats.wishlistCount = count;
    });
    this.subscriptions.push(wishlistSub);

    // TODO: Load other stats from API
    this.customerStats = {
      ...this.customerStats,
      ordersCount: 8,
      rewardsCount: 150,
      totalSpent: 1250.99,
      savedAmount: 320.50
    };
  }

  private loadRecentOrders(): void {
    // TODO: Load from API
    this.recentOrders = [
      {
        id: 'ORD-001',
        productName: 'Summer Floral Dress',
        productImage: '/uploadsproducts/dress-1.jpg',
        amount: 89.99,
        status: 'delivered',
        orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'ORD-002',
        productName: 'Casual Sneakers',
        productImage: '/uploadsproducts/shoes-1.jpg',
        amount: 129.99,
        status: 'shipped',
        orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'ORD-003',
        productName: 'Denim Jacket',
        productImage: '/uploadsproducts/jacket-1.jpg',
        amount: 79.99,
        status: 'processing',
        orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];
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
    return this.customerStats.ordersCount > 0 ||
           this.customerStats.wishlistCount > 0 ||
           this.customerStats.cartCount > 0;
  }

  // Get greeting based on time of day
  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }
}
