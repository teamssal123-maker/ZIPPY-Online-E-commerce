import { config } from '../config/index.ts';
import type { Coupon } from '../types/index.ts';

export type ShippingLocation = 'inside_dhaka' | 'outside_dhaka';

export function unitPrice(price: number, salePrice?: number | null): number {
  return salePrice && salePrice > 0 && salePrice < price ? salePrice : price;
}

export function calcSubtotal(items: { price: number; quantity: number }[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function calcShippingFee(subtotal: number, location: ShippingLocation): number {
  if (subtotal <= 0) return 0;
  if (subtotal >= config.freeShippingThreshold) return 0;
  return location === 'inside_dhaka' ? config.shippingInsideDhaka : config.shippingOutsideDhaka;
}

export function calcDiscount(coupon: Coupon | null | undefined, subtotal: number): number {
  if (!coupon || subtotal <= 0) return 0;
  if (coupon.discountPercent) {
    return Math.round((subtotal * coupon.discountPercent) / 100);
  }
  if (coupon.discountAmount) {
    return Math.min(coupon.discountAmount, subtotal);
  }
  if (coupon.discountType === 'percent' && coupon.discountValue) {
    return Math.round((subtotal * coupon.discountValue) / 100);
  }
  if (coupon.discountType === 'fixed' && coupon.discountValue) {
    return Math.min(coupon.discountValue, subtotal);
  }
  return 0;
}

export function calcTotal(subtotal: number, discount: number, shippingFee: number): number {
  return Math.max(0, subtotal - discount + shippingFee);
}
