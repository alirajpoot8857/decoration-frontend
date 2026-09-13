'use client';

import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../src/lib/api';
import { useToast } from '../../../src/context/ToastContext';
import LuxurySpinner from '../../../src/components/ui/LuxurySpinner';
import AdminInfiniteTableFooter, { useInfiniteTable } from '../../../src/components/ui/AdminInfiniteTable';
import { Users, Search, Plus, Mail, Phone, MapPin, DollarSign, CalendarCheck, ShoppingBag } from 'lucide-react';

export default function AdminCustomersPage() {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

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
          <div className="inline-flex items-center space-x-2 text-gold-700 text-[10px] uppercase tracking-[0.25em] font-semibold">
            <Users className="w-3.5 h-3.5" />
            <span>Client Relationship Management</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-obsidian-950 font-light">
            Customer Atelier Directory
          </h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-obsidian-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by customer name, email, phone..."
          className="w-full pl-10 pr-4 py-2.5 rounded-full border border-champagne-300 bg-white text-xs focus:outline-none focus:border-gold-500 shadow-sm"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-champagne-300/80 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20">
            <LuxurySpinner size="lg" text="Loading customer directory..." />
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="font-serif text-lg text-obsidian-800">No client records found.</p>
          </div>
        ) : (
          <div
            onScroll={handleScroll}
            className="overflow-x-auto max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gold-500/20"
          >
            <table className="w-full text-left text-xs text-obsidian-700">
              <thead className="bg-champagne-100/95 border-b border-champagne-200 text-[10px] uppercase font-bold tracking-wider text-obsidian-600 sticky top-0 z-10 backdrop-blur-md shadow-sm">
                <tr>
                  <th className="p-4 pl-6">Client Name</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Location / Address</th>
                  <th className="p-4">Lifetime Activity</th>
                  <th className="p-4 pr-6 text-right">Lifetime Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-champagne-200">
                {infiniteCustomers.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className="hover:bg-champagne-50/50 transition-colors cursor-pointer"
                  >
                    <td className="p-4 pl-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-gold-500/20 text-gold-800 font-bold flex items-center justify-center text-xs">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-obsidian-900">{c.name}</p>
                          <span className="text-[10px] text-obsidian-400">
                            Client since {new Date(c.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-obsidian-900">{c.email}</p>
                      <p className="text-[10px] text-obsidian-400">{c.phone || 'No phone'}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-obsidian-800">{c.city ? `${c.city}, ${c.address || ''}` : c.address || 'Beverly Hills, CA'}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3 text-[11px]">
                        <span className="flex items-center text-obsidian-700">
                          <CalendarCheck className="w-3.5 h-3.5 mr-1 text-gold-600" />
                          {c.bookings?.length || 0} Bookings
                        </span>
                        <span className="flex items-center text-obsidian-700">
                          <ShoppingBag className="w-3.5 h-3.5 mr-1 text-gold-600" />
                          {c.rentalRequests?.length || 0} Rentals
                        </span>
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right font-serif text-sm font-bold text-obsidian-950">
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
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-obsidian-950/80 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full border border-champagne-300 p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gold-500/20 text-gold-800 font-bold flex items-center justify-center text-base">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-serif text-2xl text-obsidian-950 font-medium">
                    {selectedCustomer.name}
                  </h3>
                  <p className="text-xs text-obsidian-500">{selectedCustomer.email} • {selectedCustomer.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 rounded-full hover:bg-champagne-200 transition-colors text-obsidian-500"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-champagne-50 rounded-2xl text-xs">
              <div>
                <span className="text-[10px] uppercase text-obsidian-400 font-bold">Lifetime Value</span>
                <p className="font-serif text-xl font-bold text-gold-800 mt-0.5">
                  PKR {Number(selectedCustomer.totalSpent || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase text-obsidian-400 font-bold">Address</span>
                <p className="font-medium text-obsidian-800 mt-0.5">{selectedCustomer.address || 'Beverly Hills, CA'}</p>
              </div>
            </div>

            {/* Past Bookings */}
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-widest font-bold text-obsidian-800">
                Event Bookings ({selectedCustomer.bookings?.length || 0})
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {selectedCustomer.bookings?.map((b) => (
                  <div key={b.id} className="p-2.5 bg-champagne-50/60 rounded-xl text-xs flex justify-between">
                    <div>
                      <span className="font-semibold text-obsidian-900">{b.eventType} at {b.venue}</span>
                      <p className="text-[10px] text-obsidian-400">{new Date(b.eventDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-obsidian-900">PKR {b.totalAmount.toLocaleString()}</span>
                      <p className="text-[10px] text-gold-700 font-semibold">{b.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-champagne-200">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-6 py-2 bg-obsidian-900 text-ivory-50 rounded-full text-xs uppercase tracking-widest hover:bg-gold-600 transition-colors"
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
