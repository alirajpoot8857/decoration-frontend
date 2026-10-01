'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import api from '../../../src/lib/api';
import { useToast } from '../../../src/context/ToastContext';
import { useConfirmModal } from '../../../src/context/ConfirmModalContext';
import LuxurySpinner from '../../../src/components/ui/LuxurySpinner';
import AdminInfiniteTableFooter, { useInfiniteTable } from '../../../src/components/ui/AdminInfiniteTable';
import useBodyScrollLock from '../../../src/hooks/useBodyScrollLock';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
  Calendar,
  DollarSign,
  ShieldCheck,
  PackageCheck,
  Tag,
  MapPin,
  User,
  Mail,
  Phone,
  MessageCircle,
  Eye,
  X,
  Sparkles,
  ArrowRight,
  Filter,
  Layers,
  RefreshCw,
  AlertTriangle,
  Package,
  Boxes,
  Plus,
  Trash2,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Flower Bouquets',
  'Cakes & Chocolates',
  'Gifts',
  'Stage décor',
  'Backdrops',
  'Arches',
  'Lighting',
  'Decorative props',
];

export default function AdminRentalsPage() {
  const { showToast } = useToast();
  const { confirmDelete } = useConfirmModal();
  
  // Tab State: 'ORDERS' | 'INVENTORY'
  const [activeTab, setActiveTab] = useState('ORDERS');

  // Orders State
  const [rentals, setRentals] = useState([]);
  const [loadingRentals, setLoadingRentals] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All'); // 'Today' | 'Yesterday' | 'Last 7 Days' | 'All'
  const [searchQuery, setSearchQuery] = useState('');
  const [updating, setUpdating] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);

  // Inventory & Summary State
  const [summary, setSummary] = useState(null);
  const [catalogItems, setCatalogItems] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [inventoryCategory, setInventoryCategory] = useState('All');
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryStockFilter, setInventoryStockFilter] = useState('ALL'); // 'ALL' | 'LOW' | 'OUT' | 'AVAILABLE'

  // Quick Stock Adjust Modal State
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState(null);
  const [adjustDelta, setAdjustDelta] = useState(10);
  const [adjustReason, setAdjustReason] = useState('Inventory Restock');
  const [adjusting, setAdjusting] = useState(false);

  useBodyScrollLock(Boolean(selectedRental || (adjustModalOpen && adjustingItem)));

  // Fetch summary & catalog items
  const fetchSummaryAndCatalog = async () => {
    setLoadingCatalog(true);
    try {
      const [sumRes, itemsRes] = await Promise.all([
        api.getRentalSummary(),
        api.getRentalItems({ includeInactive: 'true' }),
      ]);
      if (sumRes?.summary) setSummary(sumRes.summary);
      if (itemsRes?.items) setCatalogItems(itemsRes.items);
    } catch (e) {
      console.warn('Failed to load rental summary or catalog', e);
    } finally {
      setLoadingCatalog(false);
    }
  };

  // Fetch rental requests / orders
  const fetchRentals = async () => {
    setLoadingRentals(true);
    try {
      const res = await api.getRentalRequests({
        status: statusFilter === 'All' ? undefined : statusFilter,
        search: searchQuery || undefined,
      });
      if (res.rentalRequests) setRentals(res.rentalRequests);
    } catch (e) {
      console.warn('Failed to load rentals', e);
    } finally {
      setLoadingRentals(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchSummaryAndCatalog();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdating(true);
    try {
      await api.updateRentalRequestStatus(id, { status: newStatus });
      showToast(`Rental order #${selectedRental?.rentalNumber || id} marked as ${newStatus}. Inventory stock synchronized!`, 'success');
      await Promise.all([fetchRentals(), fetchSummaryAndCatalog()]);
      if (selectedRental && selectedRental.id === id) {
        setSelectedRental((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (e) {
      showToast(e.message || 'Failed to update rental status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteRental = (id, rentalNumber) => {
    confirmDelete({
      title: 'Delete Rental Request?',
      message: 'Are you sure you want to delete this rental request? Any reserved stock will be automatically released back to available inventory.',
      itemName: rentalNumber ? `Rental Request #${rentalNumber}` : undefined,
      confirmText: 'Delete Permanently',
      onConfirm: async () => {
        setUpdating(true);
        try {
          await api.deleteRentalRequest(id);
          showToast(`Rental request #${rentalNumber} deleted and inventory stock restored!`, 'success');
          if (selectedRental?.id === id) setSelectedRental(null);
          await Promise.all([fetchRentals(), fetchSummaryAndCatalog()]);
        } catch (e) {
          showToast(e.message || 'Failed to delete rental request', 'error');
          throw e;
        } finally {
          setUpdating(false);
        }
      },
    });
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    if (!adjustingItem) return;
    setAdjusting(true);
    try {
      const delta = Number(adjustDelta) || 0;
      const newTotal = Math.max(0, adjustingItem.totalQuantity + delta);
      const newAvailable = Math.max(0, adjustingItem.availableQuantity + delta);
      
      await api.updateRentalItem(adjustingItem.id, {
        totalQuantity: newTotal,
        availableQuantity: newAvailable,
      });

      showToast(`Adjusted stock for "${adjustingItem.name}" by ${delta > 0 ? '+' : ''}${delta} units. New available: ${newAvailable}`, 'success');
      setAdjustModalOpen(false);
      await fetchSummaryAndCatalog();
    } catch (e) {
      showToast(e.message || 'Failed to adjust stock', 'error');
    } finally {
      setAdjusting(false);
    }
  };

  // Filter rentals by date if selected
  const filteredRentals = useMemo(() => {
    return rentals.filter((r) => {
      if (dateFilter === 'All') return true;
      const createdAt = new Date(r.createdAt);
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
      const startOf7Days = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);

      if (dateFilter === 'Today') return createdAt >= startOfToday;
      if (dateFilter === 'Yesterday') return createdAt >= startOfYesterday && createdAt < startOfToday;
      if (dateFilter === 'Last 7 Days') return createdAt >= startOf7Days;
      return true;
    });
  }, [rentals, dateFilter]);

  // Filter catalog inventory items
  const filteredCatalogItems = useMemo(() => {
    let result = [...catalogItems];

    if (inventoryCategory !== 'All') {
      result = result.filter((i) => i.category === inventoryCategory);
    }

    if (inventorySearch.trim()) {
      const q = inventorySearch.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          (i.slug && i.slug.toLowerCase().includes(q))
      );
    }

    if (inventoryStockFilter === 'LOW') {
      result = result.filter((i) => i.availableQuantity > 0 && i.availableQuantity <= 5);
    } else if (inventoryStockFilter === 'OUT') {
      result = result.filter((i) => i.availableQuantity <= 0 || i.status === 'OUT_OF_STOCK');
    } else if (inventoryStockFilter === 'AVAILABLE') {
      result = result.filter((i) => i.availableQuantity > 0 && i.status !== 'OUT_OF_STOCK');
    }

    return result;
  }, [catalogItems, inventoryCategory, inventorySearch, inventoryStockFilter]);

  // Dynamic stock calculations from catalogItems if summary is loading
  const dynamicTotalStock = summary?.totalStock ?? catalogItems.reduce((s, i) => s + (i.totalQuantity || 0), 0);
  const dynamicAvailableStock = summary?.availableStock ?? catalogItems.reduce((s, i) => s + (i.availableQuantity || 0), 0);
  const dynamicRentedStock = summary?.rentedStock ?? catalogItems.reduce((s, i) => s + (i.rentedQuantity || 0), 0);
  const dynamicOutOfStockCount = summary?.outOfStockCount ?? catalogItems.filter((i) => (i.availableQuantity || 0) <= 0 || i.status === 'OUT_OF_STOCK').length;
  const dynamicLowStockCount = summary?.lowStockCount ?? catalogItems.filter((i) => (i.availableQuantity || 0) > 0 && (i.availableQuantity || 0) <= 2).length;

  const todayRentals = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return rentals.filter((r) => new Date(r.createdAt) >= startOfToday);
  }, [rentals]);

  const todayRevenue = useMemo(() => {
    return todayRentals.reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0);
  }, [todayRentals]);

  // Infinite Scroll Engines for Orders and Catalog
  const {
    displayedItems: infiniteRentals,
    hasMore: hasMoreRentals,
    isLoadingMore: loadingMoreRentals,
    handleScroll: handleRentalsScroll,
  } = useInfiniteTable(filteredRentals, 15, 15);

  const {
    displayedItems: infiniteCatalog,
    hasMore: hasMoreCatalog,
    isLoadingMore: loadingMoreCatalog,
    handleScroll: handleCatalogScroll,
  } = useInfiniteTable(filteredCatalogItems, 15, 15);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-gold-400 text-[10px] uppercase tracking-[0.25em] font-semibold">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Rental Operations & Live Stock Control</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-ivory-50 font-light">
            Rental Dashboard & Inventory Control
          </h1>
          <p className="text-xs text-ivory-400 font-light mt-1">
            Real-time rental orders dispatch, customer dossiers, dynamic warehouse inventory levels, and live stock tracking.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#14141E] p-1 rounded-full border border-gold-500/30 shadow-md self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`px-5 py-2 rounded-full text-xs uppercase tracking-wider font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'ORDERS'
                ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 font-bold shadow-md'
                : 'text-ivory-300 hover:text-gold-300'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Rental Orders ({rentals.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('INVENTORY')}
            className={`px-5 py-2 rounded-full text-xs uppercase tracking-wider font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'INVENTORY'
                ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 font-bold shadow-md'
                : 'text-ivory-300 hover:text-gold-300'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Stock & Asset Levels ({catalogItems.length})</span>
          </button>
        </div>
      </div>

      {/* DYNAMIC REAL-TIME INVENTORY & RENTAL KPI METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Stock Units */}
        <div className="bg-[#0D0D12] border border-gold-500/20 rounded-3xl p-5 shadow-xl hover:border-gold-500/40 transition-all relative overflow-hidden group">
          <div className="flex justify-between items-center text-ivory-400 text-[10px] font-bold uppercase tracking-wider">
            <span>Total Stock</span>
            <span className="p-1.5 rounded-xl bg-gold-500/10 text-gold-400 border border-gold-500/20">
              <Boxes className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-ivory-50 group-hover:text-gold-300 transition-colors mt-2">
            {dynamicTotalStock.toLocaleString()}
          </p>
          <p className="text-[11px] text-ivory-400 mt-0.5">
            {catalogItems.length} curated asset types
          </p>
        </div>

        {/* Available Stock Units */}
        <div className="bg-[#0D0D12] border border-gold-500/20 rounded-3xl p-5 shadow-xl hover:border-gold-500/40 transition-all relative overflow-hidden group">
          <div className="flex justify-between items-center text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
            <span>Available Stock</span>
            <span className="p-1.5 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-emerald-400 mt-2">
            {dynamicAvailableStock.toLocaleString()}
          </p>
          <p className="text-[11px] text-ivory-400 mt-0.5">Ready for instant dispatch</p>
        </div>

        {/* Currently Rented Units */}
        <div className="bg-[#0D0D12] border border-gold-500/20 rounded-3xl p-5 shadow-xl hover:border-gold-500/40 transition-all relative overflow-hidden group">
          <div className="flex justify-between items-center text-purple-400 text-[10px] font-bold uppercase tracking-wider">
            <span>Currently Rented</span>
            <span className="p-1.5 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-500/30">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-purple-300 mt-2">
            {dynamicRentedStock.toLocaleString()}
          </p>
          <p className="text-[11px] text-ivory-400 mt-0.5">Dispatched in active events</p>
        </div>

        {/* Out of Stock Items */}
        <div className="bg-[#0D0D12] border border-gold-500/20 rounded-3xl p-5 shadow-xl hover:border-gold-500/40 transition-all relative overflow-hidden group">
          <div className="flex justify-between items-center text-rose-400 text-[10px] font-bold uppercase tracking-wider">
            <span>Out of Stock</span>
            <span className="p-1.5 rounded-xl bg-rose-950/60 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-rose-400 mt-2">
            {dynamicOutOfStockCount}
          </p>
          <p className="text-[11px] text-rose-400/80 mt-0.5">
            {dynamicLowStockCount > 0 ? `${dynamicLowStockCount} low stock alerts` : 'Stock healthy'}
          </p>
        </div>

        {/* Today's Rental Revenue */}
        <div className="bg-[#0D0D12] border border-gold-500/20 rounded-3xl p-5 shadow-xl hover:border-gold-500/40 transition-all relative overflow-hidden col-span-2 sm:col-span-2 lg:col-span-1 group">
          <div className="flex justify-between items-center text-gold-400 text-[10px] font-bold uppercase tracking-wider">
            <span>Today's Rentals</span>
            <span className="p-1.5 rounded-xl bg-gold-500/10 text-gold-400 border border-gold-500/20">
              <DollarSign className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-gold-300 mt-2">
            PKR {todayRevenue.toFixed(2)}
          </p>
          <p className="text-[11px] text-ivory-400 mt-0.5">{todayRentals.length} orders placed today</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: RENTAL ORDERS & DISPATCH VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'ORDERS' && (
        <div className="space-y-6">
          {/* Orders Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gold-400/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer name, phone, rental ref #..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gold-500/30 bg-[#14141E] text-ivory-50 placeholder:text-ivory-600 text-xs focus:outline-none focus:border-gold-400 shadow-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Date Filter Tabs */}
              <div className="flex items-center space-x-1 bg-[#14141E] p-1 rounded-full border border-gold-500/30 text-[11px]">
                {['All', 'Today', 'Yesterday', 'Last 7 Days'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDateFilter(d)}
                    className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                      dateFilter === d ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 font-bold shadow-sm' : 'text-ivory-300 hover:text-gold-300'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['All', 'PENDING', 'APPROVED', 'RENTED', 'RETURNED', 'CANCELLED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
                      statusFilter === st
                        ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 font-bold shadow-sm'
                        : 'bg-[#14141E] text-ivory-300 border border-gold-500/20 hover:border-gold-400 hover:text-ivory-50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-[#0D0D12] border border-gold-500/20 rounded-3xl overflow-hidden shadow-xl">
            {loadingRentals ? (
              <div className="py-20">
                <LuxurySpinner size="lg" text="Loading rental orders & dispatch schedules..." />
              </div>
            ) : filteredRentals.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <p className="font-serif text-lg text-ivory-200">No rental requests found.</p>
                <p className="text-xs text-ivory-400">Try changing your search or date filter.</p>
              </div>
            ) : (
              <>
                <div
                  onScroll={handleRentalsScroll}
                  className="overflow-x-auto max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gold-500/20"
                >
                  <table className="w-full text-left text-xs text-ivory-200">
                    <thead className="bg-[#14141E]/95 border-b border-gold-500/20 text-[9px] uppercase font-bold tracking-wider text-gold-400 sticky top-0 z-10 backdrop-blur-md shadow-sm">
                      <tr>
                        <th className="py-3 px-3 pl-5">Order Ref</th>
                        <th className="py-3 px-3">Customer</th>
                        <th className="py-3 px-3">Schedule & Mode</th>
                        <th className="py-3 px-3">Reserved Pieces</th>
                        <th className="py-3 px-3">Total Amount</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 pr-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {infiniteRentals.map((r) => {
                        const items = Array.isArray(r.items)
                          ? r.items
                          : typeof r.itemsJson === 'string'
                          ? JSON.parse(r.itemsJson || '[]')
                          : [];

                        const isHourly = r.rentalMode === 'HOURLY';
                        const totalUnits = items.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0);

                        return (
                          <tr key={r.id} className="hover:bg-gold-500/5 transition-colors">
                            <td className="py-3 px-3 pl-5">
                              <span className="font-mono font-bold text-gold-400 text-xs block">{r.rentalNumber}</span>
                              <span className="text-[9px] text-ivory-500">
                                {new Date(r.createdAt).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <p className="font-semibold text-ivory-50 text-xs truncate max-w-[140px]">{r.customerName}</p>
                              <p className="text-[10px] text-ivory-400 font-mono truncate max-w-[140px]">{r.customerPhone}</p>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`inline-flex items-center px-2 py-0.5 text-[8px] rounded-full font-bold uppercase mb-0.5 ${
                                isHourly ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30' : 'bg-gold-950/60 text-gold-300 border border-gold-500/30'
                              }`}>
                                {isHourly ? 'Hourly' : 'Daily'}
                              </span>
                              <p className="text-[10px] text-ivory-300 font-mono truncate max-w-[160px]">
                                {r.eventDate && !isNaN(new Date(r.eventDate).getTime())
                                  ? new Date(r.eventDate).toLocaleDateString()
                                  : r.startDate && !isNaN(new Date(r.startDate).getTime())
                                  ? new Date(r.startDate).toLocaleDateString()
                                  : 'N/A'}
                                {r.returnDate && !isNaN(new Date(r.returnDate).getTime()) && (
                                  <span className="text-[9px] text-ivory-500 block">
                                    to {new Date(r.returnDate).toLocaleDateString()}
                                  </span>
                                )}
                              </p>
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-bold text-ivory-100">{totalUnits} pieces</span>
                              <span className="block text-[9px] text-ivory-500">{items.length} designs</span>
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-gold-300">
                              PKR {r.totalAmount.toLocaleString()}
                            </td>
                            <td className="py-3 px-3">
                              <select
                                value={r.status}
                                onChange={(e) => handleUpdateStatus(r.id, e.target.value)}
                                className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none transition-colors ${
                                  r.status === 'APPROVED' || r.status === 'COMPLETED' || r.status === 'RETURNED'
                                    ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                                    : r.status === 'PENDING'
                                    ? 'bg-amber-950/70 text-amber-300 border-amber-500/40'
                                    : r.status === 'RENTED'
                                    ? 'bg-purple-950/70 text-purple-300 border-purple-500/40'
                                    : 'bg-rose-950/70 text-rose-300 border-rose-500/40'
                                }`}
                              >
                                <option value="PENDING">PENDING</option>
                                <option value="APPROVED">APPROVED</option>
                                <option value="RENTED">RENTED</option>
                                <option value="RETURNED">RETURNED</option>
                                <option value="COMPLETED">COMPLETED</option>
                                <option value="CANCELLED">CANCELLED</option>
                              </select>
                            </td>
                            <td className="py-3 px-3 pr-5 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedRental(r)}
                                  className="px-3 py-1 bg-[#1A1A26] hover:bg-gold-500 text-ivory-50 hover:text-obsidian-950 font-semibold text-[11px] rounded-lg border border-gold-500/30 transition-all shadow-sm inline-flex items-center space-x-1"
                                >
                                  <Eye className="w-3 h-3 text-gold-400" />
                                  <span>Dossier</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRental(r.id, r.rentalNumber)}
                                  className="p-1.5 text-rose-400 hover:bg-rose-950/50 rounded-lg transition-colors border border-rose-500/20"
                                  title="Delete Rental Order"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Luxury Infinite Scroll Status & Auto-Loader */}
                <AdminInfiniteTableFooter
                  displayedCount={infiniteRentals.length}
                  totalCount={filteredRentals.length}
                  hasMore={hasMoreRentals}
                  isLoadingMore={loadingMoreRentals}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: RENTAL INVENTORY & LIVE STOCK LEVELS */}
      {/* ========================================================================= */}
      {activeTab === 'INVENTORY' && (
        <div className="space-y-6">
          {/* Inventory Controls */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gold-400/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                placeholder="Search catalog items by name, category..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gold-500/30 bg-[#14141E] text-ivory-50 placeholder:text-ivory-600 text-xs focus:outline-none focus:border-gold-400 shadow-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Category Dropdown */}
              <select
                value={inventoryCategory}
                onChange={(e) => setInventoryCategory(e.target.value)}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-[#14141E] border border-gold-500/30 text-ivory-100 focus:outline-none shadow-sm cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[#14141E] text-ivory-100">
                    {c === 'All' ? 'All Categories' : c}
                  </option>
                ))}
              </select>

              {/* Stock Filter Pills */}
              <div className="flex items-center space-x-1 bg-[#14141E] p-1 rounded-full border border-gold-500/30 text-[11px]">
                {[
                  { id: 'ALL', label: 'All Items' },
                  { id: 'AVAILABLE', label: 'In Stock' },
                  { id: 'LOW', label: 'Low Stock' },
                  { id: 'OUT', label: 'Out of Stock' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setInventoryStockFilter(f.id)}
                    className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                      inventoryStockFilter === f.id
                        ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 font-bold shadow-sm'
                        : 'text-ivory-300 hover:text-gold-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Catalog Inventory Table */}
          <div className="bg-[#0D0D12] border border-gold-500/20 rounded-3xl overflow-hidden shadow-xl">
            {loadingCatalog ? (
              <div className="py-20">
                <LuxurySpinner size="lg" text="Loading rental catalog stock matrix..." />
              </div>
            ) : filteredCatalogItems.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <p className="font-serif text-lg text-ivory-200">No rental items matched your search filters.</p>
              </div>
            ) : (
              <>
                <div
                  onScroll={handleCatalogScroll}
                  className="overflow-x-auto max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gold-500/20"
                >
                  <table className="w-full text-left text-xs text-ivory-200">
                    <thead className="bg-[#14141E]/95 border-b border-gold-500/20 text-[9px] uppercase font-bold tracking-wider text-gold-400 sticky top-0 z-10 backdrop-blur-md shadow-sm">
                      <tr>
                        <th className="py-3 px-3 pl-5">Rental Piece</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3">Stock Breakdown</th>
                        <th className="py-3 px-3">Rental Rates</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 pr-5 text-right">Stock Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {infiniteCatalog.map((item) => {
                        const isOut = item.availableQuantity <= 0 || item.status === 'OUT_OF_STOCK';
                        const isLow = item.availableQuantity > 0 && item.availableQuantity <= 2;
                        const hourlyRate = item.hourlyRate || +(item.rentalPrice * 0.2).toFixed(2);
                        const percentAvailable = Math.round((item.availableQuantity / Math.max(1, item.totalQuantity)) * 100);

                        return (
                          <tr key={item.id} className="hover:bg-gold-500/5 transition-colors">
                            <td className="py-3 px-3 pl-5">
                              <div className="flex items-center space-x-3">
                                {item.imageUrl && (
                                  <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-gold-500/30 flex-shrink-0 bg-[#161622]">
                                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="font-serif text-xs font-bold text-ivory-50 truncate max-w-[200px]">
                                    {item.name}
                                  </p>
                                  <span className="text-[10px] font-mono text-gold-400 block">
                                    {item.slug?.slice(0, 24) || 'SKU-RENT'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-3">
                              <span className="px-2.5 py-0.5 rounded-full bg-[#181826] border border-gold-500/20 text-gold-300 text-[10px] font-semibold">
                                {item.category}
                              </span>
                            </td>

                            <td className="py-3 px-3">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2 text-[11px]">
                                  <span className="font-bold text-emerald-400">{item.availableQuantity} available</span>
                                  <span className="text-ivory-500">/</span>
                                  <span className="text-ivory-300">{item.totalQuantity} total</span>
                                </div>
                                <div className="w-28 bg-[#1E1E2C] h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${percentAvailable}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-3">
                              <p className="font-mono font-bold text-ivory-50 text-xs">
                                PKR {item.rentalPrice.toLocaleString()}/day
                              </p>
                              <span className="text-[10px] font-mono text-gold-400/80 block">
                                PKR {hourlyRate.toLocaleString()}/hr
                              </span>
                            </td>

                            <td className="py-3 px-3">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                  isOut
                                    ? 'bg-rose-950/70 text-rose-300 border border-rose-500/30'
                                    : isLow
                                    ? 'bg-amber-950/70 text-amber-300 border border-amber-500/30'
                                    : 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/30'
                                }`}
                              >
                                {isOut ? 'Depleted' : isLow ? 'Low Stock' : 'In Stock'}
                              </span>
                            </td>

                            <td className="py-3 px-3 pr-5 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setAdjustingItem(item);
                                  setAdjustDelta(10);
                                  setAdjustReason('Shipment replenishment');
                                  setAdjustModalOpen(true);
                                }}
                                className="px-3 py-1 bg-[#1A1A26] hover:bg-gold-500 text-ivory-50 hover:text-obsidian-950 font-semibold text-[11px] rounded-lg border border-gold-500/30 transition-all shadow-sm inline-flex items-center space-x-1"
                              >
                                <RefreshCw className="w-3 h-3 text-gold-400" />
                                <span>Adjust Stock</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Luxury Infinite Scroll Status & Auto-Loader */}
                <AdminInfiniteTableFooter
                  displayedCount={infiniteCatalog.length}
                  totalCount={filteredCatalogItems.length}
                  hasMore={hasMoreCatalog}
                  isLoadingMore={loadingMoreCatalog}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* QUICK STOCK ADJUSTMENT MODAL */}
      {adjustModalOpen && adjustingItem && (
        <div className="fixed inset-0 z-[99999] overflow-hidden flex items-center justify-center p-3 sm:p-4 bg-obsidian-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-ivory-50 text-obsidian-950 border border-gold-500/60 rounded-3xl overflow-hidden shadow-2xl max-w-md w-full max-h-[92dvh] flex flex-col p-5 sm:p-6 space-y-4 overflow-y-auto overscroll-contain">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold-700 font-bold">
                  Quick Stock Adjustment
                </span>
                <h3 className="font-serif text-lg font-bold text-obsidian-950 mt-0.5">
                  {adjustingItem.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAdjustModalOpen(false)}
                className="p-1 rounded-full hover:bg-champagne-200 text-obsidian-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-champagne-100/70 rounded-2xl border border-champagne-300 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-obsidian-600">Current Total Stock:</span>
                <span className="font-bold text-obsidian-950 font-mono">{adjustingItem.totalQuantity} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-obsidian-600">Currently Available:</span>
                <span className="font-bold text-sage-800 font-mono">{adjustingItem.availableQuantity} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-obsidian-600">Currently Rented:</span>
                <span className="font-bold text-purple-800 font-mono">{adjustingItem.rentedQuantity || 0} units</span>
              </div>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-obsidian-700 tracking-wider mb-1.5">
                  Stock Delta Adjustment (+ to add, - to reduce)
                </label>
                <input
                  type="number"
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-champagne-300 bg-white font-mono font-bold text-sm focus:outline-none focus:border-gold-500"
                  required
                />
                <span className="text-[10px] text-obsidian-500 mt-1 block">
                  New available stock will be: <strong className="text-gold-800 font-mono">{Math.max(0, adjustingItem.availableQuantity + (Number(adjustDelta) || 0))} units</strong>
                </span>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-obsidian-700 tracking-wider mb-1.5">
                  Reason for Adjustment
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Warehouse shipment restock, audit correction"
                  className="w-full px-4 py-2 rounded-xl border border-champagne-300 bg-white text-xs focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-champagne-200">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-champagne-300 text-obsidian-700 font-semibold hover:bg-champagne-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="px-5 py-2 bg-obsidian-950 hover:bg-gold-600 text-ivory-50 font-bold uppercase tracking-wider text-xs rounded-xl transition-all shadow-sm"
                >
                  {adjusting ? 'Updating Stock...' : 'Save Stock Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPLETE RENTAL ORDER DOSSIER MODAL */}
      {selectedRental && (
        <div className="fixed inset-0 z-[99999] overflow-hidden flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-obsidian-950/85 backdrop-blur-md animate-fadeIn">
          <div
            className="relative bg-ivory-50 text-obsidian-950 border border-gold-500/60 rounded-3xl overflow-hidden shadow-2xl max-w-3xl w-full flex flex-col max-h-[92dvh] sm:max-h-[90dvh] select-none"
            style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6), 0 0 25px rgba(212,175,55,0.3)' }}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-6 bg-obsidian-950 text-ivory-50 border-b border-gold-500/30 flex items-center justify-between flex-shrink-0">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm font-bold text-gold-400">
                    #{selectedRental.rentalNumber}
                  </span>
                  <span
                    className={`text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                      selectedRental.status === 'APPROVED' || selectedRental.status === 'RETURNED'
                        ? 'bg-sage-900 text-sage-200 border-sage-500'
                        : selectedRental.status === 'PENDING'
                        ? 'bg-amber-900 text-amber-200 border-amber-500'
                        : selectedRental.status === 'RENTED'
                        ? 'bg-gold-900 text-gold-200 border-gold-500'
                        : 'bg-red-900 text-red-200 border-red-500'
                    }`}
                  >
                    {selectedRental.status}
                  </span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-light text-ivory-50">
                  Rental Order Complete Dossier
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRental(null)}
                className="p-2 rounded-full hover:bg-white/10 text-ivory-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs overscroll-contain">
              {/* Customer & Location Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client Info */}
                <div className="p-4 bg-white rounded-2xl border border-champagne-300 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-gold-700 tracking-wider flex items-center space-x-1">
                    <User className="w-3 h-3 text-gold-600" />
                    <span>Customer Information</span>
                  </span>
                  <p className="font-serif text-base font-bold text-obsidian-950">{selectedRental.customerName}</p>
                  <p className="text-obsidian-600 flex items-center">
                    <Mail className="w-3 h-3 text-obsidian-400 mr-1.5" />
                    <a href={`mailto:${selectedRental.customerEmail}`} className="hover:underline text-gold-800 font-medium">
                      {selectedRental.customerEmail}
                    </a>
                  </p>
                  <p className="text-obsidian-600 flex items-center font-mono">
                    <Phone className="w-3 h-3 text-obsidian-400 mr-1.5" />
                    <span>{selectedRental.customerPhone}</span>
                  </p>

                  <a
                    href={`https://wa.me/${selectedRental.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hello ${selectedRental.customerName}, this is Lumière Décor regarding your rental order #${selectedRental.rentalNumber}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-semibold text-[11px] transition-colors mt-2"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>

                {/* Venue & Delivery Location */}
                <div className="p-4 bg-white rounded-2xl border border-champagne-300 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-gold-700 tracking-wider flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-gold-600" />
                    <span>Event Venue & Delivery Address</span>
                  </span>
                  <p className="text-xs text-obsidian-900 font-medium leading-relaxed">
                    {selectedRental.notes || 'Studio Pickup / Venue not specified'}
                  </p>

                  <div className="pt-2 border-t border-champagne-200 space-y-1">
                    <span className="text-[10px] text-obsidian-500 uppercase font-semibold">Rental Schedule</span>
                    <p className="text-obsidian-800 font-semibold">
                      {new Date(selectedRental.eventDate).toLocaleDateString('en-US', { dateStyle: 'full' })}
                    </p>
                    <p className="text-obsidian-600">
                      Return by: {new Date(selectedRental.returnDate).toLocaleDateString('en-US', { dateStyle: 'full' })}
                    </p>
                    <p className="text-purple-800 font-semibold">
                      Mode: {selectedRental.rentalMode === 'HOURLY' ? `Hourly (${selectedRental.rentalHours || 4} Hours)` : 'Daily Rental'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rented Items Table */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-gold-700 tracking-wider">
                  Reserved Items Matrix
                </span>
                <div className="border border-champagne-300 rounded-2xl overflow-hidden bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-champagne-50 border-b border-champagne-200 text-[10px] uppercase font-bold text-obsidian-600 tracking-wider">
                      <tr>
                        <th className="p-3 pl-4">Item</th>
                        <th className="p-3 text-center">Category</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Unit Rate</th>
                        <th className="p-3 pr-4 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-champagne-200">
                      {(Array.isArray(selectedRental.items)
                        ? selectedRental.items
                        : typeof selectedRental.itemsJson === 'string'
                        ? JSON.parse(selectedRental.itemsJson || '[]')
                        : []
                      ).map((it, idx) => (
                        <tr key={idx} className="hover:bg-champagne-50/40">
                          <td className="p-3 pl-4 flex items-center space-x-3">
                            {it.imageUrl && (
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-champagne-300 flex-shrink-0">
                                <Image src={it.imageUrl} alt={it.name} fill className="object-cover" />
                              </div>
                            )}
                            <span className="font-semibold text-obsidian-950">{it.name}</span>
                          </td>
                          <td className="p-3 text-center text-obsidian-500">{it.category || 'Decor'}</td>
                          <td className="p-3 text-center font-bold text-obsidian-900">{it.quantity}</td>
                          <td className="p-3 text-right text-obsidian-600 font-mono">
                            PKR {(it.unitRate || it.rentalPrice || 0).toFixed(2)}
                          </td>
                          <td className="p-3 pr-4 text-right font-bold text-gold-800 font-mono">
                            PKR {(it.total || (it.unitRate || it.rentalPrice || 0) * it.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Calculation Summary */}
              <div className="p-4 bg-champagne-100/70 rounded-2xl border border-champagne-300 space-y-2">
                <div className="flex justify-between text-obsidian-700">
                  <span>Gross Subtotal</span>
                  <span className="font-semibold">PKR {selectedRental.subtotal.toFixed(2)}</span>
                </div>
                {selectedRental.discount > 0 && (
                  <div className="flex justify-between text-gold-800 font-semibold">
                    <span>Promo Discount Applied</span>
                    <span>-PKR {selectedRental.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-obsidian-700">
                  <span>Refundable Security Deposit</span>
                  <span className="font-semibold">PKR {selectedRental.deposit.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-champagne-300 flex justify-between items-baseline font-bold text-obsidian-950 text-sm">
                  <span>Total Amount Due</span>
                  <span className="font-serif text-lg text-gold-800">PKR {selectedRental.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-3.5 sm:p-4 bg-white border-t border-champagne-300 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase text-obsidian-600">Update Status:</span>
                {selectedRental.status === 'PENDING' && (
                  <button
                    disabled={updating}
                    onClick={() => handleUpdateStatus(selectedRental.id, 'APPROVED')}
                    className="px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-colors shadow-sm"
                  >
                    Approve Order
                  </button>
                )}
                {selectedRental.status === 'APPROVED' && (
                  <button
                    disabled={updating}
                    onClick={() => handleUpdateStatus(selectedRental.id, 'RENTED')}
                    className="px-4 py-2 bg-gold-600 hover:bg-gold-700 text-obsidian-950 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors shadow-sm"
                  >
                    Dispatch Out (Mark Rented)
                  </button>
                )}
                {selectedRental.status === 'RENTED' && (
                  <button
                    disabled={updating}
                    onClick={() => handleUpdateStatus(selectedRental.id, 'RETURNED')}
                    className="px-4 py-2 bg-obsidian-950 hover:bg-gold-600 text-ivory-50 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors shadow-sm"
                  >
                    Mark Returned & Restock
                  </button>
                )}
                {selectedRental.status !== 'CANCELLED' && selectedRental.status !== 'RETURNED' && (
                  <button
                    disabled={updating}
                    onClick={() => {
                      confirmDelete({
                        title: 'Cancel Rental Order?',
                        message: 'Are you sure you want to cancel this rental order? Reserved stock will be returned to available inventory.',
                        itemName: selectedRental?.rentalNumber ? `Rental #${selectedRental.rentalNumber}` : undefined,
                        confirmText: 'Cancel Order',
                        onConfirm: async () => {
                          await handleUpdateStatus(selectedRental.id, 'CANCELLED');
                        },
                      });
                    }}
                    className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl font-semibold text-xs transition-colors"
                  >
                    Cancel Order
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedRental(null)}
                className="px-5 py-2 border border-champagne-300 rounded-xl font-semibold text-xs uppercase tracking-wider text-obsidian-700 hover:bg-champagne-100 transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
