import React, { useState } from 'react';
import {
  ShieldAlert,
  Package,
  ShoppingBag,
  TrendingUp,
  Tag,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ArrowUpDown,
  DollarSign
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Product, Order, Coupon, OrderStatus } from '../types';
import { applyHash } from '../utils/routes';

export const AdminDashboardView: React.FC = () => {
  const {
    products,
    orders,
    updateOrderStatus,
    coupons,
    categories,
    setActiveView,
    showToast,
    addProduct,
    updateProduct,
    deleteProduct,
    addCoupon,
    deleteCoupon
  } = useShop();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'coupons'>('overview');

  // Product Add / Edit Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('blazer');
  const [prodPrice, setProdPrice] = useState(8500);
  const [prodSalePrice, setProdSalePrice] = useState<number | undefined>(undefined);
  const [prodSku, setProdSku] = useState('RM-BLZ-901');
  const [prodFabric, setProdFabric] = useState('100% Super 120s Wool');
  const [prodFit, setProdFit] = useState<'Slim Fit' | 'Regular Fit' | 'Tailored Fit' | 'Classic Fit'>('Slim Fit');
  const [prodImage, setProdImage] = useState('https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1200&auto=format&fit=crop');

  // New Coupon Form
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState<'percent' | 'fixed'>('percent');
  const [couponValue, setCouponValue] = useState(10);
  const [couponMinSpend, setCouponMinSpend] = useState(3000);

  // Financial Metrics
  const grossRevenue = orders.reduce((sum: number, o: Order) => sum + o.total, 0);
  const totalOrdersCount = orders.length;
  const pendingOrders = orders.filter((o: Order) => o.status === 'PENDING' || o.status === 'CONFIRMED').length;

  const openNewProductModal = () => {
    setEditingProductId(null);
    setProdName('');
    setProdCategory('blazer');
    setProdPrice(8500);
    setProdSalePrice(undefined);
    setProdSku(`RM-${Math.floor(100 + Math.random() * 900)}`);
    setProdFabric('Super 130s Pure Wool');
    setProdFit('Tailored Fit');
    setProdImage('https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1200&auto=format&fit=crop');
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (p: Product) => {
    setEditingProductId(p.id);
    setProdName(p.name);
    setProdCategory(p.categoryId);
    setProdPrice(p.price);
    setProdSalePrice(p.salePrice);
    setProdSku(p.sku);
    setProdFabric(p.fabric);
    setProdFit(p.fit);
    setProdImage(p.images[0]);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodSku.trim()) {
      showToast('Product name and SKU are required.', 'error');
      return;
    }

    const catObj = categories.find((c) => c.slug === prodCategory);
    const payload = {
      name: prodName,
      categoryId: prodCategory,
      categoryName: catObj?.name || prodCategory,
      price: Number(prodPrice),
      salePrice: prodSalePrice ? Number(prodSalePrice) : undefined,
      onSale: Boolean(prodSalePrice && Number(prodSalePrice) < Number(prodPrice)),
      sku: prodSku,
      fabric: prodFabric,
      fit: prodFit,
      images: [prodImage]
    };

    if (editingProductId) {
      await updateProduct(editingProductId, payload);
    } else {
      await addProduct({
        ...payload,
        slug: prodName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        styleCode: `ST-${Math.floor(1000 + Math.random() * 9000)}`,
        newArrival: true,
        featured: true,
        gender: 'Men',
        description: 'Bespoke garment crafted with master tailoring techniques.',
        shortDescription: 'Premium hand-tailored construction.',
        careInstructions: ['Specialist dry clean only'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: [{ name: 'Executive Navy', hex: '#1B2A4A' }],
        rating: 5.0,
        reviewCount: 1,
        stock: { S: 5, M: 8, L: 10, XL: 6, XXL: 4 },
        tags: ['Tailored', 'New Season']
      });
    }

    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this garment from catalog?')) {
      await deleteProduct(id);
    }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    const newCp: Coupon = {
      code: couponCode.trim().toUpperCase(),
      discountType: couponType,
      discountValue: Number(couponValue),
      minSpend: Number(couponMinSpend),
      minOrder: Number(couponMinSpend),
      discountPercent: couponType === 'percent' ? Number(couponValue) : undefined,
      discountAmount: couponType === 'fixed' ? Number(couponValue) : undefined,
      description: `${couponValue}${couponType === 'percent' ? '%' : ' ৳'} discount on orders over ৳${couponMinSpend}`,
      expiresAt: '2026-12-31'
    };

    await addCoupon(newCp);
    setCouponCode('');
  };

  const handleDeleteCoupon = async (code: string) => {
    await deleteCoupon(code);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Top Banner */}
      <div className="bg-[#111111] text-white p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#9A7B38] flex items-center justify-center text-white">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold tracking-wider">
              ZIPPY ATELIER MANAGEMENT CONSOLE
            </h1>
            <p className="text-xs text-neutral-400">
              Inventory control, live order fulfillment, and discount configuration.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:3002"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#b89528] transition-colors flex items-center gap-1.5"
          >
            <span>Advanced Console (Port 3002)</span>
          </a>
          <button
            onClick={() => {
              setActiveView('home');
              applyHash('home');
            }}
            className="px-4 py-2 border border-neutral-600 text-xs font-semibold uppercase tracking-wider hover:border-white transition-colors cursor-pointer"
          >
            Exit Admin
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 gap-4 mb-8 text-xs font-bold uppercase tracking-wider">
        {[
          { id: 'overview', label: 'Executive Dashboard' },
          { id: 'products', label: `Garment Catalog (${products.length})` },
          { id: 'orders', label: `Consignments (${orders.length})` },
          { id: 'coupons', label: `Privilege Coupons (${coupons.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'border-b-2 border-neutral-900 text-neutral-900'
                : 'text-neutral-400 hover:text-neutral-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-neutral-200 p-6">
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                Gross Revenue
              </span>
              <p className="text-2xl font-bold text-neutral-900 tabular-nums mt-1">
                ৳{grossRevenue.toLocaleString()}
              </p>
              <span className="text-[11px] text-green-700 font-semibold mt-1 block">
                ↑ 14.8% vs last cycle
              </span>
            </div>

            <div className="bg-white border border-neutral-200 p-6">
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                Total Orders
              </span>
              <p className="text-2xl font-bold text-neutral-900 tabular-nums mt-1">
                {totalOrdersCount}
              </p>
              <span className="text-[11px] text-neutral-500 mt-1 block">
                {pendingOrders} awaiting fulfillment
              </span>
            </div>

            <div className="bg-white border border-neutral-200 p-6">
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                Active Catalog SKUs
              </span>
              <p className="text-2xl font-bold text-neutral-900 tabular-nums mt-1">
                {products.length}
              </p>
              <span className="text-[11px] text-neutral-500 mt-1 block">
                Across {categories.length} departments
              </span>
            </div>

            <div className="bg-white border border-neutral-200 p-6">
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                Atelier Boutiques
              </span>
              <p className="text-2xl font-bold text-neutral-900 tabular-nums mt-1">
                6 Flagships
              </p>
              <span className="text-[11px] text-[#9A7B38] font-semibold mt-1 block">
                Dhaka, CTG, Sylhet
              </span>
            </div>
          </div>

          {/* Recent Orders in Overview */}
          <div className="border border-neutral-200 bg-white p-6">
            <h3 className="font-serif text-lg font-bold text-neutral-900 mb-4">
              Recent Order Dispatches
            </h3>
            <div className="divide-y divide-neutral-100 text-xs">
              {orders.slice(0, 3).map((o) => (
                <div key={o.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-neutral-900">{o.orderNumber}</span>
                    <span className="text-neutral-500 ml-2">by {o.customer.fullName}</span>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {o.customer.district} · {o.paymentMethod}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold tabular-nums">৳{o.total.toLocaleString()}</span>
                    <span className="block text-[10px] uppercase font-bold text-neutral-600">
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-neutral-900">
                Garment Master Catalog
              </h3>
              <p className="text-xs text-neutral-500">
                Manage live pricing, fabrication notes, sizes, and stock availability.
              </p>
            </div>
            <button
              onClick={openNewProductModal}
              className="px-4 py-2.5 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-black flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Garment</span>
            </button>
          </div>

          <div className="border border-neutral-200 bg-white overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 font-bold uppercase text-neutral-600">
                  <th className="py-3 px-4">Garment</th>
                  <th className="py-3 px-4">SKU / Dept</th>
                  <th className="py-3 px-4">Fabric</th>
                  <th className="py-3 px-4">Price (BDT)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-10 h-12 object-cover border border-neutral-200"
                      />
                      <div>
                        <span className="font-bold text-neutral-900 block">{p.name}</span>
                        <span className="text-[10px] text-neutral-500">{p.fit}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-neutral-700">{p.sku}</span>
                      <span className="block text-[10px] text-neutral-400 uppercase">
                        {p.categoryName}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-600 max-w-xs truncate">{p.fabric}</td>
                    <td className="py-3 px-4 tabular-nums">
                      <div className="font-bold text-neutral-900">
                        ৳{(p.salePrice ?? p.price).toLocaleString()}
                      </div>
                      {p.salePrice && (
                        <div className="text-[10px] text-neutral-400 line-through">
                          ৳{p.price.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {p.onSale ? (
                        <span className="px-2 py-0.5 bg-red-50 text-red-700 text-[10px] font-bold">
                          On Sale
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold">
                          Regular
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditProductModal(p)}
                        className="p-1 text-neutral-600 hover:text-black"
                        title="Edit product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1 text-neutral-400 hover:text-red-600"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div>
            <h3 className="font-serif text-lg font-bold text-neutral-900">
              Customer Consignments & Orders
            </h3>
            <p className="text-xs text-neutral-500">
              Update shipment statuses, review shipping addresses, and audit payment receipts.
            </p>
          </div>

          <div className="border border-neutral-200 bg-white divide-y divide-neutral-200">
            {orders.map((order) => (
              <div key={order.id} className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-100 gap-2 text-xs">
                  <div>
                    <span className="font-mono font-bold text-neutral-900 text-sm">
                      {order.orderNumber}
                    </span>
                    <span className="text-neutral-400 ml-2">({order.createdAt})</span>
                    <p className="text-neutral-600 mt-0.5">
                      Client: <strong>{order.customer.fullName}</strong> · {order.customer.phone}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-neutral-500">Status:</span>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                      className="border border-neutral-300 px-2 py-1 text-xs font-bold uppercase bg-white cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <span className="font-bold text-sm tabular-nums text-neutral-900">
                      ৳{order.total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-600">
                  <div>
                    <strong className="text-neutral-900 block mb-1">Destination Address:</strong>
                    <p>
                      {order.customer.address}, {order.customer.district},{' '}
                      {order.customer.division}
                    </p>
                    {order.customer.deliveryNotes && (
                      <p className="italic text-neutral-500 mt-1">
                        Note: {order.customer.deliveryNotes}
                      </p>
                    )}
                  </div>

                  <div>
                    <strong className="text-neutral-900 block mb-1">Payment & Dispatch:</strong>
                    <p>Method: {order.paymentMethod}</p>
                    {order.paymentId && <p className="font-mono">Ref: {order.paymentId}</p>}
                    <p>Items: {order.items.length} garments ordered</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: COUPONS */}
      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Coupon Form */}
          <div className="lg:col-span-5 bg-white border border-neutral-200 p-6">
            <h3 className="font-serif text-base font-bold text-neutral-900 mb-4">
              Create Privilege Promo Code
            </h3>

            <form onSubmit={handleAddCoupon} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g. SARTORIAL20"
                  className="w-full uppercase font-mono border border-neutral-300 p-2.5 focus:outline-none focus:border-neutral-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Discount Type</label>
                  <select
                    value={couponType}
                    onChange={(e) => setCouponType(e.target.value as any)}
                    className="w-full border border-neutral-300 p-2.5 bg-white focus:outline-none focus:border-neutral-900 cursor-pointer"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Flat (৳ BDT)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    value={couponValue}
                    onChange={(e) => setCouponValue(Number(e.target.value))}
                    className="w-full border border-neutral-300 p-2.5 focus:outline-none focus:border-neutral-900 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Minimum Order Spend (৳ BDT)
                </label>
                <input
                  type="number"
                  value={couponMinSpend}
                  onChange={(e) => setCouponMinSpend(Number(e.target.value))}
                  className="w-full border border-neutral-300 p-2.5 focus:outline-none focus:border-neutral-900 font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-neutral-900 text-white font-bold uppercase tracking-wider hover:bg-black transition-colors"
              >
                Publish Promo Code
              </button>
            </form>
          </div>

          {/* Active Coupons List */}
          <div className="lg:col-span-7 space-y-3">
            <h3 className="font-serif text-base font-bold text-neutral-900 mb-2">
              Active Privilege Codes
            </h3>

            {coupons.map((c) => (
              <div
                key={c.code}
                className="bg-white border border-neutral-200 p-4 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-sm text-neutral-900">{c.code}</span>
                  <p className="text-neutral-500 mt-0.5">{c.description}</p>
                  <span className="text-[10px] text-neutral-400">
                    Min order: ৳{(c.minSpend ?? c.minOrder ?? 0).toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteCoupon(c.code)}
                  className="p-1 text-neutral-400 hover:text-red-600"
                  title="Delete coupon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-white p-6 sm:p-8 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <h3 className="font-serif text-lg font-bold text-neutral-900">
                {editingProductId ? 'Edit Garment Details' : 'Add New Atelier Garment'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-neutral-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Product Title</label>
                <input
                  type="text"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Royal Oxford Pure Silk Panjabi"
                  className="w-full border border-neutral-300 p-2.5 focus:outline-none focus:border-neutral-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full border border-neutral-300 p-2.5 bg-white focus:outline-none focus:border-neutral-900 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    placeholder="RM-BLZ-901"
                    className="w-full font-mono border border-neutral-300 p-2.5 focus:outline-none focus:border-neutral-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Regular Price (৳ BDT)
                  </label>
                  <input
                    type="number"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full border border-neutral-300 p-2.5 font-mono focus:outline-none focus:border-neutral-900"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Sale Price (Optional, ৳ BDT)
                  </label>
                  <input
                    type="number"
                    value={prodSalePrice || ''}
                    onChange={(e) =>
                      setProdSalePrice(e.target.value ? Number(e.target.value) : undefined)
                    }
                    placeholder="Leave blank for regular"
                    className="w-full border border-neutral-300 p-2.5 font-mono focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Fabric Composition
                  </label>
                  <input
                    type="text"
                    value={prodFabric}
                    onChange={(e) => setProdFabric(e.target.value)}
                    placeholder="100% Super 130s Wool"
                    className="w-full border border-neutral-300 p-2.5 focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Fit Silhouette</label>
                  <select
                    value={prodFit}
                    onChange={(e) =>
                      setProdFit(
                        e.target.value as 'Slim Fit' | 'Regular Fit' | 'Tailored Fit' | 'Classic Fit'
                      )
                    }
                    className="w-full border border-neutral-300 p-2.5 bg-white focus:outline-none focus:border-neutral-900"
                  >
                    <option value="Slim Fit">Slim Fit</option>
                    <option value="Tailored Fit">Tailored Fit</option>
                    <option value="Regular Fit">Regular Fit</option>
                    <option value="Classic Fit">Classic Fit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Image URL (Unsplash or CDN)
                </label>
                <input
                  type="url"
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  className="w-full border border-neutral-300 p-2.5 focus:outline-none focus:border-neutral-900 font-mono"
                  required
                />
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 font-semibold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-neutral-900 text-white font-bold uppercase tracking-wider hover:bg-black"
                >
                  Save Garment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
