'use client';

import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../src/lib/api';
import { useToast } from '../../../src/context/ToastContext';
import { useConfirmModal } from '../../../src/context/ConfirmModalContext';
import LuxurySpinner from '../../../src/components/ui/LuxurySpinner';
import AdminInfiniteTableFooter, { useInfiniteTable } from '../../../src/components/ui/AdminInfiniteTable';
import useBodyScrollLock from '../../../src/hooks/useBodyScrollLock';
import { Mail, Search, CheckCircle2, MessageSquare, Trash2, Eye, Calendar, Phone, X } from 'lucide-react';

export default function AdminInquiriesPage() {
  const { showToast } = useToast();
  const { confirmDelete } = useConfirmModal();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [updating, setUpdating] = useState(false);

  useBodyScrollLock(Boolean(selectedInquiry));

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
          <div className="inline-flex items-center space-x-2 text-gold-400 text-[10px] uppercase tracking-[0.25em] font-semibold">
            <Mail className="w-3.5 h-3.5" />
            <span>Inbound Concierge</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-ivory-50 font-light mt-1">
            Contact Inquiries & Requests
          </h1>
          <p className="text-xs text-ivory-400 font-light mt-1">
            Review prospective client messages, wedding consultation requests, and response logs.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
        {['All', 'NEW', 'READ', 'CONTACTED', 'ARCHIVED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all flex-shrink-0 ${
              statusFilter === st
                ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 font-bold shadow-md'
                : 'bg-[#14141E] text-ivory-300 border border-gold-500/20 hover:border-gold-400 hover:text-ivory-50'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Inquiries List */}
      <div className="bg-[#0D0D12] border border-gold-500/20 rounded-3xl overflow-hidden shadow-xl text-ivory-100">
        {loading ? (
          <div className="py-24">
            <LuxurySpinner size="lg" text="Loading client inquiries..." />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="p-3 bg-gold-500/10 border border-gold-500/30 text-gold-400 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <p className="font-serif text-xl text-ivory-50">No inquiries match the filter.</p>
            <p className="text-xs text-ivory-400 max-w-sm mx-auto">
              Inbound inquiries submitted on the public website contact and consultation forms will appear here.
            </p>
          </div>
        ) : (
          <div onScroll={handleScroll} className="divide-y divide-white/5 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gold-500/20">
            {infiniteInquiries.map((inq) => (
              <div
                key={inq.id}
                onClick={() => {
                  setSelectedInquiry(inq);
                  if (inq.status === 'NEW') handleUpdateStatus(inq.id, 'READ');
                }}
                className={`p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-white/[0.04] transition-colors cursor-pointer ${
                  inq.status === 'NEW' ? 'bg-gold-500/[0.06] border-l-4 border-l-gold-500' : ''
                }`}
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-serif text-base font-semibold text-ivory-50">
                      {inq.name}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-gold-400">
                      • {inq.eventType || 'Event'}
                    </span>
                    <span
                      className={`text-[9px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                        inq.status === 'NEW'
                          ? 'bg-gold-500/20 text-gold-300 border-gold-500/40 animate-pulse'
                          : inq.status === 'CONTACTED'
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                          : inq.status === 'ARCHIVED'
                          ? 'bg-white/5 text-ivory-400 border-white/10'
                          : 'bg-[#14141E] text-ivory-300 border-white/10'
                      }`}
                    >
                      {inq.status}
                    </span>
                  </div>

                  <p className="text-xs text-ivory-300 font-light line-clamp-2">
                    “{inq.message}”
                  </p>

                  <div className="flex items-center space-x-4 text-[11px] text-ivory-400">
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
                    className="px-3.5 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all"
                  >
                    Mark Contacted
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(inq.id, inq.name);
                    }}
                    className="p-2 text-red-400 hover:text-red-200 bg-red-950/30 hover:bg-red-900/50 border border-red-500/20 rounded-xl transition-all"
                    title="Delete Inquiry"
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
        <div className="fixed inset-0 z-[99999] overflow-hidden flex items-center justify-center p-3 sm:p-4 md:p-6 bg-obsidian-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative bg-[#0D0D12] text-ivory-50 rounded-3xl overflow-hidden shadow-2xl max-w-xl w-full max-h-[92dvh] sm:max-h-[90dvh] flex flex-col border border-gold-500/30 p-5 sm:p-8 space-y-5 overflow-y-auto overscroll-contain">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold-400 font-bold">
                  {selectedInquiry.eventType || 'Event Inquiry'}
                </span>
                <h3 className="font-serif text-2xl text-ivory-50 font-light mt-1">
                  Inquiry from {selectedInquiry.name}
                </h3>
                <p className="text-xs text-ivory-400">{selectedInquiry.email} • {selectedInquiry.phone || 'No phone'}</p>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-ivory-400 hover:text-ivory-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] uppercase tracking-wider text-gold-400 font-semibold">
                Message Content
              </label>
              <div className="p-4 bg-[#14141E] border border-gold-500/20 rounded-2xl text-xs text-ivory-200 leading-relaxed font-light whitespace-pre-wrap">
                {selectedInquiry.message}
              </div>
            </div>

            {selectedInquiry.eventDate && (
              <p className="text-xs text-ivory-300">
                <strong className="text-gold-400">Target Date:</strong> {new Date(selectedInquiry.eventDate).toLocaleDateString()}
              </p>
            )}

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-ivory-300 font-semibold mb-1">
                Concierge Response Notes
              </label>
              <textarea
                rows={3}
                defaultValue={selectedInquiry.responseNotes || ''}
                onBlur={(e) => handleUpdateStatus(selectedInquiry.id, selectedInquiry.status, e.target.value)}
                placeholder="Called client, discussed 2026 wedding floral stage..."
                className="w-full text-xs p-2.5 rounded-xl border border-gold-500/30 bg-[#14141E] text-ivory-50 placeholder:text-ivory-600 focus:outline-none focus:border-gold-400"
              />
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-white/10">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleUpdateStatus(selectedInquiry.id, 'CONTACTED')}
                  className="px-4 py-2 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 rounded-full text-xs uppercase tracking-wider font-semibold transition-all"
                >
                  Mark Contacted
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedInquiry.id, 'ARCHIVED')}
                  className="px-4 py-2 border border-white/20 text-ivory-300 hover:bg-white/10 rounded-full text-xs uppercase tracking-wider font-semibold transition-all"
                >
                  Archive
                </button>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-6 py-2 bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 rounded-full text-xs uppercase tracking-widest font-bold hover:brightness-110 transition-all shadow-md"
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
