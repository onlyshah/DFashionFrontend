import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { PermissionService } from '../../services/permission.service';
import { UiAnimationService } from '../../services/ui-animation.service';

Chart.register(...registerables);

export interface SystemStatus {
  server: string;
  database: string;
  activeUsers: number;
  peakUsers: number;
  apiHealth: string;
  uptime: string;
  dbResponseTime: number;
  avgResponseTime: number;
}

export interface PerformanceMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

export interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
}

export interface Service {
  id: string;
  name: string;
  icon: string;
  status: 'online' | 'offline' | 'degraded';
  responseTime: number;
  lastCheck: Date;
}

export interface SystemInfo {
  os: string;
  nodeVersion: string;
  totalMemory: string;
  cpuCores: number;
  appVersion: string;
  environment: string;
  buildNumber: string;
  startTime: Date;
}

@Component({
  selector: 'app-system-monitoring',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './system-monitoring.component.html',
  styleUrl: './system-monitoring.component.scss'
})
export class SystemMonitoringComponent implements OnInit, OnDestroy {
  @ViewChild('performanceChart', { static: false }) performanceChart!: ElementRef<HTMLCanvasElement>;

  systemStatus: SystemStatus = {
    server: 'online',
    database: 'connected',
    activeUsers: 0,
    peakUsers: 0,
    apiHealth: 'healthy',
    uptime: '0 days',
    dbResponseTime: 0,
    avgResponseTime: 0
  };

  performanceMetrics: PerformanceMetrics = {
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0
  };

  recentAlerts: SystemAlert[] = [];
  services: Service[] = [];
  systemInfo: SystemInfo = {
    os: '',
    nodeVersion: '',
    totalMemory: '',
    cpuCores: 0,
    appVersion: '',
    environment: '',
    buildNumber: '',
    startTime: new Date()
  };

  private chart: Chart | null = null;
  private refreshInterval: any;

  constructor(
    private permissionService: PermissionService,
    private uiAnimationService: UiAnimationService
  ) {}

