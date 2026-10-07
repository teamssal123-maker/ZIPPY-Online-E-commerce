import { loadDb, mutateDb } from '../store/db.ts';
import { logAction } from './cmsService.ts';
import type {
  CartItem,
  ColorVariant,
  Coupon,
  CustomerDetails,
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ProductSize,
  TrackingStep
} from '../types/index.ts';
import { createId, createOrderNumber, digitsOnly } from '../utils/ids.ts';
import { calcDiscount, calcShippingFee, calcSubtotal, calcTotal, unitPrice, type ShippingLocation } from '../utils/money.ts';

const STATUS_FLOW: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED'
];

function cartFor(db: ReturnType<typeof loadDb>, ownerKey: string): CartItem[] {
  if (!db.carts[ownerKey]) db.carts[ownerKey] = [];
  return db.carts[ownerKey];
}

export function getCart(ownerKey: string): CartItem[] {
  return structuredClone(cartFor(loadDb(), ownerKey));
}

export function cartSummary(items: CartItem[], location: ShippingLocation, coupon?: Coupon | null) {
  const subtotal = calcSubtotal(items);
  const shippingFee = calcShippingFee(subtotal, location);
  const discount = calcDiscount(coupon, subtotal);
  return {
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    shippingFee,
    discount,
    total: calcTotal(subtotal, discount, shippingFee),
    freeShippingThreshold: 3000,
    coupon: coupon || null
  };
}

export async function addToCart(
  ownerKey: string,
  productId: string,
  size: ProductSize,
  color: ColorVariant,
  quantity = 1
): Promise<CartItem[]> {
  return mutateDb((db) => {
    const product = db.products.find((p) => p.id === productId);
    if (!product) {
      const err = new Error('Product not found.');
      (err as { status?: number }).status = 404;
      throw err;
    }
    const available = product.stock[size] ?? 0;
    if (available < quantity) {
      const err = new Error(`Only ${available} units available in size ${size}.`);
      (err as { status?: number }).status = 409;
      throw err;
    }
    const cart = cartFor(db, ownerKey);
    const id = `${product.id}-${size}-${color.name}`;
    const existing = cart.find((item) => item.id === id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id,
        productId: product.id,
        product,
        size,
        color,
        quantity,
        price: unitPrice(product.price, product.salePrice)
      });
    }
    return structuredClone(cart);
  });
}

export async function updateCartItem(ownerKey: string, cartItemId: string, quantity: number): Promise<CartItem[]> {
  return mutateDb((db) => {
    let cart = cartFor(db, ownerKey);
    if (quantity <= 0) {
      db.carts[ownerKey] = cart.filter((item) => item.id !== cartItemId);
      return structuredClone(db.carts[ownerKey]);
    }
    cart = cart.map((item) => (item.id === cartItemId ? { ...item, quantity } : item));
    db.carts[ownerKey] = cart;
    return structuredClone(cart);
  });
}

export async function removeCartItem(ownerKey: string, cartItemId: string): Promise<CartItem[]> {
  return mutateDb((db) => {
    db.carts[ownerKey] = cartFor(db, ownerKey).filter((item) => item.id !== cartItemId);
    return structuredClone(db.carts[ownerKey]);
  });
}

export async function clearCart(ownerKey: string): Promise<void> {
  await mutateDb((db) => {
    db.carts[ownerKey] = [];
  });
}

export function listCoupons(): Coupon[] {
  return loadDb().coupons;
}

export function validateCoupon(code: string, subtotal: number): { coupon: Coupon | null; message: string; success: boolean } {
  const found = loadDb().coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
  if (!found) return { success: false, message: 'Invalid coupon code.', coupon: null };
  if (found.expiresAt && !Number.isNaN(Date.parse(found.expiresAt)) && Date.parse(found.expiresAt) < Date.now()) {
    return { success: false, message: 'Coupon has expired.', coupon: null };
  }
  if (subtotal < found.minOrder) {
    return {
      success: false,
      message: `Minimum order ৳${found.minOrder.toLocaleString()} required for ${found.code}.`,
      coupon: null
    };
  }
  return { success: true, message: 'Coupon applied!', coupon: found };
}

export async function addCoupon(coupon: Coupon): Promise<Coupon> {
  return mutateDb((db) => {
    const exists = db.coupons.some((c) => c.code.toUpperCase() === coupon.code.toUpperCase());
    if (exists) {
      const err = new Error('Coupon code already exists.');
      (err as { status?: number }).status = 409;
      throw err;
    }
    db.coupons.push(coupon);
    return coupon;
  });
}

