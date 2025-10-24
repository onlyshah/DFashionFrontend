import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { Permission, UserRole } from '../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private userPermissionsSubject = new BehaviorSubject<Permission[]>([]);

  constructor(private router: Router) {
    // Initialize from localStorage if available
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get currentUser$(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  get userPermissions$(): Observable<Permission[]> {
    return this.userPermissionsSubject.asObservable();
  }

  setCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.loadUserPermissions(user);
  }

  clearCurrentUser(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.userPermissionsSubject.next([]);
  }

  hasRole(roles: UserRole | UserRole[]): boolean {
    const user = this.currentUser;
    if (!user) return false;

    const rolesToCheck = Array.isArray(roles) ? roles : [roles];
    return rolesToCheck.includes(user.role);
  }

  hasPermission(permissionName: string): boolean {
    const permissions = this.userPermissionsSubject.value;
    return permissions.some(p => p.name === permissionName);
  }

  hasAnyPermission(permissionNames: string[]): boolean {
    const permissions = this.userPermissionsSubject.value;
    return permissionNames.some(name => 
      permissions.some(p => p.name === name)
    );
  }

  hasAllPermissions(permissionNames: string[]): boolean {
    const permissions = this.userPermissionsSubject.value;
    return permissionNames.every(name => 
      permissions.some(p => p.name === name)
    );
  }

  canAccessModule(moduleName: string): boolean {
    const permissions = this.userPermissionsSubject.value;
    return permissions.some(p => p.module === moduleName);
  }

  canPerformAction(moduleName: string, action: string): boolean {
    const permissions = this.userPermissionsSubject.value;
    return permissions.some(p => 
      p.module === moduleName && p.actions.includes(action)
    );
  }

  private loadUserPermissions(user: User): void {
    // In a real app, you would fetch this from an API
    // For now, we'll simulate based on role
    const permissions: Permission[] = this.getSimulatedPermissions(user.role);
    this.userPermissionsSubject.next(permissions);
  }

  private getSimulatedPermissions(role: UserRole): Permission[] {
    // This is a simplified version - in a real app, these would come from your backend
    const basePermissions: Permission[] = [
      {
        id: 'view-dashboard',
        name: 'view-dashboard',
        description: 'View dashboard',
        module: 'dashboard',
        actions: ['view']
      }
    ];

    switch (role) {
      case UserRole.SuperAdmin:
        return [
          ...basePermissions,
          {
            id: 'manage-users',
            name: 'manage-users',
            description: 'Manage all users',
            module: 'users',
            actions: ['create', 'read', 'update', 'delete']
          },
          {
            id: 'manage-roles',
            name: 'manage-roles',
            description: 'Manage roles and permissions',
            module: 'roles',
            actions: ['create', 'read', 'update', 'delete']
          },
          // Add more super admin permissions
        ];

      case UserRole.Admin:
        return [
          ...basePermissions,
          {
            id: 'manage-content',
            name: 'manage-content',
            description: 'Manage content',
            module: 'content',
            actions: ['create', 'read', 'update', 'delete']
          },
          // Add more admin permissions
        ];

      // Add cases for other roles
      default:
        return basePermissions;
    }
  }
}