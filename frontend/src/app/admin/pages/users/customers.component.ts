import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../services/admin-api.service';
import { CustomerEditDialogComponent } from './dialogs/customer-edit.dialog';

@Component({
  selector: 'app-customers-management',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatTableModule, MatPaginatorModule, MatSortModule, MatProgressSpinnerModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatTooltipModule, 
    MatChipsModule, MatDialogModule, MatSelectModule, MatSlideToggleModule, FormsModule
  ],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = [
    'name', 'email', 'phone', 'orders', 'totalSpent', 'createdAt', 
    'posts', 'totalLikes', 'totalComments', 'totalShares', 'status', 'actions'
  ];
  dataSource = new MatTableDataSource<any>([]);
  isLoading = false;
  searchFilter = '';
  statusFilter = '';
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  totalCustomers = 0;

  constructor(
    private api: AdminApiService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Load customers with aggregated metrics (posts, orders, engagement)
   */
  load(page: number = 1): void {
    this.isLoading = true;
    const params: any = { page, limit: this.pageSize };
    
    if (this.searchFilter) {
      params.search = this.searchFilter;
    }
    if (this.statusFilter) {
      params.status = this.statusFilter;
    }

    this.api.getCustomers(params).subscribe({
      next: (res: any) => {
        console.log('✅ Customers loaded:', res);
        this.dataSource.data = res?.data || [];
        this.totalCustomers = res?.pagination?.total || 0;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('❌ Error loading customers:', err);
        this.dataSource.data = [];
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.load(event.pageIndex + 1);
  }

  applyFilter(e: any): void {
    this.searchFilter = e.target.value.trim();
    this.load(1);
  }

  filterByStatus(status: string): void {
    this.statusFilter = status;
    this.load(1);
  }

  /**
   * View customer details
   */
  viewDetails(customer: any): void {
    this.dialog.open(CustomerEditDialogComponent, {
      width: '700px',
      data: { ...customer, readOnly: true }
    });
  }

  /**
   * Edit customer
   */
  editCustomer(customer: any): void {
    const dialogRef = this.dialog.open(CustomerEditDialogComponent, {
      width: '600px',
      data: { ...customer }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.load(1);
      }
    });
  }

  /**
   * Toggle customer status (Active/Blocked)
   */
  toggleStatus(customer: any): void {
    const newStatus = !customer.isActive;
    const action = newStatus ? 'Activate' : 'Block';
    
    if (!confirm(`Are you sure you want to ${action} this customer?`)) {
      return;
    }

    const endpoint = newStatus ? 'unblock' : 'block';
    this.api.blockUnblockCustomer(customer._id, endpoint).subscribe({
      next: () => {
        console.log(`✅ Customer ${action}d`);
        this.load(1);
      },
      error: (err) => {
        console.error(`❌ Error ${action}ing customer:`, err);
      }
    });
  }

  /**
   * Delete customer (soft delete)
   */
  deleteCustomer(id: string, name: string): void {
    if (confirm(`Are you sure you want to delete customer: ${name}?`)) {
      this.isLoading = true;
      this.api.deleteCustomer(id).subscribe({
        next: () => {
          console.log('✅ Customer deleted');
          this.load(1);
        },
        error: (err) => {
          console.error('❌ Error deleting customer:', err);
          this.isLoading = false;
        }
      });
    }
  }

  /**
   * View customer's posts
   */
  viewCustomerPosts(customer: any): void {
    this.router.navigate(['/admin/users/customers', customer._id, 'posts']);
  }

  /**
   * View engagement metrics
   */
  viewEngagement(customer: any): void {
    this.api.getCustomerEngagement(customer._id).subscribe({
      next: (res: any) => {
        const engagement = res?.data || {};
        alert(`📊 Engagement Metrics for ${customer.fullName}
        
Total Posts: ${engagement.totalPosts}
Total Likes: ${engagement.totalLikes}
Total Comments: ${engagement.totalComments}
Total Shares: ${engagement.totalShares}
Total Views: ${engagement.totalViews}`);
      },
      error: (err) => {
        console.error('❌ Error loading engagement:', err);
      }
    });
  }

  /**
   * Reset customer password
   */
  resetPassword(customer: any): void {
    const newPassword = prompt(`Enter new password for ${customer.fullName}:`);
    
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    this.api.resetCustomerPassword(customer._id, newPassword).subscribe({
      next: () => {
        alert('✅ Password reset successfully');
      },
      error: (err) => {
        alert('❌ Error resetting password');
        console.error(err);
      }
    });
  }

  /**
   * Navigate to post details
   */
  navigateToPost(postId: string, e: Event): void {
    e.stopPropagation();
    this.router.navigate(['/posts', postId]);
  }

  /**
   * Export customers to CSV
   */
  exportCustomers(): void {
    const csvContent = this.generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  /**
   * Generate CSV export
   */
  private generateCSV(): string {
    const headers = [
      'Name', 'Email', 'Phone', 'Orders', 'Total Spent', 'Joined', 
      'Posts', 'Likes', 'Comments', 'Shares', 'Status'
    ];
    
    const rows = this.dataSource.data.map(c => [
      c.fullName || '-',
      c.email,
      c.phone || '-',
      c.totalOrders || 0,
      c.totalSpent || 0,
      c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-',
      c.posts?.length || 0,
      c.totalLikes || 0,
      c.totalComments || 0,
      c.totalShares || 0,
      c.isActive ? 'Active' : 'Blocked'
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    return csv;
  }
}

