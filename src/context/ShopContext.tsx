import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Category,
  CartItem,
  Order,
  Coupon,
  StoreLocation,
  User,
  ProductSize,
  ColorVariant,
  OrderStatus,
  PaymentMethod,
  WebsiteSettings,
  Offer
} from '../types';
import {
  INITIAL_PRODUCTS,
  CATEGORIES,
  STORES,
  INITIAL_COUPONS,
  INITIAL_ORDERS
} from '../data/mockData';
import { api, setToken } from '../api/client';
import { applyHash, parseLocation } from '../utils/routes';

export const DEFAULT_OFFERS: Offer[] = [
  {
    id: 'offer-campaign-eid',
    name: 'Eid Royal Splendor Campaign',
    offerType: 'campaign',
    code: 'EID20',
    discountType: 'percentage_discount',
    discountValue: 20,
    minimumOrderAmount: 4000,
    badge: 'EID CAMPAIGN',
    description: 'Enjoy 20% privilege savings on bespoke menswear for Eid gatherings on orders exceeding αº│4,000.',
    isAutomatic: false,
    status: 'active'
  },
  {
    id: 'offer-bundle-duo',
    name: 'Sartorial Duo: Buy 2+ Items Get 15% Off',
    offerType: 'bundle',
    discountType: 'bundle_discount',
    discountValue: 15,
    bundleQty: 2,
    bundleReward: 'percent_off',
    badge: 'BUNDLE & SAVE',
    description: 'Curate your wardrobe with any 2 or more garments and automatically receive 15% bundle savings.',
    isAutomatic: true,
    status: 'active'
  },
  {
    id: 'offer-seasonal-wedding',
    name: 'Wedding Season Celebration',
    offerType: 'seasonal',
    code: 'WEDDING2026',
    discountType: 'fixed_discount',
    discountValue: 1000,
    minimumOrderAmount: 6000,
    badge: 'WEDDING PRIVILEGE',
    description: 'Flat αº│1,000 celebratory discount on heritage blazers and regal ethnic sets on orders above αº│6,000.',
    isAutomatic: false,
    status: 'active'
  },
  {
    id: 'offer-free-ship',
    name: 'Complimentary Atelier Delivery over αº│3,000',
    offerType: 'free_shipping',
    discountType: 'free_shipping',
    discountValue: 0,
    minimumOrderAmount: 3000,
    badge: 'FREE DELIVERY',
    description: 'Complimentary express doorstep delivery across Dhaka on all orders exceeding αº│3,000.',
    isAutomatic: true,
    status: 'active'
  }
];

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

interface ShopContextType {
  // Navigation & View
  activeView: string;
  setActiveView: (view: string) => void;
  selectedCategorySlug: string | null;
  setSelectedCategorySlug: (slug: string | null) => void;
  selectedProductSlug: string | null;
  setSelectedProductSlug: (slug: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  navigateToCategory: (slug: string) => void;
  navigateToProduct: (slug: string) => void;

  // Catalog
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Category[];
  stores: StoreLocation[];
  addProduct: (product: Omit<Product, 'id'> | (Partial<Product> & { name: string; sku: string; categoryId: string; price: number })) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Cart
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, size: ProductSize, color: ColorVariant, quantity?: number) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartItemCount: number;
  shippingFee: number;
  shippingLocation: 'inside_dhaka' | 'outside_dhaka';
  setShippingLocation: (loc: 'inside_dhaka' | 'outside_dhaka') => void;
  freeShippingThreshold: number;
  shippingInsideDhaka: number;
  shippingOutsideDhaka: number;

  // Coupons & Offers
  coupons: Coupon[];
  setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>;
  appliedCoupon: Coupon | null;
  discountAmount: number;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  removeCoupon: () => void;
  addCoupon: (coupon: Coupon) => Promise<void> | void;
  deleteCoupon: (code: string) => Promise<void> | void;

  // Campaigns, Bundles & Seasonal Offers
  offers: Offer[];
  setOffers: React.Dispatch<React.SetStateAction<Offer[]>>;
  appliedOffer: Offer | null;
  activeBundleOffer: Offer | null;
  bundleDiscountAmount: number;
  autoCampaignDiscountAmount: number;
  hasFreeShippingOffer: boolean;
  freeShippingOfferName: string | null;

