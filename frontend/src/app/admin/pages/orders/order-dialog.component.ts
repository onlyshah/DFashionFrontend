import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-order-dialog',
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
    <div class="order-dialog">
      <h2 mat-dialog-title>Update Order</h2>
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-dialog-content>
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Order Status</mat-label>
            <mat-select formControlName="status" required>
              <mat-option value="pending">Pending</mat-option>
              <mat-option value="confirmed">Confirmed</mat-option>
              <mat-option value="processing">Processing</mat-option>
              <mat-option value="shipped">Shipped</mat-option>
              <mat-option value="delivered">Delivered</mat-option>
              <mat-option value="cancelled">Cancelled</mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('status')?.hasError('required')">Status is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Tracking Number</mat-label>
            <input matInput formControlName="trackingNumber" placeholder="e.g., TRK123456">
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Shipping Address</mat-label>
            <textarea matInput formControlName="shippingAddress" placeholder="Enter shipping address" rows="3"></textarea>
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Expected Delivery Date</mat-label>
            <input matInput type="date" formControlName="expectedDeliveryDate">
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Notes</mat-label>
            <textarea matInput formControlName="notes" placeholder="Internal notes..." rows="3"></textarea>
          </mat-form-field>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
          <button mat-button (click)="onCancel()">Cancel</button>
          <button mat-raised-button color="primary" [disabled]="form.invalid">
            Update Order
          </button>
        </mat-dialog-actions>
      </form>
    </div>
  `,
  styles: [`
    .order-dialog {
      min-width: 450px;
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
export class OrderDialogComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<OrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.form = this.fb.group({
      status: [this.data?.status || 'pending', Validators.required],
      trackingNumber: [this.data?.trackingNumber || ''],
      shippingAddress: [this.data?.shippingAddress || ''],
      expectedDeliveryDate: [this.data?.expectedDeliveryDate || ''],
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
