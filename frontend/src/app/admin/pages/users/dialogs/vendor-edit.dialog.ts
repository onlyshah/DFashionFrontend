import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AdminApiService } from '../../../services/admin-api.service';

@Component({
  selector: 'app-vendor-edit-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatSelectModule, MatSlideToggleModule, MatChipsModule,
    MatIconModule, MatProgressSpinnerModule, MatTabsModule, MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <div mat-dialog-content class="dialog-content">
      <h2 mat-dialog-title>{{ data.readOnly ? 'Vendor Details' : 'Edit Vendor' }}</h2>
      
      <mat-tab-group *ngIf="form" class="vendor-tabs">
        <!-- Basic Information Tab -->
        <mat-tab label="Basic Information">
          <form [formGroup]="form" class="vendor-form">
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Store Name</mat-label>
              <input matInput formControlName="storeName" [readonly]="data.readOnly">
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Owner Name</mat-label>
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
              <mat-label>Business Registration Number</mat-label>
              <input matInput formControlName="businessRegNumber" [readonly]="data.readOnly">
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Tax ID</mat-label>
              <input matInput formControlName="taxId" [readonly]="data.readOnly">
            </mat-form-field>
          </form>
        </mat-tab>

        <!-- Business Information Tab -->
        <mat-tab label="Business Information">
          <form [formGroup]="form" class="vendor-form">
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Business Address</mat-label>
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

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Business Description</mat-label>
              <textarea matInput formControlName="description" rows="4" [readonly]="data.readOnly"></textarea>
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Bank Account</mat-label>
              <input matInput formControlName="bankAccount" [readonly]="data.readOnly">
            </mat-form-field>
          </form>
        </mat-tab>

        <!-- Verification & Status Tab -->
        <mat-tab label="Verification & Status">
          <form [formGroup]="form" class="vendor-form">
            <div class="toggle-group">
              <label>Account Active</label>
              <mat-slide-toggle formControlName="isActive" [disabled]="data.readOnly"></mat-slide-toggle>
            </div>

            <div class="toggle-group">
              <label>Verified Vendor</label>
              <mat-slide-toggle formControlName="verified" [disabled]="data.readOnly"></mat-slide-toggle>
            </div>

            <div class="toggle-group">
              <label>Email Verified</label>
              <mat-slide-toggle formControlName="emailVerified" [disabled]="data.readOnly"></mat-slide-toggle>
            </div>

            <div class="toggle-group">
              <label>Document Verified</label>
              <mat-slide-toggle formControlName="documentVerified" [disabled]="data.readOnly"></mat-slide-toggle>
            </div>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Verification Status</mat-label>
              <mat-select formControlName="verificationStatus" [disabled]="data.readOnly">
                <mat-option value="pending">Pending</mat-option>
                <mat-option value="verified">Verified</mat-option>
                <mat-option value="rejected">Rejected</mat-option>
                <mat-option value="suspended">Suspended</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Verification Notes</mat-label>
              <textarea matInput formControlName="verificationNotes" rows="3" [readonly]="data.readOnly"></textarea>
            </mat-form-field>
          </form>
        </mat-tab>

        <!-- Performance Tab -->
        <mat-tab label="Performance">
          <div class="vendor-form stats-section">
            <div class="stats-grid">
              <div class="stat-item">
                <label>Total Products</label>
                <span class="stat-value">{{ data.products || 0 }}</span>
              </div>
              <div class="stat-item">
                <label>Total Sales</label>
                <span class="stat-value">\${{ data.totalSales || 0 }}</span>
              </div>
              <div class="stat-item">
                <label>Avg Rating</label>
                <span class="stat-value">{{ data.rating || 0 }}/5</span>
              </div>
              <div class="stat-item">
                <label>Total Reviews</label>
                <span class="stat-value">{{ data.reviews || 0 }}</span>
              </div>
              <div class="stat-item">
                <label>Order Fulfillment</label>
                <span class="stat-value">{{ data.fulfillmentRate || 0 }}%</span>
              </div>
              <div class="stat-item">
                <label>Return Rate</label>
                <span class="stat-value">{{ data.returnRate || 0 }}%</span>
              </div>
              <div class="stat-item">
                <label>Account Created</label>
                <span class="stat-value">{{ data.createdAt | date: 'short' }}</span>
              </div>
              <div class="stat-item">
                <label>Last Activity</label>
                <span class="stat-value">{{ data.lastActivity | date: 'short' }}</span>
              </div>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>

      <div *ngIf="isLoading" class="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
    </div>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">{{ data.readOnly ? 'Close' : 'Cancel' }}</button>
      <button mat-stroked-button color="warn" (click)="onReject()" *ngIf="!data.readOnly && data.verificationStatus === 'pending'" [disabled]="isLoading">
        Reject
      </button>
      <button mat-stroked-button color="accent" (click)="onApprove()" *ngIf="!data.readOnly && data.verificationStatus === 'pending'" [disabled]="isLoading">
        Approve
      </button>
      <button mat-raised-button color="primary" (click)="onSave()" *ngIf="!data.readOnly" [disabled]="!form.valid || isLoading">
        {{ isLoading ? 'Saving...' : 'Save Changes' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-content {
      min-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
    }

    h2 {
      margin-top: 0;
      color: #333;
    }

    .vendor-tabs {
      margin-top: 16px;
    }

    .vendor-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 20px 0;
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

    .stats-section {
      padding: 20px 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .stat-item {
      background: #f5f5f5;
      padding: 16px;
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
      font-size: 18px;
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

    @media (max-width: 900px) {
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
export class VendorEditDialogComponent implements OnInit {
  form!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private api: AdminApiService,
    private dialogRef: MatDialogRef<VendorEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      storeName: [this.data.storeName || this.data.businessName || '', [Validators.required, Validators.minLength(2)]],
      fullName: [this.data.fullName || this.data.owner || '', [Validators.required, Validators.minLength(2)]],
      email: [this.data.email || '', [Validators.required, Validators.email]],
      phone: [this.data.phone || '', Validators.required],
      businessRegNumber: [this.data.businessRegNumber || this.data.registrationNumber || ''],
      taxId: [this.data.taxId || this.data.gstNumber || ''],
      address: [this.data.address || ''],
      city: [this.data.city || ''],
      state: [this.data.state || ''],
      postalCode: [this.data.postalCode || this.data.zipCode || ''],
      country: [this.data.country || ''],
      description: [this.data.description || this.data.bio || ''],
      bankAccount: [this.data.bankAccount || this.data.accountNumber || ''],
      isActive: [this.data.isActive !== false],
      verified: [this.data.verified || false],
      emailVerified: [this.data.emailVerified || false],
      documentVerified: [this.data.documentVerified || false],
      verificationStatus: [this.data.verificationStatus || 'pending'],
      verificationNotes: [this.data.verificationNotes || '']
    });
  }

  onSave(): void {
    if (!this.form.valid || this.isLoading) return;

    this.isLoading = true;
    const formData = this.form.getRawValue();

    this.api.updateUser(this.data._id || this.data.id, formData).subscribe({
      next: (response) => {
        console.log('✅ Vendor updated successfully:', response);
        this.isLoading = false;
        this.dialogRef.close(response);
      },
      error: (error) => {
        console.error('❌ Error updating vendor:', error);
        this.isLoading = false;
        alert('Failed to update vendor. Please try again.');
      }
    });
  }

  onApprove(): void {
    if (confirm('Approve this vendor?')) {
      this.isLoading = true;
      this.api.approveVendor(this.data._id || this.data.id).subscribe({
        next: (response) => {
          console.log('✅ Vendor approved:', response);
          this.isLoading = false;
          this.dialogRef.close(response);
        },
        error: (error) => {
          console.error('❌ Error approving vendor:', error);
          this.isLoading = false;
          alert('Failed to approve vendor. Please try again.');
        }
      });
    }
  }

  onReject(): void {
    if (confirm('Reject this vendor?')) {
      this.isLoading = true;
      this.api.rejectVendor(this.data._id || this.data.id).subscribe({
        next: (response) => {
          console.log('✅ Vendor rejected:', response);
          this.isLoading = false;
          this.dialogRef.close(response);
        },
        error: (error) => {
          console.error('❌ Error rejecting vendor:', error);
          this.isLoading = false;
          alert('Failed to reject vendor. Please try again.');
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
