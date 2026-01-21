import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminApiService } from '../../services/admin-api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryDialogComponent } from './inventory-dialog.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatTabsModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private destroy$ = new Subject<void>();
  
  displayedColumns = ['sku', 'product', 'quantity', 'warehouse', 'reorderLevel', 'lastUpdated', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  isLoading = false;
  inventoryStats: any = {};

  constructor(
    private api: AdminApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadInventoryStats();
    this.loadInventory();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadInventoryStats(): void {
    this.api.get('/inventory/stats')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('Inventory stats loaded:', response);
          this.inventoryStats = response?.data || {
            totalItems: 0,
            lowStock: 0,
            outOfStock: 0,
            totalValue: 0
          };
        },
        error: (err) => {
          console.error('Failed to load inventory stats:', err);
          this.inventoryStats = {
            totalItems: 0,
            lowStock: 0,
            outOfStock: 0,
            totalValue: 0
          };
        }
      });
  }

  loadInventory(): void {
    this.isLoading = true;
    this.api.get('/inventory')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('Inventory loaded:', response);
          this.dataSource.data = response?.data || [];
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load inventory:', err);
          this.dataSource.data = [];
          this.isLoading = false;
          this.snackBar.open('Failed to load inventory', 'Close', { duration: 3000 });
        }
      });
  }

  applyFilter(event: any): void {
    this.dataSource.filter = event.target.value.trim().toLowerCase();
  }

  openInventoryDialog(item?: any): void {
    const dialogRef = this.dialog.open(InventoryDialogComponent, {
      width: '600px',
      data: item || null,
      disableClose: false
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          if (item) {
            this.updateInventory(item._id, result);
          } else {
            this.createInventory(result);
          }
        }
      });
  }

  createInventory(formData: any): void {
    this.isLoading = true;
    this.api.post('/inventory', formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.snackBar.open('Inventory item created successfully', 'Close', { duration: 3000 });
          this.loadInventory();
          this.loadInventoryStats();
        },
        error: (err) => {
          console.error('Error creating inventory item:', err);
          this.isLoading = false;
          this.snackBar.open(err.error?.message || 'Failed to create inventory item', 'Close', { duration: 3000 });
        }
      });
  }

  updateInventory(id: string, formData: any): void {
    this.isLoading = true;
    this.api.put(`/inventory/${id}`, formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.snackBar.open('Inventory item updated successfully', 'Close', { duration: 3000 });
          this.loadInventory();
          this.loadInventoryStats();
        },
        error: (err) => {
          console.error('Error updating inventory item:', err);
          this.isLoading = false;
          this.snackBar.open(err.error?.message || 'Failed to update inventory item', 'Close', { duration: 3000 });
        }
      });
  }

  deleteInventory(id: string): void {
    if (confirm('Delete this inventory item? This action cannot be undone.')) {
      this.isLoading = true;
      this.api.delete(`/inventory/${id}`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Inventory item deleted successfully', 'Close', { duration: 3000 });
            this.loadInventory();
            this.loadInventoryStats();
          },
          error: (err) => {
            console.error('Failed to delete inventory item:', err);
            this.isLoading = false;
            this.snackBar.open(err.error?.message || 'Failed to delete inventory item', 'Close', { duration: 3000 });
          }
        });
    }
  }

  refreshInventory(): void {
    this.loadInventoryStats();
    this.loadInventory();
  }
}
