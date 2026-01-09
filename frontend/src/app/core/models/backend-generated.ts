// Auto-generated TypeScript interfaces for backend models
// Do not edit manually — regenerate with backend/scripts/generate_frontend_models.js

export interface Role {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  fullName?: string;
  role: string;
  department?: string;
  isActive: boolean;
  resetPasswordToken?: string;
  resetPasswordExpiry?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  brandId?: number;
  categoryId?: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductComment {
  id: number;
  productId: number;
  userId?: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: number;
  userId?: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Story {
  id: number;
  userId?: number;
  mediaUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reel {
  id: number;
  userId: number;
  videoUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserBehavior {
  id: number;
  userId: number;
  interactions: any;
  viewedProducts: any;
  likedProducts: any;
  purchasedProducts: any;
  categories: any;
  brands: any;
  totalViews: number;
  totalPurchases: number;
  totalSpent: number;
  preferredCategories: any;
  preferredBrands: any;
  createdAt: string;
  updatedAt: string;
}
