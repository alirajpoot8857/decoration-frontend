'use client';

import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../src/lib/api';
import { useToast } from '../../../src/context/ToastContext';
import LuxurySpinner from '../../../src/components/ui/LuxurySpinner';
import AdminInfiniteTableFooter, { useInfiniteTable } from '../../../src/components/ui/AdminInfiniteTable';
import useBodyScrollLock from '../../../src/hooks/useBodyScrollLock';
import {
  CalendarCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Sparkles,
  Edit,
  Eye,
} from 'lucide-react';

export default function AdminBookingsPage() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [updating, setUpdating] = useState(false);

  useBodyScrollLock(Boolean(selectedBooking));

  // Infinite Scroll Engine
  const {
    displayedItems: infiniteBookings,
    hasMore,
    isLoadingMore,
    handleScroll,
  } = useInfiniteTable(bookings, 15, 15);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const [bRes, pRes] = await Promise.all([
        api.getBookings({
          status: statusFilter === 'All' ? undefined : statusFilter,
          search: searchQuery || undefined,
        }),
        api.getPackages(),
      ]);
      if (bRes.bookings) setBookings(bRes.bookings);
      if (pRes.packages) setPackages(pRes.packages);
    } catch (e) {
      console.warn('Failed to load bookings', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, searchQuery]);

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdating(true);
    try {
      await api.updateBookingStatus(id, { status: newStatus });
      showToast(`Booking status updated to ${newStatus}`, 'success');
      fetchBookings();
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
    } catch (e) {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setUpdating(true);
    try {
      await api.updateBookingStatus(selectedBooking.id, {
        status: selectedBooking.status,
        packageId: selectedBooking.packageId || undefined,
        venue: selectedBooking.venue,
        guestCount: selectedBooking.guestCount,
        totalAmount: selectedBooking.totalAmount,
        internalNotes: selectedBooking.internalNotes,
      });
      showToast('Booking details updated successfully', 'success');
      fetchBookings();
      setSelectedBooking(null);
    } catch (e) {
      showToast('Failed to update booking details', 'error');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-gold-400 text-[10px] uppercase tracking-[0.25em] font-semibold">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Event Management</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-ivory-50 font-light">
            Client Bookings & Consultations
          </h1>
          <p className="text-xs text-ivory-400 font-light mt-1">
            Track bespoke event inquiries, confirmed consultations, venue logistics, and VIP bespoke bookings.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gold-400/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer, booking ref, venue..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gold-500/30 bg-[#14141E] text-ivory-50 placeholder:text-ivory-600 text-xs focus:outline-none focus:border-gold-400 shadow-sm"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0">
          {['All', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 font-bold shadow-sm'
                  : 'bg-[#14141E] text-ivory-300 border border-gold-500/20 hover:border-gold-400 hover:text-ivory-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table - Fixed Height Container with Internal Scroll & Sticky Header */}
      <div className="bg-[#0D0D12] border border-gold-500/20 rounded-3xl overflow-hidden shadow-xl flex flex-col">
        {loading ? (
          <div className="py-20">
            <LuxurySpinner size="lg" text="Loading client bookings..." />
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="font-serif text-lg text-ivory-200">No bookings match the filter.</p>
            <p className="text-xs text-ivory-400">Try changing status filters or search term.</p>
          </div>
        ) : (
          <>
            <div
              onScroll={handleScroll}
              className="overflow-x-auto max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gold-500/20"
            >
              <table className="w-full text-left text-xs text-ivory-200">
                <thead className="bg-[#14141E]/95 border-b border-gold-500/20 text-[9px] uppercase font-bold tracking-wider text-gold-400 sticky top-0 z-10 backdrop-blur-md shadow-sm">
                  <tr>
                    <th className="py-3 px-3 pl-5">Ref #</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Event & Venue</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Valuation</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {infiniteBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gold-500/5 transition-colors">
                      <td className="py-3 px-3 pl-5">
                        <span className="font-mono font-bold text-gold-400 text-xs block">{b.bookingNumber}</span>
                        <span className="text-[9px] text-ivory-500">{new Date(b.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-ivory-50 text-xs truncate max-w-[140px]">{b.customerName}</p>
                        <p className="text-[10px] text-ivory-400 font-mono truncate max-w-[140px]">{b.customerPhone}</p>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 text-[8px] rounded-full bg-gold-950/60 text-gold-300 border border-gold-500/30 font-bold uppercase mb-0.5">
                          {b.eventType}
                        </span>
                        <p className="text-[11px] text-ivory-300 truncate max-w-[150px]">{b.venue}</p>
                      </td>
                      <td className="py-3 px-3 text-[10px] text-ivory-300 font-medium">
                        {new Date(b.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-gold-300 text-xs">
                        PKR {b.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={b.status}
                          onChange={(e) => handleUpdateStatus(b.id, e.target.value)}
                          className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none transition-colors ${
                            b.status === 'CONFIRMED' || b.status === 'COMPLETED'
                              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                              : b.status === 'PENDING'
                              ? 'bg-amber-950/70 text-amber-300 border-amber-500/40'
                              : b.status === 'IN_PROGRESS'
                              ? 'bg-purple-950/70 text-purple-300 border-purple-500/40'
                              : 'bg-rose-950/70 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td className="py-3 px-3 pr-5 text-right">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="px-3 py-1 bg-[#1A1A26] hover:bg-gold-500 text-ivory-50 hover:text-obsidian-950 font-semibold text-[11px] rounded-lg border border-gold-500/30 transition-all shadow-sm inline-flex items-center space-x-1"
                        >
                          <Edit className="w-3 h-3 text-gold-400" />
                          <span>Manage</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Luxury Infinite Scroll Status & Auto-Loader */}
            <AdminInfiniteTableFooter
              displayedCount={infiniteBookings.length}
              totalCount={bookings.length}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
            />
          </>
        )}
      </div>

      {/* Edit / Manage Booking Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[99999] overflow-hidden flex items-center justify-center p-3 sm:p-4 md:p-6 bg-obsidian-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full max-h-[92dvh] sm:max-h-[90dvh] flex flex-col border border-champagne-300 p-5 sm:p-8 space-y-5 overflow-y-auto overscroll-contain">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold-700 font-bold">
                  Ref #{selectedBooking.bookingNumber}
                </span>
                <h3 className="font-serif text-2xl text-obsidian-950 font-light mt-1">
                  Manage Booking: {selectedBooking.customerName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-full hover:bg-champagne-200 transition-colors text-obsidian-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDetails} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                    Booking Status
                  </label>
                  <select
                    value={selectedBooking.status}
                    onChange={(e) => setSelectedBooking({ ...selectedBooking, status: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED (Auto-Schedules Event)</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                    Assigned Package
                  </label>
                  <select
                    value={selectedBooking.packageId || ''}
                    onChange={(e) => setSelectedBooking({ ...selectedBooking, packageId: e.target.value || null })}
                    className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white"
                  >
                    <option value="">Custom / No Package</option>
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} (PKR {pkg.price.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                    Venue
                  </label>
                  <input
                    type="text"
                    value={selectedBooking.venue}
                    onChange={(e) => setSelectedBooking({ ...selectedBooking, venue: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                    Guest Count
                  </label>
                  <input
                    type="number"
                    value={selectedBooking.guestCount}
                    onChange={(e) => setSelectedBooking({ ...selectedBooking, guestCount: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                    Total Amount (PKR)
                  </label>
                  <input
                    type="number"
                    value={selectedBooking.totalAmount}
                    onChange={(e) => setSelectedBooking({ ...selectedBooking, totalAmount: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                  Customer Special Requests
                </label>
                <div className="p-3 bg-champagne-50 rounded-xl text-xs text-obsidian-700 italic">
                  {selectedBooking.specialRequests || 'No special requests submitted.'}
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                  Staff Internal Notes
                </label>
                <textarea
                  rows={3}
                  value={selectedBooking.internalNotes || ''}
                  onChange={(e) => setSelectedBooking({ ...selectedBooking, internalNotes: e.target.value })}
                  placeholder="Floral setup details, structural rigging notes, coordination times..."
                  className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-champagne-200">
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="px-5 py-2.5 rounded-full border border-champagne-300 text-xs uppercase tracking-wider text-obsidian-600 hover:bg-champagne-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-6 py-2.5 bg-obsidian-900 text-ivory-50 rounded-full text-xs uppercase tracking-widest font-semibold hover:bg-gold-600 transition-colors shadow-md"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
