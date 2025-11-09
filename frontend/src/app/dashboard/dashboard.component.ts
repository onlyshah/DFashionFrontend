import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="dashboard-container">
            <h1>Welcome to Your Dashboard</h1>
            <p>Choose a module from the navigation menu to get started.</p>
        </div>
    `,
    styles: [`
        .dashboard-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #333;
            margin-bottom: 1rem;
        }
        p {
            color: #666;
        }
    `]
})
export class DashboardComponent {
    constructor(private router: Router) {}
}