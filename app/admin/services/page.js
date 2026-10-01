'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import api from '../../../src/lib/api';
import { useToast } from '../../../src/context/ToastContext';
import { useConfirmModal } from '../../../src/context/ConfirmModalContext';
import LuxurySpinner from '../../../src/components/ui/LuxurySpinner';
import useBodyScrollLock from '../../../src/hooks/useBodyScrollLock';
import { Layers, Plus, Edit, Trash2, CheckCircle2, X } from 'lucide-react';

export default function AdminServicesPage() {
  const { showToast } = useToast();
  const { confirmDelete } = useConfirmModal();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [saving, setSaving] = useState(false);

  useBodyScrollLock(modalOpen);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    slug: '',
    description: '',
    priceStartingAt: 3500,
    imageUrl: '',
    featuresText: '',
    isActive: true,
  });

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.getServices();
      if (res.services) setServices(res.services);
    } catch (e) {
      console.warn('Failed to load services', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openCreateModal = () => {
    setEditingService(null);
    setFormData({
      title: '',
      subtitle: '',
      slug: '',
      description: '',
      priceStartingAt: 3500,
      imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop',
      featuresText: 'Bespoke Spatial Concept\nFull Floral Styling\nLighting Architecture',
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (s) => {
    setEditingService(s);
    const feats = Array.isArray(s.features)
      ? s.features
      : typeof s.features === 'string'
      ? JSON.parse(s.features || '[]')
      : [];

    setFormData({
      title: s.title,
      subtitle: s.subtitle || '',
      slug: s.slug,
      description: s.description,
      priceStartingAt: s.priceStartingAt,
      imageUrl: s.imageUrl,
      featuresText: feats.join('\n'),
      isActive: s.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const featuresArray = formData.featuresText
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      const payload = {
        title: formData.title,
        subtitle: formData.subtitle,
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: formData.description,
        priceStartingAt: Number(formData.priceStartingAt),
        imageUrl: formData.imageUrl,
        features: featuresArray,
        isActive: formData.isActive,
      };

      if (editingService) {
        await api.updateService(editingService.id, payload);
        showToast('Service updated successfully!', 'success');
      } else {
        await api.createService(payload);
        showToast('New service created!', 'success');
      }
      fetchServices();
      setModalOpen(false);
    } catch (e) {
      showToast('Failed to save service', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id, title) => {
    confirmDelete({
      title: 'Delete Service?',
      message: 'Are you sure you want to delete this design discipline service? It will no longer be visible on your website.',
      itemName: title ? `Service: ${title}` : undefined,
      confirmText: 'Delete Permanently',
      onConfirm: async () => {
        try {
          await api.deleteService(id);
          showToast('Service deleted successfully', 'info');
          fetchServices();
        } catch (e) {
          showToast('Failed to delete service', 'error');
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
            <Layers className="w-3.5 h-3.5" />
            <span>Service Disciplines</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-ivory-50 font-light mt-1">
            Décor Service Offerings
          </h1>
          <p className="text-xs text-ivory-400 font-light mt-1">
            Manage your signature décor disciplines, starting prices, and spatial inclusions.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 rounded-full text-xs uppercase tracking-widest font-bold hover:brightness-110 transition-all duration-300 shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service Offering</span>
        </button>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="py-24">
          <LuxurySpinner size="lg" text="Loading atelier services..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((s) => {
            const feats = Array.isArray(s.features)
              ? s.features
              : typeof s.features === 'string'
              ? JSON.parse(s.features || '[]')
              : [];

            return (
              <div
                key={s.id}
                className="bg-[#0D0D12] rounded-3xl p-6 border border-gold-500/20 hover:border-gold-500/40 shadow-xl flex flex-col justify-between space-y-4 transition-all duration-300 hover:scale-[1.01]"
              >
                <div className="space-y-3">
                  <div className="relative h-48 rounded-2xl overflow-hidden bg-[#14141E] border border-white/5">
                    <Image src={s.imageUrl} alt={s.title} fill className="object-cover" />
                    <span className="absolute bottom-3 left-3 bg-[#08080C]/85 backdrop-blur-md text-gold-300 border border-gold-500/30 text-[10px] uppercase tracking-wider px-3 py-1 rounded-full font-semibold shadow-sm">
                      Starting PKR {Number(s.priceStartingAt).toLocaleString()}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl text-ivory-50 font-medium">{s.title}</h3>
                  <p className="text-xs text-ivory-400 font-light leading-relaxed">{s.description}</p>

                  <div className="space-y-1.5 pt-2">
                    <p className="text-[10px] uppercase tracking-widest text-gold-400/80 font-semibold">
                      Inclusions:
                    </p>
                    <ul className="grid grid-cols-2 gap-1.5 text-xs text-ivory-300 font-light">
                      {feats.map((f, i) => (
                        <li key={i} className="flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
                          <span className="truncate">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-end space-x-2">
                  <button
                    onClick={() => openEditModal(s)}
                    className="p-2 text-ivory-300 hover:text-gold-300 bg-[#14141E] hover:bg-gold-500/10 border border-gold-500/30 rounded-xl transition-all"
                    title="Edit Service"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id, s.title)}
                    className="p-2 text-red-400 hover:text-red-200 bg-red-950/30 hover:bg-red-900/50 border border-red-500/20 rounded-xl transition-all"
                    title="Delete Service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[99999] overflow-hidden flex items-center justify-center p-3 sm:p-4 md:p-6 bg-obsidian-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative bg-[#0D0D12] text-ivory-50 rounded-3xl overflow-hidden shadow-2xl max-w-xl w-full max-h-[92dvh] sm:max-h-[90dvh] flex flex-col border border-gold-500/30 p-5 sm:p-8 space-y-5 overflow-y-auto overscroll-contain">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold-400 font-bold">
                  {editingService ? 'Edit Discipline' : 'New Discipline'}
                </span>
                <h3 className="font-serif text-2xl text-ivory-50 font-light mt-1">
                  {editingService ? editingService.title : 'Create Service'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-ivory-400 hover:text-ivory-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-ivory-300 font-semibold mb-1">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Wedding Décor & Scénographie"
                    className="w-full text-xs p-2.5 rounded-xl border border-gold-500/30 bg-[#14141E] text-ivory-50 placeholder:text-ivory-600 focus:border-gold-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-ivory-300 font-semibold mb-1">
                    Starting Price (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.priceStartingAt}
                    onChange={(e) => setFormData({ ...formData, priceStartingAt: e.target.value })}
                    placeholder="3500"
                    className="w-full text-xs p-2.5 rounded-xl border border-gold-500/30 bg-[#14141E] text-ivory-50 placeholder:text-ivory-600 focus:border-gold-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-ivory-300 font-semibold mb-1">
                  Image URL *
                </label>
                <input
                  type="text"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-gold-500/30 bg-[#14141E] text-ivory-50 placeholder:text-ivory-600 focus:border-gold-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-ivory-300 font-semibold mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-gold-500/30 bg-[#14141E] text-ivory-50 placeholder:text-ivory-600 focus:border-gold-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-ivory-300 font-semibold mb-1">
                  Features & Scope (One per line)
                </label>
                <textarea
                  rows={3}
                  value={formData.featuresText}
                  onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-gold-500/30 bg-[#14141E] text-ivory-50 placeholder:text-ivory-600 focus:border-gold-400 focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-white/20 text-xs uppercase tracking-wider text-ivory-300 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 rounded-full text-xs uppercase tracking-widest font-bold hover:brightness-110 transition-all shadow-md"
                >
                  {saving ? 'Saving...' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
