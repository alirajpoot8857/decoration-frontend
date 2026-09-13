'use client';

import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../src/lib/api';
import { useToast } from '../../../src/context/ToastContext';
import { useConfirmModal } from '../../../src/context/ConfirmModalContext';
import LuxurySpinner from '../../../src/components/ui/LuxurySpinner';
import AdminInfiniteTableFooter, { useInfiniteTable } from '../../../src/components/ui/AdminInfiniteTable';
import { Mail, Search, CheckCircle2, MessageSquare, Trash2, Eye, Calendar, Phone } from 'lucide-react';

export default function AdminInquiriesPage() {
  const { showToast } = useToast();
  const { confirmDelete } = useConfirmModal();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Infinite Scroll Engine
  const {
    displayedItems: infiniteInquiries,
    hasMore,
    isLoadingMore,
    handleScroll,
  } = useInfiniteTable(inquiries, 15, 15);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await api.getInquiries({
        status: statusFilter === 'All' ? undefined : statusFilter,
      });
      if (res.inquiries) setInquiries(res.inquiries);
    } catch (e) {
      console.warn('Failed to load inquiries', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter]);

  const handleUpdateStatus = async (id, newStatus, responseNotes = undefined) => {
    setUpdating(true);
    try {
      await api.updateInquiryStatus(id, { status: newStatus, responseNotes });
      showToast(`Inquiry marked as ${newStatus}`, 'success');
      fetchInquiries();
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus, responseNotes });
      }
    } catch (e) {
      showToast('Failed to update inquiry status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = (id, name = '') => {
    confirmDelete({
      title: 'Delete Client Inquiry?',
      message: 'Are you sure you want to permanently delete this client inquiry? This record will be removed from your concierge inbox.',
      itemName: name ? `Inquiry from: ${name}` : undefined,
      confirmText: 'Delete Permanently',
      onConfirm: async () => {
        try {
          await api.deleteInquiry(id);
          showToast('Inquiry deleted successfully', 'info');
          fetchInquiries();
          setSelectedInquiry(null);
        } catch (e) {
          showToast('Failed to delete inquiry', 'error');
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
            <Mail className="w-3.5 h-3.5" />
            <span>Inbound Concierge</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-obsidian-950 font-light">
            Contact Inquiries & Requests
          </h1>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2">
        {['All', 'NEW', 'READ', 'CONTACTED', 'ARCHIVED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
              statusFilter === st
                ? 'bg-obsidian-900 text-ivory-50 shadow-sm'
                : 'bg-white text-obsidian-700 border border-champagne-300 hover:bg-champagne-100'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Inquiries List */}
      <div className="bg-white border border-champagne-300/80 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20">
            <LuxurySpinner size="lg" text="Loading client inquiries..." />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="font-serif text-lg text-obsidian-800">No inquiries match the filter.</p>
          </div>
        ) : (
          <div onScroll={handleScroll} className="divide-y divide-champagne-200 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gold-500/20">
            {infiniteInquiries.map((inq) => (
              <div
                key={inq.id}
                onClick={() => {
                  setSelectedInquiry(inq);
                  if (inq.status === 'NEW') handleUpdateStatus(inq.id, 'READ');
                }}
                className={`p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-champagne-50/60 transition-colors cursor-pointer ${
                  inq.status === 'NEW' ? 'bg-champagne-50/40' : ''
                }`}
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-serif text-base font-semibold text-obsidian-950">
                      {inq.name}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-gold-700">
                      • {inq.eventType || 'Event'}
                    </span>
                    <span
                      className={`text-[9px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                        inq.status === 'NEW'
                          ? 'bg-gold-100 text-gold-900 border-gold-300'
                          : inq.status === 'CONTACTED'
                          ? 'bg-sage-100 text-sage-800 border-sage-300'
                          : 'bg-champagne-200 text-obsidian-800 border-champagne-300'
                      }`}
                    >
                      {inq.status}
                    </span>
                  </div>

                  <p className="text-xs text-obsidian-600 font-light line-clamp-2">
                    “{inq.message}”
                  </p>

                  <div className="flex items-center space-x-4 text-[11px] text-obsidian-400">
                    <span>{inq.email}</span>
                    {inq.phone && <span>• {inq.phone}</span>}
                    <span>• {new Date(inq.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end md:self-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateStatus(inq.id, 'CONTACTED');
                    }}
                    className="px-3 py-1.5 bg-sage-100 hover:bg-sage-200 text-sage-800 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
                  >
                    Mark Contacted
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(inq.id, inq.name);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {inquiries.length > 0 && (
          <AdminInfiniteTableFooter
            displayedCount={infiniteInquiries.length}
            totalCount={inquiries.length}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
          />
        )}
      </div>

      {/* Inquiry Detail Drawer / Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-obsidian-950/80 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-xl w-full border border-champagne-300 p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold-700 font-bold">
                  {selectedInquiry.eventType || 'Event Inquiry'}
                </span>
                <h3 className="font-serif text-2xl text-obsidian-950 font-light mt-1">
                  Inquiry from {selectedInquiry.name}
                </h3>
                <p className="text-xs text-obsidian-500">{selectedInquiry.email} • {selectedInquiry.phone || 'No phone'}</p>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 rounded-full hover:bg-champagne-200 transition-colors text-obsidian-500"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold">
                Message Content
              </label>
              <div className="p-4 bg-champagne-50 rounded-2xl text-xs text-obsidian-800 leading-relaxed font-light whitespace-pre-wrap">
                {selectedInquiry.message}
              </div>
            </div>

            {selectedInquiry.eventDate && (
              <p className="text-xs text-obsidian-600">
                <strong>Target Date:</strong> {new Date(selectedInquiry.eventDate).toLocaleDateString()}
              </p>
            )}

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                Concierge Response Notes
              </label>
              <textarea
                rows={3}
                defaultValue={selectedInquiry.responseNotes || ''}
                onBlur={(e) => handleUpdateStatus(selectedInquiry.id, selectedInquiry.status, e.target.value)}
                placeholder="Called client, discussed 2026 wedding floral stage..."
                className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white"
              />
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-champagne-200">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleUpdateStatus(selectedInquiry.id, 'CONTACTED')}
                  className="px-4 py-2 bg-sage-600 text-white rounded-full text-xs uppercase tracking-wider font-semibold"
                >
                  Mark Contacted
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedInquiry.id, 'ARCHIVED')}
                  className="px-4 py-2 border border-champagne-300 text-obsidian-700 rounded-full text-xs uppercase tracking-wider font-semibold"
                >
                  Archive
                </button>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-5 py-2 bg-obsidian-900 text-ivory-50 rounded-full text-xs uppercase tracking-widest"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
