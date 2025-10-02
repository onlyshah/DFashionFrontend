import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminApiService } from '../../services/admin-api.service';

// Register Chart.js components
Chart.register(...registerables);

@Component({
    selector: 'app-admin-dashboard',
    imports: [CommonModule],
    templateUrl: './admin-dashboard.component.html',
    styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('transactionsChart', { static: false }) transactionsChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('salesChart', { static: false }) salesChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('salesAnalyticsChart', { static: false }) salesAnalyticsChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cpuChart', { static: false }) cpuChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('memoryChart', { static: false }) memoryChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('incomeChart', { static: false }) incomeChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('overallSalesChart', { static: false }) overallSalesChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('salesStatisticsChart', { static: false }) salesStatisticsChart!: ElementRef<HTMLCanvasElement>;

  currentUser: any = null;
  dashboardStats: any = {
    transactions: 1352,
    sales: 563,
    orders: 720,
    revenue: 5900,
    totalSales: 27632,
    salesPercentage: 78,
    cpuUsage: 55,
    memoryUsage: '123,65',
    monthlyIncrease: 67842,
    grossSales: 492,
    purchases: '87k',
    taxReturn: 882
  };

  private charts: Chart[] = [];

  constructor(
    private adminAuthService: AdminAuthService,
    private adminApiService: AdminApiService
  ) {}

  ngOnInit() {
    // Subscribe to current user
    this.adminAuthService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Load dashboard data
    this.loadDashboardData();
  }

  ngAfterViewInit() {
    // Initialize charts after view is ready
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  ngOnDestroy() {
    // Destroy all charts to prevent memory leaks
    this.charts.forEach(chart => chart.destroy());
  }

  getLastLoginDate(): string {
    return new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  private loadDashboardData() {
    this.adminApiService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats = { ...this.dashboardStats, ...stats };
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        // Use mock data on error
      }
    });
  }

  private initializeCharts() {
    this.createTransactionsChart();
    this.createSalesChart();
    this.createSalesAnalyticsChart();
    this.createCpuChart();
    this.createMemoryChart();
    this.createIncomeChart();
    this.createOverallSalesChart();
    this.createSalesStatisticsChart();
  }

  private createTransactionsChart() {
    if (!this.transactionsChart?.nativeElement) return;

    const ctx = this.transactionsChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          data: [12, 19, 3, 5, 2, 3],
          borderColor: '#f39c12',
          backgroundColor: 'rgba(243, 156, 18, 0.1)',
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

  private createSalesChart() {
    if (!this.salesChart?.nativeElement) return;

    const ctx = this.salesChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          data: [8, 12, 7, 14, 10, 16],
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
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

  private createSalesAnalyticsChart() {
    if (!this.salesAnalyticsChart?.nativeElement) return;

    const ctx = this.salesAnalyticsChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Array.from({length: 20}, (_, i) => i + 1),
        datasets: [{
          data: Array.from({length: 20}, () => Math.floor(Math.random() * 100)),
          backgroundColor: '#3498db',
          borderWidth: 0,
          barThickness: 3
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

  private createCpuChart() {
    if (!this.cpuChart?.nativeElement) return;

    const ctx = this.cpuChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Array.from({length: 10}, (_, i) => i + 1),
        datasets: [{
          data: Array.from({length: 10}, () => Math.floor(Math.random() * 100)),
          backgroundColor: '#e74c3c',
          borderWidth: 0,
          barThickness: 2
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

  private createMemoryChart() {
    if (!this.memoryChart?.nativeElement) return;

    const ctx = this.memoryChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Array.from({length: 10}, (_, i) => i + 1),
        datasets: [{
          data: Array.from({length: 10}, () => Math.floor(Math.random() * 100)),
          backgroundColor: '#1abc9c',
          borderWidth: 0,
          barThickness: 2
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

  private createIncomeChart() {
    if (!this.incomeChart?.nativeElement) return;

    const ctx = this.incomeChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
          {
            label: 'Register User',
            data: [300, 250, 400, 350, 450, 400, 500],
            borderColor: '#9b59b6',
            backgroundColor: 'rgba(155, 89, 182, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
          },
          {
            label: 'Premium User',
            data: [200, 300, 200, 400, 300, 500, 400],
            borderColor: '#1abc9c',
            backgroundColor: 'rgba(26, 188, 156, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#666' }
          },
          y: {
            grid: { display: false },
            ticks: { display: false }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  private createOverallSalesChart() {
    if (!this.overallSalesChart?.nativeElement) return;

    const ctx = this.overallSalesChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Gross Sales', 'Purchases', 'Tax Return'],
        datasets: [{
          data: [492, 870, 882],
          backgroundColor: ['#3498db', '#2ecc71', '#e74c3c'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        }
      }
    });
    this.charts.push(chart);
  }

  private createSalesStatisticsChart() {
    if (!this.salesStatisticsChart?.nativeElement) return;

    const ctx = this.salesStatisticsChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          data: [65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56],
          borderColor: '#9b59b6',
          backgroundColor: 'rgba(155, 89, 182, 0.1)',
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
          x: {
            grid: { display: false },
            ticks: { color: '#666' }
          },
          y: {
            grid: { color: 'rgba(0,0,0,0.1)' },
            ticks: { color: '#666' }
          }
        }
      }
    });
    this.charts.push(chart);
  }
}
