import { Injectable } from '@angular/core';

export interface Permission {
  id?: string;
  name?: string;
}

@Injectable({ providedIn: 'root' })
export class PermissionService {
  has(permission: string): boolean {
    // Placeholder: implement real permission checks with backend
    return false;
  }
}
