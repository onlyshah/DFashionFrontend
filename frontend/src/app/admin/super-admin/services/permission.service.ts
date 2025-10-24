import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Permission } from '../models/permission.model';

export interface PermissionResponse {
  success: boolean;
  data: Permission[];
  message?: string;
}

export interface SinglePermissionResponse {
  success: boolean;
  data: Permission;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private apiUrl = `${environment.apiUrl}/api/permissions`;

  constructor(private http: HttpClient) {}

  getPermissions(): Observable<PermissionResponse> {
    return this.http.get<PermissionResponse>(this.apiUrl);
  }

  getPermission(id: string): Observable<SinglePermissionResponse> {
    return this.http.get<SinglePermissionResponse>(`${this.apiUrl}/${id}`);
  }

  createPermission(permission: Partial<Permission>): Observable<SinglePermissionResponse> {
    return this.http.post<SinglePermissionResponse>(this.apiUrl, permission);
  }

  updatePermission(id: string, permission: Partial<Permission>): Observable<SinglePermissionResponse> {
    return this.http.put<SinglePermissionResponse>(`${this.apiUrl}/${id}`, permission);
  }

  deletePermission(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}