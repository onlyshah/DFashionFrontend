import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-sales-chart',
  standalone: true,
  template: '<canvas #chartCanvas></canvas>',
  styles: [':host { display: block; width: 100%; height: 100%; }']
})
export class SalesChartComponent implements OnInit {
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
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: [{
          label: 'Sales',
          data: this.data,
          backgroundColor: '#21bf06',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: false
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }
}