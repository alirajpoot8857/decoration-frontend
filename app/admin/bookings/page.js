'use client';

import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../src/lib/api';
import { useToast } from '../../../src/context/ToastContext';
import LuxurySpinner from '../../../src/components/ui/LuxurySpinner';
import AdminInfiniteTableFooter, { useInfiniteTable } from '../../../src/components/ui/AdminInfiniteTable';
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
          <div className="inline-flex items-center space-x-2 text-gold-700 text-[10px] uppercase tracking-[0.25em] font-semibold">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Event Management</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-obsidian-950 font-light">
            Client Bookings & Consultations
          </h1>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-obsidian-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer, booking ref, venue..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-champagne-300 bg-white text-xs focus:outline-none focus:border-gold-500 shadow-sm"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0">
          {['All', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-obsidian-900 text-ivory-50 shadow-sm'
                  : 'bg-white text-obsidian-700 border border-champagne-300 hover:bg-champagne-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table - Fixed Height Container with Internal Scroll & Sticky Header */}
      <div className="bg-white border border-champagne-300/80 rounded-3xl overflow-hidden shadow-sm flex flex-col">
        {loading ? (
          <div className="py-20">
            <LuxurySpinner size="lg" text="Loading client bookings..." />
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="font-serif text-lg text-obsidian-800">No bookings match the filter.</p>
            <p className="text-xs text-obsidian-500">Try changing status filters or search term.</p>
          </div>
        ) : (
          <>
            <div
              onScroll={handleScroll}
              className="overflow-x-auto max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gold-500/20"
            >
              <table className="w-full text-left text-xs text-obsidian-700">
                <thead className="bg-champagne-100/95 border-b border-champagne-200 text-[9px] uppercase font-bold tracking-wider text-obsidian-600 sticky top-0 z-10 backdrop-blur-md shadow-sm">
                  <tr>
                    <th className="py-3 px-3 pl-4">Ref #</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Event & Venue</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Valuation</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-champagne-200">
                  {infiniteBookings.map((b) => (
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
                        <p className="text-[11px] text-obsidian-700 truncate max-w-[150px]">{b.venue}</p>
                      </td>
                      <td className="py-2.5 px-3 text-[10px] text-obsidian-700 font-medium">
                        {new Date(b.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-obsidian-950 text-xs">
                        PKR {b.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <select
                          value={b.status}
                          onChange={(e) => handleUpdateStatus(b.id, e.target.value)}
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
                          onClick={() => setSelectedBooking(b)}
                          className="px-2.5 py-1 bg-obsidian-950 hover:bg-gold-600 text-ivory-50 hover:text-obsidian-950 font-semibold text-[11px] rounded-lg transition-all shadow-sm inline-flex items-center space-x-1"
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
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-obsidian-950/80 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full border border-champagne-300 p-6 sm:p-8 space-y-6">
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
