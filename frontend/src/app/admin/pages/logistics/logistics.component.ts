import { Component, OnInit } from '@angular/core';
import { LogisticsService } from '../../services/logistics.service';

@Component({
  selector: 'app-logistics',
  templateUrl: './logistics.component.html',
  styleUrls: ['./logistics.component.scss']
})
export class LogisticsComponent implements OnInit {
  shipments: any[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private logisticsService: LogisticsService) {}

  ngOnInit(): void {
    this.loadShipments();
  }

  loadShipments(): void {
    this.isLoading = true;
    this.error = null;
    this.logisticsService.getShipments().subscribe({
      next: (res) => {
        this.shipments = res || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load shipments from backend.';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': '#ff9800',
      'shipped': '#2196f3',
      'delivered': '#4caf50',
      'failed': '#f44336'
    };
    return colors[status] || '#999';
  }
}
