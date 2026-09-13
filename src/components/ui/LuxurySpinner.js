'use client';

import React from 'react';

export default function LuxurySpinner({ size = 'md', text = '' }) {
  const sizeConfig = {
    sm: {
      dimension: 'w-10 h-10',
      textClass: 'text-[10px]',
    },
    md: {
      dimension: 'w-16 h-16',
      textClass: 'text-xs',
    },
    lg: {
      dimension: 'w-24 h-24',
      textClass: 'text-sm',
    },
  };

  const { dimension, textClass } = sizeConfig[size] || sizeConfig.md;

  return (
    <div className="flex flex-col items-center justify-center space-y-3.5 py-6 select-none">
      {/* Luxury Dynamic Blooming Mandala / Chandelier Loader */}
      <div className={`relative ${dimension} flex items-center justify-center`}>
        {/* Ambient Theme Glow Aura */}
        <div
          className="absolute inset-0 rounded-full blur-md animate-pulse"
          style={{
            backgroundColor: 'var(--theme-glow-aura, rgba(212,175,55,0.35))',
            animationDuration: '2s',
          }}
        />

        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          style={{
            filter: 'drop-shadow(0 0 14px rgb(var(--color-gold-500) / 0.5))',
          }}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="themeSpinnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(var(--color-gold-100))" />
              <stop offset="35%" stopColor="rgb(var(--color-gold-300))" />
              <stop offset="70%" stopColor="rgb(var(--color-gold-500))" />
              <stop offset="100%" stopColor="rgb(var(--color-gold-700))" />
            </linearGradient>

            <radialGradient id="themeSpinnerCenter" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgb(var(--color-gold-100))" />
              <stop offset="60%" stopColor="rgb(var(--color-gold-500))" />
              <stop offset="100%" stopColor="rgb(var(--color-gold-900))" />
            </radialGradient>
          </defs>

          {/* 1. Outer Filigree Orbit Ring */}
          <g className="origin-center animate-spin" style={{ animationDuration: '9s' }}>
            <circle cx="50" cy="50" r="46" stroke="url(#themeSpinnerGradient)" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="3 5" />
            <circle cx="50" cy="4" r="1.5" fill="url(#themeSpinnerGradient)" />
            <circle cx="50" cy="96" r="1.5" fill="url(#themeSpinnerGradient)" />
            <circle cx="4" cy="50" r="1.5" fill="url(#themeSpinnerGradient)" />
            <circle cx="96" cy="50" r="1.5" fill="url(#themeSpinnerGradient)" />
          </g>

          {/* 2. Middle Counter-Rotating Chandelier Crystal Array */}
          <g className="origin-center animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}>
            <circle cx="50" cy="50" r="35" stroke="url(#themeSpinnerGradient)" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="4 4" />
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
              <g key={i} transform={`rotate(${angle} 50 50)`}>
                <path d="M 50 15 L 51.5 19 L 50 23 L 48.5 19 Z" fill="url(#themeSpinnerGradient)" opacity="0.9" />
              </g>
            ))}
          </g>

          {/* 3. The Blooming 4-Petal Stage Floral Leaves */}
          <g className="origin-center animate-spin" style={{ animationDuration: '16s' }}>
            <path d="M 50 50 C 45 37 40 25 50 16 C 60 25 55 37 50 50 Z" fill="url(#themeSpinnerGradient)" opacity="0.88" />
            <path d="M 50 50 C 45 63 40 75 50 84 C 60 75 55 63 50 50 Z" fill="url(#themeSpinnerGradient)" opacity="0.88" />
            <path d="M 50 50 C 37 45 25 40 16 50 C 25 60 37 55 50 50 Z" fill="url(#themeSpinnerGradient)" opacity="0.88" />
            <path d="M 50 50 C 63 45 75 40 84 50 C 75 60 63 55 50 50 Z" fill="url(#themeSpinnerGradient)" opacity="0.88" />
          </g>

          {/* 4. Center Glowing Medallion */}
          <circle cx="50" cy="50" r="12" fill="url(#themeSpinnerCenter)" stroke="rgb(var(--color-gold-200))" strokeWidth="1" />
          <circle cx="50" cy="50" r="9" fill="#141414" />

          {/* 5. Center Diamond Starburst Sparkle (✦) */}
          <g transform="translate(50, 50)">
            <path
              d="M 0 -6.5 Q 0 0 -6.5 0 Q 0 0 0 6.5 Q 0 0 6.5 0 Q 0 0 0 -6.5 Z"
              fill="url(#themeSpinnerGradient)"
              className="animate-pulse"
            />
            <circle cx="0" cy="0" r="1.2" fill="rgb(var(--color-gold-100))" />
          </g>
        </svg>
      </div>

      {/* Accompanying Editorial Status Text */}
      {text && (
        <div className="flex flex-col items-center space-y-1 text-center">
          <p className="font-serif tracking-[0.2em] uppercase text-obsidian-900 font-semibold text-xs animate-pulse">
            {text}
          </p>
          <span className="h-[1px] w-12 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
        </div>
      )}
    </div>
  );
}
