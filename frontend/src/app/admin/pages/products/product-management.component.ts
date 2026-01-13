import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { AdminProductService, Product, AdminProductResponse } from '../../services/product.service';
import { ProductDialogComponent } from './product-dialog.component';

@Component({
    selector: 'app-product-management',
    styleUrls: ['./product-management.component.scss'],
    standalone: false,
    templateUrl: './product-management.component.html'
})
export class ProductManagementComponent implements OnInit, OnDestroy {
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    currentPage = 1;
    currentLimit = 10;
    currentSortBy = '';
    currentSortOrder: 'asc' | 'desc' = 'desc';

    private destroy$ = new Subject<void>();

    displayedColumns: string[] = ['product', 'category', 'price', 'status', 'actions'];
    dataSource = new MatTableDataSource<Product>([]);
    isLoading = false;
    totalProducts = 0;

    // Filters
    searchControl = new FormControl('');
    categoryFilter = new FormControl('');
    statusFilter = new FormControl('');

    categories = [
        { value: '', label: 'All Categories' }
        // Will be populated from API
    ];

    statuses = [
        { value: '', label: 'All Statuses' },
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
    ];

    constructor(
        private productService: AdminProductService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadCategories();
        this.setupFilters();
        this.loadProducts();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    setupFilters(): void {
        this.searchControl.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.loadProducts();
        });

        [this.categoryFilter, this.statusFilter].forEach(control => {
            control.valueChanges.pipe(
                takeUntil(this.destroy$)
            ).subscribe(() => {
                this.loadProducts();
            });
        });
    }

    /**
     * Load categories from database
     */
    private loadCategories(): void {
        this.productService.getCategoriesWithFallback()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (categories: any[]) => {
                    // Transform categories to dropdown format
                    this.categories = [
                        { value: '', label: 'All Categories' },
                        ...categories.map(cat => ({
                            value: cat.slug || cat._id,
                            label: cat.name
                        }))
                    ];
                },
                error: (error: any) => {
                    console.error('Error loading categories:', error);
                    // Keep default categories on error
                    this.categories = [
                        { value: '', label: 'All Categories' },
                        { value: 'men', label: 'Men' },
                        { value: 'women', label: 'Women' },
                        { value: 'children', label: 'Children' }
                    ];
                }
            });
    }

    loadProducts(override?: { page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }): void {
        this.isLoading = true;

        const page = override?.page ?? this.currentPage;
        const limit = override?.limit ?? this.currentLimit;
        const sortBy = override?.sortBy ?? this.currentSortBy;
        const sortOrder: 'asc' | 'desc' = override?.sortOrder ?? this.currentSortOrder;

        const filters = {
            search: this.searchControl.value || '',
            category: this.categoryFilter.value || '',
            status: this.statusFilter.value || '',
            page,
            limit,
            sortBy,
            sortOrder
        };

        this.productService.getProductsWithFallback(filters).subscribe({
            next: (response: AdminProductResponse) => {
                console.log('Products loaded:', response);
                if (response.success) {
                    this.dataSource.data = response.data.products;
                    this.totalProducts = response.data.pagination.totalProducts;
                } else {
                    this.dataSource.data = [];
                    this.totalProducts = 0;
                    this.snackBar.open('Failed to load products', 'Close', { duration: 3000 });
                }
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading products:', error);
                this.dataSource.data = [];
                this.totalProducts = 0;
                this.isLoading = false;
                this.snackBar.open('Error loading products', 'Close', { duration: 3000 });
            }
        });
    }

    onPageChange(event: any): void {
        const page = (event && event.pageIndex != null) ? event.pageIndex + 1 : 1;
        const limit = (event && event.pageSize) ? event.pageSize : this.currentLimit;
        this.currentPage = page;
        this.currentLimit = limit;
        this.loadProducts({ page, limit });
    }

    onSortChange(event?: any): void {
        if (event && event.active) {
            this.currentSortBy = event.active;
            this.currentSortOrder = event.direction || 'desc';
        }
        this.loadProducts({ sortBy: this.currentSortBy, sortOrder: this.currentSortOrder });
    }

    openProductDialog(product?: Product): void {
        const dialogRef = this.dialog.open(ProductDialogComponent, {
            width: '800px',
            data: product ? { ...product } : null
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadProducts();
            }
        });
    }

    toggleProductStatus(product: Product): void {
        const newStatus = !product.isActive;

        this.productService.updateProductStatus(product._id!, newStatus).subscribe({
            next: (response: { success: boolean; message: string; data: Product }) => {
                console.log('Product status updated:', response);
                if (response.success) {
                    product.isActive = newStatus;
                    this.snackBar.open(response.message, 'Close', { duration: 3000 });
                } else {
                    this.snackBar.open('Failed to update product status', 'Close', { duration: 3000 });
                }
            },
            error: (error: any) => {
                console.error('Error updating product status:', error);
                this.snackBar.open('Error updating product status', 'Close', { duration: 3000 });
            }
        });
    }

    deleteProduct(product: Product): void {
        if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
            this.productService.deleteProduct(product._id!).subscribe({
                next: (response: { success: boolean; message: string }) => {
                    if (response.success) {
                        this.snackBar.open(response.message, 'Close', { duration: 3000 });
                        this.loadProducts();
                    } else {
                        this.snackBar.open('Failed to delete product', 'Close', { duration: 3000 });
                    }
                },
                error: (error: any) => {
                    console.error('Error deleting product:', error);
                    this.snackBar.open('Error deleting product', 'Close', { duration: 3000 });
                }
            });
        }
    }

    getProductImage(product: Product): string {
        return product.images?.[0]?.url || '/uploadsplaceholder-product.jpg';
    }

    getStatusColor(product: Product): string {
        return product.isActive ? '#4caf50' : '#f44336';
    }

    getStatusText(product: Product): string {
        return product.isActive ? 'Active' : 'Inactive';
    }
}
