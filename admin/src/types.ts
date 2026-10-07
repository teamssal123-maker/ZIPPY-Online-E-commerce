export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  parentName?: string;
  description?: string;
  image?: string;
  icon?: string;
  sortOrder?: number;
  status?: string;
  itemCount?: number;
  totalStockUnits?: number;
  subcategoriesCount?: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  banner?: string;
  description?: string;
  website?: string;
  status?: string;
  sortOrder?: number;
  featured?: boolean;
  itemCount?: number;
  totalStockUnits?: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  styleCode: string;
  barcode?: string;
  categoryId: string;
  categoryName: string;
  subcategoryId?: string;
  brandId?: string;
  price: number;
  salePrice?: number;
  costPrice?: number;
  tax?: number;
  fabric: string;
  fit: string;
  gender?: string;
  images: string[];
  colors?: { name: string; hex: string }[];
  sizes?: string[];
  stock?: Record<string, number>;
  stockQuantity?: number;
  lowStockThreshold?: number;
  weight?: number;
  onSale: boolean;
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  trending?: boolean;
  isActive?: boolean;
  status?: string;
  rating?: number;
  reviewCount?: number;
  description?: string;
  shortDescription?: string;
  careInstructions?: string[];
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  customAttributes?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
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

export interface OrderItem {
  id: string;
  productId: string;
  product?: { name: string; price: number; sku?: string };
  size?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  subtotal?: number;
  discount?: number;
  shippingCost?: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus?: string;
  paymentId?: string;
  items: OrderItem[];
  customer: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    district: string;
    division: string;
    deliveryNotes?: string;
  };
}

export interface Coupon {
  id?: string;
  code: string;
  description: string;
  minOrder: number;
  minSpend?: number;
  discountPercent?: number;
  discountAmount?: number;
  discountType?: 'percent' | 'fixed';
  discountValue?: number;
  usageLimit?: number;
  usedCount?: number;
  expiresAt?: string;
  status?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  manager: string;
  status: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  productImage?: string;
  categoryName?: string;
  price?: number;
  costPrice?: number;
  warehouseId: string;
  warehouseName?: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  minimumStock: number;
  maximumStock: number;
  status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  updatedAt: string;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  productName?: string;
  sku?: string;
  variantId?: string;
  warehouseId: string;
  warehouseName?: string;
  type: 'opening_stock' | 'purchase' | 'stock_in' | 'stock_out' | 'transfer' | 'adjustment' | 'sale' | 'damage' | 'return';
  quantity: number;
  reference?: string;
  note?: string;
  createdBy: string;
  createdAt: string;
}

export interface StockValuation {
  totalUnits: number;
  totalValue: number;
  totalCost: number;
  potentialProfit: number;
  byProduct: Array<{
    id: string;
    name: string;
    sku: string;
    units: number;
    costPrice: number;
    sellingPrice: number;
    inventoryValue: number;
    costValue: number;
  }>;
}

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'ADMIN';
  status: 'active' | 'inactive' | 'blocked';
  profileImage?: string;
  savedAddresses?: Array<{
    id: string;
    label: string;
    address: string;
    division: string;
    district: string;
    phone: string;
    isDefault: boolean;
  }>;
  createdAt?: string;
}

export interface Review {
  id: string;
  productId: string;
  productName?: string;
  authorName: string;
  rating: number;
  comment: string;
  title?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminReply?: string;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  productId: string;
  productName?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'pending' | 'replied' | 'closed';
  adminReply?: string;
  createdAt: string;
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
  status: 'active' | 'inactive' | 'scheduled';
}

export interface HomepageSection {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  sortOrder: number;
  status: string;
}

export interface Offer {
  id: string;
  name: string;
  code?: string;
  discountType: string;
  discountValue: number;
  minimumOrderAmount?: number;
  usageLimit?: number;
  status: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  status: 'draft' | 'published' | 'scheduled';
  publishedAt?: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  updatedAt: string;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  folder: string;
  createdAt: string;
}

