import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminProductService } from '../../services/product.service';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="product-create-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Create New Product</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Product Name</mat-label>
                <input matInput formControlName="name" required />
                <mat-error *ngIf="productForm.get('name')?.hasError('required')">
                  Product name is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="4"></textarea>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Category</mat-label>
                <mat-select formControlName="categoryId" (selectionChange)="onCategoryChange($event)">
                  <mat-option value="">-- Select Category --</mat-option>
                  <mat-option *ngFor="let cat of categories" [value]="cat.id">
                    {{ cat.name }}
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="productForm.get('categoryId')?.hasError('required')">
                  Category is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Sub-Category</mat-label>
                <mat-select formControlName="subCategoryId" [disabled]="subCategories.length === 0">
                  <mat-option value="">-- Select Sub-Category --</mat-option>
                  <mat-option *ngFor="let subcat of subCategories" [value]="subcat.id">
                    {{ subcat.name }}
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="subCategories.length === 0 && productForm.get('categoryId')?.value">
                  No sub-categories available
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Price</mat-label>
                <input matInput formControlName="price" type="number" step="0.01" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Discount (%)</mat-label>
                <input matInput formControlName="discount" type="number" min="0" max="100" />
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>SKU</mat-label>
                <input matInput formControlName="sku" />
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="isLoading">
                {{ isLoading ? 'Creating...' : 'Create Product' }}
              </button>
              <button mat-button type="button" (click)="onCancel()">Cancel</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .product-create-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .full-width {
      width: 100%;
    }
    
    .half-width {
      width: 50%;
    }
    
    .form-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 24px;
    }
  `]
})
export class ProductCreateComponent implements OnInit, OnDestroy {
  productForm!: FormGroup;
  categories: any[] = [];
  subCategories: any[] = [];
  isLoadingCategories = false;
  isLoadingSubCategories = false;
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private productService: AdminProductService,
    private adminApiService: AdminApiService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      categoryId: ['', [Validators.required]],
      subCategoryId: [''],
      brand: [''],
      price: ['', [Validators.required]],
      discount: [0],
      sku: ['']
    });
  }

  private loadCategories(): void {
    this.isLoadingCategories = true;
    this.adminApiService.getAdminCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success && Array.isArray(response.data)) {
            this.categories = response.data;
            if (this.categories.length === 0) {
              this.snackBar.open('No categories found. Please create categories first.', 'Close', { duration: 5000 });
            }
          } else {
            this.snackBar.open('Failed to load categories', 'Close', { duration: 3000 });
          }
          this.isLoadingCategories = false;
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          this.snackBar.open('Error loading categories', 'Close', { duration: 3000 });
          this.isLoadingCategories = false;
        }
      });
  }

  onCategoryChange(event: any): void {
    const categoryId = event.value;
    this.subCategories = [];
    
    if (!categoryId) {
      this.productForm.get('subCategoryId')?.reset();
      return;
    }

    this.isLoadingSubCategories = true;
    this.adminApiService.getSubCategories(categoryId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success && Array.isArray(response.data)) {
            this.subCategories = response.data;
            if (this.subCategories.length === 0) {
              this.snackBar.open('No sub-categories found for this category', 'Open Categories', { duration: 5000 })
                .onAction().subscribe(() => {
                  this.router.navigate(['/admin/categories']);
                });
            }
          }
          this.isLoadingSubCategories = false;
        },
        error: (error) => {
          console.error('Error loading sub-categories:', error);
          this.snackBar.open('Error loading sub-categories', 'Close', { duration: 3000 });
          this.isLoadingSubCategories = false;
        }
      });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    // Validate sub-category selection if category is selected
    const categoryId = this.productForm.get('categoryId')?.value;
    if (categoryId && this.subCategories.length === 0) {
      this.snackBar.open('Please select a valid category with sub-categories', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    const productData = this.productForm.value;

    this.productService.createProduct(productData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.snackBar.open('Product created successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/admin/products']);
        },
        error: (error) => {
          console.error('Error creating product:', error);
          this.snackBar.open('Error creating product: ' + (error?.message || 'Unknown error'), 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/admin/products']);
  }
}
