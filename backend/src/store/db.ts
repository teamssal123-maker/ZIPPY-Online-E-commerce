import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { config } from '../config/index.ts';
import { CATEGORIES, INITIAL_COUPONS, INITIAL_ORDERS, INITIAL_PRODUCTS, STORES } from '../data/catalog.ts';
import type {
  CartItem,
  Category,
  Coupon,
  Order,
  Product,
  ProductReview,
  StoreLocation,
  User
} from '../types/index.ts';
import type {
  AuditLog,
  Banner,
  BlogPost,
  Brand,
  ChatMessage,
  ChatSettings,
  ChatThread,
  CmsPage,
  HomepageSection,
  InventoryItem,
  InventoryTransaction,
  MediaFile,
  NavigationMenu,
  NotificationEvent,
  Offer,
  PasswordResetRecord,
  PaymentMethodConfig,
  PaymentRecord,
  ProductImage,
  ProductInquiry,
  ProductVariant,
  RefreshTokenRecord,
  RoleRecord,
  SeoRedirect,
  SeoSettings,
  ShippingMethod,
  VerificationRecord,
  Warehouse,
  WebsiteSettings
} from '../types/cms.ts';
import { createId } from '../utils/ids.ts';

export interface AuthUser extends User {
  passwordHash: string;
}

export interface DbShape {
  products: Product[];
  categories: Category[];
  coupons: Coupon[];
  orders: Order[];
  stores: StoreLocation[];
  reviews: ProductReview[];
  users: AuthUser[];
  carts: Record<string, CartItem[]>;
  wishlists: Record<string, string[]>;
  brands: Brand[];
  warehouses: Warehouse[];
  inventory: InventoryItem[];
  inventoryTransactions: InventoryTransaction[];
  banners: Banner[];
  homepageSections: HomepageSection[];
  navigation: NavigationMenu[];
  offers: Offer[];
  payments: PaymentRecord[];
  paymentMethods: PaymentMethodConfig[];
  shippingMethods: ShippingMethod[];
  inquiries: ProductInquiry[];
  blogPosts: BlogPost[];
  pages: CmsPage[];
  media: MediaFile[];
  settings: WebsiteSettings;
  seo: SeoSettings;
  redirects: SeoRedirect[];
  notifications: NotificationEvent[];
  auditLogs: AuditLog[];
  roles: RoleRecord[];
  refreshTokens: RefreshTokenRecord[];
  passwordResets: PasswordResetRecord[];
  verifications: VerificationRecord[];
  productImages: ProductImage[];
  productVariants: ProductVariant[];
  chatThreads: ChatThread[];
  chatMessages: ChatMessage[];
}

let cache: DbShape | null = null;
let writeChain: Promise<void> = Promise.resolve();

export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  autoReply: true,
  enabled: true,
  greetingMessage: 'Greetings from Zippy Atelier. Our bespoke concierges are at your service. How may we assist with fine fabrics, occasion styling, or tailoring today?',
  defaultAutoReply: "Thank you for contacting Zippy Gentleman's Atelier, {name}. A member of our concierge team has received your message and will review your request shortly. If your inquiry requires immediate priority, feel free to connect via WhatsApp at +880 1711-000001.",
  offlineMessage: 'Our Gulshan boutique stylists are currently away from the desk (open daily 10 AM – 10 PM). Please leave your inquiry and contact number, and we will contact you first thing in the morning.',
  aiSystemPrompt: 'You are the Senior Atelier Concierge for Zippy Dhaka, the premier gentleman menswear brand in Bangladesh. Provide polite, ultra-luxurious, concise answers about bespoke suits, panjabis, shirts, fittings, and delivery.',
  cannedReplies: [
    {
      id: 'canned-1',
      label: 'Bespoke Appointment',
      text: 'Good day. Our Master Tailor Maestro Kabir has consultation slots available at our Gulshan 1 flagship this week. Would morning (11 AM) or late afternoon (4:30 PM) suit your schedule best?',
      category: 'Appointments'
    },
    {
      id: 'canned-2',
      label: 'Order Delivery Update',
      text: 'Your order is currently being inspected and hand-packaged with our signature garment dust bag. Complimentary express courier within Dhaka typically arrives within 24–48 hours with signature confirmation.',
      category: 'Shipping'
    },
    {
      id: 'canned-3',
      label: 'Sizing & Alteration',
      text: 'Our garments feature tailored Italian cuts calibrated for Bangladeshi gentlemen. We offer complimentary alteration and sleeve tapering at any of our ateliers to guarantee your immaculate fit.',
      category: 'Fitting'
    },
    {
      id: 'canned-4',
      label: 'WhatsApp Priority Link',
      text: 'You may also reach our senior bespoke director directly via WhatsApp at +880 1711-000001 for real-time fabric swatches, bespoke measurements, and instant order updates.',
      category: 'Contact'
    }
  ],
  autoReplyRules: [
    {
      id: 'rule-order',
      name: 'Order Tracking & Delivery',
      keywords: ['order', 'track', 'delivery', 'courier', 'status'],
      reply: 'Greetings, {name}. For order tracking, you may provide your Order ID (e.g., ZP-1001) or check our Track Order portal. We offer complimentary 24–48 hour delivery inside Dhaka and 48–72 hours nationwide via express courier with signature verification.',
      enabled: true
    },
    {
      id: 'rule-bespoke',
      name: 'Bespoke & Tailoring Consultation',
      keywords: ['bespoke', 'tailor', 'fitting', 'custom', 'alteration', 'appointment'],
      reply: 'Delighted to assist, {name}. Our Master Tailors at the Zippy Gulshan 1 flagship atelier offer private fitting consultations for suits, sherwanis, and formal blazers. We would be pleased to reserve a 45-minute bespoke appointment for you this week. Would morning or late afternoon suit you best?',
      enabled: true
    },
    {
      id: 'rule-size',
      name: 'Sizing & Measurements',
      keywords: ['size', 'fit', 'measurement', 'chart'],
      reply: 'Our garments follow precise European sartorial grading with tailored Dhaka proportions: Slim Fit for a tapered contour and Classic Fit for ease. We also provide complimentary alteration services at any of our ateliers to achieve your immaculate fit.',
      enabled: true
    },
    {
      id: 'rule-store',
      name: 'Boutique Locations & Hours',
      keywords: ['store', 'location', 'atelier', 'hours', 'gulshan', 'dhanmondi', 'uttara'],
      reply: 'Our flagship atelier is located at Gulshan 1, Dhaka, open daily from 10:00 AM to 10:00 PM. We also welcome you at our Dhanmondi and Uttara locations. You may also reach our Senior Concierge directly on WhatsApp at +880 1711-000001.',
      enabled: true
    },
    {
      id: 'rule-offers',
      name: 'Privileges & Promotional Offers',
      keywords: ['price', 'discount', 'coupon', 'offer', 'promo', 'sale'],
      reply: 'We currently offer a welcoming privilege: use code VIPGENTLEMAN for 10% off your purchase above ৳5,000, along with complimentary expedited delivery across Dhaka.',
      enabled: true
    }
  ],
  instantInquiries: [
    {
      id: 'inquiry-order',
      label: '📦 Track Order',
      prompt: 'Could you help me check the delivery status of my order?',
      category: 'Orders',
      enabled: true
    },
    {
      id: 'inquiry-bespoke',
      label: '✂️ Bespoke Fitting',
      prompt: 'I would like to reserve a bespoke tailoring consultation at Gulshan 1.',
      category: 'Tailoring',
      enabled: true
    },
    {
      id: 'inquiry-size',
      label: '📏 Size & Fit Advice',
      prompt: 'Could you advise on the fit difference between Slim Fit and Tailored Fit?',
      category: 'Sizing',
      enabled: true
    },
    {
      id: 'inquiry-locations',
      label: '📍 Atelier Locations',
      prompt: 'What are the boutique hours and address of your Gulshan flagship?',
      category: 'Stores',
      enabled: true
    }
  ]
};

