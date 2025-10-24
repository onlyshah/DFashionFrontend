import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent, TableColumn } from '../data-table/data-table.component';
import { AdminDataService } from '../../services/admin-data.service';

@Component({
  selector: 'app-products-table',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  template: `
    <app-data-table
      [columns]="columns"
      [data]="products"
      [actions]="actions"
      [pagination]="pagination"
      searchPlaceholder="Search products..."
      (pageChange)="onPageChange($event)"
      (sortChange)="onSortChange($event)"
      (searchChange)="onSearch($event)"
      (exportData)="exportProducts()">

      <ng-template #priceTemplate let-product>
        {{ product.price | currency }}
      </ng-template>

      <ng-template #stockTemplate let-product>
        <span [class.low-stock]="product.stock < 10">
          {{ product.stock }}
        </span>
      </ng-template>

      <ng-template #statusTemplate let-product>
        <span [class.status-badge]="true"
              [class.active]="product.status === 'active'"
              [class.draft]="product.status === 'draft'"
              [class.archived]="product.status === 'archived'">
          {{ product.status }}
        </span>
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
    .status-badge.active {
      background: var(--success-light);
      color: var(--success-color);
    }
    .status-badge.draft {
      background: var(--warning-light);
      color: var(--warning-color);
    }
    .status-badge.archived {
      background: var(--danger-light);
      color: var(--danger-color);
    }
    .low-stock {
      color: var(--danger-color);
      font-weight: 500;
    }
  `]
})
export class ProductsTableComponent implements OnInit {
  columns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Product Name', sortable: true },
    { key: 'sku', label: 'SKU', sortable: true },
    { 
      key: 'price', 
      label: 'Price', 
      sortable: true,
      template: 'priceTemplate'
    },
    { 
      key: 'stock', 
      label: 'Stock', 
      sortable: true,
      template: 'stockTemplate'
    },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      template: 'statusTemplate'
    },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'lastUpdated', label: 'Last Updated', sortable: true }
  ];

  actions = [
    {
      label: 'Edit',
      icon: 'typcn-pencil',
      action: (product: any) => this.editProduct(product)
    },
    {
      label: 'Archive',
      icon: 'typcn-archive',
      action: (product: any) => this.archiveProduct(product)
    },
    {
      label: 'Delete',
      icon: 'typcn-trash',
      action: (product: any) => this.deleteProduct(product)
    }
  ];

  products: any[] = [];
  pagination = {
    pageSize: 10,
    currentPage: 1,
    totalItems: 0
  };

  private searchQuery = '';
  private sortField = 'name';
  private sortOrder: 'asc' | 'desc' = 'asc';

  constructor(private adminService: AdminDataService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    const params = {
      page: this.pagination.currentPage,
      limit: this.pagination.pageSize,
      search: this.searchQuery,
      sortField: this.sortField,
      sortOrder: this.sortOrder
    };

    this.adminService.getProducts(params).subscribe({
      next: (response) => {
        this.products = response.data;
        this.pagination.totalItems = response.total;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        // Show error notification
      }
    });
  }

  onPageChange(page: number): void {
    this.pagination.currentPage = page;
    this.loadProducts();
  }

  onSortChange(event: { column: string; direction: 'asc' | 'desc' }): void {
    this.sortField = event.column;
    this.sortOrder = event.direction;
    this.loadProducts();
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    this.pagination.currentPage = 1;
    this.loadProducts();
  }

  editProduct(product: any): void {
    // Implementation for editing product
    console.log('Edit product:', product);
  }

  archiveProduct(product: any): void {
    if (confirm(`Are you sure you want to archive ${product.name}?`)) {
      this.adminService.updateProduct(product.id, { status: 'archived' }).subscribe({
        next: () => {
          this.loadProducts();
          // Show success notification
        },
        error: (error) => {
          console.error('Error archiving product:', error);
          // Show error notification
        }
      });
    }
  }

  deleteProduct(product: any): void {
    if (confirm(`Are you sure you want to delete ${product.name}?`)) {
      this.adminService.deleteProduct(product.id).subscribe({
        next: () => {
          this.loadProducts();
          // Show success notification
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          // Show error notification
        }
      });
    }
  }

  exportProducts(): void {
    this.adminService.generateReport('products').subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'products-report.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error exporting products:', error);
        // Show error notification
      }
    });
  }
}