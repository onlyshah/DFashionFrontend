import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Chart, ChartConfiguration, registerables, ChartData, ChartOptions } from 'chart.js';
import { AuthService } from '../../../core/services/auth.service';
import { AdminApiService } from '../../services/admin-api.service';

// Register Chart.js components
Chart.register(...registerables);

interface DashboardMetrics {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  monthlyGrowth: number;
  orderGrowth: number;
  revenueGrowth: number;
  userGrowth: number;
}

interface ChartDataPoint {
  label: string;
  value: number;
  date?: Date;
}

@Component({
    selector: 'app-unified-dashboard',
    templateUrl: './unified-dashboard.component.html',
    styleUrls: ['./unified-dashboard.component.scss'],
    standalone: false
})
export class UnifiedDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();
  private charts: { [key: string]: Chart } = {};

  // Chart references
  @ViewChild('salesChart', { static: false }) salesChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('ordersChart', { static: false }) ordersChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('revenueChart', { static: false }) revenueChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('usersChart', { static: false }) usersChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart', { static: false }) categoryChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('performanceChart', { static: false }) performanceChart!: ElementRef<HTMLCanvasElement>;

  // Dashboard data
  currentUser: any = null;
  userRole: string = '';
  dashboardMetrics: DashboardMetrics = {
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    monthlyGrowth: 0,
    orderGrowth: 0,
    revenueGrowth: 0,
    userGrowth: 0
  };

  // Chart data
  salesData: ChartDataPoint[] = [];
  ordersData: ChartDataPoint[] = [];
  revenueData: ChartDataPoint[] = [];
  usersData: ChartDataPoint[] = [];
  categoryData: ChartDataPoint[] = [];

  // Loading states
  isLoading = true;
  chartsLoaded = false;

  constructor(
    public authService: AuthService, // Make public for template access
    private adminApiService: AdminApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeCharts();
    }, 500);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Destroy all charts
    Object.values(this.charts).forEach((chart: Chart) => {
      if (chart) {
        chart.destroy();
      }
    });
  }

  private loadCurrentUser(): void {
    // Get current user from auth service
    this.currentUser = this.authService.currentUserValue;
    this.userRole = this.authService.getCurrentUserRole() || 'customer';

    console.log('Current User:', this.currentUser);
    console.log('User Role:', this.userRole);

    // Also subscribe to user changes
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          if (user) {
            this.currentUser = user;
            this.userRole = this.authService.getCurrentUserRole() || 'customer';
            console.log('Updated User Role:', this.userRole);
          }
        },
        error: (error) => {
          console.error('Error loading current user:', error);
        }
      });
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    // Load metrics based on user role
    this.adminApiService.getDashboardMetrics(this.userRole)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (metrics) => {
          this.dashboardMetrics = metrics;
          this.loadChartData();
        },
        error: (error) => {
          console.error('Error loading dashboard metrics:', error);
          this.isLoading = false;
        }
      });
  }

  private loadChartData(): void {
    Promise.all([
      this.adminApiService.getSalesAnalytics().toPromise(),
      this.adminApiService.getOrdersAnalytics().toPromise(),
      this.adminApiService.getRevenueAnalytics().toPromise(),
      this.adminApiService.getUsersAnalytics().toPromise(),
      this.adminApiService.getCategoryAnalytics().toPromise()
    ]).then(([sales, orders, revenue, users, categories]) => {
      this.salesData = this.transformToChartData(sales?.data || []);
      this.ordersData = this.transformToChartData(orders?.data || []);
      this.revenueData = this.transformToChartData(revenue?.data || []);
      this.usersData = this.transformToChartData(users?.data || []);
      this.categoryData = this.transformToChartData(categories?.data || []);
      
      this.isLoading = false;
      this.updateChartsWithData();
      this.cdr.detectChanges();
    }).catch(error => {
      console.error('Error loading chart data:', error);
      this.isLoading = false;
    });
  }

  private transformToChartData(data: any[]): ChartDataPoint[] {
    return data.map((item, index) => ({
      label: item.label || item.name || item.date || `Point ${index + 1}`,
      value: item.value || item.count || item.amount || 0,
      date: item.date ? new Date(item.date) : new Date()
    }));
  }

  private initializeCharts(): void {
    if (this.chartsLoaded) return;
    
    this.createSalesChart();
    this.createOrdersChart();
    this.createRevenueChart();
    this.createUsersChart();
    this.createCategoryChart();
    this.createPerformanceChart();
    
    this.chartsLoaded = true;
  }

  private createSalesChart(): void {
    if (!this.salesChart?.nativeElement) return;

    const ctx = this.salesChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.salesData.map(item => item.label),
        datasets: [{
          label: 'Sales',
          data: this.salesData.map(item => item.value),
          borderColor: '#844fc1',
          backgroundColor: 'rgba(132, 79, 193, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#844fc1',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#844fc1',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#6c7293', font: { size: 12 } }
          },
          y: {
            grid: { color: 'rgba(108, 114, 147, 0.1)' },
            ticks: { color: '#6c7293', font: { size: 12 } }
          }
        }
      }
    });

    this.charts['sales'] = chart;
  }

  private createOrdersChart(): void {
    if (!this.ordersChart?.nativeElement) return;

    const ctx = this.ordersChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.ordersData.map(item => item.label),
        datasets: [{
          label: 'Orders',
          data: this.ordersData.map(item => item.value),
          backgroundColor: '#21bf06',
          borderColor: '#21bf06',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#21bf06',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#6c7293', font: { size: 12 } }
          },
          y: {
            grid: { color: 'rgba(108, 114, 147, 0.1)' },
            ticks: { color: '#6c7293', font: { size: 12 } }
          }
        }
      }
    });

    this.charts['orders'] = chart;
  }

  private createRevenueChart(): void {
    if (!this.revenueChart?.nativeElement) return;

    const ctx = this.revenueChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.revenueData.map(item => item.label),
        datasets: [{
          label: 'Revenue',
          data: this.revenueData.map(item => item.value),
          borderColor: '#f39915',
          backgroundColor: 'rgba(243, 153, 21, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#f39915',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#f39915',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                return value !== null && value !== undefined
                  ? `Revenue: $${value.toLocaleString()}`
                  : 'No data';
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#6c7293', font: { size: 12 } }
          },
          y: {
            grid: { color: 'rgba(108, 114, 147, 0.1)' },
            ticks: { 
              color: '#6c7293', 
              font: { size: 12 },
              callback: (value) => `$${value}`
            }
          }
        }
      }
    });

    this.charts['revenue'] = chart;
  }

  private updateChartsWithData(): void {
    if (!this.chartsLoaded) return;

    Object.keys(this.charts).forEach(chartKey => {
      const chart = this.charts[chartKey];
      if (chart && chart.data) {
        switch (chartKey) {
          case 'sales':
            chart.data.labels = this.salesData.map(item => item.label);
            chart.data.datasets[0].data = this.salesData.map(item => item.value);
            break;
          case 'orders':
            chart.data.labels = this.ordersData.map(item => item.label);
            chart.data.datasets[0].data = this.ordersData.map(item => item.value);
            break;
          case 'revenue':
            chart.data.labels = this.revenueData.map(item => item.label);
            chart.data.datasets[0].data = this.revenueData.map(item => item.value);
            break;
          case 'users':
            chart.data.labels = this.usersData.map(item => item.label);
            chart.data.datasets[0].data = this.usersData.map(item => item.value);
            break;
          case 'category':
            chart.data.labels = this.categoryData.map(item => item.label);
            chart.data.datasets[0].data = this.categoryData.map(item => item.value);
            break;
          case 'performance':
            // Performance chart uses dashboard metrics
            chart.data.datasets[0].data = [
              this.dashboardMetrics.totalOrders / 10,
              this.dashboardMetrics.totalOrders / 20,
              this.dashboardMetrics.totalRevenue / 1000,
              this.dashboardMetrics.totalUsers / 50,
              this.dashboardMetrics.totalProducts / 5
            ];
            break;
        }
        chart.update('none');
      }
    });
  }

  private createUsersChart(): void {
    if (!this.usersChart?.nativeElement) return;

    const ctx = this.usersChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.usersData.map(item => item.label),
        datasets: [{
          data: this.usersData.map(item => item.value),
          backgroundColor: [
            '#844fc1',
            '#21bf06',
            '#f39915',
            '#3b86d1',
            '#dc3545'
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 15,
              font: { size: 12 }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            cornerRadius: 8
          }
        }
      }
    });

    this.charts['users'] = chart;
  }

  private createCategoryChart(): void {
    if (!this.categoryChart?.nativeElement) return;

    const ctx = this.categoryChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels: this.categoryData.map(item => item.label),
        datasets: [{
          data: this.categoryData.map(item => item.value),
          backgroundColor: [
            'rgba(132, 79, 193, 0.8)',
            'rgba(33, 191, 6, 0.8)',
            'rgba(243, 153, 21, 0.8)',
            'rgba(59, 134, 209, 0.8)',
            'rgba(220, 53, 69, 0.8)'
          ],
          borderColor: [
            '#844fc1',
            '#21bf06',
            '#f39915',
            '#3b86d1',
            '#dc3545'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 15,
              font: { size: 12 }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            cornerRadius: 8
          }
        },
        scales: {
          r: {
            grid: { color: 'rgba(108, 114, 147, 0.1)' },
            ticks: { color: '#6c7293', font: { size: 10 } }
          }
        }
      }
    });

    this.charts['category'] = chart;
  }

  private createPerformanceChart(): void {
    if (!this.performanceChart?.nativeElement) return;

    const ctx = this.performanceChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Sales', 'Orders', 'Revenue', 'Users', 'Products'],
        datasets: [{
          label: 'Current Period',
          data: [
            this.dashboardMetrics.totalOrders / 10,
            this.dashboardMetrics.totalOrders / 20,
            this.dashboardMetrics.totalRevenue / 1000,
            this.dashboardMetrics.totalUsers / 50,
            this.dashboardMetrics.totalProducts / 5
          ],
          borderColor: '#844fc1',
          backgroundColor: 'rgba(132, 79, 193, 0.2)',
          borderWidth: 2,
          pointBackgroundColor: '#844fc1',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            cornerRadius: 8
          }
        },
        scales: {
          r: {
            grid: { color: 'rgba(108, 114, 147, 0.1)' },
            ticks: {
              color: '#6c7293',
              font: { size: 10 },
              display: false
            },
            pointLabels: {
              color: '#6c7293',
              font: { size: 12 }
            }
          }
        }
      }
    });

    this.charts['performance'] = chart;
  }

  // Role-based access methods
  canViewAdvancedMetrics(): boolean {
    return ['super_admin', 'admin', 'manager'].includes(this.userRole);
  }

  canViewFinancialData(): boolean {
    return ['super_admin', 'admin'].includes(this.userRole);
  }

  canViewUserData(): boolean {
    return ['super_admin', 'admin', 'manager'].includes(this.userRole);
  }
}
