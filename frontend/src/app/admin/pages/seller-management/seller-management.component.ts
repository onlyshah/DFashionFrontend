import { Component, OnInit } from '@angular/core';
import { SellerManagementService } from '../../services/seller-management.service';

@Component({
  selector: 'app-seller-management',
  templateUrl: './seller-management.component.html',
  styleUrls: ['./seller-management.component.scss']
})
export class SellerManagementComponent implements OnInit {
  sellers: any[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private sellerService: SellerManagementService) {}

  ngOnInit(): void {
    this.loadSellers();
  }

  loadSellers(): void {
    this.isLoading = true;
    this.error = null;
    this.sellerService.getSellers().subscribe({
      next: (res) => {
        this.sellers = res || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load sellers from backend.';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  approveSeller(sellerId: string): void {
    this.sellerService.approveSeller(sellerId).subscribe({
      next: () => {
        this.loadSellers();
      },
      error: (err) => {
        console.error('Error approving seller:', err);
      }
    });
  }

  rejectSeller(sellerId: string): void {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      this.sellerService.rejectSeller(sellerId, reason).subscribe({
        next: () => {
          this.loadSellers();
        },
        error: (err) => {
          console.error('Error rejecting seller:', err);
        }
      });
    }
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': '#ff9800',
      'approved': '#4caf50',
      'rejected': '#f44336',
      'suspended': '#9c27b0'
    };
    return colors[status] || '#999';
  }
}