const DEFAULT_SETTINGS: WebsiteSettings = {
  websiteName: 'Zippy',
  logo: '/logo.svg',
  favicon: '/favicon.ico',
  phone: '+880 1711-000001',
  email: 'hello@zippy.com.bd',
  address: 'Gulshan 1, Dhaka, Bangladesh',
  googleMap: 'https://maps.google.com/?q=Gulshan+1+Dhaka',
  facebook: 'https://facebook.com/zippybd',
  instagram: 'https://instagram.com/zippybd',
  youtube: 'https://youtube.com/@zippybd',
  linkedin: 'https://linkedin.com/company/zippybd',
  whatsapp: '+8801711000001',
  currency: 'BDT',
  timezone: 'Asia/Dhaka',
  defaultLanguage: 'en',
  maintenanceMode: false,

  // Header Customization Defaults
  headerAnnouncementEnabled: true,
  headerAnnouncementText: 'Complimentary Dhaka Delivery on Orders Above ৳3,000',
  headerHotline: '+880 9612-742462',
  headerLocatorText: 'Atelier Locator',
  headerLocatorUrl: '/stores',
  headerTrackOrderText: 'Track Order',
  headerTrackOrderUrl: '/track-order',
  headerSticky: true,
  headerShowSearch: true,
  headerShowAccount: true,
  headerShowWishlist: true,
  headerShowCart: true,
  headerNavItems: [
    { id: 'nav-home', label: 'HOME', url: '/', slug: 'home', isHome: true },
    { id: 'nav-sale', label: 'SALE', url: '/shop/sale', slug: 'sale', highlight: true, badge: 'UP TO 35%' },
    { id: 'nav-new', label: 'NEW ARRIVALS', url: '/shop/new-arrivals', slug: 'new-arrivals' },
    { id: 'nav-blazer', label: 'BLAZER', url: '/shop/blazer', slug: 'blazer' },
    { id: 'nav-shirt', label: 'SHIRT', url: '/shop/shirt', slug: 'shirt' },
    { id: 'nav-polo', label: 'POLO', url: '/shop/polo', slug: 'polo' },
    { id: 'nav-pant', label: 'PANT', url: '/shop/pant', slug: 'pant' },
    { id: 'nav-ethnic', label: 'ETHNIC WEAR', url: '/shop/ethnic-wear', slug: 'ethnic-wear' },
    { id: 'nav-acc', label: 'ACCESSORIES', url: '/shop/accessories', slug: 'accessories' }
  ],

  // Footer Customization Defaults
  footerPillarsEnabled: true,
  footerPillars: [
    {
      id: 'pillar-1',
      icon: 'truck',
      title: 'Complimentary Delivery',
      description: 'On all Dhaka orders exceeding ৳3,000. Nationwide courier dispatch.'
    },
    {
      id: 'pillar-2',
      icon: 'shield',
      title: 'Master Tailoring',
      description: 'Super 130s Italian wool, Egyptian Giza cotton, and artisanal cuts.'
    },
    {
      id: 'pillar-3',
      icon: 'refresh',
      title: '7-Day Boutique Exchange',
      description: 'Hassle-free size and style exchange across all flagship stores.'
    },
    {
      id: 'pillar-4',
      icon: 'phone',
      title: 'Dedicated Concierge',
      description: 'Expert stylists available 7 days a week: +880 9612-742462.'
    }
  ],
  footerTagline: "The Gentleman's Wardrobe",
  footerAboutText: "Founded on the belief that sartorial refinement is an attitude, Zippy curates bespoke blazers, pure Egyptian cotton shirts, executive polos, and festive ethnic wear for the distinguished gentlemen of Bangladesh.",
  footerCol1Title: 'Collections',
  footerCol1Links: [
    { id: 'col1-1', label: 'Italian Wool Blazers', url: '/shop/blazer' },
    { id: 'col1-2', label: 'Egyptian Giza Shirts', url: '/shop/shirt' },
    { id: 'col1-3', label: 'Festive Silk Panjabis', url: '/shop/ethnic-wear' },
    { id: 'col1-4', label: 'Mercerized Polos', url: '/shop/polo' },
    { id: 'col1-5', label: 'Tailored Trousers & Chinos', url: '/shop/pant' },
    { id: 'col1-6', label: 'Handmade Leather Oxfords', url: '/shop/accessories' },
    { id: 'col1-7', label: 'Sale Privileges', url: '/shop/sale', highlight: true }
  ],
  footerCol2Title: 'Client Services',
  footerCol2Links: [
    { id: 'col2-1', label: 'Track Order Status', url: '/track-order' },
    { id: 'col2-2', label: 'Bespoke Size Guide', url: '#size-guide' },
    { id: 'col2-3', label: 'Boutique Locator', url: '/stores' },
    { id: 'col2-4', label: 'The Atelier Heritage', url: '/about' },
    { id: 'col2-5', label: 'Shipping & Delivery', url: '/faq' },
    { id: 'col2-6', label: 'Return & Exchange Policy', url: '/returns' }
  ],
  footerNewsletterEnabled: true,
  footerNewsletterTitle: 'Privilege Circle',
  footerNewsletterSubtitle: 'Receive private invitations to preview seasonal collections and bespoke trunk shows.',
  footerCopyright: '© {year} {brand} Bangladesh. All rights reserved. Refined luxury menswear.',
  footerPaymentBadges: ['CASH ON DELIVERY', 'bKash', 'SSLCOMMERZ', 'VISA / MASTERCARD'],
  aiSettings: {
    enabled: true,
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    temperature: 0.7,
    maxTokens: 1024,
    systemPrompt:
      'You are the Master Bespoke Stylist and Atelier Concierge for Zippy Bangladesh — the premier luxury gentleman fashion atelier located in Gulshan 1, Dhaka. You provide sophisticated, knowledgeable sartorial advice on fabric, fit, styling combinations, occasion wear (weddings, galas, executive meetings), and bespoke tailoring.',
    features: {
      stylistChat: true,
      productCopy: true,
      seoGeneration: true,
      inquiryAutoReply: true,
      reviewAnalysis: true,
      recommendations: true,
      chatAutoReply: true
    }
  },
  chatSettings: { ...DEFAULT_CHAT_SETTINGS }
};

