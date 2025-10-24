import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent, TableColumn } from '../data-table/data-table.component';
import { AdminDataService } from '../../services/admin-data.service';

@Component({
  selector: 'app-orders-table',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  template: `
    <app-data-table
      [columns]="columns"
      [data]="orders"
      [actions]="actions"
      [pagination]="pagination"
      searchPlaceholder="Search orders..."
      (pageChange)="onPageChange($event)"
      (sortChange)="onSortChange($event)"
      (searchChange)="onSearch($event)"
      (exportData)="exportOrders()">

      <ng-template #totalTemplate let-order>
        {{ order.total | currency }}
      </ng-template>

      <ng-template #statusTemplate let-order>
        <span [class.status-badge]="true"
              [class.pending]="order.status === 'pending'"
              [class.processing]="order.status === 'processing'"
              [class.shipped]="order.status === 'shipped'"
              [class.delivered]="order.status === 'delivered'"
              [class.cancelled]="order.status === 'cancelled'">
          {{ order.status }}
        </span>
      </ng-template>

      <ng-template #customerTemplate let-order>
        <div class="customer-info">
          <img [src]="order.customer.avatar" [alt]="order.customer.name" class="customer-avatar">
          <div class="customer-details">
            <span class="name">{{ order.customer.name }}</span>
            <small class="email">{{ order.customer.email }}</small>
          </div>
        </div>
      </ng-template>
    </app-data-table>
  `,
  styles: [`
    .status-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 1rem;
      font-size: 0.875rem;
      text-transform: capitalize;
    }
    .status-badge.pending {
      background: var(--warning-light);
      color: var(--warning-color);
    }
    .status-badge.processing {
      background: var(--info-light);
      color: var(--info-color);
    }
    .status-badge.shipped {
      background: var(--primary-light);
      color: var(--primary-color);
    }
    .status-badge.delivered {
      background: var(--success-light);
      color: var(--success-color);
    }
    .status-badge.cancelled {
      background: var(--danger-light);
      color: var(--danger-color);
    }
    .customer-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .customer-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }
    .customer-details {
      display: flex;
      flex-direction: column;
    }
    .customer-details .name {
      font-weight: 500;
    }
    .customer-details .email {
      color: var(--text-muted);
      font-size: 0.75rem;
    }
  `]
})
export class OrdersTableComponent implements OnInit {
  columns: TableColumn[] = [
    { key: 'id', label: 'Order ID' },
    { 
      key: 'customer', 
      label: 'Customer',
      template: 'customerTemplate'
    },
    { 
      key: 'total', 
      label: 'Total', 
      sortable: true,
      template: 'totalTemplate'
    },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      template: 'statusTemplate'
    },
    { key: 'items', label: 'Items', sortable: true },
    { key: 'orderDate', label: 'Order Date', sortable: true },
    { key: 'deliveryDate', label: 'Delivery Date', sortable: true }
  ];

  actions = [
    {
      label: 'View Details',
      icon: 'typcn-eye',
      action: (order: any) => this.viewOrderDetails(order)
    },
    {
      label: 'Update Status',
      icon: 'typcn-refresh',
      action: (order: any) => this.updateOrderStatus(order)
    }
  ];

  orders: any[] = [];
  pagination = {
    pageSize: 10,
    currentPage: 1,
    totalItems: 0
  };

  private searchQuery = '';
  private sortField = 'orderDate';
  private sortOrder: 'asc' | 'desc' = 'desc';

  constructor(private adminService: AdminDataService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    const params = {
      page: this.pagination.currentPage,
      limit: this.pagination.pageSize,
      search: this.searchQuery,
      sortField: this.sortField,
      sortOrder: this.sortOrder
    };

    this.adminService.getOrders(params).subscribe({
      next: (response) => {
        this.orders = response.data;
        this.pagination.totalItems = response.total;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        // Show error notification
      }
    });
  }

  onPageChange(page: number): void {
    this.pagination.currentPage = page;
    this.loadOrders();
  }

  onSortChange(event: { column: string; direction: 'asc' | 'desc' }): void {
    this.sortField = event.column;
    this.sortOrder = event.direction;
    this.loadOrders();
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    this.pagination.currentPage = 1;
    this.loadOrders();
  }

  viewOrderDetails(order: any): void {
    // Implement order details view
    console.log('View order details:', order);
  }

  updateOrderStatus(order: any): void {
    // Here you would typically open a dialog to select the new status
    const newStatus = prompt('Enter new status (pending, processing, shipped, delivered, cancelled):');
    if (newStatus) {
      this.adminService.updateOrderStatus(order.id, newStatus).subscribe({
        next: () => {
          this.loadOrders();
          // Show success notification
        },
        error: (error) => {
          console.error('Error updating order status:', error);
          // Show error notification
        }
      });
    }
  }

  exportOrders(): void {
    this.adminService.generateReport('orders').subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'orders-report.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error exporting orders:', error);
        // Show error notification
      }
    });
  }
}