import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.scss']
})
export class AdminSidebarComponent implements OnInit {
  isSuperAdmin$ = this.authService.isSuperAdmin$;
  isProductMenuOpen = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Check if we're on a product-related route to keep menu open
    const currentRoute = window.location.pathname;
    if (currentRoute.includes('/admin/products') || 
        currentRoute.includes('/admin/categories') || 
        currentRoute.includes('/admin/sub-categories')) {
      this.isProductMenuOpen = true;
    }
  }

  toggleProductMenu(): void {
    this.isProductMenuOpen = !this.isProductMenuOpen;
  }

  closeProductMenu(): void {
    this.isProductMenuOpen = false;
  }
}