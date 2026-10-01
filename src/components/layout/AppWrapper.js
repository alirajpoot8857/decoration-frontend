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

  const isAdmin = pathname?.startsWith('/admin');

  const handleOpenConsultation = (packageId = null) => {
    setSelectedPackageId(packageId);
    setConsultationOpen(true);
  };

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <LuxuryPreloader />
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
