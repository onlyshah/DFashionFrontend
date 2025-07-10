import { Component, OnInit } from '@angular/core';

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  salesGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  revenueGrowth: number;
}

interface ChartData {
  labels: string[];
  datasets: any[];
}

interface RecentOrder {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  date: Date;
}

interface TopProduct {
  id: string;
  name: string;
  category: string;
  sales: number;
  revenue: number;
  image: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  // Dashboard data
  stats: DashboardStats = {
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    salesGrowth: 0,
    ordersGrowth: 0,
    customersGrowth: 0,
    revenueGrowth: 0
  };

  // Chart data
  salesChartData: ChartData = { labels: [], datasets: [] };
  ordersChartData: ChartData = { labels: [], datasets: [] };
  revenueChartData: ChartData = { labels: [], datasets: [] };

  // Recent data
  recentOrders: RecentOrder[] = [];
  topProducts: TopProduct[] = [];

  // Loading states
  isLoading = true;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Simulate API call
    setTimeout(() => {
      this.loadStats();
      this.loadChartData();
      this.loadRecentOrders();
      this.loadTopProducts();
      this.isLoading = false;
    }, 1000);
  }

  private loadStats(): void {
    this.stats = {
      totalSales: 12543,
      totalOrders: 1847,
      totalCustomers: 3256,
      totalRevenue: 89750,
      salesGrowth: 12.5,
      ordersGrowth: 8.3,
      customersGrowth: 15.7,
      revenueGrowth: 22.1
    };
  }

  private loadChartData(): void {
    // Sales chart data
    this.salesChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Sales',
        data: [1200, 1900, 3000, 5000, 2000, 3000],
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4
      }]
    };

    // Orders chart data
    this.ordersChartData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Orders',
        data: [65, 59, 80, 81, 56, 55, 40],
        backgroundColor: [
          '#667eea', '#764ba2', '#f093fb', '#f5576c',
          '#4facfe', '#00f2fe', '#43e97b'
        ]
      }]
    };

    // Revenue chart data
    this.revenueChartData = {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [{
        label: 'Revenue',
        data: [15000, 25000, 35000, 45000],
        borderColor: '#43e97b',
        backgroundColor: 'rgba(67, 233, 123, 0.1)',
        tension: 0.4
      }]
    };
  }

  private loadRecentOrders(): void {
    this.recentOrders = [
      {
        id: 'ORD-001',
        customer: 'John Doe',
        product: 'Premium T-Shirt',
        amount: 29.99,
        status: 'pending',
        date: new Date()
      },
      {
        id: 'ORD-002',
        customer: 'Jane Smith',
        product: 'Designer Jeans',
        amount: 89.99,
        status: 'processing',
        date: new Date(Date.now() - 3600000)
      },
      {
        id: 'ORD-003',
        customer: 'Mike Johnson',
        product: 'Casual Sneakers',
        amount: 129.99,
        status: 'shipped',
        date: new Date(Date.now() - 7200000)
      },
      {
        id: 'ORD-004',
        customer: 'Sarah Wilson',
        product: 'Summer Dress',
        amount: 59.99,
        status: 'delivered',
        date: new Date(Date.now() - 86400000)
      }
    ];
  }

  private loadTopProducts(): void {
    this.topProducts = [
      {
        id: 'PROD-001',
        name: 'Premium T-Shirt',
        category: 'Clothing',
        sales: 245,
        revenue: 7350,
        image: 'assets/images/products/product1.jpg'
      },
      {
        id: 'PROD-002',
        name: 'Designer Jeans',
        category: 'Clothing',
        sales: 189,
        revenue: 17010,
        image: 'assets/images/products/product2.jpg'
      },
      {
        id: 'PROD-003',
        name: 'Casual Sneakers',
        category: 'Footwear',
        sales: 156,
        revenue: 20280,
        image: 'assets/images/products/product3.jpg'
      },
      {
        id: 'PROD-004',
        name: 'Summer Dress',
        category: 'Clothing',
        sales: 134,
        revenue: 8040,
        image: 'assets/images/products/product4.jpg'
      }
    ];
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'processing': return 'badge-info';
      case 'shipped': return 'badge-primary';
      case 'delivered': return 'badge-success';
      default: return 'badge-secondary';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num);
  }
}
