export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
  subcategories: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SpecificationItem {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  subcategory: string;
  shortDescription: string;
  description: string;
  price?: number;
  isPriceOnRequest: boolean;
  isMostSelling: boolean;
  images: string[];
  specifications: SpecificationItem[];
  metaTitle?: string;
  metaDescription?: string;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  featuredImage: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  isPublished: boolean;
  publishedAt?: string;
  author: string;
  readTimeMinutes?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type EnquiryStatus = 'new' | 'contacted' | 'closed';

export interface CustomerEnquiry {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  productId?: string;
  productTitle?: string;
  message: string;
  type?: 'product' | 'custom_project' | 'general';
  status: EnquiryStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SiteSettings {
  id: string;
  businessName: string;
  whatsappNumber: string;
  phoneNumber: string;
  email: string;
  adminEmail?: string;
  address: string;
  mapsUrl?: string;
  cloudinaryCloudName: string;
  cloudinaryUploadPreset: string;
  imgbbApiKey?: string;
  defaultCurrency: string;
  welcomeMessage: string;
  updatedAt?: string;
}
