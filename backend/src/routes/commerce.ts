import { Router } from 'express';
import { z } from 'zod';
import { optionalAuth, ownerKey, requireAdmin, requireAuth, type AuthedRequest } from '../middleware/auth.ts';
import {
  addCoupon,
  addToCart,
  cancelOrder,
  cartSummary,
  clearCart,
  createOrder,
  dashboardStats,
  deleteCoupon,
  deleteOrder,
  getCart,
  getOrder,
  getWishlist,
  listCoupons,
  listOrders,
  refundOrder,
  removeCartItem,
  toggleWishlist,
  updateCartItem,
  updateOrderStatus,
  validateCoupon
} from '../services/commerceService.ts';
import { fail, ok } from '../utils/response.ts';
import type { CartItem, OrderStatus } from '../types/index.ts';

const router = Router();

const customerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  division: z.string().min(2),
  district: z.string().min(2),
  address: z.string().min(4),
  deliveryNotes: z.string().optional()
});

router.get('/cart', optionalAuth, (req: AuthedRequest, res) => {
  const items = getCart(ownerKey(req));
  const location = req.query.location === 'outside_dhaka' ? 'outside_dhaka' : 'inside_dhaka';
  const couponCode = typeof req.query.coupon === 'string' ? req.query.coupon : undefined;
  const coupon = couponCode ? validateCoupon(couponCode, cartSummary(items, location).subtotal).coupon : null;
  ok(res, cartSummary(items, location, coupon));
});

router.post('/cart/items', optionalAuth, async (req: AuthedRequest, res, next) => {
  try {
    const schema = z.object({
      productId: z.string(),
      size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']),
      color: z.object({ name: z.string(), hex: z.string() }),
      quantity: z.number().int().positive().optional()
    });
    const body = schema.parse(req.body);
    const items = await addToCart(ownerKey(req), body.productId, body.size, body.color, body.quantity ?? 1);
    ok(res, items, 201);
  } catch (err) {
    next(err);
  }
});

router.patch('/cart/items/:id', optionalAuth, async (req: AuthedRequest, res, next) => {
  try {
    const body = z.object({ quantity: z.number().int() }).parse(req.body);
    ok(res, await updateCartItem(ownerKey(req), req.params.id, body.quantity));
  } catch (err) {
    next(err);
  }
});

router.delete('/cart/items/:id', optionalAuth, async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await removeCartItem(ownerKey(req), req.params.id));
  } catch (err) {
    next(err);
  }
});

router.delete('/cart', optionalAuth, async (req: AuthedRequest, res, next) => {
  try {
    await clearCart(ownerKey(req));
    ok(res, { cleared: true });
  } catch (err) {
    next(err);
  }
});

router.get('/wishlist', optionalAuth, (req: AuthedRequest, res) => {
  ok(res, getWishlist(ownerKey(req)));
});

router.post('/wishlist/:productId', optionalAuth, async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await toggleWishlist(ownerKey(req), req.params.productId));
  } catch (err) {
    next(err);
  }
});

router.get('/coupons', (_req, res) => {
  ok(res, listCoupons());
});

router.post('/coupons/validate', optionalAuth, (req, res) => {
  const schema = z.object({
    code: z.string().min(2),
    subtotal: z.number().nonnegative()
  });
  const body = schema.parse(req.body);
  const result = validateCoupon(body.code, body.subtotal);
  ok(res, result);
});

router.post('/coupons', requireAdmin, async (req, res, next) => {
  try {
    const schema = z.object({
      code: z.string().min(2),
      discountPercent: z.number().optional(),
      discountAmount: z.number().optional(),
      discountType: z.enum(['percent', 'fixed']).optional(),
      discountValue: z.number().optional(),
      minSpend: z.number().optional(),
      minOrder: z.number().nonnegative(),
      description: z.string(),
      expiresAt: z.string().optional()
    });
    const body = schema.parse(req.body);
    const coupon = await addCoupon({
      ...body,
      code: body.code.trim().toUpperCase(),
      minSpend: body.minSpend ?? body.minOrder
    });
    ok(res, coupon, 201);
  } catch (err) {
    next(err);
  }
});

