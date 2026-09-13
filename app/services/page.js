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
    <div className="bg-ivory-100 text-obsidian-900 pt-28 pb-20">
      {/* Header */}
      <section className="py-16 bg-champagne-50 border-b border-champagne-300/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 text-gold-700 text-xs uppercase tracking-[0.3em] font-semibold">
            <Crown className="w-4 h-4" />
            <span>Comprehensive Scénographie</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl text-obsidian-950 font-light">
            Our Décor Services
          </h1>
          <p className="text-sm sm:text-base text-obsidian-600 max-w-2xl mx-auto font-light leading-relaxed">
            From intimate floral styling to multi-day architectural venue transformations, explore our suite of luxury event capabilities.
          </p>
        </div>
      </section>

      {/* Services List */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="py-20">
            <LuxurySpinner size="lg" text="Loading atelier services..." />
          </div>
        ) : (
          <div className="space-y-24">
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
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center ${
                    isEven ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  {/* Service Image */}
                  <div className={`lg:col-span-6 relative ${isEven ? 'lg:order-2' : ''}`}>
                    <div className="relative h-[400px] sm:h-[480px] rounded-3xl overflow-hidden shadow-luxury-lg border border-champagne-300">
                      <Image
                        src={service.imageUrl}
                        alt={service.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/60 via-transparent to-transparent" />
                    </div>

                    <div className="absolute -bottom-4 left-6 bg-ivory-50/95 backdrop-blur-md border border-champagne-300 px-5 py-2.5 rounded-full shadow-md text-xs font-semibold text-gold-700">
                      Starting at PKR {Number(service.priceStartingAt).toLocaleString()}
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className={`lg:col-span-6 space-y-6 ${isEven ? 'lg:order-1' : ''}`}>
                    <div className="space-y-2">
                      <span className="text-xs uppercase tracking-[0.25em] text-gold-700 font-semibold">
                        0{idx + 1} — Service Offering
                      </span>
                      <h2 className="font-serif text-3xl sm:text-4xl text-obsidian-950 font-light">
                        {service.title}
                      </h2>
                      {service.subtitle && (
                        <p className="text-xs uppercase tracking-wider text-obsidian-500 font-medium">
                          {service.subtitle}
                        </p>
                      )}
                    </div>

                    <p className="text-sm text-obsidian-600 font-light leading-relaxed">
                      {service.description}
                    </p>

                    <div className="space-y-3 pt-2">
                      <p className="text-xs uppercase tracking-widest font-semibold text-obsidian-800">
                        Inclusions & Scope:
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-obsidian-600 font-light">
                        {features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={() => setBookingModalOpen(true)}
                        className="px-8 py-3.5 bg-gradient-to-r from-gold-600 via-gold-500 to-champagne-500 text-obsidian-950 rounded-full font-semibold text-xs uppercase tracking-[0.2em] shadow-md hover:shadow-glow-gold hover:scale-[1.02] transition-all"
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
