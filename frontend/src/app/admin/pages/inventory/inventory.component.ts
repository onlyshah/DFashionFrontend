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
import { AdminApiService } from '../../services/admin-api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
    MatCardModule
  ],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private destroy$ = new Subject<void>();
  
  displayedColumns = ['sku', 'product', 'quantity', 'warehouse', 'lastUpdated', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  isLoading = false;
  inventoryStats: any = {};

  constructor(private api: AdminApiService) {}

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
          this.dataSource.data = response?.data || [];
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load inventory:', err);
          this.dataSource.data = [];
          this.isLoading = false;
        }
      });
  }

  applyFilter(event: any): void {
    this.dataSource.filter = event.target.value.trim().toLowerCase();
  }

  editInventory(id: string): void {
    console.log('Edit inventory item:', id);
    // TODO: Implement edit functionality
  }

  deleteInventory(id: string): void {
    if (confirm('Delete this inventory item?')) {
      this.api.delete(`/inventory/${id}`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadInventory();
          },
          error: (err) => {
            console.error('Failed to delete inventory item:', err);
          }
        });
    }
  }

  refreshInventory(): void {
    this.loadInventoryStats();
    this.loadInventory();
  }
}
