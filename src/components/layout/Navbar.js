'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useRentalCart } from '../../context/RentalCartContext';
import { useTheme } from '../../context/ThemeContext';
import { useDiscount } from '../../context/DiscountContext';
import { ShoppingBag, Menu, X, User as UserIcon, LogOut, LayoutDashboard, Calendar, Sparkles } from 'lucide-react';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Services', href: '/services' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Packages', href: '/packages' },
  { name: 'Rental', href: '/rental' },
  { name: 'Contact', href: '/contact' },
];

export default function Navbar({ onOpenConsultation }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const pathname = usePathname();
  const { user, logout, isStaffOrAdmin } = useAuth();
  const { totalItemsCount, setIsCartOpen } = useRentalCart();
  const { siteName, tagline } = useTheme();
  const { isDiscountActive, effectiveDiscount, isBannerDismissed } = useDiscount();
  const hasActiveBanner = isDiscountActive && effectiveDiscount > 0 && !isBannerDismissed;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  const isAdminRoute = pathname?.startsWith('/admin');
  if (isAdminRoute) return null;

  return (
    <header className={`fixed left-0 right-0 z-50 px-2 sm:px-6 lg:px-8 pointer-events-none transition-all duration-300 ${
      hasActiveBanner ? 'top-10 sm:top-12' : 'top-2 sm:top-4'
    }`}>
      <div className="max-w-[1400px] mx-auto pointer-events-auto">
        {/* Floating Luxury Island Pill - Smoked Translucent Frosted Glass with Gold Border */}
        <div
          style={{
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            backgroundColor: 'rgba(20, 17, 13, 0.68)',
            boxShadow: '0 12px 36px -8px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.12)',
          }}
          className={`rounded-full border border-gold-500/35 flex items-center justify-between gap-1 sm:gap-2.5 lg:gap-3.5 pl-3 sm:pl-4.5 lg:pl-5 pr-1.5 sm:pr-2.5 lg:pr-3 py-1.5 sm:py-2 transition-all duration-300 ${
            scrolled ? 'ring-1 ring-gold-400/30 shadow-[0_16px_45px_-10px_rgba(0,0,0,0.7),0_0_20px_rgba(212,175,55,0.25)] border-gold-400/45' : 'hover:border-gold-500/50'
          }`}
        >
          {/* Brand Logo - Responsive & Non-Wrapping */}
          <Link
            href="/"
            className="group flex flex-col items-start focus:outline-none transition-transform duration-300 hover:scale-[1.01] shrink-0 min-w-0 mr-1 sm:mr-2"
          >
            <span
              className="font-serif text-sm sm:text-base lg:text-lg xl:text-xl font-light uppercase tracking-[0.14em] sm:tracking-[0.16em] xl:tracking-[0.18em] text-ivory-50 group-hover:text-gold-300 transition-colors whitespace-nowrap"
            >
              {siteName}
            </span>
            <span
              className="hidden md:block text-[6.5px] lg:text-[7px] uppercase tracking-[0.18em] font-sans -mt-0.5 font-medium text-champagne-300 truncate max-w-[160px] lg:max-w-none"
            >
              {tagline}
            </span>
          </Link>

          {/* Desktop Navigation Links - Haute Inner Pill Array */}
          <nav className="hidden lg:flex items-center space-x-0.5 xl:space-x-1 bg-white/[0.06] p-1 rounded-full border border-white/10 shrink min-w-0">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-2.5 xl:px-3 py-1 rounded-full text-[10.5px] xl:text-[11.5px] uppercase tracking-[0.08em] xl:tracking-[0.12em] font-medium transition-all shrink-0 whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-gold-600 to-champagne-500 text-obsidian-950 font-bold shadow-sm'
                      : 'text-ivory-200 hover:text-gold-300 hover:bg-white/10'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Buttons - Fits Perfectly Inside the Pill Curve Without Overflow */}
          <div className="flex items-center shrink-0 space-x-1 sm:space-x-2">
            {/* Rental Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-1.5 sm:p-2 rounded-full text-ivory-100 hover:bg-white/15 hover:text-gold-300 transition-all duration-300 hover:scale-105 active:scale-95"
              title="View Rental Cart"
              aria-label="Rental Cart"
            >
              <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              {totalItemsCount > 0 && (
                <span className="absolute top-0 right-0 bg-gradient-to-r from-gold-500 to-champagne-400 text-obsidian-950 font-bold text-[9px] sm:text-[10px] w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full flex items-center justify-center shadow-md">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* Auth Menu / User Profile */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-1 sm:space-x-1.5 text-xs uppercase tracking-wider p-1.5 sm:py-1.5 sm:px-3 rounded-full border border-gold-500/35 bg-gold-500/15 text-ivory-50 hover:bg-gold-500/25 hover:border-gold-400 transition-all duration-300 hover:scale-105 active:scale-95"
                  title={user.name}
                >
                  <UserIcon className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-gold-400 shrink-0" />
                  <span className="hidden sm:inline max-w-[70px] xl:max-w-[90px] truncate font-medium text-ivory-50">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div
                    style={{
                      backgroundColor: 'rgba(18, 15, 12, 0.96)',
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                    }}
                    className="absolute right-0 mt-3 w-56 bg-[#120f0c] border border-gold-500/35 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.85)] py-2 z-50 text-ivory-100"
                  >
                    <div className="px-4 py-2.5 border-b border-white/10">
                      <p className="text-xs font-semibold text-ivory-50 truncate">{user.name}</p>
                      <p className="text-[10px] text-obsidian-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-gold-500/20 text-gold-300 text-[9px] font-bold rounded-full uppercase tracking-wider">
                        {user.role}
                      </span>
                    </div>

                    {isStaffOrAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2.5 text-xs text-ivory-200 hover:bg-white/10 hover:text-gold-300 font-medium transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 mr-2.5 text-gold-400" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      href="/portal"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2.5 text-xs text-ivory-200 hover:bg-white/10 hover:text-gold-300 font-medium transition-colors"
                    >
                      <Calendar className="w-4 h-4 mr-2.5 text-gold-400" />
                      My Bookings & Rentals
                    </Link>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 font-medium text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-white/20 bg-white/5 text-ivory-100 hover:bg-white/15 hover:text-gold-300 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Sign In
              </Link>
            )}

            {/* Book Consultation CTA - Perfectly Fitted Inside Pill Curvature Without Overflow */}
            <button
              onClick={onOpenConsultation}
              className="hidden xl:inline-flex items-center justify-center text-[11px] xl:text-xs uppercase tracking-[0.1em] font-bold px-3.5 xl:px-4 py-1.5 xl:py-2 rounded-full bg-gradient-to-r from-gold-600 via-gold-500 to-champagne-500 text-obsidian-950 shadow-md hover:shadow-glow-gold hover:scale-105 active:scale-95 transition-all duration-300 shrink-0 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-obsidian-950 shrink-0" />
              <span>Book Consultation</span>
            </button>
            <button
              onClick={onOpenConsultation}
              className="hidden lg:inline-flex xl:hidden items-center justify-center text-[10.5px] uppercase tracking-wider font-bold px-2.5 py-1.5 rounded-full bg-gradient-to-r from-gold-600 to-champagne-500 text-obsidian-950 shadow-md hover:scale-105 active:scale-95 transition-all duration-300 shrink-0 whitespace-nowrap"
              title="Book Event Consultation"
            >
              <Sparkles className="w-3 h-3 mr-1 text-obsidian-950 shrink-0" />
              <span>Book</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-full text-ivory-100 hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95 shrink-0"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6 text-gold-400" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu - Smooth Animated High-Contrast Luxury Glass Card */}
        <div
          className={`lg:hidden w-full max-w-lg mx-auto overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            mobileMenuOpen
              ? 'max-h-[640px] opacity-100 mt-2.5 sm:mt-3 scale-100 translate-y-0'
              : 'max-h-0 opacity-0 mt-0 scale-95 -translate-y-3 pointer-events-none'
          }`}
        >
          <div
            style={{
              backgroundColor: 'rgba(18, 15, 12, 0.96)',
              backdropFilter: 'blur(30px) saturate(180%)',
              WebkitBackdropFilter: 'blur(30px) saturate(180%)',
              boxShadow: '0 25px 60px -10px rgba(0,0,0,0.88), 0 0 0 1px rgba(212,175,55,0.3)',
            }}
            className="border border-gold-500/40 rounded-3xl p-5 sm:p-7 space-y-4 text-ivory-50 transition-all duration-300"
          >
            <div className="space-y-1.5">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block text-base sm:text-lg font-serif tracking-widest py-2.5 px-4 rounded-2xl transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-gold-600/35 via-gold-500/20 to-transparent text-gold-300 font-bold border border-gold-500/50 shadow-sm'
                        : 'text-ivory-100 hover:text-gold-300 hover:bg-white/10'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <div className="pt-3.5 space-y-2.5 border-t border-white/15">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenConsultation) onOpenConsultation();
                }}
                className="w-full py-3 rounded-full bg-gradient-to-r from-gold-600 to-champagne-500 text-obsidian-950 font-bold text-xs uppercase tracking-widest shadow-md text-center hover:brightness-110 active:scale-95 transition-all"
              >
                Book Event Consultation
              </button>

              {!user ? (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2.5 rounded-full border border-white/20 text-ivory-100 font-semibold text-xs uppercase tracking-widest text-center hover:bg-white/10 transition-colors"
                >
                  Sign In / Register
                </Link>
              ) : (
                <div className="space-y-2 pt-1">
                  {isStaffOrAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full py-2.5 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-300 font-semibold text-xs uppercase tracking-widest text-center hover:bg-gold-500/30 transition-colors"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    href="/portal"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2.5 rounded-full border border-white/20 text-ivory-100 font-semibold text-xs uppercase tracking-widest text-center hover:bg-white/10 transition-colors"
                  >
                    My Bookings & Rentals
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="block w-full py-2 text-red-400 font-semibold text-xs uppercase tracking-widest text-center hover:text-red-300 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
