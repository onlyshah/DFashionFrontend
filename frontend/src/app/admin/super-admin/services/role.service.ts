import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Role, Permission } from '../../shared/models/role.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}/admin/roles`;
  private rolesSubject = new BehaviorSubject<Role[]>([]);
  private permissionsSubject = new BehaviorSubject<Permission[]>([]);

  roles$ = this.rolesSubject.asObservable();
  permissions$ = this.permissionsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getRoles(params: any = {}): Observable<{ data: Role[]; total: number }> {
    return this.http.get<{ data: Role[]; total: number }>(this.apiUrl, { params }).pipe(
      tap(response => this.rolesSubject.next(response.data))
    );
  }

  getRole(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  createRole(role: Partial<Role>): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, role).pipe(
      tap(newRole => {
        const currentRoles = this.rolesSubject.value;
        this.rolesSubject.next([...currentRoles, newRole]);
      })
    );
  }

  updateRole(id: string, role: Partial<Role>): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/${id}`, role).pipe(
      tap(updatedRole => {
        const currentRoles = this.rolesSubject.value;
        const index = currentRoles.findIndex(r => r.id === id);
        if (index !== -1) {
          currentRoles[index] = updatedRole;
          this.rolesSubject.next([...currentRoles]);
        }
      })
    );
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const currentRoles = this.rolesSubject.value;
        this.rolesSubject.next(currentRoles.filter(r => r.id !== id));
      })
    );
  }

  // Permission Management
  getPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiUrl}/permissions`).pipe(
      tap(permissions => this.permissionsSubject.next(permissions))
    );
  }

  assignPermissions(roleId: string, permissions: string[]): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/${roleId}/permissions`, { permissions }).pipe(
      tap(updatedRole => {
        const currentRoles = this.rolesSubject.value;
        const index = currentRoles.findIndex(r => r.id === roleId);
        if (index !== -1) {
          currentRoles[index] = updatedRole;
          this.rolesSubject.next([...currentRoles]);
        }
      })
    );
  }

  // Role Assignment
  assignRoleToUser(userId: string, roleId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/assign`, { userId, roleId });
  }

  getRolesByUser(userId: string): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Permissions Helpers
  hasPermission(userPermissions: string[], requiredPermission: string): boolean {
    return userPermissions.includes(requiredPermission);
  }

  hasAnyPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
    return requiredPermissions.some(permission => userPermissions.includes(permission));
  }

  hasAllPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
    return requiredPermissions.every(permission => userPermissions.includes(permission));
  }
}