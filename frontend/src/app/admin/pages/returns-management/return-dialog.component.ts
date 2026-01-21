import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-return-dialog',
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
    <div class="return-dialog">
      <h2 mat-dialog-title>{{ data ? 'Edit Return Request' : 'Create Return Request' }}</h2>
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-dialog-content>
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Order ID</mat-label>
            <input matInput formControlName="orderId" placeholder="Enter order ID" required>
            <mat-error *ngIf="form.get('orderId')?.hasError('required')">Order ID is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Customer Name</mat-label>
            <input matInput formControlName="customerName" placeholder="Customer name" required>
            <mat-error *ngIf="form.get('customerName')?.hasError('required')">Customer name is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Return Reason</mat-label>
            <mat-select formControlName="reason" required>
              <mat-option value="">Select reason</mat-option>
              <mat-option value="defective">Defective Product</mat-option>
              <mat-option value="damaged">Damaged in Transit</mat-option>
              <mat-option value="wrong-item">Wrong Item Received</mat-option>
              <mat-option value="sizing-issue">Sizing Issue</mat-option>
              <mat-option value="color-difference">Color/Print Difference</mat-option>
              <mat-option value="quality-issue">Quality Issue</mat-option>
              <mat-option value="changed-mind">Changed Mind</mat-option>
              <mat-option value="other">Other</mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('reason')?.hasError('required')">Return reason is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status" required>
              <mat-option value="pending">Pending</mat-option>
              <mat-option value="approved">Approved</mat-option>
              <mat-option value="rejected">Rejected</mat-option>
              <mat-option value="refunded">Refunded</mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('status')?.hasError('required')">Status is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Return Amount</mat-label>
            <input matInput type="number" formControlName="returnAmount" placeholder="0.00" min="0" required>
            <mat-error *ngIf="form.get('returnAmount')?.hasError('required')">Return amount is required</mat-error>
            <mat-error *ngIf="form.get('returnAmount')?.hasError('min')">Return amount cannot be negative</mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Comments</mat-label>
            <textarea matInput 
              formControlName="comments" 
              placeholder="Additional comments..." 
              rows="3"></textarea>
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Items Returned</mat-label>
            <input matInput formControlName="itemsReturned" placeholder="e.g., 2 items">
          </mat-form-field>
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
    .return-dialog {
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
export class ReturnDialogComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ReturnDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.form = this.fb.group({
      orderId: [this.data?.orderId || '', Validators.required],
      customerName: [this.data?.customerName || '', Validators.required],
      reason: [this.data?.reason || '', Validators.required],
      status: [this.data?.status || 'pending', Validators.required],
      returnAmount: [this.data?.returnAmount || 0, [Validators.required, Validators.min(0)]],
      comments: [this.data?.comments || ''],
      itemsReturned: [this.data?.itemsReturned || '']
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
