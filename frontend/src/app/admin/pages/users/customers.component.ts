import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatProgressSpinnerModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatTooltipModule, 
    MatChipsModule, MatDialogModule, MatSelectModule, MatSlideToggleModule, FormsModule
  ],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['name', 'email', 'phone', 'totalOrders', 'totalSpent', 'createdAt', 'status', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  isLoading = false;
  searchFilter = '';
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  totalCustomers = 0;

  constructor(
    private api: AdminApiService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.load();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  load(page: number = 1): void {
    this.isLoading = true;
    this.api.getCustomers(page, this.pageSize).subscribe({
      next: (res: any) => {
        console.log('✅ Customers loaded:', res);
        this.dataSource.data = res?.data?.users || res?.data || [];
        this.totalCustomers = res?.data?.total || res?.data?.length || 0;
        this.isLoading = false;
      },
      error: (err) => {
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
    this.searchFilter = e.target.value.trim().toLowerCase();
    this.dataSource.filter = this.searchFilter;
  }

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

  viewDetails(customer: any): void {
    this.dialog.open(CustomerEditDialogComponent, {
      width: '700px',
      data: { ...customer, readOnly: true }
    });
  }

  deleteCustomer(id: string, name: string): void {
    if (confirm(`Are you sure you want to delete customer: ${name}?`)) {
      this.isLoading = true;
      this.api.deleteUser(id).subscribe({
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

  toggleStatus(id: string, currentStatus: boolean): void {
    const newStatus = !currentStatus;
    this.api.updateUserStatus(id, newStatus).subscribe({
      next: () => {
        console.log(`✅ Status updated to ${newStatus ? 'Active' : 'Inactive'}`);
        this.load(1);
      },
      error: (err) => {
        console.error('❌ Error updating status:', err);
      }
    });
  }

  exportCustomers(): void {
    // Export to CSV functionality
    const csvContent = this.generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  private generateCSV(): string {
    const headers = ['Username', 'Email', 'Phone', 'Total Orders', 'Total Spent', 'Status', 'Joined'];
    const rows = this.dataSource.data.map(c => [
      c.username,
      c.email,
      c.phone || '-',
      c.totalOrders || 0,
      c.totalSpent || 0,
      c.isActive ? 'Active' : 'Inactive',
      new Date(c.createdAt).toLocaleDateString()
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    return csv;
  }
}

