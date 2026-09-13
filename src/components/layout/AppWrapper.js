'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import RentalCartDrawer from '../rental/RentalCartDrawer';
import ConsultationModal from '../ui/ConsultationModal';
import LuxuryPreloader from '../ui/LuxuryPreloader';
import SitewidePromoBanner from '../ui/SitewidePromoBanner';
import WhatsAppButton from '../ui/WhatsAppButton';

export default function AppWrapper({ children }) {
  const pathname = usePathname();
  const [consultationOpen, setConsultationOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [isRouteTransitioning, setIsRouteTransitioning] = useState(false);

  const handleOpenConsultation = (packageId = null) => {
    setSelectedPackageId(packageId);
    setConsultationOpen(true);
  };

  // Smooth route transition shimmer
  useEffect(() => {
    setIsRouteTransitioning(true);
    const timer = setTimeout(() => {
      setIsRouteTransitioning(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      <LuxuryPreloader />

      {/* Top Luxury Gold Liquid Route Transition Shimmer Bar */}
      {isRouteTransitioning && (
        <div className="fixed top-0 left-0 right-0 h-[2.5px] z-[99999] pointer-events-none overflow-hidden bg-obsidian-950/20">
          <div
            className="h-full w-full bg-gradient-to-r from-transparent via-gold-400 to-transparent shadow-[0_0_10px_rgba(212,175,55,0.6)]"
            style={{
              animation: 'shimmer 0.7s infinite linear',
            }}
          />
        </div>
      )}

      <SitewidePromoBanner />
      <Navbar onOpenConsultation={() => handleOpenConsultation(null)} />
      <main className="flex-1">{children}</main>
      <Footer />
      <RentalCartDrawer />
      <WhatsAppButton />
      <ConsultationModal
        isOpen={consultationOpen}
        onClose={() => setConsultationOpen(false)}
        defaultPackageId={selectedPackageId}
      />
    </>
  );
}