const DEFAULT_SEO: SeoSettings = {
  metaTitle: 'Zippy Atelier | Bespoke Menswear Bangladesh',
  metaDescription: 'Premium tailored menswear, Italian wool, and executive shirts from Dhaka.',
  metaKeywords: 'menswear, tailor, dhaka, blazer, shirt',
  canonicalUrl: 'https://zippy.com.bd',
  openGraphImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop',
  robots: 'index,follow'
};

const DEFAULT_ROLES: RoleRecord[] = [
  {
    id: 'role-super-admin',
    name: 'super_admin',
    label: 'Super Admin',
    permissions: ['*']
  },
  {
    id: 'role-admin',
    name: 'admin',
    label: 'Admin',
    permissions: [
      'products.view',
      'products.create',
      'products.update',
      'products.delete',
      'products.publish',
      'categories.view',
      'categories.create',
      'categories.update',
      'categories.delete',
      'inventory.view',
      'inventory.create',
      'inventory.update',
      'inventory.stock_adjustment',
      'orders.view',
      'orders.create',
      'orders.update',
      'orders.cancel',
      'orders.refund',
      'orders.delete',
      'customers.view',
      'customers.create',
      'customers.update',
      'customers.delete',
      'banners.view',
      'banners.create',
      'banners.update',
      'banners.delete',
      'banners.publish',
      'pages.view',
      'pages.create',
      'pages.update',
      'pages.delete',
      'pages.publish',
      'settings.view',
      'settings.update',
      'reports.view',
      'reports.export'
    ]
  },
  {
    id: 'role-manager',
    name: 'manager',
    label: 'Manager',
    permissions: [
      'products.view',
      'products.create',
      'products.update',
      'products.publish',
      'categories.view',
      'inventory.view',
      'orders.view',
      'orders.update',
      'customers.view',
      'reports.view'
    ]
  },
  {
    id: 'role-inventory',
    name: 'inventory_manager',
    label: 'Inventory Manager',
    permissions: ['inventory.view', 'inventory.create', 'inventory.update', 'inventory.stock_adjustment', 'products.view']
  },
  {
    id: 'role-sales',
    name: 'sales_manager',
    label: 'Sales Manager',
    permissions: ['orders.view', 'orders.update', 'orders.cancel', 'orders.refund', 'orders.delete', 'customers.view', 'reports.view']
  },
  {
    id: 'role-content',
    name: 'content_manager',
    label: 'Content Manager',
    permissions: [
      'banners.view',
      'banners.create',
      'banners.update',
      'banners.publish',
      'pages.view',
      'pages.create',
      'pages.update',
      'pages.publish',
      'products.view'
    ]
  },
  {
    id: 'role-editor',
    name: 'editor',
    label: 'Editor',
    permissions: ['pages.view', 'pages.update', 'banners.view', 'banners.update', 'products.view']
  },
  {
    id: 'role-support',
    name: 'support_staff',
    label: 'Support Staff',
    permissions: ['orders.view', 'customers.view', 'products.view']
  }
];

