import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrderService } from '../services/order.service';

@Component({
    selector: 'app-order-details',
    styleUrls: ['./order-details.component.scss'],
    standalone: false,
    templateUrl: './order-details.component.html'
})
export class OrderDetailsComponent implements OnInit {
    selectedStatus: string = '';
    trackingNumber: string = '';
    isLoading: boolean = false;

    availableStatuses = [
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    constructor(
        public dialogRef: MatDialogRef<OrderDetailsComponent>,
        @Inject(MAT_DIALOG_DATA) public order: any,
        private orderService: OrderService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.selectedStatus = this.order.status;
        this.trackingNumber = this.order.trackingNumber || '';
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    canUpdateOrder(): boolean {
        return this.order.status !== 'delivered' && this.order.status !== 'cancelled';
    }

    updateOrderStatus(): void {
        if (this.selectedStatus === this.order.status &&
            this.trackingNumber === this.order.trackingNumber) {
            this.onCancel();
            return;
        }

        this.isLoading = true;

        // Simulate API call
        setTimeout(() => {
            this.isLoading = false;
            this.snackBar.open('Order status updated successfully', 'Close', {
                duration: 3000
            });
            this.dialogRef.close({
                status: this.selectedStatus,
                trackingNumber: this.trackingNumber
            });
        }, 1000);
    }

    formatDate(dateString: string): string {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getStatusColor(status: string): string {
        const statusColors: { [key: string]: string } = {
            'pending': '#ff9800',
            'confirmed': '#2196f3',
            'shipped': '#9c27b0',
            'delivered': '#4caf50',
            'cancelled': '#f44336'
        };
        return statusColors[status] || '#666666';
    }

    getPaymentStatusColor(status: string): string {
        const statusColors: { [key: string]: string } = {
            'pending': '#ff9800',
            'paid': '#4caf50',
            'failed': '#f44336',
            'refunded': '#9e9e9e'
        };
        return statusColors[status] || '#666666';
    }

    getItemImage(item: any): string {
        return item.product?.images?.[0]?.url || '/uploadsplaceholder-product.svg';
    }
}
