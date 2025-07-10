import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

declare var Chart: any;

interface ChartData {
  labels: string[];
  datasets: any[];
}

@Component({
  selector: 'app-chart-widget',
  templateUrl: './chart-widget.component.html',
  styleUrls: ['./chart-widget.component.scss']
})
export class ChartWidgetComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() chartData: ChartData = { labels: [], datasets: [] };
  @Input() chartType: 'line' | 'bar' | 'doughnut' | 'pie' = 'line';
  @Input() height: string = '300';
  @Input() isLoading: boolean = false;

  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  private chart: any;

  ngOnInit(): void {
    // Component initialization
  }

  ngAfterViewInit(): void {
    if (!this.isLoading && this.chartData.labels.length > 0) {
      this.createChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private createChart(): void {
    if (!this.chartCanvas) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    const config = this.getChartConfig();
    this.chart = new Chart(ctx, config);
  }

  private getChartConfig(): any {
    const baseConfig = {
      type: this.chartType,
      data: this.chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom' as const,
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#667eea',
            borderWidth: 1,
            cornerRadius: 6,
            displayColors: true
          }
        }
      }
    };

    // Customize based on chart type
    switch (this.chartType) {
      case 'line':
        baseConfig.options = {
          ...baseConfig.options,
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#6c757d'
              }
            },
            y: {
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                color: '#6c757d'
              }
            }
          },
          elements: {
            point: {
              radius: 4,
              hoverRadius: 6
            },
            line: {
              tension: 0.4
            }
          }
        };
        break;

      case 'bar':
        baseConfig.options = {
          ...baseConfig.options,
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#6c757d'
              }
            },
            y: {
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                color: '#6c757d'
              }
            }
          }
        };
        break;

      case 'doughnut':
      case 'pie':
        baseConfig.options = {
          ...baseConfig.options,
          cutout: this.chartType === 'doughnut' ? '70%' : '0%'
        };
        break;
    }

    return baseConfig;
  }

  onChartDataChange(): void {
    if (this.chart && this.chartData.labels.length > 0) {
      this.chart.data = this.chartData;
      this.chart.update();
    } else if (!this.chart && this.chartCanvas) {
      this.createChart();
    }
  }
}
