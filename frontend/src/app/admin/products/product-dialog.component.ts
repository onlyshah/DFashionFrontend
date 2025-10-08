import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminProductService } from '../services/product.service';

@Component({
    selector: 'app-product-dialog',
    styleUrls: ['./product-dialog.component.scss'],
    standalone: false,
    templateUrl: './product-dialog.component.html'
})
export class ProductDialogComponent implements OnInit {
    productForm!: FormGroup;
    isEditMode = false;
    isLoading = false;

    categories = [
        { value: 'men', label: 'Men' },
        { value: 'women', label: 'Women' },
        { value: 'children', label: 'Children' }
    ];

    subcategoriesMap: { [key: string]: any[] } = {
        men: [
            { value: 'shirts', label: 'Shirts' },
            { value: 'pants', label: 'Pants' },
            { value: 'tops', label: 'Tops' },
            { value: 'jackets', label: 'Jackets' },
            { value: 'shoes', label: 'Shoes' }
        ],
        women: [
            { value: 'dresses', label: 'Dresses' },
            { value: 'tops', label: 'Tops' },
            { value: 'pants', label: 'Pants' },
            { value: 'skirts', label: 'Skirts' },
            { value: 'shoes', label: 'Shoes' }
        ],
        children: [
            { value: 'tops', label: 'Tops' },
            { value: 'pants', label: 'Pants' },
            { value: 'dresses', label: 'Dresses' },
            { value: 'shoes', label: 'Shoes' }
        ]
    };

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<ProductDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private productService: AdminProductService,
        private snackBar: MatSnackBar
    ) {
        this.isEditMode = !!data;
    }

    ngOnInit(): void {
        this.createForm();
        if (this.isEditMode) {
            this.populateForm();
        }
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
        }
    }

    getSubcategories(): any[] {
        const category = this.productForm.get('category')?.value;
        return this.subcategoriesMap[category] || [];
    }

    onSave(): void {
        if (this.productForm.valid) {
            this.isLoading = true;

            const formData = this.productForm.value;

            // Simulate API call
            setTimeout(() => {
                this.isLoading = false;
                this.snackBar.open(
                    this.isEditMode ? 'Product updated successfully' : 'Product created successfully',
                    'Close',
                    { duration: 3000 }
                );
                this.dialogRef.close(formData);
            }, 1000);
        }
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}
