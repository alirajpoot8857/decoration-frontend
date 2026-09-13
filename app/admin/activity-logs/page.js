'use client';

import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../src/lib/api';
import LuxurySpinner from '../../../src/components/ui/LuxurySpinner';
import AdminInfiniteTableFooter, { useInfiniteTable } from '../../../src/components/ui/AdminInfiniteTable';
import { Activity, Search, Filter, Clock, User, Shield, Eye, Code } from 'lucide-react';

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
          <div className="inline-flex items-center space-x-2 text-gold-700 text-[10px] uppercase tracking-[0.25em] font-semibold">
            <Activity className="w-3.5 h-3.5" />
            <span>Audit & Compliance Trail</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-obsidian-950 font-light">
            System Activity Log
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
            placeholder="Search by action, user name, description..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-champagne-300 bg-white text-xs focus:outline-none focus:border-gold-500 shadow-sm"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {MODULES.map((mod) => (
            <button
              key={mod}
              onClick={() => setSelectedModule(mod)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
                selectedModule === mod
                  ? 'bg-obsidian-900 text-ivory-50 shadow-sm'
                  : 'bg-white text-obsidian-700 border border-champagne-300 hover:bg-champagne-100'
              }`}
            >
              {mod}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-champagne-300/80 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20">
            <LuxurySpinner size="lg" text="Loading audit trail logs..." />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="font-serif text-lg text-obsidian-800">No activity logs found.</p>
          </div>
        ) : (
          <div onScroll={handleScroll} className="overflow-x-auto max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gold-500/20">
            <table className="w-full text-left text-xs text-obsidian-700">
              <thead className="bg-champagne-100/95 border-b border-champagne-200 text-[10px] uppercase font-bold tracking-wider text-obsidian-600 sticky top-0 z-10 backdrop-blur-md shadow-sm">
                <tr>
                  <th className="p-4 pl-6">Timestamp</th>
                  <th className="p-4">Staff / User</th>
                  <th className="p-4">Module</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Event Description</th>
                  <th className="p-4 pr-6 text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-champagne-200">
                {infiniteLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-champagne-50/50 transition-colors">
                    <td className="p-4 pl-6 text-obsidian-500 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-obsidian-900">{log.userName}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-champagne-200 text-gold-900 border border-champagne-300">
                        {log.module}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-obsidian-800 text-[11px]">
                      {log.action}
                    </td>
                    <td className="p-4 text-obsidian-700 max-w-sm truncate">
                      {log.description}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {log.changes ? (
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 bg-champagne-100 hover:bg-champagne-200 text-obsidian-800 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-colors inline-flex items-center space-x-1"
                        >
                          <Code className="w-3 h-3 text-gold-700" />
                          <span>Inspect</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-obsidian-400">—</span>
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
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-obsidian-950/80 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-xl w-full border border-champagne-300 p-6 sm:p-8 space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold-700 font-bold">
                  {selectedLog.module} • {selectedLog.action}
                </span>
                <h3 className="font-serif text-xl text-obsidian-950 font-medium mt-1">
                  Activity Payload Audit
                </h3>
                <p className="text-xs text-obsidian-500 font-light">
                  Triggered by {selectedLog.userName} on {new Date(selectedLog.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 rounded-full hover:bg-champagne-200 transition-colors text-obsidian-500"
              >
                ✕
              </button>
            </div>

            <div className="bg-obsidian-950 text-gold-300 p-4 rounded-2xl overflow-x-auto text-xs font-mono max-h-72">
              <pre>{JSON.stringify(typeof selectedLog.changes === 'string' ? JSON.parse(selectedLog.changes) : selectedLog.changes, null, 2)}</pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-6 py-2 bg-obsidian-900 text-ivory-50 rounded-full text-xs uppercase tracking-widest hover:bg-gold-600 transition-colors"
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
