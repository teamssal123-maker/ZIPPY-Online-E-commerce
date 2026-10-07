export type AdminRole =
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'inventory_manager'
  | 'sales_manager'
  | 'content_manager'
  | 'editor'
  | 'support_staff';

export type RecordStatus = 'active' | 'inactive' | 'draft' | 'published' | 'archived';

export interface RoleRecord {
  id: string;
  name: AdminRole;
  label: string;
  permissions: string[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  banner: string;
  description: string;
  website: string;
  status: RecordStatus;
  sortOrder: number;
  metaTitle: string;
  metaDescription: string;
  featured?: boolean;
  itemCount?: number;
  totalStockUnits?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  manager: string;
  status: RecordStatus;
}

export type InventoryTxnType =
  | 'purchase'
  | 'sale'
  | 'return'
  | 'damage'
  | 'adjustment'
  | 'transfer'
  | 'opening_stock'
  | 'stock_in'
  | 'stock_out';

export interface InventoryItem {
  id: string;
  productId: string;
  productName?: string;
  sku?: string;
  productImage?: string;
  categoryName?: string;
  price?: number;
  costPrice?: number;
  variantId?: string;
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
  type: InventoryTxnType;
  quantity: number;
  reference?: string;
  note?: string;
  createdBy: string;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageDesktop: string;
  imageMobile: string;
  buttonText: string;
  buttonUrl: string;
  position: string;
  sortOrder: number;
  startDate?: string;
  endDate?: string;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface HomepageSection {
  id: string;
  type: string;
  title: string;
  config: Record<string, unknown>;
  sortOrder: number;
  status: RecordStatus;
}

export interface NavItem {
  id: string;
  label: string;
  url: string;
  parentId?: string | null;
  sortOrder: number;
  mega?: boolean;
}

export interface NavigationMenu {
  id: string;
  location: 'header' | 'footer';
  items: NavItem[];
}

export interface Offer {
  id: string;
  name: string;
  code?: string;
  discountType:
    | 'percentage_discount'
    | 'fixed_discount'
    | 'buy_one_get_one'
    | 'category_discount'
    | 'brand_discount'
    | 'product_discount'
    | 'minimum_order_discount'
    | 'free_shipping';
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscount?: number;
  usageLimit?: number;
  perCustomerLimit?: number;
  startDate?: string;
  endDate?: string;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CmsCoupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minimumOrder: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  startDate?: string;
  endDate?: string;
  status: RecordStatus;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  transactionId: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  status: string;
  gatewayResponse?: unknown;
  paidAt?: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  zone: string;
  deliveryCharge: number;
  estimatedDeliveryDays: number;
  status: RecordStatus;
}

export interface ProductInquiry {
  id: string;
  productId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'pending' | 'replied' | 'closed';
  adminReply?: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  authorId: string;
  categoryId?: string;
  tags: string[];
  status: RecordStatus;
  publishedAt?: string;
  metaTitle: string;
  metaDescription: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  type: string;
  content: string;
  featuredImage?: string;
  status: RecordStatus;
  metaTitle: string;
  metaDescription: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface MediaFile {
  id: string;
  filename: string;
  mimeType: string;
  url: string;
  folder: string;
  size: number;
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
  websiteName: string;
  website_name?: string;
  backendName?: string;
  backend_name?: string;
  logo: string;
  favicon: string;
  phone: string;
  email: string;
  address: string;
  googleMap: string;
  facebook: string;
  instagram: string;
  youtube: string;
  linkedin: string;
  whatsapp: string;
  currency: string;
  timezone: string;
  defaultLanguage: string;
  maintenanceMode: boolean;

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

  // AI Assistant & Generation Settings
  aiSettings?: AiSettings;
  chatSettings?: ChatSettings;
}

export interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
  openGraphImage: string;
  robots: string;
  schemaMarkup?: string;
}

export interface SeoRedirect {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: 301 | 302;
}

export interface NotificationEvent {
  id: string;
  channel: 'email' | 'sms' | 'push' | 'whatsapp';
  event: string;
  payload: unknown;
  createdAt: string;
  sent: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  module: string;
  recordId?: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface RefreshTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  revokedAt?: string | null;
  createdAt: string;
}

export interface PasswordResetRecord {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  usedAt?: string | null;
}

export interface VerificationRecord {
  id: string;
  userId: string;
  type: 'email' | 'phone';
  tokenHash: string;
  expiresAt: string;
  usedAt?: string | null;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  variantId: string;
  productId: string;
  variantName: string;
  sku: string;
  price: number;
  salePrice?: number | null;
  stockQuantity: number;
  image?: string;
  status: RecordStatus;
}

export type ReviewModeration = 'pending' | 'approved' | 'rejected';

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
  deletedAt?: string | null;
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

export interface AiChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AiChatResponse {
  reply: string;
  provider: string;
  model: string;
  suggestedProducts?: any[];
  suggestedQuestions?: string[];
}

export interface AiProductCopyResponse {
  description: string;
  shortDescription: string;
  highlights: string[];
  stylingNotes: string;
  careInstructions: string;
}

export interface AiSeoResponse {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

export interface AiInquiryReplyResponse {
  reply: string;
  actionSuggestion: string;
  suggestedPriceQuotation?: number;
}

export interface AiReviewAnalysisResponse {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  keyThemes: string[];
  requiresUrgentAttention: boolean;
  suggestedReply: string;
}

export interface AiRecommendationItem {
  productId: string;
  title: string;
  slug: string;
  price: number;
  image?: string;
  category?: string;
  matchReason: string;
  stylingTip: string;
}

export interface AiUploadProductInput {
  prompt: string;
  overrides?: Partial<any>;
  dryRun?: boolean;
}

export interface AiUploadProductResponse {
  success: boolean;
  dryRun: boolean;
  product: any;
  summary: string;
}

export interface AiManageProductInput {
  command: string;
  productId?: string;
  targetQuery?: string;
  dryRun?: boolean;
}

export interface AiManageProductResponse {
  success: boolean;
  dryRun: boolean;
  product?: any;
  changes: Record<string, any>;
  summary: string;
}

export interface AiUpdateContentInput {
  prompt: string;
  target?: 'banner' | 'announcement' | 'page' | 'settings' | 'auto';
  bannerId?: string;
  pageSlug?: string;
  dryRun?: boolean;
}

export interface AiUpdateContentResponse {
  success: boolean;
  target: 'banner' | 'announcement' | 'page' | 'settings';
  dryRun: boolean;
  updatedRecord: any;
  summary: string;
}

export interface AiAdminCommandInput {
  command: string;
  dryRun?: boolean;
}

export interface AiAdminCommandResponse {
  success: boolean;
  actionType: 'product_upload' | 'product_manage' | 'content_update';
  summary: string;
  result: any;
  dryRun: boolean;
}

// ----------------- Live Chat Subsystem -----------------

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


