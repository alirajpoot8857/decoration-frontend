'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../src/lib/api';
import { useToast } from '../../../src/context/ToastContext';
import { useConfirmModal } from '../../../src/context/ConfirmModalContext';
import LuxurySpinner from '../../../src/components/ui/LuxurySpinner';
import { MessageSquare, Plus, Edit, Trash2, Star, CheckCircle2 } from 'lucide-react';

export default function AdminTestimonialsPage() {
  const { showToast } = useToast();
  const { confirmDelete } = useConfirmModal();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);

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
          <div className="inline-flex items-center space-x-2 text-gold-700 text-[10px] uppercase tracking-[0.25em] font-semibold">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Reputation & Reviews</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-obsidian-950 font-light">
            Client Testimonials & Press
          </h1>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-6 py-2.5 bg-obsidian-950 text-ivory-50 rounded-full text-xs uppercase tracking-widest font-semibold hover:bg-gold-600 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* Testimonials Grid */}
      {loading ? (
        <div className="py-20">
          <LuxurySpinner size="lg" text="Loading client testimonials..." />
        </div>
      ) : testimonials.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-champagne-300 space-y-2">
          <p className="font-serif text-lg text-obsidian-800">No testimonials published.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-3xl p-6 border border-champagne-300 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex text-gold-500 space-x-0.5">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-gold-500" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold-700">
                    {t.eventType}
                  </span>
                </div>

                <p className="font-serif text-sm text-obsidian-800 italic leading-relaxed">
                  “{t.comment}”
                </p>

                <div className="pt-2">
                  <h4 className="font-serif text-base font-semibold text-obsidian-950">{t.clientName}</h4>
                  <p className="text-[11px] text-obsidian-500">{t.roleOrTitle || 'Distinguished Host'}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-champagne-200 flex justify-end space-x-2">
                <button
                  onClick={() => openEditModal(t)}
                  className="p-1.5 text-obsidian-700 hover:bg-champagne-100 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(t.id, t.clientName)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-obsidian-950/80 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full border border-champagne-300 p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold-700 font-bold">
                  {editingItem ? 'Edit Review' : 'Add Testimonial'}
                </span>
                <h3 className="font-serif text-2xl text-obsidian-950 font-light mt-1">
                  {editingItem ? editingItem.clientName : 'New Review'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-full hover:bg-champagne-200 transition-colors text-obsidian-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="Lady Eleanor Vance"
                    className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    value={formData.roleOrTitle}
                    onChange={(e) => setFormData({ ...formData, roleOrTitle: e.target.value })}
                    placeholder="Bride / Gala Chair"
                    className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                    Event Type
                  </label>
                  <input
                    type="text"
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    placeholder="Luxury Wedding"
                    className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                    Star Rating (1-5)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                  Testimonial Quote *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="The sheer grandeur of the floral arches left our guests breathless..."
                  className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                  Avatar / Client Photo URL
                </label>
                <input
                  type="text"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-champagne-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-champagne-300 text-xs uppercase tracking-wider text-obsidian-600 hover:bg-champagne-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-obsidian-900 text-ivory-50 rounded-full text-xs uppercase tracking-widest font-semibold hover:bg-gold-600 transition-colors shadow-md"
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
