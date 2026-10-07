export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  itemCount: number;
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
  salePrice?: number;
  description: string;
  shortDescription?: string;
  fabric: string;
  fit: 'Slim Fit' | 'Regular Fit' | 'Tailored Fit' | 'Classic Fit';
  gender: 'Men';
  images: string[];
  colors: ColorVariant[];
  sizes: ProductSize[];
  stock: Record<string, number>;
  featured: boolean;
  newArrival: boolean;
  onSale: boolean;
  rating: number;
  reviewCount: number;
  careInstructions: string[];
  tags: string[];
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
  | 'CANCELLED';

export type PaymentStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED';

export type PaymentMethod = 'COD' | 'BKASH' | 'SSLCOMMERZ' | 'NAGAD' | 'ROCKET' | 'BANK_TRANSFER' | string;

export type PaymentGatewayType = 'cod' | 'mobile_banking' | 'gateway' | 'bank_transfer' | 'custom';

export interface PaymentMethodConfig {
  id: string;
  code: string;
  name: string;
  type: PaymentGatewayType;
  description: string;
  instructions: string;
  status: 'active' | 'inactive';
  isDefault?: boolean;
  testMode?: boolean;
  additionalFee?: number;
  badge?: string;
  icon?: string;
  accountNumber?: string;
  accountType?: string;
  merchantId?: string;
  secretKey?: string;
  currency?: string;
  minOrderAmount?: number;
  maxOrderAmount?: number;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

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
  items: CartItem[];
  subtotal: number;
  discount: number;
  couponDiscount?: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentId?: string;
  customer: CustomerDetails;
  trackingHistory: TrackingStep[];
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
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'ADMIN';
  savedAddresses: {
    id: string;
    label: string;
    address: string;
    division: string;
    district: string;
    phone: string;
    isDefault: boolean;
  }[];
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageDesktop: string;
  imageMobile?: string;
  buttonText?: string;
  buttonUrl?: string;
  position: string;
  sortOrder: number;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'inactive' | 'scheduled' | 'published';
}

export interface HeaderNavItem {
  id: string;
  label: string;
  url: string;
  slug?: string;
  highlight?: boolean;
  badge?: string;
  isHome?: boolean;
  openInNewTab?: boolean;
}

export interface FooterPillarItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface FooterLinkItem {
  id: string;
  label: string;
  url: string;
  highlight?: boolean;
  openInNewTab?: boolean;
}

export interface WebsiteSettings {
  website_name?: string;
  websiteName?: string;
  backend_name?: string;
  backendName?: string;
  logo?: string;
  favicon?: string;
  email?: string;
  phone?: string;
  address?: string;
  currency?: string;

  // Header Customization
  headerAnnouncementEnabled?: boolean;
  headerAnnouncementText?: string;
  headerHotline?: string;
  headerLocatorText?: string;
  headerLocatorUrl?: string;
  headerTrackOrderText?: string;
  headerTrackOrderUrl?: string;
  headerNavItems?: HeaderNavItem[];
  headerSticky?: boolean;
  headerShowSearch?: boolean;
  headerShowAccount?: boolean;
  headerShowWishlist?: boolean;
  headerShowCart?: boolean;

  // Footer Customization
  footerPillarsEnabled?: boolean;
  footerPillars?: FooterPillarItem[];
  footerTagline?: string;
  footerAboutText?: string;
  footerCol1Title?: string;
  footerCol1Links?: FooterLinkItem[];
  footerCol2Title?: string;
  footerCol2Links?: FooterLinkItem[];
  footerNewsletterEnabled?: boolean;
  footerNewsletterTitle?: string;
  footerNewsletterSubtitle?: string;
  footerCopyright?: string;
  footerPaymentBadges?: string[];
}

export interface Offer {
  id: string;
  name: string;
  offerType?: 'campaign' | 'bundle' | 'seasonal' | 'free_shipping' | string;
  code?: string;
  discountType:
    | 'percentage_discount'
    | 'fixed_discount'
    | 'buy_one_get_one'
    | 'bundle_discount'
    | 'category_discount'
    | 'brand_discount'
    | 'product_discount'
    | 'minimum_order_discount'
    | 'free_shipping'
    | string;
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscount?: number;
  bundleQty?: number;
  bundleReward?: string;
  badge?: string;
  description?: string;
  isAutomatic?: boolean;
  usageLimit?: number;
  perCustomerLimit?: number;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'inactive' | 'scheduled' | 'expired' | string;
  createdAt?: string;
  updatedAt?: string;
}

export type ChatSenderRole = 'customer' | 'admin' | 'concierge' | 'ai';

export interface ChatMessage {
  id: string;
  threadId: string;
  senderRole: ChatSenderRole;
  senderName: string;
  senderId?: string;
  message: string;
  attachments?: string[];
  metadata?: {
    orderId?: string;
    productId?: string;
    category?: string;
    actionChip?: string;
  };
  createdAt: string;
  readAt?: string | null;
}

export type ChatThreadStatus = 'active' | 'waiting_admin' | 'waiting_customer' | 'resolved' | 'closed';

export interface ChatThread {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  userId?: string;
  guestKey?: string;
  status: ChatThreadStatus;
  subject?: string;
  lastMessageText: string;
  lastMessageAt: string;
  lastSenderRole: ChatSenderRole;
  unreadCountAdmin: number;
  unreadCountCustomer: number;
  assignedTo?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatInstantInquiry {
  id: string;
  label: string;
  prompt: string;
  category?: string;
  enabled?: boolean;
}

export interface ChatCannedReply {
  id: string;
  label: string;
  text: string;
  category?: string;
}

export interface ChatAutoReplyRule {
  id: string;
  name: string;
  keywords: string[];
  reply: string;
  enabled: boolean;
}

export interface ChatSettings {
  autoReply: boolean;
  enabled: boolean;
  greetingMessage?: string;
  defaultAutoReply?: string;
  offlineMessage?: string;
  aiSystemPrompt?: string;
  cannedReplies?: ChatCannedReply[];
  autoReplyRules?: ChatAutoReplyRule[];
  instantInquiries?: ChatInstantInquiry[];
}