export interface RoleRecord {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  roleId?: string;
  roleName?: string;
  status: string;
  createdAt: string;
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
  website_name: string;
  websiteName?: string;
  backend_name?: string;
  backendName?: string;
  logo: string;
  favicon?: string;
  phone: string;
  email: string;
  address: string;
  google_map?: string;
  facebook?: string;
  instagram?: string;
  currency: string;
  timezone: string;
  default_language: string;
  maintenance_mode: boolean;

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
  aiSettings?: AiSettings;
  chatSettings?: ChatSettings;
}

export interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl?: string;
  openGraphImage?: string;
  robots?: string;
  robotsSettings?: string;
  schemaMarkup?: string;
}

export interface SeoRedirect {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode?: number;
}

export interface NotificationRecord {
  id: string;
  channel: string;
  event: string;
  payload: Record<string, unknown>;
  sent: boolean;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  userId?: string;
  action: string;
  module: string;
  recordId?: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'CUSTOMER' | 'ADMIN';
}

export interface Stats {
  grossRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  catalogCount: number;
  stores: number;
  total_sales?: number;
  today_sales?: number;
  monthly_sales?: number;
  total_orders?: number;
  pending_orders?: number;
  completed_orders?: number;
  cancelled_orders?: number;
  total_customers?: number;
  total_products?: number;
  low_stock_products?: number;
  out_of_stock_products?: number;
  top_selling_products?: Array<{ productId: string; name: string; qty: number; revenue: number }>;
  recent_orders?: Order[];
  recent_customers?: Customer[];
  recent_reviews?: Review[];
}

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
  apiKey?: string;
  apiSecret?: string;
  appKey?: string;
  appSecret?: string;
  username?: string;
  password?: string;
  storeId?: string;
  storePassword?: string;
  webhookSecret?: string;
  callbackUrl?: string;
  successUrl?: string;
  failUrl?: string;
  cancelUrl?: string;
  ipnUrl?: string;
  bankName?: string;
  routingNumber?: string;
  branchName?: string;
  swiftCode?: string;
  sandboxEndpoint?: string;
  liveEndpoint?: string;
  currency?: string;
  minOrderAmount?: number;
  maxOrderAmount?: number;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AiSettings {
  enabled: boolean;
  provider: 'gemini' | 'openai' | 'mock';
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  features?: {
    stylistChat?: boolean;
    productCopy?: boolean;
    seoGeneration?: boolean;
    inquiryAutoReply?: boolean;
    reviewAnalysis?: boolean;
    recommendations?: boolean;
    chatAutoReply?: boolean;
  };
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

export interface ChatInstantInquiry {
  id: string;
  label: string;
  prompt: string;
  category?: string;
  enabled?: boolean;
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

// ----------------- Sales Report Types -----------------

export interface SalesReportFilter {
  from?: string;
  to?: string;
  paymentMethod?: string;
  status?: string;
  search?: string;
}

export interface SalesReportDayBucket {
  date: string;
  orders: number;
  revenue: number;
  discount: number;
  netSales: number;
  itemsCount: number;
}

export interface SalesReportPaymentBucket {
  method: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface SalesReportStatusBucket {
  status: string;
  count: number;
  revenue: number;
}

export interface SalesReportTopProduct {
  id: string;
  title: string;
  sku: string;
  quantity: number;
  revenue: number;
  image?: string;
}

export interface SalesReportTotals {
  orders: number;
  revenue: number;
  discount: number;
  grossSales: number;
  netSales: number;
  shippingFee: number;
  averageOrderValue: number;
  itemsCount: number;
  completedOrdersCount: number;
  cancelledOrdersCount: number;
  processingOrdersCount: number;
}

export interface SalesReportOrderItem {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerCity?: string;
  itemsCount: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
}

export interface SalesReportResult {
  totals: SalesReportTotals;
  byDay: SalesReportDayBucket[];
  byPaymentMethod: SalesReportPaymentBucket[];
  byStatus: SalesReportStatusBucket[];
  topProducts: SalesReportTopProduct[];
  orders: SalesReportOrderItem[];
  filter: SalesReportFilter;
}

