'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import api from '../../../src/lib/api';
import { useToast } from '../../../src/context/ToastContext';
import { useConfirmModal } from '../../../src/context/ConfirmModalContext';
import LuxurySpinner from '../../../src/components/ui/LuxurySpinner';
import AdminInfiniteTableFooter, { useInfiniteTable } from '../../../src/components/ui/AdminInfiniteTable';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit,
  Star,
  Upload,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Sparkles,
  Eye,
  X,
  MessageCircle,
  Mail,
  Phone,
  Layers,
  Crown,
} from 'lucide-react';

const CATEGORIES = [
  'Luxury weddings',
  'Floral stages',
  'Mehndi setups',
  'Birthday themes',
  'Outdoor décor',
  'Reception tables',
  'Entrance décor',
  'Romantic candle setups',
];

export default function AdminGalleryPage() {
  const { showToast } = useToast();
  const { confirmDelete } = useConfirmModal();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'portfolio'

  // Orders / Commissions State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState(false);

  // Infinite Scroll Engine for Orders
  const {
    displayedItems: infiniteOrders,
    hasMore,
    isLoadingMore,
    handleScroll,
  } = useInfiniteTable(orders, 15, 15);

  // Portfolio Images State
  const [images, setImages] = useState([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Luxury weddings',
    description: '',
    imageUrl: '',
    isFeatured: false,
    displayOrder: 0,
    tagsText: 'Luxury, Florals, Gold',
  });

  // Fetch Gallery Orders / Commissions
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await api.getBookings({
        status: orderStatusFilter === 'All' ? undefined : orderStatusFilter,
        search: orderSearchQuery || undefined,
      });
      if (res.bookings) setOrders(res.bookings);
    } catch (e) {
      console.warn('Failed to load gallery orders', e);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch Gallery Portfolio Images
  const fetchGallery = async () => {
    setPortfolioLoading(true);
    try {
      const res = await api.getGallery({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        includeInactive: 'true',
      });
      if (res.images) setImages(res.images);
    } catch (e) {
      console.warn('Failed to load gallery images', e);
    } finally {
      setPortfolioLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [orderStatusFilter, orderSearchQuery]);

  useEffect(() => {
    fetchGallery();
  }, [selectedCategory]);

  const handleUpdateOrderStatus = async (id, newStatus) => {
    setUpdatingOrderStatus(true);
    try {
      await api.updateBookingStatus(id, { status: newStatus });
      showToast(`Gallery order status updated to ${newStatus}`, 'success');
      fetchOrders();
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (e) {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdatingOrderStatus(false);
    }
  };

  const openCreateModal = () => {
    setEditingImage(null);
    setFormData({
      title: '',
      category: 'Luxury weddings',
      description: '',
      imageUrl: '',
      isFeatured: false,
      displayOrder: images.length + 1,
      tagsText: 'Luxury, Grand Stage, Crystal',
    });
    setUploadModalOpen(true);
  };

  const openEditModal = (img) => {
    setEditingImage(img);
    const tags = Array.isArray(img.tags)
      ? img.tags
      : typeof img.tags === 'string'
      ? JSON.parse(img.tags || '[]')
      : [];

    setFormData({
      title: img.title,
      category: img.category,
      description: img.description || '',
      imageUrl: img.imageUrl,
      isFeatured: img.isFeatured,
      displayOrder: img.displayOrder,
      tagsText: tags.join(', '),
    });
    setUploadModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const res = await api.uploadImage(file);
      if (res.url) {
        setFormData((prev) => ({ ...prev, imageUrl: res.url }));
        showToast('Image uploaded successfully', 'success');
      }
    } catch (e) {
      showToast('Image upload failed. You can also paste an image URL.', 'error');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      showToast('Image URL or uploaded file is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const tagsArray = formData.tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        imageUrl: formData.imageUrl,
        isFeatured: formData.isFeatured,
        displayOrder: Number(formData.displayOrder),
        tags: tagsArray,
      };

      if (editingImage) {
        await api.updateGalleryImage(editingImage.id, payload);
        showToast('Gallery image updated', 'success');
      } else {
        await api.createGalleryImage(payload);
        showToast('Gallery image created', 'success');
      }
      setUploadModalOpen(false);
      fetchGallery();
    } catch (e) {
      showToast('Failed to save gallery item', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id, title = '') => {
    confirmDelete({
      title: 'Remove Gallery Piece?',
      message: 'Are you sure you want to remove this showcase piece from your portfolio gallery? It will no longer be visible to prospective clients.',
      itemName: title ? `Gallery Piece: ${title}` : undefined,
      confirmText: 'Remove Permanently',
      onConfirm: async () => {
        try {
          await api.deleteGalleryImage(id);
          showToast('Gallery image removed successfully', 'success');
          fetchGallery();
        } catch (e) {
          showToast('Failed to delete image', 'error');
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
          <div className="inline-flex items-center space-x-2 text-gold-700 text-[10px] uppercase tracking-[0.25em] font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>Gallery Scénographie Atelier</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-obsidian-950 font-light">
            Gallery Orders & Visual Portfolio
          </h1>
          <p className="text-xs text-obsidian-500 font-light mt-1">
            Manage bespoke design orders, client stage commissions, and the high-resolution photo portfolio.
          </p>
        </div>

        {/* Top Tab Switcher */}
        <div className="flex items-center space-x-2 bg-ivory-50 p-1.5 rounded-full border border-champagne-300 shadow-sm">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2 rounded-full text-xs uppercase tracking-wider font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'orders'
                ? 'bg-obsidian-950 text-ivory-50 shadow-md'
                : 'text-obsidian-700 hover:text-gold-700'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-gold-400" />
            <span>Gallery Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-5 py-2 rounded-full text-xs uppercase tracking-wider font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'portfolio'
                ? 'bg-obsidian-950 text-ivory-50 shadow-md'
                : 'text-obsidian-700 hover:text-gold-700'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-gold-400" />
            <span>Media Portfolio ({images.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: GALLERY ORDERS & BESPOKE COMMISSIONS                               */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-obsidian-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                placeholder="Search gallery orders by client, venue, booking ref..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-champagne-300 bg-white text-xs focus:outline-none focus:border-gold-500 shadow-sm"
              />
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['All', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3.5 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
                    orderStatusFilter === st
                      ? 'bg-gold-600 text-obsidian-950 font-bold shadow-sm'
                      : 'bg-white text-obsidian-700 border border-champagne-300 hover:bg-champagne-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white border border-champagne-300/80 rounded-3xl overflow-hidden shadow-sm">
            {ordersLoading ? (
              <div className="py-20">
                <LuxurySpinner size="lg" text="Loading gallery orders & bespoke commissions..." />
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <p className="font-serif text-lg text-obsidian-800">No gallery orders found.</p>
                <p className="text-xs text-obsidian-500">Try changing status filters or search term.</p>
              </div>
            ) : (
              <div onScroll={handleScroll} className="overflow-x-auto max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gold-500/20">
                <table className="w-full text-left text-xs text-obsidian-700">
                  <thead className="bg-champagne-100/95 border-b border-champagne-200 text-[9px] uppercase font-bold tracking-wider text-obsidian-600 sticky top-0 z-10 backdrop-blur-md shadow-sm">
                    <tr>
                      <th className="py-2.5 px-3 pl-4">Order Ref</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Style & Event</th>
                      <th className="py-2.5 px-3">Venue & Date</th>
                      <th className="py-2.5 px-3">Budget</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-champagne-200">
                    {infiniteOrders.map((b) => (
                      <tr key={b.id} className="hover:bg-champagne-50/70 transition-colors">
                        <td className="py-2.5 px-3 pl-4">
                          <span className="font-mono font-bold text-gold-700 text-xs block">{b.bookingNumber}</span>
                          <span className="text-[9px] text-obsidian-400">{new Date(b.createdAt).toLocaleDateString()}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-obsidian-950 text-xs truncate max-w-[140px]">{b.customerName}</p>
                          <p className="text-[10px] text-obsidian-500 font-mono truncate max-w-[140px]">{b.customerPhone}</p>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center px-1.5 py-0.2 text-[8px] rounded-full bg-gold-500/10 text-gold-800 font-bold uppercase mb-0.5">
                            {b.eventType}
                          </span>
                          <p className="font-medium text-obsidian-900 text-[11px] truncate max-w-[170px]">{b.packageName || 'Bespoke Scénographie'}</p>
                        </td>
                        <td className="py-2.5 px-3">
                          <p className="font-medium text-obsidian-900 text-[11px] flex items-center truncate max-w-[150px]">
                            <MapPin className="w-2.5 h-2.5 text-gold-600 mr-1 flex-shrink-0" />
                            <span className="truncate">{b.venue}</span>
                          </p>
                          <p className="text-[9px] text-obsidian-500">
                            {new Date(b.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-xs font-bold text-obsidian-950">
                          PKR {(b.totalAmount || b.budget || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3">
                          <select
                            value={b.status}
                            disabled={updatingOrderStatus}
                            onChange={(e) => handleUpdateOrderStatus(b.id, e.target.value)}
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none ${
                              b.status === 'CONFIRMED' || b.status === 'COMPLETED'
                                ? 'bg-sage-100 text-sage-800 border-sage-300'
                                : b.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : b.status === 'IN_PROGRESS'
                                ? 'bg-gold-100 text-gold-900 border-gold-300'
                                : 'bg-red-100 text-red-800 border-red-300'
                            }`}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="IN_PROGRESS">IN PROGRESS</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-3 pr-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(b)}
                            className="px-2.5 py-1 bg-obsidian-950 hover:bg-gold-600 text-ivory-50 hover:text-obsidian-950 font-semibold text-[11px] rounded-lg transition-all shadow-sm inline-flex items-center space-x-1"
                          >
                            <Eye className="w-3 h-3 text-gold-400" />
                            <span>Dossier</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {orders.length > 0 && (
              <AdminInfiniteTableFooter
                displayedCount={infiniteOrders.length}
                totalCount={orders.length}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
              />
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PORTFOLIO MEDIA CATALOG                                            */}
      {/* ========================================================================= */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Category Filter Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
                  selectedCategory === 'All'
                    ? 'bg-obsidian-950 text-ivory-50 shadow-sm'
                    : 'bg-white text-obsidian-700 border border-champagne-300 hover:bg-champagne-100'
                }`}
              >
                All Categories ({images.length})
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-gold-600 text-obsidian-950 font-bold shadow-sm'
                      : 'bg-white text-obsidian-700 border border-champagne-300 hover:bg-champagne-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-obsidian-950 text-ivory-50 rounded-full text-xs uppercase tracking-widest font-semibold hover:bg-gold-600 transition-colors shadow-sm flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Gallery Piece</span>
            </button>
          </div>

          {/* Images Grid */}
          {portfolioLoading ? (
            <div className="py-20">
              <LuxurySpinner size="lg" text="Loading media portfolio..." />
            </div>
          ) : images.length === 0 ? (
            <div className="bg-white border border-champagne-300/80 rounded-3xl p-12 text-center space-y-2">
              <p className="font-serif text-lg text-obsidian-800">No images in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="bg-white border border-champagne-300/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
                >
                  <div className="relative h-48 w-full bg-champagne-100">
                    <Image src={img.imageUrl} alt={img.title} fill className="object-cover" />
                    {img.isFeatured && (
                      <span className="absolute top-3 left-3 bg-gold-500 text-obsidian-950 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full flex items-center shadow-sm">
                        <Star className="w-2.5 h-2.5 mr-1 fill-obsidian-950" /> Featured
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gold-700 tracking-wider">
                        {img.category}
                      </span>
                      <h4 className="font-serif text-base font-semibold text-obsidian-900 line-clamp-1">
                        {img.title}
                      </h4>
                      {img.description && (
                        <p className="text-xs text-obsidian-500 font-light line-clamp-2 mt-1">
                          {img.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-champagne-200 flex items-center justify-between">
                      <button
                        onClick={() => openEditModal(img)}
                        className="text-xs text-obsidian-700 hover:text-gold-700 font-semibold flex items-center"
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(img.id, img.title)}
                        className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* COMPLETE GALLERY ORDER DOSSIER MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[99999] overflow-y-auto flex items-center justify-center p-3 sm:p-6 bg-obsidian-950/85 backdrop-blur-md">
          <div
            className="relative bg-ivory-50 text-obsidian-950 border border-gold-500/60 rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] select-none"
            style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6), 0 0 25px rgba(212,175,55,0.3)' }}
          >
            {/* Modal Header */}
            <div className="p-6 bg-obsidian-950 text-ivory-50 border-b border-gold-500/30 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm font-bold text-gold-400">
                    #{selectedOrder.bookingNumber}
                  </span>
                  <span
                    className={`text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                      selectedOrder.status === 'CONFIRMED' || selectedOrder.status === 'COMPLETED'
                        ? 'bg-sage-900 text-sage-200 border-sage-500'
                        : selectedOrder.status === 'PENDING'
                        ? 'bg-amber-900 text-amber-200 border-amber-500'
                        : 'bg-gold-900 text-gold-200 border-gold-500'
                    }`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-light text-ivory-50">
                  Gallery Commission Complete Dossier
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-full hover:bg-white/10 text-ivory-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Customer & Location Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Client Information */}
                <div className="p-4 bg-white rounded-2xl border border-champagne-300 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-gold-700 tracking-wider flex items-center space-x-1">
                    <User className="w-3 h-3 text-gold-600" />
                    <span>Customer Information</span>
                  </span>
                  <p className="font-serif text-base font-bold text-obsidian-950">{selectedOrder.customerName}</p>
                  <p className="text-obsidian-600 flex items-center">
                    <Mail className="w-3 h-3 text-obsidian-400 mr-1.5" />
                    <a href={`mailto:${selectedOrder.customerEmail}`} className="hover:underline text-gold-800 font-medium">
                      {selectedOrder.customerEmail}
                    </a>
                  </p>
                  <p className="text-obsidian-600 flex items-center font-mono">
                    <Phone className="w-3 h-3 text-obsidian-400 mr-1.5" />
                    <span>{selectedOrder.customerPhone}</span>
                  </p>

                  <a
                    href={`https://wa.me/${selectedOrder.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hello ${selectedOrder.customerName}, this is Lumière Décor regarding your gallery order #${selectedOrder.bookingNumber}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-semibold text-[11px] transition-colors mt-2"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>

                {/* Event Schedule & Venue */}
                <div className="p-4 bg-white rounded-2xl border border-champagne-300 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-gold-700 tracking-wider flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-gold-600" />
                    <span>Venue & Date Schedule</span>
                  </span>
                  <p className="text-xs text-obsidian-900 font-semibold leading-relaxed">
                    {selectedOrder.venue || 'Venue to be confirmed'}
                  </p>
                  <p className="text-obsidian-600 font-medium flex items-center">
                    <Calendar className="w-3 h-3 text-gold-600 mr-1.5" />
                    <span>{new Date(selectedOrder.eventDate).toLocaleDateString('en-US', { dateStyle: 'full' })}</span>
                  </p>
                  <p className="text-obsidian-500">
                    Guest Count: <strong className="text-obsidian-800">{selectedOrder.guestCount || 50} guests</strong>
                  </p>
                </div>
              </div>

              {/* Commission Details */}
              <div className="p-4 bg-champagne-100/70 rounded-2xl border border-champagne-300 space-y-3">
                <div className="flex justify-between items-center border-b border-champagne-300 pb-2">
                  <span className="text-xs uppercase font-bold text-obsidian-900">Commissioned Installation</span>
                  <span className="text-xs uppercase font-bold text-gold-800">{selectedOrder.eventType}</span>
                </div>
                <p className="font-serif text-base font-semibold text-obsidian-950">
                  {selectedOrder.packageName || 'Bespoke Gallery Scénographie Experience'}
                </p>
                {selectedOrder.specialRequests && (
                  <div className="p-3 bg-white/80 rounded-xl border border-champagne-300 text-xs">
                    <strong className="text-obsidian-900 block mb-1">Client Styling & Special Requests:</strong>
                    <p className="text-obsidian-600 font-light leading-relaxed">{selectedOrder.specialRequests}</p>
                  </div>
                )}
                <div className="pt-2 flex justify-between items-baseline font-bold text-obsidian-950">
                  <span className="text-sm">Total Quoted Budget:</span>
                  <span className="font-serif text-xl text-gold-800">
                    PKR {(selectedOrder.totalAmount || selectedOrder.budget || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 bg-white border-t border-champagne-300 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase text-obsidian-600">Update Status:</span>
                {selectedOrder.status === 'PENDING' && (
                  <button
                    disabled={updatingOrderStatus}
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'CONFIRMED')}
                    className="px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-colors shadow-sm"
                  >
                    Confirm Booking
                  </button>
                )}
                {selectedOrder.status === 'CONFIRMED' && (
                  <button
                    disabled={updatingOrderStatus}
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'IN_PROGRESS')}
                    className="px-4 py-2 bg-gold-600 hover:bg-gold-700 text-obsidian-950 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors shadow-sm"
                  >
                    Mark In Production
                  </button>
                )}
                {selectedOrder.status === 'IN_PROGRESS' && (
                  <button
                    disabled={updatingOrderStatus}
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'COMPLETED')}
                    className="px-4 py-2 bg-obsidian-950 hover:bg-gold-600 text-ivory-50 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors shadow-sm"
                  >
                    Mark Completed
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 border border-champagne-300 rounded-xl font-semibold text-xs uppercase tracking-wider text-obsidian-700 hover:bg-champagne-100 transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload/Edit Image Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full border border-champagne-300 p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold-700 font-bold">
                  Portfolio Curator
                </span>
                <h3 className="font-serif text-2xl text-obsidian-950 font-light mt-1">
                  {editingImage ? 'Edit Gallery Piece' : 'Add New Portfolio Piece'}
                </h3>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="p-2 rounded-full hover:bg-champagne-200 transition-colors text-obsidian-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                  Installation Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. The Gilded Versailles Floral Canopy"
                  className="w-full text-xs p-3 rounded-xl border border-champagne-300 bg-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-champagne-300 bg-white focus:outline-none focus:border-gold-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-champagne-300 bg-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                  Upload Image File
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                  className="w-full text-xs p-2 rounded-xl border border-champagne-300 bg-white file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gold-500 file:text-obsidian-950"
                />
                {uploadingFile && <p className="text-[10px] text-gold-700 mt-1">Uploading high-res image...</p>}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                  Or Paste Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs p-3 rounded-xl border border-champagne-300 bg-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Artistic concept, botanicals used, and lighting setup..."
                  className="w-full text-xs p-3 rounded-xl border border-champagne-300 bg-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                  Aesthetic Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tagsText}
                  onChange={(e) => setFormData({ ...formData, tagsText: e.target.value })}
                  placeholder="Luxury, Floral, Gold, Wedding"
                  className="w-full text-xs p-3 rounded-xl border border-champagne-300 bg-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-gold-600 rounded border-champagne-300 focus:ring-gold-500"
                />
                <label htmlFor="isFeatured" className="text-xs text-obsidian-700 font-medium">
                  Feature this installation on Homepage Carousel & Top Portfolio
                </label>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-champagne-200">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-champagne-300 text-xs font-semibold text-obsidian-600 hover:bg-champagne-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-full bg-obsidian-950 hover:bg-gold-600 text-ivory-50 text-xs font-semibold uppercase tracking-wider transition-colors shadow-md"
                >
                  {saving ? 'Saving Piece...' : 'Save Gallery Piece'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
