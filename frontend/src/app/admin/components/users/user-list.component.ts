import { Component } from '@angular/core';
import { UsersTableComponent } from './users-table.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [UsersTableComponent],
  template: `<app-users-table></app-users-table>`
})
export class UserListComponent {}
