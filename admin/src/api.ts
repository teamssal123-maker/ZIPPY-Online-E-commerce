import type {
  AdminUser,
  AiSettings,
  AuditLogRecord,
  Banner,
  BlogPost,
  Brand,
  Category,
  Coupon,
  Customer,
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
  ChatMessage,
  ChatSettings,
  ChatThread,
  SalesReportResult
} from './types';

const TOKEN_KEY = 'zippy_admin_token';

interface Envelope<T> {
  success: boolean;
  data?: T;
  error?: { message: string };
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('richman_admin_token');
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(`/api${path}`, { ...init, headers });
  const body = (await res.json().catch(() => ({}))) as Envelope<T>;
  if (!res.ok || body.success === false) {
    throw new Error(body.error?.message || `Request failed (${res.status})`);
  }
  return body.data as T;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  me: () => request<User>('/auth/me'),

  // Dashboard
  stats: () => request<Stats>('/admin/stats'),

  // Products
  products: () => request<Product[]>('/products'),
  createProduct: (payload: Record<string, unknown>) =>
    request<Product>('/products', { method: 'POST', body: JSON.stringify(payload) }),
  updateProduct: (id: string, payload: Record<string, unknown>) =>
    request<Product>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteProduct: (id: string) =>
    request<{ deleted: boolean }>(`/products/${id}`, { method: 'DELETE' }),
  duplicateProduct: (id: string) =>
    request<Product>(`/products/${id}/duplicate`, { method: 'POST' }),

  // Categories
  categories: () => request<Category[]>('/categories'),
  createCategory: (payload: Partial<Category>) =>
    request<Category>('/categories', { method: 'POST', body: JSON.stringify(payload) }),
  updateCategory: (id: string, payload: Partial<Category>) =>
    request<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteCategory: (id: string) =>
    request<{ deleted: boolean }>(`/categories/${id}`, { method: 'DELETE' }),
  toggleCategoryVisibility: (id: string, active?: boolean) =>
    request<Category>(`/categories/${id}/visibility`, { method: 'PATCH', body: JSON.stringify({ active }) }),
  reorderCategories: (ids: string[]) =>
    request<Category[]>('/categories/reorder', { method: 'POST', body: JSON.stringify({ ids }) }),
  categoryProducts: (id: string) => request<Product[]>(`/categories/${id}/products`),


