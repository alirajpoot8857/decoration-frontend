'use client';

import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../src/lib/api';
import LuxurySpinner from '../../../src/components/ui/LuxurySpinner';
import AdminInfiniteTableFooter, { useInfiniteTable } from '../../../src/components/ui/AdminInfiniteTable';
import useBodyScrollLock from '../../../src/hooks/useBodyScrollLock';
import { Activity, Search, Filter, Clock, User, Shield, Eye, Code, X } from 'lucide-react';

const MODULES = [
  'All',
  'PACKAGES',
  'BOOKINGS',
  'RENTALS',
  'INVENTORY',
  'SALES',
  'PURCHASES',
  'GALLERY',
  'SERVICES',
  'AUTH',
  'SETTINGS',
];

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  useBodyScrollLock(Boolean(selectedLog));

  // Infinite Scroll Engine
  const {
    displayedItems: infiniteLogs,
    hasMore,
    isLoadingMore,
    handleScroll,
  } = useInfiniteTable(logs, 15, 15);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getActivityLogs({
        module: selectedModule === 'All' ? undefined : selectedModule,
        search: searchQuery || undefined,
      });
      if (res.logs) setLogs(res.logs);
    } catch (e) {
      console.warn('Failed to load activity logs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedModule, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-gold-400 text-[10px] uppercase tracking-[0.25em] font-semibold">
            <Activity className="w-3.5 h-3.5" />
            <span>Audit & Compliance Trail</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-ivory-50 font-light mt-1">
            System Activity Log
          </h1>
          <p className="text-xs text-ivory-400 font-light mt-1">
            Immutable administrative event stream, mutation history, price adjustments, and authentication records.
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
            placeholder="Search by action, user name, description..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gold-500/30 bg-[#14141E] text-ivory-50 placeholder:text-ivory-600 text-xs focus:outline-none focus:border-gold-400 shadow-sm"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {MODULES.map((mod) => (
            <button
              key={mod}
              onClick={() => setSelectedModule(mod)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
                selectedModule === mod
                  ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 font-bold shadow-md'
                  : 'bg-[#14141E] text-ivory-300 border border-gold-500/20 hover:border-gold-400 hover:text-ivory-50'
              }`}
            >
              {mod}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#0D0D12] border border-gold-500/20 rounded-3xl overflow-hidden shadow-xl text-ivory-100">
        {loading ? (
          <div className="py-24">
            <LuxurySpinner size="lg" text="Loading audit trail logs..." />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="p-3 bg-gold-500/10 border border-gold-500/30 text-gold-400 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <p className="font-serif text-xl text-ivory-50">No activity logs found.</p>
            <p className="text-xs text-ivory-400 max-w-sm mx-auto">
              System changes and staff actions will be logged here in real time.
            </p>
          </div>
        ) : (
          <div onScroll={handleScroll} className="overflow-x-auto max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gold-500/20">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#14141E] border-b border-gold-500/20 text-[10px] uppercase font-bold tracking-wider text-gold-400 sticky top-0 z-10 backdrop-blur-md shadow-sm">
                <tr>
                  <th className="p-4 pl-6">Timestamp</th>
                  <th className="p-4">Staff / User</th>
                  <th className="p-4">Module</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Event Description</th>
                  <th className="p-4 pr-6 text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {infiniteLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.04] transition-colors">
                    <td className="p-4 pl-6 text-ivory-400 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-ivory-50">{log.userName}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-gold-500/10 text-gold-300 border border-gold-500/30">
                        {log.module}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-gold-400 text-[11px]">
                      {log.action}
                    </td>
                    <td className="p-4 text-ivory-200 max-w-sm truncate">
                      {log.description}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {log.changes ? (
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 bg-[#14141E] hover:bg-gold-500/10 text-ivory-200 hover:text-gold-300 border border-gold-500/30 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all inline-flex items-center space-x-1"
                        >
                          <Code className="w-3 h-3 text-gold-400" />
                          <span>Inspect</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-ivory-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {logs.length > 0 && (
          <AdminInfiniteTableFooter
            displayedCount={infiniteLogs.length}
            totalCount={logs.length}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
          />
        )}
      </div>

      {/* JSON Payload Drawer */}
      {selectedLog && (
        <div className="fixed inset-0 z-[99999] overflow-hidden flex items-center justify-center p-3 sm:p-4 md:p-6 bg-obsidian-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative bg-[#0D0D12] text-ivory-50 rounded-3xl overflow-hidden shadow-2xl max-w-xl w-full max-h-[92dvh] sm:max-h-[90dvh] flex flex-col border border-gold-500/30 p-5 sm:p-8 space-y-5 overflow-y-auto overscroll-contain">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold-400 font-bold">
                  {selectedLog.module} • {selectedLog.action}
                </span>
                <h3 className="font-serif text-xl text-ivory-50 font-medium mt-1">
                  Activity Payload Audit
                </h3>
                <p className="text-xs text-ivory-400 font-light">
                  Triggered by {selectedLog.userName} on {new Date(selectedLog.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-ivory-400 hover:text-ivory-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#08080C] text-gold-300 border border-gold-500/20 p-4 rounded-2xl overflow-x-auto text-xs font-mono max-h-72">
              <pre>{JSON.stringify(typeof selectedLog.changes === 'string' ? JSON.parse(selectedLog.changes) : selectedLog.changes, null, 2)}</pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-6 py-2 bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 rounded-full text-xs uppercase tracking-widest font-bold hover:brightness-110 transition-all shadow-md"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
