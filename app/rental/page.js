'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import api from '../../src/lib/api';
import { useRentalCart } from '../../src/context/RentalCartContext';
import { useDiscount } from '../../src/context/DiscountContext';
import { useTheme } from '../../src/context/ThemeContext';
import CustomSelect from '../../src/components/ui/CustomSelect';
import LuxurySpinner from '../../src/components/ui/LuxurySpinner';
import useBodyScrollLock from '../../src/hooks/useBodyScrollLock';
import {
  ShoppingBag,
  Search,
  Sparkles,
  ShieldCheck,
  Clock,
  Calendar,
  Tag,
  Boxes,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  ArrowRight,
  X,
  Plus,
} from 'lucide-react';

const RENTAL_CATEGORIES = [
  'All',
  'Flower Bouquets',
  'Cakes & Chocolates',
  'Gifts',
  'Stage décor',
  'Backdrops',
  'Arches',
  'Lighting',
  'Decorative props',
];

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured Collection' },
  { value: 'stock_desc', label: 'Availability: High to Low' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A to Z' },
];

const INITIAL_BATCH = 9;
const BATCH_INCREMENT = 6;

export default function RentalPage() {
  const [allItems, setAllItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [stockAvailabilityFilter, setStockAvailabilityFilter] = useState('ALL'); // 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedItemDetail, setSelectedItemDetail] = useState(null);

  // Global display pricing toggle: 'DAILY' vs 'HOURLY'
  const [pricingViewMode, setPricingViewMode] = useState('DAILY');
  const [modalDurationMode, setModalDurationMode] = useState('DAILY');
  const [modalHours, setModalHours] = useState(4);
  const [modalQuantity, setModalQuantity] = useState(1);

  const { isDarkMode } = useTheme();
  const { addToCart, setIsCartOpen } = useRentalCart();
  const { effectiveDiscount, calculateDiscount } = useDiscount();
  useBodyScrollLock(Boolean(selectedItemDetail));

  const sentinelRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const fetchRentalItems = async () => {
    setLoading(true);
    try {
      const res = await api.getRentalItems();
      if (res.items) setAllItems(res.items);
      if (res.summary) setSummary(res.summary);
    } catch (err) {
      console.warn('Failed to load rental items', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentalItems();

    const handleInventoryUpdated = () => {
      fetchRentalItems();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('inventory_updated', handleInventoryUpdated);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('inventory_updated', handleInventoryUpdated);
      }
    };
  }, []);

  // Calculate dynamic summary stats across all items
  const dynamicStats = useMemo(() => {
    const totalItems = allItems.length;
    const totalStock = allItems.reduce((s, i) => s + (i.totalQuantity || 0), 0);
    const availableStock = allItems.reduce((s, i) => s + (i.availableQuantity || 0), 0);
    const rentedStock = allItems.reduce((s, i) => s + (i.rentedQuantity || 0), 0);
    const outOfStockCount = allItems.filter((i) => (i.availableQuantity || 0) <= 0).length;
    const lowStockCount = allItems.filter((i) => (i.availableQuantity || 0) > 0 && i.availableQuantity <= 2).length;
    const availableCount = allItems.filter((i) => (i.availableQuantity || 0) > 0).length;

    return {
      totalItems,
      totalStock,
      availableStock,
      rentedStock,
      outOfStockCount,
      lowStockCount,
      availableCount,
    };
  }, [allItems]);

  // Calculate category item counts
  const categoryCounts = useMemo(() => {
    const counts = { All: allItems.length };
    RENTAL_CATEGORIES.forEach((cat) => {
      if (cat !== 'All') {
        counts[cat] = allItems.filter((i) => i.category === cat).length;
      }
    });
    return counts;
  }, [allItems]);

  // Filter and Sort Items
  const filteredAndSortedItems = useMemo(() => {
    let result = [...allItems];

    if (selectedCategory !== 'All') {
      result = result.filter((item) => item.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.material && item.material.toLowerCase().includes(q))
      );
    }

    if (stockAvailabilityFilter === 'IN_STOCK') {
      result = result.filter((item) => item.availableQuantity > 0 && item.status !== 'OUT_OF_STOCK');
    } else if (stockAvailabilityFilter === 'LOW_STOCK') {
      result = result.filter((item) => item.availableQuantity > 0 && item.availableQuantity <= 2);
    } else if (stockAvailabilityFilter === 'OUT_OF_STOCK') {
      result = result.filter((item) => item.availableQuantity <= 0 || item.status === 'OUT_OF_STOCK');
    }

    if (sortBy === 'stock_desc') {
      result.sort((a, b) => (b.availableQuantity || 0) - (a.availableQuantity || 0));
    } else if (sortBy === 'price_asc') {
      result.sort((a, b) => (a.rentalPrice || 0) - (b.rentalPrice || 0));
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => (b.rentalPrice || 0) - (a.rentalPrice || 0));
    } else if (sortBy === 'name_asc') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    // Crucial: Push Out-of-Stock items to the end so they never appear at the start
    if (stockAvailabilityFilter !== 'OUT_OF_STOCK') {
      result.sort((a, b) => {
        const aOut = (a.availableQuantity || 0) <= 0 || a.status === 'OUT_OF_STOCK';
        const bOut = (b.availableQuantity || 0) <= 0 || b.status === 'OUT_OF_STOCK';
        if (aOut && !bOut) return 1; // a is out of stock -> move after b
        if (!aOut && bOut) return -1; // b is out of stock -> move a before b
        return 0; // maintain relative order
      });
    }

    return result;
  }, [allItems, selectedCategory, searchQuery, stockAvailabilityFilter, sortBy]);

  // Reset visible items count & scroll to top when filters change
  useEffect(() => {
    setVisibleCount(INITIAL_BATCH);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedCategory, searchQuery, stockAvailabilityFilter, sortBy]);

  const loadMoreItems = () => {
    if (loadingMore || visibleCount >= filteredAndSortedItems.length) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + BATCH_INCREMENT, filteredAndSortedItems.length));
      setLoadingMore(false);
    }, 250);
  };

  // Infinite scroll intersection observer
  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !loadingMore) {
          if (visibleCount < filteredAndSortedItems.length) {
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
  }, [loading, loadingMore, visibleCount, filteredAndSortedItems.length]);

  // Fallback scroll listener
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 160 && !loadingMore && visibleCount < filteredAndSortedItems.length) {
      loadMoreItems();
    }
  };

  const displayedItems = useMemo(() => {
    return filteredAndSortedItems.slice(0, visibleCount);
  }, [filteredAndSortedItems, visibleCount]);

  const hasMore = visibleCount < filteredAndSortedItems.length;

  const handleOpenItemDetail = (item) => {
    setSelectedItemDetail(item);
    setModalDurationMode(pricingViewMode);
    setModalHours(4);
    setModalQuantity(1);
  };

  return (
    <div className="bg-[#070709] text-ivory-50 pt-24 sm:pt-28 pb-16 sm:pb-20 w-full overflow-hidden selection:bg-gold-500 selection:text-obsidian-950">
      {/* ========================================================================= */}
      {/* 1. LUXURY HEADER BANNER */}
      {/* ========================================================================= */}
      <section className="py-10 sm:py-14 bg-[#0B0B0F] border-b border-gold-500/20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 sm:space-y-4">
          <div className="badge-festivity animate-float-gently">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Curated Décor Inventory & Live Stock Logistics</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-ivory-50 font-light">
            Luxury Décor & Furniture Rentals
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-champagne-200/80 max-w-2xl mx-auto font-light leading-relaxed">
            Rent our collection of <strong className="text-gold-400 font-semibold">{dynamicStats.totalItems} luxury pieces</strong> ({dynamicStats.totalStock.toLocaleString()} total stock units) by the <strong className="text-gold-400 font-semibold">Hour</strong> or by the <strong className="text-gold-400 font-semibold">Day</strong> with real-time warehouse availability.
          </p>

          {effectiveDiscount > 0 && (
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/40 text-gold-300 text-xs font-semibold shadow-sm">
              <Tag className="w-3.5 h-3.5 text-gold-400" />
              <span>Sitewide Promo Active: All rentals get {effectiveDiscount}% OFF automatically applied at checkout!</span>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. DYNAMIC LIVE STOCK & INVENTORY METRICS TICKER */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-7 relative z-10">
        <div className="festivity-card-dark p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 shadow-2xl">
          {/* Total Curated Pieces */}
          <div className="p-3 bg-white/[0.04] rounded-2xl border border-white/10 flex items-center space-x-3">
            <div className="p-2.5 bg-gold-500/20 text-gold-400 rounded-xl">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-champagne-400/70 tracking-wider block">Total Pieces</span>
              <p className="font-serif text-lg sm:text-xl font-bold text-ivory-50">{dynamicStats.totalItems} Designs</p>
            </div>
          </div>

          {/* Total Stock Units */}
          <div className="p-3 bg-white/[0.04] rounded-2xl border border-white/10 flex items-center space-x-3">
            <div className="p-2.5 bg-gold-500/20 text-gold-400 rounded-xl">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-champagne-400/70 tracking-wider block">Total Stock</span>
              <p className="font-serif text-lg sm:text-xl font-bold text-ivory-50">{dynamicStats.totalStock.toLocaleString()} Units</p>
            </div>
          </div>

          {/* Available Units */}
          <div className="p-3 bg-emerald-950/40 rounded-2xl border border-emerald-500/30 flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400/80 tracking-wider block">Available Stock</span>
              <p className="font-serif text-lg sm:text-xl font-bold text-emerald-300">{dynamicStats.availableStock.toLocaleString()} Units</p>
            </div>
          </div>

          {/* Currently Rented */}
          <div className="p-3 bg-purple-950/40 rounded-2xl border border-purple-500/30 flex items-center space-x-3">
            <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-purple-400/80 tracking-wider block">Currently Rented</span>
              <p className="font-serif text-lg sm:text-xl font-bold text-purple-300">{dynamicStats.rentedStock.toLocaleString()} Units</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FILTER, SEARCH & DURATION SWITCHER CONTROLS */}
      {/* ========================================================================= */}
      <section className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-champagne-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chairs, arches, stage décor, chandeliers, tables..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gold-500/30 bg-[#121218] text-ivory-50 text-xs focus:outline-none focus:border-gold-500 shadow-sm transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Custom Sort Select */}
            <div className="w-48">
              <CustomSelect
                value={sortBy}
                onChange={setSortBy}
                options={SORT_OPTIONS}
                placeholder="Sort by"
              />
            </div>

            {/* Availability Filter Tabs */}
            <div className="flex items-center space-x-1 bg-[#121218] p-1 rounded-full border border-gold-500/30 shadow-sm text-xs">
              {[
                { id: 'ALL', label: 'All Stock' },
                { id: 'IN_STOCK', label: 'In Stock' },
                { id: 'LOW_STOCK', label: 'Low Stock' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStockAvailabilityFilter(f.id)}
                  className={`px-3 py-1 rounded-full font-semibold transition-all ${
                    stockAvailabilityFilter === f.id
                      ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 font-bold shadow-glow-pill'
                      : 'text-champagne-300 hover:text-gold-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Hourly vs Daily Pricing View Switcher */}
            <div className="flex items-center bg-[#121218] p-1 rounded-full border border-gold-500/30">
              <button
                onClick={() => setPricingViewMode('DAILY')}
                className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
                  pricingViewMode === 'DAILY'
                    ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 font-bold shadow-glow-pill'
                    : 'text-champagne-300 hover:text-gold-300'
                }`}
              >
                Daily Rates
              </button>
              <button
                onClick={() => setPricingViewMode('HOURLY')}
                className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
                  pricingViewMode === 'HOURLY'
                    ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 font-bold shadow-glow-pill'
                    : 'text-champagne-300 hover:text-gold-300'
                }`}
              >
                Hourly Rates
              </button>
            </div>

            {/* Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="btn-festivity-pill flex items-center justify-center space-x-2 px-5 py-2.5 text-xs uppercase tracking-widest shadow-glow-pill"
            >
              <ShoppingBag className="w-4 h-4 text-obsidian-950" />
              <span>Rental Cart</span>
            </button>
          </div>
        </div>

        {/* Category Pills with Dynamic Counts */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {RENTAL_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = categoryCounts[cat] || 0;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all duration-300 flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 font-bold shadow-glow-pill scale-105'
                    : 'bg-[#121218] text-champagne-200 border border-gold-500/25 hover:border-gold-500 hover:text-gold-300'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-obsidian-950/20 text-obsidian-950' : 'bg-white/10 text-gold-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Status Counter */}
        <div className="text-xs text-champagne-300/80 font-light flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>Showing <strong className="font-semibold text-gold-400">{displayedItems.length}</strong> of <strong className="font-semibold text-gold-400">{filteredAndSortedItems.length}</strong> rental pieces</span>
          </div>

          <span className="text-[11px] text-champagne-400/60 hidden sm:inline-block">
            All prices subject to refundable security deposit
          </span>
        </div>
      </section>

      {/* Main Rental Items Section with Fixed Scrollable Container */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="py-24 text-center">
            <LuxurySpinner size="lg" text="Curating Luxury Décor & Furniture Rental Archive..." />
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="text-center py-20 bg-[#0E0E14] rounded-3xl border border-gold-500/20 space-y-3 p-8">
            <p className="font-serif text-lg sm:text-xl text-champagne-200">No rental items found in this selection.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setStockAvailabilityFilter('ALL');
              }}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-gold-500 to-champagne-500 text-obsidian-950 text-xs uppercase tracking-wider font-bold hover:brightness-110 transition-all"
            >
              Reset All Filters
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
              {displayedItems.map((item) => {
                const isHourlyView = pricingViewMode === 'HOURLY';
                const rawHourly = item.hourlyRate || +(item.rentalPrice * 0.2).toFixed(2);
                const basePrice = isHourlyView ? rawHourly : item.rentalPrice;

                const { discountedPrice } = calculateDiscount(basePrice);
                const hasDiscount = effectiveDiscount > 0 && discountedPrice < basePrice;
                const displayPrice = hasDiscount ? discountedPrice : basePrice;

                const availableQty = Number(item.availableQuantity ?? 0);
                const isAvailable = availableQty > 0;
                const isLowStock = isAvailable && availableQty <= 2;
                const percentAvailable = Math.round((availableQty / Math.max(1, item.totalQuantity || availableQty)) * 100);

                return (
                  <div
                    key={item.id}
                    className={`overflow-hidden flex flex-col justify-between group rounded-3xl border transition-all duration-300 ${
                      isDarkMode
                        ? 'festivity-card-dark bg-[#0E0E14] text-ivory-50 border-gold-500/30 hover:border-gold-400 hover:shadow-glow-gold'
                        : 'bg-white text-[#141210] border-gold-500/35 shadow-md hover:border-gold-500 hover:shadow-[0_12px_30px_rgba(212,175,55,0.2)]'
                    }`}
                  >
                    {/* Item Image Container & Badges */}
                    <div
                      onClick={() => handleOpenItemDetail(item)}
                      className="relative h-64 sm:h-72 w-full overflow-hidden bg-obsidian-900 cursor-pointer"
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />

                      {/* Top-Left Category & Promo Badges */}
                      <div className="absolute top-3 left-3 flex flex-col space-y-1.5 z-10">
                        <span className="bg-obsidian-950/85 backdrop-blur-md text-gold-400 text-[10px] uppercase tracking-widest font-semibold px-3 py-1 rounded-full border border-gold-500/30 shadow-sm">
                          {item.category}
                        </span>
                        {hasDiscount && (
                          <span className="bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full shadow-glow-pill">
                            {effectiveDiscount}% OFF
                          </span>
                        )}
                      </div>

                      {/* Top-Right Visual Status Badge */}
                      <div className="absolute top-3 right-3 z-10">
                        <span
                          className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-md flex items-center space-x-1.5 ${
                            !isAvailable
                              ? 'bg-red-950/80 text-red-300 ring-1 ring-red-500/50'
                              : isLowStock
                              ? 'bg-amber-950/80 text-amber-300 ring-1 ring-amber-500/50'
                              : 'bg-emerald-950/80 text-emerald-300 ring-1 ring-emerald-500/50'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                          <span>
                            {!isAvailable
                              ? 'Out of Stock'
                              : isLowStock
                              ? `Low Stock (${item.availableQuantity} Left)`
                              : `${item.availableQuantity} in Stock`}
                          </span>
                        </span>
                      </div>

                      {/* Bottom Image Specs Overlay Pill */}
                      {(item.dimensions || item.material) && (
                        <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none">
                          <span className="inline-block bg-obsidian-950/85 backdrop-blur-md text-champagne-200 text-[9px] px-3 py-1 rounded-full border border-gold-500/20 font-light truncate max-w-full">
                            {item.dimensions ? `${item.dimensions}` : ''} {item.dimensions && item.material ? '• ' : ''}{item.material || ''}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div
                        onClick={() => handleOpenItemDetail(item)}
                        className="cursor-pointer space-y-1.5"
                      >
                        <h4 className="font-serif text-lg sm:text-xl text-ivory-50 font-medium group-hover:text-gold-400 transition-colors line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-xs text-champagne-200/80 line-clamp-2 font-light leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Live Stock Level Progress Meter */}
                      <div className="pt-2 border-t border-gold-500/20 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-champagne-300 font-medium">
                            Stock: <strong className="text-gold-400 font-bold">{item.availableQuantity}</strong> / {item.totalQuantity} available
                          </span>
                          <span className="text-purple-400 font-semibold text-[10px]">
                            {item.rentedQuantity || 0} rented
                          </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              !isAvailable
                                ? 'bg-red-500'
                                : isLowStock
                                ? 'bg-amber-500'
                                : 'bg-gradient-to-r from-gold-500 to-emerald-400'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, percentAvailable))}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Dual Hourly and Daily Pricing & Add to Cart Section */}
                    <div className="p-4 sm:p-5 pt-0 border-t border-gold-500/20 mt-1 space-y-3">
                      <div className="flex items-baseline justify-between pt-2.5">
                        <div>
                          {hasDiscount ? (
                            <div className="flex items-baseline space-x-1.5">
                              <span className="font-serif text-xl sm:text-2xl font-bold text-gold-gradient">
                                PKR {Math.round(discountedPrice).toLocaleString()}
                              </span>
                              <span className="text-xs text-champagne-400/50 line-through">
                                PKR {Math.round(basePrice).toLocaleString()}
                              </span>
                              <span className="text-[10px] text-champagne-300 font-semibold">
                                /{isHourlyView ? 'hr' : 'day'}
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="font-serif text-xl sm:text-2xl font-bold text-ivory-50">
                                PKR {Math.round(displayPrice).toLocaleString()}
                              </span>
                              <span className="text-[10px] text-champagne-300 font-semibold">
                                /{isHourlyView ? 'hr' : 'day'}
                              </span>
                            </div>
                          )}

                          <span className="block text-[10px] text-champagne-400/70 mt-0.5">
                            {isHourlyView
                              ? `Daily rate: PKR ${Math.round(item.rentalPrice).toLocaleString()}/day`
                              : `Hourly rate: PKR ${Math.round(rawHourly).toLocaleString()}/hr`}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-gold-400 font-medium block">
                            Dep: PKR {Math.round(item.depositAmount || item.rentalPrice * 0.25).toLocaleString()}
                          </span>
                          <span className="text-[9px] text-champagne-400/60">Refundable</span>
                        </div>
                      </div>

                      {/* Action Buttons Row */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          disabled={!isAvailable}
                          onClick={() => isAvailable && addToCart(item, 1, 'DAILY', 24)}
                          className={`py-2.5 px-3 rounded-full font-bold text-[10px] uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all shadow-sm ${
                            isAvailable
                              ? 'btn-festivity-pill text-obsidian-950'
                              : 'bg-white/10 text-champagne-400/40 cursor-not-allowed'
                          }`}
                          title={isAvailable ? 'Reserve as Daily rental' : 'Item currently out of stock'}
                        >
                          <Calendar className="w-3.5 h-3.5 text-obsidian-950" />
                          <span>{isAvailable ? 'Rent Daily' : 'Out of Stock'}</span>
                        </button>

                        <button
                          disabled={!isAvailable}
                          onClick={() => isAvailable && addToCart(item, 1, 'HOURLY', 4)}
                          className={`py-2.5 px-3 rounded-full font-bold text-[10px] uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all shadow-sm ${
                            isAvailable
                              ? 'btn-festivity-outline text-ivory-50 hover:text-gold-300'
                              : 'bg-white/10 text-champagne-400/40 cursor-not-allowed'
                          }`}
                          title={isAvailable ? 'Reserve as Hourly rental (4 hours default)' : 'Item currently out of stock'}
                        >
                          <Clock className="w-3.5 h-3.5 text-gold-400" />
                          <span>{isAvailable ? 'Rent Hourly' : 'Out of Stock'}</span>
                        </button>
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
                <LuxurySpinner size="sm" text="Revealing more rental pieces..." />
              </div>
            )}

            {/* End of Catalog Message */}
            {!hasMore && filteredAndSortedItems.length > 0 && (
              <div className="mt-8 py-6 text-center space-y-1.5 border-t border-gold-500/20 max-w-md mx-auto">
                <div className="flex items-center justify-center space-x-2 text-gold-400 text-xs">
                  <span>✦</span>
                  <span className="font-serif uppercase tracking-[0.25em] text-[11px] font-medium text-ivory-100">
                    All {filteredAndSortedItems.length} Rental Pieces Revealed
                  </span>
                  <span>✦</span>
                </div>
                <p className="text-[11px] text-champagne-300/70 font-light">
                  Looking for bespoke custom builds or larger quantities? Inquire with our production atelier.
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 5. ITEM DETAIL MODAL */}
      {/* ========================================================================= */}
      {selectedItemDetail && (
        <div className="fixed inset-0 z-[99999] overflow-hidden flex items-center justify-center p-3 sm:p-4 md:p-6 bg-obsidian-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative bg-[#0E0E14] text-ivory-50 rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full max-h-[92dvh] sm:max-h-[90dvh] flex flex-col border border-gold-500/50 p-5 sm:p-8 space-y-4 overflow-y-auto overscroll-contain">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold-400 font-bold">
                  {selectedItemDetail.category}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl text-ivory-50 font-light mt-1">
                  {selectedItemDetail.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItemDetail(null)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-champagne-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden bg-obsidian-900 border border-gold-500/20">
              <Image
                src={selectedItemDetail.imageUrl}
                alt={selectedItemDetail.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Live Stock Breakdown in Modal */}
            <div className="grid grid-cols-3 gap-3 p-3.5 bg-white/[0.04] rounded-2xl border border-white/10 text-center">
              <div>
                <span className="text-[10px] text-champagne-400 uppercase font-bold">Total Stock</span>
                <p className="font-serif text-base font-bold text-ivory-50">{selectedItemDetail.totalQuantity} units</p>
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 uppercase font-bold">Available Now</span>
                <p className="font-serif text-base font-bold text-emerald-300">{selectedItemDetail.availableQuantity} in Stock</p>
              </div>
              <div>
                <span className="text-[10px] text-purple-400 uppercase font-bold">Rented / Field</span>
                <p className="font-serif text-base font-bold text-purple-300">{selectedItemDetail.rentedQuantity || 0} units</p>
              </div>
            </div>

            <p className="text-xs text-champagne-200/80 font-light leading-relaxed">
              {selectedItemDetail.description}
            </p>

            {/* Duration Mode Selector inside Modal */}
            <div className="p-4 bg-white/[0.04] rounded-2xl space-y-3 border border-gold-500/20">
              <div className="flex items-center justify-between text-xs font-semibold text-champagne-200 uppercase tracking-wider">
                <span>Select Rental Mode:</span>
                <span className="text-gold-400 font-bold">
                  {modalDurationMode === 'HOURLY'
                    ? `PKR ${Math.round(selectedItemDetail.hourlyRate || selectedItemDetail.rentalPrice * 0.2).toLocaleString()}/hr`
                    : `PKR ${Math.round(selectedItemDetail.rentalPrice).toLocaleString()}/day`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setModalDurationMode('DAILY')}
                  className={`py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                    modalDurationMode === 'DAILY'
                      ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 font-bold shadow-glow-pill'
                      : 'bg-white/5 text-champagne-200 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  Daily Rate (PKR {Math.round(selectedItemDetail.rentalPrice).toLocaleString()}/day)
                </button>
                <button
                  type="button"
                  onClick={() => setModalDurationMode('HOURLY')}
                  className={`py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                    modalDurationMode === 'HOURLY'
                      ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 font-bold shadow-glow-pill'
                      : 'bg-white/5 text-champagne-200 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  Hourly Rate (PKR {Math.round(selectedItemDetail.hourlyRate || selectedItemDetail.rentalPrice * 0.2).toLocaleString()}/hr)
                </button>
              </div>

              {modalDurationMode === 'HOURLY' && (
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-xs text-champagne-300 font-medium">Rental Duration (Hours):</span>
                  <div className="flex items-center space-x-1.5">
                    {[2, 4, 6, 8, 12, 24].map((hrs) => (
                      <button
                        key={hrs}
                        onClick={() => setModalHours(hrs)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                          modalHours === hrs
                            ? 'bg-gold-500 text-obsidian-950 shadow-glow-pill'
                            : 'bg-white/5 text-champagne-200 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {hrs}h
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Selector & Add to Cart */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-champagne-300 font-semibold">Quantity:</span>
                <div className="flex items-center border border-gold-500/30 rounded-xl bg-white/5 overflow-hidden">
                  <button
                    onClick={() => setModalQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-gold-400 hover:bg-white/10 font-bold"
                  >
                    -
                  </button>
                  <span className="px-3 py-1.5 font-bold text-xs font-mono text-ivory-50">{modalQuantity}</span>
                  <button
                    onClick={() => setModalQuantity((q) => Math.min(selectedItemDetail.availableQuantity, q + 1))}
                    className="px-3 py-1.5 text-gold-400 hover:bg-white/10 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                disabled={selectedItemDetail.availableQuantity <= 0}
                onClick={() => {
                  addToCart(selectedItemDetail, modalQuantity, modalDurationMode, modalHours);
                  setSelectedItemDetail(null);
                }}
                className={`px-6 py-3 rounded-full font-bold uppercase tracking-wider text-xs transition-all shadow-md ${
                  selectedItemDetail.availableQuantity > 0
                    ? 'btn-festivity-pill text-obsidian-950 shadow-glow-pill'
                    : 'bg-white/10 text-champagne-400/40 cursor-not-allowed'
                }`}
              >
                {selectedItemDetail.availableQuantity > 0 ? 'Add to Rental Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
