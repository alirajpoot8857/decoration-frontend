'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import api from '../../src/lib/api';
import ConsultationModal from '../../src/components/ui/ConsultationModal';
import LuxurySpinner from '../../src/components/ui/LuxurySpinner';
import { Sparkles, CheckCircle2, ArrowRight, Crown } from 'lucide-react';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.getServices();
        if (res.services) setServices(res.services);
      } catch (err) {
        console.warn('Failed to load services:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="bg-[#070709] text-ivory-50 pt-24 sm:pt-28 pb-16 sm:pb-20 w-full overflow-hidden min-h-screen">
      {/* Header */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-[#0D0D14] via-[#09090D] to-[#070709] border-b border-gold-500/20 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(229,168,59,0.08),transparent_70%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 sm:space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 text-gold-400 text-[11px] sm:text-xs uppercase tracking-[0.3em] font-semibold bg-gold-500/10 px-4 py-1.5 rounded-full border border-gold-500/30">
            <Crown className="w-4 h-4 text-gold-400" />
            <span>Comprehensive Scénographie</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-ivory-50 font-light tracking-tight">
            Our Décor Services
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-ivory-300 max-w-2xl mx-auto font-light leading-relaxed">
            From intimate floral styling to multi-day architectural venue transformations, explore our suite of luxury event capabilities across Pakistan.
          </p>
        </div>
      </section>

      {/* Services List */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="py-20">
            <LuxurySpinner size="lg" text="Loading atelier services..." />
          </div>
        ) : (
          <div className="space-y-16 sm:space-y-24">
            {services.map((service, idx) => {
              const isEven = idx % 2 === 1;
              const features = Array.isArray(service.features)
                ? service.features
                : typeof service.features === 'string'
                ? JSON.parse(service.features || '[]')
                : [];

              return (
                <div
                  key={service.id}
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center p-6 sm:p-8 rounded-3xl bg-[#0C0C12] border border-gold-500/20 shadow-2xl ${
                    isEven ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  {/* Service Image */}
                  <div className={`lg:col-span-6 relative ${isEven ? 'lg:order-2' : ''}`}>
                    <div className="relative h-[300px] sm:h-[420px] rounded-2xl overflow-hidden shadow-luxury-lg border border-gold-500/30">
                      <Image
                        src={service.imageUrl}
                        alt={service.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-transparent to-transparent" />
                    </div>

                    <div className="absolute -bottom-3 left-4 sm:left-6 bg-[#08080C]/95 backdrop-blur-md border border-gold-500/40 px-4 sm:px-5 py-2 rounded-full shadow-lg text-[11px] sm:text-xs font-semibold text-gold-400">
                      Starting at PKR {Number(service.priceStartingAt).toLocaleString()}
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className={`lg:col-span-6 space-y-4 sm:space-y-6 ${isEven ? 'lg:order-1' : ''}`}>
                    <div className="space-y-1.5">
                      <span className="text-xs uppercase tracking-[0.25em] text-gold-400 font-semibold">
                        0{idx + 1} — Atelier Capability
                      </span>
                      <h2 className="font-serif text-2xl sm:text-4xl text-ivory-50 font-light">
                        {service.title}
                      </h2>
                      {service.subtitle && (
                        <p className="text-xs uppercase tracking-wider text-ivory-400 font-medium">
                          {service.subtitle}
                        </p>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-ivory-300 font-light leading-relaxed">
                      {service.description}
                    </p>

                    <div className="space-y-2.5 pt-1">
                      <p className="text-xs uppercase tracking-widest font-semibold text-gold-400">
                        Inclusions & Scope:
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-ivory-200 font-light">
                        {features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3">
                      <button
                        onClick={() => setBookingModalOpen(true)}
                        className="px-6 sm:px-8 py-3 bg-gradient-to-r from-gold-500 to-champagne-500 text-obsidian-950 rounded-full font-bold text-xs uppercase tracking-[0.2em] shadow-md hover:brightness-110 hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        Request Bespoke Quote
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <ConsultationModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
      />
    </div>
  );
}
