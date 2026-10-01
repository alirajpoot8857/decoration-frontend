'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('App error boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-20 bg-[#070709] text-ivory-50 select-none">
      <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-6 shadow-lg animate-pulse">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <span className="text-xs uppercase tracking-[0.3em] text-gold-400 font-semibold mb-2">
        Atelier Notice
      </span>

      <h1 className="font-serif text-3xl sm:text-5xl text-ivory-50 font-light mb-4">
        Something went wrong.
      </h1>

      <p className="text-xs sm:text-sm text-ivory-300 max-w-md mx-auto mb-8 font-light leading-relaxed">
        An unexpected issue occurred while rendering this page. You can try refreshing or return to the main dashboard.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => reset ? reset() : window.location.reload()}
          className="px-8 py-3.5 bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 text-xs uppercase tracking-widest font-bold rounded-full flex items-center space-x-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reload Page</span>
        </button>
        <Link
          href="/"
          className="px-8 py-3.5 text-xs uppercase tracking-widest font-semibold text-ivory-50 hover:text-gold-300 border border-gold-500/30 rounded-full hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
        >
          <Home className="w-4 h-4 text-gold-400" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}
