'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../../src/lib/api';
import { useToast } from '../../../src/context/ToastContext';
import { useConfirmModal } from '../../../src/context/ConfirmModalContext';
import LuxurySpinner from '../../../src/components/ui/LuxurySpinner';
import AdminInfiniteTableFooter, { useInfiniteTable } from '../../../src/components/ui/AdminInfiniteTable';
import {
  DollarSign,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  Calendar,
  User,
  ShoppingBag,
  Layers,
  Crown,
  Tag,
  Clock,
  Printer,
  ExternalLink,
  MessageCircle,
  X,
  Eye,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Filter,
} from 'lucide-react';

export default function AdminSalesPage() {
  const { showToast } = useToast();
  const { confirmDelete } = useConfirmModal();
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All'); // 'All' | 'SALE' | 'RENTAL' | 'BOOKING'
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'PAID' | 'PENDING' | 'CANCELLED'
  const [dateFilter, setDateFilter] = useState('All'); // 'Today' | 'Yesterday' | 'Last 7 Days' | 'All'

  // Selected Order Dossier Modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Record New Sale Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    discount: 0,
    tax: 0,
    paymentStatus: 'PAID',
    notes: '',
    items: [{ inventoryId: '', itemName: '', quantity: 1, unitPrice: 0 }],
  });

  const fetchUnifiedSales = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    try {
      const [uRes, iRes] = await Promise.all([
        api.getUnifiedSales({
          search: searchQuery || undefined,
          type: typeFilter === 'All' ? undefined : typeFilter,
          status: statusFilter === 'All' ? undefined : statusFilter,
        }),
        api.getInventory().catch(() => ({ inventory: [] })),
      ]);

      if (uRes && uRes.orders) {
        setOrders(uRes.orders);
        if (uRes.summary) setSummary(uRes.summary);
      }
      if (iRes && iRes.inventory) {
        setInventory(iRes.inventory);
      }
    } catch (e) {
      console.warn('Failed to load unified sales', e);
      if (!isSilent) showToast('Failed to load sales data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, typeFilter, statusFilter, showToast]);

  // Initial load
  useEffect(() => {
    fetchUnifiedSales();
  }, [fetchUnifiedSales]);

  // Real-time live auto-refresh polling every 10 seconds & on window focus
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnifiedSales(true);
    }, 10000);

    const onFocus = () => fetchUnifiedSales(true);
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchUnifiedSales]);

  // Client-side date filter
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
  const startOf7Days = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);

  const displayedOrders = useMemo(() => {
    return orders.filter((ord) => {
      if (dateFilter === 'All') return true;
      const d = new Date(ord.date);
      if (dateFilter === 'Today') return d >= startOfToday;
      if (dateFilter === 'Yesterday') return d >= startOfYesterday && d < startOfToday;
      if (dateFilter === 'Last 7 Days') return d >= startOf7Days;
      return true;
    });
  }, [orders, dateFilter, startOfToday, startOfYesterday, startOf7Days]);

  // Infinite Scroll Engine
  const {
    displayedItems: infiniteOrders,
    hasMore,
    isLoadingMore,
    handleScroll,
  } = useInfiniteTable(displayedOrders, 15, 15);

  // Form management for Record Sale
  const handleAddItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { inventoryId: '', itemName: '', quantity: 1, unitPrice: 0 }],
    }));
  };

  const handleRemoveItemRow = (idx) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  const handleItemChange = (idx, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.items];
      updated[idx] = { ...updated[idx], [field]: value };

      if (field === 'inventoryId' && value) {
        const inv = inventory.find((i) => i.id === value);
        if (inv) {
          updated[idx].itemName = inv.name;
          updated[idx].unitPrice = inv.purchaseCost ? +(inv.purchaseCost * 1.4).toFixed(2) : inv.rentalPrice || 50;
        }
      }
      return { ...prev, items: updated };
    });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
  };

  const calculateTotal = () => {
    const sub = calculateSubtotal();
    return Math.max(0, sub - (Number(formData.discount) || 0) + (Number(formData.tax) || 0));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required.';
    } else if (formData.customerName.trim().length < 2) {
      newErrors.customerName = 'Customer name must be at least 2 characters.';
    }

    if (formData.customerEmail && formData.customerEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.customerEmail.trim())) {
        newErrors.customerEmail = 'Please provide a valid email address.';
      }
    }

    if (!formData.items || formData.items.length === 0) {
      newErrors.items = 'Please add at least one line item.';
    } else {
      const itemErrors = [];
      formData.items.forEach((item, idx) => {
        if (!item.itemName.trim()) itemErrors.push(`Item #${idx + 1}: Name cannot be empty`);
        if (Number(item.quantity) < 1) itemErrors.push(`Item #${idx + 1}: Quantity must be >= 1`);
        if (Number(item.unitPrice) < 0) itemErrors.push(`Item #${idx + 1}: Unit price cannot be negative`);
      });
      if (itemErrors.length > 0) newErrors.items = itemErrors.join(', ');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateSale = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please resolve the form errors before registering sale.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.createSale(formData);
      showToast('Sale registered successfully! Stock adjusted & notification dispatched.', 'success');
      fetchUnifiedSales();
      setCreateModalOpen(false);
      setErrors({});
    } catch (e) {
      const msg = e.data?.message || e.message || 'Failed to create sale';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Status update
  const handleUpdatePaymentStatus = async (orderId, orderType, newStatus) => {
    try {
      if (orderType === 'SALE') {
        await api.updateSaleStatus(orderId, { paymentStatus: newStatus });
      } else if (orderType === 'RENTAL') {
        await api.updateRentalRequestStatus(orderId, { status: newStatus === 'PAID' ? 'APPROVED' : newStatus });
      } else if (orderType === 'BOOKING') {
        await api.updateBookingStatus(orderId, { status: newStatus === 'PAID' ? 'CONFIRMED' : newStatus });
      }
      showToast(`Order status updated to ${newStatus}`, 'success');
      fetchUnifiedSales(true);
      if (selectedOrder) {
        setSelectedOrder((prev) => (prev ? { ...prev, paymentStatus: newStatus, status: newStatus } : null));
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  // Delete Order
  const handleDeleteOrder = (order) => {
    confirmDelete({
      title: `Delete ${order.orderType} Order?`,
      message: `Are you sure you want to permanently delete this ${order.orderType.toLowerCase()} order? This record will be removed from your financial ledger.`,
      itemName: order?.referenceNumber ? `Order #${order.referenceNumber}` : undefined,
      confirmText: 'Delete Permanently',
      onConfirm: async () => {
        try {
          if (order.orderType === 'SALE') {
            await api.deleteSale(order.id);
          } else if (order.orderType === 'RENTAL') {
            await api.deleteRentalRequest(order.id);
          }
          showToast(`Order #${order.referenceNumber} deleted successfully`, 'info');
          setSelectedOrder(null);
          fetchUnifiedSales();
        } catch (e) {
          showToast('Failed to delete order', 'error');
          throw e;
        }
      },
    });
  };

  // Dynamic metrics from current data
  const totalSettledRevenue = summary?.totalGrossRevenue || orders.filter((o) => o.paymentStatus === 'PAID').reduce((s, o) => s + o.total, 0);
  const totalPendingValuation = summary?.totalPendingRevenue || orders.filter((o) => o.paymentStatus === 'PENDING').reduce((s, o) => s + o.total, 0);
  const todayRevenue = summary?.todayPaidRevenue || orders.filter((o) => o.paymentStatus === 'PAID' && new Date(o.date) >= startOfToday).reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-gold-700 text-[10px] uppercase tracking-[0.25em] font-semibold">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Master Financial Ledger & Revenue Streams</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-obsidian-950 font-light mt-1">
            Sales & Revenue Ledger
          </h1>
          <p className="text-xs text-obsidian-500 font-light mt-1">
            Live consolidated revenue across <strong className="font-semibold text-obsidian-800">Direct POS Sales</strong>, <strong className="font-semibold text-obsidian-800">Rentals</strong>, and <strong className="font-semibold text-obsidian-800">Gallery Commissions</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchUnifiedSales(true)}
            disabled={refreshing}
            className="p-2.5 bg-white border border-champagne-300 rounded-full text-obsidian-700 hover:bg-champagne-100 transition-colors shadow-sm"
            title="Auto-refreshes every 10s. Click to refresh immediately."
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-gold-600' : ''}`} />
          </button>

          <button
            onClick={() => {
              setFormData({
                customerName: '',
                customerEmail: '',
                customerPhone: '',
                discount: 0,
                tax: 0,
                paymentStatus: 'PAID',
                notes: '',
                items: [{ inventoryId: '', itemName: '', quantity: 1, unitPrice: 0 }],
              });
              setErrors({});
              setCreateModalOpen(true);
            }}
            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-obsidian-950 text-ivory-50 rounded-full text-xs uppercase tracking-widest font-semibold hover:bg-gold-600 hover:text-obsidian-950 transition-all duration-300 shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4 text-gold-400" />
            <span>Record Direct Sale</span>
          </button>
        </div>
      </div>

      {/* Dynamic Performance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Settled Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-champagne-300 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center text-obsidian-500 text-[11px] font-semibold uppercase tracking-wider">
            <span>Settled Revenue</span>
            <span className="px-2 py-0.5 rounded-full bg-sage-100 text-sage-800 text-[10px] font-bold">Collected</span>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-obsidian-950 mt-2">
            PKR {totalSettledRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-obsidian-500 mt-1">
            Across {orders.filter((o) => o.paymentStatus === 'PAID').length} settled transactions
          </p>
        </div>

        {/* Pending Pipeline Valuation */}
        <div className="bg-white p-5 rounded-3xl border border-champagne-300 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center text-obsidian-500 text-[11px] font-semibold uppercase tracking-wider">
            <span>Pending Pipeline</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">Unsettled</span>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-amber-700 mt-2">
            PKR {totalPendingValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-obsidian-500 mt-1">
            {orders.filter((o) => o.paymentStatus === 'PENDING').length} active pending order(s)
          </p>
        </div>

        {/* Today's Sales */}
        <div className="bg-white p-5 rounded-3xl border border-champagne-300 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center text-obsidian-500 text-[11px] font-semibold uppercase tracking-wider">
            <span>Today's Takings</span>
            <span className="px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-800 text-[10px] font-bold">Today</span>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-gold-800 mt-2">
            PKR {todayRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-obsidian-500 mt-1">
            {orders.filter((o) => new Date(o.date) >= startOfToday).length} order(s) registered today
          </p>
        </div>

        {/* Total Order Stream Counts */}
        <div className="bg-white p-5 rounded-3xl border border-champagne-300 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center text-obsidian-500 text-[11px] font-semibold uppercase tracking-wider">
            <span>Stream Breakdown</span>
            <span className="px-2 py-0.5 rounded-full bg-champagne-200 text-obsidian-800 text-[10px] font-bold">All Streams</span>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-lg">
              {summary?.salesCount || 0} POS
            </span>
            <span className="text-xs font-bold px-2 py-0.5 bg-purple-100 text-purple-800 rounded-lg">
              {summary?.rentalsCount || 0} Rentals
            </span>
            <span className="text-xs font-bold px-2 py-0.5 bg-gold-100 text-gold-900 rounded-lg">
              {summary?.bookingsCount || 0} Gallery
            </span>
          </div>
          <p className="text-[10px] text-obsidian-500 mt-1">
            Total {orders.length} orders in ledger
          </p>
        </div>
      </div>

      {/* Stream Tabs, Filters & Search Controls */}
      <div className="space-y-4">
        {/* Stream Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'All', label: 'All Revenue Streams', count: orders.length },
            { id: 'SALE', label: 'Direct POS Sales', count: orders.filter((o) => o.orderType === 'SALE').length },
            { id: 'RENTAL', label: 'Rental Orders', count: orders.filter((o) => o.orderType === 'RENTAL').length },
            { id: 'BOOKING', label: 'Gallery Commissions', count: orders.filter((o) => o.orderType === 'BOOKING').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold transition-all flex items-center space-x-2 ${
                typeFilter === tab.id
                  ? 'bg-obsidian-950 text-ivory-50 shadow-md font-bold'
                  : 'bg-white text-obsidian-700 border border-champagne-300 hover:bg-champagne-100'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${typeFilter === tab.id ? 'bg-gold-500 text-obsidian-950 font-bold' : 'bg-champagne-200 text-obsidian-600'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search, Status & Date Toolbar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-champagne-300 shadow-sm">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-obsidian-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order #, customer name, phone, item..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-champagne-300 bg-ivory-50 text-xs focus:outline-none focus:border-gold-500 shadow-inner"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Payment Status Filter */}
            <div className="flex items-center space-x-1 bg-ivory-100 p-1 rounded-full border border-champagne-300 text-xs font-semibold">
              {['All', 'PAID', 'PENDING', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-full transition-all ${
                    statusFilter === st
                      ? 'bg-gold-600 text-obsidian-950 font-bold shadow-sm'
                      : 'text-obsidian-700 hover:text-obsidian-950'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Date Range Tabs */}
            <div className="flex items-center space-x-1 bg-ivory-100 p-1 rounded-full border border-champagne-300 text-xs font-semibold">
              {['All', 'Today', 'Yesterday', 'Last 7 Days'].map((d) => (
                <button
                  key={d}
                  onClick={() => setDateFilter(d)}
                  className={`px-3 py-1 rounded-full transition-all ${
                    dateFilter === d
                      ? 'bg-obsidian-950 text-ivory-50 shadow-sm'
                      : 'text-obsidian-700 hover:text-obsidian-950'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-champagne-300/80 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-24">
            <LuxurySpinner size="lg" text="Loading sales ledger & live orders..." />
          </div>
        ) : displayedOrders.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="p-3 bg-champagne-100 text-gold-700 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="font-serif text-xl text-obsidian-900">No orders found matching this filter.</p>
            <p className="text-xs text-obsidian-500 max-w-sm mx-auto">
              Newly placed rental requests, direct POS sales, and gallery orders will automatically appear here.
            </p>
            <button
              onClick={() => {
                setTypeFilter('All');
                setStatusFilter('All');
                setDateFilter('All');
                setSearchQuery('');
              }}
              className="text-xs uppercase tracking-widest text-gold-700 font-bold underline hover:text-gold-900"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div
            onScroll={handleScroll}
            className="overflow-x-auto max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gold-500/20"
          >
            <table className="w-full text-left text-xs text-obsidian-700">
              <thead className="bg-champagne-100/95 border-b border-champagne-200 text-[10px] uppercase font-bold tracking-wider text-obsidian-600 sticky top-0 z-10 backdrop-blur-md shadow-sm">
                <tr>
                  <th className="p-4 pl-6">Order Ref #</th>
                  <th className="p-4">Stream</th>
                  <th className="p-4">Customer Dossier</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Ordered Items / Details</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-champagne-200">
                {infiniteOrders.map((ord) => {
                  const isPaid = ord.paymentStatus === 'PAID';
                  const isCancelled = ord.paymentStatus === 'CANCELLED' || ord.status === 'CANCELLED';

                  return (
                    <tr
                      key={`${ord.orderType}-${ord.id}`}
                      onClick={() => setSelectedOrder(ord)}
                      className="hover:bg-champagne-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="p-4 pl-6 font-mono font-bold text-gold-800 group-hover:text-gold-950">
                        #{ord.referenceNumber}
                      </td>

                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                            ord.orderType === 'SALE'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : ord.orderType === 'RENTAL'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : 'bg-gold-50 text-gold-900 border-gold-300'
                          }`}
                        >
                          {ord.orderType === 'SALE' ? 'POS Sale' : ord.orderType === 'RENTAL' ? 'Rental' : 'Gallery'}
                        </span>
                      </td>

                      <td className="p-4">
                        <p className="font-semibold text-obsidian-900 group-hover:text-gold-700 transition-colors">
                          {ord.customerName}
                        </p>
                        <p className="text-[10px] text-obsidian-400 font-mono">
                          {ord.customerPhone} &bull; {ord.customerEmail}
                        </p>
                      </td>

                      <td className="p-4 whitespace-nowrap text-obsidian-600">
                        {new Date(ord.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="p-4 max-w-xs">
                        <p className="font-medium text-obsidian-900 truncate">
                          {ord.itemsDescription}
                        </p>
                        <span className="text-[10px] text-obsidian-500">
                          {ord.itemsCount} line item{ord.itemsCount !== 1 ? 's' : ''} {ord.location ? `• ${ord.location}` : ''}
                        </span>
                      </td>

                      <td className="p-4 font-serif text-sm font-bold text-obsidian-950 whitespace-nowrap">
                        PKR {ord.total.toFixed(2)}
                      </td>

                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border flex items-center space-x-1.5 w-fit ${
                            isPaid
                              ? 'bg-sage-100 text-sage-800 border-sage-300'
                              : isCancelled
                              ? 'bg-red-100 text-red-800 border-red-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-sage-600' : isCancelled ? 'bg-red-600' : 'bg-amber-600'}`} />
                          <span>{ord.paymentStatus || ord.status}</span>
                        </span>
                      </td>

                      <td className="p-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="p-1.5 rounded-lg hover:bg-champagne-200 text-obsidian-600 hover:text-obsidian-950 transition-colors"
                            title="View Complete Order Dossier"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <a
                            href={`https://wa.me/92${(ord.customerPhone || '').replace(/^0|\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-700 transition-colors"
                            title="Contact Customer on WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>

                          {ord.orderType === 'SALE' && (
                            <button
                              onClick={() => handleDeleteOrder(ord)}
                              className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                              title="Delete Sale"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Luxury Infinite Scroll Status & Auto-Loader */}
        <AdminInfiniteTableFooter
          displayedCount={infiniteOrders.length}
          totalCount={displayedOrders.length}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
        />
      </div>

      {/* ========================================================================= */}
      {/* COMPLETE ORDER DOSSIER MODAL                                              */}
      {/* ========================================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-obsidian-950/80 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full border border-champagne-300 p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-start border-b border-champagne-200 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-gold-700 font-bold flex items-center space-x-1.5">
                  <span>{selectedOrder.orderType} DOSSIER</span>
                  <span>&bull;</span>
                  <span className="font-mono">#{selectedOrder.referenceNumber}</span>
                </span>
                <h3 className="font-serif text-2xl text-obsidian-950 font-light mt-1">
                  {selectedOrder.customerName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-full hover:bg-champagne-200 transition-colors text-obsidian-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Event Details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-champagne-50 rounded-2xl border border-champagne-200 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-obsidian-500 block">Phone Number</span>
                <p className="font-semibold text-obsidian-900 mt-0.5">{selectedOrder.customerPhone}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-obsidian-500 block">Email Address</span>
                <p className="font-semibold text-obsidian-900 mt-0.5 truncate">{selectedOrder.customerEmail}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-obsidian-500 block">Order Date</span>
                <p className="font-semibold text-obsidian-900 mt-0.5">{new Date(selectedOrder.date).toLocaleDateString()}</p>
              </div>
              <div className="col-span-2 sm:col-span-3 pt-2 border-t border-champagne-200">
                <span className="text-[10px] uppercase font-bold text-obsidian-500 block">Venue / Delivery Info</span>
                <p className="font-semibold text-obsidian-900 mt-0.5">{selectedOrder.location || 'Studio Pickup'}</p>
              </div>
            </div>

            {/* Itemized Matrix */}
            <div className="space-y-2">
              <h4 className="text-xs uppercase font-bold tracking-wider text-obsidian-800">
                Itemized Order Matrix
              </h4>
              <div className="border border-champagne-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-champagne-100/70 text-[10px] uppercase font-bold text-obsidian-700">
                    <tr>
                      <th className="p-3">Item Description</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-champagne-200">
                    {selectedOrder.itemsList && selectedOrder.itemsList.length > 0 ? (
                      selectedOrder.itemsList.map((it, i) => (
                        <tr key={i}>
                          <td className="p-3 font-medium text-obsidian-900">{it.name}</td>
                          <td className="p-3 text-center font-bold">{it.quantity}</td>
                          <td className="p-3 text-right font-mono">PKR {(it.unitPrice || 0).toFixed(2)}</td>
                          <td className="p-3 text-right font-mono font-bold text-gold-800">
                            PKR {(it.total || (it.unitPrice || 0) * (it.quantity || 1)).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-3 text-center text-obsidian-500">
                          {selectedOrder.itemsDescription}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Breakdown Card */}
            <div className="p-4 bg-champagne-100/80 rounded-2xl space-y-1.5 text-xs">
              <div className="flex justify-between text-obsidian-600">
                <span>Subtotal:</span>
                <span className="font-mono">PKR {(selectedOrder.subtotal || selectedOrder.total).toFixed(2)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-gold-800 font-semibold">
                  <span>Promotional Discount:</span>
                  <span className="font-mono">-PKR {selectedOrder.discount.toFixed(2)}</span>
                </div>
              )}
              {selectedOrder.deposit > 0 && (
                <div className="flex justify-between text-purple-800 font-semibold">
                  <span>Refundable Deposit:</span>
                  <span className="font-mono">PKR {selectedOrder.deposit.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-obsidian-950 pt-2 border-t border-champagne-300">
                <span>Total Valuation:</span>
                <span className="font-serif text-lg text-gold-800">PKR {selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Quick Status Adjust & Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-champagne-200">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-obsidian-700">Set Status:</span>
                <select
                  value={selectedOrder.paymentStatus || selectedOrder.status}
                  onChange={(e) => handleUpdatePaymentStatus(selectedOrder.id, selectedOrder.orderType, e.target.value)}
                  className="text-xs p-2 rounded-xl border border-champagne-300 bg-white font-semibold"
                >
                  <option value="PAID">PAID / APPROVED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href={`https://wa.me/92${(selectedOrder.customerPhone || '').replace(/^0|\D/g, '')}?text=Hello%20${encodeURIComponent(selectedOrder.customerName)},%20regarding%20your%20order%20%23${selectedOrder.referenceNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-full text-xs font-bold flex items-center space-x-1.5 hover:bg-emerald-700 shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-champagne-300 text-obsidian-800 rounded-full text-xs font-bold flex items-center space-x-1.5 hover:bg-champagne-100"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RECORD NEW SALE MODAL                                                     */}
      {/* ========================================================================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-obsidian-950/80 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full border border-champagne-300 p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold-700 font-bold">
                  Point of Sale
                </span>
                <h3 className="font-serif text-2xl text-obsidian-950 font-light mt-1">
                  Record Direct Sale & Auto-Deduct Stock
                </h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-2 rounded-full hover:bg-champagne-200 transition-colors text-obsidian-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSale} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => {
                      setFormData({ ...formData, customerName: e.target.value });
                      if (errors.customerName) setErrors({ ...errors, customerName: null });
                    }}
                    placeholder="e.g. Lady Victoria"
                    className={`w-full text-xs p-2.5 rounded-xl border bg-white focus:outline-none focus:border-gold-500 transition-colors ${
                      errors.customerName ? 'border-red-400 ring-1 ring-red-300' : 'border-champagne-300'
                    }`}
                  />
                  {errors.customerName && <p className="text-[10px] text-red-500 mt-1">{errors.customerName}</p>}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => {
                      setFormData({ ...formData, customerEmail: e.target.value });
                      if (errors.customerEmail) setErrors({ ...errors, customerEmail: null });
                    }}
                    placeholder="client@domain.com"
                    className={`w-full text-xs p-2.5 rounded-xl border bg-white focus:outline-none focus:border-gold-500 transition-colors ${
                      errors.customerEmail ? 'border-red-400 ring-1 ring-red-300' : 'border-champagne-300'
                    }`}
                  />
                  {errors.customerEmail && <p className="text-[10px] text-red-500 mt-1">{errors.customerEmail}</p>}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    placeholder="03140660985"
                    className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {/* Line Items Matrix */}
              <div className="space-y-2 pt-2 border-t border-champagne-200">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-xs uppercase tracking-wider font-semibold text-obsidian-800">
                      Line Items (Stock Deducted Automatically) *
                    </label>
                    {errors.items && <p className="text-[10px] text-red-500">{errors.items}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs text-gold-700 font-bold hover:underline"
                  >
                    + Add Item Row
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2 bg-champagne-50 p-2.5 rounded-xl">
                      <select
                        value={item.inventoryId}
                        onChange={(e) => handleItemChange(idx, 'inventoryId', e.target.value)}
                        className="flex-1 text-xs p-2 rounded-lg border border-champagne-300 bg-white"
                      >
                        <option value="">Custom Line Item</option>
                        {inventory.map((inv) => (
                          <option key={inv.id} value={inv.id}>
                            {inv.name} (Avail: {inv.availableQuantity})
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        required
                        value={item.itemName}
                        onChange={(e) => handleItemChange(idx, 'itemName', e.target.value)}
                        placeholder="Item Description"
                        className="flex-1 text-xs p-2 rounded-lg border border-champagne-300 bg-white"
                      />

                      <input
                        type="number"
                        min={1}
                        required
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                        placeholder="Qty"
                        className="w-16 text-xs p-2 rounded-lg border border-champagne-300 bg-white text-center"
                      />

                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        required
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                        placeholder="Price $"
                        className="w-20 text-xs p-2 rounded-lg border border-champagne-300 bg-white text-right"
                      />

                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-obsidian-600 font-semibold mb-1">
                    Discount (PKR)
                  </label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                    className="w-full text-xs p-2 rounded-lg border border-champagne-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-obsidian-600 font-semibold mb-1">
                    Tax (PKR)
                  </label>
                  <input
                    type="number"
                    value={formData.tax}
                    onChange={(e) => setFormData({ ...formData, tax: Number(e.target.value) })}
                    className="w-full text-xs p-2 rounded-lg border border-champagne-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-obsidian-600 font-semibold mb-1">
                    Payment Status
                  </label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-champagne-300 bg-white"
                  >
                    <option value="PAID">PAID</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-3 bg-champagne-100 rounded-2xl flex justify-between items-center text-sm font-bold">
                <span>Calculated Sale Total:</span>
                <span className="font-serif text-lg text-gold-800">PKR {calculateTotal().toFixed(2)}</span>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-champagne-200">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-champagne-300 text-xs uppercase tracking-wider text-obsidian-600 hover:bg-champagne-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-obsidian-900 text-ivory-50 rounded-full text-xs uppercase tracking-widest font-semibold hover:bg-gold-600 hover:text-obsidian-950 transition-colors shadow-md"
                >
                  {submitting ? 'Registering...' : 'Record Sale & Deduct Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
