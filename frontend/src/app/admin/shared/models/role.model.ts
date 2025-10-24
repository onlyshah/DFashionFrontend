export enum UserRole {
  SuperAdmin = 'super-admin',
  Admin = 'admin',
  Vendor = 'vendor',
  Creator = 'creator',
  Marketing = 'marketing',
  Moderator = 'moderator',
  Logistics = 'logistics',
  Finance = 'finance',
  Customer = 'customer'
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  actions: string[];
}

export interface RolePermission {
  roleId: string;
  permissions: Permission[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}