import React, { useState } from 'react';
import { ShoppingBag, Trash2, ArrowRight, ArrowLeft, Tag, Truck, ShieldCheck, Check } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { hrefFor } from '../utils/routes';

export const CartView: React.FC = () => {
  const {
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

  const total = Math.max(0, cartSubtotal - discountAmount + shippingFee);
  const amountNeeded = Math.max(0, freeShippingThreshold - cartSubtotal);

  const handleApply = async (e: React.FormEvent) => {
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

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center">
        <ShoppingBag className="w-16 h-16 stroke-[1] text-neutral-300 mx-auto mb-4" />
        <h2 className="font-serif text-3xl font-bold text-neutral-900">Your Bag is Empty</h2>
        <p className="text-xs text-neutral-500 mt-2 max-w-sm mx-auto">
          Explore our Italian wool blazers, non-iron Egyptian cotton shirts, and Eid festive panjabis.
        </p>
        <a
          href={hrefFor('shop')}
          className="mt-8 inline-block px-8 py-3.5 bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
        >
          Explore Collection
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Header */}
      <div className="mb-8 pb-4 border-b border-neutral-200 flex items-center justify-between">
        <div>
          <a
            href={hrefFor('shop')}
            className="text-xs text-neutral-500 hover:text-black flex items-center gap-1.5 mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Browsing</span>
          </a>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
            YOUR SHOPPING BAG ({cart.length} {cart.length === 1 ? 'ITEM' : 'ITEMS'})
          </h1>
        </div>
      </div>

      {/* Free Shipping Alert */}
      <div className="mb-8 p-4 bg-[#F9F9F8] border border-neutral-200 flex items-center justify-between text-xs text-neutral-700">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#9A7B38]" />
          <span>
            {amountNeeded > 0 ? (
              <>
                Add <strong className="text-neutral-900">৳{amountNeeded.toLocaleString()}</strong> more to your order for complimentary Dhaka courier delivery!
              </>
            ) : (
              <strong className="text-green-700">
                ✓ Complimentary Dhaka delivery unlocked for this bag!
              </strong>
            )}
          </span>
        </div>
        <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">
          Threshold: ৳3,000
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Items Table (8 Cols) */}
        <div className="lg:col-span-8">
          <div className="border border-neutral-200 divide-y divide-neutral-200 bg-white">
            <div className="hidden sm:grid grid-cols-12 py-3 px-6 bg-neutral-50 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              <span className="col-span-6">Garment</span>
              <span className="col-span-2 text-center">Size / Color</span>
              <span className="col-span-2 text-center">Quantity</span>
              <span className="col-span-2 text-right">Subtotal</span>
            </div>

            {cart.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-12 items-center gap-4"
              >
                {/* Col 1: Image & Name */}
                <div className="sm:col-span-6 flex items-center gap-4">
                  <div className="w-20 h-26 bg-neutral-100 shrink-0 overflow-hidden border border-neutral-200">
                    <ImageWithFallback
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
                      {item.product.categoryName} · {item.product.sku}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-neutral-900 mt-0.5">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-neutral-500 font-mono mt-1">
                      ৳{item.price.toLocaleString()} each
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[11px] text-red-600 hover:underline flex items-center gap-1 mt-2 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>

                {/* Col 2: Size & Color */}
                <div className="sm:col-span-2 text-center text-xs">
                  <span className="font-semibold text-neutral-900">{item.size}</span>
                  <div className="flex items-center justify-center gap-1 text-[11px] text-neutral-500 mt-0.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-neutral-300"
                      style={{ backgroundColor: item.color.hex }}
                    />
                    <span>{item.color.name}</span>
                  </div>
                </div>

                {/* Col 3: Quantity */}
                <div className="sm:col-span-2 flex justify-center">
                  <div className="flex items-center border border-neutral-300">
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1 text-neutral-600 hover:text-black text-xs"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-semibold tabular-nums text-center min-w-[30px]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-1 text-neutral-600 hover:text-black text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Col 4: Total */}
                <div className="sm:col-span-2 text-right">
                  <span className="text-sm font-bold text-neutral-900 tabular-nums">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Order Summary (4 Cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-neutral-200 p-6 space-y-6">
            <h3 className="font-serif text-lg font-bold text-neutral-900 pb-4 border-b border-neutral-200">
              SUMMARY
            </h3>

            {/* Coupon module */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 text-xs">
                  <div className="flex items-center gap-2 text-green-800">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>
                      Coupon <strong>{appliedCoupon.code}</strong> applied
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-red-600 hover:underline text-[11px] font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApply} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Coupon: ZIPPY10"
                      className="w-full pl-8 pr-3 py-2 text-xs border border-neutral-300 uppercase font-mono focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-red-600 mt-1">{couponError}</p>}
            </div>

            {/* Destination Selection */}
            <div className="text-xs space-y-2">
              <label className="font-semibold text-neutral-800 block">Delivery Region</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShippingLocation('inside_dhaka')}
                  className={`py-2 px-3 border text-xs text-center transition-colors cursor-pointer ${
                    shippingLocation === 'inside_dhaka'
                      ? 'border-neutral-900 bg-neutral-900 text-white font-bold'
                      : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                  }`}
                >
                  Inside Dhaka (৳80)
                </button>
                <button
                  onClick={() => setShippingLocation('outside_dhaka')}
                  className={`py-2 px-3 border text-xs text-center transition-colors cursor-pointer ${
                    shippingLocation === 'outside_dhaka'
                      ? 'border-neutral-900 bg-neutral-900 text-white font-bold'
                      : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                  }`}
                >
                  Outside Dhaka (৳150)
                </button>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2 pt-4 border-t border-neutral-200 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="tabular-nums font-semibold text-neutral-900">
                  ৳{cartSubtotal.toLocaleString()}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-[#B00020]">
                  <span>Privilege Discount</span>
                  <span className="tabular-nums font-bold">
                    -৳{discountAmount.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span className="tabular-nums font-semibold text-neutral-900">
                  {shippingFee === 0 ? 'FREE' : `৳${shippingFee}`}
                </span>
              </div>

              <div className="flex justify-between text-base font-bold text-neutral-900 pt-3 border-t border-neutral-200">
                <span>Total</span>
                <span className="tabular-nums font-serif text-xl">৳{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <a
              href={hrefFor('checkout')}
              className="w-full py-4 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