export const DEFAULT_PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: 'pm-cod',
    code: 'COD',
    name: 'Cash on Delivery',
    type: 'cod',
    description: 'Pay comfortably with cash upon inspection and arrival at your doorstep across all 64 districts.',
    instructions: 'Keep exact cash ready for the courier delivery associate. Verification SMS or dispatch confirmation will be sent to your mobile phone.',
    status: 'active',
    isDefault: true,
    testMode: false,
    additionalFee: 0,
    badge: 'RECOMMENDED',
    currency: 'BDT',
    maxOrderAmount: 50000,
    sortOrder: 1,
    createdAt: '2026-09-29T00:00:00.000Z',
    updatedAt: '2026-09-29T00:00:00.000Z'
  },
  {
    id: 'pm-bkash',
    code: 'BKASH',
    name: 'bKash Direct & Merchant Payment',
    type: 'mobile_banking',
    description: 'Instant mobile checkout via bKash Merchant Wallet with direct transaction ID verification.',
    instructions: '1. Open bKash App or dial *247#\n2. Select "Make Payment" or "Send Money"\n3. Enter Merchant Wallet: 01712-345678\n4. Enter total order amount and Order Number as Reference\n5. Input TrxID during checkout',
    status: 'active',
    isDefault: false,
    testMode: true,
    additionalFee: 0,
    badge: 'INSTANT VERIFICATION',
    accountNumber: '01712-345678',
    accountType: 'Merchant Wallet',
    merchantId: 'zippy_bkash_merchant_live',
    currency: 'BDT',
    sortOrder: 2,
    createdAt: '2026-09-29T00:00:00.000Z',
    updatedAt: '2026-09-29T00:00:00.000Z'
  },
  {
    id: 'pm-nagad',
    code: 'NAGAD',
    name: 'Nagad Mobile Banking',
    type: 'mobile_banking',
    description: 'Fast, secure contactless checkout with Nagad mobile financial service.',
    instructions: '1. Open Nagad App or dial *167#\n2. Select "Merchant Pay"\n3. Enter Merchant Wallet: 01712-345678\n4. Enter order invoice amount and Order Number as Reference\n5. Enter TrxID during confirmation',
    status: 'active',
    isDefault: false,
    testMode: true,
    additionalFee: 0,
    badge: 'ZERO SURCHARGE',
    accountNumber: '01712-345678',
    accountType: 'Merchant Account',
    merchantId: 'zippy_nagad_merchant',
    currency: 'BDT',
    sortOrder: 3,
    createdAt: '2026-09-29T00:00:00.000Z',
    updatedAt: '2026-09-29T00:00:00.000Z'
  },
  {
    id: 'pm-sslcommerz',
    code: 'SSLCOMMERZ',
    name: 'SSLCommerz Gateway (Cards & Net Banking)',
    type: 'gateway',
    description: 'PCI-DSS certified 256-bit encrypted checkout with Visa, Mastercard, AMEX, and Bangladeshi Internet Banking.',
    instructions: 'You will be securely redirected to the certified SSLCommerz payment portal to complete payment with any debit/credit card or net banking.',
    status: 'active',
    isDefault: false,
    testMode: true,
    additionalFee: 0,
    badge: 'VISA / MASTERCARD / AMEX',
    merchantId: 'zippy_atelier_sandbox',
    currency: 'BDT',
    sortOrder: 4,
    createdAt: '2026-09-29T00:00:00.000Z',
    updatedAt: '2026-09-29T00:00:00.000Z'
  },
  {
    id: 'pm-bank',
    code: 'BANK_TRANSFER',
    name: 'Direct Atelier Bank Transfer',
    type: 'bank_transfer',
    description: 'Corporate and bespoke electronic fund transfer (EFT / RTGS / NPSB) to atelier corporate bank account.',
    instructions: 'Bank: City Bank PLC | A/C Name: Zippy Lifestyle Ltd | A/C No: 1102938475001 | Branch: Gulshan 1, Dhaka | Routing: 225271827. Please email your transfer slip to accounts@zippy.com.bd with your order number.',
    status: 'inactive',
    isDefault: false,
    testMode: false,
    additionalFee: 0,
    badge: 'CORPORATE & BESPOKE',
    accountNumber: '1102938475001',
    accountType: 'Corporate Current Account',
    currency: 'BDT',
    sortOrder: 5,
    createdAt: '2026-09-29T00:00:00.000Z',
    updatedAt: '2026-09-29T00:00:00.000Z'
  }
];

