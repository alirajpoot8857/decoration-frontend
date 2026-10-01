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
        backgroundColor: 'rgba(20, 17, 13, 0.88)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      }}
      className="sticky top-0 left-0 right-0 z-40 min-h-[42px] border-b border-gold-500/35 text-white text-xs py-2 sm:py-2.5 px-3.5 sm:px-6 shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-all duration-300 dark-preserve flex items-center"
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2.5 sm:gap-4 dark-preserve">
        <div className="flex-1 flex items-center justify-center space-x-2 sm:space-x-3 text-center min-w-0 dark-preserve">
          {/* Discount Pill Badge */}
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gold-500/25 text-[#FDE68A] font-bold uppercase tracking-wider text-xs border border-gold-500/50 shadow-sm shrink-0">
            <Sparkles className="w-3 h-3 mr-1 text-[#FBBF24] shrink-0" />
            <span>{effectiveDiscount}% OFF</span>
          </span>

          {/* Banner Promo Message - Responsive Length */}
          <span className="text-ivory-50 font-normal truncate text-xs">
            <span className="md:hidden">
              Season Special: Use code <strong className="text-[#FDE68A] font-mono font-bold">{promoCode}</strong>
            </span>
            <span className="hidden md:inline text-ivory-100">
              {bannerText || `Special Offer: Enjoy ${effectiveDiscount}% OFF across our entire catalog!`}
            </span>
          </span>

          {/* Interactive 1-Click Code Copy */}
          {promoCode && (
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-gold-600 to-champagne-500 text-obsidian-950 font-mono font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-sm active:scale-95 shrink-0"
              title="Click to copy promo code"
            >
              <Tag className="w-3 h-3 text-obsidian-950 shrink-0" />
              <span className="hidden xs:inline">{promoCode}</span>
              {copied ? (
                <Check className="w-3 h-3 text-obsidian-950 shrink-0" />
              ) : (
                <Copy className="w-3 h-3 text-obsidian-950 shrink-0" />
              )}
            </button>
          )}
        </div>

        {/* Dismiss Button with comfortable touch padding & clear margin */}
        <button
          onClick={() => setIsBannerDismissed(true)}
          className="text-ivory-200/90 hover:text-gold-300 hover:bg-white/15 transition-colors p-1.5 rounded-full shrink-0 ml-1.5 sm:ml-3"
          aria-label="Dismiss promotional banner"
        >
          <X className="w-4 h-4 text-white/90" />
        </button>
      </div>
    </div>
  );
}
