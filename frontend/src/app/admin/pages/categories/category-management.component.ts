import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AdminApiService, Category as ApiCategory } from '../../services/admin-api.service';

interface ExtendedCategory extends Omit<ApiCategory, 'parent'> {
  description?: string;
  productCount?: number;
  parent?: ExtendedCategory;
  status: string;
}

type Category = ExtendedCategory;

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.scss']
})
export class CategoryManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data properties
  categories: Category[] = [];
  parentCategories: Category[] = [];
  
  // Modal and form
  showCategoryModal = false;
  isEditMode = false;
  categoryForm!: FormGroup;
  currentCategoryId: string | null = null;
  
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
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      parent: [''],
      status: ['active', [Validators.required]]
    });
  }

  // Data loading methods
  loadCategories(): void {
    this.isLoading = true;

    // Load real categories from database
    this.adminApiService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          // Transform API categories to ExtendedCategory
          const transformedCategories = categories.map(cat => ({
            ...cat,
            parent: cat.parent ? categories.find(p => p._id === cat.parent) : undefined
          })) as ExtendedCategory[];

          this.categories = transformedCategories;
          this.parentCategories = transformedCategories.filter(cat => !cat.parent);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          this.isLoading = false;
          // Show error message instead of mock data
          this.categories = [];
          this.parentCategories = [];
        }
      });
  }

  // NO MOCK DATA - All categories come from database only

  // Modal methods
  openCategoryModal(category?: Category): void {
    this.showCategoryModal = true;
    this.isEditMode = !!category;
    this.currentCategoryId = category?._id || null;
    
    if (category) {
      this.categoryForm.patchValue({
        name: category.name,
        description: category.description,
        parent: category.parent?._id || null,
        status: category.status
      });
    } else {
      this.categoryForm.reset();
      this.categoryForm.patchValue({ status: 'active' });
    }
  }

  closeCategoryModal(): void {
    this.showCategoryModal = false;
    this.isEditMode = false;
    this.currentCategoryId = null;
    this.categoryForm.reset();
  }

  // Category CRUD operations
  saveCategory(): void {
    if (this.categoryForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSaving = true;
    const categoryData = this.categoryForm.value;

    const operation = this.isEditMode
      ? this.adminApiService.updateCategory(this.currentCategoryId!, categoryData)
      : this.adminApiService.createCategory(categoryData);

    operation.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.closeCategoryModal();
          this.loadCategories();
          console.log('Category saved successfully');
        },
        error: (error) => {
          console.error('Error saving category:', error);
          this.isSaving = false;
          // Show error message to user
        }
      });
  }

  editCategory(category: Category): void {
    this.openCategoryModal(category);
  }

  deleteCategory(category: Category): void {
    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
      this.adminApiService.deleteCategory(category._id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadCategories();
            console.log('Category deleted successfully');
          },
          error: (error) => {
            console.error('Error deleting category:', error);
            // Show error message to user
          }
        });
    }
  }

  // Utility methods
  trackByCategoryId(_index: number, category: Category): string {
    return category._id;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'badge-success';
      case 'inactive': return 'badge-secondary';
      default: return 'badge-light';
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.categoryForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private markFormGroupTouched(): void {
    Object.keys(this.categoryForm.controls).forEach(key => {
      const control = this.categoryForm.get(key);
      control?.markAsTouched();
    });
  }
}
