import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ADMIN_MENU, AdminMenuItem } from './admin-menu';
import { RolePermissionsService } from '../../services/role-permissions.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.scss']
})
export class AdminSidebarComponent implements OnInit {
  isSuperAdmin$ = this.authService.isSuperAdmin$;
  // generic opened menus by key
  openedMenus = new Set<string>();
  menu: AdminMenuItem[] = ADMIN_MENU;
  filteredMenu: AdminMenuItem[] = [];
  userRole: string = '';
  isSuperAdmin: boolean = false;

  constructor(
    private authService: AuthService,
    private rolePermissionsService: RolePermissionsService
  ) {}

  ngOnInit(): void {
    // Show all menu items by default
    this.filteredMenu = [...this.menu];
    console.log('📋 Sidebar initialized with', this.filteredMenu.length, 'menu items');
    console.log('📋 Menu items:', this.menu.map(m => `${m.key} - ${m.title}`).join('\n'));
    
    // Get current user role and update menu
    this.authService.currentUser$.subscribe((user: User | null) => {
      if (user) {
        const userRole = (user.role || '').toLowerCase().trim();
        this.userRole = userRole;
        this.isSuperAdmin = userRole === 'super_admin' || userRole === 'super-admin';
        
        console.log('🔐 ==== SIDEBAR DEBUG ====');
        console.log('🔐 Raw role from user:', user.role);
        console.log('🔐 Normalized role:', userRole);
        console.log('🔐 Is Super Admin?:', this.isSuperAdmin);
        console.log('👤 User email:', user.email);
        console.log('🔐 ========================');
        
        this.updateFilteredMenu();
      } else {
        console.log('❌ Sidebar - No authenticated user');
        this.userRole = '';
        this.isSuperAdmin = false;
        this.filteredMenu = [];
      }
    });

    // Check if we're on a product-related route to keep menu open
    const currentRoute = window.location.pathname;
    if (currentRoute.includes('/admin/products') ||
        currentRoute.includes('/admin/categories') ||
        currentRoute.includes('/admin/sub-categories')) {
      this.openedMenus.add('products');
    }
  }

  private updateFilteredMenu(): void {
    if (this.isSuperAdmin) {
      console.log('✅ Super Admin detected - showing ALL', this.menu.length, 'modules');
      this.filteredMenu = [...this.menu];
    } else {
      console.log(`🔒 Role '${this.userRole}' - filtering menu`);
      this.filteredMenu = this.menu.filter(item => this.canDisplayMenuItem(item));
      console.log('📋 Filtered to', this.filteredMenu.length, 'modules:', this.filteredMenu.map(m => m.title).join(', '));
    }
  }

  canDisplayMenuItem(item: AdminMenuItem): boolean {
    // Super admin sees everything - no filtering
    if (this.isSuperAdmin) return true;
    
    // Check if this menu item's module is visible to the user
    const module = item.key || '';
    if (!module) return true; // If no key, show it
    
    const hasAccess = this.rolePermissionsService.canViewModule(this.userRole, module);
    return hasAccess;
  }

  canDisplaySubMenu(item: AdminMenuItem): boolean {
    // Super admin sees all submenus
    if (this.isSuperAdmin) return true;
    
    if (!item.children) return true;
    // Show the submenu if at least one child is viewable
    return item.children.some(child => {
      const childKey = child.title?.toLowerCase().replace(/\s+/g, '-') || '';
      return this.rolePermissionsService.canViewModule(this.userRole, childKey);
    });
  }

  toggleMenu(key?: string): void {
    if (!key) return;
    if (this.openedMenus.has(key)) this.openedMenus.delete(key);
    else this.openedMenus.add(key);
  }

  isOpen(key?: string): boolean {
    if (!key) return false;
    return this.openedMenus.has(key);
  }

  closeMenu(key?: string): void {
    if (!key) return;
    this.openedMenus.delete(key);
  }
}