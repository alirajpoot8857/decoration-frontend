'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../../src/lib/api';
import { useToast } from '../../../src/context/ToastContext';
import { useConfirmModal } from '../../../src/context/ConfirmModalContext';
import LuxurySpinner from '../../../src/components/ui/LuxurySpinner';
import AdminInfiniteTableFooter, { useInfiniteTable } from '../../../src/components/ui/AdminInfiniteTable';
import useBodyScrollLock from '../../../src/hooks/useBodyScrollLock';
import {
  Truck,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  Calendar,
  DollarSign,
  Package,
  Eye,
  RefreshCw,
  X,
  Printer,
  Boxes,
  Building,
  Mail,
  Phone,
} from 'lucide-react';

export default function AdminPurchasesPage() {
  const { showToast } = useToast();
  const { confirmDelete } = useConfirmModal();
  const [purchases, setPurchases] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'PAID' | 'UNPAID'
  const [dateFilter, setDateFilter] = useState('All'); // 'Today' | 'Yesterday' | 'Last 7 Days' | 'All'

  // Selected Purchase Order Dossier Modal
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  // New Procurement Order Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useBodyScrollLock(Boolean(selectedPurchase || createModalOpen));

  const [formData, setFormData] = useState({
    supplierName: '',
    supplierContact: '',
    tax: 0,
    paymentStatus: 'PAID',
    notes: '',
    items: [{ inventoryId: '', itemName: '', quantity: 10, unitCost: 20 }],
  });

  const fetchPurchases = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    try {
      const [pRes, iRes] = await Promise.all([
        api.getPurchases({
          search: searchQuery || undefined,
          paymentStatus: statusFilter === 'All' ? undefined : statusFilter,
        }),
        api.getInventory().catch(() => ({ inventory: [] })),
      ]);

      if (pRes && pRes.purchases) setPurchases(pRes.purchases);
      if (iRes && iRes.inventory) setInventory(iRes.inventory);
    } catch (e) {
      console.warn('Failed to load purchases', e);
      if (!isSilent) showToast('Failed to load purchase records', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, statusFilter, showToast]);

  // Initial load
  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  // Live auto-refresh polling every 10 seconds & on window focus
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPurchases(true);
    }, 10000);

    const onFocus = () => fetchPurchases(true);
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchPurchases]);

  // Date filtering
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
  const startOf7Days = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);

  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      if (dateFilter === 'All') return true;
      const pDate = new Date(p.purchaseDate || p.createdAt);
      if (dateFilter === 'Today') return pDate >= startOfToday;
      if (dateFilter === 'Yesterday') return pDate >= startOfYesterday && pDate < startOfToday;
      if (dateFilter === 'Last 7 Days') return pDate >= startOf7Days;
      return true;
    });
  }, [purchases, dateFilter, startOfToday, startOfYesterday, startOf7Days]);

  // Infinite Scroll Engine
  const {
    displayedItems: infinitePurchases,
    hasMore,
    isLoadingMore,
    handleScroll,
  } = useInfiniteTable(filteredPurchases, 15, 15);

  const todayPurchases = purchases.filter((p) => new Date(p.purchaseDate || p.createdAt) >= startOfToday);
  const todaySpend = todayPurchases.reduce((sum, p) => sum + (p.total || 0), 0);
  const totalProcurementSpend = purchases.reduce((sum, p) => sum + (p.total || 0), 0);
  const totalRestockedUnits = purchases.reduce((sum, p) => sum + (p.items?.reduce((isum, i) => isum + (i.quantity || 0), 0) || 0), 0);

  // Form handling
  const handleAddItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { inventoryId: '', itemName: '', quantity: 10, unitCost: 20 }],
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
          updated[idx].unitCost = inv.purchaseCost || 20;
        }
      }
      return { ...prev, items: updated };
    });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitCost) || 0), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + (Number(formData.tax) || 0);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.supplierName.trim()) {
      newErrors.supplierName = 'Supplier name is required.';
    } else if (formData.supplierName.trim().length < 2) {
      newErrors.supplierName = 'Supplier name must be at least 2 characters.';
    }

    if (!formData.items || formData.items.length === 0) {
      newErrors.items = 'Please add at least one line item.';
    } else {
      const itemErrors = [];
      formData.items.forEach((item, idx) => {
        if (!item.itemName.trim()) itemErrors.push(`Item #${idx + 1}: Description cannot be empty`);
        if (Number(item.quantity) < 1) itemErrors.push(`Item #${idx + 1}: Quantity must be >= 1`);
        if (Number(item.unitCost) < 0) itemErrors.push(`Item #${idx + 1}: Unit cost cannot be negative`);
      });
      if (itemErrors.length > 0) newErrors.items = itemErrors.join(', ');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreatePurchase = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please resolve errors before submitting purchase order.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.createPurchase(formData);
      showToast('Purchase order created & inventory auto-incremented!', 'success');
      fetchPurchases();
      setCreateModalOpen(false);
      setErrors({});
    } catch (e) {
      const msg = e.data?.message || e.message || 'Failed to create purchase';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.updatePurchaseStatus(id, { paymentStatus: newStatus });
      showToast(`Payment status updated to ${newStatus}`, 'success');
      fetchPurchases(true);
      if (selectedPurchase) setSelectedPurchase((prev) => (prev ? { ...prev, paymentStatus: newStatus } : null));
    } catch (e) {
      showToast('Failed to update payment status', 'error');
    }
  };

  const handleDeletePurchase = (purchase) => {
    confirmDelete({
      title: 'Delete Purchase Order?',
      message: 'Are you sure you want to permanently delete this procurement purchase order? This record will be expunged from the supplier ledger.',
      itemName: purchase?.purchaseNumber ? `PO #${purchase.purchaseNumber}` : undefined,
      confirmText: 'Delete Permanently',
      onConfirm: async () => {
        try {
          await api.deletePurchase(purchase.id);
          showToast(`Purchase order #${purchase.purchaseNumber} deleted successfully`, 'info');
          setSelectedPurchase(null);
          fetchPurchases();
        } catch (e) {
          showToast('Failed to delete purchase order', 'error');
          throw e;
        }
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-gold-400 text-[10px] uppercase tracking-[0.25em] font-semibold">
            <Truck className="w-3.5 h-3.5" />
            <span>Procurement, Inbound Logistics & Vendor Ledger</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-ivory-50 font-light mt-1">
            Purchases & Supplier Ledger
          </h1>
          <p className="text-xs text-ivory-400 font-light mt-1">
            Track wholesale décor procurement orders, vendor payables, and automatic inventory warehouse restocking.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchPurchases(true)}
            disabled={refreshing}
            className="p-2.5 bg-[#14141E] border border-gold-500/30 rounded-full text-ivory-300 hover:text-gold-300 hover:border-gold-500/50 transition-colors shadow-sm"
            title="Auto-refreshes every 10s. Click to refresh immediately."
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-gold-400' : ''}`} />
          </button>

          <button
            onClick={() => {
              setFormData({
                supplierName: '',
                supplierContact: '',
                tax: 0,
                paymentStatus: 'PAID',
                notes: '',
                items: [{ inventoryId: '', itemName: '', quantity: 10, unitCost: 20 }],
              });
              setErrors({});
              setCreateModalOpen(true);
            }}
            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 rounded-full text-xs uppercase tracking-widest font-bold hover:brightness-110 transition-all duration-300 shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Procurement Order</span>
          </button>
        </div>
      </div>

      {/* Dynamic Performance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spend */}
        <div className="bg-[#0D0D12] p-5 rounded-3xl border border-gold-500/20 shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-center text-ivory-400 text-[11px] font-semibold uppercase tracking-wider">
            <span>Total Procurement</span>
            <span className="px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-300 border border-gold-500/30 text-[10px] font-bold">All Time</span>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-ivory-50 mt-2">
            PKR {totalProcurementSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-ivory-400 mt-1">
            Across {purchases.length} supplier purchase orders
          </p>
        </div>

        {/* Restocked Units */}
        <div className="bg-[#0D0D12] p-5 rounded-3xl border border-gold-500/20 shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-center text-ivory-400 text-[11px] font-semibold uppercase tracking-wider">
            <span>Restocked Assets</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">Inbound</span>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-emerald-400 mt-2">
            {totalRestockedUnits.toLocaleString()} Units
          </p>
          <p className="text-[10px] text-ivory-400 mt-1">
            Added to warehouse inventory
          </p>
        </div>

        {/* Today's Procurement */}
        <div className="bg-[#0D0D12] p-5 rounded-3xl border border-gold-500/20 shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-center text-ivory-400 text-[11px] font-semibold uppercase tracking-wider">
            <span>Today's Spend</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-500/30 text-[10px] font-bold">Today</span>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-amber-300 mt-2">
            PKR {todaySpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-ivory-400 mt-1">
            {todayPurchases.length} purchase order(s) today
          </p>
        </div>

        {/* Active Suppliers */}
        <div className="bg-[#0D0D12] p-5 rounded-3xl border border-gold-500/20 shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-center text-ivory-400 text-[11px] font-semibold uppercase tracking-wider">
            <span>Active Suppliers</span>
            <span className="px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-300 border border-gold-500/30 text-[10px] font-bold">Vendors</span>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-ivory-50 mt-2">
            {new Set(purchases.map((p) => p.supplierName)).size} Vendors
          </p>
          <p className="text-[10px] text-ivory-400 mt-1">
            Verified wholesale manufacturers
          </p>
        </div>
      </div>

      {/* Toolbar: Search & Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-[#0D0D12] p-3 rounded-2xl border border-gold-500/20 shadow-xl">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gold-400/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by PO #, supplier name, item..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gold-500/30 bg-[#14141E] text-ivory-50 placeholder:text-ivory-600 text-xs focus:outline-none focus:border-gold-400 shadow-inner"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Payment Status Tabs */}
          <div className="flex items-center space-x-1 bg-[#14141E] p-1 rounded-full border border-gold-500/30 text-xs font-semibold">
            {['All', 'PAID', 'UNPAID'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full transition-all ${
                  statusFilter === st
                    ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 font-bold shadow-sm'
                    : 'text-ivory-300 hover:text-ivory-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Date Filter Tabs */}
          <div className="flex items-center space-x-1 bg-[#14141E] p-1 rounded-full border border-gold-500/30 text-xs font-semibold">
            {['All', 'Today', 'Yesterday', 'Last 7 Days'].map((d) => (
              <button
                key={d}
                onClick={() => setDateFilter(d)}
                className={`px-3 py-1 rounded-full transition-all ${
                  dateFilter === d
                    ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40 shadow-sm'
                    : 'text-ivory-300 hover:text-ivory-50'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-[#0D0D12] border border-gold-500/20 rounded-3xl overflow-hidden shadow-xl text-ivory-100">
        {loading ? (
          <div className="py-24">
            <LuxurySpinner size="lg" text="Loading procurement & restock ledger..." />
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="p-3 bg-gold-500/10 border border-gold-500/30 text-gold-400 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <p className="font-serif text-xl text-ivory-50">No procurement records found.</p>
            <p className="text-xs text-ivory-400 max-w-sm mx-auto">
              Create a new purchase order to record wholesale purchases and auto-increment stock levels.
            </p>
            <button
              onClick={() => {
                setStatusFilter('All');
                setDateFilter('All');
                setSearchQuery('');
              }}
              className="text-xs uppercase tracking-widest text-gold-400 font-bold underline hover:text-gold-300"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div
            onScroll={handleScroll}
            className="overflow-x-auto max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gold-500/20"
          >
            <table className="w-full text-left text-xs">
              <thead className="bg-[#14141E] border-b border-gold-500/20 text-[10px] uppercase font-bold tracking-wider text-gold-400 sticky top-0 z-10 backdrop-blur-md shadow-sm">
                <tr>
                  <th className="p-4 pl-6">PO Ref #</th>
                  <th className="p-4">Supplier / Vendor</th>
                  <th className="p-4">Order Date</th>
                  <th className="p-4">Inbound Line Items</th>
                  <th className="p-4">Total Cost</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {infinitePurchases.map((p) => {
                  const isPaid = p.paymentStatus === 'PAID';
                  const totalUnits = p.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0;

                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedPurchase(p)}
                      className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                    >
                      <td className="p-4 pl-6 font-mono font-bold text-gold-400 group-hover:text-gold-300">
                        #{p.purchaseNumber}
                      </td>

                      <td className="p-4">
                        <p className="font-semibold text-ivory-50 group-hover:text-gold-300 transition-colors">
                          {p.supplierName}
                        </p>
                        <p className="text-[10px] text-ivory-400">
                          {p.supplierContact || 'Wholesale Supplier'}
                        </p>
                      </td>

                      <td className="p-4 whitespace-nowrap text-ivory-300">
                        {new Date(p.purchaseDate || p.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="p-4 max-w-xs">
                        <p className="font-medium text-ivory-100 truncate">
                          {p.items?.map((it) => `${it.itemName} (x${it.quantity})`).join(', ') || 'Inbound Supplies'}
                        </p>
                        <span className="text-[10px] text-emerald-400 font-semibold">
                          +{totalUnits} restocked units &bull; {p.items?.length || 0} line items
                        </span>
                      </td>

                      <td className="p-4 font-serif text-sm font-bold text-ivory-50 whitespace-nowrap">
                        PKR {p.total.toFixed(2)}
                      </td>

                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border flex items-center space-x-1.5 w-fit ${
                            isPaid
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-950/60 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          <span>{p.paymentStatus}</span>
                        </span>
                      </td>

                      <td className="p-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setSelectedPurchase(p)}
                            className="p-1.5 rounded-lg bg-[#14141E] hover:bg-gold-500/10 text-ivory-300 hover:text-gold-300 border border-gold-500/30 transition-all"
                            title="View Purchase Dossier"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeletePurchase(p)}
                            className="p-1.5 rounded-lg bg-red-950/30 hover:bg-red-900/50 text-red-400 hover:text-red-200 border border-red-500/20 transition-all"
                            title="Delete Purchase Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
          displayedCount={infinitePurchases.length}
          totalCount={filteredPurchases.length}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
        />
      </div>

      {/* ========================================================================= */}
      {/* PURCHASE ORDER DOSSIER MODAL                                              */}
      {/* ========================================================================= */}
      {selectedPurchase && (
        <div className="fixed inset-0 z-[99999] overflow-hidden flex items-center justify-center p-3 sm:p-4 md:p-6 bg-obsidian-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative bg-[#0D0D12] text-ivory-50 rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full max-h-[92dvh] sm:max-h-[90dvh] flex flex-col border border-gold-500/30 p-5 sm:p-8 space-y-5 overflow-y-auto overscroll-contain">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-gold-400 font-bold flex items-center space-x-1.5">
                  <span>PROCUREMENT DOSSIER</span>
                  <span>&bull;</span>
                  <span className="font-mono text-gold-300">#{selectedPurchase.purchaseNumber}</span>
                </span>
                <h3 className="font-serif text-2xl text-ivory-50 font-light mt-1">
                  {selectedPurchase.supplierName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPurchase(null)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-ivory-400 hover:text-ivory-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Supplier & Date Info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-[#14141E] rounded-2xl border border-gold-500/20 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-ivory-400 block">Supplier Contact</span>
                <p className="font-semibold text-ivory-50 mt-0.5">{selectedPurchase.supplierContact || 'Direct Wholesaler'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-ivory-400 block">Purchase Date</span>
                <p className="font-semibold text-ivory-50 mt-0.5">{new Date(selectedPurchase.purchaseDate || selectedPurchase.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-ivory-400 block">Payment State</span>
                <p className="font-semibold text-gold-400 mt-0.5">{selectedPurchase.paymentStatus}</p>
              </div>
              {selectedPurchase.notes && (
                <div className="col-span-2 sm:col-span-3 pt-2 border-t border-white/10">
                  <span className="text-[10px] uppercase font-bold text-ivory-400 block">Notes & Shipping Ref</span>
                  <p className="font-semibold text-ivory-200 mt-0.5">{selectedPurchase.notes}</p>
                </div>
              )}
            </div>

            {/* Itemized Inbound Table */}
            <div className="space-y-2">
              <h4 className="text-xs uppercase font-bold tracking-wider text-gold-400">
                Supplied Items Matrix (Inventory Restocked)
              </h4>
              <div className="border border-gold-500/20 rounded-2xl overflow-hidden bg-[#14141E]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#08080C] text-[10px] uppercase font-bold text-gold-400 border-b border-gold-500/20">
                    <tr>
                      <th className="p-3">Item Description</th>
                      <th className="p-3 text-center">Restocked Qty</th>
                      <th className="p-3 text-right">Unit Cost</th>
                      <th className="p-3 text-right">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {selectedPurchase.items?.map((it, i) => (
                      <tr key={i}>
                        <td className="p-3 font-medium text-ivory-50">{it.itemName}</td>
                        <td className="p-3 text-center font-bold text-emerald-400">+{it.quantity}</td>
                        <td className="p-3 text-right font-mono text-ivory-300">PKR {(it.unitCost || 0).toFixed(2)}</td>
                        <td className="p-3 text-right font-mono font-bold text-gold-400">
                          PKR {(it.total || (it.unitCost || 0) * (it.quantity || 1)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-[#14141E] border border-gold-500/20 rounded-2xl space-y-1.5 text-xs">
              <div className="flex justify-between text-ivory-300">
                <span>Gross Inbound Subtotal:</span>
                <span className="font-mono">PKR {(selectedPurchase.subtotal || selectedPurchase.total).toFixed(2)}</span>
              </div>
              {selectedPurchase.tax > 0 && (
                <div className="flex justify-between text-ivory-300">
                  <span>Shipping & Tax:</span>
                  <span className="font-mono">+PKR {selectedPurchase.tax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-ivory-50 pt-2 border-t border-white/10">
                <span>Total PO Valuation:</span>
                <span className="font-serif text-lg text-gold-400">PKR {selectedPurchase.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-ivory-300">Payment Status:</span>
                <select
                  value={selectedPurchase.paymentStatus}
                  onChange={(e) => handleUpdateStatus(selectedPurchase.id, e.target.value)}
                  className="text-xs p-2 rounded-xl border border-gold-500/30 bg-[#14141E] text-ivory-50 font-semibold focus:outline-none focus:border-gold-400"
                >
                  <option value="PAID">PAID</option>
                  <option value="UNPAID">UNPAID</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-gold-500/30 text-ivory-200 hover:text-gold-300 bg-[#14141E] hover:bg-gold-500/10 rounded-full text-xs font-bold flex items-center space-x-1.5 transition-all"
                >
                  <Printer className="w-3.5 h-3.5 text-gold-400" />
                  <span>Print PO Receipt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* NEW PROCUREMENT MODAL                                                     */}
      {/* ========================================================================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-[99999] overflow-hidden flex items-center justify-center p-3 sm:p-4 md:p-6 bg-obsidian-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative bg-[#0D0D12] text-ivory-50 rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full max-h-[92dvh] sm:max-h-[90dvh] flex flex-col border border-gold-500/30 p-5 sm:p-8 space-y-5 overflow-y-auto overscroll-contain">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold-400 font-bold">
                  Procurement Order
                </span>
                <h3 className="font-serif text-2xl text-ivory-50 font-light mt-1">
                  Record Inbound Purchase & Restock Inventory
                </h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-ivory-400 hover:text-ivory-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePurchase} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-ivory-300 font-semibold mb-1">
                    Supplier / Vendor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.supplierName}
                    onChange={(e) => {
                      setFormData({ ...formData, supplierName: e.target.value });
                      if (errors.supplierName) setErrors({ ...errors, supplierName: null });
                    }}
                    placeholder="e.g. Dutch Floral Import Co."
                    className={`w-full text-xs p-2.5 rounded-xl border bg-[#14141E] text-ivory-50 placeholder:text-ivory-600 focus:outline-none focus:border-gold-400 transition-colors ${
                      errors.supplierName ? 'border-red-400 ring-1 ring-red-400' : 'border-gold-500/30'
                    }`}
                  />
                  {errors.supplierName && <p className="text-[10px] text-red-400 mt-1">{errors.supplierName}</p>}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-ivory-300 font-semibold mb-1">
                    Supplier Contact (Email / Phone)
                  </label>
                  <input
                    type="text"
                    value={formData.supplierContact}
                    onChange={(e) => setFormData({ ...formData, supplierContact: e.target.value })}
                    placeholder="orders@supplier.com"
                    className="w-full text-xs p-2.5 rounded-xl border border-gold-500/30 bg-[#14141E] text-ivory-50 placeholder:text-ivory-600 focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-xs uppercase tracking-wider font-semibold text-gold-400">
                      Line Items (Auto-Increments Warehouse Stock) *
                    </label>
                    {errors.items && <p className="text-[10px] text-red-400">{errors.items}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs text-gold-400 hover:text-gold-300 font-bold hover:underline"
                  >
                    + Add Item Row
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2 bg-[#14141E] p-2.5 rounded-xl border border-white/5">
                      <select
                        value={item.inventoryId}
                        onChange={(e) => handleItemChange(idx, 'inventoryId', e.target.value)}
                        className="flex-1 text-xs p-2 rounded-lg border border-gold-500/30 bg-[#08080C] text-ivory-50 focus:border-gold-400 focus:outline-none"
                      >
                        <option value="">Link to Existing Inventory...</option>
                        {inventory.map((inv) => (
                          <option key={inv.id} value={inv.id}>
                            {inv.name} (Current: {inv.quantity})
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        required
                        value={item.itemName}
                        onChange={(e) => handleItemChange(idx, 'itemName', e.target.value)}
                        placeholder="Item Description"
                        className="flex-1 text-xs p-2 rounded-lg border border-gold-500/30 bg-[#08080C] text-ivory-50 placeholder:text-ivory-600 focus:border-gold-400 focus:outline-none"
                      />

                      <input
                        type="number"
                        min={1}
                        required
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                        placeholder="Qty"
                        className="w-16 text-xs p-2 rounded-lg border border-gold-500/30 bg-[#08080C] text-ivory-50 text-center focus:border-gold-400 focus:outline-none"
                      />

                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        required
                        value={item.unitCost}
                        onChange={(e) => handleItemChange(idx, 'unitCost', Number(e.target.value))}
                        placeholder="Cost $"
                        className="w-20 text-xs p-2 rounded-lg border border-gold-500/30 bg-[#08080C] text-ivory-50 text-right focus:border-gold-400 focus:outline-none"
                      />

                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-ivory-300 font-semibold mb-1">
                    Shipping / Taxes (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={formData.tax}
                    onChange={(e) => setFormData({ ...formData, tax: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl border border-gold-500/30 bg-[#14141E] text-ivory-50 focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-ivory-300 font-semibold mb-1">
                    Payment Status
                  </label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-gold-500/30 bg-[#14141E] text-ivory-50 focus:outline-none focus:border-gold-400"
                  >
                    <option value="PAID">PAID</option>
                    <option value="UNPAID">UNPAID</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-ivory-300 font-semibold mb-1">
                  Procurement Notes / Tracking Details
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Inbound freight tracking #, delivery docket reference..."
                  className="w-full text-xs p-2.5 rounded-xl border border-gold-500/30 bg-[#14141E] text-ivory-50 placeholder:text-ivory-600 focus:outline-none focus:border-gold-400"
                />
              </div>

              {/* Total Calculation Display */}
              <div className="p-4 bg-[#14141E] border border-gold-500/20 rounded-2xl flex justify-between items-center text-xs">
                <span className="text-ivory-300 uppercase tracking-wider font-semibold">Total PO Valuation:</span>
                <span className="font-serif text-xl font-bold text-gold-400">
                  PKR {calculateTotal().toFixed(2)}
                </span>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-white/20 text-xs uppercase tracking-wider text-ivory-300 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 rounded-full text-xs uppercase tracking-widest font-bold hover:brightness-110 transition-all shadow-md"
                >
                  {submitting ? 'Creating Order...' : 'Confirm & Restock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
