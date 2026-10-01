'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '../../context/ThemeContext';
import { Sparkles, MapPin, Phone, Mail, Instagram, ArrowUpRight, CheckCircle2, Send, Heart } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  const { siteName, tagline, isDarkMode } = useTheme();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  if (pathname?.startsWith('/admin')) return null;

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setNewsletterEmail('');
      }, 3000);
    }
  };

  const formattedSiteName = typeof siteName === 'string' && siteName.length > 0
    ? siteName.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()).replace(/&/g, '&')
    : 'Lumière Décor';

  return (
    <footer className={`${isDarkMode ? 'bg-obsidian-950 text-ivory-100' : 'bg-[#FAF7F2] text-[#141210]'} border-t border-gold-500/25 pt-16 sm:pt-20 pb-12 relative overflow-hidden select-none transition-colors duration-300`}>
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-36 bg-gold-500/10 blur-3xl pointer-events-none animate-glow-pulse" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-16 border-b border-gold-500/20">
          {/* Brand & Mission Column */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="inline-block group max-w-full">
              <span className={`font-serif tracking-[0.14em] sm:tracking-[0.18em] text-xl sm:text-2xl font-light ${isDarkMode ? 'text-ivory-50 group-hover:text-gold-300' : 'text-[#141210] group-hover:text-gold-700'} transition-colors whitespace-nowrap block`}>
                {formattedSiteName}
              </span>
              <span className={`block text-xs uppercase tracking-wider font-sans ${isDarkMode ? 'text-champagne-400' : 'text-gold-800'} font-medium mt-1`}>
                {tagline}
              </span>
            </Link>

            <p className={`${isDarkMode ? 'text-champagne-300/80' : 'text-[#3D352A]'} text-xs sm:text-sm leading-relaxed max-w-sm font-light`}>
              Bespoke luxury event architecture, haute floral installations, and grand wedding scenography across Pakistan. Turning your most cherished celebrations into timeless masterpieces.
            </p>

            <div className="pt-1">
              <div className="inline-flex items-center space-x-2 text-xs font-serif tracking-widest text-gold-400 border border-gold-500/35 px-3.5 py-1.5 rounded-full bg-gold-500/10">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span className={isDarkMode ? 'text-gold-300' : 'text-gold-800 font-semibold'}>Crafting Masterpieces Since 2018</span>
              </div>
            </div>

            {/* VIP Newsletter Subscription Box with Perfectly Aligned Input & Button */}
            <div className="pt-3 space-y-2">
              <p className={`text-xs uppercase tracking-wider font-bold ${isDarkMode ? 'text-gold-400' : 'text-gold-800'}`}>
                Join the Haute Scénographie Circle
              </p>
              {subscribed ? (
                <div className="flex items-center space-x-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs animate-fadeInUp">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Thank you for joining our private lookbook list!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex items-center w-full max-w-sm h-11 rounded-xl border border-gold-500/40 bg-obsidian-950/80 overflow-hidden focus-within:ring-2 focus-within:ring-gold-400/50 shadow-md">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className={`h-full flex-1 px-3.5 text-xs ${
                      isDarkMode
                        ? 'bg-transparent text-ivory-50 placeholder:text-stone-500'
                        : 'bg-white text-[#141210] placeholder:text-stone-400'
                    } focus:outline-none border-none`}
                  />
                  <button
                    type="submit"
                    className="h-full px-4 bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shrink-0 flex items-center space-x-1.5"
                  >
                    <span>Join</span>
                    <Send className="w-3 h-3" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className={`text-sm font-semibold tracking-wider ${isDarkMode ? 'text-gold-400' : 'text-gold-800'}`}>
              Atelier Pages
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              {[
                { name: 'Home Atelier', href: '/' },
                { name: 'Our Heritage', href: '/about' },
                { name: 'Artistic Services', href: '/services' },
                { name: 'Visual Lookbook', href: '/gallery' },
                { name: 'Décor Collections', href: '/packages' },
                { name: 'Rental Furnishings', href: '/rental' },
                { name: 'Book Consultation', href: '/contact' },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`${isDarkMode ? 'text-champagne-300/85 hover:text-gold-300' : 'text-[#2D251C] hover:text-gold-700 font-medium'} transition-colors flex items-center group`}
                  >
                    <span>{item.name}</span>
                    <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-gold-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Portfolio */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className={`text-sm font-semibold tracking-wider ${isDarkMode ? 'text-gold-400' : 'text-gold-800'}`}>
              Signature Disciplines
            </h3>
            <ul className={`space-y-2 text-xs sm:text-sm ${isDarkMode ? 'text-champagne-300/85' : 'text-[#2D251C] font-medium'}`}>
              <li className="hover:text-gold-400 transition-colors">
                <Link href="/services">Royal Wedding Stage Architecture</Link>
              </li>
              <li className="hover:text-gold-400 transition-colors">
                <Link href="/services">Haute Botanical Floral Canopies</Link>
              </li>
              <li className="hover:text-gold-400 transition-colors">
                <Link href="/services">Celebrity & Prestige Galas</Link>
              </li>
              <li className="hover:text-gold-400 transition-colors">
                <Link href="/services">Mehndi & Baraat Grand Scénographie</Link>
              </li>
              <li className="hover:text-gold-400 transition-colors">
                <Link href="/rental">Hourly & Daily Furnishing Rentals</Link>
              </li>
              <li className="hover:text-gold-400 transition-colors">
                <Link href="/gallery">Custom Lighting & Draped Ceilings</Link>
              </li>
            </ul>
          </div>

          {/* Pakistan Flagship Showrooms & Contact */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className={`text-sm font-semibold tracking-wider ${isDarkMode ? 'text-gold-400' : 'text-gold-800'}`}>
              Pakistan Showrooms 🇵🇰
            </h3>
            <div className={`space-y-3 text-xs sm:text-sm ${isDarkMode ? 'text-champagne-300/85' : 'text-[#3D352A]'}`}>
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <div>
                  <strong className={`font-semibold ${isDarkMode ? 'text-ivory-50' : 'text-[#141210]'} block text-xs`}>Lahore Atelier:</strong>
                  <span>Gulberg III & DHA Phase 5, Lahore</span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <div>
                  <strong className={`font-semibold ${isDarkMode ? 'text-ivory-50' : 'text-[#141210]'} block text-xs`}>Islamabad Studio:</strong>
                  <span>Blue Area & Sector F-6, Islamabad</span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <div>
                  <strong className={`font-semibold ${isDarkMode ? 'text-ivory-50' : 'text-[#141210]'} block text-xs`}>Karachi Lounge:</strong>
                  <span>Clifton Block 4 & DHA, Karachi</span>
                </div>
              </div>

              <div className="pt-1.5 border-t border-gold-500/20 space-y-1.5 text-xs">
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                  <span className={isDarkMode ? 'text-champagne-200' : 'text-[#2D251C] font-medium'}>+92 314 0660985</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                  <span className={isDarkMode ? 'text-champagne-200' : 'text-[#2D251C] font-medium'}>alirajpoot8857@gmail.com</span>
                </div>
                <div className="flex items-center space-x-2 text-gold-400 pt-0.5">
                  <Instagram className="w-3.5 h-3.5 shrink-0" />
                  <span className={isDarkMode ? 'text-gold-400' : 'text-gold-700 font-semibold'}>@lumiere.decor.pk</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`pt-8 flex flex-col sm:flex-row items-center justify-between text-xs ${isDarkMode ? 'text-champagne-400/70' : 'text-[#5A4E3E]'} font-light space-y-4 sm:space-y-0`}>
          <p>© {new Date().getFullYear()} {siteName} Haute Scénographie. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <Link href="/contact" className="hover:text-gold-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:text-gold-400 transition-colors">
              Terms of Commission
            </Link>
            <Link href="/login" className="hover:text-gold-400 transition-colors">
              Client Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
