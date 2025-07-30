import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { AuthService } from '../../../core/services/auth.service';
import { AdminApiService, PolluxDashboardStats } from '../../services/admin-api.service';

// Register Chart.js components
Chart.register(...registerables);

// Remove the local interface since we're importing it from the service

@Component({
  selector: 'app-pollux-dashboard',
  templateUrl: './pollux-dashboard.component.html',
  styleUrls: ['../pollux-ui.scss']
})
export class PolluxDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();
  
  // Chart references
  @ViewChild('transactionsChart', { static: false }) transactionsChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('salesChart', { static: false }) salesChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('salesAnalyticsChart', { static: false }) salesAnalyticsChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cpuChart', { static: false }) cpuChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('memoryChart', { static: false }) memoryChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('incomeChart', { static: false }) incomeChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('overallSalesChart', { static: false }) overallSalesChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('salesStatsChart', { static: false }) salesStatsChart!: ElementRef<HTMLCanvasElement>;

  // Component properties
  isLoading = true;
  currentUser: any = null;
  newsletterEmail = '';
  
  // Dashboard data
  totalTransactions = 0;
  transactionChange = 0;
  totalSales = 0;
  totalOrders = 0;
  totalRevenue = 0;
  
  salesAnalytics = {
    total: 0,
    percentage: 0
  };
  
  systemStats = {
    cpu: 0,
    memory: '0 GB'
  };
  
  monthlyIncrease = 0;
  
  overallStats = {
    grossSales: 0,
    grossSalesChange: 0,
    purchases: 0,
    purchasesChange: 0,
    returns: 0,
    returnsChange: 0
  };
  
  incomeLegend = [
    { label: 'Sales', color: '#6c7ae0' },
    { label: 'Orders', color: '#52c41a' },
    { label: 'Returns', color: '#ff4d4f' }
  ];

  // Chart instances
  private charts: Chart[] = [];

  constructor(
    private authService: AuthService,
    private adminApiService: AdminApiService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    // Initialize charts after view is ready
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Destroy all charts
    this.charts.forEach(chart => chart.destroy());
  }

  private loadCurrentUser(): void {
    this.authService.getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  private loadDashboardData(): void {
    this.isLoading = true;

    // Load real data from database using Pollux stats
    this.adminApiService.getPolluxDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats: PolluxDashboardStats) => {
          this.updateDashboardStats(stats);
          this.isLoading = false;

          // Update charts with new data
          setTimeout(() => {
            this.updateChartsData();
          }, 100);
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          this.isLoading = false;
          // Show error message instead of mock data
          this.showErrorMessage('Failed to load dashboard data');
        }
      });
  }

  private updateDashboardStats(stats: PolluxDashboardStats): void {
    this.totalTransactions = stats.totalTransactions;
    this.transactionChange = stats.transactionChange;
    this.totalSales = stats.totalSales;
    this.totalOrders = stats.totalOrders;
    this.totalRevenue = stats.totalRevenue;
    this.salesAnalytics = stats.salesAnalytics;
    this.systemStats = stats.systemStats;
    this.monthlyIncrease = stats.monthlyIncrease;
    this.overallStats = stats.overallStats;
  }

  private showErrorMessage(message: string): void {
    // Show error message to user
    console.error(message);
    // In a real application, you would show a toast or notification
    // For now, set default values to prevent UI errors
    this.totalTransactions = 0;
    this.transactionChange = 0;
    this.totalSales = 0;
    this.totalOrders = 0;
    this.totalRevenue = 0;
    this.salesAnalytics = { total: 0, percentage: 0 };
    this.systemStats = { cpu: 0, memory: '0 GB' };
    this.monthlyIncrease = 0;
    this.overallStats = {
      grossSales: 0,
      grossSalesChange: 0,
      purchases: 0,
      purchasesChange: 0,
      returns: 0,
      returnsChange: 0
    };
  }

  private initializeCharts(): void {
    this.createTransactionsChart();
    this.createSalesChart();
    this.createSalesAnalyticsChart();
    this.createCpuChart();
    this.createMemoryChart();
    this.createIncomeChart();
    this.createOverallSalesChart();
    this.createSalesStatsChart();
  }

  private createTransactionsChart(): void {
    if (!this.transactionsChart?.nativeElement) return;

    const ctx = this.transactionsChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          data: [1200, 1350, 1100, 1400, 1300, 1352],
          borderColor: '#6c7ae0',
          backgroundColor: 'rgba(108, 122, 224, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    });

    this.charts.push(chart);
  }

  private createSalesChart(): void {
    if (!this.salesChart?.nativeElement) return;

    const ctx = this.salesChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          data: [65, 78, 90, 81, 56, 85, 72],
          backgroundColor: '#52c41a',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    });

    this.charts.push(chart);
  }

  private createSalesAnalyticsChart(): void {
    if (!this.salesAnalyticsChart?.nativeElement) return;

    const ctx = this.salesAnalyticsChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
          data: [20000, 25000, 22000, 27632],
          borderColor: '#ff4d4f',
          backgroundColor: 'rgba(255, 77, 79, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    });

    this.charts.push(chart);
  }

  private createCpuChart(): void {
    if (!this.cpuChart?.nativeElement) return;

    const ctx = this.cpuChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [this.systemStats.cpu, 100 - this.systemStats.cpu],
          backgroundColor: ['#6c7ae0', '#e8e8e8'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { display: false }
        }
      }
    });

    this.charts.push(chart);
  }

  private createMemoryChart(): void {
    if (!this.memoryChart?.nativeElement) return;

    const ctx = this.memoryChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [75, 25],
          backgroundColor: ['#52c41a', '#e8e8e8'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { display: false }
        }
      }
    });

    this.charts.push(chart);
  }

  private createIncomeChart(): void {
    if (!this.incomeChart?.nativeElement) return;

    const ctx = this.incomeChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Sales',
            data: [30000, 35000, 32000, 40000, 38000, 45000, 42000, 48000, 46000, 52000, 50000, 55000],
            borderColor: '#6c7ae0',
            backgroundColor: 'rgba(108, 122, 224, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          },
          {
            label: 'Orders',
            data: [25000, 30000, 28000, 35000, 33000, 38000, 36000, 42000, 40000, 45000, 43000, 48000],
            borderColor: '#52c41a',
            backgroundColor: 'rgba(82, 196, 26, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          x: {
            grid: { display: false }
          },
          y: {
            grid: { color: '#f0f0f0' }
          }
        }
      }
    });

    this.charts.push(chart);
  }

  private createOverallSalesChart(): void {
    if (!this.overallSalesChart?.nativeElement) return;

    const ctx = this.overallSalesChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Gross Sales', 'Purchases', 'Returns'],
        datasets: [{
          data: [this.overallStats.grossSales, this.overallStats.purchases, this.overallStats.returns],
          backgroundColor: ['#6c7ae0', '#52c41a', '#ff4d4f'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          }
        }
      }
    });

    this.charts.push(chart);
  }

  private createSalesStatsChart(): void {
    if (!this.salesStatsChart?.nativeElement) return;

    const ctx = this.salesStatsChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          data: [120, 150, 180, 200, 160, 190, 170],
          backgroundColor: '#6c7ae0',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false }
          },
          y: {
            grid: { color: '#f0f0f0' }
          }
        }
      }
    });

    this.charts.push(chart);
  }

  private updateChartsData(): void {
    // Update charts with new data when dashboard data changes
    this.charts.forEach(chart => {
      chart.update();
    });
  }

  // Component methods
  changeSalesPeriod(period: string): void {
    console.log('Changing sales period to:', period);
    // Implement period change logic
  }

  subscribeNewsletter(): void {
    if (this.newsletterEmail) {
      console.log('Subscribing email:', this.newsletterEmail);
      // Implement newsletter subscription
      this.newsletterEmail = '';
    }
  }

  getUserInitials(): string {
    if (!this.currentUser) return 'U';
    const names = this.currentUser.fullName?.split(' ') || ['User'];
    return names.length > 1 
      ? names[0][0] + names[1][0] 
      : names[0][0] + names[0][1] || 'U';
  }

  getRoleColor(): string {
    if (!this.currentUser) return '#6c7ae0';
    
    switch (this.currentUser.role?.toLowerCase()) {
      case 'super_admin': return '#ff4d4f';
      case 'admin': return '#6c7ae0';
      case 'vendor': return '#52c41a';
      case 'customer': return '#1890ff';
      default: return '#6c7ae0';
    }
  }

  getRoleDisplayName(): string {
    if (!this.currentUser?.role) return 'User';
    
    return this.currentUser.role
      .split('_')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
