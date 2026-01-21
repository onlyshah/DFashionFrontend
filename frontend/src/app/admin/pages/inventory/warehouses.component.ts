import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminApiService } from '../../services/admin-api.service';
import { WarehouseDialogComponent } from './warehouse-dialog.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-warehouses',
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
    MatDialogModule,
    MatSnackBarModule,
    WarehouseDialogComponent
  ],
  templateUrl: './warehouses.component.html',
  styleUrls: ['./warehouses.component.scss']
})
export class WarehousesComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  private destroy$ = new Subject<void>();
  
  displayedColumns = ['name', 'city', 'state', 'capacity', 'manager', 'type', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  isLoading = false;

  constructor(
    private api: AdminApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.load();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.isLoading = true;
    this.api.get('/inventory/warehouses').pipe(takeUntil(this.destroy$)).subscribe({
      next: (r: any) => {
        this.dataSource.data = r?.data || [];
        this.isLoading = false;
      },
      error: () => {
        this.dataSource.data = [];
        this.isLoading = false;
        this.snackBar.open('Failed to load warehouses', 'Close', { duration: 3000 });
      }
    });
  }

  openWarehouseDialog(warehouse?: any): void {
    const dialogRef = this.dialog.open(WarehouseDialogComponent, {
      width: '600px',
      data: warehouse || null
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
        warehouse ? this.updateWarehouse(warehouse._id, result) : this.createWarehouse(result);
      }
    });
  }

  createWarehouse(formData: any): void {
    this.isLoading = true;
    this.api.post('/inventory/warehouses', formData).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.snackBar.open('Warehouse created successfully', 'Close', { duration: 3000 });
        this.load();
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(error.error?.message || 'Failed to create warehouse', 'Close', { duration: 3000 });
      }
    });
  }

  editWarehouse(warehouse: any): void {
    const dialogRef = this.dialog.open(WarehouseDialogComponent, {
      width: '600px',
      data: warehouse
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
        this.updateWarehouse(warehouse._id, result);
      }
    });
  }

  updateWarehouse(id: string, formData: any): void {
    this.isLoading = true;
    this.api.put(`/inventory/warehouses/${id}`, formData).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.snackBar.open('Warehouse updated successfully', 'Close', { duration: 3000 });
        this.load();
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(error.error?.message || 'Failed to update warehouse', 'Close', { duration: 3000 });
      }
    });
  }

  delete(id: string): void {
    const confirmed = window.confirm('Are you sure you want to delete this warehouse?');
    if (!confirmed) return;

    this.isLoading = true;
    this.api.delete(`/inventory/warehouses/${id}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.snackBar.open('Warehouse deleted successfully', 'Close', { duration: 3000 });
        this.load();
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(error.error?.message || 'Failed to delete warehouse', 'Close', { duration: 3000 });
      }
    });
  }

  applyFilter(e: any): void {
    this.dataSource.filter = e.target.value.trim().toLowerCase();
  }
}
