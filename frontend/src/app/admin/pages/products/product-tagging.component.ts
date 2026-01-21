import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-tagging',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatChipsModule,
    MatSnackBarModule,
    MatIconModule
  ],
  template: `
    <div class="tagging-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Product Tagging Management</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div class="add-tag-section">
            <h3>Create New Tag</h3>
            <form [formGroup]="tagForm" (ngSubmit)="onAddTag()" class="tag-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Tag Name</mat-label>
                <input matInput formControlName="name" required />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="3"></textarea>
              </mat-form-field>

              <button mat-raised-button color="primary" type="submit" [disabled]="isLoading">
                {{ isLoading ? 'Creating...' : 'Create Tag' }}
              </button>
            </form>
          </div>

          <div class="tags-section" *ngIf="tags.length > 0">
            <h3>Available Tags</h3>
            <mat-chip-set aria-label="tags">
              <mat-chip 
                *ngFor="let tag of tags" 
                [removable]="true"
                (removed)="onDeleteTag(tag._id)"
              >
                {{ tag.name }}
                <mat-icon matChipRemove>cancel</mat-icon>
              </mat-chip>
            </mat-chip-set>

            <h3 class="assign-title">Assign Tags to Products</h3>
            <div class="product-tags">
              <p *ngIf="productTags.length === 0" class="no-data">
                No products tagged yet. Select products and assign tags.
              </p>
              <table mat-table [dataSource]="dataSource" class="tags-table" *ngIf="productTags.length > 0">
                <!-- Product Column -->
                <ng-container matColumnDef="product">
                  <th mat-header-cell *matHeaderCellDef>Product</th>
                  <td mat-cell *matCellDef="let element">{{ element.productName }}</td>
                </ng-container>

                <!-- Tags Column -->
                <ng-container matColumnDef="tags">
                  <th mat-header-cell *matHeaderCellDef>Tags</th>
                  <td mat-cell *matCellDef="let element">
                    <mat-chip-set>
                      <mat-chip *ngFor="let tag of element.tags">{{ tag }}</mat-chip>
                    </mat-chip-set>
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let element">
                    <button 
                      mat-icon-button 
                      color="primary"
                      (click)="onEditProductTags(element)"
                    >
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button 
                      mat-icon-button 
                      color="warn"
                      (click)="onRemoveProductTags(element.productId)"
                    >
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>
          </div>

          <div *ngIf="tags.length === 0" class="no-tags">
            <p>No tags created yet. Create your first tag above.</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .tagging-container {
      padding: 20px;
    }

    .add-tag-section {
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid #eee;
    }

    .tag-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 400px;
    }

    .full-width {
      width: 100%;
    }

    .tags-section {
      margin-top: 32px;
    }

    .assign-title {
      margin-top: 24px;
      margin-bottom: 16px;
    }

    .product-tags {
      margin-top: 16px;
    }

    .tags-table {
      width: 100%;
      margin-top: 16px;
    }

    .no-data {
      padding: 32px;
      text-align: center;
      color: #999;
    }

    .no-tags {
      text-align: center;
      padding: 48px;
      color: #999;
    }
  `]
})
export class ProductTaggingComponent implements OnInit, OnDestroy {
  tagForm!: FormGroup;
  tags: any[] = [];
  productTags: any[] = [];
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns = ['product', 'tags', 'actions'];
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private productService: AdminProductService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadTags();
    this.loadProductTags();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.tagForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  private loadTags(): void {
    // TODO: Implement backend API call to fetch all tags
    this.tags = [];
  }

  private loadProductTags(): void {
    // TODO: Implement backend API call to fetch product-tag mappings
    this.productTags = [];
    this.dataSource.data = this.productTags;
  }

  onAddTag(): void {
    if (this.tagForm.invalid) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    const tagData = this.tagForm.value;

    // TODO: Call backend API to create tag
    this.snackBar.open('Tag created successfully', 'Close', { duration: 3000 });
    this.tagForm.reset();
    this.isLoading = false;
    this.loadTags();
  }

  onDeleteTag(tagId: string): void {
    if (confirm('Are you sure you want to delete this tag?')) {
      // TODO: Call backend API to delete tag
      this.tags = this.tags.filter(t => t._id !== tagId);
      this.snackBar.open('Tag deleted successfully', 'Close', { duration: 3000 });
    }
  }

  onEditProductTags(productTag: any): void {
    this.snackBar.open('Edit Product Tags - Feature coming soon', 'Close', { duration: 3000 });
    // TODO: Open dialog to edit product tags
  }

  onRemoveProductTags(productId: string): void {
    if (confirm('Are you sure you want to remove all tags from this product?')) {
      // TODO: Call backend API to remove product tags
      this.productTags = this.productTags.filter(pt => pt.productId !== productId);
      this.dataSource.data = this.productTags;
      this.snackBar.open('Product tags removed successfully', 'Close', { duration: 3000 });
    }
  }
}
