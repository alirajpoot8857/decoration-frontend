'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../src/lib/api';
import { useToast } from '../../../src/context/ToastContext';
import { useConfirmModal } from '../../../src/context/ConfirmModalContext';
import LuxurySpinner from '../../../src/components/ui/LuxurySpinner';
import {
  Crown,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  DollarSign,
  Sparkles,
  Star,
} from 'lucide-react';

export default function AdminPackagesPage() {
  const { showToast } = useToast();
  const { confirmDelete } = useConfirmModal();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    tier: 'SIGNATURE',
    tagline: '',
    description: '',
    price: '',
    duration: '',
    guestCapacity: '',
    featuresText: '',
    isRecommended: false,
    isActive: true,
  });

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await api.getPackages({ includeInactive: 'true' });
      if (res.packages) setPackages(res.packages);
    } catch (e) {
      console.warn('Failed to load packages', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const openCreateModal = () => {
    setEditingPkg(null);
    setFormData({
      name: '',
      tier: 'SIGNATURE',
      tagline: '',
      description: '',
      price: '',
      duration: 'Full Day Setup',
      guestCapacity: 'Up to 200 Guests',
      featuresText: 'Bespoke Stage Architecture\nPremium Fresh Florals\nIntelligent Ambient Lighting\nSilk Ceiling Draping\nDedicated Coordination Team',
      isRecommended: false,
      isActive: true,
    });
    setEditModalOpen(true);
  };

  const openEditModal = (pkg) => {
    setEditingPkg(pkg);
    const feats = Array.isArray(pkg.features)
      ? pkg.features
      : typeof pkg.features === 'string'
      ? JSON.parse(pkg.features || '[]')
      : [];

    setFormData({
      name: pkg.name,
      tier: pkg.tier,
      tagline: pkg.tagline || '',
      description: pkg.description || '',
      price: pkg.price,
      duration: pkg.duration || '',
      guestCapacity: pkg.guestCapacity || '',
      featuresText: feats.join('\n'),
      isRecommended: pkg.isRecommended,
      isActive: pkg.isActive,
    });
    setEditModalOpen(true);
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
        name: formData.name,
        tier: formData.tier,
        tagline: formData.tagline,
        description: formData.description,
        price: Number(formData.price),
        duration: formData.duration,
        guestCapacity: formData.guestCapacity,
        features: featuresArray,
        isRecommended: formData.isRecommended,
        isActive: formData.isActive,
      };

      if (editingPkg) {
        await api.updatePackage(editingPkg.id, payload);
        showToast(`Package "${formData.name}" updated successfully!`, 'success');
      } else {
        await api.createPackage(payload);
        showToast(`New package "${formData.name}" created!`, 'success');
      }

      fetchPackages();
      setEditModalOpen(false);
    } catch (e) {
      const msg = e.data?.message || e.message || 'Failed to save package';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id, name) => {
    confirmDelete({
      title: 'Delete Package?',
      message: 'Are you sure you want to delete this event decoration package? Clients will no longer be able to book it.',
      itemName: name ? `Package: ${name}` : undefined,
      confirmText: 'Delete Permanently',
      onConfirm: async () => {
        try {
          await api.deletePackage(id);
          showToast(`Package "${name}" deleted successfully`, 'info');
          fetchPackages();
        } catch (e) {
          showToast('Failed to delete package', 'error');
          throw e;
        }
      },
    });
  };

  const handleToggleRecommended = async (pkg) => {
    try {
      await api.updatePackage(pkg.id, { isRecommended: !pkg.isRecommended });
      showToast(`Updated recommended status for ${pkg.name}`, 'success');
      fetchPackages();
    } catch (e) {
      showToast('Failed to toggle recommended', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-gold-700 text-[10px] uppercase tracking-[0.25em] font-semibold">
            <Crown className="w-3.5 h-3.5" />
            <span>Pricing & Packaging Atelier</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-obsidian-950 font-light">
            Décor Collections & Pricing
          </h1>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-6 py-2.5 bg-obsidian-950 text-ivory-50 rounded-full text-xs uppercase tracking-widest font-semibold hover:bg-gold-600 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Package</span>
        </button>
      </div>

      {/* Packages Grid */}
      {loading ? (
        <div className="py-20">
          <LuxurySpinner size="lg" text="Loading luxury packages..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const feats = Array.isArray(pkg.features)
              ? pkg.features
              : typeof pkg.features === 'string'
              ? JSON.parse(pkg.features || '[]')
              : [];

            return (
              <div
                key={pkg.id}
                className={`bg-white border rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between relative transition-all ${
                  pkg.isRecommended ? 'border-gold-500 shadow-luxury' : 'border-champagne-300'
                }`}
              >
                {pkg.isRecommended && (
                  <span className="absolute -top-3 left-6 bg-gold-500 text-obsidian-950 font-bold text-[9px] uppercase tracking-widest px-3 py-0.5 rounded-full shadow-sm">
                    ★ Recommended
                  </span>
                )}

                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gold-700">
                      {pkg.tier}
                    </span>
                    <button
                      onClick={() => handleToggleRecommended(pkg)}
                      title="Toggle Recommended"
                      className={`p-1.5 rounded-full transition-colors ${
                        pkg.isRecommended
                          ? 'text-gold-500 hover:text-gold-700 bg-gold-50'
                          : 'text-obsidian-300 hover:text-gold-500'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${pkg.isRecommended ? 'fill-gold-500' : ''}`} />
                    </button>
                  </div>

                  <h3 className="font-serif text-2xl text-obsidian-950 font-medium">{pkg.name}</h3>
                  <p className="text-xs text-obsidian-500 font-light mt-1 mb-4">{pkg.tagline}</p>

                  <div className="py-3 border-y border-champagne-200 mb-4 flex items-baseline justify-between">
                    <div>
                      <span className="font-serif text-3xl font-bold text-obsidian-950">
                        PKR {Number(pkg.price).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-obsidian-500"> / event</span>
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        pkg.isActive ? 'bg-sage-100 text-sage-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {pkg.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <div className="space-y-1.5 mb-6">
                    <p className="text-[10px] uppercase tracking-widest text-obsidian-400 font-semibold">
                      Features ({feats.length}):
                    </p>
                    <ul className="space-y-1 text-xs text-obsidian-600 font-light">
                      {feats.slice(0, 5).map((f, i) => (
                        <li key={i} className="flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-gold-600 flex-shrink-0" />
                          <span className="truncate">{f}</span>
                        </li>
                      ))}
                      {feats.length > 5 && (
                        <li className="text-[10px] text-gold-700 font-semibold pl-5">
                          + {feats.length - 5} more inclusions
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-champagne-200 flex items-center justify-between">
                  <button
                    onClick={() => openEditModal(pkg)}
                    className="px-4 py-2 bg-champagne-100 hover:bg-champagne-200 text-obsidian-900 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit / Change Price</span>
                  </button>

                  <button
                    onClick={() => handleDelete(pkg.id, pkg.name)}
                    className="p-2 text-red-500 hover:text-red-700 rounded-xl hover:bg-red-50 transition-colors"
                    title="Delete Package"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Create Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-obsidian-950/80 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full border border-champagne-300 p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold-700 font-bold">
                  {editingPkg ? 'Edit Collection' : 'New Collection'}
                </span>
                <h3 className="font-serif text-2xl text-obsidian-950 font-light mt-1">
                  {editingPkg ? `Modify ${editingPkg.name}` : 'Create Luxury Package'}
                </h3>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-2 rounded-full hover:bg-champagne-200 transition-colors text-obsidian-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Signature Grandeur"
                    className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                    Tier *
                  </label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white"
                  >
                    <option value="ESSENTIAL">ESSENTIAL</option>
                    <option value="SIGNATURE">SIGNATURE</option>
                    <option value="ROYAL">ROYAL</option>
                    <option value="BESPOKE">BESPOKE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                    Price (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="6500"
                    className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="Full Day Setup"
                    className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                    Guest Capacity
                  </label>
                  <input
                    type="text"
                    value={formData.guestCapacity}
                    onChange={(e) => setFormData({ ...formData, guestCapacity: e.target.value })}
                    placeholder="Up to 250 Guests"
                    className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Our premier all-inclusive luxury experience"
                  className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                  Full Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                  Included Features (One per line)
                </label>
                <textarea
                  rows={4}
                  value={formData.featuresText}
                  onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                  placeholder="Bespoke Grand Stage Architecture&#10;Up to 20 Fresh Floral Centerpieces&#10;Hanging Crystal Chandeliers"
                  className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white font-mono"
                />
              </div>

              <div className="flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isRecommended}
                    onChange={(e) => setFormData({ ...formData, isRecommended: e.target.checked })}
                    className="rounded text-gold-600 focus:ring-gold-500 w-4 h-4"
                  />
                  <span>Mark as Recommended (Featured Badge)</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-gold-600 focus:ring-gold-500 w-4 h-4"
                  />
                  <span>Active on Public Website</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-champagne-200">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-champagne-300 text-xs uppercase tracking-wider text-obsidian-600 hover:bg-champagne-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-obsidian-900 text-ivory-50 rounded-full text-xs uppercase tracking-widest font-semibold hover:bg-gold-600 transition-colors shadow-md"
                >
                  {saving ? 'Saving...' : 'Save Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
