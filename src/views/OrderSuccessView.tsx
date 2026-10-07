import React from 'react';
import { CheckCircle, Printer, ArrowRight, PackageCheck, Home, MapPin, Truck } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { CartItem } from '../types';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { hrefFor } from '../utils/routes';

export const OrderSuccessView: React.FC = () => {
  const { currentOrder, setActiveView } = useShop();

  if (!currentOrder) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <h2 className="font-serif text-2xl font-bold text-neutral-900">No active order found</h2>
        <p className="text-xs text-neutral-500 mt-2">
          Your session order details are not available or already closed.
        </p>
        <a
          href={hrefFor('home')}
          onClick={(e) => {
            e.preventDefault();
            setActiveView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="mt-6 inline-block px-8 py-3 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-black cursor-pointer"
        >
          Return to Home
        </a>
      </div>
    );
  }

  const handlePrint = () => {
    if (currentOrder?.id) {
      const url = `/api/v1/orders/${currentOrder.id}/invoice?format=html&print=true`;
      const printWindow = window.open(url, '_blank', 'width=880,height=1080');
      if (!printWindow) {
        window.location.href = url;
      }
    } else {
      window.print();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Confirmation Header */}
      <div className="text-center pb-8 border-b border-neutral-200">
        <div className="w-14 h-14 bg-neutral-900 text-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <CheckCircle className="w-8 h-8 stroke-[1.5]" />
        </div>
        <span className="text-[11px] uppercase tracking-[0.3em] text-[#9A7B38] font-bold">
          Sartorial Order Confirmed
        </span>
        <h1 className="font-serif text-3xl font-bold text-neutral-900 mt-1">
          Thank you, {currentOrder.customer.fullName}
        </h1>
        <p className="text-xs text-neutral-600 mt-2 max-w-md mx-auto">
          Your order has been logged in our bespoke atelier system. A confirmation SMS & email
          have been dispatched to <strong>{currentOrder.customer.phone}</strong>.
        </p>

        <div className="mt-4 inline-flex items-center gap-2 bg-neutral-100 px-4 py-1.5 font-mono text-xs font-bold text-neutral-900 border border-neutral-200">
          <span>ORDER REF:</span>
          <span className="text-[#9A7B38]">{currentOrder.orderNumber}</span>
        </div>
      </div>

      {/* Details Box */}
      <div className="my-8 bg-[#FAFAFA] border border-neutral-200 p-6 sm:p-8 space-y-6">
        {/* Row 1: Shipping & Payment Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block mb-1">
              Delivery Address
            </span>
            <p className="font-semibold text-neutral-900">{currentOrder.customer.fullName}</p>
            <p className="text-neutral-600 mt-0.5">{currentOrder.customer.address}</p>
            <p className="text-neutral-600">
              {currentOrder.customer.district}, {currentOrder.customer.division} Division
            </p>
            <p className="text-neutral-500 font-mono mt-1">{currentOrder.customer.phone}</p>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block mb-1">
              Payment & Dispatch
            </span>
            <p className="font-semibold text-neutral-900">
              Method: {currentOrder.paymentMethod === 'COD' ? 'Cash on Delivery' : currentOrder.paymentMethod}
            </p>
            {currentOrder.paymentId && (
              <p className="text-neutral-500 font-mono text-[11px] mt-0.5">
                Trx ID: {currentOrder.paymentId}
              </p>
            )}
            <p className="text-neutral-600 mt-1">
              Status:{' '}
              <span className="text-green-700 font-bold uppercase">{currentOrder.status}</span>
            </p>
            <p className="text-neutral-500 text-[11px] mt-0.5 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-[#9A7B38]" />
              <span>Estimated delivery: 24–48 hours</span>
            </p>
          </div>
        </div>

        {/* Row 2: Garments Ordered */}
        <div className="border-t border-neutral-200 pt-6">
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block mb-3">
            Garments in this consignment
          </span>

          <div className="divide-y divide-neutral-200">
            {currentOrder.items.map((item: CartItem) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-16 bg-neutral-200 overflow-hidden shrink-0 border border-neutral-200">
                    <ImageWithFallback
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-neutral-900 truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      Size: {item.size} · Color: {item.color.name} · Qty: {item.quantity}
                    </p>
                  </div>
                </div>

                <div className="text-xs font-bold tabular-nums text-neutral-900">
                  ৳{(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 3: Totals */}
        <div className="border-t border-neutral-200 pt-4 space-y-1.5 text-xs">
          <div className="flex justify-between text-neutral-600">
            <span>Subtotal</span>
            <span className="tabular-nums font-semibold">৳{currentOrder.subtotal.toLocaleString()}</span>
          </div>

          {currentOrder.discount > 0 && (
            <div className="flex justify-between text-[#B00020]">
              <span>Privilege Discount</span>
              <span className="tabular-nums font-bold">-৳{currentOrder.discount.toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between text-neutral-600">
            <span>Shipping</span>
            <span className="tabular-nums font-semibold">
              {currentOrder.shippingFee === 0 ? 'FREE' : `৳${currentOrder.shippingFee}`}
            </span>
          </div>

          <div className="flex justify-between text-base font-bold text-neutral-900 pt-3 border-t border-neutral-200">
            <span>Total Payable</span>
            <span className="tabular-nums font-serif text-lg">
              ৳{currentOrder.total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <a
          href={`#track-order?ref=${encodeURIComponent(currentOrder.orderNumber)}`}
          className="px-6 py-3 bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-black flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
        >
          <PackageCheck className="w-4 h-4" />
          <span>Track Delivery Status</span>
        </a>

        <button
          onClick={handlePrint}
          className="px-6 py-3 border border-neutral-300 text-neutral-800 text-xs font-semibold uppercase tracking-wider hover:border-neutral-900 flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4 text-[#D4AF37]" />
          <span>Print 1-Page Invoice</span>
        </button>

        <a
          href={hrefFor('shop')}
          className="px-6 py-3 border border-transparent text-neutral-600 hover:text-black text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
        >
          <span>Continue Shopping</span>
        </a>
      </div>
    </div>
  );
};
