import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-income-chart',
  standalone: true,
  template: '<canvas #chartCanvas></canvas>',
  styles: [':host { display: block; width: 100%; height: 100%; }']
})
export class IncomeChartComponent implements OnInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() data: number[] = [];
  @Input() labels: string[] = [];
  private chart?: Chart;

  ngOnInit() {
    this.initChart();
  }

  private initChart() {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: [{
          label: 'Monthly Income',
          data: this.data,
          borderColor: '#3b86d1',
          backgroundColor: 'rgba(59, 134, 209, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0,0,0,0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }
}