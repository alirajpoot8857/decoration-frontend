'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const DiscountContext = createContext(null);

export function DiscountProvider({ children }) {
  const [discountPercentage, setDiscountPercentage] = useState(15);
  const [isDiscountActive, setIsDiscountActive] = useState(true);
  const [bannerText, setBannerText] = useState(
    '✨ Haute Saison Offer: Enjoy 15% OFF across all Luxury Packages & Rental Catalog! Use code LUMIERE15'
  );
  const [promoCode, setPromoCode] = useState('LUMIERE15');
  const [userPromoCode, setUserPromoCode] = useState('');
  const [userDiscountPercentage, setUserDiscountPercentage] = useState(null);
  const [promoMessage, setPromoMessage] = useState('');
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  const refreshSettings = async () => {
    try {
      const res = await api.getSettings();
      if (res.settings) {
        const getVal = (k) => {
          if (typeof res.settings === 'object' && !Array.isArray(res.settings)) {
            return res.settings[k];
          }
          if (Array.isArray(res.settings)) {
            return res.settings.find((s) => s.key === k)?.value;
          }
          return res.raw?.find((s) => s.key === k)?.value;
        };

        const discPct = getVal('sitewide_discount_percentage');
        const discAct = getVal('sitewide_discount_active');
        const discBan = getVal('sitewide_discount_banner');
        const discCode = getVal('promo_code');

        if (discPct !== undefined) setDiscountPercentage(Number(discPct) || 0);
        if (discAct !== undefined) setIsDiscountActive(discAct === 'true' || discAct === true);
        if (discBan !== undefined) setBannerText(String(discBan));
        if (discCode !== undefined) setPromoCode(String(discCode));
      }
    } catch (err) {
      console.warn('Using default discount configuration', err);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  // Effective discount percentage (either sitewide or user applied promo)
  const effectiveDiscount = userDiscountPercentage !== null
    ? userDiscountPercentage
    : isDiscountActive
    ? discountPercentage
    : 0;

  const applyPromo = (code) => {
    if (!code || !code.trim()) {
      setUserPromoCode('');
      setUserDiscountPercentage(null);
      setPromoMessage('');
      return { success: true, message: 'Promo removed' };
    }

    const clean = code.trim().toUpperCase();
    if (clean === promoCode.toUpperCase() || clean === 'LUMIERE15' || clean === 'VIP15') {
      setUserPromoCode(clean);
      setUserDiscountPercentage(15);
      setPromoMessage('15% OFF VIP Promo Applied!');
      return { success: true, message: '15% discount applied successfully!' };
    } else if (clean === 'ROYAL25' || clean === 'SAVE25') {
      setUserPromoCode(clean);
      setUserDiscountPercentage(25);
      setPromoMessage('25% Royal Discount Applied!');
      return { success: true, message: '25% discount applied successfully!' };
    } else if (clean === 'LUXE10' || clean === 'SAVE10') {
      setUserPromoCode(clean);
      setUserDiscountPercentage(10);
      setPromoMessage('10% Luxe Discount Applied!');
      return { success: true, message: '10% discount applied successfully!' };
    } else {
      return { success: false, message: 'Invalid promo code. Try LUMIERE15 or ROYAL25' };
    }
  };

  const calculateDiscount = (price) => {
    const num = Number(price) || 0;
    if (effectiveDiscount <= 0) return { originalPrice: num, discountedPrice: num, savings: 0 };
    const savings = (num * effectiveDiscount) / 100;
    const discountedPrice = Math.max(0, num - savings);
    return { originalPrice: num, discountedPrice, savings };
  };

  return (
    <DiscountContext.Provider
      value={{
        discountPercentage,
        setDiscountPercentage,
        isDiscountActive,
        setIsDiscountActive,
        bannerText,
        setBannerText,
        promoCode,
        effectiveDiscount,
        userPromoCode,
        promoMessage,
        applyPromo,
        calculateDiscount,
        refreshSettings,
        isBannerDismissed,
        setIsBannerDismissed,
      }}
    >
      {children}
    </DiscountContext.Provider>
  );
}

export function useDiscount() {
  const context = useContext(DiscountContext);
  if (!context) {
    throw new Error('useDiscount must be used within a DiscountProvider');
  }
  return context;
}
