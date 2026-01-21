import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-coupon-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="coupon-dialog">
      <h2 mat-dialog-title>{{ data ? 'Edit Coupon' : 'Create Coupon' }}</h2>
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-dialog-content>
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Coupon Code</mat-label>
            <input matInput formControlName="code" placeholder="e.g., SAVE20" required uppercase>
            <mat-error *ngIf="form.get('code')?.hasError('required')">Code is required</mat-error>
            <mat-error *ngIf="form.get('code')?.hasError('minlength')">Code must be at least 3 characters</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" placeholder="Describe the coupon..." rows="2"></textarea>
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Discount Type</mat-label>
            <mat-select formControlName="discountType" required>
              <mat-option value="percentage">Percentage (%)</mat-option>
              <mat-option value="fixed">Fixed Amount (₹)</mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('discountType')?.hasError('required')">Discount type is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Discount Value</mat-label>
            <input matInput type="number" formControlName="discountValue" placeholder="0" required min="0">
            <mat-error *ngIf="form.get('discountValue')?.hasError('required')">Discount value is required</mat-error>
            <mat-error *ngIf="form.get('discountValue')?.hasError('min')">Discount value cannot be negative</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Maximum Uses</mat-label>
            <input matInput type="number" formControlName="maxUses" placeholder="0 for unlimited" required min="0">
            <mat-error *ngIf="form.get('maxUses')?.hasError('required')">Maximum uses is required</mat-error>
            <mat-error *ngIf="form.get('maxUses')?.hasError('min')">Maximum uses cannot be negative</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Minimum Order Value</mat-label>
            <input matInput type="number" formControlName="minOrderValue" placeholder="0" required min="0">
            <mat-error *ngIf="form.get('minOrderValue')?.hasError('required')">Minimum order value is required</mat-error>
            <mat-error *ngIf="form.get('minOrderValue')?.hasError('min')">Minimum order value cannot be negative</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Valid From</mat-label>
            <input matInput [matDatepicker]="startPicker" formControlName="validFrom" required>
            <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
            <mat-error *ngIf="form.get('validFrom')?.hasError('required')">Start date is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Valid Until</mat-label>
            <input matInput [matDatepicker]="endPicker" formControlName="validUntil" required>
            <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
            <mat-error *ngIf="form.get('validUntil')?.hasError('required')">End date is required</mat-error>
          </mat-form-field>

          <div class="checkbox-field">
            <label>
              <input type="checkbox" formControlName="isActive" />
              <span>Active</span>
            </label>
          </div>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
          <button mat-button (click)="onCancel()">Cancel</button>
          <button mat-raised-button color="primary" [disabled]="form.invalid">
            {{ data ? 'Update' : 'Create' }}
          </button>
        </mat-dialog-actions>
      </form>
    </div>
  `,
  styles: [`
    .coupon-dialog {
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

    .checkbox-field {
      margin: 16px 0;
      display: flex;
      align-items: center;

      label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;

        input[type="checkbox"] {
          cursor: pointer;
        }

        span {
          user-select: none;
        }
      }
    }
  `]
})
export class CouponDialogComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CouponDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    const today = new Date();
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    this.form = this.fb.group({
      code: [this.data?.code || '', [Validators.required, Validators.minLength(3)]],
      description: [this.data?.description || ''],
      discountType: [this.data?.discountType || 'percentage', Validators.required],
      discountValue: [this.data?.discountValue || 0, [Validators.required, Validators.min(0)]],
      maxUses: [this.data?.maxUses || 0, [Validators.required, Validators.min(0)]],
      minOrderValue: [this.data?.minOrderValue || 0, [Validators.required, Validators.min(0)]],
      validFrom: [this.data?.validFrom || today, Validators.required],
      validUntil: [this.data?.validUntil || nextMonth, Validators.required],
      isActive: [this.data?.isActive !== undefined ? this.data.isActive : true]
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