  // Wishlist
  wishlist: string[];
  setWishlist: React.Dispatch<React.SetStateAction<string[]>>;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Orders
  orders: Order[];
  createOrder: (orderData: {
    customer: Order['customer'];
    paymentMethod: PaymentMethod;
    paymentId?: string;
  }) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void> | void;
  getOrderById: (orderId: string) => Order | undefined;
  currentOrderId: string | null;
  setCurrentOrderId: (id: string | null) => void;
  currentOrder: Order | null;

  // Modals & UI
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  isSizeGuideOpen: boolean;
  setIsSizeGuideOpen: (open: boolean) => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;

  // AI Stylist Concierge
  isStylistOpen: boolean;
  setIsStylistOpen: (open: boolean) => void;

  // Customer / User
  user: User | null;
  login: (email: string, role?: 'CUSTOMER' | 'ADMIN') => Promise<void> | void;
  logout: () => void;
  updateUserProfile: (updates: { fullName?: string; phone?: string; savedAddresses?: any[] }) => Promise<void>;
  apiAvailable: boolean;
  settings: WebsiteSettings | null;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialRoute = parseLocation();
  const [activeView, setActiveViewState] = useState<string>(initialRoute.view);
  const [selectedCategorySlug, setSelectedCategorySlugState] = useState<string | null>(initialRoute.category);
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(initialRoute.product);
  const [settings, setSettings] = useState<WebsiteSettings | null>(() => {
    try {
      const cached = localStorage.getItem('zippy_settings') || localStorage.getItem('richman_settings');
      if (cached) return JSON.parse(cached);
    } catch {
      // ignore
    }
    return {
      websiteName: 'Zippy',
      website_name: 'Zippy',
      backendName: 'Zippy',
      backend_name: 'Zippy',
      logo: '/logo.svg',
      favicon: '/favicon.ico',
      phone: '+880 1711-000001',
      email: 'sales@zippy.com.bd',
      address: 'Gulshan 1, Dhaka, Bangladesh',
      currency: 'BDT (৳)',
      timezone: 'Asia/Dhaka',
      default_language: 'en',
      maintenance_mode: false
    };
  });

  const setSelectedCategorySlug = (slug: string | null) => {
    setSelectedCategorySlugState(slug);
    if (activeView === 'shop') {
      applyHash('shop', slug || 'all');
    }
  };

  const setActiveView = (view: string) => {
    setActiveViewState(view);
    if (view === 'home') {
      setSelectedCategorySlugState(null);
      setSelectedProductSlug(null);
      setSearchQuery('');
    }
    applyHash(view, view === 'shop' ? selectedCategorySlug : null, view === 'product-detail' ? selectedProductSlug : null);
  };

