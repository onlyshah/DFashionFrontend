import { UserRole } from './role.model';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: string[];
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    [key: string]: any;
  };
}

export interface VendorProfile extends User {
  brandName: string;
  businessEmail: string;
  businessPhone: string;
  taxId: string;
  businessAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  bankInfo: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    swiftCode: string;
  };
  verified: boolean;
  rating: number;
  totalSales: number;
}

export interface CreatorProfile extends User {
  bio: string;
  socialLinks: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    website?: string;
  };
  categories: string[];
  followers: number;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  earnings: {
    total: number;
    pending: number;
    lastPayout: Date;
  };
  contentStats: {
    totalPosts: number;
    totalReels: number;
    totalLiveStreams: number;
  };
}