import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-detail',
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
    <div class="product-detail-container">
      <mat-card *ngIf="!isLoading; else loading">
        <mat-card-header>
          <mat-card-title>Product Details</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="productForm" (ngSubmit)="onUpdate()">
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Product Name</mat-label>
                <input matInput formControlName="name" required />
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
                <mat-label>Price</mat-label>
                <input matInput formControlName="price" type="number" step="0.01" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Discount (%)</mat-label>
                <input matInput formControlName="discount" type="number" min="0" max="100" />
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit">Update</button>
              <button mat-button type="button" (click)="onDelete()">Delete</button>
              <button mat-button type="button" (click)="onCancel()">Cancel</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <ng-template #loading>
        <mat-spinner></mat-spinner>
      </ng-template>
    </div>
  `,
  styles: [`
    .product-detail-container {
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
export class ProductDetailComponent implements OnInit, OnDestroy {
  productForm!: FormGroup;
  productId: string = '';
  isLoading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: AdminProductService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id') || '';
    this.initializeForm();
    this.loadProduct();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: ['', Validators.required],
      discount: [0]
    });
  }

  private loadProduct(): void {
    this.productService.getProductById(this.productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const product = response.data;
          this.productForm.patchValue({
            name: product.name,
            description: product.description,
            price: product.price,
            discount: product.discount || 0
          });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading product:', error);
          this.snackBar.open('Error loading product', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  onUpdate(): void {
    if (this.productForm.invalid) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.productService.updateProduct(this.productId, this.productForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.snackBar.open('Product updated successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error updating product:', error);
          this.snackBar.open('Error updating product', 'Close', { duration: 3000 });
        }
      });
  }

  onDelete(): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(this.productId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Product deleted successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/admin/products']);
          },
          error: (error) => {
            console.error('Error deleting product:', error);
            this.snackBar.open('Error deleting product', 'Close', { duration: 3000 });
          }
        });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/products']);
  }
}
