import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Role, Permission } from '../../../shared/models/role.model';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="role-form-container">
      <div class="page-header">
        <h2>{{ isEditMode ? 'Edit Role' : 'Create New Role' }}</h2>
        <button class="btn-secondary" routerLink="../">
          <i class="typcn typcn-arrow-left"></i>
          Back to Roles
        </button>
      </div>

      <form [formGroup]="roleForm" (ngSubmit)="onSubmit()" class="role-form">
        <div class="form-section">
          <h3>Basic Information</h3>
          
          <div class="form-group">
            <label for="name">Role Name</label>
            <input type="text" id="name" formControlName="name"
                   [class.error]="submitted && roleForm.get('name')?.errors">
            <div class="error-message" *ngIf="submitted && roleForm.get('name')?.errors">
              Role name is required
            </div>
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" formControlName="description" rows="3"></textarea>
          </div>
        </div>

        <div class="form-section">
          <h3>Permissions</h3>
          <div class="permissions-grid">
            <ng-container *ngFor="let module of permissionModules">
              <div class="module-permissions">
                <h4>{{ module.label }}</h4>
                <div class="permission-list" formGroupName="permissions">
                  <label *ngFor="let permission of module.permissions" class="permission-item">
                    <input type="checkbox" [formControlName]="permission.id">
                    <span class="label">{{ permission.name }}</span>
                    <span class="description">{{ permission.description }}</span>
                  </label>
                </div>
              </div>
            </ng-container>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="resetForm()">
            Reset
          </button>
          <button type="submit" class="btn-primary">
            {{ isEditMode ? 'Update Role' : 'Create Role' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .role-form-container {
      padding: 1.5rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .page-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .role-form {
      background: white;
      padding: 1.5rem;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-sm);
    }

    .form-section {
      margin-bottom: 2rem;
    }

    .form-section h3 {
      margin: 0 0 1rem;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      font-size: 0.875rem;
    }

    .form-group input.error,
    .form-group textarea.error {
      border-color: var(--danger-color);
    }

    .error-message {
      color: var(--danger-color);
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }

    .permissions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .module-permissions h4 {
      margin: 0 0 0.75rem;
      font-size: 1rem;
      font-weight: 500;
    }

    .permission-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .permission-item {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      cursor: pointer;
    }

    .permission-item input[type="checkbox"] {
      margin-top: 0.25rem;
    }

    .permission-item .label {
      font-weight: 500;
      font-size: 0.875rem;
    }

    .permission-item .description {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color);
    }

    .btn-primary,
    .btn-secondary {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: var(--border-radius);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-primary {
      background: var(--primary-color);
      color: white;
    }

    .btn-primary:hover {
      background: var(--primary-dark);
    }

    .btn-secondary {
      background: var(--light-bg);
      color: var(--text-color);
    }

    .btn-secondary:hover {
      background: var(--content-bg);
    }
  `]
})
export class RoleFormComponent implements OnInit {
  roleForm: FormGroup;
  isEditMode = false;
  submitted = false;
  role?: Role;

  permissionModules = [
    {
      label: 'User Management',
      permissions: [
        { id: 'view_users', name: 'View Users', description: 'Can view user list and details' },
        { id: 'create_users', name: 'Create Users', description: 'Can create new users' },
        { id: 'edit_users', name: 'Edit Users', description: 'Can modify user details' },
        { id: 'delete_users', name: 'Delete Users', description: 'Can delete users' }
      ]
    },
    {
      label: 'Content Management',
      permissions: [
        { id: 'view_content', name: 'View Content', description: 'Can view all content' },
        { id: 'create_content', name: 'Create Content', description: 'Can create new content' },
        { id: 'edit_content', name: 'Edit Content', description: 'Can modify content' },
        { id: 'delete_content', name: 'Delete Content', description: 'Can delete content' }
      ]
    },
    {
      label: 'Products',
      permissions: [
        { id: 'view_products', name: 'View Products', description: 'Can view products' },
        { id: 'create_products', name: 'Create Products', description: 'Can create products' },
        { id: 'edit_products', name: 'Edit Products', description: 'Can modify products' },
        { id: 'delete_products', name: 'Delete Products', description: 'Can delete products' }
      ]
    }
    // Add more modules as needed
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.roleForm = this.createRoleForm();
  }

  ngOnInit(): void {
    const roleId = this.route.snapshot.params['id'];
    if (roleId) {
      this.isEditMode = true;
      this.loadRole(roleId);
    }
  }

  private createRoleForm(): FormGroup {
    const permissionsGroup = this.fb.group({});
    
    // Create form controls for all permissions
    this.permissionModules.forEach(module => {
      module.permissions.forEach(permission => {
        permissionsGroup.addControl(permission.id, this.fb.control(false));
      });
    });

    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      permissions: permissionsGroup
    });
  }

  private loadRole(roleId: string): void {
    // Implement role loading logic
    // Then patch the form with the loaded data
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.roleForm.valid) {
      const formValue = this.roleForm.value;
      
      // Transform permissions from boolean map to string array
      const permissions = Object.entries(formValue.permissions)
        .filter(([_, value]) => value)
        .map(([key]) => key);

      const roleData = {
        ...formValue,
        permissions
      };

      if (this.isEditMode) {
        // Update existing role
      } else {
        // Create new role
      }
    }
  }

  resetForm(): void {
    this.submitted = false;
    if (this.isEditMode && this.role) {
      this.roleForm.patchValue(this.role);
    } else {
      this.roleForm.reset();
    }
  }
}