  useEffect(() => {
    const syncFromHash = () => {
      const route = parseLocation();
      setActiveViewState(route.view);
      if (route.view === 'home') {
        setSelectedCategorySlugState(null);
        setSelectedProductSlug(null);
      }
      if (route.view === 'shop') setSelectedCategorySlugState(route.category || 'all');
      if (route.view === 'product-detail' && route.product) setSelectedProductSlug(route.product);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', syncFromHash);
    if (!window.location.hash) {
      applyHash(initialRoute.view, initialRoute.category, initialRoute.product);
    }
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentOrderId, setCurrentOrderId] = useState<string | null>('RM-2026-8942');

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState<boolean>(false);
  const [isStylistOpen, setIsStylistOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Products with persistent storage
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('zippy_products') || localStorage.getItem('richman_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [stores, setStores] = useState<StoreLocation[]>(STORES);
  const [apiAvailable, setApiAvailable] = useState(false);

  // Coupons
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('zippy_coupons') || localStorage.getItem('richman_coupons');
      return saved ? JSON.parse(saved) : INITIAL_COUPONS;
    } catch {
      return INITIAL_COUPONS;
    }
  });
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('zippy_orders') || localStorage.getItem('richman_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('zippy_cart') || localStorage.getItem('richman_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('zippy_wishlist') || localStorage.getItem('richman_wishlist');
      return saved ? JSON.parse(saved) : ['prod-01', 'prod-04'];
    } catch {
      return ['prod-01', 'prod-04'];
    }
  });

  // Shipping
  const [shippingLocation, setShippingLocation] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');
  const freeShippingThreshold = 3000;
  const shippingInsideDhaka = 80;
  const shippingOutsideDhaka = 150;

  // Offers (Campaigns, Bundles, Seasonal)
  const [offers, setOffers] = useState<Offer[]>(() => {
    try {
      const saved = localStorage.getItem('zippy_offers') || localStorage.getItem('richman_offers');
      return saved ? JSON.parse(saved) : DEFAULT_OFFERS;
    } catch {
      return DEFAULT_OFFERS;
    }
  });
  const [appliedOffer, setAppliedOffer] = useState<Offer | null>(null);

  // User session
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('zippy_user') || localStorage.getItem('richman_user');
      return saved ? JSON.parse(saved) : {
        id: 'user-01',
        fullName: 'Tahmidur Rahman',
        email: 'tahmid.rahman@example.com',
        phone: '+880 1712-345678',
        role: 'CUSTOMER',
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
      };
    } catch {
      return null;
    }
  });

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      try {
        await api.health();
        if (cancelled) return;
        setApiAvailable(true);
        const [nextProducts, nextCategories, nextStores, nextCoupons, nextOffers] = await Promise.all([
          api.products(),
          api.categories(),
          api.stores(),
          api.coupons(),
          api.offers().catch(() => [])
        ]);
        if (cancelled) return;
        setProducts(nextProducts);
        setCategories(nextCategories);
        setStores(nextStores);
        if (nextOffers && nextOffers.length > 0) {
          setOffers(nextOffers);
          try {
            localStorage.setItem('zippy_offers', JSON.stringify(nextOffers));
          } catch {
            // ignore
          }
        }
        api.settings().then((s) => {
          if (!cancelled && s) {
            setSettings(s);
            try {
              localStorage.setItem('zippy_settings', JSON.stringify(s));
            } catch {
              // ignore
            }
          }
        }).catch(() => {});
        try {
          const me = await api.me();
          if (!cancelled) {
            setUser(me);
            const [nextOrders, nextWishlist] = await Promise.all([api.orders(), api.wishlist()]);
            if (!cancelled) {
              setOrders(nextOrders);
              setWishlist(nextWishlist);
            }
          }
        } catch {
          // guest session
        }
      } catch {
        if (!cancelled) setApiAvailable(false);
      }
    };
    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('zippy_products', JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('zippy_orders', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('zippy_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('zippy_coupons', JSON.stringify(coupons));
    } catch (e) {
      console.error(e);
    }
  }, [coupons]);

  useEffect(() => {
    try {
      if (user) localStorage.setItem('zippy_user', JSON.stringify(user));
      else localStorage.removeItem('zippy_user');
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('zippy_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  useEffect(() => {
    if (settings) {
      try {
        localStorage.setItem('zippy_settings', JSON.stringify(settings));
      } catch (e) {
        console.error(e);
      }
      const titleName = settings.website_name || settings.websiteName || 'Zippy';
      document.title = `${titleName} | Premium Bespoke Fashion & Lifestyle`;

      if (settings.favicon) {
        let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'shortcut icon';
          document.head.appendChild(link);
        }
        link.href = settings.favicon;
      }
    }
  }, [settings]);

  // Toast helper
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Nav helpers
  const navigateToCategory = (slug: string) => {
    setSelectedCategorySlugState(slug);
    setActiveViewState('shop');
    applyHash('shop', slug);
  };

  const navigateToProduct = (slug: string) => {
    setSelectedProductSlug(slug);
    setActiveViewState('product-detail');
    applyHash('product-detail', null, slug);
  };

  // Cart operations
  const addToCart = (
    product: Product,
    size: ProductSize,
    color: ColorVariant,
    quantity: number = 1
  ) => {
    const cartItemId = `${product.id}-${size}-${color.name}`;
    const effectivePrice = product.salePrice ?? product.price;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [
          ...prev,
          {
            id: cartItemId,
            productId: product.id,
            product,
            size,
            color,
            quantity,
            price: effectivePrice
          }
        ];
      }
    });

    showToast(`Added ${product.name} (${size}) to your bag.`);
    setIsCartOpen(true);
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === cartItemId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    showToast('Item removed from bag.', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Campaigns, Bundles & Dynamic Offers
  const activeBundleOffer =
    offers.find(
      (o) =>
        o.status === 'active' &&
        (o.offerType === 'bundle' || o.discountType === 'bundle_discount') &&
        cartItemCount >= (o.bundleQty || 2)
    ) || null;

  const bundleDiscountAmount = activeBundleOffer
    ? Math.round((cartSubtotal * (activeBundleOffer.discountValue || 0)) / 100)
    : 0;

  const activeAutoCampaign =
    offers.find(
      (o) =>
        o.status === 'active' &&
        o.isAutomatic &&
        o.offerType === 'campaign' &&
        cartSubtotal >= (o.minimumOrderAmount || 0)
    ) || null;

  const autoCampaignDiscountAmount = activeAutoCampaign
    ? activeAutoCampaign.discountType === 'percentage_discount'
      ? Math.round((cartSubtotal * (activeAutoCampaign.discountValue || 0)) / 100)
      : Math.min(activeAutoCampaign.discountValue || 0, cartSubtotal)
    : 0;

  const freeShippingOffer =
    offers.find(
      (o) =>
        o.status === 'active' &&
        (o.offerType === 'free_shipping' || o.discountType === 'free_shipping') &&
        cartSubtotal >= (o.minimumOrderAmount || freeShippingThreshold)
    ) || null;

  const hasFreeShippingOffer = Boolean(freeShippingOffer);
  const freeShippingOfferName = freeShippingOffer ? freeShippingOffer.name : null;

  // Shipping calculation
  const shippingFee =
    cart.length === 0
      ? 0
      : cartSubtotal >= freeShippingThreshold || hasFreeShippingOffer
      ? 0
      : shippingLocation === 'inside_dhaka'
      ? shippingInsideDhaka
      : shippingOutsideDhaka;

  // Coupon & Discount calculation
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountPercent) {
      discountAmount = Math.round((cartSubtotal * appliedCoupon.discountPercent) / 100);
    } else if (appliedCoupon.discountAmount) {
      discountAmount = Math.min(appliedCoupon.discountAmount, cartSubtotal);
    }
  }

  discountAmount += bundleDiscountAmount + autoCampaignDiscountAmount;

  const applyCoupon = async (code: string) => {
    if (apiAvailable) {
      try {
        const result = await api.validateCoupon(code, cartSubtotal);
        if (!result.success || !result.coupon) {
          showToast(result.message, 'error');
          return { success: false, message: result.message };
        }
        setAppliedCoupon(result.coupon);
        showToast(`Coupon ${result.coupon.code} applied successfully!`);
        return { success: true, message: result.message };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to apply coupon.';
        showToast(message, 'error');
        return { success: false, message };
      }
    }
    const clean = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === clean);
    if (!found) {
      showToast('Invalid coupon code.', 'error');
      return { success: false, message: 'Invalid coupon code.' };
    }
    if (cartSubtotal < found.minOrder) {
      const msg = `Minimum order ৳${found.minOrder.toLocaleString()} required for ${found.code}.`;
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
    setAppliedCoupon(found);
    showToast(`Coupon ${found.code} applied successfully!`);
    return { success: true, message: 'Coupon applied!' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed.', 'info');
  };

  const addCoupon = async (coupon: Coupon) => {
    if (apiAvailable) {
      try {
        const created = await api.createCoupon(coupon);
        setCoupons((prev) => [...prev, created]);
        showToast(`New coupon ${created.code} created.`);
        return;
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Unable to create coupon.', 'error');
        return;
      }
    }
    setCoupons((prev) => [...prev, coupon]);
    showToast(`New coupon ${coupon.code} created.`);
  };

  const deleteCoupon = async (code: string) => {
    if (apiAvailable) {
      try {
        await api.deleteCoupon(code);
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Unable to remove coupon.', 'error');
        return;
      }
    }
    setCoupons((prev) => prev.filter((c) => c.code !== code));
    showToast(`Coupon ${code} decommissioned.`);
  };

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from wishlist.', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to wishlist.');
        return [...prev, productId];
      }
    });
    if (apiAvailable) {
      api.toggleWishlist(productId).catch(() => undefined);
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Orders
  const createOrder = async (orderData: {
    customer: Order['customer'];
    paymentMethod: PaymentMethod;
    paymentId?: string;
  }) => {
    if (apiAvailable) {
      try {
        const newOrder = await api.checkout({
          customer: orderData.customer,
          paymentMethod: orderData.paymentMethod,
          paymentId: orderData.paymentId,
          couponCode: appliedCoupon?.code,
          shippingLocation,
          items: cart
        });
        setOrders((prev) => [newOrder, ...prev]);
        clearCart();
        setAppliedCoupon(null);
        setCurrentOrderId(newOrder.orderNumber);
        setActiveView('order-success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        api.products().then(setProducts).catch(() => undefined);
        return newOrder;
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Unable to place order.', 'error');
        return null;
      }
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNum = `RM-2026-${randomNum}`;
    const total = Math.max(0, cartSubtotal - discountAmount + shippingFee);

    const newOrder: Order = {
      id: orderNum,
      orderNumber: orderNum,
      createdAt: new Date().toISOString(),
      items: [...cart],
      subtotal: cartSubtotal,
      discount: discountAmount,
      shippingFee,
      total,
      status: orderData.paymentMethod === 'COD' ? 'PENDING' : 'CONFIRMED',
      paymentStatus: orderData.paymentMethod === 'COD' ? 'PENDING' : 'PAID',
      paymentMethod: orderData.paymentMethod,
      paymentId: orderData.paymentId || (orderData.paymentMethod !== 'COD' ? `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}` : undefined),
      customer: orderData.customer,
      trackingHistory: [
        {
          status: 'PENDING',
          title: 'Order Placed',
          description: `Order ${orderNum} received.`,
          time: 'Just now',
          done: true,
          current: orderData.paymentMethod === 'COD'
        },
        {
          status: 'CONFIRMED',
          title: 'Order Confirmed',
          description: orderData.paymentMethod === 'COD' ? 'Verification call pending.' : 'Payment received & verified.',
          time: orderData.paymentMethod === 'COD' ? 'Pending' : 'Just now',
          done: orderData.paymentMethod !== 'COD',
          current: orderData.paymentMethod !== 'COD'
        },
        {
          status: 'PROCESSING',
          title: 'Quality Check & Packing',
          description: 'Garment steaming and signature gift packaging.',
          time: 'Upcoming',
          done: false
        },
        {
          status: 'SHIPPED',
          title: 'Dispatched via Courier',
          description: 'Courier dispatch with real-time tracking.',
          time: 'Upcoming',
          done: false
        },
        {
          status: 'DELIVERED',
          title: 'Delivered',
          description: 'Direct doorstep handover.',
          time: 'Upcoming',
          done: false
        }
      ]
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setAppliedCoupon(null);
    setCurrentOrderId(orderNum);
    setActiveView('order-success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    if (apiAvailable) {
      try {
        const updated = await api.updateOrderStatus(orderId, status);
        setOrders((prev) => prev.map((order) => (order.id === updated.id ? updated : order)));
        showToast(`Order ${orderId} marked as ${status}.`);
        return;
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Unable to update order.', 'error');
        return;
      }
    }
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const updatedTracking = order.trackingHistory.map((step) => {
          if (step.status === status) {
            return { ...step, done: true, current: true, time: 'Updated now' };
          }
          return step;
        });
        return {
          ...order,
          status,
          paymentStatus: status === 'DELIVERED' ? 'PAID' : order.paymentStatus,
          trackingHistory: updatedTracking
        };
      })
    );
    showToast(`Order ${orderId} marked as ${status}.`);
  };

  const getOrderById = (orderId: string) => {
    return orders.find(
      (o) =>
        o.id.toLowerCase() === orderId.toLowerCase() ||
        o.orderNumber.toLowerCase() === orderId.toLowerCase()
    );
  };

  // Admin product actions
  const addProduct = async (
    productData: Omit<Product, 'id'> | (Partial<Product> & { name: string; sku: string; categoryId: string; price: number })
  ) => {
    if (apiAvailable) {
      const created = await api.createProduct({
        ...productData,
        name: productData.name,
        sku: productData.sku,
        categoryId: productData.categoryId,
        price: productData.price
      });
      setProducts((prev) => [created, ...prev]);
      showToast(`Added product "${created.name}".`);
      return;
    }
    const id = `prod-${Date.now().toString().slice(-4)}`;
    const newProd: Product = { ...(productData as Omit<Product, 'id'>), id };
    setProducts((prev) => [newProd, ...prev]);
    showToast(`Added product "${newProd.name}".`);
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (apiAvailable) {
      const updated = await api.updateProduct(id, updates);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      showToast('Product updated successfully.');
      return;
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    showToast('Product updated successfully.');
  };

  const deleteProduct = async (id: string) => {
    if (apiAvailable) {
      await api.deleteProduct(id);
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Product deleted.', 'info');
  };

  // User actions
  const login = async (email: string, role: 'CUSTOMER' | 'ADMIN' = 'CUSTOMER') => {
    if (apiAvailable) {
      try {
        const password = (email === 'client.vip@richmanbd.com' || email === 'vip@zippy.com.bd') ? 'vip123' : 'richman123';
        const result = await api.login(email, password);
        setToken(result.token);
        setUser(result.user);
        const [nextOrders, nextWishlist] = await Promise.all([api.orders().catch(() => []), api.wishlist().catch(() => [])]);
        if (nextOrders.length) setOrders(nextOrders);
        if (nextWishlist.length) setWishlist(nextWishlist);
        showToast(`Welcome back, ${result.user.fullName}!`);
        return;
      } catch {
        // fall through to local demo login
      }
    }
    const loggedUser: User = {
      id: 'usr-' + Date.now(),
      fullName: email.split('@')[0].replace('.', ' ').toUpperCase(),
      email,
      phone: '+880 1712-345678',
      role,
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
    };
    setUser(loggedUser);
    showToast(`Welcome back, ${loggedUser.fullName}!`);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    showToast('Signed out.', 'info');
  };

  const updateUserProfile = async (updates: { fullName?: string; phone?: string; savedAddresses?: any[] }) => {
    if (apiAvailable && user) {
      try {
        const updated = await api.updateProfile(updates);
        setUser((prev) => (prev ? { ...prev, ...updated } : updated));
        try {
          localStorage.setItem('zippy_user', JSON.stringify(updated));
        } catch {
          // ignore
        }
        showToast('Patron profile updated successfully.');
        return;
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Unable to update profile.', 'error');
        return;
      }
    }
    setUser((prev) => {
      if (!prev) return null;
      const updated = {
        ...prev,
        fullName: updates.fullName !== undefined ? updates.fullName : prev.fullName,
        phone: updates.phone !== undefined ? updates.phone : prev.phone,
        savedAddresses: updates.savedAddresses !== undefined ? updates.savedAddresses : prev.savedAddresses
      };
      try {
        localStorage.setItem('zippy_user', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    showToast('Patron profile updated successfully.');
  };

  const currentOrder =
    orders.find((o) => o.orderNumber === currentOrderId || o.id === currentOrderId) ||
    orders[0] ||
    null;

  return (
    <ShopContext.Provider
      value={{
        activeView,
        setActiveView,
        selectedCategorySlug,
        setSelectedCategorySlug,
        selectedProductSlug,
        setSelectedProductSlug,
        searchQuery,
        setSearchQuery,
        navigateToCategory,
        navigateToProduct,
        products,
        setProducts,
        categories,
        stores,
        addProduct,
        updateProduct,
        deleteProduct,
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartItemCount,
        shippingFee,
        shippingLocation,
        setShippingLocation,
        freeShippingThreshold,
        shippingInsideDhaka,
        shippingOutsideDhaka,
        coupons,
        setCoupons,
        appliedCoupon,
        discountAmount,
        applyCoupon,
        removeCoupon,
        addCoupon,
        deleteCoupon,
        offers,
        setOffers,
        appliedOffer,
        activeBundleOffer,
        bundleDiscountAmount,
        autoCampaignDiscountAmount,
        hasFreeShippingOffer,
        freeShippingOfferName,
        wishlist,
        setWishlist,
        toggleWishlist,
        isInWishlist,
        orders,
        createOrder,
        updateOrderStatus,
        getOrderById,
        currentOrderId,
        setCurrentOrderId,
        currentOrder,
        quickViewProduct,
        setQuickViewProduct,
        isSizeGuideOpen,
        setIsSizeGuideOpen,
        toasts,
        showToast,
        isStylistOpen,
        setIsStylistOpen,
        user,
        login,
        logout,
        updateUserProfile,
        apiAvailable,
        settings
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