function emptyDb(): DbShape {
  return {
    products: [],
    categories: [],
    coupons: [],
    orders: [],
    stores: [],
    reviews: [],
    users: [],
    carts: {},
    wishlists: {},
    brands: [],
    warehouses: [],
    inventory: [],
    inventoryTransactions: [],
    banners: [],
    homepageSections: [],
    navigation: [],
    offers: [],
    payments: [],
    paymentMethods: [],
    shippingMethods: [],
    inquiries: [],
    blogPosts: [],
    pages: [],
    media: [],
    settings: { ...DEFAULT_SETTINGS },
    seo: { ...DEFAULT_SEO },
    redirects: [],
    notifications: [],
    auditLogs: [],
    roles: DEFAULT_ROLES,
    refreshTokens: [],
    passwordResets: [],
    verifications: [],
    productImages: [],
    productVariants: [],
    chatThreads: [],
    chatMessages: []
  };
}

function seedReviews(): ProductReview[] {
  return [
    {
      id: 'rev-1',
      productId: 'prod-01',
      authorName: 'Tanvir Ahmed',
      rating: 5,
      date: 'September 18, 2026',
      comment:
        'The drape and shoulder construction of this blazer is on par with bespoke Italian suiting houses. Wore it to a high-profile corporate gala in Dhaka and received countless compliments.',
      verifiedPurchase: true
    },
    {
      id: 'rev-2',
      productId: 'prod-01',
      authorName: 'Rashid Al-Mamun',
      rating: 5,
      date: 'September 12, 2026',
      comment:
        'Fabric is remarkably breathable and comfortable in our humid weather. The horn buttons and clean lapel stitching showcase the premium quality.',
      verifiedPurchase: true
    },
    {
      id: 'rev-3',
      productId: 'prod-04',
      authorName: 'Imran Chowdhury',
      rating: 5,
      date: 'September 10, 2026',
      comment: 'Giza cotton is exceptional. Collar holds shape after a full work week.',
      verifiedPurchase: true
    },
    {
      id: 'rev-4',
      productId: 'prod-09',
      authorName: 'Farhan Kabir',
      rating: 5,
      date: 'September 08, 2026',
      comment: 'The zari embroidery is exquisite. Perfect for Eid gatherings.',
      verifiedPurchase: true
    }
  ];
}

function seedUsers(): AuthUser[] {
  const hash = (password: string) => bcrypt.hashSync(password, config.bcryptRounds);
  return [
    {
      id: 'user-01',
      fullName: 'Tahmidur Rahman',
      email: 'tahmid.rahman@example.com',
      phone: '+880 1712-345678',
      role: 'CUSTOMER',
      firstName: 'Tahmidur',
      lastName: 'Rahman',
      status: 'active',
      emailVerified: true,
      phoneVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      passwordHash: hash('richman123'),
      savedAddresses: [
        {
          id: 'addr-1',
          label: 'Home (Uttara)',
          address: 'House 18, Road 7, Sector 4, Uttara',
          division: 'Dhaka',
          district: 'Dhaka City',
          phone: '+880 1712-345678',
          isDefault: true
        }
      ]
    },
    {
      id: 'user-vip',
      fullName: 'VIP Patron',
      email: 'client.vip@richmanbd.com',
      phone: '+880 1712-345678',
      role: 'CUSTOMER',
      firstName: 'VIP',
      lastName: 'Patron',
      status: 'active',
      emailVerified: true,
      phoneVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      passwordHash: hash('vip123'),
      savedAddresses: [
        {
          id: 'addr-default',
          label: 'Primary Residence',
          address: 'House 14, Road 11, Gulshan 1, Dhaka',
          division: 'Dhaka',
          district: 'Dhaka City',
          phone: '+880 1712-345678',
          isDefault: true
        }
      ]
    },
    {
      id: 'user-admin',
      fullName: 'Atelier Director',
      email: 'admin@richmanbd.com',
      phone: '+880 1711-000001',
      role: 'ADMIN',
      firstName: 'Atelier',
      lastName: 'Director',
      status: 'active',
      roleId: 'role-super-admin',
      adminRole: 'super_admin',
      emailVerified: true,
      phoneVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      passwordHash: hash('admin123'),
      savedAddresses: []
    },
    {
      id: 'user-vip-zippy',
      fullName: 'VIP Patron',
      email: 'vip@zippy.com.bd',
      phone: '+880 1712-345678',
      role: 'CUSTOMER',
      firstName: 'VIP',
      lastName: 'Patron',
      status: 'active',
      emailVerified: true,
      phoneVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      passwordHash: hash('vip123'),
      savedAddresses: [
        {
          id: 'addr-default-zp',
          label: 'Primary Residence',
          address: 'House 14, Road 11, Gulshan 1, Dhaka',
          division: 'Dhaka',
          district: 'Dhaka City',
          phone: '+880 1712-345678',
          isDefault: true
        }
      ]
    },
    {
      id: 'user-admin-zippy',
      fullName: 'Atelier Director',
      email: 'admin@zippy.com.bd',
      phone: '+880 1711-000001',
      role: 'ADMIN',
      firstName: 'Atelier',
      lastName: 'Director',
      status: 'active',
      roleId: 'role-super-admin',
      adminRole: 'super_admin',
      emailVerified: true,
      phoneVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      passwordHash: hash('admin123'),
      savedAddresses: []
    }
  ];
}

function nowIso() {
  return new Date().toISOString();
}

