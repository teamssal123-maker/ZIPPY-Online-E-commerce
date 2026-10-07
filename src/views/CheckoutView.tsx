import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Truck,
  ArrowRight,
  ArrowLeft,
  Lock,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  Landmark
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { BANGLADESH_DIVISIONS } from '../data/mockData';
import { PaymentMethod, PaymentMethodConfig } from '../types';
import { api } from '../api/client';
import { BKashPaymentModal } from '../components/checkout/BKashPaymentModal';
import { SSLCommerzModal } from '../components/checkout/SSLCommerzModal';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { hrefFor } from '../utils/routes';

export const CheckoutView: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    discountAmount,
    shippingFee,
    shippingLocation,
    setShippingLocation,
    createOrder,
    user,
    showToast,
    bundleDiscountAmount,
    autoCampaignDiscountAmount,
    activeBundleOffer,
    appliedCoupon,
    hasFreeShippingOffer,
    freeShippingOfferName
  } = useShop();

  // Form states
  const [fullName, setFullName] = useState(user?.fullName || 'Tahmidur Rahman');
  const [email, setEmail] = useState(user?.email || 'tahmid.rahman@example.com');
  const [phone, setPhone] = useState(user?.phone || '+880 1712-345678');
  const [division, setDivision] = useState('Dhaka');
  const [district, setDistrict] = useState('Dhaka City');
  const [address, setAddress] = useState('House 18, Road 7, Sector 4, Uttara');
  const [deliveryNotes, setDeliveryNotes] = useState('Please call before delivery.');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [activePaymentMethods, setActivePaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);

  // Fetch only active payment methods configured in the backend
  useEffect(() => {
    let mounted = true;
    api
      .paymentMethods('active')
      .then((methods) => {
        if (!mounted) return;
        const valid = (methods || []).filter((m) => m.status === 'active');
        setActivePaymentMethods(valid);
        setLoadingPaymentMethods(false);
        if (valid.length > 0) {
          const currentValid = valid.some(
            (m) => m.code.toUpperCase() === paymentMethod.toUpperCase()
          );
          if (!currentValid) {
            const def = valid.find((m) => m.isDefault) || valid[0];
            setPaymentMethod(def.code);
          }
        }
      })
      .catch(() => {
        if (!mounted) return;
        setLoadingPaymentMethods(false);
        setActivePaymentMethods([
          {
            id: 'pm-cod',
            code: 'COD',
            name: 'Cash on Delivery (COD)',
            type: 'cod',
            description: 'Inspect your signature garments at your doorstep and pay cash upon receipt.',
            instructions: 'Keep exact cash ready for the courier delivery associate.',
            status: 'active',
            isDefault: true
          }
        ]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Interactive Payment Gateway Modals
  const [isBKashModalOpen, setIsBKashModalOpen] = useState(false);
  const [isSSLModalOpen, setIsSSLModalOpen] = useState(false);
  const [tempOrderNumber, setTempOrderNumber] = useState(
    `RM-2026-${Math.floor(1000 + Math.random() * 9000)}`
  );

  const total = Math.max(0, cartSubtotal - discountAmount + shippingFee);

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <h2 className="font-serif text-2xl font-bold text-neutral-900">Your bag is empty</h2>
        <p className="text-xs text-neutral-500 mt-2">
          Add items to your bag before proceeding to checkout.
        </p>
        <a
          href={hrefFor('shop')}
          className="mt-6 inline-block px-8 py-3 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-black"
        >
          Explore Menswear
        </a>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      showToast('Please complete all required address fields.', 'error');
      return;
    }

    if (paymentMethod === 'BKASH') {
      setIsBKashModalOpen(true);
      return;
    }

    if (paymentMethod === 'SSLCOMMERZ') {
      setIsSSLModalOpen(true);
      return;
    }

    await createOrder({
      customer: {
        fullName,
        email,
        phone,
        division,
        district,
        address,
        deliveryNotes
      },
      paymentMethod
    });
  };

  const handleGatewayPaymentSuccess = async (trxId: string) => {
    setIsBKashModalOpen(false);
    setIsSSLModalOpen(false);

    await createOrder({
      customer: {
        fullName,
        email,
        phone,
        division,
        district,
        address,
        deliveryNotes
      },
      paymentMethod,
      paymentId: trxId
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Header */}
      <div className="mb-10 pb-4 border-b border-neutral-200 flex items-center justify-between">
        <div>
          <a
            href={hrefFor('cart')}
            className="text-xs text-neutral-500 hover:text-black flex items-center gap-1.5 mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Shopping Bag</span>
          </a>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
            SARTORIAL CHECKOUT
          </h1>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-500">
          <Lock className="w-4 h-4 text-green-700" />
          <span>256-Bit Encrypted Security</span>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left Column: Customer & Shipping Details (7 Cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Step 1: Customer Info */}
          <div className="bg-white border border-neutral-200 p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-4 flex items-center gap-2">
              <span className="w-5 h-5 bg-neutral-900 text-white rounded-full flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Client Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Phone Number (Bangladesh) *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 17XXXXXXXX"
                  className="w-full bg-[#FAFAFA] border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 font-mono"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Email Address (For Invoices & Tracking updates) *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                  required
                />
              </div>
            </div>
          </div>

          {/* Step 2: Shipping Destination */}
          <div className="bg-white border border-neutral-200 p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-4 flex items-center gap-2">
              <span className="w-5 h-5 bg-neutral-900 text-white rounded-full flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Shipping & Delivery Destination</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Division *
                </label>
                <select
                  value={division}
                  onChange={(e) => {
                    const div = e.target.value;
                    setDivision(div);
                    if (div === 'Dhaka') {
                      setShippingLocation('inside_dhaka');
                      setDistrict('Dhaka City');
                    } else {
                      setShippingLocation('outside_dhaka');
                      setDistrict(div);
                    }
                  }}
                  className="w-full bg-[#FAFAFA] border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 cursor-pointer"
                >
                  {BANGLADESH_DIVISIONS.map((div) => (
                    <option key={div} value={div}>
                      {div} Division
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  District / Zone *
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Street Address, House No, Road, Area *
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  placeholder="e.g. House 14, Road 11, Gulshan 1, Dhaka"
                  className="w-full bg-[#FAFAFA] border border-neutral-300 p-3 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Special Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="e.g. Please ring the doorbell or hand to building reception"
                  className="w-full bg-[#FAFAFA] border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Payment Method */}
          <div className="bg-white border border-neutral-200 p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-4 flex items-center gap-2">
              <span className="w-5 h-5 bg-neutral-900 text-white rounded-full flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Payment Method</span>
            </h3>

            <div className="space-y-3">
              {loadingPaymentMethods ? (
                <div className="p-6 border border-neutral-200 bg-neutral-50/50 text-center text-xs text-neutral-500 animate-pulse">
                  Retrieving available payment options...
                </div>
              ) : activePaymentMethods.length === 0 ? (
                <div className="p-6 border border-neutral-200 bg-neutral-50/50 text-center text-xs text-neutral-500">
                  No payment methods currently active. Please contact customer concierge.
                </div>
              ) : (
                activePaymentMethods.map((pm) => {
                  const isSelected = paymentMethod.toUpperCase() === pm.code.toUpperCase();
                  const isBkash = pm.code.toUpperCase() === 'BKASH';
                  const isNagad = pm.code.toUpperCase() === 'NAGAD';
                  const isSsl = pm.code.toUpperCase() === 'SSLCOMMERZ';
                  const isCod = pm.code.toUpperCase() === 'COD' || pm.type === 'cod';
                  const isBank = pm.code.toUpperCase() === 'BANK_TRANSFER' || pm.type === 'bank_transfer';

                  const borderColor = isSelected
                    ? isBkash
                      ? 'border-[#E2136E] bg-pink-50/40 ring-1 ring-[#E2136E]'
                      : isNagad
                      ? 'border-[#f7941d] bg-orange-50/40 ring-1 ring-[#f7941d]'
                      : isSsl
                      ? 'border-[#023e8a] bg-sky-50/40 ring-1 ring-[#023e8a]'
                      : isBank
                      ? 'border-purple-800 bg-purple-50/40 ring-1 ring-purple-800'
                      : 'border-neutral-900 bg-neutral-50/70 ring-1 ring-neutral-900'
                    : 'border-neutral-200 hover:bg-neutral-50/40';

                  const accentColor = isBkash
                    ? 'accent-[#E2136E]'
                    : isNagad
                    ? 'accent-[#f7941d]'
                    : isSsl
                    ? 'accent-[#023e8a]'
                    : isBank
                    ? 'accent-purple-800'
                    : 'accent-neutral-900';

                  const IconComponent = isCod
                    ? Banknote
                    : isBkash || isNagad
                    ? Smartphone
                    : isBank
                    ? Landmark
                    : CreditCard;

                  return (
                    <label
                      key={pm.id || pm.code}
                      className={`flex items-start gap-3 p-4 border cursor-pointer transition-all ${borderColor}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={pm.code}
                        checked={isSelected}
                        onChange={() => setPaymentMethod(pm.code)}
                        className={`mt-1 cursor-pointer ${accentColor}`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-1.5">
                            <IconComponent
                              className={`w-4 h-4 ${
                                isBkash
                                  ? 'text-[#E2136E]'
                                  : isNagad
                                  ? 'text-[#f7941d]'
                                  : isSsl
                                  ? 'text-[#023e8a]'
                                  : isCod
                                  ? 'text-emerald-700'
                                  : 'text-neutral-700'
                              }`}
                            />
                            {pm.name}
                          </span>
                          {pm.badge ? (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                isBkash
                                  ? 'text-[#E2136E] bg-pink-100'
                                  : isNagad
                                  ? 'text-[#f7941d] bg-orange-100'
                                  : isSsl
                                  ? 'text-[#023e8a] bg-sky-100 font-mono'
                                  : isCod
                                  ? 'text-emerald-800 bg-emerald-100'
                                  : 'text-neutral-700 bg-neutral-100'
                              }`}
                            >
                              {pm.badge}
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-500 font-medium">
                              {isCod ? 'Nationwide' : 'Secure Online'}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                          {pm.description || pm.instructions || 'Secure payment for your order.'}
                        </p>
                        {pm.additionalFee && pm.additionalFee > 0 ? (
                          <span className="text-[10px] text-amber-700 font-medium mt-1 block">
                            +{pm.additionalFee}% gateway surcharge
                          </span>
                        ) : null}
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Placement (5 Cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-neutral-200 p-6 sticky top-28 space-y-6">
            <h3 className="font-serif text-lg font-bold text-neutral-900 pb-4 border-b border-neutral-200">
              ORDER SUMMARY ({cart.length} ITEMS)
            </h3>

            {/* Item List */}
            <div className="max-h-60 overflow-y-auto divide-y divide-neutral-100 pr-1">
              {cart.map((item) => (
                <div key={item.id} className="py-3 flex gap-3">
                  <div className="w-14 h-18 bg-neutral-100 shrink-0 overflow-hidden border border-neutral-200">
                    <ImageWithFallback
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-neutral-900 truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Size: <strong>{item.size}</strong> · Color: {item.color.name}
                    </p>
                    <div className="flex items-center justify-between mt-1 text-xs">
                      <span className="text-neutral-500">Qty: {item.quantity}</span>
                      <span className="font-bold tabular-nums">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
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
                <span>Shipping ({division === 'Dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
                <span className="tabular-nums font-semibold text-neutral-900">
                  {shippingFee === 0 ? 'FREE' : `৳${shippingFee}`}
                </span>
              </div>

              <div className="flex justify-between text-base font-bold text-neutral-900 pt-3 border-t border-neutral-200">
                <span>Grand Total</span>
                <span className="tabular-nums font-serif text-xl text-neutral-950">
                  ৳{total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
            >
              <span>Place Order (৳{total.toLocaleString()})</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Guarantee note */}
            <div className="text-[11px] text-neutral-500 text-center space-y-1">
              <p>✓ Complimentary gift wrapping included with every order.</p>
              <p>✓ 7-Day hassle-free exchange at any Zippy atelier.</p>
            </div>
          </div>
        </div>
      </form>

      {/* Gateway Modals */}
      <BKashPaymentModal
        isOpen={isBKashModalOpen}
        amount={total}
        orderNumber={tempOrderNumber}
        onSuccess={handleGatewayPaymentSuccess}
        onCancel={() => setIsBKashModalOpen(false)}
      />

      <SSLCommerzModal
        isOpen={isSSLModalOpen}
        amount={total}
        orderNumber={tempOrderNumber}
        onSuccess={handleGatewayPaymentSuccess}
        onCancel={() => setIsSSLModalOpen(false)}
      />
    </div>
  );
};
