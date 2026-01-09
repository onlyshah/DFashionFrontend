import { Injectable } from '@angular/core';

export interface ModulePermission {
  module: string;
  actions: ('view' | 'create' | 'update' | 'delete')[];
}

export interface RolePermissions {
  [roleName: string]: ModulePermission[];
}

@Injectable({ providedIn: 'root' })
export class RolePermissionsService {
  // Role-to-module-permissions mapping
  private readonly rolePermissions: RolePermissions = {
    super_admin: [
      // Super Admin has full access to all modules
      { module: 'overview', actions: ['view', 'create', 'update', 'delete'] },
      { module: 'analytics', actions: ['view', 'create', 'update', 'delete'] },
      { module: 'social', actions: ['view', 'create', 'update', 'delete'] },
      { module: 'alerts', actions: ['view', 'create', 'update', 'delete'] },
      { module: 'users', actions: ['view', 'create', 'update', 'delete'] },
      { module: 'products', actions: ['view', 'create', 'update', 'delete'] },
      { module: 'inventory', actions: ['view', 'create', 'update', 'delete'] },
      { module: 'orders', actions: ['view', 'create', 'update', 'delete'] },
      { module: 'payments', actions: ['view', 'create', 'update', 'delete'] },
      { module: 'socialFeed', actions: ['view', 'create', 'update', 'delete'] },
      { module: 'creators', actions: ['view', 'create', 'update', 'delete'] },
      { module: 'live', actions: ['view', 'create', 'update', 'delete'] },
      { module: 'marketing', actions: ['view', 'create', 'update', 'delete'] },
      { module: 'reviews', actions: ['view', 'create', 'update', 'delete'] },
      { module: 'reports', actions: ['view', 'create', 'update', 'delete'] },
      { module: 'cms', actions: ['view', 'create', 'update', 'delete'] },
      { module: 'settings', actions: ['view', 'create', 'update', 'delete'] },
      { module: 'security', actions: ['view', 'create', 'update', 'delete'] },
      { module: 'support', actions: ['view', 'create', 'update', 'delete'] },
      { module: 'ai', actions: ['view', 'create', 'update', 'delete'] }
    ],
    admin: [
      { module: 'overview', actions: ['view'] },
      { module: 'analytics', actions: ['view'] },
      { module: 'users', actions: ['view', 'create', 'update'] },
      { module: 'products', actions: ['view', 'create', 'update'] },
      { module: 'inventory', actions: ['view', 'update'] },
      { module: 'orders', actions: ['view', 'update'] },
      { module: 'payments', actions: ['view'] },
      { module: 'socialFeed', actions: ['view'] },
      { module: 'marketing', actions: ['view', 'create'] },
      { module: 'reviews', actions: ['view'] },
      { module: 'reports', actions: ['view'] },
      { module: 'cms', actions: ['view', 'update'] },
      { module: 'settings', actions: ['view'] },
      { module: 'support', actions: ['view'] }
    ],
    vendor: [
      { module: 'overview', actions: ['view'] },
      { module: 'analytics', actions: ['view'] },
      { module: 'products', actions: ['view', 'create', 'update'] },
      { module: 'inventory', actions: ['view', 'update'] },
      { module: 'orders', actions: ['view', 'update'] },
      { module: 'payments', actions: ['view'] },
      { module: 'reports', actions: ['view'] }
    ],
    end_user: [
      { module: 'overview', actions: ['view'] }
    ]
  };

  getModulePermissions(role: string): ModulePermission[] {
    return this.rolePermissions[role] || [];
  }

  hasModulePermission(role: string, module: string, action: 'view' | 'create' | 'update' | 'delete' = 'view'): boolean {
    const permissions = this.getModulePermissions(role);
    const modulePermission = permissions.find(p => p.module === module);
    return modulePermission?.actions.includes(action) || false;
  }

  canViewModule(role: string, module: string): boolean {
    return this.hasModulePermission(role, module, 'view');
  }

  canCreateInModule(role: string, module: string): boolean {
    return this.hasModulePermission(role, module, 'create');
  }

  canUpdateInModule(role: string, module: string): boolean {
    return this.hasModulePermission(role, module, 'update');
  }

  canDeleteInModule(role: string, module: string): boolean {
    return this.hasModulePermission(role, module, 'delete');
  }
}
