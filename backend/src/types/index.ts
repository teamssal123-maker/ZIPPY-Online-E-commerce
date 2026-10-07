export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  itemCount: number;
  parentId?: string | null;
  icon?: string;
  sortOrder?: number;
  status?: 'active' | 'inactive';
  metaTitle?: string;
  metaDescription?: string;
  parentName?: string;
  subcategoriesCount?: number;
  totalStockUnits?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface ColorVariant {
  name: string;
  hex: string;
}

export type ProductSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  styleCode: string;
  categoryId: string;
  categoryName: string;
  price: number;
  salePrice?: number | null;
  description: string;
  shortDescription?: string;
  fabric: string;
  fit: 'Slim Fit' | 'Regular Fit' | 'Tailored Fit' | 'Classic Fit' | string;
  gender: 'Men' | 'Women' | 'Unisex' | string;
  images: string[];
  colors: ColorVariant[];
  sizes: (ProductSize | string)[];
  stock: Record<string, number>;
  featured: boolean;
  newArrival: boolean;
  onSale: boolean;
  rating: number;
  reviewCount: number;
  careInstructions: string[];
  tags: string[];
  barcode?: string;
  brandId?: string;
  subcategoryId?: string;
  costPrice?: number;
  tax?: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
  weight?: number;
  dimensions?: { length?: number; width?: number; height?: number };
  status?: 'draft' | 'published' | 'archived' | 'active' | 'inactive' | string;
  bestSeller?: boolean;
  trending?: boolean;
  isActive?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  customAttributes?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  size: ProductSize;
  color: ColorVariant;
  quantity: number;
  price: number;
}

export interface WishlistItem {
  productId: string;
  product: Product;
  addedAt: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'REFUNDED';

export type PaymentStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED';

export type PaymentMethod = 'COD' | 'BKASH' | 'SSLCOMMERZ';

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  division: string;
  district: string;
  address: string;
  deliveryNotes?: string;
}

export interface TrackingStep {
  status: OrderStatus;
  title: string;
  description: string;
  time: string;
  done: boolean;
  current?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  couponDiscount?: number;
  shippingFee: number;
  tax?: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentId?: string;
  customer: CustomerDetails;
  trackingHistory: TrackingStep[];
  customerId?: string;
  shippingAddress?: string;
  billingAddress?: string;
  customerNote?: string;
  adminNote?: string;
  deletedAt?: string | null;
}

export interface Coupon {
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  discountType?: 'percent' | 'fixed';
  discountValue?: number;
  minSpend?: number;
  minOrder: number;
  description: string;
  expiresAt?: string;
}

export interface StoreLocation {
  id: string;
  name: string;
  city: 'Dhaka' | 'Chittagong' | 'Sylhet';
  area?: string;
  address: string;
  phone: string;
  hours: string;
  featured?: boolean;
  mapUrl?: string;
  services?: string[];
}

export interface ProductReview {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
  customerId?: string;
  orderId?: string;
  title?: string;
  images?: string[];
  status?: 'pending' | 'approved' | 'rejected';
  adminReply?: string;
  createdAt?: string;
}

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
  division: string;
  district: string;
  phone: string;
  isDefault: boolean;
  name?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  addressType?: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'ADMIN';
  savedAddresses: SavedAddress[];
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  dateOfBirth?: string;
  gender?: string;
  status?: 'active' | 'inactive' | 'blocked';
  roleId?: string;
  adminRole?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export type { Brand, ChatMessage, ChatThread, ChatSenderRole, ChatThreadStatus } from './cms.ts';

