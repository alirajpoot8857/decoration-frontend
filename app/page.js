'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '../src/lib/api';
import ConsultationModal from '../src/components/ui/ConsultationModal';
import { useDiscount } from '../src/context/DiscountContext';
import { useTheme } from '../src/context/ThemeContext';
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
  Flame,
  Award,
  ChevronDown,
  HelpCircle,
  Wand2,
  MapPin,
  Sparkle,
} from 'lucide-react';

function AnimatedCounter({ end, duration = 1600, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const targetNum = Number(end) || 0;

    const startCounting = () => {
      if (animatedRef.current) return;
      animatedRef.current = true;

      const startTime = performance.now();

      const update = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Smooth easeOutCubic curve
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(ease * targetNum);
        setCount(current);

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          setCount(targetNum);
        }
      };

      requestAnimationFrame(update);
    };

    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              startCounting();
              observer.disconnect();
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(el);
      return () => observer.disconnect();
    } else {
      startCounting();
    }
  }, [end, duration]);

  return (
    <span ref={elementRef} className="stat-serif-number text-gold-400 font-light inline-block tabular-nums transition-transform duration-300">
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

const HERO_SLIDES = [
  {
    id: 1,
    image: 'https://flowerbouquet.pk/cdn/shop/files/weddingstage.jpg?v=1716522682&width=533',
    badge: 'Premier Lahore Wedding & Stage Décor',
    category: 'Haute Scénographie & Floral Stages',
    title: 'Customized Wedding',
    titleHighlight: 'Stage Décor.',
    quote: '“Transforming Lahore venues into regal wedding palaces with grand floral arches and cinematic lighting.”',
    primaryBtn: { text: 'Explore Gallery', href: '/gallery' },
    secondaryBtn: { text: 'Book Stage Consultation', isModal: true },
  },
  {
    id: 2,
    image: 'https://flowerbouquet.pk/cdn/shop/files/Grand_Mehndi_Celebration_with_Vibrant_Stage_and_Floor_Decor.jpg?v=1737028367&width=533',
    badge: 'Grand Mehndi & Mayun Setups',
    category: 'Vibrant Floral Swings & Floor Art',
    title: 'Grand Mehndi',
    titleHighlight: 'Celebrations.',
    quote: '“Vibrant stages, ornate floor rangoli designs, cozy yellow & red seating, and festive ambiance in Lahore.”',
    primaryBtn: { text: 'View Packages', href: '/packages' },
    secondaryBtn: { text: 'Reserve Mehndi Setup', isModal: true },
  },
  {
    id: 3,
    image: 'https://flowerbouquet.pk/cdn/shop/files/walima_decoration.png?v=1726123619&width=533',
    badge: 'Affordable Walima Luxury',
    category: 'Crystal Chandeliers & Glass Runway',
    title: 'Affordable Walima',
    titleHighlight: 'Luxury in Lahore.',
    quote: '“Grand ballroom metamorphosis with suspended crystal chandeliers, mirrored catwalk, and fresh imported blooms.”',
    primaryBtn: { text: 'Explore Services', href: '/services' },
    secondaryBtn: { text: 'Plan Your Walima', isModal: true },
  },
  {
    id: 4,
    image: 'https://flowerbouquet.pk/cdn/shop/files/Majestic_Mehndi_Swing_Setup_with_Elegant_Drapes.jpg?v=1737027276&width=533',
    badge: 'Hourly & Daily Event Rentals',
    category: 'Floral Swings, Arches & Backdrops',
    title: 'Traditional Swings',
    titleHighlight: '& Themed Corners.',
    quote: '“Traditional hand-carved wooden swings, marigold backdrops, and umbrella-themed decor for your festive events.”',
    primaryBtn: { text: 'Browse Rental Catalog', href: '/rental' },
    secondaryBtn: { text: 'Check Stock & Rates', href: '/rental' },
  },
];

const DEFAULT_SERVICES = [
  {
    id: 'srv-1',
    title: 'Customized Wedding Stage Decorations',
    description: 'Bespoke grand stage architecture, breathtaking fresh flower installations, cinematic intelligent lighting, and complete venue metamorphosis in Lahore.',
    priceStartingAt: 120000,
    imageUrl: 'https://flowerbouquet.pk/cdn/shop/files/weddingstage.jpg?v=1716522682&width=533',
  },
  {
    id: 'srv-2',
    title: 'Grand Mehndi Celebration & Stage Decor',
    description: 'Grand Mehndi decor with a colorful stage, ornate floor designs, cozy seating in yellow and red tones, and detailed lighting for a festive atmosphere.',
    priceStartingAt: 149999,
    imageUrl: 'https://flowerbouquet.pk/cdn/shop/files/Grand_Mehndi_Celebration_with_Vibrant_Stage_and_Floor_Decor.jpg?v=1737028367&width=533',
  },
  {
    id: 'srv-3',
    title: 'Affordable Walima Decoration In Lahore',
    description: 'Walima decoration Lahore featuring imperial crystal chandeliers, mirrored runway, luxury floral arrangements, and stage backdrop.',
    priceStartingAt: 500000,
    imageUrl: 'https://flowerbouquet.pk/cdn/shop/files/walima_decoration.png?v=1726123619&width=533',
  },
  {
    id: 'srv-4',
    title: 'Affordable Barat Decoration In Lahore',
    description: 'Affordable barat decoration In Lahore with grand bridal stage, royal red and gold velvet themes, carved throne seating, and double floral arches.',
    priceStartingAt: 300000,
    imageUrl: 'https://flowerbouquet.pk/cdn/shop/files/7717ce07c2d4c1c90fec292883f1738b.jpg?v=1721887354&width=533',
  },
];

const DEFAULT_PACKAGES = [
  {
    id: 'pkg-1',
    name: 'Affordable Walima Grand Luxury Package',
    tier: 'ROYAL',
    tagline: 'The ultimate royal Walima hall transformation in Lahore.',
    price: 500000,
    isRecommended: true,
    features: [
      '45ft Grand Walima Architectural Stage',
      'Imported Dutch Roses, Hydrangeas & Orchid Canopy',
      'Crystal Chandelier Ceiling Suspensions',
      'Beveled Mirror Catwalk with LED Edge Glow',
      '25 Luxury Guest Table Floral Centerpieces',
      'Senior Creative Director & 15-Person Production Crew',
    ],
  },
  {
    id: 'pkg-2',
    name: 'Affordable Barat Royal Stage Package',
    tier: 'ROYAL',
    tagline: 'Regal red velvet & gold opulence for traditional Barat celebrations.',
    price: 300000,
    isRecommended: false,
    features: [
      '38ft Multi-Tiered Royal Barat Stage Deck',
      'Gold Leaf Carved Bride & Groom Throne Chairs',
      'Double-Ring Floral Moon Gate Archway',
      'Entrance Aisle Floral Pillars with Warm Spotlights',
      '15 High & Low Dining Table Floral Centerpieces',
      'White-Glove Setup & Venue Reset Included',
    ],
  },
  {
    id: 'pkg-3',
    name: 'Grand Mehndi Celebration Package',
    tier: 'SIGNATURE',
    tagline: 'Vibrant colors, ornate floor rangoli & luxury seating.',
    price: 149999,
    isRecommended: true,
    features: [
      '36ft Colorful Mehndi Stage with Floral Framing',
      'Handcrafted Wooden Floral Swing with Silk Drapes',
      'Custom Floor Rangoli & Velvet Bolster Seating',
      'Moroccan Brass Hanging Lanterns & Twinkle Curtains',
      'Henna Lounge Station & Umbrella Backdrops',
    ],
  },
];

const DEFAULT_GALLERY = [
  {
    id: 'gal-1',
    title: 'Customized Wedding Stage Decorations',
    category: 'FLORAL STAGES',
    description: 'Customized Wedding Stage Decorations with grand floral arches and ambient lighting.',
    imageUrl: 'https://flowerbouquet.pk/cdn/shop/files/weddingstage.jpg?v=1716522682&width=533',
  },
  {
    id: 'gal-2',
    title: 'Grand Mehndi Celebration with Vibrant Stage and Floor Decor',
    category: 'MEHNDI SETUPS',
    description: 'Grand Mehndi decor with a colorful stage, ornate floor designs, and cozy seating.',
    imageUrl: 'https://flowerbouquet.pk/cdn/shop/files/Grand_Mehndi_Celebration_with_Vibrant_Stage_and_Floor_Decor.jpg?v=1737028367&width=533',
  },
  {
    id: 'gal-3',
    title: 'Affordable Walima Decoration In Lahore',
    category: 'LUXURY WEDDINGS',
    description: 'Walima decoration Lahore with imperial crystal chandeliers and mirrored runway.',
    imageUrl: 'https://flowerbouquet.pk/cdn/shop/files/walima_decoration.png?v=1726123619&width=533',
  },
  {
    id: 'gal-4',
    title: 'Majestic Mehndi Swing Setup with Elegant Drapes',
    category: 'MEHNDI SETUPS',
    description: 'Traditional wooden swing adorned with colorful drapes and fresh floral arrangements.',
    imageUrl: 'https://flowerbouquet.pk/cdn/shop/files/Majestic_Mehndi_Swing_Setup_with_Elegant_Drapes.jpg?v=1737027276&width=533',
  },
  {
    id: 'gal-5',
    title: 'Enchanting Staircase Decor',
    category: 'ENTRANCE DÉCOR',
    description: 'A grand staircase adorned with a captivating display of vibrant floral garlands and lights.',
    imageUrl: 'https://flowerbouquet.pk/cdn/shop/files/Enchanting_Staircase_Decor.jpg?v=1735215523&width=533',
  },
  {
    id: 'gal-6',
    title: 'Cultural Event Stage Decorations In Lahore',
    category: 'FLORAL STAGES',
    description: 'Cultural Event Stage Decorations In Lahore with authentic Pakistani heritage motifs.',
    imageUrl: 'https://flowerbouquet.pk/cdn/shop/files/7717ce07c2d4c1c90fec292883f1738b.jpg?v=1721887354&width=533',
  },
];

const DEFAULT_TESTIMONIALS = [
  {
    id: 't-1',
    clientName: 'Begum Zara & Daniyal Malik',
    clientRole: 'Bride & Groom (Lahore)',
    eventType: '3-Day Royal Wedding at Royal Palm',
    rating: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
    comment: 'Lumière transformed the entire ballroom into an enchanted palace. The floral ceiling canopy and warm crystal lighting left our 800 guests completely mesmerized. Truly Pakistan’s premier scenography team!',
    createdAt: '2026-08-20T20:30:00.000Z',
  },
  {
    id: 't-2',
    clientName: 'Senator Tariq & Mrs. Mansoor',
    clientRole: 'VIP Hosts (Islamabad)',
    eventType: 'Golden Jubilee Gala at Serena Islamabad',
    rating: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
    comment: 'Unrivaled sophistication and flawless execution. The precision of the 3D model translated impeccably to event day. Every flower variety was fresh, and the crew worked with absolute white-glove professionalism.',
    createdAt: '2026-08-15T19:00:00.000Z',
  },
  {
    id: 't-3',
    clientName: 'Ayesha & Hamza Sheikh',
    clientRole: 'Hosts (Karachi)',
    eventType: 'Luxury Reception at DHA Golf Club',
    rating: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
    comment: 'We reserved the Royal Imperial Splendor package and our expectations were exceeded tenfold! From the gilded Dior chairs to the mirrored stage, every single photo looks straight out of Vogue Weddings.',
    createdAt: '2026-08-10T21:45:00.000Z',
  },
];

const LOOKBOOK_CATEGORIES = ['ALL', 'FLORAL STAGES', 'MEHNDI SETUPS', 'LUXURY WEDDINGS', 'ENTRANCE DÉCOR', 'OUTDOOR DÉCOR'];

const FAQ_ITEMS = [
  {
    question: 'Do you design and execute events across all cities in Pakistan?',
    answer:
      'Yes, absolutely! Our bespoke scenography crews travel and execute turnkey weddings, stages, and galas across Lahore, Islamabad, Karachi, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, Gujranwala, Sialkot, Abbottabad, and luxury destination resorts across Pakistan.',
  },
  {
    question: 'How early should we book our event consultation?',
    answer:
      'To guarantee exclusive artistic dedication and reserve custom floral imports (Holland peonies, South American phalaenopsis orchids), we recommend reserving 4 to 12 weeks in advance for peak wedding season.',
  },
  {
    question: 'Can we customize package themes, stage dimensions, and color schemes?',
    answer:
      'Every package serves as a flexible baseline. During your private 3D design consultation, our scenographers tailor every flower variety, lighting warmth, walkway canopy, and backdrop architecture to fit your exact venue dimensions.',
  },
  {
    question: 'Are hourly and daily luxury furniture rentals available separately?',
    answer:
      'Yes! Through our dedicated Rental Catalog, you can rent gilded Dior chairs, mirrored banquet tables, crystal chandeliers, candelabras, and floral arches by the day or hour with full white-glove setup and teardown.',
  },
];

export default function HomePage() {
  const { isDarkMode } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const heroTimerRef = useRef(null);

  const [packages, setPackages] = useState(DEFAULT_PACKAGES);
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [gallery, setGallery] = useState(DEFAULT_GALLERY);
  const [testimonials, setTestimonials] = useState(DEFAULT_TESTIMONIALS);
  const [loading, setLoading] = useState(false);

  // Lookbook Filter State
  const [selectedGalleryCategory, setSelectedGalleryCategory] = useState('ALL');

  // Before/After Transformation Toggle State
  const [transformationView, setTransformationView] = useState('after'); // 'before' | 'after'

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Reviews Carousel State
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [starRatingFilter, setStarRatingFilter] = useState('ALL');
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
          api.getPackages().catch(() => null),
          api.getServices().catch(() => null),
          api.getGallery({ featured: 'true' }).catch(() => null),
          api.getTestimonials().catch(() => null),
        ]);

        if (pkgRes?.packages && pkgRes.packages.length > 0) setPackages(pkgRes.packages);
        if (srvRes?.services && srvRes.services.length > 0) setServices(srvRes.services);
        if (galRes?.images && galRes.images.length > 0) setGallery(galRes.images.slice(0, 6));
        if (testRes?.testimonials && testRes.testimonials.length > 0) setTestimonials(testRes.testimonials);
      } catch (err) {
        console.warn('Could not refresh home dynamic data:', err);
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

  // Filter gallery lookbook items
  const filteredGallery = useMemo(() => {
    if (selectedGalleryCategory === 'ALL') return gallery;
    const target = selectedGalleryCategory.toLowerCase().replace(/[^a-z0-9]/g, '');
    return gallery.filter((img) => {
      const cat = (img.category || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return cat.includes(target) || target.includes(cat);
    });
  }, [gallery, selectedGalleryCategory]);

  return (
    <div className="bg-[#070709] text-ivory-50 overflow-hidden w-full selection:bg-gold-500 selection:text-obsidian-950">
      {/* ========================================================================= */}
      {/* 1. HERO SLIDER BANNER (Autoplays every 3s with smooth crossfade & animations) */}
      {/* ========================================================================= */}
      <section
        id="hero-section"
        className="relative min-h-[92vh] sm:min-h-[96vh] lg:min-h-screen flex items-center justify-center pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden select-none hero-bg hero-text"
        onMouseEnter={() => setIsHeroPaused(true)}
        onMouseLeave={() => setIsHeroPaused(false)}
      >
        {/* Ambient Subtle Radial Glows (Lightweight & Hardware-Accelerated) */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-radial-gold opacity-20 pointer-events-none z-10" style={{ background: 'radial-gradient(circle, rgba(229,168,59,0.25) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 left-10 w-80 h-80 rounded-full opacity-15 pointer-events-none z-10" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%)' }} />

        {/* Background Slides with Smooth Fade Transitions */}
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover object-center scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#070709]/95 via-[#070709]/80 to-[#070709]/55" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-[#070709]/70" />
            </div>
          );
        })}

        {/* Top Slide 3-Second Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-40">
          <div key={currentSlide} className="h-full bg-gradient-to-r from-gold-500 via-amber-400 to-champagne-400 animate-slide-timer" />
        </div>

        {/* Hero Content Box with Animated Reveal */}
        <div className="max-w-7xl mx-auto relative z-20 w-full py-8 sm:py-12">
          <div key={currentSlide} className="max-w-3xl space-y-5 sm:space-y-6 text-left animate-fadeInUp">
            {/* Live Season Availability & Floating Badge */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="badge-festivity text-sm font-medium px-4 py-1.5 animate-float-slow luxury-badge-glow">
                <Sparkles className="w-4 h-4 text-gold-400 animate-spin-slow" />
                <span>{activeSlideData.badge}</span>
              </div>

              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-medium tracking-wide backdrop-blur-md shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Wedding Season Commissions Open</span>
              </div>
            </div>

            {/* Brand Title & Headline */}
            <div className="space-y-2.5">
              <span className="block text-xs uppercase tracking-[0.35em] font-sans text-gold-400 font-semibold">
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
                  className="btn-festivity-pill px-8 sm:px-10 py-3.5 sm:py-4 text-xs uppercase tracking-[0.2em] shadow-glow-pill text-center flex items-center justify-center space-x-2 transition-all hover:scale-105 active:scale-95 group animate-pulse-glow"
                >
                  <span>{activeSlideData.primaryBtn.text}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
                </button>
              ) : (
                <Link
                  href={activeSlideData.primaryBtn.href}
                  className="btn-festivity-pill px-8 sm:px-10 py-3.5 sm:py-4 text-xs uppercase tracking-[0.2em] shadow-glow-pill text-center flex items-center justify-center space-x-2 transition-all hover:scale-105 active:scale-95 group animate-pulse-glow"
                >
                  <span>{activeSlideData.primaryBtn.text}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
                </Link>
              )}

              {activeSlideData.secondaryBtn.isModal ? (
                <button
                  onClick={() => openBookingModal(null)}
                  className="btn-festivity-outline px-8 sm:px-10 py-3.5 sm:py-4 text-xs uppercase tracking-[0.2em] font-semibold text-ivory-50 hover:text-gold-300 text-center flex items-center justify-center space-x-2 backdrop-blur-md transition-all hover:scale-105 active:scale-95 glow-card-hover"
                >
                  <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                  <span>{activeSlideData.secondaryBtn.text}</span>
                </button>
              ) : (
                <Link
                  href={activeSlideData.secondaryBtn.href}
                  className="btn-festivity-outline px-8 sm:px-10 py-3.5 sm:py-4 text-xs uppercase tracking-[0.2em] font-semibold text-ivory-50 hover:text-gold-300 text-center flex items-center justify-center space-x-2 backdrop-blur-md transition-all hover:scale-105 active:scale-95 glow-card-hover"
                >
                  <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                  <span>{activeSlideData.secondaryBtn.text}</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Carousel Arrow Controls with Ultra-Clear High Contrast Luxury Design */}
        <div className="absolute inset-y-0 left-3 sm:left-6 right-3 sm:right-6 z-30 flex items-center justify-between pointer-events-none dark-preserve">
          <button
            onClick={handlePrevSlide}
            style={{
              backgroundColor: 'rgba(15, 12, 9, 0.85)',
              borderColor: '#E5A83B',
            }}
            className="hero-slider-arrow group pointer-events-auto p-3 sm:p-4 rounded-full backdrop-blur-xl border-2 hover:border-[#FDE68A] hover:!bg-[#E5A83B] transition-all duration-300 hover:scale-110 active:scale-95 shadow-[0_8px_30px_rgba(0,0,0,0.7),0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center dark-preserve"
            aria-label="Previous Slide"
          >
            <ChevronLeft
              style={{ color: '#FBBF24', stroke: '#FBBF24' }}
              className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3.5] text-[#FBBF24] group-hover:!text-[#0A0A0A] group-hover:!stroke-[#0A0A0A] transition-all duration-300 group-hover:-translate-x-0.5"
            />
          </button>
          <button
            onClick={handleNextSlide}
            style={{
              backgroundColor: 'rgba(15, 12, 9, 0.85)',
              borderColor: '#E5A83B',
            }}
            className="hero-slider-arrow group pointer-events-auto p-3 sm:p-4 rounded-full backdrop-blur-xl border-2 hover:border-[#FDE68A] hover:!bg-[#E5A83B] transition-all duration-300 hover:scale-110 active:scale-95 shadow-[0_8px_30px_rgba(0,0,0,0.7),0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center dark-preserve"
            aria-label="Next Slide"
          >
            <ChevronRight
              style={{ color: '#FBBF24', stroke: '#FBBF24' }}
              className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3.5] text-[#FBBF24] group-hover:!text-[#0A0A0A] group-hover:!stroke-[#0A0A0A] transition-all duration-300 group-hover:translate-x-0.5"
            />
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
                    ? 'w-8 sm:w-10 h-2 bg-gradient-to-r from-gold-500 to-amber-400 shadow-glow-pill'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SIGNATURE EXPERIENCE (Scroll Slide-In: Left Card + Right Story) */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 lg:py-32 relative bg-[#0B0B0F] border-t border-gold-500/20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Left Column: Slides in from Left on scroll */}
            <div className="lg:col-span-6 relative scroll-reveal-left">
              <div className="relative h-[360px] sm:h-[480px] lg:h-[540px] w-full rounded-3xl overflow-hidden shadow-2xl border border-gold-500/30 group">
                <Image
                  src={
                    transformationView === 'after'
                      ? 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200&auto=format&fit=crop'
                      : 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop'
                  }
                  alt="Lumière Signature Event Experience"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070709]/80 via-transparent to-transparent" />

                {/* Interactive Before vs After Toggle Chip with Accessible Tablist Semantics */}
                <div role="tablist" aria-label="Venue Transformation View" className="absolute top-4 right-4 z-20 bg-obsidian-950/95 backdrop-blur-md p-1 rounded-full border border-gold-500/50 flex items-center space-x-1 shadow-xl">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={transformationView === 'before'}
                    onClick={() => setTransformationView('before')}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                      transformationView === 'before'
                        ? 'bg-gold-500 text-obsidian-950 shadow-md'
                        : 'text-champagne-300 hover:text-ivory-50 hover:bg-white/10'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Raw Venue</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={transformationView === 'after'}
                    onClick={() => setTransformationView('after')}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                      transformationView === 'after'
                        ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 shadow-md font-bold'
                        : 'text-champagne-300 hover:text-ivory-50 hover:bg-white/10'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Lumière Masterpiece</span>
                  </button>
                </div>
              </div>

              {/* Floating Decorative Highlight Card */}
              <div className="absolute -bottom-5 sm:-bottom-6 right-2 sm:right-6 festivity-card-dark p-4 sm:p-6 rounded-2xl max-w-[260px] sm:max-w-xs space-y-1.5 animate-float-gently">
                <p className="text-xs font-sans tracking-wide text-gold-400 font-semibold">
                  Bespoke Scénographie
                </p>
                <p className="font-serif text-base sm:text-lg text-ivory-50 leading-snug">
                  Curated with rare botanical imports and couture lighting.
                </p>
              </div>
            </div>

            {/* Right Column: Slides in from Right on scroll */}
            <div className="lg:col-span-6 space-y-6 lg:pl-4 pt-4 sm:pt-0 scroll-reveal-right">
              <div className="badge-festivity animate-float-gently">
                <Crown className="w-3.5 h-3.5 text-gold-400" />
                <span>The Signature Philosophy</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-ivory-50 font-light tracking-tight leading-tight">
                EVERY DETAIL <br />
                <span className="italic font-normal text-gold-gradient">HAS A STORY.</span>
              </h2>

              <p className="text-sm sm:text-base text-champagne-200/90 font-light leading-relaxed">
                “Transforming ordinary spaces into unforgettable experiences through flowers, lighting, colors, textures, and custom-designed décor.”
              </p>

              <div className="space-y-3.5 pt-1 text-xs sm:text-sm text-champagne-200/80 font-light">
                <div className="flex items-start space-x-3 group">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-gold-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span>
                    <strong className="font-semibold text-ivory-50">Custom Spatial Architecture:</strong> Every stage, runway, and floral canopy is engineered exclusively for your venue.
                  </span>
                </div>
                <div className="flex items-start space-x-3 group">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-gold-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span>
                    <strong className="font-semibold text-ivory-50">Imported Botanical Freshness:</strong> We source peonies from Holland and rare phalaenopsis orchids from South America.
                  </span>
                </div>
                <div className="flex items-start space-x-3 group">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-gold-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span>
                    <strong className="font-semibold text-ivory-50">Cinematic Lighting:</strong> Dimmable warm intelligent fixtures that create romance on camera and in person.
                  </span>
                </div>
              </div>

              <div className="pt-3">
                <Link
                  href="/about"
                  className="inline-flex items-center space-x-3 text-xs uppercase tracking-[0.2em] font-bold text-gold-400 hover:text-gold-300 border-b border-gold-500/50 pb-1 group transition-all duration-300"
                >
                  <span>Discover Our Story</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2 text-gold-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FOUR ARTISTIC DISCIPLINES (Services with Staggered Scroll Slide-Up) */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 lg:py-32 bg-[#070709] border-y border-gold-500/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-12 sm:mb-16 scroll-reveal">
            <span className="text-xs uppercase tracking-[0.3em] text-gold-400 font-semibold">
              Artistic Disciplines
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-ivory-50 font-light">
              Tailored Event Atmospheres
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-champagne-200/80 font-light">
              Four distinct arenas of décor artistry, executed with exacting precision and unmatched creative vision.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {services.map((service, idx) => (
              <Link
                key={service.id || service.title}
                href="/services"
                className={`festivity-card-dark festivity-hover-card glow-card-hover overflow-hidden flex flex-col justify-between group cursor-pointer block scroll-reveal delay-${
                  (idx + 1) * 100
                }`}
              >
                {/* Card Image */}
                <div className="relative h-60 sm:h-64 w-full overflow-hidden bg-obsidian-900">
                  <Image
                    src={service.imageUrl}
                    alt={service.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E12] via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-300" />
                  <span className="absolute top-4 left-4 bg-obsidian-950/80 backdrop-blur-md text-gold-400 text-xs uppercase tracking-widest font-semibold px-3 py-1 rounded-full border border-gold-500/30">
                    0{idx + 1}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-serif text-lg sm:text-xl text-ivory-50 font-medium group-hover:text-gold-400 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs text-champagne-200/80 leading-relaxed font-light line-clamp-3">
                      {service.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gold-500/20 flex items-end justify-between gap-2">
                    <div className="min-w-0">
                      <span className="block text-[10px] uppercase tracking-wider text-champagne-400 font-medium leading-none mb-1 whitespace-nowrap">
                        Starting from
                      </span>
                      <span className="text-xs sm:text-sm text-gold-400 font-mono font-bold whitespace-nowrap">
                        PKR {service.priceStartingAt?.toLocaleString() || '25,000'}
                      </span>
                    </div>

                    <span className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-wider font-bold text-gold-400 group-hover:text-gold-300 border-b border-gold-500/60 group-hover:border-gold-300 pb-0.5 transition-all duration-300 whitespace-nowrap shrink-0">
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 text-gold-400 group-hover:text-gold-300" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FOUR-STEP JOURNEY (Sequential Scroll Slide-In) */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 lg:py-32 bg-[#0B0B0F] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-14 sm:mb-20 scroll-reveal">
            <span className="text-xs uppercase tracking-[0.3em] text-gold-400 font-semibold">
              The Journey
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-ivory-50 font-light">
              From Vision to Splendor
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-champagne-200/80 font-light">
              Our seamless, white-glove process guarantees peace of mind while we bring your grandest celebration to life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative">
            <div className="hidden lg:block absolute top-12 left-16 right-16 h-[2px] bg-gradient-to-r from-gold-500/30 via-gold-500 to-gold-500/30 z-0 animate-pulse" />

            {[
              {
                step: '01',
                title: 'Consultation',
                subtitle: 'Share your vision with us.',
                description: 'We sit down over champagne to uncover your color palette, architectural aesthetic, and desires.',
              },
              {
                step: '02',
                title: 'Concept & 3D Design',
                subtitle: 'We draft your bespoke concept.',
                description: 'Our scenographers draft moodboards, 3D spatial models, and floral palette schemes tailored to your venue.',
              },
              {
                step: '03',
                title: 'Production & Setup',
                subtitle: 'Our crew transforms your venue.',
                description: 'A master floral and lighting crew handles precision structural rigging, staging, and styling on event day.',
              },
              {
                step: '04',
                title: 'Celebrate & Immerse',
                subtitle: 'You enjoy every single moment.',
                description: 'Bask in timeless photographs with loved ones, knowing our coordination and teardown team manages every detail.',
              },
            ].map((p, idx) => (
              <div
                key={p.step}
                className={`relative z-10 festivity-card-dark festivity-hover-card p-6 sm:p-8 flex flex-col justify-between group scroll-reveal delay-${
                  (idx + 1) * 100
                }`}
              >
                <div>
                  <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-gold-500 to-amber-500 text-obsidian-950 rounded-2xl flex items-center justify-center font-serif text-lg sm:text-xl font-bold shadow-glow-pill mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    {p.step}
                  </div>

                  <h3 className="font-serif text-lg sm:text-xl text-ivory-50 font-medium mb-1 group-hover:text-gold-400 transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-xs font-semibold text-gold-400 tracking-wide mb-2.5">
                    {p.subtitle}
                  </p>
                  <p className="text-xs text-champagne-200/80 leading-relaxed font-light">
                    {p.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. PACKAGES SECTION (Scale Slide-In with Promo Discount Integration) */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 lg:py-32 bg-[#070709] border-t border-gold-500/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-12 sm:mb-16 scroll-reveal">
            <span className="text-xs uppercase tracking-[0.3em] text-gold-400 font-semibold">
              Curated Collections
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-ivory-50 font-light">
              Signature Décor Packages
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-champagne-200/80 font-light">
              Select from our signature collections or book a private consultation for fully custom spatial architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {packages.slice(0, 3).map((pkg, idx) => {
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
                  className={`relative rounded-3xl p-6 sm:p-8 lg:p-10 flex flex-col justify-between festivity-hover-card glow-card-hover transition-all duration-300 scroll-reveal-scale delay-${
                    (idx + 1) * 150
                  } ${
                    isRec
                      ? 'bg-[#121218] text-ivory-50 border-2 border-gold-500 shadow-glow-pill'
                      : 'bg-[#0E0E14] text-ivory-50 border border-gold-500/30 hover:border-gold-500/70 shadow-2xl'
                  }`}
                >
                  {isRec && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 font-bold text-[10px] uppercase tracking-[0.25em] px-4 py-1.5 rounded-full shadow-glow-pill animate-beacon">
                      ★ Most Recommended
                    </div>
                  )}

                  <div>
                    <div className="space-y-2 mb-6">
                      <span
                        className={`text-xs uppercase tracking-wider font-semibold ${
                          isRec ? 'text-gold-400' : 'text-gold-500'
                        }`}
                      >
                        {pkg.tier} Collection
                      </span>
                      <h3 className="font-serif text-2xl sm:text-3xl font-light text-ivory-50">
                        {pkg.name}
                      </h3>
                      <p className="text-xs font-light leading-relaxed text-champagne-200/80">
                        {pkg.tagline || pkg.description}
                      </p>
                    </div>

                    <div className="py-4 sm:py-5 border-y border-gold-500/20 mb-6">
                      {hasDiscount ? (
                        <div className="space-y-1">
                          <div className="flex items-baseline space-x-2">
                            <span className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient">
                              PKR {discountedPrice.toLocaleString()}
                            </span>
                            <span className="text-sm line-through text-champagne-400/50">
                              PKR {Number(pkg.price).toLocaleString()}
                            </span>
                            <span className="text-xs text-champagne-300/70">
                              / complete setup
                            </span>
                          </div>
                          <span className="inline-block text-xs font-bold text-gold-400 uppercase tracking-wider">
                            🎉 Includes {effectiveDiscount}% Seasonal Discount
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-baseline space-x-2">
                          <span className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient">
                            PKR {Number(pkg.price).toLocaleString()}
                          </span>
                          <span className="text-xs text-champagne-300/70">
                            / complete setup
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 mb-8">
                      <p className="text-xs uppercase tracking-wider font-semibold text-gold-400 flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Included Highlights:</span>
                      </p>
                      <ul className="space-y-2 text-xs font-light">
                        {features.slice(0, 4).map((feat, i) => (
                          <li key={i} className="flex items-start space-x-2 p-1.5 rounded-lg bg-white/[0.02] border border-white/5">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-gold-400" />
                            <span className="text-champagne-100 font-normal leading-tight">
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
                        ? 'btn-festivity-pill shadow-glow-pill text-obsidian-950 font-bold'
                        : 'btn-festivity-outline text-ivory-50 hover:text-gold-300'
                    }`}
                  >
                    Reserve {pkg.tier ? `${pkg.tier} Tier` : 'Package'}
                  </button>
                </div>
              );
            })}
          </div>

          {packages.length > 3 && (
            <div className="text-center mt-6 sm:mt-8">
              <Link
                href="/packages"
                className="btn-festivity-outline px-8 py-3 text-xs uppercase tracking-wider font-semibold hover:border-gold-400"
              >
                <span>View All {packages.length} Décor Collections</span>
                <Sparkles className="w-4 h-4 ml-2" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. SIGNATURE MARQUEE STRIP (HAUTE EVENT PRODUCTION BANNER) */}
      {/* ========================================================================= */}
      <div className="bg-obsidian-950 text-ivory-50 py-4 sm:py-5 border-y border-gold-500/30 overflow-hidden select-none relative z-10 scroll-reveal">
        <div className="animate-marquee-infinite">
          <div className="flex items-center space-x-8 text-xs sm:text-sm uppercase tracking-[0.3em] font-serif text-champagne-200 pr-8">
            <span className="text-gold-400 font-bold">★ GREAT EVENTS COME TO LIFE</span>
            <span className="text-gold-600/50">•</span>
            <span>BESPOKE STAGE ARCHITECTURE</span>
            <span className="text-gold-600/50">•</span>
            <span className="text-gold-400 font-bold">HAUTE FLORAL SCÉNOGRAPHIE</span>
            <span className="text-gold-600/50">•</span>
            <span>UNFORGETTABLE LUXURY CELEBRATIONS</span>
            <span className="text-gold-600/50">•</span>
            <span className="text-gold-400 font-bold">PRESTIGE WEDDINGS & GALAS</span>
            <span className="text-gold-600/50">•</span>
            <span>HOUR-BY-HOUR WHITE GLOVE RENTALS</span>
            <span className="text-gold-600/50">•</span>
            <span className="text-gold-400 font-bold">CREATING MASTERPIECES SINCE 2018</span>
            <span className="text-gold-600/50">•</span>
          </div>
          <div className="flex items-center space-x-8 text-xs sm:text-sm uppercase tracking-[0.3em] font-serif text-champagne-200 pr-8" aria-hidden="true">
            <span className="text-gold-400 font-bold">★ GREAT EVENTS COME TO LIFE</span>
            <span className="text-gold-600/50">•</span>
            <span>BESPOKE STAGE ARCHITECTURE</span>
            <span className="text-gold-600/50">•</span>
            <span className="text-gold-400 font-bold">HAUTE FLORAL SCÉNOGRAPHIE</span>
            <span className="text-gold-600/50">•</span>
            <span>UNFORGETTABLE LUXURY CELEBRATIONS</span>
            <span className="text-gold-600/50">•</span>
            <span className="text-gold-400 font-bold">PRESTIGE WEDDINGS & GALAS</span>
            <span className="text-gold-600/50">•</span>
            <span>HOUR-BY-HOUR WHITE GLOVE RENTALS</span>
            <span className="text-gold-600/50">•</span>
            <span className="text-gold-400 font-bold">CREATING MASTERPIECES SINCE 2018</span>
            <span className="text-gold-600/50">•</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. REPUTATION & PROVEN IMPACT COUNTER METRICS */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-20 bg-obsidian-950 text-ivory-50 border-b border-gold-500/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 text-center">
            <div className="space-y-1.5 p-5 rounded-2xl festivity-card-dark stat-card-hover border border-white/10 hover:border-gold-500/50 transition-all scroll-reveal delay-100">
              <div className="stat-serif-number text-gold-400 font-light">
                <AnimatedCounter end={98} suffix="%" />
              </div>
              <p className={`text-xs uppercase tracking-wider ${isDarkMode ? 'text-champagne-300' : 'text-[#3D352A]'} font-semibold`}>
                Delighted Hosts
              </p>
            </div>
            <div className="space-y-1.5 p-5 rounded-2xl festivity-card-dark stat-card-hover border border-white/10 hover:border-gold-500/50 transition-all scroll-reveal delay-200">
              <div className="stat-serif-number text-gold-400 font-light">
                <AnimatedCounter end={65} suffix="+" />
              </div>
              <p className={`text-xs uppercase tracking-wider ${isDarkMode ? 'text-champagne-300' : 'text-[#3D352A]'} font-semibold`}>
                Grand Galas Produced
              </p>
            </div>
            <div className="space-y-1.5 p-5 rounded-2xl festivity-card-dark stat-card-hover border border-white/10 hover:border-gold-500/50 transition-all scroll-reveal delay-300">
              <div className="stat-serif-number text-gold-400 font-light">
                <AnimatedCounter end={10} suffix="+" />
              </div>
              <p className={`text-xs uppercase tracking-wider ${isDarkMode ? 'text-champagne-300' : 'text-[#3D352A]'} font-semibold`}>
                Years of Haute Artistry
              </p>
            </div>
            <div className="space-y-1.5 p-5 rounded-2xl festivity-card-dark stat-card-hover border border-white/10 hover:border-gold-500/50 transition-all scroll-reveal delay-400">
              <div className="stat-serif-number text-gold-400 font-light">
                <AnimatedCounter end={15} />
              </div>
              <p className={`text-xs uppercase tracking-wider ${isDarkMode ? 'text-champagne-300' : 'text-[#3D352A]'} font-semibold`}>
                Design Accolades
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. MASONRY GALLERY HIGHLIGHTS WITH INTERACTIVE CATEGORY TABS */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 lg:py-32 bg-[#0B0B0F] border-t border-gold-500/20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12 scroll-reveal">
            <div className="space-y-2 sm:space-y-3">
              <span className="text-xs uppercase tracking-[0.3em] text-gold-400 font-semibold">
                Visual Lookbook
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-ivory-50 font-light">
                Events & Signature Parties
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
                {LOOKBOOK_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedGalleryCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all shrink-0 ${
                      selectedGalleryCategory === cat
                        ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 font-bold shadow-glow-pill scale-105'
                        : 'bg-white/[0.05] text-champagne-300 hover:text-gold-300 hover:bg-white/10 border border-gold-500/20'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <Link
                href="/gallery"
                className="btn-festivity-pill px-4 py-2 text-xs uppercase tracking-wider font-bold shrink-0"
              >
                <span>View Full Lookbook (150+)</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredGallery.map((img, idx) => (
              <Link
                key={img.id || idx}
                href={`/gallery?category=${encodeURIComponent(img.category || 'All')}`}
                className={`group relative h-72 sm:h-80 lg:h-96 rounded-3xl overflow-hidden shadow-2xl border border-gold-500/30 bg-obsidian-950 hover:border-gold-500 hover:scale-[1.02] transition-all duration-300 festivity-hover-card block cursor-pointer scroll-reveal delay-${
                  ((idx % 3) + 1) * 100
                }`}
              >
                <Image
                  src={img.imageUrl}
                  alt={img.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070709]/95 via-[#070709]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 sm:p-6 text-ivory-50">
                  <span className="text-xs uppercase tracking-wider text-gold-400 font-semibold mb-1">
                    {img.category}
                  </span>
                  <h3 className="font-serif text-base sm:text-lg font-light text-ivory-50 group-hover:text-gold-300 transition-colors whitespace-normal leading-snug">
                    {img.title}
                  </h3>
                  <p className="text-xs text-champagne-200/80 line-clamp-2 mt-1 font-light">
                    {img.description}
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-gold-500/30 flex items-center justify-between text-xs uppercase tracking-widest text-gold-400 font-bold group-hover:text-gold-300 transition-colors">
                    <span>VIEW COMMISSION</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. CLIENT TESTIMONIALS SLIDER / CAROUSEL WITH DYNAMIC STAR FILTER */}
      {/* ========================================================================= */}
      <section
        className="py-16 sm:py-24 lg:py-32 bg-[#070709] border-t border-gold-500/20 overflow-hidden"
        onMouseEnter={() => setIsReviewPaused(true)}
        onMouseLeave={() => setIsReviewPaused(false)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-14 space-y-4 sm:space-y-0 scroll-reveal">
            <div className="space-y-2 sm:space-y-3">
              <span className="text-xs uppercase tracking-[0.3em] text-gold-400 font-semibold">
                Words of Praise & Verified Reflections
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-ivory-50 font-light">
                Reflections of Delighted Hosts
              </h2>
            </div>

            {/* Dynamic Star Rating Filter */}
            <div className="flex items-center space-x-2 bg-white/[0.06] border border-gold-500/30 p-1 rounded-full shadow-sm">
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
                      ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 font-bold shadow-glow-pill'
                      : 'text-champagne-200 hover:text-gold-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filteredTestimonials.length === 0 ? (
            <div className="p-12 text-center text-champagne-300/70 festivity-card-dark">
              No reviews match the selected rating filter.
            </div>
          ) : (
            <div className="relative scroll-reveal">
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
                        <div className="festivity-card-dark festivity-hover-card p-6 sm:p-8 lg:p-9 w-full flex flex-col justify-between space-y-5">
                          {/* Rating & Verified Host Badge */}
                          <div className="space-y-3 border-b border-gold-500/20 pb-3.5">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center space-x-1">
                                {[...Array(t.rating || 5)].map((_, i) => (
                                  <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-gold-400 text-gold-400" />
                                ))}
                                <span className="ml-1.5 text-xs font-bold text-gold-400">5.0 / 5.0</span>
                              </div>

                              <div className="badge-festivity text-xs py-0.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
                                <span>Verified Client</span>
                              </div>
                            </div>
                          </div>

                          {/* Quote */}
                          <p className="font-serif text-sm sm:text-base lg:text-lg text-champagne-100 italic leading-relaxed font-light flex-1">
                            “{t.comment}”
                          </p>

                          {/* Client Metadata, Avatar & Timestamp */}
                          <div className="pt-3.5 border-t border-gold-500/20 flex items-center justify-between gap-3">
                            <div className="flex items-center space-x-3">
                              {t.avatarUrl ? (
                                <div className="w-10 h-10 rounded-full overflow-hidden relative border border-gold-400 flex-shrink-0 shadow-sm">
                                  <Image src={t.avatarUrl} alt={t.clientName} fill className="object-cover" sizes="40px" />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gold-500/20 text-gold-400 font-bold flex items-center justify-center text-xs flex-shrink-0 border border-gold-500/40">
                                  {t.clientName.charAt(0)}
                                </div>
                              )}
                              <div>
                                <h3 className="font-serif text-sm sm:text-base font-semibold text-ivory-50">
                                  {t.clientName}
                                </h3>
                                <p className="text-xs text-gold-400 font-medium">{t.clientRole}</p>
                                <p className="text-xs text-champagne-300/80">{t.eventType}</p>
                              </div>
                            </div>

                            <div className="text-right text-xs text-champagne-400/70 flex items-center space-x-1">
                              <Clock className="w-3.5 h-3.5 text-gold-400" />
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
                  className="p-3 rounded-full bg-white/[0.06] border border-gold-500/30 text-gold-400 hover:bg-gold-500 hover:text-obsidian-950 shadow-sm transition-all hover:scale-110 active:scale-95"
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
                        currentReviewIndex === idx ? 'w-8 h-2 bg-gold-500 shadow-glow-pill' : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() =>
                    setCurrentReviewIndex((prev) => (prev >= maxReviewIndex ? 0 : prev + 1))
                  }
                  className="p-3 rounded-full bg-white/[0.06] border border-gold-500/30 text-gold-400 hover:bg-gold-500 hover:text-obsidian-950 shadow-sm transition-all hover:scale-110 active:scale-95"
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
      {/* 10. FREQUENTLY ASKED QUESTIONS (HAUTE ACCORDION with Scroll Slide-Up) */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 bg-[#0B0B0F] border-t border-gold-500/20 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12 scroll-reveal">
            <span className="text-xs uppercase tracking-[0.3em] text-gold-400 font-semibold">
              Curated Answers
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl text-ivory-50 font-light">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3.5">
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`festivity-card-dark rounded-2xl overflow-hidden border border-gold-500/30 transition-all duration-300 scroll-reveal delay-${
                    (idx + 1) * 100
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-5 sm:p-6 flex items-center justify-between space-x-4 group"
                  >
                    <span className={`font-serif text-sm sm:text-base ${isDarkMode ? 'text-ivory-50 group-hover:text-gold-300' : 'text-[#141210] group-hover:text-gold-700'} font-semibold transition-colors`}>
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gold-400 shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className={`px-5 sm:px-6 pb-5 sm:pb-6 text-xs sm:text-sm ${isDarkMode ? 'text-champagne-200/90' : 'text-[#2D251C] font-normal'} leading-relaxed border-t border-gold-500/15 pt-3 animate-fadeInUp`}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. LUXURY PRIVATE CONSULTATION CTA (FESTIVITY SIGNATURE CTA) */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 bg-[#0B0B0E] text-ivory-50 relative overflow-hidden px-4 border-t border-gold-500/20 scroll-reveal">
        {/* Background Ambient Glow Halo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[600px] h-96 sm:h-[600px] rounded-full bg-gradient-to-r from-gold-500/15 via-amber-500/10 to-transparent blur-3xl pointer-events-none animate-glow-pulse" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6 sm:space-y-8">
          <div className="badge-festivity animate-float-gently">
            <Crown className="w-3.5 h-3.5 text-gold-400" />
            <span>Private Atelier Commissions</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light text-ivory-50 leading-tight">
            Let’s bring your vision to life <br />
            <span className="font-serif italic font-normal text-gold-gradient">together now!</span>
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-champagne-200/80 font-light max-w-xl mx-auto leading-relaxed">
            Our design atelier accepts a limited number of grand commissions each season to ensure uncompromising artistic immersion across Pakistan.
          </p>

          <div className="pt-3">
            <button
              onClick={() => openBookingModal(null)}
              className="btn-festivity-pill px-10 sm:px-14 py-4 sm:py-5 text-xs sm:text-sm uppercase tracking-[0.22em] font-bold shadow-glow-pill inline-flex items-center space-x-3 transition-all hover:scale-105 active:scale-95"
            >
              <span>Book Your Private Consultation</span>
              <ArrowRight className="w-4 h-4" />
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
