import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Role } from '../../../shared/models/role.model';
import { DataTableComponent, DataTableColumn } from '../../../shared/components/data-table/data-table.component';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [CommonModule, RouterModule, DataTableComponent],
  template: `
    <div class="roles-container">
      <div class="page-header">
        <h2>Role Management</h2>
        <button class="btn-primary" routerLink="create">
          <i class="typcn typcn-plus"></i>
          Create New Role
        </button>
      </div>

      <app-data-table
        [columns]="columns"
        [data]="roles"
        [actions]="actions"
        [pagination]="pagination"
        searchPlaceholder="Search roles..."
        (pageChange)="onPageChange($event)"
        (sortChange)="onSortChange($event)"
        (searchChange)="onSearch($event)">

        <ng-template #permissionsTemplate let-role>
          <div class="permissions-list">
            <span class="permission-tag" *ngFor="let permission of role.permissions.slice(0, 3)">
              {{ permission.name }}
            </span>
            <span class="more-tag" *ngIf="role.permissions.length > 3">
              +{{ role.permissions.length - 3 }} more
            </span>
          </div>
        </ng-template>

        <ng-template #dateTemplate let-role>
          {{ role.createdAt | date:'medium' }}
        </ng-template>
      </app-data-table>
    </div>
  `,
  styles: [`
    .roles-container {
      padding: 1.5rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .page-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .btn-primary {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: var(--border-radius);
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .btn-primary:hover {
      background: var(--primary-dark);
    }

    .permissions-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .permission-tag {
      padding: 0.25rem 0.5rem;
      background: var(--primary-light);
      color: var(--primary-color);
      border-radius: 1rem;
      font-size: 0.75rem;
    }

    .more-tag {
      padding: 0.25rem 0.5rem;
      background: var(--light-bg);
      color: var(--text-muted);
      border-radius: 1rem;
      font-size: 0.75rem;
    }
  `]
})
export class RolesListComponent implements OnInit {
  columns: DataTableColumn[] = [
    { 
      name: 'name',
      header: 'Role Name',
      sortable: true,
      cell: (role: Role) => role.name
    },
    { 
      name: 'description',
      header: 'Description',
      sortable: true,
      cell: (role: Role) => role.description
    },
    { 
      name: 'permissions',
      header: 'Permissions',
      sortable: false,
      cell: (role: Role) => `${role.permissions?.length || 0} permissions`
    },
    {
      name: 'createdAt',
      header: 'Created Date',
      sortable: true,
      cell: (role: Role) => new Date(role.createdAt).toLocaleDateString()
    }
  ];

  actions = [
    {
      label: 'Edit',
      icon: 'typcn-pencil',
      action: (role: Role) => this.editRole(role)
    },
    {
      label: 'Delete',
      icon: 'typcn-trash',
      action: (role: Role) => this.deleteRole(role)
    }
  ];

  roles: Role[] = [];
  pagination = {
    pageSize: 10,
    currentPage: 1,
    totalItems: 0
  };

  constructor() {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    // Implement role loading logic
  }

  onPageChange(page: number): void {
    this.pagination.currentPage = page;
    this.loadRoles();
  }

  onSortChange(event: { column: string; direction: 'asc' | 'desc' }): void {
    this.loadRoles();
  }

  onSearch(query: string): void {
    this.pagination.currentPage = 1;
    this.loadRoles();
  }

  editRole(role: Role): void {
    // Implement edit logic
  }

  deleteRole(role: Role): void {
    // Implement delete logic
  }
}