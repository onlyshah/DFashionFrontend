import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Permission } from '../../models/permission.model';

@Component({
  selector: 'app-permission-dialog',
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
    <h2 mat-dialog-title>{{data ? 'Edit' : 'Create'}} Permission</h2>
    
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="flex flex-col gap-4">
          <mat-form-field>
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" required>
            <mat-error *ngIf="form.get('name')?.errors?.['required']">
              Name is required
            </mat-error>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Module</mat-label>
            <mat-select formControlName="module" required>
              <mat-option value="users">Users</mat-option>
              <mat-option value="products">Products</mat-option>
              <mat-option value="orders">Orders</mat-option>
              <mat-option value="content">Content</mat-option>
              <mat-option value="settings">Settings</mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('module')?.errors?.['required']">
              Module is required
            </mat-error>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Resource</mat-label>
            <input matInput formControlName="resource" required>
            <mat-error *ngIf="form.get('resource')?.errors?.['required']">
              Resource is required
            </mat-error>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Action</mat-label>
            <mat-select formControlName="action" required>
              <mat-option value="create">Create</mat-option>
              <mat-option value="read">Read</mat-option>
              <mat-option value="update">Update</mat-option>
              <mat-option value="delete">Delete</mat-option>
              <mat-option value="manage">Manage</mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('action')?.errors?.['required']">
              Action is required
            </mat-error>
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
          {{data ? 'Update' : 'Create'}}
        </button>
      </mat-dialog-actions>
    </form>
  `
})
export class PermissionDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PermissionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Permission | null
  ) {
    this.form = this.fb.group({
      name: [data?.name || '', Validators.required],
      description: [data?.description || ''],
      module: [data?.module || '', Validators.required],
      resource: [data?.resource || '', Validators.required],
      action: [data?.action || '', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}