'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, Crown } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-20 bg-[#070709] text-ivory-50 select-none">
      <div className="w-16 h-16 rounded-3xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 mb-6 shadow-glow-pill animate-float-slow">
        <Crown className="w-8 h-8" />
      </div>

      <span className="text-xs uppercase tracking-[0.3em] text-gold-400 font-semibold mb-2">
        404 — Grand Page Not Found
      </span>

      <h1 className="font-serif text-4xl sm:text-6xl text-ivory-50 font-light mb-4">
        An Uncharted <span className="italic font-normal text-gold-gradient">Palace Hall.</span>
      </h1>

      <p className="text-xs sm:text-sm text-champagne-200/80 max-w-md mx-auto mb-8 font-light leading-relaxed">
        The bespoke event collection or page you are seeking does not exist or has been relocated within the atelier.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/"
          className="btn-festivity-pill px-8 py-3.5 text-xs uppercase tracking-widest font-bold text-obsidian-950 flex items-center space-x-2 shadow-glow-pill hover:scale-105 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Atelier Home</span>
        </Link>
        <Link
          href="/gallery"
          className="btn-festivity-outline px-8 py-3.5 text-xs uppercase tracking-widest font-semibold text-ivory-50 hover:text-gold-300 border border-gold-500/30 rounded-full hover:scale-105 active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-gold-400 mr-1.5 inline" />
          <span>Explore Lookbook</span>
        </Link>
      </div>
    </div>
  );
}
