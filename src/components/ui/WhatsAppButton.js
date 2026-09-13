'use client';

import React, { useState } from 'react';
import { MessageCircle, Sparkles, X } from 'lucide-react';

export default function WhatsAppButton({
  phoneNumber = '+923140660985', // Studio concierge WhatsApp number 03140660985
  defaultMessage = 'Hello Lumière Décor! I would like to inquire about event decoration packages and luxury rentals.',
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Clean phone number for WhatsApp link
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const encodedMsg = encodeURIComponent(defaultMessage);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Luxury Concierge Interactive Tooltip */}
      {showTooltip && (
        <div
          className="mb-3 p-3.5 bg-obsidian-950/95 text-ivory-50 border border-gold-500/50 rounded-2xl shadow-2xl backdrop-blur-md max-w-xs transition-all duration-300 animate-fadeIn select-none"
          style={{ boxShadow: '0 15px 35px -5px rgba(0,0,0,0.5), 0 0 20px rgba(212,175,55,0.25)' }}
        >
          <div className="flex items-center justify-between gap-2 border-b border-gold-500/20 pb-2 mb-2">
            <div className="flex items-center space-x-1.5 text-gold-400 text-[11px] font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Atelier Concierge</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="text-obsidian-400 hover:text-ivory-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-obsidian-200 font-light leading-relaxed">
            Connect instantly with our lead creative directors & event designers on WhatsApp.
          </p>
          <div className="mt-2.5 flex items-center space-x-1.5 text-[10px] text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Design Atelier is Online Now</span>
          </div>
        </div>
      )}

      {/* Floating Luxury WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        aria-label="Direct WhatsApp Consultation Chat"
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-obsidian-900 via-obsidian-950 to-obsidian-900 text-ivory-50 border-2 border-gold-400/90 shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 hover:border-gold-300"
        style={{
          boxShadow:
            '0 12px 28px rgba(0, 0, 0, 0.45), 0 0 22px rgba(212, 175, 55, 0.35)',
        }}
      >
        {/* Glowing Pulse Aura */}
        <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500/30 to-gold-500/30 blur-sm opacity-70 group-hover:opacity-100 transition-opacity animate-pulse" />

        {/* WhatsApp Icon with Emerald & Gold Accent */}
        <div className="relative z-10 flex items-center justify-center text-emerald-400 group-hover:text-gold-300 transition-colors">
          <svg
            className="w-7 h-7 fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        </div>

        {/* Live Badge dot */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-obsidian-950" />
      </a>
    </div>
  );
}
