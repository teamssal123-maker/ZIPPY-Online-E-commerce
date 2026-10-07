import React, { useEffect, useState, useRef } from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  Boxes,
  Building2,
  ShoppingBag,
  Users,
  Star,
  MessageSquare,
  Image as ImageIcon,
  Layers,
  Percent,
  Ticket,
  BookOpen,
  FileText,
  Film,
  BarChart3,
  ShieldCheck,
  Settings,
  Search,
  Bell,
  Clock,
  Plus,
  Trash2,
  Edit2,
  X,
  LogOut,
  CheckCircle,
  AlertTriangle,
  Download,
  Copy,
  Eye,
  RefreshCw,
  Send,
  ExternalLink,
  Sliders,
  Upload,
  Check,
  Folder,
  Globe,
  Sparkles,
  Palette,
  Info,
  MoreVertical,
  Smartphone,
  Monitor,
  CheckCircle2,
  Printer,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown,
  Compass,
  Truck,
  Phone,
  MapPin,
  Heart,
  Award,
  CreditCard,
  Zap,
  Lock,
  Key,
  ArrowLeftRight,
  FileSpreadsheet,
  History,
  AlertCircle,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp
} from 'lucide-react';
import { api, getToken, setToken } from './api';
import { LiveChatAdminView } from './components/LiveChatAdminView';
import { SalesReportAdminView } from './components/SalesReportAdminView';

import type {
  AdminUser,
  AuditLogRecord,
  Banner,
  BlogPost,
  Brand,
  Category,
  Coupon,
  Customer,
  FooterLinkItem,
  FooterPillarItem,
  HeaderNavItem,
  HomepageSection,
  Inquiry,
  InventoryItem,
  InventoryTransaction,
  MediaItem,
  NotificationRecord,
  Offer,
  Order,
  OrderStatus,
  Page,
  PaymentMethodConfig,
  Product,
  Review,
  RoleRecord,
  SeoRedirect,
  SeoSettings,
  Stats,
  StockValuation,
  User,
  Warehouse,
  WebsiteSettings,
  AiSettings
} from './types';

const ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'RETURNED',
  'REFUNDED'
];

type TabKey =
  | 'Dashboard'
  | 'Products'
  | 'Categories'
  | 'Brands'
  | 'Inventory'
  | 'Warehouses'
  | 'Orders'
  | 'Payment Gateways'
  | 'Customers'
  | 'Reviews'
  | 'Live Chat'
  | 'Inquiries'
  | 'Banners'
  | 'Homepage Sections'
  | 'Offers'
  | 'Coupons'
  | 'Blog'
  | 'Pages'
  | 'Media Library'
  | 'Sales Report'
  | 'Reports'
  | 'Admins & Roles'
  | 'Header & Footer'
  | 'Website Settings'
  | 'SEO Settings'
  | 'Notifications'
  | 'Audit Logs';

const SIDEBAR_ITEMS: Array<{ key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { key: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'Products', label: 'Products', icon: Package },
  { key: 'Categories', label: 'Categories', icon: FolderTree },
  { key: 'Brands', label: 'Brands', icon: Tag },
  { key: 'Inventory', label: 'Inventory', icon: Boxes },
  { key: 'Warehouses', label: 'Warehouses', icon: Building2 },
  { key: 'Orders', label: 'Orders', icon: ShoppingBag },
  { key: 'Sales Report', label: 'Sales Report', icon: TrendingUp },
  { key: 'Payment Gateways', label: 'Payment Gateways', icon: CreditCard },
  { key: 'Customers', label: 'Customers', icon: Users },
  { key: 'Reviews', label: 'Reviews', icon: Star },
  { key: 'Live Chat', label: 'Live Chat', icon: MessageSquare },
  { key: 'Inquiries', label: 'Inquiries', icon: MessageSquare },
  { key: 'Banners', label: 'Banners', icon: ImageIcon },
  { key: 'Homepage Sections', label: 'Homepage Sections', icon: Layers },
  { key: 'Offers', label: 'Offers', icon: Percent },
  { key: 'Coupons', label: 'Coupons', icon: Ticket },
  { key: 'Blog', label: 'Blog', icon: BookOpen },
  { key: 'Pages', label: 'Pages', icon: FileText },
  { key: 'Media Library', label: 'Media Library', icon: Film },
  { key: 'Reports', label: 'Reports', icon: BarChart3 },
  { key: 'Admins & Roles', label: 'Admins & Roles', icon: ShieldCheck },
  { key: 'Header & Footer', label: 'Header & Footer', icon: Sliders },
  { key: 'Website Settings', label: 'Website Settings', icon: Settings },
  { key: 'SEO Settings', label: 'SEO Settings', icon: Search },
  { key: 'Notifications', label: 'Notifications', icon: Bell },
  { key: 'Audit Logs', label: 'Audit Logs', icon: Clock }
];

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [booting, setBooting] = useState(true);

  const [activeTab, setActiveTab] = useState<TabKey>('Dashboard');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const mainContentRef = useRef<HTMLDivElement>(null);

  // Entities
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [homepageSections, setHomepageSections] = useState<HomepageSection[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [liveChatUnreadCount, setLiveChatUnreadCount] = useState<number>(0);
  const [settings, setSettings] = useState<WebsiteSettings | null>(() => {
    try {
      const cached = localStorage.getItem('zippy_settings') || localStorage.getItem('richman_settings');
      if (cached) return JSON.parse(cached);
    } catch {
      // ignore
    }
    return null;
  });
  const DEFAULT_HEADER_NAV_ITEMS: HeaderNavItem[] = [
    { id: 'nav-home', label: 'HOME', url: '/', slug: 'home', isHome: true },
    { id: 'nav-sale', label: 'SALE', url: '/shop/sale', slug: 'sale', highlight: true, badge: 'UP TO 35%' },
    { id: 'nav-new', label: 'NEW ARRIVALS', url: '/shop/new-arrivals', slug: 'new-arrivals' },
    { id: 'nav-blazer', label: 'BLAZER', url: '/shop/blazer', slug: 'blazer' },
    { id: 'nav-shirt', label: 'SHIRT', url: '/shop/shirt', slug: 'shirt' },
    { id: 'nav-polo', label: 'POLO', url: '/shop/polo', slug: 'polo' },
    { id: 'nav-pant', label: 'PANT', url: '/shop/pant', slug: 'pant' },
    { id: 'nav-ethnic', label: 'ETHNIC WEAR', url: '/shop/ethnic-wear', slug: 'ethnic-wear' },
    { id: 'nav-acc', label: 'ACCESSORIES', url: '/shop/accessories', slug: 'accessories' }
  ];

  const DEFAULT_FOOTER_PILLARS: FooterPillarItem[] = [
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
  ];

  const DEFAULT_FOOTER_COL1_LINKS: FooterLinkItem[] = [
    { id: 'col1-1', label: 'Italian Wool Blazers', url: '/shop/blazer' },
    { id: 'col1-2', label: 'Egyptian Giza Shirts', url: '/shop/shirt' },
    { id: 'col1-3', label: 'Festive Silk Panjabis', url: '/shop/ethnic-wear' },
    { id: 'col1-4', label: 'Mercerized Polos', url: '/shop/polo' },
    { id: 'col1-5', label: 'Tailored Trousers & Chinos', url: '/shop/pant' },
    { id: 'col1-6', label: 'Handmade Leather Oxfords', url: '/shop/accessories' },
    { id: 'col1-7', label: 'Sale Privileges', url: '/shop/sale', highlight: true }
  ];

  const DEFAULT_FOOTER_COL2_LINKS: FooterLinkItem[] = [
    { id: 'col2-1', label: 'Track Order Status', url: '/track-order' },
    { id: 'col2-2', label: 'Bespoke Size Guide', url: '#size-guide' },
    { id: 'col2-3', label: 'Boutique Locator', url: '/stores' },
    { id: 'col2-4', label: 'The Atelier Heritage', url: '/about' },
    { id: 'col2-5', label: 'Shipping & Delivery', url: '/faq' },
    { id: 'col2-6', label: 'Return & Exchange Policy', url: '/returns' }
  ];

  const DEFAULT_FOOTER_PAYMENT_BADGES = ['CASH ON DELIVERY', 'bKash', 'SSLCOMMERZ', 'VISA / MASTERCARD'];

  const [websiteForm, setWebsiteForm] = useState<WebsiteSettings>({
    website_name: 'Zippy',
    websiteName: 'Zippy',
    backend_name: 'Zippy',
    backendName: 'Zippy',
    logo: '/logo.svg',
    favicon: '/favicon.ico',
    phone: '+880 1711-000001',
    email: 'sales@zippy.com.bd',
    address: 'Gulshan 1, Dhaka, Bangladesh',
    google_map: 'https://maps.google.com/?q=Gulshan+1+Dhaka',
    currency: 'BDT (৳)',
    timezone: 'Asia/Dhaka',
    default_language: 'en',
    maintenance_mode: false,

    // Header Customization
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
    headerNavItems: DEFAULT_HEADER_NAV_ITEMS,

    // Footer Customization
    footerPillarsEnabled: true,
    footerPillars: DEFAULT_FOOTER_PILLARS,
    footerTagline: "The Gentleman's Wardrobe",
    footerAboutText: "Founded on the belief that sartorial refinement is an attitude, Zippy curates bespoke blazers, pure Egyptian cotton shirts, executive polos, and festive ethnic wear for the distinguished gentlemen of Bangladesh.",
    footerCol1Title: 'Collections',
    footerCol1Links: DEFAULT_FOOTER_COL1_LINKS,
    footerCol2Title: 'Client Services',
    footerCol2Links: DEFAULT_FOOTER_COL2_LINKS,
    footerNewsletterEnabled: true,
    footerNewsletterTitle: 'Privilege Circle',
    footerNewsletterSubtitle: 'Receive private invitations to preview seasonal collections and bespoke trunk shows.',
    footerCopyright: '© {year} {brand} Bangladesh. All rights reserved. Refined luxury menswear.',
    footerPaymentBadges: DEFAULT_FOOTER_PAYMENT_BADGES
  });
  const [isSavingWebsite, setIsSavingWebsite] = useState(false);

  // Header & Footer Customization Studio State
  const [headerFooterSubTab, setHeaderFooterSubTab] = useState<'header' | 'announcement' | 'pillars' | 'columns' | 'brandStory' | 'preview'>('header');
  const [isNavModal, setIsNavModal] = useState(false);
  const [editingNavIndex, setEditingNavIndex] = useState<number | null>(null);
  const [navForm, setNavForm] = useState<HeaderNavItem>({
    id: '',
    label: '',
    url: '',
    slug: '',
    highlight: false,
    badge: '',
    isHome: false,
    openInNewTab: false
  });

  const [isPillarModal, setIsPillarModal] = useState(false);
  const [editingPillarIndex, setEditingPillarIndex] = useState<number | null>(null);
  const [pillarForm, setPillarForm] = useState<FooterPillarItem>({
    id: '',
    icon: 'truck',
    title: '',
    description: ''
  });

  const [isColLinkModal, setIsColLinkModal] = useState(false);
  const [editingColKey, setEditingColKey] = useState<'col1' | 'col2' | null>(null);
  const [editingColIndex, setEditingColIndex] = useState<number | null>(null);
  const [colLinkForm, setColLinkForm] = useState<FooterLinkItem>({
    id: '',
    label: '',
    url: '',
    highlight: false,
    openInNewTab: false
  });

  const [newPaymentBadgeInput, setNewPaymentBadgeInput] = useState('');
  const [seo, setSeo] = useState<SeoSettings | null>(null);
  const [serpViewMode, setSerpViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [seoForm, setSeoForm] = useState<SeoSettings>({
    metaTitle: "Zippy | Luxury Bespoke Men's Fashion & Tailoring",
    metaDescription: 'Discover handcrafted suits, blazers, and luxury panjabis tailored for the modern gentleman in Dhaka, Bangladesh.',
    metaKeywords: 'zippy, menswear, bespoke tailoring, suits bd, panjabi dhaka',
    canonicalUrl: 'https://zippybd.com',
    openGraphImage: '',
    robots: 'index, follow',
    schemaMarkup: ''
  });
  const [redirects, setRedirects] = useState<SeoRedirect[]>([]);
  const [newRedirect, setNewRedirect] = useState<{ fromPath: string; toPath: string; statusCode: 301 | 302 }>({
    fromPath: '',
    toPath: '',
    statusCode: 301
  });
  const [isSavingSeo, setIsSavingSeo] = useState(false);
  const [isAddingRedirect, setIsAddingRedirect] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  // Modals & Edit States
  // 1. Products
  const [isProductModal, setIsProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [newProductImageUrl, setNewProductImageUrl] = useState('');
  const [productEditTab, setProductEditTab] = useState<'general' | 'pricing' | 'images' | 'variants' | 'description' | 'seo'>('general');
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#1B2A4A');
  const [newTagInput, setNewTagInput] = useState('');
  const [newCareInput, setNewCareInput] = useState('');
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const [prodForm, setProdForm] = useState<{
    name: string;
    slug: string;
    sku: string;
    styleCode: string;
    barcode: string;
    categoryId: string;
    brandId: string;
    status: string;
    featured: boolean;
    newArrival: boolean;
    bestSeller: boolean;
    trending: boolean;
    price: number;
    salePrice: string;
    costPrice: string;
    stockQuantity: number;
    lowStockThreshold: number;
    stock: Record<string, number>;
    images: string[];
    fabric: string;
    fit: string;
    sizes: string[];
    colors: { name: string; hex: string }[];
    description: string;
    shortDescription: string;
    careInstructions: string[];
    tags: string[];
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
  }>({
    name: '',
    slug: '',
    sku: '',
    styleCode: '',
    barcode: '',
    categoryId: 'blazer',
    brandId: '',
    status: 'published',
    featured: false,
    newArrival: true,
    bestSeller: false,
    trending: false,
    price: 8500,
    salePrice: '',
    costPrice: '',
    stockQuantity: 25,
    lowStockThreshold: 5,
    stock: { S: 5, M: 8, L: 8, XL: 4 },
    images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1200'],
    fabric: '100% Virgin Wool',
    fit: 'Slim Fit',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Executive Navy', hex: '#1B2A4A' }],
    description: 'Handcrafted bespoke garment designed with immaculate proportions, hand-set shoulders, and canvas interlining.',
    shortDescription: 'Signature tailoring in premium woven wool fabric.',
    careInstructions: ['Specialist dry clean only', 'Steam iron on low heat'],
    tags: ['Tailored', 'Luxury', 'Bespoke'],
    metaTitle: '',
    metaDescription: '',
    metaKeywords: ''
  });

  // Store Media Picker & Upload State
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'product' | 'bannerDesktop' | 'bannerMobile' | 'category' | 'blog' | 'mediaForm' | 'seoOgImage' | 'websiteLogo' | 'websiteFavicon' | 'brandLogo' | 'brandBanner' | null>(null);
  const [mediaPickerSearch, setMediaPickerSearch] = useState('');
  const [mediaPickerFolder, setMediaPickerFolder] = useState('all');
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [mediaSearchTerm, setMediaSearchTerm] = useState('');
  const [mediaFilterFolder, setMediaFilterFolder] = useState('all');

  const loadMediaList = async () => {
    try {
      const list = await api.media();
      setMediaList(list);
      return list;
    } catch (err) {
      console.error('Error fetching media library:', err);
      return [];
    }
  };

  const handleOpenMediaPicker = async (target: 'product' | 'bannerDesktop' | 'bannerMobile' | 'category' | 'blog' | 'mediaForm' | 'seoOgImage' | 'websiteLogo' | 'websiteFavicon' | 'brandLogo' | 'brandBanner') => {
    setMediaPickerTarget(target);
    setMediaPickerSearch('');
    setMediaPickerFolder('all');
    setIsMediaPickerOpen(true);
    await loadMediaList();
  };

  const uploadLocalFileToStoreMedia = async (file: File, folder = 'general'): Promise<string | null> => {
    return new Promise((resolve) => {
      if (file.size > 8 * 1024 * 1024) {
        showToast(`File "${file.name}" exceeds maximum allowed 8MB`);
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrl = reader.result as string;
          let filename = file.name;
          if (!/\.(jpg|jpeg|png|webp|svg|mp4|pdf)$/i.test(filename)) {
            filename = `${filename}.jpg`;
          }
          const created = await api.uploadMedia({
            name: file.name,
            filename,
            url: dataUrl,
            mimeType: file.type || 'image/jpeg',
            size: file.size,
            folder
          });
          showToast(`Photo "${file.name}" uploaded to Store Media`);
          await loadMediaList();
          resolve(created.url);
        } catch (err: unknown) {
          showToast(err instanceof Error ? err.message : 'Error uploading photo');
          resolve(null);
        }
      };
      reader.onerror = () => {
        showToast(`Failed to read file "${file.name}"`);
        resolve(null);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleOpenCreateProduct = () => {
    setEditingProductId(null);
    setNewProductImageUrl('');
    setProductEditTab('general');
    setCustomSizeInput('');
    setNewColorName('');
    setNewColorHex('#1B2A4A');
    setNewTagInput('');
    setNewCareInput('');
    setProdForm({
      name: '',
      slug: '',
      sku: `RM-${Date.now().toString().slice(-5)}`,
      styleCode: `ST-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: `894${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      categoryId: categories[0]?.id || 'blazer',
      brandId: brands[0]?.id || '',
      status: 'published',
      featured: false,
      newArrival: true,
      bestSeller: false,
      trending: false,
      price: 8500,
      salePrice: '',
      costPrice: '',
      stockQuantity: 25,
      lowStockThreshold: 5,
      stock: { S: 5, M: 8, L: 8, XL: 4 },
      images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1200'],
      fabric: '100% Virgin Wool',
      fit: 'Slim Fit',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ name: 'Executive Navy', hex: '#1B2A4A' }],
      description: 'Handcrafted bespoke garment designed with immaculate proportions, hand-set shoulders, and canvas interlining.',
      shortDescription: 'Signature tailoring in premium woven wool fabric.',
      careInstructions: ['Specialist dry clean only', 'Steam iron on low heat'],
      tags: ['Tailored', 'Luxury', 'Bespoke'],
      metaTitle: '',
      metaDescription: '',
      metaKeywords: ''
    });
    setIsProductModal(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setNewProductImageUrl('');
    setProductEditTab('general');
    setCustomSizeInput('');
    setNewColorName('');
    setNewColorHex('#1B2A4A');
    setNewTagInput('');
    setNewCareInput('');
    const stockQty = p.stockQuantity ?? (p.stock ? Object.values(p.stock).reduce((a, b) => a + b, 0) : 25);
    const initialImages = (Array.isArray(p.images) && p.images.length > 0)
      ? [...p.images]
      : ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1200'];
    const initialColors = (Array.isArray(p.colors) && p.colors.length > 0)
      ? p.colors.map((c) => typeof c === 'string' ? { name: c, hex: '#1B2A4A' } : c)
      : [{ name: 'Executive Navy', hex: '#1B2A4A' }];
    const initialSizes = (Array.isArray(p.sizes) && p.sizes.length > 0)
      ? [...p.sizes]
      : ['S', 'M', 'L', 'XL'];
    const initialCare = (Array.isArray(p.careInstructions) && p.careInstructions.length > 0)
      ? [...p.careInstructions]
      : ['Specialist dry clean only'];
    const initialTags = (Array.isArray(p.tags) && p.tags.length > 0)
      ? [...p.tags]
      : ['Tailored', 'Formal'];

    setProdForm({
      name: p.name || '',
      slug: p.slug || '',
      sku: p.sku || '',
      styleCode: p.styleCode || '',
      barcode: p.barcode || '',
      categoryId: p.categoryId || categories[0]?.id || 'blazer',
      brandId: p.brandId || '',
      status: p.status || (p.isActive === false ? 'inactive' : 'published'),
      featured: Boolean(p.featured),
      newArrival: Boolean(p.newArrival),
      bestSeller: Boolean(p.bestSeller),
      trending: Boolean(p.trending),
      price: p.price || 0,
      salePrice: p.salePrice ? String(p.salePrice) : '',
      costPrice: p.costPrice ? String(p.costPrice) : '',
      stockQuantity: stockQty,
      lowStockThreshold: p.lowStockThreshold ?? 5,
      stock: p.stock ? { ...p.stock } : { S: 5, M: 8, L: 8, XL: 4 },
      images: initialImages,
      fabric: p.fabric || 'Tailored Wool',
      fit: p.fit || 'Slim Fit',
      sizes: initialSizes,
      colors: initialColors,
      description: p.description || '',
      shortDescription: p.shortDescription || '',
      careInstructions: initialCare,
      tags: initialTags,
      metaTitle: p.metaTitle || '',
      metaDescription: p.metaDescription || '',
      metaKeywords: p.metaKeywords || ''
    });
    setIsProductModal(true);
  };

  const handleSaveProduct = async () => {
    if (!prodForm.name.trim()) {
      setProductEditTab('general');
      return showToast('Product name is required');
    }
    if (!prodForm.sku.trim()) {
      setProductEditTab('general');
      return showToast('SKU is required');
    }
    const validImages = prodForm.images.filter((img) => Boolean(img?.trim()));
    if (validImages.length === 0) {
      validImages.push('https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1200');
    }

    setIsSavingProduct(true);
    try {
      const selectedCategory = categories.find((c) => c.id === prodForm.categoryId);
      const payload: Record<string, unknown> = {
        name: prodForm.name.trim(),
        slug: prodForm.slug.trim() || undefined,
        sku: prodForm.sku.trim(),
        styleCode: prodForm.styleCode.trim() || undefined,
        barcode: prodForm.barcode.trim() || undefined,
        categoryId: prodForm.categoryId,
        categoryName: selectedCategory?.name || prodForm.categoryId,
        brandId: prodForm.brandId || undefined,
        price: Number(prodForm.price) || 0,
        salePrice: prodForm.salePrice ? Number(prodForm.salePrice) : null,
        costPrice: prodForm.costPrice ? Number(prodForm.costPrice) : undefined,
        onSale: Boolean(prodForm.salePrice && Number(prodForm.salePrice) < Number(prodForm.price)),
        fabric: prodForm.fabric.trim() || 'Tailored Fabric',
        fit: prodForm.fit.trim() || 'Slim Fit',
        images: validImages,
        stockQuantity: Number(prodForm.stockQuantity) || 0,
        lowStockThreshold: Number(prodForm.lowStockThreshold) || 5,
        stock: prodForm.stock,
        status: prodForm.status,
        isActive: prodForm.status === 'published' || prodForm.status === 'active',
        featured: prodForm.featured,
        newArrival: prodForm.newArrival,
        bestSeller: prodForm.bestSeller,
        trending: prodForm.trending,
        sizes: prodForm.sizes,
        colors: prodForm.colors,
        description: prodForm.description.trim(),
        shortDescription: prodForm.shortDescription.trim(),
        careInstructions: prodForm.careInstructions.filter(Boolean),
        tags: prodForm.tags.filter(Boolean),
        metaTitle: prodForm.metaTitle.trim() || undefined,
        metaDescription: prodForm.metaDescription.trim() || undefined,
        metaKeywords: prodForm.metaKeywords.trim() || undefined
      };

      if (editingProductId) {
        await api.updateProduct(editingProductId, payload);
        showToast(`Product "${prodForm.name}" updated successfully!`);
      } else {
        await api.createProduct(payload);
        showToast(`Product "${prodForm.name}" created successfully!`);
      }
      setIsProductModal(false);
      loadDataForTab('Products');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error saving product');
    } finally {
      setIsSavingProduct(false);
    }
  };

  // 2. Coupons
  const [isCouponModal, setIsCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({ code: '', discountValue: 10, minSpend: 2000, description: '' });

  // 3. Categories Management
  const [isCategoryModal, setIsCategoryModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    parentId: '' as string | null,
    icon: 'FolderTree',
    description: '',
    image: '',
    status: 'active' as string,
    sortOrder: 1,
    metaTitle: '',
    metaDescription: ''
  });
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [categoryFilterLevel, setCategoryFilterLevel] = useState<'all' | 'parent' | 'sub'>('all');
  const [categoryFilterStatus, setCategoryFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [categorySortBy, setCategorySortBy] = useState<'order' | 'name' | 'items' | 'stock'>('order');
  const [categoryPreviewCategory, setCategoryPreviewCategory] = useState<Category | null>(null);
  const [categoryPreviewProducts, setCategoryPreviewProducts] = useState<Product[]>([]);
  const [isCategoryPreviewModal, setIsCategoryPreviewModal] = useState(false);
  const [isLoadingCategoryPreview, setIsLoadingCategoryPreview] = useState(false);

  const handleOpenCreateCategory = () => {
    setEditingCategoryId(null);
    setCategoryForm({
      name: '',
      slug: '',
      parentId: '',
      icon: 'FolderTree',
      description: '',
      image: '',
      status: 'active',
      sortOrder: (categories.length || 0) + 1,
      metaTitle: '',
      metaDescription: ''
    });
    setIsCategoryModal(true);
  };

  const handleOpenEditCategory = (c: Category) => {
    setEditingCategoryId(c.id);
    setCategoryForm({
      name: c.name || '',
      slug: c.slug || '',
      parentId: c.parentId || '',
      icon: c.icon || 'FolderTree',
      description: c.description || '',
      image: c.image || '',
      status: c.status || 'active',
      sortOrder: c.sortOrder ?? 1,
      metaTitle: c.metaTitle || '',
      metaDescription: c.metaDescription || ''
    });
    setIsCategoryModal(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) return showToast('Category name is required');
    try {
      const slug =
        categoryForm.slug.trim() ||
        categoryForm.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const payload: Partial<Category> = {
        name: categoryForm.name.trim(),
        slug,
        parentId: categoryForm.parentId ? categoryForm.parentId : null,
        icon: categoryForm.icon,
        description: categoryForm.description,
        image: categoryForm.image,
        status: categoryForm.status,
        sortOrder: Number(categoryForm.sortOrder) || 1,
        metaTitle: categoryForm.metaTitle || categoryForm.name,
        metaDescription: categoryForm.metaDescription
      };

      if (editingCategoryId) {
        await api.updateCategory(editingCategoryId, payload);
        showToast(`Category "${categoryForm.name}" updated!`);
      } else {
        await api.createCategory(payload);
        showToast(`Category "${categoryForm.name}" created!`);
      }
      setIsCategoryModal(false);
      loadDataForTab('Categories');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error saving category');
    }
  };

  const handleToggleCategoryStatus = async (c: Category) => {
    const nextActive = c.status !== 'active';
    try {
      await api.toggleCategoryVisibility(c.id, nextActive);
      showToast(`Category "${c.name}" marked as ${nextActive ? 'Active' : 'Inactive'}`);
      loadDataForTab('Categories');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error updating status');
    }
  };

  const handleMoveCategory = async (categoryId: string, direction: 'up' | 'down') => {
    const sorted = [...categories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const idx = sorted.findIndex((c) => c.id === categoryId);
    if (idx < 0) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === sorted.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const temp = sorted[idx];
    sorted[idx] = sorted[targetIdx];
    sorted[targetIdx] = temp;

    const ids = sorted.map((c) => c.id);
    try {
      await api.reorderCategories(ids);
      showToast('Category sequence updated');
      loadDataForTab('Categories');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error reordering categories');
    }
  };

  const handleOpenCategoryProductsPreview = async (c: Category) => {
    setCategoryPreviewCategory(c);
    setIsCategoryPreviewModal(true);
    setIsLoadingCategoryPreview(true);
    try {
      const items = await api.categoryProducts(c.id);
      setCategoryPreviewProducts(items);
    } catch {
      const fallback = products.filter(
        (p) => p.categoryId === c.id || p.categoryId === c.slug || p.subcategoryId === c.id || p.subcategoryId === c.slug
      );
      setCategoryPreviewProducts(fallback);
    } finally {
      setIsLoadingCategoryPreview(false);
    }
  };

  // 4. Brands Full Optimization States & Handlers
  const [isBrandModal, setIsBrandModal] = useState(false);
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [brandForm, setBrandForm] = useState({
    name: '',
    slug: '',
    website: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
    featured: false,
    sortOrder: 1,
    logo: '',
    banner: '',
    metaTitle: '',
    metaDescription: ''
  });

  // Filter & Search states for Brands
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const [brandFilterStatus, setBrandFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [brandFilterFeatured, setBrandFilterFeatured] = useState<'all' | 'featured' | 'standard'>('all');
  const [brandSortBy, setBrandSortBy] = useState<'order' | 'name' | 'products' | 'stock'>('order');
  const [brandViewMode, setBrandViewMode] = useState<'table' | 'cards'>('table');

  // Brand Products Preview Modal States
  const [isBrandPreviewModal, setIsBrandPreviewModal] = useState(false);
  const [brandPreviewBrand, setBrandPreviewBrand] = useState<Brand | null>(null);
  const [brandPreviewProducts, setBrandPreviewProducts] = useState<Product[]>([]);
  const [isLoadingBrandPreview, setIsLoadingBrandPreview] = useState(false);

  const handleOpenCreateBrand = () => {
    setEditingBrandId(null);
    setBrandForm({
      name: '',
      slug: '',
      website: '',
      description: '',
      status: 'active',
      featured: false,
      sortOrder: brands.length + 1,
      logo: '',
      banner: '',
      metaTitle: '',
      metaDescription: ''
    });
    setIsBrandModal(true);
  };

  const handleOpenEditBrand = (b: Brand) => {
    setEditingBrandId(b.id);
    setBrandForm({
      name: b.name || '',
      slug: b.slug || '',
      website: b.website || '',
      description: b.description || '',
      status: (b.status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
      featured: Boolean(b.featured),
      sortOrder: b.sortOrder ?? brands.findIndex((item) => item.id === b.id) + 1,
      logo: b.logo || '',
      banner: b.banner || '',
      metaTitle: b.metaTitle || '',
      metaDescription: b.metaDescription || ''
    });
    setIsBrandModal(true);
  };

  const handleSaveBrand = async () => {
    if (!brandForm.name.trim()) return showToast('Brand name is required');
    try {
      const slug = brandForm.slug.trim() || brandForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const payload: Partial<Brand> = {
        name: brandForm.name.trim(),
        slug,
        website: brandForm.website.trim(),
        description: brandForm.description.trim(),
        status: brandForm.status,
        featured: brandForm.featured,
        sortOrder: Number(brandForm.sortOrder) || 1,
        logo: brandForm.logo.trim(),
        banner: brandForm.banner.trim(),
        metaTitle: brandForm.metaTitle.trim(),
        metaDescription: brandForm.metaDescription.trim()
      };

      if (editingBrandId) {
        await api.updateBrand(editingBrandId, payload);
        showToast(`Brand "${brandForm.name}" updated!`);
      } else {
        await api.createBrand(payload);
        showToast(`Brand "${brandForm.name}" created!`);
      }
      setIsBrandModal(false);
      loadDataForTab('Brands');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error saving brand');
    }
  };

  const handleToggleBrandStatus = async (b: Brand) => {
    try {
      const nextActive = b.status !== 'active';
      await api.toggleBrandVisibility(b.id, nextActive);
      showToast(`Brand "${b.name}" ${nextActive ? 'activated' : 'deactivated'}`);
      setBrands((prev) =>
        prev.map((item) => (item.id === b.id ? { ...item, status: nextActive ? 'active' : 'inactive' } : item))
      );
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update brand status');
    }
  };

  const handleToggleBrandFeatured = async (b: Brand) => {
    try {
      const nextFeatured = !b.featured;
      await api.toggleBrandFeatured(b.id, nextFeatured);
      showToast(`Brand "${b.name}" ${nextFeatured ? 'marked as Featured' : 'unmarked from Featured'}`);
      setBrands((prev) =>
        prev.map((item) => (item.id === b.id ? { ...item, featured: nextFeatured } : item))
      );
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update featured status');
    }
  };

  const handleMoveBrand = async (brandId: string, direction: 'up' | 'down') => {
    const sorted = [...brands].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const currentIndex = sorted.findIndex((b) => b.id === brandId);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const temp = sorted[currentIndex];
    sorted[currentIndex] = sorted[targetIndex];
    sorted[targetIndex] = temp;

    const newIds = sorted.map((b) => b.id);
    setBrands(sorted.map((b, idx) => ({ ...b, sortOrder: idx + 1 })));
    try {
      await api.reorderBrands(newIds);
      showToast('Brand order updated');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update brand order');
      loadDataForTab('Brands');
    }
  };

  const handleOpenBrandPreview = async (b: Brand) => {
    setBrandPreviewBrand(b);
    setBrandPreviewProducts([]);
    setIsBrandPreviewModal(true);
    setIsLoadingBrandPreview(true);
    try {
      const prods = await api.brandProducts(b.id);
      setBrandPreviewProducts(prods);
    } catch (err) {
      console.error('Failed to load brand garments', err);
      showToast('Could not load brand products');
    } finally {
      setIsLoadingBrandPreview(false);
    }
  };

  // 5. Full Inventory Control System States & Operations
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([]);
  const [stockValuation, setStockValuation] = useState<StockValuation | null>(null);
  const [invSubTab, setInvSubTab] = useState<'all' | 'low_stock' | 'out_of_stock' | 'valuation' | 'audit_log'>('all');
  const [invSearchQuery, setInvSearchQuery] = useState('');
  const [invWarehouseFilter, setInvWarehouseFilter] = useState('all');
  const [invStatusFilter, setInvStatusFilter] = useState('all');
  const [invSortBy, setInvSortBy] = useState<'name' | 'stock_asc' | 'stock_desc' | 'valuation_desc'>('name');
  const [txnTypeFilter, setTxnTypeFilter] = useState('all');

  // Inventory Stock Adjustment Modal
  const [isInventoryModal, setIsInventoryModal] = useState(false);
  const [editingInventoryItem, setEditingInventoryItem] = useState<InventoryItem | null>(null);
  const [invForm, setInvForm] = useState({ quantity: 0, reason: 'Manual adjustment' });

  // Stock In Modal
  const [isStockInModal, setIsStockInModal] = useState(false);
  const [stockInForm, setStockInForm] = useState({
    productId: '',
    warehouseId: '',
    quantity: 10,
    reference: '',
    note: ''
  });

  // Stock Out Modal
  const [isStockOutModal, setIsStockOutModal] = useState(false);
  const [stockOutForm, setStockOutForm] = useState({
    productId: '',
    warehouseId: '',
    quantity: 1,
    reasonType: 'damage',
    reference: '',
    note: ''
  });

  // Transfer Modal
  const [isTransferModal, setIsTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({
    productId: '',
    fromWarehouseId: '',
    toWarehouseId: '',
    quantity: 5,
    reference: '',
    note: ''
  });

  // Threshold Modal
  const [isThresholdModal, setIsThresholdModal] = useState(false);
  const [thresholdItem, setThresholdItem] = useState<InventoryItem | null>(null);
  const [thresholdForm, setThresholdForm] = useState({ minimumStock: 8, maximumStock: 100 });

  const handleOpenEditInventory = (inv: InventoryItem) => {
    setEditingInventoryItem(inv);
    setInvForm({ quantity: inv.quantity, reason: 'Manual inventory adjustment' });
    setIsInventoryModal(true);
  };

  const handleSaveInventory = async () => {
    if (!editingInventoryItem) return;
    try {
      await api.adjustInventory({
        productId: editingInventoryItem.productId,
        warehouseId: editingInventoryItem.warehouseId,
        quantity: Number(invForm.quantity),
        reason: invForm.reason
      });
      showToast(`Stock updated for ${editingInventoryItem.productName}`);
      setIsInventoryModal(false);
      loadDataForTab('Inventory');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error updating stock');
    }
  };

  const handleOpenStockIn = (inv?: InventoryItem) => {
    setStockInForm({
      productId: inv?.productId || products[0]?.id || '',
      warehouseId: inv?.warehouseId || warehouses[0]?.id || '',
      quantity: 10,
      reference: `PO-${Date.now().toString().slice(-6)}`,
      note: 'Supplier replenishment / Inbound shipment'
    });
    setIsStockInModal(true);
  };

  const handleSaveStockIn = async () => {
    if (!stockInForm.productId) return showToast('Please select a product');
    if (!stockInForm.quantity || Number(stockInForm.quantity) <= 0) return showToast('Please enter a valid positive quantity');
    try {
      await api.stockInInventory({
        productId: stockInForm.productId,
        warehouseId: stockInForm.warehouseId || undefined,
        quantity: Number(stockInForm.quantity),
        reference: stockInForm.reference,
        note: stockInForm.note
      });
      showToast(`Received +${stockInForm.quantity} units into inventory`);
      setIsStockInModal(false);
      loadDataForTab('Inventory');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error processing stock in');
    }
  };

  const handleOpenStockOut = (inv?: InventoryItem) => {
    setStockOutForm({
      productId: inv?.productId || products[0]?.id || '',
      warehouseId: inv?.warehouseId || warehouses[0]?.id || '',
      quantity: 1,
      reasonType: 'damage',
      reference: `WO-${Date.now().toString().slice(-6)}`,
      note: 'Damaged / Failed quality control inspection'
    });
    setIsStockOutModal(true);
  };

  const handleSaveStockOut = async () => {
    if (!stockOutForm.productId) return showToast('Please select a product');
    if (!stockOutForm.quantity || Number(stockOutForm.quantity) <= 0) return showToast('Please enter a valid positive quantity');
    try {
      await api.stockOutInventory({
        productId: stockOutForm.productId,
        warehouseId: stockOutForm.warehouseId || undefined,
        quantity: Number(stockOutForm.quantity),
        reference: stockOutForm.reference,
        note: `[${stockOutForm.reasonType.toUpperCase()}] ${stockOutForm.note}`
      });
      showToast(`Stock out recorded: -${stockOutForm.quantity} units removed`);
      setIsStockOutModal(false);
      loadDataForTab('Inventory');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error processing stock out');
    }
  };

  const handleOpenTransfer = (inv?: InventoryItem) => {
    const fromWh = inv?.warehouseId || warehouses[0]?.id || '';
    const toWh = warehouses.find((w) => w.id !== fromWh)?.id || warehouses[1]?.id || fromWh;
    setTransferForm({
      productId: inv?.productId || products[0]?.id || '',
      fromWarehouseId: fromWh,
      toWarehouseId: toWh,
      quantity: Math.min(inv?.availableQuantity || 5, 5) || 1,
      reference: `TRF-${Date.now().toString().slice(-6)}`,
      note: 'Inter-warehouse stock rebalancing'
    });
    setIsTransferModal(true);
  };

  const handleSaveTransfer = async () => {
    if (!transferForm.productId) return showToast('Please select a product');
    if (!transferForm.fromWarehouseId || !transferForm.toWarehouseId) return showToast('Please select both warehouses');
    if (transferForm.fromWarehouseId === transferForm.toWarehouseId) return showToast('Source and destination cannot be the same warehouse');
    if (!transferForm.quantity || Number(transferForm.quantity) <= 0) return showToast('Please enter a valid transfer quantity');
    try {
      await api.transferInventory({
        productId: transferForm.productId,
        fromWarehouseId: transferForm.fromWarehouseId,
        toWarehouseId: transferForm.toWarehouseId,
        quantity: Number(transferForm.quantity),
        reference: transferForm.reference,
        note: transferForm.note
      });
      showToast(`Successfully transferred ${transferForm.quantity} units`);
      setIsTransferModal(false);
      loadDataForTab('Inventory');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error transferring inventory');
    }
  };

  const handleOpenThreshold = (inv: InventoryItem) => {
    setThresholdItem(inv);
    setThresholdForm({
      minimumStock: inv.minimumStock,
      maximumStock: inv.maximumStock || 100
    });
    setIsThresholdModal(true);
  };

  const handleSaveThreshold = async () => {
    if (!thresholdItem) return;
    try {
      await api.updateInventoryThreshold({
        productId: thresholdItem.productId,
        warehouseId: thresholdItem.warehouseId,
        minimumStock: Number(thresholdForm.minimumStock),
        maximumStock: Number(thresholdForm.maximumStock)
      });
      showToast(`Updated reorder thresholds for ${thresholdItem.productName}`);
      setIsThresholdModal(false);
      loadDataForTab('Inventory');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error updating threshold');
    }
  };

  const handleDownloadInventoryCsv = () => {
    const token = getToken();
    const url = `/api/v1/inventory/export${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    window.open(url, '_blank');
  };

  // 6. Warehouses
  const [isWarehouseModal, setIsWarehouseModal] = useState(false);
  const [editingWarehouseId, setEditingWarehouseId] = useState<string | null>(null);
  const [warehouseForm, setWarehouseForm] = useState({ name: '', code: '', address: '', phone: '', manager: '' });

  const handleOpenCreateWarehouse = () => {
    setEditingWarehouseId(null);
    setWarehouseForm({ name: '', code: `WH-0${warehouses.length + 1}`, address: '', phone: '', manager: '' });
    setIsWarehouseModal(true);
  };

  const handleOpenEditWarehouse = (wh: Warehouse) => {
    setEditingWarehouseId(wh.id);
    setWarehouseForm({
      name: wh.name || '',
      code: wh.code || '',
      address: wh.address || '',
      phone: wh.phone || '',
      manager: wh.manager || ''
    });
    setIsWarehouseModal(true);
  };

  const handleSaveWarehouse = async () => {
    if (!warehouseForm.name.trim()) return showToast('Warehouse name is required');
    try {
      if (editingWarehouseId) {
        await api.updateWarehouse(editingWarehouseId, warehouseForm);
        showToast(`Warehouse "${warehouseForm.name}" updated!`);
      } else {
        await api.createWarehouse(warehouseForm);
        showToast(`Warehouse "${warehouseForm.name}" created!`);
      }
      setIsWarehouseModal(false);
      loadDataForTab('Warehouses');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error saving warehouse');
    }
  };

  // 7. Orders
  const [isOrderModal, setIsOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [orderEditStatus, setOrderEditStatus] = useState<OrderStatus>('PENDING');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('ALL');

  const handleOpenEditOrder = (ord: Order) => {
    setEditingOrder(ord);
    setOrderEditStatus(ord.status);
    setIsOrderModal(true);
  };

  const handleSaveOrder = async () => {
    if (!editingOrder) return;
    try {
      await api.updateOrderStatus(editingOrder.id, orderEditStatus);
      showToast(`Order #${editingOrder.orderNumber} updated to ${orderEditStatus}!`);
      setIsOrderModal(false);
      loadDataForTab('Orders');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error updating order');
    }
  };

  const handleDeleteOrder = async (ord: Order) => {
    const shouldRestore = ord.status !== 'CANCELLED' && ord.status !== 'REFUNDED' && ord.status !== 'RETURNED';
    const message = shouldRestore
      ? `Are you sure you want to permanently delete order #${ord.orderNumber}?\n\nThis will remove the order and automatically restore product stock quantities to inventory.`
      : `Are you sure you want to permanently delete order #${ord.orderNumber}?`;
    if (!window.confirm(message)) return;
    try {
      await api.deleteOrder(ord.id, true);
      showToast(`Order #${ord.orderNumber} deleted successfully.`);
      if (editingOrder?.id === ord.id) {
        setIsOrderModal(false);
        setEditingOrder(null);
      }
      loadDataForTab('Orders');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error deleting order');
    }
  };

  // Payment Gateways
  const [isPaymentModal, setIsPaymentModal] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [testingPaymentId, setTestingPaymentId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string; details?: unknown } | null>(null);

  const defaultPaymentForm: Partial<PaymentMethodConfig> = {
    code: '',
    name: '',
    type: 'gateway',
    description: '',
    instructions: '',
    status: 'active',
    isDefault: false,
    testMode: true,
    additionalFee: 0,
    badge: '',
    icon: '',
    accountNumber: '',
    accountType: 'Personal',
    merchantId: '',
    secretKey: '',
    apiKey: '',
    apiSecret: '',
    appKey: '',
    appSecret: '',
    username: '',
    password: '',
    storeId: '',
    storePassword: '',
    webhookSecret: '',
    sandboxEndpoint: '',
    liveEndpoint: '',
    currency: 'BDT',
    minOrderAmount: 0,
    maxOrderAmount: 0,
    sortOrder: 0
  };

  const [paymentForm, setPaymentForm] = useState<Partial<PaymentMethodConfig>>(defaultPaymentForm);

  const handleOpenCreatePayment = (preset?: Partial<PaymentMethodConfig>) => {
    setEditingPaymentId(null);
    setTestResult(null);
    setPaymentForm({
      ...defaultPaymentForm,
      ...(preset || {})
    });
    setIsPaymentModal(true);
  };

  const handleOpenEditPayment = (pm: PaymentMethodConfig) => {
    setEditingPaymentId(pm.id);
    setTestResult(null);
    setPaymentForm({
      code: pm.code || '',
      name: pm.name || '',
      type: pm.type || 'gateway',
      description: pm.description || '',
      instructions: pm.instructions || '',
      status: pm.status || 'active',
      isDefault: pm.isDefault || false,
      testMode: pm.testMode !== false,
      additionalFee: pm.additionalFee || 0,
      badge: pm.badge || '',
      icon: pm.icon || '',
      accountNumber: pm.accountNumber || '',
      accountType: pm.accountType || 'Personal',
      merchantId: pm.merchantId || '',
      secretKey: pm.secretKey || '',
      apiKey: pm.apiKey || '',
      apiSecret: pm.apiSecret || '',
      appKey: pm.appKey || '',
      appSecret: pm.appSecret || '',
      username: pm.username || '',
      password: pm.password || '',
      storeId: pm.storeId || '',
      storePassword: pm.storePassword || '',
      webhookSecret: pm.webhookSecret || '',
      sandboxEndpoint: pm.sandboxEndpoint || '',
      liveEndpoint: pm.liveEndpoint || '',
      currency: pm.currency || 'BDT',
      minOrderAmount: pm.minOrderAmount || 0,
      maxOrderAmount: pm.maxOrderAmount || 0,
      sortOrder: pm.sortOrder || 0
    });
    setIsPaymentModal(true);
  };

  const handleSavePayment = async () => {
    if (!paymentForm.name?.trim()) return showToast('Payment Gateway Name is required');
    if (!paymentForm.code?.trim()) return showToast('Payment Gateway Code is required');

    try {
      const payload: Partial<PaymentMethodConfig> = {
        ...paymentForm,
        code: paymentForm.code.trim().toUpperCase()
      };

      if (editingPaymentId) {
        await api.updatePaymentMethod(editingPaymentId, payload);
        showToast(`Payment gateway "${paymentForm.name}" updated!`);
      } else {
        await api.createPaymentMethod(payload);
        showToast(`Payment gateway "${paymentForm.name}" created!`);
      }
      setIsPaymentModal(false);
      loadDataForTab('Payment Gateways');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error saving payment gateway');
    }
  };

  const handleTogglePaymentStatus = async (pm: PaymentMethodConfig) => {
    try {
      const updated = await api.togglePaymentMethod(pm.id);
      showToast(`${pm.name} is now ${updated.status.toUpperCase()}`);
      loadDataForTab('Payment Gateways');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to toggle status');
    }
  };

  const handleDeletePayment = async (pm: PaymentMethodConfig) => {
    if (!confirm(`Are you sure you want to delete payment gateway "${pm.name}" (${pm.code})?`)) return;
    try {
      await api.deletePaymentMethod(pm.id);
      showToast(`Payment gateway "${pm.name}" removed!`);
      loadDataForTab('Payment Gateways');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to delete payment gateway');
    }
  };

  const handleTestPayment = async (pm: PaymentMethodConfig) => {
    setTestingPaymentId(pm.id);
    try {
      const res = await api.testPaymentGateway(pm.id, {
        testMode: pm.testMode,
        apiKey: pm.apiKey,
        appKey: pm.appKey,
        appSecret: pm.appSecret,
        username: pm.username,
        password: pm.password,
        storeId: pm.storeId,
        storePassword: pm.storePassword,
        merchantId: pm.merchantId,
        secretKey: pm.secretKey
      });
      setTestResult({
        id: pm.id,
        success: res.success,
        message: res.message,
        details: res.details
      });
      if (res.success) {
        showToast(`✓ ${pm.name}: ${res.message}`);
      } else {
        showToast(`✗ ${pm.name}: ${res.message}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection test failed';
      setTestResult({
        id: pm.id,
        success: false,
        message: msg
      });
      showToast(`✗ ${pm.name}: ${msg}`);
    } finally {
      setTestingPaymentId(null);
    }
  };

  // 7b. Customers
  const [isCustomerModal, setIsCustomerModal] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerFilterStatus, setCustomerFilterStatus] = useState<string>('all');
  const [customerForm, setCustomerForm] = useState<{
    fullName: string;
    email: string;
    phone: string;
    password?: string;
    status: 'active' | 'inactive' | 'blocked';
    division?: string;
    district?: string;
    address?: string;
  }>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    status: 'active',
    division: '',
    district: '',
    address: ''
  });

  const handleOpenCreateCustomer = () => {
    setEditingCustomerId(null);
    setCustomerForm({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      status: 'active',
      division: '',
      district: '',
      address: ''
    });
    setIsCustomerModal(true);
  };

  const handleOpenEditCustomer = (c: Customer) => {
    setEditingCustomerId(c.id);
    const defAddr = c.savedAddresses?.[0];
    setCustomerForm({
      fullName: c.fullName || '',
      email: c.email || '',
      phone: c.phone || '',
      password: '',
      status: c.status || 'active',
      division: defAddr?.division || '',
      district: defAddr?.district || '',
      address: defAddr?.address || ''
    });
    setIsCustomerModal(true);
  };

  const handleSaveCustomer = async () => {
    if (!customerForm.fullName.trim() || !customerForm.email.trim() || !customerForm.phone.trim()) {
      showToast('Name, email, and phone are required.');
      return;
    }
    try {
      if (editingCustomerId) {
        await api.updateCustomer(editingCustomerId, {
          fullName: customerForm.fullName,
          email: customerForm.email,
          phone: customerForm.phone,
          status: customerForm.status
        });
        showToast('Customer updated successfully!');
      } else {
        await api.createCustomer({
          fullName: customerForm.fullName,
          email: customerForm.email,
          phone: customerForm.phone,
          password: customerForm.password || 'Zippy@2026',
          status: customerForm.status
        });
        showToast('Customer created successfully!');
      }
      setIsCustomerModal(false);
      loadDataForTab('Customers');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error saving customer');
    }
  };

  const handleDeleteCustomer = async (c: Customer) => {
    if (!window.confirm(`Permanently delete customer account for "${c.fullName}" (${c.email})?`)) return;
    try {
      await api.deleteCustomer(c.id);
      showToast(`Customer ${c.fullName} deleted.`);
      loadDataForTab('Customers');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error deleting customer');
    }
  };

  // 8. Reviews
  const [isReviewModal, setIsReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [reviewForm, setReviewForm] = useState({ status: 'approved', adminReply: '' });
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [reviewFilterStatus, setReviewFilterStatus] = useState<string>('all');

  const handleOpenEditReview = (r: Review) => {
    setEditingReview(r);
    setReviewForm({
      status: r.status || 'pending',
      adminReply: r.adminReply || ''
    });
    setIsReviewModal(true);
  };

  const handleSaveReview = async () => {
    if (!editingReview) return;
    try {
      if (reviewForm.status === 'approved') await api.approveReview(editingReview.id);
      else if (reviewForm.status === 'rejected') await api.rejectReview(editingReview.id);
      if (reviewForm.adminReply.trim()) {
        await api.replyReview(editingReview.id, reviewForm.adminReply);
      }
      showToast('Review updated successfully!');
      setIsReviewModal(false);
      loadDataForTab('Reviews');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error updating review');
    }
  };

  const handleDeleteReview = async (r: Review) => {
    if (!window.confirm(`Permanently delete review by "${r.authorName}"?`)) return;
    try {
      await api.deleteReview(r.id);
      showToast('Review deleted.');
      if (editingReview?.id === r.id) {
        setIsReviewModal(false);
        setEditingReview(null);
      }
      loadDataForTab('Reviews');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error deleting review');
    }
  };

  // 9. Inquiries
  const [isInquiryReplyModal, setIsInquiryReplyModal] = useState(false);
  const [activeInquiryId, setActiveInquiryId] = useState<string | null>(null);
  const [inquiryReplyText, setInquiryReplyText] = useState('');
  const [inquirySearchQuery, setInquirySearchQuery] = useState('');
  const [inquiryFilterStatus, setInquiryFilterStatus] = useState<string>('all');

  const handleDeleteInquiry = async (inq: Inquiry) => {
    if (!window.confirm(`Permanently delete inquiry from "${inq.name}"?`)) return;
    try {
      await api.deleteInquiry(inq.id);
      showToast('Inquiry deleted.');
      loadDataForTab('Inquiries');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error deleting inquiry');
    }
  };

  const handleUpdateInquiryStatus = async (inq: Inquiry, newStatus: string) => {
    try {
      await api.updateInquiryStatus(inq.id, newStatus);
      showToast(`Inquiry status updated to ${newStatus}`);
      loadDataForTab('Inquiries');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error updating inquiry status');
    }
  };

  // 10. Notifications
  const [isNotificationModal, setIsNotificationModal] = useState(false);
  const [notifForm, setNotifForm] = useState({ channel: 'email', event: 'promotion', message: '' });

  const handleDeleteNotification = async (id: string) => {
    try {
      await api.deleteNotification(id);
      showToast('Notification dismissed.');
      loadDataForTab('Notifications');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error deleting notification');
    }
  };

  const handleClearAllNotifications = async () => {
    if (!window.confirm('Clear all system notification history?')) return;
    try {
      await api.clearNotifications();
      showToast('All notifications cleared.');
      loadDataForTab('Notifications');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error clearing notifications');
    }
  };

  // 10b. Reports CSV Downloader
  const [downloadingReport, setDownloadingReport] = useState<string | null>(null);
  const handleDownloadReport = async (path: string, filename: string) => {
    try {
      setDownloadingReport(filename);
      const token = api.getToken();
      const headers = new Headers();
      if (token) headers.set('Authorization', `Bearer ${token}`);
      const res = await fetch(`/api${path}`, { headers });
      if (!res.ok) {
        throw new Error(`Report export failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast(`Exported ${filename} successfully!`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to download report');
    } finally {
      setDownloadingReport(null);
    }
  };

  // 11. Banners
  const [isBannerModal, setIsBannerModal] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    imageDesktop: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1800&auto=format&fit=crop',
    imageMobile: '',
    buttonText: 'Shop Collection',
    buttonUrl: '/shop?category=blazer',
    position: 'hero',
    sortOrder: 1,
    startDate: '',
    endDate: '',
    status: 'active' as string
  });

  const handleOpenCreateBanner = () => {
    setEditingBannerId(null);
    setBannerForm({
      title: '',
      subtitle: '',
      imageDesktop: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1800&auto=format&fit=crop',
      imageMobile: '',
      buttonText: 'Shop Collection',
      buttonUrl: '/shop?category=blazer',
      position: 'hero',
      sortOrder: (banners.length || 0) + 1,
      startDate: '',
      endDate: '',
      status: 'active'
    });
    setIsBannerModal(true);
  };

  const handleOpenEditBanner = (b: Banner) => {
    setEditingBannerId(b.id);
    setBannerForm({
      title: b.title || '',
      subtitle: b.subtitle || '',
      imageDesktop: b.imageDesktop || '',
      imageMobile: b.imageMobile || '',
      buttonText: b.buttonText || 'Shop Collection',
      buttonUrl: b.buttonUrl || '/shop',
      position: b.position || 'hero',
      sortOrder: b.sortOrder || 1,
      startDate: b.startDate ? b.startDate.slice(0, 10) : '',
      endDate: b.endDate ? b.endDate.slice(0, 10) : '',
      status: b.status || 'active'
    });
    setIsBannerModal(true);
  };

  const handleSaveBanner = async () => {
    if (!bannerForm.title.trim()) return showToast('Banner title is required');
    if (!bannerForm.imageDesktop.trim()) return showToast('Desktop image URL is required');
    try {
      if (editingBannerId) {
        await api.updateBanner(editingBannerId, bannerForm);
        showToast(`Banner "${bannerForm.title}" updated successfully!`);
      } else {
        await api.createBanner(bannerForm);
        showToast(`Banner "${bannerForm.title}" created successfully!`);
      }
      setIsBannerModal(false);
      loadDataForTab('Banners');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error saving banner');
    }
  };

  const handleToggleBannerStatus = async (b: Banner) => {
    const nextStatus = b.status === 'active' || b.status === 'published' ? 'inactive' : 'active';
    try {
      await api.updateBanner(b.id, { status: nextStatus });
      showToast(`Banner status changed to ${nextStatus}`);
      loadDataForTab('Banners');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error updating banner');
    }
  };

  // 12. Homepage Sections
  const [isSectionModal, setIsSectionModal] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [sectionForm, setSectionForm] = useState({
    title: '',
    subtitle: '',
    type: 'featured_products',
    sortOrder: 1,
    status: 'active'
  });

  const handleOpenCreateSection = () => {
    setEditingSectionId(null);
    setSectionForm({
      title: '',
      subtitle: '',
      type: 'featured_products',
      sortOrder: (homepageSections.length || 0) + 1,
      status: 'active'
    });
    setIsSectionModal(true);
  };

  const handleOpenEditSection = (sec: HomepageSection) => {
    setEditingSectionId(sec.id);
    setSectionForm({
      title: sec.title || '',
      subtitle: sec.subtitle || '',
      type: sec.type || 'featured_products',
      sortOrder: sec.sortOrder || 1,
      status: sec.status || 'active'
    });
    setIsSectionModal(true);
  };

  const handleSaveSection = async () => {
    if (!sectionForm.title.trim()) return showToast('Section title is required');
    try {
      if (editingSectionId) {
        await api.updateHomepageSection(editingSectionId, sectionForm);
        showToast(`Homepage section "${sectionForm.title}" updated!`);
      } else {
        await api.createHomepageSection(sectionForm);
        showToast(`Homepage section "${sectionForm.title}" created!`);
      }
      setIsSectionModal(false);
      loadDataForTab('Homepage Sections');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error saving homepage section');
    }
  };

  // 13. Offers
  const [isOfferModal, setIsOfferModal] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [offerForm, setOfferForm] = useState({
    name: '',
    code: '',
    discountType: 'percent',
    discountValue: 15,
    minimumOrderAmount: 3000,
    status: 'active'
  });

  const handleOpenCreateOffer = () => {
    setEditingOfferId(null);
    setOfferForm({
      name: '',
      code: '',
      discountType: 'percent',
      discountValue: 15,
      minimumOrderAmount: 3000,
      status: 'active'
    });
    setIsOfferModal(true);
  };

  const handleOpenEditOffer = (o: Offer) => {
    setEditingOfferId(o.id);
    setOfferForm({
      name: o.name || '',
      code: o.code || '',
      discountType: o.discountType || 'percent',
      discountValue: o.discountValue || 10,
      minimumOrderAmount: o.minimumOrderAmount || 0,
      status: o.status || 'active'
    });
    setIsOfferModal(true);
  };

  const handleSaveOffer = async () => {
    if (!offerForm.name.trim()) return showToast('Offer name is required');
    try {
      if (editingOfferId) {
        await api.updateOffer(editingOfferId, offerForm);
        showToast(`Offer "${offerForm.name}" updated!`);
      } else {
        await api.createOffer(offerForm);
        showToast(`Offer "${offerForm.name}" created!`);
      }
      setIsOfferModal(false);
      loadDataForTab('Offers');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error saving offer');
    }
  };

  // 14. Blog
  const [isBlogModal, setIsBlogModal] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [blogForm, setBlogForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200',
    status: 'published' as 'draft' | 'published' | 'scheduled'
  });

  const handleOpenCreateBlog = () => {
    setEditingBlogId(null);
    setBlogForm({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featuredImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200',
      status: 'published'
    });
    setIsBlogModal(true);
  };

  const handleOpenEditBlog = (p: BlogPost) => {
    setEditingBlogId(p.id);
    setBlogForm({
      title: p.title || '',
      slug: p.slug || '',
      excerpt: p.excerpt || '',
      content: p.content || '',
      featuredImage: p.featuredImage || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200',
      status: p.status || 'published'
    });
    setIsBlogModal(true);
  };

  const handleSaveBlog = async () => {
    if (!blogForm.title.trim()) return showToast('Blog title is required');
    try {
      const slug = blogForm.slug.trim() || blogForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (editingBlogId) {
        await api.updateBlogPost(editingBlogId, { ...blogForm, slug });
        showToast(`Blog post "${blogForm.title}" updated!`);
      } else {
        await api.createBlogPost({ ...blogForm, slug });
        showToast(`Blog post "${blogForm.title}" created!`);
      }
      setIsBlogModal(false);
      loadDataForTab('Blog');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error saving blog post');
    }
  };

  // 15. Pages
  const [isPageModal, setIsPageModal] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [pageForm, setPageForm] = useState({
    title: '',
    slug: '',
    content: '',
    status: 'published'
  });

  const handleOpenCreatePage = () => {
    setEditingPageId(null);
    setPageForm({ title: '', slug: '', content: '', status: 'published' });
    setIsPageModal(true);
  };

  const handleOpenEditPage = (pg: Page) => {
    setEditingPageId(pg.id);
    setPageForm({
      title: pg.title || '',
      slug: pg.slug || '',
      content: (pg as Record<string, unknown>).content as string || '',
      status: pg.status || 'published'
    });
    setIsPageModal(true);
  };

  const handleSavePage = async () => {
    if (!pageForm.title.trim()) return showToast('Page title is required');
    try {
      const slug = pageForm.slug.trim() || pageForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (editingPageId) {
        await api.updatePage(editingPageId, { ...pageForm, slug });
        showToast(`Page "${pageForm.title}" updated!`);
      } else {
        await api.createPage({ ...pageForm, slug });
        showToast(`Page "${pageForm.title}" created!`);
      }
      setIsPageModal(false);
      loadDataForTab('Pages');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error saving page');
    }
  };

  // 16. Media Library
  const [isMediaModal, setIsMediaModal] = useState(false);
  const [editingMediaId, setEditingMediaId] = useState<string | null>(null);
  const [mediaForm, setMediaForm] = useState({ name: '', url: '', folder: 'general' });

  const handleOpenCreateMedia = () => {
    setEditingMediaId(null);
    setMediaForm({ name: '', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200', folder: 'general' });
    setIsMediaModal(true);
  };

  const handleOpenEditMedia = (m: MediaItem) => {
    setEditingMediaId(m.id);
    setMediaForm({ name: m.name || '', url: m.url || '', folder: m.folder || 'general' });
    setIsMediaModal(true);
  };

  const handleSaveMedia = async () => {
    if (!mediaForm.url.trim()) return showToast('Media URL is required');
    try {
      if (editingMediaId) {
        await api.updateMedia(editingMediaId, mediaForm);
        showToast(`Media "${mediaForm.name}" updated!`);
      } else {
        await api.uploadMedia(mediaForm);
        showToast(`Media "${mediaForm.name || 'item'}" added!`);
      }
      setIsMediaModal(false);
      loadDataForTab('Media Library');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error saving media');
    }
  };

  const handleSelectMedia = (url: string) => {
    if (mediaPickerTarget === 'product') {
      setProdForm((prev) => ({
        ...prev,
        images: [...prev.images, url]
      }));
      showToast('Photo added to product gallery!');
    } else if (mediaPickerTarget === 'bannerDesktop') {
      setBannerForm((prev) => ({ ...prev, imageDesktop: url }));
      showToast('Desktop banner image updated!');
    } else if (mediaPickerTarget === 'bannerMobile') {
      setBannerForm((prev) => ({ ...prev, imageMobile: url }));
      showToast('Mobile banner image updated!');
    } else if (mediaPickerTarget === 'category') {
      setCategoryForm((prev) => ({ ...prev, image: url }));
      showToast('Category image updated!');
    } else if (mediaPickerTarget === 'blog') {
      setBlogForm((prev) => ({ ...prev, featuredImage: url }));
      showToast('Article image updated!');
    } else if (mediaPickerTarget === 'mediaForm') {
      setMediaForm((prev) => ({ ...prev, url }));
      showToast('Media URL set!');
    } else if (mediaPickerTarget === 'seoOgImage') {
      setSeoForm((prev) => ({ ...prev, openGraphImage: url }));
      showToast('Social Share (OG) image selected!');
    } else if (mediaPickerTarget === 'websiteLogo') {
      setWebsiteForm((prev) => ({ ...prev, logo: url }));
      showToast('Website Logo updated!');
    } else if (mediaPickerTarget === 'websiteFavicon') {
      setWebsiteForm((prev) => ({ ...prev, favicon: url }));
      showToast('Website Favicon updated!');
    } else if (mediaPickerTarget === 'brandLogo') {
      setBrandForm((prev) => ({ ...prev, logo: url }));
      showToast('Brand logo image updated!');
    } else if (mediaPickerTarget === 'brandBanner') {
      setBrandForm((prev) => ({ ...prev, banner: url }));
      showToast('Brand cover banner image updated!');
    }
    setIsMediaPickerOpen(false);
  };

  // 17. Admins & Roles
  const [isStaffModal, setIsStaffModal] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [staffForm, setStaffForm] = useState({ name: '', email: '', phone: '', password: '', roleId: 'role-super-admin', status: 'active' });

  const handleOpenCreateStaff = () => {
    setEditingAdminId(null);
    setStaffForm({ name: '', email: '', phone: '', password: '', roleId: roles[0]?.id || 'role-super-admin', status: 'active' });
    setIsStaffModal(true);
  };

  const handleOpenEditStaff = (adm: AdminUser) => {
    setEditingAdminId(adm.id);
    setStaffForm({
      name: adm.name || '',
      email: adm.email || '',
      phone: adm.phone || '',
      password: '',
      roleId: adm.roleId || roles[0]?.id || 'role-super-admin',
      status: adm.status || 'active'
    });
    setIsStaffModal(true);
  };

  const handleSaveStaff = async () => {
    if (!staffForm.name.trim()) return showToast('Staff name is required');
    if (!staffForm.email.trim()) return showToast('Staff email is required');
    try {
      if (editingAdminId) {
        await api.updateAdmin(editingAdminId, staffForm);
        showToast(`Staff "${staffForm.name}" updated!`);
      } else {
        if (!staffForm.password) return showToast('Password is required for new staff');
        await api.createAdmin(staffForm);
        showToast(`Staff "${staffForm.name}" created!`);
      }
      setIsStaffModal(false);
      loadDataForTab('Admins & Roles');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error saving staff');
    }
  };

  const [isRoleModal, setIsRoleModal] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleForm, setRoleForm] = useState({ name: '', label: '', description: '', permissions: [] as string[] });

  const handleOpenCreateRole = () => {
    setEditingRoleId(null);
    setRoleForm({ name: '', label: '', description: '', permissions: ['products.view', 'orders.view'] });
    setIsRoleModal(true);
  };

  const handleOpenEditRole = (r: RoleRecord) => {
    setEditingRoleId(r.id);
    setRoleForm({
      name: r.name || '',
      label: (r as Record<string, unknown>).label as string || r.name || '',
      description: r.description || '',
      permissions: r.permissions || []
    });
    setIsRoleModal(true);
  };

  const handleSaveRole = async () => {
    if (!roleForm.name.trim()) return showToast('Role name is required');
    try {
      if (editingRoleId) {
        await api.updateRole(editingRoleId, roleForm);
        showToast(`Role "${roleForm.name}" updated!`);
      } else {
        await api.createRole(roleForm);
        showToast(`Role "${roleForm.name}" created!`);
      }
      setIsRoleModal(false);
      loadDataForTab('Admins & Roles');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error saving role');
    }
  };

  // Header & Footer Studio Handlers
  const handleOpenAddNav = () => {
    setEditingNavIndex(null);
    setNavForm({
      id: `nav-${Date.now()}`,
      label: '',
      url: '',
      slug: '',
      highlight: false,
      badge: '',
      isHome: false,
      openInNewTab: false
    });
    setIsNavModal(true);
  };

  const handleOpenEditNav = (idx: number) => {
    const list = websiteForm.headerNavItems || DEFAULT_HEADER_NAV_ITEMS;
    const item = list[idx];
    if (!item) return;
    setEditingNavIndex(idx);
    setNavForm({ ...item });
    setIsNavModal(true);
  };

  const handleSaveNavItem = () => {
    if (!navForm.label.trim()) return showToast('Navigation label is required');
    const isHome = navForm.label.trim().toLowerCase() === 'home' || navForm.url === '/' || navForm.slug === 'home';
    const itemToSave = { ...navForm, isHome: isHome || navForm.isHome || false };
    const items = [...(websiteForm.headerNavItems || DEFAULT_HEADER_NAV_ITEMS)];
    if (editingNavIndex !== null && editingNavIndex >= 0) {
      items[editingNavIndex] = itemToSave;
      showToast(`Updated "${navForm.label}" navigation item`);
    } else {
      items.push({ ...itemToSave, id: navForm.id || `nav-${Date.now()}` });
      showToast(`Added "${navForm.label}" to navigation menu`);
    }
    setWebsiteForm({ ...websiteForm, headerNavItems: items });
    setIsNavModal(false);
  };

  const handleMoveNavItem = (index: number, direction: 'up' | 'down') => {
    const items = [...(websiteForm.headerNavItems || DEFAULT_HEADER_NAV_ITEMS)];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= items.length) return;
    const temp = items[index];
    items[index] = items[target];
    items[target] = temp;
    setWebsiteForm({ ...websiteForm, headerNavItems: items });
  };

  const handleDeleteNavItem = (index: number) => {
    const items = [...(websiteForm.headerNavItems || DEFAULT_HEADER_NAV_ITEMS)];
    const removed = items.splice(index, 1);
    setWebsiteForm({ ...websiteForm, headerNavItems: items });
    showToast(`Removed "${removed[0]?.label || 'link'}" from navigation menu`);
  };

  const handleResetNavItems = () => {
    setWebsiteForm({ ...websiteForm, headerNavItems: DEFAULT_HEADER_NAV_ITEMS });
    showToast('Reset navigation menu to default items');
  };

  const handleOpenAddPillar = () => {
    setEditingPillarIndex(null);
    setPillarForm({
      id: `pillar-${Date.now()}`,
      icon: 'truck',
      title: '',
      description: ''
    });
    setIsPillarModal(true);
  };

  const handleOpenEditPillar = (idx: number) => {
    const list = websiteForm.footerPillars || DEFAULT_FOOTER_PILLARS;
    const p = list[idx];
    if (!p) return;
    setEditingPillarIndex(idx);
    setPillarForm({ ...p });
    setIsPillarModal(true);
  };

  const handleSavePillar = () => {
    if (!pillarForm.title.trim()) return showToast('Pillar title is required');
    const pillars = [...(websiteForm.footerPillars || DEFAULT_FOOTER_PILLARS)];
    if (editingPillarIndex !== null && editingPillarIndex >= 0) {
      pillars[editingPillarIndex] = { ...pillarForm };
      showToast(`Updated "${pillarForm.title}" pillar`);
    } else {
      pillars.push({ ...pillarForm, id: pillarForm.id || `pillar-${Date.now()}` });
      showToast(`Added "${pillarForm.title}" to pillars of excellence`);
    }
    setWebsiteForm({ ...websiteForm, footerPillars: pillars });
    setIsPillarModal(false);
  };

  const handleMovePillar = (index: number, direction: 'up' | 'down') => {
    const pillars = [...(websiteForm.footerPillars || DEFAULT_FOOTER_PILLARS)];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= pillars.length) return;
    const temp = pillars[index];
    pillars[index] = pillars[target];
    pillars[target] = temp;
    setWebsiteForm({ ...websiteForm, footerPillars: pillars });
  };

  const handleDeletePillar = (index: number) => {
    const pillars = [...(websiteForm.footerPillars || DEFAULT_FOOTER_PILLARS)];
    const removed = pillars.splice(index, 1);
    setWebsiteForm({ ...websiteForm, footerPillars: pillars });
    showToast(`Removed "${removed[0]?.title || 'pillar'}"`);
  };

  const handleResetPillars = () => {
    setWebsiteForm({ ...websiteForm, footerPillars: DEFAULT_FOOTER_PILLARS });
    showToast('Reset pillars to default items');
  };

  const handleOpenAddColLink = (colKey: 'col1' | 'col2') => {
    setEditingColKey(colKey);
    setEditingColIndex(null);
    setColLinkForm({
      id: `link-${Date.now()}`,
      label: '',
      url: '',
      highlight: false,
      openInNewTab: false
    });
    setIsColLinkModal(true);
  };

  const handleOpenEditColLink = (colKey: 'col1' | 'col2', idx: number) => {
    const list = colKey === 'col1'
      ? (websiteForm.footerCol1Links || DEFAULT_FOOTER_COL1_LINKS)
      : (websiteForm.footerCol2Links || DEFAULT_FOOTER_COL2_LINKS);
    const link = list[idx];
    if (!link) return;
    setEditingColKey(colKey);
    setEditingColIndex(idx);
    setColLinkForm({ ...link });
    setIsColLinkModal(true);
  };

  const handleSaveColLink = () => {
    if (!colLinkForm.label.trim()) return showToast('Link label is required');
    if (!editingColKey) return;
    const isCol1 = editingColKey === 'col1';
    const list = isCol1
      ? [...(websiteForm.footerCol1Links || DEFAULT_FOOTER_COL1_LINKS)]
      : [...(websiteForm.footerCol2Links || DEFAULT_FOOTER_COL2_LINKS)];

    if (editingColIndex !== null && editingColIndex >= 0) {
      list[editingColIndex] = { ...colLinkForm };
      showToast(`Updated "${colLinkForm.label}" link`);
    } else {
      list.push({ ...colLinkForm, id: colLinkForm.id || `link-${Date.now()}` });
      showToast(`Added "${colLinkForm.label}" link`);
    }

    if (isCol1) {
      setWebsiteForm({ ...websiteForm, footerCol1Links: list });
    } else {
      setWebsiteForm({ ...websiteForm, footerCol2Links: list });
    }
    setIsColLinkModal(false);
  };

  const handleMoveColLink = (colKey: 'col1' | 'col2', index: number, direction: 'up' | 'down') => {
    const isCol1 = colKey === 'col1';
    const list = isCol1
      ? [...(websiteForm.footerCol1Links || DEFAULT_FOOTER_COL1_LINKS)]
      : [...(websiteForm.footerCol2Links || DEFAULT_FOOTER_COL2_LINKS)];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    if (isCol1) {
      setWebsiteForm({ ...websiteForm, footerCol1Links: list });
    } else {
      setWebsiteForm({ ...websiteForm, footerCol2Links: list });
    }
  };

  const handleDeleteColLink = (colKey: 'col1' | 'col2', index: number) => {
    const isCol1 = colKey === 'col1';
    const list = isCol1
      ? [...(websiteForm.footerCol1Links || DEFAULT_FOOTER_COL1_LINKS)]
      : [...(websiteForm.footerCol2Links || DEFAULT_FOOTER_COL2_LINKS)];
    const removed = list.splice(index, 1);
    if (isCol1) {
      setWebsiteForm({ ...websiteForm, footerCol1Links: list });
    } else {
      setWebsiteForm({ ...websiteForm, footerCol2Links: list });
    }
    showToast(`Removed "${removed[0]?.label || 'link'}"`);
  };

  const handleAddPaymentBadge = () => {
    const val = newPaymentBadgeInput.trim();
    if (!val) return;
    const current = websiteForm.footerPaymentBadges || DEFAULT_FOOTER_PAYMENT_BADGES;
    if (current.includes(val)) return showToast('Badge already exists');
    setWebsiteForm({ ...websiteForm, footerPaymentBadges: [...current, val] });
    setNewPaymentBadgeInput('');
    showToast(`Added payment badge "${val}"`);
  };

  const handleRemovePaymentBadge = (badgeToRemove: string) => {
    const current = websiteForm.footerPaymentBadges || DEFAULT_FOOTER_PAYMENT_BADGES;
    setWebsiteForm({ ...websiteForm, footerPaymentBadges: current.filter((b) => b !== badgeToRemove) });
    showToast(`Removed badge "${badgeToRemove}"`);
  };

  const handleSaveHeaderFooter = async () => {
    setIsSavingWebsite(true);
    try {
      const updated = await api.updateSettings(websiteForm);
      setSettings(updated);
      setWebsiteForm(updated);
      try {
        localStorage.setItem('zippy_settings', JSON.stringify(updated));
      } catch {
        // ignore
      }
      showToast('Header & Footer settings saved successfully!');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error updating Header & Footer settings');
    } finally {
      setIsSavingWebsite(false);
    }
  };

  // 18. SEO & URL Redirects
  const handleSaveSeo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingSeo(true);
    try {
      const updated = await api.updateSeo(seoForm);
      setSeo(updated);
      setSeoForm({
        metaTitle: updated.metaTitle || '',
        metaDescription: updated.metaDescription || '',
        metaKeywords: updated.metaKeywords || '',
        canonicalUrl: updated.canonicalUrl || '',
        openGraphImage: updated.openGraphImage || '',
        robots: updated.robots || 'index, follow',
        schemaMarkup: updated.schemaMarkup || ''
      });
      showToast('SEO Settings saved and updated successfully!');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error updating SEO settings');
    } finally {
      setIsSavingSeo(false);
    }
  };

  const handleAddRedirect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newRedirect.fromPath.trim() || !newRedirect.toPath.trim()) {
      showToast('Both source path and destination path are required.');
      return;
    }
    let fromPath = newRedirect.fromPath.trim();
    if (!fromPath.startsWith('/') && !fromPath.startsWith('http')) {
      fromPath = `/${fromPath}`;
    }
    let toPath = newRedirect.toPath.trim();
    if (!toPath.startsWith('/') && !toPath.startsWith('http')) {
      toPath = `/${toPath}`;
    }

    setIsAddingRedirect(true);
    try {
      await api.createRedirect({
        fromPath,
        toPath,
        statusCode: newRedirect.statusCode
      });
      showToast(`Redirect added: ${fromPath} → ${toPath}`);
      setNewRedirect({ fromPath: '', toPath: '', statusCode: 301 });
      const updatedList = await api.redirects();
      setRedirects(updatedList);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error creating redirect rule');
    } finally {
      setIsAddingRedirect(false);
    }
  };

  const handleDeleteRedirect = async (id: string, fromPath: string) => {
    if (!window.confirm(`Delete redirect rule for "${fromPath}"?`)) return;
    try {
      await api.deleteRedirect(id);
      showToast(`Redirect for "${fromPath}" deleted`);
      setRedirects((prev) => prev.filter((r) => r.id !== id));
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error deleting redirect rule');
    }
  };

  // 17. AI Copilot & Subsystem States & Handlers
  const [aiSettingsData, setAiSettingsData] = useState<AiSettings>({
    enabled: true,
    provider: 'gemini',
    model: 'gemini-3.1-pro',
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
      recommendations: true
    }
  });
  const [aiStatusData, setAiStatusData] = useState<{
    status: 'active' | 'fallback_active' | 'disabled';
    provider: string;
    model: string;
    hasApiKey: boolean;
    capabilities: string[];
  } | null>(null);
  const [aiKeyInput, setAiKeyInput] = useState('');
  const [aiTestPrompt, setAiTestPrompt] = useState('Suggest an ensemble for a winter wedding reception in Dhaka');
  const [aiTestResponse, setAiTestResponse] = useState('');
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [isSavingAi, setIsSavingAi] = useState(false);

  const handleSaveAiSettings = async () => {
    setIsSavingAi(true);
    try {
      const payload: Partial<AiSettings> = { ...aiSettingsData };
      if (aiKeyInput.trim()) {
        payload.apiKey = aiKeyInput.trim();
      }
      const updated = await api.updateAiSettings(payload);
      setAiSettingsData(updated);
      setAiKeyInput('');
      const stat = await api.aiStatus();
      setAiStatusData(stat);
      showToast('AI Intelligence settings updated successfully!');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error updating AI settings');
    } finally {
      setIsSavingAi(false);
    }
  };

  const handleTestAiChat = async () => {
    if (!aiTestPrompt.trim()) return;
    setIsTestingAi(true);
    setAiTestResponse('');
    try {
      const res = await api.aiChat({ message: aiTestPrompt });
      setAiTestResponse(res.reply);
      showToast('AI response generated successfully!');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'AI test failed');
    } finally {
      setIsTestingAi(false);
    }
  };

  // AI Operations Suite State & Handlers
  const [isAiUploadModalOpen, setIsAiUploadModalOpen] = useState(false);
  const [aiUploadPrompt, setAiUploadPrompt] = useState('');
  const [isUploadingWithAi, setIsUploadingWithAi] = useState(false);
  const [aiUploadResult, setAiUploadResult] = useState<any>(null);

  // AI Terminal State
  type AiTerminalEntry = {
    id: string;
    ts: string;
    input: string;
    status: 'running' | 'success' | 'error' | 'preview';
    type?: string;
    summary?: string;
    data?: any;
    dryRun?: boolean;
  };
  const [aiTerminalInput, setAiTerminalInput] = useState('');
  const [aiTerminalHistory, setAiTerminalHistory] = useState<AiTerminalEntry[]>([]);
  const [aiTerminalDryRun, setAiTerminalDryRun] = useState(false);
  const [isExecutingAiTerminal, setIsExecutingAiTerminal] = useState(false);
  const [aiTerminalHistoryIdx, setAiTerminalHistoryIdx] = useState(-1);
  const aiTerminalOutputRef = React.useRef<HTMLDivElement>(null);
  const aiTerminalInputRef = React.useRef<HTMLInputElement>(null);

  // Keep legacy state for backward compat with other parts of UI
  const [aiOpsActiveTab, setAiOpsActiveTab] = useState<'upload' | 'manage' | 'content' | 'command'>('upload');
  const [aiOpsCommandInput, setAiOpsCommandInput] = useState('');
  const [isExecutingAiOps, setIsExecutingAiOps] = useState(false);
  const [aiOpsSummaryResult, setAiOpsSummaryResult] = useState<{ summary: string; type?: string; data?: any } | null>(null);

  const handleRunAiUpload = async (dryRun = false) => {
    if (!aiUploadPrompt.trim()) return;
    setIsUploadingWithAi(true);
    setAiUploadResult(null);
    try {
      const res = await api.aiUploadProduct({ prompt: aiUploadPrompt, dryRun });
      setAiUploadResult(res);
      showToast(dryRun ? 'AI product preview generated!' : 'Product uploaded and published with AI!');
      if (!dryRun) {
        const updatedList = await api.products();
        setProducts(updatedList);
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'AI product upload failed');
    } finally {
      setIsUploadingWithAi(false);
    }
  };

  const handleRunAiTerminalCommand = async () => {
    const cmd = aiTerminalInput.trim();
    if (!cmd || isExecutingAiTerminal) return;
    const entryId = `te-${Date.now()}`;
    const ts = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const runningEntry: AiTerminalEntry = { id: entryId, ts, input: cmd, status: 'running', dryRun: aiTerminalDryRun };
    setAiTerminalHistory(prev => [...prev, runningEntry]);
    setAiTerminalInput('');
    setAiTerminalHistoryIdx(-1);
    setIsExecutingAiTerminal(true);
    window.setTimeout(() => {
      if (aiTerminalOutputRef.current) {
        aiTerminalOutputRef.current.scrollTop = aiTerminalOutputRef.current.scrollHeight;
      }
    }, 50);
    try {
      const res = await api.aiCommand({ command: cmd, dryRun: aiTerminalDryRun });
      const status: AiTerminalEntry['status'] = aiTerminalDryRun ? 'preview' : 'success';
      let typeLabel = res.actionType === 'product_upload' ? '📦 Product Upload'
        : res.actionType === 'product_manage' ? '⚙️ Catalog Update'
        : res.actionType === 'content_update' ? '📝 Content Update'
        : '🤖 AI Command';
      setAiTerminalHistory(prev => prev.map(e =>
        e.id === entryId ? { ...e, status, type: typeLabel, summary: res.summary, data: res.result } : e
      ));
      if (!aiTerminalDryRun && (res.actionType === 'product_upload' || res.actionType === 'product_manage')) {
        const updatedList = await api.products();
        setProducts(updatedList);
      }
      showToast(aiTerminalDryRun ? 'Preview ready (dry-run mode)' : 'AI command executed!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'AI operation failed';
      setAiTerminalHistory(prev => prev.map(e =>
        e.id === entryId ? { ...e, status: 'error', summary: msg } : e
      ));
      showToast(msg);
    } finally {
      setIsExecutingAiTerminal(false);
      window.setTimeout(() => {
        if (aiTerminalOutputRef.current) {
          aiTerminalOutputRef.current.scrollTop = aiTerminalOutputRef.current.scrollHeight;
        }
        aiTerminalInputRef.current?.focus();
      }, 100);
    }
  };

  const handleAiTerminalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const cmds = aiTerminalHistory.map(h => h.input).filter(Boolean);
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRunAiTerminalCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIdx = Math.min(aiTerminalHistoryIdx + 1, cmds.length - 1);
      setAiTerminalHistoryIdx(newIdx);
      setAiTerminalInput(cmds[cmds.length - 1 - newIdx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIdx = Math.max(aiTerminalHistoryIdx - 1, -1);
      setAiTerminalHistoryIdx(newIdx);
      setAiTerminalInput(newIdx === -1 ? '' : cmds[cmds.length - 1 - newIdx] || '');
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setAiTerminalHistory([]);
    }
  };

  const handleRunAiCommand = async () => {
    if (!aiOpsCommandInput.trim()) return;
    setIsExecutingAiOps(true);
    setAiOpsSummaryResult(null);
    try {
      if (aiOpsActiveTab === 'upload') {
        const res = await api.aiUploadProduct({ prompt: aiOpsCommandInput, dryRun: false });
        setAiOpsSummaryResult({ summary: res.summary, type: 'Product Upload', data: res.product });
        const updatedList = await api.products();
        setProducts(updatedList);
        showToast('Product created with AI!');
      } else if (aiOpsActiveTab === 'manage') {
        const res = await api.aiManageProduct({ command: aiOpsCommandInput });
        setAiOpsSummaryResult({ summary: res.summary, type: 'Catalog Update', data: res.changes });
        const updatedList = await api.products();
        setProducts(updatedList);
        showToast('Catalog updated with AI!');
      } else if (aiOpsActiveTab === 'content') {
        const res = await api.aiUpdateContent({ prompt: aiOpsCommandInput });
        setAiOpsSummaryResult({ summary: res.summary, type: `Content (${res.target})`, data: res.updatedRecord });
        showToast('Storefront content updated with AI!');
      } else {
        const res = await api.aiCommand({ command: aiOpsCommandInput });
        setAiOpsSummaryResult({ summary: res.summary, type: res.actionType, data: res.result });
        if (res.actionType === 'product_upload' || res.actionType === 'product_manage') {
          const updatedList = await api.products();
          setProducts(updatedList);
        }
        showToast('AI command executed successfully!');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'AI operation failed');
    } finally {
      setIsExecutingAiOps(false);
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3000);
  };

  const loadDataForTab = async (tab: TabKey) => {
    setLoading(true);
    try {
      switch (tab) {
        case 'Dashboard': {
          const [s, o, r] = await Promise.all([api.stats(), api.orders(), api.reviews()]);
          setStats(s);
          setOrders(o);
          setReviews(r);
          break;
        }
        case 'Products': {
          const [p, c] = await Promise.all([api.products(), api.categories()]);
          setProducts(p);
          setCategories(c);
          break;
        }
        case 'Categories': {
          const [c, p] = await Promise.all([api.categories(), api.products().catch(() => [])]);
          setCategories(c);
          if (p && p.length > 0) setProducts(p);
          break;
        }
        case 'Brands': {
          setBrands(await api.brands());
          break;
        }
        case 'Inventory': {
          const [inv, wh, prod, val, txns] = await Promise.all([
            api.inventory(),
            api.warehouses(),
            api.products(),
            api.inventoryValuation().catch(() => null),
            api.inventoryTransactions().catch(() => [])
          ]);
          setInventory(inv);
          setWarehouses(wh);
          if (prod) setProducts(prod);
          if (val) setStockValuation(val);
          if (txns) setInventoryTransactions(txns);
          break;
        }
        case 'Warehouses': {
          setWarehouses(await api.warehouses());
          break;
        }
        case 'Orders': {
          setOrders(await api.orders());
          break;
        }
        case 'Payment Gateways': {
          setPaymentMethods(await api.paymentMethods());
          break;
        }
        case 'Customers': {
          setCustomers(await api.customers());
          break;
        }
        case 'Reviews': {
          setReviews(await api.reviews());
          break;
        }
        case 'Inquiries': {
          setInquiries(await api.inquiries());
          break;
        }
        case 'Banners': {
          setBanners(await api.banners());
          break;
        }
        case 'Homepage Sections': {
          setHomepageSections(await api.homepageSections());
          break;
        }
        case 'Offers': {
          setOffers(await api.offers());
          break;
        }
        case 'Coupons': {
          setCoupons(await api.coupons());
          break;
        }
        case 'Blog': {
          setBlogPosts(await api.blogPosts());
          break;
        }
        case 'Pages': {
          setPages(await api.pages());
          break;
        }
        case 'Media Library': {
          setMediaList(await api.media());
          break;
        }
        case 'Sales Report':
        case 'Reports': {
          setStats(await api.stats());
          break;
        }
        case 'Admins & Roles': {
          const [adm, rls] = await Promise.all([api.admins(), api.roles()]);
          setAdmins(adm);
          setRoles(rls);
          break;
        }
        case 'Header & Footer': {
          const s = await api.settings();
          setSettings(s);
          setWebsiteForm(s);
          break;
        }
        case 'Website Settings': {
          const [s, aiData, aiStat] = await Promise.all([
            api.settings(),
            api.aiSettings().catch(() => null),
            api.aiStatus().catch(() => null)
          ]);
          setSettings(s);
          setWebsiteForm(s);
          if (aiData) setAiSettingsData(aiData);
          if (aiStat) setAiStatusData(aiStat);
          try {
            localStorage.setItem('zippy_settings', JSON.stringify(s));
          } catch {
            // ignore
          }
          break;
        }
        case 'SEO Settings': {
          const [seoData, redirectsData] = await Promise.all([
            api.seo().catch(() => null),
            api.redirects().catch(() => [])
          ]);
          if (seoData) {
            setSeo(seoData);
            setSeoForm({
              metaTitle: seoData.metaTitle || "Zippy | Gentleman's Bespoke Fashion Atelier",
              metaDescription: seoData.metaDescription || 'Premium handcrafted menswear, suits, blazers, and panjabis in Dhaka.',
              metaKeywords: seoData.metaKeywords || 'menswear, panjabi, bespoke, suits, dhaka, bangladesh',
              canonicalUrl: seoData.canonicalUrl || 'https://zippy.com.bd',
              openGraphImage: seoData.openGraphImage || '',
              robots: seoData.robots || 'index, follow',
              schemaMarkup: seoData.schemaMarkup || ''
            });
          }
          if (Array.isArray(redirectsData)) {
            setRedirects(redirectsData);
          }
          break;
        }
        case 'Notifications': {
          setNotifications(await api.notifications());
          break;
        }
        case 'Audit Logs': {
          setAuditLogs(await api.auditLogs());
          break;
        }
        case 'Live Chat': {
          try {
            const threads = await api.chatThreads();
            const total = threads.reduce((acc, t) => acc + (t.unreadCountAdmin || 0), 0);
            setLiveChatUnreadCount(total);
          } catch {
            // ignore
          }
          break;
        }
      }
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch data';
      showToast(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (targetTab?: TabKey) => {
    const tabToRefresh = targetTab || activeTab;
    setIsRefreshing(true);
    try {
      try {
        const s = await api.settings();
        setSettings(s);
        setWebsiteForm(s);
        localStorage.setItem('zippy_settings', JSON.stringify(s));
      } catch {
        // ignore
      }

      const ok = await loadDataForTab(tabToRefresh);
      if (ok) {
        showToast(`${tabToRefresh} data refreshed successfully!`);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const boot = async () => {
      if (!getToken()) {
        setBooting(false);
        return;
      }
      try {
        const me = await api.me();
        if (me.role !== 'ADMIN') {
          setToken(null);
          setBooting(false);
          return;
        }
        setUser(me);
        api.settings().then((s) => {
          setSettings(s);
          setWebsiteForm(s);
          try {
            localStorage.setItem('zippy_settings', JSON.stringify(s));
          } catch {
            // ignore
          }
        }).catch(() => {});
        api.seo().then((seoData) => {
          if (seoData) {
            setSeo(seoData);
            setSeoForm({
              metaTitle: seoData.metaTitle || '',
              metaDescription: seoData.metaDescription || '',
              metaKeywords: seoData.metaKeywords || '',
              canonicalUrl: seoData.canonicalUrl || '',
              openGraphImage: seoData.openGraphImage || '',
              robots: seoData.robots || 'index, follow',
              schemaMarkup: seoData.schemaMarkup || ''
            });
          }
        }).catch(() => {});
        await loadDataForTab('Dashboard');
      } catch {
        setToken(null);
      } finally {
        setBooting(false);
      }
    };
    boot();
  }, []);

  useEffect(() => {
    if (settings?.favicon) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'shortcut icon';
        document.head.appendChild(link);
      }
      link.href = settings.favicon;
    }
  }, [settings?.favicon]);

  useEffect(() => {
    if (!user) return;
    const checkUnread = () => {
      api
        .chatThreads()
        .then((threads) => {
          if (Array.isArray(threads)) {
            setLiveChatUnreadCount(threads.reduce((acc, t) => acc + (t.unreadCountAdmin || 0), 0));
          }
        })
        .catch(() => {});
    };
    checkUnread();
    const timer = setInterval(checkUnread, 5000);
    return () => clearInterval(timer);
  }, [user]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setSearchTerm('');
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
    loadDataForTab(tab);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await api.login(email, password);
      if (res.user.role !== 'ADMIN') {
        setLoginError('Access denied: Administrator privileges required.');
        return;
      }
      setToken(res.token);
      setUser(res.user);
      api.settings().then((s) => {
        setSettings(s);
        setWebsiteForm(s);
        try {
          localStorage.setItem('zippy_settings', JSON.stringify(s));
        } catch {
          // ignore
        }
      }).catch(() => {});
      showToast(`Welcome back, ${res.user.fullName}`);
      await loadDataForTab('Dashboard');
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : 'Invalid credentials');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    showToast('Signed out successfully.');
  };

  if (booting) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-neutral-400 font-sans">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mr-3" />
        <span>Loading Zippy CMS Console...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4 font-sans text-neutral-100">
        <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl tracking-widest text-amber-500 font-bold mb-2">ZIPPY</h1>
            <p className="text-xs uppercase tracking-widest text-neutral-400">Gentleman Atelier CMS</p>
          </div>
          {loginError && (
            <div className="mb-6 p-3 bg-red-950/60 border border-red-800/80 rounded text-red-200 text-sm">
              {loginError}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold py-2.5 rounded transition text-sm tracking-wider uppercase"
            >
              Sign In to CMS
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex font-sans">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-800 border border-amber-500/50 text-neutral-100 px-4 py-3 rounded-lg shadow-xl text-sm flex items-center space-x-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-amber-500" />
          <span>{toast}</span>
        </div>
      )}

      {/* Sidebar: All 23 specification sections */}
      <aside className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col flex-shrink-0 select-none">
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="overflow-hidden">
            <h2 className="font-serif text-xl tracking-widest text-amber-500 font-bold truncate">
              {settings?.backend_name || settings?.backendName || 'ZIPPY'}
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 truncate">
              {settings?.website_name || settings?.websiteName || 'Zippy CMS'}
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-sm custom-scrollbar">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleTabChange(item.key)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition ${
                  active
                    ? 'bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/30'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-amber-500' : 'text-neutral-400'}`} />
                <span className="truncate flex-1">{item.label}</span>
                {item.key === 'Live Chat' && liveChatUnreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-bold animate-pulse">
                    {liveChatUnreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-800 bg-neutral-900/50 flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-xs font-semibold text-neutral-200 truncate">{user.fullName}</p>
            <p className="text-[10px] text-amber-500 truncate uppercase font-bold tracking-wider">{user.role}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-neutral-950">
        {/* Top bar */}
        <header className="h-16 border-b border-neutral-800 bg-neutral-900/40 px-8 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <h1 className="text-lg font-serif font-bold text-neutral-100 tracking-wide">{activeTab}</h1>
            {(loading || isRefreshing) && <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs text-neutral-400">API Status: <span className="text-emerald-400 font-semibold">Online (v1)</span></span>
            <button
              onClick={() => handleRefresh(activeTab)}
              disabled={loading || isRefreshing}
              title={`Refresh ${activeTab} data`}
              className="text-xs flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 rounded border border-neutral-700 transition cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || loading ? 'animate-spin text-amber-400' : ''}`} />
              <span>{isRefreshing || loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </header>

        {/* Tab View Container */}
        <div ref={mainContentRef} className="flex-1 overflow-y-auto p-8">
          {/* 1. DASHBOARD */}
          {activeTab === 'Dashboard' && (
            <div className="space-y-8 max-w-7xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                  <p className="text-xs uppercase tracking-wider text-neutral-400 mb-1">Total Sales</p>
                  <p className="text-2xl font-serif font-bold text-amber-400">
                    ৳{(stats?.grossRevenue || stats?.total_sales || 0).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-2">All time completed orders</p>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                  <p className="text-xs uppercase tracking-wider text-neutral-400 mb-1">Total Orders</p>
                  <p className="text-2xl font-serif font-bold text-neutral-100">
                    {stats?.totalOrders || stats?.total_orders || orders.length}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-2">
                    Pending: <span className="text-amber-500">{stats?.pendingOrders ?? 0}</span>
                  </p>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                  <p className="text-xs uppercase tracking-wider text-neutral-400 mb-1">Catalog Products</p>
                  <p className="text-2xl font-serif font-bold text-neutral-100">
                    {stats?.catalogCount || stats?.total_products || 0}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-2">Active products in inventory</p>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                  <p className="text-xs uppercase tracking-wider text-neutral-400 mb-1">Low Stock Alerts</p>
                  <p className="text-2xl font-serif font-bold text-red-400">
                    {stats?.lowStock || stats?.low_stock_products || 0}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-2">Items below threshold</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Orders */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                  <h3 className="font-serif font-bold text-base text-neutral-200 mb-4 flex items-center justify-between">
                    <span>Recent Customer Orders</span>
                    <button
                      onClick={() => handleTabChange('Orders')}
                      className="text-xs text-amber-500 hover:underline"
                    >
                      View All
                    </button>
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-neutral-300">
                      <thead className="text-neutral-500 uppercase border-b border-neutral-800">
                        <tr>
                          <th className="py-2.5">Order</th>
                          <th>Customer</th>
                          <th>Total</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/60">
                        {(stats?.recent_orders || orders).slice(0, 6).map((ord) => (
                          <tr key={ord.id}>
                            <td className="py-3 font-mono text-neutral-200">{ord.orderNumber}</td>
                            <td>{ord.customer?.fullName || 'Guest'}</td>
                            <td className="font-semibold text-neutral-100">৳{ord.total?.toLocaleString()}</td>
                            <td>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-amber-400 border border-amber-500/30">
                                {ord.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Reviews */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                  <h3 className="font-serif font-bold text-base text-neutral-200 mb-4 flex items-center justify-between">
                    <span>Recent Reviews & Feedback</span>
                    <button
                      onClick={() => handleTabChange('Reviews')}
                      className="text-xs text-amber-500 hover:underline"
                    >
                      Moderate
                    </button>
                  </h3>
                  <div className="space-y-4">
                    {(stats?.recent_reviews || reviews).slice(0, 4).map((rev) => (
                      <div key={rev.id} className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-xs text-neutral-200">{rev.authorName}</span>
                          <span className="text-amber-400 text-xs">★ {rev.rating} / 5</span>
                        </div>
                        <p className="text-xs text-neutral-400 line-clamp-2">{rev.comment}</p>
                      </div>
                    ))}
                    {reviews.length === 0 && (
                      <p className="text-xs text-neutral-500 text-center py-6">No customer reviews yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. PRODUCTS */}
          {activeTab === 'Products' && (
            <div className="space-y-6 max-w-7xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Search products by name, SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleRefresh('Products')}
                    disabled={loading || isRefreshing}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-300 rounded-lg text-xs font-medium transition cursor-pointer active:scale-95"
                    title="Refresh products"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || loading ? 'animate-spin text-amber-400' : ''}`} />
                    <span>{isRefreshing || loading ? 'Refreshing...' : 'Refresh'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAiUploadPrompt('');
                      setAiUploadResult(null);
                      setIsAiUploadModalOpen(true);
                    }}
                    className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-neutral-950 font-bold px-3.5 py-2 rounded-lg text-sm transition shadow-sm cursor-pointer active:scale-95"
                    title="Upload product using AI specifications"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>AI Quick Upload</span>
                  </button>
                  <button
                    onClick={handleOpenCreateProduct}
                    className="flex items-center space-x-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-100 font-bold px-4 py-2 rounded-lg text-sm transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Product</span>
                  </button>
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow">
                <table className="w-full text-left text-sm text-neutral-300">
                  <thead className="bg-neutral-950 text-neutral-400 text-xs uppercase tracking-wider border-b border-neutral-800">
                    <tr>
                      <th className="py-3 px-4">Product</th>
                      <th>SKU</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th className="text-right px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {products
                      .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((prod) => (
                        <tr key={prod.id} className="hover:bg-neutral-800/40">
                          <td className="py-3 px-4 flex items-center space-x-3 cursor-pointer group" onClick={() => handleOpenEditProduct(prod)}>
                            <div className="relative shrink-0">
                              <img
                                src={prod.images?.[0] || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=200'}
                                alt={prod.name}
                                className="w-10 h-10 object-cover rounded bg-neutral-800 border border-neutral-700/60 group-hover:border-amber-500/80 transition"
                              />
                              {prod.images && prod.images.length > 1 && (
                                <span className="absolute -bottom-1 -right-1 bg-amber-500 text-neutral-950 font-bold text-[9px] px-1 py-0.2 rounded-full shadow">
                                  +{prod.images.length - 1}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <p className="font-semibold text-neutral-100 group-hover:text-amber-400 transition">{prod.name}</p>
                                {prod.featured && <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded">Featured</span>}
                                {prod.newArrival && <span className="text-[9px] font-bold px-1.5 py-0.2 bg-blue-500/20 text-blue-400 border border-blue-500/40 rounded">New</span>}
                                {prod.bestSeller && <span className="text-[9px] font-bold px-1.5 py-0.2 bg-purple-500/20 text-purple-400 border border-purple-500/40 rounded">Best</span>}
                              </div>
                              <p className="text-xs text-neutral-500">{prod.fabric || prod.fit || 'Bespoke Garment'}</p>
                            </div>
                          </td>
                          <td className="font-mono text-xs text-neutral-400">{prod.sku}</td>
                          <td>
                            <span className="px-2 py-0.5 rounded text-xs bg-neutral-800 text-neutral-300 border border-neutral-700">
                              {prod.categoryName || prod.categoryId}
                            </span>
                          </td>
                          <td className="font-semibold text-neutral-200">
                            ৳{prod.price?.toLocaleString()}
                            {prod.salePrice && <span className="text-xs text-amber-500 ml-2">৳{prod.salePrice.toLocaleString()}</span>}
                          </td>
                          <td>
                            <span className="text-xs font-semibold text-emerald-400">
                              {prod.stockQuantity ?? Object.values(prod.stock || {}).reduce((a, b) => a + b, 0)} pcs
                            </span>
                          </td>
                          <td>
                            {prod.status === 'draft' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-400 border border-neutral-700">
                                Draft
                              </span>
                            ) : prod.status === 'archived' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 text-amber-400 border border-amber-800">
                                Archived
                              </span>
                            ) : prod.status === 'inactive' || prod.isActive === false ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950/60 text-red-400 border border-red-800">
                                Inactive
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                                Published
                              </span>
                            )}
                          </td>
                          <td className="text-right px-4">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleOpenEditProduct(prod)}
                                title="Edit Product"
                                className="p-1.5 text-neutral-400 hover:text-amber-400 rounded transition"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    await api.duplicateProduct(prod.id);
                                    showToast('Product duplicated successfully');
                                    loadDataForTab('Products');
                                  } catch (err: unknown) {
                                    showToast(err instanceof Error ? err.message : 'Error duplicating');
                                  }
                                }}
                                title="Duplicate Product"
                                className="p-1.5 text-neutral-400 hover:text-amber-400 rounded transition"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (!confirm(`Delete product ${prod.name}?`)) return;
                                  try {
                                    await api.deleteProduct(prod.id);
                                    showToast('Product deleted');
                                    loadDataForTab('Products');
                                  } catch (err: unknown) {
                                    showToast(err instanceof Error ? err.message : 'Error deleting');
                                  }
                                }}
                                title="Delete Product"
                                className="p-1.5 text-neutral-400 hover:text-red-400 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {/* AI Quick Product Uploader Modal */}
              {isAiUploadModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                    <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-neutral-100">AI Autonomous Product Uploader</h3>
                          <p className="text-[11px] text-neutral-400">Generate complete product data, luxury copy, sizes & stock from text</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAiUploadModalOpen(false)}
                        className="p-1 text-neutral-400 hover:text-neutral-200 rounded"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="p-5 space-y-4 overflow-y-auto flex-1">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs uppercase text-neutral-400 font-semibold">Product Description or Specifications</label>
                          <span className="text-[11px] text-neutral-500">Fast samples:</span>
                        </div>
                        {/* Quick Presets */}
                        <div className="flex flex-wrap gap-1.5 mb-2.5">
                          {[
                            'Royal Silk Panjabi in Emerald Green, price 18500, sale 16500, sizes 38, 40, 42, 44',
                            'Imperial Midnight Velvet Sherwani with zardozi embroidery, price 35000, category Sherwani',
                            'Charcoal Italian Super 140s Wool Tailored Suit, price 28000 BDT, sizes 38, 40, 42',
                            'Signature Egyptian Giza Cotton Luxury Shirt in Pure White, price 7500 BDT, sizes S, M, L, XL'
                          ].map((sample, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setAiUploadPrompt(sample)}
                              className="text-[11px] px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-amber-300 rounded border border-neutral-700 transition"
                            >
                              + {sample.slice(0, 32)}...
                            </button>
                          ))}
                        </div>
                        <textarea
                          rows={4}
                          value={aiUploadPrompt}
                          onChange={(e) => setAiUploadPrompt(e.target.value)}
                          placeholder="Type or paste product notes, fabric details, price, sizes, etc. Example: 'Emerald Green Handloom Jamdani Panjabi, pure handloom cotton-silk, price 18500 BDT, sale 16500, sizes 38, 40, 42, 44 with 15 stock each...'"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-xs text-neutral-100 focus:outline-none focus:border-amber-500 leading-relaxed font-mono"
                        />
                      </div>

                      {/* Result Box */}
                      {aiUploadResult && (
                        <div className="p-4 bg-neutral-950 border border-amber-500/30 rounded-lg space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                              <Check className="w-3.5 h-3.5" />
                              <span>{aiUploadResult.dryRun ? 'Draft Preview Ready' : 'Product Uploaded & Published'}</span>
                            </span>
                            <span className="text-[11px] font-mono text-neutral-400">SKU: {aiUploadResult.product?.sku}</span>
                          </div>
                          <p className="text-xs text-neutral-300 leading-relaxed">{aiUploadResult.summary}</p>
                          {aiUploadResult.product && (
                            <div className="p-2.5 bg-neutral-900 rounded border border-neutral-800 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
                              <div>
                                <span className="text-neutral-500 text-[10px] block">NAME</span>
                                <span className="text-neutral-100 font-semibold truncate block">{aiUploadResult.product.name}</span>
                              </div>
                              <div>
                                <span className="text-neutral-500 text-[10px] block">CATEGORY</span>
                                <span className="text-amber-400 font-semibold truncate block">{aiUploadResult.product.categoryName}</span>
                              </div>
                              <div>
                                <span className="text-neutral-500 text-[10px] block">PRICE</span>
                                <span className="text-emerald-400 font-semibold block">
                                  ৳{aiUploadResult.product.price?.toLocaleString()}
                                  {aiUploadResult.product.salePrice && <span className="text-neutral-400 line-through ml-1 text-[10px]">৳{aiUploadResult.product.salePrice}</span>}
                                </span>
                              </div>
                              <div>
                                <span className="text-neutral-500 text-[10px] block">SIZES & STOCK</span>
                                <span className="text-neutral-200 block truncate font-mono text-[11px]">
                                  {Object.entries(aiUploadResult.product.stock || {}).map(([s, q]) => `${s}:${q}`).join(' | ')}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="p-4 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setIsAiUploadModalOpen(false)}
                        className="px-4 py-2 text-xs text-neutral-400 hover:text-neutral-200 font-medium"
                      >
                        Cancel
                      </button>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleRunAiUpload(true)}
                          disabled={isUploadingWithAi || !aiUploadPrompt.trim()}
                          className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 rounded-lg text-xs font-semibold transition"
                        >
                          Preview Draft
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRunAiUpload(false)}
                          disabled={isUploadingWithAi || !aiUploadPrompt.trim()}
                          className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 text-neutral-950 rounded-lg text-xs font-bold transition shadow-sm"
                        >
                          {isUploadingWithAi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                          <span>{isUploadingWithAi ? 'Processing...' : 'Upload & Publish with AI'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. CATEGORIES MANAGEMENT */}
          {activeTab === 'Categories' && (() => {
            const totalCategories = categories.length;
            const activeCategoriesCount = categories.filter((c) => c.status === 'active').length;
            const subcategoriesCount = categories.filter((c) => Boolean(c.parentId)).length;
            const totalCatalogItems = categories.reduce((sum, c) => sum + (c.itemCount || 0), 0);
            const totalStockAcrossCategories = categories.reduce((sum, c) => sum + (c.totalStockUnits || 0), 0);

            const filteredCategories = categories.filter((c) => {
              if (categoryFilterLevel === 'parent' && c.parentId) return false;
              if (categoryFilterLevel === 'sub' && !c.parentId) return false;
              if (categoryFilterStatus !== 'all' && c.status !== categoryFilterStatus) return false;
              if (categorySearchQuery.trim()) {
                const q = categorySearchQuery.toLowerCase();
                const matchName = c.name?.toLowerCase().includes(q);
                const matchSlug = c.slug?.toLowerCase().includes(q);
                const matchDesc = c.description?.toLowerCase().includes(q);
                const matchParent = c.parentName?.toLowerCase().includes(q);
                if (!matchName && !matchSlug && !matchDesc && !matchParent) return false;
              }
              return true;
            });

            if (categorySortBy === 'name') {
              filteredCategories.sort((a, b) => a.name.localeCompare(b.name));
            } else if (categorySortBy === 'items') {
              filteredCategories.sort((a, b) => (b.itemCount || 0) - (a.itemCount || 0));
            } else if (categorySortBy === 'stock') {
              filteredCategories.sort((a, b) => (b.totalStockUnits || 0) - (a.totalStockUnits || 0));
            } else {
              filteredCategories.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
            }

            return (
              <div className="space-y-6 max-w-7xl">
                {/* Header & Main Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <FolderTree className="w-5 h-5 text-amber-500" />
                      <h3 className="text-xl font-serif font-bold text-neutral-100">
                        Category & Taxonomy Management
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        ORGANIZED TAXONOMY
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      Configure primary departments, nested subcategories, storefront navigation order, and product mapping.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRefresh('Categories')}
                      disabled={loading || isRefreshing}
                      className="flex items-center space-x-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 rounded-lg text-xs font-medium transition cursor-pointer active:scale-95"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || loading ? 'animate-spin text-amber-400' : ''}`} />
                      <span>Refresh</span>
                    </button>
                    <button
                      onClick={handleOpenCreateCategory}
                      className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded-lg text-sm transition shadow-lg shadow-amber-500/10 cursor-pointer active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Category</span>
                    </button>
                  </div>
                </div>

                {/* 4 Metric KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">Total Categories</span>
                      <FolderTree className="w-4 h-4 text-neutral-500" />
                    </div>
                    <div className="mt-2 flex items-baseline space-x-2">
                      <span className="text-2xl font-serif font-bold text-neutral-100">{totalCategories}</span>
                      <span className="text-xs text-neutral-400">taxonomies</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-2 pt-2 border-t border-neutral-800/80">
                      Primary collection structure
                    </p>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">Active in Storefront</span>
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="mt-2 flex items-baseline space-x-2">
                      <span className="text-2xl font-serif font-bold text-emerald-400">{activeCategoriesCount}</span>
                      <span className="text-xs text-neutral-400">
                        ({totalCategories > 0 ? Math.round((activeCategoriesCount / totalCategories) * 100) : 0}% live)
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-2 pt-2 border-t border-neutral-800/80">
                      Visible on navigation menus and filters
                    </p>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">Subcategories</span>
                      <Layers className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="mt-2 flex items-baseline space-x-2">
                      <span className="text-2xl font-serif font-bold text-blue-400">{subcategoriesCount}</span>
                      <span className="text-xs text-neutral-400">nested</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-2 pt-2 border-t border-neutral-800/80">
                      Secondary sub-branches of departments
                    </p>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">Catalog Coverage</span>
                      <Package className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="mt-2 flex items-baseline space-x-2">
                      <span className="text-2xl font-serif font-bold text-amber-400">{totalCatalogItems}</span>
                      <span className="text-xs text-neutral-400">garments</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-2 pt-2 border-t border-neutral-800/80">
                      {totalStockAcrossCategories.toLocaleString()} stock units in circulation
                    </p>
                  </div>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                      <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={categorySearchQuery}
                        onChange={(e) => setCategorySearchQuery(e.target.value)}
                        placeholder="Search category name, slug, or parent..."
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <select
                      value={categoryFilterLevel}
                      onChange={(e) => setCategoryFilterLevel(e.target.value as any)}
                      className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-amber-500"
                    >
                      <option value="all">All Levels (Root & Sub)</option>
                      <option value="parent">Root / Main Categories Only</option>
                      <option value="sub">Subcategories Only</option>
                    </select>

                    <select
                      value={categoryFilterStatus}
                      onChange={(e) => setCategoryFilterStatus(e.target.value as any)}
                      className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-amber-500"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active Only</option>
                      <option value="inactive">Inactive Only</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-neutral-500">Sort by:</span>
                    <select
                      value={categorySortBy}
                      onChange={(e) => setCategorySortBy(e.target.value as any)}
                      className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-amber-500"
                    >
                      <option value="order">Display Order (1 &rarr; N)</option>
                      <option value="name">Category Name (A-Z)</option>
                      <option value="items">Product Count (High to Low)</option>
                      <option value="stock">Stock Units (High to Low)</option>
                    </select>
                  </div>
                </div>

                {/* Master Category Grid Table */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-neutral-300">
                      <thead className="bg-neutral-950 text-neutral-400 text-[11px] uppercase border-b border-neutral-800">
                        <tr>
                          <th className="py-3 px-4 text-center w-24">Order</th>
                          <th>Category Details</th>
                          <th>Slug (Storefront URL)</th>
                          <th>Hierarchy Level</th>
                          <th className="text-center">Products</th>
                          <th className="text-right">Total Stock</th>
                          <th className="text-center">SEO Ready</th>
                          <th className="text-center">Status</th>
                          <th className="text-right px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/80">
                        {filteredCategories.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-12 text-center text-neutral-500 text-xs">
                              No categories found matching your filters.
                            </td>
                          </tr>
                        ) : (
                          filteredCategories.map((c, index) => {
                            const isSub = Boolean(c.parentId);
                            const hasSeo = Boolean(c.metaTitle && c.metaTitle.length > 5);

                            return (
                              <tr key={c.id} className="hover:bg-neutral-800/30 transition-colors">
                                <td className="py-3 px-4 text-center">
                                  <div className="flex items-center justify-center space-x-1">
                                    <span className="font-mono text-xs font-bold text-neutral-400 w-6 text-center">
                                      {c.sortOrder ?? index + 1}
                                    </span>
                                    <div className="flex flex-col">
                                      <button
                                        onClick={() => handleMoveCategory(c.id, 'up')}
                                        disabled={index === 0}
                                        title="Move Up"
                                        className="text-neutral-500 hover:text-amber-400 disabled:opacity-20 cursor-pointer p-0.5"
                                      >
                                        <ChevronUp className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleMoveCategory(c.id, 'down')}
                                        disabled={index === filteredCategories.length - 1}
                                        title="Move Down"
                                        className="text-neutral-500 hover:text-amber-400 disabled:opacity-20 cursor-pointer p-0.5"
                                      >
                                        <ChevronDown className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3 px-2">
                                  <div className="flex items-center space-x-3">
                                    {c.image ? (
                                      <img
                                        src={c.image}
                                        alt={c.name}
                                        className="w-10 h-10 rounded-lg object-cover bg-neutral-950 border border-neutral-800 flex-shrink-0"
                                        onError={(e) => {
                                          (e.currentTarget as HTMLElement).style.display = 'none';
                                        }}
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-amber-500/80 flex-shrink-0">
                                        <FolderTree className="w-5 h-5" />
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <div className="flex items-center space-x-1.5">
                                        <span className="font-semibold text-neutral-100">{c.name}</span>
                                        <a
                                          href={`/#/shop/${c.slug}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          title="View on storefront"
                                          className="text-neutral-500 hover:text-amber-400"
                                        >
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      </div>
                                      {isSub ? (
                                        <p className="text-[10px] text-blue-400 flex items-center gap-1 mt-0.5">
                                          <span>↳ Subcategory of:</span>
                                          <strong className="text-neutral-300">{c.parentName || c.parentId}</strong>
                                        </p>
                                      ) : (
                                        <p className="text-[10px] text-neutral-500 truncate max-w-[220px]">
                                          {c.description || 'Primary catalog collection'}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                <td>
                                  <span className="font-mono text-xs text-amber-400 block">/shop/{c.slug}</span>
                                </td>

                                <td>
                                  {isSub ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950/70 text-blue-400 border border-blue-800/80">
                                      <Layers className="w-3 h-3" />
                                      <span>Subcategory</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                      <FolderTree className="w-3 h-3" />
                                      <span>Main Department</span>
                                    </span>
                                  )}
                                </td>

                                <td className="text-center">
                                  <button
                                    onClick={() => handleOpenCategoryProductsPreview(c)}
                                    title="Click to view assigned products"
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 transition cursor-pointer"
                                  >
                                    <Package className="w-3 h-3 text-amber-500" />
                                    <span>{c.itemCount || 0} garments</span>
                                  </button>
                                </td>

                                <td className="text-right font-mono font-medium text-neutral-300">
                                  {(c.totalStockUnits || 0).toLocaleString()} pcs
                                </td>

                                <td className="text-center">
                                  {hasSeo ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400" title={`Title: ${c.metaTitle}`}>
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Configured</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-neutral-500" title="Using default meta tags">
                                      <span>Default</span>
                                    </span>
                                  )}
                                </td>

                                <td className="text-center">
                                  <button
                                    onClick={() => handleToggleCategoryStatus(c)}
                                    title="Click to toggle status"
                                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold border transition cursor-pointer ${
                                      c.status === 'active'
                                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800 hover:bg-emerald-900'
                                        : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700'
                                    }`}
                                  >
                                    {c.status === 'active' ? 'Active' : 'Inactive'}
                                  </button>
                                </td>

                                <td className="text-right px-4">
                                  <div className="flex items-center justify-end space-x-1.5">
                                    <button
                                      onClick={() => handleOpenCategoryProductsPreview(c)}
                                      className="p-1.5 text-neutral-400 hover:text-amber-400 bg-neutral-800 hover:bg-neutral-700 rounded transition cursor-pointer"
                                      title="Preview Category Products"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleOpenEditCategory(c)}
                                      className="p-1.5 text-neutral-400 hover:text-amber-400 bg-neutral-800 hover:bg-neutral-700 rounded transition cursor-pointer"
                                      title="Edit Category"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={async () => {
                                        const count = c.itemCount || 0;
                                        const promptMsg = count > 0
                                          ? `Warning: ${count} active products belong to category "${c.name}". Are you sure you want to delete it?`
                                          : `Delete category "${c.name}"?`;
                                        if (!confirm(promptMsg)) return;
                                        await api.deleteCategory(c.id);
                                        showToast(`Category "${c.name}" deleted`);
                                        loadDataForTab('Categories');
                                      }}
                                      className="p-1.5 text-neutral-500 hover:text-red-400 bg-neutral-800 hover:bg-neutral-700 rounded transition cursor-pointer"
                                      title="Delete Category"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 4. BRANDS - FULL LUXURY BRAND PORTFOLIO & TAXONOMY SUITE */}
          {activeTab === 'Brands' && (() => {
            const totalBrands = brands.length;
            const activeBrandsCount = brands.filter((b) => b.status === 'active' || !b.status).length;
            const featuredBrandsCount = brands.filter((b) => Boolean(b.featured)).length;
            const totalCatalogItems = brands.reduce((sum, b) => sum + (b.itemCount || 0), 0);
            const totalStockAcrossBrands = brands.reduce((sum, b) => sum + (b.totalStockUnits || 0), 0);

            // Filter logic
            const filteredBrands = brands
              .filter((b) => {
                if (brandFilterStatus === 'active') return b.status === 'active' || !b.status;
                if (brandFilterStatus === 'inactive') return b.status === 'inactive';
                return true;
              })
              .filter((b) => {
                if (brandFilterFeatured === 'featured') return Boolean(b.featured);
                if (brandFilterFeatured === 'standard') return !b.featured;
                return true;
              })
              .filter((b) => {
                if (!brandSearchQuery.trim()) return true;
                const q = brandSearchQuery.toLowerCase();
                return (
                  b.name.toLowerCase().includes(q) ||
                  b.slug.toLowerCase().includes(q) ||
                  (b.description || '').toLowerCase().includes(q) ||
                  (b.website || '').toLowerCase().includes(q)
                );
              })
              .sort((a, b) => {
                if (brandSortBy === 'name') return a.name.localeCompare(b.name);
                if (brandSortBy === 'products') return (b.itemCount || 0) - (a.itemCount || 0);
                if (brandSortBy === 'stock') return (b.totalStockUnits || 0) - (a.totalStockUnits || 0);
                return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
              });

            return (
              <div className="space-y-6">
                {/* Header & Primary Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                        <Tag className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-serif font-bold text-neutral-100">
                        Brand Portfolio &amp; House Labels
                      </h2>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      Manage luxury partner houses, private labels, logos, and SEO positioning across your storefront.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* View Mode Toggle */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-1 flex items-center">
                      <button
                        onClick={() => setBrandViewMode('table')}
                        className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                          brandViewMode === 'table'
                            ? 'bg-amber-500 text-neutral-950 shadow'
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Table View</span>
                      </button>
                      <button
                        onClick={() => setBrandViewMode('cards')}
                        className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                          brandViewMode === 'cards'
                            ? 'bg-amber-500 text-neutral-950 shadow'
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <Boxes className="w-3.5 h-3.5" />
                        <span>Cards View</span>
                      </button>
                    </div>

                    <button
                      onClick={handleOpenCreateBrand}
                      className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded-lg text-sm transition shadow-lg shadow-amber-500/10 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Brand</span>
                    </button>
                  </div>
                </div>

                {/* 4 KPI Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">Total Brands</span>
                      <Award className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="mt-2 flex items-baseline space-x-2">
                      <span className="text-2xl font-serif font-bold text-neutral-100">{totalBrands}</span>
                      <span className="text-xs text-neutral-400">partner &amp; house</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-2 pt-2 border-t border-neutral-800/80">
                      Curated labels in atelier catalog
                    </p>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">Active in Storefront</span>
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="mt-2 flex items-baseline space-x-2">
                      <span className="text-2xl font-serif font-bold text-emerald-400">{activeBrandsCount}</span>
                      <span className="text-xs text-neutral-400">
                        ({totalBrands > 0 ? Math.round((activeBrandsCount / totalBrands) * 100) : 0}% live)
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-2 pt-2 border-t border-neutral-800/80">
                      Discoverable on brand filters &amp; pages
                    </p>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">Featured Partners</span>
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    </div>
                    <div className="mt-2 flex items-baseline space-x-2">
                      <span className="text-2xl font-serif font-bold text-amber-400">{featuredBrandsCount}</span>
                      <span className="text-xs text-neutral-400">spotlighted</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-2 pt-2 border-t border-neutral-800/80">
                      Highlighted on homepage &amp; brand showcases
                    </p>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">Catalog Coverage</span>
                      <Package className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="mt-2 flex items-baseline space-x-2">
                      <span className="text-2xl font-serif font-bold text-blue-400">{totalCatalogItems}</span>
                      <span className="text-xs text-neutral-400">garments</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-2 pt-2 border-t border-neutral-800/80">
                      {totalStockAcrossBrands.toLocaleString()} stock units in circulation
                    </p>
                  </div>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                      <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={brandSearchQuery}
                        onChange={(e) => setBrandSearchQuery(e.target.value)}
                        placeholder="Search brand name, slug, or story..."
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <select
                      value={brandFilterStatus}
                      onChange={(e) => setBrandFilterStatus(e.target.value as any)}
                      className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-amber-500"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active Only</option>
                      <option value="inactive">Inactive Only</option>
                    </select>

                    <select
                      value={brandFilterFeatured}
                      onChange={(e) => setBrandFilterFeatured(e.target.value as any)}
                      className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-amber-500"
                    >
                      <option value="all">All Brands (Featured &amp; Standard)</option>
                      <option value="featured">Featured Brands Only ★</option>
                      <option value="standard">Standard Brands Only</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-neutral-500">Sort by:</span>
                    <select
                      value={brandSortBy}
                      onChange={(e) => setBrandSortBy(e.target.value as any)}
                      className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-amber-500"
                    >
                      <option value="order">Display Order (1 &rarr; N)</option>
                      <option value="name">Brand Name (A-Z)</option>
                      <option value="products">Garments Count (High to Low)</option>
                      <option value="stock">Stock Units (High to Low)</option>
                    </select>
                  </div>
                </div>

                {/* Master Table View */}
                {brandViewMode === 'table' ? (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-neutral-300">
                        <thead className="bg-neutral-950 text-neutral-400 text-[11px] uppercase border-b border-neutral-800">
                          <tr>
                            <th className="py-3 px-4 text-center w-24">Order</th>
                            <th>Brand Identity</th>
                            <th>Slug (Storefront URL)</th>
                            <th>Official Website</th>
                            <th className="text-center">Garments</th>
                            <th className="text-right">Total Stock</th>
                            <th className="text-center">Featured</th>
                            <th className="text-center">SEO Ready</th>
                            <th className="text-center">Status</th>
                            <th className="text-right px-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/80">
                          {filteredBrands.length === 0 ? (
                            <tr>
                              <td colSpan={10} className="py-12 text-center text-neutral-500 text-xs">
                                No brands found matching your filters.
                              </td>
                            </tr>
                          ) : (
                            filteredBrands.map((b, index) => {
                              const hasSeo = Boolean(b.metaTitle && b.metaTitle.length > 5);

                              return (
                                <tr key={b.id} className="hover:bg-neutral-800/30 transition-colors">
                                  <td className="py-3 px-4 text-center">
                                    <div className="flex items-center justify-center space-x-1">
                                      <span className="font-mono text-xs font-bold text-neutral-400 w-6 text-center">
                                        {b.sortOrder ?? index + 1}
                                      </span>
                                      <div className="flex flex-col">
                                        <button
                                          onClick={() => handleMoveBrand(b.id, 'up')}
                                          disabled={index === 0}
                                          title="Move Up"
                                          className="text-neutral-500 hover:text-amber-400 disabled:opacity-20 cursor-pointer p-0.5"
                                        >
                                          <ChevronUp className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleMoveBrand(b.id, 'down')}
                                          disabled={index === filteredBrands.length - 1}
                                          title="Move Down"
                                          className="text-neutral-500 hover:text-amber-400 disabled:opacity-20 cursor-pointer p-0.5"
                                        >
                                          <ChevronDown className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="py-3">
                                    <div className="flex items-center space-x-3">
                                      {b.logo ? (
                                        <img
                                          src={b.logo}
                                          alt={b.name}
                                          className="w-9 h-9 rounded-lg object-contain bg-neutral-950 p-1 border border-neutral-800 flex-shrink-0"
                                        />
                                      ) : (
                                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400 font-bold font-serif text-sm flex-shrink-0">
                                          {b.name.charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                      <div>
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-semibold text-neutral-100 text-sm">
                                            {b.name}
                                          </span>
                                          {b.featured && (
                                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                              <Star className="w-2.5 h-2.5 fill-amber-400" />
                                              <span>Featured</span>
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-[11px] text-neutral-400 line-clamp-1 max-w-xs mt-0.5">
                                          {b.description || 'Luxury fashion partner house'}
                                        </p>
                                      </div>
                                    </div>
                                  </td>

                                  <td>
                                    <span className="font-mono text-[11px] text-amber-400 bg-neutral-950 px-2 py-1 rounded border border-neutral-800">
                                      /brand/{b.slug}
                                    </span>
                                  </td>

                                  <td>
                                    {b.website ? (
                                      <a
                                        href={b.website.startsWith('http') ? b.website : `https://${b.website}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-amber-400 transition"
                                      >
                                        <Globe className="w-3 h-3 text-neutral-500" />
                                        <span className="truncate max-w-[140px]">{b.website.replace(/^https?:\/\//, '')}</span>
                                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                      </a>
                                    ) : (
                                      <span className="text-[11px] text-neutral-600 italic">None</span>
                                    )}
                                  </td>

                                  <td className="text-center">
                                    <button
                                      onClick={() => handleOpenBrandPreview(b)}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-neutral-950 border border-neutral-800 text-neutral-300 hover:border-amber-500/50 hover:text-amber-400 transition cursor-pointer"
                                      title="Click to view assigned garments"
                                    >
                                      <Package className="w-3 h-3 text-neutral-500" />
                                      <span>{b.itemCount || 0} items</span>
                                    </button>
                                  </td>

                                  <td className="text-right font-mono font-medium text-neutral-300">
                                    {(b.totalStockUnits || 0).toLocaleString()} pcs
                                  </td>

                                  <td className="text-center">
                                    <button
                                      onClick={() => handleToggleBrandFeatured(b)}
                                      title={b.featured ? 'Unfeature brand' : 'Mark as Featured'}
                                      className="p-1 rounded hover:bg-neutral-800 transition cursor-pointer"
                                    >
                                      <Star
                                        className={`w-4 h-4 transition ${
                                          b.featured ? 'text-amber-400 fill-amber-400' : 'text-neutral-600 hover:text-neutral-400'
                                        }`}
                                      />
                                    </button>
                                  </td>

                                  <td className="text-center">
                                    {hasSeo ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400" title={`Title: ${b.metaTitle}`}>
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>Configured</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-neutral-500" title="Using default meta tags">
                                        <span>Default</span>
                                      </span>
                                    )}
                                  </td>

                                  <td className="text-center">
                                    <button
                                      onClick={() => handleToggleBrandStatus(b)}
                                      title="Click to toggle status"
                                      className={`px-2.5 py-0.5 rounded text-[11px] font-bold border transition cursor-pointer ${
                                        b.status === 'active' || !b.status
                                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800 hover:bg-emerald-900'
                                          : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700'
                                      }`}
                                    >
                                      {b.status === 'active' || !b.status ? 'Active' : 'Inactive'}
                                    </button>
                                  </td>

                                  <td className="text-right px-4">
                                    <div className="flex items-center justify-end space-x-1.5">
                                      <button
                                        onClick={() => handleOpenBrandPreview(b)}
                                        className="p-1.5 text-neutral-400 hover:text-amber-400 bg-neutral-800 hover:bg-neutral-700 rounded transition cursor-pointer"
                                        title="Preview Garments"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleOpenEditBrand(b)}
                                        className="p-1.5 text-neutral-400 hover:text-amber-400 bg-neutral-800 hover:bg-neutral-700 rounded transition cursor-pointer"
                                        title="Edit Brand"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={async () => {
                                          const count = b.itemCount || 0;
                                          const promptMsg = count > 0
                                            ? `Warning: ${count} garments are mapped to "${b.name}". Are you sure you want to delete this brand?`
                                            : `Delete brand "${b.name}"?`;
                                          if (!confirm(promptMsg)) return;
                                          await api.deleteBrand(b.id);
                                          showToast(`Brand "${b.name}" deleted`);
                                          loadDataForTab('Brands');
                                        }}
                                        className="p-1.5 text-neutral-500 hover:text-red-400 bg-neutral-800 hover:bg-neutral-700 rounded transition cursor-pointer"
                                        title="Delete Brand"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* Luxury Cards View */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredBrands.length === 0 ? (
                      <div className="col-span-full py-12 text-center text-neutral-500 text-xs bg-neutral-900 border border-neutral-800 rounded-xl">
                        No brands found matching your search.
                      </div>
                    ) : (
                      filteredBrands.map((b) => (
                        <div
                          key={b.id}
                          className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl overflow-hidden shadow-lg transition flex flex-col justify-between"
                        >
                          <div>
                            {/* Card Banner / Cover */}
                            <div className="h-28 w-full bg-neutral-950 relative overflow-hidden">
                              {b.banner ? (
                                <img src={b.banner} alt={b.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 flex items-center justify-center">
                                  <Tag className="w-8 h-8 text-neutral-800" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-black/30" />
                              
                              <div className="absolute top-2 right-2 flex items-center space-x-1.5">
                                <button
                                  onClick={() => handleToggleBrandFeatured(b)}
                                  className="p-1.5 rounded-lg bg-neutral-950/70 backdrop-blur-sm border border-neutral-800 hover:bg-neutral-900 transition cursor-pointer"
                                  title={b.featured ? 'Unfeature brand' : 'Mark as Featured'}
                                >
                                  <Star className={`w-3.5 h-3.5 ${b.featured ? 'text-amber-400 fill-amber-400' : 'text-neutral-400'}`} />
                                </button>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold backdrop-blur-sm border ${
                                  b.status === 'active' || !b.status
                                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                                    : 'bg-neutral-950/80 text-neutral-400 border-neutral-800'
                                }`}>
                                  {b.status === 'active' || !b.status ? 'Active' : 'Inactive'}
                                </span>
                              </div>

                              {/* Floating Logo */}
                              <div className="absolute -bottom-4 left-4">
                                {b.logo ? (
                                  <img
                                    src={b.logo}
                                    alt={b.name}
                                    className="w-12 h-12 rounded-xl object-contain bg-neutral-900 border-2 border-neutral-800 shadow-md p-1"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-neutral-900 border-2 border-neutral-800 shadow-md flex items-center justify-center text-amber-400 font-bold font-serif text-lg">
                                    {b.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Card Body */}
                            <div className="pt-6 px-4 pb-4">
                              <div className="flex items-center justify-between">
                                <h3 className="font-serif font-bold text-base text-neutral-100 hover:text-amber-400 transition">
                                  {b.name}
                                </h3>
                                <span className="font-mono text-[10px] text-amber-400/80 bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-800">
                                  #{b.sortOrder ?? 1}
                                </span>
                              </div>

                              <p className="text-xs text-neutral-400 mt-1 line-clamp-2 min-h-[32px]">
                                {b.description || 'Exclusive menswear and accessories house partner.'}
                              </p>

                              <div className="mt-3 flex items-center justify-between text-[11px] pt-3 border-t border-neutral-800/80">
                                <div className="flex items-center gap-1.5 text-neutral-400">
                                  <Package className="w-3.5 h-3.5 text-amber-400" />
                                  <span>{b.itemCount || 0} garments</span>
                                  <span>&bull;</span>
                                  <span className="text-emerald-400 font-mono">{(b.totalStockUnits || 0).toLocaleString()} pcs</span>
                                </div>
                                {b.website && (
                                  <a
                                    href={b.website.startsWith('http') ? b.website : `https://${b.website}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-neutral-500 hover:text-amber-400 flex items-center gap-0.5"
                                  >
                                    <Globe className="w-3 h-3" />
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Card Footer Actions */}
                          <div className="bg-neutral-950/60 px-4 py-2.5 border-t border-neutral-800 flex items-center justify-between">
                            <button
                              onClick={() => handleOpenBrandPreview(b)}
                              className="text-xs text-neutral-400 hover:text-amber-400 flex items-center space-x-1 transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Garments</span>
                            </button>

                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleOpenEditBrand(b)}
                                className="p-1.5 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 rounded transition cursor-pointer"
                                title="Edit Brand"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={async () => {
                                  const count = b.itemCount || 0;
                                  const promptMsg = count > 0
                                    ? `Warning: ${count} garments are mapped to "${b.name}". Are you sure you want to delete this brand?`
                                    : `Delete brand "${b.name}"?`;
                                  if (!confirm(promptMsg)) return;
                                  await api.deleteBrand(b.id);
                                  showToast(`Brand "${b.name}" deleted`);
                                  loadDataForTab('Brands');
                                }}
                                className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded transition cursor-pointer"
                                title="Delete Brand"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* 5. FULL-CONTROL MULTI-WAREHOUSE INVENTORY SYSTEM */}
          {activeTab === 'Inventory' && (() => {
            const totalUnits = inventory.reduce((s, i) => s + (i.quantity || 0), 0);
            const totalAvailable = inventory.reduce((s, i) => s + (i.availableQuantity || 0), 0);
            const totalReserved = inventory.reduce((s, i) => s + (i.reservedQuantity || 0), 0);
            const lowStockItems = inventory.filter((i) => i.availableQuantity <= i.minimumStock && i.availableQuantity > 0);
            const outOfStockItems = inventory.filter((i) => i.availableQuantity <= 0);
            const totalValuation = stockValuation?.totalValue ?? inventory.reduce((s, i) => s + (i.availableQuantity * (i.price || 0)), 0);
            const totalCost = stockValuation?.totalCost ?? inventory.reduce((s, i) => s + (i.availableQuantity * (i.costPrice || (i.price ? Math.round(i.price * 0.5) : 0))), 0);
            const potentialProfit = stockValuation?.potentialProfit ?? (totalValuation - totalCost);
            const marginPct = totalValuation > 0 ? Math.round((potentialProfit / totalValuation) * 100) : 0;

            const displayedItems = inventory.filter((item) => {
              if (invSubTab === 'low_stock') {
                if (!(item.availableQuantity <= item.minimumStock && item.availableQuantity > 0)) return false;
              }
              if (invSubTab === 'out_of_stock') {
                if (!(item.availableQuantity <= 0)) return false;
              }
              if (invWarehouseFilter !== 'all' && item.warehouseId !== invWarehouseFilter) {
                return false;
              }
              if (invStatusFilter !== 'all') {
                if (invStatusFilter === 'in_stock' && item.availableQuantity <= item.minimumStock) return false;
                if (invStatusFilter === 'low_stock' && !(item.availableQuantity <= item.minimumStock && item.availableQuantity > 0)) return false;
                if (invStatusFilter === 'out_of_stock' && item.availableQuantity > 0) return false;
              }
              if (invSearchQuery.trim()) {
                const q = invSearchQuery.toLowerCase();
                const matchName = item.productName?.toLowerCase().includes(q);
                const matchSku = item.sku?.toLowerCase().includes(q);
                const matchWh = item.warehouseName?.toLowerCase().includes(q);
                const matchCat = item.categoryName?.toLowerCase().includes(q);
                if (!matchName && !matchSku && !matchWh && !matchCat) return false;
              }
              return true;
            });

            if (invSortBy === 'stock_asc') {
              displayedItems.sort((a, b) => a.availableQuantity - b.availableQuantity);
            } else if (invSortBy === 'stock_desc') {
              displayedItems.sort((a, b) => b.availableQuantity - a.availableQuantity);
            } else if (invSortBy === 'valuation_desc') {
              displayedItems.sort((a, b) => (b.availableQuantity * (b.price || 0)) - (a.availableQuantity * (a.price || 0)));
            } else {
              displayedItems.sort((a, b) => a.productName.localeCompare(b.productName));
            }

            const filteredTxns = inventoryTransactions.filter((t) => {
              if (txnTypeFilter !== 'all' && t.type !== txnTypeFilter) return false;
              return true;
            });

            return (
              <div className="space-y-6 max-w-7xl">
                {/* Header Title & Global Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Boxes className="w-5 h-5 text-amber-500" />
                      <h3 className="text-xl font-serif font-bold text-neutral-100">
                        Multi-Warehouse Inventory Control
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        LIVE CONTROL
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      Full control over stock allocations, inbound shipments, write-offs, warehouse transfers, reorder thresholds, and audit trails.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleOpenStockIn()}
                      className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Stock In (+)</span>
                    </button>
                    <button
                      onClick={() => handleOpenStockOut()}
                      className="flex items-center space-x-1.5 px-3 py-2 bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 rounded-lg text-xs font-semibold transition cursor-pointer active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      <span>Stock Out (-)</span>
                    </button>
                    <button
                      onClick={() => handleOpenTransfer()}
                      className="flex items-center space-x-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold transition cursor-pointer active:scale-95"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
                      <span>Transfer Stock</span>
                    </button>
                    <button
                      onClick={handleDownloadInventoryCsv}
                      className="flex items-center space-x-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 rounded-lg text-xs font-medium transition cursor-pointer active:scale-95"
                      title="Download Full Inventory CSV"
                    >
                      <Download className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Export CSV</span>
                    </button>
                    <button
                      onClick={() => handleRefresh('Inventory')}
                      disabled={loading || isRefreshing}
                      className="flex items-center space-x-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-300 rounded-lg text-xs font-medium transition cursor-pointer active:scale-95"
                      title="Refresh inventory"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || loading ? 'animate-spin text-amber-400' : ''}`} />
                      <span>{isRefreshing || loading ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                  </div>
                </div>

                {/* 4 Primary Metric KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">Total Inventory</span>
                      <Boxes className="w-4 h-4 text-neutral-500" />
                    </div>
                    <div className="mt-2 flex items-baseline space-x-2">
                      <span className="text-2xl font-serif font-bold text-neutral-100">{totalUnits.toLocaleString()}</span>
                      <span className="text-xs text-neutral-400">units</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-neutral-800/80">
                      <span>Available: <strong className="text-emerald-400">{totalAvailable.toLocaleString()}</strong></span>
                      <span>Reserved: <strong className="text-amber-400">{totalReserved.toLocaleString()}</strong></span>
                    </div>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">Stock Valuation</span>
                      <TrendingUp className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="mt-2 flex items-baseline space-x-2">
                      <span className="text-2xl font-serif font-bold text-amber-400">৳{totalValuation.toLocaleString()}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-neutral-800/80">
                      <span>Cost: <strong>৳{totalCost.toLocaleString()}</strong></span>
                      <span className="text-emerald-400 font-semibold">+{marginPct}% margin</span>
                    </div>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">Low Stock Warnings</span>
                      <AlertTriangle className={`w-4 h-4 ${lowStockItems.length > 0 ? 'text-amber-400 animate-pulse' : 'text-neutral-500'}`} />
                    </div>
                    <div className="mt-2 flex items-baseline space-x-2">
                      <span className={`text-2xl font-serif font-bold ${lowStockItems.length > 0 ? 'text-amber-400' : 'text-neutral-300'}`}>
                        {lowStockItems.length}
                      </span>
                      <span className="text-xs text-neutral-400">items below reorder point</span>
                    </div>
                    <div className="mt-2 text-[11px] text-neutral-400 pt-2 border-t border-neutral-800/80">
                      {lowStockItems.length > 0 ? (
                        <button
                          onClick={() => setInvSubTab('low_stock')}
                          className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          View {lowStockItems.length} low-stock garments &rarr;
                        </button>
                      ) : (
                        <span className="text-emerald-400">All products have healthy buffers</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">Out of Stock Alerts</span>
                      <AlertCircle className={`w-4 h-4 ${outOfStockItems.length > 0 ? 'text-red-400 animate-pulse' : 'text-neutral-500'}`} />
                    </div>
                    <div className="mt-2 flex items-baseline space-x-2">
                      <span className={`text-2xl font-serif font-bold ${outOfStockItems.length > 0 ? 'text-red-400' : 'text-neutral-300'}`}>
                        {outOfStockItems.length}
                      </span>
                      <span className="text-xs text-neutral-400">depleted items</span>
                    </div>
                    <div className="mt-2 text-[11px] text-neutral-400 pt-2 border-t border-neutral-800/80">
                      {outOfStockItems.length > 0 ? (
                        <button
                          onClick={() => setInvSubTab('out_of_stock')}
                          className="text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          Restock {outOfStockItems.length} depleted items &rarr;
                        </button>
                      ) : (
                        <span className="text-emerald-400">0 depleted garments in catalog</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sub-Navigation Tabs */}
                <div className="flex flex-wrap items-center border-b border-neutral-800 gap-1 sm:gap-2">
                  <button
                    onClick={() => setInvSubTab('all')}
                    className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition flex items-center gap-2 cursor-pointer ${
                      invSubTab === 'all'
                        ? 'bg-neutral-900 text-amber-400 border-t-2 border-amber-500'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
                    }`}
                  >
                    <Boxes className="w-3.5 h-3.5" />
                    <span>All Inventory</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-neutral-800 text-neutral-300">
                      {inventory.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setInvSubTab('low_stock')}
                    className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition flex items-center gap-2 cursor-pointer ${
                      invSubTab === 'low_stock'
                        ? 'bg-neutral-900 text-amber-400 border-t-2 border-amber-500'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Low Stock Warnings</span>
                    {lowStockItems.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-400 font-bold">
                        {lowStockItems.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setInvSubTab('out_of_stock')}
                    className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition flex items-center gap-2 cursor-pointer ${
                      invSubTab === 'out_of_stock'
                        ? 'bg-neutral-900 text-red-400 border-t-2 border-red-500'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                    <span>Out of Stock</span>
                    {outOfStockItems.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-red-950 text-red-400 font-bold border border-red-800">
                        {outOfStockItems.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setInvSubTab('audit_log')}
                    className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition flex items-center gap-2 cursor-pointer ${
                      invSubTab === 'audit_log'
                        ? 'bg-neutral-900 text-amber-400 border-t-2 border-amber-500'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Audit Trail & Movements</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-neutral-800 text-neutral-300">
                      {inventoryTransactions.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setInvSubTab('valuation')}
                    className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition flex items-center gap-2 cursor-pointer ${
                      invSubTab === 'valuation'
                        ? 'bg-neutral-900 text-amber-400 border-t-2 border-amber-500'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Valuation & Financials</span>
                  </button>
                </div>

                {/* SubTab 1, 2, 3: Inventory Table Views */}
                {(invSubTab === 'all' || invSubTab === 'low_stock' || invSubTab === 'out_of_stock') && (
                  <div className="space-y-4">
                    {/* Filters Toolbar */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                        {/* Search Input */}
                        <div className="relative flex-1 min-w-[200px] max-w-md">
                          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            value={invSearchQuery}
                            onChange={(e) => setInvSearchQuery(e.target.value)}
                            placeholder="Search by product name, SKU, or category..."
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        {/* Warehouse Filter */}
                        <select
                          value={invWarehouseFilter}
                          onChange={(e) => setInvWarehouseFilter(e.target.value)}
                          className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-amber-500"
                        >
                          <option value="all">All Warehouses ({warehouses.length})</option>
                          {warehouses.map((wh) => (
                            <option key={wh.id} value={wh.id}>
                              {wh.name}
                            </option>
                          ))}
                        </select>

                        {/* Status Filter */}
                        <select
                          value={invStatusFilter}
                          onChange={(e) => setInvStatusFilter(e.target.value)}
                          className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-amber-500"
                        >
                          <option value="all">All Stock Statuses</option>
                          <option value="in_stock">In Stock / Optimal</option>
                          <option value="low_stock">Low Stock Warning</option>
                          <option value="out_of_stock">Out of Stock</option>
                        </select>
                      </div>

                      {/* Sort Selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-neutral-500">Sort by:</span>
                        <select
                          value={invSortBy}
                          onChange={(e) => setInvSortBy(e.target.value as any)}
                          className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-amber-500"
                        >
                          <option value="name">Product Name (A-Z)</option>
                          <option value="stock_asc">Available Stock (Low to High)</option>
                          <option value="stock_desc">Available Stock (High to Low)</option>
                          <option value="valuation_desc">Total Valuation (High to Low)</option>
                        </select>
                      </div>
                    </div>

                    {/* Master Inventory Grid Table */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-neutral-300">
                          <thead className="bg-neutral-950 text-neutral-400 text-[11px] uppercase border-b border-neutral-800">
                            <tr>
                              <th className="py-3 px-4">Garment / Product</th>
                              <th>SKU & Category</th>
                              <th>Warehouse</th>
                              <th className="text-right">Total Units</th>
                              <th className="text-right">Reserved</th>
                              <th className="text-right">Available</th>
                              <th className="text-center">Min Alert</th>
                              <th className="text-right">Unit Price</th>
                              <th className="text-right">Valuation</th>
                              <th className="text-center">Stock Health</th>
                              <th className="text-right px-4">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-800/80">
                            {displayedItems.length === 0 ? (
                              <tr>
                                <td colSpan={11} className="py-12 text-center text-neutral-500 text-xs">
                                  No inventory records found matching your active filter criteria.
                                </td>
                              </tr>
                            ) : (
                              displayedItems.map((inv) => {
                                const isOut = inv.availableQuantity <= 0;
                                const isLow = !isOut && inv.availableQuantity <= inv.minimumStock;
                                const val = inv.availableQuantity * (inv.price || 0);

                                return (
                                  <tr key={inv.id} className="hover:bg-neutral-800/30 transition-colors">
                                    <td className="py-3 px-4">
                                      <div className="flex items-center space-x-3">
                                        {inv.productImage ? (
                                          <img
                                            src={inv.productImage}
                                            alt={inv.productName}
                                            className="w-10 h-10 rounded-lg object-cover bg-neutral-950 border border-neutral-800 flex-shrink-0"
                                            onError={(e) => {
                                              (e.currentTarget as HTMLElement).style.display = 'none';
                                            }}
                                          />
                                        ) : (
                                          <div className="w-10 h-10 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-600 flex-shrink-0">
                                            <Package className="w-5 h-5" />
                                          </div>
                                        )}
                                        <div className="min-w-0">
                                          <p className="font-semibold text-neutral-100 truncate max-w-[200px]" title={inv.productName}>
                                            {inv.productName}
                                          </p>
                                          <p className="text-[10px] text-neutral-500 truncate">
                                            ID: {inv.productId}
                                          </p>
                                        </div>
                                      </div>
                                    </td>
                                    <td>
                                      <span className="font-mono text-xs text-amber-400 block">{inv.sku}</span>
                                      <span className="text-[10px] text-neutral-500">{inv.categoryName || 'General'}</span>
                                    </td>
                                    <td>
                                      <span className="inline-flex items-center gap-1 text-[11px] text-neutral-300">
                                        <Building2 className="w-3 h-3 text-neutral-500" />
                                        <span>{inv.warehouseName || inv.warehouseId}</span>
                                      </span>
                                    </td>
                                    <td className="text-right font-mono font-medium text-neutral-200">
                                      {inv.quantity} pcs
                                    </td>
                                    <td className="text-right font-mono text-neutral-500">
                                      {inv.reservedQuantity} pcs
                                    </td>
                                    <td className="text-right font-mono font-bold text-sm">
                                      <span className={isOut ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-emerald-400'}>
                                        {inv.availableQuantity} pcs
                                      </span>
                                    </td>
                                    <td className="text-center font-mono">
                                      <button
                                        onClick={() => handleOpenThreshold(inv)}
                                        title="Click to edit minimum alert threshold"
                                        className="text-[11px] text-neutral-400 hover:text-amber-400 underline decoration-dotted cursor-pointer"
                                      >
                                        &le; {inv.minimumStock}
                                      </button>
                                    </td>
                                    <td className="text-right font-mono text-neutral-300">
                                      ৳{(inv.price || 0).toLocaleString()}
                                    </td>
                                    <td className="text-right font-mono font-semibold text-amber-400">
                                      ৳{val.toLocaleString()}
                                    </td>
                                    <td className="text-center">
                                      {isOut ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-800">
                                          <AlertCircle className="w-3 h-3" />
                                          <span>Out of Stock</span>
                                        </span>
                                      ) : isLow ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                                          <AlertTriangle className="w-3 h-3" />
                                          <span>Low Stock</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                                          <CheckCircle className="w-3 h-3" />
                                          <span>Optimal</span>
                                        </span>
                                      )}
                                    </td>
                                    <td className="text-right px-4">
                                      <div className="flex items-center justify-end space-x-1.5">
                                        <button
                                          onClick={() => handleOpenStockIn(inv)}
                                          title="Stock In / Receive Shipment"
                                          className="p-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded transition cursor-pointer"
                                        >
                                          <Plus className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleOpenStockOut(inv)}
                                          title="Stock Out / Write-off"
                                          className="p-1.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 rounded transition cursor-pointer"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleOpenTransfer(inv)}
                                          title="Transfer between warehouses"
                                          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 rounded transition cursor-pointer"
                                        >
                                          <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
                                        </button>
                                        <button
                                          onClick={() => handleOpenEditInventory(inv)}
                                          title="Manual Adjust Count"
                                          className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/40 hover:bg-amber-500/20 text-amber-400 rounded text-[11px] font-semibold transition cursor-pointer"
                                        >
                                          Adjust
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* SubTab 4: Audit Trail / Transactions */}
                {invSubTab === 'audit_log' && (
                  <div className="space-y-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center space-x-2">
                        <History className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                          Complete Inventory Movement Audit Log
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-neutral-400">Movement Type:</span>
                        <select
                          value={txnTypeFilter}
                          onChange={(e) => setTxnTypeFilter(e.target.value)}
                          className="bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1 text-xs text-neutral-300 focus:outline-none focus:border-amber-500"
                        >
                          <option value="all">All Movements ({inventoryTransactions.length})</option>
                          <option value="stock_in">Stock In (Replenishment)</option>
                          <option value="stock_out">Stock Out (Deductions)</option>
                          <option value="transfer">Warehouse Transfers</option>
                          <option value="adjustment">Count Adjustments</option>
                          <option value="sale">Customer Sales / Fulfillment</option>
                          <option value="opening_stock">Opening Stock</option>
                          <option value="damage">Damage / Scrap</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-neutral-300">
                          <thead className="bg-neutral-950 text-neutral-400 text-[11px] uppercase border-b border-neutral-800">
                            <tr>
                              <th className="py-3 px-4">Date & Time</th>
                              <th>Product</th>
                              <th>Warehouse</th>
                              <th>Type</th>
                              <th className="text-right">Qty Change</th>
                              <th>Reference #</th>
                              <th>Audit Justification / Note</th>
                              <th>Logged By</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-800/80">
                            {filteredTxns.length === 0 ? (
                              <tr>
                                <td colSpan={8} className="py-12 text-center text-neutral-500 text-xs">
                                  No transaction records logged yet for this filter.
                                </td>
                              </tr>
                            ) : (
                              filteredTxns.map((t) => {
                                const isPos = t.quantity > 0;
                                const isTransfer = t.type === 'transfer';
                                return (
                                  <tr key={t.id} className="hover:bg-neutral-800/20">
                                    <td className="py-3 px-4 font-mono text-neutral-400 text-[11px]">
                                      {new Date(t.createdAt).toLocaleString('en-GB', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </td>
                                    <td>
                                      <p className="font-semibold text-neutral-200">{t.productName || t.productId}</p>
                                      {t.sku && <span className="font-mono text-[10px] text-amber-500">{t.sku}</span>}
                                    </td>
                                    <td className="text-neutral-400 text-xs">{t.warehouseName || t.warehouseId}</td>
                                    <td>
                                      <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                          t.type === 'stock_in' || t.type === 'purchase' || t.type === 'opening_stock'
                                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                            : t.type === 'stock_out' || t.type === 'damage'
                                            ? 'bg-red-950 text-red-400 border border-red-800'
                                            : t.type === 'transfer'
                                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                                        }`}
                                      >
                                        {t.type.replace('_', ' ')}
                                      </span>
                                    </td>
                                    <td className="text-right font-mono font-bold">
                                      <span className={isTransfer ? 'text-blue-400' : isPos ? 'text-emerald-400' : 'text-red-400'}>
                                        {isPos ? `+${t.quantity}` : t.quantity} pcs
                                      </span>
                                    </td>
                                    <td className="font-mono text-neutral-400 text-[11px]">{t.reference || '—'}</td>
                                    <td className="text-neutral-300 text-xs max-w-xs truncate" title={t.note || ''}>
                                      {t.note || 'Regular operation'}
                                    </td>
                                    <td className="text-neutral-500 text-[11px]">{t.createdBy}</td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* SubTab 5: Valuation & Financials */}
                {invSubTab === 'valuation' && (
                  <div className="space-y-6">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-800 pb-4 mb-4 gap-3">
                        <div>
                          <h4 className="font-serif text-lg font-bold text-neutral-100">
                            Asset Valuation & Retail Margin Report
                          </h4>
                          <p className="text-xs text-neutral-400 mt-1">
                            Monetary valuation of in-stock garments across wholesale cost and projected retail value
                          </p>
                        </div>
                        <button
                          onClick={handleDownloadInventoryCsv}
                          className="flex items-center space-x-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold rounded-lg text-xs transition cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Valuation CSV</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
                          <span className="text-xs uppercase text-neutral-400 font-semibold">Total Stock Units</span>
                          <p className="text-2xl font-serif font-bold text-neutral-100 mt-1">
                            {totalUnits.toLocaleString()} pcs
                          </p>
                        </div>
                        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
                          <span className="text-xs uppercase text-neutral-400 font-semibold">Total Inventory Cost (BDT)</span>
                          <p className="text-2xl font-serif font-bold text-neutral-300 mt-1">
                            ৳{totalCost.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
                          <span className="text-xs uppercase text-neutral-400 font-semibold">Projected Retail Revenue</span>
                          <p className="text-2xl font-serif font-bold text-amber-400 mt-1">
                            ৳{totalValuation.toLocaleString()}
                          </p>
                          <span className="text-[11px] text-emerald-400 font-semibold">
                            Potential Profit: ৳{potentialProfit.toLocaleString()} ({marginPct}%)
                          </span>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-neutral-300">
                          <thead className="bg-neutral-950 text-neutral-400 text-[11px] uppercase border-b border-neutral-800">
                            <tr>
                              <th className="py-2.5 px-3">Garment</th>
                              <th>SKU</th>
                              <th className="text-right">Units</th>
                              <th className="text-right">Cost (Unit)</th>
                              <th className="text-right">Retail (Unit)</th>
                              <th className="text-right">Total Cost</th>
                              <th className="text-right">Total Retail Value</th>
                              <th className="text-right px-3">Gross Margin</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-800/60">
                            {(stockValuation?.byProduct || []).map((item) => {
                              const profit = item.inventoryValue - item.costValue;
                              const margin = item.inventoryValue > 0 ? Math.round((profit / item.inventoryValue) * 100) : 0;
                              return (
                                <tr key={item.id} className="hover:bg-neutral-800/30">
                                  <td className="py-2.5 px-3 font-semibold text-neutral-200">{item.name}</td>
                                  <td className="font-mono text-amber-500 text-xs">{item.sku}</td>
                                  <td className="text-right font-mono">{item.units}</td>
                                  <td className="text-right font-mono text-neutral-400">৳{item.costPrice.toLocaleString()}</td>
                                  <td className="text-right font-mono text-neutral-200">৳{item.sellingPrice.toLocaleString()}</td>
                                  <td className="text-right font-mono text-neutral-400">৳{item.costValue.toLocaleString()}</td>
                                  <td className="text-right font-mono font-bold text-amber-400">৳{item.inventoryValue.toLocaleString()}</td>
                                  <td className="text-right px-3 font-mono font-semibold text-emerald-400">
                                    ৳{profit.toLocaleString()} ({margin}%)
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* 6. WAREHOUSES */}
          {activeTab === 'Warehouses' && (
            <div className="space-y-6 max-w-5xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Storage & Fulfilment Warehouses</h3>
                <button
                  onClick={handleOpenCreateWarehouse}
                  className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded-lg text-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Warehouse</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {warehouses.map((wh) => (
                  <div key={wh.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-serif font-bold text-base text-neutral-100">{wh.name}</h4>
                        <span className="font-mono text-xs bg-neutral-800 text-amber-400 px-2 py-0.5 rounded">
                          {wh.code}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mb-1">Address: {wh.address}</p>
                      <p className="text-xs text-neutral-400 mb-1">Manager: {wh.manager}</p>
                      <p className="text-xs text-neutral-400">Phone: {wh.phone}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-end space-x-2 pt-3 border-t border-neutral-800">
                      <button
                        onClick={() => handleOpenEditWarehouse(wh)}
                        className="p-1 text-neutral-400 hover:text-amber-400"
                        title="Edit Warehouse"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm(`Delete warehouse ${wh.name}?`)) return;
                          try {
                            await api.deleteWarehouse(wh.id);
                            showToast('Warehouse deleted');
                            loadDataForTab('Warehouses');
                          } catch (err: unknown) {
                            showToast(err instanceof Error ? err.message : 'Error deleting warehouse');
                          }
                        }}
                        className="p-1 text-neutral-400 hover:text-red-400"
                        title="Delete Warehouse"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. ORDERS */}
          {activeTab === 'Orders' && (() => {
            const query = orderSearchQuery.toLowerCase().trim();
            const filteredOrders = orders.filter((ord) => {
              const matchesSearch =
                !query ||
                ord.orderNumber.toLowerCase().includes(query) ||
                (ord.customer?.fullName && ord.customer.fullName.toLowerCase().includes(query)) ||
                (ord.customer?.phone && ord.customer.phone.includes(query)) ||
                (ord.customer?.email && ord.customer.email.toLowerCase().includes(query));
              const matchesStatus = orderFilterStatus === 'ALL' || ord.status === orderFilterStatus;
              return matchesSearch && matchesStatus;
            });

            const totalOrdersCount = orders.length;
            const pendingOrdersCount = orders.filter((o) => ['PENDING', 'CONFIRMED'].includes(o.status)).length;
            const inProgressCount = orders.filter((o) => ['PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(o.status)).length;
            const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;
            const cancelledCount = orders.filter((o) => ['CANCELLED', 'REFUNDED', 'RETURNED'].includes(o.status)).length;

            return (
              <div className="space-y-6 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-amber-500" />
                      <span>Customer Orders</span>
                    </h3>
                    <p className="text-xs text-neutral-400">Track, update statuses, print invoices, and manage customer orders</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRefresh('Orders')}
                      disabled={loading || isRefreshing}
                      className="flex items-center space-x-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-300 rounded-lg text-xs font-medium transition cursor-pointer active:scale-95"
                      title="Refresh orders"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || loading ? 'animate-spin text-amber-400' : ''}`} />
                      <span>{isRefreshing || loading ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                  </div>
                </div>

                {/* Stat Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div
                    onClick={() => setOrderFilterStatus('ALL')}
                    className={`bg-neutral-900 border rounded-xl p-3 cursor-pointer transition ${
                      orderFilterStatus === 'ALL' ? 'border-amber-500/50 bg-amber-500/5' : 'border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <p className="text-xs text-neutral-400">Total Orders</p>
                    <p className="text-lg font-bold text-neutral-100 mt-1">{totalOrdersCount}</p>
                  </div>
                  <div
                    onClick={() => setOrderFilterStatus('PENDING')}
                    className={`bg-neutral-900 border rounded-xl p-3 cursor-pointer transition ${
                      orderFilterStatus === 'PENDING' ? 'border-amber-500/50 bg-amber-500/5' : 'border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <p className="text-xs text-amber-400">Pending</p>
                    <p className="text-lg font-bold text-amber-400 mt-1">{pendingOrdersCount}</p>
                  </div>
                  <div
                    onClick={() => setOrderFilterStatus('PROCESSING')}
                    className={`bg-neutral-900 border rounded-xl p-3 cursor-pointer transition ${
                      orderFilterStatus === 'PROCESSING' ? 'border-sky-500/50 bg-sky-500/5' : 'border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <p className="text-xs text-sky-400">In Progress</p>
                    <p className="text-lg font-bold text-sky-400 mt-1">{inProgressCount}</p>
                  </div>
                  <div
                    onClick={() => setOrderFilterStatus('DELIVERED')}
                    className={`bg-neutral-900 border rounded-xl p-3 cursor-pointer transition ${
                      orderFilterStatus === 'DELIVERED' ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <p className="text-xs text-emerald-400">Delivered</p>
                    <p className="text-lg font-bold text-emerald-400 mt-1">{deliveredCount}</p>
                  </div>
                  <div
                    onClick={() => setOrderFilterStatus('CANCELLED')}
                    className={`bg-neutral-900 border rounded-xl p-3 cursor-pointer transition ${
                      orderFilterStatus === 'CANCELLED' ? 'border-red-500/50 bg-red-500/5' : 'border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <p className="text-xs text-red-400">Cancelled/Returned</p>
                    <p className="text-lg font-bold text-red-400 mt-1">{cancelledCount}</p>
                  </div>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by order ID, customer name, phone, or email..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition"
                    />
                    {orderSearchQuery && (
                      <button
                        onClick={() => setOrderSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5">
                      <Filter className="w-3.5 h-3.5 text-neutral-500" />
                      <select
                        value={orderFilterStatus}
                        onChange={(e) => setOrderFilterStatus(e.target.value)}
                        className="bg-transparent text-xs text-neutral-300 focus:outline-none cursor-pointer"
                      >
                        <option value="ALL">All Statuses ({totalOrdersCount})</option>
                        {ORDER_STATUSES.map((st) => (
                          <option key={st} value={st} className="bg-neutral-900">
                            {st} ({orders.filter((o) => o.status === st).length})
                          </option>
                        ))}
                      </select>
                    </div>
                    {(orderSearchQuery || orderFilterStatus !== 'ALL') && (
                      <button
                        onClick={() => {
                          setOrderSearchQuery('');
                          setOrderFilterStatus('ALL');
                        }}
                        className="text-xs text-neutral-400 hover:text-amber-400 px-2 py-1.5 transition cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Table */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-12 px-4 space-y-3">
                      <ShoppingBag className="w-10 h-10 text-neutral-600 mx-auto" />
                      <p className="text-sm font-semibold text-neutral-300">No orders found</p>
                      <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                        No customer orders matched your current search or status filter. Try clearing filters or refreshing.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-neutral-300">
                        <thead className="bg-neutral-950 text-neutral-400 text-xs uppercase border-b border-neutral-800">
                          <tr>
                            <th className="py-3 px-4">Order ID</th>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Payment</th>
                            <th>Status Selector</th>
                            <th className="text-right px-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                          {filteredOrders.map((ord) => (
                            <tr key={ord.id} className="hover:bg-neutral-800/40 transition">
                              <td className="py-3.5 px-4 font-mono text-amber-400 font-semibold">{ord.orderNumber}</td>
                              <td className="text-xs text-neutral-400 whitespace-nowrap">{ord.createdAt?.slice(0, 10)}</td>
                              <td>
                                <p className="font-semibold text-neutral-100">{ord.customer?.fullName || 'Guest'}</p>
                                <p className="text-xs text-neutral-500">{ord.customer?.phone || ord.customer?.email || 'N/A'}</p>
                              </td>
                              <td className="font-bold text-neutral-100 whitespace-nowrap">
                                ৳{ord.total?.toLocaleString()}
                                {ord.items && <span className="block text-[10px] text-neutral-500 font-normal">{ord.items.length} item(s)</span>}
                              </td>
                              <td>
                                <span className="text-xs uppercase text-neutral-300 font-medium block">{ord.paymentMethod}</span>
                                {ord.paymentStatus && (
                                  <span className={`text-[10px] uppercase font-bold ${
                                    ord.paymentStatus === 'PAID' ? 'text-emerald-400' : ord.paymentStatus === 'FAILED' ? 'text-red-400' : 'text-amber-400'
                                  }`}>
                                    {ord.paymentStatus}
                                  </span>
                                )}
                              </td>
                              <td>
                                <select
                                  value={ord.status}
                                  onChange={async (e) => {
                                    const newStatus = e.target.value as OrderStatus;
                                    try {
                                      await api.updateOrderStatus(ord.id, newStatus);
                                      showToast(`Order ${ord.orderNumber} updated to ${newStatus}`);
                                      loadDataForTab('Orders');
                                    } catch (err: unknown) {
                                      showToast(err instanceof Error ? err.message : 'Error updating order status');
                                    }
                                  }}
                                  className="bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                                >
                                  {ORDER_STATUSES.map((st) => (
                                    <option key={st} value={st} className="bg-neutral-900">
                                      {st}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="text-right px-4 space-x-1.5 whitespace-nowrap">
                                <button
                                  onClick={() => window.open(`/api/v1/orders/${ord.id}/invoice?format=html&print=true`, '_blank', 'width=880,height=1080')}
                                  title="Print / Download 1-Page PDF Invoice"
                                  className="text-xs text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 px-2 py-1 rounded border border-sky-500/20 font-medium inline-flex items-center gap-1 transition cursor-pointer"
                                >
                                  <Printer className="w-3 h-3" />
                                  <span>Invoice</span>
                                </button>
                                <button
                                  onClick={() => handleOpenEditOrder(ord)}
                                  className="text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 font-medium transition cursor-pointer"
                                >
                                  View & Edit
                                </button>
                                {ord.status !== 'CANCELLED' && ord.status !== 'REFUNDED' && ord.status !== 'RETURNED' && (
                                  <button
                                    onClick={async () => {
                                      if (!confirm(`Cancel order ${ord.orderNumber}?`)) return;
                                      await api.cancelOrder(ord.id);
                                      showToast('Order cancelled');
                                      loadDataForTab('Orders');
                                    }}
                                    title="Cancel Order"
                                    className="text-xs text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20 font-medium transition cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteOrder(ord)}
                                  title="Permanently Delete Order"
                                  className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 py-1 rounded border border-red-500/20 font-medium inline-flex items-center gap-1 transition cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Delete</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* PAYMENT GATEWAYS */}
          {activeTab === 'Payment Gateways' && (
            <div className="space-y-6 max-w-7xl">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-500" />
                    <span>Payment Gateway & Method Controls</span>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Enable/disable checkout gateways, configure credentials, test live APIs, and adjust transaction fees
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRefresh('Payment Gateways')}
                    disabled={loading || isRefreshing}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-300 rounded-lg text-xs font-medium transition cursor-pointer active:scale-95"
                    title="Refresh payment gateways"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || loading ? 'animate-spin text-amber-400' : ''}`} />
                    <span>{isRefreshing || loading ? 'Refreshing...' : 'Refresh'}</span>
                  </button>
                  <button
                    onClick={() => handleOpenCreatePayment()}
                    className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold rounded-lg text-xs shadow-md transition active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add Payment Gateway</span>
                  </button>
                </div>
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                  <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">Total Gateways</div>
                  <div className="text-2xl font-bold text-neutral-100 mt-1">{paymentMethods.length}</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">Configured in system</div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                  <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Active at Checkout</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">
                    {paymentMethods.filter((p) => p.status === 'active').length}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">Visible to buyers</div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                  <div className="text-[11px] uppercase tracking-wider text-amber-400 font-medium">Sandbox / Testing</div>
                  <div className="text-2xl font-bold text-amber-400 mt-1">
                    {paymentMethods.filter((p) => p.testMode).length}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">Test mode enabled</div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                  <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">Inactive / Disabled</div>
                  <div className="text-2xl font-bold text-neutral-400 mt-1">
                    {paymentMethods.filter((p) => p.status !== 'active').length}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">Hidden from buyers</div>
                </div>
              </div>

              {/* Quick Preset Templates Bar */}
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold text-neutral-300">Quick Gateway Presets:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenCreatePayment({
                        name: 'bKash Online Payment',
                        code: 'BKASH',
                        type: 'mobile_banking',
                        status: 'active',
                        testMode: true,
                        badge: 'Instant 1.5% Cashback',
                        accountType: 'Merchant',
                        instructions: 'You will be redirected to the secure bKash checkout page to enter your PIN and OTP.',
                        sandboxEndpoint: 'https://tokenized.sandbox.bka.sh/v2',
                        liveEndpoint: 'https://tokenized.pay.bka.sh/v2'
                      })
                    }
                    className="px-2.5 py-1 bg-pink-950/40 hover:bg-pink-900/60 border border-pink-800/40 text-pink-300 text-xs rounded font-medium transition cursor-pointer"
                  >
                    + bKash Direct PGW
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenCreatePayment({
                        name: 'Nagad Online Payment',
                        code: 'NAGAD',
                        type: 'mobile_banking',
                        status: 'active',
                        testMode: true,
                        badge: 'Zero Extra Fee',
                        accountType: 'Merchant',
                        instructions: 'Proceed to Nagad gateway to pay securely using your Nagad wallet account and OTP.',
                        sandboxEndpoint: 'http://sandbox.mynagad.com:10080',
                        liveEndpoint: 'https://api.mynagad.com'
                      })
                    }
                    className="px-2.5 py-1 bg-orange-950/40 hover:bg-orange-900/60 border border-orange-800/40 text-orange-300 text-xs rounded font-medium transition cursor-pointer"
                  >
                    + Nagad Gateway
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenCreatePayment({
                        name: 'SSLCommerz Payment Gateway',
                        code: 'SSLCOMMERZ',
                        type: 'gateway',
                        status: 'active',
                        testMode: true,
                        badge: 'Visa / MC / Amex',
                        instructions: 'Pay securely via Visa, MasterCard, Amex, Internet Banking, or any Mobile Wallet.',
                        sandboxEndpoint: 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php',
                        liveEndpoint: 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
                      })
                    }
                    className="px-2.5 py-1 bg-sky-950/40 hover:bg-sky-900/60 border border-sky-800/40 text-sky-300 text-xs rounded font-medium transition cursor-pointer"
                  >
                    + SSLCommerz Multi-Card
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenCreatePayment({
                        name: 'Cash on Delivery (COD)',
                        code: 'COD',
                        type: 'cod',
                        status: 'active',
                        testMode: false,
                        badge: 'Pay Upon Arrival',
                        instructions: 'Pay with cash upon physical delivery. Please have the exact payment ready when courier arrives.'
                      })
                    }
                    className="px-2.5 py-1 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/40 text-emerald-300 text-xs rounded font-medium transition cursor-pointer"
                  >
                    + Cash on Delivery (COD)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenCreatePayment({
                        name: 'Direct Bank Wire / EFT Transfer',
                        code: 'BANK_TRANSFER',
                        type: 'bank_transfer',
                        status: 'active',
                        testMode: false,
                        badge: 'Direct Account Deposit',
                        bankName: 'City Bank Ltd / Brac Bank',
                        instructions: 'Please deposit the order total to our bank account. Include your Order ID as the memo/reference.'
                      })
                    }
                    className="px-2.5 py-1 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/40 text-purple-300 text-xs rounded font-medium transition cursor-pointer"
                  >
                    + Bank Wire Transfer
                  </button>
                </div>
              </div>

              {/* Main List */}
              {paymentMethods.length === 0 ? (
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center space-y-4">
                  <CreditCard className="w-12 h-12 text-neutral-600 mx-auto" />
                  <div>
                    <h4 className="text-base font-bold text-neutral-200">No Payment Methods Configured</h4>
                    <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1">
                      No payment methods are currently active or configured. Click below to add a payment gateway or choose from the quick presets above.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenCreatePayment()}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold rounded-lg text-xs"
                  >
                    + Add First Payment Gateway
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {paymentMethods.map((pm) => {
                    const isTested = testResult && testResult.id === pm.id;
                    const isTesting = testingPaymentId === pm.id;
                    const isBkash = pm.code === 'BKASH';
                    const isNagad = pm.code === 'NAGAD';
                    const isSsl = pm.code === 'SSLCOMMERZ';
                    const isCod = pm.type === 'cod' || pm.code === 'COD';
                    const isBank = pm.type === 'bank_transfer' || pm.code === 'BANK_TRANSFER';

                    const badgeTheme = isBkash
                      ? 'bg-pink-500/10 text-pink-400 border-pink-500/20'
                      : isNagad
                      ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                      : isSsl
                      ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                      : isCod
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : isBank
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      : 'bg-neutral-800 text-neutral-300 border-neutral-700';

                    const hasCredentials = Boolean(
                      pm.storeId || pm.merchantId || pm.appKey || pm.apiKey || pm.accountNumber
                    );

                    return (
                      <div
                        key={pm.id}
                        className={`bg-neutral-900 border rounded-xl p-5 space-y-4 transition ${
                          pm.status === 'active'
                            ? 'border-neutral-800 hover:border-neutral-700'
                            : 'border-neutral-800/60 opacity-75 hover:opacity-100'
                        }`}
                      >
                        {/* Top Card Row */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase border tracking-wider ${badgeTheme}`}
                            >
                              {pm.code}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-neutral-100">{pm.name}</h4>
                                {pm.badge && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                                    {pm.badge}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-neutral-500 uppercase tracking-wider">
                                  Type: {pm.type.replace('_', ' ')}
                                </span>
                                <span className="text-neutral-600">•</span>
                                {pm.testMode ? (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                                    SANDBOX
                                  </span>
                                ) : (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                                    LIVE PROD
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Toggle Switch */}
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[11px] font-semibold ${
                                pm.status === 'active' ? 'text-emerald-400' : 'text-neutral-500'
                              }`}
                            >
                              {pm.status === 'active' ? 'Active' : 'Disabled'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleTogglePaymentStatus(pm)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                pm.status === 'active' ? 'bg-emerald-500' : 'bg-neutral-700'
                              }`}
                              title={pm.status === 'active' ? 'Click to disable' : 'Click to enable'}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  pm.status === 'active' ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Description & Instructions */}
                        <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-lg p-3 text-xs space-y-1.5">
                          {pm.description && (
                            <p className="text-neutral-300 font-medium">{pm.description}</p>
                          )}
                          <p className="text-neutral-400">
                            <span className="text-neutral-500 font-semibold uppercase text-[10px] tracking-wider block">
                              Checkout Instructions:
                            </span>
                            {pm.instructions || 'No special instructions given.'}
                          </p>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                          <div className="bg-neutral-950/40 border border-neutral-800/60 rounded p-2">
                            <span className="text-[10px] uppercase text-neutral-500 block">Surcharge Fee</span>
                            <span className="font-semibold text-neutral-200">
                              {pm.additionalFee && pm.additionalFee > 0 ? `+${pm.additionalFee}%` : 'Free (৳0)'}
                            </span>
                          </div>
                          <div className="bg-neutral-950/40 border border-neutral-800/60 rounded p-2">
                            <span className="text-[10px] uppercase text-neutral-500 block">Order Limits</span>
                            <span className="font-semibold text-neutral-200">
                              {pm.minOrderAmount || pm.maxOrderAmount
                                ? `৳${pm.minOrderAmount || 0} - ${pm.maxOrderAmount ? `৳${pm.maxOrderAmount}` : '∞'}`
                                : 'Any Amount'}
                            </span>
                          </div>
                          <div className="bg-neutral-950/40 border border-neutral-800/60 rounded p-2 col-span-2 sm:col-span-1">
                            <span className="text-[10px] uppercase text-neutral-500 block">Credentials</span>
                            <span className="font-semibold flex items-center gap-1 text-neutral-200">
                              {isCod ? (
                                <span className="text-emerald-400">No Keys Needed</span>
                              ) : hasCredentials ? (
                                <span className="text-emerald-400 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Configured</span>
                                </span>
                              ) : (
                                <span className="text-amber-400 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Pending Setup</span>
                                </span>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Masked Credentials Summary */}
                        {!isCod && hasCredentials && (
                          <div className="text-[11px] font-mono text-neutral-400 bg-neutral-950/80 px-2.5 py-1.5 rounded border border-neutral-800 flex flex-wrap gap-x-4 gap-y-1">
                            {pm.storeId && (
                              <span>Store ID: <span className="text-neutral-200">{pm.storeId.slice(0, 4)}***</span></span>
                            )}
                            {pm.merchantId && (
                              <span>Merchant ID: <span className="text-neutral-200">{pm.merchantId.slice(0, 4)}***</span></span>
                            )}
                            {pm.accountNumber && (
                              <span>Account: <span className="text-neutral-200">{pm.accountNumber.slice(0, 4)}***</span></span>
                            )}
                            {pm.appKey && (
                              <span>App Key: <span className="text-neutral-200">{pm.appKey.slice(0, 4)}***</span></span>
                            )}
                            {pm.currency && (
                              <span>Currency: <span className="text-neutral-200">{pm.currency}</span></span>
                            )}
                          </div>
                        )}

                        {/* Test Connection Result Notice */}
                        {isTested && (
                          <div
                            className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                              testResult.success
                                ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                                : 'bg-red-950/30 border-red-800/50 text-red-300'
                            }`}
                          >
                            {testResult.success ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                            )}
                            <div className="space-y-0.5">
                              <p className="font-semibold">{testResult.message}</p>
                              {testResult.details && typeof testResult.details === 'object' && (
                                <p className="text-[11px] opacity-80 font-mono">
                                  {JSON.stringify(testResult.details)}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {!isCod && (
                              <button
                                type="button"
                                onClick={() => handleTestPayment(pm)}
                                disabled={isTesting}
                                className="px-2.5 py-1.5 bg-sky-950/40 hover:bg-sky-900/60 text-sky-400 border border-sky-800/40 rounded-lg text-xs font-medium transition cursor-pointer flex items-center space-x-1.5 active:scale-95 disabled:opacity-50"
                                title="Run live handshake test against gateway API"
                              >
                                <Zap className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                                <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleOpenEditPayment(pm)}
                              className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium transition cursor-pointer flex items-center space-x-1 active:scale-95"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit & Keys</span>
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeletePayment(pm)}
                            className="px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/40 rounded-lg text-xs font-medium transition cursor-pointer flex items-center space-x-1 active:scale-95"
                            title="Delete this payment method"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 8. CUSTOMERS */}
          {activeTab === 'Customers' && (() => {
            const query = customerSearchQuery.toLowerCase().trim();
            const filteredCustomers = customers.filter((c) => {
              const matchesSearch =
                !query ||
                (c.fullName && c.fullName.toLowerCase().includes(query)) ||
                (c.email && c.email.toLowerCase().includes(query)) ||
                (c.phone && c.phone.includes(query));
              const matchesStatus = customerFilterStatus === 'all' || (c.status || 'active') === customerFilterStatus;
              return matchesSearch && matchesStatus;
            });

            const totalCount = customers.length;
            const activeCount = customers.filter((c) => (c.status || 'active') === 'active').length;
            const withAddressesCount = customers.filter((c) => c.savedAddresses && c.savedAddresses.length > 0).length;

            return (
              <div className="space-y-6 max-w-6xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                      <Users className="w-5 h-5 text-amber-500" />
                      <span>Customer Management</span>
                    </h3>
                    <p className="text-xs text-neutral-400">View patrons, create customer profiles, edit records, and inspect addresses</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRefresh('Customers')}
                      disabled={loading || isRefreshing}
                      className="flex items-center space-x-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-300 rounded-lg text-xs font-medium transition cursor-pointer active:scale-95"
                      title="Refresh customers"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || loading ? 'animate-spin text-amber-400' : ''}`} />
                      <span>{isRefreshing || loading ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                    <button
                      onClick={handleOpenCreateCustomer}
                      className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-3.5 py-2 rounded-lg text-xs transition cursor-pointer active:scale-95 shadow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Customer</span>
                    </button>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5">
                    <p className="text-xs text-neutral-400">Total Registered Patrons</p>
                    <p className="text-lg font-bold text-neutral-100 mt-1">{totalCount}</p>
                  </div>
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5">
                    <p className="text-xs text-emerald-400">Active Patrons</p>
                    <p className="text-lg font-bold text-emerald-400 mt-1">{activeCount}</p>
                  </div>
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5">
                    <p className="text-xs text-amber-400">Saved Delivery Addresses</p>
                    <p className="text-lg font-bold text-amber-400 mt-1">{withAddressesCount}</p>
                  </div>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search customer by name, email, or phone..."
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition"
                    />
                    {customerSearchQuery && (
                      <button
                        onClick={() => setCustomerSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5">
                      <Filter className="w-3.5 h-3.5 text-neutral-500" />
                      <select
                        value={customerFilterStatus}
                        onChange={(e) => setCustomerFilterStatus(e.target.value)}
                        className="bg-transparent text-xs text-neutral-300 focus:outline-none cursor-pointer"
                      >
                        <option value="all" className="bg-neutral-900">All Statuses ({totalCount})</option>
                        <option value="active" className="bg-neutral-900">Active ({activeCount})</option>
                        <option value="inactive" className="bg-neutral-900">Inactive ({customers.filter((c) => c.status === 'inactive').length})</option>
                        <option value="blocked" className="bg-neutral-900">Blocked ({customers.filter((c) => c.status === 'blocked').length})</option>
                      </select>
                    </div>
                    {(customerSearchQuery || customerFilterStatus !== 'all') && (
                      <button
                        onClick={() => {
                          setCustomerSearchQuery('');
                          setCustomerFilterStatus('all');
                        }}
                        className="text-xs text-neutral-400 hover:text-amber-400 px-2 py-1.5 transition cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Customers Table */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
                  {filteredCustomers.length === 0 ? (
                    <div className="text-center py-12 px-4 space-y-2">
                      <Users className="w-9 h-9 text-neutral-600 mx-auto" />
                      <p className="text-sm font-semibold text-neutral-300">No customers found</p>
                      <p className="text-xs text-neutral-500">No patron accounts matched your search or status filter.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-neutral-300">
                        <thead className="bg-neutral-950 text-neutral-400 text-xs uppercase border-b border-neutral-800">
                          <tr>
                            <th className="py-3 px-4">Customer</th>
                            <th>Contact</th>
                            <th>Saved Addresses</th>
                            <th>Status</th>
                            <th className="text-right px-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                          {filteredCustomers.map((c) => (
                            <tr key={c.id} className="hover:bg-neutral-800/40 transition">
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs uppercase">
                                    {c.fullName ? c.fullName.slice(0, 2) : 'CU'}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-neutral-100">{c.fullName || 'Anonymous Patron'}</p>
                                    <p className="text-[11px] text-neutral-500 font-mono">ID: {c.id.slice(0, 10)}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="text-xs">
                                <p className="text-neutral-300">{c.email}</p>
                                <p className="text-neutral-500">{c.phone}</p>
                              </td>
                              <td className="text-xs text-neutral-400">
                                {c.savedAddresses && c.savedAddresses.length > 0 ? (
                                  <span className="text-neutral-300">
                                    {c.savedAddresses.length} address(es)
                                    <span className="block text-[10px] text-neutral-500 truncate max-w-xs">
                                      {c.savedAddresses[0].address}
                                    </span>
                                  </span>
                                ) : (
                                  <span className="text-neutral-500 italic">No saved address</span>
                                )}
                              </td>
                              <td>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  (c.status || 'active') === 'active'
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                    : (c.status || 'active') === 'blocked'
                                    ? 'bg-red-950 text-red-400 border border-red-800'
                                    : 'bg-neutral-800 text-neutral-400'
                                }`}>
                                  {c.status || 'Active'}
                                </span>
                              </td>
                              <td className="text-right px-4 space-x-1.5 whitespace-nowrap">
                                <button
                                  onClick={() => handleOpenEditCustomer(c)}
                                  className="text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 font-medium transition cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteCustomer(c)}
                                  title="Delete Customer Account"
                                  className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 py-1 rounded border border-red-500/20 font-medium inline-flex items-center gap-1 transition cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Delete</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* 9. REVIEWS */}
          {activeTab === 'Reviews' && (() => {
            const query = reviewSearchQuery.toLowerCase().trim();
            const filteredReviews = reviews.filter((r) => {
              const matchesSearch =
                !query ||
                (r.authorName && r.authorName.toLowerCase().includes(query)) ||
                (r.comment && r.comment.toLowerCase().includes(query));
              const matchesStatus = reviewFilterStatus === 'all' || r.status === reviewFilterStatus;
              return matchesSearch && matchesStatus;
            });

            const totalReviewsCount = reviews.length;
            const approvedReviewsCount = reviews.filter((r) => r.status === 'approved').length;
            const pendingReviewsCount = reviews.filter((r) => r.status === 'pending').length;
            const rejectedReviewsCount = reviews.filter((r) => r.status === 'rejected').length;

            return (
              <div className="space-y-6 max-w-6xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-500" />
                      <span>Product Reviews & Moderation</span>
                    </h3>
                    <p className="text-xs text-neutral-400">Review patron testimonials, approve verified purchases, and reply with official atelier feedback</p>
                  </div>
                  <button
                    onClick={() => handleRefresh('Reviews')}
                    disabled={loading || isRefreshing}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-300 rounded-lg text-xs font-medium transition cursor-pointer active:scale-95"
                    title="Refresh reviews"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || loading ? 'animate-spin text-amber-400' : ''}`} />
                    <span>{isRefreshing || loading ? 'Refreshing...' : 'Refresh'}</span>
                  </button>
                </div>

                {/* Stat Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div
                    onClick={() => setReviewFilterStatus('all')}
                    className={`bg-neutral-900 border rounded-xl p-3 cursor-pointer transition ${
                      reviewFilterStatus === 'all' ? 'border-amber-500/50 bg-amber-500/5' : 'border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <p className="text-xs text-neutral-400">Total Reviews</p>
                    <p className="text-lg font-bold text-neutral-100 mt-1">{totalReviewsCount}</p>
                  </div>
                  <div
                    onClick={() => setReviewFilterStatus('approved')}
                    className={`bg-neutral-900 border rounded-xl p-3 cursor-pointer transition ${
                      reviewFilterStatus === 'approved' ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <p className="text-xs text-emerald-400">Approved</p>
                    <p className="text-lg font-bold text-emerald-400 mt-1">{approvedReviewsCount}</p>
                  </div>
                  <div
                    onClick={() => setReviewFilterStatus('pending')}
                    className={`bg-neutral-900 border rounded-xl p-3 cursor-pointer transition ${
                      reviewFilterStatus === 'pending' ? 'border-amber-500/50 bg-amber-500/5' : 'border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <p className="text-xs text-amber-400">Pending Review</p>
                    <p className="text-lg font-bold text-amber-400 mt-1">{pendingReviewsCount}</p>
                  </div>
                  <div
                    onClick={() => setReviewFilterStatus('rejected')}
                    className={`bg-neutral-900 border rounded-xl p-3 cursor-pointer transition ${
                      reviewFilterStatus === 'rejected' ? 'border-red-500/50 bg-red-500/5' : 'border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <p className="text-xs text-red-400">Rejected</p>
                    <p className="text-lg font-bold text-red-400 mt-1">{rejectedReviewsCount}</p>
                  </div>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search review by patron name or comment text..."
                      value={reviewSearchQuery}
                      onChange={(e) => setReviewSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition"
                    />
                    {reviewSearchQuery && (
                      <button
                        onClick={() => setReviewSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5">
                      <Filter className="w-3.5 h-3.5 text-neutral-500" />
                      <select
                        value={reviewFilterStatus}
                        onChange={(e) => setReviewFilterStatus(e.target.value)}
                        className="bg-transparent text-xs text-neutral-300 focus:outline-none cursor-pointer"
                      >
                        <option value="all" className="bg-neutral-900">All Statuses ({totalReviewsCount})</option>
                        <option value="approved" className="bg-neutral-900">Approved ({approvedReviewsCount})</option>
                        <option value="pending" className="bg-neutral-900">Pending ({pendingReviewsCount})</option>
                        <option value="rejected" className="bg-neutral-900">Rejected ({rejectedReviewsCount})</option>
                      </select>
                    </div>
                    {(reviewSearchQuery || reviewFilterStatus !== 'all') && (
                      <button
                        onClick={() => {
                          setReviewSearchQuery('');
                          setReviewFilterStatus('all');
                        }}
                        className="text-xs text-neutral-400 hover:text-amber-400 px-2 py-1.5 transition cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-3">
                  {filteredReviews.map((r) => (
                    <div key={r.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-neutral-700 transition">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="font-semibold text-neutral-100">{r.authorName}</span>
                          <span className="text-amber-400 text-xs font-bold">★ {r.rating} / 5</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            r.status === 'approved'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : r.status === 'rejected'
                              ? 'bg-red-950 text-red-400 border border-red-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}>
                            {r.status}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-300 italic">&quot;{r.comment}&quot;</p>
                        {r.adminReply && (
                          <div className="text-xs text-amber-400 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 mt-2">
                            <strong>Atelier Reply:</strong> {r.adminReply}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => handleOpenEditReview(r)}
                          className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold rounded-lg transition flex items-center space-x-1 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit / Reply</span>
                        </button>
                        {r.status !== 'approved' && (
                          <button
                            onClick={async () => {
                              await api.approveReview(r.id);
                              showToast('Review approved');
                              loadDataForTab('Reviews');
                            }}
                            className="px-3 py-1.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-xs font-semibold rounded-lg border border-emerald-700/50 transition cursor-pointer"
                          >
                            Approve
                          </button>
                        )}
                        {r.status !== 'rejected' && (
                          <button
                            onClick={async () => {
                              await api.rejectReview(r.id);
                              showToast('Review rejected');
                              loadDataForTab('Reviews');
                            }}
                            className="px-3 py-1.5 bg-red-900/50 hover:bg-red-800 text-red-200 text-xs font-semibold rounded-lg border border-red-700/50 transition cursor-pointer"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReview(r)}
                          title="Delete Review"
                          className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-neutral-700/60 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredReviews.length === 0 && (
                    <div className="text-center py-12 px-4 space-y-2 bg-neutral-900/50 border border-neutral-800 rounded-xl">
                      <Star className="w-9 h-9 text-neutral-600 mx-auto" />
                      <p className="text-neutral-400 text-sm font-medium">No reviews found matching current filter.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* LIVE CHAT & CONCIERGE WORKSPACE */}
          {activeTab === 'Live Chat' && (
            <LiveChatAdminView
              onRefreshBadge={() =>
                api
                  .chatThreads()
                  .then((t) => setLiveChatUnreadCount(t.reduce((acc, x) => acc + (x.unreadCountAdmin || 0), 0)))
                  .catch(() => {})
              }
            />
          )}

          {/* 10. INQUIRIES */}
          {activeTab === 'Inquiries' && (() => {
            const query = inquirySearchQuery.toLowerCase().trim();
            const filteredInquiries = inquiries.filter((inq) => {
              const matchesSearch =
                !query ||
                (inq.name && inq.name.toLowerCase().includes(query)) ||
                (inq.email && inq.email.toLowerCase().includes(query)) ||
                (inq.phone && inq.phone.includes(query)) ||
                (inq.message && inq.message.toLowerCase().includes(query));
              const matchesStatus = inquiryFilterStatus === 'all' || inq.status === inquiryFilterStatus;
              return matchesSearch && matchesStatus;
            });

            const totalInquiriesCount = inquiries.length;
            const pendingInquiriesCount = inquiries.filter((i) => i.status === 'pending' || i.status === 'new').length;
            const repliedInquiriesCount = inquiries.filter((i) => i.status === 'replied' || i.status === 'resolved').length;

            return (
              <div className="space-y-6 max-w-6xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-amber-500" />
                      <span>Customer Inquiries & Support</span>
                    </h3>
                    <p className="text-xs text-neutral-400">Respond to bespoke requests, styling inquiries, and patron messages</p>
                  </div>
                  <button
                    onClick={() => handleRefresh('Inquiries')}
                    disabled={loading || isRefreshing}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-300 rounded-lg text-xs font-medium transition cursor-pointer active:scale-95"
                    title="Refresh inquiries"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || loading ? 'animate-spin text-amber-400' : ''}`} />
                    <span>{isRefreshing || loading ? 'Refreshing...' : 'Refresh'}</span>
                  </button>
                </div>

                {/* Stat Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setInquiryFilterStatus('all')}
                    className={`bg-neutral-900 border rounded-xl p-3 cursor-pointer transition ${
                      inquiryFilterStatus === 'all' ? 'border-amber-500/50 bg-amber-500/5' : 'border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <p className="text-xs text-neutral-400">Total Inquiries</p>
                    <p className="text-lg font-bold text-neutral-100 mt-1">{totalInquiriesCount}</p>
                  </div>
                  <div
                    onClick={() => setInquiryFilterStatus('pending')}
                    className={`bg-neutral-900 border rounded-xl p-3 cursor-pointer transition ${
                      inquiryFilterStatus === 'pending' ? 'border-amber-500/50 bg-amber-500/5' : 'border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <p className="text-xs text-amber-400">Pending Response</p>
                    <p className="text-lg font-bold text-amber-400 mt-1">{pendingInquiriesCount}</p>
                  </div>
                  <div
                    onClick={() => setInquiryFilterStatus('replied')}
                    className={`bg-neutral-900 border rounded-xl p-3 cursor-pointer transition ${
                      inquiryFilterStatus === 'replied' ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <p className="text-xs text-emerald-400">Replied / Resolved</p>
                    <p className="text-lg font-bold text-emerald-400 mt-1">{repliedInquiriesCount}</p>
                  </div>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search inquiries by patron name, email, phone, or question..."
                      value={inquirySearchQuery}
                      onChange={(e) => setInquirySearchQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition"
                    />
                    {inquirySearchQuery && (
                      <button
                        onClick={() => setInquirySearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5">
                      <Filter className="w-3.5 h-3.5 text-neutral-500" />
                      <select
                        value={inquiryFilterStatus}
                        onChange={(e) => setInquiryFilterStatus(e.target.value)}
                        className="bg-transparent text-xs text-neutral-300 focus:outline-none cursor-pointer"
                      >
                        <option value="all" className="bg-neutral-900">All Statuses ({totalInquiriesCount})</option>
                        <option value="pending" className="bg-neutral-900">Pending ({pendingInquiriesCount})</option>
                        <option value="replied" className="bg-neutral-900">Replied ({repliedInquiriesCount})</option>
                      </select>
                    </div>
                    {(inquirySearchQuery || inquiryFilterStatus !== 'all') && (
                      <button
                        onClick={() => {
                          setInquirySearchQuery('');
                          setInquiryFilterStatus('all');
                        }}
                        className="text-xs text-neutral-400 hover:text-amber-400 px-2 py-1.5 transition cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Inquiries List */}
                <div className="space-y-4">
                  {filteredInquiries.map((inq) => (
                    <div key={inq.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:border-neutral-700 transition">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="font-semibold text-neutral-100">{inq.name}</span>
                          <span className="text-xs text-neutral-400">{inq.email}</span>
                          <span className="text-xs text-neutral-500">| {inq.phone}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            inq.status === 'replied' || inq.status === 'resolved'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}>
                            {inq.status}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-300 mt-2">{inq.message}</p>
                        {inq.adminReply && (
                          <div className="text-xs text-emerald-400 bg-neutral-950 p-2.5 rounded-lg mt-2 border border-neutral-800">
                            <strong>Atelier Official Reply:</strong> {inq.adminReply}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => {
                            setActiveInquiryId(inq.id);
                            setInquiryReplyText(inq.adminReply || '');
                            setIsInquiryReplyModal(true);
                          }}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs rounded-lg transition whitespace-nowrap cursor-pointer shadow"
                        >
                          {inq.adminReply ? 'Update Reply' : 'Reply to Patron'}
                        </button>
                        <select
                          value={inq.status}
                          onChange={(e) => handleUpdateInquiryStatus(inq, e.target.value)}
                          className="bg-neutral-950 border border-neutral-700 text-neutral-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="replied">Replied</option>
                          <option value="resolved">Resolved</option>
                        </select>
                        <button
                          onClick={() => handleDeleteInquiry(inq)}
                          title="Delete Inquiry"
                          className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-neutral-700/60 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredInquiries.length === 0 && (
                    <div className="text-center py-12 px-4 space-y-2 bg-neutral-900/50 border border-neutral-800 rounded-xl">
                      <MessageSquare className="w-9 h-9 text-neutral-600 mx-auto" />
                      <p className="text-neutral-400 text-sm font-medium">No inquiries matching filter.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* 11. BANNERS */}
          {activeTab === 'Banners' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-serif font-bold text-neutral-100">Hero & Promotional Banners</h3>
                    <span className="px-2.5 py-0.5 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full font-semibold">
                      {banners.length} {banners.length === 1 ? 'Banner' : 'Banners'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Manage storefront hero slides, campaign banners, scheduling, and call-to-actions.
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleRefresh('Banners')}
                    disabled={loading || isRefreshing}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-300 rounded-lg text-xs font-medium transition cursor-pointer active:scale-95"
                    title="Refresh banners"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || loading ? 'animate-spin text-amber-400' : ''}`} />
                    <span>{isRefreshing || loading ? 'Refreshing...' : 'Refresh'}</span>
                  </button>
                  <button
                    onClick={handleOpenCreateBanner}
                    className="flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs rounded-lg transition shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Banner</span>
                  </button>
                </div>
              </div>

              {banners.length === 0 ? (
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center">
                  <ImageIcon className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                  <h4 className="text-base font-medium text-neutral-300 mb-1">No Banners Found</h4>
                  <p className="text-xs text-neutral-500 max-w-md mx-auto mb-5">
                    Create hero sliders or promotional campaign banners to highlight seasonal collections, sales, or featured categories.
                  </p>
                  <button
                    onClick={handleOpenCreateBanner}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs rounded-lg transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Banner</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {banners.map((b) => {
                    const isActive = b.status === 'active' || b.status === 'published';
                    return (
                      <div
                        key={b.id}
                        className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex flex-col justify-between shadow-sm hover:border-neutral-700 transition"
                      >
                        <div>
                          {/* Banner Image Preview with Overlays */}
                          <div className="relative w-full h-44 bg-neutral-950 overflow-hidden group">
                            <img
                              src={b.imageDesktop}
                              alt={b.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1800&auto=format&fit=crop';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
                            {/* Badges on preview */}
                            <div className="absolute top-3 left-3 flex items-center space-x-2">
                              <span className="px-2 py-0.5 bg-black/70 backdrop-blur-xs border border-white/20 text-white text-[10px] uppercase font-bold tracking-wider rounded">
                                {b.position || 'hero'}
                              </span>
                              <span className="px-1.5 py-0.5 bg-neutral-900/80 text-neutral-300 text-[10px] font-mono rounded">
                                #{b.sortOrder ?? 1}
                              </span>
                            </div>
                            <div className="absolute top-3 right-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  isActive
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                    : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                    isActive ? 'bg-emerald-400' : 'bg-neutral-500'
                                  }`}
                                />
                                {b.status}
                              </span>
                            </div>
                            {/* Overlay Title preview */}
                            <div className="absolute bottom-3 left-3 right-3 text-white">
                              <h4 className="font-serif font-bold text-lg leading-tight line-clamp-1 drop-shadow-sm">
                                {b.title}
                              </h4>
                              {b.subtitle && (
                                <p className="text-xs text-neutral-200/90 line-clamp-1 mt-0.5 drop-shadow-sm">
                                  {b.subtitle}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Details */}
                          <div className="p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-neutral-950/60 border border-neutral-800/80 p-2 rounded">
                                <span className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-0.5">
                                  Call to Action
                                </span>
                                <div className="font-medium text-neutral-200 truncate flex items-center gap-1">
                                  <span className="truncate">{b.buttonText || 'None'}</span>
                                  {b.buttonUrl && <ExternalLink className="w-3 h-3 text-neutral-500 shrink-0" />}
                                </div>
                                <span className="text-[10px] text-neutral-500 font-mono truncate block">
                                  {b.buttonUrl || '—'}
                                </span>
                              </div>
                              <div className="bg-neutral-950/60 border border-neutral-800/80 p-2 rounded">
                                <span className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-0.5">
                                  Schedule
                                </span>
                                {b.startDate || b.endDate ? (
                                  <div className="text-[10px] text-neutral-300">
                                    <div>From: {b.startDate ? b.startDate.slice(0, 10) : 'Immediate'}</div>
                                    <div>To: {b.endDate ? b.endDate.slice(0, 10) : 'Open'}</div>
                                  </div>
                                ) : (
                                  <span className="text-neutral-400 text-xs">Always Active</span>
                                )}
                              </div>
                            </div>
                            {b.imageMobile && (
                              <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                                <span className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-400">Mobile</span>
                                <span className="truncate">{b.imageMobile}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Action Buttons */}
                        <div className="p-4 pt-2 border-t border-neutral-800 flex items-center justify-between gap-2">
                          <button
                            onClick={() => handleToggleBannerStatus(b)}
                            className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                              isActive
                                ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                                : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleOpenEditBanner(b)}
                              className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-xs font-semibold transition"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                              <span>Customize</span>
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm(`Delete banner "${b.title}"?`)) {
                                  await api.deleteBanner(b.id);
                                  showToast('Banner deleted');
                                  loadDataForTab('Banners');
                                }
                              }}
                              className="p-1.5 text-neutral-500 hover:text-red-400 rounded transition"
                              title="Delete banner"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 12. HOMEPAGE SECTIONS */}
          {activeTab === 'Homepage Sections' && (
            <div className="space-y-6 max-w-5xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Homepage Sections & Layout</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Customize homepage blocks, collection showcases, and display sequence.</p>
                </div>
                <button
                  onClick={handleOpenCreateSection}
                  className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded-lg text-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Section</span>
                </button>
              </div>
              <div className="space-y-4">
                {homepageSections.map((sec, i) => (
                  <div key={sec.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-neutral-500 text-xs">#{sec.sortOrder ?? i + 1}</span>
                      <div>
                        <span className="font-semibold text-neutral-200 block">{sec.title}</span>
                        {sec.subtitle && <span className="text-xs text-neutral-400 block">{sec.subtitle}</span>}
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-amber-400 font-mono">
                        {sec.type}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${sec.status === 'active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-neutral-800 text-neutral-400'}`}>
                        {sec.status}
                      </span>
                      <button
                        onClick={() => handleOpenEditSection(sec)}
                        className="p-1 text-neutral-400 hover:text-amber-400 transition"
                        title="Edit Section"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm(`Delete section "${sec.title}"?`)) return;
                          try {
                            await api.deleteHomepageSection(sec.id);
                            showToast('Section deleted');
                            loadDataForTab('Homepage Sections');
                          } catch (err: unknown) {
                            showToast(err instanceof Error ? err.message : 'Error deleting section');
                          }
                        }}
                        className="p-1 text-neutral-400 hover:text-red-400 transition"
                        title="Delete Section"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {homepageSections.length === 0 && <p className="text-neutral-500 text-center py-10">No homepage sections configured.</p>}
              </div>
            </div>
          )}

          {/* 13. OFFERS */}
          {activeTab === 'Offers' && (
            <div className="space-y-6 max-w-5xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Promotional Offers & Deals</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Manage special campaign discounts, bundles, and seasonal offers.</p>
                </div>
                <button
                  onClick={handleOpenCreateOffer}
                  className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded-lg text-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Offer</span>
                </button>
              </div>
              <div className="space-y-4">
                {offers.map((o) => (
                  <div key={o.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-neutral-100">{o.name}</h4>
                      <p className="text-xs text-neutral-400">
                        Type: <span className="text-neutral-200 capitalize">{o.discountType}</span> | Value: <span className="text-amber-400 font-bold">{o.discountValue}{o.discountType === 'percent' ? '%' : ' BDT'}</span>
                        {o.minimumOrderAmount ? ` | Min Spend: ৳${o.minimumOrderAmount}` : ''}
                        {o.code ? ` | Code: ${o.code}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${o.status === 'active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-neutral-800 text-neutral-400'}`}>
                        {o.status}
                      </span>
                      <button
                        onClick={() => handleOpenEditOffer(o)}
                        className="p-1 text-neutral-400 hover:text-amber-400 transition"
                        title="Edit Offer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm(`Delete offer "${o.name}"?`)) return;
                          try {
                            await api.deleteOffer(o.id);
                            showToast('Offer deleted');
                            loadDataForTab('Offers');
                          } catch (err: unknown) {
                            showToast(err instanceof Error ? err.message : 'Error deleting offer');
                          }
                        }}
                        className="p-1 text-neutral-400 hover:text-red-400 transition"
                        title="Delete Offer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {offers.length === 0 && <p className="text-neutral-500 text-center py-10">No active offers.</p>}
              </div>
            </div>
          )}

          {/* 14. COUPONS */}
          {activeTab === 'Coupons' && (
            <div className="space-y-6 max-w-5xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Promotional Discount Coupons</h3>
                <button
                  onClick={() => setIsCouponModal(true)}
                  className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded-lg text-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Coupon</span>
                </button>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm text-neutral-300">
                  <thead className="bg-neutral-950 text-neutral-400 text-xs uppercase border-b border-neutral-800">
                    <tr>
                      <th className="py-3 px-4">Coupon Code</th>
                      <th>Discount</th>
                      <th>Min Spend</th>
                      <th>Description</th>
                      <th className="text-right px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {coupons.map((c) => (
                      <tr key={c.code}>
                        <td className="py-3 px-4 font-mono font-bold text-amber-400">{c.code}</td>
                        <td className="text-neutral-100 font-semibold">{c.discountValue || c.discountPercent || 10}%</td>
                        <td className="text-neutral-400">৳{(c.minSpend || c.minOrder || 0).toLocaleString()}</td>
                        <td className="text-xs text-neutral-400">{c.description}</td>
                        <td className="text-right px-4">
                          <button
                            onClick={async () => {
                              if (!confirm(`Delete coupon ${c.code}?`)) return;
                              await api.deleteCoupon(c.code);
                              showToast('Coupon deleted');
                              loadDataForTab('Coupons');
                            }}
                            className="p-1 text-neutral-500 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 15. BLOG */}
          {activeTab === 'Blog' && (
            <div className="space-y-6 max-w-5xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Style Journal & Blog Articles</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Publish menswear editorials, styling guides, and brand stories.</p>
                </div>
                <button
                  onClick={handleOpenCreateBlog}
                  className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded-lg text-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Write Article</span>
                </button>
              </div>
              <div className="space-y-4">
                {blogPosts.map((post) => (
                  <div key={post.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex items-center justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-neutral-100 text-base">{post.title}</h4>
                      <p className="text-xs text-neutral-400 mt-1">{post.excerpt || 'Article from Zippy Style Journal'}</p>
                      <p className="text-[11px] text-neutral-500 mt-2 font-mono">/{post.slug}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {post.status}
                      </span>
                      <button
                        onClick={() => handleOpenEditBlog(post)}
                        className="p-1 text-neutral-400 hover:text-amber-400 transition"
                        title="Edit Article"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm(`Delete blog post "${post.title}"?`)) return;
                          await api.deleteBlogPost(post.id);
                          showToast('Post deleted');
                          loadDataForTab('Blog');
                        }}
                        className="p-1 text-neutral-500 hover:text-red-400"
                        title="Delete Article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {blogPosts.length === 0 && <p className="text-neutral-500 text-center py-10">No blog posts found.</p>}
              </div>
            </div>
          )}

          {/* 16. PAGES */}
          {activeTab === 'Pages' && (
            <div className="space-y-6 max-w-5xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">CMS Pages & Legal Content</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Manage static pages like About Us, Bespoke Heritage, Terms, and Privacy Policy.</p>
                </div>
                <button
                  onClick={handleOpenCreatePage}
                  className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded-lg text-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Page</span>
                </button>
              </div>
              <div className="space-y-4">
                {pages.map((pg) => (
                  <div key={pg.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex items-center justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-neutral-100">{pg.title}</h4>
                      <p className="text-xs text-neutral-500 font-mono mt-1">/{pg.slug}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs uppercase font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                        {pg.status}
                      </span>
                      <button
                        onClick={() => handleOpenEditPage(pg)}
                        className="p-1 text-neutral-400 hover:text-amber-400 transition"
                        title="Edit Page"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm(`Delete page "${pg.title}"?`)) return;
                          try {
                            await api.deletePage(pg.id);
                            showToast('Page deleted');
                            loadDataForTab('Pages');
                          } catch (err: unknown) {
                            showToast(err instanceof Error ? err.message : 'Error deleting page');
                          }
                        }}
                        className="p-1 text-neutral-400 hover:text-red-400"
                        title="Delete Page"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {pages.length === 0 && <p className="text-neutral-500 text-center py-10">No CMS pages configured.</p>}
              </div>
            </div>
          )}

          {/* 17. MEDIA LIBRARY */}
          {activeTab === 'Media Library' && (
            <div className="space-y-6 max-w-7xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Store Media Assets & Library</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Upload, manage, and inspect catalog photographs, banners, lookbooks, and brand imagery.</p>
                </div>
                <div className="flex items-center space-x-2.5">
                  <label className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded-lg text-sm transition cursor-pointer shadow">
                    <Upload className="w-4 h-4" />
                    <span>Upload Photos</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;
                        setIsUploadingMedia(true);
                        try {
                          let count = 0;
                          for (let i = 0; i < files.length; i++) {
                            const folder = mediaFilterFolder === 'all' ? 'general' : mediaFilterFolder;
                            const res = await uploadLocalFileToStoreMedia(files[i], folder);
                            if (res) count++;
                          }
                          showToast(`Successfully uploaded ${count} photo(s) to Store Media!`);
                          await loadMediaList();
                        } finally {
                          setIsUploadingMedia(false);
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>
                  <button
                    onClick={handleOpenCreateMedia}
                    className="flex items-center space-x-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-semibold px-3.5 py-2 rounded-lg text-sm transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add by URL</span>
                  </button>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 p-3 rounded-xl">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Search media by name or URL..."
                    value={mediaSearchTerm}
                    onChange={(e) => setMediaSearchTerm(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <span className="text-xs text-neutral-500 mr-1 hidden sm:inline">Folder:</span>
                  {['all', 'products', 'banners', 'lookbook', 'general'].map((fld) => (
                    <button
                      key={fld}
                      onClick={() => setMediaFilterFolder(fld)}
                      className={`px-3 py-1 rounded-lg text-xs capitalize transition ${
                        mediaFilterFolder === fld
                          ? 'bg-amber-500 text-neutral-950 font-bold'
                          : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                      }`}
                    >
                      {fld}
                    </button>
                  ))}
                </div>
              </div>

              {/* Media Grid */}
              {(() => {
                const filtered = mediaList.filter((m) => {
                  const matchesSearch = !mediaSearchTerm.trim() ||
                    m.name.toLowerCase().includes(mediaSearchTerm.toLowerCase()) ||
                    m.url.toLowerCase().includes(mediaSearchTerm.toLowerCase());
                  const matchesFolder = mediaFilterFolder === 'all' || m.folder === mediaFilterFolder;
                  return matchesSearch && matchesFolder;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-16 bg-neutral-900/50 border border-neutral-800 rounded-xl space-y-3">
                      <ImageIcon className="w-10 h-10 text-neutral-600 mx-auto" />
                      <p className="text-neutral-400 text-sm font-medium">No media assets found matching current filter.</p>
                      <p className="text-neutral-600 text-xs">Upload photos directly from your device or add via URL.</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filtered.map((m) => (
                      <div key={m.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 group relative flex flex-col justify-between hover:border-amber-500/60 transition shadow">
                        <div className="w-full h-32 rounded-lg overflow-hidden bg-neutral-950 relative">
                          <img src={m.url} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-neutral-950/80 text-[9px] uppercase tracking-wider text-amber-400 font-mono shadow">
                            {m.folder || 'general'}
                          </span>
                        </div>
                        <div className="mt-2 space-y-0.5">
                          <p className="text-xs text-neutral-200 truncate font-mono font-medium" title={m.name}>{m.name}</p>
                          <p className="text-[10px] text-neutral-500">
                            {m.size ? `${(m.size / 1024).toFixed(0)} KB` : 'Asset'}
                          </p>
                        </div>
                        <div className="absolute top-3.5 right-3.5 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition bg-neutral-900/90 p-1 rounded-lg border border-neutral-700 shadow-lg">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(m.url);
                              showToast('Media URL copied to clipboard!');
                            }}
                            className="p-1 text-neutral-300 hover:text-amber-400 rounded"
                            title="Copy URL"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditMedia(m)}
                            className="p-1 text-neutral-300 hover:text-amber-400 rounded"
                            title="Edit Media Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm(`Delete media "${m.name}"?`)) return;
                              await api.deleteMedia(m.id);
                              showToast('Media removed from library');
                              loadDataForTab('Media Library');
                            }}
                            className="p-1 text-neutral-300 hover:text-red-400 rounded"
                            title="Delete Media"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* SALES REPORT */}
          {activeTab === 'Sales Report' && (
            <SalesReportAdminView onNavigateToOrder={() => setActiveTab('Orders')} />
          )}

          {/* 18. REPORTS */}
          {activeTab === 'Reports' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-serif font-bold text-neutral-100">Enterprise Business Reports Center</h3>
                  <p className="text-xs text-neutral-400">Download authenticated CSV datasets across sales, inventory, patron activity, logistics, and profits</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs">
                    11 Reports Available
                  </span>
                  <button
                    onClick={() => setActiveTab('Sales Report')}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition shadow-sm"
                    title="Open dedicated interactive sales report"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Open Sales Analytics →</span>
                  </button>
                </div>
              </div>

              {/* Reports Overview Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
                  <p className="text-xs text-neutral-400">Gross Sales Revenue</p>
                  <p className="text-xl font-bold text-amber-400 font-mono mt-1">
                    ৳{Number(stats?.revenue || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
                  <p className="text-xs text-neutral-400">Total Orders Fulfilled</p>
                  <p className="text-xl font-bold text-neutral-100 font-mono mt-1">
                    {stats?.orders || 0}
                  </p>
                </div>
                <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
                  <p className="text-xs text-neutral-400">Registered Patrons</p>
                  <p className="text-xl font-bold text-emerald-400 font-mono mt-1">
                    {stats?.customers || 0}
                  </p>
                </div>
                <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
                  <p className="text-xs text-neutral-400">Export Format</p>
                  <p className="text-xl font-bold text-blue-400 font-mono mt-1">
                    CSV / Excel
                  </p>
                </div>
              </div>

              {/* 1. Sales & Financial Reports */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Sales & Financial Ledgers</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      name: 'Sales Revenue Ledger',
                      path: '/reports/sales?format=csv',
                      filename: 'sales-revenue-report.csv',
                      desc: 'Daily & monthly revenue breakdown, GMV, payment channels, completed orders',
                      badge: 'Financial'
                    },
                    {
                      name: 'Product Sales Performance',
                      path: '/reports/products?format=csv',
                      filename: 'product-sales-performance.csv',
                      desc: 'Best selling items, quantities sold, revenue per garment, SKU volume',
                      badge: 'Sales'
                    },
                    {
                      name: 'Orders Master Ledger',
                      path: '/reports/orders?format=csv',
                      filename: 'orders-master-ledger.csv',
                      desc: 'Full order dataset with patron details, delivery zones, order statuses, line items',
                      badge: 'Orders'
                    },
                    {
                      name: 'Profit & Margins Report',
                      path: '/reports/profit?format=csv',
                      filename: 'profit-margins-report.csv',
                      desc: 'Gross revenue, COGS estimations, and atelier margin calculations',
                      badge: 'Margins'
                    }
                  ].map((rep) => (
                    <div key={rep.name} className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl p-5 flex items-center justify-between gap-4 transition">
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h5 className="font-serif font-bold text-neutral-200 text-sm truncate">{rep.name}</h5>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                            {rep.badge}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{rep.desc}</p>
                      </div>
                      <button
                        onClick={() => handleDownloadReport(rep.path, rep.filename)}
                        disabled={downloadingReport === rep.filename}
                        className="shrink-0 flex items-center space-x-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-amber-400 text-xs font-semibold rounded-lg border border-neutral-700 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{downloadingReport === rep.filename ? 'Exporting...' : 'CSV'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Inventory & Stock Operations */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Inventory & Stock Operations</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      name: 'Inventory Valuation Report',
                      path: '/reports/inventory?format=csv',
                      filename: 'inventory-valuation-report.csv',
                      desc: 'Real-time stock on hand, warehouse locations, unit purchase costs, valuation in BDT',
                      badge: 'Valuation'
                    },
                    {
                      name: 'Stock Movement Audit',
                      path: '/reports/stock-movement?format=csv',
                      filename: 'stock-movement-audit.csv',
                      desc: 'Full audit log of stock-ins, stock-outs, transfers, adjustments, and order allocations',
                      badge: 'Audit'
                    },
                    {
                      name: 'Product Catalog Export',
                      path: '/products/export',
                      filename: 'product-catalog-export.csv',
                      desc: 'Complete product catalog export including title, SKUs, prices, categories, and variants',
                      badge: 'Catalog'
                    }
                  ].map((rep) => (
                    <div key={rep.name} className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl p-5 flex items-center justify-between gap-4 transition">
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h5 className="font-serif font-bold text-neutral-200 text-sm truncate">{rep.name}</h5>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                            {rep.badge}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{rep.desc}</p>
                      </div>
                      <button
                        onClick={() => handleDownloadReport(rep.path, rep.filename)}
                        disabled={downloadingReport === rep.filename}
                        className="shrink-0 flex items-center space-x-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-amber-400 text-xs font-semibold rounded-lg border border-neutral-700 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{downloadingReport === rep.filename ? 'Exporting...' : 'CSV'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Patrons, Marketing & Logistics */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Patrons, Marketing & Logistics</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      name: 'Customer Activity & LTV',
                      path: '/reports/customers?format=csv',
                      filename: 'customer-activity-report.csv',
                      desc: 'Signups, order history, lifetime spend, loyalty metrics, contact directory',
                      badge: 'Patrons'
                    },
                    {
                      name: 'Discounts & Promotions',
                      path: '/reports/discounts?format=csv',
                      filename: 'discounts-promotions-report.csv',
                      desc: 'Voucher usage frequency, promotional discounts deducted, coupon redemption',
                      badge: 'Campaigns'
                    },
                    {
                      name: 'Payment Gateways Ledger',
                      path: '/reports/payments?format=csv',
                      filename: 'payment-gateways-ledger.csv',
                      desc: 'Reconciliation log across COD, bKash, Nagad, and Card transactions with gateway IDs',
                      badge: 'Reconciliation'
                    },
                    {
                      name: 'Shipping & Delivery Logistics',
                      path: '/reports/shipping?format=csv',
                      filename: 'shipping-logistics-report.csv',
                      desc: 'Courier performance (Pathao, Steadfast), delivery zones, tracking statuses',
                      badge: 'Logistics'
                    }
                  ].map((rep) => (
                    <div key={rep.name} className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl p-5 flex items-center justify-between gap-4 transition">
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h5 className="font-serif font-bold text-neutral-200 text-sm truncate">{rep.name}</h5>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                            {rep.badge}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{rep.desc}</p>
                      </div>
                      <button
                        onClick={() => handleDownloadReport(rep.path, rep.filename)}
                        disabled={downloadingReport === rep.filename}
                        className="shrink-0 flex items-center space-x-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-amber-400 text-xs font-semibold rounded-lg border border-neutral-700 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{downloadingReport === rep.filename ? 'Exporting...' : 'CSV'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 19. ADMINS & ROLES */}
          {activeTab === 'Admins & Roles' && (
            <div className="space-y-8 max-w-5xl">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-neutral-200">Staff Administrator Accounts</h4>
                    <p className="text-xs text-neutral-500">Manage internal team members and assigned access levels.</p>
                  </div>
                  <button
                    onClick={handleOpenCreateStaff}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold rounded text-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Staff</span>
                  </button>
                </div>
                <table className="w-full text-left text-sm text-neutral-300">
                  <thead className="bg-neutral-950 text-neutral-400 text-xs uppercase border-b border-neutral-800">
                    <tr>
                      <th className="py-2.5 px-4">Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th className="text-right px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {admins.map((adm) => (
                      <tr key={adm.id}>
                        <td className="py-3 px-4 font-semibold text-neutral-100">{adm.name}</td>
                        <td className="text-xs text-neutral-400">{adm.email}</td>
                        <td className="text-xs text-neutral-400">{adm.phone}</td>
                        <td>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950 text-amber-400 border border-amber-800">
                            {adm.roleName || adm.roleId || 'Administrator'}
                          </span>
                        </td>
                        <td className="text-right px-4">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleOpenEditStaff(adm)}
                              className="p-1 text-neutral-400 hover:text-amber-400"
                              title="Edit Staff"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm(`Delete admin user "${adm.name}"?`)) return;
                                try {
                                  await api.deleteAdmin(adm.id);
                                  showToast('Staff admin deleted');
                                  loadDataForTab('Admins & Roles');
                                } catch (err: unknown) {
                                  showToast(err instanceof Error ? err.message : 'Error deleting admin');
                                }
                              }}
                              className="p-1 text-neutral-400 hover:text-red-400"
                              title="Delete Staff"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-neutral-300">RBAC Roles & Permissions Matrix</h4>
                    <p className="text-xs text-neutral-500">Define administrative roles and module permission limits.</p>
                  </div>
                  <button
                    onClick={handleOpenCreateRole}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/40 hover:bg-amber-500/20 text-amber-400 rounded text-xs font-semibold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Role</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {roles.map((r) => (
                    <div key={r.id} className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-neutral-200 capitalize">{r.name.replace(/_/g, ' ')}</span>
                          <span className="text-[10px] text-neutral-500 font-mono">{r.permissions.length} perms</span>
                        </div>
                        <p className="text-[11px] text-neutral-400 line-clamp-2">{r.description || 'Custom administrative role'}</p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-neutral-900 flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEditRole(r)}
                          className="p-1 text-neutral-400 hover:text-amber-400"
                          title="Edit Role"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(`Delete role "${r.name}"?`)) return;
                            try {
                              await api.deleteRole(r.id);
                              showToast('Role deleted');
                              loadDataForTab('Admins & Roles');
                            } catch (err: unknown) {
                              showToast(err instanceof Error ? err.message : 'Error deleting role');
                            }
                          }}
                          className="p-1 text-neutral-400 hover:text-red-400"
                          title="Delete Role"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* HEADER & FOOTER CUSTOMIZATION STUDIO */}
          {activeTab === 'Header & Footer' && (
            <div className="space-y-6 max-w-5xl">
              {/* Studio Header Card */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/30 text-amber-400">
                      <Sliders className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="font-serif font-bold text-xl text-neutral-100">
                        Header & Footer Studio
                      </h2>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Customize navigation links, announcement promo bar, 4 pillars of excellence, custom footer columns, and bottom copyright.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSaveHeaderFooter}
                      disabled={isSavingWebsite}
                      className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-neutral-950 font-bold px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider transition shadow-md"
                    >
                      {isSavingWebsite ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      <span>{isSavingWebsite ? 'Saving...' : 'Save Settings'}</span>
                    </button>
                  </div>
                </div>

                {/* Subtabs Bar */}
                <div className="flex items-center gap-2 overflow-x-auto pt-4 border-b border-neutral-800/80 -mx-6 px-6">
                  {[
                    { key: 'header', label: 'Header & Navigation', icon: Compass },
                    { key: 'announcement', label: 'Announcement Bar', icon: Bell },
                    { key: 'pillars', label: '4 Pillars of Excellence', icon: ShieldCheck },
                    { key: 'columns', label: 'Footer Link Columns', icon: FolderTree },
                    { key: 'brandStory', label: 'Brand, Newsletter & Bottom', icon: Tag },
                    { key: 'preview', label: 'Live Storefront Preview', icon: Eye }
                  ].map((sub) => {
                    const Icon = sub.icon;
                    const isActive = headerFooterSubTab === sub.key;
                    return (
                      <button
                        key={sub.key}
                        type="button"
                        onClick={() => setHeaderFooterSubTab(sub.key as typeof headerFooterSubTab)}
                        className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-t-lg text-xs font-semibold whitespace-nowrap transition border-b-2 -mb-[1px] ${
                          isActive
                            ? 'border-amber-500 text-amber-400 bg-neutral-800/60'
                            : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/30'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 1. HEADER & NAVIGATION SUBTAB */}
              {headerFooterSubTab === 'header' && (
                <div className="space-y-6">
                  {/* Header Behavior & Feature Buttons */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
                    <div>
                      <h3 className="font-serif font-bold text-base text-neutral-100 flex items-center space-x-2">
                        <Sliders className="w-4 h-4 text-amber-500" />
                        <span>Header Controls & Feature Action Buttons</span>
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Configure sticky behavior and toggle which action buttons appear in the top-right header corner.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                      <label className="flex items-start space-x-3 p-3.5 bg-neutral-950 border border-neutral-800 rounded-lg cursor-pointer hover:border-neutral-700 transition">
                        <input
                          type="checkbox"
                          checked={websiteForm.headerSticky !== false}
                          onChange={(e) => setWebsiteForm({ ...websiteForm, headerSticky: e.target.checked })}
                          className="mt-0.5 rounded bg-neutral-900 border-neutral-700 text-amber-500 focus:ring-0"
                        />
                        <div>
                          <span className="block text-xs font-bold text-neutral-200">Sticky Header</span>
                          <span className="text-[11px] text-neutral-400">Keep navigation bar pinned to top when scrolling</span>
                        </div>
                      </label>

                      <label className="flex items-start space-x-3 p-3.5 bg-neutral-950 border border-neutral-800 rounded-lg cursor-pointer hover:border-neutral-700 transition">
                        <input
                          type="checkbox"
                          checked={websiteForm.headerShowSearch !== false}
                          onChange={(e) => setWebsiteForm({ ...websiteForm, headerShowSearch: e.target.checked })}
                          className="mt-0.5 rounded bg-neutral-900 border-neutral-700 text-amber-500 focus:ring-0"
                        />
                        <div>
                          <span className="block text-xs font-bold text-neutral-200">Search Trigger Icon</span>
                          <span className="text-[11px] text-neutral-400">Show instant search modal trigger button</span>
                        </div>
                      </label>

                      <label className="flex items-start space-x-3 p-3.5 bg-neutral-950 border border-neutral-800 rounded-lg cursor-pointer hover:border-neutral-700 transition">
                        <input
                          type="checkbox"
                          checked={websiteForm.headerShowAccount !== false}
                          onChange={(e) => setWebsiteForm({ ...websiteForm, headerShowAccount: e.target.checked })}
                          className="mt-0.5 rounded bg-neutral-900 border-neutral-700 text-amber-500 focus:ring-0"
                        />
                        <div>
                          <span className="block text-xs font-bold text-neutral-200">Account / VIP Menu</span>
                          <span className="text-[11px] text-neutral-400">Show client login & account management dropdown</span>
                        </div>
                      </label>

                      <label className="flex items-start space-x-3 p-3.5 bg-neutral-950 border border-neutral-800 rounded-lg cursor-pointer hover:border-neutral-700 transition">
                        <input
                          type="checkbox"
                          checked={websiteForm.headerShowWishlist !== false}
                          onChange={(e) => setWebsiteForm({ ...websiteForm, headerShowWishlist: e.target.checked })}
                          className="mt-0.5 rounded bg-neutral-900 border-neutral-700 text-amber-500 focus:ring-0"
                        />
                        <div>
                          <span className="block text-xs font-bold text-neutral-200">Wishlist Trigger Icon</span>
                          <span className="text-[11px] text-neutral-400">Show heart icon with saved items badge</span>
                        </div>
                      </label>

                      <label className="flex items-start space-x-3 p-3.5 bg-neutral-950 border border-neutral-800 rounded-lg cursor-pointer hover:border-neutral-700 transition">
                        <input
                          type="checkbox"
                          checked={websiteForm.headerShowCart !== false}
                          onChange={(e) => setWebsiteForm({ ...websiteForm, headerShowCart: e.target.checked })}
                          className="mt-0.5 rounded bg-neutral-900 border-neutral-700 text-amber-500 focus:ring-0"
                        />
                        <div>
                          <span className="block text-xs font-bold text-neutral-200">Cart Drawer Trigger</span>
                          <span className="text-[11px] text-neutral-400">Show shopping bag icon with live item count badge</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Navigation Links Manager */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
                      <div>
                        <h3 className="font-serif font-bold text-base text-neutral-100 flex items-center space-x-2">
                          <Compass className="w-4 h-4 text-amber-500" />
                          <span>Navigation Menu Items ({(websiteForm.headerNavItems || DEFAULT_HEADER_NAV_ITEMS).length})</span>
                        </h3>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          Manage the desktop navigation bar and mobile drawer items. Reorder, edit, set highlight colors, and badges.
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={handleResetNavItems}
                          className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs transition border border-neutral-700/60"
                        >
                          Reset Defaults
                        </button>
                        <button
                          type="button"
                          onClick={handleOpenAddNav}
                          className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded text-xs font-bold transition shadow"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Nav Link</span>
                        </button>
                      </div>
                    </div>

                    {/* Nav Items List */}
                    <div className="space-y-2">
                      {(websiteForm.headerNavItems || DEFAULT_HEADER_NAV_ITEMS).map((item, idx, arr) => (
                        <div
                          key={item.id || idx}
                          className="flex items-center justify-between p-3.5 bg-neutral-950 border border-neutral-800 rounded-lg hover:border-neutral-700 transition"
                        >
                          <div className="flex items-center space-x-3.5">
                            <span className="w-6 h-6 rounded bg-neutral-900 text-neutral-500 text-xs font-mono flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className={`text-xs font-bold uppercase tracking-wider ${item.highlight ? 'text-red-400' : 'text-neutral-100'}`}>
                                  {item.label}
                                </span>
                                {item.highlight && (
                                  <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 text-[10px] font-semibold">
                                    Highlight: Red
                                  </span>
                                )}
                                {item.badge && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-semibold">
                                    Badge: {item.badge}
                                  </span>
                                )}
                                {item.openInNewTab && (
                                  <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 text-[10px]">
                                    New Tab
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-neutral-500 font-mono">
                                Route: {item.url || `/shop/${item.slug || ''}`}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveNavItem(idx, 'up')}
                              className="p-1.5 text-neutral-400 hover:text-neutral-100 disabled:opacity-30 disabled:hover:text-neutral-400 transition"
                              title="Move link up"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === arr.length - 1}
                              onClick={() => handleMoveNavItem(idx, 'down')}
                              className="p-1.5 text-neutral-400 hover:text-neutral-100 disabled:opacity-30 disabled:hover:text-neutral-400 transition"
                              title="Move link down"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditNav(idx)}
                              className="p-1.5 text-neutral-400 hover:text-amber-400 transition"
                              title="Edit link"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteNavItem(idx)}
                              className="p-1.5 text-neutral-400 hover:text-red-400 transition"
                              title="Delete link"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. ANNOUNCEMENT BAR SUBTAB */}
              {headerFooterSubTab === 'announcement' && (
                <div className="space-y-6">
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-5">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                      <div>
                        <h3 className="font-serif font-bold text-base text-neutral-100 flex items-center space-x-2">
                          <Bell className="w-4 h-4 text-amber-500" />
                          <span>Announcement Promo & Concierge Bar</span>
                        </h3>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          The dark header ribbon at the top of the storefront providing concierge hotline and delivery perks.
                        </p>
                      </div>

                      <label className="flex items-center space-x-2 text-xs text-neutral-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={websiteForm.headerAnnouncementEnabled !== false}
                          onChange={(e) => setWebsiteForm({ ...websiteForm, headerAnnouncementEnabled: e.target.checked })}
                          className="rounded bg-neutral-950 border-neutral-700 text-amber-500 focus:ring-0"
                        />
                        <span className="font-semibold text-neutral-200">Enable Announcement Bar</span>
                      </label>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs uppercase text-neutral-400 mb-1">
                          Announcement Promotional Text
                        </label>
                        <input
                          type="text"
                          value={websiteForm.headerAnnouncementText ?? 'Complimentary Dhaka Delivery on Orders Above ৳3,000'}
                          onChange={(e) => setWebsiteForm({ ...websiteForm, headerAnnouncementText: e.target.value })}
                          placeholder="e.g. Complimentary Dhaka Delivery on Orders Above ৳3,000"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs uppercase text-neutral-400 mb-1">
                            Concierge Hotline Number
                          </label>
                          <input
                            type="text"
                            value={websiteForm.headerHotline ?? '+880 9612-742462'}
                            onChange={(e) => setWebsiteForm({ ...websiteForm, headerHotline: e.target.value })}
                            placeholder="+880 9612-742462"
                            className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs uppercase text-neutral-400 mb-1">
                            Locator Link (Label & URL)
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={websiteForm.headerLocatorText ?? 'Atelier Locator'}
                              onChange={(e) => setWebsiteForm({ ...websiteForm, headerLocatorText: e.target.value })}
                              placeholder="Atelier Locator"
                              className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                            />
                            <input
                              type="text"
                              value={websiteForm.headerLocatorUrl ?? '/stores'}
                              onChange={(e) => setWebsiteForm({ ...websiteForm, headerLocatorUrl: e.target.value })}
                              placeholder="/stores"
                              className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500 font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs uppercase text-neutral-400 mb-1">
                            Track Order Link (Label & URL)
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={websiteForm.headerTrackOrderText ?? 'Track Order'}
                              onChange={(e) => setWebsiteForm({ ...websiteForm, headerTrackOrderText: e.target.value })}
                              placeholder="Track Order"
                              className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                            />
                            <input
                              type="text"
                              value={websiteForm.headerTrackOrderUrl ?? '/track-order'}
                              onChange={(e) => setWebsiteForm({ ...websiteForm, headerTrackOrderUrl: e.target.value })}
                              placeholder="/track-order"
                              className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500 font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Realtime Announcement Strip Preview */}
                      <div className="pt-4 border-t border-neutral-800">
                        <label className="block text-xs uppercase text-neutral-400 mb-2">Live Announcement Strip Preview</label>
                        <div className="bg-[#111111] text-neutral-300 text-[11px] p-2.5 rounded-lg border border-neutral-800 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-white">
                              <Phone className="w-3 h-3 text-[#D4AF37]" />
                              <span>Concierge:</span>
                              <span className="font-semibold">{websiteForm.headerHotline || '+880 9612-742462'}</span>
                            </span>
                            <span className="text-neutral-700">|</span>
                            <span className="text-neutral-400">{websiteForm.headerAnnouncementText || 'Complimentary Dhaka Delivery on Orders Above ৳3,000'}</span>
                          </div>
                          <div className="flex items-center gap-4 text-neutral-400">
                            <span className="flex items-center gap-1 hover:text-white cursor-pointer">
                              <MapPin className="w-3 h-3 text-[#D4AF37]" />
                              <span>{websiteForm.headerLocatorText || 'Atelier Locator'}</span>
                            </span>
                            <span className="flex items-center gap-1 hover:text-white cursor-pointer">
                              <CheckCircle className="w-3 h-3 text-[#D4AF37]" />
                              <span>{websiteForm.headerTrackOrderText || 'Track Order'}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. 4 PILLARS OF EXCELLENCE SUBTAB */}
              {headerFooterSubTab === 'pillars' && (
                <div className="space-y-6">
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
                      <div>
                        <h3 className="font-serif font-bold text-base text-neutral-100 flex items-center space-x-2">
                          <ShieldCheck className="w-4 h-4 text-amber-500" />
                          <span>Pillars of Excellence ({(websiteForm.footerPillars || DEFAULT_FOOTER_PILLARS).length})</span>
                        </h3>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          Featured in the footer showcase highlight bar (Complimentary Delivery, Master Tailoring, 7-Day Boutique Exchange, Dedicated Concierge).
                        </p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <label className="flex items-center space-x-2 text-xs text-neutral-300 cursor-pointer mr-2">
                          <input
                            type="checkbox"
                            checked={websiteForm.footerPillarsEnabled !== false}
                            onChange={(e) => setWebsiteForm({ ...websiteForm, footerPillarsEnabled: e.target.checked })}
                            className="rounded bg-neutral-950 border-neutral-700 text-amber-500 focus:ring-0"
                          />
                          <span className="font-semibold text-neutral-200">Show Pillars Bar</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleResetPillars}
                          className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs transition border border-neutral-700/60"
                        >
                          Reset Defaults
                        </button>
                        <button
                          type="button"
                          onClick={handleOpenAddPillar}
                          className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded text-xs font-bold transition shadow"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Pillar</span>
                        </button>
                      </div>
                    </div>

                    {/* Pillars Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(websiteForm.footerPillars || DEFAULT_FOOTER_PILLARS).map((pillar, idx, arr) => (
                        <div
                          key={pillar.id || idx}
                          className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3 relative group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400">
                                {pillar.icon === 'shield' ? <ShieldCheck className="w-5 h-5" /> :
                                 pillar.icon === 'refresh' ? <RefreshCw className="w-5 h-5" /> :
                                 pillar.icon === 'phone' ? <Phone className="w-5 h-5" /> :
                                 pillar.icon === 'star' ? <Star className="w-5 h-5" /> :
                                 pillar.icon === 'award' ? <Award className="w-5 h-5" /> :
                                 pillar.icon === 'clock' ? <Clock className="w-5 h-5" /> :
                                 pillar.icon === 'heart' ? <Heart className="w-5 h-5" /> :
                                 <Truck className="w-5 h-5" />}
                              </div>
                              <div>
                                <h4 className="text-xs uppercase tracking-wider font-bold text-neutral-100">
                                  {pillar.title}
                                </h4>
                                <span className="text-[10px] text-neutral-500 font-mono uppercase">
                                  Icon: {pillar.icon} · Pillar #{idx + 1}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMovePillar(idx, 'up')}
                                className="p-1 text-neutral-400 hover:text-neutral-100 disabled:opacity-20 transition"
                                title="Move pillar left/up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === arr.length - 1}
                                onClick={() => handleMovePillar(idx, 'down')}
                                className="p-1 text-neutral-400 hover:text-neutral-100 disabled:opacity-20 transition"
                                title="Move pillar right/down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditPillar(idx)}
                                className="p-1 text-neutral-400 hover:text-amber-400 transition"
                                title="Edit pillar"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePillar(idx)}
                                className="p-1 text-neutral-400 hover:text-red-400 transition"
                                title="Delete pillar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-neutral-400 leading-relaxed">
                            {pillar.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. FOOTER LINK COLUMNS SUBTAB */}
              {headerFooterSubTab === 'columns' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Column 1 */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                          Footer Link Group 1
                        </span>
                        <input
                          type="text"
                          value={websiteForm.footerCol1Title ?? 'Collections'}
                          onChange={(e) => setWebsiteForm({ ...websiteForm, footerCol1Title: e.target.value })}
                          placeholder="Column Title (e.g. Collections)"
                          className="block text-sm font-bold text-neutral-100 bg-transparent border-b border-dashed border-neutral-700 focus:border-amber-500 focus:outline-none mt-1"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenAddColLink('col1')}
                        className="flex items-center space-x-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold rounded text-xs transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Link</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(websiteForm.footerCol1Links || DEFAULT_FOOTER_COL1_LINKS).map((link, idx, arr) => (
                        <div
                          key={link.id || idx}
                          className="flex items-center justify-between p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg hover:border-neutral-700 transition"
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <span className={`text-xs font-semibold block truncate ${link.highlight ? 'text-red-400' : 'text-neutral-200'}`}>
                              {link.label}
                            </span>
                            <span className="text-[10px] text-neutral-500 font-mono block truncate">
                              {link.url}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1 shrink-0">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveColLink('col1', idx, 'up')}
                              className="p-1 text-neutral-400 hover:text-neutral-100 disabled:opacity-20 transition"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === arr.length - 1}
                              onClick={() => handleMoveColLink('col1', idx, 'down')}
                              className="p-1 text-neutral-400 hover:text-neutral-100 disabled:opacity-20 transition"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditColLink('col1', idx)}
                              className="p-1 text-neutral-400 hover:text-amber-400 transition"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteColLink('col1', idx)}
                              className="p-1 text-neutral-400 hover:text-red-400 transition"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                          Footer Link Group 2
                        </span>
                        <input
                          type="text"
                          value={websiteForm.footerCol2Title ?? 'Client Services'}
                          onChange={(e) => setWebsiteForm({ ...websiteForm, footerCol2Title: e.target.value })}
                          placeholder="Column Title (e.g. Client Services)"
                          className="block text-sm font-bold text-neutral-100 bg-transparent border-b border-dashed border-neutral-700 focus:border-amber-500 focus:outline-none mt-1"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenAddColLink('col2')}
                        className="flex items-center space-x-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold rounded text-xs transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Link</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(websiteForm.footerCol2Links || DEFAULT_FOOTER_COL2_LINKS).map((link, idx, arr) => (
                        <div
                          key={link.id || idx}
                          className="flex items-center justify-between p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg hover:border-neutral-700 transition"
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <span className={`text-xs font-semibold block truncate ${link.highlight ? 'text-red-400' : 'text-neutral-200'}`}>
                              {link.label}
                            </span>
                            <span className="text-[10px] text-neutral-500 font-mono block truncate">
                              {link.url}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1 shrink-0">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveColLink('col2', idx, 'up')}
                              className="p-1 text-neutral-400 hover:text-neutral-100 disabled:opacity-20 transition"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === arr.length - 1}
                              onClick={() => handleMoveColLink('col2', idx, 'down')}
                              className="p-1 text-neutral-400 hover:text-neutral-100 disabled:opacity-20 transition"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditColLink('col2', idx)}
                              className="p-1 text-neutral-400 hover:text-amber-400 transition"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteColLink('col2', idx)}
                              className="p-1 text-neutral-400 hover:text-red-400 transition"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 5. BRAND, NEWSLETTER & BOTTOM SUBTAB */}
              {headerFooterSubTab === 'brandStory' && (
                <div className="space-y-6">
                  {/* Brand Tagline & Bio */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
                    <h3 className="font-serif font-bold text-base text-neutral-100 flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-amber-500" />
                      <span>Footer Brand Column & Tagline</span>
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs uppercase text-neutral-400 mb-1">
                          Brand Slogan / Tagline
                        </label>
                        <input
                          type="text"
                          value={websiteForm.footerTagline ?? "The Gentleman's Wardrobe"}
                          onChange={(e) => setWebsiteForm({ ...websiteForm, footerTagline: e.target.value })}
                          placeholder="e.g. The Gentleman's Wardrobe"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs uppercase text-neutral-400 mb-1">
                          Brand Bio / Heritage Description
                        </label>
                        <textarea
                          rows={3}
                          value={websiteForm.footerAboutText ?? ''}
                          onChange={(e) => setWebsiteForm({ ...websiteForm, footerAboutText: e.target.value })}
                          placeholder="Short story about your atelier and luxury craftsmanship..."
                          className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Newsletter Settings */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                      <h3 className="font-serif font-bold text-base text-neutral-100 flex items-center space-x-2">
                        <Send className="w-4 h-4 text-amber-500" />
                        <span>Privilege Circle Newsletter Box</span>
                      </h3>
                      <label className="flex items-center space-x-2 text-xs text-neutral-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={websiteForm.footerNewsletterEnabled !== false}
                          onChange={(e) => setWebsiteForm({ ...websiteForm, footerNewsletterEnabled: e.target.checked })}
                          className="rounded bg-neutral-950 border-neutral-700 text-amber-500 focus:ring-0"
                        />
                        <span className="font-semibold text-neutral-200">Show Newsletter Box</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase text-neutral-400 mb-1">
                          Newsletter Headline
                        </label>
                        <input
                          type="text"
                          value={websiteForm.footerNewsletterTitle ?? 'Privilege Circle'}
                          onChange={(e) => setWebsiteForm({ ...websiteForm, footerNewsletterTitle: e.target.value })}
                          placeholder="e.g. Privilege Circle"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs uppercase text-neutral-400 mb-1">
                          Subtitle / Call to Action
                        </label>
                        <input
                          type="text"
                          value={websiteForm.footerNewsletterSubtitle ?? 'Receive private invitations to preview seasonal collections and bespoke trunk shows.'}
                          onChange={(e) => setWebsiteForm({ ...websiteForm, footerNewsletterSubtitle: e.target.value })}
                          placeholder="e.g. Receive private invitations to preview seasonal collections..."
                          className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Copyright & Payment Badges */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
                    <h3 className="font-serif font-bold text-base text-neutral-100 flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-amber-500" />
                      <span>Footer Bottom Bar, Copyright & Payment Badges</span>
                    </h3>

                    <div>
                      <label className="block text-xs uppercase text-neutral-400 mb-1">
                        Copyright Notice Template
                      </label>
                      <input
                        type="text"
                        value={websiteForm.footerCopyright ?? '© {year} {brand} Bangladesh. All rights reserved. Refined luxury menswear.'}
                        onChange={(e) => setWebsiteForm({ ...websiteForm, footerCopyright: e.target.value })}
                        placeholder="© {year} {brand} Bangladesh. All rights reserved."
                        className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-[11px] text-neutral-500 mt-1 block">
                        Tip: Use <code className="text-amber-400 font-mono">{'{year}'}</code> for current year and <code className="text-amber-400 font-mono">{'{brand}'}</code> for the active store brand name.
                      </span>
                    </div>

                    <div className="pt-2 border-t border-neutral-800 space-y-2">
                      <label className="block text-xs uppercase text-neutral-400">
                        Payment Method Badges
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        {(websiteForm.footerPaymentBadges || DEFAULT_FOOTER_PAYMENT_BADGES).map((badge, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center space-x-1.5 px-3 py-1 bg-neutral-950 border border-neutral-700 rounded text-xs text-neutral-200"
                          >
                            <span>{badge}</span>
                            <button
                              type="button"
                              onClick={() => handleRemovePaymentBadge(badge)}
                              className="text-neutral-500 hover:text-red-400 ml-1"
                              title={`Remove ${badge}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center space-x-2 max-w-sm pt-2">
                        <input
                          type="text"
                          value={newPaymentBadgeInput}
                          onChange={(e) => setNewPaymentBadgeInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddPaymentBadge();
                            }
                          }}
                          placeholder="e.g. Nagad or Amex"
                          className="flex-1 bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddPaymentBadge}
                          className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold rounded text-xs transition border border-neutral-700"
                        >
                          Add Badge
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. LIVE STOREFRONT PREVIEW SUBTAB */}
              {headerFooterSubTab === 'preview' && (
                <div className="space-y-6">
                  <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
                    <div className="p-3 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                        <span className="font-mono text-neutral-400 ml-2">Real-time Storefront Visual Preview</span>
                      </div>
                      <span className="text-[11px] text-amber-400 font-semibold">
                        Previewing Live Changes
                      </span>
                    </div>

                    {/* Preview: Announcement Bar */}
                    {websiteForm.headerAnnouncementEnabled !== false && (
                      <div className="bg-[#111111] text-neutral-300 text-[11px] px-6 py-2 border-b border-neutral-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-white">
                            <Phone className="w-3 h-3 text-[#D4AF37]" />
                            <span>Concierge:</span>
                            <span className="font-semibold">{websiteForm.headerHotline || '+880 9612-742462'}</span>
                          </span>
                          <span className="text-neutral-700">|</span>
                          <span className="text-neutral-400">{websiteForm.headerAnnouncementText || 'Complimentary Dhaka Delivery on Orders Above ৳3,000'}</span>
                        </div>
                        <div className="flex items-center gap-4 text-neutral-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#D4AF37]" />
                            <span>{websiteForm.headerLocatorText || 'Atelier Locator'}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-[#D4AF37]" />
                            <span>{websiteForm.headerTrackOrderText || 'Track Order'}</span>
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Preview: Main Header */}
                    <div className="bg-white text-neutral-900 px-6 py-4 flex items-center justify-between border-b border-neutral-200">
                      <div className="flex items-center space-x-3">
                        {websiteForm.logo ? (
                          <img
                            src={websiteForm.logo}
                            alt="Logo"
                            className="h-9 w-auto max-w-[150px] object-contain"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="font-serif text-2xl font-bold tracking-[0.18em] uppercase">
                            {websiteForm.website_name || websiteForm.websiteName || 'ZIPPY'}
                          </span>
                        )}
                      </div>

                      {/* Nav Links */}
                      <nav className="flex items-center gap-4 text-xs font-semibold tracking-wider text-neutral-700 overflow-x-auto">
                        {(websiteForm.headerNavItems || DEFAULT_HEADER_NAV_ITEMS).map((item, idx) => (
                          <span
                            key={idx}
                            className={`whitespace-nowrap uppercase inline-flex items-center gap-1 ${item.highlight ? 'text-[#B00020] font-bold' : ''}`}
                          >
                            <span>{item.label}</span>
                            {item.badge && (
                              <span className="text-[9px] bg-red-100 text-red-700 px-1 py-0.2 rounded font-bold">
                                {item.badge}
                              </span>
                            )}
                          </span>
                        ))}
                      </nav>

                      {/* Header Actions */}
                      <div className="flex items-center space-x-3 text-neutral-700">
                        {websiteForm.headerShowSearch !== false && <Search className="w-4 h-4" />}
                        {websiteForm.headerShowAccount !== false && <Users className="w-4 h-4" />}
                        {websiteForm.headerShowWishlist !== false && <Heart className="w-4 h-4" />}
                        {websiteForm.headerShowCart !== false && <ShoppingBag className="w-4 h-4" />}
                      </div>
                    </div>

                    {/* Preview Content Separator */}
                    <div className="p-8 bg-neutral-900/50 text-center text-xs text-neutral-500 font-mono">
                      [ — Storefront Main Body & Catalog Collections — ]
                    </div>

                    {/* Preview: Footer Pillars */}
                    {websiteForm.footerPillarsEnabled !== false && (
                      <div className="bg-[#111111] text-white p-6 border-t border-neutral-800">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                          {(websiteForm.footerPillars || DEFAULT_FOOTER_PILLARS).map((p, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="w-7 h-7 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#D4AF37] mb-1">
                                {p.icon === 'shield' ? <ShieldCheck className="w-3.5 h-3.5" /> :
                                 p.icon === 'refresh' ? <RefreshCw className="w-3.5 h-3.5" /> :
                                 p.icon === 'phone' ? <Phone className="w-3.5 h-3.5" /> :
                                 <Truck className="w-3.5 h-3.5" />}
                              </div>
                              <h5 className="text-[11px] font-bold uppercase text-neutral-200">{p.title}</h5>
                              <p className="text-[10px] text-neutral-400 line-clamp-2">{p.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Preview: Footer Main */}
                    <div className="bg-[#111111] text-white p-6 border-t border-neutral-800 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                          <span className="font-serif text-lg font-bold tracking-widest uppercase">
                            {websiteForm.website_name || websiteForm.websiteName || 'ZIPPY'}
                          </span>
                          <p className="text-[10px] text-[#D4AF37] uppercase tracking-wider">
                            {websiteForm.footerTagline || "The Gentleman's Wardrobe"}
                          </p>
                          <p className="text-[11px] text-neutral-400 line-clamp-3">
                            {websiteForm.footerAboutText || 'Founded on bespoke sartorial refinement...'}
                          </p>
                        </div>

                        <div>
                          <h5 className="text-[11px] font-bold uppercase text-neutral-200 mb-2">
                            {websiteForm.footerCol1Title || 'Collections'}
                          </h5>
                          <ul className="space-y-1 text-[11px] text-neutral-400">
                            {(websiteForm.footerCol1Links || DEFAULT_FOOTER_COL1_LINKS).slice(0, 5).map((l, i) => (
                              <li key={i} className={l.highlight ? 'text-red-400' : ''}>{l.label}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="text-[11px] font-bold uppercase text-neutral-200 mb-2">
                            {websiteForm.footerCol2Title || 'Client Services'}
                          </h5>
                          <ul className="space-y-1 text-[11px] text-neutral-400">
                            {(websiteForm.footerCol2Links || DEFAULT_FOOTER_COL2_LINKS).slice(0, 5).map((l, i) => (
                              <li key={i}>{l.label}</li>
                            ))}
                          </ul>
                        </div>

                        {websiteForm.footerNewsletterEnabled !== false && (
                          <div className="space-y-2">
                            <h5 className="text-[11px] font-bold uppercase text-neutral-200">
                              {websiteForm.footerNewsletterTitle || 'Privilege Circle'}
                            </h5>
                            <p className="text-[10px] text-neutral-400">
                              {websiteForm.footerNewsletterSubtitle || 'Receive private invitations...'}
                            </p>
                            <div className="bg-neutral-900 border border-neutral-800 p-2 rounded text-[10px] text-neutral-500">
                              [ customer@email.com ] [ Join ]
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Preview: Footer Bottom */}
                      <div className="mt-6 pt-4 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-neutral-500">
                        <span>
                          {(websiteForm.footerCopyright || '© {year} {brand} Bangladesh. All rights reserved.')
                            .replace('{year}', new Date().getFullYear().toString())
                            .replace('{brand}', websiteForm.website_name || websiteForm.websiteName || 'Zippy')}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {(websiteForm.footerPaymentBadges || DEFAULT_FOOTER_PAYMENT_BADGES).map((b, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 text-[9px] text-neutral-400">
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 20. WEBSITE SETTINGS */}
          {activeTab === 'Website Settings' && (
            <div className="max-w-4xl bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
                <div>
                  <h3 className="font-serif font-bold text-lg text-neutral-100">Global Website & Brand Settings</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Customize your brand logo, storefront name, CMS console branding, and business contact information.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setIsSavingWebsite(true);
                    try {
                      const updated = await api.updateSettings(websiteForm);
                      setSettings(updated);
                      setWebsiteForm(updated);
                      try {
                        localStorage.setItem('zippy_settings', JSON.stringify(updated));
                      } catch {
                        // ignore
                      }
                      showToast('Website & Brand settings saved successfully!');
                    } catch (err: unknown) {
                      showToast(err instanceof Error ? err.message : 'Error updating settings');
                    } finally {
                      setIsSavingWebsite(false);
                    }
                  }}
                  disabled={isSavingWebsite}
                  className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-neutral-950 font-bold px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider transition shadow-md self-start sm:self-auto"
                >
                  {isSavingWebsite ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{isSavingWebsite ? 'Saving...' : 'Save Settings'}</span>
                </button>
              </div>

              {/* Card 1: Website Logo */}
              <div className="bg-neutral-950/70 border border-neutral-800 rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs uppercase font-bold text-amber-400 tracking-wider">Storefront & Brand Logo</h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Displayed on the website header navigation, mobile drawer, invoices, and system emails.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="p-3 bg-neutral-900 border border-neutral-700 rounded-lg flex items-center justify-center min-w-[160px] h-20">
                    {websiteForm.logo ? (
                      <img
                        src={websiteForm.logo}
                        alt="Logo preview"
                        className="max-h-14 max-w-[140px] object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="text-center text-neutral-500 text-xs">
                        <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                        <span>No Logo Set</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2.5 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenMediaPicker('websiteLogo')}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-400 rounded text-xs font-medium border border-neutral-700 transition"
                      >
                        <Folder className="w-3.5 h-3.5" />
                        <span>Choose From Store Media</span>
                      </button>

                      <label className="flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs font-medium border border-neutral-700 transition cursor-pointer">
                        <Upload className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Upload From Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await uploadLocalFileToStoreMedia(file, 'general');
                              if (url) {
                                setWebsiteForm((prev) => ({ ...prev, logo: url }));
                              }
                            }
                            e.target.value = '';
                          }}
                        />
                      </label>

                      {websiteForm.logo && (
                        <button
                          type="button"
                          onClick={() => setWebsiteForm({ ...websiteForm, logo: '' })}
                          className="text-xs text-neutral-400 hover:text-red-400 px-2 py-1.5 transition"
                        >
                          Remove Logo
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={websiteForm.logo || ''}
                      onChange={(e) => setWebsiteForm({ ...websiteForm, logo: e.target.value })}
                      placeholder="Logo URL e.g. /logo.svg or https://..."
                      className="w-full bg-neutral-900 border border-neutral-700 focus:border-amber-500 rounded px-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Website Favicon */}
              <div className="bg-neutral-950/70 border border-neutral-800 rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs uppercase font-bold text-amber-400 tracking-wider">Browser Favicon & App Icon</h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Small browser tab icon (.ico, .png, or .svg). Displayed next to the page title in browser tabs, bookmarks, and mobile home screens.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="p-3 bg-neutral-900 border border-neutral-700 rounded-lg flex items-center justify-center min-w-[80px] w-20 h-20">
                    {websiteForm.favicon ? (
                      <img
                        src={websiteForm.favicon}
                        alt="Favicon preview"
                        className="w-10 h-10 object-contain rounded"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="text-center text-neutral-500 text-[10px]">
                        <Globe className="w-6 h-6 mx-auto mb-1 opacity-50" />
                        <span>No Icon</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2.5 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenMediaPicker('websiteFavicon')}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-400 rounded text-xs font-medium border border-neutral-700 transition"
                      >
                        <Folder className="w-3.5 h-3.5" />
                        <span>Choose From Store Media</span>
                      </button>

                      <label className="flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs font-medium border border-neutral-700 transition cursor-pointer">
                        <Upload className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Upload From Device</span>
                        <input
                          type="file"
                          accept=".ico,image/x-icon,image/png,image/svg+xml,image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await uploadLocalFileToStoreMedia(file, 'general');
                              if (url) {
                                setWebsiteForm((prev) => ({ ...prev, favicon: url }));
                              }
                            }
                            e.target.value = '';
                          }}
                        />
                      </label>

                      {websiteForm.favicon && (
                        <button
                          type="button"
                          onClick={() => setWebsiteForm({ ...websiteForm, favicon: '' })}
                          className="text-xs text-neutral-400 hover:text-red-400 px-2 py-1.5 transition"
                        >
                          Remove Favicon
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={websiteForm.favicon || ''}
                      onChange={(e) => setWebsiteForm({ ...websiteForm, favicon: e.target.value })}
                      placeholder="Favicon URL e.g. /favicon.ico or https://..."
                      className="w-full bg-neutral-900 border border-neutral-700 focus:border-amber-500 rounded px-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Brand Identity & Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neutral-950/70 p-4 rounded-lg border border-neutral-800 space-y-2">
                  <label className="block text-xs uppercase font-semibold text-amber-400">
                    Backend CMS Console Name
                  </label>
                  <input
                    type="text"
                    value={websiteForm.backend_name || websiteForm.backendName || ''}
                    onChange={(e) =>
                      setWebsiteForm({
                        ...websiteForm,
                        backend_name: e.target.value,
                        backendName: e.target.value
                      })
                    }
                    placeholder="e.g. ZIPPY CMS"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 font-bold"
                  />
                  <p className="text-[11px] text-neutral-500">Displayed in sidebar header, admin login screen, and CMS title bar.</p>
                </div>

                <div className="bg-neutral-950/70 p-4 rounded-lg border border-neutral-800 space-y-2">
                  <label className="block text-xs uppercase font-semibold text-amber-400">
                    Frontend Storefront Name
                  </label>
                  <input
                    type="text"
                    value={websiteForm.website_name || websiteForm.websiteName || ''}
                    onChange={(e) =>
                      setWebsiteForm({
                        ...websiteForm,
                        website_name: e.target.value,
                        websiteName: e.target.value
                      })
                    }
                    placeholder="e.g. Zippy Bespoke Atelier"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 font-bold"
                  />
                  <p className="text-[11px] text-neutral-500">Displayed on the customer-facing storefront header, emails, and invoices.</p>
                </div>
              </div>

              {/* Card 3: Contact & Store Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={websiteForm.email || ''}
                    onChange={(e) => setWebsiteForm({ ...websiteForm, email: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={websiteForm.phone || ''}
                    onChange={(e) => setWebsiteForm({ ...websiteForm, phone: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Store Currency</label>
                  <input
                    type="text"
                    value={websiteForm.currency || ''}
                    onChange={(e) => setWebsiteForm({ ...websiteForm, currency: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">Bespoke Atelier Address</label>
                <input
                  type="text"
                  value={websiteForm.address || ''}
                  onChange={(e) => setWebsiteForm({ ...websiteForm, address: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Card 6: AI Atelier Intelligence & Copilot Subsystem */}
              <div className="bg-neutral-950/70 border border-neutral-800 rounded-lg p-5 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-serif font-bold text-neutral-100">AI Atelier Intelligence & Copilot Subsystem</h4>
                      <p className="text-[11px] text-neutral-400">
                        Configure Google Gemini, OpenAI, or the built-in bespoke fashion engine powering styling chatbots, copy generation & inquiries.
                      </p>
                    </div>
                  </div>
                  <div>
                    {aiStatusData?.status === 'active' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>API KEY ACTIVE ({aiSettingsData.provider.toUpperCase()})</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        <span>DOMAIN ENGINE ACTIVE</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Provider & Model Selectors */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs uppercase text-neutral-400 mb-1">AI Provider</label>
                    <select
                      value={aiSettingsData.provider}
                      onChange={(e) => {
                        const nextProv = e.target.value as 'gemini' | 'openai' | 'mock';
                        setAiSettingsData({
                          ...aiSettingsData,
                          provider: nextProv,
                          model: nextProv === 'openai' ? 'gpt-4o' : nextProv === 'gemini' ? 'gemini-3.1-pro' : 'atelier-domain'
                        });
                      }}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                    >
                      <option value="gemini">Google Gemini (Recommended)</option>
                      <option value="openai">OpenAI (ChatGPT)</option>
                      <option value="mock">Atelier Domain Engine (Offline)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs uppercase text-neutral-400">Active Model</label>
                      {aiSettingsData.provider === 'gemini' && (
                        <span className="text-[10px] text-amber-400 font-semibold px-1.5 py-0.5 bg-amber-500/10 rounded border border-amber-500/20">
                          Gemini 3.1+ Ready
                        </span>
                      )}
                    </div>
                    <select
                      value={aiSettingsData.model || ''}
                      onChange={(e) => setAiSettingsData({ ...aiSettingsData, model: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                    >
                      {aiSettingsData.provider === 'openai' ? (
                        <>
                          <optgroup label="Higher Reasoning & Flagship Models">
                            <option value="gpt-4o">gpt-4o (Omni Flagship Creative)</option>
                            <option value="o3-mini">o3-mini (Frontier Reasoning)</option>
                            <option value="o1">o1 (Frontier Deep Reasoning)</option>
                          </optgroup>
                          <optgroup label="Standard / Fast Models">
                            <option value="gpt-4o-mini">gpt-4o-mini (Fast & Cost Efficient)</option>
                          </optgroup>
                        </>
                      ) : aiSettingsData.provider === 'gemini' ? (
                        <>
                          <optgroup label="👑 Gemini 3.1 & Up (Pinnacle Frontier Generation)">
                            <option value="gemini-3.1-pro">gemini-3.1-pro (Pinnacle Autonomous Reasoning & Style)</option>
                            <option value="gemini-3.1-flash">gemini-3.1-flash (Pinnacle Real-Time Frontier Speed)</option>
                            <option value="gemini-3.5-pro">gemini-3.5-pro (Ultra-Extended Cognitive Architecture)</option>
                            <option value="gemini-3.0-pro">gemini-3.0-pro (Advanced Multimodal Frontier)</option>
                            <option value="gemini-3.0-flash">gemini-3.0-flash (Real-Time Multimodal Flagship)</option>
                          </optgroup>
                          <optgroup label="⭐ Gemini 2.5 Series (High Capability)">
                            <option value="gemini-2.5-pro">gemini-2.5-pro (Flagship Deep Reasoning & Planning)</option>
                            <option value="gemini-2.5-flash">gemini-2.5-flash (Next-Gen Flagship Speed & Reasoning)</option>
                          </optgroup>
                          <optgroup label="Gemini 2.0 & 1.5 Series">
                            <option value="gemini-2.0-pro">gemini-2.0-pro (Advanced Frontier Multimodal)</option>
                            <option value="gemini-2.0-flash">gemini-2.0-flash (Next-Gen Fast & Multimodal)</option>
                            <option value="gemini-1.5-pro">gemini-1.5-pro (Deep Reasoning & 2M Context)</option>
                            <option value="gemini-1.5-flash">gemini-1.5-flash (Lightning Fast Baseline)</option>
                          </optgroup>
                        </>
                      ) : (
                        <option value="atelier-domain">atelier-domain (In-Memory Sartorial Rules)</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-neutral-400 mb-1">
                      {aiSettingsData.provider === 'openai' ? 'OpenAI API Key' : 'Gemini API Key'}
                    </label>
                    <input
                      type="password"
                      value={aiKeyInput}
                      onChange={(e) => setAiKeyInput(e.target.value)}
                      placeholder={aiSettingsData.apiKey || 'Enter API Key (or use .env)'}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                {/* Model Capability & Custom Model Input */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-neutral-950/80 rounded border border-neutral-800 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-amber-400 font-semibold px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[11px]">
                      {aiSettingsData.model || 'gemini-3.1-pro'}
                    </span>
                    <span className="text-neutral-400 text-[11px]">
                      {aiSettingsData.model?.includes('3.1-pro') || aiSettingsData.model?.includes('3.5')
                        ? '👑 Google Gemini 3.1+ Pinnacle Frontier — Autonomous multi-step reasoning, flawless creative direction & bespoke sartorial nuance.'
                        : aiSettingsData.model?.includes('3.1-flash')
                        ? '⚡ Gemini 3.1 Flash — Pinnacle high-speed multimodal reasoning & instant real-time intelligence.'
                        : aiSettingsData.model?.includes('3.0')
                        ? '🚀 Gemini 3.0 Series — Advanced cognitive architecture & high-throughput frontier reasoning.'
                        : aiSettingsData.model?.includes('2.5-pro')
                        ? '🏆 Google Flagship Highest-Capability Frontier Model — Deep multimodal reasoning & luxury nuance.'
                        : aiSettingsData.model?.includes('2.5-flash')
                        ? '⚡ Next-Gen Flagship Speed & High-Intelligence Reasoning.'
                        : aiSettingsData.model?.includes('2.0-pro')
                        ? '🚀 Frontier Multimodal & Multi-Turn Sartorial Agent Reasoning.'
                        : aiSettingsData.model?.includes('2.0-flash')
                        ? '⚡ Next-Gen Ultra-Fast Multimodal Real-Time Assistant.'
                        : aiSettingsData.model?.includes('1.5-pro')
                        ? '🧠 Deep Reasoning with up to 2M Token Context Window.'
                        : aiSettingsData.model?.includes('4o')
                        ? '✨ OpenAI Flagship High Precision & Creative Generation.'
                        : 'Standard High-Speed Baseline.'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-neutral-500 text-[11px]">Custom Model:</span>
                    <input
                      type="text"
                      value={aiSettingsData.model || ''}
                      onChange={(e) => setAiSettingsData({ ...aiSettingsData, model: e.target.value.trim() })}
                      placeholder="Type custom model ID..."
                      className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-200 font-mono focus:outline-none focus:border-amber-500 w-44"
                    />
                  </div>
                </div>

                {/* System Prompt / Persona */}
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">
                    Atelier Stylist Persona & System Prompt
                  </label>
                  <textarea
                    rows={2}
                    value={aiSettingsData.systemPrompt || ''}
                    onChange={(e) => setAiSettingsData({ ...aiSettingsData, systemPrompt: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Feature Toggles */}
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-2">Enabled AI Copilot Capabilities</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { key: 'stylistChat', label: 'Bespoke Stylist Chat' },
                      { key: 'productCopy', label: 'Product Copywriter' },
                      { key: 'seoGeneration', label: 'SEO Tags Generator' },
                      { key: 'inquiryAutoReply', label: 'Inquiry Reply Assistant' },
                      { key: 'chatAutoReply', label: 'Live Chat AI Auto-Reply' },
                      { key: 'reviewAnalysis', label: 'Review Sentiment Analysis' },
                      { key: 'recommendations', label: 'Garment Pairing Engine' }
                    ].map((feat) => {
                      const enabled = (aiSettingsData.features as any)?.[feat.key] !== false;
                      return (
                        <label key={feat.key} className="flex items-center space-x-2 text-xs text-neutral-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) =>
                              setAiSettingsData({
                                ...aiSettingsData,
                                features: {
                                  ...aiSettingsData.features,
                                  [feat.key]: e.target.checked
                                }
                              })
                            }
                            className="rounded bg-neutral-900 border-neutral-700 text-amber-500 focus:ring-0"
                          />
                          <span>{feat.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Live AI Playground Tester */}
                <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Live Atelier AI Playground</span>
                    <button
                      type="button"
                      onClick={handleTestAiChat}
                      disabled={isTestingAi || !aiTestPrompt.trim()}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-neutral-950 font-bold rounded text-xs transition"
                    >
                      {isTestingAi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span>{isTestingAi ? 'Generating...' : 'Test AI Prompt'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={aiTestPrompt}
                    onChange={(e) => setAiTestPrompt(e.target.value)}
                    placeholder="Ask stylist something..."
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-neutral-100"
                  />
                  {aiTestResponse && (
                    <div className="p-3 bg-neutral-950 rounded border border-neutral-800 text-xs text-neutral-300 leading-relaxed max-h-36 overflow-y-auto">
                      <p className="text-[10px] text-amber-400 font-mono mb-1">STYLING CONCIERGE RESPONSE:</p>
                      {aiTestResponse}
                    </div>
                  )}
                </div>

                {/* AI Autonomous Operations — Interactive Command Terminal */}
                <div className="bg-neutral-950 border border-amber-500/20 rounded-xl overflow-hidden shadow-2xl">
                  {/* Terminal Title Bar */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 border-b border-neutral-800">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      </div>
                      <div className="flex items-center space-x-1.5 ml-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs font-bold text-amber-400 font-mono tracking-wide">AI COMMAND TERMINAL</span>
                        <span className="text-[10px] text-neutral-600 font-mono">— atelier-ops v2.0</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {/* Session Stats */}
                      <div className="flex items-center space-x-3 text-[10px] font-mono">
                        <span className="text-neutral-600">
                          <span className="text-emerald-400">{aiTerminalHistory.filter(h => h.status === 'success').length}</span> ok
                        </span>
                        <span className="text-neutral-600">
                          <span className="text-amber-400">{aiTerminalHistory.filter(h => h.status === 'preview').length}</span> preview
                        </span>
                        <span className="text-neutral-600">
                          <span className="text-red-400">{aiTerminalHistory.filter(h => h.status === 'error').length}</span> err
                        </span>
                      </div>
                      {/* Dry-run toggle */}
                      <label className="flex items-center space-x-1.5 cursor-pointer select-none">
                        <div
                          onClick={() => setAiTerminalDryRun(p => !p)}
                          className={`relative w-7 h-4 rounded-full transition-colors cursor-pointer ${
                            aiTerminalDryRun ? 'bg-amber-500' : 'bg-neutral-700'
                          }`}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${
                            aiTerminalDryRun ? 'translate-x-3' : 'translate-x-0'
                          }`} />
                        </div>
                        <span className={`text-[10px] font-mono font-bold ${
                          aiTerminalDryRun ? 'text-amber-400' : 'text-neutral-500'
                        }`}>DRY-RUN</span>
                      </label>
                      {/* Clear button */}
                      <button
                        type="button"
                        onClick={() => setAiTerminalHistory([])}
                        title="Clear terminal (Ctrl+L)"
                        className="text-[10px] font-mono text-neutral-600 hover:text-neutral-300 transition px-1.5 py-0.5 rounded border border-neutral-800 hover:border-neutral-600"
                      >
                        clear
                      </button>
                    </div>
                  </div>

                  {/* Terminal Output Area */}
                  <div
                    ref={aiTerminalOutputRef}
                    className="h-72 overflow-y-auto px-4 py-3 space-y-3 font-mono text-xs"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#404040 transparent' }}
                    onClick={() => aiTerminalInputRef.current?.focus()}
                  >
                    {/* Welcome banner when empty */}
                    {aiTerminalHistory.length === 0 && (
                      <div className="space-y-1 text-neutral-600 select-none">
                        <p className="text-amber-500/60">╔══════════════════════════════════════════════════╗</p>
                        <p className="text-amber-500/60">║  🌟 Atelier AI Operations Terminal  v2.0         ║</p>
                        <p className="text-amber-500/60">╚══════════════════════════════════════════════════╝</p>
                        <p className="text-neutral-600 mt-2">Type any natural language command and press <span className="text-neutral-400">Enter</span>.</p>
                        <p className="text-neutral-600">↑ / ↓ — navigate history &nbsp;·&nbsp; Ctrl+L — clear &nbsp;·&nbsp; toggle DRY-RUN to preview only</p>
                        <div className="mt-3 space-y-1">
                          <p className="text-neutral-500">— Quick examples (click to load):</p>
                          {[
                            'Upload product: Emerald Green Silk Panjabi, price 18500, sizes M, L, XL',
                            'Apply 15% discount on prod-01 and restock size XL to 20 units',
                            'Update announcement: Grand Eid Collection 2026 now live — Free delivery over ৳3,000',
                            'Set banner: headline "Bespoke Wedding Season", button "Shop Now" link /shop',
                          ].map((ex, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => { setAiTerminalInput(ex); aiTerminalInputRef.current?.focus(); }}
                              className="block w-full text-left text-neutral-500 hover:text-amber-400 transition truncate pl-2"
                            >
                              <span className="text-neutral-700">$</span> {ex}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Command History Entries */}
                    {aiTerminalHistory.map((entry) => (
                      <div key={entry.id} className="space-y-1.5">
                        {/* Input line */}
                        <div className="flex items-start space-x-2">
                          <span className="text-neutral-600 shrink-0 tabular-nums">{entry.ts}</span>
                          <span className="text-amber-500 shrink-0">$</span>
                          <span className="text-neutral-100 break-all leading-relaxed">{entry.input}</span>
                          {entry.dryRun && (
                            <span className="shrink-0 text-[9px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold">DRY-RUN</span>
                          )}
                        </div>
                        {/* Running */}
                        {entry.status === 'running' && (
                          <div className="flex items-center space-x-2 pl-24 text-neutral-500">
                            <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                            <span className="text-amber-400/70">Processing command...</span>
                          </div>
                        )}
                        {/* Success or Preview */}
                        {(entry.status === 'success' || entry.status === 'preview') && (
                          <div className={`ml-24 p-2.5 rounded-lg border space-y-1 ${
                            entry.status === 'preview'
                              ? 'bg-amber-500/5 border-amber-500/25'
                              : 'bg-emerald-500/5 border-emerald-500/25'
                          }`}>
                            <div className="flex items-center space-x-2">
                              <span className={`text-[10px] font-bold uppercase tracking-widest ${
                                entry.status === 'preview' ? 'text-amber-400' : 'text-emerald-400'
                              }`}>
                                {entry.status === 'preview' ? '◎ PREVIEW' : '✓ EXECUTED'}
                              </span>
                              {entry.type && (
                                <span className="text-[10px] text-neutral-500">{entry.type}</span>
                              )}
                            </div>
                            <p className="text-neutral-300 leading-relaxed text-[11px]">{entry.summary}</p>
                            {entry.data && (
                              <details className="mt-1">
                                <summary className="text-[10px] text-neutral-600 hover:text-neutral-400 cursor-pointer select-none">Show raw output ▸</summary>
                                <pre className="mt-1.5 text-[10px] text-neutral-500 overflow-x-auto max-h-32 bg-black/30 rounded p-2 leading-relaxed">
                                  {JSON.stringify(entry.data, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        )}
                        {/* Error */}
                        {entry.status === 'error' && (
                          <div className="ml-24 p-2.5 rounded-lg border bg-red-500/5 border-red-500/25 space-y-0.5">
                            <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">✗ ERROR</span>
                            <p className="text-red-300/80 text-[11px] leading-relaxed">{entry.summary}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Prompt Input Bar */}
                  <div className="flex items-center px-4 py-2.5 bg-neutral-900 border-t border-neutral-800 gap-2">
                    <span className="text-amber-500 font-mono text-sm shrink-0">$</span>
                    <input
                      ref={aiTerminalInputRef}
                      id="ai-terminal-input"
                      type="text"
                      value={aiTerminalInput}
                      onChange={(e) => { setAiTerminalInput(e.target.value); setAiTerminalHistoryIdx(-1); }}
                      onKeyDown={handleAiTerminalKeyDown}
                      placeholder={isExecutingAiTerminal ? 'Running...' : 'Type a command and press Enter  (↑↓ history · Ctrl+L clear · toggle DRY-RUN above)'}
                      disabled={isExecutingAiTerminal}
                      autoComplete="off"
                      spellCheck={false}
                      className="flex-1 bg-transparent border-none outline-none text-neutral-100 font-mono text-xs placeholder-neutral-700 disabled:opacity-40"
                    />
                    {isExecutingAiTerminal ? (
                      <RefreshCw className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                    ) : (
                      <button
                        type="button"
                        onClick={handleRunAiTerminalCommand}
                        disabled={!aiTerminalInput.trim()}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-30 text-neutral-950 font-bold rounded text-[11px] transition shrink-0 cursor-pointer active:scale-95"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Run</span>
                      </button>
                    )}
                  </div>

                  {/* Quick Command Chips */}
                  <div className="flex flex-wrap gap-1.5 px-4 pb-3 pt-2 border-t border-neutral-900">
                    <span className="text-[10px] text-neutral-700 font-mono self-center">quick:</span>
                    {[
                      { label: '📦 Upload Product', cmd: 'Upload product: Royal Blue Silk Panjabi, price 9500, sizes M, L, XL' },
                      { label: '⚙️ Apply Discount', cmd: 'Apply 15% discount on prod-01 and restock all sizes to 20' },
                      { label: '📝 Announcement', cmd: 'Update announcement: Eid 2026 Bespoke Collection — Free delivery over ৳3,000' },
                      { label: '🎯 Hero Banner', cmd: 'Set hero banner: headline "Grand Wedding Season", button "Explore Collection" link /shop' },
                      { label: '🏷️ Sale Price', cmd: 'Set sale price 14500 for product prod-01' },
                      { label: '📋 Archive Product', cmd: 'Set prod-01 status to archived' },
                    ].map((chip, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => { setAiTerminalInput(chip.cmd); aiTerminalInputRef.current?.focus(); }}
                        className="text-[10px] font-mono px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-500 hover:text-neutral-200 rounded border border-neutral-800 hover:border-neutral-600 transition"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveAiSettings}
                    disabled={isSavingAi}
                    className="flex items-center space-x-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-amber-400 font-bold px-4 py-2 rounded text-xs transition"
                  >
                    {isSavingAi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Save AI Settings</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    setIsSavingWebsite(true);
                    try {
                      const updated = await api.updateSettings(websiteForm);
                      setSettings(updated);
                      setWebsiteForm(updated);
                      try {
                        localStorage.setItem('zippy_settings', JSON.stringify(updated));
                      } catch {
                        // ignore
                      }
                      showToast('Website & Brand settings saved successfully!');
                    } catch (err: unknown) {
                      showToast(err instanceof Error ? err.message : 'Error updating settings');
                    } finally {
                      setIsSavingWebsite(false);
                    }
                  }}
                  disabled={isSavingWebsite}
                  className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-neutral-950 font-bold px-6 py-2.5 rounded-lg text-sm uppercase tracking-wider transition shadow-md"
                >
                  {isSavingWebsite ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{isSavingWebsite ? 'Saving...' : 'Save Website & Backend Settings'}</span>
                </button>
              </div>
            </div>
          )}

          {/* 21. SEO SETTINGS */}
          {activeTab === 'SEO Settings' && (
            <div className="space-y-8 max-w-7xl">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                      <Globe className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-serif font-bold text-neutral-100">Search Engine Optimization (SEO)</h2>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Fine-tune search rankings, OpenGraph social cards, search crawler indexability, and URL 301/302 redirects.
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <a
                    href="/api/seo/sitemap.xml"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-2 px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg text-xs font-medium border border-neutral-700 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View XML Sitemap</span>
                  </a>
                  <button
                    onClick={() => handleSaveSeo()}
                    disabled={isSavingSeo}
                    className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-neutral-950 font-bold px-5 py-2 rounded-lg text-xs uppercase tracking-wider transition shadow-md"
                  >
                    {isSavingSeo ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>{isSavingSeo ? 'Saving...' : 'Save SEO Settings'}</span>
                  </button>
                </div>
              </div>

              {/* Two Column Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Left Column: Form Fields */}
                <div className="xl:col-span-7 space-y-6">
                  {/* Card 1: Core Search Metadata */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-5">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                      <h3 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider">
                        Core Search Metadata
                      </h3>
                      <span className="text-[11px] text-neutral-500">Google SERP & Meta Tags</span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-medium text-neutral-300">
                          Meta Title Tag <span className="text-red-400">*</span>
                        </label>
                        <span
                          className={`text-[11px] font-mono ${
                            seoForm.metaTitle.length > 60
                              ? 'text-amber-400'
                              : seoForm.metaTitle.length < 30
                              ? 'text-neutral-500'
                              : 'text-emerald-400'
                          }`}
                        >
                          {seoForm.metaTitle.length} / 60 chars (recommended: 40-60)
                        </span>
                      </div>
                      <input
                        type="text"
                        value={seoForm.metaTitle}
                        onChange={(e) => setSeoForm({ ...seoForm, metaTitle: e.target.value })}
                        placeholder="e.g. Zippy | Gentleman's Bespoke Fashion Atelier"
                        className="w-full bg-neutral-950 border border-neutral-700 focus:border-amber-500 rounded-lg px-3.5 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none transition"
                      />
                      <p className="text-[11px] text-neutral-500 mt-1">
                        Shown as the clickable headline in search engine result pages.
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-medium text-neutral-300">
                          Meta Description Tag <span className="text-red-400">*</span>
                        </label>
                        <span
                          className={`text-[11px] font-mono ${
                            seoForm.metaDescription.length > 160
                              ? 'text-amber-400'
                              : seoForm.metaDescription.length < 50
                              ? 'text-neutral-500'
                              : 'text-emerald-400'
                          }`}
                        >
                          {seoForm.metaDescription.length} / 160 chars (recommended: 120-160)
                        </span>
                      </div>
                      <textarea
                        value={seoForm.metaDescription}
                        onChange={(e) => setSeoForm({ ...seoForm, metaDescription: e.target.value })}
                        rows={3}
                        placeholder="e.g. Premium handcrafted menswear, bespoke suits, blazers, and panjabis in Dhaka."
                        className="w-full bg-neutral-950 border border-neutral-700 focus:border-amber-500 rounded-lg px-3.5 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none transition leading-relaxed"
                      />
                      <p className="text-[11px] text-neutral-500 mt-1">
                        Snippet summary displayed underneath your title link in Google and Bing.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                        Meta Keywords
                      </label>
                      <input
                        type="text"
                        value={seoForm.metaKeywords}
                        onChange={(e) => setSeoForm({ ...seoForm, metaKeywords: e.target.value })}
                        placeholder="e.g. menswear, suits, blazers, panjabi, dhaka, bangladesh"
                        className="w-full bg-neutral-950 border border-neutral-700 focus:border-amber-500 rounded-lg px-3.5 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none transition"
                      />
                      <p className="text-[11px] text-neutral-500 mt-1">
                        Comma-separated keywords for search queries and catalog indexing.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                          Canonical URL
                        </label>
                        <input
                          type="url"
                          value={seoForm.canonicalUrl || ''}
                          onChange={(e) => setSeoForm({ ...seoForm, canonicalUrl: e.target.value })}
                          placeholder="https://zippy.com.bd"
                          className="w-full bg-neutral-950 border border-neutral-700 focus:border-amber-500 rounded-lg px-3.5 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none transition font-mono text-xs"
                        />
                        <p className="text-[11px] text-neutral-500 mt-1">
                          The authoritative master URL for your store homepage.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                          Robots Indexing Directive
                        </label>
                        <select
                          value={seoForm.robots || 'index, follow'}
                          onChange={(e) => setSeoForm({ ...seoForm, robots: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-700 focus:border-amber-500 rounded-lg px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none transition"
                        >
                          <option value="index, follow">index, follow (Standard & Recommended)</option>
                          <option value="noindex, follow">noindex, follow (Hide page, follow links)</option>
                          <option value="index, nofollow">index, nofollow (Index page, ignore links)</option>
                          <option value="noindex, nofollow">noindex, nofollow (Completely de-index)</option>
                        </select>
                        <p className="text-[11px] text-neutral-500 mt-1">
                          Instructs search engine crawlers whether to index this site.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Social Media & OpenGraph (OG) Card */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-5">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider">
                          Social Media & OpenGraph (OG)
                        </h3>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          Visual banner image displayed when sharing store links on Facebook, WhatsApp, LinkedIn, and X.
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-2">
                        OpenGraph Share Banner Image (1200 x 630 px)
                      </label>

                      {seoForm.openGraphImage ? (
                        <div className="relative rounded-lg overflow-hidden border border-neutral-700 bg-neutral-950 max-w-lg mb-3 group">
                          <img
                            src={seoForm.openGraphImage}
                            alt="Social Share Preview"
                            className="w-full h-44 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1200';
                            }}
                          />
                          <div className="absolute inset-0 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-3">
                            <button
                              type="button"
                              onClick={() => handleOpenMediaPicker('seoOgImage')}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded text-xs font-bold transition flex items-center space-x-1"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>Change</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSeoForm({ ...seoForm, openGraphImage: '' })}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition flex items-center space-x-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-neutral-800 rounded-lg p-6 text-center max-w-lg mb-3">
                          <ImageIcon className="w-8 h-8 mx-auto text-neutral-600 mb-2" />
                          <p className="text-xs text-neutral-400">No OpenGraph image configured</p>
                          <p className="text-[11px] text-neutral-600 mt-0.5">Select from Store Media or upload an image from your device</p>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <button
                          type="button"
                          onClick={() => handleOpenMediaPicker('seoOgImage')}
                          className="flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-400 rounded-lg text-xs font-medium border border-neutral-700 transition"
                        >
                          <Folder className="w-3.5 h-3.5" />
                          <span>Choose Store Media</span>
                        </button>

                        <label className="flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium border border-neutral-700 transition cursor-pointer">
                          <Upload className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Upload From Device</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = await uploadLocalFileToStoreMedia(file, 'seo');
                                if (url) {
                                  setSeoForm((prev) => ({ ...prev, openGraphImage: url }));
                                }
                              }
                              e.target.value = '';
                            }}
                          />
                        </label>

                        {seoForm.openGraphImage && (
                          <button
                            type="button"
                            onClick={() => setSeoForm({ ...seoForm, openGraphImage: '' })}
                            className="text-xs text-neutral-400 hover:text-red-400 px-2 py-1.5 transition"
                          >
                            Clear Image
                          </button>
                        )}
                      </div>

                      <div>
                        <input
                          type="url"
                          value={seoForm.openGraphImage || ''}
                          onChange={(e) => setSeoForm({ ...seoForm, openGraphImage: e.target.value })}
                          placeholder="Or paste external image URL (https://...)"
                          className="w-full bg-neutral-950 border border-neutral-700 focus:border-amber-500 rounded-lg px-3.5 py-2 text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none transition font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Structured Data Schema Markup */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider">
                          Structured Data / Schema Markup
                        </h3>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          Custom JSON-LD schema for rich search snippets, Organization profile, and LocalBusiness markup.
                        </p>
                      </div>
                      <span className="text-[11px] font-mono text-neutral-500">JSON-LD</span>
                    </div>

                    <div>
                      <textarea
                        value={seoForm.schemaMarkup || ''}
                        onChange={(e) => setSeoForm({ ...seoForm, schemaMarkup: e.target.value })}
                        rows={5}
                        placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "ClothingStore",\n  "name": "Zippy",\n  "url": "https://zippy.com.bd"\n}`}
                        className="w-full bg-neutral-950 border border-neutral-700 focus:border-amber-500 rounded-lg px-3.5 py-2.5 text-xs text-amber-200/90 font-mono placeholder-neutral-600 focus:outline-none transition"
                      />
                      <p className="text-[11px] text-neutral-500 mt-1">
                        Optional: Insert valid JSON-LD schema markup to enhance Google Knowledge Graph visibility.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handleSaveSeo()}
                      disabled={isSavingSeo}
                      className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-neutral-950 font-bold px-6 py-2.5 rounded-lg text-sm uppercase tracking-wider transition shadow-md"
                    >
                      {isSavingSeo ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      <span>{isSavingSeo ? 'Saving Changes...' : 'Save SEO Settings'}</span>
                    </button>
                  </div>
                </div>

                {/* Right Column: Previews & Health Checklist */}
                <div className="xl:col-span-5 space-y-6">
                  {/* Google SERP Preview */}
                  {(() => {
                    const activeBrand = websiteForm.website_name || websiteForm.websiteName || settings?.website_name || settings?.websiteName || 'Zippy';
                    const activeFav = websiteForm.favicon || settings?.favicon;
                    const canonicalRaw = (seoForm.canonicalUrl || 'https://zippybd.com').trim();
                    const cleanDomain = canonicalRaw.replace(/^https?:\/\//, '').replace(/\/$/, '');
                    const titleLength = (seoForm.metaTitle || '').length;
                    const descLength = (seoForm.metaDescription || '').length;

                    return (
                      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3.5">
                        <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800">
                          <div className="flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                              Google Search Result Preview
                            </h4>
                          </div>

                          {/* Desktop / Mobile Switcher */}
                          <div className="flex items-center bg-neutral-950 p-0.5 rounded-lg border border-neutral-800 text-[11px]">
                            <button
                              type="button"
                              onClick={() => setSerpViewMode('desktop')}
                              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md transition cursor-pointer ${
                                serpViewMode === 'desktop'
                                  ? 'bg-neutral-800 text-amber-400 font-bold shadow-xs'
                                  : 'text-neutral-400 hover:text-neutral-200'
                              }`}
                            >
                              <Monitor className="w-3 h-3" />
                              <span>Desktop</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSerpViewMode('mobile')}
                              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md transition cursor-pointer ${
                                serpViewMode === 'mobile'
                                  ? 'bg-neutral-800 text-amber-400 font-bold shadow-xs'
                                  : 'text-neutral-400 hover:text-neutral-200'
                              }`}
                            >
                              <Smartphone className="w-3 h-3" />
                              <span>Mobile</span>
                            </button>
                          </div>
                        </div>

                        {/* Preview Box */}
                        <div className={`transition-all duration-200 ${serpViewMode === 'mobile' ? 'max-w-[360px] mx-auto' : 'w-full'}`}>
                          <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200 text-left font-sans">
                            {/* Google Header */}
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center space-x-2.5">
                                {activeFav ? (
                                  <img
                                    src={activeFav}
                                    alt="Favicon"
                                    className="w-6 h-6 rounded-full object-contain p-0.5 bg-neutral-100 border border-neutral-200"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-neutral-900 flex items-center justify-center text-[10px] text-amber-400 font-bold">
                                    {activeBrand.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div className="leading-tight">
                                  <div className="text-[13px] text-[#202124] font-medium leading-none">
                                    {activeBrand}
                                  </div>
                                  <div className="text-[11px] text-[#4d5156] font-normal truncate max-w-[240px] sm:max-w-[320px] mt-0.5">
                                    https://{cleanDomain}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[#70757a]">
                                <MoreVertical className="w-4 h-4" />
                              </span>
                            </div>

                            {/* Google Title */}
                            <div
                              className={`text-[#1a0dab] hover:underline font-normal leading-[1.3] cursor-pointer mb-1.5 font-sans ${
                                serpViewMode === 'mobile' ? 'text-[17px] line-clamp-2' : 'text-[19px] sm:text-[20px] line-clamp-1'
                              }`}
                            >
                              {seoForm.metaTitle || `${activeBrand} | Luxury Bespoke Men's Fashion & Tailoring`}
                            </div>

                            {/* Google Snippet */}
                            <div className="text-[#4d5156] text-[13px] sm:text-[14px] leading-[1.58] line-clamp-2 font-sans">
                              {seoForm.metaDescription ||
                                `Discover handcrafted suits, blazers, and luxury panjabis tailored for the modern gentleman by ${activeBrand} in Dhaka, Bangladesh.`}
                            </div>

                            {/* Sitelinks (Desktop only) */}
                            {serpViewMode === 'desktop' && (
                              <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-3 mt-3 border-t border-neutral-100 text-xs font-sans">
                                <div>
                                  <div className="text-[#1a0dab] hover:underline font-medium cursor-pointer">
                                    Italian Wool Blazers
                                  </div>
                                  <p className="text-[#5f6368] text-[11px] line-clamp-1">Tailored slim jackets & dinner tuxedos.</p>
                                </div>
                                <div>
                                  <div className="text-[#1a0dab] hover:underline font-medium cursor-pointer">
                                    Egyptian Giza Shirts
                                  </div>
                                  <p className="text-[#5f6368] text-[11px] line-clamp-1">Artisanal pinpoint Oxford & formal cuts.</p>
                                </div>
                                <div>
                                  <div className="text-[#1a0dab] hover:underline font-medium cursor-pointer">
                                    Festive Panjabi Collection
                                  </div>
                                  <p className="text-[#5f6368] text-[11px] line-clamp-1">Jacquard weaves & fine silk craftsmanship.</p>
                                </div>
                                <div>
                                  <div className="text-[#1a0dab] hover:underline font-medium cursor-pointer">
                                    Store Locator & Flagships
                                  </div>
                                  <p className="text-[#5f6368] text-[11px] line-clamp-1">Visit boutiques in Gulshan, Banani, Dhaka.</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Live SEO Quality Audit Chips */}
                        <div className="pt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-neutral-400">
                          <div className="flex items-center space-x-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                titleLength >= 40 && titleLength <= 60
                                  ? 'bg-emerald-400'
                                  : titleLength > 60
                                  ? 'bg-amber-400'
                                  : 'bg-neutral-500'
                              }`}
                            />
                            <span>
                              Title: <strong className={titleLength > 60 ? 'text-amber-400' : titleLength >= 40 ? 'text-emerald-400' : 'text-neutral-300'}>{titleLength}/60</strong>
                              {titleLength > 60 ? ' (Truncated)' : titleLength >= 40 ? ' (Optimal)' : ' (Short)'}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                descLength >= 120 && descLength <= 160
                                  ? 'bg-emerald-400'
                                  : descLength > 160
                                  ? 'bg-amber-400'
                                  : 'bg-neutral-500'
                              }`}
                            />
                            <span>
                              Snippet: <strong className={descLength > 160 ? 'text-amber-400' : descLength >= 120 ? 'text-emerald-400' : 'text-neutral-300'}>{descLength}/160</strong>
                              {descLength > 160 ? ' (Truncated)' : descLength >= 120 ? ' (Optimal)' : ' (Short)'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Social Share Card Preview */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                          Social Media Card Preview
                        </h4>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-medium">Facebook / WhatsApp / X</span>
                    </div>

                    <div className="bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden shadow-lg">
                      <div className="aspect-[1.91/1] w-full bg-neutral-900 relative overflow-hidden flex items-center justify-center">
                        {seoForm.openGraphImage ? (
                          <img
                            src={seoForm.openGraphImage}
                            alt="Social preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1200';
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-neutral-600 p-4">
                            <ImageIcon className="w-10 h-10 mb-1" />
                            <span className="text-xs">No OpenGraph image configured</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3 bg-neutral-900/90 border-t border-neutral-800">
                        <div className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 mb-0.5">
                          {(() => {
                            try {
                              const host = new URL(seoForm.canonicalUrl || 'https://zippybd.com').hostname;
                              return host.replace(/^www\./, '').toUpperCase();
                            } catch {
                              return 'ZIPPYBD.COM';
                            }
                          })()}
                        </div>
                        <div className="text-xs font-semibold text-neutral-200 line-clamp-1 mb-1">
                          {seoForm.metaTitle || `${websiteForm.website_name || 'Zippy'} Luxury Fashion Atelier`}
                        </div>
                        <div className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                          {seoForm.metaDescription || 'Handcrafted menswear, suits, blazers and accessories.'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SEO Health Checklist */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 pb-2 border-b border-neutral-800">
                      SEO Optimization Checklist
                    </h4>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Title Tag Length</span>
                        {seoForm.metaTitle.length >= 30 && seoForm.metaTitle.length <= 60 ? (
                          <span className="flex items-center text-emerald-400 text-[11px] font-medium">
                            <Check className="w-3.5 h-3.5 mr-1" /> Optimal ({seoForm.metaTitle.length} chars)
                          </span>
                        ) : (
                          <span className="flex items-center text-amber-400 text-[11px] font-medium">
                            <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Adjust ({seoForm.metaTitle.length} chars)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Description Length</span>
                        {seoForm.metaDescription.length >= 80 && seoForm.metaDescription.length <= 160 ? (
                          <span className="flex items-center text-emerald-400 text-[11px] font-medium">
                            <Check className="w-3.5 h-3.5 mr-1" /> Optimal ({seoForm.metaDescription.length} chars)
                          </span>
                        ) : (
                          <span className="flex items-center text-amber-400 text-[11px] font-medium">
                            <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Adjust ({seoForm.metaDescription.length} chars)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Social Share Image</span>
                        {seoForm.openGraphImage ? (
                          <span className="flex items-center text-emerald-400 text-[11px] font-medium">
                            <Check className="w-3.5 h-3.5 mr-1" /> Configured
                          </span>
                        ) : (
                          <span className="flex items-center text-neutral-500 text-[11px]">
                            Missing
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Canonical Tag</span>
                        {seoForm.canonicalUrl ? (
                          <span className="flex items-center text-emerald-400 text-[11px] font-medium">
                            <Check className="w-3.5 h-3.5 mr-1" /> Configured
                          </span>
                        ) : (
                          <span className="flex items-center text-amber-400 text-[11px]">
                            Missing
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Robots Directive</span>
                        <span className="font-mono text-[11px] text-neutral-300">
                          {seoForm.robots || 'index, follow'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* URL 301 & 302 Redirects Manager */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-4">
                  <div>
                    <h3 className="text-base font-serif font-bold text-neutral-200">
                      URL Redirect Rules (301 & 302)
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Prevent broken 404 links by routing legacy or changed URLs to their new addresses.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-neutral-800 text-neutral-300 text-xs font-mono">
                    {redirects.length} Active {redirects.length === 1 ? 'Rule' : 'Rules'}
                  </span>
                </div>

                {/* Add Redirect Form */}
                <form
                  onSubmit={handleAddRedirect}
                  className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
                >
                  <div className="md:col-span-5">
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Source Old Path <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newRedirect.fromPath}
                      onChange={(e) => setNewRedirect({ ...newRedirect, fromPath: e.target.value })}
                      placeholder="/old-category or /blazers-2023"
                      className="w-full bg-neutral-900 border border-neutral-700 focus:border-amber-500 rounded px-3 py-2 text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Target New Path <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newRedirect.toPath}
                      onChange={(e) => setNewRedirect({ ...newRedirect, toPath: e.target.value })}
                      placeholder="/products/blazer or /shop"
                      className="w-full bg-neutral-900 border border-neutral-700 focus:border-amber-500 rounded px-3 py-2 text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Status Code
                    </label>
                    <select
                      value={newRedirect.statusCode}
                      onChange={(e) =>
                        setNewRedirect({
                          ...newRedirect,
                          statusCode: Number(e.target.value) as 301 | 302
                        })
                      }
                      className="w-full bg-neutral-900 border border-neutral-700 focus:border-amber-500 rounded px-3 py-2 text-xs text-neutral-100 focus:outline-none"
                    >
                      <option value={301}>301 (Permanent)</option>
                      <option value={302}>302 (Temporary)</option>
                    </select>
                  </div>

                  <div className="md:col-span-1">
                    <button
                      type="submit"
                      disabled={isAddingRedirect}
                      className="w-full h-[34px] flex items-center justify-center bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-neutral-950 font-bold rounded text-xs transition"
                      title="Add redirect rule"
                    >
                      {isAddingRedirect ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </form>

                {/* Redirects Table */}
                <div className="border border-neutral-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs text-neutral-300">
                    <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
                      <tr>
                        <th className="px-4 py-3">Source URL (From)</th>
                        <th className="px-4 py-3">Redirect Destination (To)</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {redirects.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                            No redirect rules active. Use the form above to add 301/302 redirects.
                          </td>
                        </tr>
                      ) : (
                        redirects.map((r) => (
                          <tr key={r.id} className="hover:bg-neutral-800/40 transition">
                            <td className="px-4 py-3 font-mono text-neutral-200">{r.fromPath}</td>
                            <td className="px-4 py-3 font-mono text-amber-400">{r.toPath}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  r.statusCode === 301
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                }`}
                              >
                                {r.statusCode || 301}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleDeleteRedirect(r.id, r.fromPath)}
                                className="p-1 text-neutral-500 hover:text-red-400 rounded transition"
                                title="Delete redirect rule"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 22. NOTIFICATIONS */}
          {activeTab === 'Notifications' && (
            <div className="space-y-6 max-w-5xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-serif font-bold text-neutral-100">Live System Notifications & Alerts</h3>
                  <p className="text-xs text-neutral-400">Audit automated customer notifications, SMS triggers, and manual broadcasts</p>
                </div>
                <div className="flex items-center space-x-3">
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAllNotifications}
                      className="flex items-center space-x-1.5 px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-lg text-xs font-semibold transition"
                      title="Clear all system notification records"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsNotificationModal(true)}
                    className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded-lg text-sm transition"
                  >
                    <Send className="w-4 h-4" />
                    <span>Broadcast Notification</span>
                  </button>
                </div>
              </div>

              {/* Notification Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
                  <p className="text-xs text-neutral-400">Total Logged</p>
                  <p className="text-lg font-bold text-neutral-100 mt-0.5">{notifications.length}</p>
                </div>
                <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
                  <p className="text-xs text-neutral-400">SMS Alerts</p>
                  <p className="text-lg font-bold text-amber-400 mt-0.5">
                    {notifications.filter((n) => n.channel?.toLowerCase() === 'sms').length}
                  </p>
                </div>
                <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
                  <p className="text-xs text-neutral-400">Email Dispatches</p>
                  <p className="text-lg font-bold text-blue-400 mt-0.5">
                    {notifications.filter((n) => n.channel?.toLowerCase() === 'email').length}
                  </p>
                </div>
                <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
                  <p className="text-xs text-neutral-400">Push / System</p>
                  <p className="text-lg font-bold text-emerald-400 mt-0.5">
                    {notifications.filter((n) => !['sms', 'email'].includes(n.channel?.toLowerCase())).length}
                  </p>
                </div>
              </div>

              {/* Notification Stream */}
              <div className="space-y-3">
                {notifications.map((n) => {
                  let payloadDisplay = '';
                  if (typeof n.payload === 'string') {
                    payloadDisplay = n.payload;
                  } else if (n.payload && typeof n.payload === 'object') {
                    const obj = n.payload as Record<string, unknown>;
                    payloadDisplay = (obj.message as string) || (obj.text as string) || JSON.stringify(obj);
                  }

                  const channelColor =
                    n.channel?.toLowerCase() === 'sms'
                      ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                      : n.channel?.toLowerCase() === 'email'
                        ? 'bg-blue-950/60 text-blue-300 border-blue-800/60'
                        : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';

                  return (
                    <div
                      key={n.id}
                      className="p-4 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl flex items-center justify-between gap-4 transition group"
                    >
                      <div className="flex items-start space-x-3 min-w-0">
                        <span className={`font-mono text-[10px] px-2 py-0.5 rounded uppercase font-bold border mt-0.5 ${channelColor}`}>
                          {n.channel || 'SYS'}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-neutral-200 text-sm">{n.event.replace(/_/g, ' ')}</span>
                            {n.recipient && (
                              <span className="text-[11px] text-neutral-400 font-mono">({n.recipient})</span>
                            )}
                          </div>
                          {payloadDisplay && (
                            <p className="text-xs text-neutral-400 mt-1 break-words line-clamp-2">
                              {payloadDisplay}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 shrink-0">
                        <span className="text-[11px] text-neutral-500 font-mono">
                          {n.createdAt?.slice(0, 19).replace('T', ' ')}
                        </span>
                        <button
                          onClick={() => handleDeleteNotification(n.id)}
                          className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 rounded transition opacity-80 group-hover:opacity-100"
                          title="Dismiss notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {notifications.length === 0 && (
                  <div className="p-10 text-center bg-neutral-900/50 border border-neutral-800 rounded-xl">
                    <Bell className="w-8 h-8 text-neutral-600 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium text-neutral-300">No active system notifications</p>
                    <p className="text-xs text-neutral-500 mt-1">Automated events like orders, inquiries, or broadcast dispatches will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 23. AUDIT LOGS */}
          {activeTab === 'Audit Logs' && (
            <div className="space-y-6 max-w-6xl">
              <p className="text-xs uppercase tracking-wider text-neutral-400">Security & Operational Activity Audit Trail</p>
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm text-neutral-300">
                  <thead className="bg-neutral-950 text-neutral-400 text-xs uppercase border-b border-neutral-800">
                    <tr>
                      <th className="py-3 px-4">Action</th>
                      <th>Module</th>
                      <th>Record ID</th>
                      <th>Actor</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 font-mono text-xs">
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="py-3 px-4 text-amber-400 font-semibold">{log.action}</td>
                        <td className="text-neutral-300 uppercase">{log.module}</td>
                        <td className="text-neutral-500">{log.recordId || '-'}</td>
                        <td className="text-neutral-400">{log.userId || 'system'}</td>
                        <td className="text-neutral-500">{log.createdAt?.slice(0, 19).replace('T', ' ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 1. COMPREHENSIVE PRODUCT MODAL */}
      {isProductModal && (
        <div className="fixed inset-0 bg-neutral-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl flex flex-col max-h-[94vh] shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-900/90 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-neutral-100 flex items-center space-x-2">
                    <span>{editingProductId ? 'Edit Catalog Product' : 'Create New Catalog Product'}</span>
                    {editingProductId && (
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                        prodForm.status === 'published'
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                          : prodForm.status === 'draft'
                          ? 'bg-neutral-800 text-neutral-400 border-neutral-700'
                          : 'bg-amber-950/60 text-amber-400 border-amber-800'
                      }`}>
                        {prodForm.status}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-neutral-400 truncate max-w-md">
                    {editingProductId
                      ? `${prodForm.name || 'Untitled'} • SKU: ${prodForm.sku || 'N/A'}`
                      : 'Configure specifications, pricing, gallery imagery, variants, and SEO.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsProductModal(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg transition"
                title="Close editor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="px-6 pt-2 pb-0 border-b border-neutral-800 bg-neutral-950/40 flex items-center space-x-1 overflow-x-auto shrink-0 custom-scrollbar">
              {[
                { id: 'general', label: 'General Info', icon: Info },
                { id: 'pricing', label: 'Pricing & Stock', icon: Tag },
                { id: 'images', label: `Gallery (${prodForm.images.length})`, icon: ImageIcon },
                { id: 'variants', label: 'Sizes & Colors', icon: Palette },
                { id: 'description', label: 'Description & Specs', icon: FileText },
                { id: 'seo', label: 'SEO & URLs', icon: Globe }
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isActive = productEditTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setProductEditTab(tab.id as typeof productEditTab)}
                    className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 whitespace-nowrap ${
                      isActive
                        ? 'border-amber-500 text-amber-400 bg-neutral-900'
                        : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: GENERAL INFO */}
              {productEditTab === 'general' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs uppercase font-bold tracking-wider text-neutral-300 mb-1.5">
                      Product Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={prodForm.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                        setProdForm({
                          ...prodForm,
                          name: val,
                          slug: editingProductId ? prodForm.slug : autoSlug
                        });
                      }}
                      placeholder="e.g. Italian Super 130s Virgin Wool Navy Blazer"
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 transition"
                    />
                    <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-neutral-950/80 border border-neutral-800/80 rounded-lg px-3 py-2 text-xs">
                      <div className="flex items-center space-x-1.5 font-mono text-[11px] text-neutral-400 truncate">
                        <span className="text-neutral-500 uppercase text-[10px] font-sans font-bold">Slug:</span>
                        <span className="text-neutral-500 truncate">https://{(seoForm.canonicalUrl || 'https://zippybd.com').replace(/^https?:\/\//, '').replace(/\/$/, '')}/product/</span>
                        <span className="text-amber-400 font-semibold">{prodForm.slug || '(auto from name)'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setProductEditTab('seo')}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-medium whitespace-nowrap cursor-pointer hover:underline self-end sm:self-auto"
                      >
                        Customize Slug & SEO →
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs uppercase font-bold tracking-wider text-neutral-300 mb-1.5">
                        SKU Code <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={prodForm.sku}
                        onChange={(e) => setProdForm({ ...prodForm, sku: e.target.value })}
                        placeholder="RM-BLZ-001"
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3.5 py-2 text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-bold tracking-wider text-neutral-300 mb-1.5">
                        Style Code (Optional)
                      </label>
                      <input
                        type="text"
                        value={prodForm.styleCode}
                        onChange={(e) => setProdForm({ ...prodForm, styleCode: e.target.value })}
                        placeholder="ST-2026-08"
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3.5 py-2 text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-bold tracking-wider text-neutral-300 mb-1.5">
                        Barcode / EAN (Optional)
                      </label>
                      <input
                        type="text"
                        value={prodForm.barcode}
                        onChange={(e) => setProdForm({ ...prodForm, barcode: e.target.value })}
                        placeholder="894123456789"
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3.5 py-2 text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs uppercase font-bold tracking-wider text-neutral-300 mb-1.5">
                        Category <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={prodForm.categoryId}
                        onChange={(e) => setProdForm({ ...prodForm, categoryId: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-bold tracking-wider text-neutral-300 mb-1.5">
                        Brand / Label
                      </label>
                      <select
                        value={prodForm.brandId}
                        onChange={(e) => setProdForm({ ...prodForm, brandId: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                      >
                        <option value="">Zippy Bespoke (Atelier In-House)</option>
                        {brands.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-bold tracking-wider text-neutral-300 mb-1.5">
                        Publication Status
                      </label>
                      <select
                        value={prodForm.status}
                        onChange={(e) => setProdForm({ ...prodForm, status: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                      >
                        <option value="published">Published (Live in Store)</option>
                        <option value="draft">Draft (Hidden from Catalog)</option>
                        <option value="archived">Archived (Out of Season)</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  {/* Merchandising & Feature Flags */}
                  <div className="pt-3 border-t border-neutral-800">
                    <label className="block text-xs uppercase font-bold tracking-wider text-neutral-300 mb-2.5">
                      Merchandising & Badges
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <label className={`flex items-center space-x-2.5 p-3 rounded-xl border transition cursor-pointer select-none ${
                        prodForm.featured
                          ? 'bg-amber-500/10 border-amber-500/50 text-amber-300'
                          : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}>
                        <input
                          type="checkbox"
                          checked={prodForm.featured}
                          onChange={(e) => setProdForm({ ...prodForm, featured: e.target.checked })}
                          className="rounded text-amber-500 focus:ring-amber-500"
                        />
                        <span className="text-xs font-semibold">Featured</span>
                      </label>

                      <label className={`flex items-center space-x-2.5 p-3 rounded-xl border transition cursor-pointer select-none ${
                        prodForm.newArrival
                          ? 'bg-blue-500/10 border-blue-500/50 text-blue-300'
                          : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}>
                        <input
                          type="checkbox"
                          checked={prodForm.newArrival}
                          onChange={(e) => setProdForm({ ...prodForm, newArrival: e.target.checked })}
                          className="rounded text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-xs font-semibold">New Arrival</span>
                      </label>

                      <label className={`flex items-center space-x-2.5 p-3 rounded-xl border transition cursor-pointer select-none ${
                        prodForm.bestSeller
                          ? 'bg-purple-500/10 border-purple-500/50 text-purple-300'
                          : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}>
                        <input
                          type="checkbox"
                          checked={prodForm.bestSeller}
                          onChange={(e) => setProdForm({ ...prodForm, bestSeller: e.target.checked })}
                          className="rounded text-purple-500 focus:ring-purple-500"
                        />
                        <span className="text-xs font-semibold">Best Seller</span>
                      </label>

                      <label className={`flex items-center space-x-2.5 p-3 rounded-xl border transition cursor-pointer select-none ${
                        prodForm.trending
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                          : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}>
                        <input
                          type="checkbox"
                          checked={prodForm.trending}
                          onChange={(e) => setProdForm({ ...prodForm, trending: e.target.checked })}
                          className="rounded text-emerald-500 focus:ring-emerald-500"
                        />
                        <span className="text-xs font-semibold">Trending</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PRICING & INVENTORY */}
              {productEditTab === 'pricing' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs uppercase font-bold tracking-wider text-neutral-300 mb-1.5">
                        Regular Price (BDT ৳) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={prodForm.price}
                        onChange={(e) => setProdForm({ ...prodForm, price: Number(e.target.value) })}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-bold tracking-wider text-neutral-300 mb-1.5 flex items-center justify-between">
                        <span>Sale Price (BDT ৳)</span>
                        {prodForm.salePrice && Number(prodForm.salePrice) < Number(prodForm.price) && (
                          <span className="text-[10px] text-emerald-400 font-bold">
                            Save ৳{(Number(prodForm.price) - Number(prodForm.salePrice)).toLocaleString()} (
                            {Math.round(((Number(prodForm.price) - Number(prodForm.salePrice)) / Number(prodForm.price)) * 100)}% OFF)
                          </span>
                        )}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={prodForm.salePrice}
                        onChange={(e) => setProdForm({ ...prodForm, salePrice: e.target.value })}
                        placeholder="Leave blank for regular price"
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-bold tracking-wider text-neutral-300 mb-1.5 flex items-center justify-between">
                        <span>Cost Price (BDT ৳)</span>
                        {prodForm.costPrice && Number(prodForm.costPrice) > 0 && (
                          <span className="text-[10px] text-neutral-400">
                            Margin: ৳{((Number(prodForm.salePrice) || Number(prodForm.price)) - Number(prodForm.costPrice)).toLocaleString()}
                          </span>
                        )}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={prodForm.costPrice}
                        onChange={(e) => setProdForm({ ...prodForm, costPrice: e.target.value })}
                        placeholder="Internal unit cost"
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Stock Quantities */}
                  <div className="pt-4 border-t border-neutral-800">
                    <h4 className="text-sm font-bold text-neutral-200 mb-3 flex items-center space-x-2">
                      <Boxes className="w-4 h-4 text-amber-500" />
                      <span>Stock & Warehouse Inventory</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase font-bold tracking-wider text-neutral-300 mb-1.5">
                          Total Stock Quantity (Pieces)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={prodForm.stockQuantity}
                          onChange={(e) => setProdForm({ ...prodForm, stockQuantity: Number(e.target.value) })}
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase font-bold tracking-wider text-neutral-300 mb-1.5">
                          Low Stock Alert Threshold
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={prodForm.lowStockThreshold}
                          onChange={(e) => setProdForm({ ...prodForm, lowStockThreshold: Number(e.target.value) })}
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Per-Size Stock Breakdown */}
                  {prodForm.sizes && prodForm.sizes.length > 0 && (
                    <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                            Per-Size Stock Breakdown ({prodForm.sizes.length} Sizes)
                          </p>
                          <p className="text-[11px] text-neutral-500">Assign inventory counts to each specific size.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const total = Object.values(prodForm.stock || {}).reduce((a, b) => a + (Number(b) || 0), 0);
                            setProdForm({ ...prodForm, stockQuantity: total });
                            showToast(`Total stock updated to ${total} pcs from sizes`);
                          }}
                          className="text-[11px] text-amber-400 hover:text-amber-300 underline"
                        >
                          Sum to Total Stock
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                        {prodForm.sizes.map((sz) => (
                          <div key={sz} className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-center">
                            <span className="block text-xs font-bold text-amber-500 mb-1">{sz}</span>
                            <input
                              type="number"
                              min="0"
                              value={prodForm.stock?.[sz] ?? 0}
                              onChange={(e) => {
                                const nextStock = { ...(prodForm.stock || {}) };
                                nextStock[sz] = Number(e.target.value) || 0;
                                setProdForm({ ...prodForm, stock: nextStock });
                              }}
                              className="w-full bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-100 font-mono text-center focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: GALLERY & MULTIPLE IMAGES */}
              {productEditTab === 'images' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-neutral-950 border border-neutral-800 rounded-xl">
                    <div>
                      <div className="flex items-center space-x-2">
                        <ImageIcon className="w-4 h-4 text-amber-500" />
                        <h4 className="text-sm font-bold text-neutral-200">
                          Product Image Gallery ({prodForm.images.length})
                        </h4>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Image #1 is automatically used as the primary showcase cover in storefront listings.
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleOpenMediaPicker('product')}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-amber-400 rounded-lg text-xs font-semibold transition"
                      >
                        <Folder className="w-3.5 h-3.5" />
                        <span>Choose Store Media</span>
                      </button>
                      <label className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded-lg text-xs font-bold cursor-pointer transition shadow">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photos</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const files = e.target.files;
                            if (!files || files.length === 0) return;
                            setIsUploadingMedia(true);
                            try {
                              const newUrls: string[] = [];
                              for (let i = 0; i < files.length; i++) {
                                const uploadedUrl = await uploadLocalFileToStoreMedia(files[i], 'products');
                                if (uploadedUrl) newUrls.push(uploadedUrl);
                              }
                              if (newUrls.length > 0) {
                                setProdForm((prev) => ({
                                  ...prev,
                                  images: [...prev.images, ...newUrls]
                                }));
                                showToast(`Added ${newUrls.length} photo(s) to product`);
                              }
                            } finally {
                              setIsUploadingMedia(false);
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Add Image by URL Bar */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="url"
                      placeholder="Paste image URL (https://...)..."
                      value={newProductImageUrl}
                      onChange={(e) => setNewProductImageUrl(e.target.value)}
                      className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newProductImageUrl.trim()) return;
                        setProdForm({ ...prodForm, images: [...prodForm.images, newProductImageUrl.trim()] });
                        setNewProductImageUrl('');
                        showToast('Image URL added to gallery');
                      }}
                      className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-lg text-xs font-semibold transition"
                    >
                      + Add URL
                    </button>
                  </div>

                  {/* Gallery Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                    {prodForm.images.map((imgUrl, idx) => (
                      <div
                        key={`${imgUrl}-${idx}`}
                        className={`group relative bg-neutral-950 rounded-xl overflow-hidden border transition ${
                          idx === 0 ? 'border-amber-500/80 shadow-lg shadow-amber-500/10' : 'border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div className="aspect-[4/5] w-full bg-neutral-900 relative overflow-hidden">
                          <img
                            src={imgUrl}
                            alt={`Product Photo ${idx + 1}`}
                            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                          />
                          <div className="absolute top-2 left-2 flex items-center space-x-1">
                            <span className="bg-neutral-950/80 backdrop-blur-sm text-neutral-200 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                              #{idx + 1}
                            </span>
                            {idx === 0 && (
                              <span className="bg-amber-500 text-neutral-950 font-bold text-[9px] uppercase px-1.5 py-0.5 rounded shadow">
                                Cover
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = prodForm.images.filter((_, i) => i !== idx);
                              setProdForm({ ...prodForm, images: updated });
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-neutral-950/80 hover:bg-red-600 text-neutral-300 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow"
                            title="Remove photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Card controls */}
                        <div className="p-2 bg-neutral-900/90 border-t border-neutral-800 flex items-center justify-between text-xs">
                          {idx !== 0 ? (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...prodForm.images];
                                const [selected] = updated.splice(idx, 1);
                                updated.unshift(selected);
                                setProdForm({ ...prodForm, images: updated });
                                showToast('Set as primary cover image');
                              }}
                              className="text-amber-400 hover:text-amber-300 text-[11px] font-semibold"
                            >
                              Set Cover
                            </button>
                          ) : (
                            <span className="text-[11px] text-amber-500 font-semibold">Primary Cover</span>
                          )}

                          <div className="flex items-center space-x-1">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...prodForm.images];
                                  const temp = updated[idx - 1];
                                  updated[idx - 1] = updated[idx];
                                  updated[idx] = temp;
                                  setProdForm({ ...prodForm, images: updated });
                                }}
                                className="px-1.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[10px]"
                                title="Move left"
                              >
                                ←
                              </button>
                            )}
                            {idx < prodForm.images.length - 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...prodForm.images];
                                  const temp = updated[idx + 1];
                                  updated[idx + 1] = updated[idx];
                                  updated[idx] = temp;
                                  setProdForm({ ...prodForm, images: updated });
                                }}
                                className="px-1.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[10px]"
                                title="Move right"
                              >
                                →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {prodForm.images.length === 0 && (
                      <div className="col-span-full p-8 border border-dashed border-neutral-800 rounded-xl text-center space-y-2">
                        <ImageIcon className="w-10 h-10 text-neutral-600 mx-auto" />
                        <p className="text-sm text-neutral-400">No photos added to this product yet.</p>
                        <p className="text-xs text-neutral-500">
                          Click "Upload Photos" or "Choose Store Media" above to attach images.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: SIZES & COLOR SWATCHES */}
              {productEditTab === 'variants' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Sizes */}
                  <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-neutral-200">Garment Sizes</h4>
                      <p className="text-xs text-neutral-400">
                        Click preset size chips to toggle them on or add bespoke numeric collar/chest measurements.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '38', '40', '42', '44', '46', '48'].map((sz) => {
                        const isSelected = prodForm.sizes.includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => {
                              const nextSizes = isSelected
                                ? prodForm.sizes.filter((s) => s !== sz)
                                : [...prodForm.sizes, sz];
                              setProdForm({ ...prodForm, sizes: nextSizes });
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                              isSelected
                                ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow'
                                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>

                    {/* Add Custom Size */}
                    <div className="flex items-center space-x-2 pt-2">
                      <input
                        type="text"
                        placeholder="Add custom size (e.g. Free Size, 36R, Bespoke)..."
                        value={customSizeInput}
                        onChange={(e) => setCustomSizeInput(e.target.value)}
                        className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!customSizeInput.trim()) return;
                          if (!prodForm.sizes.includes(customSizeInput.trim())) {
                            setProdForm({ ...prodForm, sizes: [...prodForm.sizes, customSizeInput.trim()] });
                          }
                          setCustomSizeInput('');
                        }}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold transition"
                      >
                        + Add Size
                      </button>
                    </div>
                  </div>

                  {/* Colors & Swatches */}
                  <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-neutral-200">Color Variants & Swatches</h4>
                      <p className="text-xs text-neutral-400">
                        Define garment color choices with accurate hexadecimal color swatches shown in the storefront.
                      </p>
                    </div>

                    {/* Active Colors */}
                    <div className="flex flex-wrap gap-2.5">
                      {prodForm.colors.map((c, idx) => (
                        <div
                          key={`${c.name}-${idx}`}
                          className="flex items-center space-x-2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs"
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-neutral-700 shadow-sm"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className="font-semibold text-neutral-200">{c.name}</span>
                          <span className="font-mono text-[10px] text-neutral-500">{c.hex}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = prodForm.colors.filter((_, i) => i !== idx);
                              setProdForm({ ...prodForm, colors: updated });
                            }}
                            className="text-neutral-500 hover:text-red-400 ml-1"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Color Form */}
                    <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg space-y-3">
                      <p className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Add Color Swatch</p>
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          type="text"
                          placeholder="Color Name (e.g. Royal Navy)"
                          value={newColorName}
                          onChange={(e) => setNewColorName(e.target.value)}
                          className="bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                        />
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="color"
                            value={newColorHex}
                            onChange={(e) => setNewColorHex(e.target.value)}
                            className="w-8 h-8 rounded bg-transparent cursor-pointer border border-neutral-700"
                          />
                          <input
                            type="text"
                            value={newColorHex}
                            onChange={(e) => setNewColorHex(e.target.value)}
                            className="w-20 bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs font-mono text-neutral-200 text-center"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (!newColorName.trim()) return showToast('Please enter a color name');
                            setProdForm({
                              ...prodForm,
                              colors: [...prodForm.colors, { name: newColorName.trim(), hex: newColorHex }]
                            });
                            setNewColorName('');
                          }}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded-lg text-xs font-bold transition shadow"
                        >
                          + Add Swatch
                        </button>
                      </div>

                      {/* Preset swatches */}
                      <div className="flex items-center space-x-2 pt-1 text-[11px] text-neutral-400">
                        <span>Presets:</span>
                        {[
                          { name: 'Navy', hex: '#1B2A4A' },
                          { name: 'Black', hex: '#0A0A0A' },
                          { name: 'Charcoal', hex: '#2C3539' },
                          { name: 'Maroon', hex: '#4A0E17' },
                          { name: 'Emerald', hex: '#1B4D3E' },
                          { name: 'Camel', hex: '#C19A6B' },
                          { name: 'White', hex: '#F8F9FA' }
                        ].map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              setNewColorName(preset.name);
                              setNewColorHex(preset.hex);
                            }}
                            className="px-2 py-0.5 bg-neutral-950 border border-neutral-800 rounded hover:border-neutral-600 flex items-center space-x-1"
                          >
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.hex }} />
                            <span>{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: DESCRIPTION & SPECS */}
              {productEditTab === 'description' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase font-bold tracking-wider text-neutral-300 mb-1.5">
                        Fabric & Materials
                      </label>
                      <input
                        type="text"
                        value={prodForm.fabric}
                        onChange={(e) => setProdForm({ ...prodForm, fabric: e.target.value })}
                        placeholder="e.g. 100% Super 130s Merino Wool"
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3.5 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-bold tracking-wider text-neutral-300 mb-1.5">
                        Fit & Silhouette
                      </label>
                      <input
                        type="text"
                        value={prodForm.fit}
                        onChange={(e) => setProdForm({ ...prodForm, fit: e.target.value })}
                        placeholder="e.g. Slim Fit, Tailored Silhouette"
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3.5 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold tracking-wider text-neutral-300 mb-1.5">
                      Short Summary / Highlights
                    </label>
                    <textarea
                      rows={2}
                      value={prodForm.shortDescription}
                      onChange={(e) => setProdForm({ ...prodForm, shortDescription: e.target.value })}
                      placeholder="Brief excerpt displayed on product cards and quick previews..."
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 custom-scrollbar"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs uppercase font-bold tracking-wider text-neutral-300">
                        Full Product Description
                      </label>
                      <button
                        type="button"
                        disabled={!prodForm.name.trim()}
                        onClick={async () => {
                          try {
                            const cat = categories.find((c) => c.id === prodForm.categoryId);
                            const copy = await api.aiGenerateProductCopy({
                              title: prodForm.name,
                              category: cat?.name || 'Menswear',
                              fabric: prodForm.fabric,
                              fit: prodForm.fit
                            });
                            setProdForm({
                              ...prodForm,
                              description: copy.description,
                              shortDescription: copy.shortDescription || prodForm.shortDescription
                            });
                            showToast('Generated luxury copy with AI!');
                          } catch (err: unknown) {
                            showToast(err instanceof Error ? err.message : 'AI generation failed');
                          }
                        }}
                        className="flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 disabled:opacity-40 font-semibold cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Copy with AI</span>
                      </button>
                    </div>
                    <textarea
                      rows={5}
                      value={prodForm.description}
                      onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                      placeholder="Comprehensive product storytelling, construction techniques, lapel details, and styling recommendations..."
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 custom-scrollbar"
                    />
                  </div>

                  {/* Garment Care Instructions */}
                  <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2.5">
                    <label className="block text-xs uppercase font-bold tracking-wider text-neutral-300">
                      Garment Care Instructions
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {prodForm.careInstructions.map((care, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 rounded-lg flex items-center space-x-1.5"
                        >
                          <span>{care}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setProdForm({
                                ...prodForm,
                                careInstructions: prodForm.careInstructions.filter((_, i) => i !== idx)
                              });
                            }}
                            className="text-neutral-500 hover:text-red-400"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add care note (e.g. Dry Clean Only, Steam Iron)..."
                        value={newCareInput}
                        onChange={(e) => setNewCareInput(e.target.value)}
                        className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-500 flex-1 max-w-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newCareInput.trim()) return;
                          setProdForm({
                            ...prodForm,
                            careInstructions: [...prodForm.careInstructions, newCareInput.trim()]
                          });
                          setNewCareInput('');
                        }}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold"
                      >
                        + Add Care Note
                      </button>
                    </div>
                  </div>

                  {/* Product Tags */}
                  <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2.5">
                    <label className="block text-xs uppercase font-bold tracking-wider text-neutral-300">
                      Product Tags & Search Labels
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {prodForm.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 rounded-lg flex items-center space-x-1.5"
                        >
                          <span>#{tag}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setProdForm({
                                ...prodForm,
                                tags: prodForm.tags.filter((_, i) => i !== idx)
                              });
                            }}
                            className="text-amber-500/70 hover:text-red-400"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add tag (e.g. Wedding, Formal, Blazer)..."
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-500 flex-1 max-w-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newTagInput.trim()) return;
                          setProdForm({
                            ...prodForm,
                            tags: [...prodForm.tags, newTagInput.trim()]
                          });
                          setNewTagInput('');
                        }}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold"
                      >
                        + Add Tag
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: SEO & METADATA */}
              {productEditTab === 'seo' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs uppercase font-bold tracking-wider text-neutral-300">
                        Custom URL Slug
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const auto = (prodForm.name || 'product')
                            .toLowerCase()
                            .trim()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/^-+|-+$/g, '');
                          setProdForm({ ...prodForm, slug: auto });
                          showToast('Slug generated from product name');
                        }}
                        className="flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 transition cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Auto-Generate from Name</span>
                      </button>
                    </div>
                    <div className="flex items-center rounded-lg border border-neutral-700 bg-neutral-950 overflow-hidden px-3 py-2 text-sm">
                      <span className="text-neutral-500 select-none font-mono text-xs">
                        https://{(seoForm.canonicalUrl || 'https://zippybd.com').replace(/^https?:\/\//, '').replace(/\/$/, '')}/product/
                      </span>
                      <input
                        type="text"
                        value={prodForm.slug}
                        onChange={(e) => {
                          const sanitized = e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, '-')
                            .replace(/[^a-z0-9-_]/g, '');
                          setProdForm({ ...prodForm, slug: sanitized });
                        }}
                        placeholder="italian-wool-navy-blazer"
                        className="flex-1 bg-transparent text-amber-400 font-mono text-sm focus:outline-none pl-1"
                      />
                    </div>
                    {(() => {
                      const cleanSlug = prodForm.slug.trim().toLowerCase();
                      const isDuplicate = products.some(
                        (p) => p.id !== editingProductId && p.slug?.trim().toLowerCase() === cleanSlug
                      );
                      if (!cleanSlug) {
                        return (
                          <p className="text-[11px] text-neutral-500 mt-1">
                            If left empty, a clean URL slug will be automatically created from the product name when saving.
                          </p>
                        );
                      }
                      if (isDuplicate) {
                        return (
                          <p className="text-[11px] text-red-400 flex items-center space-x-1 mt-1">
                            <AlertTriangle className="w-3.5 h-3.5 inline shrink-0" />
                            <span>This URL slug is already taken by another product. Please make it unique to avoid routing conflicts.</span>
                          </p>
                        );
                      }
                      return (
                        <p className="text-[11px] text-emerald-400 flex items-center space-x-1 mt-1">
                          <Check className="w-3.5 h-3.5 inline shrink-0" />
                          <span>URL slug is clean, valid, and available.</span>
                        </p>
                      );
                    })()}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs uppercase font-bold tracking-wider text-neutral-300">
                        Meta Title
                      </label>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          disabled={!prodForm.name.trim()}
                          onClick={async () => {
                            try {
                              const cat = categories.find((c) => c.id === prodForm.categoryId);
                              const seoRes = await api.aiGenerateSeo({
                                title: prodForm.name,
                                category: cat?.name || 'Menswear',
                                description: prodForm.description,
                                brand: 'Zippy Atelier'
                              });
                              setProdForm({
                                ...prodForm,
                                metaTitle: seoRes.metaTitle,
                                metaDescription: seoRes.metaDescription,
                                metaKeywords: seoRes.metaKeywords
                              });
                              showToast('Generated SEO metadata with AI!');
                            } catch (err: unknown) {
                              showToast(err instanceof Error ? err.message : 'AI generation failed');
                            }
                          }}
                          className="flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 disabled:opacity-40 font-semibold cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Generate SEO with AI</span>
                        </button>
                        <span className="text-[11px] text-neutral-500">
                          {prodForm.metaTitle.length} / 60 characters
                        </span>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={prodForm.metaTitle}
                      onChange={(e) => setProdForm({ ...prodForm, metaTitle: e.target.value })}
                      placeholder={prodForm.name ? `${prodForm.name} | ${websiteForm.website_name || 'Zippy'}` : `e.g. Italian Wool Navy Blazer | ${websiteForm.website_name || 'Zippy'}`}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs uppercase font-bold tracking-wider text-neutral-300">
                        Meta Description
                      </label>
                      <span className="text-[11px] text-neutral-500">
                        {prodForm.metaDescription.length} / 160 characters
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={prodForm.metaDescription}
                      onChange={(e) => setProdForm({ ...prodForm, metaDescription: e.target.value })}
                      placeholder="Write an enticing summary for search engine results..."
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold tracking-wider text-neutral-300 mb-1.5">
                      Meta Keywords
                    </label>
                    <input
                      type="text"
                      value={prodForm.metaKeywords}
                      onChange={(e) => setProdForm({ ...prodForm, metaKeywords: e.target.value })}
                      placeholder="menswear, blazer, navy wool, bespoke, dhaka"
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Google Search Engine Preview Card */}
                  {(() => {
                    const activeBrand = websiteForm.website_name || websiteForm.websiteName || settings?.website_name || settings?.websiteName || 'Zippy';
                    const activeFav = websiteForm.favicon || settings?.favicon;
                    const canonicalRaw = (seoForm.canonicalUrl || 'https://zippybd.com').trim();
                    const cleanDomain = canonicalRaw.replace(/^https?:\/\//, '').replace(/\/$/, '');
                    const productSlug = prodForm.slug || 'product-slug';
                    const titleLength = (prodForm.metaTitle || prodForm.name || '').length;
                    const descLength = (prodForm.metaDescription || prodForm.shortDescription || '').length;

                    return (
                      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                              Google Search Result Preview
                            </h4>
                          </div>
                          <span className="text-[10px] text-neutral-500 font-medium">Product SERP Snippet</span>
                        </div>

                        <div className="bg-white rounded-lg p-3.5 shadow-sm border border-neutral-200 text-left font-sans">
                          {/* Google Header */}
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center space-x-2">
                              {activeFav ? (
                                <img
                                  src={activeFav}
                                  alt="Favicon"
                                  className="w-5 h-5 rounded-full object-contain p-0.5 bg-neutral-100 border border-neutral-200"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-neutral-900 flex items-center justify-center text-[9px] text-amber-400 font-bold">
                                  {activeBrand.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="leading-tight">
                                <div className="text-[12px] text-[#202124] font-medium leading-none">
                                  {activeBrand}
                                </div>
                                <div className="text-[11px] text-[#4d5156] font-normal truncate max-w-[260px] sm:max-w-[340px] mt-0.5">
                                  https://{cleanDomain} › product › {productSlug}
                                </div>
                              </div>
                            </div>
                            <span className="text-[#70757a]">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </span>
                          </div>

                          {/* Google Title */}
                          <div className="text-[#1a0dab] hover:underline text-[16px] font-normal leading-snug cursor-pointer line-clamp-1 mb-1 font-sans">
                            {prodForm.metaTitle || (prodForm.name ? `${prodForm.name} | ${activeBrand}` : `${activeBrand} Garment`)}
                          </div>

                          {/* Product Rich Attributes (Rating, Price, Availability) */}
                          <div className="flex items-center space-x-2 text-[12px] text-[#5f6368] mb-1 font-sans">
                            <span className="text-[#e37400] font-medium">★ 4.9</span>
                            <span>(38)</span>
                            <span>·</span>
                            <span className="font-semibold text-[#202124]">৳{Number(prodForm.price || 0).toLocaleString()}</span>
                            <span>·</span>
                            <span className="text-[#137333] font-medium">In stock</span>
                          </div>

                          {/* Google Snippet */}
                          <div className="text-[#4d5156] text-[13px] leading-relaxed line-clamp-2 font-sans">
                            {prodForm.metaDescription || prodForm.shortDescription || `Shop the ${prodForm.name || 'garment'} crafted by ${activeBrand}. Hand-tailored luxury menswear in Bangladesh.`}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-neutral-400 px-0.5">
                          <span>Title: <strong className={titleLength > 60 ? 'text-amber-400' : titleLength >= 35 ? 'text-emerald-400' : 'text-neutral-300'}>{titleLength}/60</strong> chars</span>
                          <span>Description: <strong className={descLength > 160 ? 'text-amber-400' : descLength >= 80 ? 'text-emerald-400' : 'text-neutral-300'}>{descLength}/160</strong> chars</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-900/90 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2 text-xs text-neutral-400">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>
                  Tab: <strong className="text-neutral-200 capitalize">{productEditTab}</strong>
                </span>
                <span>•</span>
                <span>Price: <strong className="text-amber-400">৳{Number(prodForm.price || 0).toLocaleString()}</strong></span>
                <span>•</span>
                <span>Stock: <strong className="text-emerald-400">{prodForm.stockQuantity || 0} pcs</strong></span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setIsProductModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-neutral-100 rounded-lg hover:bg-neutral-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProduct}
                  disabled={isSavingProduct}
                  className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-neutral-950 font-bold px-5 py-2.5 rounded-lg text-xs transition shadow-lg cursor-pointer"
                >
                  {isSavingProduct ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingProductId ? 'Update Product' : 'Create Product'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CATEGORY CONFIGURATION MODAL */}
      {isCategoryModal && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                  <FolderTree className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-neutral-100">
                    {editingCategoryId ? 'Edit Category' : 'Add New Category'}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {editingCategoryId ? 'Update taxonomy hierarchy, cover image, and metadata' : 'Create a primary department or nested subcategory'}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsCategoryModal(false)} className="text-neutral-400 hover:text-neutral-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase text-neutral-400 font-semibold mb-1">Category Name *</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      const auto = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                      setCategoryForm({
                        ...categoryForm,
                        name: val,
                        slug: editingCategoryId ? categoryForm.slug : auto
                      });
                    }}
                    placeholder="e.g. Italian Blazers"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="uppercase text-neutral-400 font-semibold">Storefront Slug (URL) *</label>
                    <button
                      type="button"
                      onClick={() => {
                        const auto = (categoryForm.name || 'category')
                          .toLowerCase()
                          .trim()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-+|-+$/g, '');
                        setCategoryForm({ ...categoryForm, slug: auto });
                      }}
                      className="text-[11px] text-amber-400 hover:text-amber-300 cursor-pointer"
                    >
                      Auto-Generate
                    </button>
                  </div>
                  <div className="flex items-center rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm">
                    <span className="text-neutral-500 text-xs font-mono select-none">/shop/</span>
                    <input
                      type="text"
                      value={categoryForm.slug}
                      onChange={(e) => {
                        const clean = e.target.value
                          .toLowerCase()
                          .replace(/\s+/g, '-')
                          .replace(/[^a-z0-9-_]/g, '');
                        setCategoryForm({ ...categoryForm, slug: clean });
                      }}
                      placeholder="italian-blazers"
                      className="flex-1 bg-transparent text-amber-400 font-mono text-xs focus:outline-none pl-1"
                    />
                  </div>
                </div>
              </div>

              {/* Hierarchy and Visibility */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block uppercase text-neutral-400 font-semibold mb-1">Parent Category (Hierarchy Level)</label>
                  <select
                    value={categoryForm.parentId || ''}
                    onChange={(e) => setCategoryForm({ ...categoryForm, parentId: e.target.value || null })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- None (Root / Primary Department) --</option>
                    {categories
                      .filter((c) => c.id !== editingCategoryId && !c.parentId)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} (/shop/{c.slug})
                        </option>
                      ))}
                  </select>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Select a parent to nest this category as a subcategory.
                  </p>
                </div>

                <div>
                  <label className="block uppercase text-neutral-400 font-semibold mb-1">Display Sort Order</label>
                  <input
                    type="number"
                    min={1}
                    value={categoryForm.sortOrder}
                    onChange={(e) => setCategoryForm({ ...categoryForm, sortOrder: Math.max(1, Number(e.target.value)) })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Lower number displays first in menu.
                  </p>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block uppercase text-neutral-400 font-semibold mb-1.5">Visibility Status</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCategoryForm({ ...categoryForm, status: 'active' })}
                    className={`p-2.5 rounded-lg border text-left flex items-center space-x-2.5 transition cursor-pointer ${
                      categoryForm.status === 'active'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-xs">Active (Live)</p>
                      <p className="text-[10px] text-neutral-500">Visible on storefront menu and shop filters</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategoryForm({ ...categoryForm, status: 'inactive' })}
                    className={`p-2.5 rounded-lg border text-left flex items-center space-x-2.5 transition cursor-pointer ${
                      categoryForm.status === 'inactive'
                        ? 'bg-red-950/60 border-red-500 text-red-400'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-xs">Inactive (Hidden)</p>
                      <p className="text-[10px] text-neutral-500">Hidden from customers, products preserved</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block uppercase text-neutral-400 font-semibold mb-1">Collection Narrative & Description</label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Describe the aesthetic, fabric craftsmanship, and appeal of this collection..."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Cover Photo */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="uppercase text-neutral-400 font-semibold">Category Cover Photo</label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenMediaPicker('category')}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1 cursor-pointer"
                    >
                      <Folder className="w-3 h-3" />
                      <span>Choose Store Media</span>
                    </button>
                    <label className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer flex items-center space-x-1">
                      <Upload className="w-3 h-3" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await uploadLocalFileToStoreMedia(file, 'products');
                            if (url) setCategoryForm((prev) => ({ ...prev, image: url }));
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                <input
                  type="text"
                  value={categoryForm.image}
                  onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 font-mono text-xs focus:outline-none focus:border-amber-500"
                />
                {categoryForm.image && (
                  <div className="mt-2 w-full h-24 rounded-lg overflow-hidden bg-neutral-950 border border-neutral-800">
                    <img src={categoryForm.image} alt="Category preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* SEO Meta Information */}
              <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-3">
                <div className="flex items-center space-x-1.5 text-neutral-300 font-semibold">
                  <Globe className="w-4 h-4 text-amber-400" />
                  <span>Search Engine Optimization (Google SERP Metadata)</span>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-neutral-400 font-medium">Meta Title</span>
                    <span className={categoryForm.metaTitle.length > 60 ? 'text-amber-400' : 'text-neutral-500'}>
                      {categoryForm.metaTitle.length}/60 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    value={categoryForm.metaTitle}
                    onChange={(e) => setCategoryForm({ ...categoryForm, metaTitle: e.target.value })}
                    placeholder={categoryForm.name ? `${categoryForm.name} - Luxury Menswear Collection` : 'Bespoke Suits & Tailoring BD'}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-neutral-400 font-medium">Meta Description</span>
                    <span className={categoryForm.metaDescription.length > 160 ? 'text-amber-400' : 'text-neutral-500'}>
                      {categoryForm.metaDescription.length}/160 chars
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={categoryForm.metaDescription}
                    onChange={(e) => setCategoryForm({ ...categoryForm, metaDescription: e.target.value })}
                    placeholder="Discover handcrafted tailored blazers and luxury menswear in Dhaka..."
                    className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                {/* Google SERP Preview Box */}
                <div className="bg-neutral-900 p-2.5 rounded-lg border border-neutral-800/80 font-sans text-xs">
                  <p className="text-[11px] text-neutral-500 uppercase font-bold tracking-wider mb-1">Search Snippet Preview</p>
                  <p className="text-blue-400 hover:underline font-medium truncate">
                    {categoryForm.metaTitle || `${categoryForm.name || 'Category'} | Luxury Atelier Collection`}
                  </p>
                  <p className="text-emerald-500 text-[11px] truncate">
                    https://zippybd.com/shop/{categoryForm.slug || 'category'}
                  </p>
                  <p className="text-neutral-400 text-[11px] line-clamp-2 mt-0.5">
                    {categoryForm.metaDescription || categoryForm.description || 'Explore our exclusive collection of master-tailored menswear and accessories in Dhaka.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-end space-x-3 flex-shrink-0">
              <button onClick={() => setIsCategoryModal(false)} className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200">
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded text-sm transition"
              >
                {editingCategoryId ? 'Update Category' : 'Save Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2.1 CATEGORY PRODUCTS PREVIEW MODAL */}
      {isCategoryPreviewModal && categoryPreviewCategory && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-neutral-100">
                    {categoryPreviewCategory.name}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Assigned garments: {categoryPreviewProducts.length} items &bull; Slug: <span className="font-mono text-amber-400">/shop/{categoryPreviewCategory.slug}</span>
                  </p>
                </div>
              </div>
              <button onClick={() => setIsCategoryPreviewModal(false)} className="text-neutral-400 hover:text-neutral-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {isLoadingCategoryPreview ? (
                <div className="py-12 text-center text-neutral-400 text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin text-amber-500 mx-auto mb-2" />
                  <span>Loading assigned garments...</span>
                </div>
              ) : categoryPreviewProducts.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 text-xs">
                  No products currently assigned to this category.
                </div>
              ) : (
                <div className="divide-y divide-neutral-800/80">
                  {categoryPreviewProducts.map((p) => (
                    <div key={p.id} className="py-2.5 flex items-center justify-between hover:bg-neutral-800/20 px-2 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <img
                          src={p.images[0] || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=200'}
                          alt={p.name}
                          className="w-10 h-10 rounded object-cover bg-neutral-950 border border-neutral-800"
                        />
                        <div>
                          <p className="text-xs font-semibold text-neutral-100">{p.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                            <span className="font-mono text-amber-400">{p.sku}</span>
                            <span>&bull;</span>
                            <span>Stock: <strong className="text-emerald-400">{p.stockQuantity ?? Object.values(p.stock || {}).reduce((a, b) => a + b, 0)} pcs</strong></span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-xs text-neutral-200">
                          ৳{p.salePrice && p.salePrice < p.price ? p.salePrice.toLocaleString() : p.price.toLocaleString()}
                        </span>
                        {p.salePrice && p.salePrice < p.price && (
                          <span className="font-mono text-[10px] text-neutral-500 line-through block">
                            ৳{p.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-between items-center flex-shrink-0">
              <span className="text-xs text-neutral-500">
                Total Products: {categoryPreviewProducts.length}
              </span>
              <button
                onClick={() => setIsCategoryPreviewModal(false)}
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-4 py-2 rounded text-xs font-semibold transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2.2 BRAND PRODUCTS PREVIEW MODAL */}
      {isBrandPreviewModal && brandPreviewBrand && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 flex-shrink-0">
              <div className="flex items-center space-x-3">
                {brandPreviewBrand.logo ? (
                  <img
                    src={brandPreviewBrand.logo}
                    alt={brandPreviewBrand.name}
                    className="w-10 h-10 rounded-lg object-contain bg-neutral-950 p-1 border border-neutral-800"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-serif font-bold text-lg">
                    {brandPreviewBrand.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-lg text-neutral-100">
                      {brandPreviewBrand.name}
                    </h3>
                    {brandPreviewBrand.featured && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                        <span>Featured</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400">
                    Assigned garments: {brandPreviewProducts.length} items &bull; Slug: <span className="font-mono text-amber-400">/brand/{brandPreviewBrand.slug}</span>
                    {brandPreviewBrand.website && (
                      <>
                        {' '}&bull;{' '}
                        <a
                          href={brandPreviewBrand.website.startsWith('http') ? brandPreviewBrand.website : `https://${brandPreviewBrand.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-neutral-400 hover:text-amber-400 underline"
                        >
                          Visit Website
                        </a>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsBrandPreviewModal(false)} className="text-neutral-400 hover:text-neutral-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {isLoadingBrandPreview ? (
                <div className="py-12 text-center text-neutral-400 text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin text-amber-500 mx-auto mb-2" />
                  <span>Loading assigned garments...</span>
                </div>
              ) : brandPreviewProducts.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 text-xs">
                  No garments currently mapped to this brand label.
                </div>
              ) : (
                <div className="divide-y divide-neutral-800/80">
                  {brandPreviewProducts.map((p) => (
                    <div key={p.id} className="py-2.5 flex items-center justify-between hover:bg-neutral-800/20 px-2 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <img
                          src={p.images[0] || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=200'}
                          alt={p.name}
                          className="w-10 h-10 rounded object-cover bg-neutral-950 border border-neutral-800"
                        />
                        <div>
                          <p className="text-xs font-semibold text-neutral-100">{p.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                            <span className="font-mono text-amber-400">{p.sku}</span>
                            <span>&bull;</span>
                            <span>{p.categoryName || 'Garment'}</span>
                            <span>&bull;</span>
                            <span>Stock: <strong className="text-emerald-400">{p.stockQuantity ?? Object.values(p.stock || {}).reduce((a, b) => a + b, 0)} pcs</strong></span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-xs text-neutral-200">
                          ৳{p.salePrice && p.salePrice < p.price ? p.salePrice.toLocaleString() : p.price.toLocaleString()}
                        </span>
                        {p.salePrice && p.salePrice < p.price && (
                          <span className="font-mono text-[10px] text-neutral-500 line-through block">
                            ৳{p.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-between items-center flex-shrink-0">
              <span className="text-xs text-neutral-500">
                Total Garments: {brandPreviewProducts.length}
              </span>
              <button
                onClick={() => setIsBrandPreviewModal(false)}
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-4 py-2 rounded text-xs font-semibold transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. BRAND MODAL - FULL SUITE */}
      {isBrandModal && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl p-6 space-y-4 max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-neutral-100">
                    {editingBrandId ? 'Edit Brand Profile' : 'Add New Brand Partner'}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Configure luxury brand identity, logos, cover banner, and Google SERP metadata
                  </p>
                </div>
              </div>
              <button onClick={() => setIsBrandModal(false)} className="text-neutral-400 hover:text-neutral-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Brand Configuration Form */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block uppercase text-neutral-400 font-semibold mb-1">Brand Name *</label>
                      <input
                        type="text"
                        value={brandForm.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          const auto = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                          setBrandForm({
                            ...brandForm,
                            name: val,
                            slug: editingBrandId ? brandForm.slug : auto
                          });
                        }}
                        placeholder="e.g. Ermenegildo Zegna"
                        className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="uppercase text-neutral-400 font-semibold">Storefront Slug (URL) *</label>
                        <button
                          type="button"
                          onClick={() => {
                            const auto = (brandForm.name || 'brand')
                              .toLowerCase()
                              .trim()
                              .replace(/[^a-z0-9]+/g, '-')
                              .replace(/^-+|-+$/g, '');
                            setBrandForm({ ...brandForm, slug: auto });
                          }}
                          className="text-[11px] text-amber-400 hover:text-amber-300 cursor-pointer"
                        >
                          Auto-Generate
                        </button>
                      </div>
                      <div className="flex items-center rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm">
                        <span className="text-neutral-500 text-xs font-mono select-none">/brand/</span>
                        <input
                          type="text"
                          value={brandForm.slug}
                          onChange={(e) => {
                            const clean = e.target.value
                              .toLowerCase()
                              .replace(/\s+/g, '-')
                              .replace(/[^a-z0-9-_]/g, '');
                            setBrandForm({ ...brandForm, slug: clean });
                          }}
                          placeholder="ermenegildo-zegna"
                          className="flex-1 bg-transparent text-amber-400 font-mono text-xs focus:outline-none pl-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Website & Sort Order */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block uppercase text-neutral-400 font-semibold mb-1">Official Website URL</label>
                      <div className="relative">
                        <Globe className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={brandForm.website}
                          onChange={(e) => setBrandForm({ ...brandForm, website: e.target.value })}
                          placeholder="https://brand.com"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded pl-9 pr-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block uppercase text-neutral-400 font-semibold mb-1">Sort Order</label>
                      <input
                        type="number"
                        min="1"
                        value={brandForm.sortOrder}
                        onChange={(e) => setBrandForm({ ...brandForm, sortOrder: parseInt(e.target.value) || 1 })}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Status & Featured Flags */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
                    <div>
                      <label className="block uppercase text-neutral-400 font-semibold mb-2">Storefront Status</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setBrandForm({ ...brandForm, status: 'active' })}
                          className={`p-2 rounded-lg border text-center transition cursor-pointer ${
                            brandForm.status === 'active'
                              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
                              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                          }`}
                        >
                          <p className="font-semibold text-xs">Active</p>
                          <p className="text-[10px] text-neutral-500">Live in catalog</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setBrandForm({ ...brandForm, status: 'inactive' })}
                          className={`p-2 rounded-lg border text-center transition cursor-pointer ${
                            brandForm.status === 'inactive'
                              ? 'bg-red-950/40 border-red-500 text-red-400'
                              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                          }`}
                        >
                          <p className="font-semibold text-xs">Inactive</p>
                          <p className="text-[10px] text-neutral-500">Hidden from shop</p>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block uppercase text-neutral-400 font-semibold mb-2">Spotlight Placement</label>
                      <button
                        type="button"
                        onClick={() => setBrandForm({ ...brandForm, featured: !brandForm.featured })}
                        className={`w-full p-2 rounded-lg border text-left transition flex items-center justify-between cursor-pointer ${
                          brandForm.featured
                            ? 'bg-amber-950/50 border-amber-500 text-amber-300'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Star className={`w-4 h-4 ${brandForm.featured ? 'text-amber-400 fill-amber-400' : 'text-neutral-500'}`} />
                          <div>
                            <p className="font-semibold text-xs">{brandForm.featured ? 'Featured Brand Partner' : 'Standard Brand'}</p>
                            <p className="text-[10px] text-neutral-500">
                              {brandForm.featured ? 'Pinned on home spotlights' : 'Visible in standard brand list'}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${brandForm.featured ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-800 text-neutral-400'}`}>
                          {brandForm.featured ? 'FEATURED' : 'OFF'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Brand Narrative / Description */}
                  <div>
                    <label className="block uppercase text-neutral-400 font-semibold mb-1">Brand Narrative &amp; Story</label>
                    <textarea
                      rows={2}
                      value={brandForm.description}
                      onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })}
                      placeholder="Artisan tailoring house founded with a dedication to bespoke wools and fine craftsmanship..."
                      className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>

                  {/* Brand Logo URL & Upload */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="uppercase text-neutral-400 font-semibold">Brand Logo Image</label>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenMediaPicker('brandLogo')}
                          className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1 cursor-pointer"
                        >
                          <Folder className="w-3 h-3" />
                          <span>Choose Media</span>
                        </button>
                        <label className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer flex items-center space-x-1">
                          <Upload className="w-3 h-3" />
                          <span>Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = await uploadLocalFileToStoreMedia(file, 'brands');
                                if (url) setBrandForm((prev) => ({ ...prev, logo: url }));
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={brandForm.logo}
                        onChange={(e) => setBrandForm({ ...brandForm, logo: e.target.value })}
                        placeholder="https://.../brand-logo.png"
                        className="flex-1 bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                      {brandForm.logo ? (
                        <div className="w-10 h-10 rounded-lg bg-neutral-950 border border-neutral-800 p-1 flex-shrink-0">
                          <img src={brandForm.logo} alt="Logo preview" className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-600 flex-shrink-0">
                          <Tag className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Brand Cover Banner URL & Upload */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="uppercase text-neutral-400 font-semibold">Hero / Cover Banner (Brand Page)</label>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenMediaPicker('brandBanner')}
                          className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1 cursor-pointer"
                        >
                          <Folder className="w-3 h-3" />
                          <span>Choose Media</span>
                        </button>
                        <label className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer flex items-center space-x-1">
                          <Upload className="w-3 h-3" />
                          <span>Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = await uploadLocalFileToStoreMedia(file, 'banners');
                                if (url) setBrandForm((prev) => ({ ...prev, banner: url }));
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={brandForm.banner}
                      onChange={(e) => setBrandForm({ ...brandForm, banner: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                    {brandForm.banner && (
                      <div className="mt-2 w-full h-20 rounded-lg overflow-hidden bg-neutral-950 border border-neutral-800">
                        <img src={brandForm.banner} alt="Cover preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Live Previews & SEO Suite */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Live Brand Card Simulator */}
                  <div>
                    <label className="block uppercase text-neutral-400 font-semibold mb-2">Live Storefront Card Preview</label>
                    <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-lg">
                      <div className="h-24 w-full bg-neutral-900 relative overflow-hidden">
                        {brandForm.banner ? (
                          <img src={brandForm.banner} alt="Preview banner" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 flex items-center justify-center">
                            <Tag className="w-6 h-6 text-neutral-800" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/30" />
                        
                        <div className="absolute top-2 right-2 flex items-center space-x-1.5">
                          {brandForm.featured && (
                            <span className="p-1 rounded-md bg-neutral-950/80 backdrop-blur-sm border border-amber-500/40 text-amber-400">
                              <Star className="w-3 h-3 fill-amber-400" />
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold backdrop-blur-sm border ${
                            brandForm.status === 'active'
                              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                              : 'bg-neutral-950/80 text-neutral-400 border-neutral-800'
                          }`}>
                            {brandForm.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        {/* Logo Monogram */}
                        <div className="absolute -bottom-3 left-3">
                          {brandForm.logo ? (
                            <img
                              src={brandForm.logo}
                              alt="Logo"
                              className="w-10 h-10 rounded-lg object-contain bg-neutral-900 border border-neutral-700 shadow-md p-0.5"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-700 shadow-md flex items-center justify-center text-amber-400 font-bold font-serif text-sm">
                              {(brandForm.name || 'B').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 px-3 pb-3">
                        <h4 className="font-serif font-bold text-sm text-neutral-100">
                          {brandForm.name || 'Brand Name'}
                        </h4>
                        <p className="text-[11px] text-neutral-400 line-clamp-2 mt-0.5 min-h-[30px]">
                          {brandForm.description || 'Luxury fashion partner details and atelier collections.'}
                        </p>
                        <div className="mt-2 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                          <span>/brand/{brandForm.slug || 'brand-slug'}</span>
                          {brandForm.website && <span className="text-amber-400/80">has website</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SEO Meta Information Box */}
                  <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-3">
                    <div className="flex items-center space-x-1.5 text-neutral-300 font-semibold">
                      <Globe className="w-4 h-4 text-amber-400" />
                      <span>Search Engine Optimization (SERP)</span>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-neutral-400 font-medium">Meta Title</span>
                        <span className={brandForm.metaTitle.length > 60 ? 'text-amber-400' : 'text-neutral-500'}>
                          {brandForm.metaTitle.length}/60 chars
                        </span>
                      </div>
                      <input
                        type="text"
                        value={brandForm.metaTitle}
                        onChange={(e) => setBrandForm({ ...brandForm, metaTitle: e.target.value })}
                        placeholder={brandForm.name ? `${brandForm.name} - Official Atelier & Menswear BD` : 'Luxury Brand Collection'}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-neutral-400 font-medium">Meta Description</span>
                        <span className={brandForm.metaDescription.length > 160 ? 'text-amber-400' : 'text-neutral-500'}>
                          {brandForm.metaDescription.length}/160 chars
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        value={brandForm.metaDescription}
                        onChange={(e) => setBrandForm({ ...brandForm, metaDescription: e.target.value })}
                        placeholder="Discover bespoke menswear, tailored garments, and luxury apparel from this house partner..."
                        className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-500 resize-none"
                      />
                    </div>

                    {/* Google SERP Preview Box */}
                    <div className="bg-neutral-900 p-2.5 rounded-lg border border-neutral-800/80 font-sans text-xs">
                      <p className="text-[11px] text-neutral-500 uppercase font-bold tracking-wider mb-1">Google Search Snippet Preview</p>
                      <p className="text-blue-400 hover:underline font-medium truncate">
                        {brandForm.metaTitle || `${brandForm.name || 'Brand Partner'} | Luxury Menswear BD`}
                      </p>
                      <p className="text-emerald-500 text-[11px] truncate">
                        https://zippybd.com/brand/{brandForm.slug || 'brand'}
                      </p>
                      <p className="text-neutral-400 text-[11px] line-clamp-2 mt-0.5">
                        {brandForm.metaDescription || brandForm.description || 'Explore our exclusive collection of master-tailored menswear and accessories in Dhaka.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-end space-x-3 flex-shrink-0">
              <button onClick={() => setIsBrandModal(false)} className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200">
                Cancel
              </button>
              <button
                onClick={handleSaveBrand}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded text-sm transition cursor-pointer"
              >
                {editingBrandId ? 'Update Brand' : 'Save Brand'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. INVENTORY STOCK ADJUSTMENT MODAL */}
      {isInventoryModal && editingInventoryItem && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-serif font-bold text-lg text-neutral-100">Adjust Inventory Stock</h3>
              <button onClick={() => setIsInventoryModal(false)} className="text-neutral-400 hover:text-neutral-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Product:</span>
                <span className="font-semibold text-neutral-200">{editingInventoryItem.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">SKU:</span>
                <span className="font-mono text-amber-400">{editingInventoryItem.sku}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Warehouse:</span>
                <span className="text-neutral-300">{editingInventoryItem.warehouseName || editingInventoryItem.warehouseId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Current Total Quantity:</span>
                <span className="font-bold text-emerald-400">{editingInventoryItem.quantity} pcs</span>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">New Total Quantity (Units)</label>
                <input
                  type="number"
                  min={0}
                  value={invForm.quantity}
                  onChange={(e) => setInvForm({ ...invForm, quantity: Number(e.target.value) })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">Adjustment Reason</label>
                <input
                  type="text"
                  value={invForm.reason}
                  onChange={(e) => setInvForm({ ...invForm, reason: e.target.value })}
                  placeholder="e.g. Inbound shipment arrival, stock count audit"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
            <div className="pt-3 border-t border-neutral-800 flex justify-end space-x-3">
              <button onClick={() => setIsInventoryModal(false)} className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200">
                Cancel
              </button>
              <button
                onClick={handleSaveInventory}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded text-sm transition"
              >
                Apply Stock Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4.1 STOCK IN / RECEIVE INVENTORY MODAL */}
      {isStockInModal && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-neutral-100">Stock In / Receive Goods</h3>
                  <p className="text-xs text-neutral-400">Record inbound inventory replenishment or purchase receipt</p>
                </div>
              </div>
              <button onClick={() => setIsStockInModal(false)} className="text-neutral-400 hover:text-neutral-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block uppercase text-neutral-400 mb-1 font-semibold">Select Product *</label>
                <select
                  value={stockInForm.productId}
                  onChange={(e) => setStockInForm({ ...stockInForm, productId: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — Current Stock: {p.stockQuantity}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block uppercase text-neutral-400 mb-1 font-semibold">Destination Warehouse *</label>
                <select
                  value={stockInForm.warehouseId}
                  onChange={(e) => setStockInForm({ ...stockInForm, warehouseId: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Primary / Default Warehouse --</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code}) {w.isDefault ? '— Default' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase text-neutral-400 mb-1 font-semibold">Quantity to Add (Units) *</label>
                  <input
                    type="number"
                    min={1}
                    value={stockInForm.quantity}
                    onChange={(e) => setStockInForm({ ...stockInForm, quantity: Math.max(1, Number(e.target.value)) })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block uppercase text-neutral-400 mb-1 font-semibold">Reference / PO #</label>
                  <input
                    type="text"
                    value={stockInForm.reference}
                    onChange={(e) => setStockInForm({ ...stockInForm, reference: e.target.value })}
                    placeholder="PO-2026-001"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase text-neutral-400 mb-1 font-semibold">Notes / Supplier Details</label>
                <textarea
                  rows={2}
                  value={stockInForm.note}
                  onChange={(e) => setStockInForm({ ...stockInForm, note: e.target.value })}
                  placeholder="e.g. Received from manufacturer in excellent condition"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-end space-x-3">
              <button onClick={() => setIsStockInModal(false)} className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200">
                Cancel
              </button>
              <button
                onClick={handleSaveStockIn}
                className="bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold px-4 py-2 rounded text-sm transition flex items-center space-x-2"
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>Confirm Stock In (+{stockInForm.quantity})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4.2 STOCK OUT / WRITE-OFF MODAL */}
      {isStockOutModal && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-neutral-100">Stock Out / Write-Off</h3>
                  <p className="text-xs text-neutral-400">Deduct inventory for damages, QC failures, scrap, or vendor returns</p>
                </div>
              </div>
              <button onClick={() => setIsStockOutModal(false)} className="text-neutral-400 hover:text-neutral-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block uppercase text-neutral-400 mb-1 font-semibold">Select Product *</label>
                <select
                  value={stockOutForm.productId}
                  onChange={(e) => setStockOutForm({ ...stockOutForm, productId: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — Available: {p.stockQuantity}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block uppercase text-neutral-400 mb-1 font-semibold">Warehouse Location *</label>
                <select
                  value={stockOutForm.warehouseId}
                  onChange={(e) => setStockOutForm({ ...stockOutForm, warehouseId: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Primary / Default Warehouse --</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase text-neutral-400 mb-1 font-semibold">Quantity to Deduct *</label>
                  <input
                    type="number"
                    min={1}
                    value={stockOutForm.quantity}
                    onChange={(e) => setStockOutForm({ ...stockOutForm, quantity: Math.max(1, Number(e.target.value)) })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-rose-400 font-mono font-bold focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block uppercase text-neutral-400 mb-1 font-semibold">Reason Category *</label>
                  <select
                    value={stockOutForm.reasonType}
                    onChange={(e) => setStockOutForm({ ...stockOutForm, reasonType: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="damage">Damaged in Transit / Warehouse</option>
                    <option value="defect">Factory Defect / Quality Rejection</option>
                    <option value="return_vendor">Return to Supplier / Vendor</option>
                    <option value="sample">Marketing Sample / Display Model</option>
                    <option value="scrap">Scrapped / Expired Material</option>
                    <option value="internal_use">Internal Operational Use</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block uppercase text-neutral-400 mb-1 font-semibold">Reference # (Disposal / Inspection Report)</label>
                <input
                  type="text"
                  value={stockOutForm.reference}
                  onChange={(e) => setStockOutForm({ ...stockOutForm, reference: e.target.value })}
                  placeholder="WO-DAMAGE-001"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block uppercase text-neutral-400 mb-1 font-semibold">Audit Notes & Inspection Details</label>
                <textarea
                  rows={2}
                  value={stockOutForm.note}
                  onChange={(e) => setStockOutForm({ ...stockOutForm, note: e.target.value })}
                  placeholder="Describe damage reason, batch, or disposal protocol..."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-end space-x-3">
              <button onClick={() => setIsStockOutModal(false)} className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200">
                Cancel
              </button>
              <button
                onClick={handleSaveStockOut}
                className="bg-rose-500 hover:bg-rose-600 text-neutral-950 font-bold px-4 py-2 rounded text-sm transition flex items-center space-x-2"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Confirm Stock Out (-{stockOutForm.quantity})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4.3 INTER-WAREHOUSE STOCK TRANSFER MODAL */}
      {isTransferModal && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-neutral-100">Inter-Warehouse Transfer</h3>
                  <p className="text-xs text-neutral-400">Rebalance inventory between fulfillment centers and storage hubs</p>
                </div>
              </div>
              <button onClick={() => setIsTransferModal(false)} className="text-neutral-400 hover:text-neutral-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block uppercase text-neutral-400 mb-1 font-semibold">Select Product to Move *</label>
                <select
                  value={transferForm.productId}
                  onChange={(e) => setTransferForm({ ...transferForm, productId: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase text-neutral-400 mb-1 font-semibold">Source Warehouse (From) *</label>
                  <select
                    value={transferForm.fromWarehouseId}
                    onChange={(e) => setTransferForm({ ...transferForm, fromWarehouseId: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Select Source --</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block uppercase text-neutral-400 mb-1 font-semibold">Destination Warehouse (To) *</label>
                  <select
                    value={transferForm.toWarehouseId}
                    onChange={(e) => setTransferForm({ ...transferForm, toWarehouseId: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Select Destination --</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id} disabled={w.id === transferForm.fromWarehouseId}>
                        {w.name} ({w.code}) {w.id === transferForm.fromWarehouseId ? '(Source)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase text-neutral-400 mb-1 font-semibold">Transfer Quantity (Units) *</label>
                  <input
                    type="number"
                    min={1}
                    value={transferForm.quantity}
                    onChange={(e) => setTransferForm({ ...transferForm, quantity: Math.max(1, Number(e.target.value)) })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block uppercase text-neutral-400 mb-1 font-semibold">Transfer Dispatch #</label>
                  <input
                    type="text"
                    value={transferForm.reference}
                    onChange={(e) => setTransferForm({ ...transferForm, reference: e.target.value })}
                    placeholder="TRF-001"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase text-neutral-400 mb-1 font-semibold">Dispatch Note & Driver Details</label>
                <textarea
                  rows={2}
                  value={transferForm.note}
                  onChange={(e) => setTransferForm({ ...transferForm, note: e.target.value })}
                  placeholder="e.g. Dispatched via internal van #4 to rebalance Gulshan stock"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-end space-x-3">
              <button onClick={() => setIsTransferModal(false)} className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200">
                Cancel
              </button>
              <button
                onClick={handleSaveTransfer}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded text-sm transition flex items-center space-x-2"
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>Execute Transfer ({transferForm.quantity} pcs)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4.4 THRESHOLD & SAFETY STOCK MODAL */}
      {isThresholdModal && thresholdItem && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-neutral-100">Stock Reorder Thresholds</h3>
                  <p className="text-xs text-neutral-400">Configure safety margins and low-stock alerts</p>
                </div>
              </div>
              <button onClick={() => setIsThresholdModal(false)} className="text-neutral-400 hover:text-neutral-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Product:</span>
                <span className="font-semibold text-neutral-200">{thresholdItem.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">SKU:</span>
                <span className="font-mono text-amber-400">{thresholdItem.sku}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Warehouse:</span>
                <span className="text-neutral-300">{thresholdItem.warehouseName || thresholdItem.warehouseId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Current Stock:</span>
                <span className="font-bold text-neutral-200">{thresholdItem.quantity} pcs</span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block uppercase text-neutral-400 mb-1 font-semibold">Minimum Reorder Alert Level (Units)</label>
                <input
                  type="number"
                  min={0}
                  value={thresholdForm.minimumStock}
                  onChange={(e) => setThresholdForm({ ...thresholdForm, minimumStock: Math.max(0, Number(e.target.value)) })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Triggers "Low Stock" warning when available inventory reaches or drops below this count.
                </p>
              </div>

              <div>
                <label className="block uppercase text-neutral-400 mb-1 font-semibold">Maximum Storage Capacity (Units)</label>
                <input
                  type="number"
                  min={0}
                  value={thresholdForm.maximumStock}
                  onChange={(e) => setThresholdForm({ ...thresholdForm, maximumStock: Math.max(0, Number(e.target.value)) })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Maximum recommended storage capacity for this warehouse bin.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-end space-x-3">
              <button onClick={() => setIsThresholdModal(false)} className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200">
                Cancel
              </button>
              <button
                onClick={handleSaveThreshold}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded text-sm transition"
              >
                Save Thresholds
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. WAREHOUSE MODAL */}
      {isWarehouseModal && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-serif font-bold text-lg text-neutral-100">
                {editingWarehouseId ? 'Edit Warehouse' : 'Add Storage Warehouse'}
              </h3>
              <button onClick={() => setIsWarehouseModal(false)} className="text-neutral-400 hover:text-neutral-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">Warehouse Name</label>
                <input
                  type="text"
                  value={warehouseForm.name}
                  onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })}
                  placeholder="e.g. Tejgaon Central Depot"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Code</label>
                  <input
                    type="text"
                    value={warehouseForm.code}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, code: e.target.value.toUpperCase() })}
                    placeholder="WH-01"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Phone</label>
                  <input
                    type="text"
                    value={warehouseForm.phone}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, phone: e.target.value })}
                    placeholder="+880 1700 000000"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">Address</label>
                <input
                  type="text"
                  value={warehouseForm.address}
                  onChange={(e) => setWarehouseForm({ ...warehouseForm, address: e.target.value })}
                  placeholder="Plot 45, Industrial Area, Dhaka"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">Manager In-Charge</label>
                <input
                  type="text"
                  value={warehouseForm.manager}
                  onChange={(e) => setWarehouseForm({ ...warehouseForm, manager: e.target.value })}
                  placeholder="Manager Full Name"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
            <div className="pt-3 border-t border-neutral-800 flex justify-end space-x-3">
              <button onClick={() => setIsWarehouseModal(false)} className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200">
                Cancel
              </button>
              <button
                onClick={handleSaveWarehouse}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded text-sm transition"
              >
                {editingWarehouseId ? 'Update Warehouse' : 'Save Warehouse'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. ORDER DETAILS & STATUS MODAL */}
      {isOrderModal && editingOrder && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="font-serif font-bold text-lg text-neutral-100">Order #{editingOrder.orderNumber}</h3>
                <span className="text-xs text-neutral-400">Placed on {editingOrder.createdAt?.slice(0, 10)}</span>
              </div>
              <button onClick={() => setIsOrderModal(false)} className="text-neutral-400 hover:text-neutral-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Customer:</span>
                <span className="font-semibold text-neutral-200">{editingOrder.customer?.fullName || 'Guest Customer'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Phone:</span>
                <span className="text-neutral-300">{editingOrder.customer?.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Payment:</span>
                <span className="uppercase text-amber-400 font-bold">{editingOrder.paymentMethod} ({editingOrder.paymentStatus})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Total Order Amount:</span>
                <span className="font-bold text-emerald-400 text-sm">৳{editingOrder.total?.toLocaleString()}</span>
              </div>
              {editingOrder.shippingAddress && (
                <div className="pt-2 border-t border-neutral-900 text-neutral-400">
                  <span className="block font-semibold text-neutral-300 mb-0.5">Shipping Address:</span>
                  <span>{editingOrder.shippingAddress.address}, {editingOrder.shippingAddress.district || ''}</span>
                </div>
              )}
            </div>

            {editingOrder.items && editingOrder.items.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-xs uppercase text-neutral-400 font-semibold">
                  Ordered Items ({editingOrder.items.length})
                </label>
                <div className="max-h-40 overflow-y-auto bg-neutral-950 rounded-xl border border-neutral-800 divide-y divide-neutral-900">
                  {editingOrder.items.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-neutral-200">{item.product?.name || `Product ID: ${item.productId}`}</p>
                        <p className="text-neutral-500">
                          {item.size ? `Size: ${item.size} • ` : ''}Qty: {item.quantity} × ৳{item.price?.toLocaleString()}
                        </p>
                      </div>
                      <span className="font-bold text-neutral-300 whitespace-nowrap">৳{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs uppercase text-neutral-400 mb-1 font-semibold">Change Order Status</label>
              <select
                value={orderEditStatus}
                onChange={(e) => setOrderEditStatus(e.target.value as OrderStatus)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 font-bold"
              >
                {ORDER_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex flex-wrap gap-2 justify-between items-center">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.open(`/api/v1/orders/${editingOrder.id}/invoice?format=html&print=true`, '_blank', 'width=880,height=1080')}
                  className="px-3.5 py-2 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteOrder(editingOrder)}
                  className="px-3.5 py-2 text-xs bg-red-950/60 border border-red-800/60 hover:bg-red-900/60 text-red-300 rounded font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  title="Permanently Delete Order"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Delete Order</span>
                </button>
              </div>
              <div className="flex space-x-3">
                <button onClick={() => setIsOrderModal(false)} className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200 cursor-pointer">
                  Close
                </button>
                <button
                  onClick={handleSaveOrder}
                  className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded text-sm transition cursor-pointer"
                >
                  Update Order Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6b. CUSTOMER ACCOUNT MODAL */}
      {isCustomerModal && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="font-serif font-bold text-lg text-neutral-100">
                  {editingCustomerId ? 'Edit Customer Account' : 'Register New Customer'}
                </h3>
                <p className="text-xs text-neutral-400">
                  {editingCustomerId ? 'Update patron contact details and account status' : 'Add a new patron profile directly into the system'}
                </p>
              </div>
              <button onClick={() => setIsCustomerModal(false)} className="text-neutral-400 hover:text-neutral-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={customerForm.fullName}
                    onChange={(e) => setCustomerForm({ ...customerForm, fullName: e.target.value })}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    placeholder="tanvir@example.com"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    placeholder="+880 1711 000000"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Account Status</label>
                  <select
                    value={customerForm.status}
                    onChange={(e) => setCustomerForm({ ...customerForm, status: e.target.value as 'active' | 'inactive' | 'blocked' })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="active">Active (Full Access)</option>
                    <option value="inactive">Inactive</option>
                    <option value="blocked">Blocked / Suspended</option>
                  </select>
                </div>
              </div>

              {!editingCustomerId && (
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Initial Password</label>
                  <input
                    type="text"
                    value={customerForm.password}
                    onChange={(e) => setCustomerForm({ ...customerForm, password: e.target.value })}
                    placeholder="Default: Zippy@2026"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">If left blank, defaults to Zippy@2026. The patron can reset this later.</p>
                </div>
              )}

              <div className="border-t border-neutral-800 pt-3">
                <p className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">Delivery Address (Optional)</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Division</label>
                    <input
                      type="text"
                      value={customerForm.division || ''}
                      onChange={(e) => setCustomerForm({ ...customerForm, division: e.target.value })}
                      placeholder="Dhaka"
                      className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">District / City</label>
                    <input
                      type="text"
                      value={customerForm.district || ''}
                      onChange={(e) => setCustomerForm({ ...customerForm, district: e.target.value })}
                      placeholder="Gulshan, Dhaka"
                      className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Full Street Address</label>
                  <textarea
                    rows={2}
                    value={customerForm.address || ''}
                    onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                    placeholder="House, Road, Area..."
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-end space-x-3">
              <button
                onClick={() => setIsCustomerModal(false)}
                className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomer}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded text-sm transition"
              >
                {editingCustomerId ? 'Save Changes' : 'Create Customer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. REVIEW MODERATE & REPLY MODAL */}
      {isReviewModal && editingReview && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="font-serif font-bold text-lg text-neutral-100">Moderate Customer Review</h3>
                <span className="text-xs text-amber-400 font-bold">★ {editingReview.rating} / 5 by {editingReview.authorName}</span>
              </div>
              <button onClick={() => setIsReviewModal(false)} className="text-neutral-400 hover:text-neutral-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 text-xs text-neutral-300 italic">
              &quot;{editingReview.comment}&quot;
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">Approval Status</label>
                <select
                  value={reviewForm.status}
                  onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="approved">Approved (Visible on product page)</option>
                  <option value="rejected">Rejected (Hidden from storefront)</option>
                  <option value="pending">Pending Review</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs uppercase text-neutral-400">Official Atelier Reply</label>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!editingReview) return;
                      try {
                        const aiRes = await api.aiAnalyzeReview({
                          rating: editingReview.rating,
                          comment: editingReview.comment,
                          authorName: editingReview.authorName,
                          productName: editingReview.productName
                        });
                        setReviewForm({
                          ...reviewForm,
                          adminReply: aiRes.suggestedReply
                        });
                        showToast(`Sentiment analyzed: ${aiRes.sentiment.toUpperCase()}`);
                      } catch (err: unknown) {
                        showToast(err instanceof Error ? err.message : 'AI drafting failed');
                      }
                    }}
                    className="flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Draft Reply with AI</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={reviewForm.adminReply}
                  onChange={(e) => setReviewForm({ ...reviewForm, adminReply: e.target.value })}
                  placeholder="Thank you for sharing your experience with our bespoke atelier..."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-end space-x-3">
              <button onClick={() => setIsReviewModal(false)} className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200">
                Cancel
              </button>
              <button
                onClick={handleSaveReview}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded text-sm transition"
              >
                Save Review Updates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. HOMEPAGE SECTION MODAL */}
      {isSectionModal && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-serif font-bold text-lg text-neutral-100">
                {editingSectionId ? 'Edit Homepage Section' : 'Add Homepage Section'}
              </h3>
              <button onClick={() => setIsSectionModal(false)} className="text-neutral-400 hover:text-neutral-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">Section Title</label>
                <input
                  type="text"
                  value={sectionForm.title}
                  onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                  placeholder="e.g. Featured Bespoke Blazers"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={sectionForm.subtitle}
                  onChange={(e) => setSectionForm({ ...sectionForm, subtitle: e.target.value })}
                  placeholder="e.g. Handcrafted from Super 130s Italian Virgin Wool"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Section Block Type</label>
                  <select
                    value={sectionForm.type}
                    onChange={(e) => setSectionForm({ ...sectionForm, type: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="featured_products">Featured Products</option>
                    <option value="category_grid">Category Showcase Grid</option>
                    <option value="banner_strip">Promotional Banner Strip</option>
                    <option value="tailoring_experience">Tailoring Experience Block</option>
                    <option value="reviews_slider">Customer Reviews Carousel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Sort Order</label>
                  <input
                    type="number"
                    min={1}
                    value={sectionForm.sortOrder}
                    onChange={(e) => setSectionForm({ ...sectionForm, sortOrder: Number(e.target.value) || 1 })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">Status</label>
                <select
                  value={sectionForm.status}
                  onChange={(e) => setSectionForm({ ...sectionForm, status: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="active">Active (Visible on homepage)</option>
                  <option value="inactive">Inactive (Hidden)</option>
                </select>
              </div>
            </div>
            <div className="pt-3 border-t border-neutral-800 flex justify-end space-x-3">
              <button onClick={() => setIsSectionModal(false)} className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200">
                Cancel
              </button>
              <button
                onClick={handleSaveSection}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded text-sm transition"
              >
                {editingSectionId ? 'Update Section' : 'Create Section'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. OFFER MODAL */}
      {isOfferModal && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-serif font-bold text-lg text-neutral-100">
                {editingOfferId ? 'Edit Promotional Offer' : 'Add New Offer'}
              </h3>
              <button onClick={() => setIsOfferModal(false)} className="text-neutral-400 hover:text-neutral-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">Offer Title</label>
                <input
                  type="text"
                  value={offerForm.name}
                  onChange={(e) => setOfferForm({ ...offerForm, name: e.target.value })}
                  placeholder="e.g. Wedding Season 20% Off"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Discount Type</label>
                  <select
                    value={offerForm.discountType}
                    onChange={(e) => setOfferForm({ ...offerForm, discountType: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (BDT)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Discount Value</label>
                  <input
                    type="number"
                    value={offerForm.discountValue}
                    onChange={(e) => setOfferForm({ ...offerForm, discountValue: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Min Spend (BDT)</label>
                  <input
                    type="number"
                    value={offerForm.minimumOrderAmount}
                    onChange={(e) => setOfferForm({ ...offerForm, minimumOrderAmount: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Promo Code (Optional)</label>
                  <input
                    type="text"
                    value={offerForm.code}
                    onChange={(e) => setOfferForm({ ...offerForm, code: e.target.value.toUpperCase() })}
                    placeholder="WEDDING20"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">Status</label>
                <select
                  value={offerForm.status}
                  onChange={(e) => setOfferForm({ ...offerForm, status: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="pt-3 border-t border-neutral-800 flex justify-end space-x-3">
              <button onClick={() => setIsOfferModal(false)} className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200">
                Cancel
              </button>
              <button
                onClick={handleSaveOffer}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded text-sm transition"
              >
                {editingOfferId ? 'Update Offer' : 'Save Offer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. BLOG ARTICLE MODAL */}
      {isBlogModal && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-serif font-bold text-lg text-neutral-100">
                {editingBlogId ? 'Edit Style Article' : 'Write Style Journal Article'}
              </h3>
              <button onClick={() => setIsBlogModal(false)} className="text-neutral-400 hover:text-neutral-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">Article Title</label>
                <input
                  type="text"
                  value={blogForm.title}
                  onChange={(e) => {
                    const val = e.target.value;
                    const auto = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                    setBlogForm({
                      ...blogForm,
                      title: val,
                      slug: editingBlogId ? blogForm.slug : auto
                    });
                  }}
                  placeholder="e.g. The Sartorial Guide to Black-Tie Galas"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs uppercase text-neutral-400">Slug URL</label>
                    <button
                      type="button"
                      onClick={() => {
                        const auto = (blogForm.title || 'article')
                          .toLowerCase()
                          .trim()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-+|-+$/g, '');
                        setBlogForm({ ...blogForm, slug: auto });
                      }}
                      className="text-[11px] text-amber-400 hover:text-amber-300 cursor-pointer"
                    >
                      Auto-Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    value={blogForm.slug}
                    onChange={(e) => {
                      const clean = e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^a-z0-9-_]/g, '');
                      setBlogForm({ ...blogForm, slug: clean });
                    }}
                    placeholder="sartorial-guide-black-tie"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Status</label>
                  <select
                    value={blogForm.status}
                    onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value as 'draft' | 'published' | 'scheduled' })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs uppercase text-neutral-400">Featured Image URL</label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenMediaPicker('blog')}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1"
                    >
                      <Folder className="w-3 h-3" />
                      <span>Choose Store Media</span>
                    </button>
                    <label className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer flex items-center space-x-1">
                      <Upload className="w-3 h-3" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await uploadLocalFileToStoreMedia(file, 'general');
                            if (url) setBlogForm((prev) => ({ ...prev, featuredImage: url }));
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                <input
                  type="text"
                  value={blogForm.featuredImage}
                  onChange={(e) => setBlogForm({ ...blogForm, featuredImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 font-mono text-xs focus:outline-none focus:border-amber-500"
                />
                {blogForm.featuredImage && (
                  <div className="mt-2 w-full h-24 rounded-lg overflow-hidden bg-neutral-950 border border-neutral-800">
                    <img src={blogForm.featuredImage} alt="Article preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">Short Excerpt</label>
                <input
                  type="text"
                  value={blogForm.excerpt}
                  onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                  placeholder="Summary for article previews..."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">Article Content</label>
                <textarea
                  rows={5}
                  value={blogForm.content}
                  onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                  placeholder="Full article body content..."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
            <div className="pt-3 border-t border-neutral-800 flex justify-end space-x-3">
              <button onClick={() => setIsBlogModal(false)} className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200">
                Cancel
              </button>
              <button
                onClick={handleSaveBlog}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded text-sm transition"
              >
                {editingBlogId ? 'Update Article' : 'Publish Article'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. PAGE MODAL */}
      {isPageModal && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-serif font-bold text-lg text-neutral-100">
                {editingPageId ? 'Edit CMS Page' : 'Create New CMS Page'}
              </h3>
              <button onClick={() => setIsPageModal(false)} className="text-neutral-400 hover:text-neutral-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">Page Title</label>
                <input
                  type="text"
                  value={pageForm.title}
                  onChange={(e) => {
                    const val = e.target.value;
                    const auto = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                    setPageForm({
                      ...pageForm,
                      title: val,
                      slug: editingPageId ? pageForm.slug : auto
                    });
                  }}
                  placeholder="e.g. Bespoke Heritage & Craftsmanship"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs uppercase text-neutral-400">Slug URL</label>
                    <button
                      type="button"
                      onClick={() => {
                        const auto = (pageForm.title || 'page')
                          .toLowerCase()
                          .trim()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-+|-+$/g, '');
                        setPageForm({ ...pageForm, slug: auto });
                      }}
                      className="text-[11px] text-amber-400 hover:text-amber-300 cursor-pointer"
                    >
                      Auto-Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    value={pageForm.slug}
                    onChange={(e) => {
                      const clean = e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^a-z0-9-_]/g, '');
                      setPageForm({ ...pageForm, slug: clean });
                    }}
                    placeholder="about-us"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Status</label>
                  <select
                    value={pageForm.status}
                    onChange={(e) => setPageForm({ ...pageForm, status: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">Page Content</label>
                <textarea
                  rows={6}
                  value={pageForm.content}
                  onChange={(e) => setPageForm({ ...pageForm, content: e.target.value })}
                  placeholder="Full text or HTML content of the page..."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
            <div className="pt-3 border-t border-neutral-800 flex justify-end space-x-3">
              <button onClick={() => setIsPageModal(false)} className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200">
                Cancel
              </button>
              <button
                onClick={handleSavePage}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded text-sm transition"
              >
                {editingPageId ? 'Update Page' : 'Save Page'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 12. MEDIA MODAL */}
      {isMediaModal && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-serif font-bold text-lg text-neutral-100">
                {editingMediaId ? 'Edit Media Details' : 'Add Media Asset'}
              </h3>
              <button onClick={() => setIsMediaModal(false)} className="text-neutral-400 hover:text-neutral-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">Asset Name</label>
                <input
                  type="text"
                  value={mediaForm.name}
                  onChange={(e) => setMediaForm({ ...mediaForm, name: e.target.value })}
                  placeholder="navy-wool-blazer-front.jpg"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs uppercase text-neutral-400">Image Source (URL or File Upload)</label>
                  <label className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer flex items-center space-x-1">
                    <Upload className="w-3 h-3" />
                    <span>Upload from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 8 * 1024 * 1024) return showToast('File exceeds 8MB size limit');
                        const reader = new FileReader();
                        reader.onload = () => {
                          setMediaForm((prev) => ({
                            ...prev,
                            name: prev.name.trim() ? prev.name : file.name,
                            url: reader.result as string
                          }));
                          showToast(`Loaded "${file.name}"`);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={mediaForm.url}
                  onChange={(e) => setMediaForm({ ...mediaForm, url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
              {mediaForm.url && (
                <div className="w-full h-32 rounded-lg overflow-hidden bg-neutral-950 border border-neutral-800">
                  <img src={mediaForm.url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">Folder Category</label>
                <select
                  value={mediaForm.folder}
                  onChange={(e) => setMediaForm({ ...mediaForm, folder: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="general">General</option>
                  <option value="products">Products</option>
                  <option value="banners">Banners</option>
                  <option value="lookbook">Lookbook</option>
                </select>
              </div>
            </div>
            <div className="pt-3 border-t border-neutral-800 flex justify-end space-x-3">
              <button onClick={() => setIsMediaModal(false)} className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200">
                Cancel
              </button>
              <button
                onClick={handleSaveMedia}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded text-sm transition"
              >
                {editingMediaId ? 'Update Media' : 'Save Media'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 13. STAFF ACCOUNT MODAL */}
      {isStaffModal && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-serif font-bold text-lg text-neutral-100">
                {editingAdminId ? 'Edit Staff Account' : 'Add Staff Administrator'}
              </h3>
              <button onClick={() => setIsStaffModal(false)} className="text-neutral-400 hover:text-neutral-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">Staff Full Name</label>
                <input
                  type="text"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  placeholder="e.g. Asif Mahmud"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    placeholder="staff@zippy.com.bd"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Phone</label>
                  <input
                    type="text"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    placeholder="+880 17..."
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">
                  {editingAdminId ? 'Password (Leave blank to keep unchanged)' : 'Initial Password'}
                </label>
                <input
                  type="password"
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  placeholder={editingAdminId ? '••••••••' : 'Enter strong password'}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Assigned Role</label>
                  <select
                    value={staffForm.roleId}
                    onChange={(e) => setStaffForm({ ...staffForm, roleId: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Status</label>
                  <select
                    value={staffForm.status}
                    onChange={(e) => setStaffForm({ ...staffForm, status: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-neutral-800 flex justify-end space-x-3">
              <button onClick={() => setIsStaffModal(false)} className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200">
                Cancel
              </button>
              <button
                onClick={handleSaveStaff}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded text-sm transition"
              >
                {editingAdminId ? 'Update Staff' : 'Create Staff'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 14. RBAC ROLE MODAL */}
      {isRoleModal && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-serif font-bold text-lg text-neutral-100">
                {editingRoleId ? 'Edit RBAC Role' : 'Create RBAC Role'}
              </h3>
              <button onClick={() => setIsRoleModal(false)} className="text-neutral-400 hover:text-neutral-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">Role Identifier / Key</label>
                <input
                  type="text"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  placeholder="e.g. inventory_manager"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  placeholder="Describe role responsibilities and privileges..."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-2">Permissions</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'products.manage', label: 'Products & Catalog' },
                    { id: 'orders.manage', label: 'Orders & Fulfillment' },
                    { id: 'inventory.manage', label: 'Inventory & Stock' },
                    { id: 'cms.manage', label: 'Banners, Sections & CMS' },
                    { id: 'settings.manage', label: 'Website Settings & Admins' }
                  ].map((perm) => {
                    const isChecked = roleForm.permissions.includes(perm.id);
                    return (
                      <label key={perm.id} className="flex items-center space-x-2 bg-neutral-950 p-2 rounded border border-neutral-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRoleForm({ ...roleForm, permissions: [...roleForm.permissions, perm.id] });
                            } else {
                              setRoleForm({ ...roleForm, permissions: roleForm.permissions.filter((p) => p !== perm.id) });
                            }
                          }}
                          className="accent-amber-500"
                        />
                        <span className="text-neutral-300">{perm.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-neutral-800 flex justify-end space-x-3">
              <button onClick={() => setIsRoleModal(false)} className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200">
                Cancel
              </button>
              <button
                onClick={handleSaveRole}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded text-sm transition"
              >
                {editingRoleId ? 'Update Role' : 'Save Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE COUPON MODAL */}
      {isCouponModal && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-serif font-bold text-lg text-neutral-100">Create New Coupon</h3>
            <div>
              <label className="block text-xs uppercase text-neutral-400 mb-1">Coupon Code</label>
              <input
                type="text"
                value={couponForm.code}
                onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                placeholder="PROMO2026"
                className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">Discount %</label>
                <input
                  type="number"
                  value={couponForm.discountValue}
                  onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">Min Spend (BDT)</label>
                <input
                  type="number"
                  value={couponForm.minSpend}
                  onChange={(e) => setCouponForm({ ...couponForm, minSpend: Number(e.target.value) })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase text-neutral-400 mb-1">Description</label>
              <input
                type="text"
                value={couponForm.description}
                onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                placeholder="Spring festival seasonal discount"
                className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100"
              />
            </div>
            <div className="pt-3 border-t border-neutral-800 flex justify-end space-x-3">
              <button onClick={() => setIsCouponModal(false)} className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200">
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await api.createCoupon({
                      code: couponForm.code,
                      discountValue: couponForm.discountValue,
                      discountPercent: couponForm.discountValue,
                      discountType: 'percent',
                      minOrder: couponForm.minSpend,
                      minSpend: couponForm.minSpend,
                      description: couponForm.description || `${couponForm.discountValue}% Off Promo`
                    });
                    showToast('Coupon created');
                    setIsCouponModal(false);
                    loadDataForTab('Coupons');
                  } catch (err: unknown) {
                    showToast(err instanceof Error ? err.message : 'Error creating coupon');
                  }
                }}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded text-sm"
              >
                Save Coupon
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT GATEWAY CONFIGURATION MODAL */}
      {isPaymentModal && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif font-bold text-lg text-neutral-100">
                  {editingPaymentId ? `Configure ${paymentForm.name || 'Payment Gateway'}` : 'Add New Payment Gateway'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModal(false)}
                className="text-neutral-400 hover:text-neutral-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Section 1: Basic Gateway Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                1. Gateway Identity & Status
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Gateway Display Name *</label>
                  <input
                    type="text"
                    value={paymentForm.name || ''}
                    onChange={(e) => setPaymentForm({ ...paymentForm, name: e.target.value })}
                    placeholder="e.g. bKash Online Payment"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Gateway Code (Unique ID) *</label>
                  <input
                    type="text"
                    value={paymentForm.code || ''}
                    onChange={(e) => setPaymentForm({ ...paymentForm, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. BKASH"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 font-mono uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Gateway Type</label>
                  <select
                    value={paymentForm.type || 'gateway'}
                    onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value as any })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="gateway">Direct Gateway (SSLCommerz/Cards)</option>
                    <option value="mobile_banking">Mobile Banking (bKash/Nagad)</option>
                    <option value="cod">Cash on Delivery (COD)</option>
                    <option value="bank_transfer">Bank Wire / EFT Transfer</option>
                    <option value="custom">Custom Payment Method</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Checkout Status</label>
                  <select
                    value={paymentForm.status || 'active'}
                    onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value as any })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="active">Active (Visible at Checkout)</option>
                    <option value="inactive">Inactive (Disabled)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Environment Mode</label>
                  <select
                    value={paymentForm.testMode ? 'true' : 'false'}
                    onChange={(e) => setPaymentForm({ ...paymentForm, testMode: e.target.value === 'true' })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="true">Sandbox / Test Mode</option>
                    <option value="false">Live Production</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Checkout Badge / Promo Text</label>
                  <input
                    type="text"
                    value={paymentForm.badge || ''}
                    onChange={(e) => setPaymentForm({ ...paymentForm, badge: e.target.value })}
                    placeholder="e.g. Instant 1.5% Cashback"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Short Description</label>
                  <input
                    type="text"
                    value={paymentForm.description || ''}
                    onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                    placeholder="e.g. Pay directly with your verified bKash wallet"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Credentials & API Settings */}
            {paymentForm.type !== 'cod' && (
              <div className="space-y-3 pt-3 border-t border-neutral-800">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  <span>2. API Credentials & Connection Endpoints</span>
                </h4>

                {paymentForm.type === 'mobile_banking' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs uppercase text-neutral-400 mb-1">Merchant Phone Number</label>
                        <input
                          type="text"
                          value={paymentForm.accountNumber || ''}
                          onChange={(e) => setPaymentForm({ ...paymentForm, accountNumber: e.target.value })}
                          placeholder="e.g. 01700000000"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase text-neutral-400 mb-1">Account Type</label>
                        <select
                          value={paymentForm.accountType || 'Merchant'}
                          onChange={(e) => setPaymentForm({ ...paymentForm, accountType: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                        >
                          <option value="Merchant">Merchant Account</option>
                          <option value="Personal">Personal Account</option>
                          <option value="Agent">Agent Account</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs uppercase text-neutral-400 mb-1">App Key / Merchant ID</label>
                        <input
                          type="text"
                          value={paymentForm.appKey || ''}
                          onChange={(e) => setPaymentForm({ ...paymentForm, appKey: e.target.value })}
                          placeholder="bka_app_key_..."
                          className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase text-neutral-400 mb-1">App Secret</label>
                        <input
                          type="password"
                          value={paymentForm.appSecret || ''}
                          onChange={(e) => setPaymentForm({ ...paymentForm, appSecret: e.target.value })}
                          placeholder="••••••••••••"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs uppercase text-neutral-400 mb-1">API Username</label>
                        <input
                          type="text"
                          value={paymentForm.username || ''}
                          onChange={(e) => setPaymentForm({ ...paymentForm, username: e.target.value })}
                          placeholder="API username"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase text-neutral-400 mb-1">API Password</label>
                        <input
                          type="password"
                          value={paymentForm.password || ''}
                          onChange={(e) => setPaymentForm({ ...paymentForm, password: e.target.value })}
                          placeholder="••••••••••••"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(paymentForm.type === 'gateway' || paymentForm.type === 'custom') && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs uppercase text-neutral-400 mb-1">Store ID / Merchant ID</label>
                        <input
                          type="text"
                          value={paymentForm.storeId || ''}
                          onChange={(e) => setPaymentForm({ ...paymentForm, storeId: e.target.value })}
                          placeholder="e.g. zippybd_live"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase text-neutral-400 mb-1">Store Password / Secret Key</label>
                        <input
                          type="password"
                          value={paymentForm.storePassword || ''}
                          onChange={(e) => setPaymentForm({ ...paymentForm, storePassword: e.target.value })}
                          placeholder="••••••••••••"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs uppercase text-neutral-400 mb-1">API Key (Optional)</label>
                        <input
                          type="text"
                          value={paymentForm.apiKey || ''}
                          onChange={(e) => setPaymentForm({ ...paymentForm, apiKey: e.target.value })}
                          placeholder="API Key"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase text-neutral-400 mb-1">Webhook Secret / IPN Key</label>
                        <input
                          type="password"
                          value={paymentForm.webhookSecret || ''}
                          onChange={(e) => setPaymentForm({ ...paymentForm, webhookSecret: e.target.value })}
                          placeholder="Webhook signing secret"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs uppercase text-neutral-400 mb-1">Sandbox Endpoint URL</label>
                        <input
                          type="text"
                          value={paymentForm.sandboxEndpoint || ''}
                          onChange={(e) => setPaymentForm({ ...paymentForm, sandboxEndpoint: e.target.value })}
                          placeholder="https://sandbox.gateway.com/api"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase text-neutral-400 mb-1">Live Endpoint URL</label>
                        <input
                          type="text"
                          value={paymentForm.liveEndpoint || ''}
                          onChange={(e) => setPaymentForm({ ...paymentForm, liveEndpoint: e.target.value })}
                          placeholder="https://secure.gateway.com/api"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentForm.type === 'bank_transfer' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs uppercase text-neutral-400 mb-1">Bank Name</label>
                        <input
                          type="text"
                          value={paymentForm.bankName || ''}
                          onChange={(e) => setPaymentForm({ ...paymentForm, bankName: e.target.value })}
                          placeholder="e.g. City Bank Ltd"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase text-neutral-400 mb-1">Account Number</label>
                        <input
                          type="text"
                          value={paymentForm.accountNumber || ''}
                          onChange={(e) => setPaymentForm({ ...paymentForm, accountNumber: e.target.value })}
                          placeholder="1102839201928"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs uppercase text-neutral-400 mb-1">Branch Name</label>
                        <input
                          type="text"
                          value={paymentForm.branchName || ''}
                          onChange={(e) => setPaymentForm({ ...paymentForm, branchName: e.target.value })}
                          placeholder="Gulshan Branch"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase text-neutral-400 mb-1">Routing Number</label>
                        <input
                          type="text"
                          value={paymentForm.routingNumber || ''}
                          onChange={(e) => setPaymentForm({ ...paymentForm, routingNumber: e.target.value })}
                          placeholder="225272671"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase text-neutral-400 mb-1">SWIFT Code</label>
                        <input
                          type="text"
                          value={paymentForm.swiftCode || ''}
                          onChange={(e) => setPaymentForm({ ...paymentForm, swiftCode: e.target.value })}
                          placeholder="CIBLBDDH"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Section 3: Fees & Limits */}
            <div className="space-y-3 pt-3 border-t border-neutral-800">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                3. Transaction Fees & Order Limits
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Fee / Surcharge (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentForm.additionalFee || 0}
                    onChange={(e) => setPaymentForm({ ...paymentForm, additionalFee: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Min Order (৳)</label>
                  <input
                    type="number"
                    value={paymentForm.minOrderAmount || 0}
                    onChange={(e) => setPaymentForm({ ...paymentForm, minOrderAmount: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Max Order (৳)</label>
                  <input
                    type="number"
                    value={paymentForm.maxOrderAmount || 0}
                    onChange={(e) => setPaymentForm({ ...paymentForm, maxOrderAmount: Number(e.target.value) })}
                    placeholder="0 for unlimited"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">Display Sort Order</label>
                  <input
                    type="number"
                    value={paymentForm.sortOrder || 0}
                    onChange={(e) => setPaymentForm({ ...paymentForm, sortOrder: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Customer Instructions */}
            <div className="space-y-2 pt-3 border-t border-neutral-800">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                4. Customer Checkout Instructions
              </h4>
              <p className="text-[11px] text-neutral-400">
                This text is clearly displayed to customers on the checkout page when they choose this payment option.
              </p>
              <textarea
                rows={3}
                value={paymentForm.instructions || ''}
                onChange={(e) => setPaymentForm({ ...paymentForm, instructions: e.target.value })}
                placeholder="e.g. You will be redirected to the secure bKash checkout page to enter your PIN and OTP."
                className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                {editingPaymentId && paymentForm.type !== 'cod' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (editingPaymentId) {
                        const pm = paymentMethods.find((p) => p.id === editingPaymentId);
                        if (pm) handleTestPayment({ ...pm, ...paymentForm } as PaymentMethodConfig);
                      }
                    }}
                    disabled={Boolean(testingPaymentId)}
                    className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1.5 font-medium transition cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Test Current Credentials</span>
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsPaymentModal(false)}
                  className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePayment}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold rounded-lg text-sm shadow-md transition active:scale-95 cursor-pointer"
                >
                  {editingPaymentId ? 'Update Gateway' : 'Save Gateway'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INQUIRY REPLY MODAL */}
      {isInquiryReplyModal && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
              <h3 className="font-serif font-bold text-lg text-neutral-100">Reply to Inquiry</h3>
              <button
                type="button"
                onClick={async () => {
                  const inq = inquiries.find((i) => i.id === activeInquiryId);
                  if (!inq) return;
                  try {
                    const aiRes = await api.aiSuggestInquiryReply({
                      inquiryId: inq.id,
                      customerName: inq.name,
                      customerEmail: inq.email,
                      customerMessage: inq.message,
                      productName: inq.productName
                    });
                    setInquiryReplyText(aiRes.reply);
                    showToast('Generated bespoke reply with AI!');
                  } catch (err: unknown) {
                    showToast(err instanceof Error ? err.message : 'AI suggestion failed');
                  }
                }}
                className="flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Suggest with AI</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={inquiryReplyText}
              onChange={(e) => setInquiryReplyText(e.target.value)}
              placeholder="Write response to customer..."
              className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100"
            />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setIsInquiryReplyModal(false)} className="px-4 py-2 text-sm text-neutral-400">
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!activeInquiryId || !inquiryReplyText) return;
                  try {
                    await api.replyInquiry(activeInquiryId, inquiryReplyText);
                    showToast('Reply recorded');
                    setIsInquiryReplyModal(false);
                    loadDataForTab('Inquiries');
                  } catch (err: unknown) {
                    showToast(err instanceof Error ? err.message : 'Error replying');
                  }
                }}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded text-sm"
              >
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BROADCAST NOTIFICATION MODAL */}
      {isNotificationModal && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-serif font-bold text-lg text-neutral-100">Broadcast Notification</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">Channel</label>
                <select
                  value={notifForm.channel}
                  onChange={(e) => setNotifForm({ ...notifForm, channel: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="push">Push Notification</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">Event</label>
                <input
                  type="text"
                  value={notifForm.event}
                  onChange={(e) => setNotifForm({ ...notifForm, event: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase text-neutral-400 mb-1">Message Body</label>
              <textarea
                rows={3}
                value={notifForm.message}
                onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })}
                placeholder="Seasonal collection is now live at all Zippy boutiques."
                className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setIsNotificationModal(false)} className="px-4 py-2 text-sm text-neutral-400">
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await api.sendNotification(notifForm);
                    showToast('Notification broadcast successfully');
                    setIsNotificationModal(false);
                    loadDataForTab('Notifications');
                  } catch (err: unknown) {
                    showToast(err instanceof Error ? err.message : 'Error sending notification');
                  }
                }}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded text-sm"
              >
                Broadcast
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BANNER CUSTOMIZATION MODAL */}
      {isBannerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 w-full max-w-2xl my-8 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif font-bold text-lg text-neutral-100">
                  {editingBannerId ? 'Customize Banner' : 'Create New Banner'}
                </h3>
              </div>
              <button
                onClick={() => setIsBannerModal(false)}
                className="text-neutral-400 hover:text-neutral-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Banner Preview Card */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-semibold mb-1.5">
                Live Storefront Preview
              </label>
              <div className="relative w-full h-36 rounded-lg overflow-hidden bg-neutral-950 border border-neutral-800 shadow-inner flex items-center">
                <img
                  src={bannerForm.imageDesktop}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full object-cover brightness-[0.78]"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1800&auto=format&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                <div className="relative z-10 p-5 max-w-md text-white">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-amber-400 block mb-1">
                    {bannerForm.position === 'hero' ? 'Storefront Hero' : bannerForm.position.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <h4 className="font-serif font-bold text-base sm:text-lg leading-tight text-white drop-shadow">
                    {bannerForm.title || 'Banner Title Here'}
                  </h4>
                  <p className="text-xs text-neutral-200/90 line-clamp-1 mt-1 drop-shadow-xs">
                    {bannerForm.subtitle || 'Campaign subtitle or promotional description...'}
                  </p>
                  {bannerForm.buttonText && (
                    <div className="mt-2.5 inline-flex items-center space-x-1.5 px-3 py-1 bg-white text-neutral-950 font-bold text-[10px] uppercase tracking-wider rounded-xs shadow">
                      <span>{bannerForm.buttonText}</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">
                  Banner Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  placeholder="e.g. THE ART OF TAILORING"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:border-amber-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={bannerForm.subtitle}
                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  placeholder="e.g. Hand-tailored from Super 130s Italian virgin wool"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:border-amber-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Position, Sort Order & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">Placement Position</label>
                <select
                  value={bannerForm.position}
                  onChange={(e) => setBannerForm({ ...bannerForm, position: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:border-amber-500 focus:outline-hidden"
                >
                  <option value="hero">Storefront Hero Slider</option>
                  <option value="promotional_banner">Promotional Banner</option>
                  <option value="home_sub_banner">Home Sub Banner</option>
                  <option value="collection_banner">Collection Header Banner</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">Sort Order</label>
                <input
                  type="number"
                  min={1}
                  value={bannerForm.sortOrder}
                  onChange={(e) => setBannerForm({ ...bannerForm, sortOrder: parseInt(e.target.value) || 1 })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:border-amber-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">Publish Status</label>
                <select
                  value={bannerForm.status}
                  onChange={(e) => setBannerForm({ ...bannerForm, status: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:border-amber-500 focus:outline-hidden"
                >
                  <option value="active">Active (Visible)</option>
                  <option value="inactive">Inactive (Hidden)</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
            </div>

            {/* Desktop Image URL & Quick Presets */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs uppercase text-neutral-400">
                  Desktop Image URL <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleOpenMediaPicker('bannerDesktop')}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1"
                  >
                    <Folder className="w-3 h-3" />
                    <span>Choose Store Media</span>
                  </button>
                  <label className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer flex items-center space-x-1">
                    <Upload className="w-3 h-3" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await uploadLocalFileToStoreMedia(file, 'banners');
                          if (url) setBannerForm((prev) => ({ ...prev, imageDesktop: url }));
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              <input
                type="text"
                value={bannerForm.imageDesktop}
                onChange={(e) => setBannerForm({ ...bannerForm, imageDesktop: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:border-amber-500 focus:outline-hidden"
              />
              <div className="mt-2 flex items-center space-x-2 text-[11px] text-neutral-400 overflow-x-auto pb-1">
                <span className="shrink-0 text-neutral-500">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() =>
                    setBannerForm({
                      ...bannerForm,
                      imageDesktop:
                        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1800&auto=format&fit=crop'
                    })
                  }
                  className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded whitespace-nowrap"
                >
                  Suits & Blazers
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setBannerForm({
                      ...bannerForm,
                      imageDesktop:
                        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1800&auto=format&fit=crop'
                    })
                  }
                  className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded whitespace-nowrap"
                >
                  Royal Panjabi
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setBannerForm({
                      ...bannerForm,
                      imageDesktop:
                        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1800&auto=format&fit=crop'
                    })
                  }
                  className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded whitespace-nowrap"
                >
                  Executive Shirts
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setBannerForm({
                      ...bannerForm,
                      imageDesktop:
                        'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1800&auto=format&fit=crop'
                    })
                  }
                  className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded whitespace-nowrap"
                >
                  Leather Footwear
                </button>
              </div>
            </div>

            {/* Mobile Image URL */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs uppercase text-neutral-400">Mobile Image URL (Optional)</label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleOpenMediaPicker('bannerMobile')}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1"
                  >
                    <Folder className="w-3 h-3" />
                    <span>Choose Store Media</span>
                  </button>
                  <label className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer flex items-center space-x-1">
                    <Upload className="w-3 h-3" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await uploadLocalFileToStoreMedia(file, 'banners');
                          if (url) setBannerForm((prev) => ({ ...prev, imageMobile: url }));
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              <input
                type="text"
                value={bannerForm.imageMobile}
                onChange={(e) => setBannerForm({ ...bannerForm, imageMobile: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            {/* Button Text & Button URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">CTA Button Text</label>
                <input
                  type="text"
                  value={bannerForm.buttonText}
                  onChange={(e) => setBannerForm({ ...bannerForm, buttonText: e.target.value })}
                  placeholder="e.g. Shop Collection"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:border-amber-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">CTA Button Link URL</label>
                <input
                  type="text"
                  value={bannerForm.buttonUrl}
                  onChange={(e) => setBannerForm({ ...bannerForm, buttonUrl: e.target.value })}
                  placeholder="e.g. /shop?category=blazer"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:border-amber-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Start Date & End Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">Active Start Date (Optional)</label>
                <input
                  type="date"
                  value={bannerForm.startDate}
                  onChange={(e) => setBannerForm({ ...bannerForm, startDate: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:border-amber-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">Active End Date (Optional)</label>
                <input
                  type="date"
                  value={bannerForm.endDate}
                  onChange={(e) => setBannerForm({ ...bannerForm, endDate: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:border-amber-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setIsBannerModal(false)}
                className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBanner}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-5 py-2 rounded text-sm transition shadow-md"
              >
                {editingBannerId ? 'Save Customization' : 'Create Banner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 21. HEADER NAV LINK MODAL */}
      {isNavModal && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center space-x-2">
                <Compass className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif font-bold text-lg text-neutral-100">
                  {editingNavIndex !== null ? 'Edit Navigation Item' : 'Add Navigation Item'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNavModal(false)}
                className="text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">
                  Menu Item Label <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={navForm.label}
                  onChange={(e) => setNavForm({ ...navForm, label: e.target.value })}
                  placeholder="e.g. BLAZER or SPECIAL SALE"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 font-semibold uppercase"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">
                  Destination URL / Route <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={navForm.url}
                  onChange={(e) => setNavForm({ ...navForm, url: e.target.value })}
                  placeholder="e.g. /shop/blazer or /stores"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 font-mono"
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-neutral-500 mr-1">Quick Suggestions:</span>
                  {[
                    { l: 'HOME', u: '/' },
                    { l: 'SALE', u: '/shop/sale' },
                    { l: 'NEW', u: '/shop/new-arrivals' },
                    { l: 'BLAZER', u: '/shop/blazer' },
                    { l: 'SHIRT', u: '/shop/shirt' },
                    { l: 'POLO', u: '/shop/polo' },
                    { l: 'PANT', u: '/shop/pant' },
                    { l: 'ETHNIC', u: '/shop/ethnic-wear' },
                    { l: 'ACCESSORIES', u: '/shop/accessories' },
                    { l: 'STORES', u: '/stores' },
                    { l: 'TRACK ORDER', u: '/track-order' }
                  ].map((sugg) => (
                    <button
                      key={sugg.u}
                      type="button"
                      onClick={() => setNavForm({
                        ...navForm,
                        url: sugg.u,
                        label: navForm.label || sugg.l,
                        slug: sugg.u.replace('/shop/', '').replace('/', '')
                      })}
                      className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[10px] transition"
                    >
                      {sugg.l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">
                  Highlight Badge (Optional)
                </label>
                <input
                  type="text"
                  value={navForm.badge || ''}
                  onChange={(e) => setNavForm({ ...navForm, badge: e.target.value })}
                  placeholder="e.g. UP TO 35% or HOT or NEW"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 border-t border-neutral-800 space-y-2">
                <label className="flex items-center space-x-2 text-xs text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={navForm.highlight || false}
                    onChange={(e) => setNavForm({ ...navForm, highlight: e.target.checked })}
                    className="rounded bg-neutral-950 border-neutral-700 text-amber-500 focus:ring-0"
                  />
                  <span>Highlight in Burgundy Red (Sale Accent)</span>
                </label>

                <label className="flex items-center space-x-2 text-xs text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={navForm.openInNewTab || false}
                    onChange={(e) => setNavForm({ ...navForm, openInNewTab: e.target.checked })}
                    className="rounded bg-neutral-950 border-neutral-700 text-amber-500 focus:ring-0"
                  />
                  <span>Open link in new browser tab</span>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsNavModal(false)}
                className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNavItem}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded text-sm transition"
              >
                {editingNavIndex !== null ? 'Update Navigation Link' : 'Add Navigation Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 22. FOOTER PILLAR MODAL */}
      {isPillarModal && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif font-bold text-lg text-neutral-100">
                  {editingPillarIndex !== null ? 'Edit Pillar of Excellence' : 'Add Pillar of Excellence'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPillarModal(false)}
                className="text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1.5">
                  Select Pillar Icon
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'truck', label: 'Delivery', icon: Truck },
                    { id: 'shield', label: 'Tailoring', icon: ShieldCheck },
                    { id: 'refresh', label: 'Exchange', icon: RefreshCw },
                    { id: 'phone', label: 'Concierge', icon: Phone },
                    { id: 'star', label: 'Quality', icon: Star },
                    { id: 'award', label: 'Heritage', icon: Award },
                    { id: 'clock', label: 'Dispatch', icon: Clock },
                    { id: 'heart', label: 'Care', icon: Heart }
                  ].map((ic) => {
                    const IcComponent = ic.icon;
                    const isSelected = (pillarForm.icon || 'truck').toLowerCase() === ic.id;
                    return (
                      <button
                        key={ic.id}
                        type="button"
                        onClick={() => setPillarForm({ ...pillarForm, icon: ic.id })}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs transition ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <IcComponent className="w-4 h-4 mb-1" />
                        <span className="text-[10px]">{ic.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">
                  Pillar Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={pillarForm.title}
                  onChange={(e) => setPillarForm({ ...pillarForm, title: e.target.value })}
                  placeholder="e.g. Complimentary Delivery"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={pillarForm.description}
                  onChange={(e) => setPillarForm({ ...pillarForm, description: e.target.value })}
                  placeholder="e.g. On all Dhaka orders exceeding ৳3,000. Nationwide courier dispatch."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsPillarModal(false)}
                className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePillar}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded text-sm transition"
              >
                {editingPillarIndex !== null ? 'Update Pillar' : 'Add Pillar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 23. FOOTER COLUMN LINK MODAL */}
      {isColLinkModal && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center space-x-2">
                <FolderTree className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif font-bold text-lg text-neutral-100">
                  {editingColIndex !== null ? 'Edit Footer Link' : 'Add Footer Link'} ({editingColKey === 'col1' ? 'Column 1' : 'Column 2'})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsColLinkModal(false)}
                className="text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">
                  Link Text <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={colLinkForm.label}
                  onChange={(e) => setColLinkForm({ ...colLinkForm, label: e.target.value })}
                  placeholder="e.g. Italian Wool Blazers or Bespoke Size Guide"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">
                  Destination URL / Anchor <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={colLinkForm.url}
                  onChange={(e) => setColLinkForm({ ...colLinkForm, url: e.target.value })}
                  placeholder="e.g. /shop/blazer or #size-guide"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 font-mono"
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-neutral-500 mr-1">Quick Suggestions:</span>
                  {[
                    { l: 'Blazers', u: '/shop/blazer' },
                    { l: 'Shirts', u: '/shop/shirt' },
                    { l: 'Panjabis', u: '/shop/ethnic-wear' },
                    { l: 'Polos', u: '/shop/polo' },
                    { l: 'Pants', u: '/shop/pant' },
                    { l: 'Accessories', u: '/shop/accessories' },
                    { l: 'Sale Privileges', u: '/shop/sale' },
                    { l: 'Track Order', u: '/track-order' },
                    { l: 'Size Guide', u: '#size-guide' },
                    { l: 'Stores', u: '/stores' },
                    { l: 'About Heritage', u: '/about' },
                    { l: 'FAQ', u: '/faq' },
                    { l: 'Returns', u: '/returns' }
                  ].map((sugg) => (
                    <button
                      key={sugg.u}
                      type="button"
                      onClick={() => setColLinkForm({
                        ...colLinkForm,
                        url: sugg.u,
                        label: colLinkForm.label || sugg.l
                      })}
                      className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[10px] transition"
                    >
                      {sugg.l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800 space-y-2">
                <label className="flex items-center space-x-2 text-xs text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={colLinkForm.highlight || false}
                    onChange={(e) => setColLinkForm({ ...colLinkForm, highlight: e.target.checked })}
                    className="rounded bg-neutral-950 border-neutral-700 text-amber-500 focus:ring-0"
                  />
                  <span>Highlight in red (e.g. Sale Privilege)</span>
                </label>

                <label className="flex items-center space-x-2 text-xs text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={colLinkForm.openInNewTab || false}
                    onChange={(e) => setColLinkForm({ ...colLinkForm, openInNewTab: e.target.checked })}
                    className="rounded bg-neutral-950 border-neutral-700 text-amber-500 focus:ring-0"
                  />
                  <span>Open in new browser tab</span>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsColLinkModal(false)}
                className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveColLink}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded text-sm transition"
              >
                {editingColIndex !== null ? 'Update Link' : 'Add Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STORE MEDIA PICKER MODAL */}
      {isMediaPickerOpen && (
        <div className="fixed inset-0 bg-neutral-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl p-6 space-y-4 max-h-[90vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/30 text-amber-400">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-neutral-100">
                    Store Media Library
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Select a photo from store media or upload a new photo from your device.
                    {mediaPickerTarget && (
                      <span className="ml-2 px-2 py-0.5 rounded bg-neutral-800 text-amber-400 text-[10px] font-mono">
                        Target: {mediaPickerTarget}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMediaPickerOpen(false)}
                className="text-neutral-400 hover:text-neutral-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search store media by name..."
                  value={mediaPickerSearch}
                  onChange={(e) => setMediaPickerSearch(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Folder filters */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['all', 'products', 'banners', 'lookbook', 'general'].map((fld) => (
                  <button
                    key={fld}
                    type="button"
                    onClick={() => setMediaPickerFolder(fld)}
                    className={`px-2.5 py-1 rounded text-xs capitalize transition ${
                      mediaPickerFolder === fld
                        ? 'bg-amber-500 text-neutral-950 font-bold'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-neutral-700/60'
                    }`}
                  >
                    {fld}
                  </button>
                ))}
              </div>

              {/* Upload to Media Library button */}
              <label className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded-lg text-xs font-bold cursor-pointer transition shrink-0 shadow">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (!files || files.length === 0) return;
                    setIsUploadingMedia(true);
                    try {
                      for (let i = 0; i < files.length; i++) {
                        const targetFolder = mediaPickerFolder === 'all' ? 'products' : mediaPickerFolder;
                        const url = await uploadLocalFileToStoreMedia(files[i], targetFolder);
                        if (url && i === files.length - 1) {
                          handleSelectMedia(url);
                        }
                      }
                    } finally {
                      setIsUploadingMedia(false);
                      e.target.value = '';
                    }
                  }}
                />
              </label>
            </div>

            {/* Media Items Grid */}
            <div className="flex-1 overflow-y-auto min-h-[300px] border border-neutral-800 rounded-xl p-3 bg-neutral-950/50">
              {(() => {
                const filtered = mediaList.filter((m) => {
                  const matchesSearch = !mediaPickerSearch.trim() ||
                    m.name.toLowerCase().includes(mediaPickerSearch.toLowerCase()) ||
                    m.url.toLowerCase().includes(mediaPickerSearch.toLowerCase());
                  const matchesFolder = mediaPickerFolder === 'all' || m.folder === mediaPickerFolder;
                  return matchesSearch && matchesFolder;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-500 space-y-2">
                      <ImageIcon className="w-10 h-10 text-neutral-600 mx-auto" />
                      <p className="text-sm font-medium text-neutral-400">No media found</p>
                      <p className="text-xs text-neutral-600">
                        Try changing the search filter or folder, or click "Upload New" above to add store photos.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {filtered.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectMedia(item.url)}
                        className="group relative bg-neutral-900 border border-neutral-800 hover:border-amber-500 rounded-lg overflow-hidden cursor-pointer transition shadow hover:shadow-lg flex flex-col justify-between"
                      >
                        <div className="aspect-square w-full bg-neutral-950 overflow-hidden relative">
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <span className="px-2.5 py-1 bg-amber-500 text-neutral-950 text-xs font-bold rounded shadow">
                              Choose
                            </span>
                          </div>
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-neutral-900/80 text-[9px] uppercase tracking-wider text-amber-400 font-mono">
                            {item.folder || 'general'}
                          </span>
                        </div>
                        <div className="p-2 bg-neutral-900">
                          <p className="text-[11px] text-neutral-200 truncate font-mono font-medium" title={item.name}>
                            {item.name}
                          </p>
                          <p className="text-[10px] text-neutral-500">
                            {item.size ? `${(item.size / 1024).toFixed(0)} KB` : 'Store Media'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between shrink-0">
              <span className="text-xs text-neutral-500">
                {mediaList.length} store media item(s) total
              </span>
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(false)}
                className="px-4 py-1.5 text-xs text-neutral-300 hover:text-neutral-100 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
