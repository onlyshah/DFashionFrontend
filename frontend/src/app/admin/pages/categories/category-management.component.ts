import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AdminApiService } from '../../services/admin-api.service';

interface Category {
  id?: number;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  is_active?: boolean;
  sort_order?: number;
  sub_categories?: SubCategory[];
  subCategoryCount?: number;
}

interface SubCategory {
  id?: number;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  is_active?: boolean;
  sort_order?: number;
}

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.scss']
})
export class CategoryManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data properties
  categories: Category[] = [];
  selectedCategory: Category | null = null;
  subCategories: SubCategory[] = [];

  // Modal and form states
  showCategoryModal = false;
  showSubCategoryModal = false;
  isEditingCategory = false;
  isEditingSubCategory = false;
  
  categoryForm!: FormGroup;
  subCategoryForm!: FormGroup;

  // Loading states
  isLoadingCategories = false;
  isLoadingSubCategories = false;
  isSaving = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;

  constructor(
    private fb: FormBuilder,
    private adminApiService: AdminApiService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      slug: [''],
      description: [''],
      image: [''],
      is_active: [true],
      sort_order: [0]
    });

    this.subCategoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      slug: [''],
      description: [''],
      image: [''],
      is_active: [true],
      sort_order: [0]
    });
  }

  // ==================== CATEGORY METHODS ====================

  loadCategories(): void {
    this.isLoadingCategories = true;
    this.adminApiService.getAdminCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const data = response.data || response.categories || response || [];
          this.categories = Array.isArray(data) ? data : [];
          this.isLoadingCategories = false;
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          this.isLoadingCategories = false;
        }
      });
  }

  openCategoryModal(category?: Category): void {
    this.isEditingCategory = !!category;
    this.showCategoryModal = true;

    if (category) {
      this.categoryForm.patchValue({
        name: category.name,
        slug: category.slug || '',
        description: category.description || '',
        image: category.image || '',
        is_active: category.is_active !== false,
        sort_order: category.sort_order || 0
      });
    } else {
      this.categoryForm.reset({ is_active: true, sort_order: 0 });
    }
  }

  closeCategoryModal(): void {
    this.showCategoryModal = false;
    this.isEditingCategory = false;
    this.categoryForm.reset();
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) {
      this.markFormTouched(this.categoryForm);
      return;
    }

    this.isSaving = true;
    const formData = this.categoryForm.value;

    const request = this.isEditingCategory && this.selectedCategory?.id
      ? this.adminApiService.updateCategory(String(this.selectedCategory.id), formData)
      : this.adminApiService.createCategory(formData);

    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.isSaving = false;
        this.closeCategoryModal();
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error saving category:', error);
        this.isSaving = false;
      }
    });
  }

  editCategory(category: Category): void {
    this.selectedCategory = category;
    this.openCategoryModal(category);
    this.loadSubCategories(category.id!);
  }

  deleteCategory(category: Category): void {
    if (confirm(`Delete category "${category.name}" and all its sub-categories?`)) {
      this.adminApiService.deleteCategory(String(category.id!))
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.loadCategories(),
          error: (error) => console.error('Error deleting category:', error)
        });
    }
  }

  // ==================== SUB-CATEGORY METHODS ====================

  loadSubCategories(categoryId: number): void {
    if (!categoryId) return;

    this.isLoadingSubCategories = true;
    this.adminApiService.getSubCategories(categoryId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const data = response.data || response.subCategories || response || [];
          this.subCategories = Array.isArray(data) ? data : [];
          this.isLoadingSubCategories = false;
        },
        error: (error) => {
          console.error('Error loading sub-categories:', error);
          this.isLoadingSubCategories = false;
        }
      });
  }

  openSubCategoryModal(subCategory?: SubCategory): void {
    if (!this.selectedCategory?.id) {
      alert('Please select a category first');
      return;
    }

    this.isEditingSubCategory = !!subCategory;
    this.showSubCategoryModal = true;

    if (subCategory) {
      this.subCategoryForm.patchValue({
        name: subCategory.name,
        slug: subCategory.slug || '',
        description: subCategory.description || '',
        image: subCategory.image || '',
        is_active: subCategory.is_active !== false,
        sort_order: subCategory.sort_order || 0
      });
    } else {
      this.subCategoryForm.reset({ is_active: true, sort_order: 0 });
    }
  }

  closeSubCategoryModal(): void {
    this.showSubCategoryModal = false;
    this.isEditingSubCategory = false;
    this.subCategoryForm.reset();
  }

  saveSubCategory(): void {
    if (!this.selectedCategory?.id) return;
    if (this.subCategoryForm.invalid) {
      this.markFormTouched(this.subCategoryForm);
      return;
    }

    this.isSaving = true;
    const formData = this.subCategoryForm.value;

    const categoryId = this.selectedCategory.id;
    const request = this.isEditingSubCategory && this.subCategories.length > 0
      ? this.adminApiService.updateSubCategory(categoryId, this.subCategories[0]?.id || 0, formData)
      : this.adminApiService.createSubCategory(categoryId, formData);

    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.isSaving = false;
        this.closeSubCategoryModal();
        this.loadSubCategories(categoryId);
      },
      error: (error) => {
        console.error('Error saving sub-category:', error);
        this.isSaving = false;
      }
    });
  }

  deleteSubCategory(subCategory: SubCategory): void {
    if (!this.selectedCategory?.id) return;
    if (confirm(`Delete sub-category "${subCategory.name}"?`)) {
      this.adminApiService.deleteSubCategory(this.selectedCategory.id, subCategory.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.loadSubCategories(this.selectedCategory!.id!),
          error: (error) => console.error('Error deleting sub-category:', error)
        });
    }
  }

  // ==================== UTILITY METHODS ====================

  selectCategory(category: Category): void {
    this.selectedCategory = category;
    this.loadSubCategories(category.id!);
  }

  private markFormTouched(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      form.get(key)?.markAsTouched();
    });
  }

  getStatusBadgeClass(isActive: boolean | undefined): string {
    return isActive !== false ? 'badge-success' : 'badge-danger';
  }

  getStatusText(isActive: boolean | undefined): string {
    return isActive !== false ? 'Active' : 'Inactive';
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  trackByCategoryId(_index: number, item: Category): number {
    return item.id || _index;
  }

  trackBySubCategoryId(_index: number, item: SubCategory): number {
    return item.id || _index;
  }
}

