import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DataTableComponent, DataTableColumn } from '../../../shared/components/data-table/data-table.component';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: Date;
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    DataTableComponent
  ],
  template: `
    <div class="user-list-container">
      <header class="page-header">
        <h1>User Management</h1>
        <button mat-raised-button color="primary" routerLink="create">
          <mat-icon>person_add</mat-icon>
          Add User
        </button>
      </header>

      <app-data-table
        [columns]="columns"
        [data]="users"
        (onEdit)="editUser($event)"
        (onDelete)="deleteUser($event)"
        (onRowClick)="viewUserDetails($event)">
      </app-data-table>
    </div>
  `,
  styles: [`
    .user-list-container {
      padding: 20px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h1 {
        margin: 0;
      }
    }

    @media (max-width: 600px) {
      .user-list-container {
        padding: 10px;
      }

      .page-header {
        flex-direction: column;
        gap: 10px;
        align-items: stretch;

        button {
          width: 100%;
        }
      }
    }
  `]
})
export class UserListComponent implements OnInit {
  users: User[] = [];

  columns: DataTableColumn[] = [
    {
      name: 'name',
      header: 'Name',
      cell: (user: User) => user.name
    },
    {
      name: 'email',
      header: 'Email',
      cell: (user: User) => user.email
    },
    {
      name: 'role',
      header: 'Role',
      cell: (user: User) => user.role
    },
    {
      name: 'status',
      header: 'Status',
      cell: (user: User) => user.status
    },
    {
      name: 'lastLogin',
      header: 'Last Login',
      cell: (user: User) => user.lastLogin.toLocaleDateString()
    }
  ];

  ngOnInit(): void {
    // TODO: Load users from service
    this.loadMockUsers();
  }

  private loadMockUsers(): void {
    this.users = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Admin',
        status: 'active',
        lastLogin: new Date()
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'User',
        status: 'active',
        lastLogin: new Date(Date.now() - 86400000)
      }
    ];
  }

  editUser(user: User): void {
    // TODO: Navigate to edit user form
    console.log('Edit user:', user);
  }

  deleteUser(user: User): void {
    // TODO: Show confirmation dialog and delete
    console.log('Delete user:', user);
  }

  viewUserDetails(user: User): void {
    // TODO: Navigate to user details
    console.log('View user details:', user);
  }
}