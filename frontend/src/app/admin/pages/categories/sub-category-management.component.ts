import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminProductService } from '../../services/product.service';

@Component({
  selector: 'app-sub-category-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatIconModule
  ],
  template: `
    <div class="subcategory-container">
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>{{ editingId ? 'Edit Sub-Category' : 'Create New Sub-Category' }}</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="subCategoryForm" (ngSubmit)="onSubmit()" class="form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Parent Category</mat-label>
              <mat-select formControlName="parentId" required>
                <mat-option *ngFor="let cat of parentCategories" [value]="cat._id || cat.id">
                  {{ cat.name }}
                </mat-option>
              </mat-select>
              <mat-error>Parent category is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Sub-Category Name</mat-label>
              <input matInput formControlName="name" required />
              <mat-error>Name is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Slug</mat-label>
              <input matInput formControlName="slug" />
              <mat-hint>Auto-generated if left empty</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3"></textarea>
            </mat-form-field>

            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="isLoading">
                {{ isLoading ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update' : 'Create') }}
              </button>
              <button mat-button type="button" (click)="onCancel()" *ngIf="editingId">Cancel</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card class="list-card">
        <mat-card-header>
          <mat-card-title>Sub-Categories List</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div *ngIf="subCategories.length > 0; else noData">
            <table mat-table [dataSource]="dataSource" class="categories-table">
              <!-- Parent Category Column -->
              <ng-container matColumnDef="parent">
                <th mat-header-cell *matHeaderCellDef>Parent Category</th>
                <td mat-cell *matCellDef="let element">{{ element.parentName }}</td>
              </ng-container>

              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let element">{{ element.name }}</td>
              </ng-container>

              <!-- Slug Column -->
              <ng-container matColumnDef="slug">
                <th mat-header-cell *matHeaderCellDef>Slug</th>
                <td mat-cell *matCellDef="let element">{{ element.slug }}</td>
              </ng-container>

              <!-- Product Count Column -->
              <ng-container matColumnDef="productCount">
                <th mat-header-cell *matHeaderCellDef>Products</th>
                <td mat-cell *matCellDef="let element">{{ element.productCount || 0 }}</td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let element">
                  <button 
                    mat-icon-button 
                    color="primary"
                    (click)="onEdit(element)"
                    title="Edit"
                  >
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button 
                    mat-icon-button 
                    color="warn"
                    (click)="onDelete(element._id || element.id)"
                    title="Delete"
                  >
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <mat-paginator 
              [length]="totalSubCategories"
              [pageSize]="pageSize"
              [pageSizeOptions]="[10, 20, 50]"
              (page)="onPageChange($event)"
            ></mat-paginator>
          </div>

          <ng-template #noData>
            <p class="no-data">No sub-categories found. Create your first sub-category above.</p>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .subcategory-container {
      padding: 20px;
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 20px;
    }

    @media (max-width: 1200px) {
      .subcategory-container {
        grid-template-columns: 1fr;
      }
    }

    .form-card,
    .list-card {
      height: fit-content;
    }

    .form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 16px;
    }

    .categories-table {
      width: 100%;
    }

    .no-data {
      padding: 32px;
      text-align: center;
      color: #999;
    }
  `]
})
export class SubCategoryManagementComponent implements OnInit, OnDestroy {
  subCategoryForm!: FormGroup;
  subCategories: any[] = [];
  parentCategories: any[] = [];
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns = ['parent', 'name', 'slug', 'productCount', 'actions'];
  
  editingId: string | null = null;
  isLoading = false;
  currentPage = 1;
  pageSize = 10;
  totalSubCategories = 0;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private productService: AdminProductService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadParentCategories();
    this.loadSubCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.subCategoryForm = this.fb.group({
      parentId: ['', Validators.required],
      name: ['', Validators.required],
      slug: [''],
      description: ['']
    });
  }

  private loadParentCategories(): void {
    this.productService.getCategoriesWithFallback()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          const categoriesData = Array.isArray(data) ? data : (data?.data || []);
          // Filter only parent categories (those without parentId)
          this.parentCategories = categoriesData.filter((cat: any) => !cat.parentId);
        },
        error: (error) => {
          console.error('Error loading parent categories:', error);
          this.snackBar.open('Error loading categories', 'Close', { duration: 3000 });
        }
      });
  }

  private loadSubCategories(): void {
    // TODO: Implement backend API call to fetch sub-categories with pagination
    this.subCategories = [];
    this.totalSubCategories = 0;
    this.dataSource.data = this.subCategories;
  }

  onSubmit(): void {
    if (this.subCategoryForm.invalid) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    const formData = this.subCategoryForm.value;

    if (this.editingId) {
      // TODO: Call backend API to update sub-category
      this.snackBar.open('Sub-category updated successfully', 'Close', { duration: 3000 });
    } else {
      // TODO: Call backend API to create sub-category
      this.snackBar.open('Sub-category created successfully', 'Close', { duration: 3000 });
    }

    this.subCategoryForm.reset();
    this.editingId = null;
    this.isLoading = false;
    this.loadSubCategories();
  }

  onEdit(subCategory: any): void {
    this.editingId = subCategory._id || subCategory.id;
    this.subCategoryForm.patchValue({
      parentId: subCategory.parentId,
      name: subCategory.name,
      slug: subCategory.slug,
      description: subCategory.description
    });
  }

  onDelete(subCategoryId: string): void {
    if (confirm('Are you sure you want to delete this sub-category?')) {
      // TODO: Call backend API to delete sub-category
      this.subCategories = this.subCategories.filter(sc => (sc._id || sc.id) !== subCategoryId);
      this.dataSource.data = this.subCategories;
      this.snackBar.open('Sub-category deleted successfully', 'Close', { duration: 3000 });
    }
  }

  onCancel(): void {
    this.subCategoryForm.reset();
    this.editingId = null;
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadSubCategories();
  }
}
