import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminApiService } from '../../../services/admin-api.service';

@Component({
  selector: 'app-customer-edit-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatSelectModule, MatSlideToggleModule, MatDatepickerModule,
    MatNativeDateModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div mat-dialog-content class="dialog-content">
      <h2 mat-dialog-title>{{ data.readOnly ? 'Customer Details' : 'Edit Customer' }}</h2>
      
      <form [formGroup]="form" *ngIf="form" class="customer-form">
        <!-- Personal Information Section -->
        <div class="form-section">
          <h3>Personal Information</h3>
          
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Full Name</mat-label>
            <input matInput formControlName="fullName" [readonly]="data.readOnly">
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" [readonly]="data.readOnly">
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Phone</mat-label>
            <input matInput formControlName="phone" [readonly]="data.readOnly">
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Date of Birth</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="dob" [readonly]="data.readOnly">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>
        </div>

        <!-- Address Information Section -->
        <div class="form-section">
          <h3>Address Information</h3>
          
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Street Address</mat-label>
            <input matInput formControlName="address" [readonly]="data.readOnly">
          </mat-form-field>

          <div class="row">
            <mat-form-field appearance="fill" class="half-width">
              <mat-label>City</mat-label>
              <input matInput formControlName="city" [readonly]="data.readOnly">
            </mat-form-field>

            <mat-form-field appearance="fill" class="half-width">
              <mat-label>State/Province</mat-label>
              <input matInput formControlName="state" [readonly]="data.readOnly">
            </mat-form-field>
          </div>

          <div class="row">
            <mat-form-field appearance="fill" class="half-width">
              <mat-label>Postal Code</mat-label>
              <input matInput formControlName="postalCode" [readonly]="data.readOnly">
            </mat-form-field>

            <mat-form-field appearance="fill" class="half-width">
              <mat-label>Country</mat-label>
              <input matInput formControlName="country" [readonly]="data.readOnly">
            </mat-form-field>
          </div>
        </div>

        <!-- Account Status Section -->
        <div class="form-section">
          <h3>Account Status</h3>
          
          <div class="toggle-group">
            <label>Active Account</label>
            <mat-slide-toggle formControlName="isActive" [disabled]="data.readOnly"></mat-slide-toggle>
          </div>

          <div class="toggle-group">
            <label>Email Verified</label>
            <mat-slide-toggle formControlName="emailVerified" [disabled]="data.readOnly"></mat-slide-toggle>
          </div>

          <div class="toggle-group">
            <label>Phone Verified</label>
            <mat-slide-toggle formControlName="phoneVerified" [disabled]="data.readOnly"></mat-slide-toggle>
          </div>
        </div>

        <!-- Statistics Section (Read-only) -->
        <div class="form-section" *ngIf="data.id">
          <h3>Statistics</h3>
          
          <div class="stats-grid">
            <div class="stat-item">
              <label>Total Orders</label>
              <span class="stat-value">{{ data.totalOrders || 0 }}</span>
            </div>
            <div class="stat-item">
              <label>Total Spent</label>
              <span class="stat-value">\${{ data.totalSpent || 0 }}</span>
            </div>
            <div class="stat-item">
              <label>Account Created</label>
              <span class="stat-value">{{ data.createdAt | date: 'short' }}</span>
            </div>
            <div class="stat-item">
              <label>Last Login</label>
              <span class="stat-value">{{ data.lastLogin | date: 'short' }}</span>
            </div>
          </div>
        </div>
      </form>

      <div *ngIf="isLoading" class="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
    </div>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">{{ data.readOnly ? 'Close' : 'Cancel' }}</button>
      <button mat-raised-button color="primary" (click)="onSave()" *ngIf="!data.readOnly" [disabled]="!form.valid || isLoading">
        {{ isLoading ? 'Saving...' : 'Save Changes' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-content {
      min-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
    }

    h2 {
      margin-top: 0;
      color: #333;
    }

    .customer-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-section h3 {
      margin: 0;
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .full-width {
      width: 100%;
    }

    .row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .half-width {
      width: 100%;
    }

    .toggle-group {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .toggle-group label {
      font-weight: 500;
      color: #333;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .stat-item {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .stat-item label {
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
      font-weight: 600;
    }

    .stat-value {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    mat-dialog-actions {
      margin-top: 24px;
      gap: 12px;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
    }

    @media (max-width: 768px) {
      .dialog-content {
        min-width: 90vw;
      }

      .row {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CustomerEditDialogComponent implements OnInit {
  form!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private api: AdminApiService,
    private dialogRef: MatDialogRef<CustomerEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      fullName: [this.data.fullName || this.data.name || '', [Validators.required, Validators.minLength(2)]],
      email: [this.data.email || '', [Validators.required, Validators.email]],
      phone: [this.data.phone || ''],
      dob: [this.data.dob || null],
      address: [this.data.address || ''],
      city: [this.data.city || ''],
      state: [this.data.state || ''],
      postalCode: [this.data.postalCode || this.data.zipCode || ''],
      country: [this.data.country || ''],
      isActive: [this.data.isActive !== false],
      emailVerified: [this.data.emailVerified || false],
      phoneVerified: [this.data.phoneVerified || false]
    });
  }

  onSave(): void {
    if (!this.form.valid || this.isLoading) return;

    this.isLoading = true;
    const formData = this.form.getRawValue();

    this.api.updateUser(this.data._id || this.data.id, formData).subscribe({
      next: (response) => {
        console.log('✅ Customer updated successfully:', response);
        this.isLoading = false;
        this.dialogRef.close(response);
      },
      error: (error) => {
        console.error('❌ Error updating customer:', error);
        this.isLoading = false;
        alert('Failed to update customer. Please try again.');
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
