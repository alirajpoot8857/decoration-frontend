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
    <div className="bg-[#070709] text-ivory-50 pt-24 sm:pt-28 pb-16 sm:pb-20 w-full overflow-hidden min-h-screen">
      {/* Header Banner */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-[#0D0D14] via-[#09090D] to-[#070709] border-b border-gold-500/20 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(229,168,59,0.08),transparent_70%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 sm:space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 text-gold-400 text-[11px] sm:text-xs uppercase tracking-[0.3em] font-semibold bg-gold-500/10 px-4 py-1.5 rounded-full border border-gold-500/30">
            <Crown className="w-4 h-4 text-gold-400" />
            <span>Investment & Collections</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-ivory-50 font-light tracking-tight">
            Décor Collections & Pricing
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-ivory-300 max-w-2xl mx-auto font-light leading-relaxed">
            Transparent investment tiers crafted for intimate celebrations, complete luxury Pakistani weddings, and royal galas.
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
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
                  className={`festivity-card-dark relative rounded-3xl p-6 sm:p-8 lg:p-10 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 ${
                    isRec
                      ? 'bg-gradient-to-b from-[#14141E] to-[#0A0A0F] text-ivory-50 border-2 border-gold-500 shadow-glow-gold'
                      : 'bg-[#0E0E14] text-ivory-50 border border-gold-500/30 hover:border-gold-400 hover:shadow-2xl'
                  }`}
                >
                  {isRec && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-gold-500 to-champagne-500 text-obsidian-950 font-bold text-[10px] uppercase tracking-[0.25em] px-4 py-1.5 rounded-full shadow-lg">
                      ★ Most Recommended
                    </div>
                  )}

                  <div>
                    <div className="space-y-2 mb-6">
                      <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-gold-400">
                        {pkg.tier} TIER
                      </span>
                      <h3 className="font-serif text-2xl sm:text-3xl font-light text-ivory-50">{pkg.name}</h3>
                      <p className="text-xs font-light leading-relaxed text-ivory-300">
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
                            <span className="text-sm line-through text-ivory-500">
                              PKR {Number(pkg.price).toLocaleString()}
                            </span>
                            <span className="text-xs text-ivory-400">
                              / complete setup
                            </span>
                          </div>
                          <span className="inline-block text-[10px] font-bold text-gold-400 uppercase tracking-wider">
                            🎉 Includes {effectiveDiscount}% Seasonal Discount
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-baseline space-x-2">
                          <span className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient">
                            PKR {Number(pkg.price).toLocaleString()}
                          </span>
                          <span className="text-xs text-ivory-400">
                            / complete setup
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 mb-8">
                      <p className="text-xs uppercase tracking-widest font-semibold text-gold-400">
                        Package Scope & Inclusions:
                      </p>
                      <ul className="space-y-2 text-xs font-light">
                        {features.map((feat, i) => (
                          <li key={i} className="flex items-start space-x-2.5">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-gold-400" />
                            <span className="text-ivory-200">
                              {feat}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBook(pkg.id)}
                    className={`w-full py-3.5 sm:py-4 rounded-full font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-md hover:scale-[1.02] active:scale-95 ${
                      isRec
                        ? 'bg-gradient-to-r from-gold-500 to-champagne-500 text-obsidian-950 hover:brightness-110 shadow-glow-pill'
                        : 'bg-[#181824] border border-gold-500/40 text-gold-300 hover:bg-gold-500 hover:text-obsidian-950'
                    }`}
                  >
                    Reserve {pkg.tier ? `${pkg.tier} Tier` : 'Package'}
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
