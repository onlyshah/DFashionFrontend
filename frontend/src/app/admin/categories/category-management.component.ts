import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="category-management">
      <h2>Category Management</h2>
      <p>Category management component - placeholder</p>
    </div>
  `,
  styles: [`
    .category-management {
      padding: 20px;
    }
  `]
})
export class CategoryManagementComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
    // TODO: Implement category management logic
  }
}