export async function deleteCoupon(code: string): Promise<boolean> {
  return mutateDb((db) => {
    const before = db.coupons.length;
    db.coupons = db.coupons.filter((c) => c.code.toUpperCase() !== code.toUpperCase());
    return db.coupons.length < before;
  });
}

function defaultTracking(orderNumber: string, paymentMethod: PaymentMethod): TrackingStep[] {
  const paid = paymentMethod !== 'COD';
  return [
    {
      status: 'PENDING',
      title: 'Order Placed',
      description: `Order ${orderNumber} received.`,
      time: 'Just now',
      done: true,
      current: !paid
    },
    {
      status: 'CONFIRMED',
      title: 'Order Confirmed',
      description: paid ? 'Payment received & verified.' : 'Verification call pending.',
      time: paid ? 'Just now' : 'Pending',
      done: paid,
      current: paid
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
      status: 'OUT_FOR_DELIVERY',
      title: 'Out for Delivery',
      description: 'Rider heading to delivery address.',
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
  ];
}

export interface CheckoutInput {
  ownerKey: string;
  customer: CustomerDetails;
  paymentMethod: PaymentMethod;
  paymentId?: string;
  couponCode?: string;
  shippingLocation: ShippingLocation;
  items?: CartItem[];
}

export async function createOrder(input: CheckoutInput): Promise<Order> {
  return mutateDb((db) => {
    const cart = input.items && input.items.length > 0 ? structuredClone(input.items) : cartFor(db, input.ownerKey);
    if (cart.length === 0) {
      const err = new Error('Cart is empty.');
      (err as { status?: number }).status = 400;
      throw err;
    }

    for (const item of cart) {
      const product = db.products.find((p) => p.id === item.productId);
      if (!product) {
        const err = new Error(`Product ${item.productId} is no longer available.`);
        (err as { status?: number }).status = 409;
        throw err;
      }
      const available = product.stock[item.size] ?? 0;
      if (available < item.quantity) {
        const err = new Error(`Insufficient stock for ${product.name} (${item.size}).`);
        (err as { status?: number }).status = 409;
        throw err;
      }
    }

    const couponResult = input.couponCode ? validateCoupon(input.couponCode, calcSubtotal(cart)) : { coupon: null, success: true, message: '' };
    if (input.couponCode && !couponResult.success) {
      const err = new Error(couponResult.message);
      (err as { status?: number }).status = 400;
      throw err;
    }

    const requestedMethod = input.paymentMethod?.trim().toUpperCase();
    const configuredMethods = (db.paymentMethods || []).filter((pm) => !pm.deletedAt);
    if (configuredMethods.length > 0) {
      const targetMethod = configuredMethods.find(
        (pm) => pm.code.toUpperCase() === requestedMethod || pm.id === input.paymentMethod
      );
      if (targetMethod && targetMethod.status !== 'active') {
        const err = new Error(`Payment method "${targetMethod.name}" (${targetMethod.code}) is currently disabled.`);
        (err as { status?: number }).status = 400;
        throw err;
      }
    }

    const summary = cartSummary(cart, input.shippingLocation, couponResult.coupon);
    const orderNumber = createOrderNumber();
    const paid = input.paymentMethod !== 'COD';
    const paymentId =
      input.paymentId ||
      (paid ? `TXN-${createId('pay').slice(-8).toUpperCase()}` : undefined);
    const order: Order = {
      id: orderNumber,
      orderNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: structuredClone(cart),
      subtotal: summary.subtotal,
      discount: summary.discount,
      couponDiscount: summary.discount,
      shippingFee: summary.shippingFee,
      tax: 0,
      total: summary.total,
      status: paid ? 'CONFIRMED' : 'PENDING',
      paymentStatus: paid ? 'PAID' : 'PENDING',
      paymentMethod: input.paymentMethod,
      paymentId,
      customer: input.customer,
      shippingAddress: input.customer.address,
      billingAddress: input.customer.address,
      customerNote: input.customer.deliveryNotes,
      trackingHistory: defaultTracking(orderNumber, input.paymentMethod)
    };
    db.payments.push({
      id: createId('pay'),
      orderId: order.id,
      transactionId: paymentId || order.id,
      paymentMethod:
        input.paymentMethod === 'COD'
          ? 'cash_on_delivery'
          : input.paymentMethod === 'BKASH'
            ? 'mobile_payment'
            : 'online_payment',
      amount: summary.total,
      currency: 'BDT',
      status: paid ? 'paid' : 'pending',
      paidAt: paid ? new Date().toISOString() : undefined
    });
    db.notifications.unshift({
      id: createId('ntf'),
      channel: 'email',
      event: 'new_order',
      payload: { orderId: order.id, orderNumber },
      createdAt: new Date().toISOString(),
      sent: false
    });

    for (const item of cart) {
      const product = db.products.find((p) => p.id === item.productId);
      if (product) {
        product.stock[item.size] = Math.max(0, (product.stock[item.size] ?? 0) - item.quantity);
      }
    }

    db.orders.unshift(order);
    db.carts[input.ownerKey] = [];
    return order;
  });
}

export function listOrders(filter?: { email?: string; phone?: string; query?: string }): Order[] {
  let orders = loadDb().orders.filter((o) => !o.deletedAt);
  if (filter?.email) {
    const targetEmail = filter.email.trim().toLowerCase();
    orders = orders.filter((o) => o.customer.email.toLowerCase() === targetEmail);
  }
  if (filter?.phone) {
    const phone = digitsOnly(filter.phone);
    if (phone.length >= 4) {
      orders = orders.filter((o) => digitsOnly(o.customer.phone).includes(phone));
    }
  }
  if (filter?.query) {
    const raw = filter.query.trim();
    const q = raw.toLowerCase();
    const cleanAlphaNum = q.replace(/[^a-z0-9]/g, '');
    const cleanWithoutPrefix = cleanAlphaNum.replace(/^(rm|inv|order)/, '');
    const phone = digitsOnly(raw);

    orders = orders.filter((o) => {
      const orderNum = o.orderNumber.toLowerCase();
      const orderNumClean = orderNum.replace(/[^a-z0-9]/g, '');
      const orderNumWithoutPrefix = orderNumClean.replace(/^(rm|inv|order)/, '');
      const orderId = (o.id || '').toLowerCase();
      const customerEmail = (o.customer?.email || '').toLowerCase();
      const customerPhone = digitsOnly(o.customer?.phone || '');
      const customerName = (o.customer?.fullName || '').toLowerCase();
      const paymentId = (o.paymentId || '').toLowerCase();

      // 1. Direct or sanitized orderNumber / ID match
      if (orderNum === q || orderId === q) return true;
      if (cleanAlphaNum.length >= 3 && (orderNumClean === cleanAlphaNum || orderNumClean.includes(cleanAlphaNum))) return true;
      if (
        cleanWithoutPrefix.length >= 3 &&
        (orderNumWithoutPrefix === cleanWithoutPrefix ||
          orderNumWithoutPrefix.includes(cleanWithoutPrefix) ||
          orderNumClean.includes(cleanWithoutPrefix))
      ) {
        return true;
      }

      // 2. Phone number match (at least 4 digits)
      if (phone.length >= 4 && (customerPhone.includes(phone) || phone.includes(customerPhone))) return true;

      // 3. Email match
      if (q.includes('@') && customerEmail.includes(q)) return true;

      // 4. Payment Trx ID match
      if (paymentId && (paymentId === q || paymentId.includes(q))) return true;

      // 5. Customer name match if query is long enough
      if (q.length >= 4 && customerName.includes(q)) return true;

      return false;
    });
  }
  return orders;
}

export function getOrder(idOrNumber: string): Order | undefined {
  const raw = idOrNumber.trim();
  const key = raw.toLowerCase();
  const clean = key.replace(/[^a-z0-9]/g, '');
  const cleanWithoutPrefix = clean.replace(/^(rm|inv|order)/, '');

  return loadDb().orders.find((o) => {
    if (o.deletedAt) return false;
    const oNum = o.orderNumber.toLowerCase();
    const oId = o.id.toLowerCase();
    const oClean = oNum.replace(/[^a-z0-9]/g, '');
    const oCleanWithoutPrefix = oClean.replace(/^(rm|inv|order)/, '');

    if (oId === key || oNum === key) return true;
    if (clean.length >= 3 && oClean === clean) return true;
    if (
      cleanWithoutPrefix.length >= 3 &&
      (oCleanWithoutPrefix === cleanWithoutPrefix || oClean.includes(cleanWithoutPrefix))
    ) {
      return true;
    }
    return false;
  });
}

export async function cancelOrder(orderId: string): Promise<Order | undefined> {
  return updateOrderStatus(orderId, 'CANCELLED');
}

export async function refundOrder(orderId: string): Promise<Order | undefined> {
  return mutateDb((db) => {
    const order = db.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return undefined;
    if (order.status !== 'CANCELLED') {
      for (const item of order.items) {
        const product = db.products.find((p) => p.id === item.productId);
        if (product) product.stock[item.size] = (product.stock[item.size] ?? 0) + item.quantity;
      }
    }
    order.status = 'REFUNDED';
    order.paymentStatus = 'REFUNDED';
    order.updatedAt = new Date().toISOString();
    order.trackingHistory.push({
      status: 'REFUNDED',
      title: 'Refunded',
      description: 'Payment refunded to customer.',
      time: 'Updated now',
      done: true,
      current: true
    });
    const payment = db.payments.find((p) => p.orderId === order.id);
    if (payment) payment.status = 'refunded';
    return order;
  });
}

export async function returnOrder(orderId: string): Promise<Order | undefined> {
  return mutateDb((db) => {
    const order = db.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return undefined;
    order.status = 'RETURNED';
    order.updatedAt = new Date().toISOString();
    for (const item of order.items) {
      const product = db.products.find((p) => p.id === item.productId);
      if (product) product.stock[item.size] = (product.stock[item.size] ?? 0) + item.quantity;
    }
    order.trackingHistory.push({
      status: 'RETURNED',
      title: 'Returned',
      description: 'Order returned and stock restored.',
      time: 'Updated now',
      done: true,
      current: true
    });
    return order;
  });
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | undefined> {
  return mutateDb((db) => {
    const order = db.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return undefined;
    order.status = status;
    if (status === 'DELIVERED') order.paymentStatus = 'PAID' as PaymentStatus;
    if (status === 'CANCELLED') {
      for (const item of order.items) {
        const product = db.products.find((p) => p.id === item.productId);
        if (product) product.stock[item.size] = (product.stock[item.size] ?? 0) + item.quantity;
      }
      if (order.paymentStatus === 'PAID') order.paymentStatus = 'REFUNDED';
    }
    const known = new Set(order.trackingHistory.map((s) => s.status));
    for (const step of STATUS_FLOW) {
      if (!known.has(step) && STATUS_FLOW.indexOf(step) <= STATUS_FLOW.indexOf(status)) {
        order.trackingHistory.push({
          status: step,
          title: step.replaceAll('_', ' '),
          description: `Status updated to ${step}.`,
          time: 'Updated now',
          done: true
        });
      }
    }
    order.trackingHistory = order.trackingHistory.map((step) => {
      const stepIndex = STATUS_FLOW.indexOf(step.status);
      const currentIndex = STATUS_FLOW.indexOf(status);
      if (step.status === status) {
        return { ...step, done: true, current: true, time: 'Updated now' };
      }
      if (stepIndex !== -1 && currentIndex !== -1 && stepIndex < currentIndex) {
        return { ...step, done: true, current: false };
      }
      return { ...step, current: false };
    });
    return order;
  });
}

export async function deleteOrder(
  orderId: string,
  restoreStock = true,
  userId?: string
): Promise<boolean> {
  return mutateDb((db) => {
    const index = db.orders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
    if (index === -1) return false;
    const order = db.orders[index];

    // Restore inventory if requested and order wasn't already cancelled, refunded, or returned
    if (restoreStock && order.status !== 'CANCELLED' && order.status !== 'REFUNDED' && order.status !== 'RETURNED') {
      for (const item of order.items) {
        const product = db.products.find((p) => p.id === item.productId);
        if (product) {
          product.stock[item.size] = (product.stock[item.size] ?? 0) + item.quantity;
          product.stockQuantity = Object.values(product.stock).reduce((a, b) => a + b, 0);
        }
      }
    }

    order.deletedAt = new Date().toISOString();
    db.orders.splice(index, 1);

    // Clean up associated payment transactions
    db.payments = db.payments.filter((p) => p.orderId !== order.id && p.orderId !== order.orderNumber);

    if (userId) {
      logAction(db, userId, 'order_deleted', 'orders', order.id, order, undefined);
    }

    return true;
  });
}

export function dashboardStats() {
  const db = loadDb();
  const grossRevenue = db.orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = db.orders.filter((o) => o.status === 'PENDING' || o.status === 'CONFIRMED').length;
  const paidOrders = db.orders.filter((o) => o.paymentStatus === 'PAID');
  return {
    grossRevenue,
    totalOrders: db.orders.length,
    pendingOrders,
    paidOrders: paidOrders.length,
    catalogCount: db.products.length,
    lowStock: db.products.filter((p) => Object.values(p.stock).reduce((a, b) => a + b, 0) < 8).length,
    stores: db.stores.length
  };
}

export function getWishlist(ownerKey: string): string[] {
  return loadDb().wishlists[ownerKey] || [];
}

export async function toggleWishlist(ownerKey: string, productId: string): Promise<string[]> {
  return mutateDb((db) => {
    const current = db.wishlists[ownerKey] || [];
    const exists = current.includes(productId);
    db.wishlists[ownerKey] = exists ? current.filter((id) => id !== productId) : [...current, productId];
    return db.wishlists[ownerKey];
  });
}
