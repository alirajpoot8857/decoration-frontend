'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function AdminTablePagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startRecord = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(totalItems, currentPage * pageSize);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-champagne-50/90 border-t border-champagne-200 text-xs text-obsidian-700 select-none">
      {/* Records Count & Page Size Selector */}
      <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
        <span className="text-[11px] text-obsidian-500 font-medium">
          Showing <strong className="text-obsidian-900 font-bold">{startRecord}</strong>–<strong className="text-obsidian-900 font-bold">{endRecord}</strong> of <strong className="text-obsidian-900 font-bold">{totalItems}</strong> entries
        </span>

        {onPageSizeChange && (
          <div className="flex items-center space-x-1.5 pl-2 border-l border-champagne-300">
            <span className="text-[10px] uppercase font-semibold text-obsidian-500 hidden md:inline">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                if (onPageChange) onPageChange(1);
              }}
              className="bg-white border border-champagne-300 rounded-lg px-2 py-1 text-xs text-obsidian-800 focus:outline-none focus:border-gold-500 shadow-sm"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center space-x-1.5 self-end sm:self-auto">
        <button
          onClick={() => onPageChange && onPageChange(1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border border-champagne-300 bg-white text-obsidian-700 hover:bg-champagne-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          title="First Page"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onPageChange && onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border border-champagne-300 bg-white text-obsidian-700 hover:bg-champagne-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          title="Previous Page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <span className="px-3 py-1 bg-white border border-champagne-300 rounded-lg text-xs font-semibold text-obsidian-900 shadow-sm">
          {currentPage} / {totalPages}
        </span>

        <button
          onClick={() => onPageChange && onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-champagne-300 bg-white text-obsidian-700 hover:bg-champagne-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          title="Next Page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onPageChange && onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-champagne-300 bg-white text-obsidian-700 hover:bg-champagne-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          title="Last Page"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
