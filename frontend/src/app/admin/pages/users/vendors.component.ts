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
import { VendorEditDialogComponent } from './dialogs/vendor-edit.dialog';

@Component({
  selector: 'app-vendors-management',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatProgressSpinnerModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatTooltipModule, 
    MatChipsModule, MatDialogModule, MatSelectModule, MatSlideToggleModule, FormsModule
  ],
  templateUrl: './vendors.component.html',
  styleUrls: ['./vendors.component.scss']
})
export class VendorsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['storeName', 'owner', 'email', 'products', 'totalSales', 'rating', 'verified', 'status', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  isLoading = false;
  searchFilter = '';
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  totalVendors = 0;

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
    this.api.getVendors(page, this.pageSize).subscribe({
      next: (res: any) => {
        console.log('✅ Vendors loaded:', res);
        this.dataSource.data = res?.data?.users || res?.data || [];
        this.totalVendors = res?.data?.total || res?.data?.length || 0;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error loading vendors:', err);
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

  editVendor(vendor: any): void {
    const dialogRef = this.dialog.open(VendorEditDialogComponent, {
      width: '700px',
      data: { ...vendor }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.load(1);
      }
    });
  }

  viewDetails(vendor: any): void {
    this.dialog.open(VendorEditDialogComponent, {
      width: '800px',
      data: { ...vendor, readOnly: true }
    });
  }

  approveVendor(id: string): void {
    if (confirm('Approve this vendor?')) {
      this.api.approveVendor(id).subscribe({
        next: () => {
          console.log('✅ Vendor approved');
          this.load(1);
        },
        error: (err) => {
          console.error('❌ Error approving vendor:', err);
        }
      });
    }
  }

  rejectVendor(id: string): void {
    if (confirm('Reject this vendor?')) {
      this.api.rejectVendor(id).subscribe({
        next: () => {
          console.log('✅ Vendor rejected');
          this.load(1);
        },
        error: (err) => {
          console.error('❌ Error rejecting vendor:', err);
        }
      });
    }
  }

  deleteVendor(id: string, name: string): void {
    if (confirm(`Are you sure you want to delete vendor: ${name}?`)) {
      this.isLoading = true;
      this.api.deleteUser(id).subscribe({
        next: () => {
          console.log('✅ Vendor deleted');
          this.load(1);
        },
        error: (err) => {
          console.error('❌ Error deleting vendor:', err);
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

  exportVendors(): void {
    const csvContent = this.generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vendors-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  private generateCSV(): string {
    const headers = ['Store Name', 'Owner', 'Email', 'Products', 'Total Sales', 'Rating', 'Status'];
    const rows = this.dataSource.data.map(v => [
      v.storeName || v.businessName || '-',
      v.owner || v.fullName || '-',
      v.email,
      v.products || 0,
      v.totalSales || 0,
      v.rating || 0,
      v.isActive ? 'Active' : 'Inactive'
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    return csv;
  }
}

