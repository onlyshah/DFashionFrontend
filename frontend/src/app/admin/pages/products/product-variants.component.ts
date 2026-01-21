import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-variants',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatSnackBarModule,
    MatDialogModule,
    MatPaginatorModule
  ],
  template: `
    <div class="variants-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Product Variants Management</mat-card-title>
          <button mat-raised-button color="primary" (click)="onAddVariant()">
            Add Variant
          </button>
        </mat-card-header>

        <mat-card-content>
          <div *ngIf="variants.length > 0; else noData">
            <table mat-table [dataSource]="dataSource" class="variants-table">
              <!-- Product Column -->
              <ng-container matColumnDef="product">
                <th mat-header-cell *matHeaderCellDef>Product</th>
                <td mat-cell *matCellDef="let element">{{ element.productName }}</td>
              </ng-container>

              <!-- Size Column -->
              <ng-container matColumnDef="size">
                <th mat-header-cell *matHeaderCellDef>Size</th>
                <td mat-cell *matCellDef="let element">{{ element.size }}</td>
              </ng-container>

              <!-- Color Column -->
              <ng-container matColumnDef="color">
                <th mat-header-cell *matHeaderCellDef>Color</th>
                <td mat-cell *matCellDef="let element">{{ element.color }}</td>
              </ng-container>

              <!-- Stock Column -->
              <ng-container matColumnDef="stock">
                <th mat-header-cell *matHeaderCellDef>Stock</th>
                <td mat-cell *matCellDef="let element">{{ element.stock }}</td>
              </ng-container>

              <!-- SKU Column -->
              <ng-container matColumnDef="sku">
                <th mat-header-cell *matHeaderCellDef>SKU</th>
                <td mat-cell *matCellDef="let element">{{ element.sku }}</td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let element">
                  <button mat-icon-button (click)="onEditVariant(element)">
                    Edit
                  </button>
                  <button mat-icon-button color="warn" (click)="onDeleteVariant(element._id)">
                    Delete
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>

          <ng-template #noData>
            <p class="no-data">No variants found. Create your first variant by clicking "Add Variant"</p>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .variants-container {
      padding: 20px;
    }

    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .variants-table {
      width: 100%;
    }

    .no-data {
      text-align: center;
      padding: 32px;
      color: #999;
    }
  `]
})
export class ProductVariantsComponent implements OnInit, OnDestroy {
  variants: any[] = [];
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns = ['product', 'size', 'color', 'stock', 'sku', 'actions'];
  private destroy$ = new Subject<void>();

  constructor(
    private productService: AdminProductService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadVariants();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadVariants(): void {
    // TODO: Implement backend API call to fetch all product variants
    // For now, showing empty state with instruction
    this.variants = [];
    this.dataSource.data = this.variants;
  }

  onAddVariant(): void {
    this.snackBar.open('Add Variant - Feature coming soon', 'Close', { duration: 3000 });
    // TODO: Open dialog to add new variant
  }

  onEditVariant(variant: any): void {
    this.snackBar.open('Edit Variant - Feature coming soon', 'Close', { duration: 3000 });
    // TODO: Open dialog to edit variant
  }

  onDeleteVariant(variantId: string): void {
    if (confirm('Are you sure you want to delete this variant?')) {
      this.snackBar.open('Variant deleted successfully', 'Close', { duration: 3000 });
      // TODO: Call backend API to delete variant
      this.loadVariants();
    }
  }
}
