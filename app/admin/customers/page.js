'use client';

import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../src/lib/api';
import { useToast } from '../../../src/context/ToastContext';
import LuxurySpinner from '../../../src/components/ui/LuxurySpinner';
import AdminInfiniteTableFooter, { useInfiniteTable } from '../../../src/components/ui/AdminInfiniteTable';
import useBodyScrollLock from '../../../src/hooks/useBodyScrollLock';
import { Users, Search, Plus, Mail, Phone, MapPin, DollarSign, CalendarCheck, ShoppingBag, X } from 'lucide-react';

export default function AdminCustomersPage() {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useBodyScrollLock(Boolean(selectedCustomer));

  // Infinite Scroll Engine
  const {
    displayedItems: infiniteCustomers,
    hasMore,
    isLoadingMore,
    handleScroll,
  } = useInfiniteTable(customers, 15, 15);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.getCustomers({ search: searchQuery || undefined });
      if (res.customers) setCustomers(res.customers);
    } catch (e) {
      console.warn('Failed to load customers', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchQuery]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-gold-400 text-[10px] uppercase tracking-[0.25em] font-semibold">
            <Users className="w-3.5 h-3.5" />
            <span>Client Relationship Management</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-ivory-50 font-light mt-1">
            Customer Atelier Directory
          </h1>
          <p className="text-xs text-ivory-400 font-light mt-1">
            Directory of VIP event patrons, corporate partners, lifetime booking values, and rental histories.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-gold-400/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by customer name, email, phone..."
          className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gold-500/30 bg-[#14141E] text-ivory-50 placeholder:text-ivory-600 text-xs focus:outline-none focus:border-gold-400 shadow-sm"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-[#0D0D12] border border-gold-500/20 rounded-3xl overflow-hidden shadow-xl text-ivory-100">
        {loading ? (
          <div className="py-24">
            <LuxurySpinner size="lg" text="Loading customer directory..." />
          </div>
        ) : customers.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="p-3 bg-gold-500/10 border border-gold-500/30 text-gold-400 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <p className="font-serif text-xl text-ivory-50">No client records found.</p>
            <p className="text-xs text-ivory-400 max-w-sm mx-auto">
              New client profiles will appear here automatically when clients book events or make inquiries.
            </p>
          </div>
        ) : (
          <div
            onScroll={handleScroll}
            className="overflow-x-auto max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gold-500/20"
          >
            <table className="w-full text-left text-xs">
              <thead className="bg-[#14141E] border-b border-gold-500/20 text-[10px] uppercase font-bold tracking-wider text-gold-400 sticky top-0 z-10 backdrop-blur-md shadow-sm">
                <tr>
                  <th className="p-4 pl-6">Client Name</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Location / Address</th>
                  <th className="p-4">Lifetime Activity</th>
                  <th className="p-4 pr-6 text-right">Lifetime Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {infiniteCustomers.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                  >
                    <td className="p-4 pl-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/40 font-bold flex items-center justify-center text-xs shadow-inner">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-ivory-50 group-hover:text-gold-300 transition-colors">{c.name}</p>
                          <span className="text-[10px] text-ivory-400">
                            Client since {new Date(c.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-ivory-200">{c.email}</p>
                      <p className="text-[10px] text-ivory-400">{c.phone || 'No phone'}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-ivory-300">{c.city ? `${c.city}, ${c.address || ''}` : c.address || 'Beverly Hills, CA'}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3 text-[11px]">
                        <span className="flex items-center text-ivory-300">
                          <CalendarCheck className="w-3.5 h-3.5 mr-1 text-gold-400" />
                          {c.bookings?.length || 0} Bookings
                        </span>
                        <span className="flex items-center text-ivory-300">
                          <ShoppingBag className="w-3.5 h-3.5 mr-1 text-gold-400" />
                          {c.rentalRequests?.length || 0} Rentals
                        </span>
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right font-serif text-sm font-bold text-ivory-50">
                      PKR {Number(c.totalSpent || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Luxury Infinite Scroll Status & Auto-Loader */}
        <AdminInfiniteTableFooter
          displayedCount={infiniteCustomers.length}
          totalCount={customers.length}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
        />
      </div>

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-[99999] overflow-hidden flex items-center justify-center p-3 sm:p-4 md:p-6 bg-obsidian-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative bg-[#0D0D12] text-ivory-50 rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full max-h-[92dvh] sm:max-h-[90dvh] flex flex-col border border-gold-500/30 p-5 sm:p-8 space-y-5 overflow-y-auto overscroll-contain">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/40 font-bold flex items-center justify-center text-base shadow-inner">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-serif text-2xl text-ivory-50 font-medium">
                    {selectedCustomer.name}
                  </h3>
                  <p className="text-xs text-ivory-400">{selectedCustomer.email} • {selectedCustomer.phone || 'No phone'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-ivory-400 hover:text-ivory-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-[#14141E] border border-gold-500/20 rounded-2xl text-xs">
              <div>
                <span className="text-[10px] uppercase text-ivory-400 font-bold">Lifetime Value</span>
                <p className="font-serif text-xl font-bold text-gold-400 mt-0.5">
                  PKR {Number(selectedCustomer.totalSpent || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase text-ivory-400 font-bold">Address</span>
                <p className="font-medium text-ivory-200 mt-0.5">{selectedCustomer.address || 'Lahore, Pakistan'}</p>
              </div>
            </div>

            {/* Past Bookings */}
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-widest font-bold text-gold-400">
                Event Bookings ({selectedCustomer.bookings?.length || 0})
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {selectedCustomer.bookings?.length === 0 ? (
                  <p className="text-xs text-ivory-500 italic p-3 bg-[#14141E] rounded-xl">No booked events yet.</p>
                ) : (
                  selectedCustomer.bookings?.map((b) => (
                    <div key={b.id} className="p-3 bg-[#14141E] border border-white/5 rounded-xl text-xs flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-ivory-100">{b.eventType} at {b.venue}</span>
                        <p className="text-[10px] text-ivory-400">{new Date(b.eventDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-ivory-50">PKR {Number(b.totalAmount || 0).toLocaleString()}</span>
                        <p className="text-[10px] text-gold-400 font-semibold">{b.status}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-6 py-2.5 bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 rounded-full text-xs uppercase tracking-widest font-bold hover:brightness-110 transition-all shadow-md"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
