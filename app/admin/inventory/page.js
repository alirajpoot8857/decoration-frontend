'use client';

import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../src/lib/api';
import { useToast } from '../../../src/context/ToastContext';
import { useConfirmModal } from '../../../src/context/ConfirmModalContext';
import LuxurySpinner from '../../../src/components/ui/LuxurySpinner';
import AdminInfiniteTableFooter, { useInfiniteTable } from '../../../src/components/ui/AdminInfiniteTable';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Search,
  CheckCircle2,
  RefreshCw,
  Layers,
  Crown,
  Sparkles,
  DollarSign,
  Clock,
  MapPin,
  X,
  FileText,
  Boxes,
  ShieldCheck,
  TrendingDown,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Chairs',
  'Tables',
  'Arches',
  'Lighting',
  'Centerpieces',
  'Candles',
  'Stage décor',
  'Backdrops',
  'Decorative props',
];

export default function AdminInventoryPage() {
  const { showToast } = useToast();
  const { confirmDelete } = useConfirmModal();
  const [inventory, setInventory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Infinite Scroll Engine
  const {
    displayedItems: infiniteInventory,
    hasMore,
    isLoadingMore,
    handleScroll,
  } = useInfiniteTable(inventory, 15, 15);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState(null);
  const [adjustDelta, setAdjustDelta] = useState(10);
  const [adjustReason, setAdjustReason] = useState('Restock shipment');

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'Centerpieces',
    quantity: 10,
    availableQuantity: 10,
    minThreshold: 3,
    purchaseCost: 50,
    rentalPrice: 15,
    hourlyRate: 3.5,
    location: 'Warehouse Bay A',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.getInventory({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchQuery || undefined,
        lowStock: lowStockOnly ? 'true' : undefined,
      });
      if (res.inventory) setInventory(res.inventory);
      if (res.summary) setSummary(res.summary);
    } catch (e) {
      console.warn('Failed to load inventory', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [selectedCategory, searchQuery, lowStockOnly]);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      sku: '',
      name: '',
      category: 'Centerpieces',
      quantity: 10,
      availableQuantity: 10,
      minThreshold: 3,
      purchaseCost: 50,
      rentalPrice: 15,
      hourlyRate: 3.5,
      location: 'Warehouse Bay A',
      notes: '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    const totalQty = Number(item.quantity) || 0;
    const availQty = item.availableQuantity !== undefined ? Number(item.availableQuantity) : totalQty;
    const rentPrice = Number(item.rentalPrice) || 0;
    const hrRate = item.hourlyRate !== undefined && item.hourlyRate !== null ? Number(item.hourlyRate) : +(rentPrice * 0.2).toFixed(2);

    setFormData({
      sku: item.sku || '',
      name: item.name || '',
      category: item.category || 'Centerpieces',
      quantity: totalQty,
      availableQuantity: availQty,
      minThreshold: item.minThreshold !== undefined ? Number(item.minThreshold) : 3,
      purchaseCost: item.purchaseCost !== undefined ? Number(item.purchaseCost) : 0,
      rentalPrice: rentPrice,
      hourlyRate: hrRate,
      location: item.location || '',
      notes: item.notes || '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU code is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (Number(formData.quantity) < 0) {
      newErrors.quantity = 'Total quantity cannot be negative';
    }
    if (Number(formData.availableQuantity) < 0) {
      newErrors.availableQuantity = 'Current stock cannot be negative';
    }
    if (Number(formData.availableQuantity) > Number(formData.quantity)) {
      newErrors.availableQuantity = 'Current stock cannot exceed total warehouse quantity';
    }
    if (Number(formData.rentalPrice) < 0) {
      newErrors.rentalPrice = 'Daily rate cannot be negative';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please resolve the form validation errors.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
        availableQuantity: Number(formData.availableQuantity),
        minThreshold: Number(formData.minThreshold),
        purchaseCost: Number(formData.purchaseCost),
        rentalPrice: Number(formData.rentalPrice),
        hourlyRate: Number(formData.hourlyRate),
      };

      if (editingItem) {
        await api.updateInventoryItem(editingItem.id, payload);
        showToast(`Asset "${formData.name}" updated with ${payload.availableQuantity} current stock!`, 'success');
      } else {
        await api.createInventoryItem(payload);
        showToast(`Added new item "${formData.name}" to inventory!`, 'success');
      }
      fetchInventory();
      setModalOpen(false);
      setErrors({});
    } catch (e) {
      const msg = e.data?.message || e.message || 'Failed to save inventory item';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id, name) => {
    confirmDelete({
      title: 'Delete Inventory Prop?',
      message: 'Are you sure you want to permanently delete this prop or equipment from inventory? Any historical records will remain intact.',
      itemName: name ? `Item: ${name}` : undefined,
      confirmText: 'Delete Permanently',
      onConfirm: async () => {
        try {
          await api.deleteInventoryItem(id);
          showToast(`Item "${name}" deleted successfully.`, 'info');
          fetchInventory();
        } catch (e) {
          showToast('Failed to delete item', 'error');
          throw e;
        }
      },
    });
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    if (!adjustingItem) return;
    try {
      await api.adjustInventoryStock(adjustingItem.id, {
        delta: Number(adjustDelta),
        reason: adjustReason,
      });
      showToast(`Adjusted stock by ${adjustDelta > 0 ? '+' : ''}${adjustDelta} units`, 'success');
      fetchInventory();
      setAdjustModalOpen(false);
    } catch (e) {
      showToast('Failed to adjust stock', 'error');
    }
  };

  // Dynamic status calculation inside modal
  const curStock = Number(formData.availableQuantity) || 0;
  const totStock = Number(formData.quantity) || 0;
  const minStock = Number(formData.minThreshold) || 0;
  const rentedStock = Math.max(0, totStock - curStock);
  const isOutOfStock = curStock <= 0;
  const isLowStock = curStock > 0 && curStock <= minStock;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-gold-700 text-[10px] uppercase tracking-[0.25em] font-semibold">
            <Package className="w-3.5 h-3.5" />
            <span>Stock & Warehouse Operations</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-obsidian-950 font-light mt-1">
            Inventory & Asset Management
          </h1>
          <p className="text-xs text-obsidian-500 font-light mt-1">
            Monitor real-time warehouse stock, rental reservations, pricing rates, and inventory thresholds.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-6 py-2.5 bg-obsidian-950 text-ivory-50 rounded-full text-xs uppercase tracking-widest font-semibold hover:bg-gold-600 hover:text-obsidian-950 transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4 text-gold-400" />
          <span>Add Inventory Item</span>
        </button>
      </div>

      {/* Summary Stats Row */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-champagne-300 shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-obsidian-400">Total Asset SKUs</span>
            <h4 className="font-serif text-2xl font-bold text-obsidian-950 mt-1">{summary.totalItems}</h4>
            <span className="text-[10px] text-obsidian-400">Active catalog lines</span>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-champagne-300 shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-obsidian-400">Current Available Stock</span>
            <h4 className="font-serif text-2xl font-bold text-sage-700 mt-1">{summary.totalAvailable} units</h4>
            <span className="text-[10px] text-sage-600 font-medium">Ready for instant dispatch</span>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-champagne-300 shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-obsidian-400">Low Stock Alert</span>
            <h4 className="font-serif text-2xl font-bold text-amber-700 mt-1">{summary.lowStockCount}</h4>
            <span className="text-[10px] text-amber-600">At or below threshold</span>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-champagne-300 shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-obsidian-400">Out of Stock</span>
            <h4 className="font-serif text-2xl font-bold text-red-700 mt-1">{summary.outOfStockCount}</h4>
            <span className="text-[10px] text-red-600">Requires procurement</span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-obsidian-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by SKU, product name, location bay..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-champagne-300 bg-white text-xs focus:outline-none focus:border-gold-500 shadow-sm"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold transition-all flex items-center space-x-1.5 ${
              lowStockOnly
                ? 'bg-amber-600 text-ivory-50 shadow-sm'
                : 'bg-white text-obsidian-700 border border-champagne-300 hover:bg-champagne-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock Only</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-champagne-300/80 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20">
            <LuxurySpinner size="lg" text="Loading inventory catalog..." />
          </div>
        ) : inventory.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="font-serif text-lg text-obsidian-800">No inventory records found.</p>
          </div>
        ) : (
          <div
            onScroll={handleScroll}
            className="overflow-x-auto max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gold-500/20"
          >
            <table className="w-full text-left text-xs text-obsidian-700">
              <thead className="bg-champagne-100/95 border-b border-champagne-200 text-[10px] uppercase font-bold tracking-wider text-obsidian-600 sticky top-0 z-10 backdrop-blur-md shadow-sm">
                <tr>
                  <th className="p-4 pl-6">SKU</th>
                  <th className="p-4">Item Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Current Stock / Total</th>
                  <th className="p-4">Rates (Day / Hr)</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-champagne-200">
                {infiniteInventory.map((item) => {
                  const isLow = item.availableQuantity <= item.minThreshold && item.availableQuantity > 0;
                  const isOut = item.availableQuantity <= 0;

                  return (
                    <tr key={item.id} className="hover:bg-champagne-50/50 transition-colors">
                      <td className="p-4 pl-6 font-mono font-bold text-gold-700">{item.sku}</td>
                      <td className="p-4 font-semibold text-obsidian-900">{item.name}</td>
                      <td className="p-4">{item.category}</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-obsidian-950 text-sm bg-champagne-100 px-2 py-0.5 rounded-md font-mono">
                            {item.availableQuantity}
                          </span>
                          <span className="text-obsidian-400">/ {item.quantity} total</span>
                        </div>
                        <span className="text-[10px] text-obsidian-400">Min Alert: {item.minThreshold}</span>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-obsidian-900">PKR {item.rentalPrice.toFixed(2)}/day</p>
                        <p className="text-[10px] text-obsidian-500">PKR {(item.hourlyRate || item.rentalPrice * 0.2).toFixed(2)}/hr</p>
                      </td>
                      <td className="p-4">{item.location || 'Warehouse Main'}</td>
                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                            isOut
                              ? 'bg-red-100 text-red-800 border-red-300'
                              : isLow
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-sage-100 text-sage-800 border-sage-300'
                          }`}
                        >
                          {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => {
                              setAdjustingItem(item);
                              setAdjustDelta(10);
                              setAdjustReason('Restock replenishment');
                              setAdjustModalOpen(true);
                            }}
                            className="p-1.5 bg-champagne-100 hover:bg-champagne-200 text-gold-800 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 transition-colors"
                            title="Restock / Adjust Quantity"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Adjust</span>
                          </button>
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 text-obsidian-700 hover:bg-champagne-100 rounded-lg transition-colors"
                            title="Edit Asset & Stock Levels"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Asset"
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
          displayedCount={infiniteInventory.length}
          totalCount={inventory.length}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
        />
      </div>

      {/* ========================================================================= */}
      {/* LUXURY EDIT & ADD INVENTORY ASSET MODAL                                   */}
      {/* ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-obsidian-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full border border-champagne-300/80 p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-champagne-200 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-2 text-gold-700 text-[10px] uppercase tracking-[0.25em] font-bold">
                  <Crown className="w-3.5 h-3.5 text-gold-600" />
                  <span>{editingItem ? 'EDIT ASSET SPECIFICATION' : 'NEW ATELIER ASSET'}</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl text-obsidian-950 font-light">
                  {editingItem ? `Modify ${editingItem.name}` : 'Register Inventory Asset'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-full hover:bg-champagne-200/80 transition-colors text-obsidian-400 hover:text-obsidian-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Card 1: Core Identification */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-obsidian-700 font-bold mb-1">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: null });
                      }}
                      placeholder="e.g. Antique Champagne Metal Flower Urn"
                      className={`w-full text-xs p-3 rounded-xl border bg-ivory-50/50 text-obsidian-900 focus:outline-none focus:bg-white focus:border-gold-500 focus:ring-1 focus:ring-gold-400 transition-all ${
                        errors.name ? 'border-red-400 ring-1 ring-red-300' : 'border-champagne-300'
                      }`}
                    />
                    {errors.name && <p className="text-[10px] text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-obsidian-700 font-bold mb-1">
                      SKU (Code) *
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => {
                        setFormData({ ...formData, sku: e.target.value });
                        if (errors.sku) setErrors({ ...errors, sku: null });
                      }}
                      placeholder="e.g. RENT-CEN-063"
                      className={`w-full text-xs p-3 rounded-xl border bg-ivory-50/50 font-mono font-bold text-gold-900 focus:outline-none focus:bg-white focus:border-gold-500 focus:ring-1 focus:ring-gold-400 transition-all ${
                        errors.sku ? 'border-red-400 ring-1 ring-red-300' : 'border-champagne-300'
                      }`}
                    />
                    {errors.sku && <p className="text-[10px] text-red-500 mt-1">{errors.sku}</p>}
                  </div>
                </div>
              </div>

              {/* Card 2: Stock & Inventory Reserves Matrix (Highlighted Luxury Panel) */}
              <div className="bg-gradient-to-br from-champagne-50/80 to-champagne-100/40 p-4 sm:p-5 rounded-2xl border border-champagne-300/80 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-obsidian-800">
                    <Boxes className="w-4 h-4 text-gold-600" />
                    <span>Warehouse Stock & Reserves Matrix</span>
                  </div>

                  {/* Dynamic Status Badge */}
                  <span
                    className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                      isOutOfStock
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : isLowStock
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-sage-100 text-sage-800 border-sage-300'
                    }`}
                  >
                    {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-obsidian-700 font-bold mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white font-medium focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-400"
                    >
                      {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-obsidian-700 font-bold mb-1">
                      Total Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.quantity}
                      onChange={(e) => {
                        const newTot = Number(e.target.value);
                        setFormData((prev) => ({
                          ...prev,
                          quantity: newTot,
                          availableQuantity: Math.min(prev.availableQuantity, newTot),
                        }));
                      }}
                      className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white font-mono font-bold text-center focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-400"
                    />
                    <span className="text-[9px] text-obsidian-400 block text-center mt-0.5">Total owned</span>
                  </div>

                  {/* CURRENT STOCK FIELD (Explicitly Highlighted) */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gold-900 font-bold mb-1">
                      Current Stock *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.availableQuantity}
                      onChange={(e) => {
                        const newAvail = Number(e.target.value);
                        setFormData((prev) => ({ ...prev, availableQuantity: newAvail }));
                        if (errors.availableQuantity) setErrors({ ...errors, availableQuantity: null });
                      }}
                      className={`w-full text-xs p-2.5 rounded-xl border bg-white font-mono font-bold text-center text-gold-950 ring-1 ring-gold-400/60 focus:outline-none focus:border-gold-600 focus:ring-2 focus:ring-gold-500 ${
                        errors.availableQuantity ? 'border-red-400 ring-red-300' : 'border-gold-400'
                      }`}
                    />
                    <span className="text-[9px] text-gold-700 font-semibold block text-center mt-0.5">Available to rent</span>
                    {errors.availableQuantity && <p className="text-[9px] text-red-500 text-center mt-0.5">{errors.availableQuantity}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-obsidian-700 font-bold mb-1">
                      Min Stock Alert
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.minThreshold}
                      onChange={(e) => setFormData({ ...formData, minThreshold: Number(e.target.value) })}
                      className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white font-mono text-center focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-400"
                    />
                    <span className="text-[9px] text-obsidian-400 block text-center mt-0.5">Alert trigger</span>
                  </div>
                </div>

                {/* Stock Progress Bar & Metrics */}
                <div className="pt-2 border-t border-champagne-200/60 flex items-center justify-between text-[11px] text-obsidian-600">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-obsidian-900">Reserve Allocation:</span>
                    <span className="px-2 py-0.5 rounded-md bg-sage-100 text-sage-800 font-bold font-mono">
                      {curStock} Available
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold font-mono">
                      {rentedStock} Rented/Out
                    </span>
                  </div>

                  <div className="w-28 bg-champagne-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-amber-500' : 'bg-sage-600'
                      }`}
                      style={{ width: `${totStock > 0 ? Math.min(100, (curStock / totStock) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Pricing & Rates Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-obsidian-700 font-bold mb-1">
                    Purchase Cost (PKR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-obsidian-400 text-[10px] font-mono font-bold">PKR</span>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={formData.purchaseCost}
                      onChange={(e) => setFormData({ ...formData, purchaseCost: Number(e.target.value) })}
                      className="w-full text-xs pl-10 pr-2.5 py-2.5 rounded-xl border border-champagne-300 bg-ivory-50/50 font-mono text-obsidian-900 focus:outline-none focus:bg-white focus:border-gold-500 focus:ring-1 focus:ring-gold-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-obsidian-700 font-bold mb-1">
                    Daily Rate (PKR/day)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-obsidian-400 text-[10px] font-mono font-bold">PKR</span>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={formData.rentalPrice}
                      onChange={(e) => setFormData({ ...formData, rentalPrice: Number(e.target.value) })}
                      className="w-full text-xs pl-10 pr-2.5 py-2.5 rounded-xl border border-champagne-300 bg-ivory-50/50 font-mono font-bold text-gold-900 focus:outline-none focus:bg-white focus:border-gold-500 focus:ring-1 focus:ring-gold-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-obsidian-700 font-bold mb-1">
                    Hourly Rate (PKR/hr)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-obsidian-400 text-[10px] font-mono font-bold">PKR</span>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                      className="w-full text-xs pl-10 pr-2.5 py-2.5 rounded-xl border border-champagne-300 bg-ivory-50/50 font-mono text-obsidian-900 focus:outline-none focus:bg-white focus:border-gold-500 focus:ring-1 focus:ring-gold-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-obsidian-700 font-bold mb-1">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-obsidian-400" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Warehouse Bay D"
                      className="w-full text-xs pl-8 pr-2.5 py-2.5 rounded-xl border border-champagne-300 bg-ivory-50/50 text-obsidian-900 focus:outline-none focus:bg-white focus:border-gold-500 focus:ring-1 focus:ring-gold-400"
                    />
                  </div>
                </div>
              </div>

              {/* Card 4: Optional Notes */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-obsidian-700 font-bold mb-1">
                  Atelier Specifications & Maintenance Notes
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Vintage gilded metal alloy with protective lacquer finish. Dust gently."
                  className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-ivory-50/50 text-obsidian-900 focus:outline-none focus:bg-white focus:border-gold-500"
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-champagne-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2.5 rounded-full border border-champagne-300 text-xs uppercase tracking-widest font-bold text-obsidian-600 hover:bg-champagne-100 hover:text-obsidian-900 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-2.5 bg-obsidian-950 hover:bg-gold-600 text-ivory-50 hover:text-obsidian-950 rounded-full text-xs uppercase tracking-widest font-bold transition-all shadow-md active:scale-95 flex items-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4 text-gold-400 group-hover:text-obsidian-950" />
                  <span>{saving ? 'Saving Asset...' : 'Save Inventory'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust / Restock Modal */}
      {adjustModalOpen && adjustingItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-obsidian-950/80 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-md w-full border border-champagne-300 p-6 sm:p-8 space-y-5">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-gold-700 font-bold">
                Stock Adjustment
              </span>
              <h3 className="font-serif text-xl text-obsidian-950 font-medium mt-1">
                {adjustingItem.name} ({adjustingItem.sku})
              </h3>
              <p className="text-xs text-obsidian-500 font-light mt-1">
                Current stock: {adjustingItem.availableQuantity} available ({adjustingItem.quantity} total)
              </p>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                  Delta Units (use + to restock, - to write off)
                </label>
                <input
                  type="number"
                  required
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(Number(e.target.value))}
                  className="w-full text-sm p-3 rounded-xl border border-champagne-300 bg-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                  Reason for Adjustment
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Restock delivery from supplier / Broken items"
                  className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-champagne-200">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-champagne-300 text-xs uppercase tracking-wider text-obsidian-600 hover:bg-champagne-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-obsidian-900 text-ivory-50 rounded-full text-xs uppercase tracking-widest font-semibold hover:bg-gold-600 transition-colors shadow-md"
                >
                  Apply Stock Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
