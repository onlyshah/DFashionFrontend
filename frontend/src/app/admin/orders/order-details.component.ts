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

        const orderId = this.order._id || this.order.id || this.order.orderNumber;

        // First update status
        this.orderService.updateOrderStatus(orderId, this.selectedStatus).subscribe({
            next: (res) => {
                // If tracking number changed, add/update it
                if (this.trackingNumber && this.trackingNumber !== this.order.trackingNumber) {
                    this.orderService.addTrackingNumber(orderId, this.trackingNumber).subscribe({
                        next: () => {
                            this.isLoading = false;
                            this.snackBar.open('Order status and tracking updated', 'Close', { duration: 3000 });
                            this.dialogRef.close({ status: this.selectedStatus, trackingNumber: this.trackingNumber });
                        },
                        error: (err) => {
                            console.error('Error updating tracking number:', err);
                            this.isLoading = false;
                            this.snackBar.open('Status updated but failed to update tracking number', 'Close', { duration: 4000 });
                            this.dialogRef.close({ status: this.selectedStatus, trackingNumber: this.trackingNumber });
                        }
                    });
                } else {
                    this.isLoading = false;
                    this.snackBar.open('Order status updated successfully', 'Close', { duration: 3000 });
                    this.dialogRef.close({ status: this.selectedStatus, trackingNumber: this.trackingNumber });
                }
            },
            error: (err) => {
                console.error('Error updating order status:', err);
                this.isLoading = false;
                this.snackBar.open('Failed to update order status', 'Close', { duration: 4000 });
            }
        });
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
        return item.product?.images?.[0]?.url || '/uploads/placeholder-product.svg';
    }
}
