import type {
  CartItem,
  Category,
  ColorVariant,
  Coupon,
  CustomerDetails,
  Order,
  OrderStatus,
  PaymentMethod,
  Product,
  ProductReview,
  ProductSize,
  StoreLocation,
  User,
  Banner,
  WebsiteSettings,
  Offer,
  PaymentMethodConfig,
  ChatMessage,
  ChatThread,
  ChatSenderRole,
  ChatSettings
} from '../types';

const TOKEN_KEY = 'zippy_token';
const GUEST_KEY = 'zippy_guest_key';

export interface ApiError extends Error {
  status: number;
  details?: unknown;
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: { message: string; details?: unknown };
}

function guestKey(): string {
  const existing = localStorage.getItem(GUEST_KEY) || localStorage.getItem('richman_guest_key');
  if (existing) return existing;
  const created = `guest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  localStorage.setItem(GUEST_KEY, created);
  return created;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('richman_token');
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
  headers.set('x-guest-key', guestKey());

  const res = await fetch(`/api${path}`, { ...init, headers });
  const body = (await res.json().catch(() => ({}))) as ApiEnvelope<T>;
  if (!res.ok || body.success === false) {
    const err = new Error(body.error?.message || `Request failed (${res.status})`) as ApiError;
    err.status = res.status;
    err.details = body.error?.details;
    throw err;
  }
  return body.data as T;
}

export const api = {
  health: () => request<{ status: string }>('/health'),
  categories: () => request<Category[]>('/categories'),
  stores: () => request<StoreLocation[]>('/stores'),
  products: (params?: Record<string, string | number | boolean | undefined>) => {
    const qs = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== '') qs.set(key, String(value));
      }
    }
    const suffix = qs.toString() ? `?${qs}` : '';
    return request<Product[]>(`/products${suffix}`);
  },
  product: (id: string) => request<Product>(`/products/${id}`),
  createProduct: (payload: Partial<Product> & { name: string; sku: string; categoryId: string; price: number }) =>
    request<Product>('/products', { method: 'POST', body: JSON.stringify(payload) }),
  updateProduct: (id: string, payload: Partial<Product>) =>
    request<Product>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteProduct: (id: string) => request<{ deleted: boolean }>(`/products/${id}`, { method: 'DELETE' }),
  reviews: (productId: string) => request<ProductReview[]>(`/products/${productId}/reviews`),
  addReview: (productId: string, payload: { authorName: string; rating: number; comment: string }) =>
    request<ProductReview>(`/products/${productId}/reviews`, { method: 'POST', body: JSON.stringify(payload) }),
  coupons: () => request<Coupon[]>('/coupons'),
  validateCoupon: (code: string, subtotal: number) =>
    request<{ success: boolean; message: string; coupon: Coupon | null }>('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal })
    }),
  createCoupon: (payload: Coupon) => request<Coupon>('/coupons', { method: 'POST', body: JSON.stringify(payload) }),
  deleteCoupon: (code: string) => request<{ deleted: boolean }>(`/coupons/${code}`, { method: 'DELETE' }),
  cart: (location?: 'inside_dhaka' | 'outside_dhaka', coupon?: string) => {
    const qs = new URLSearchParams();
    if (location) qs.set('location', location);
    if (coupon) qs.set('coupon', coupon);
    return request<{
      items: CartItem[];
      itemCount: number;
      subtotal: number;
      shippingFee: number;
      discount: number;
      total: number;
      coupon: Coupon | null;
    }>(`/cart?${qs}`);
  },
  addCartItem: (payload: { productId: string; size: ProductSize; color: ColorVariant; quantity?: number }) =>
    request<CartItem[]>('/cart/items', { method: 'POST', body: JSON.stringify(payload) }),
  updateCartItem: (id: string, quantity: number) =>
    request<CartItem[]>(`/cart/items/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity })
    }),
  removeCartItem: (id: string) =>
    request<CartItem[]>(`/cart/items/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  clearCart: () => request<{ cleared: boolean }>('/cart', { method: 'DELETE' }),
  wishlist: () => request<string[]>('/wishlist'),
  toggleWishlist: (productId: string) => request<string[]>(`/wishlist/${productId}`, { method: 'POST' }),
  checkout: (payload: {
    customer: CustomerDetails;
    paymentMethod: PaymentMethod;
    paymentId?: string;
    couponCode?: string;
    shippingLocation: 'inside_dhaka' | 'outside_dhaka';
    items?: CartItem[];
  }) => request<Order>('/checkout', { method: 'POST', body: JSON.stringify(payload) }),
  orders: () => request<Order[]>('/orders'),
  trackOrder: (q: string) => request<Order>(`/orders/track?q=${encodeURIComponent(q)}`),
  updateOrderStatus: (id: string, status: OrderStatus) =>
    request<Order>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  stats: () =>
    request<{
      grossRevenue: number;
      totalOrders: number;
      pendingOrders: number;
      catalogCount: number;
      stores: number;
    }>('/admin/stats'),
  login: (email: string, password: string) => request<{ user: User; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  register: (payload: { fullName: string; email: string; phone: string; password: string }) =>
    request<{ user: User; token: string }>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request<User>('/auth/me'),
  updateProfile: (payload: Partial<Pick<User, 'fullName' | 'phone' | 'savedAddresses'>>) =>
    request<User>('/auth/me', { method: 'PATCH', body: JSON.stringify(payload) }),
  banners: (activeOnly = true) =>
    request<Banner[]>(`/banners${activeOnly ? '?active=true' : ''}`),
  settings: () => request<WebsiteSettings>('/settings'),
  offers: () => request<Offer[]>('/offers'),
  paymentMethods: (status?: string) =>
    request<PaymentMethodConfig[]>(status ? `/payment-methods?status=${status}` : '/payment-methods'),
  initiatePayment: (payload: { orderId: string; gatewayCode?: string; amount?: number }) =>
    request<{ success: boolean; paymentId: string; transactionId: string; redirectUrl?: string; paymentToken?: string }>('/payments/initiate', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  verifyPayment: (payload: { transactionId: string; paymentId?: string; orderId?: string }) =>
    request<{ success: boolean; verified: boolean; transactionId: string }>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  createInquiry: (payload: { name: string; email: string; phone?: string; message: string; productId?: string }) =>
    request<{ id: string; status: string }>('/inquiries', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  aiStatus: () => request<{ status: string; provider: string; model: string; capabilities: string[] }>('/ai/status'),
  aiChat: (payload: {
    message: string;
    history?: { role: 'user' | 'assistant' | 'system'; content: string }[];
    customerName?: string;
    occasion?: string;
    budget?: number;
  }) =>
    request<{
      reply: string;
      provider: string;
      model: string;
      suggestedProducts?: Product[];
      suggestedQuestions?: string[];
    }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  aiRecommendations: (payload: {
    productId?: string;
    query?: string;
    occasion?: string;
    categoryId?: string;
    limit?: number;
  }) =>
    request<{
      recommendations: Product[];
      rationale?: string;
    }>('/ai/recommendations', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  // Live Chat System
  listChatThreads: (status?: string) =>
    request<ChatThread[]>(`/chat/threads${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  createOrGetChatThread: (payload: {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    subject?: string;
    initialMessage?: string;
    guestKey?: string;
  }) =>
    request<{ thread: ChatThread; message?: ChatMessage; autoReply?: ChatMessage }>('/chat/threads', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getChatMessages: (threadId: string) => request<ChatMessage[]>(`/chat/threads/${threadId}/messages`),
  sendChatMessage: (
    threadId: string,
    payload: {
      message: string;
      senderRole?: ChatSenderRole;
      senderName?: string;
      attachments?: string[];
      metadata?: any;
      autoRespondAi?: boolean;
    }
  ) =>
    request<{ message: ChatMessage; thread: ChatThread; autoReply?: ChatMessage }>(
      `/chat/threads/${threadId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    ),
  markChatRead: (threadId: string, role: 'admin' | 'customer' = 'customer') =>
    request<ChatThread>(`/chat/threads/${threadId}/read`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    }),
  getChatSettings: () => request<ChatSettings>('/chat/settings')
};


