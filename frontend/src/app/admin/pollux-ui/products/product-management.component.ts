import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AdminApiService } from '../../services/admin-api.service';

interface Product {
  _id: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  salePrice?: number;
  stock: number;
  category: any;
  brand?: any;
  images: string[];
  status: 'active' | 'inactive' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}

interface Category {
  _id: string;
  name: string;
}

interface Brand {
  _id: string;
  name: string;
}

@Component({
  selector: 'app-product-management',
  templateUrl: './product-management.component.html',
  styleUrls: ['../pollux-ui.scss', '../forms/pollux-form-controls.scss']
})
export class ProductManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data properties
  products: Product[] = [];
  categories: Category[] = [];
  brands: Brand[] = [];
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalProducts = 0;
  pageSize = 10;
  
  // Filters and search
  searchQuery = '';
  selectedCategory = '';
  selectedStatus = '';
  sortField = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  // Selection
  selectAll = false;
  selectedProducts: string[] = [];
  
  // Modal and form
  showProductModal = false;
  isEditMode = false;
  productForm!: FormGroup;
  selectedImages: any[] = [];
  isDragOver = false;
  
  // Loading states
  isLoading = false;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private adminApiService: AdminApiService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
    this.loadBrands();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      sku: ['', [Validators.required]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      salePrice: [0, [Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      category: ['', [Validators.required]],
      brand: [''],
      status: ['active', [Validators.required]]
    });
  }

  // Data loading methods
  loadProducts(): void {
    this.isLoading = true;

    const params = {
      page: this.currentPage,
      limit: this.pageSize,
      category: this.selectedCategory,
      status: this.selectedStatus,
      search: this.searchQuery
    };

    this.adminApiService.getProducts(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.products = response.data.products || [];
          this.totalProducts = response.data.pagination.totalProducts || 0;
          this.totalPages = response.data.pagination.totalPages || 1;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.isLoading = false;
          // Show error message to user instead of mock data
          this.products = [];
          this.totalProducts = 0;
          this.totalPages = 0;
        }
      });
  }

  // NO MOCK DATA - All products come from database only

  loadCategories(): void {
    this.adminApiService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          this.categories = [];
        }
      });
  }

  loadBrands(): void {
    this.adminApiService.getBrands()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (brands) => {
          this.brands = brands;
        },
        error: (error) => {
          console.error('Error loading brands:', error);
          this.brands = [];
        }
      });
  }

  // Search and filter methods
  searchProducts(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  filterByCategory(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  filterByStatus(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedStatus = '';
    this.currentPage = 1;
    this.loadProducts();
  }

  // Sorting methods
  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.loadProducts();
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) return '';
    return this.sortDirection === 'asc' ? 'typcn-arrow-up' : 'typcn-arrow-down';
  }

  // Selection methods
  toggleSelectAll(): void {
    if (this.selectAll) {
      this.selectedProducts = this.products.map(p => p._id);
    } else {
      this.selectedProducts = [];
    }
  }

  toggleProductSelection(productId: string): void {
    const index = this.selectedProducts.indexOf(productId);
    if (index > -1) {
      this.selectedProducts.splice(index, 1);
    } else {
      this.selectedProducts.push(productId);
    }
    
    this.selectAll = this.selectedProducts.length === this.products.length;
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalProducts);
  }

  // Modal methods
  openProductModal(product?: Product): void {
    this.showProductModal = true;
    this.isEditMode = !!product;
    this.selectedImages = [];
    
    if (product) {
      this.productForm.patchValue({
        name: product.name,
        sku: product.sku,
        description: product.description,
        price: product.price,
        salePrice: product.salePrice,
        stock: product.stock,
        category: product.category?._id,
        brand: product.brand?._id,
        status: product.status
      });
    } else {
      this.productForm.reset();
      this.productForm.patchValue({ status: 'active' });
    }
  }

  closeProductModal(): void {
    this.showProductModal = false;
    this.isEditMode = false;
    this.productForm.reset();
    this.selectedImages = [];
  }

  // Product CRUD operations
  saveProduct(): void {
    if (this.productForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSaving = true;
    const formData = new FormData();
    
    // Add form fields
    Object.keys(this.productForm.value).forEach(key => {
      if (this.productForm.value[key] !== null && this.productForm.value[key] !== '') {
        formData.append(key, this.productForm.value[key]);
      }
    });
    
    // Add images
    this.selectedImages.forEach((image) => {
      if (image.file) {
        formData.append('images', image.file);
      }
    });

    const operation = this.isEditMode 
      ? this.adminApiService.updateProduct('current-product-id', formData)
      : this.adminApiService.createProduct(formData);

    operation.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.closeProductModal();
          this.loadProducts();
          // Show success message
        },
        error: (error) => {
          console.error('Error saving product:', error);
          this.isSaving = false;
          // Show error message
        }
      });
  }

  editProduct(product: Product): void {
    this.openProductModal(product);
  }

  viewProduct(product: Product): void {
    // Implement view product logic
    console.log('Viewing product:', product);
  }

  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.adminApiService.deleteProduct(product._id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadProducts();
            // Show success message
          },
          error: (error) => {
            console.error('Error deleting product:', error);
            // Show error message
          }
        });
    }
  }

  // Bulk operations
  bulkActivate(): void {
    // Implement bulk activate
    console.log('Bulk activating:', this.selectedProducts);
  }

  bulkDeactivate(): void {
    // Implement bulk deactivate
    console.log('Bulk deactivating:', this.selectedProducts);
  }

  bulkDelete(): void {
    if (confirm(`Are you sure you want to delete ${this.selectedProducts.length} products?`)) {
      // Implement bulk delete
      console.log('Bulk deleting:', this.selectedProducts);
    }
  }

  // File handling methods
  onFileSelect(event: any): void {
    const files = event.target.files;
    this.processFiles(files);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files) {
      this.processFiles(files);
    }
  }

  private processFiles(files: FileList): void {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.selectedImages.push({
            file: file,
            preview: e.target?.result
          });
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
  }

  // Utility methods
  trackByProductId(_index: number, product: Product): string {
    return product._id;
  }

  getProductImage(product: Product): string {
    return product.images && product.images.length > 0 
      ? product.images[0] 
      : '/assets/images/placeholder-product.jpg';
  }

  onImageError(event: any): void {
    event.target.src = '/assets/images/placeholder-product.jpg';
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'badge-danger';
    if (stock < 10) return 'badge-warning';
    return 'badge-success';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'badge-success';
      case 'inactive': return 'badge-secondary';
      case 'draft': return 'badge-warning';
      default: return 'badge-light';
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private markFormGroupTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      control?.markAsTouched();
    });
  }
}
