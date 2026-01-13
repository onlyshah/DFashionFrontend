export interface AdminNotification {
  id?: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon?: string;
  iconClass?: string;
  type?: 'order' | 'user' | 'product' | 'alert';
  link?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  permissions?: string[];
  avatar?: string;
  lastLogin?: string;
  status: 'active' | 'inactive' | 'suspended';
}