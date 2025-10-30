import { Injectable } from '@angular/core';
import Chart from 'chart.js/auto';

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  initializeCharts() {
    this.initializeTransactionsChart();
    this.initializeSalesChart();
    this.initializeCPUChart();
    this.initializeMemoryChart();
    this.initializeStatisticsChart();
    this.initializeGrowthChart();
  }

  private initializeTransactionsChart() {
    const ctx = document.getElementById('status-summary') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Transactions',
            data: [30, 45, 35, 55, 40, 65],
            borderColor: '#0033c4',
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(0, 51, 196, 0.1)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }
  }

  private initializeSalesChart() {
    const ctx = document.getElementById('sales-chart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Sales',
            data: [65, 59, 80, 81, 56, 55],
            backgroundColor: '#00d25b'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }
  }

  private initializeCPUChart() {
    const ctx = document.getElementById('cpu-chart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Used', 'Free'],
          datasets: [{
            data: [55, 45],
            backgroundColor: ['#fc424a', '#e9ecef']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }
  }

  private initializeMemoryChart() {
    const ctx = document.getElementById('memory-chart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Used', 'Free'],
          datasets: [{
            data: [65, 35],
            backgroundColor: ['#8f5fe8', '#e9ecef']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }
  }

  private initializeStatisticsChart() {
    const ctx = document.getElementById('statistics-chart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          datasets: [{
            label: 'Register User',
            data: [65, 59, 80, 81, 56, 55, 40],
            borderColor: '#8f5fe8',
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(143, 95, 232, 0.1)'
          }, {
            label: 'Premium User',
            data: [30, 45, 35, 55, 40, 65, 45],
            borderColor: '#00d25b',
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(0, 210, 91, 0.1)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top'
            }
          }
        }
      });
    }
  }

  private initializeGrowthChart() {
    const ctx = document.getElementById('growth-chart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Growth',
            data: [65, 59, 80, 81, 56, 55],
            backgroundColor: ['#0033c4', '#00d25b', '#8f5fe8', '#ffab00', '#fc424a', '#0033c4']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }
  }
}