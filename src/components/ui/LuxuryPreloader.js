'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

const LUXURY_PHRASES = [
  'Illuminating the Grand Ballroom...',
  'Arranging Imported Fresh Botanicals...',
  'Sculpting Bespoke Stage Architecture...',
  'Curating Gilded Banquets & Chandeliers...',
  'Orchestrating Unforgettable Scénographie...',
];

export default function LuxuryPreloader() {
  const { siteName, tagline } = useTheme();
  const [mounted, setMounted] = useState(true);
  const [fading, setFading] = useState(false);
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    // Poetic phrase cycle
    const phraseInterval = setInterval(() => {
      setPhraseIdx((prev) => (prev + 1) % LUXURY_PHRASES.length);
    }, 600);

    // Trigger smooth fade
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 1600);

    // Unmount
    const unmountTimer = setTimeout(() => {
      setMounted(false);
    }, 2200);

    return () => {
      clearInterval(phraseInterval);
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#080706] text-ivory-50 transition-all duration-700 ease-out select-none ${
        fading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      aria-hidden={fading}
    >
      {/* 1. Ambient Theme Warmth & Radial Glow Background (Pure CSS - Instant 0ms Paint) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'var(--theme-ambient-radial, radial-gradient(ellipse at center, rgba(212,175,55,0.22) 0%, rgba(180,130,70,0.08) 45%, rgba(8,7,6,0.98) 75%))',
        }}
      />

      {/* 2. Floating Dynamic Theme Stardust Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[20%] left-[22%] w-1.5 h-1.5 rounded-full animate-ping opacity-60"
          style={{ backgroundColor: 'rgb(var(--color-gold-300))', animationDuration: '3.2s' }}
        />
        <div
          className="absolute top-[28%] right-[24%] w-1 h-1 rounded-full animate-pulse opacity-80"
          style={{ backgroundColor: 'rgb(var(--color-gold-200))', animationDuration: '2.4s' }}
        />
        <div
          className="absolute bottom-[28%] left-[26%] w-1.5 h-1.5 rounded-full animate-pulse opacity-60"
          style={{ backgroundColor: 'rgb(var(--color-gold-400))', animationDuration: '3.8s' }}
        />
        <div
          className="absolute bottom-[22%] right-[22%] w-1 h-1 rounded-full animate-ping opacity-50"
          style={{ backgroundColor: 'rgb(var(--color-gold-200))', animationDuration: '2.8s' }}
        />
        <div
          className="absolute top-[48%] left-[12%] w-1 h-1 rounded-full animate-pulse opacity-40"
          style={{ backgroundColor: 'rgb(var(--color-gold-300))', animationDuration: '4.5s' }}
        />
        <div
          className="absolute top-[45%] right-[14%] w-1 h-1 rounded-full animate-pulse opacity-40"
          style={{ backgroundColor: 'rgb(var(--color-champagne-300))', animationDuration: '4s' }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4 space-y-4 sm:space-y-6 w-full max-w-lg">
        {/* ========================================================================= */}
        {/* LUXURY DYNAMIC VECTOR BLOOMING MANDALA & CHANDELIER ORNAMENT             */}
        {/* ========================================================================= */}
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 flex items-center justify-center shrink-0">
          {/* Ambient Theme Glow Aura Behind SVG */}
          <div
            className="absolute inset-0 rounded-full blur-xl animate-pulse"
            style={{
              backgroundColor: 'var(--theme-glow-aura, rgba(212,175,55,0.4))',
              animationDuration: '2s',
            }}
          />

          {/* SVG Animated Luxury Chandelier Lotus Mandala (Driven by 100% Theme CSS Variables) */}
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            style={{
              filter: 'drop-shadow(0 0 22px rgb(var(--color-gold-500) / 0.5))',
            }}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="themePreloaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgb(var(--color-gold-100))" />
                <stop offset="35%" stopColor="rgb(var(--color-gold-300))" />
                <stop offset="70%" stopColor="rgb(var(--color-gold-500))" />
                <stop offset="100%" stopColor="rgb(var(--color-gold-700))" />
              </linearGradient>

              <radialGradient id="themePreloaderCenter" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgb(var(--color-gold-100))" />
                <stop offset="50%" stopColor="rgb(var(--color-gold-500))" />
                <stop offset="100%" stopColor="rgb(var(--color-gold-900))" />
              </radialGradient>
            </defs>

            {/* 1. Outer Filigree Orbit Ring (Slow Clockwise Rotation) */}
            <g className="origin-center animate-spin" style={{ animationDuration: '12s' }}>
              <circle cx="100" cy="100" r="92" stroke="url(#themePreloaderGradient)" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 6" />
              <circle cx="100" cy="100" r="84" stroke="url(#themePreloaderGradient)" strokeWidth="1.5" strokeOpacity="0.5" />
              {/* Beaded Accents */}
              <circle cx="100" cy="8" r="2.5" fill="url(#themePreloaderGradient)" />
              <circle cx="100" cy="192" r="2.5" fill="url(#themePreloaderGradient)" />
              <circle cx="8" cy="100" r="2.5" fill="url(#themePreloaderGradient)" />
              <circle cx="192" cy="100" r="2.5" fill="url(#themePreloaderGradient)" />
            </g>

            {/* 2. Middle Counter-Rotating Chandelier Crystal Ring */}
            <g className="origin-center animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }}>
              <circle cx="100" cy="100" r="70" stroke="url(#themePreloaderGradient)" strokeWidth="1.2" strokeOpacity="0.4" strokeDasharray="6 4" />
              {/* 8 Faceted Crystal Points */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <g key={i} transform={`rotate(${angle} 100 100)`}>
                  <path d="M 100 30 L 102 36 L 100 42 L 98 36 Z" fill="url(#themePreloaderGradient)" opacity="0.85" />
                </g>
              ))}
            </g>

            {/* 3. The Blooming Botanical 8-Petal Luxury Flower & Leaves */}
            <g className="origin-center animate-spin" style={{ animationDuration: '20s' }}>
              {/* 4 Cardinal Grand Petals / Floral Leaves */}
              <g>
                <path d="M 100 100 C 90 75 80 50 100 32 C 120 50 110 75 100 100 Z" fill="url(#themePreloaderGradient)" opacity="0.9" />
                <path d="M 100 100 C 90 125 80 150 100 168 C 120 150 110 125 100 100 Z" fill="url(#themePreloaderGradient)" opacity="0.9" />
                <path d="M 100 100 C 75 90 50 80 32 100 C 50 120 75 110 100 100 Z" fill="url(#themePreloaderGradient)" opacity="0.9" />
                <path d="M 100 100 C 125 90 150 80 168 100 C 150 120 125 110 100 100 Z" fill="url(#themePreloaderGradient)" opacity="0.9" />
              </g>

              {/* 4 Diagonal Inner Petals & Secondary Leaves */}
              <g transform="rotate(45 100 100)">
                <path d="M 100 100 C 92 80 85 60 100 44 C 115 60 108 80 100 100 Z" fill="url(#themePreloaderGradient)" opacity="0.75" />
                <path d="M 100 100 C 92 120 85 140 100 156 C 115 140 108 120 100 100 Z" fill="url(#themePreloaderGradient)" opacity="0.75" />
                <path d="M 100 100 C 80 92 60 85 44 100 C 60 115 80 108 100 100 Z" fill="url(#themePreloaderGradient)" opacity="0.75" />
                <path d="M 100 100 C 120 92 140 85 156 100 C 140 115 120 108 100 100 Z" fill="url(#themePreloaderGradient)" opacity="0.75" />
              </g>
            </g>

            {/* 4. Center Glowing Diadem Medallion */}
            <circle cx="100" cy="100" r="24" fill="url(#themePreloaderCenter)" stroke="rgb(var(--color-gold-200))" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="18" fill="#080706" />

            {/* 5. Center Diamond Starburst Sparkle (✦) */}
            <g transform="translate(100, 100)">
              <path
                d="M 0 -13 Q 0 0 -13 0 Q 0 0 0 13 Q 0 0 13 0 Q 0 0 0 -13 Z"
                fill="url(#themePreloaderGradient)"
                className="animate-pulse"
              />
              <circle cx="0" cy="0" r="2.5" fill="rgb(var(--color-gold-100))" />
            </g>
          </svg>
        </div>

        {/* ========================================================================= */}
        {/* BRAND IDENTITY & REFINED TYPOGRAPHY                                      */}
        {/* ========================================================================= */}
        <div className="space-y-1.5 sm:space-y-2 w-full px-2">
          <div className="inline-flex items-center space-x-1.5 sm:space-x-2 text-[9px] sm:text-[11px] font-sans uppercase tracking-[0.25em] sm:tracking-[0.4em] text-gold-400 font-semibold">
            <span className="h-px w-3 sm:w-5 bg-gold-400/50" />
            <span>Maison de Scénographie</span>
            <span className="h-px w-3 sm:w-5 bg-gold-400/50" />
          </div>

          <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-light tracking-[0.15em] sm:tracking-[0.25em] text-ivory-50 uppercase max-w-full truncate">
            {siteName || 'USMAN DÉCOR'}
          </h1>

          <p className="text-[9px] sm:text-xs font-sans uppercase tracking-[0.18em] sm:tracking-[0.3em] text-champagne-300/80 font-light max-w-full truncate px-2">
            {tagline || 'Haute Couture Event Décor & Staging Atelier'}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* POETIC STATUS SHIMMER & THEMED PROGRESS BAR                              */}
        {/* ========================================================================= */}
        <div className="w-full max-w-[240px] sm:max-w-[320px] space-y-2.5 sm:space-y-3 pt-1">
          {/* Dynamic Theme Shimmer Line */}
          <div
            className="h-[2px] w-full bg-obsidian-800 rounded-full overflow-hidden relative"
            style={{
              boxShadow: '0 0 12px rgb(var(--color-gold-500) / 0.5)',
            }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-400 to-transparent"
              style={{
                animation: 'shimmer 1.8s infinite linear',
              }}
            />
          </div>

          {/* Poetic Cross-fading Phrase */}
          <p className="text-[10px] sm:text-xs font-serif italic text-champagne-200 tracking-wider h-5 transition-opacity duration-300 px-2 truncate">
            {LUXURY_PHRASES[phraseIdx]}
          </p>
        </div>
      </div>
    </div>
  );
}
