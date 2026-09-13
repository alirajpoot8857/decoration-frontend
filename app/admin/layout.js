'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import LuxurySpinner from '../../src/components/ui/LuxurySpinner';
import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  Layers,
  Crown,
  Image as ImageIcon,
  ShoppingBag,
  Package,
  DollarSign,
  Truck,
  Users,
  MessageSquare,
  Mail,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const ADMIN_NAV = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Bookings', href: '/admin/bookings', icon: CalendarCheck },
  { name: 'Events', href: '/admin/events', icon: Calendar },
  { name: 'Services', href: '/admin/services', icon: Layers },
  { name: 'Packages', href: '/admin/packages', icon: Crown },
  { name: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
  { name: 'Rentals', href: '/admin/rentals', icon: ShoppingBag },
  { name: 'Inventory', href: '/admin/inventory', icon: Package },
  { name: 'Sales', href: '/admin/sales', icon: DollarSign },
  { name: 'Purchases', href: '/admin/purchases', icon: Truck },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Testimonials', href: '/admin/testimonials', icon: MessageSquare },
  { name: 'Inquiries', href: '/admin/inquiries', icon: Mail },
  { name: 'Activity Logs', href: '/admin/activity-logs', icon: Activity },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout, isStaffOrAdmin } = useAuth();
  const { siteName } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile drawer state
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop icon-only collapse state

  // Restore collapse preference from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_sidebar_collapsed');
      if (saved === 'true') {
        setIsCollapsed(true);
      }
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_sidebar_collapsed', String(next));
      }
      return next;
    });
  };

  useEffect(() => {
    // Dynamically set admin favicon
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    const previousIcon = link.href;
    link.href = '/admin-favicon.svg';
    link.type = 'image/svg+xml';

    return () => {
      link.href = previousIcon || '/favicon.svg';
    };
  }, []);

  useEffect(() => {
    if (!loading && (!user || !isStaffOrAdmin)) {
      router.push('/login');
    }
  }, [user, loading, isStaffOrAdmin, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading || !user || !isStaffOrAdmin) {
    return (
      <div className="min-h-screen bg-ivory-100 flex items-center justify-center">
        <LuxurySpinner size="lg" text="Authorizing Atelier Access..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-obsidian-900 flex flex-col lg:flex-row antialiased">
      {/* Mobile Header Bar */}
      <div className="lg:hidden bg-obsidian-950 text-ivory-50 px-4 py-3 flex items-center justify-between border-b border-gold-500/20 sticky top-0 z-40 shadow-sm">
        <Link href="/admin" className="font-serif text-base sm:text-lg uppercase tracking-widest text-gold-400 truncate max-w-[220px]">
          {siteName} <span className="text-ivory-50 text-[10px] sm:text-xs font-sans">ADMIN</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-ivory-50 rounded-lg hover:bg-white/10 active:scale-95 transition-transform"
          aria-label="Toggle admin sidebar"
        >
          {sidebarOpen ? <X className="w-6 h-6 text-gold-400" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Backdrop Overlay - Smooth Fade In & Out */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 bg-obsidian-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ease-in-out ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sidebar Navigation - Collapsible (w-20 icons-only OR w-64 full) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-obsidian-950 text-ivory-100 flex flex-col justify-between border-r border-gold-500/20 transition-[width,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-x-hidden lg:static lg:h-screen lg:sticky lg:top-0 ${
          sidebarOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        <div className="flex flex-col h-full justify-between overflow-x-hidden">
          <div className="overflow-x-hidden">
            {/* Sidebar Header & Brand with Collapse Toggle */}
            <div className="border-b border-obsidian-800 p-3.5 flex items-center justify-between transition-all duration-300">
              <Link href="/admin" className="flex items-center space-x-2.5 min-w-0 flex-1 group overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500/25 to-champagne-500/10 border border-gold-500/40 flex items-center justify-center text-gold-300 font-serif font-bold text-lg hover:scale-105 transition-transform shrink-0 shadow-sm">
                  {siteName.charAt(0)}
                </div>
                <div
                  className={`flex flex-col transition-all duration-300 overflow-hidden ${
                    isCollapsed ? 'opacity-0 max-w-0 pointer-events-none' : 'opacity-100 max-w-[160px]'
                  }`}
                >
                  <span className="font-serif tracking-[0.12em] text-base font-light uppercase text-ivory-50 group-hover:text-gold-300 transition-colors truncate whitespace-nowrap">
                    {siteName}
                  </span>
                  <span className="text-[8px] uppercase tracking-[0.2em] font-sans text-champagne-400 font-medium truncate whitespace-nowrap">
                    Management
                  </span>
                </div>
              </Link>
              <button
                onClick={toggleCollapse}
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className="hidden lg:flex p-1.5 rounded-lg text-obsidian-400 hover:text-gold-300 hover:bg-obsidian-900 transition-all hover:scale-110 active:scale-95 shrink-0"
                aria-label="Toggle sidebar collapse"
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4 text-gold-400" /> : <ChevronLeft className="w-4 h-4 text-gold-400" />}
              </button>
            </div>

            {/* Nav Menu Items - Fluid Smooth Collapse */}
            <nav className={`py-3 space-y-1 overflow-x-hidden overflow-y-auto max-h-[calc(100vh-190px)] scrollbar-none transition-all duration-300 ${
              isCollapsed ? 'px-2' : 'px-3'
            }`}>
              {ADMIN_NAV.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={item.name}
                    className={`flex items-center rounded-xl text-xs font-medium uppercase tracking-wider transition-all duration-300 overflow-hidden ${
                      isCollapsed
                        ? 'justify-center p-2.5 w-11 h-11 mx-auto'
                        : 'px-3.5 py-2.5'
                    } ${
                      isActive
                        ? 'bg-gradient-to-r from-gold-600 to-champagne-500 text-obsidian-950 font-bold shadow-sm'
                        : 'text-obsidian-400 hover:bg-obsidian-900 hover:text-ivory-50'
                    }`}
                  >
                    <item.icon
                      className={`transition-all duration-300 shrink-0 ${
                        isCollapsed ? 'w-5 h-5' : 'w-4 h-4'
                      } ${
                        isActive ? 'text-obsidian-950' : 'text-gold-500/80 group-hover:text-gold-300'
                      }`}
                    />
                    <span
                      className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${
                        isCollapsed
                          ? 'opacity-0 max-w-0 pointer-events-none'
                          : 'opacity-100 max-w-[180px] ml-3'
                      }`}
                    >
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Info & Quick Switchers */}
          <div className="border-t border-obsidian-800 bg-obsidian-900/70 p-3 transition-all duration-300">
            <div className="flex items-center space-x-3 px-1 overflow-hidden">
              <div
                title={`${user.name} (${user.role})`}
                className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-500/30 text-gold-400 font-bold flex items-center justify-center text-xs shrink-0 cursor-pointer shadow-inner"
              >
                {user.name.charAt(0)}
              </div>
              <div
                className={`flex-1 min-w-0 transition-all duration-300 overflow-hidden ${
                  isCollapsed ? 'opacity-0 max-w-0 pointer-events-none' : 'opacity-100 max-w-[150px]'
                }`}
              >
                <p className="text-xs font-semibold text-ivory-100 truncate whitespace-nowrap">{user.name}</p>
                <span className="text-[9px] text-gold-400 font-mono font-bold uppercase block">{user.role}</span>
              </div>
            </div>

            <div
              className={`flex items-center gap-2 pt-2.5 transition-all duration-300 ${
                isCollapsed ? 'flex-col justify-center' : 'justify-between'
              }`}
            >
              <Link
                href="/"
                target="_blank"
                title="View Live Site"
                className="flex-1 py-1.5 px-2 rounded-lg bg-obsidian-800 hover:bg-obsidian-700 text-gold-400 hover:text-ivory-50 text-[10px] font-semibold tracking-wider uppercase transition-colors flex items-center justify-center space-x-1"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                <span className={`transition-all duration-300 overflow-hidden ${isCollapsed ? 'opacity-0 max-w-0 hidden' : 'opacity-100 whitespace-nowrap'}`}>
                  Live Site
                </span>
              </Link>

              <button
                onClick={logout}
                title="Sign Out"
                className="py-1.5 px-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-red-100 text-[10px] font-semibold tracking-wider uppercase transition-colors flex items-center justify-center space-x-1"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span className={`transition-all duration-300 overflow-hidden ${isCollapsed ? 'opacity-0 max-w-0 hidden' : 'opacity-100 whitespace-nowrap'}`}>
                  Sign Out
                </span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Expands Dynamically when Sidebar Collapses */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto transition-all duration-300">
        <div className="p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8">{children}</div>
      </main>
    </div>
  );
}
