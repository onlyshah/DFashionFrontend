export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  subcategory: string;
  brand: string;
  images: ProductImage[];
  sizes: ProductSize[];
  colors: ProductColor[];
  vendor?: {
    _id: string;
    username: string;
    fullName: string;
    avatar: string;
  };
  tags?: string[];
  features?: string[];
  material?: string;
  careInstructions?: string;
  isActive: boolean;
  isFeatured: boolean;
  isTrending?: boolean;
  isSuggested?: boolean;
  isNewArrival?: boolean;
  rating?: {
    average: number;
    count: number;
  };
  reviews?: any[];
  seo?: {
    slug: string;
    metaTitle: string;
    metaDescription: string;
  };
  analytics?: {
    views: number;
    likes: number;
    shares: number;
    purchases: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductSize {
  size: string;
  stock: number;
}

export interface ProductColor {
  name: string;
  code: string;
  images?: ProductImage[];
}
