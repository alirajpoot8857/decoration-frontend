'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '../../context/ThemeContext';
import { Sparkles, MapPin, Phone, Mail, Instagram, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  const { siteName, tagline } = useTheme();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="bg-obsidian-950 text-ivory-100 border-t border-gold-500/20 pt-20 pb-12 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gold-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-obsidian-800">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="inline-block group max-w-full">
              <span className="font-serif tracking-[0.14em] sm:tracking-[0.2em] text-xl sm:text-2xl font-light uppercase text-ivory-50 group-hover:text-gold-300 transition-colors whitespace-nowrap block">
                {siteName}
              </span>
              <span className="block text-[8px] sm:text-[9px] uppercase tracking-[0.18em] sm:tracking-[0.25em] font-sans text-champagne-400 font-medium mt-0.5 truncate max-w-xs sm:max-w-sm">
                {tagline}
              </span>
            </Link>

            <p className="text-obsidian-400 text-sm leading-relaxed max-w-md font-light">
              Bespoke luxury event architecture, haute floral installations, and dramatic scenography for high-society weddings, galas, and milestone celebrations worldwide.
            </p>

            <div className="pt-2">
              <div className="inline-flex items-center space-x-2 text-xs font-serif tracking-widest text-gold-400 border border-gold-500/30 px-3.5 py-1.5 rounded-full bg-gold-500/5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Creating unforgettable spaces since 2018</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.25em] text-gold-400 font-semibold">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              {['About', 'Services', 'Gallery', 'Packages', 'Rental', 'Contact'].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase()}`}
                    className="text-obsidian-400 hover:text-ivory-50 transition-colors font-light flex items-center group"
                  >
                    <span>{item}</span>
                    <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-gold-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Column */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.25em] text-gold-400 font-semibold">
              Services
            </h4>
            <ul className="space-y-2.5 text-sm text-obsidian-400 font-light">
              <li className="hover:text-ivory-50 transition-colors">
                <Link href="/services">Wedding Décor</Link>
              </li>
              <li className="hover:text-ivory-50 transition-colors">
                <Link href="/services">Birthday & Milestones</Link>
              </li>
              <li className="hover:text-ivory-50 transition-colors">
                <Link href="/services">Corporate Prestige Galas</Link>
              </li>
              <li className="hover:text-ivory-50 transition-colors">
                <Link href="/services">Engagements & Mehndi</Link>
              </li>
              <li className="hover:text-ivory-50 transition-colors">
                <Link href="/rental">Luxury Item Rental</Link>
              </li>
            </ul>
          </div>

          {/* Flagship Studio & Contact */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.25em] text-gold-400 font-semibold">
              Flagship Studio
            </h4>
            <div className="space-y-3 text-sm text-obsidian-400 font-light">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-gold-500 flex-shrink-0 mt-1" />
                <span>9450 Wilshire Blvd, Suite 800, Beverly Hills, CA 90212</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gold-500 flex-shrink-0" />
                <span>+92 314 0660985</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gold-500 flex-shrink-0" />
                <span>concierge@lumieredecor.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gold-400 pt-1">
                <Instagram className="w-4 h-4 flex-shrink-0" />
                <span>@lumiere.decor.luxury</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-obsidian-500 font-light space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} LUMIÈRE DECOR Haute Scénographie. All rights reserved.</p>
          <div className="flex space-x-6 text-obsidian-400">
            <Link href="/contact" className="hover:text-gold-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:text-gold-400 transition-colors">
              Terms of Artistry
            </Link>
            <Link href="/login" className="hover:text-gold-400 transition-colors">
              Portal Access
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
