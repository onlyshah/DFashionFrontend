import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-inventory-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  template: `
    <div class="inventory-dialog">
      <h2 mat-dialog-title>{{ data ? 'Edit Inventory Item' : 'Add Inventory Item' }}</h2>
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-dialog-content>
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>SKU</mat-label>
            <input matInput formControlName="sku" placeholder="Enter SKU" required>
            <mat-error *ngIf="form.get('sku')?.hasError('required')">SKU is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Product</mat-label>
            <input matInput formControlName="product" placeholder="Select product" required>
            <mat-error *ngIf="form.get('product')?.hasError('required')">Product is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Quantity</mat-label>
            <input matInput type="number" formControlName="quantity" placeholder="0" required min="0">
            <mat-error *ngIf="form.get('quantity')?.hasError('required')">Quantity is required</mat-error>
            <mat-error *ngIf="form.get('quantity')?.hasError('min')">Quantity cannot be negative</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Warehouse</mat-label>
            <mat-select formControlName="warehouse" required>
              <mat-option value="">Select Warehouse</mat-option>
              <mat-option value="Main Warehouse">Main Warehouse</mat-option>
              <mat-option value="Secondary Warehouse">Secondary Warehouse</mat-option>
              <mat-option value="Distribution Center">Distribution Center</mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('warehouse')?.hasError('required')">Warehouse is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Location/Aisle</mat-label>
            <input matInput formControlName="location" placeholder="e.g., A-12-3">
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Reorder Level</mat-label>
            <input matInput type="number" formControlName="reorderLevel" placeholder="0" required min="0">
            <mat-error *ngIf="form.get('reorderLevel')?.hasError('required')">Reorder level is required</mat-error>
            <mat-error *ngIf="form.get('reorderLevel')?.hasError('min')">Reorder level cannot be negative</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Alert Threshold</mat-label>
            <input matInput type="number" formControlName="alertThreshold" placeholder="0" min="0">
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Unit Cost</mat-label>
            <input matInput type="number" formControlName="unitCost" placeholder="0.00" min="0">
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Notes</mat-label>
            <textarea matInput formControlName="notes" placeholder="Additional notes..." rows="3"></textarea>
          </mat-form-field>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
          <button mat-button (click)="onCancel()">Cancel</button>
          <button mat-raised-button color="primary" [disabled]="form.invalid">
            {{ data ? 'Update' : 'Add' }}
          </button>
        </mat-dialog-actions>
      </form>
    </div>
  `,
  styles: [`
    .inventory-dialog {
      min-width: 400px;
      padding: 20px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    mat-dialog-actions {
      padding: 16px 0 0 0;
    }

    h2 {
      margin: 0 0 20px 0;
      color: #333;
    }
  `]
})
export class InventoryDialogComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<InventoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.form = this.fb.group({
      sku: [this.data?.sku || '', Validators.required],
      product: [this.data?.product || '', Validators.required],
      quantity: [this.data?.quantity || 0, [Validators.required, Validators.min(0)]],
      warehouse: [this.data?.warehouse || '', Validators.required],
      location: [this.data?.location || ''],
      reorderLevel: [this.data?.reorderLevel || 10, [Validators.required, Validators.min(0)]],
      alertThreshold: [this.data?.alertThreshold || 5, Validators.min(0)],
      unitCost: [this.data?.unitCost || 0, Validators.min(0)],
      notes: [this.data?.notes || '']
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