  ngOnInit() {
    this.checkPermissions();
    this.loadSystemData();
    this.startAutoRefresh();
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private checkPermissions() {
    if (!this.permissionService.hasPermission('system:monitoring')) {
      this.uiAnimationService.showNotification('Access denied: Insufficient permissions', 'error');
      return;
    }
  }

  private loadSystemData() {
    this.loadSystemStatus();
    this.loadPerformanceMetrics();
    this.loadRecentAlerts();
    this.loadServices();
    this.loadSystemInfo();

    setTimeout(() => {
      this.initializeChart();
    }, 100);
  }

  private loadSystemStatus() {
    // TODO: Replace with actual API call to get system status
    // this.adminApiService.getSystemStatus().subscribe(status => {
    //   this.systemStatus = status;
    // });

    // Default values until API is implemented
    this.systemStatus = {
      server: 'online',
      database: 'connected',
      activeUsers: 0,
      peakUsers: 0,
      apiHealth: 'healthy',
      uptime: '0 days',
      dbResponseTime: 0,
      avgResponseTime: 0
    };
  }

  private loadPerformanceMetrics() {
    // TODO: Replace with actual API call to get performance metrics
    // this.adminApiService.getPerformanceMetrics().subscribe(metrics => {
    //   this.performanceMetrics = metrics;
    // });

    // Default values until API is implemented
    this.performanceMetrics = {
      cpu: 0,
      memory: 0,
      disk: 0,
      network: 0
    };
  }

  private loadRecentAlerts() {
    const alertTypes: ('error' | 'warning' | 'info')[] = ['error', 'warning', 'info'];
    const alertMessages = {
      error: [
        { title: 'Database Connection Lost', message: 'Primary database connection failed' },
        { title: 'API Endpoint Down', message: 'Payment API is not responding' },
        { title: 'High Error Rate', message: 'Error rate exceeded threshold' }
      ],
      warning: [
        { title: 'High Memory Usage', message: 'Memory usage is above 80%' },
        { title: 'Slow Response Time', message: 'API response time increased' },
        { title: 'Disk Space Low', message: 'Available disk space below 20%' }
      ],
      info: [
        { title: 'System Update', message: 'System updated to version 2.1.0' },
        { title: 'Backup Completed', message: 'Daily backup completed successfully' },
        { title: 'Maintenance Window', message: 'Scheduled maintenance in 2 hours' }
      ]
    };

    this.recentAlerts = [];
    for (let i = 0; i < 5; i++) {
      const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const messages = alertMessages[type];
      const message = messages[Math.floor(Math.random() * messages.length)];

      this.recentAlerts.push({
        id: `alert_${i + 1}`,
        type,
        title: message.title,
        message: message.message,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
      });
    }

    this.recentAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private loadServices() {
    this.services = [
      {
        id: 'api',
        name: 'API Server',
        icon: 'typcn-wi-fi',
        status: Math.random() > 0.1 ? 'online' : 'offline',
        responseTime: Math.floor(Math.random() * 100) + 50,
        lastCheck: new Date()
      },
      {
        id: 'database',
        name: 'Database',
        icon: 'typcn-database',
        status: Math.random() > 0.05 ? 'online' : 'degraded',
        responseTime: Math.floor(Math.random() * 50) + 10,
        lastCheck: new Date()
      },
      {
        id: 'redis',
        name: 'Redis Cache',
        icon: 'typcn-flash',
        status: Math.random() > 0.1 ? 'online' : 'offline',
        responseTime: Math.floor(Math.random() * 20) + 5,
        lastCheck: new Date()
      },
      {
        id: 'email',
        name: 'Email Service',
        icon: 'typcn-mail',
        status: Math.random() > 0.15 ? 'online' : 'degraded',
        responseTime: Math.floor(Math.random() * 200) + 100,
        lastCheck: new Date()
      },
      {
        id: 'storage',
        name: 'File Storage',
        icon: 'typcn-folder',
        status: 'online',
        responseTime: Math.floor(Math.random() * 80) + 20,
        lastCheck: new Date()
      }
    ];
  }

  private loadSystemInfo() {
    this.systemInfo = {
      os: 'Ubuntu 20.04 LTS',
      nodeVersion: 'v18.17.0',
      totalMemory: '16 GB',
      cpuCores: 8,
      appVersion: '2.1.0',
      environment: 'production',
      buildNumber: '#1234',
      startTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    };
  }

  private initializeChart() {
    if (!this.performanceChart?.nativeElement) return;

    const ctx = this.performanceChart.nativeElement.getContext('2d');
    if (!ctx) return;

    // Generate mock time series data
    const labels = [];
    const cpuData = [];
    const memoryData = [];
    const diskData = [];

    for (let i = 23; i >= 0; i--) {
      const time = new Date();
      time.setHours(time.getHours() - i);
      labels.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));

      cpuData.push(Math.floor(Math.random() * 40) + 20);
      memoryData.push(Math.floor(Math.random() * 30) + 40);
      diskData.push(Math.floor(Math.random() * 20) + 60);
    }

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'CPU Usage (%)',
            data: cpuData,
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          },
          {
            label: 'Memory Usage (%)',
            data: memoryData,
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          },
          {
            label: 'Disk Usage (%)',
            data: diskData,
            borderColor: '#2ecc71',
            backgroundColor: 'rgba(46, 204, 113, 0.1)',
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
            position: 'top'
          }
        },
        scales: {
          x: {
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            max: 100,
            grid: { color: 'rgba(0,0,0,0.1)' }
          }
        }
      }
    });
  }

  private startAutoRefresh() {
    this.refreshInterval = setInterval(() => {
      this.loadSystemStatus();
      this.loadPerformanceMetrics();
    }, 30000); // Refresh every 30 seconds
  }

  refreshAlerts() {
    this.loadRecentAlerts();
    this.uiAnimationService.showNotification('Alerts refreshed', 'info', 1000);
  }

  checkService(service: Service) {
    service.lastCheck = new Date();
    service.responseTime = Math.floor(Math.random() * 200) + 50;
    service.status = Math.random() > 0.1 ? 'online' : 'offline';
    this.uiAnimationService.showNotification(`${service.name} checked`, 'info', 1000);
  }

  // UI Helper Methods
  getHealthStatusClass(status: string): string {
    switch (status) {
      case 'healthy': return 'text-success';
      case 'degraded': return 'text-warning';
      case 'unhealthy': return 'text-danger';
      default: return 'text-muted';
    }
  }

  getHealthIconClass(status: string): string {
    switch (status) {
      case 'healthy': return 'bg-success';
      case 'degraded': return 'bg-warning';
      case 'unhealthy': return 'bg-danger';
      default: return 'bg-muted';
    }
  }

  getAlertIcon(type: string): string {
    switch (type) {
      case 'error': return 'typcn-times';
      case 'warning': return 'typcn-warning';
      case 'info': return 'typcn-info';
      default: return 'typcn-info';
    }
  }

  getAlertColor(type: string): string {
    switch (type) {
      case 'error': return '#e74c3c';
      case 'warning': return '#f39c12';
      case 'info': return '#3498db';
      default: return '#666';
    }
  }

  getAlertBadgeClass(type: string): string {
    switch (type) {
      case 'error': return 'badge-danger';
      case 'warning': return 'badge-warning';
      case 'info': return 'badge-info';
      default: return 'badge-secondary';
    }
  }

  getServiceStatusBadge(status: string): string {
    switch (status) {
      case 'online': return 'badge-success';
      case 'offline': return 'badge-danger';
      case 'degraded': return 'badge-warning';
      default: return 'badge-secondary';
    }
  }

  getEnvironmentBadge(environment: string): string {
    switch (environment) {
      case 'production': return 'badge-success';
      case 'staging': return 'badge-warning';
      case 'development': return 'badge-info';
      default: return 'badge-secondary';
    }
  }
}
