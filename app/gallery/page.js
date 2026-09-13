'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import api from '../../src/lib/api';
import { useAuth } from '../../src/context/AuthContext';
import { useToast } from '../../src/context/ToastContext';
import LuxurySpinner from '../../src/components/ui/LuxurySpinner';
import CustomDatePicker from '../../src/components/ui/CustomDatePicker';
import LocationPicker from '../../src/components/ui/LocationPicker';
import { isValidPakistaniPhone } from '../../src/lib/validation';
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
  'Luxury weddings',
  'Floral stages',
  'Mehndi setups',
  'Birthday themes',
  'Outdoor décor',
  'Reception tables',
  'Entrance décor',
  'Romantic candle setups',
];

const INITIAL_BATCH = 9;
const BATCH_INCREMENT = 6;

export default function GalleryPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

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
    setCommissionImage(img);
    setOrderForm({
      customerName: user?.name || '',
      customerEmail: user?.email || '',
      customerPhone: (user?.phone && isValidPakistaniPhone(user?.phone)) ? user.phone : '03140660985',
      eventDate: '',
      venue: '',
      guestCount: 150,
      budget: 4500,
      specialRequests: `Requested Gallery Style: ${img.title} (${img.category})`,
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
    } catch (err) {
      const msg = err.data?.message || err.message || 'Failed to submit gallery order';
      showToast(msg, 'error');
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="bg-ivory-100 text-obsidian-900 pt-24 sm:pt-28 pb-16 sm:pb-20 w-full overflow-hidden">
      {/* Header Banner */}
      <section className="py-10 sm:py-14 bg-champagne-50 border-b border-champagne-300/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 sm:space-y-4">
          <div className="inline-flex items-center space-x-2 text-gold-700 text-[11px] sm:text-xs uppercase tracking-[0.3em] font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Curated Portfolio & Bespoke Commissions</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-obsidian-950 font-light">
            The Scénographie Gallery
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-obsidian-600 max-w-2xl mx-auto font-light leading-relaxed">
            Immerse yourself in our collection of {allImages.length}+ luxury floral stages, intimate candle sanctuaries, and grand reception architecture.
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="py-5 sm:py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-obsidian-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search wedding arches, candle rooms, stages..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-champagne-300 bg-white text-xs focus:outline-none focus:border-gold-500 shadow-sm transition-colors"
            />
          </div>

          {/* Active category indicator badge */}
          <div className="text-xs text-obsidian-600 font-serif font-light self-center sm:self-auto">
            Showing <span className="font-semibold text-gold-800">{filteredImages.length}</span> curated pieces
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat] ?? 0;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-gold-600 to-champagne-600 text-obsidian-950 shadow-md font-bold'
                    : 'bg-white text-obsidian-700 border border-champagne-300 hover:bg-champagne-100/80 hover:border-gold-400'
                }`}
              >
                {cat} <span className="ml-1 text-[10px] opacity-75 font-mono">({count})</span>
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
          <div className="text-center py-20 bg-ivory-50 rounded-3xl border border-champagne-300 space-y-3">
            <p className="font-serif text-lg text-obsidian-800">No installations found in this category.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="px-6 py-2 rounded-full bg-obsidian-900 text-ivory-50 text-xs uppercase tracking-wider hover:bg-gold-600 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="max-h-[640px] sm:max-h-[720px] lg:max-h-[780px] overflow-y-auto pr-2 sm:pr-3 rounded-3xl border border-champagne-300/60 bg-ivory-50/50 p-4 sm:p-6 shadow-luxury-card transition-all"
            style={{ scrollBehavior: 'smooth' }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {displayedImages.map((img) => (
                <div
                  key={img.id}
                  onClick={() => setActiveLightboxImage(img)}
                  className="group relative h-72 sm:h-80 rounded-3xl overflow-hidden shadow-luxury border border-champagne-300 bg-champagne-100 hover:border-gold-500 hover:shadow-luxury-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  <Image
                    src={img.imageUrl}
                    alt={img.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/90 via-obsidian-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-ivory-50">
                    <span className="text-[10px] uppercase tracking-widest text-gold-400 font-semibold mb-1">
                      {img.category}
                    </span>
                    <h4 className="font-serif text-base sm:text-lg font-light">{img.title}</h4>
                    {img.description && (
                      <p className="text-xs text-obsidian-300 line-clamp-2 mt-1 font-light">
                        {img.description}
                      </p>
                    )}
                    <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between text-xs uppercase tracking-widest text-gold-300 font-bold">
                      <span>VIEW DETAILS →</span>
                      <span className="text-[10px] text-ivory-200 font-normal">Order & Reserve</span>
                    </div>
                  </div>
                </div>
              ))}
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
              <div className="mt-8 py-6 text-center space-y-1.5 border-t border-champagne-300/60 max-w-md mx-auto">
                <div className="flex items-center justify-center space-x-2 text-gold-600 text-xs">
                  <span>✦</span>
                  <span className="font-serif uppercase tracking-[0.25em] text-[11px] font-medium text-obsidian-800">
                    All {filteredImages.length} Curated Installations Revealed
                  </span>
                  <span>✦</span>
                </div>
                <p className="text-[11px] text-obsidian-500 font-light">
                  Seeking a bespoke spatial transformation? Inquire with our principal atelier.
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Lightbox Modal */}
      {activeLightboxImage && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 bg-obsidian-950/85 backdrop-blur-md">
          <div className="relative bg-ivory-50 rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full border border-gold-500/40">
            <button
              onClick={() => setActiveLightboxImage(null)}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-obsidian-900/70 text-ivory-50 hover:bg-obsidian-900 hover:scale-110 active:scale-95 transition-all"
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

              <div className="lg:col-span-5 p-5 sm:p-8 flex flex-col justify-between space-y-5">
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-gold-700 font-bold">
                      {activeLightboxImage.category}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl text-obsidian-950 font-light mt-1">
                      {activeLightboxImage.title}
                    </h3>
                  </div>

                  <p className="text-xs text-obsidian-600 font-light leading-relaxed">
                    {activeLightboxImage.description || 'Bespoke commissioned décor styled by the Lumière creative team.'}
                  </p>

                  {activeLightboxImage.tags && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[10px] uppercase tracking-widest text-obsidian-400 font-semibold">
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
                            className="px-2.5 py-1 rounded-full bg-champagne-200 text-obsidian-800 text-[10px] font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-champagne-200 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      const img = activeLightboxImage;
                      setActiveLightboxImage(null);
                      handleOpenCommissionModal(img);
                    }}
                    className="w-full py-3 rounded-full bg-gold-600 text-obsidian-950 font-bold text-xs uppercase tracking-widest text-center block hover:brightness-110 hover:scale-[1.02] active:scale-95 transition-all shadow-md flex items-center justify-center space-x-1.5"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>Order & Reserve This Installation</span>
                  </button>

                  <Link
                    href="/contact"
                    className="w-full py-2.5 rounded-full bg-obsidian-900 text-ivory-50 font-semibold text-[11px] uppercase tracking-widest text-center block hover:bg-obsidian-800 transition-colors"
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
        <div className="fixed inset-0 z-[99999] overflow-y-auto flex items-center justify-center p-3 sm:p-6 bg-obsidian-950/85 backdrop-blur-md">
          <div
            className="relative bg-ivory-50 text-obsidian-950 border border-gold-500/60 rounded-3xl overflow-hidden shadow-2xl max-w-xl w-full flex flex-col max-h-[92vh] select-none"
            style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6), 0 0 25px rgba(212,175,55,0.3)' }}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-obsidian-950 text-ivory-50 border-b border-gold-500/30 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-gold-500/20 text-gold-400 rounded-full">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-gold-400 font-semibold">
                    Gallery Commission Request
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-light text-ivory-50 truncate max-w-xs sm:max-w-sm">
                    {commissionImage.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOrderModalOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 text-ivory-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {orderSuccess ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-2xl text-obsidian-950 font-light">
                    Commission Request Received!
                  </h3>
                  <p className="text-xs text-obsidian-600 max-w-sm mx-auto leading-relaxed">
                    Order <strong>#{orderSuccess.bookingNumber}</strong> has been registered. An automated notification has been dispatched to our studio atelier and our lead creative directors.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setOrderModalOpen(false);
                      setOrderSuccess(null);
                    }}
                    className="px-6 py-2.5 bg-obsidian-950 text-ivory-50 rounded-full text-xs uppercase tracking-widest font-semibold hover:bg-gold-600 transition-colors"
                  >
                    Return to Gallery
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCommissionSubmit} className="space-y-4">
                  {/* Selected Style Card */}
                  <div className="p-3 bg-champagne-100/70 border border-champagne-300 rounded-2xl flex items-center space-x-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-champagne-300 flex-shrink-0">
                      <Image src={commissionImage.imageUrl} alt={commissionImage.title} fill className="object-cover" />
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-gold-800 tracking-wider">
                        {commissionImage.category}
                      </span>
                      <h4 className="font-serif text-sm font-semibold text-obsidian-950">
                        {commissionImage.title}
                      </h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={orderForm.customerName}
                        onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
                        placeholder="e.g. Marcus Sterling"
                        className={`w-full text-xs p-2.5 rounded-xl border bg-white focus:outline-none ${
                          orderErrors.customerName ? 'border-red-400' : 'border-champagne-300 focus:border-gold-500'
                        }`}
                      />
                      {orderErrors.customerName && <p className="text-[10px] text-red-600 mt-0.5">{orderErrors.customerName}</p>}
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={orderForm.customerEmail}
                        onChange={(e) => setOrderForm({ ...orderForm, customerEmail: e.target.value })}
                        placeholder="marcus@example.com"
                        className={`w-full text-xs p-2.5 rounded-xl border bg-white focus:outline-none ${
                          orderErrors.customerEmail ? 'border-red-400' : 'border-champagne-300 focus:border-gold-500'
                        }`}
                      />
                      {orderErrors.customerEmail && <p className="text-[10px] text-red-600 mt-0.5">{orderErrors.customerEmail}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                        Phone Number (Pakistan 🇵🇰) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={orderForm.customerPhone}
                        onChange={(e) => setOrderForm({ ...orderForm, customerPhone: e.target.value })}
                        placeholder="03140660985 or +923140660985"
                        className={`w-full text-xs p-2.5 rounded-xl border bg-white focus:outline-none ${
                          orderErrors.customerPhone ? 'border-red-400' : 'border-champagne-300 focus:border-gold-500'
                        }`}
                      />
                      {orderErrors.customerPhone && <p className="text-[10px] text-red-600 mt-0.5">{orderErrors.customerPhone}</p>}
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
                      <label className="block text-xs uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                        Guest Count
                      </label>
                      <input
                        type="number"
                        value={orderForm.guestCount}
                        onChange={(e) => setOrderForm({ ...orderForm, guestCount: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white focus:outline-none focus:border-gold-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                        Estimated Budget (PKR)
                      </label>
                      <input
                        type="number"
                        value={orderForm.budget}
                        onChange={(e) => setOrderForm({ ...orderForm, budget: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                      Custom Styling & Scénographie Notes
                    </label>
                    <textarea
                      rows={2}
                      value={orderForm.specialRequests}
                      onChange={(e) => setOrderForm({ ...orderForm, specialRequests: e.target.value })}
                      placeholder="Color palette, floral preferences, lighting requirements..."
                      className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div className="pt-3 flex justify-end space-x-3 border-t border-champagne-200">
                    <button
                      type="button"
                      onClick={() => setOrderModalOpen(false)}
                      className="px-5 py-2 rounded-full border border-champagne-300 text-xs font-semibold text-obsidian-600 hover:bg-champagne-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingOrder}
                      className="px-6 py-2.5 rounded-full bg-gold-600 hover:bg-gold-700 text-obsidian-950 text-xs font-bold uppercase tracking-wider transition-colors shadow-md flex items-center space-x-1.5"
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
