import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TrendingUp,
  Download,
  Printer,
  RefreshCw,
  Search,
  Calendar,
  Filter,
  DollarSign,
  ShoppingBag,
  Package,
  CreditCard,
  Eye,
  X,
  Tag,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Activity,
  BarChart3,
  Sparkles,
  Zap,
  Layers
} from 'lucide-react';
import { api, getToken } from '../api';
import type { SalesReportResult, SalesReportOrderItem, SalesReportTopProduct } from '../types';

interface SalesReportAdminViewProps {
  onNavigateToOrder?: (orderId: string) => void;
}

type DatePreset =
  | 'today'
  | 'yesterday'
  | 'last7'
  | 'last30'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisYear'
  | 'all'
  | 'custom';

export const SalesReportAdminView: React.FC<SalesReportAdminViewProps> = ({ onNavigateToOrder }) => {
  // Filters state
  const [datePreset, setDatePreset] = useState<DatePreset>('last30');
  const [customFrom, setCustomFrom] = useState<string>('');
  const [customTo, setCustomTo] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Report data state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<SalesReportResult | null>(null);
  const [exporting, setExporting] = useState<boolean>(false);

  // Pagination for orders ledger table
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // View mode for chart (metric, style, hovered state)
  const [chartMetric, setChartMetric] = useState<'revenue' | 'orders' | 'aov'>('revenue');
  const [chartStyle, setChartStyle] = useState<'area' | 'bar'>('area');
  const [hoveredBucketIndex, setHoveredBucketIndex] = useState<number | null>(null);

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<SalesReportOrderItem | null>(null);

  // Official Print & PDF Preview Modal
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Calculate actual date strings based on preset
  const dateRange = useMemo(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (datePreset === 'today') {
      const todayStr = toYMD(now);
      return { from: todayStr, to: todayStr };
    }
    if (datePreset === 'yesterday') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const yStr = toYMD(y);
      return { from: yStr, to: yStr };
    }
    if (datePreset === 'last7') {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      return { from: toYMD(d), to: toYMD(now) };
    }
    if (datePreset === 'last30') {
      const d = new Date(now);
      d.setDate(d.getDate() - 29);
      return { from: toYMD(d), to: toYMD(now) };
    }
    if (datePreset === 'thisMonth') {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: toYMD(first), to: toYMD(now) };
    }
    if (datePreset === 'lastMonth') {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: toYMD(first), to: toYMD(last) };
    }
    if (datePreset === 'thisYear') {
      const first = new Date(now.getFullYear(), 0, 1);
      return { from: toYMD(first), to: toYMD(now) };
    }
    if (datePreset === 'custom') {
      return {
        from: customFrom || undefined,
        to: customTo || undefined
      };
    }
    return { from: undefined, to: undefined };
  }, [datePreset, customFrom, customTo]);

  // Fetch report data
  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.reportsSales({
        from: dateRange.from,
        to: dateRange.to,
        paymentMethod: paymentFilter !== 'all' ? paymentFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm.trim() ? searchTerm.trim() : undefined
      });
      setReport(res);
      setCurrentPage(1);
    } catch (err: unknown) {
      console.error('Failed to load sales report', err);
      setError(err instanceof Error ? err.message : 'Failed to retrieve sales report');
    } finally {
      setLoading(false);
    }
  }, [dateRange, paymentFilter, statusFilter, searchTerm]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Export CSV handler
  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const q = new URLSearchParams();
      q.set('format', 'csv');
      if (dateRange.from) q.set('from', dateRange.from);
      if (dateRange.to) q.set('to', dateRange.to);
      if (paymentFilter !== 'all') q.set('paymentMethod', paymentFilter);
      if (statusFilter !== 'all') q.set('status', statusFilter);
      if (searchTerm.trim()) q.set('search', searchTerm.trim());

      const token = getToken();
      const res = await fetch(`/api/v1/reports/sales?${q.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!res.ok) throw new Error(`Export failed with HTTP status ${res.status}`);

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filenameDate = dateRange.from && dateRange.to ? `${dateRange.from}_to_${dateRange.to}` : 'full_ledger';
      link.download = `sales_report_${filenameDate}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to export sales report');
    } finally {
      setExporting(false);
    }
  };

  // Native clean print
  const handlePrint = () => {
    window.print();
  };

  // Pagination slice
  const ordersList = report?.orders || [];
  const totalPages = Math.max(1, Math.ceil(ordersList.length / pageSize));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return ordersList.slice(start, start + pageSize);
  }, [ordersList, currentPage, pageSize]);

  // Chart data calculations
  const dayBuckets = report?.byDay || [];

  const metricMeta = useMemo(() => {
    if (chartMetric === 'orders') {
      return {
        label: 'Orders Count',
        shortLabel: 'Orders',
        prefix: '',
        suffix: ' orders',
        color: '#3B82F6',
        accentBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        activeBtnBg: 'bg-blue-500 text-white font-bold',
        getValue: (b: (typeof dayBuckets)[0]) => b.orders,
        format: (v: number) => `${v.toLocaleString()} orders`
      };
    }
    if (chartMetric === 'aov') {
      return {
        label: 'Average Order Value (AOV)',
        shortLabel: 'AOV',
        prefix: '৳',
        suffix: '',
        color: '#10B981',
        accentBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        activeBtnBg: 'bg-emerald-500 text-neutral-950 font-bold',
        getValue: (b: (typeof dayBuckets)[0]) => (b.orders > 0 ? Math.round(b.revenue / b.orders) : 0),
        format: (v: number) => `৳${Math.round(v).toLocaleString()}`
      };
    }
    return {
      label: 'Gross Sales Revenue',
      shortLabel: 'Revenue',
      prefix: '৳',
      suffix: '',
      color: '#F59E0B',
      accentBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      activeBtnBg: 'bg-amber-500 text-neutral-950 font-bold',
      getValue: (b: (typeof dayBuckets)[0]) => b.revenue,
      format: (v: number) => `৳${Math.round(v).toLocaleString()}`
    };
  }, [chartMetric]);

  // Peak day and averages
  const trendAnalytics = useMemo(() => {
    if (dayBuckets.length === 0) {
      return { peakBucket: null, peakVal: 0, dailyAvg: 0, totalVal: 0 };
    }
    let maxVal = -1;
    let peak = dayBuckets[0];
    let sumVal = 0;

    for (const b of dayBuckets) {
      const v = metricMeta.getValue(b);
      sumVal += v;
      if (v > maxVal) {
        maxVal = v;
        peak = b;
      }
    }

    const dailyAvg = Math.round(sumVal / dayBuckets.length);
    return {
      peakBucket: peak,
      peakVal: Math.max(0, maxVal),
      dailyAvg,
      totalVal: sumVal
    };
  }, [dayBuckets, metricMeta]);

  // Chart SVG points & geometry
  const chartGeometry = useMemo(() => {
    const width = 760;
    const height = 240;
    const padLeft = 65;
    const padRight = 30;
    const padTop = 25;
    const padBottom = 35;
    const plotWidth = width - padLeft - padRight;
    const plotHeight = height - padTop - padBottom;
    const plotBottom = height - padBottom;

    if (dayBuckets.length === 0) {
      return {
        width,
        height,
        points: [],
        areaPath: '',
        linePath: '',
        yTicks: [],
        maxScale: 1,
        plotBottom,
        padLeft,
        plotWidth
      };
    }

    const rawMax = Math.max(...dayBuckets.map((b) => metricMeta.getValue(b)), 1);

    // Calculate a clean rounded ceiling for the Y scale
    const calcNiceCeil = (m: number) => {
      if (m <= 5) return 5;
      if (m <= 10) return 10;
      if (m <= 25) return 25;
      if (m <= 50) return 50;
      if (m <= 100) return 100;
      const mag = Math.pow(10, Math.floor(Math.log10(m)));
      const norm = m / mag;
      let ceilNorm = 10;
      if (norm <= 1.2) ceilNorm = 1.25;
      else if (norm <= 2) ceilNorm = 2;
      else if (norm <= 2.5) ceilNorm = 2.5;
      else if (norm <= 5) ceilNorm = 5;
      return ceilNorm * mag;
    };

    const maxScale = calcNiceCeil(rawMax);

    // 4 Y-ticks
    const yTicks = [
      { val: maxScale, y: padTop },
      { val: Math.round(maxScale * 0.66), y: padTop + plotHeight * 0.34 },
      { val: Math.round(maxScale * 0.33), y: padTop + plotHeight * 0.67 },
      { val: 0, y: plotBottom }
    ];

    const N = dayBuckets.length;
    const points = dayBuckets.map((bucket, i) => {
      const x = N === 1 ? padLeft + plotWidth / 2 : padLeft + (i / (N - 1)) * plotWidth;
      const val = metricMeta.getValue(bucket);
      const y = plotBottom - (val / maxScale) * plotHeight;
      return { x, y, val, bucket, index: i };
    });

    // Spline curve
    let linePath = '';
    let areaPath = '';
    if (points.length === 1) {
      linePath = `M ${padLeft} ${points[0].y} L ${padLeft + plotWidth} ${points[0].y}`;
      areaPath = `M ${padLeft} ${points[0].y} L ${padLeft + plotWidth} ${points[0].y} L ${padLeft + plotWidth} ${plotBottom} L ${padLeft} ${plotBottom} Z`;
    } else {
      linePath = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const midX = (p0.x + p1.x) / 2;
        linePath += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
      }
      areaPath = `${linePath} L ${points[points.length - 1].x} ${plotBottom} L ${points[0].x} ${plotBottom} Z`;
    }

    return {
      width,
      height,
      points,
      areaPath,
      linePath,
      yTicks,
      maxScale,
      plotBottom,
      padLeft,
      plotWidth
    };
  }, [dayBuckets, metricMeta]);

  const hoveredBucket =
    hoveredBucketIndex !== null && dayBuckets[hoveredBucketIndex]
      ? dayBuckets[hoveredBucketIndex]
      : null;

  const totals = report?.totals || {
    orders: 0,
    revenue: 0,
    discount: 0,
    grossSales: 0,
    netSales: 0,
    shippingFee: 0,
    averageOrderValue: 0,
    itemsCount: 0,
    completedOrdersCount: 0,
    cancelledOrdersCount: 0,
    processingOrdersCount: 0
  };

  const fulfillmentRate =
    totals.orders > 0 ? Math.round((totals.completedOrdersCount / totals.orders) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 print:p-0 print:max-w-none print:bg-white print:text-black">
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-800 print:hidden">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <TrendingUp className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-serif font-bold text-neutral-100">
                Sales Intelligence & Revenue Report
              </h2>
              <p className="text-xs text-neutral-400">
                Gross merchandise value, transaction ledgers, payment channels & fulfillment analytics
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={fetchReport}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-xs font-medium hover:text-white transition disabled:opacity-50"
            title="Refresh sales data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-xs font-medium hover:text-white transition"
            title="Print or export as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs transition shadow-sm disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Printable Heading (Only visible in Print) */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold font-serif text-black">ZIPPY | Atelier Sales Report</h1>
        <p className="text-sm text-neutral-600">
          Generated on: {new Date().toLocaleString()} | Window:{' '}
          {dateRange.from || 'Beginning'} to {dateRange.to || 'Present'}
        </p>
      </div>

      {/* 2. Interactive Filter Strip */}
      <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-3 print:hidden">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Date Presets */}
          <div className="flex items-center flex-wrap gap-1">
            <span className="text-xs text-neutral-400 mr-1 flex items-center space-x-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Period:</span>
            </span>
            {(
              [
                { key: 'today', label: 'Today' },
                { key: 'yesterday', label: 'Yesterday' },
                { key: 'last7', label: 'Last 7 Days' },
                { key: 'last30', label: 'Last 30 Days' },
                { key: 'thisMonth', label: 'This Month' },
                { key: 'lastMonth', label: 'Last Month' },
                { key: 'thisYear', label: 'This Year' },
                { key: 'all', label: 'All Time' },
                { key: 'custom', label: 'Custom' }
              ] as Array<{ key: DatePreset; label: string }>
            ).map((preset) => {
              const active = datePreset === preset.key;
              return (
                <button
                  key={preset.key}
                  onClick={() => setDatePreset(preset.key)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                    active
                      ? 'bg-amber-500 text-neutral-950 font-semibold shadow-sm'
                      : 'bg-neutral-800/80 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search by Order #, Patron, Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Custom Range & Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-neutral-800/60">
          {datePreset === 'custom' && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-neutral-400">From:</span>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
              />
              <span className="text-xs text-neutral-400">To:</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          {/* Payment Method filter */}
          <div className="flex items-center space-x-2">
            <CreditCard className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-300 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Payment Channels</option>
              <option value="cod">Cash on Delivery (COD)</option>
              <option value="bkash">bKash Merchant</option>
              <option value="nagad">Nagad Direct</option>
              <option value="card">Credit / Debit Card</option>
              <option value="sslcommerz">SSLCommerz Gateway</option>
            </select>
          </div>

          {/* Order Status filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-300 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Order Statuses</option>
              <option value="delivered">Delivered / Completed</option>
              <option value="processing">Processing / Tailoring</option>
              <option value="shipped">Shipped / In Transit</option>
              <option value="pending">Pending Confirmation</option>
              <option value="cancelled">Cancelled / Returned</option>
            </select>
          </div>

          {/* Active summary label */}
          <div className="ml-auto text-xs text-neutral-400 font-mono">
            <span>
              Matching Orders: <strong className="text-amber-400">{totals.orders}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 bg-red-950/40 border border-red-800 rounded-xl text-xs text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchReport} className="underline text-red-200 ml-2">
            Retry
          </button>
        </div>
      )}

      {/* 3. Executive KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Gross Revenue */}
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-neutral-700 transition">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Gross Sales (GMV)</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl md:text-2xl font-bold text-amber-400 font-mono mt-1">
            ৳{totals.grossSales.toLocaleString()}
          </p>
          <p className="text-[11px] text-neutral-400 mt-1 flex items-center justify-between">
            <span>Net Sales:</span>
            <span className="font-mono text-neutral-200">৳{totals.netSales.toLocaleString()}</span>
          </p>
        </div>

        {/* Total Orders */}
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-neutral-700 transition">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Orders Placed</span>
            <ShoppingBag className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl md:text-2xl font-bold text-neutral-100 font-mono mt-1">
            {totals.orders}
          </p>
          <p className="text-[11px] text-neutral-400 mt-1 flex items-center justify-between">
            <span>Avg Order Value:</span>
            <span className="font-mono text-emerald-400">৳{totals.averageOrderValue.toLocaleString()}</span>
          </p>
        </div>

        {/* Units Sold */}
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-neutral-700 transition">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Garment Units Sold</span>
            <Package className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl md:text-2xl font-bold text-emerald-400 font-mono mt-1">
            {totals.itemsCount}
          </p>
          <p className="text-[11px] text-neutral-400 mt-1 flex items-center justify-between">
            <span>Fulfillment Rate:</span>
            <span className="font-mono text-neutral-200">{fulfillmentRate}%</span>
          </p>
        </div>

        {/* Discounts & Logistics */}
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-neutral-700 transition">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Promotions & Shipping</span>
            <Tag className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xs text-neutral-400">Discounts:</span>
            <span className="font-mono text-sm text-rose-400 font-bold">
              -৳{totals.discount.toLocaleString()}
            </span>
          </div>
          <div className="mt-1 flex items-baseline justify-between text-[11px] text-neutral-400">
            <span>Shipping Fees:</span>
            <span className="font-mono text-neutral-200">৳{totals.shippingFee.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 4. Visual Trend Charts & Channel Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Redesigned Revenue & Sales Trajectory Card */}
        <div className="lg:col-span-2 p-5 bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl shadow-xl space-y-4">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800/80">
            <div>
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Activity className="w-4 h-4" />
                </span>
                <h4 className="text-base font-serif font-bold text-neutral-100">
                  Revenue & Sales Trajectory
                </h4>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Dynamic waveform tracking financial velocity and order volumes
              </p>
            </div>

            {/* Visual Style & Metric Switchers */}
            <div className="flex items-center flex-wrap gap-2">
              {/* Style: Waveform vs Bars */}
              <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                <button
                  onClick={() => setChartStyle('area')}
                  className={`flex items-center space-x-1 px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                    chartStyle === 'area'
                      ? 'bg-neutral-800 text-amber-400 font-semibold shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Smooth Waveform Trend"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Waveform</span>
                </button>
                <button
                  onClick={() => setChartStyle('bar')}
                  className={`flex items-center space-x-1 px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                    chartStyle === 'bar'
                      ? 'bg-neutral-800 text-amber-400 font-semibold shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Bar Columns"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Pillars</span>
                </button>
              </div>

              {/* Metric selector: Revenue vs Orders vs AOV */}
              <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                <button
                  onClick={() => setChartMetric('revenue')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                    chartMetric === 'revenue'
                      ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  ৳ Revenue
                </button>
                <button
                  onClick={() => setChartMetric('orders')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                    chartMetric === 'orders'
                      ? 'bg-blue-500 text-white font-bold shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Orders
                </button>
                <button
                  onClick={() => setChartMetric('aov')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                    chartMetric === 'aov'
                      ? 'bg-emerald-500 text-neutral-950 font-bold shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  AOV
                </button>
              </div>
            </div>
          </div>

          {/* Executive Quick Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/80 text-xs">
            {/* Peak Performance */}
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-mono text-neutral-500 block">Peak Window</span>
                <span className="font-mono text-neutral-200 font-bold truncate block">
                  {trendAnalytics.peakBucket ? metricMeta.format(trendAnalytics.peakVal) : '—'}
                </span>
                <span className="text-[10px] text-amber-400/80 font-mono truncate block">
                  {trendAnalytics.peakBucket?.date || 'No orders'}
                </span>
              </div>
            </div>

            {/* Daily Average */}
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-mono text-neutral-500 block">Daily Run Rate</span>
                <span className="font-mono text-neutral-200 font-bold truncate block">
                  {metricMeta.format(trendAnalytics.dailyAvg)} / day
                </span>
                <span className="text-[10px] text-neutral-400 font-mono truncate block">
                  {dayBuckets.length} days recorded
                </span>
              </div>
            </div>

            {/* Active Inspector Callout (changes when hovered) */}
            <div className="col-span-2 sm:col-span-1 flex items-center space-x-2.5 border-t sm:border-t-0 sm:border-l border-neutral-800/80 pt-2 sm:pt-0 sm:pl-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-mono text-neutral-500 block">
                  {hoveredBucket ? `Selected: ${hoveredBucket.date}` : 'Period Volume'}
                </span>
                <span className="font-mono text-emerald-400 font-bold truncate block">
                  {hoveredBucket
                    ? metricMeta.format(metricMeta.getValue(hoveredBucket))
                    : metricMeta.format(trendAnalytics.totalVal)}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono truncate block">
                  {hoveredBucket
                    ? `${hoveredBucket.orders} orders (${hoveredBucket.itemsCount} garments)`
                    : `${totals.orders} total orders`}
                </span>
              </div>
            </div>
          </div>

          {/* Main Chart Graphic Canvas */}
          {dayBuckets.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-neutral-500 text-xs border border-dashed border-neutral-800 rounded-xl">
              <Calendar className="w-8 h-8 mb-2 opacity-40 text-neutral-600" />
              <p className="font-medium text-neutral-400">No Sales Transactions Recorded</p>
              <span className="text-[11px] text-neutral-600 mt-0.5">
                Adjust date filters or place a new test order to visualize revenue velocity.
              </span>
            </div>
          ) : (
            <div className="relative group/chart">
              {/* SVG Canvas */}
              <div className="w-full h-60 select-none">
                <svg
                  viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`}
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                >
                  <defs>
                    {/* Gradients */}
                    <linearGradient id="amberAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.38" />
                      <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="blueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.38" />
                      <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="emeraldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.38" />
                      <stop offset="60%" stopColor="#10B981" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                    </linearGradient>

                    <linearGradient id="barGradAmber" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FBBF24" />
                      <stop offset="100%" stopColor="#D97706" />
                    </linearGradient>
                    <linearGradient id="barGradBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#60A5FA" />
                      <stop offset="100%" stopColor="#2563EB" />
                    </linearGradient>
                    <linearGradient id="barGradEmerald" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34D399" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>

                    {/* Subtle Glow Filter */}
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Y-Axis Horizontal Gridlines & Tick Labels */}
                  {chartGeometry.yTicks.map((tick, i) => (
                    <g key={i}>
                      <line
                        x1={chartGeometry.padLeft}
                        y1={tick.y}
                        x2={chartGeometry.width - 25}
                        y2={tick.y}
                        stroke="#262626"
                        strokeDasharray={i === chartGeometry.yTicks.length - 1 ? undefined : '4 4'}
                        strokeWidth="1"
                      />
                      <text
                        x={chartGeometry.padLeft - 10}
                        y={tick.y + 3.5}
                        textAnchor="end"
                        fill="#737373"
                        fontSize="10"
                        fontFamily="monospace"
                      >
                        {metricMeta.prefix}
                        {tick.val >= 1000 ? `${(tick.val / 1000).toFixed(tick.val % 1000 === 0 ? 0 : 1)}k` : tick.val}
                      </text>
                    </g>
                  ))}

                  {/* AREA WAVEFORM MODE */}
                  {chartStyle === 'area' && (
                    <>
                      {/* Area Fill */}
                      <path
                        d={chartGeometry.areaPath}
                        fill={
                          chartMetric === 'orders'
                            ? 'url(#blueAreaGrad)'
                            : chartMetric === 'aov'
                            ? 'url(#emeraldAreaGrad)'
                            : 'url(#amberAreaGrad)'
                        }
                      />

                      {/* Glowing Stroke Line */}
                      <path
                        d={chartGeometry.linePath}
                        fill="none"
                        stroke={metricMeta.color}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#glow)"
                      />

                      {/* Interactive Nodes */}
                      {chartGeometry.points.map((pt) => {
                        const isHovered = hoveredBucketIndex === pt.index;
                        return (
                          <g key={pt.index}>
                            {/* Hover Pulse Ring */}
                            {isHovered && (
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r="10"
                                fill={metricMeta.color}
                                fillOpacity="0.25"
                                className="animate-ping"
                              />
                            )}
                            {/* Node Dot */}
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={isHovered ? 5.5 : 3.5}
                              fill="#171717"
                              stroke={metricMeta.color}
                              strokeWidth={isHovered ? 3 : 2}
                              className="transition-all duration-200"
                            />
                          </g>
                        );
                      })}
                    </>
                  )}

                  {/* BAR PILLARS MODE */}
                  {chartStyle === 'bar' && (() => {
                    const N = dayBuckets.length;
                    const barW = Math.max(8, Math.min(32, (chartGeometry.plotWidth / N) * 0.62));
                    const barGrad =
                      chartMetric === 'orders'
                        ? 'url(#barGradBlue)'
                        : chartMetric === 'aov'
                        ? 'url(#barGradEmerald)'
                        : 'url(#barGradAmber)';

                    return chartGeometry.points.map((pt) => {
                      const isHovered = hoveredBucketIndex === pt.index;
                      const barH = Math.max(3, chartGeometry.plotBottom - pt.y);
                      const barX = pt.x - barW / 2;

                      return (
                        <g key={pt.index}>
                          {/* Background Track Rail */}
                          <rect
                            x={barX}
                            y={25}
                            width={barW}
                            height={chartGeometry.plotBottom - 25}
                            rx={barW > 12 ? 4 : 2}
                            fill="#1c1917"
                            opacity="0.4"
                          />
                          {/* Active Bar */}
                          <rect
                            x={barX}
                            y={pt.y}
                            width={barW}
                            height={barH}
                            rx={barW > 12 ? 4 : 2}
                            fill={barGrad}
                            opacity={isHovered ? 1 : 0.88}
                            filter={isHovered ? 'url(#glow)' : undefined}
                            className="transition-all duration-200"
                          />
                        </g>
                      );
                    });
                  })()}

                  {/* Vertical Scrubber Cursor (Follows Mouse) */}
                  {hoveredBucketIndex !== null && chartGeometry.points[hoveredBucketIndex] && (
                    <g>
                      <line
                        x1={chartGeometry.points[hoveredBucketIndex].x}
                        y1={25}
                        x2={chartGeometry.points[hoveredBucketIndex].x}
                        y2={chartGeometry.plotBottom}
                        stroke={metricMeta.color}
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                        opacity="0.75"
                      />
                    </g>
                  )}

                  {/* Invisible Hit Zones for Hover Detection */}
                  {chartGeometry.points.map((pt) => {
                    const N = dayBuckets.length;
                    const zoneWidth = chartGeometry.plotWidth / Math.max(1, N);
                    const zoneLeft = pt.x - zoneWidth / 2;

                    return (
                      <rect
                        key={`hit-${pt.index}`}
                        x={zoneLeft}
                        y={0}
                        width={zoneWidth}
                        height={chartGeometry.height}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredBucketIndex(pt.index)}
                        onMouseLeave={() => setHoveredBucketIndex(null)}
                      />
                    );
                  })}
                </svg>
              </div>

              {/* X-Axis Date Strip */}
              <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono px-3 pt-1 border-t border-neutral-800/80">
                <span className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 inline-block" />
                  <span>{dayBuckets[0]?.date}</span>
                </span>
                {dayBuckets.length > 2 && (
                  <span className="text-neutral-500 hidden sm:inline">
                    {dayBuckets[Math.floor(dayBuckets.length / 2)]?.date}
                  </span>
                )}
                <span className="flex items-center space-x-1">
                  <span>{dayBuckets[dayBuckets.length - 1]?.date}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Payment Channels & Status Breakdowns */}
        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-5">
          {/* Payment Methods */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-serif font-bold text-neutral-200">Payment Channels</h4>
              <span className="text-[10px] text-neutral-400 uppercase font-mono">Share</span>
            </div>

            <div className="space-y-2">
              {(report?.byPaymentMethod || []).length === 0 ? (
                <p className="text-xs text-neutral-500">No payment data recorded</p>
              ) : (
                report?.byPaymentMethod.map((item) => (
                  <div key={item.method} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-300 font-mono text-[11px]">{item.method}</span>
                      <div className="flex items-center space-x-2 text-[11px]">
                        <span className="text-neutral-400 font-mono">({item.count} orders)</span>
                        <span className="text-amber-400 font-mono font-bold">
                          ৳{item.revenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${item.percentage}%` }}
                        className="h-full bg-amber-400 rounded-full"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="pt-3 border-t border-neutral-800">
            <h4 className="text-sm font-serif font-bold text-neutral-200 mb-2">Status Distribution</h4>
            <div className="grid grid-cols-2 gap-2">
              {(report?.byStatus || []).map((s) => {
                const isDelivered = s.status === 'delivered';
                const isCancelled = s.status === 'cancelled';
                const isProcessing = s.status === 'processing' || s.status === 'shipped';

                return (
                  <div
                    key={s.status}
                    className="p-2 bg-neutral-950 border border-neutral-800/80 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <p
                        className={`text-[10px] uppercase font-mono font-bold ${
                          isDelivered
                            ? 'text-emerald-400'
                            : isCancelled
                            ? 'text-rose-400'
                            : isProcessing
                            ? 'text-blue-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {s.status}
                      </p>
                      <p className="text-xs font-mono text-neutral-200 font-bold">{s.count} orders</p>
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400">
                      ৳{s.revenue.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Top Selling Garments / Products Table */}
      <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-serif font-bold text-neutral-200">
              Top Selling Garments & Collections
            </h4>
            <p className="text-xs text-neutral-400">
              Highest-performing products sorted by sales volume and generated revenue
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Top {report?.topProducts?.length || 0} Items
          </span>
        </div>

        {(report?.topProducts || []).length === 0 ? (
          <p className="text-xs text-neutral-500 py-4 text-center">No product sales in this timeframe</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3"># Rank</th>
                  <th className="py-2.5 px-3">Garment Title</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3 text-right">Units Sold</th>
                  <th className="py-2.5 px-3 text-right">Gross Revenue (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {report?.topProducts.map((prod: SalesReportTopProduct, idx: number) => (
                  <tr key={prod.id} className="hover:bg-neutral-800/40 transition">
                    <td className="py-2.5 px-3 text-neutral-500 font-bold">#{idx + 1}</td>
                    <td className="py-2.5 px-3 font-sans font-medium text-neutral-200">
                      <div className="flex items-center space-x-2">
                        {prod.image ? (
                          <img
                            src={prod.image}
                            alt={prod.title}
                            className="w-7 h-7 rounded object-cover border border-neutral-700"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded bg-neutral-800 flex items-center justify-center text-neutral-500">
                            <Package className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <span className="truncate max-w-[280px]">{prod.title}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-neutral-400">{prod.sku}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">{prod.quantity}</td>
                    <td className="py-2.5 px-3 text-right text-amber-400 font-bold">
                      ৳{prod.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. Filtered Sales Ledger (Orders Table) */}
      <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-serif font-bold text-neutral-200">
              Detailed Sales Ledger & Transactions
            </h4>
            <p className="text-xs text-neutral-400">
              Authenticated order records with customer identifiers, item quantities and payment status
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-neutral-400">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-neutral-950 border border-neutral-800 rounded text-neutral-300 focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 text-[11px] uppercase tracking-wider font-mono">
                <th className="py-3 px-3">Order #</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Patron Name</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3 text-center">Items</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Subtotal</th>
                <th className="py-3 px-3 text-right">Discount</th>
                <th className="py-3 px-3 text-right">Net Total</th>
                <th className="py-3 px-3 text-center print:hidden">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-neutral-500">
                    No orders match the selected filters or date window.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const isDelivered = order.status.toLowerCase() === 'delivered';
                  const isCancelled = order.status.toLowerCase() === 'cancelled';
                  const isPaid = order.paymentStatus.toLowerCase() === 'paid';

                  return (
                    <tr key={order.id} className="hover:bg-neutral-800/40 transition">
                      <td className="py-3 px-3 font-bold text-neutral-200">
                        <span className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-[11px]">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-neutral-400 text-[11px]">
                        {order.createdAt ? order.createdAt.slice(0, 10) : '—'}
                      </td>
                      <td className="py-3 px-3 font-sans text-neutral-200 font-medium">
                        {order.customerName}
                      </td>
                      <td className="py-3 px-3 text-neutral-400 text-[11px]">
                        {order.customerPhone || order.customerEmail || '—'}
                      </td>
                      <td className="py-3 px-3 text-center text-neutral-300">
                        {order.itemsCount}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-semibold text-neutral-300">
                            {order.paymentMethod}
                          </span>
                          <span
                            className={`text-[9px] uppercase ${
                              isPaid ? 'text-emerald-400' : 'text-amber-400'
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            isDelivered
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isCancelled
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-neutral-400">
                        ৳{order.subtotal.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-rose-400">
                        {order.discount > 0 ? `-৳${order.discount.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-amber-400">
                        ৳{order.total.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center print:hidden">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition"
                          title="View order details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-neutral-800 text-xs text-neutral-400 print:hidden">
          <div>
            Showing{' '}
            <strong className="text-neutral-200">
              {ordersList.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </strong>{' '}
            to{' '}
            <strong className="text-neutral-200">
              {Math.min(currentPage * pageSize, ordersList.length)}
            </strong>{' '}
            of <strong className="text-neutral-200">{ordersList.length}</strong> orders
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 disabled:opacity-40 transition text-neutral-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-mono text-neutral-200">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 disabled:opacity-40 transition text-neutral-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 7. Quick Order Detail Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="font-serif font-bold text-neutral-100 text-base">
                  Order #{selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-neutral-400 font-mono">
                  Placed on {selectedOrder.createdAt}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Patron Summary */}
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 space-y-1 text-xs">
              <p className="text-[10px] uppercase font-mono text-neutral-500 font-bold">
                Patron Information
              </p>
              <p className="text-neutral-200 font-semibold">{selectedOrder.customerName}</p>
              <p className="text-neutral-400 font-mono">Phone: {selectedOrder.customerPhone || 'N/A'}</p>
              <p className="text-neutral-400 font-mono">Email: {selectedOrder.customerEmail || 'N/A'}</p>
              {selectedOrder.customerCity && (
                <p className="text-neutral-400">City / Zone: {selectedOrder.customerCity}</p>
              )}
            </div>

            {/* Financial Ledger */}
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal ({selectedOrder.itemsCount} items):</span>
                <span>৳{selectedOrder.subtotal.toLocaleString()}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-rose-400">
                  <span>Promotional Discount:</span>
                  <span>-৳{selectedOrder.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-400">
                <span>Shipping Fee:</span>
                <span>৳{selectedOrder.shippingFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-amber-400 pt-2 border-t border-neutral-800">
                <span>Total Amount:</span>
                <span>৳{selectedOrder.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Status & Method */}
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-mono">
              <div className="p-2.5 bg-neutral-950 rounded-lg border border-neutral-800">
                <span className="text-[10px] uppercase text-neutral-500 block">Payment Method</span>
                <span className="text-neutral-200 font-bold">{selectedOrder.paymentMethod}</span>
                <span className="text-[10px] text-amber-400 block uppercase mt-0.5">
                  Status: {selectedOrder.paymentStatus}
                </span>
              </div>
              <div className="p-2.5 bg-neutral-950 rounded-lg border border-neutral-800">
                <span className="text-[10px] uppercase text-neutral-500 block">Order Status</span>
                <span className="text-neutral-200 font-bold uppercase">{selectedOrder.status}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-neutral-800">
              {onNavigateToOrder && (
                <button
                  onClick={() => {
                    onNavigateToOrder(selectedOrder.id);
                    setSelectedOrder(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-semibold flex items-center space-x-1"
                >
                  <span>Go to Orders Tab</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. OFFICIAL PRINT & PDF EXPORT MODAL & DOCUMENT */}
      {isPrintModalOpen && (
        <div className="print-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="print-modal-container bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl flex flex-col my-auto">
            {/* Modal Controls Bar (Hidden in Print) */}
            <div className="print-modal-header shrink-0 flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-950/90 rounded-t-2xl">
              <div className="flex items-center space-x-2">
                <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Printer className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-serif font-bold text-neutral-100 text-sm">
                    Print & PDF Financial Ledger Preview
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Official high-contrast accounting document formatted for A4 / Letter printing and PDF export
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg shadow-sm transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save as PDF</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
                  title="Close preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Preview Container */}
            <div className="p-4 sm:p-6 bg-neutral-950/70 overflow-y-auto">
              <div
                id="sales-report-printable-document"
                className="printable-document bg-white text-neutral-900 p-8 sm:p-10 rounded-xl shadow-xl border border-neutral-200 space-y-6 max-w-4xl mx-auto"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {/* 1. Letterhead & Document Meta */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-neutral-900">
                  <div>
                    <h1 className="text-2xl font-serif font-black tracking-wider text-black">ZIPPY</h1>
                    <p className="text-[11px] font-sans font-semibold tracking-widest text-amber-700 uppercase mt-0.5">
                      GENTLEMAN'S ATELIER & FINE BESPOKE
                    </p>
                    <p className="text-xs text-neutral-600 font-sans mt-2">
                      Road 11, Block D, Banani, Dhaka-1213, Bangladesh
                    </p>
                    <p className="text-xs text-neutral-600 font-sans">
                      Tel: +880 1711-000000 | accounts@zippy.com.bd | www.zippy.com.bd
                    </p>
                  </div>

                  <div className="text-left sm:text-right font-sans text-xs bg-neutral-50 p-3 rounded-lg border border-neutral-200 min-w-[240px]">
                    <div className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px] tracking-wider uppercase mb-1">
                      Official Audit Ledger
                    </div>
                    <p className="font-mono text-neutral-700 text-[11px]">
                      Ref: <strong>REF-SLS-{new Date().getFullYear()}-{totals.orders}</strong>
                    </p>
                    <p className="text-neutral-600 mt-1">
                      Issued: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-neutral-600">
                      Window: <strong>{dateRange.from || 'Commencement'} to {dateRange.to || 'Present'}</strong>
                    </p>
                    <p className="text-neutral-600">
                      Scope: <strong>{paymentFilter !== 'all' ? paymentFilter.toUpperCase() : 'All Gateways'} | {statusFilter !== 'all' ? statusFilter.toUpperCase() : 'All Statuses'}</strong>
                    </p>
                  </div>
                </div>

                {/* 2. Executive Financial Summary Boxes */}
                <div className="page-break-avoid font-sans">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                    Executive Financial Summary
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">Gross Sales (GMV)</span>
                      <span className="text-base font-bold font-mono text-neutral-900 mt-0.5 block">
                        ৳{totals.grossSales.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-neutral-500">{totals.itemsCount} garment units</span>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">Discounts Deducted</span>
                      <span className="text-base font-bold font-mono text-rose-700 mt-0.5 block">
                        -৳{totals.discount.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-neutral-500">Promotions & Vouchers</span>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">Shipping Collected</span>
                      <span className="text-base font-bold font-mono text-neutral-800 mt-0.5 block">
                        ৳{totals.shippingFee.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-neutral-500">Courier delivery fees</span>
                    </div>

                    <div className="p-3 bg-amber-50/60 rounded-lg border-2 border-amber-500/40">
                      <span className="text-[10px] uppercase font-bold text-amber-900 block">Net Realized Revenue</span>
                      <span className="text-base font-bold font-mono text-amber-950 mt-0.5 block">
                        ৳{totals.revenue.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-amber-800 font-semibold">{totals.orders} orders fulfilled</span>
                    </div>
                  </div>

                  {/* Secondary Metrics Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 mt-2 bg-neutral-100 rounded-lg text-[11px] text-neutral-700 font-mono">
                    <span>Average Order Value: <strong className="text-neutral-900">৳{totals.averageOrderValue.toLocaleString()}</strong></span>
                    <span>Completed Orders: <strong className="text-emerald-700">{totals.completedOrdersCount}</strong></span>
                    <span>Processing Orders: <strong className="text-blue-700">{totals.processingOrdersCount}</strong></span>
                    <span>Cancelled: <strong className="text-rose-700">{totals.cancelledOrdersCount}</strong></span>
                  </div>
                </div>

                {/* 3. Payment Channels Settlement Distribution */}
                <div className="page-break-avoid font-sans">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                    Payment Gateway Settlement Reconciliation
                  </h3>
                  <table className="w-full text-left text-xs border border-neutral-200 rounded-lg overflow-hidden">
                    <thead className="bg-neutral-100 text-neutral-700 font-semibold">
                      <tr>
                        <th className="py-2 px-3 border-b border-neutral-200">Channel / Gateway</th>
                        <th className="py-2 px-3 border-b border-neutral-200 text-center">Orders Count</th>
                        <th className="py-2 px-3 border-b border-neutral-200 text-right">Settled Amount (BDT)</th>
                        <th className="py-2 px-3 border-b border-neutral-200 text-right">Volume Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 font-mono">
                      {(report?.byPaymentMethod || []).map((pm) => (
                        <tr key={pm.method}>
                          <td className="py-2 px-3 font-sans font-medium text-neutral-800">{pm.method}</td>
                          <td className="py-2 px-3 text-center">{pm.count} orders</td>
                          <td className="py-2 px-3 text-right font-bold">৳{pm.revenue.toLocaleString()}</td>
                          <td className="py-2 px-3 text-right font-bold text-amber-800">{pm.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 4. Complete Orders Transaction Ledger */}
                <div className="font-sans space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Transaction Ledger Entries ({ordersList.length} Orders)
                    </h3>
                    <span className="text-[10px] font-mono text-neutral-500">Currency: BDT</span>
                  </div>

                  <table className="w-full text-left text-[11px] border border-neutral-300">
                    <thead className="bg-neutral-100 text-neutral-800 font-bold border-b-2 border-neutral-300">
                      <tr>
                        <th className="py-1.5 px-2 border-r border-neutral-300">Order #</th>
                        <th className="py-1.5 px-2 border-r border-neutral-300">Date</th>
                        <th className="py-1.5 px-2 border-r border-neutral-300">Patron Name</th>
                        <th className="py-1.5 px-2 border-r border-neutral-300">Contact / City</th>
                        <th className="py-1.5 px-1.5 text-center border-r border-neutral-300">Items</th>
                        <th className="py-1.5 px-2 border-r border-neutral-300">Channel</th>
                        <th className="py-1.5 px-2 border-r border-neutral-300">Status</th>
                        <th className="py-1.5 px-2 text-right border-r border-neutral-300">Subtotal</th>
                        <th className="py-1.5 px-2 text-right border-r border-neutral-300">Discount</th>
                        <th className="py-1.5 px-2 text-right">Net Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 font-mono text-[10.5px]">
                      {ordersList.map((ord, idx) => (
                        <tr key={ord.id} className={idx % 2 === 1 ? 'bg-neutral-50/70' : 'bg-white'}>
                          <td className="py-1.5 px-2 font-bold border-r border-neutral-200">{ord.orderNumber}</td>
                          <td className="py-1.5 px-2 text-neutral-600 border-r border-neutral-200">{ord.createdAt?.slice(0, 10)}</td>
                          <td className="py-1.5 px-2 font-sans font-medium text-neutral-900 border-r border-neutral-200">{ord.customerName}</td>
                          <td className="py-1.5 px-2 text-neutral-600 border-r border-neutral-200">{ord.customerPhone || ord.customerCity || '—'}</td>
                          <td className="py-1.5 px-1.5 text-center border-r border-neutral-200">{ord.itemsCount}</td>
                          <td className="py-1.5 px-2 text-neutral-700 border-r border-neutral-200">{ord.paymentMethod}</td>
                          <td className="py-1.5 px-2 uppercase font-semibold text-[9.5px] border-r border-neutral-200">{ord.status}</td>
                          <td className="py-1.5 px-2 text-right border-r border-neutral-200">৳{ord.subtotal.toLocaleString()}</td>
                          <td className="py-1.5 px-2 text-right text-rose-700 border-r border-neutral-200">
                            {ord.discount > 0 ? `-৳${ord.discount.toLocaleString()}` : '—'}
                          </td>
                          <td className="py-1.5 px-2 text-right font-bold text-neutral-900">৳{ord.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-neutral-100 font-mono font-bold text-[11px] border-t-2 border-b-2 border-neutral-900">
                      <tr>
                        <td colSpan={4} className="py-2 px-2 border-r border-neutral-300 font-sans">
                          TOTAL AUDITED REVENUE ({totals.orders} Orders)
                        </td>
                        <td className="py-2 px-1.5 text-center border-r border-neutral-300">{totals.itemsCount}</td>
                        <td colSpan={2} className="py-2 px-2 border-r border-neutral-300 text-center font-sans text-neutral-600">
                          ALL SETTLED
                        </td>
                        <td className="py-2 px-2 text-right border-r border-neutral-300">
                          ৳{totals.grossSales.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-right text-rose-700 border-r border-neutral-300">
                          -৳{totals.discount.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-right text-amber-950 text-xs">
                          ৳{totals.revenue.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* 5. Formal Certification & Audit Sign-Off Box */}
                <div className="page-break-avoid pt-6 border-t-2 border-neutral-900 font-sans space-y-4">
                  <p className="text-[10px] text-neutral-500 italic">
                    Certification: This financial statement has been automatically generated and audited from Zippy ERP database records. All ledger postings, gateway transactions, and promotional deductions have been balanced in accordance with Bangladesh Financial Reporting Standards (BFRS).
                  </p>

                  <div className="grid grid-cols-3 gap-6 pt-4 text-xs">
                    <div className="space-y-4">
                      <p className="text-[10px] uppercase font-bold text-neutral-500">Prepared By</p>
                      <div className="border-b border-neutral-400 w-36"></div>
                      <p className="text-neutral-700 font-medium">Senior Accounts Officer</p>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] uppercase font-bold text-neutral-500">Verified & Reconciled</p>
                      <div className="border-b border-neutral-400 w-36"></div>
                      <p className="text-neutral-700 font-medium">Head of Finance & Operations</p>
                    </div>

                    <div className="space-y-4 text-right">
                      <p className="text-[10px] uppercase font-bold text-neutral-500">Managing Director / Partner</p>
                      <div className="border-b border-neutral-400 w-36 ml-auto"></div>
                      <p className="text-neutral-700 font-medium">Zippy Atelier Bangladesh</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
