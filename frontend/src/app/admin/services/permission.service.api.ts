import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AdminAuthService } from './admin-auth.service';

export interface Permission {
  id: string;
  name: string;
  displayName: string;
  description: string;
  module: string;
  actions: string[];
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: string[]; // permission IDs
  level: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private apiUrl = `${environment.apiUrl}/api/admin`;
  
  // Observable subjects for caching
  private allPermissions$ = new BehaviorSubject<Permission[]>([]);
  private allRoles$ = new BehaviorSubject<Role[]>([]);
  private currentUserRole$ = new BehaviorSubject<Role | null>(null);
  private isLoading$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private adminAuthService: AdminAuthService) {
    this.initialize();
  }

  /**
   * Initialize by loading roles and permissions from API
   */
  private initialize(): void {
    // Load permissions when service initializes
    this.loadPermissions();
    
    // Load roles when service initializes
    this.loadRoles();

    // Update current user role when user changes
    this.adminAuthService.currentUser$.subscribe(user => {
      if (user && user.role) {
        this.loadRoles().subscribe(roles => {
          const userRole = roles.find(r => r.name === user.role);
          this.currentUserRole$.next(userRole || null);
        });
      } else {
        this.currentUserRole$.next(null);
      }
    });
  }

  /**
   * Fetch all permissions from backend API
   */
  loadPermissions(): Observable<Permission[]> {
    this.isLoading$.next(true);
    return this.http.get<any>(`${this.apiUrl}/permissions`).pipe(
      map(response => response.data || []),
      tap(permissions => {
        this.allPermissions$.next(permissions);
        this.isLoading$.next(false);
      }),
      catchError(error => {
        console.error('Error loading permissions:', error);
        this.isLoading$.next(false);
        return of([]);
      })
    );
  }

  /**
   * Fetch all roles from backend API
   */
  loadRoles(): Observable<Role[]> {
    this.isLoading$.next(true);
    return this.http.get<any>(`${this.apiUrl}/roles`).pipe(
      map(response => response.data || []),
      tap(roles => {
        this.allRoles$.next(roles);
        this.isLoading$.next(false);
      }),
      catchError(error => {
        console.error('Error loading roles:', error);
        this.isLoading$.next(false);
        return of([]);
      })
    );
  }

  /**
   * Get all permissions (returns cached or current value)
   */
  getAllPermissions(): Permission[] {
    return this.allPermissions$.value;
  }

  /**
   * Get all permissions as Observable
   */
  getAllPermissions$(): Observable<Permission[]> {
    const cached = this.allPermissions$.value;
    return cached.length > 0 ? of(cached) : this.loadPermissions();
  }

  /**
   * Get all roles (returns cached or current value)
   */
  getAllRoles(): Role[] {
    return this.allRoles$.value;
  }

  /**
   * Get all roles as Observable
   */
  getAllRoles$(): Observable<Role[]> {
    const cached = this.allRoles$.value;
    return cached.length > 0 ? of(cached) : this.loadRoles();
  }

  /**
   * Get role by name
   */
  getRoleByName(roleName: string): Role | null {
    return this.allRoles$.value.find(role => role.name === roleName) || null;
  }

  /**
   * Get permission by name
   */
  getPermissionByName(permName: string): Permission | null {
    return this.allPermissions$.value.find(perm => perm.name === permName) || null;
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    const currentRole = this.currentUserRole$.value;
    if (!currentRole) return false;

    // Super admin has all permissions
    if (currentRole.name === 'super_admin') return true;

    // Check if permission is in role's permissions
    return currentRole.permissions.includes(permission);
  }

  /**
   * Check if user has permission (Observable)
   */
  hasPermission$(permission: string): Observable<boolean> {
    return this.currentUserRole$.pipe(
      map(role => {
        if (!role) return false;
        if (role.name === 'super_admin') return true;
        return role.permissions.includes(permission);
      })
    );
  }

  /**
   * Check if user can manage roles
   */
  canManageRoles(): boolean {
    return this.hasPermission('roles:manage');
  }

  /**
   * Check if user can manage roles (Observable)
   */
  canManageRoles$(): Observable<boolean> {
    return this.hasPermission$('roles:manage');
  }

  /**
   * Get permissions by module
   */
  getPermissionsByModule(module: string): Permission[] {
    return this.allPermissions$.value.filter(p => p.module === module);
  }

  /**
   * Get user's permissions for a specific module
   */
  getUserPermissionsForModule(module: string): Permission[] {
    const currentRole = this.currentUserRole$.value;
    if (!currentRole) return [];

    return this.allPermissions$.value.filter(perm =>
      perm.module === module && currentRole.permissions.includes(perm.name)
    );
  }

  /**
   * Create new role via API
   */
  createRole(role: Partial<Role>): Observable<Role> {
    return this.http.post<any>(`${this.apiUrl}/roles`, role).pipe(
      tap(response => {
        // Reload roles after creation
        this.loadRoles().subscribe();
      }),
      map(response => response.data)
    );
  }

  /**
   * Update role via API
   */
  updateRole(roleId: string, role: Partial<Role>): Observable<Role> {
    return this.http.put<any>(`${this.apiUrl}/roles/${roleId}`, role).pipe(
      tap(response => {
        // Reload roles after update
        this.loadRoles().subscribe();
      }),
      map(response => response.data)
    );
  }

  /**
   * Delete role via API
   */
  deleteRole(roleId: string): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/roles/${roleId}`).pipe(
      tap(response => {
        // Reload roles after deletion
        this.loadRoles().subscribe();
      }),
      map(() => undefined)
    );
  }

  /**
   * Get current user role
   */
  getCurrentUserRole(): Role | null {
    return this.currentUserRole$.value;
  }

  /**
   * Get current user role (Observable)
   */
  getCurrentUserRole$(): Observable<Role | null> {
    return this.currentUserRole$.asObservable();
  }

  /**
   * Get loading state
   */
  isLoading(): Observable<boolean> {
    return this.isLoading$.asObservable();
  }

  /**
   * Refresh all data from API
   */
  refresh(): Observable<[Permission[], Role[]]> {
    return new Observable(observer => {
      Promise.all([
        this.loadPermissions().toPromise(),
        this.loadRoles().toPromise()
      ]).then(([perms, roles]) => {
        observer.next([perms || [], roles || []]);
        observer.complete();
      }).catch(err => {
        observer.error(err);
      });
    });
  }
}
