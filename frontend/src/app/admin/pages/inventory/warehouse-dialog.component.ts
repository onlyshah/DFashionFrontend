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
  selector: 'app-warehouse-dialog',
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
    <div class="warehouse-dialog">
      <h2 mat-dialog-title>{{ data ? 'Edit Warehouse' : 'Add Warehouse' }}</h2>
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-dialog-content>
          <!-- Warehouse Name -->
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Warehouse Name</mat-label>
            <input matInput formControlName="name" placeholder="e.g., Central Warehouse" required>
            <mat-error *ngIf="form.get('name')?.hasError('required')">Name is required</mat-error>
            <mat-error *ngIf="form.get('name')?.hasError('minlength')">Name must be at least 3 characters</mat-error>
          </mat-form-field>

          <!-- Address -->
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Address</mat-label>
            <textarea matInput formControlName="address" placeholder="Enter warehouse address" rows="2" required></textarea>
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

          <!-- Manager Name -->
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Manager Name</mat-label>
            <input matInput formControlName="manager" placeholder="e.g., John Doe" required>
            <mat-error *ngIf="form.get('manager')?.hasError('required')">Manager name is required</mat-error>
          </mat-form-field>

          <!-- Manager Phone -->
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Manager Phone</mat-label>
            <input matInput formControlName="managerPhone" placeholder="e.g., +91-9876543210" required>
            <mat-error *ngIf="form.get('managerPhone')?.hasError('required')">Manager phone is required</mat-error>
            <mat-error *ngIf="form.get('managerPhone')?.hasError('minlength')">Phone must be at least 10 digits</mat-error>
          </mat-form-field>

          <!-- Manager Email -->
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Manager Email</mat-label>
            <input matInput type="email" formControlName="managerEmail" placeholder="manager@example.com" required>
            <mat-error *ngIf="form.get('managerEmail')?.hasError('required')">Email is required</mat-error>
            <mat-error *ngIf="form.get('managerEmail')?.hasError('email')">Please enter a valid email</mat-error>
          </mat-form-field>

          <!-- Total Capacity -->
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Total Capacity (Units)</mat-label>
            <input matInput type="number" formControlName="capacity" placeholder="e.g., 1000" required>
            <mat-error *ngIf="form.get('capacity')?.hasError('required')">Capacity is required</mat-error>
            <mat-error *ngIf="form.get('capacity')?.hasError('min')">Capacity must be greater than 0</mat-error>
          </mat-form-field>

          <!-- Warehouse Type -->
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Warehouse Type</mat-label>
            <mat-select formControlName="type" required>
              <mat-option value="primary">Primary</mat-option>
              <mat-option value="secondary">Secondary</mat-option>
              <mat-option value="distribution">Distribution Center</mat-option>
              <mat-option value="fulfillment">Fulfillment Center</mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('type')?.hasError('required')">Type is required</mat-error>
          </mat-form-field>

          <!-- Operating Hours -->
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Operating Hours</mat-label>
            <input matInput formControlName="operatingHours" placeholder="e.g., 9 AM - 6 PM">
          </mat-form-field>

          <!-- Active Status -->
          <div class="checkbox-group">
            <mat-checkbox formControlName="isActive">Active Warehouse</mat-checkbox>
          </div>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
          <button mat-button (click)="onCancel()">Cancel</button>
          <button mat-raised-button color="primary" [disabled]="form.invalid">
            {{ data ? 'Update Warehouse' : 'Add Warehouse' }}
          </button>
        </mat-dialog-actions>
      </form>
    </div>
  `,
  styles: [`
    .warehouse-dialog {
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
export class WarehouseDialogComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<WarehouseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.form = this.fb.group({
      name: [this.data?.name || '', [Validators.required, Validators.minLength(3)]],
      address: [this.data?.address || '', Validators.required],
      city: [this.data?.city || '', Validators.required],
      state: [this.data?.state || '', Validators.required],
      pincode: [this.data?.pincode || '', Validators.required],
      manager: [this.data?.manager || '', Validators.required],
      managerPhone: [this.data?.managerPhone || '', [Validators.required, Validators.minLength(10)]],
      managerEmail: [this.data?.managerEmail || '', [Validators.required, Validators.email]],
      capacity: [this.data?.capacity || '', [Validators.required, Validators.min(1)]],
      type: [this.data?.type || '', Validators.required],
      operatingHours: [this.data?.operatingHours || ''],
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
