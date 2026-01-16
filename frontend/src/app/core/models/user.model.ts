export interface User {
  lastLogin: string | number | Date;
  _id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  image?: string; // ✅ Add this line
  bio?: string;
  role: 'customer' | 'vendor' | 'admin' | 'super_admin' | 'end_user';
  isVerified: boolean;
  isActive: boolean;
  followers: string[];
  following: string[];
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  preferences?: {
    categories: string[];
    brands: string[];
    priceRange: {
      min: number;
      max: number;
    };
  };
  vendorInfo?: {
    businessName: string;
    businessType: string;
    taxId: string;
    bankDetails: {
      accountNumber: string;
      routingNumber: string;
      bankName: string;
    };
    isApproved: boolean;
  };
  socialStats: {
    postsCount: number;
    followersCount: number;
    followingCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: 'customer' | 'vendor' | 'end_user';
  vendorInfo?: {
    businessName: string;
    businessType: string;
  };
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