router.delete('/coupons/:code', requireAdmin, async (req, res, next) => {
  try {
    const deleted = await deleteCoupon(req.params.code);
    if (!deleted) {
      fail(res, 'Coupon not found.', 404);
      return;
    }
    ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});

router.post('/checkout', optionalAuth, async (req: AuthedRequest, res, next) => {
  try {
    const schema = z.object({
      customer: customerSchema,
      paymentMethod: z.enum(['COD', 'BKASH', 'SSLCOMMERZ']),
      paymentId: z.string().optional(),
      couponCode: z.string().optional(),
      shippingLocation: z.enum(['inside_dhaka', 'outside_dhaka']).default('inside_dhaka'),
      items: z
        .array(
          z.object({
            id: z.string(),
            productId: z.string(),
            product: z.any(),
            size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']),
            color: z.object({ name: z.string(), hex: z.string() }),
            quantity: z.number().int().positive(),
            price: z.number().nonnegative()
          })
        )
        .optional()
    });
    const body = schema.parse(req.body);
    const order = await createOrder({
      ownerKey: ownerKey(req),
      customer: body.customer,
      paymentMethod: body.paymentMethod,
      paymentId: body.paymentId,
      couponCode: body.couponCode,
      shippingLocation: body.shippingLocation,
      items: body.items as CartItem[] | undefined
    });
    ok(res, order, 201);
  } catch (err) {
    next(err);
  }
});

router.get('/orders', optionalAuth, (req: AuthedRequest, res) => {
  if (req.user?.role === 'ADMIN') {
    ok(res, listOrders());
    return;
  }
  if (req.user) {
    ok(res, listOrders({ email: req.user.email }));
    return;
  }
  fail(res, 'Authentication required.', 401);
});

router.get('/orders/track', (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q : '';
  if (!query.trim()) {
    fail(res, 'Provide an order number or phone.', 400);
    return;
  }
  const orders = listOrders({ query });
  if (orders.length === 0) {
    fail(res, 'Order not found.', 404);
    return;
  }
  ok(res, orders[0]);
});

router.get('/orders/:id', optionalAuth, (req: AuthedRequest, res) => {
  const order = getOrder(req.params.id);
  if (!order) {
    fail(res, 'Order not found.', 404);
    return;
  }
  if (req.user?.role !== 'ADMIN' && req.user && req.user.email.toLowerCase() !== order.customer.email.toLowerCase()) {
    fail(res, 'Order not found.', 404);
    return;
  }
  ok(res, order);
});

router.post('/orders/:id/cancel', requireAdmin, async (req, res, next) => {
  try {
    const order = await cancelOrder(req.params.id);
    if (!order) {
      fail(res, 'Order not found.', 404);
      return;
    }
    ok(res, order);
  } catch (err) {
    next(err);
  }
});

router.post('/orders/:id/refund', requireAdmin, async (req, res, next) => {
  try {
    const order = await refundOrder(req.params.id);
    if (!order) {
      fail(res, 'Order not found.', 404);
      return;
    }
    ok(res, order);
  } catch (err) {
    next(err);
  }
});

router.patch('/orders/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const body = z
      .object({
        status: z.enum([
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
        ])
      })
      .parse(req.body);
    const order = await updateOrderStatus(req.params.id, body.status as OrderStatus);
    if (!order) {
      fail(res, 'Order not found.', 404);
      return;
    }
    ok(res, order);
  } catch (err) {
    next(err);
  }
});

router.delete('/orders/:id', requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const restoreStock = req.query.restoreStock !== 'false';
    const deleted = await deleteOrder(req.params.id, restoreStock, req.user?.id);
    if (!deleted) {
      fail(res, 'Order not found.', 404);
      return;
    }
    ok(res, { deleted: true, id: req.params.id });
  } catch (err) {
    next(err);
  }
});

router.get('/admin/stats', requireAdmin, (_req, res) => {
  ok(res, dashboardStats());
});

router.get('/account/orders', requireAuth, (req: AuthedRequest, res) => {
  ok(res, listOrders({ email: req.user!.email }));
});

export default router;