  // Brands
  brands: () => request<Brand[]>('/brands'),
  createBrand: (payload: Partial<Brand>) =>
    request<Brand>('/brands', { method: 'POST', body: JSON.stringify(payload) }),
  updateBrand: (id: string, payload: Partial<Brand>) =>
    request<Brand>(`/brands/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  toggleBrandVisibility: (id: string, active?: boolean) =>
    request<Brand>(`/brands/${id}/visibility`, { method: 'PATCH', body: JSON.stringify({ active }) }),
  toggleBrandFeatured: (id: string, featured?: boolean) =>
    request<Brand>(`/brands/${id}/featured`, { method: 'PATCH', body: JSON.stringify({ featured }) }),
  reorderBrands: (ids: string[]) =>
    request<Brand[]>('/brands/reorder', { method: 'POST', body: JSON.stringify({ ids }) }),
  brandProducts: (id: string) => request<Product[]>(`/brands/${id}/products`),
  deleteBrand: (id: string) =>
    request<{ deleted: boolean }>(`/brands/${id}`, { method: 'DELETE' }),

  // Inventory & Warehouses
  inventory: () => request<InventoryItem[]>('/inventory'),
  lowStock: () => request<InventoryItem[]>('/inventory/low-stock'),
  outOfStock: () => request<InventoryItem[]>('/inventory/out-of-stock'),
  inventoryValuation: () => request<StockValuation>('/inventory/valuation'),
  inventoryTransactions: (query?: { type?: string; productId?: string; warehouseId?: string }) => {
    const params = new URLSearchParams();
    if (query?.type && query.type !== 'all') params.append('type', query.type);
    if (query?.productId) params.append('productId', query.productId);
    if (query?.warehouseId && query.warehouseId !== 'all') params.append('warehouseId', query.warehouseId);
    const qs = params.toString();
    return request<InventoryTransaction[]>(`/inventory/transactions${qs ? `?${qs}` : ''}`);
  },
  adjustInventory: (payload: { productId: string; warehouseId?: string; quantity: number; reason?: string }) =>
    request<{ item: InventoryItem; txn: InventoryTransaction }>('/inventory/adjust', { method: 'POST', body: JSON.stringify(payload) }),
  stockInInventory: (payload: { productId: string; warehouseId?: string; quantity: number; note?: string; reference?: string }) =>
    request<{ item: InventoryItem; txn: InventoryTransaction }>('/inventory/stock-in', { method: 'POST', body: JSON.stringify(payload) }),
  stockOutInventory: (payload: { productId: string; warehouseId?: string; quantity: number; note?: string; reference?: string }) =>
    request<{ item: InventoryItem; txn: InventoryTransaction }>('/inventory/stock-out', { method: 'POST', body: JSON.stringify(payload) }),
  transferInventory: (payload: { productId: string; fromWarehouseId: string; toWarehouseId: string; quantity: number; note?: string; reference?: string }) =>
    request<{ sourceItem: InventoryItem; targetItem: InventoryItem; txns: InventoryTransaction[] }>('/inventory/transfer', { method: 'POST', body: JSON.stringify(payload) }),
  updateInventoryThreshold: (payload: { productId: string; warehouseId?: string; minimumStock: number; maximumStock?: number }) =>
    request<InventoryItem>('/inventory/threshold', { method: 'POST', body: JSON.stringify(payload) }),
  warehouses: () => request<Warehouse[]>('/warehouses'),
  createWarehouse: (payload: Partial<Warehouse>) =>
    request<Warehouse>('/warehouses', { method: 'POST', body: JSON.stringify(payload) }),
  updateWarehouse: (id: string, payload: Partial<Warehouse>) =>
    request<Warehouse>(`/warehouses/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteWarehouse: (id: string) =>
    request<{ deleted: boolean }>(`/warehouses/${id}`, { method: 'DELETE' }),

  // Orders
  orders: () => request<Order[]>('/orders'),
  updateOrderStatus: (id: string, status: OrderStatus) =>
    request<Order>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  cancelOrder: (id: string) =>
    request<Order>(`/orders/${id}/cancel`, { method: 'POST' }),
  refundOrder: (id: string) =>
    request<Order>(`/orders/${id}/refund`, { method: 'POST' }),
  deleteOrder: (id: string, restoreStock = true) =>
    request<{ deleted: boolean; id: string }>(`/orders/${id}?restoreStock=${restoreStock}`, { method: 'DELETE' }),

  // Customers
  customers: () => request<Customer[]>('/customers'),
  createCustomer: (payload: Partial<Customer> & { password?: string }) =>
    request<Customer>('/customers', { method: 'POST', body: JSON.stringify(payload) }),
  updateCustomer: (id: string, payload: Partial<Customer>) =>
    request<Customer>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteCustomer: (id: string) =>
    request<{ deleted: boolean }>(`/customers/${id}`, { method: 'DELETE' }),

  // Reviews
  reviews: () => request<Review[]>('/reviews'),
  approveReview: (id: string) =>
    request<Review>(`/reviews/${id}/approve`, { method: 'PUT' }),
  rejectReview: (id: string) =>
    request<Review>(`/reviews/${id}/reject`, { method: 'PUT' }),
  deleteReview: (id: string) =>
    request<{ deleted: boolean }>(`/reviews/${id}`, { method: 'DELETE' }),
  replyReview: (id: string, adminReply: string) =>
    request<Review>(`/reviews/${id}/reply`, { method: 'POST', body: JSON.stringify({ adminReply }) }),

  // Inquiries
  inquiries: () => request<Inquiry[]>('/inquiries'),
  replyInquiry: (id: string, reply: string) =>
    request<Inquiry>(`/inquiries/${id}/reply`, { method: 'POST', body: JSON.stringify({ reply }) }),
  updateInquiryStatus: (id: string, status: string) =>
    request<Inquiry>(`/inquiries/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteInquiry: (id: string) =>
    request<{ deleted: boolean }>(`/inquiries/${id}`, { method: 'DELETE' }),

  // Banners
  banners: () => request<Banner[]>('/banners'),
  createBanner: (payload: Partial<Banner>) =>
    request<Banner>('/banners', { method: 'POST', body: JSON.stringify(payload) }),
  updateBanner: (id: string, payload: Partial<Banner>) =>
    request<Banner>(`/banners/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteBanner: (id: string) =>
    request<{ deleted: boolean }>(`/banners/${id}`, { method: 'DELETE' }),
  publishBanner: (id: string) =>
    request<Banner>(`/banners/${id}/publish`, { method: 'POST' }),

  // Homepage Sections
  homepageSections: () => request<HomepageSection[]>('/homepage-sections'),
  createHomepageSection: (payload: Partial<HomepageSection>) =>
    request<HomepageSection>('/homepage-sections', { method: 'POST', body: JSON.stringify(payload) }),
  updateHomepageSection: (id: string, payload: Partial<HomepageSection>) =>
    request<HomepageSection>(`/homepage-sections/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteHomepageSection: (id: string) =>
    request<{ deleted: boolean }>(`/homepage-sections/${id}`, { method: 'DELETE' }),

  // Offers
  offers: () => request<Offer[]>('/offers'),
  createOffer: (payload: Partial<Offer>) =>
    request<Offer>('/offers', { method: 'POST', body: JSON.stringify(payload) }),
  updateOffer: (id: string, payload: Partial<Offer>) =>
    request<Offer>(`/offers/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteOffer: (id: string) =>
    request<{ deleted: boolean }>(`/offers/${id}`, { method: 'DELETE' }),

  // Payment Methods & Gateways
  paymentMethods: (status?: string) =>
    request<PaymentMethodConfig[]>(status ? `/payment-methods?status=${status}` : '/payment-methods'),
  getPaymentMethod: (id: string) =>
    request<PaymentMethodConfig>(`/payment-methods/${id}`),
  createPaymentMethod: (payload: Partial<PaymentMethodConfig>) =>
    request<PaymentMethodConfig>('/payment-methods', { method: 'POST', body: JSON.stringify(payload) }),
  updatePaymentMethod: (id: string, payload: Partial<PaymentMethodConfig>) =>
    request<PaymentMethodConfig>(`/payment-methods/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  togglePaymentMethod: (id: string) =>
    request<PaymentMethodConfig>(`/payment-methods/${id}/toggle`, { method: 'PATCH' }),
  deletePaymentMethod: (id: string) =>
    request<{ deleted: boolean }>(`/payment-methods/${id}`, { method: 'DELETE' }),
  testPaymentGateway: (id: string, credentials?: Partial<PaymentMethodConfig>) =>
    request<{ success: boolean; gateway: string; mode: string; message: string; details: Record<string, unknown> }>(
      `/payment-gateways/${id}/test`,
      { method: 'POST', body: JSON.stringify(credentials || {}) }
    ),
  paymentGatewayStats: () =>
    request<{
      totalGateways: number;
      activeGateways: number;
      inactiveGateways: number;
      byType: Record<string, number>;
      totalRevenueCollected: number;
      transactionsCount: number;
      successRate: number;
      gateways: Array<PaymentMethodConfig & { count: number; volume: number }>;
    }>('/payment-gateways/stats'),
  refundPayment: (paymentId: string, amount?: number, reason?: string) =>
    request<{ success: boolean; refunded: boolean; refundTransactionId: string }>(
      '/payment-gateways/refund',
      { method: 'POST', body: JSON.stringify({ paymentId, amount, reason }) }
    ),


  // Coupons
  coupons: () => request<Coupon[]>('/coupons'),
  createCoupon: (payload: Coupon) =>
    request<Coupon>('/coupons', { method: 'POST', body: JSON.stringify(payload) }),
  deleteCoupon: (code: string) =>
    request<{ deleted: boolean }>(`/coupons/${code}`, { method: 'DELETE' }),

  // Blog
  blogPosts: () => request<BlogPost[]>('/blog'),
  createBlogPost: (payload: Partial<BlogPost>) =>
    request<BlogPost>('/blog', { method: 'POST', body: JSON.stringify(payload) }),
  updateBlogPost: (id: string, payload: Partial<BlogPost>) =>
    request<BlogPost>(`/blog/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteBlogPost: (id: string) =>
    request<{ deleted: boolean }>(`/blog/${id}`, { method: 'DELETE' }),
  publishBlogPost: (id: string) =>
    request<BlogPost>(`/blog/${id}/publish`, { method: 'POST' }),

  // Pages
  pages: () => request<Page[]>('/pages'),
  createPage: (payload: Partial<Page>) =>
    request<Page>('/pages', { method: 'POST', body: JSON.stringify(payload) }),
  updatePage: (id: string, payload: Partial<Page>) =>
    request<Page>(`/pages/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deletePage: (id: string) =>
    request<{ deleted: boolean }>(`/pages/${id}`, { method: 'DELETE' }),

  // Media
  media: () => request<MediaItem[]>('/media'),
  uploadMedia: (payload: { name?: string; filename?: string; url: string; mimeType?: string; size?: number; folder?: string }) =>
    request<MediaItem>('/media/upload', {
      method: 'POST',
      body: JSON.stringify({
        filename: payload.filename || payload.name || 'media-item.jpg',
        name: payload.name || payload.filename || 'media-item.jpg',
        url: payload.url,
        mimeType: payload.mimeType || 'image/jpeg',
        size: payload.size || 102400,
        folder: payload.folder || 'general'
      })
    }),
  updateMedia: (id: string, payload: Partial<MediaItem>) =>
    request<MediaItem>(`/media/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteMedia: (id: string) =>
    request<{ deleted: boolean }>(`/media/${id}`, { method: 'DELETE' }),

  // Reports
  reportsSales: (params?: { from?: string; to?: string; paymentMethod?: string; status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.from) q.set('from', params.from);
    if (params?.to) q.set('to', params.to);
    if (params?.paymentMethod && params.paymentMethod !== 'all') q.set('paymentMethod', params.paymentMethod);
    if (params?.status && params.status !== 'all') q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    const qs = q.toString();
    return request<SalesReportResult>(`/reports/sales${qs ? `?${qs}` : ''}`);
  },
  reportsProducts: () => request<unknown[]>('/reports/products'),
  reportsInventory: () => request<unknown[]>('/reports/inventory'),
  reportsOrders: () => request<unknown[]>('/reports/orders'),
  reportsCustomers: () => request<unknown[]>('/reports/customers'),

  // Roles & Admins
  roles: () => request<RoleRecord[]>('/roles'),
  createRole: (payload: Partial<RoleRecord>) =>
    request<RoleRecord>('/roles', { method: 'POST', body: JSON.stringify(payload) }),
  updateRole: (id: string, payload: Partial<RoleRecord>) =>
    request<RoleRecord>(`/roles/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteRole: (id: string) =>
    request<{ deleted: boolean }>(`/roles/${id}`, { method: 'DELETE' }),
  admins: () => request<AdminUser[]>('/admins'),
  createAdmin: (payload: { name: string; email: string; phone: string; password: string; roleId?: string }) =>
    request<AdminUser>('/admins', { method: 'POST', body: JSON.stringify(payload) }),
  updateAdmin: (id: string, payload: Partial<AdminUser>) =>
    request<AdminUser>(`/admins/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteAdmin: (id: string) =>
    request<{ deleted: boolean }>(`/admins/${id}`, { method: 'DELETE' }),

  // Settings & SEO
  settings: () => request<WebsiteSettings>('/settings'),
  updateSettings: (payload: Partial<WebsiteSettings>) =>
    request<WebsiteSettings>('/settings', { method: 'PUT', body: JSON.stringify(payload) }),
  seo: () => request<SeoSettings>('/seo'),
  updateSeo: (payload: Partial<SeoSettings>) =>
    request<SeoSettings>('/seo', { method: 'PUT', body: JSON.stringify(payload) }),
  redirects: () => request<SeoRedirect[]>('/seo/redirects'),
  createRedirect: (payload: { fromPath: string; toPath: string; statusCode?: number }) =>
    request<SeoRedirect>('/seo/redirects', { method: 'POST', body: JSON.stringify(payload) }),
  deleteRedirect: (id: string) =>
    request<{ deleted: boolean }>(`/seo/redirects/${id}`, { method: 'DELETE' }),

  // Notifications
  notifications: () => request<NotificationRecord[]>('/notifications'),
  sendNotification: (payload: { channel: string; event: string; message: string; recipient?: string }) =>
    request<{ sent: boolean }>('/notifications/send', { method: 'POST', body: JSON.stringify(payload) }),
  deleteNotification: (id: string) =>
    request<{ deleted: boolean }>(`/notifications/${id}`, { method: 'DELETE' }),
  clearNotifications: () =>
    request<{ cleared: boolean }>('/notifications', { method: 'DELETE' }),

  // Audit Logs
  auditLogs: () => request<AuditLogRecord[]>('/audit-logs'),

  // AI Assistant & Generation Subsystem
  aiStatus: () =>
    request<{
      status: 'active' | 'fallback_active' | 'disabled';
      provider: string;
      model: string;
      hasApiKey: boolean;
      capabilities: string[];
    }>('/ai/status'),
  aiSettings: () => request<AiSettings>('/ai/settings'),
  updateAiSettings: (payload: Partial<AiSettings>) =>
    request<AiSettings>('/ai/settings', { method: 'PUT', body: JSON.stringify(payload) }),
  aiChat: (payload: { message: string; customerName?: string; occasion?: string; history?: any[] }) =>
    request<{
      reply: string;
      provider: string;
      model: string;
      suggestedProducts?: any[];
      suggestedQuestions?: string[];
    }>('/ai/chat', { method: 'POST', body: JSON.stringify(payload) }),
  aiRecommendations: (payload: { productId?: string; occasion?: string; query?: string; limit?: number }) =>
    request<{ recommendations: any[]; total: number }>('/ai/recommendations', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  aiGenerateProductCopy: (payload: {
    title: string;
    category?: string;
    fabric?: string;
    fit?: string;
    tone?: string;
    occasion?: string;
    keyFeatures?: string[];
  }) =>
    request<{
      description: string;
      shortDescription: string;
      highlights: string[];
      stylingNotes: string;
      careInstructions: string;
    }>('/ai/generate-product-copy', { method: 'POST', body: JSON.stringify(payload) }),
  aiGenerateSeo: (payload: { title: string; category?: string; description?: string; brand?: string; keywords?: string[] }) =>
    request<{ metaTitle: string; metaDescription: string; metaKeywords: string }>('/ai/generate-seo', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  aiSuggestInquiryReply: (payload: {
    inquiryId?: string;
    customerName?: string;
    customerEmail?: string;
    customerMessage: string;
    productName?: string;
    productPrice?: number;
  }) =>
    request<{ reply: string; actionSuggestion: string; suggestedPriceQuotation?: number }>(
      '/ai/suggest-inquiry-reply',
      { method: 'POST', body: JSON.stringify(payload) }
    ),
  aiAnalyzeReview: (payload: { rating: number; comment: string; authorName?: string; productName?: string }) =>
    request<{
      sentiment: 'positive' | 'neutral' | 'negative';
      score: number;
      keyThemes: string[];
      requiresUrgentAttention: boolean;
      suggestedReply: string;
    }>('/ai/analyze-review', { method: 'POST', body: JSON.stringify(payload) }),
  aiUploadProduct: (payload: { prompt: string; overrides?: any; dryRun?: boolean }) =>
    request<{ success: boolean; dryRun: boolean; product: any; summary: string }>('/ai/upload-product', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  aiManageProduct: (payload: { command: string; productId?: string; targetQuery?: string; dryRun?: boolean }) =>
    request<{ success: boolean; dryRun: boolean; product: any; changes: Record<string, any>; summary: string }>(
      '/ai/manage-product',
      { method: 'POST', body: JSON.stringify(payload) }
    ),
  aiUpdateContent: (payload: {
    prompt: string;
    target?: 'banner' | 'announcement' | 'page' | 'settings' | 'auto';
    bannerId?: string;
    pageSlug?: string;
    dryRun?: boolean;
  }) =>
    request<{ success: boolean; target: string; dryRun: boolean; updatedRecord: any; summary: string }>(
      '/ai/update-content',
      { method: 'POST', body: JSON.stringify(payload) }
    ),
  aiCommand: (payload: { command: string; dryRun?: boolean }) =>
    request<{
      success: boolean;
      actionType: 'product_upload' | 'product_manage' | 'content_update';
      summary: string;
      result: any;
      dryRun: boolean;
    }>('/ai/command', { method: 'POST', body: JSON.stringify(payload) }),

  // Live Chat Subsystem
  chatThreads: (filter?: { status?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filter?.status && filter.status !== 'all') params.set('status', filter.status);
    if (filter?.search) params.set('search', filter.search);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<ChatThread[]>(`/chat/threads${qs}`);
  },
  chatThread: (id: string) => request<ChatThread>(`/chat/threads/${id}`),
  chatMessages: (threadId: string) => request<ChatMessage[]>(`/chat/threads/${threadId}/messages`),
  sendChatMessage: (
    threadId: string,
    payload: { message: string; senderRole?: string; senderName?: string }
  ) =>
    request<{ message: ChatMessage; thread: ChatThread }>(`/chat/threads/${threadId}/messages`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  markChatRead: (threadId: string, role = 'admin') =>
    request<ChatThread>(`/chat/threads/${threadId}/read`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    }),
  updateChatStatus: (threadId: string, status: string, assignedTo?: string) =>
    request<ChatThread>(`/chat/threads/${threadId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, assignedTo })
    }),
  chatAiDraft: (threadId: string) =>
    request<{ draft: string }>(`/chat/threads/${threadId}/ai-draft`, { method: 'POST' }),
  deleteChatThread: (threadId: string) =>
    request<{ deleted: boolean }>(`/chat/threads/${threadId}`, { method: 'DELETE' }),
  chatSettings: () => request<ChatSettings>('/chat/settings'),
  updateChatSettings: (payload: Partial<ChatSettings>) =>
    request<ChatSettings>('/chat/settings', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    })
};

