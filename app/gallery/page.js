'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import api from '../../src/lib/api';
import { useAuth } from '../../src/context/AuthContext';
import { useToast } from '../../src/context/ToastContext';
import { useTheme } from '../../src/context/ThemeContext';
import LuxurySpinner from '../../src/components/ui/LuxurySpinner';
import CustomDatePicker from '../../src/components/ui/CustomDatePicker';
import LocationPicker from '../../src/components/ui/LocationPicker';
import { isValidPakistaniPhone } from '../../src/lib/validation';
import useBodyScrollLock from '../../src/hooks/useBodyScrollLock';
import {
  Sparkles,
  X,
  Search,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Crown,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Flower Bouquets',
  'Cakes & Chocolates',
  'Gifts',
  'Floral stages',
  'Mehndi setups',
  'Luxury weddings',
  'Outdoor décor',
  'Entrance décor',
];

export const parseGalleryPrice = (img) => {
  if (!img) return 25000;
  if (img.price && typeof img.price === 'number') return img.price;
  if (img.description) {
    const match = img.description.match(/(?:Price:\s*(?:Rs\.|PKR)\s*|PKR\s*|Rs\.\s*)([\d,]+)/i);
    if (match && match[1]) {
      const parsed = parseInt(match[1].replace(/,/g, ''), 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }
  const cat = (img.category || '').toLowerCase();
  if (cat.includes('wedding') || cat.includes('walima') || cat.includes('barat')) return 300000;
  if (cat.includes('stage')) return 120000;
  if (cat.includes('mehndi') || cat.includes('mayun')) return 65000;
  if (cat.includes('outdoor')) return 45000;
  if (cat.includes('entrance') || cat.includes('arch')) return 35000;
  if (cat.includes('bouquet') || cat.includes('flower')) return 4500;
  if (cat.includes('cake') || cat.includes('chocolate')) return 3200;
  if (cat.includes('gift')) return 6500;
  return 25000;
};

const INITIAL_BATCH = 9;
const BATCH_INCREMENT = 6;

export default function GalleryPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { isDarkMode } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [allImages, setAllImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeLightboxImage, setActiveLightboxImage] = useState(null);

  // Gallery Commission / Order Modal State
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [commissionImage, setCommissionImage] = useState(null);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  useBodyScrollLock(Boolean(activeLightboxImage || (orderModalOpen && commissionImage)));

  const [orderForm, setOrderForm] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: (user?.phone && isValidPakistaniPhone(user?.phone)) ? user.phone : '03140660985',
    eventDate: '',
    venue: '',
    guestCount: 150,
    budget: 4500,
    specialRequests: '',
  });
  const [orderErrors, setOrderErrors] = useState({});

  const sentinelRef = useRef(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      try {
        const res = await api.getGallery();
        if (res.images) setAllImages(res.images);
      } catch (e) {
        console.warn('Failed to load gallery images', e);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get('category');
      const searchParam = params.get('search');
      if (catParam) {
        const matched = CATEGORIES.find((c) => c.toLowerCase() === catParam.toLowerCase()) ||
          CATEGORIES.find((c) => c.toLowerCase().includes(catParam.toLowerCase()) || catParam.toLowerCase().includes(c.toLowerCase()));
        if (matched) setSelectedCategory(matched);
      }
      if (searchParam) {
        setSearchQuery(searchParam);
      }
    }
  }, []);

  // Calculate dynamic category item counts
  const categoryCounts = useMemo(() => {
    const counts = { All: allImages.length };
    CATEGORIES.forEach((cat) => {
      if (cat !== 'All') {
        counts[cat] = allImages.filter((img) => img.category === cat).length;
      }
    });
    return counts;
  }, [allImages]);

  // Filter images
  const filteredImages = useMemo(() => {
    let result = [...allImages];

    if (selectedCategory !== 'All') {
      result = result.filter((img) => img.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (img) =>
          img.title.toLowerCase().includes(q) ||
          (img.description && img.description.toLowerCase().includes(q)) ||
          img.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [allImages, selectedCategory, searchQuery]);

  // Reset visible items when category or search changes & reset scroll position
  useEffect(() => {
    setVisibleCount(INITIAL_BATCH);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedCategory, searchQuery]);

  const loadMoreItems = () => {
    if (loadingMore || visibleCount >= filteredImages.length) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + BATCH_INCREMENT, filteredImages.length));
      setLoadingMore(false);
    }, 280);
  };

  // Infinite scroll intersection observer linked to fixed-height scroll container
  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !loadingMore) {
          if (visibleCount < filteredImages.length) {
            loadMoreItems();
          }
        }
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.1,
        rootMargin: '150px',
      }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [loading, loadingMore, visibleCount, filteredImages.length]);

  // Manual scroll event fallback for the fixed container
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 160 && !loadingMore && visibleCount < filteredImages.length) {
      loadMoreItems();
    }
  };

  const displayedImages = useMemo(() => {
    return filteredImages.slice(0, visibleCount);
  }, [filteredImages, visibleCount]);

  const hasMore = visibleCount < filteredImages.length;

  const handleOpenCommissionModal = (img) => {
    const itemPrice = parseGalleryPrice(img);
    setCommissionImage(img);
    setOrderForm({
      customerName: user?.name || '',
      customerEmail: user?.email || '',
      customerPhone: (user?.phone && isValidPakistaniPhone(user?.phone)) ? user.phone : '03140660985',
      eventDate: '',
      venue: '',
      guestCount: 150,
      budget: itemPrice,
      specialRequests: `Requested Gallery Style: ${img.title} (${img.category}) - Est. PKR ${itemPrice.toLocaleString()}`,
    });
    setOrderErrors({});
    setOrderSuccess(null);
    setOrderModalOpen(true);
  };

  const handleCommissionSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!orderForm.customerName.trim()) errors.customerName = 'Please enter your name.';
    if (!orderForm.customerEmail.trim()) errors.customerEmail = 'Please provide your email address.';
    if (!orderForm.customerPhone.trim()) {
      errors.customerPhone = 'Pakistani contact phone number is required.';
    } else if (!isValidPakistaniPhone(orderForm.customerPhone)) {
      errors.customerPhone = 'Please enter a valid Pakistani phone number (e.g. 03140660985 or +923140660985).';
    }
    if (!orderForm.eventDate) errors.eventDate = 'Please select your event date.';
    if (!orderForm.venue.trim()) errors.venue = 'Please specify the event venue or city.';

    if (Object.keys(errors).length > 0) {
      setOrderErrors(errors);
      showToast('Please complete all required fields.', 'error');
      return;
    }

    setSubmittingOrder(true);
    try {
      const payload = {
        customerName: orderForm.customerName,
        customerEmail: orderForm.customerEmail,
        customerPhone: orderForm.customerPhone,
        eventType: commissionImage?.category || 'Luxury Event',
        packageName: commissionImage?.title || 'Bespoke Gallery Installation',
        eventDate: orderForm.eventDate,
        venue: orderForm.venue,
        guestCount: Number(orderForm.guestCount) || 100,
        budget: Number(orderForm.budget) || 4500,
        specialRequests: orderForm.specialRequests,
      };

      const res = await api.createBooking(payload);
      setOrderSuccess(res.booking);
      showToast(`Gallery order #${res.booking.bookingNumber} placed! Email notification sent to studio.`, 'success');

      // Reset / empty order form values
      setOrderForm({
        customerName: user?.name || '',
        customerEmail: user?.email || '',
        customerPhone: (user?.phone && isValidPakistaniPhone(user?.phone)) ? user.phone : '03140660985',
        eventDate: '',
        venue: '',
        guestCount: 150,
        budget: 4500,
        specialRequests: '',
      });
      setOrderErrors({});
    } catch (err) {
      const msg = err.data?.message || err.message || 'Failed to submit gallery order';
      showToast(msg, 'error');
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="bg-[#070709] text-ivory-50 pt-24 sm:pt-28 pb-16 sm:pb-20 w-full overflow-hidden min-h-screen">
      {/* Header Banner */}
      <section className="py-10 sm:py-14 bg-gradient-to-b from-[#0D0D14] via-[#09090D] to-[#070709] border-b border-gold-500/20 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(229,168,59,0.08),transparent_70%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 sm:space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 text-gold-400 text-[11px] sm:text-xs uppercase tracking-[0.3em] font-semibold bg-gold-500/10 px-4 py-1.5 rounded-full border border-gold-500/30">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span>Curated Portfolio & Bespoke Commissions</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-ivory-50 font-light tracking-tight">
            The Scénographie Gallery
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-ivory-300 max-w-2xl mx-auto font-light leading-relaxed">
            Immerse yourself in our collection of {allImages.length}+ luxury floral stages, intimate candle sanctuaries, and grand reception architecture across Pakistan.
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="py-5 sm:py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gold-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search wedding arches, candle rooms, stages..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gold-500/30 bg-[#121218] text-ivory-50 text-xs placeholder:text-ivory-600 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-500/20 shadow-inner transition-colors"
            />
          </div>

          {/* Active category indicator badge */}
          <div className="text-xs text-ivory-400 font-serif font-light self-center sm:self-auto">
            Showing <span className="font-semibold text-gold-400">{filteredImages.length}</span> curated pieces
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat] ?? 0;
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-gold-500 to-champagne-500 text-obsidian-950 shadow-md font-bold'
                    : 'bg-[#121218] text-ivory-300 border border-gold-500/20 hover:bg-[#181822] hover:border-gold-400/60'
                }`}
              >
                {cat} <span className="ml-1 text-[10px] opacity-80 font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Gallery Section with Fixed Scrollable Container */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="py-24 text-center">
            <LuxurySpinner size="lg" text="Curating Haute Scénographie Archive..." />
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-20 bg-[#0E0E14] rounded-3xl border border-gold-500/20 space-y-3">
            <p className="font-serif text-lg text-ivory-200">No installations found in this category.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-gold-500 to-champagne-500 text-obsidian-950 text-xs uppercase tracking-wider font-bold hover:brightness-110 transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className={`max-h-[640px] sm:max-h-[720px] lg:max-h-[780px] overflow-y-auto pr-2 sm:pr-3 rounded-3xl border p-4 sm:p-6 shadow-2xl transition-all ${
              isDarkMode
                ? 'border-gold-500/20 bg-[#0A0A0F]/80 text-ivory-50'
                : 'border-gold-500/35 bg-[#FAF7F2] text-[#141210] shadow-[0_12px_40px_rgba(212,175,55,0.12)]'
            }`}
            style={{ scrollBehavior: 'smooth' }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {displayedImages.map((img) => {
                const itemPrice = parseGalleryPrice(img);
                return (
                  <div
                    key={img.id}
                    onClick={() => setActiveLightboxImage(img)}
                    className="festivity-card-dark group relative h-72 sm:h-80 rounded-3xl overflow-hidden border border-gold-500/30 bg-[#121218] hover:border-gold-400 hover:shadow-glow-gold hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  >
                    <Image
                      src={img.imageUrl}
                      alt={img.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* Top-Left Category Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="bg-obsidian-950/85 backdrop-blur-md text-gold-400 text-[10px] uppercase tracking-widest font-semibold px-3 py-1 rounded-full border border-gold-500/30 shadow-sm">
                        {img.category}
                      </span>
                    </div>

                    {/* Top-Right Price Tag Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="bg-obsidian-950/90 backdrop-blur-md text-gold-300 text-[11px] font-bold px-3 py-1 rounded-full border border-gold-500/40 shadow-md flex items-center space-x-1">
                        <span>PKR {itemPrice.toLocaleString()}</span>
                      </span>
                    </div>

                    {/* Hover Card Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/95 via-obsidian-950/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-ivory-50 z-20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase tracking-widest text-gold-400 font-semibold">
                          {img.category}
                        </span>
                        <span className="text-[11px] font-bold font-serif text-gold-300 bg-gold-500/20 px-2.5 py-0.5 rounded-full border border-gold-500/30">
                          PKR {itemPrice.toLocaleString()}
                        </span>
                      </div>
                      <h4 className="font-serif text-base sm:text-lg font-light text-ivory-50">{img.title}</h4>
                      {img.description && (
                        <p className="text-xs text-ivory-300 line-clamp-2 mt-1 font-light">
                          {img.description}
                        </p>
                      )}
                      <div className="mt-3 pt-2.5 border-t border-gold-500/30 flex items-center justify-between text-xs uppercase tracking-widest text-gold-400 font-bold">
                        <span>VIEW DETAILS →</span>
                        <span className="text-[10px] text-ivory-300 font-normal">Order & Reserve</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Infinite Scroll Sentinel */}
            <div ref={sentinelRef} className="h-6 w-full mt-4 pointer-events-none" />

            {/* Dynamic Infinite Scroll Loading State */}
            {loadingMore && (
              <div className="py-6">
                <LuxurySpinner size="sm" text="Revealing more installations..." />
              </div>
            )}

            {/* End of Collection Refined Luxury Message */}
            {!hasMore && filteredImages.length > 0 && (
              <div className="mt-8 py-6 text-center space-y-1.5 border-t border-gold-500/20 max-w-md mx-auto">
                <div className="flex items-center justify-center space-x-2 text-gold-400 text-xs">
                  <span>✦</span>
                  <span className="font-serif uppercase tracking-[0.25em] text-[11px] font-medium text-ivory-200">
                    All {filteredImages.length} Curated Installations Revealed
                  </span>
                  <span>✦</span>
                </div>
                <p className="text-[11px] text-ivory-400 font-light">
                  Seeking a bespoke spatial transformation? Inquire with our principal atelier.
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Lightbox Modal */}
      {activeLightboxImage && (
        <div className="fixed inset-0 z-[99999] overflow-hidden flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className={`relative ${
            isDarkMode ? 'bg-[#0D0D12] text-ivory-50 border-gold-500/40' : 'bg-[#FFFDF8] text-stone-900 border-gold-500/30'
          } rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full max-h-[92dvh] sm:max-h-[90dvh] flex flex-col overflow-y-auto border`}>
            <button
              onClick={() => setActiveLightboxImage(null)}
              className={`absolute top-4 right-4 z-20 p-2.5 rounded-full transition-all border shadow-md ${
                isDarkMode
                  ? 'bg-obsidian-900/80 text-ivory-50 hover:bg-gold-500 hover:text-obsidian-950 border-gold-500/30'
                  : 'bg-stone-200/90 text-stone-900 hover:bg-gold-500 hover:text-stone-950 border-stone-300'
              }`}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-7 relative h-72 sm:h-80 lg:h-[480px] bg-obsidian-950">
                <Image
                  src={activeLightboxImage.imageUrl}
                  alt={activeLightboxImage.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </div>

              <div className={`lg:col-span-5 p-5 sm:p-8 flex flex-col justify-between space-y-5 ${
                isDarkMode ? 'bg-[#0F0F16]' : 'bg-[#FAF7F0]'
              }`}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <span className={`text-[10px] uppercase tracking-[0.25em] font-bold ${
                      isDarkMode ? 'text-gold-400' : 'text-gold-700'
                    }`}>
                      {activeLightboxImage.category}
                    </span>
                    <h3 className={`font-serif text-xl sm:text-2xl font-light mt-1 ${
                      isDarkMode ? 'text-ivory-50' : 'text-stone-900'
                    }`}>
                      {activeLightboxImage.title}
                    </h3>
                  </div>

                  {/* Estimated Price Rate Box */}
                  <div className={`p-3.5 rounded-2xl border flex items-center justify-between shadow-sm ${
                    isDarkMode ? 'bg-gold-500/10 border-gold-500/30 text-ivory-50' : 'bg-gold-500/10 border-gold-500/40 text-stone-900'
                  }`}>
                    <div>
                      <span className={`text-[10px] uppercase tracking-wider font-bold block ${
                        isDarkMode ? 'text-gold-400' : 'text-gold-800'
                      }`}>
                        Estimated Investment
                      </span>
                      <p className="font-serif text-xl sm:text-2xl font-bold text-gold-gradient">
                        PKR {parseGalleryPrice(activeLightboxImage).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 bg-gold-500/20 text-gold-300 border border-gold-500/40 rounded-full font-semibold">
                      🇵🇰 Pakistan Market Rate
                    </span>
                  </div>

                  <p className={`text-xs font-light leading-relaxed ${
                    isDarkMode ? 'text-ivory-300' : 'text-stone-700'
                  }`}>
                    {activeLightboxImage.description || 'Bespoke commissioned décor styled by the Lumière creative team.'}
                  </p>

                  {activeLightboxImage.tags && (
                    <div className="space-y-1.5 pt-1">
                      <p className={`text-[10px] uppercase tracking-widest font-semibold ${
                        isDarkMode ? 'text-gold-400' : 'text-gold-700'
                      }`}>
                        Aesthetic Tags
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(Array.isArray(activeLightboxImage.tags)
                          ? activeLightboxImage.tags
                          : typeof activeLightboxImage.tags === 'string'
                          ? JSON.parse(activeLightboxImage.tags || '[]')
                          : []
                        ).map((tag, i) => (
                          <span
                            key={i}
                            className={`px-2.5 py-1 rounded-full border text-[10px] font-medium ${
                              isDarkMode
                                ? 'bg-[#181824] border-gold-500/30 text-ivory-200'
                                : 'bg-white border-gold-500/30 text-stone-800 shadow-sm'
                            }`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className={`pt-3 border-t space-y-2 ${isDarkMode ? 'border-gold-500/20' : 'border-gold-500/25'}`}>
                  <button
                    type="button"
                    onClick={() => {
                      const img = activeLightboxImage;
                      setActiveLightboxImage(null);
                      handleOpenCommissionModal(img);
                    }}
                    className="w-full py-3 rounded-full bg-gradient-to-r from-gold-500 to-champagne-500 text-obsidian-950 font-bold text-xs uppercase tracking-widest text-center hover:brightness-110 hover:scale-[1.02] active:scale-95 transition-all shadow-md flex items-center justify-center space-x-1.5"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>Order & Reserve This Installation</span>
                  </button>

                  <Link
                    href="/contact"
                    className={`w-full py-2.5 rounded-full border font-semibold text-[11px] uppercase tracking-widest text-center block transition-colors ${
                      isDarkMode
                        ? 'bg-[#1A1A24] border-gold-500/30 text-ivory-200 hover:bg-gold-500 hover:text-obsidian-950'
                        : 'bg-white border-stone-300 text-stone-800 hover:bg-gold-500 hover:text-stone-900 shadow-sm'
                    }`}
                  >
                    Contact Atelier Directly
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GALLERY INSTALLATION ORDER & COMMISSION MODAL */}
      {orderModalOpen && commissionImage && (
        <div className="fixed inset-0 z-[99999] overflow-hidden flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div
            className={`relative ${
              isDarkMode ? 'bg-[#0D0D12] text-ivory-50' : 'bg-[#FFFDF8] text-stone-900'
            } border border-gold-500/50 rounded-3xl overflow-hidden shadow-2xl max-w-xl w-full flex flex-col max-h-[92dvh] sm:max-h-[90dvh] select-none`}
            style={{ boxShadow: isDarkMode ? '0 25px 50px -12px rgba(0,0,0,0.9), 0 0 30px rgba(212,175,55,0.25)' : '0 25px 50px -12px rgba(0,0,0,0.2), 0 0 30px rgba(212,175,55,0.15)' }}
          >
            {/* Modal Header */}
            <div className={`p-4 sm:p-6 ${
              isDarkMode ? 'bg-[#08080C] text-ivory-50' : 'bg-[#F4EFE6] text-stone-900'
            } border-b border-gold-500/30 flex items-center justify-between flex-shrink-0`}>
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-gold-500/20 text-gold-500 rounded-full border border-gold-500/30">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <span className={`text-[10px] uppercase tracking-[0.25em] font-semibold ${
                    isDarkMode ? 'text-gold-400' : 'text-gold-800'
                  }`}>
                    Gallery Commission Request
                  </span>
                  <h3 className={`font-serif text-lg sm:text-xl font-light truncate max-w-xs sm:max-w-sm ${
                    isDarkMode ? 'text-ivory-50' : 'text-stone-900'
                  }`}>
                    {commissionImage.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOrderModalOpen(false)}
                className={`p-2 rounded-full transition-colors ${
                  isDarkMode ? 'hover:bg-white/10 text-ivory-300' : 'hover:bg-stone-200 text-stone-700'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1 overscroll-contain">
              {orderSuccess ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className={`font-serif text-2xl font-light ${isDarkMode ? 'text-ivory-50' : 'text-stone-900'}`}>
                    Commission Request Received!
                  </h3>
                  <p className={`text-xs max-w-sm mx-auto leading-relaxed ${isDarkMode ? 'text-ivory-300' : 'text-stone-700'}`}>
                    Order <strong>#{orderSuccess.bookingNumber}</strong> has been registered. An automated notification has been dispatched to our studio atelier and our lead creative directors.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setOrderModalOpen(false);
                      setOrderSuccess(null);
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-gold-500 to-champagne-500 text-obsidian-950 rounded-full text-xs uppercase tracking-widest font-bold hover:brightness-110 transition-colors"
                  >
                    Return to Gallery
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCommissionSubmit} className="space-y-4">
                  {/* Selected Style Card */}
                  <div className={`p-3 ${
                    isDarkMode ? 'bg-[#13131B]' : 'bg-[#F4EFE6]'
                  } border border-gold-500/30 rounded-2xl flex items-center space-x-3`}>
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-gold-500/30 flex-shrink-0">
                      <Image src={commissionImage.imageUrl} alt={commissionImage.title} fill className="object-cover" />
                    </div>
                    <div>
                      <span className={`text-[9px] uppercase font-bold tracking-wider ${
                        isDarkMode ? 'text-gold-400' : 'text-gold-800'
                      }`}>
                        {commissionImage.category}
                      </span>
                      <h4 className={`font-serif text-sm font-semibold ${
                        isDarkMode ? 'text-ivory-50' : 'text-stone-900'
                      }`}>
                        {commissionImage.title}
                      </h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs uppercase tracking-wider font-semibold mb-1 ${
                        isDarkMode ? 'text-gold-400' : 'text-gold-800'
                      }`}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={orderForm.customerName}
                        onChange={(e) => {
                          setOrderForm({ ...orderForm, customerName: e.target.value });
                          if (orderErrors.customerName) setOrderErrors({ ...orderErrors, customerName: null });
                        }}
                        placeholder="e.g. Marcus Sterling"
                        className={`w-full text-xs p-2.5 rounded-xl border transition-colors focus:outline-none ${
                          orderErrors.customerName
                            ? 'border-red-500 ring-2 ring-red-500/20 bg-red-500/5'
                            : isDarkMode
                            ? 'bg-[#14141C] text-ivory-50 border-gold-500/30 placeholder:text-ivory-600 focus:border-gold-400'
                            : 'bg-white text-stone-900 border-stone-300 placeholder:text-stone-400 focus:border-gold-500'
                        }`}
                      />
                      {orderErrors.customerName && (
                        <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                          {orderErrors.customerName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-xs uppercase tracking-wider font-semibold mb-1 ${
                        isDarkMode ? 'text-gold-400' : 'text-gold-800'
                      }`}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={orderForm.customerEmail}
                        onChange={(e) => {
                          setOrderForm({ ...orderForm, customerEmail: e.target.value });
                          if (orderErrors.customerEmail) setOrderErrors({ ...orderErrors, customerEmail: null });
                        }}
                        placeholder="marcus@example.com"
                        className={`w-full text-xs p-2.5 rounded-xl border transition-colors focus:outline-none ${
                          orderErrors.customerEmail
                            ? 'border-red-500 ring-2 ring-red-500/20 bg-red-500/5'
                            : isDarkMode
                            ? 'bg-[#14141C] text-ivory-50 border-gold-500/30 placeholder:text-ivory-600 focus:border-gold-400'
                            : 'bg-white text-stone-900 border-stone-300 placeholder:text-stone-400 focus:border-gold-500'
                        }`}
                      />
                      {orderErrors.customerEmail && (
                        <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                          {orderErrors.customerEmail}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs uppercase tracking-wider font-semibold mb-1 ${
                        isDarkMode ? 'text-gold-400' : 'text-gold-800'
                      }`}>
                        Phone Number (Pakistan 🇵🇰) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={orderForm.customerPhone}
                        onChange={(e) => {
                          setOrderForm({ ...orderForm, customerPhone: e.target.value });
                          if (orderErrors.customerPhone) setOrderErrors({ ...orderErrors, customerPhone: null });
                        }}
                        placeholder="03140660985 or +923140660985"
                        className={`w-full text-xs p-2.5 rounded-xl border transition-colors focus:outline-none ${
                          orderErrors.customerPhone
                            ? 'border-red-500 ring-2 ring-red-500/20 bg-red-500/5'
                            : isDarkMode
                            ? 'bg-[#14141C] text-ivory-50 border-gold-500/30 placeholder:text-ivory-600 focus:border-gold-400'
                            : 'bg-white text-stone-900 border-stone-300 placeholder:text-stone-400 focus:border-gold-500'
                        }`}
                      />
                      {orderErrors.customerPhone && (
                        <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                          {orderErrors.customerPhone}
                        </p>
                      )}
                    </div>

                    <div>
                      <CustomDatePicker
                        label="Event Date *"
                        value={orderForm.eventDate}
                        onChange={(date) => {
                          setOrderForm({ ...orderForm, eventDate: date });
                          if (orderErrors.eventDate) setOrderErrors({ ...orderErrors, eventDate: null });
                        }}
                        minDate={new Date().toISOString().split('T')[0]}
                        error={orderErrors.eventDate}
                        align="right"
                      />
                    </div>
                  </div>

                  <div>
                    <LocationPicker
                      label="Event Venue / City Location *"
                      value={orderForm.venue}
                      onChange={(loc) => {
                        setOrderForm({ ...orderForm, venue: loc });
                        if (orderErrors.venue) setOrderErrors({ ...orderErrors, venue: null });
                      }}
                      placeholder="Enter venue address or pick GPS/Map..."
                      error={orderErrors.venue}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs uppercase tracking-wider font-semibold mb-1 ${
                        isDarkMode ? 'text-gold-400' : 'text-gold-800'
                      }`}>
                        Guest Count
                      </label>
                      <input
                        type="number"
                        value={orderForm.guestCount}
                        onChange={(e) => setOrderForm({ ...orderForm, guestCount: e.target.value })}
                        className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none ${
                          isDarkMode
                            ? 'bg-[#14141C] text-ivory-50 border-gold-500/30 focus:border-gold-400'
                            : 'bg-white text-stone-900 border-stone-300 focus:border-gold-500'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs uppercase tracking-wider font-semibold mb-1 ${
                        isDarkMode ? 'text-gold-400' : 'text-gold-800'
                      }`}>
                        Estimated Budget (PKR)
                      </label>
                      <input
                        type="number"
                        value={orderForm.budget}
                        onChange={(e) => setOrderForm({ ...orderForm, budget: e.target.value })}
                        className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none ${
                          isDarkMode
                            ? 'bg-[#14141C] text-ivory-50 border-gold-500/30 focus:border-gold-400'
                            : 'bg-white text-stone-900 border-stone-300 focus:border-gold-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs uppercase tracking-wider font-semibold mb-1 ${
                      isDarkMode ? 'text-gold-400' : 'text-gold-800'
                    }`}>
                      Custom Styling & Scénographie Notes
                    </label>
                    <textarea
                      rows={2}
                      value={orderForm.specialRequests}
                      onChange={(e) => setOrderForm({ ...orderForm, specialRequests: e.target.value })}
                      placeholder="Color palette, floral preferences, lighting requirements..."
                      className={`w-full text-xs p-2.5 rounded-xl border focus:outline-none ${
                        isDarkMode
                          ? 'bg-[#14141C] text-ivory-50 border-gold-500/30 placeholder:text-ivory-600 focus:border-gold-400'
                          : 'bg-white text-stone-900 border-stone-300 placeholder:text-stone-400 focus:border-gold-500'
                      }`}
                    />
                  </div>

                  <div className={`pt-3 flex justify-end space-x-3 border-t ${
                    isDarkMode ? 'border-gold-500/20' : 'border-gold-500/25'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setOrderModalOpen(false)}
                      className={`px-5 py-2 rounded-full border text-xs font-semibold transition-colors ${
                        isDarkMode
                          ? 'border-gold-500/30 text-ivory-300 hover:bg-white/5'
                          : 'border-stone-300 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingOrder}
                      className="px-6 py-2.5 rounded-full bg-gradient-to-r from-gold-500 to-champagne-500 hover:brightness-110 text-obsidian-950 text-xs font-bold uppercase tracking-wider transition-colors shadow-md flex items-center space-x-1.5"
                    >
                      <Crown className="w-3.5 h-3.5" />
                      <span>{submittingOrder ? 'Submitting Commission...' : 'Confirm Gallery Order'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
