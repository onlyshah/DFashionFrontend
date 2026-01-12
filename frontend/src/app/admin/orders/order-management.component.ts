import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { OrderService, Order } from '../services/order.service';

@Component({
    selector: 'app-order-management',
    styleUrls: ['./order-management.component.scss'],
    standalone: false,
    templateUrl: './order-management.component.html'
})
export class OrderManagementComponent implements OnInit, OnDestroy {
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    private destroy$ = new Subject<void>();

    displayedColumns: string[] = ['orderNumber', 'customer', 'items', 'amount', 'status', 'actions'];
    dataSource = new MatTableDataSource<Order>([]);
    isLoading = false;
    totalOrders = 0;

    // Filters
    searchControl = new FormControl('');
    statusFilter = new FormControl('');
    paymentStatusFilter = new FormControl('');
    dateFromFilter = new FormControl('');
    dateToFilter = new FormControl('');

    statuses = [
        { value: '', label: 'All Statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    paymentStatuses = [
        { value: '', label: 'All Payment Statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'paid', label: 'Paid' },
        { value: 'failed', label: 'Failed' },
        { value: 'refunded', label: 'Refunded' }
    ];

    constructor(
        private orderService: OrderService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.setupFilters();
        this.loadOrders();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    setupFilters(): void {
        this.searchControl.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.loadOrders();
        });

        [this.statusFilter, this.paymentStatusFilter].forEach(control => {
            control.valueChanges.pipe(
                takeUntil(this.destroy$)
            ).subscribe(() => {
                this.loadOrders();
            });
        });
    }

    loadOrders(): void {
        this.isLoading = true;

        const filters = {
            search: this.searchControl.value || '',
            status: this.statusFilter.value || '',
            paymentStatus: this.paymentStatusFilter.value || '',
            dateFrom: this.dateFromFilter.value || '',
            dateTo: this.dateToFilter.value || '',
            page: this.paginator?.pageIndex ? this.paginator.pageIndex + 1 : 1,
            limit: this.paginator?.pageSize || 10
        };

        this.orderService.getOrdersWithFallback(filters).subscribe({
            next: (response) => {
                console.log('Orders loaded:', response);
                if (response.success) {
                    this.dataSource.data = response.data.orders;
                    this.totalOrders = response.data.pagination.totalOrders;
                } else {
                    this.dataSource.data = [];
                    this.totalOrders = 0;
                    this.snackBar.open('Failed to load orders', 'Close', { duration: 3000 });
                }
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading orders:', error);
                this.dataSource.data = [];
                this.totalOrders = 0;
                this.isLoading = false;
                this.snackBar.open('Error loading orders', 'Close', { duration: 3000 });
            }
        });
    }

    onPageChange(): void {
        this.loadOrders();
    }

    viewOrder(order: Order): void {
        this.orderService.getOrderById(order._id!).subscribe({
            next: (response) => {
                if (response.success) {
                    // Open order details dialog or navigate to details page
                    console.log('Order details:', response.data);
                    this.snackBar.open('Order details loaded', 'Close', { duration: 3000 });
                } else {
                    this.snackBar.open('Failed to load order details', 'Close', { duration: 3000 });
                }
            },
            error: (error) => {
                console.error('Error loading order details:', error);
                this.snackBar.open('Error loading order details', 'Close', { duration: 3000 });
            }
        });
    }

    updateOrderStatus(order: Order): void {
        // For now, cycle through statuses - in real implementation, show a dialog
        const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
        const currentIndex = statuses.indexOf(order.status);
        const nextStatus = statuses[(currentIndex + 1) % statuses.length];

        this.orderService.updateOrderStatus(order._id!, nextStatus).subscribe({
            next: (response) => {
                if (response.success) {
                    order.status = nextStatus as any;
                    this.snackBar.open(response.message, 'Close', { duration: 3000 });
                } else {
                    this.snackBar.open('Failed to update order status', 'Close', { duration: 3000 });
                }
            },
            error: (error) => {
                console.error('Error updating order status:', error);
                this.snackBar.open('Error updating order status', 'Close', { duration: 3000 });
            }
        });
    }

    printInvoice(order: Order): void {
        // TODO: Implement invoice generation
        this.snackBar.open('Invoice printing - Coming soon', 'Close', { duration: 3000 });
    }

    formatDate(dateString: string): string {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
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
}
