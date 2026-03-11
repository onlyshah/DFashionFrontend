import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { OrderService, Order } from '../../services/order.service';
import { OrderDialogComponent } from './order-dialog.component';

@Component({
    selector: 'app-order-management',
    styleUrls: ['./order-management.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatDialogModule,
        MatSnackBarModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatCardModule,
        MatTooltipModule,
        ReactiveFormsModule
    ],
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
        console.log('🔄 [Orders] Fetching orders from API with filters');
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

        console.log('🔍 [Orders] Filter parameters:', filters);

        this.orderService.getOrdersWithFallback(filters).subscribe({
            next: (response) => {
                console.log('✅ [Orders] Full API Response:', response);
                console.log('✅ [Orders] Response success:', response?.success);
                console.log('✅ [Orders] Response data:', response?.data);
                console.log('✅ [Orders] Data.orders array:', response?.data?.orders);
                console.log('✅ [Orders] Pagination:', { total: response?.data?.total, page: response?.data?.page, limit: response?.data?.limit, totalPages: response?.data?.totalPages });
                
                if (response.success && response.data) {
                    // Transform API response to component Order interface
                    const orders = (response.data.orders || response.data || []).map((order: any) => ({
                        _id: order.id || order._id,
                        orderNumber: order.order_number || order.orderNumber || `ORD-${order.id}`,
                        orderDate: order.created_at || order.orderDate || new Date().toISOString(),
                        customer: {
                            _id: order.user_id || order.customer?._id || 'unknown',
                            fullName: this.extractCustomerName(order.shipping_address) || 'Unknown Customer',
                            email: order.customer_email || order.customer?.email || 'N/A',
                            phone: this.extractCustomerPhone(order.shipping_address) || 'N/A'
                        },
                        items: order.items || [],
                        totalAmount: parseFloat(order.total_amount) || 0,
                        paymentMethod: order.payment_method || 'unknown',
                        paymentStatus: order.payment_status || 'pending',
                        status: order.status || 'pending',
                        shippingAddress: order.shipping_address,
                        userId: order.user_id
                    }));
                    
                    console.log('✅ [Orders] Transformed orders count:', orders.length);
                    console.log('✅ [Orders] Sample order:', orders[0]);
                    
                    this.dataSource.data = orders;
                    console.log('✅ [Orders] DataSource updated with', this.dataSource.data.length, 'orders');
                    
                    this.totalOrders = response.data.total || response.data.pagination?.totalOrders || orders.length;
                    console.log('✅ [Orders] Total orders for pagination:', this.totalOrders);
                } else {
                    console.warn('⚠️ [Orders] Response indicates failure or no data');
                    this.dataSource.data = [];
                    this.totalOrders = 0;
                    this.snackBar.open('Failed to load orders', 'Close', { duration: 3000 });
                }
                this.isLoading = false;
                console.log('✅ [Orders] Load complete - UI should show', this.dataSource.data.length, 'orders');
            },
            error: (error) => {
                console.error('❌ [Orders] API Error:', error);
                console.error('❌ [Orders] Error message:', error?.message);
                console.error('❌ [Orders] Error status:', error?.status);
                console.error('❌ [Orders] Full error:', error);
                this.dataSource.data = [];
                this.totalOrders = 0;
                this.isLoading = false;
                this.snackBar.open('Error loading orders', 'Close', { duration: 3000 });
            }
        });
    }

    private extractCustomerName(shippingAddressJson: string | any): string {
        try {
            if (typeof shippingAddressJson === 'string') {
                const addr = JSON.parse(shippingAddressJson);
                return addr.name || 'Unknown';
            } else if (shippingAddressJson && shippingAddressJson.name) {
                return shippingAddressJson.name;
            }
        } catch (e) {
            console.error('Error parsing shipping address:', e);
        }
        return 'Unknown Customer';
    }

    private extractCustomerPhone(shippingAddressJson: string | any): string {
        try {
            if (typeof shippingAddressJson === 'string') {
                const addr = JSON.parse(shippingAddressJson);
                return addr.phone || '';
            } else if (shippingAddressJson && shippingAddressJson.phone) {
                return shippingAddressJson.phone;
            }
        } catch (e) {
            console.error('Error parsing shipping address:', e);
        }
        return '';
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
        const dialogRef = this.dialog.open(OrderDialogComponent, {
            width: '500px',
            data: order
        });

        dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
            if (result) {
                this.updateOrder(order._id!, result);
            }
        });
    }

    updateOrder(orderId: string, formData: any): void {
        this.isLoading = true;
        this.orderService.updateOrderStatus(orderId, formData.status).subscribe({
            next: (response) => {
                if (response.success) {
                    this.snackBar.open('Order updated successfully', 'Close', { duration: 3000 });
                    this.loadOrders();
                } else {
                    this.isLoading = false;
                    this.snackBar.open('Failed to update order', 'Close', { duration: 3000 });
                }
            },
            error: (error) => {
                console.error('Error updating order:', error);
                this.isLoading = false;
                this.snackBar.open(error.error?.message || 'Error updating order', 'Close', { duration: 3000 });
            }
        });
    }

    deleteOrder(order: Order): void {
        const confirmed = window.confirm(`Are you sure you want to delete order ${order.orderNumber}?`);
        if (!confirmed) return;

        this.isLoading = true;
        this.orderService.deleteOrder(order._id!).subscribe({
            next: (response) => {
                if (response.success) {
                    this.snackBar.open('Order deleted successfully', 'Close', { duration: 3000 });
                    this.loadOrders();
                } else {
                    this.isLoading = false;
                    this.snackBar.open('Failed to delete order', 'Close', { duration: 3000 });
                }
            },
            error: (error) => {
                console.error('Error deleting order:', error);
                this.isLoading = false;
                this.snackBar.open(error.error?.message || 'Error deleting order', 'Close', { duration: 3000 });
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
