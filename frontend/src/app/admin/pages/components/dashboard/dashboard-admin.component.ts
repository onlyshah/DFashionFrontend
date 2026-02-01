import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-admin">
      <h2>Admin Dashboard</h2>
      <p>Admin dashboard component - placeholder</p>
    </div>
  `,
  styles: [`
    .dashboard-admin {
      padding: 20px;
    }
  `]
})
export class DashboardAdminComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
    // TODO: Implement admin dashboard logic
  }
}