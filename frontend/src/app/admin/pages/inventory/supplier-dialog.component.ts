import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-supplier-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  template: `
    <div class="supplier-dialog">
      <h2 mat-dialog-title>{{ data ? 'Edit Supplier' : 'Add Supplier' }}</h2>
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-dialog-content>
          <!-- Supplier Name -->
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Supplier Name</mat-label>
            <input matInput formControlName="name" placeholder="e.g., ABC Textiles" required>
            <mat-error *ngIf="form.get('name')?.hasError('required')">Name is required</mat-error>
            <mat-error *ngIf="form.get('name')?.hasError('minlength')">Name must be at least 3 characters</mat-error>
          </mat-form-field>

          <!-- Contact Person -->
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Contact Person</mat-label>
            <input matInput formControlName="contact" placeholder="e.g., John Doe" required>
            <mat-error *ngIf="form.get('contact')?.hasError('required')">Contact person is required</mat-error>
          </mat-form-field>

          <!-- Email -->
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Email Address</mat-label>
            <input matInput type="email" formControlName="email" placeholder="supplier@example.com" required>
            <mat-error *ngIf="form.get('email')?.hasError('required')">Email is required</mat-error>
            <mat-error *ngIf="form.get('email')?.hasError('email')">Please enter a valid email</mat-error>
          </mat-form-field>

          <!-- Phone -->
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Phone Number</mat-label>
            <input matInput formControlName="phone" placeholder="e.g., +91-9876543210" required>
            <mat-error *ngIf="form.get('phone')?.hasError('required')">Phone is required</mat-error>
            <mat-error *ngIf="form.get('phone')?.hasError('minlength')">Phone must be at least 10 digits</mat-error>
          </mat-form-field>

          <!-- Company Address -->
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Company Address</mat-label>
            <textarea matInput formControlName="address" placeholder="Enter full company address" rows="2" required></textarea>
            <mat-error *ngIf="form.get('address')?.hasError('required')">Address is required</mat-error>
          </mat-form-field>

          <!-- City -->
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>City</mat-label>
            <input matInput formControlName="city" placeholder="e.g., Mumbai" required>
            <mat-error *ngIf="form.get('city')?.hasError('required')">City is required</mat-error>
          </mat-form-field>

          <!-- State -->
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>State</mat-label>
            <input matInput formControlName="state" placeholder="e.g., Maharashtra" required>
            <mat-error *ngIf="form.get('state')?.hasError('required')">State is required</mat-error>
          </mat-form-field>

          <!-- Pincode -->
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Pincode</mat-label>
            <input matInput formControlName="pincode" placeholder="e.g., 400001" required>
            <mat-error *ngIf="form.get('pincode')?.hasError('required')">Pincode is required</mat-error>
          </mat-form-field>

          <!-- GST Number -->
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>GST Number</mat-label>
            <input matInput formControlName="gstin" placeholder="e.g., 27AABCU1234H1Z0">
          </mat-form-field>

          <!-- Category/Type -->
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Supplier Category</mat-label>
            <mat-select formControlName="category" required>
              <mat-option value="fabric">Fabric</mat-option>
              <mat-option value="buttons">Buttons & Accessories</mat-option>
              <mat-option value="thread">Thread & Trims</mat-option>
              <mat-option value="packaging">Packaging</mat-option>
              <mat-option value="machinery">Machinery</mat-option>
              <mat-option value="chemical">Chemical & Dyes</mat-option>
              <mat-option value="other">Other</mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('category')?.hasError('required')">Category is required</mat-error>
          </mat-form-field>

          <!-- Payment Terms -->
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Payment Terms</mat-label>
            <input matInput formControlName="paymentTerms" placeholder="e.g., Net 30 days">
          </mat-form-field>

          <!-- Active Status -->
          <div class="checkbox-group">
            <mat-checkbox formControlName="isActive">Active Supplier</mat-checkbox>
          </div>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
          <button mat-button (click)="onCancel()">Cancel</button>
          <button mat-raised-button color="primary" [disabled]="form.invalid">
            {{ data ? 'Update Supplier' : 'Add Supplier' }}
          </button>
        </mat-dialog-actions>
      </form>
    </div>
  `,
  styles: [`
    .supplier-dialog {
      min-width: 500px;
      padding: 20px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .checkbox-group {
      margin: 16px 0;
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
export class SupplierDialogComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SupplierDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.form = this.fb.group({
      name: [this.data?.name || '', [Validators.required, Validators.minLength(3)]],
      contact: [this.data?.contact || '', Validators.required],
      email: [this.data?.email || '', [Validators.required, Validators.email]],
      phone: [this.data?.phone || '', [Validators.required, Validators.minLength(10)]],
      address: [this.data?.address || '', Validators.required],
      city: [this.data?.city || '', Validators.required],
      state: [this.data?.state || '', Validators.required],
      pincode: [this.data?.pincode || '', Validators.required],
      gstin: [this.data?.gstin || ''],
      category: [this.data?.category || '', Validators.required],
      paymentTerms: [this.data?.paymentTerms || ''],
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
