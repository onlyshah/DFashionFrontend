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
import { SupplierDialogComponent } from './supplier-dialog.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-suppliers',
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
    SupplierDialogComponent
  ],
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.scss']
})
export class SuppliersComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  private destroy$ = new Subject<void>();
  
  displayedColumns = ['name', 'contact', 'email', 'phone', 'city', 'category', 'actions'];
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
    this.api.get('/inventory/suppliers').pipe(takeUntil(this.destroy$)).subscribe({
      next: (r: any) => {
        this.dataSource.data = r?.data || [];
        this.isLoading = false;
      },
      error: () => {
        this.dataSource.data = [];
        this.isLoading = false;
        this.snackBar.open('Failed to load suppliers', 'Close', { duration: 3000 });
      }
    });
  }

  openSupplierDialog(supplier?: any): void {
    const dialogRef = this.dialog.open(SupplierDialogComponent, {
      width: '600px',
      data: supplier || null
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
        supplier ? this.updateSupplier(supplier._id, result) : this.createSupplier(result);
      }
    });
  }

  createSupplier(formData: any): void {
    this.isLoading = true;
    this.api.post('/inventory/suppliers', formData).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.snackBar.open('Supplier created successfully', 'Close', { duration: 3000 });
        this.load();
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(error.error?.message || 'Failed to create supplier', 'Close', { duration: 3000 });
      }
    });
  }

  editSupplier(supplier: any): void {
    const dialogRef = this.dialog.open(SupplierDialogComponent, {
      width: '600px',
      data: supplier
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
        this.updateSupplier(supplier._id, result);
      }
    });
  }

  updateSupplier(id: string, formData: any): void {
    this.isLoading = true;
    this.api.put(`/inventory/suppliers/${id}`, formData).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.snackBar.open('Supplier updated successfully', 'Close', { duration: 3000 });
        this.load();
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(error.error?.message || 'Failed to update supplier', 'Close', { duration: 3000 });
      }
    });
  }

  delete(id: string): void {
    const confirmed = window.confirm('Are you sure you want to delete this supplier?');
    if (!confirmed) return;

    this.isLoading = true;
    this.api.delete(`/inventory/suppliers/${id}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.snackBar.open('Supplier deleted successfully', 'Close', { duration: 3000 });
        this.load();
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(error.error?.message || 'Failed to delete supplier', 'Close', { duration: 3000 });
      }
    });
  }

  applyFilter(e: any): void {
    this.dataSource.filter = e.target.value.trim().toLowerCase();
  }
}
