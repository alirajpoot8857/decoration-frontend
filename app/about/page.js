'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Crown, Award, Compass, HeartHandshake, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-ivory-100 text-obsidian-900 pt-28 pb-20">
      {/* Header Banner */}
      <section className="py-16 bg-champagne-50 border-b border-champagne-300/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 text-gold-700 text-xs uppercase tracking-[0.3em] font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Heritage & Vision</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl text-obsidian-950 font-light">
            The Atelier of Lumière
          </h1>
          <p className="text-sm sm:text-base text-obsidian-600 max-w-2xl mx-auto font-light leading-relaxed">
            Founded in 2018, Lumière Decor was born from a singular passion: elevating event scenography into fine art.
          </p>
        </div>
      </section>

      {/* Story & Creative Director */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative">
            <div className="relative h-[520px] rounded-3xl overflow-hidden shadow-luxury-lg border border-champagne-300">
              <Image
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop"
                alt="Eleanor Vance, Creative Director"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="absolute -bottom-6 -right-4 sm:right-6 bg-obsidian-950 text-ivory-50 p-6 rounded-2xl shadow-luxury max-w-xs space-y-1">
              <p className="font-serif text-lg text-gold-400 font-light">Eleanor Vance</p>
              <p className="text-[10px] uppercase tracking-widest text-champagne-300 font-medium">
                Founder & Lead Scénographe
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6 lg:pl-6">
            <span className="text-xs uppercase tracking-[0.25em] text-gold-700 font-semibold">
              Our Genesis
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-obsidian-950 font-light leading-tight">
              Where Architecture Meets Botanical Poetry
            </h2>
            <p className="text-sm text-obsidian-600 font-light leading-relaxed">
              We reject formulaic decorations and standard templates. Every celebration is a bespoke narrative that deserves couture design, spatial intelligence, and emotional resonance.
            </p>
            <p className="text-sm text-obsidian-600 font-light leading-relaxed">
              With a background in European architectural design and haute floristry, our team harmonizes structural proportions, color temperature, and sensory scents to create atmospheres that linger in the memory for a lifetime.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-champagne-200">
              <div>
                <span className="font-serif text-3xl font-bold text-gold-700">650+</span>
                <p className="text-xs uppercase tracking-wider text-obsidian-500 mt-1">
                  Grand Galas & Weddings
                </p>
              </div>
              <div>
                <span className="font-serif text-3xl font-bold text-gold-700">100%</span>
                <p className="text-xs uppercase tracking-wider text-obsidian-500 mt-1">
                  Bespoke Handcrafted Design
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-champagne-50/60 border-y border-champagne-300/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase tracking-[0.3em] text-gold-700 font-semibold">
              Guiding Principles
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-obsidian-950 font-light">
              The Four Pillars of Lumière
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                className="bg-ivory-50 border border-champagne-300 rounded-3xl p-8 shadow-luxury space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-gold-500/10 text-gold-600 flex items-center justify-center">
                  <pillar.icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg text-obsidian-900 font-medium">{pillar.title}</h3>
                <p className="text-xs text-obsidian-600 leading-relaxed font-light">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center max-w-4xl mx-auto px-4 space-y-6">
        <h2 className="font-serif text-3xl sm:text-4xl text-obsidian-950 font-light">
          Experience the Lumière Difference
        </h2>
        <p className="text-sm text-obsidian-600 font-light max-w-xl mx-auto">
          Let’s craft a visual masterpiece for your upcoming gala, wedding, or milestone celebration.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center space-x-3 px-8 py-4 bg-obsidian-900 text-ivory-50 rounded-full text-xs uppercase tracking-[0.2em] hover:bg-gold-600 transition-colors shadow-luxury"
        >
          <span>Connect With Our Concierge</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