function seedCms(products: Product[]): Pick<
  DbShape,
  | 'brands'
  | 'warehouses'
  | 'inventory'
  | 'inventoryTransactions'
  | 'banners'
  | 'homepageSections'
  | 'navigation'
  | 'offers'
  | 'payments'
  | 'paymentMethods'
  | 'shippingMethods'
  | 'inquiries'
  | 'blogPosts'
  | 'pages'
  | 'media'
  | 'settings'
  | 'seo'
  | 'redirects'
  | 'notifications'
  | 'auditLogs'
  | 'roles'
  | 'refreshTokens'
  | 'passwordResets'
  | 'verifications'
  | 'productImages'
  | 'productVariants'
> {
  const warehouseId = 'wh-dhaka';
  const brandId = 'brand-zippy';
  const ts = nowIso();
  return {
    brands: [
      {
        id: brandId,
        name: 'Zippy Atelier',
        slug: 'zippy-atelier',
        logo: '/logo.svg',
        banner: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1600&auto=format&fit=crop',
        description: 'House brand for bespoke Bangladeshi menswear.',
        website: 'https://zippy.com.bd',
        status: 'active',
        sortOrder: 1,
        metaTitle: 'Zippy Atelier',
        metaDescription: 'Bespoke menswear from Dhaka.',
        createdAt: ts,
        updatedAt: ts
      },
      {
        id: 'brand-richman',
        name: 'Zippy Atelier',
        slug: 'richman-atelier',
        logo: '/logo.svg',
        banner: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1600&auto=format&fit=crop',
        description: 'House brand for bespoke Bangladeshi menswear.',
        website: 'https://zippy.com.bd',
        status: 'active',
        sortOrder: 2,
        metaTitle: 'Zippy Atelier',
        metaDescription: 'Bespoke menswear from Dhaka.',
        createdAt: ts,
        updatedAt: ts
      }
    ],
    warehouses: [
      {
        id: warehouseId,
        name: 'Dhaka Atelier Warehouse',
        code: 'DHK-01',
        address: 'Tejgaon Industrial Area, Dhaka',
        phone: '+880 1711-000010',
        manager: 'Atelier Director',
        status: 'active'
      }
    ],
    inventory: products.map((product) => {
      const quantity = Object.values(product.stock).reduce((a, b) => a + b, 0);
      return {
        id: `inv-${product.id}`,
        productId: product.id,
        warehouseId,
        quantity,
        reservedQuantity: 0,
        availableQuantity: quantity,
        minimumStock: product.lowStockThreshold ?? 8,
        maximumStock: Math.max(quantity, 50),
        updatedAt: ts
      };
    }),
    inventoryTransactions: products.slice(0, 3).map((product) => ({
      id: `txn-${product.id}`,
      productId: product.id,
      warehouseId,
      type: 'opening_stock' as const,
      quantity: Object.values(product.stock).reduce((a, b) => a + b, 0),
      reference: 'SEED',
      note: 'Opening stock',
      createdBy: 'user-admin',
      createdAt: ts
    })),
    banners: [
      {
        id: 'banner-hero',
        title: 'Autumn Atelier',
        subtitle: 'Italian wool, cut in Dhaka.',
        imageDesktop: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1600&auto=format&fit=crop',
        imageMobile: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
        buttonText: 'Shop the Look',
        buttonUrl: '/shop',
        position: 'hero',
        sortOrder: 1,
        status: 'published',
        createdAt: ts,
        updatedAt: ts
      }
    ],
    homepageSections: [
      { id: 'sec-hero', type: 'hero_banner', title: 'Hero', config: { bannerId: 'banner-hero' }, sortOrder: 1, status: 'published' },
      { id: 'sec-cats', type: 'featured_categories', title: 'Categories', config: {}, sortOrder: 2, status: 'published' },
      { id: 'sec-feat', type: 'featured_products', title: 'Featured', config: {}, sortOrder: 3, status: 'published' },
      { id: 'sec-new', type: 'new_arrivals', title: 'New Arrivals', config: {}, sortOrder: 4, status: 'published' }
    ],
    navigation: [
      {
        id: 'nav-header',
        location: 'header',
        items: [
          { id: 'nav-shop', label: 'Shop', url: '/shop', sortOrder: 1 },
          { id: 'nav-atelier', label: 'Atelier', url: '/atelier', sortOrder: 2 },
          { id: 'nav-stores', label: 'Stores', url: '/stores', sortOrder: 3 }
        ]
      },
      {
        id: 'nav-footer',
        location: 'footer',
        items: [
          { id: 'nav-about', label: 'About', url: '/about', sortOrder: 1 },
          { id: 'nav-privacy', label: 'Privacy', url: '/privacy-policy', sortOrder: 2 },
          { id: 'nav-returns', label: 'Returns', url: '/return-policy', sortOrder: 3 }
        ]
      }
    ],
    offers: [
      {
        id: 'offer-free-ship',
        name: 'Free Shipping over ৳3000',
        discountType: 'free_shipping',
        discountValue: 0,
        minimumOrderAmount: 3000,
        status: 'active',
        createdAt: ts,
        updatedAt: ts
      }
    ],
    payments: [],
    paymentMethods: structuredClone(DEFAULT_PAYMENT_METHODS),
    shippingMethods: [
      {
        id: 'ship-dhaka',
        name: 'Inside Dhaka',
        zone: 'inside_dhaka',
        deliveryCharge: 100,
        estimatedDeliveryDays: 2,
        status: 'active'
      },
      {
        id: 'ship-outside',
        name: 'Outside Dhaka',
        zone: 'outside_dhaka',
        deliveryCharge: 150,
        estimatedDeliveryDays: 5,
        status: 'active'
      }
    ],
    inquiries: [],
    blogPosts: [
      {
        id: 'blog-fit-guide',
        title: 'The Dhaka Gentleman Fit Guide',
        slug: 'dhaka-gentleman-fit-guide',
        excerpt: 'How to wear tailored wool in tropical humidity.',
        content: '<p>Choose Super 120s, half-canvas construction, and breathable linings.</p>',
        featuredImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1200&auto=format&fit=crop',
        authorId: 'user-admin',
        tags: ['fit', 'wool', 'dhaka'],
        status: 'published',
        publishedAt: ts,
        metaTitle: 'Fit Guide',
        metaDescription: 'Tailoring advice for Bangladesh weather.',
        createdAt: ts,
        updatedAt: ts
      }
    ],
    pages: [
      {
        id: 'page-about',
        title: 'About Us',
        slug: 'about-us',
        type: 'about_us',
        content: '<p>Zippy Atelier crafts executive menswear in Dhaka.</p>',
        status: 'published',
        metaTitle: 'About Zippy',
        metaDescription: 'Our atelier story.',
        updatedAt: ts
      },
      {
        id: 'page-privacy',
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        type: 'privacy_policy',
        content: '<p>We respect your data.</p>',
        status: 'published',
        metaTitle: 'Privacy Policy',
        metaDescription: 'How we handle personal data.',
        updatedAt: ts
      },
      {
        id: 'page-terms',
        title: 'Terms & Conditions',
        slug: 'terms-conditions',
        type: 'terms_conditions',
        content: '<p>Standard terms of sale.</p>',
        status: 'published',
        metaTitle: 'Terms',
        metaDescription: 'Terms of sale.',
        updatedAt: ts
      },
      {
        id: 'page-returns',
        title: 'Return Policy',
        slug: 'return-policy',
        type: 'return_policy',
        content: '<p>Returns within 7 days for unused garments.</p>',
        status: 'published',
        metaTitle: 'Returns',
        metaDescription: 'Return window and conditions.',
        updatedAt: ts
      },
      {
        id: 'page-shipping',
        title: 'Shipping Policy',
        slug: 'shipping-policy',
        type: 'shipping_policy',
        content: '<p>Free shipping over ৳3000.</p>',
        status: 'published',
        metaTitle: 'Shipping',
        metaDescription: 'Delivery zones and charges.',
        updatedAt: ts
      }
    ],
    media: [],
    settings: { ...DEFAULT_SETTINGS },
    seo: { ...DEFAULT_SEO },
    redirects: [],
    notifications: [],
    auditLogs: [],
    roles: structuredClone(DEFAULT_ROLES),
    refreshTokens: [],
    passwordResets: [],
    verifications: [],
    productImages: products.flatMap((product) =>
      (product.images || []).map((url, index) => ({
        id: `img-${product.id}-${index}`,
        productId: product.id,
        url,
        altText: product.name,
        isPrimary: index === 0,
        sortOrder: index
      }))
    ),
    productVariants: products.flatMap((product) =>
      product.sizes.map((size) => ({
        variantId: `${product.id}-${size}`,
        productId: product.id,
        variantName: size,
        sku: `${product.sku}-${size}`,
        price: product.price,
        salePrice: product.salePrice,
        stockQuantity: product.stock[size] ?? 0,
        status: 'active' as const
      }))
    )
  };
}

