export interface FeaturedBrand {
  _id?: string;
  name: string;
  brand?: string; // Alias for name for template compatibility
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  isActive: boolean;
  isFeatured: boolean;
  productCount: number;
  avgRating?: number;
  totalViews?: number;
  avgPrice?: number;
  totalLikes?: number;
  products?: any[];
  topProducts?: any[]; // For template compatibility
  createdAt?: Date;
  updatedAt?: Date;
}
