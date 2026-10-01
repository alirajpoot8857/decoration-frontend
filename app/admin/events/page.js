'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../src/lib/api';
import { useToast } from '../../../src/context/ToastContext';
import { useConfirmModal } from '../../../src/context/ConfirmModalContext';
import CustomDatePicker from '../../../src/components/ui/CustomDatePicker';
import LuxurySpinner from '../../../src/components/ui/LuxurySpinner';
import useBodyScrollLock from '../../../src/hooks/useBodyScrollLock';
import {
  Calendar,
  Plus,
  Search,
  MapPin,
  Clock,
  User,
  CheckCircle2,
  Trash2,
  Edit,
  X,
  Sparkles,
} from 'lucide-react';

export default function AdminEventsPage() {
  const { showToast } = useToast();
  const { confirmDelete } = useConfirmModal();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  useBodyScrollLock(createModalOpen);

  const [formData, setFormData] = useState({
    title: '',
    eventType: 'Wedding',
    eventDate: '',
    venue: '',
    clientName: '',
    clientPhone: '',
    status: 'SCHEDULED',
    setupTeamNotes: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.getEvents();
      if (res.events) setEvents(res.events);
    } catch (e) {
      console.warn('Failed to load events', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const [errors, setErrors] = useState({});

  const openCreateModal = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      eventType: 'Wedding',
      eventDate: '',
      venue: '',
      clientName: '',
      clientPhone: '',
      status: 'SCHEDULED',
      setupTeamNotes: '',
    });
    setErrors({});
    setCreateModalOpen(true);
  };

  const openEditModal = (ev) => {
    setEditingEvent(ev);
    setFormData({
      title: ev.title,
      eventType: ev.eventType,
      eventDate: ev.eventDate ? ev.eventDate.split('T')[0] : '',
      venue: ev.venue,
      clientName: ev.clientName,
      clientPhone: ev.clientPhone || '',
      status: ev.status,
      setupTeamNotes: ev.setupTeamNotes || '',
    });
    setErrors({});
    setCreateModalOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Event title must be at least 3 characters';
    }

    if (!formData.eventDate) {
      newErrors.eventDate = 'Event date is required';
    }

    if (!formData.venue.trim()) {
      newErrors.venue = 'Venue location is required';
    }

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please fix the errors in the event form', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingEvent) {
        await api.updateEvent(editingEvent.id, formData);
        showToast('Event updated successfully!', 'success');
      } else {
        await api.createEvent(formData);
        showToast('Event scheduled successfully!', 'success');
      }
      fetchEvents();
      setCreateModalOpen(false);
      setErrors({});
    } catch (e) {
      showToast('Failed to save event', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id, title) => {
    confirmDelete({
      title: 'Delete Production Event?',
      message: 'Are you sure you want to delete this event schedule from production tracking?',
      itemName: title ? `Event: ${title}` : undefined,
      confirmText: 'Delete Permanently',
      onConfirm: async () => {
        try {
          await api.deleteEvent(id);
          showToast('Event deleted successfully.', 'info');
          fetchEvents();
        } catch (e) {
          showToast('Failed to delete event', 'error');
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
            <Calendar className="w-3.5 h-3.5" />
            <span>Setup Schedule & Production</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-ivory-50 font-light mt-1">
            Venue Production Schedule
          </h1>
          <p className="text-xs text-ivory-400 font-light mt-1">
            Real-time venue installation timelines, production crews, client coordinates, and logistics.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 rounded-full text-xs uppercase tracking-widest font-bold hover:brightness-110 transition-all duration-300 shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Event</span>
        </button>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-24">
          <LuxurySpinner size="lg" text="Loading venue production schedule..." />
        </div>
      ) : events.length === 0 ? (
        <div className="bg-[#0D0D12] rounded-3xl p-16 text-center border border-gold-500/20 space-y-2">
          <p className="font-serif text-lg text-ivory-300">No scheduled venue setups found.</p>
          <p className="text-xs text-ivory-500">Click "Schedule New Event" to add a production run.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-[#0D0D12] rounded-3xl p-6 border border-gold-500/20 hover:border-gold-500/40 shadow-xl flex flex-col justify-between space-y-4 transition-all duration-300 hover:scale-[1.01]"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase font-bold text-gold-400">{ev.eventType}</span>
                  <span
                    className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                      ev.status === 'COMPLETED'
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                        : ev.status === 'SETUP_IN_PROGRESS'
                        ? 'bg-gold-500/20 text-gold-300 border-gold-500/40'
                        : ev.status === 'LIVE'
                        ? 'bg-purple-950/60 text-purple-300 border-purple-500/30 animate-pulse'
                        : ev.status === 'CANCELLED'
                        ? 'bg-red-950/60 text-red-400 border-red-500/30'
                        : 'bg-blue-950/60 text-blue-300 border-blue-500/30'
                    }`}
                  >
                    {ev.status}
                  </span>
                </div>

                <h3 className="font-serif text-xl text-ivory-50 font-medium">{ev.title}</h3>

                <div className="space-y-2 text-xs text-ivory-300 font-light">
                  <p className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-2 text-gold-400 flex-shrink-0" />
                    <span>{new Date(ev.eventDate).toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
                  </p>
                  <p className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-2 text-gold-400 flex-shrink-0" />
                    <span>{ev.venue}</span>
                  </p>
                  <p className="flex items-center">
                    <User className="w-3.5 h-3.5 mr-2 text-gold-400 flex-shrink-0" />
                    <span>{ev.clientName} ({ev.clientPhone || 'No Phone'})</span>
                  </p>
                </div>

                {ev.setupTeamNotes && (
                  <p className="text-[11px] bg-[#14141E] p-2.5 rounded-xl text-ivory-300 italic border border-white/5">
                    <span className="text-gold-400 font-semibold not-italic">Note:</span> {ev.setupTeamNotes}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end space-x-2">
                <button
                  onClick={() => openEditModal(ev)}
                  className="p-2 text-ivory-300 hover:text-gold-300 bg-[#14141E] hover:bg-gold-500/10 border border-gold-500/30 rounded-xl transition-all"
                  title="Edit Event Schedule"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(ev.id, ev.title)}
                  className="p-2 text-red-400 hover:text-red-200 bg-red-950/30 hover:bg-red-900/50 border border-red-500/20 rounded-xl transition-all"
                  title="Delete Event Schedule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-[99999] overflow-hidden flex items-center justify-center p-3 sm:p-4 md:p-6 bg-obsidian-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative bg-[#0D0D12] text-ivory-50 rounded-3xl overflow-hidden shadow-2xl max-w-xl w-full max-h-[92dvh] sm:max-h-[90dvh] flex flex-col border border-gold-500/30 p-5 sm:p-8 space-y-5 overflow-y-auto overscroll-contain">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold-400 font-bold">
                  {editingEvent ? 'Edit Event' : 'Schedule Event'}
                </span>
                <h3 className="font-serif text-2xl text-ivory-50 font-light mt-1">
                  {editingEvent ? editingEvent.title : 'Venue Setup Schedule'}
                </h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-ivory-400 hover:text-ivory-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-ivory-300 font-semibold mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (errors.title) setErrors({ ...errors, title: null });
                  }}
                  placeholder="e.g. Sterling Royal Wedding Gala"
                  className={`w-full text-xs p-2.5 rounded-xl border bg-[#14141E] text-ivory-50 placeholder:text-ivory-600 focus:outline-none focus:border-gold-400 transition-colors ${
                    errors.title ? 'border-red-400 ring-1 ring-red-400' : 'border-gold-500/30'
                  }`}
                />
                {errors.title && <p className="text-[10px] text-red-400 mt-1">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-ivory-300 font-semibold mb-1">
                    Event Type *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                      className="w-full text-xs p-3 pr-8 rounded-xl border border-gold-500/30 bg-[#14141E] text-ivory-50 appearance-none focus:outline-none focus:border-gold-400 cursor-pointer shadow-sm"
                    >
                      <option value="Wedding">Wedding</option>
                      <option value="Birthday">Birthday</option>
                      <option value="Corporate">Corporate</option>
                      <option value="Engagement">Engagement</option>
                      <option value="Mehndi">Mehndi</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <CustomDatePicker
                    label="Event Date"
                    required
                    value={formData.eventDate}
                    onChange={(date) => {
                      setFormData({ ...formData, eventDate: date });
                      if (errors.eventDate) setErrors({ ...errors, eventDate: null });
                    }}
                    error={errors.eventDate}
                    align="right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-ivory-300 font-semibold mb-1">
                    Venue *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    onChange={(e) => {
                      setFormData({ ...formData, venue: e.target.value });
                      if (errors.venue) setErrors({ ...errors, venue: null });
                    }}
                    placeholder="The Glasshouse Estate"
                    className={`w-full text-xs p-3 rounded-xl border bg-[#14141E] text-ivory-50 placeholder:text-ivory-600 focus:outline-none focus:border-gold-400 transition-colors ${
                      errors.venue ? 'border-red-400 ring-1 ring-red-400' : 'border-gold-500/30'
                    }`}
                  />
                  {errors.venue && <p className="text-[10px] text-red-400 mt-1">{errors.venue}</p>}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-ivory-300 font-semibold mb-1">
                    Production Status
                  </label>
                  <div className="relative">
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full text-xs p-3 pr-8 rounded-xl border border-gold-500/30 bg-[#14141E] text-ivory-50 appearance-none focus:outline-none focus:border-gold-400 cursor-pointer shadow-sm"
                    >
                      <option value="SCHEDULED">SCHEDULED</option>
                      <option value="SETUP_IN_PROGRESS">SETUP_IN_PROGRESS</option>
                      <option value="LIVE">LIVE</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-ivory-300 font-semibold mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) => {
                      setFormData({ ...formData, clientName: e.target.value });
                      if (errors.clientName) setErrors({ ...errors, clientName: null });
                    }}
                    placeholder="Marcus Sterling"
                    className={`w-full text-xs p-2.5 rounded-xl border bg-[#14141E] text-ivory-50 placeholder:text-ivory-600 focus:outline-none focus:border-gold-400 transition-colors ${
                      errors.clientName ? 'border-red-400 ring-1 ring-red-400' : 'border-gold-500/30'
                    }`}
                  />
                  {errors.clientName && <p className="text-[10px] text-red-400 mt-1">{errors.clientName}</p>}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-ivory-300 font-semibold mb-1">
                    Client Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    placeholder="03140660985 or +923140660985"
                    className="w-full text-xs p-2.5 rounded-xl border border-gold-500/30 bg-[#14141E] text-ivory-50 placeholder:text-ivory-600 focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-ivory-300 font-semibold mb-1">
                  Setup & Coordination Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.setupTeamNotes}
                  onChange={(e) => setFormData({ ...formData, setupTeamNotes: e.target.value })}
                  placeholder="Load-in time, floral installation team, rigging team..."
                  className="w-full text-xs p-2.5 rounded-xl border border-gold-500/30 bg-[#14141E] text-ivory-50 placeholder:text-ivory-600 focus:border-gold-400 focus:outline-none"
                />
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
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 rounded-full text-xs uppercase tracking-widest font-bold hover:brightness-110 transition-all shadow-md"
                >
                  {saving ? 'Saving...' : 'Save Event Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
