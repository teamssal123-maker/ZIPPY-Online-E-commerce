import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Package,
  MapPin,
  Heart,
  Calendar,
  Printer,
  ChevronRight,
  LogOut,
  CheckCircle,
  ExternalLink,
  Edit2,
  Eye
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Order } from '../types';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { hrefFor } from '../utils/routes';

export const AccountView: React.FC = () => {
  const {
    user,
    orders,
    logout,
    login,
    showToast,
    wishlist,
    products,
    settings,
    updateUserProfile
  } = useShop();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses' | 'appointments'>('orders');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

  useEffect(() => {
    if (selectedOrderForInvoice) {
      document.body.classList.add('invoice-modal-active');
    } else {
      document.body.classList.remove('invoice-modal-active');
    }
    return () => {
      document.body.classList.remove('invoice-modal-active');
    };
  }, [selectedOrderForInvoice]);

  const handlePrintPdfInvoice = (order: Order) => {
    const invoiceUrl = `/api/v1/orders/${order.id}/invoice?format=html&print=true`;
    const printWindow = window.open(invoiceUrl, '_blank', 'width=880,height=1080');
    if (!printWindow) {
      window.location.href = invoiceUrl;
    }
  };

  // Profile edit states
  const [fullName, setFullName] = useState(user?.fullName || 'Tahmidur Rahman');
  const [phone, setPhone] = useState(user?.phone || '+880 1712-345678');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-800">
          <UserIcon className="w-6 h-6 stroke-[1.5]" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-neutral-900">Patron Authentication</h2>
        <p className="text-xs text-neutral-500 mt-2">
          Sign in to access your order history, bespoke tailoring measurements, and exclusive preview privileges.
        </p>
        <button
          onClick={() => login('vip@zippy.com.bd')}
          className="mt-6 w-full py-3.5 bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
        >
          Sign In as VIP Patron
        </button>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({ fullName, phone });
    setIsEditingProfile(false);
  };

  // Address modal/form states
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState('Office');
  const [newAddrText, setNewAddrText] = useState('');
  const [newAddrDivision, setNewAddrDivision] = useState('Dhaka');
  const [newAddrDistrict, setNewAddrDistrict] = useState('Dhaka City');
  const [newAddrPhone, setNewAddrPhone] = useState(user?.phone || '');
  const [newAddrIsDefault, setNewAddrIsDefault] = useState(false);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrText.trim() || !newAddrPhone.trim()) {
      showToast('Please provide an address and phone number.', 'error');
      return;
    }
    const currentAddrs = user?.savedAddresses || [];
    const newAddress = {
      id: `addr-${Date.now()}`,
      label: newAddrLabel,
      address: newAddrText.trim(),
      division: newAddrDivision,
      district: newAddrDistrict,
      phone: newAddrPhone.trim(),
      isDefault: newAddrIsDefault || currentAddrs.length === 0
    };
    const updated = newAddrIsDefault
      ? currentAddrs.map((a) => ({ ...a, isDefault: false })).concat(newAddress)
      : currentAddrs.concat(newAddress);
    await updateUserProfile({ savedAddresses: updated });
    setShowAddAddress(false);
    setNewAddrText('');
    setNewAddrLabel('Office');
  };

  const handleDeleteAddress = async (addrId: string) => {
    const currentAddrs = user?.savedAddresses || [];
    const updated = currentAddrs.filter((a) => a.id !== addrId);
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true;
    }
    await updateUserProfile({ savedAddresses: updated });
  };

  const handleSetDefaultAddress = async (addrId: string) => {
    const currentAddrs = user?.savedAddresses || [];
    const updated = currentAddrs.map((a) => ({
      ...a,
      isDefault: a.id === addrId
    }));
    await updateUserProfile({ savedAddresses: updated });
  };

  // Appointment states
  const [isAppointmentBooked, setIsAppointmentBooked] = useState(false);

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-neutral-200 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#9A7B38] font-bold">
            Privilege Member #RM-8042
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 mt-0.5">
            {user.fullName}
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            {user.email} · Registered Patron since 2024
          </p>
        </div>

        <button
          onClick={logout}
          className="self-start sm:self-auto px-4 py-2 border border-neutral-300 text-neutral-700 hover:border-red-600 hover:text-red-600 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Account Tabs & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* Left Nav Tabs */}
        <div className="lg:col-span-3 space-y-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors text-left cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4" />
              <span>Orders ({orders.length})</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors text-left cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UserIcon className="w-4 h-4" />
              <span>Patron Profile</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors text-left cursor-pointer ${
              activeTab === 'addresses'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4" />
              <span>Saved Addresses</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors text-left cursor-pointer ${
              activeTab === 'appointments'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4" />
              <span>Tailoring Fittings</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>
        </div>

        {/* Right Content Panels */}
        <div className="lg:col-span-9">
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h3 className="font-serif text-lg font-bold text-neutral-900 pb-3 border-b border-neutral-200">
                Purchase History & Consignments
              </h3>

              {orders.length === 0 ? (
                <div className="py-16 text-center text-neutral-400">
                  <p className="text-sm">You have not placed any orders yet.</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-neutral-200 bg-white p-6 space-y-4 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-neutral-900">
                            {order.orderNumber}
                          </span>
                          <span className="text-xs text-neutral-400">·</span>
                          <span className="text-xs text-neutral-500">{order.createdAt}</span>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          Method: {order.paymentMethod} {order.paymentId && `(${order.paymentId})`}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-800">
                          {order.status}
                        </span>
                        <span className="font-bold text-sm text-neutral-900 tabular-nums">
                          ৳{order.total.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Order items list */}
                    <div className="divide-y divide-neutral-100">
                      {order.items.map((item) => (
                        <div key={item.id} className="py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-16 bg-neutral-100 shrink-0 overflow-hidden border border-neutral-200">
                              <ImageWithFallback
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <a
                                href={hrefFor('product-detail', null, item.product.slug)}
                                className="text-xs font-semibold text-neutral-900 hover:underline cursor-pointer"
                              >
                                {item.product.name}
                              </a>
                              <p className="text-[11px] text-neutral-500 mt-0.5">
                                Size: {item.size} · Color: {item.color.name} · Qty: {item.quantity}
                              </p>
                            </div>
                          </div>

                          <span className="text-xs font-semibold tabular-nums text-neutral-900">
                            ৳{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-wrap items-center justify-between pt-3 border-t border-neutral-100 gap-2">
                      <p className="text-[11px] text-neutral-500">
                        Ship to: {order.customer.address}, {order.customer.district}
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePrintPdfInvoice(order)}
                          title="Print / Save 1-Page PDF Invoice"
                          className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-xs font-semibold text-neutral-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-[#9A7B38]" />
                          <span>Print 1-Page Invoice</span>
                        </button>

                        <button
                          onClick={() => setSelectedOrderForInvoice(order)}
                          className="px-3 py-1.5 border border-neutral-300 hover:border-black text-xs font-semibold text-neutral-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>

                        <a
                          href={`#track-order?ref=${encodeURIComponent(order.orderNumber)}`}
                          className="px-3 py-1.5 bg-neutral-900 text-white hover:bg-black text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Track Delivery
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white border border-neutral-200 p-6 max-w-xl">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-6">
                <h3 className="font-serif text-lg font-bold text-neutral-900">
                  Patron Profile Details
                </h3>
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="text-xs text-neutral-800 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isEditingProfile ? 'Cancel' : 'Edit Info'}</span>
                </button>
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Contact Mobile
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-black"
                  >
                    Save Changes
                  </button>
                </form>
              ) : (
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">
                      Full Name
                    </span>
                    <span className="text-sm font-semibold text-neutral-900">{fullName}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">
                      Email Address
                    </span>
                    <span className="text-sm font-semibold text-neutral-900">{user.email}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">
                      Mobile Number
                    </span>
                    <span className="text-sm font-semibold text-neutral-900 font-mono">{phone}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">
                      Privilege Tier
                    </span>
                    <span className="text-sm font-semibold text-[#9A7B38]">
                      Black Label Executive Patron
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <h3 className="font-serif text-lg font-bold text-neutral-900">
                  Primary Delivery Locations
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-semibold uppercase tracking-wider hover:bg-black transition-colors cursor-pointer"
                >
                  {showAddAddress ? 'Cancel' : '+ Add Address'}
                </button>
              </div>

              {showAddAddress && (
                <form onSubmit={handleAddAddress} className="p-5 bg-white border border-neutral-300 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                    Add New Delivery Address
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        Location Label
                      </label>
                      <input
                        type="text"
                        value={newAddrLabel}
                        onChange={(e) => setNewAddrLabel(e.target.value)}
                        placeholder="e.g. Corporate HQ, Residence"
                        required
                        className="w-full border border-neutral-300 p-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={newAddrPhone}
                        onChange={(e) => setNewAddrPhone(e.target.value)}
                        placeholder="+880 1711-000000"
                        required
                        className="w-full border border-neutral-300 p-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        Division
                      </label>
                      <input
                        type="text"
                        value={newAddrDivision}
                        onChange={(e) => setNewAddrDivision(e.target.value)}
                        required
                        className="w-full border border-neutral-300 p-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        District
                      </label>
                      <input
                        type="text"
                        value={newAddrDistrict}
                        onChange={(e) => setNewAddrDistrict(e.target.value)}
                        required
                        className="w-full border border-neutral-300 p-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      Street Address & Details
                    </label>
                    <textarea
                      rows={2}
                      value={newAddrText}
                      onChange={(e) => setNewAddrText(e.target.value)}
                      placeholder="House / Road / Sector / Area details..."
                      required
                      className="w-full border border-neutral-300 p-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="defaultAddrCheck"
                      checked={newAddrIsDefault}
                      onChange={(e) => setNewAddrIsDefault(e.target.checked)}
                      className="rounded border-neutral-300"
                    />
                    <label htmlFor="defaultAddrCheck" className="text-xs text-neutral-700 font-medium cursor-pointer">
                      Set as primary delivery address
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-black cursor-pointer"
                  >
                    Save Address
                  </button>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(user.savedAddresses || []).map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-5 relative bg-white border ${addr.isDefault ? 'border-2 border-neutral-900' : 'border-neutral-200'}`}
                  >
                    {addr.isDefault && (
                      <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider bg-neutral-900 text-white px-2 py-0.5">
                        Default
                      </span>
                    )}
                    <p className="font-bold text-neutral-900 text-xs uppercase">{addr.label}</p>
                    <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                      {addr.address}<br />
                      {addr.district}, {addr.division}<br />
                      Phone: <span className="font-mono">{addr.phone}</span>
                    </p>

                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center gap-3 text-[11px]">
                      {!addr.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          className="text-neutral-700 hover:text-black font-semibold cursor-pointer underline"
                        >
                          Make Default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="bg-white border border-neutral-200 p-6 space-y-4">
              <h3 className="font-serif text-lg font-bold text-neutral-900 pb-3 border-b border-neutral-200">
                Bespoke Tailoring & Master Fitting
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed max-w-xl">
                As a Zippy patron, you are entitled to private measurement and suiting consultations
                at our Gulshan Atelier VIP Lounge.
              </p>

              {isAppointmentBooked ? (
                <div className="p-4 bg-green-50 border border-green-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-green-900">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                    <span>VIP Suiting Consultation Reserved</span>
                  </div>
                  <p className="text-green-800">
                    Scheduled for: <strong>Saturday, 3:00 PM</strong> · Zippy Gulshan Flagship Lounge.
                  </p>
                  <p className="text-[11px] text-green-700">
                    A senior stylist has reserved Super 130s fabric portfolios for your preview.
                  </p>
                  <button
                    onClick={() => {
                      setIsAppointmentBooked(false);
                      showToast('Appointment rescheduled.');
                    }}
                    className="mt-2 text-xs text-neutral-800 underline font-semibold cursor-pointer"
                  >
                    Reschedule / Cancel Booking
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-[#F9F9F8] border border-neutral-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-neutral-900">
                    <Calendar className="w-4 h-4 text-[#9A7B38]" />
                    <span>Next Available Consultation: Saturday, 3:00 PM</span>
                  </div>
                  <p className="text-neutral-500">
                    Location: Zippy Gulshan Flagship, Road 11, Dhaka.
                  </p>
                  <button
                    onClick={() => {
                      setIsAppointmentBooked(true);
                      showToast('Master Tailor session reserved successfully.');
                    }}
                    className="mt-2 px-4 py-2 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors cursor-pointer"
                  >
                    Reserve Consultation
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 invoice-modal-backdrop invoice-modal-container">
          <div className="relative w-full max-w-2xl bg-white p-6 sm:p-8 shadow-2xl border border-neutral-200 invoice-modal-card print-page-exact">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div>
                <span className="font-serif text-2xl font-bold tracking-widest text-neutral-900">
                  {(settings?.websiteName || 'ZIPPY').toUpperCase()}
                </span>
                <p className="text-[9px] uppercase tracking-widest text-[#9A7B38] font-bold">
                  Official Atelier Tax Invoice &bull; Single-Page Copy
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForInvoice(null)}
                className="text-neutral-400 hover:text-black text-sm font-semibold no-print"
              >
                Close ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 my-4 text-xs bg-neutral-50 p-3 border border-neutral-100 rounded">
              <div>
                <span className="text-[10px] uppercase text-neutral-400 font-bold block mb-1">
                  Billed To
                </span>
                <p className="font-bold text-neutral-900">{selectedOrderForInvoice.customer.fullName}</p>
                <p className="text-neutral-600">{selectedOrderForInvoice.customer.address}</p>
                <p className="text-neutral-600">
                  {selectedOrderForInvoice.customer.district}, {selectedOrderForInvoice.customer.division}
                </p>
                <p className="text-neutral-500 font-mono mt-0.5">{selectedOrderForInvoice.customer.phone}</p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase text-neutral-400 font-bold block mb-1">
                  Invoice Details
                </span>
                <p className="font-mono font-bold text-neutral-900">
                  INV-{selectedOrderForInvoice.orderNumber.replace(/^RM-/, '')}
                </p>
                <p className="text-neutral-500 text-[11px]">Ref: {selectedOrderForInvoice.orderNumber}</p>
                <p className="text-neutral-500 text-[11px]">Date: {selectedOrderForInvoice.createdAt?.slice(0, 10)}</p>
                <p className="text-neutral-500 text-[11px]">Payment: {selectedOrderForInvoice.paymentMethod} ({selectedOrderForInvoice.paymentStatus || 'PENDING'})</p>
              </div>
            </div>

            <table className="w-full text-left text-xs my-4 border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-100">
                  <th className="py-2 px-3">Item Description</th>
                  <th className="py-2 px-3 text-center">Size</th>
                  <th className="py-2 px-3 text-center">Qty</th>
                  <th className="py-2 px-3 text-right">Price</th>
                  <th className="py-2 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {selectedOrderForInvoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 px-3">
                      <div className="font-semibold text-neutral-900">{item.product.name}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">SKU: {item.product.sku}</div>
                    </td>
                    <td className="py-2 px-3 text-center">{item.size}</td>
                    <td className="py-2 px-3 text-center">{item.quantity}</td>
                    <td className="py-2 px-3 text-right tabular-nums">৳{Number(item.price || 0).toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-bold tabular-nums">
                      ৳{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-neutral-200 pt-3 space-y-1 text-xs text-right">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal:</span>
                <span className="font-medium tabular-nums">৳{selectedOrderForInvoice.subtotal.toLocaleString()}</span>
              </div>
              {selectedOrderForInvoice.discount ? (
                <div className="flex justify-between text-red-600">
                  <span>Privilege Discount:</span>
                  <span className="font-medium tabular-nums">-৳{selectedOrderForInvoice.discount.toLocaleString()}</span>
                </div>
              ) : null}
              {selectedOrderForInvoice.couponDiscount ? (
                <div className="flex justify-between text-red-600">
                  <span>Coupon Discount:</span>
                  <span className="font-medium tabular-nums">-৳{selectedOrderForInvoice.couponDiscount.toLocaleString()}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span className="text-neutral-600">Shipping:</span>
                <span className="font-medium tabular-nums">
                  {selectedOrderForInvoice.shippingFee === 0 ? 'FREE' : `৳${selectedOrderForInvoice.shippingFee.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-neutral-900 pt-2 border-t border-neutral-200">
                <span>Grand Total:</span>
                <span className="tabular-nums">৳{selectedOrderForInvoice.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-dashed border-neutral-200 flex flex-wrap items-center justify-between gap-3 no-print">
              <span className="text-[11px] text-neutral-500">
                Tax-compliant invoice generated for official records.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForInvoice(null)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 text-xs font-semibold uppercase tracking-wider hover:border-black"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintPdfInvoice(selectedOrderForInvoice)}
                  className="px-5 py-2 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-black flex items-center gap-2 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Print 1-Page PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