function seedChatThreads(): ChatThread[] {
  const ts = nowIso();
  return [
    {
      id: 'thread-vip-001',
      customerName: 'Tahmidur Rahman',
      customerEmail: 'tahmid.rahman@example.com',
      customerPhone: '+880 1712-345678',
      userId: 'user-01',
      status: 'active',
      subject: 'Bespoke Blazer Fitting at Gulshan Atelier',
      lastMessageText: 'Certainly, Mr. Rahman. We have reserved our master tailor for Thursday at 4:30 PM.',
      lastMessageAt: ts,
      lastSenderRole: 'concierge',
      unreadCountAdmin: 0,
      unreadCountCustomer: 0,
      assignedTo: 'Atelier Director',
      tags: ['Bespoke', 'Fitting', 'VIP'],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      updatedAt: ts
    },
    {
      id: 'thread-guest-002',
      customerName: 'Shafin Ahmed',
      customerPhone: '+880 1819-998877',
      status: 'waiting_admin',
      subject: 'Express Delivery in Banani',
      lastMessageText: 'Could you confirm if same-day courier is possible for Banani Block D today?',
      lastMessageAt: ts,
      lastSenderRole: 'customer',
      unreadCountAdmin: 1,
      unreadCountCustomer: 0,
      tags: ['Delivery', 'Inquiry'],
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      updatedAt: ts
    }
  ];
}

