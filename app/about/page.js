'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Crown, Award, Compass, HeartHandshake, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-[#070709] text-ivory-50 pt-24 sm:pt-28 pb-16 sm:pb-20 w-full overflow-hidden min-h-screen">
      {/* Header Banner */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-[#0D0D14] via-[#09090D] to-[#070709] border-b border-gold-500/20 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(229,168,59,0.08),transparent_70%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 sm:space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 text-gold-400 text-[11px] sm:text-xs uppercase tracking-[0.3em] font-semibold bg-gold-500/10 px-4 py-1.5 rounded-full border border-gold-500/30">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span>Heritage & Vision</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-ivory-50 font-light tracking-tight">
            The Atelier of Lumière
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-ivory-300 max-w-2xl mx-auto font-light leading-relaxed">
            Founded in 2018, Lumière Decor was born from a singular passion: elevating wedding and event scenography into fine art across Pakistan.
          </p>
        </div>
      </section>

      {/* Story & Creative Director */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 relative">
            <div className="relative h-[380px] sm:h-[500px] rounded-3xl overflow-hidden shadow-luxury-lg border border-gold-500/30">
              <Image
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop"
                alt="Eleanor Vance, Creative Director"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="absolute -bottom-4 -right-2 sm:right-6 bg-[#0E0E14]/95 border border-gold-500/40 text-ivory-50 p-5 rounded-2xl shadow-2xl max-w-xs space-y-1">
              <p className="font-serif text-base sm:text-lg text-gold-400 font-light">Eleanor Vance</p>
              <p className="text-[10px] uppercase tracking-widest text-ivory-400 font-medium">
                Founder & Lead Scénographe
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-5 lg:pl-6">
            <span className="text-xs uppercase tracking-[0.25em] text-gold-400 font-semibold">
              Our Genesis
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl text-ivory-50 font-light leading-tight">
              Where Architecture Meets Botanical Poetry
            </h2>
            <p className="text-xs sm:text-sm text-ivory-300 font-light leading-relaxed">
              We reject formulaic decorations and standard templates. Every celebration is a bespoke narrative that deserves couture design, spatial intelligence, and emotional resonance.
            </p>
            <p className="text-xs sm:text-sm text-ivory-300 font-light leading-relaxed">
              With a background in architectural staging and haute floristry, our team harmonizes structural proportions, color temperature, and sensory scents to create atmospheres that linger in the memory for a lifetime.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gold-500/20">
              <div>
                <span className="font-serif text-3xl font-bold text-gold-gradient">650+</span>
                <p className="text-xs uppercase tracking-wider text-ivory-400 mt-1">
                  Grand Galas & Weddings
                </p>
              </div>
              <div>
                <span className="font-serif text-3xl font-bold text-gold-gradient">100%</span>
                <p className="text-xs uppercase tracking-wider text-ivory-400 mt-1">
                  Bespoke Handcrafted Design
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 sm:py-20 bg-[#09090E] border-y border-gold-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
            <span className="text-xs uppercase tracking-[0.3em] text-gold-400 font-semibold">
              Guiding Principles
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl text-ivory-50 font-light">
              The Four Pillars of Lumière
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Crown,
                title: 'Impeccable Luxury',
                desc: 'We never compromise on material quality, from velvet draping to crystal droplets and rare blooms.',
              },
              {
                icon: Compass,
                title: 'Spatial Harmony',
                desc: 'Décor engineered to complement your venue’s sightlines, natural light, and photographic angles.',
              },
              {
                icon: Award,
                title: 'Flawless Execution',
                desc: 'A dedicated multi-disciplinary crew ensuring exact on-time delivery, rigging, and seamless teardown.',
              },
              {
                icon: HeartHandshake,
                title: 'White-Glove Service',
                desc: 'A deeply collaborative, stress-free relationship where our clients are cherished at every milestone.',
              },
            ].map((pillar) => (
              <div
                key={pillar.title}
                className="festivity-card-dark bg-[#0E0E14] border border-gold-500/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-3.5 hover:border-gold-400 hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-gold-500/15 border border-gold-500/30 text-gold-400 flex items-center justify-center">
                  <pillar.icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg text-ivory-50 font-medium">{pillar.title}</h3>
                <p className="text-xs text-ivory-400 leading-relaxed font-light">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 text-center max-w-4xl mx-auto px-4 space-y-6">
        <h2 className="font-serif text-2xl sm:text-4xl text-ivory-50 font-light">
          Experience the Lumière Difference
        </h2>
        <p className="text-xs sm:text-sm text-ivory-300 font-light max-w-xl mx-auto">
          Let’s craft a visual masterpiece for your upcoming wedding, gala, or milestone celebration.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-gold-500 to-champagne-500 text-obsidian-950 rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-glow-pill transition-all"
        >
          <span>Connect With Our Concierge</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
