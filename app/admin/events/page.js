'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../src/lib/api';
import { useToast } from '../../../src/context/ToastContext';
import { useConfirmModal } from '../../../src/context/ConfirmModalContext';
import CustomDatePicker from '../../../src/components/ui/CustomDatePicker';
import LuxurySpinner from '../../../src/components/ui/LuxurySpinner';
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
} from 'lucide-react';

export default function AdminEventsPage() {
  const { showToast } = useToast();
  const { confirmDelete } = useConfirmModal();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

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
          <div className="inline-flex items-center space-x-2 text-gold-700 text-[10px] uppercase tracking-[0.25em] font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            <span>Setup Schedule & Production</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-obsidian-950 font-light">
            Venue Production Schedule
          </h1>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-6 py-2.5 bg-obsidian-950 text-ivory-50 rounded-full text-xs uppercase tracking-widest font-semibold hover:bg-gold-600 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Event</span>
        </button>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-20">
          <LuxurySpinner size="lg" text="Loading venue production schedule..." />
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-champagne-300 space-y-2">
          <p className="font-serif text-lg text-obsidian-800">No scheduled venue setups found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-3xl p-6 border border-champagne-300 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase font-bold text-gold-700">{ev.eventType}</span>
                  <span
                    className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      ev.status === 'COMPLETED'
                        ? 'bg-sage-100 text-sage-800'
                        : ev.status === 'SETUP_IN_PROGRESS'
                        ? 'bg-gold-100 text-gold-900'
                        : 'bg-champagne-200 text-obsidian-800'
                    }`}
                  >
                    {ev.status}
                  </span>
                </div>

                <h3 className="font-serif text-xl text-obsidian-950 font-medium">{ev.title}</h3>

                <div className="space-y-1.5 text-xs text-obsidian-600 font-light">
                  <p className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-2 text-gold-600" />
                    {new Date(ev.eventDate).toLocaleDateString(undefined, { dateStyle: 'full' })}
                  </p>
                  <p className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-2 text-gold-600" />
                    {ev.venue}
                  </p>
                  <p className="flex items-center">
                    <User className="w-3.5 h-3.5 mr-2 text-gold-600" />
                    {ev.clientName} ({ev.clientPhone || 'No Phone'})
                  </p>
                </div>

                {ev.setupTeamNotes && (
                  <p className="text-[11px] bg-champagne-50 p-2.5 rounded-xl text-obsidian-700 italic">
                    Note: {ev.setupTeamNotes}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-champagne-200 flex justify-end space-x-2">
                <button
                  onClick={() => openEditModal(ev)}
                  className="p-1.5 text-obsidian-700 hover:bg-champagne-100 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(ev.id, ev.title)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-obsidian-950/80 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-xl w-full border border-champagne-300 p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold-700 font-bold">
                  {editingEvent ? 'Edit Event' : 'Schedule Event'}
                </span>
                <h3 className="font-serif text-2xl text-obsidian-950 font-light mt-1">
                  {editingEvent ? editingEvent.title : 'Venue Setup Schedule'}
                </h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-2 rounded-full hover:bg-champagne-200 transition-colors text-obsidian-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
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
                  className={`w-full text-xs p-2.5 rounded-xl border bg-white focus:outline-none focus:border-gold-500 transition-colors ${
                    errors.title ? 'border-red-400 ring-1 ring-red-300' : 'border-champagne-300'
                  }`}
                />
                {errors.title && <p className="text-[10px] text-red-500 mt-1">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                    Event Type *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                      className="w-full text-xs p-3 pr-8 rounded-xl border border-champagne-300 bg-white appearance-none focus:outline-none focus:border-gold-500 cursor-pointer shadow-sm"
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
                  <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
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
                    className={`w-full text-xs p-3 rounded-xl border bg-white focus:outline-none focus:border-gold-500 transition-colors ${
                      errors.venue ? 'border-red-400 ring-1 ring-red-300' : 'border-champagne-300'
                    }`}
                  />
                  {errors.venue && <p className="text-[10px] text-red-500 mt-1">{errors.venue}</p>}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                    Production Status
                  </label>
                  <div className="relative">
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full text-xs p-3 pr-8 rounded-xl border border-champagne-300 bg-white appearance-none focus:outline-none focus:border-gold-500 cursor-pointer shadow-sm"
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
                  <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
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
                    className={`w-full text-xs p-2.5 rounded-xl border bg-white focus:outline-none focus:border-gold-500 transition-colors ${
                      errors.clientName ? 'border-red-400 ring-1 ring-red-300' : 'border-champagne-300'
                    }`}
                  />
                  {errors.clientName && <p className="text-[10px] text-red-500 mt-1">{errors.clientName}</p>}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                    Client Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    placeholder="03140660985 or +923140660985"
                    className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                  Setup & Coordination Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.setupTeamNotes}
                  onChange={(e) => setFormData({ ...formData, setupTeamNotes: e.target.value })}
                  placeholder="Load-in time, floral installation team, rigging team..."
                  className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-champagne-200">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-champagne-300 text-xs uppercase tracking-wider text-obsidian-600 hover:bg-champagne-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-obsidian-900 text-ivory-50 rounded-full text-xs uppercase tracking-widest font-semibold hover:bg-gold-600 transition-colors shadow-md"
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
