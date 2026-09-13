'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import api from '../../src/lib/api';
import LuxurySpinner from '../../src/components/ui/LuxurySpinner';
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
          <div className="inline-flex items-center space-x-2 text-gold-700 text-[10px] uppercase tracking-[0.25em] font-semibold">
            <Crown className="w-3.5 h-3.5" />
            <span>Executive Studio Control</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-obsidian-950 font-light">
            Daily Performance Dashboard
          </h1>
          <p className="text-xs text-obsidian-500 font-light mt-0.5">
            Real-time daily operations, rental dispatches, and bespoke gallery commissions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/rentals"
            className="px-4 py-2.5 bg-gold-500 text-obsidian-950 rounded-full text-xs uppercase tracking-wider font-bold hover:brightness-110 transition-all shadow-sm flex items-center space-x-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Rental Orders</span>
          </Link>
          <Link
            href="/admin/gallery"
            className="px-4 py-2.5 bg-obsidian-950 text-ivory-50 rounded-full text-xs uppercase tracking-wider font-semibold hover:bg-gold-600 transition-colors shadow-sm flex items-center space-x-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-gold-400" />
            <span>Gallery Orders</span>
          </Link>
        </div>
      </div>

      {/* DAILY KPI METRIC CARDS (TODAY'S METRICS ONLY) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Today's Total Revenue */}
        <div className="bg-white border border-champagne-300/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 px-3 py-1 bg-gold-500/20 text-gold-800 text-[9px] uppercase font-bold tracking-widest rounded-bl-xl">
            Today's Data
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-obsidian-500">
              Today's Revenue
            </span>
            <div className="p-2.5 bg-gold-500/10 text-gold-700 rounded-2xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-serif text-3xl font-bold text-obsidian-950">
              PKR {(stats.todayRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-sage-700 font-medium mt-1">
              Today's Net Profit: PKR {(stats.todayNetProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Today's Rental Revenue */}
        <div className="bg-white border border-champagne-300/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 px-3 py-1 bg-purple-100 text-purple-800 text-[9px] uppercase font-bold tracking-widest rounded-bl-xl">
            Today's Rentals
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-obsidian-500">
              Today's Rentals
            </span>
            <div className="p-2.5 bg-champagne-200 text-gold-800 rounded-2xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-serif text-3xl font-bold text-obsidian-950">
              PKR {(stats.todayRentalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-obsidian-600 font-medium mt-1">
              {stats.todayRentalsCount || 0} rental request(s) placed today
            </p>
          </div>
        </div>

        {/* Today's Sales & Bookings */}
        <div className="bg-white border border-champagne-300/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 px-3 py-1 bg-champagne-200 text-obsidian-800 text-[9px] uppercase font-bold tracking-widest rounded-bl-xl">
            Today's Orders
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-obsidian-500">
              Today's Orders
            </span>
            <div className="p-2.5 bg-champagne-200 text-obsidian-900 rounded-2xl">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-serif text-3xl font-bold text-obsidian-950">
              {stats.todayOrdersCount || 0}
            </h3>
            <p className="text-[11px] text-gold-700 font-medium mt-1">
              Sales: PKR {(stats.todaySalesRevenue || 0).toFixed(2)} • Bookings: PKR {(stats.todayBookingRevenue || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Today's Procurement Expenses */}
        <div className="bg-white border border-champagne-300/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 px-3 py-1 bg-amber-100 text-amber-800 text-[9px] uppercase font-bold tracking-widest rounded-bl-xl">
            Today's Purchases
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-obsidian-500">
              Today's Purchases
            </span>
            <div className="p-2.5 bg-amber-50 text-amber-700 rounded-2xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="font-serif text-3xl font-bold text-obsidian-950">
              PKR {(stats.todayPurchaseExpenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-obsidian-500 font-medium mt-1">
              {stats.todayPurchasesCount || 0} procurement order(s) today
            </p>
          </div>
        </div>
      </div>

      {/* LUXURIOUS DAILY REVENUE & OPERATIONAL TIMELINE (CURVED BEZIER WAVE CHART) */}
      <div className="bg-gradient-to-b from-white via-ivory-50/50 to-champagne-50/40 border border-champagne-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-champagne-200/80 pb-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-gold-700 text-[10px] uppercase tracking-widest font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Daily Financials & Performance Timeline</span>
            </div>
            <h3 className="font-serif text-2xl text-obsidian-950 font-light mt-0.5">
              Daily Revenue & Operational Curve
            </h3>
            <p className="text-xs text-obsidian-500 font-light">
              Continuous day-by-day telemetry of rental earnings, direct sales, and procurement costs.
            </p>
          </div>

          <div className="flex items-center space-x-5 text-xs font-semibold">
            <span className="flex items-center text-gold-700">
              <span className="w-3 h-3 rounded-full bg-gold-500 ring-4 ring-gold-500/20 inline-block mr-2 shadow-sm" />
              Daily Revenue
            </span>
            <span className="flex items-center text-obsidian-700">
              <span className="w-3 h-3 rounded-full bg-obsidian-800 inline-block mr-2" />
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
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.35" />
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
                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#D4AF37" floodOpacity="0.4" />
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
                      stroke="#E5DCCB"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 8}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="9"
                      fill="#8C8275"
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
                  stroke="#2D2823"
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
                      stroke={isHovered ? '#D4AF37' : '#E5DCCB'}
                      strokeWidth={isHovered ? '1.5' : '1'}
                      strokeDasharray="2 2"
                      opacity={isHovered ? 1 : 0.4}
                    />

                    {/* Revenue Glowing Node */}
                    <circle
                      cx={pt.x}
                      cy={pt.yRev}
                      r={isHovered ? '7' : '5'}
                      fill="#FFFFFF"
                      stroke="#B38728"
                      strokeWidth="2.5"
                      className="transition-all duration-200"
                    />
                    {isHovered && (
                      <circle
                        cx={pt.x}
                        cy={pt.yRev}
                        r="12"
                        fill="none"
                        stroke="#D4AF37"
                        strokeWidth="1.5"
                        className="animate-ping"
                      />
                    )}

                    {/* Purchases Node */}
                    <circle
                      cx={pt.x}
                      cy={pt.yPur}
                      r="3.5"
                      fill="#2D2823"
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
                <div className="bg-obsidian-950/95 text-ivory-50 border border-gold-500/60 rounded-2xl p-3 shadow-2xl backdrop-blur-md min-w-[170px] text-xs">
                  <div className="flex justify-between items-center border-b border-gold-500/20 pb-1.5 mb-1.5">
                    <span className="font-bold text-gold-400">{points[activePointIndex].day}</span>
                    <span className="text-[10px] text-obsidian-400 font-mono">{points[activePointIndex].date}</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-obsidian-400">Total Revenue:</span>
                      <strong className="text-gold-300 font-mono">PKR {(points[activePointIndex].revenue || 0).toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-obsidian-400">Rentals Income:</span>
                      <span className="text-purple-300 font-mono">PKR {(points[activePointIndex].rentals || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-obsidian-400">Purchases Spend:</span>
                      <span className="text-red-300 font-mono">PKR {(points[activePointIndex].purchases || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-1 text-emerald-400 font-bold">
                      <span>Net Margin:</span>
                      <span className="font-mono">PKR {(points[activePointIndex].profit || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Timeline Day Badges */}
          <div className="flex justify-between pt-2 px-6 border-t border-champagne-200">
            {dailyData.map((d, i) => (
              <div
                key={i}
                onMouseEnter={() => setActivePointIndex(i)}
                onMouseLeave={() => setActivePointIndex(null)}
                className={`text-center cursor-pointer transition-all ${
                  activePointIndex === i ? 'scale-110 font-bold text-gold-700' : 'text-obsidian-600'
                }`}
              >
                <span className="block text-[11px] font-mono font-semibold">{d.day}</span>
                <span className="block text-[9px] text-obsidian-400">PKR {(d.revenue || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TWO SEPARATE PIPELINES: RENTAL ORDERS VS GALLERY/BESPOKE BOOKINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SECTION 1: LIVE RENTAL ORDERS PIPELINE (Dedicated Section) */}
        <div className="lg:col-span-6 bg-white border border-champagne-300/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-champagne-200 pb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 text-purple-800 rounded-xl">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-xl text-obsidian-950 font-medium">
                  Live Rental Orders Pipeline
                </h3>
                <p className="text-[11px] text-obsidian-500">Hourly & daily decor piece dispatches</p>
              </div>
            </div>
            <Link
              href="/admin/rentals"
              className="text-xs uppercase tracking-wider text-gold-700 font-bold hover:underline flex items-center"
            >
              <span>Manage Rentals</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="divide-y divide-champagne-200">
            {recentRentals.length === 0 ? (
              <p className="text-xs text-obsidian-500 py-6 text-center">No rental orders placed yet.</p>
            ) : (
              recentRentals.map((r) => {
                const isHourly = r.rentalMode === 'HOURLY';
                const itemsCount = (r.items || []).reduce((sum, i) => sum + (i.quantity || 1), 0);

                return (
                  <div key={r.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-gold-700">{r.rentalNumber}</span>
                        <span className="font-serif text-sm font-semibold text-obsidian-950 truncate">
                          {r.customerName}
                        </span>
                      </div>
                      <p className="text-xs text-obsidian-500 truncate">
                        {itemsCount} item(s) • {isHourly ? `Hourly (${r.rentalHours || 4}h)` : 'Daily Rental'}
                      </p>
                      <p className="text-[10px] text-obsidian-400">
                        {new Date(r.eventDate).toLocaleDateString()} to {new Date(r.returnDate).toLocaleDateString()} • <strong className="text-obsidian-900">PKR {r.totalAmount.toFixed(2)}</strong>
                      </p>
                    </div>

                    <div className="flex flex-col items-end space-y-1.5 flex-shrink-0">
                      <span
                        className={`text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                          r.status === 'APPROVED' || r.status === 'RETURNED'
                            ? 'bg-sage-100 text-sage-800 border-sage-300'
                            : r.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : r.status === 'RENTED'
                            ? 'bg-gold-100 text-gold-900 border-gold-300'
                            : 'bg-red-100 text-red-800 border-red-300'
                        }`}
                      >
                        {r.status}
                      </span>
                      <Link
                        href="/admin/rentals"
                        className="text-[10px] text-gold-700 font-semibold hover:underline flex items-center"
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
        <div className="lg:col-span-6 bg-white border border-champagne-300/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-champagne-200 pb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gold-500/10 text-gold-700 rounded-xl">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-xl text-obsidian-950 font-medium">
                  Gallery & Bespoke Event Bookings
                </h3>
                <p className="text-[11px] text-obsidian-500">Luxury weddings & full stage productions</p>
              </div>
            </div>
            <Link
              href="/admin/gallery"
              className="text-xs uppercase tracking-wider text-gold-700 font-bold hover:underline flex items-center"
            >
              <span>Manage Gallery Orders</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="divide-y divide-champagne-200">
            {recentBookings.length === 0 ? (
              <p className="text-xs text-obsidian-500 py-6 text-center">No event bookings requested yet.</p>
            ) : (
              recentBookings.map((b) => (
                <div key={b.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-serif text-sm font-semibold text-obsidian-950 truncate">
                        {b.customerName}
                      </span>
                      <span className="text-[10px] text-gold-700 font-bold uppercase">
                        • {b.eventType}
                      </span>
                    </div>
                    <p className="text-xs text-obsidian-500 truncate flex items-center">
                      <MapPin className="w-3 h-3 text-gold-600 mr-1 flex-shrink-0" />
                      <span>{b.venue}</span>
                    </p>
                    <p className="text-[10px] text-obsidian-400">
                      {new Date(b.eventDate).toLocaleDateString()} • <strong className="text-obsidian-900">PKR {b.totalAmount.toLocaleString()}</strong> ({b.guestCount || 50} guests)
                    </p>
                  </div>

                  <span
                    className={`flex-shrink-0 text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full border ${
                      b.status === 'CONFIRMED'
                        ? 'bg-sage-100 text-sage-800 border-sage-300'
                        : b.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-champagne-200 text-obsidian-800 border-champagne-300'
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
        <div className="lg:col-span-6 bg-white border border-champagne-300/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg text-obsidian-950 font-medium">
              Upcoming Venue Setups
            </h3>
            <Link href="/admin/events" className="text-xs uppercase tracking-wider text-gold-700 font-bold hover:underline">
              Calendar
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-xs text-obsidian-500 py-4 text-center">No scheduled events in the next 30 days.</p>
            ) : (
              upcomingEvents.map((ev) => (
                <div key={ev.id} className="p-3.5 bg-champagne-50/70 rounded-2xl border border-champagne-300/60 space-y-1">
                  <div className="flex justify-between items-start">
                    <h5 className="font-serif text-sm font-semibold text-obsidian-900">{ev.title}</h5>
                    <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-champagne-200 text-obsidian-800">
                      {ev.status}
                    </span>
                  </div>
                  <p className="text-xs text-obsidian-600 font-light flex items-center">
                    <Calendar className="w-3 h-3 text-gold-600 mr-1.5" />
                    {new Date(ev.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {ev.venue}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-6 bg-white border border-champagne-300/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg text-obsidian-950 font-medium">
              Live Activity Audit
            </h3>
            <Link href="/admin/activity-logs" className="text-xs uppercase tracking-wider text-gold-700 font-bold hover:underline">
              All Logs
            </Link>
          </div>
          <div className="space-y-2.5">
            {recentActivityLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="text-xs border-b border-champagne-200 pb-2 last:border-0 space-y-0.5">
                <div className="flex justify-between text-obsidian-400 text-[10px]">
                  <span className="font-semibold text-gold-700">{log.userName}</span>
                  <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-obsidian-800 font-light">{log.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
