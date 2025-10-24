import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { Permission } from '../../models/permission.model';
import { PermissionService } from '../../services/permission.service';
import { PermissionDialogComponent } from './permission-dialog.component';

@Component({
  selector: 'app-permissions-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="p-4">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-semibold">Permissions</h1>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          Add Permission
        </button>
      </div>

      <div class="mat-elevation-z8">
        <div class="relative">
          <div *ngIf="loading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
            <mat-spinner diameter="40"></mat-spinner>
          </div>

          <div class="mb-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Filter</mat-label>
              <input matInput (keyup)="applyFilter($event)" placeholder="Search permissions..." #input>
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>

          <mat-table [dataSource]="dataSource" matSort>
            <ng-container matColumnDef="name">
              <mat-header-cell *matHeaderCellDef mat-sort-header>Name</mat-header-cell>
              <mat-cell *matCellDef="let permission">{{permission.name}}</mat-cell>
            </ng-container>

            <ng-container matColumnDef="description">
              <mat-header-cell *matHeaderCellDef mat-sort-header>Description</mat-header-cell>
              <mat-cell *matCellDef="let permission">{{permission.description}}</mat-cell>
            </ng-container>

            <ng-container matColumnDef="module">
              <mat-header-cell *matHeaderCellDef mat-sort-header>Module</mat-header-cell>
              <mat-cell *matCellDef="let permission">{{permission.module}}</mat-cell>
            </ng-container>

            <ng-container matColumnDef="resource">
              <mat-header-cell *matHeaderCellDef mat-sort-header>Resource</mat-header-cell>
              <mat-cell *matCellDef="let permission">{{permission.resource}}</mat-cell>
            </ng-container>

            <ng-container matColumnDef="action">
              <mat-header-cell *matHeaderCellDef mat-sort-header>Action</mat-header-cell>
              <mat-cell *matCellDef="let permission">{{permission.action}}</mat-cell>
            </ng-container>

            <ng-container matColumnDef="actions">
              <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
              <mat-cell *matCellDef="let permission">
                <button mat-icon-button color="primary" 
                        [matTooltip]="'Edit permission'"
                        (click)="openEditDialog(permission)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn"
                        [matTooltip]="'Delete permission'"
                        (click)="deletePermission(permission)">
                  <mat-icon>delete</mat-icon>
                </button>
              </mat-cell>
            </ng-container>

            <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
            <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
          </mat-table>

          <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]"
                        [pageSize]="10"
                        showFirstLastButtons>
          </mat-paginator>
        </div>
      </div>

            <div *ngIf="error" class="mt-4 p-4 bg-red-100 text-red-700 rounded flex items-center">
                <mat-icon class="mr-2">error_outline</mat-icon>
                {{ error }}
                <button mat-icon-button class="ml-auto" (click)="error = null">
                  <mat-icon>close</mat-icon>
                </button>
            </div>
    </div>
  `,
  styleUrls: ['./permissions-list.component.scss'],
  styles: [`
    .mat-mdc-row:hover {
      background-color: #f5f5f5;
    }
    .mat-column-actions {
      width: 100px;
      text-align: center;
    }
  `]
})
export class PermissionsListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Permission>;

  dataSource: MatTableDataSource<Permission>;
  displayedColumns = ['name', 'description', 'module', 'resource', 'action', 'actions'];
  loading = false;
  error: string | null = null;

  constructor(
    private permissionService: PermissionService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<Permission>([]);
  }

  ngOnInit(): void {
    this.loadPermissions();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadPermissions(): void {
    this.loading = true;
    this.error = null;

    this.permissionService.getPermissions().subscribe({
      next: (response) => {
        this.dataSource.data = response.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load permissions. Please try again later.';
        this.loading = false;
        console.error('Error loading permissions:', err);
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(PermissionDialogComponent, {
      width: '500px',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.permissionService.createPermission(result).subscribe({
          next: (response) => {
            if (response.success) {
              this.dataSource.data = [...this.dataSource.data, response.data];
              this.snackBar.open('Permission created successfully', 'Close', { 
                duration: 3000,
                panelClass: ['success-snackbar']
              });
            }
            this.loading = false;
          },
          error: (err) => {
            this.snackBar.open('Failed to create permission', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
            this.loading = false;
            console.error('Error creating permission:', err);
          }
        });
      }
    });
  }

  openEditDialog(permission: Permission): void {
    const dialogRef = this.dialog.open(PermissionDialogComponent, {
      width: '500px',
      data: permission
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && permission.id) {
        this.loading = true;
        this.permissionService.updatePermission(permission.id, result).subscribe({
          next: (response) => {
            if (response.success) {
              const data = this.dataSource.data;
              const index = data.findIndex((p: Permission) => p.id === permission.id);
              if (index !== -1) {
                data[index] = response.data;
                this.dataSource.data = [...data];
              }
              this.snackBar.open('Permission updated successfully', 'Close', { 
                duration: 3000,
                panelClass: ['success-snackbar']
              });
            }
            this.loading = false;
          },
          error: (err) => {
            this.snackBar.open('Failed to update permission', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
            this.loading = false;
            console.error('Error updating permission:', err);
          }
        });
      }
    });
  }

  deletePermission(permission: Permission): void {
    if (!permission.id) return;

    if (confirm(`Are you sure you want to delete the permission "${permission.name}"?`)) {
      this.loading = true;
      this.permissionService.deletePermission(permission.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.dataSource.data = this.dataSource.data.filter((p: Permission) => p.id !== permission.id);
              this.snackBar.open('Permission deleted successfully', 'Close', { 
                duration: 3000,
                panelClass: ['success-snackbar']
              });
          }
          this.loading = false;
        },
        error: (err) => {
          this.snackBar.open('Failed to delete permission', 'Close', { 
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.loading = false;
          console.error('Error deleting permission:', err);
        }
      });
    }
  }
}
