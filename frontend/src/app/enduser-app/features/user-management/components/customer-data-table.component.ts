import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';

import { UserManagementService } from '../services/user-management.service';
import { NotificationService } from '../../../core/services/notification.service';

interface CustomerOrder {
    _id: string;
    orderNumber: string;
    date: Date;
    status: string;
    total: number;
    items: Array<{
        productName: string;
        quantity: number;
        price: number;
    }>;
}

interface CustomerActivity {
    type: string;
    description: string;
    timestamp: Date;
    icon: string;
}

@Component({
    selector: 'app-customer-data-table',
    imports: [
        CommonModule,
        RouterModule,
        MatTableModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatProgressSpinnerModule,
        MatTabsModule
    ],
    styleUrls: ['./customer-data-table.component.scss'],
    templateUrl: './customer-data-table.component.html'
})
export class CustomerDataTableComponent implements OnInit {
    @Input() customerData: any;
    @Input() currentUser: any;

    loading = false;
    orders: CustomerOrder[] = [];
    recentActivity: CustomerActivity[] = [];

    constructor(
        private userManagementService: UserManagementService,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        if (this.customerData) {
            this.loadCustomerOrders();
            this.loadRecentActivity();
        }
    }

    private loadCustomerOrders(): void {
        // Load orders from API - no mock data
        this.orders = [];
    }

    private loadRecentActivity(): void {
        // Load activity from API - no mock data
        this.recentActivity = [];
    }

    getInitials(fullName: string): string {
        return fullName.split(' ').map(name => name.charAt(0)).join('').toUpperCase();
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    formatDate(date: Date | string): string {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    refreshOrders(): void {
        this.loadCustomerOrders();
        this.notificationService.success('Success', 'Orders refreshed');
    }

    editProfile(): void {
        this.notificationService.info('Profile', 'Opening profile editor...');
    }

    changePassword(): void {
        this.notificationService.info('Password', 'Opening password change dialog...');
    }

    toggleAccountStatus(): void {
        const action = this.customerData.isActive ? 'deactivate' : 'activate';
        this.notificationService.warning('Confirm Action', `Are you sure you want to ${action} this account?`);
    }

    deleteAccount(): void {
        this.notificationService.error('Delete Account', 'Are you sure you want to delete this account? This action cannot be undone.');
    }
}
