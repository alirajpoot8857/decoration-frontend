'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

const LUXURY_PHRASES_PUBLIC = [
  'Illuminating the Grand Ballroom...',
  'Arranging Imported Fresh Botanicals...',
  'Sculpting Bespoke Stage Architecture...',
  'Harmonizing Gilded Banquets & Chandeliers...',
];

const LUXURY_PHRASES_ADMIN = [
  'Synchronizing Production Ledgers...',
  'Authorizing High-Security Dossier Access...',
  'Aggregating Stage & Inventory Schedules...',
  'Loading Haute Scénographie Atelier...',
];

export default function LuxuryPreloader({ isDashboard = false, forceShow = false }) {
  const { siteName, tagline } = useTheme();
  const [mounted, setMounted] = useState(true);
  const [fading, setFading] = useState(false);
  const [phraseIdx, setPhraseIdx] = useState(0);

  const phrases = isDashboard ? LUXURY_PHRASES_ADMIN : LUXURY_PHRASES_PUBLIC;

  useEffect(() => {
    // Check session storage if not forceShow
    if (!forceShow) {
      try {
        const storageKey = isDashboard ? 'lumiere_admin_preloader_seen' : 'lumiere_site_preloader_seen';
        const seen = sessionStorage.getItem(storageKey);
        if (seen === 'true') {
          setMounted(false);
          return;
        }
        sessionStorage.setItem(storageKey, 'true');
      } catch (e) {
        // Fallback if sessionStorage is not accessible
      }
    }

    // Phrase cycling interval
    const phraseInterval = setInterval(() => {
      setPhraseIdx((prev) => (prev + 1) % phrases.length);
    }, 450);

    // Trigger smooth fade out at 850ms
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 850);

    // Complete unmount at 1200ms
    const unmountTimer = setTimeout(() => {
      setMounted(false);
    }, 1200);

    return () => {
      clearInterval(phraseInterval);
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, [isDashboard, forceShow, phrases.length]);

  if (!mounted) return null;

  return (
    <div
      onClick={() => setMounted(false)}
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#070709] text-ivory-50 transition-all duration-500 ease-out cursor-pointer select-none ${
        fading ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 scale-100 pointer-events-auto'
      }`}
      aria-hidden={fading}
      title="Click to enter immediately"
    >
      {/* Ambient Theme Warmth & Radial Glow Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(229,168,59,0.24) 0%, rgba(14,12,10,0.7) 45%, rgba(7,7,9,0.98) 75%)',
        }}
      />

      {/* Floating Gold Sparkle Stars in Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 rounded-full bg-gold-400 animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-gold-300 animate-pulse" style={{ animationDuration: '2s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" style={{ animationDuration: '2.5s' }} />
        <div className="absolute bottom-1/4 right-1/3 w-2 h-2 rounded-full bg-amber-400 animate-ping" style={{ animationDuration: '4s' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4 space-y-4 w-full max-w-lg">
        {/* Vector Blooming Royal Mandala Ornament */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center shrink-0">
          <div
            className="absolute inset-0 rounded-full blur-xl animate-pulse"
            style={{
              backgroundColor: 'rgba(229,168,59,0.35)',
              animationDuration: '1.8s',
            }}
          />

          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="themePreloaderGradientFast" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="45%" stopColor="#F59E0B" />
                <stop offset="75%" stopColor="#E5A83B" />
                <stop offset="100%" stopColor="#9A6916" />
              </linearGradient>

              <radialGradient id="themePreloaderCenterGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor="#E5A83B" />
                <stop offset="100%" stopColor="#3D2405" />
              </radialGradient>
            </defs>

            {/* Outer Constellation Orbit Ring */}
            <circle
              cx="100"
              cy="100"
              r="86"
              stroke="url(#themePreloaderGradientFast)"
              strokeWidth="1.5"
              strokeOpacity="0.45"
              strokeDasharray="4 6"
              className="origin-center animate-spin"
              style={{ animationDuration: '8s' }}
            />

            {/* 8 Constellation Diamond Stars on Orbit */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
              <circle
                key={i}
                cx={100 + 86 * Math.cos((deg * Math.PI) / 180)}
                cy={100 + 86 * Math.sin((deg * Math.PI) / 180)}
                r={i % 2 === 0 ? 2.8 : 1.8}
                fill="url(#themePreloaderGradientFast)"
              />
            ))}

            {/* Middle Counter-Rotating Chandelier Ring */}
            <circle
              cx="100"
              cy="100"
              r="68"
              stroke="url(#themePreloaderGradientFast)"
              strokeWidth="1.2"
              strokeOpacity="0.65"
              strokeDasharray="6 4"
              className="origin-center animate-spin"
              style={{ animationDuration: '6s', animationDirection: 'reverse' }}
            />

            {/* 8 Blooming Royal Petals / Stage Botanicals */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <g key={i} transform={`rotate(${angle} 100 100)`}>
                <path
                  d="M 100 100 C 90 70 82 45 100 28 C 118 45 110 70 100 100 Z"
                  fill="url(#themePreloaderGradientFast)"
                  opacity={i % 2 === 0 ? 0.95 : 0.65}
                />
              </g>
            ))}

            {/* Center Gilded Medallion */}
            <circle
              cx="100"
              cy="100"
              r="22"
              fill="url(#themePreloaderCenterGlow)"
              stroke="#FFF"
              strokeWidth="1.5"
            />
            <circle cx="100" cy="100" r="16" fill="#0A0A0E" />

            {/* Center Diamond Sparkle (✦) */}
            <g transform="translate(100, 100)">
              <path
                d="M 0 -11 Q 0 0 -11 0 Q 0 0 0 11 Q 0 0 11 0 Q 0 0 0 -11 Z"
                fill="url(#themePreloaderGradientFast)"
                className="animate-pulse"
              />
              <circle cx="0" cy="0" r="2.2" fill="#FFFFFF" />
            </g>
          </svg>
        </div>

        {/* Brand Scénographie Title */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-center space-x-2 text-[10px] uppercase tracking-[0.4em] text-gold-400 font-sans font-semibold">
            <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-gold-400/80" />
            <span>{isDashboard ? 'ATELIER DÉCOR COMMAND CENTER' : 'MAISON DE SCÉNOGRAPHIE • ATELIER ÉLÉGANCE'}</span>
            <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-gold-400/80" />
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl tracking-[0.22em] text-ivory-50 uppercase font-light drop-shadow-md truncate max-w-md">
            {siteName || 'USMAN DÉCOR'}
          </h1>

          <p className="text-[10px] sm:text-xs text-champagne-200/80 tracking-[0.25em] uppercase font-light font-sans truncate max-w-sm mx-auto">
            {isDashboard ? 'ADMINISTRATION & PRODUCTION DOSSIER' : (tagline || 'Haute Scénographie & Luxury Event Decoration')}
          </p>
        </div>

        {/* Dynamic Loading Progress Bar & Status Text */}
        <div className="w-52 sm:w-60 space-y-2 pt-2">
          <div className="h-[2.5px] w-full bg-white/10 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-gold-500 via-amber-300 to-gold-600 rounded-full shadow-[0_0_12px_rgba(229,168,59,0.7)]"
              style={{
                animation: 'progress 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              }}
            />
          </div>

          <p className="font-serif italic text-xs text-gold-300/95 font-light tracking-wide h-4 transition-all duration-300">
            {phrases[phraseIdx]}
          </p>
        </div>
      </div>
    </div>
  );
}
