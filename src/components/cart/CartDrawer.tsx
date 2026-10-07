import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Truck, Check } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { hrefFor } from '../../utils/routes';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    cartSubtotal,
    updateCartQuantity,
    removeFromCart,
    shippingFee,
    shippingLocation,
    setShippingLocation,
    freeShippingThreshold,
    shippingInsideDhaka,
    shippingOutsideDhaka,
    appliedCoupon,
    discountAmount,
    applyCoupon,
    removeCoupon,
    activeBundleOffer,
    bundleDiscountAmount,
    autoCampaignDiscountAmount,
    hasFreeShippingOffer,
    freeShippingOfferName
  } = useShop();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isCartOpen) return null;

  const total = Math.max(0, cartSubtotal - discountAmount + shippingFee);
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const progressPercent = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponInput.trim()) return;
    const res = await applyCoupon(couponInput);
    if (res.success) {
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-neutral-800" />
            <span className="font-serif text-lg font-bold text-neutral-900">
              Shopping Bag
            </span>
            <span className="text-xs text-neutral-400 tabular-nums">
              ({cart.length} {cart.length === 1 ? 'item' : 'items'})
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-black transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="px-6 py-3 bg-[#F9F9F8] border-b border-neutral-200">
          <div className="flex items-center justify-between text-xs text-neutral-700 font-medium mb-1.5">
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#9A7B38]" />
              <span>
                {amountNeededForFreeShipping > 0 ? (
                  <>
                    Add <strong className="text-neutral-900">৳{amountNeededForFreeShipping.toLocaleString()}</strong> for Free Dhaka Delivery
                  </>
                ) : (
                  <span className="text-green-700 font-semibold">
                    ✓ You have qualified for Free Dhaka Delivery!
                  </span>
                )}
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono tabular-nums">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-neutral-200 overflow-hidden">
            <div
              className="h-full bg-neutral-900 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-neutral-100">
          {cart.length === 0 ? (
            <div className="py-20 text-center text-neutral-400 flex flex-col items-center">
              <ShoppingBag className="w-12 h-12 stroke-[1] text-neutral-300 mb-3" />
              <p className="text-sm font-medium text-neutral-800">Your bag is currently empty.</p>
              <p className="text-xs text-neutral-400 mt-1">
                Explore our tailored blazers and Egyptian cotton shirts.
              </p>
              <a
                href={hrefFor('shop')}
                onClick={() => setIsCartOpen(false)}
                className="mt-6 px-6 py-2.5 bg-neutral-900 text-white text-xs font-semibold uppercase tracking-wider hover:bg-black transition-colors"
              >
                Discover Collection
              </a>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="py-4 flex gap-4">
                <div className="w-20 h-24 bg-neutral-100 shrink-0 overflow-hidden border border-neutral-200">
                  <ImageWithFallback
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-neutral-900 truncate">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-neutral-400 hover:text-red-600 transition-colors p-0.5"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5">
                      <span>Size: {item.size}</span>
                      <span>·</span>
                      <div className="flex items-center gap-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-neutral-300"
                          style={{ backgroundColor: item.color.hex }}
                        />
                        <span>{item.color.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-neutral-200">
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-0.5 text-neutral-600 hover:text-black text-xs"
                      >
                        -
                      </button>
                      <span className="px-2.5 py-0.5 text-xs font-semibold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-0.5 text-neutral-600 hover:text-black text-xs"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-xs font-bold text-neutral-900 tabular-nums">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-neutral-200 bg-[#FAFAFA] space-y-4">
            {/* Coupon Code Section */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2 text-green-800">
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    <span>
                      Coupon <strong>{appliedCoupon.code}</strong> applied (-৳{discountAmount.toLocaleString()})
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-[11px] text-red-600 hover:underline font-medium"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Coupon: ZIPPY10"
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-200 placeholder-neutral-400 uppercase font-mono tracking-wider focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && (
                <p className="text-[11px] text-red-600 mt-1">{couponError}</p>
              )}
            </div>

            {/* Delivery Location Toggle */}
            <div className="flex items-center justify-between text-xs text-neutral-600 pt-1">
              <span>Delivery Destination:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShippingLocation('inside_dhaka')}
                  className={`px-2 py-0.5 text-[11px] border font-medium ${
                    shippingLocation === 'inside_dhaka'
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-200 text-neutral-600'
                  }`}
                >
                  Inside Dhaka
                </button>
                <button
                  onClick={() => setShippingLocation('outside_dhaka')}
                  className={`px-2 py-0.5 text-[11px] border font-medium ${
                    shippingLocation === 'outside_dhaka'
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-200 text-neutral-600'
                  }`}
                >
                  Outside Dhaka
                </button>
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-1.5 text-xs border-t border-neutral-200 pt-3">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="tabular-nums font-medium text-neutral-900">
                  ৳{cartSubtotal.toLocaleString()}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-[#B00020]">
                  <span>Privilege Discount</span>
                  <span className="tabular-nums font-semibold">
                    -৳{discountAmount.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-neutral-600">
                <span>Shipping Fee ({shippingLocation === 'inside_dhaka' ? 'Dhaka' : 'Outside Dhaka'})</span>
                <span className="tabular-nums font-medium text-neutral-900">
                  {shippingFee === 0 ? 'FREE' : `৳${shippingFee}`}
                </span>
              </div>

              <div className="flex justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                <span>Estimated Total</span>
                <span className="tabular-nums text-base">৳{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-2 pt-2">
              <a
                href={hrefFor('checkout')}
                onClick={() => setIsCartOpen(false)}
                className="w-full py-3.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href={hrefFor('cart')}
                onClick={() => setIsCartOpen(false)}
                className="w-full py-2.5 border border-neutral-300 hover:border-neutral-900 text-neutral-800 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer block text-center"
              >
                View Full Bag Details
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
