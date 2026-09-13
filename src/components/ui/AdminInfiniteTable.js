'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader2, CheckCircle2, Sparkles } from 'lucide-react';

/**
 * Custom hook to handle infinite scrolling for admin tables.
 * Takes the full filtered list (or paginated list), handles auto-loading next batch on scroll.
 */
export function useInfiniteTable(items = [], initialBatch = 15, batchSize = 15, onFetchMore = null) {
  const [visibleCount, setVisibleCount] = useState(initialBatch);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Reset to initial batch whenever the underlying items list or search changes
  useEffect(() => {
    setVisibleCount(initialBatch);
    setIsLoadingMore(false);
  }, [items.length, initialBatch]);

  const displayedItems = useMemo(() => {
    return items.slice(0, visibleCount);
  }, [items, visibleCount]);

  const hasMore = visibleCount < items.length;

  const handleScroll = useCallback(
    (e) => {
      const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
      // When scrolled within 70px from bottom and has more items and not already loading
      if (scrollHeight - scrollTop - clientHeight < 70 && hasMore && !isLoadingMore) {
        setIsLoadingMore(true);

        if (onFetchMore) {
          Promise.resolve(onFetchMore()).finally(() => {
            setVisibleCount((prev) => Math.min(prev + batchSize, items.length));
            setIsLoadingMore(false);
          });
        } else {
          // Smooth simulated network batch load
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + batchSize, items.length));
            setIsLoadingMore(false);
          }, 350);
        }
      }
    },
    [hasMore, isLoadingMore, onFetchMore, batchSize, items.length]
  );

  return {
    displayedItems,
    visibleCount,
    hasMore,
    isLoadingMore,
    handleScroll,
    totalCount: items.length,
  };
}

/**
 * Luxury Infinite Scroll Footer shown right below the table container
 */
export default function AdminInfiniteTableFooter({
  displayedCount,
  totalCount,
  hasMore,
  isLoadingMore,
}) {
  if (totalCount === 0) return null;

  return (
    <div className="border-t border-champagne-200 bg-ivory-50/80 backdrop-blur-sm transition-all duration-200">
      {isLoadingMore ? (
        <div className="py-3 px-4 flex items-center justify-center space-x-2 text-gold-800 text-xs font-medium animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-gold-600" />
          <span>Fetching next records from database...</span>
        </div>
      ) : hasMore ? (
        <div className="py-2.5 px-5 flex items-center justify-between text-xs text-obsidian-600">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-gold-500 animate-ping" />
            <span className="font-medium text-[11px] text-obsidian-700">
              Showing {displayedCount} of {totalCount} records
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-gold-700 bg-gold-500/10 px-2.5 py-0.5 rounded-full border border-gold-500/20">
            Scroll down to auto-load more
          </span>
        </div>
      ) : (
        <div className="py-2.5 px-5 flex items-center justify-between text-xs text-obsidian-500">
          <span className="text-[11px] font-medium text-obsidian-700">
            All {totalCount} records loaded in view
          </span>
          <span className="inline-flex items-center text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
            Complete Ledger Synchronized
          </span>
        </div>
      )}
    </div>
  );
}
