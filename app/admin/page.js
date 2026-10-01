'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import api from '../../src/lib/api';
import LuxurySpinner from '../../src/components/ui/LuxurySpinner';
import { useTheme } from '../../src/context/ThemeContext';
import {
  DollarSign,
  CalendarCheck,
  ShoppingBag,
  TrendingUp,
  Package,
  AlertTriangle,
  Users,
  Activity,
  ArrowRight,
  Calendar,
  Sparkles,
  Crown,
  Clock,
  MapPin,
  CheckCircle2,
  Phone,
  Eye,
  Layers,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const { isDarkMode } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePointIndex, setActivePointIndex] = useState(null);

  const fetchOverview = async () => {
    try {
      const res = await api.getDashboardOverview();
      if (res) setData(res);
    } catch (e) {
      console.warn('Failed to load dashboard overview', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading || !data) {
    return (
      <div className="py-32">
        <LuxurySpinner size="lg" text="Aggregating Daily Performance Metrics..." />
      </div>
    );
  }

  const { stats, upcomingEvents, recentBookings = [], recentRentals = [], recentActivityLogs = [], charts } = data;
  const dailyData = charts?.daily || [];

  // Calculate SVG curve geometry for luxury line chart
  const chartHeight = 240;
  const chartWidth = 700;
  const paddingX = 40;
  const paddingY = 30;

  const maxDailyRevenue = Math.max(...dailyData.map((d) => Math.max(d.revenue || 0, d.purchases || 0)), 500);

  // Compute (x, y) coordinates for revenue and purchases
  const points = dailyData.map((d, i) => {
    const x = paddingX + (i / Math.max(1, dailyData.length - 1)) * (chartWidth - 2 * paddingX);
    const yRev = chartHeight - paddingY - ((d.revenue || 0) / maxDailyRevenue) * (chartHeight - 2 * paddingY);
    const yPur = chartHeight - paddingY - ((d.purchases || 0) / maxDailyRevenue) * (chartHeight - 2 * paddingY);
    return { x, yRev, yPur, ...d };
  });

  // Helper to generate smooth cubic bezier SVG path
  const generateSmoothPath = (pts, key) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0][key]}`;

    let path = `M ${pts[0].x} ${pts[0][key]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1[key] + (p2[key] - p0[key]) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2[key] - (p3[key] - p1[key]) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2[key]}`;
    }
    return path;
  };

  const revenueLinePath = generateSmoothPath(points, 'yRev');
  const revenueAreaPath = points.length > 0
    ? `${revenueLinePath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
    : '';

  const purchasesLinePath = generateSmoothPath(points, 'yPur');

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-gold-400 text-[10px] uppercase tracking-[0.25em] font-semibold">
            <Crown className="w-3.5 h-3.5" />
            <span>Executive Studio Control</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-ivory-50 font-light">
            Daily Performance Dashboard
          </h1>
          <p className="text-xs text-ivory-400 font-light mt-0.5">
            Real-time daily operations, rental dispatches, and bespoke gallery commissions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/rentals"
            className="px-4 py-2.5 bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 rounded-full text-xs uppercase tracking-wider font-bold hover:brightness-110 transition-all shadow-md flex items-center space-x-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Rental Orders</span>
          </Link>
          <Link
            href="/admin/gallery"
            className="px-4 py-2.5 bg-[#14141E] border border-gold-500/30 text-ivory-50 rounded-full text-xs uppercase tracking-wider font-semibold hover:border-gold-500 transition-colors shadow-sm flex items-center space-x-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-gold-400" />
            <span>Gallery Orders</span>
          </Link>
        </div>
      </div>

      {/* DAILY KPI METRIC CARDS (TODAY'S METRICS ONLY) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Today's Total Revenue */}
        <div className="bg-[#0D0D12] border border-gold-500/20 rounded-3xl p-6 shadow-xl hover:border-gold-500/40 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 px-3 py-1 bg-gold-500/20 text-gold-300 border-b border-l border-gold-500/30 text-[9px] uppercase font-bold tracking-widest rounded-bl-xl">
            Today's Data
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-ivory-400">
              Today's Revenue
            </span>
            <div className="p-2.5 bg-gold-500/10 text-gold-400 border border-gold-500/20 rounded-2xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-serif text-3xl font-bold text-ivory-50 group-hover:text-gold-300 transition-colors">
              PKR {(stats.todayRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-emerald-400 font-medium mt-1">
              Today's Net Profit: PKR {(stats.todayNetProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Today's Rental Revenue */}
        <div className="bg-[#0D0D12] border border-gold-500/20 rounded-3xl p-6 shadow-xl hover:border-gold-500/40 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 px-3 py-1 bg-purple-950/60 text-purple-300 border-b border-l border-purple-500/30 text-[9px] uppercase font-bold tracking-widest rounded-bl-xl">
            Today's Rentals
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-ivory-400">
              Today's Rentals
            </span>
            <div className="p-2.5 bg-purple-950/40 text-purple-400 border border-purple-500/20 rounded-2xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-serif text-3xl font-bold text-ivory-50 group-hover:text-gold-300 transition-colors">
              PKR {(stats.todayRentalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-ivory-400 font-medium mt-1">
              {stats.todayRentalsCount || 0} rental request(s) placed today
            </p>
          </div>
        </div>

        {/* Today's Sales & Bookings */}
        <div className="bg-[#0D0D12] border border-gold-500/20 rounded-3xl p-6 shadow-xl hover:border-gold-500/40 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 px-3 py-1 bg-gold-950/60 text-gold-300 border-b border-l border-gold-500/30 text-[9px] uppercase font-bold tracking-widest rounded-bl-xl">
            Today's Orders
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-ivory-400">
              Today's Orders
            </span>
            <div className="p-2.5 bg-gold-500/10 text-gold-400 border border-gold-500/20 rounded-2xl">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-serif text-3xl font-bold text-ivory-50 group-hover:text-gold-300 transition-colors">
              {stats.todayOrdersCount || 0}
            </h3>
            <p className="text-[11px] text-gold-400/90 font-medium mt-1">
              Sales: PKR {(stats.todaySalesRevenue || 0).toFixed(2)} • Bookings: PKR {(stats.todayBookingRevenue || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Today's Procurement Expenses */}
        <div className="bg-[#0D0D12] border border-gold-500/20 rounded-3xl p-6 shadow-xl hover:border-gold-500/40 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 px-3 py-1 bg-amber-950/60 text-amber-300 border-b border-l border-amber-500/30 text-[9px] uppercase font-bold tracking-widest rounded-bl-xl">
            Today's Purchases
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-ivory-400">
              Today's Purchases
            </span>
            <div className="p-2.5 bg-amber-950/40 text-amber-400 border border-amber-500/20 rounded-2xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-serif text-3xl font-bold text-ivory-50 group-hover:text-gold-300 transition-colors">
              PKR {(stats.todayPurchaseExpenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-ivory-400 font-medium mt-1">
              {stats.todayPurchasesCount || 0} procurement order(s) today
            </p>
          </div>
        </div>
      </div>

      {/* LUXURIOUS DAILY REVENUE & OPERATIONAL TIMELINE (CURVED BEZIER WAVE CHART) */}
      <div className="bg-[#0D0D12] border border-gold-500/20 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-gold-400 text-[10px] uppercase tracking-widest font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Daily Financials & Performance Timeline</span>
            </div>
            <h3 className="font-serif text-2xl text-ivory-50 font-light mt-0.5">
              Daily Revenue & Operational Curve
            </h3>
            <p className="text-xs text-ivory-400 font-light">
              Continuous day-by-day telemetry of rental earnings, direct sales, and procurement costs.
            </p>
          </div>

          <div className="flex items-center space-x-5 text-xs font-semibold">
            <span className="flex items-center text-gold-400">
              <span className="w-3 h-3 rounded-full bg-gold-500 ring-4 ring-gold-500/20 inline-block mr-2 shadow-sm" />
              Daily Revenue
            </span>
            <span className="flex items-center text-ivory-400">
              <span className="w-3 h-3 rounded-full bg-ivory-600 inline-block mr-2" />
              Daily Purchases
            </span>
          </div>
        </div>

        {/* Interactive Luxury SVG Curved Area / Line Chart */}
        <div className="relative w-full overflow-x-auto">
          <div className="min-w-[640px] relative">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-64 overflow-visible select-none"
            >
              <defs>
                {/* Gold glowing gradient area fill */}
                <linearGradient id="goldCurveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.4" />
                  <stop offset="60%" stopColor="#D4AF37" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                </linearGradient>

                {/* Shimmer stroke gradient */}
                <linearGradient id="goldStrokeGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#B38728" />
                  <stop offset="50%" stopColor="#FBF5B7" />
                  <stop offset="100%" stopColor="#DAA520" />
                </linearGradient>

                {/* Soft shadow filter */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#D4AF37" floodOpacity="0.5" />
                </filter>
              </defs>

              {/* Horizontal Gridlines & Y-Axis Reference */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                const y = paddingY + pct * (chartHeight - 2 * paddingY);
                const val = Math.round(maxDailyRevenue * (1 - pct));
                return (
                  <g key={i}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke={isDarkMode ? '#22222E' : '#EAE0D2'}
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 8}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="9"
                      fill={isDarkMode ? '#8E8EA0' : '#7A6F60'}
                      fontFamily="monospace"
                    >
                      ${val}
                    </text>
                  </g>
                );
              })}

              {/* Area Fill Under Revenue Curve */}
              {revenueAreaPath && (
                <path d={revenueAreaPath} fill="url(#goldCurveGrad)" />
              )}

              {/* Purchases Line */}
              {purchasesLinePath && (
                <path
                  d={purchasesLinePath}
                  fill="none"
                  stroke={isDarkMode ? '#6B7280' : '#8C7D6B'}
                  strokeWidth="2"
                  strokeDasharray="3 3"
                  opacity="0.75"
                />
              )}

              {/* Revenue Shimmering Curved Line */}
              {revenueLinePath && (
                <path
                  d={revenueLinePath}
                  fill="none"
                  stroke="url(#goldStrokeGrad)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter="url(#glow)"
                />
              )}

              {/* Data Nodes & Timeline Connectors */}
              {points.map((pt, idx) => {
                const isHovered = activePointIndex === idx;

                return (
                  <g key={idx} className="cursor-pointer">
                    {/* Vertical timeline dashed guide */}
                    <line
                      x1={pt.x}
                      y1={paddingY}
                      x2={pt.x}
                      y2={chartHeight - paddingY}
                      stroke={isHovered ? '#D4AF37' : isDarkMode ? '#2A2A38' : '#DED5C8'}
                      strokeWidth={isHovered ? '1.5' : '1'}
                      strokeDasharray="2 2"
                      opacity={isHovered ? 1 : 0.6}
                    />

                    {/* Revenue Glowing Node */}
                    <circle
                      cx={pt.x}
                      cy={pt.yRev}
                      r={isHovered ? '7' : '5'}
                      fill={isDarkMode ? '#0D0D12' : '#FFFFFF'}
                      stroke="#E5A83B"
                      strokeWidth="2.5"
                      className="transition-all duration-200"
                    />
                    {isHovered && (
                      <circle
                        cx={pt.x}
                        cy={pt.yRev}
                        r="12"
                        fill="none"
                        stroke="#E5A83B"
                        strokeWidth="1.5"
                        className="animate-ping"
                      />
                    )}

                    {/* Purchases Node */}
                    <circle
                      cx={pt.x}
                      cy={pt.yPur}
                      r="3.5"
                      fill={isDarkMode ? '#9CA3AF' : '#8C7D6B'}
                    />

                    {/* Invisible Hitbox for smooth hover */}
                    <rect
                      x={pt.x - 30}
                      y={0}
                      width="60"
                      height={chartHeight}
                      fill="transparent"
                      onMouseEnter={() => setActivePointIndex(idx)}
                      onMouseLeave={() => setActivePointIndex(null)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Card */}
            {activePointIndex !== null && points[activePointIndex] && (
              <div
                className="absolute z-30 pointer-events-none transform -translate-x-1/2 transition-all duration-150"
                style={{
                  left: `${(points[activePointIndex].x / chartWidth) * 100}%`,
                  top: `${Math.max(10, points[activePointIndex].yRev - 95)}px`,
                }}
              >
                <div className={`${
                  isDarkMode ? 'bg-[#14141E]/95 text-ivory-50' : 'bg-white text-obsidian-950 shadow-luxury'
                } border border-gold-500/60 rounded-2xl p-3 shadow-2xl backdrop-blur-md min-w-[170px] text-xs`}>
                  <div className="flex justify-between items-center border-b border-gold-500/20 pb-1.5 mb-1.5">
                    <span className="font-bold text-gold-500">{points[activePointIndex].day}</span>
                    <span className={`text-[10px] ${isDarkMode ? 'text-ivory-400' : 'text-obsidian-500'} font-mono`}>{points[activePointIndex].date}</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-ivory-400' : 'text-obsidian-600'}>Total Revenue:</span>
                      <strong className="text-gold-600 dark:text-gold-300 font-mono">PKR {(points[activePointIndex].revenue || 0).toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-ivory-400' : 'text-obsidian-600'}>Rentals Income:</span>
                      <span className="text-purple-600 dark:text-purple-300 font-mono">PKR {(points[activePointIndex].rentals || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-ivory-400' : 'text-obsidian-600'}>Purchases Spend:</span>
                      <span className="text-amber-600 dark:text-amber-300 font-mono">PKR {(points[activePointIndex].purchases || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-gold-500/20 pt-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>Net Margin:</span>
                      <span className="font-mono">PKR {(points[activePointIndex].profit || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Timeline Day Badges */}
          <div className="flex justify-between pt-2 px-6 border-t border-white/10">
            {dailyData.map((d, i) => (
              <div
                key={i}
                onMouseEnter={() => setActivePointIndex(i)}
                onMouseLeave={() => setActivePointIndex(null)}
                className={`text-center cursor-pointer transition-all ${
                  activePointIndex === i ? 'scale-110 font-bold text-gold-400' : 'text-ivory-400'
                }`}
              >
                <span className="block text-[11px] font-mono font-semibold">{d.day}</span>
                <span className="block text-[9px] text-ivory-500">PKR {(d.revenue || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TWO SEPARATE PIPELINES: RENTAL ORDERS VS GALLERY/BESPOKE BOOKINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SECTION 1: LIVE RENTAL ORDERS PIPELINE (Dedicated Section) */}
        <div className="lg:col-span-6 bg-[#0D0D12] border border-gold-500/20 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-950/40 text-purple-400 border border-purple-500/20 rounded-xl">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-xl text-ivory-50 font-medium">
                  Live Rental Orders Pipeline
                </h3>
                <p className="text-[11px] text-ivory-400">Hourly & daily decor piece dispatches</p>
              </div>
            </div>
            <Link
              href="/admin/rentals"
              className="text-xs uppercase tracking-wider text-gold-400 font-bold hover:underline flex items-center"
            >
              <span>Manage Rentals</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="divide-y divide-white/10">
            {recentRentals.length === 0 ? (
              <p className="text-xs text-ivory-400 py-6 text-center">No rental orders placed yet.</p>
            ) : (
              recentRentals.map((r) => {
                const isHourly = r.rentalMode === 'HOURLY';
                const itemsCount = (r.items || []).reduce((sum, i) => sum + (i.quantity || 1), 0);

                return (
                  <div key={r.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-gold-400">{r.rentalNumber}</span>
                        <span className="font-serif text-sm font-semibold text-ivory-100 truncate">
                          {r.customerName}
                        </span>
                      </div>
                      <p className="text-xs text-ivory-400 truncate">
                        {itemsCount} item(s) • {isHourly ? `Hourly (${r.rentalHours || 4}h)` : 'Daily Rental'}
                      </p>
                      <p className="text-[10px] text-ivory-500">
                        {new Date(r.eventDate).toLocaleDateString()} to {new Date(r.returnDate).toLocaleDateString()} • <strong className="text-gold-300">PKR {r.totalAmount.toFixed(2)}</strong>
                      </p>
                    </div>

                    <div className="flex flex-col items-end space-y-1.5 flex-shrink-0">
                      <span
                        className={`text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                          r.status === 'APPROVED' || r.status === 'RETURNED'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                            : r.status === 'PENDING'
                            ? 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                            : r.status === 'RENTED'
                            ? 'bg-gold-950/60 text-gold-300 border-gold-500/30'
                            : 'bg-red-950/60 text-red-300 border-red-500/30'
                        }`}
                      >
                        {r.status}
                      </span>
                      <Link
                        href="/admin/rentals"
                        className="text-[10px] text-gold-400 font-semibold hover:underline flex items-center"
                      >
                        <Eye className="w-3 h-3 mr-0.5" />
                        <span>View Details</span>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* SECTION 2: GALLERY & BESPOKE EVENT BOOKINGS (Dedicated Section) */}
        <div className="lg:col-span-6 bg-[#0D0D12] border border-gold-500/20 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gold-500/10 text-gold-400 border border-gold-500/20 rounded-xl">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-xl text-ivory-50 font-medium">
                  Gallery & Bespoke Event Bookings
                </h3>
                <p className="text-[11px] text-ivory-400">Luxury weddings & full stage productions</p>
              </div>
            </div>
            <Link
              href="/admin/gallery"
              className="text-xs uppercase tracking-wider text-gold-400 font-bold hover:underline flex items-center"
            >
              <span>Manage Gallery Orders</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="divide-y divide-white/10">
            {recentBookings.length === 0 ? (
              <p className="text-xs text-ivory-400 py-6 text-center">No event bookings requested yet.</p>
            ) : (
              recentBookings.map((b) => (
                <div key={b.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-serif text-sm font-semibold text-ivory-100 truncate">
                        {b.customerName}
                      </span>
                      <span className="text-[10px] text-gold-400 font-bold uppercase">
                        • {b.eventType}
                      </span>
                    </div>
                    <p className="text-xs text-ivory-400 truncate flex items-center">
                      <MapPin className="w-3 h-3 text-gold-400 mr-1 flex-shrink-0" />
                      <span>{b.venue}</span>
                    </p>
                    <p className="text-[10px] text-ivory-500">
                      {new Date(b.eventDate).toLocaleDateString()} • <strong className="text-gold-300">PKR {b.totalAmount.toLocaleString()}</strong> ({b.guestCount || 50} guests)
                    </p>
                  </div>

                  <span
                    className={`flex-shrink-0 text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full border ${
                      b.status === 'CONFIRMED'
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                        : b.status === 'PENDING'
                        ? 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                        : 'bg-gold-950/60 text-gold-300 border-gold-500/30'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Upcoming Setups & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 bg-[#0D0D12] border border-gold-500/20 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-serif text-lg text-ivory-50 font-medium">
              Upcoming Venue Setups
            </h3>
            <Link href="/admin/events" className="text-xs uppercase tracking-wider text-gold-400 font-bold hover:underline">
              Calendar
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-xs text-ivory-400 py-4 text-center">No scheduled events in the next 30 days.</p>
            ) : (
              upcomingEvents.map((ev) => (
                <div key={ev.id} className="p-3.5 bg-[#14141E] rounded-2xl border border-gold-500/20 space-y-1">
                  <div className="flex justify-between items-start">
                    <h5 className="font-serif text-sm font-semibold text-ivory-100">{ev.title}</h5>
                    <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/30">
                      {ev.status}
                    </span>
                  </div>
                  <p className="text-xs text-ivory-400 font-light flex items-center">
                    <Calendar className="w-3 h-3 text-gold-400 mr-1.5" />
                    {new Date(ev.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {ev.venue}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-6 bg-[#0D0D12] border border-gold-500/20 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-serif text-lg text-ivory-50 font-medium">
              Live Activity Audit
            </h3>
            <Link href="/admin/activity-logs" className="text-xs uppercase tracking-wider text-gold-400 font-bold hover:underline">
              All Logs
            </Link>
          </div>
          <div className="space-y-2.5">
            {recentActivityLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="text-xs border-b border-white/10 pb-2 last:border-0 space-y-0.5">
                <div className="flex justify-between text-ivory-400 text-[10px]">
                  <span className="font-semibold text-gold-400">{log.userName}</span>
                  <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-ivory-300 font-light">{log.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
