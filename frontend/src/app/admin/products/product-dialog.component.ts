import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminProductService } from '../services/product.service';
import { CategoryService, Category, Subcategory } from '../../core/services/category.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-product-dialog',
    styleUrls: ['./product-dialog.component.scss'],
    standalone: false,
    templateUrl: './product-dialog.component.html'
})
export class ProductDialogComponent implements OnInit, OnDestroy {
    productForm!: FormGroup;
    isEditMode = false;
    isLoading = false;
    isLoadingCategories = false;

    // API data - no hardcoded values
    categories: any[] = [];
    currentSubcategories: Subcategory[] = [];
    
    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<ProductDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private productService: AdminProductService,
        private categoryService: CategoryService,
        private snackBar: MatSnackBar
    ) {
        this.isEditMode = !!data;
    }

    ngOnInit(): void {
        this.createForm();
        this.loadCategories();
        if (this.isEditMode) {
            this.populateForm();
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Load categories from API
     */
    loadCategories(): void {
        console.log('[ProductDialog] Loading categories from CategoryService');
        this.isLoadingCategories = true;
        this.categoryService.getAllCategories()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (apiCategories: Category[]) => {
                    // Transform API categories to match form requirements
                    console.log('[ProductDialog] Categories received from service:', apiCategories.length);
                    this.categories = apiCategories.map(cat => ({
                        value: cat._id,
                        label: cat.name,
                        name: cat.name,
                        subcategories: cat.subcategories || []
                    }));
                    console.log('[ProductDialog] Categories transformed and set:', this.categories.length);
                    this.isLoadingCategories = false;
                },
                error: (error) => {
                    console.error('[ProductDialog] Error loading categories:', error);
                    this.snackBar.open('Failed to load categories', 'Close', { duration: 3000 });
                    this.isLoadingCategories = false;
                    this.categories = [];
                }
            });
    }

    createForm(): void {
        this.productForm = this.fb.group({
            name: ['', [Validators.required]],
            description: ['', [Validators.required]],
            brand: ['', [Validators.required]],
            category: ['', [Validators.required]],
            subcategory: ['', [Validators.required]],
            price: [0, [Validators.required, Validators.min(1)]],
            originalPrice: [0],
            discount: [0, [Validators.min(0), Validators.max(100)]],
            isActive: [true],
            isFeatured: [false]
        });

        // Subscribe to category changes to update subcategories
        this.productForm.get('category')?.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(categoryId => {
                this.onCategoryChange(categoryId);
            });
    }

    populateForm(): void {
        if (this.data) {
            this.productForm.patchValue({
                name: this.data.name,
                description: this.data.description,
                brand: this.data.brand,
                category: this.data.category,
                subcategory: this.data.subcategory,
                price: this.data.price,
                originalPrice: this.data.originalPrice,
                discount: this.data.discount,
                isActive: this.data.isActive,
                isFeatured: this.data.isFeatured
            });
            // Update subcategories when category is loaded
            if (this.data.category) {
                this.onCategoryChange(this.data.category);
            }
        }
    }

    /**
     * Handle category change - update subcategories dynamically from API data
     */
    onCategoryChange(categoryId: string): void {
        console.log('[ProductDialog] Category changed to:', categoryId);
        // Find the selected category from the loaded categories
        const selectedCategory = this.categories.find(cat => cat.value === categoryId);
        
        if (selectedCategory && selectedCategory.subcategories) {
            // Transform subcategories from API format to form format
            console.log('[ProductDialog] Subcategories found for category:', selectedCategory.subcategories.length);
            this.currentSubcategories = selectedCategory.subcategories.map((sub:any) => ({
                ...sub,
                value: sub.slug, // Use slug as value
                label: sub.name   // Use name as label
            }));
            console.log('[ProductDialog] Subcategories transformed:', this.currentSubcategories.length);
        } else {
            console.log('[ProductDialog] No subcategories found for category');
            this.currentSubcategories = [];
        }

        // Reset subcategory selection when category changes
        this.productForm.get('subcategory')?.reset('');
    }

    /**
     * Get subcategories for the currently selected category
     * This is called from the template to dynamically update the dropdown
     */
    getSubcategories(): any[] {
        return this.currentSubcategories;
    }

    onSave(): void {
        if (this.productForm.valid) {
            this.isLoading = true;

            const formData = this.productForm.value;
            console.log('[ProductDialog] Form data to save:', formData);

            if (this.isEditMode && this.data._id) {
                // Update existing product
                console.log('[ProductDialog] Updating existing product with ID:', this.data._id);
                this.productService.updateProduct(this.data._id, formData)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: (response: any) => {
                            console.log('[ProductDialog] Product update response received:', response);
                            this.isLoading = false;
                            this.snackBar.open('Product updated successfully', 'Close', { duration: 3000 });
                            this.dialogRef.close(response);
                        },
                        error: (error: any) => {
                            this.isLoading = false;
                            console.error('[ProductDialog] Error updating product:', error);
                            this.snackBar.open('Failed to update product', 'Close', { duration: 3000 });
                        }
                    });
            } else {
                // Create new product
                console.log('[ProductDialog] Creating new product');
                this.productService.createProduct(formData)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: (response: any) => {
                            console.log('[ProductDialog] Product create response received:', response);
                            this.isLoading = false;
                            this.snackBar.open('Product created successfully', 'Close', { duration: 3000 });
                            this.dialogRef.close(response);
                        },
                        error: (error: any) => {
                            this.isLoading = false;
                            console.error('[ProductDialog] Error creating product:', error);
                            this.snackBar.open('Failed to create product', 'Close', { duration: 3000 });
                        }
                    });
            }
        }
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}
