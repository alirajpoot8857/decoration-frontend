'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../src/lib/api';
import { useToast } from '../../../src/context/ToastContext';
import { useConfirmModal } from '../../../src/context/ConfirmModalContext';
import LuxurySpinner from '../../../src/components/ui/LuxurySpinner';
import useBodyScrollLock from '../../../src/hooks/useBodyScrollLock';
import { MessageSquare, Plus, Edit, Trash2, Star, CheckCircle2, X } from 'lucide-react';

export default function AdminTestimonialsPage() {
  const { showToast } = useToast();
  const { confirmDelete } = useConfirmModal();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);

  useBodyScrollLock(modalOpen);

  const [formData, setFormData] = useState({
    clientName: '',
    roleOrTitle: '',
    eventType: 'Luxury Wedding',
    comment: '',
    rating: 5,
    avatarUrl: '',
    isFeatured: true,
    isActive: true,
  });

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await api.getTestimonials({ activeOnly: 'false' });
      if (res.testimonials) setTestimonials(res.testimonials);
    } catch (e) {
      console.warn('Failed to load testimonials', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const [errors, setErrors] = useState({});

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      clientName: '',
      roleOrTitle: '',
      eventType: 'Luxury Wedding',
      comment: '',
      rating: 5,
      avatarUrl: '',
      isFeatured: true,
      isActive: true,
    });
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      clientName: item.clientName,
      roleOrTitle: item.roleOrTitle || '',
      eventType: item.eventType || 'Luxury Wedding',
      comment: item.comment,
      rating: item.rating,
      avatarUrl: item.avatarUrl || '',
      isFeatured: item.isFeatured,
      isActive: item.isActive,
    });
    setErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    } else if (formData.clientName.trim().length < 2) {
      newErrors.clientName = 'Client name must be at least 2 characters';
    }

    if (!formData.comment.trim()) {
      newErrors.comment = 'Review comment is required';
    } else if (formData.comment.trim().length < 5) {
      newErrors.comment = 'Comment must be at least 5 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please fix the errors in the testimonial form', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await api.updateTestimonial(editingItem.id, formData);
        showToast('Testimonial updated!', 'success');
      } else {
        await api.createTestimonial(formData);
        showToast('New testimonial created!', 'success');
      }
      fetchTestimonials();
      setModalOpen(false);
      setErrors({});
    } catch (e) {
      showToast('Failed to save testimonial', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id, name) => {
    confirmDelete({
      title: 'Delete Testimonial?',
      message: 'Are you sure you want to delete this client testimonial? It will no longer appear on your website.',
      itemName: name ? `Testimonial from: ${name}` : undefined,
      confirmText: 'Delete Permanently',
      onConfirm: async () => {
        try {
          await api.deleteTestimonial(id);
          showToast('Testimonial deleted successfully', 'info');
          fetchTestimonials();
        } catch (e) {
          showToast('Failed to delete testimonial', 'error');
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
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Reputation & Reviews</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-ivory-50 font-light mt-1">
            Client Testimonials & Press
          </h1>
          <p className="text-xs text-ivory-400 font-light mt-1">
            Publish social proof, client reviews, gala testimonials, and bridal praises.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 rounded-full text-xs uppercase tracking-widest font-bold hover:brightness-110 transition-all duration-300 shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* Testimonials Grid */}
      {loading ? (
        <div className="py-24">
          <LuxurySpinner size="lg" text="Loading client testimonials..." />
        </div>
      ) : testimonials.length === 0 ? (
        <div className="bg-[#0D0D12] rounded-3xl p-16 text-center border border-gold-500/20 space-y-2">
          <p className="font-serif text-lg text-ivory-300">No testimonials published.</p>
          <p className="text-xs text-ivory-500">Click "Add Testimonial" to publish client reviews.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-[#0D0D12] rounded-3xl p-6 border border-gold-500/20 hover:border-gold-500/40 shadow-xl flex flex-col justify-between space-y-4 transition-all duration-300 hover:scale-[1.01]"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex text-gold-400 space-x-1">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-gold-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400">
                    {t.eventType}
                  </span>
                </div>

                <p className="font-serif text-sm text-ivory-200 italic leading-relaxed">
                  “{t.comment}”
                </p>

                <div className="pt-2">
                  <h4 className="font-serif text-base font-semibold text-ivory-50">{t.clientName}</h4>
                  <p className="text-[11px] text-ivory-400">{t.roleOrTitle || 'Distinguished Host'}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end space-x-2">
                <button
                  onClick={() => openEditModal(t)}
                  className="p-2 text-ivory-300 hover:text-gold-300 bg-[#14141E] hover:bg-gold-500/10 border border-gold-500/30 rounded-xl transition-all"
                  title="Edit Testimonial"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(t.id, t.clientName)}
                  className="p-2 text-red-400 hover:text-red-200 bg-red-950/30 hover:bg-red-900/50 border border-red-500/20 rounded-xl transition-all"
                  title="Delete Testimonial"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[99999] overflow-hidden flex items-center justify-center p-3 sm:p-4 md:p-6 bg-obsidian-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative bg-[#0D0D12] text-ivory-50 rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full max-h-[92dvh] sm:max-h-[90dvh] flex flex-col border border-gold-500/30 p-5 sm:p-8 space-y-5 overflow-y-auto overscroll-contain">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold-400 font-bold">
                  {editingItem ? 'Edit Review' : 'Add Testimonial'}
                </span>
                <h3 className="font-serif text-2xl text-ivory-50 font-light mt-1">
                  {editingItem ? editingItem.clientName : 'New Review'}
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
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="Lady Eleanor Vance"
                    className="w-full text-xs p-2.5 rounded-xl border border-gold-500/30 bg-[#14141E] text-ivory-50 placeholder:text-ivory-600 focus:border-gold-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-ivory-300 font-semibold mb-1">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    value={formData.roleOrTitle}
                    onChange={(e) => setFormData({ ...formData, roleOrTitle: e.target.value })}
                    placeholder="Bride / Gala Chair"
                    className="w-full text-xs p-2.5 rounded-xl border border-gold-500/30 bg-[#14141E] text-ivory-50 placeholder:text-ivory-600 focus:border-gold-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-ivory-300 font-semibold mb-1">
                    Event Type
                  </label>
                  <input
                    type="text"
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    placeholder="Luxury Wedding"
                    className="w-full text-xs p-2.5 rounded-xl border border-gold-500/30 bg-[#14141E] text-ivory-50 placeholder:text-ivory-600 focus:border-gold-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-ivory-300 font-semibold mb-1">
                    Star Rating (1-5)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl border border-gold-500/30 bg-[#14141E] text-ivory-50 focus:border-gold-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-ivory-300 font-semibold mb-1">
                  Testimonial Quote *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="The sheer grandeur of the floral arches left our guests breathless..."
                  className="w-full text-xs p-2.5 rounded-xl border border-gold-500/30 bg-[#14141E] text-ivory-50 placeholder:text-ivory-600 focus:border-gold-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-ivory-300 font-semibold mb-1">
                  Avatar / Client Photo URL
                </label>
                <input
                  type="text"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs p-2.5 rounded-xl border border-gold-500/30 bg-[#14141E] text-ivory-50 placeholder:text-ivory-600 focus:border-gold-400 focus:outline-none"
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
                  {saving ? 'Saving...' : 'Save Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
