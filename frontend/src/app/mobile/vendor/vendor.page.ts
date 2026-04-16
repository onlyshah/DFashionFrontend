import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { VendorService, VendorStats } from '../../core/services/vendor.service';

@Component({
  selector: 'app-vendor',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './vendor.page.html',
  styleUrls: ['./vendor.page.scss'],
})
export class VendorPage implements OnInit, OnDestroy {
  currentUser: any = null;
  stats: VendorStats = {
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    recentOrdersCount: 0,
    totalPosts: 0,
    totalStories: 0
  };
  loading = false;

  quickActions = [
    {
      title: 'Add Product',
      subtitle: 'Create new product listing',
      icon: 'add-circle',
      color: 'primary',
      route: '/vendor/products/create',
      label: 'Add Product'
    },
    {
      title: 'Create Post',
      subtitle: 'Share product post',
      icon: 'camera',
      color: 'secondary',
      route: '/vendor/posts/create',
      label: 'Create Post'
    },
    {
      title: 'Add Story',
      subtitle: 'Create product story',
      icon: 'videocam',
      color: 'tertiary',
      route: '/vendor/stories/create',
      label: 'Add Story'
    },
    {
      title: 'View Orders',
      subtitle: 'Manage your orders',
      icon: 'receipt',
      color: 'success',
      route: '/vendor/orders',
      label: 'View Orders'
    }
  ];

  menuItems = [
    {
      title: 'My Products',
      icon: 'cube',
      route: '/vendor/products',
      count: this.stats.totalProducts,
      label: 'My Products'
    },
    {
      title: 'My Posts',
      icon: 'images',
      route: '/vendor/posts',
      count: this.stats.totalPosts,
      label: 'My Posts'
    },
    {
      title: 'My Stories',
      icon: 'play-circle',
      route: '/vendor/stories',
      count: this.stats.totalStories,
      label: 'My Stories'
    },
    {
      title: 'Orders',
      icon: 'bag',
      route: '/vendor/orders',
      count: this.stats.totalOrders,
      label: 'Orders'
    },
    {
      title: 'Analytics',
      icon: 'analytics',
      route: '/vendor/analytics',
      count: 0,
      label: 'Analytics'
    }
  ];

  recentActivity: any[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private vendorService: VendorService
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.loadStats();
  }

  loadUserData() {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  loadStats() {
    this.loading = true;

    this.vendorService.getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats = response.data.stats;
          this.vendorService.updateStats(this.stats);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Stats loading error:', error);
        this.loading = false;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  formatCurrency(amount: number): string {
    return this.vendorService.formatCurrency(amount);
  }

  onQuickAction(action: any) {
    this.router.navigate([action.route]);
  }

  onMenuItem(item: any) {
    this.router.navigate([item.route]);
  }

  doRefresh(event: any) {
    this.loadStats();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
}
