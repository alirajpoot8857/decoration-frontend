'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '../src/lib/api';
import ConsultationModal from '../src/components/ui/ConsultationModal';
import { useDiscount } from '../src/context/DiscountContext';
import {
  Sparkles,
  ArrowRight,
  Crown,
  CheckCircle2,
  Calendar,
  Layers,
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Eye,
  Clock,
  Tag,
  Filter,
} from 'lucide-react';

const HERO_SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=85&w=2000&auto=format&fit=crop',
    badge: 'Creating unforgettable spaces since 2018',
    category: 'Haute Scénographie & Floral Artistry',
    title: 'WE TURN MOMENTS INTO',
    titleHighlight: 'MASTERPIECES.',
    quote: '“Luxury event decoration designed to make your most special moments unforgettable.”',
    primaryBtn: { text: 'Explore Designs', href: '/gallery' },
    secondaryBtn: { text: 'Book Consultation', isModal: true },
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=85&w=2000&auto=format&fit=crop',
    badge: 'Bespoke Grand Stage Architecture',
    category: 'Botanical Canopies & Couture Staging',
    title: 'WHERE DREAMS TAKE',
    titleHighlight: 'GRAND STAGE.',
    quote: '“Transforming ordinary venues into breathtaking palaces with rare imported botanicals and couture lighting.”',
    primaryBtn: { text: 'View Packages', href: '/packages' },
    secondaryBtn: { text: 'Reserve Signature Stage', isModal: true },
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=85&w=2000&auto=format&fit=crop',
    badge: 'Royal Celebrations & Prestige Galas',
    category: 'Milestone & Corporate Environments',
    title: 'CELEBRATE IN UNRIVALED',
    titleHighlight: 'OPULENCE.',
    quote: '“From celebrity birthday galas to international executive summits, we engineer prestige into every corner.”',
    primaryBtn: { text: 'Explore Services', href: '/services' },
    secondaryBtn: { text: 'Plan Your Gala', isModal: true },
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=85&w=2000&auto=format&fit=crop',
    badge: 'Hourly & Daily Luxury Rentals',
    category: 'Curated Furnishings & Table Art',
    title: 'THE HAUTE RENTAL',
    titleHighlight: 'COLLECTION.',
    quote: '“Gilded chairs, mirrored banquet tables, and crystal chandelier centerpieces available by the hour or day.”',
    primaryBtn: { text: 'Browse Rental Catalog', href: '/rental' },
    secondaryBtn: { text: 'Check Stock & Rates', href: '/rental' },
  },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const heroTimerRef = useRef(null);

  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reviews Carousel State
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [starRatingFilter, setStarRatingFilter] = useState('ALL'); // 'ALL' | 5 | 4
  const [isReviewPaused, setIsReviewPaused] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const reviewTimerRef = useRef(null);

  const [consultationOpen, setConsultationOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState(null);

  const { effectiveDiscount, calculateDiscount } = useDiscount();

  // Screen size detection for 2-card reviews
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 1. Hero banner slider autoplay set to EVERY 3 SECONDS (3000ms) with smooth transitions
  useEffect(() => {
    if (!isHeroPaused) {
      heroTimerRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
      }, 3000);
    }
    return () => {
      if (heroTimerRef.current) clearInterval(heroTimerRef.current);
    };
  }, [isHeroPaused]);

  // 2. Reviews carousel auto-play (showing 2 at a time on desktop, every 4.5 seconds)
  const filteredTestimonials = testimonials.filter((t) => {
    if (starRatingFilter === 'ALL') return true;
    return t.rating >= Number(starRatingFilter);
  });

  const maxReviewIndex = useMemo(() => {
    if (filteredTestimonials.length === 0) return 0;
    return isDesktop ? Math.max(0, filteredTestimonials.length - 2) : Math.max(0, filteredTestimonials.length - 1);
  }, [filteredTestimonials.length, isDesktop]);

  useEffect(() => {
    if (currentReviewIndex > maxReviewIndex) {
      setCurrentReviewIndex(0);
    }
  }, [maxReviewIndex, currentReviewIndex]);

  useEffect(() => {
    if (!isReviewPaused && filteredTestimonials.length > (isDesktop ? 2 : 1)) {
      reviewTimerRef.current = setInterval(() => {
        setCurrentReviewIndex((prev) => (prev >= maxReviewIndex ? 0 : prev + 1));
      }, 4500);
    }
    return () => {
      if (reviewTimerRef.current) clearInterval(reviewTimerRef.current);
    };
  }, [isReviewPaused, filteredTestimonials.length, isDesktop, maxReviewIndex]);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [pkgRes, srvRes, galRes, testRes] = await Promise.all([
          api.getPackages(),
          api.getServices(),
          api.getGallery({ featured: 'true' }),
          api.getTestimonials(),
        ]);

        if (pkgRes.packages) setPackages(pkgRes.packages);
        if (srvRes.services) setServices(srvRes.services);
        if (galRes.images) setGallery(galRes.images.slice(0, 6));
        if (testRes.testimonials) setTestimonials(testRes.testimonials);
      } catch (err) {
        console.warn('Failed to load dynamic home data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const openBookingModal = (packageId = null) => {
    setSelectedPackageId(packageId);
    setConsultationOpen(true);
  };

  const activeSlideData = HERO_SLIDES[currentSlide];

  return (
    <div className="bg-ivory-100 text-obsidian-900 overflow-hidden w-full">
      {/* ========================================================================= */}
      {/* 1. HERO SLIDER BANNER (Autoplays every 3s with smooth crossfade) */}
      {/* ========================================================================= */}
      <section
        className="relative min-h-[92vh] sm:min-h-[96vh] lg:min-h-screen flex items-center justify-center pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden select-none"
        onMouseEnter={() => setIsHeroPaused(true)}
        onMouseLeave={() => setIsHeroPaused(false)}
      >
        {/* Background Slides with Smooth Fade Transitions */}
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-obsidian-950/95 via-obsidian-950/75 to-obsidian-950/45" />
              <div className="absolute inset-0 bg-gradient-to-t from-ivory-100 via-transparent to-obsidian-950/60" />
            </div>
          );
        })}

        {/* Hero Content Box */}
        <div className="max-w-7xl mx-auto relative z-20 w-full py-8 sm:py-12">
          <div className="max-w-3xl space-y-5 sm:space-y-6 text-left">
            {/* Luxury Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-gold-400/40 bg-obsidian-900/75 backdrop-blur-md text-gold-300 text-[11px] sm:text-xs tracking-[0.2em] uppercase font-medium shadow-sm hover:border-gold-300 transition-colors">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>{activeSlideData.badge}</span>
            </div>

            {/* Brand Title & Headline */}
            <div className="space-y-2.5">
              <span className="block text-[11px] sm:text-xs uppercase tracking-[0.35em] font-sans text-champagne-300 font-semibold">
                {activeSlideData.category}
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-ivory-50 tracking-tight leading-[1.12]">
                {activeSlideData.title} <br />
                <span className="font-serif italic font-normal text-gold-gradient">
                  {activeSlideData.titleHighlight}
                </span>
              </h1>
            </div>

            {/* Hero Subtitle Quote */}
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-champagne-100/90 font-light max-w-xl leading-relaxed font-sans border-l-2 border-gold-500/60 pl-4">
              {activeSlideData.quote}
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {activeSlideData.primaryBtn.isModal ? (
                <button
                  onClick={() => openBookingModal(null)}
                  className="px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-ivory-50 text-obsidian-950 font-bold text-xs uppercase tracking-[0.2em] shadow-luxury hover:bg-gold-300 hover:shadow-glow-gold hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 text-center"
                >
                  {activeSlideData.primaryBtn.text}
                </button>
              ) : (
                <Link
                  href={activeSlideData.primaryBtn.href}
                  className="px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-ivory-50 text-obsidian-950 font-bold text-xs uppercase tracking-[0.2em] shadow-luxury hover:bg-gold-300 hover:shadow-glow-gold hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 text-center"
                >
                  {activeSlideData.primaryBtn.text}
                </Link>
              )}

              {activeSlideData.secondaryBtn.isModal ? (
                <button
                  onClick={() => openBookingModal(null)}
                  className="px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-gold-600 via-gold-500 to-champagne-500 text-obsidian-950 font-bold text-xs uppercase tracking-[0.2em] shadow-luxury hover:shadow-glow-gold hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 text-center flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{activeSlideData.secondaryBtn.text}</span>
                </button>
              ) : (
                <Link
                  href={activeSlideData.secondaryBtn.href}
                  className="px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-gold-600 via-gold-500 to-champagne-500 text-obsidian-950 font-bold text-xs uppercase tracking-[0.2em] shadow-luxury hover:shadow-glow-gold hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 text-center flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{activeSlideData.secondaryBtn.text}</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="absolute inset-y-0 left-3 sm:left-6 right-3 sm:right-6 z-30 flex items-center justify-between pointer-events-none">
          <button
            onClick={handlePrevSlide}
            className="pointer-events-auto p-2.5 sm:p-3 rounded-full bg-obsidian-900/60 backdrop-blur-md border border-white/20 text-ivory-50 hover:bg-gold-500 hover:text-obsidian-950 hover:scale-110 active:scale-95 transition-all duration-300 shadow-md"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={handleNextSlide}
            className="pointer-events-auto p-2.5 sm:p-3 rounded-full bg-obsidian-900/60 backdrop-blur-md border border-white/20 text-ivory-50 hover:bg-gold-500 hover:text-obsidian-950 hover:scale-110 active:scale-95 transition-all duration-300 shadow-md"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Carousel Progress Indicators / Bullets */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-2.5">
          {HERO_SLIDES.map((slide, idx) => {
            const isActive = idx === currentSlide;
            return (
              <button
                key={slide.id}
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all duration-300 rounded-full ${
                  isActive
                    ? 'w-8 sm:w-10 h-2 bg-gradient-to-r from-gold-500 to-champagne-400 shadow-md'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SIGNATURE EXPERIENCE (Editorial Split Layout) */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 lg:py-32 relative bg-ivory-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Left Column: Photograph with hover zoom and floating luxury card */}
            <div className="lg:col-span-6 relative">
              <div className="relative h-[360px] sm:h-[480px] lg:h-[540px] w-full rounded-3xl overflow-hidden shadow-luxury-lg border border-champagne-300 group">
                <Image
                  src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200&auto=format&fit=crop"
                  alt="Lumière Signature Event Experience"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/60 via-transparent to-transparent" />
              </div>

              {/* Floating Decorative Highlight Card */}
              <div className="absolute -bottom-5 sm:-bottom-6 right-2 sm:right-6 bg-ivory-50/95 border border-gold-500/40 p-4 sm:p-6 rounded-2xl shadow-luxury max-w-[260px] sm:max-w-xs space-y-1.5 hover:border-gold-500 transition-colors">
                <p className="text-[9px] sm:text-[10px] font-sans uppercase tracking-[0.2em] text-gold-700 font-bold">
                  Bespoke Scénographie
                </p>
                <p className="font-serif text-base sm:text-lg text-obsidian-900 leading-snug">
                  Curated with rare botanical imports and couture lighting.
                </p>
              </div>
            </div>

            {/* Right Column: Editorial Text Content */}
            <div className="lg:col-span-6 space-y-6 lg:pl-4 pt-4 sm:pt-0">
              <div className="inline-flex items-center space-x-2 text-gold-700 text-xs uppercase tracking-[0.25em] font-semibold">
                <Crown className="w-4 h-4" />
                <span>The Signature Philosophy</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-obsidian-950 font-light tracking-tight leading-tight">
                EVERY DETAIL <br />
                <span className="italic font-normal text-gold-700">HAS A STORY.</span>
              </h2>

              <p className="text-sm sm:text-base text-obsidian-600 font-light leading-relaxed">
                “Transforming ordinary spaces into unforgettable experiences through flowers, lighting, colors, textures, and custom-designed décor.”
              </p>

              <div className="space-y-3.5 pt-1 text-xs sm:text-sm text-obsidian-600 font-light">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-gold-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="font-semibold text-obsidian-900">Custom Spatial Architecture:</strong> Every stage, runway, and floral canopy is engineered exclusively for your venue.
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-gold-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="font-semibold text-obsidian-900">Imported Botanical Freshness:</strong> We source peonies from Holland and rare phalaenopsis orchids from South America.
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-gold-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="font-semibold text-obsidian-900">Cinematic Lighting:</strong> Dimmable warm intelligent fixtures that create romance on camera and in person.
                  </span>
                </div>
              </div>

              <div className="pt-3">
                <Link
                  href="/about"
                  className="inline-flex items-center space-x-3 text-xs uppercase tracking-[0.2em] font-bold text-obsidian-900 hover:text-gold-700 border-b-2 border-gold-500 pb-1 group transition-all duration-300"
                >
                  <span>Discover Our Story</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FOUR ARTISTIC DISCIPLINES (Services) */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 lg:py-32 bg-champagne-50/50 border-y border-champagne-300/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-12 sm:mb-16">
            <span className="text-xs uppercase tracking-[0.3em] text-gold-700 font-semibold">
              Artistic Disciplines
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-obsidian-950 font-light">
              Tailored Event Atmospheres
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-obsidian-600 font-light">
              Four distinct arenas of décor artistry, executed with exacting precision and unmatched creative vision.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {services.map((service, idx) => (
              <div
                key={service.id || service.title}
                className="bg-ivory-50 rounded-3xl overflow-hidden border border-champagne-300 shadow-luxury hover:shadow-luxury-lg hover:border-gold-500/70 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Card Image */}
                <div className="relative h-60 sm:h-64 w-full overflow-hidden bg-champagne-200">
                  <Image
                    src={service.imageUrl}
                    alt={service.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  <span className="absolute top-4 left-4 bg-obsidian-900/70 backdrop-blur-md text-gold-300 text-[10px] uppercase tracking-widest font-semibold px-3 py-1 rounded-full">
                    0{idx + 1}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-serif text-lg sm:text-xl text-obsidian-950 font-medium group-hover:text-gold-700 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs text-obsidian-600 leading-relaxed font-light line-clamp-3">
                      {service.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-champagne-200 flex items-center justify-between">
                    <span className="text-[11px] text-obsidian-500">
                      From PKR {service.priceStartingAt?.toLocaleString() || '2,200'}
                    </span>
                    <Link
                      href="/services"
                      className="inline-flex items-center text-xs uppercase tracking-[0.18em] font-semibold text-gold-700 group-hover:text-gold-900 transition-colors"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FOUR-STEP JOURNEY */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 lg:py-32 bg-ivory-100 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-14 sm:mb-20">
            <span className="text-xs uppercase tracking-[0.3em] text-gold-700 font-semibold">
              The Journey
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-obsidian-950 font-light">
              From Vision to Splendor
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-obsidian-600 font-light">
              Our seamless, white-glove process guarantees peace of mind while we bring your grandest celebration to life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative">
            <div className="hidden lg:block absolute top-12 left-16 right-16 h-[1.5px] bg-champagne-300 z-0" />

            {[
              {
                step: '01',
                title: 'CONSULTATION',
                subtitle: 'Share your vision with us.',
                description: 'We sit down over champagne to uncover your color palette, architectural aesthetic, and desires.',
              },
              {
                step: '02',
                title: 'CONCEPT & 3D DESIGN',
                subtitle: 'We draft your bespoke concept.',
                description: 'Our scenographers draft moodboards, 3D spatial models, and floral palette schemes tailored to your venue.',
              },
              {
                step: '03',
                title: 'PRODUCTION & SETUP',
                subtitle: 'Our crew transforms your venue.',
                description: 'A master floral and lighting crew handles precision structural rigging, staging, and styling on event day.',
              },
              {
                step: '04',
                title: 'CELEBRATE & IMMERSE',
                subtitle: 'You enjoy every single moment.',
                description: 'Bask in timeless photographs with loved ones, knowing our coordination and teardown team manages every detail.',
              },
            ].map((p) => (
              <div
                key={p.step}
                className="relative z-10 bg-ivory-50 border border-champagne-300 rounded-3xl p-6 sm:p-8 shadow-luxury hover:border-gold-500/60 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-gold-500 to-champagne-500 text-obsidian-950 rounded-2xl flex items-center justify-center font-serif text-lg sm:text-xl font-bold shadow-md mb-5 group-hover:scale-105 transition-transform">
                    {p.step}
                  </div>

                  <h3 className="font-serif text-lg sm:text-xl text-obsidian-950 font-medium mb-1">
                    {p.title}
                  </h3>
                  <p className="text-xs font-semibold text-gold-700 uppercase tracking-wider mb-2.5">
                    {p.subtitle}
                  </p>
                  <p className="text-xs text-obsidian-600 leading-relaxed font-light">
                    {p.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. PACKAGES SECTION (Dynamic with Promo Discount Integration) */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 lg:py-32 bg-champagne-50/70 border-t border-champagne-300/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-12 sm:mb-16">
            <span className="text-xs uppercase tracking-[0.3em] text-gold-700 font-semibold">
              Curated Collections
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-obsidian-950 font-light">
              Signature Décor Packages
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-obsidian-600 font-light">
              Select from our signature collections or book a private consultation for fully custom spatial architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {packages.map((pkg) => {
              const isRec = pkg.isRecommended;
              const features = Array.isArray(pkg.features)
                ? pkg.features
                : typeof pkg.features === 'string'
                ? JSON.parse(pkg.features || '[]')
                : [];

              const { discountedPrice } = calculateDiscount(pkg.price);
              const hasDiscount = effectiveDiscount > 0 && discountedPrice < pkg.price;

              return (
                <div
                  key={pkg.id}
                  className={`relative rounded-3xl p-6 sm:p-8 lg:p-10 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 ${
                    isRec
                      ? 'bg-obsidian-950 text-ivory-50 border-2 border-gold-500 shadow-luxury-lg hover:shadow-glow-gold'
                      : 'bg-ivory-50 text-obsidian-900 border border-champagne-300 shadow-luxury hover:border-gold-400'
                  }`}
                >
                  {isRec && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-gold-600 to-champagne-500 text-obsidian-950 font-bold text-[10px] uppercase tracking-[0.25em] px-4 py-1.5 rounded-full shadow-md">
                      ★ Most Recommended
                    </div>
                  )}

                  <div>
                    <div className="space-y-2 mb-6">
                      <span
                        className={`text-[11px] uppercase tracking-[0.2em] font-semibold ${
                          isRec ? 'text-gold-400' : 'text-gold-700'
                        }`}
                      >
                        {pkg.tier} COLLECTION
                      </span>
                      <h3 className="font-serif text-2xl sm:text-3xl font-light">
                        {pkg.name}
                      </h3>
                      <p
                        className={`text-xs font-light leading-relaxed ${
                          isRec ? 'text-obsidian-300' : 'text-obsidian-600'
                        }`}
                      >
                        {pkg.tagline || pkg.description}
                      </p>
                    </div>

                    <div className="py-4 sm:py-5 border-y border-champagne-300/30 mb-6">
                      {hasDiscount ? (
                        <div className="space-y-1">
                          <div className="flex items-baseline space-x-2">
                            <span className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient">
                              PKR {discountedPrice.toLocaleString()}
                            </span>
                            <span className="text-sm line-through opacity-60">
                              PKR {Number(pkg.price).toLocaleString()}
                            </span>
                            <span
                              className={`text-xs ${
                                isRec ? 'text-obsidian-400' : 'text-obsidian-500'
                              }`}
                            >
                              / complete setup
                            </span>
                          </div>
                          <span className="inline-block text-[10px] font-bold text-gold-400 uppercase tracking-wider">
                            🎉 Includes {effectiveDiscount}% Seasonal Discount
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-baseline space-x-2">
                          <span className="font-serif text-3xl sm:text-4xl font-bold">
                            PKR {Number(pkg.price).toLocaleString()}
                          </span>
                          <span
                            className={`text-xs ${
                              isRec ? 'text-obsidian-400' : 'text-obsidian-500'
                            }`}
                          >
                            / complete setup
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 mb-8">
                      <p
                        className={`text-xs uppercase tracking-widest font-semibold ${
                          isRec ? 'text-gold-400' : 'text-obsidian-800'
                        }`}
                      >
                        What’s Included:
                      </p>
                      <ul className="space-y-2 text-xs font-light">
                        {features.map((feat, i) => (
                          <li key={i} className="flex items-start space-x-2.5">
                            <CheckCircle2
                              className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                                isRec ? 'text-gold-400' : 'text-gold-600'
                              }`}
                            />
                            <span className={isRec ? 'text-ivory-100' : 'text-obsidian-700'}>
                              {feat}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={() => openBookingModal(pkg.id)}
                    className={`w-full py-3.5 sm:py-4 rounded-full font-semibold text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-md hover:scale-[1.02] active:scale-95 ${
                      isRec
                        ? 'bg-gradient-to-r from-gold-500 to-champagne-500 text-obsidian-950 hover:brightness-110 hover:shadow-glow-gold'
                        : 'bg-obsidian-900 text-ivory-50 hover:bg-gold-600'
                    }`}
                  >
                    Reserve {pkg.name}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. MASONRY GALLERY HIGHLIGHTS */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 lg:py-32 bg-ivory-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-16 space-y-4 sm:space-y-0">
            <div className="space-y-2 sm:space-y-3">
              <span className="text-xs uppercase tracking-[0.3em] text-gold-700 font-semibold">
                Visual Lookbook
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-obsidian-950 font-light">
                Recent Masterpieces
              </h2>
            </div>
            <Link
              href="/gallery"
              className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] font-bold text-obsidian-900 hover:text-gold-700 transition-colors group"
            >
              <span>View Full Lookbook Portfolio (150+ Images)</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {gallery.map((img) => (
              <div
                key={img.id}
                className="group relative h-72 sm:h-80 lg:h-96 rounded-3xl overflow-hidden shadow-luxury border border-champagne-300 bg-champagne-100 hover:border-gold-500 transition-all duration-300"
              >
                <Image
                  src={img.imageUrl}
                  alt={img.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/90 via-obsidian-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 sm:p-6 text-ivory-50">
                  <span className="text-[10px] uppercase tracking-widest text-gold-400 font-semibold mb-1">
                    {img.category}
                  </span>
                  <h4 className="font-serif text-base sm:text-lg font-light">{img.title}</h4>
                  <p className="text-xs text-obsidian-300 line-clamp-2 mt-1 font-light">
                    {img.description}
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center text-xs uppercase tracking-widest text-gold-300 font-bold">
                    <span>VIEW COMMISSION →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. CLIENT TESTIMONIALS SLIDER / CAROUSEL WITH DYNAMIC STAR FILTER & TIMESTAMPS */}
      {/* ========================================================================= */}
      <section
        className="py-16 sm:py-24 lg:py-32 bg-champagne-50/60 border-t border-champagne-300/50"
        onMouseEnter={() => setIsReviewPaused(true)}
        onMouseLeave={() => setIsReviewPaused(false)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-14 space-y-4 sm:space-y-0">
            <div className="space-y-2 sm:space-y-3">
              <span className="text-xs uppercase tracking-[0.3em] text-gold-700 font-semibold">
                Words of Praise & Verified Reflections
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-obsidian-950 font-light">
                Reflections of Delighted Hosts
              </h2>
            </div>

            {/* Dynamic Star Rating Filter */}
            <div className="flex items-center space-x-2 bg-white/80 border border-champagne-300 p-1 rounded-full shadow-sm">
              {[
                { id: 'ALL', label: 'All Reviews' },
                { id: '5', label: '★ 5.0 Stars' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setStarRatingFilter(f.id);
                    setCurrentReviewIndex(0);
                  }}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                    starRatingFilter === f.id
                      ? 'bg-obsidian-900 text-ivory-50 shadow-sm'
                      : 'text-obsidian-700 hover:text-obsidian-950'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filteredTestimonials.length === 0 ? (
            <div className="p-12 text-center text-obsidian-500 bg-white rounded-3xl border border-champagne-300">
              No reviews match the selected rating filter.
            </div>
          ) : (
            <div className="relative">
              {/* Carousel Track (2 Cards Visible Side-by-Side on Desktop) */}
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-700 ease-in-out -mx-2 sm:-mx-3"
                  style={{ transform: `translateX(-${currentReviewIndex * (isDesktop ? 50 : 100)}%)` }}
                >
                  {filteredTestimonials.map((t, idx) => {
                    const formattedDate = t.createdAt
                      ? new Date(t.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        }) + ' at ' + new Date(t.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                      : 'August 18, 2026 at 8:30 PM';

                    return (
                      <div key={t.id || idx} className="w-full md:w-1/2 flex-shrink-0 px-2 sm:px-3 flex">
                        <div className="bg-ivory-50 border border-champagne-300 rounded-3xl p-6 sm:p-8 lg:p-9 shadow-luxury w-full flex flex-col justify-between space-y-5 hover:border-gold-400/80 transition-all duration-300">
                          {/* Rating & Verified Host Badge */}
                          <div className="space-y-3 border-b border-champagne-200 pb-3.5">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center space-x-1">
                                {[...Array(t.rating || 5)].map((_, i) => (
                                  <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-gold-500 text-gold-500" />
                                ))}
                                <span className="ml-1.5 text-xs font-bold text-obsidian-900">5.0 / 5.0</span>
                              </div>

                              <div className="flex items-center space-x-1.5 text-[10px] text-gold-800 bg-gold-500/10 px-2.5 py-0.5 rounded-full border border-gold-500/20">
                                <ShieldCheck className="w-3 h-3 text-gold-700" />
                                <span>Verified Client</span>
                              </div>
                            </div>
                          </div>

                          {/* Quote */}
                          <p className="font-serif text-sm sm:text-base lg:text-lg text-obsidian-900 italic leading-relaxed font-light flex-1">
                            “{t.comment}”
                          </p>

                          {/* Client Metadata, Avatar & Timestamp */}
                          <div className="pt-3.5 border-t border-champagne-200 flex items-center justify-between gap-3">
                            <div className="flex items-center space-x-3">
                              {t.avatarUrl ? (
                                <div className="w-10 h-10 rounded-full overflow-hidden relative border border-gold-400 flex-shrink-0 shadow-sm">
                                  <Image src={t.avatarUrl} alt={t.clientName} fill className="object-cover" sizes="40px" />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gold-500/20 text-gold-800 font-bold flex items-center justify-center text-xs flex-shrink-0">
                                  {t.clientName.charAt(0)}
                                </div>
                              )}
                              <div>
                                <h5 className="font-serif text-xs sm:text-sm font-semibold text-obsidian-950">
                                  {t.clientName}
                                </h5>
                                <p className="text-[11px] text-gold-800 font-medium">{t.clientRole}</p>
                                <p className="text-[10px] text-obsidian-500">{t.eventType}</p>
                              </div>
                            </div>

                            <div className="text-right text-[10px] text-obsidian-400 flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-gold-600" />
                              <span>{formattedDate}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Slider Navigation Arrows */}
              <div className="flex items-center justify-center space-x-4 mt-8">
                <button
                  onClick={() =>
                    setCurrentReviewIndex((prev) => (prev <= 0 ? maxReviewIndex : prev - 1))
                  }
                  className="p-3 rounded-full bg-white border border-champagne-300 text-obsidian-800 hover:bg-gold-500 hover:text-obsidian-950 shadow-sm transition-all hover:scale-105"
                  aria-label="Previous Review"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Bullets */}
                <div className="flex items-center space-x-2">
                  {Array.from({ length: maxReviewIndex + 1 }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentReviewIndex(idx)}
                      className={`transition-all duration-300 rounded-full ${
                        currentReviewIndex === idx ? 'w-8 h-2 bg-gold-600 shadow-sm' : 'w-2 h-2 bg-champagne-300 hover:bg-champagne-400'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() =>
                    setCurrentReviewIndex((prev) => (prev >= maxReviewIndex ? 0 : prev + 1))
                  }
                  className="p-3 rounded-full bg-white border border-champagne-300 text-obsidian-800 hover:bg-gold-500 hover:text-obsidian-950 shadow-sm transition-all hover:scale-105"
                  aria-label="Next Review"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. LUXURY PRIVATE CONSULTATION CTA */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-obsidian-950 text-ivory-50 relative overflow-hidden px-4">
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6 sm:space-y-8">
          <div className="inline-flex items-center space-x-2 text-gold-400 text-[11px] sm:text-xs uppercase tracking-[0.25em] font-semibold border border-gold-500/30 px-4 py-1.5 rounded-full bg-gold-500/5">
            <Crown className="w-3.5 h-3.5" />
            <span>Private Atelier Commissions</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light text-ivory-50 leading-tight">
            Ready to Design Your Unforgettable Celebration?
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-champagne-200/80 font-light max-w-xl mx-auto">
            Our design atelier accepts a limited number of grand commissions each season to ensure uncompromising artistic immersion.
          </p>

          <div className="pt-2">
            <button
              onClick={() => openBookingModal(null)}
              className="px-8 sm:px-10 py-4 sm:py-5 rounded-full bg-gradient-to-r from-gold-500 via-champagne-400 to-gold-500 text-obsidian-950 font-bold text-xs uppercase tracking-[0.25em] shadow-luxury-lg hover:brightness-110 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Book Your Private Consultation
            </button>
          </div>
        </div>
      </section>

      {/* Consultation Modal */}
      <ConsultationModal
        isOpen={consultationOpen}
        onClose={() => setConsultationOpen(false)}
        defaultPackageId={selectedPackageId}
      />
    </div>
  );
}
