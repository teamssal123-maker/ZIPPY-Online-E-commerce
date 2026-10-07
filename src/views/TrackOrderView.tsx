import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  PackageCheck,
  Truck,
  CheckCircle2,
  Clock,
  Phone,
  MapPin,
  AlertCircle,
  Printer,
  Radio,
  RotateCcw,
  ShieldCheck,
  Mail,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Order, OrderStatus } from '../types';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { api } from '../api/client';
import { hrefFor } from '../utils/routes';

export const TrackOrderView: React.FC = () => {
  const { orders, currentOrder, apiAvailable, settings } = useShop();

  const brandName = (settings?.websiteName || 'ZIPPY').toUpperCase();
  const supportPhone = settings?.phone || '+880 1711-000001';
  const supportEmail = settings?.email || 'sales@zippy.com.bd';

  const [query, setQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRadarPing, setLastRadarPing] = useState<string>('');
  const [searchedQuery, setSearchedQuery] = useState('');

  const performSearch = useCallback(
    async (searchTerm: string) => {
      const term = searchTerm.trim();
      if (!term) return;

      setIsLoading(true);
      setNotFound(false);
      setSearchedQuery(term);

      try {
        if (apiAvailable) {
          try {
            const found = await api.trackOrder(term);
            if (found && found.orderNumber) {
              setSearchedOrder(found);
              setNotFound(false);
              setLastRadarPing(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
              setIsLoading(false);
              return;
            }
          } catch {
            // fallback to client-side order list
          }
        }

        // Local search fallback
        const clean = term.toLowerCase();
        const cleanAlphaNum = clean.replace(/[^a-z0-9]/g, '');
        const cleanWithoutPrefix = cleanAlphaNum.replace(/^(rm|inv|order)/, '');
        const digits = clean.replace(/[^0-9]/g, '');

        const localFound = orders.find((o) => {
          const orderNum = o.orderNumber.toLowerCase();
          const orderNumClean = orderNum.replace(/[^a-z0-9]/g, '');
          const orderNumWithoutPrefix = orderNumClean.replace(/^(rm|inv|order)/, '');
          const orderId = (o.id || '').toLowerCase();
          const phone = o.customer.phone.replace(/[^0-9]/g, '');
          const email = (o.customer.email || '').toLowerCase();

          if (orderNum === clean || orderId === clean) return true;
          if (cleanAlphaNum.length >= 3 && (orderNumClean === cleanAlphaNum || orderNumClean.includes(cleanAlphaNum))) return true;
          if (cleanWithoutPrefix.length >= 3 && (orderNumWithoutPrefix === cleanWithoutPrefix || orderNumWithoutPrefix.endsWith(cleanWithoutPrefix))) return true;
          if (digits.length >= 4 && (phone.includes(digits) || digits.includes(phone))) return true;
          if (clean.includes('@') && email.includes(clean)) return true;
          return false;
        });

        if (localFound) {
          setSearchedOrder(localFound);
          setNotFound(false);
          setLastRadarPing(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        } else {
          setSearchedOrder(null);
          setNotFound(true);
        }
      } catch {
        setSearchedOrder(null);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    },
    [apiAvailable, orders]
  );

  // Extract reference from URL hash or query params
  useEffect(() => {
    const handleUrlQuery = () => {
      const hash = window.location.hash || '';
      const queryPart = hash.includes('?') ? hash.split('?')[1] : window.location.search.replace(/^\?/, '');
      const params = new URLSearchParams(queryPart);
      const ref = params.get('ref') || params.get('order') || params.get('q');

      if (ref && ref.trim()) {
        const cleanRef = decodeURIComponent(ref.trim());
        setQuery(cleanRef);
        performSearch(cleanRef);
      } else if (currentOrder?.orderNumber) {
        setQuery(currentOrder.orderNumber);
        setSearchedOrder(currentOrder);
        setLastRadarPing(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } else if (orders.length > 0 && !searchedOrder) {
        // Pre-select first real order as initial preview
        const first = orders[0];
        setQuery(first.orderNumber);
        setSearchedOrder(first);
        setLastRadarPing(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    };

    handleUrlQuery();
    window.addEventListener('hashchange', handleUrlQuery);
    return () => window.removeEventListener('hashchange', handleUrlQuery);
  }, [currentOrder, orders, performSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    performSearch(query.trim());
  };

  const handlePrintInvoice = (order: Order) => {
    const printUrl = `/api/v1/orders/${order.id}/invoice?format=html&print=true`;
    const printWin = window.open(printUrl, '_blank', 'width=880,height=1080');
    if (!printWin) {
      window.location.href = printUrl;
    }
  };

  // Status mapping
  const getStatusDetails = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return {
          title: 'Consignment Delivered',
          color: 'bg-emerald-500',
          badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          description: 'Garment safely received and signature recorded.'
        };
      case 'OUT_FOR_DELIVERY':
        return {
          title: 'Out for Delivery',
          color: 'bg-emerald-500',
          badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          description: 'Courier rider is currently en route to your shipping location.'
        };
      case 'SHIPPED':
        return {
          title: 'In Transit',
          color: 'bg-sky-500',
          badgeClass: 'bg-sky-100 text-sky-900 border-sky-300',
          description: 'Dispatched from atelier facility to regional sorting center.'
        };
      case 'PACKED':
        return {
          title: 'Master Packaged',
          color: 'bg-purple-500',
          badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
          description: 'Steam-pressed and sealed in protective garment sleeve.'
        };
      case 'PROCESSING':
        return {
          title: 'Bespoke Tailoring & QC',
          color: 'bg-indigo-500',
          badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-300',
          description: 'Cutting, stitching, and luxury atelier quality control.'
        };
      case 'CONFIRMED':
        return {
          title: 'Payment & Order Confirmed',
          color: 'bg-blue-500',
          badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
          description: 'Payment authorized and items allocated in warehouse.'
        };
      case 'PENDING':
        return {
          title: 'Order Registered',
          color: 'bg-amber-500',
          badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
          description: 'Order logged into system; awaiting verification.'
        };
      case 'CANCELLED':
        return {
          title: 'Order Cancelled',
          color: 'bg-red-500',
          badgeClass: 'bg-red-100 text-red-900 border-red-300',
          description: 'This consignment was cancelled.'
        };
      default:
        return {
          title: 'Processing',
          color: 'bg-blue-500',
          badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
          description: 'Active atelier consignment.'
        };
    }
  };

  const getStageIndex = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'CONFIRMED':
        return 1;
      case 'PROCESSING':
      case 'PACKED':
        return 2;
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 1;
    }
  };

  const STAGES = [
    { label: 'Order Placed', desc: 'Logged in atelier system' },
    { label: 'Confirmed', desc: 'Payment verified & allocated' },
    { label: 'Tailoring & QC', desc: 'Steam-pressed & packaged' },
    { label: 'Out for Delivery', desc: 'With express dispatch rider' },
    { label: 'Delivered', desc: 'Received & signature recorded' }
  ];

  const currentStageIndex = searchedOrder ? getStageIndex(searchedOrder.status) : 0;
  const isCancelled = searchedOrder?.status === 'CANCELLED' || searchedOrder?.paymentStatus === 'REFUNDED';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header section */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full mb-3 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#9A7B38] font-bold">
            Real-time Consignment Radar
          </span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
          TRACK YOUR ORDER
        </h1>
        <p className="text-xs text-neutral-500 mt-2.5 max-w-md mx-auto leading-relaxed">
          Monitor your consignment dispatch in real-time. Enter your <strong>Order #</strong> (e.g. <code>RM-2026-1543</code> or <code>1543</code>), <strong>Invoice #</strong>, or <strong>Mobile Number</strong>.
        </p>

        {/* Search input form */}
        <form onSubmit={handleSearchSubmit} className="mt-6 flex gap-2 max-w-md mx-auto">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (notFound) setNotFound(false);
              }}
              placeholder="Order #, Invoice #, or Phone"
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-neutral-300 text-xs font-mono uppercase focus:outline-none focus:border-neutral-900 transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setNotFound(false);
                }}
                className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-6 py-2.5 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
          >
            {isLoading ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Locating...</span>
              </>
            ) : (
              <>
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                <span>Track</span>
              </>
            )}
          </button>
        </form>

        {/* Recent orders quick chips */}
        {orders && orders.length > 0 && (
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-[11px] text-neutral-500">
            <span className="text-neutral-400">Recent orders:</span>
            {orders.slice(0, 3).map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  setQuery(o.orderNumber);
                  performSearch(o.orderNumber);
                }}
                className={`font-mono px-2 py-0.5 border text-xs transition-colors rounded ${
                  searchedOrder?.orderNumber === o.orderNumber
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                }`}
              >
                {o.orderNumber}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Not Found State */}
      {notFound && (
        <div className="p-8 text-center bg-red-50/80 border border-red-200 text-red-800 text-xs my-6 rounded-lg shadow-xs">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <p className="font-bold text-sm text-red-900">Consignment Not Found</p>
          <p className="text-xs text-red-700 mt-1 max-w-md mx-auto">
            No active record found matching &quot;{searchedQuery}&quot;. Please verify the order number (e.g. <code>RM-2026-1543</code>) or the 11-digit mobile number used during checkout.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`tel:${supportPhone}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-800 text-white text-xs font-semibold rounded hover:bg-red-900 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Concierge: {supportPhone}</span>
            </a>
            <button
              onClick={() => {
                if (orders.length > 0) {
                  setQuery(orders[0].orderNumber);
                  performSearch(orders[0].orderNumber);
                }
              }}
              className="px-4 py-2 bg-white border border-red-300 text-red-800 text-xs font-semibold rounded hover:bg-red-50 transition-colors"
            >
              View Sample Order
            </button>
          </div>
        </div>
      )}

      {/* Searched Order Details */}
      {searchedOrder && (
        <div className="space-y-6">
          {/* 1. Real-time Radar Status Card */}
          <div className="bg-neutral-950 text-white rounded-xl border border-neutral-800 p-6 sm:p-7 shadow-xl relative overflow-hidden">
            {/* Background radar grid effect */}
            <div className="absolute -right-16 -top-16 w-56 h-56 border border-neutral-800/80 rounded-full pointer-events-none" />
            <div className="absolute -right-8 -top-8 w-40 h-40 border border-neutral-800/50 rounded-full pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-neutral-800 gap-4 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-emerald-400 font-bold">
                    Active Radar Lock · Live Satellite Sync
                  </span>
                </div>
                <h2 className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {searchedOrder.orderNumber}
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Placed on {searchedOrder.createdAt?.slice(0, 10) || 'Recently'} &bull; Payment:{' '}
                  <span className="text-amber-400 font-semibold">{searchedOrder.paymentMethod}</span> ({searchedOrder.paymentStatus || 'VERIFIED'})
                </p>
              </div>

              <div className="flex flex-col sm:items-end">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 block font-semibold mb-1">
                  Consignment Status
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    getStatusDetails(searchedOrder.status).badgeClass
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current" />
                  <span>{searchedOrder.status.replace(/_/g, ' ')}</span>
                </span>
                {lastRadarPing && (
                  <span className="text-[10px] text-neutral-500 mt-1 font-mono">
                    Last ping: {lastRadarPing}
                  </span>
                )}
              </div>
            </div>

            {/* Quick stats grid inside radar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 text-xs relative z-10">
              <div>
                <span className="text-[10px] uppercase text-neutral-400 block font-medium">Consignment AWB</span>
                <span className="font-mono font-bold text-neutral-200 mt-0.5 block">
                  AWB-{searchedOrder.orderNumber.replace(/[^0-9]/g, '') || '99214'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-neutral-400 block font-medium">Carrier Service</span>
                <span className="font-semibold text-neutral-200 mt-0.5 block truncate">
                  {brandName} Express
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-neutral-400 block font-medium">Estimated Arrival</span>
                <span className="font-semibold text-emerald-400 mt-0.5 block">
                  {searchedOrder.status === 'DELIVERED' ? 'Consignment Delivered' : '24–48 Hours'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-neutral-400 block font-medium">Total Consignment</span>
                <span className="font-bold text-neutral-100 mt-0.5 block">
                  ৳{searchedOrder.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Visual Stepper Progression */}
          <div className="bg-white border border-neutral-200 p-6 sm:p-8 rounded-xl shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-100">
              <h3 className="font-serif font-bold text-base text-neutral-900">
                Consignment Transit Milestones
              </h3>
              <span className="text-xs text-neutral-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#9A7B38]" />
                <span>{getStatusDetails(searchedOrder.status).description}</span>
              </span>
            </div>

            {isCancelled ? (
              <div className="p-5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-red-900">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span>Order Has Been {searchedOrder.status}</span>
                </div>
                <p>
                  This order is not currently progressing through active transit. If you did not request this cancellation or have queries regarding refunds, please contact our concierge hotline immediately.
                </p>
                <div className="pt-2 flex gap-3">
                  <a
                    href={`tel:${supportPhone}`}
                    className="px-4 py-1.5 bg-red-900 text-white font-semibold rounded text-xs inline-flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Concierge ({supportPhone})</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="py-2">
                <div className="relative flex flex-col md:flex-row justify-between gap-6 md:gap-0">
                  {/* Connector line (desktop) */}
                  <div className="hidden md:block absolute top-4 left-6 right-6 h-0.5 bg-neutral-200 -z-0" />

                  {STAGES.map((stage, idx) => {
                    const isCompleted = idx <= currentStageIndex;
                    const isCurrent = idx === currentStageIndex;

                    return (
                      <div
                        key={idx}
                        className="flex md:flex-col items-start md:items-center gap-3 md:gap-2 flex-1 relative z-10"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors shrink-0 shadow-xs ${
                            isCompleted
                              ? 'bg-neutral-900 text-white'
                              : 'bg-white border-2 border-neutral-300 text-neutral-400'
                          } ${isCurrent ? 'ring-4 ring-amber-400/30 border-neutral-900' : ''}`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : idx + 1}
                        </div>

                        <div className="md:text-center">
                          <div
                            className={`text-xs font-bold uppercase tracking-wider ${
                              isCompleted ? 'text-neutral-900' : 'text-neutral-400'
                            }`}
                          >
                            {stage.label}
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-0.5 max-w-[150px] leading-tight">
                            {stage.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Real Tracking History Logs (if present) */}
            {searchedOrder.trackingHistory && searchedOrder.trackingHistory.length > 0 && (
              <div className="mt-8 pt-6 border-t border-neutral-100">
                <h4 className="text-xs uppercase tracking-wider font-bold text-neutral-900 mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#9A7B38]" />
                  <span>Audit Log & Checkpoint Telemetry</span>
                </h4>
                <div className="space-y-3">
                  {searchedOrder.trackingHistory.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between text-xs p-3 bg-neutral-50 border border-neutral-100 rounded"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-neutral-900 mt-1.5 shrink-0" />
                        <div>
                          <div className="font-bold text-neutral-900">{step.title}</div>
                          <div className="text-neutral-600 text-[11px]">{step.description}</div>
                        </div>
                      </div>
                      <div className="font-mono text-[11px] text-neutral-500 shrink-0 ml-3">
                        {step.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Recipient & Courier Logistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white p-6 sm:p-7 border border-neutral-200 rounded-xl shadow-xs text-xs">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block mb-2">
                Recipient Delivery Address
              </span>
              <p className="font-bold text-sm text-neutral-900">{searchedOrder.customer.fullName}</p>
              <p className="text-neutral-600 mt-1 leading-relaxed">{searchedOrder.customer.address}</p>
              <p className="text-neutral-600">
                {searchedOrder.customer.district}, {searchedOrder.customer.division}
              </p>
              <p className="text-neutral-700 font-mono mt-2 font-semibold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-neutral-500" />
                <span>{searchedOrder.customer.phone}</span>
              </p>
              {searchedOrder.customer.email && (
                <p className="text-neutral-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{searchedOrder.customer.email}</span>
                </p>
              )}
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block mb-2">
                Carrier & Dispatch Details
              </span>
              <p className="font-bold text-neutral-900">
                Carrier: {brandName} Dedicated Atelier Dispatch
              </p>
              <p className="text-neutral-600 mt-1">
                AWB Tracking Ref:{' '}
                <span className="font-mono font-bold text-neutral-900">
                  AWB-{searchedOrder.orderNumber.replace(/[^0-9]/g, '') || '99214'}
                </span>
              </p>
              <p className="text-neutral-600 mt-0.5">Delivery Service: Priority Air/Road Express</p>
              <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200/80 rounded space-y-1">
                <p className="text-[11px] text-neutral-800 font-semibold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#9A7B38]" />
                  <span>Concierge Dispatch Line: {supportPhone}</span>
                </p>
                <p className="text-[10.5px] text-neutral-600">
                  Email queries: <a href={`mailto:${supportEmail}`} className="underline">{supportEmail}</a>
                </p>
              </div>
            </div>
          </div>

          {/* 4. Consignment Contents */}
          <div className="bg-white border border-neutral-200 p-6 sm:p-7 rounded-xl shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-4 pb-3 border-b border-neutral-100 flex items-center justify-between">
              <span>Garments In This Consignment</span>
              <span className="text-neutral-400 font-normal">{searchedOrder.items.length} Item(s)</span>
            </h4>

            <div className="divide-y divide-neutral-100">
              {searchedOrder.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-16 bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200 rounded">
                      <ImageWithFallback
                        src={item.product?.images?.[0] || ''}
                        alt={item.product?.name || 'Garment'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-semibold text-neutral-900 truncate">
                        {item.product?.name || 'Bespoke Garment Piece'}
                      </h5>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Size: <span className="font-semibold text-neutral-700">{item.size}</span> &bull; Color:{' '}
                        <span className="font-semibold text-neutral-700">
                          {(typeof item.color === 'object' && item.color ? item.color.name : item.color) || 'Standard'}
                        </span> &bull; Qty: {item.quantity}
                      </p>
                      <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                        SKU: {item.product?.sku || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs font-bold tabular-nums text-neutral-900 shrink-0 text-right">
                    <div>৳{(item.price * item.quantity).toLocaleString()}</div>
                    <div className="text-[10px] text-neutral-400 font-normal">
                      ৳{item.price.toLocaleString()} each
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial summary */}
            <div className="mt-5 pt-4 border-t border-neutral-100 space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal:</span>
                <span className="font-medium tabular-nums">৳{searchedOrder.subtotal.toLocaleString()}</span>
              </div>
              {searchedOrder.discount ? (
                <div className="flex justify-between text-red-600">
                  <span>Privilege Discount:</span>
                  <span className="font-medium tabular-nums">-৳{searchedOrder.discount.toLocaleString()}</span>
                </div>
              ) : null}
              {searchedOrder.couponDiscount ? (
                <div className="flex justify-between text-red-600">
                  <span>Coupon Discount:</span>
                  <span className="font-medium tabular-nums">-৳{searchedOrder.couponDiscount.toLocaleString()}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-neutral-600">
                <span>Shipping Fee:</span>
                <span className="font-medium tabular-nums">
                  {searchedOrder.shippingFee === 0 ? 'FREE' : `৳${searchedOrder.shippingFee.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-neutral-900 pt-2 border-t border-neutral-200">
                <span>Total Payable:</span>
                <span className="tabular-nums">৳{searchedOrder.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* 5. Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-neutral-100 border border-neutral-200 rounded-xl text-xs">
            <span className="text-neutral-600">
              Need assistance or official tax documents for this consignment?
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handlePrintInvoice(searchedOrder)}
                className="px-4 py-2 bg-neutral-900 hover:bg-black text-white font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Print 1-Page Invoice</span>
              </button>
              <a
                href={`tel:${supportPhone}`}
                className="px-4 py-2 bg-white border border-neutral-300 hover:border-black text-neutral-800 font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-neutral-600" />
                <span>Call Hotline</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSearchedOrder(null);
                  setNotFound(false);
                }}
                className="px-3 py-2 text-neutral-600 hover:text-black font-semibold transition-colors"
              >
                Track Another Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
