'use client';

import React, { useState } from 'react';
import { useDiscount } from '../../context/DiscountContext';
import { Sparkles, Tag, X, Copy, Check } from 'lucide-react';

export default function SitewidePromoBanner() {
  const { isDiscountActive, effectiveDiscount, bannerText, promoCode, isBannerDismissed, setIsBannerDismissed } = useDiscount();
  const [copied, setCopied] = useState(false);

  if (!isDiscountActive || effectiveDiscount <= 0 || isBannerDismissed) return null;

  const handleCopyCode = () => {
    if (promoCode) {
      navigator.clipboard.writeText(promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'rgba(20, 17, 13, 0.68)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      }}
      className="sticky top-0 left-0 right-0 z-40 border-b border-gold-500/30 text-ivory-50 text-xs py-1.5 sm:py-2 px-2.5 sm:px-4 shadow-[0_4px_25px_rgba(0,0,0,0.35)] transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex-1 flex items-center justify-center space-x-1.5 sm:space-x-2.5 text-center min-w-0">
          {/* Discount Pill Badge */}
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-300 font-bold uppercase tracking-wider text-[9px] sm:text-[10px] border border-gold-500/40 shadow-sm shrink-0">
            <Sparkles className="w-2.5 h-2.5 mr-1 text-gold-400 shrink-0" />
            <span>{effectiveDiscount}% OFF</span>
          </span>

          {/* Banner Promo Message - Responsive Length */}
          <span className="text-champagne-100 font-light truncate text-[10.5px] sm:text-xs">
            <span className="md:hidden">
              Season Special: Use code <strong className="text-gold-300 font-mono font-semibold">{promoCode}</strong>
            </span>
            <span className="hidden md:inline">
              {bannerText || `Special Offer: Enjoy ${effectiveDiscount}% OFF across our entire catalog!`}
            </span>
          </span>

          {/* Interactive 1-Click Code Copy */}
          {promoCode && (
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center space-x-1 px-2 sm:px-2.5 py-0.5 rounded-full bg-gradient-to-r from-gold-600 to-champagne-500 text-obsidian-950 font-mono font-bold text-[9.5px] sm:text-[10px] uppercase tracking-wider hover:brightness-110 transition-all shadow-sm active:scale-95 shrink-0"
              title="Click to copy promo code"
            >
              <Tag className="w-2.5 h-2.5 text-obsidian-950 shrink-0" />
              <span className="hidden xs:inline">{promoCode}</span>
              {copied ? (
                <Check className="w-2.5 h-2.5 text-obsidian-950 shrink-0" />
              ) : (
                <Copy className="w-2.5 h-2.5 text-obsidian-950 shrink-0" />
              )}
            </button>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => setIsBannerDismissed(true)}
          className="text-ivory-200/60 hover:text-gold-300 hover:bg-white/10 transition-colors p-1 rounded-full shrink-0"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
