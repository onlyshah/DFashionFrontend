import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PermissionService, Role, Permission } from '../../services/permission.service';
import { UiAnimationService } from '../../services/ui-animation.service';

declare var bootstrap: any;

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './role-management.component.html',
  styleUrl: './role-management.component.scss'
})
export class RoleManagementComponent implements OnInit {
  roles: Role[] = [];
  permissions: Permission[] = [];
  selectedRole: Role | null = null;
  roleForm: FormGroup;
  isEditMode = false;
  canManageRoles = false;
  selectedPermissions: string[] = [];

  private permissionsModal: any;
  private roleModal: any;

  constructor(
    private permissionService: PermissionService,
    private uiAnimationService: UiAnimationService,
    private fb: FormBuilder
  ) {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-z_]+$/)]],
      displayName: ['', Validators.required],
      description: [''],
      level: [3, [Validators.required, Validators.min(2), Validators.max(4)]],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.loadData();
    this.checkPermissions();
    this.initializeModals();
  }

  private loadData() {
    this.roles = this.permissionService.getAllRoles();
    this.permissions = this.permissionService.getAllPermissions();
  }

  private checkPermissions() {
    this.canManageRoles = this.permissionService.canManageRoles();
  }

  private initializeModals() {
    setTimeout(() => {
      const permissionsModalElement = document.getElementById('permissionsModal');
      const roleModalElement = document.getElementById('roleModal');

      if (permissionsModalElement && typeof bootstrap !== 'undefined') {
        this.permissionsModal = new bootstrap.Modal(permissionsModalElement);
      }

      if (roleModalElement && typeof bootstrap !== 'undefined') {
        this.roleModal = new bootstrap.Modal(roleModalElement);
      }
    }, 100);
  }

  getRoleBadgeClass(level: number): string {
    switch (level) {
      case 1: return 'badge-danger';
      case 2: return 'badge-warning';
      case 3: return 'badge-info';
      case 4: return 'badge-secondary';
      default: return 'badge-secondary';
    }
  }

  viewPermissions(role: Role) {
    this.selectedRole = role;
    if (this.permissionsModal) {
      this.permissionsModal.show();
    }
  }

  getModules(): string[] {
    const modules = [...new Set(this.permissions.map(p => p.module))];
    return modules.sort();
  }

  getModulePermissions(module: string): Permission[] {
    return this.permissions.filter(p => p.module === module);
  }

  getModulePermissionCount(module: string): number {
    if (!this.selectedRole) return 0;
    return this.permissions.filter(p =>
      p.module === module && this.selectedRole!.permissions.includes(p.id)
    ).length;
  }

  hasPermission(permissionId: string): boolean {
    return this.selectedRole?.permissions.includes(permissionId) || false;
  }

  openCreateRoleModal() {
    this.isEditMode = false;
    this.selectedPermissions = [];
    this.roleForm.reset({
      name: '',
      displayName: '',
      description: '',
      level: 3,
      isActive: true
    });

    if (this.roleModal) {
      this.roleModal.show();
    }
  }

  editRole(role: Role) {
    this.isEditMode = true;
    this.selectedRole = role;
    this.selectedPermissions = [...role.permissions];

    this.roleForm.patchValue({
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      level: role.level,
      isActive: role.isActive
    });

    // Update checkboxes
    setTimeout(() => {
      const checkboxes = document.querySelectorAll('#roleModal input[type="checkbox"]');
      checkboxes.forEach((checkbox: any) => {
        if (checkbox.value && this.selectedPermissions.includes(checkbox.value)) {
          checkbox.checked = true;
        }
      });
    }, 100);

    if (this.roleModal) {
      this.roleModal.show();
    }
  }

  onPermissionChange(event: any, permissionId: string) {
    if (event.target.checked) {
      if (!this.selectedPermissions.includes(permissionId)) {
        this.selectedPermissions.push(permissionId);
      }
    } else {
      const index = this.selectedPermissions.indexOf(permissionId);
      if (index > -1) {
        this.selectedPermissions.splice(index, 1);
      }
    }
  }

  saveRole() {
    if (!this.roleForm.valid) return;

    const formValue = this.roleForm.value;
    const roleData = {
      ...formValue,
      permissions: this.selectedPermissions
    };

    if (this.isEditMode && this.selectedRole) {
      this.permissionService.updateRole(this.selectedRole.id, roleData).subscribe({
        next: (updatedRole) => {
          this.uiAnimationService.showNotification('Role updated successfully', 'success');
          this.loadData();
          this.roleModal.hide();
        },
        error: (error) => {
          this.uiAnimationService.showNotification('Failed to update role: ' + error, 'error');
        }
      });
    } else {
      this.permissionService.createRole(roleData).subscribe({
        next: (newRole) => {
          this.uiAnimationService.showNotification('Role created successfully', 'success');
          this.loadData();
          this.roleModal.hide();
        },
        error: (error) => {
          this.uiAnimationService.showNotification('Failed to create role: ' + error, 'error');
        }
      });
    }
  }

  deleteRole(role: Role) {
    if (confirm(`Are you sure you want to delete the role "${role.displayName}"?`)) {
      this.permissionService.deleteRole(role.id).subscribe({
        next: () => {
          this.uiAnimationService.showNotification('Role deleted successfully', 'success');
          this.loadData();
        },
        error: (error) => {
          this.uiAnimationService.showNotification('Failed to delete role: ' + error, 'error');
        }
      });
    }
  }
}
