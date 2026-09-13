'use client';

import React, { useState, useEffect } from 'react';
import api from '../../src/lib/api';
import ConsultationModal from '../../src/components/ui/ConsultationModal';
import { useDiscount } from '../../src/context/DiscountContext';
import LuxurySpinner from '../../src/components/ui/LuxurySpinner';
import { Crown, CheckCircle2, Sparkles, HelpCircle, Tag } from 'lucide-react';

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [consultationOpen, setConsultationOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState(null);

  const { effectiveDiscount, calculateDiscount } = useDiscount();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await api.getPackages();
        if (res.packages) setPackages(res.packages);
      } catch (err) {
        console.warn('Failed to load packages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const handleBook = (pkgId) => {
    setSelectedPackageId(pkgId);
    setConsultationOpen(true);
  };

  return (
    <div className="bg-ivory-100 text-obsidian-900 pt-24 sm:pt-28 pb-16 sm:pb-20 w-full overflow-hidden">
      {/* Header Banner */}
      <section className="py-12 sm:py-16 bg-champagne-50 border-b border-champagne-300/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 sm:space-y-4">
          <div className="inline-flex items-center space-x-2 text-gold-700 text-[11px] sm:text-xs uppercase tracking-[0.3em] font-semibold">
            <Crown className="w-4 h-4" />
            <span>Investment & Collections</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-obsidian-950 font-light">
            Décor Collections & Pricing
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-obsidian-600 max-w-2xl mx-auto font-light leading-relaxed">
            Transparent investment tiers crafted for intimate celebrations, complete luxury weddings, and royal galas.
          </p>
        </div>
      </section>

      {/* Packages Grid with Rich Hover Effects */}
      <section className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="py-20">
            <LuxurySpinner size="lg" text="Loading collections & investment tiers..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
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
                        {pkg.tier} TIER
                      </span>
                      <h3 className="font-serif text-2xl sm:text-3xl font-light">{pkg.name}</h3>
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
                        Package Scope & Inclusions:
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
                    onClick={() => handleBook(pkg.id)}
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
        )}
      </section>

      <ConsultationModal
        isOpen={consultationOpen}
        onClose={() => setConsultationOpen(false)}
        defaultPackageId={selectedPackageId}
      />
    </div>
  );
}