function seedChatMessages(): ChatMessage[] {
  const ts = nowIso();
  return [
    {
      id: 'msg-001',
      threadId: 'thread-vip-001',
      senderRole: 'customer',
      senderName: 'Tahmidur Rahman',
      senderId: 'user-01',
      message: 'Good afternoon. I purchased the Navy Super 150s Wool Suit and would like to arrange a bespoke sleeve and waist adjustment at the Gulshan flagship.',
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      readAt: ts
    },
    {
      id: 'msg-002',
      threadId: 'thread-vip-001',
      senderRole: 'concierge',
      senderName: 'Zippy Concierge',
      message: 'Good afternoon Mr. Rahman. It is our pleasure to assist. Our master tailor Maestro Kabir is available this Thursday between 3:00 PM and 6:00 PM. Would 4:30 PM suit your schedule?',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      readAt: ts
    },
    {
      id: 'msg-003',
      threadId: 'thread-vip-001',
      senderRole: 'customer',
      senderName: 'Tahmidur Rahman',
      senderId: 'user-01',
      message: 'Thursday at 4:30 PM works splendidly for me. Will I need to bring my dress shoes for the trouser hem assessment?',
      createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      readAt: ts
    },
    {
      id: 'msg-004',
      threadId: 'thread-vip-001',
      senderRole: 'concierge',
      senderName: 'Zippy Concierge',
      message: 'Certainly, Mr. Rahman. Bringing the intended dress shoes ensures an immaculate break on your trousers. We have reserved our master tailor for Thursday at 4:30 PM at our Gulshan Atelier private suite.',
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      readAt: ts
    },
    {
      id: 'msg-101',
      threadId: 'thread-guest-002',
      senderRole: 'customer',
      senderName: 'Shafin Ahmed',
      message: 'Hello! I need the Pure Silk Pocket Square and Onyx Cufflinks for a reception tonight. Could you confirm if same-day courier is possible for Banani Block D today?',
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      readAt: null
    }
  ];
}

function seedDb(): DbShape {
  const products = structuredClone(INITIAL_PRODUCTS).map((product) => ({
    ...product,
    brandId: 'brand-zippy',
    status: 'published' as const,
    isActive: true,
    stockQuantity: Object.values(product.stock).reduce((a, b) => a + b, 0),
    lowStockThreshold: 8,
    createdAt: nowIso(),
    updatedAt: nowIso()
  }));
  const categories = structuredClone(CATEGORIES).map((category, index) => ({
    ...category,
    status: 'active' as const,
    sortOrder: index + 1,
    createdAt: nowIso(),
    updatedAt: nowIso()
  }));
  const reviews = seedReviews().map((review) => ({
    ...review,
    status: 'approved' as const,
    createdAt: nowIso()
  }));
  return {
    products,
    categories,
    coupons: structuredClone(INITIAL_COUPONS),
    orders: structuredClone(INITIAL_ORDERS),
    stores: structuredClone(STORES),
    reviews,
    users: seedUsers(),
    carts: {},
    wishlists: {
      'user-01': ['prod-01', 'prod-04']
    },
    chatThreads: seedChatThreads(),
    chatMessages: seedChatMessages(),
    ...seedCms(products)
  };
}

function persist(db: DbShape) {
  const dir = path.dirname(config.dataFile);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(config.dataFile, JSON.stringify(db, null, 2), 'utf8');
}

export function loadDb(): DbShape {
  if (cache) return cache;
  if (!existsSync(config.dataFile)) {
    cache = seedDb();
    persist(cache);
    return cache;
  }
  try {
    const parsed = JSON.parse(readFileSync(config.dataFile, 'utf8')) as Partial<DbShape>;
    const base = emptyDb();
    cache = { ...base, ...parsed, settings: { ...base.settings, ...parsed.settings }, seo: { ...base.seo, ...parsed.seo } };
    if (!cache.roles?.length) cache.roles = structuredClone(DEFAULT_ROLES);
    if (!cache.warehouses?.length || !cache.brands?.length) {
      const seeded = seedCms(cache.products.length ? cache.products : structuredClone(INITIAL_PRODUCTS));
      cache.brands = cache.brands?.length ? cache.brands : seeded.brands;
      cache.warehouses = cache.warehouses?.length ? cache.warehouses : seeded.warehouses;
      cache.inventory = cache.inventory?.length ? cache.inventory : seeded.inventory;
      cache.banners = cache.banners?.length ? cache.banners : seeded.banners;
      cache.homepageSections = cache.homepageSections?.length ? cache.homepageSections : seeded.homepageSections;
      cache.navigation = cache.navigation?.length ? cache.navigation : seeded.navigation;
      cache.pages = cache.pages?.length ? cache.pages : seeded.pages;
      cache.shippingMethods = cache.shippingMethods?.length ? cache.shippingMethods : seeded.shippingMethods;
      cache.offers = cache.offers?.length ? cache.offers : seeded.offers;
      cache.blogPosts = cache.blogPosts?.length ? cache.blogPosts : seeded.blogPosts;
    }
    if (!cache.paymentMethods || !cache.paymentMethods.length) {
      cache.paymentMethods = structuredClone(DEFAULT_PAYMENT_METHODS);
    }
    if (!cache.chatThreads || !cache.chatThreads.length) {
      cache.chatThreads = seedChatThreads();
      cache.chatMessages = seedChatMessages();
    }
    return cache;
  } catch {
    cache = seedDb();
    persist(cache);
    return cache;
  }
}

export function resetDb(): DbShape {
  cache = seedDb();
  persist(cache);
  return cache;
}

export async function mutateDb<T>(mutator: (db: DbShape) => T | Promise<T>): Promise<T> {
  const run = async () => {
    const db = loadDb();
    const result = await mutator(db);
    persist(db);
    return result;
  };
  const next = writeChain.then(run, run);
  writeChain = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

export function publicUser(user: AuthUser): User {
  const { passwordHash: _passwordHash, ...safe } = user;
  return safe;
}

export function findUserByEmail(email: string): AuthUser | undefined {
  return loadDb().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): AuthUser | undefined {
  return loadDb().users.find((u) => u.id === id);
}

export function ensureGuestKey(key?: string): string {
  return key && key.trim() ? key.trim() : createId('guest');
}
