'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRentalCart } from '../../context/RentalCartContext';
import { useAuth } from '../../context/AuthContext';
import { useDiscount } from '../../context/DiscountContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import CustomDatePicker from '../ui/CustomDatePicker';
import LocationPicker from '../ui/LocationPicker';
import { isValidPakistaniPhone } from '../../lib/validation';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';
import {
  X,
  Trash2,
  Plus,
  Minus,
  Calendar,
  Clock,
  ShoppingBag,
  ShieldCheck,
  ArrowRight,
  Tag,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  MapPin,
} from 'lucide-react';

export default function RentalCartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    eventDate,
    setEventDate,
    returnDate,
    setReturnDate,
    isDateRangeValid,
    dateError,
    rentalMode,
    setRentalMode,
    rentalHours,
    setRentalHours,
    daysCount,
    rawSubtotal,
    discountSavings,
    effectiveDiscount,
    subtotal,
    totalDeposit,
    totalAmount,
    calculateItemUnitRate,
    submitRentalOrder,
    submitting,
  } = useRentalCart();

  const { user } = useAuth();
  const { showToast } = useToast();
  const { isDarkMode } = useTheme();
  useBodyScrollLock(isCartOpen);
  const { applyPromo, promoMessage, userPromoCode } = useDiscount();

  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'checkout'
  const [promoInput, setPromoInput] = useState('');
  const [promoStatus, setPromoStatus] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: (user?.phone && isValidPakistaniPhone(user?.phone)) ? user.phone : '03140660985',
    notes: '',
  });
  const [checkoutErrors, setCheckoutErrors] = useState({});

  const todayStr = new Date().toISOString().split('T')[0];

  const handleApplyPromoCode = (e) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromo(promoInput);
    setPromoStatus(res);
  };

  const handleRemoveItem = (itemId, itemName) => {
    removeFromCart(itemId);
    showToast(`Removed "${itemName}" from rental cart.`, 'info');
  };

  const handleEventDateChange = (val) => {
    setEventDate(val);
    if (checkoutErrors.eventDate || checkoutErrors.returnDate) {
      setCheckoutErrors((prev) => ({ ...prev, eventDate: null, returnDate: null }));
    }
  };

  const handleReturnDateChange = (val) => {
    setReturnDate(val);
    if (checkoutErrors.returnDate) {
      setCheckoutErrors((prev) => ({ ...prev, returnDate: null }));
    }
  };

  const validateCheckout = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Please enter your full name.';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Please provide your email address.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Pakistani contact phone number is required.';
    } else if (!isValidPakistaniPhone(formData.phone)) {
      errors.phone = 'Please enter a valid Pakistani phone number (e.g. 03140660985 or +923140660985).';
    }

    if (!eventDate) {
      errors.eventDate = 'Event start date is required.';
    } else if (eventDate < todayStr) {
      errors.eventDate = 'Event start date cannot be in the past.';
    }

    if (!returnDate) {
      errors.returnDate = 'Return date is required.';
    } else if (eventDate && returnDate < eventDate) {
      errors.returnDate = 'Return date cannot be earlier than event start date.';
    }

    setCheckoutErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitCheckout = async (e) => {
    e.preventDefault();
    if (!validateCheckout()) {
      showToast('Please fix the errors in your contact details before submitting.', 'error');
      return;
    }
    try {
      await submitRentalOrder(formData);
      showToast('Rental commission request submitted successfully!', 'success');
      // Reset all checkout form inputs and drawer step
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phone: (user?.phone && isValidPakistaniPhone(user?.phone)) ? user.phone : '03140660985',
        location: '',
        notes: '',
      });
      setPromoInput('');
      setPromoStatus(null);
      setCheckoutErrors({});
      setCheckoutStep('cart');
      setIsCartOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to submit rental order.', 'error');
    }
  };

  const inputClass = `w-full text-xs p-3 rounded-xl border focus:outline-none transition-colors ${
    isDarkMode
      ? 'bg-[#181822] text-[#FAF8F5] border-white/15 focus:border-gold-500 placeholder-champagne-400/40'
      : 'bg-white text-[#141210] border-champagne-300 focus:border-gold-500 placeholder-champagne-600/50'
  }`;

  const labelClass = `block text-xs uppercase tracking-wider font-semibold mb-1 ${
    isDarkMode ? 'text-gold-400' : 'text-gold-800'
  }`;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ${
        isCartOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible'
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-obsidian-950/75 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
          isCartOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div
          className={`w-screen max-w-md sm:max-w-lg shadow-2xl flex flex-col justify-between overflow-visible transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isCartOpen ? 'translate-x-0' : 'translate-x-full'
          } ${
            isDarkMode
              ? 'bg-[#0E0E14] text-ivory-50 border-l border-gold-500/30'
              : 'bg-white text-[#141210] border-l border-champagne-300'
          }`}
        >
          {/* Header */}
          <div
            className={`px-5 sm:px-6 py-4 sm:py-5 border-b flex items-center justify-between transition-colors ${
              isDarkMode
                ? 'bg-[#14141E] border-gold-500/20'
                : 'bg-[#FAF7F2] border-champagne-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-gold-500/15 text-gold-500 rounded-full shadow-glow-gold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg tracking-wide">
                  {checkoutStep === 'cart' ? 'Rental Cart & Duration' : 'Confirm Rental Request'}
                </h3>
                <p className={`text-xs font-sans ${isDarkMode ? 'text-champagne-300/70' : 'text-[#6B5E4D]'}`}>
                  {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} • Mode: {rentalMode}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode
                  ? 'text-champagne-300 hover:text-gold-400 hover:bg-white/10'
                  : 'text-obsidian-400 hover:text-obsidian-800 hover:bg-champagne-200/50'
              }`}
              aria-label="Close Cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 space-y-5">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-white/5 text-gold-400' : 'bg-champagne-100 text-gold-700'
                }`}>
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-lg">Your rental cart is empty</h4>
                <p className={`text-xs max-w-xs mx-auto ${isDarkMode ? 'text-champagne-200/70' : 'text-[#52473A]'}`}>
                  Browse our catalog of luxury Dior chairs, floral arches, chandeliers, and banquet centerpieces.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 btn-festivity-pill px-6 py-2.5 text-xs uppercase tracking-widest transition-transform hover:scale-105 shadow-md"
                >
                  Browse Catalog
                </button>
              </div>
            ) : checkoutStep === 'cart' ? (
              <>
                {/* 1. DURATION MODE SELECTOR (HOURLY VS DAILY) */}
                <div className={`p-4 border rounded-2xl space-y-3 ${
                  isDarkMode
                    ? 'bg-[#14141E] border-gold-500/25'
                    : 'bg-[#FAF7F2] border-champagne-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gold-500 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1.5" />
                      Rental Rate Calculation
                    </span>
                    <span className={`text-[10px] font-medium ${isDarkMode ? 'text-champagne-300/70' : 'text-[#52473A]'}`}>
                      {rentalMode === 'HOURLY' ? `${rentalHours} Hours Tier` : `${daysCount} Day(s)`}
                    </span>
                  </div>

                  <div className={`grid grid-cols-2 gap-2 p-1 rounded-xl ${
                    isDarkMode ? 'bg-[#0E0E14]' : 'bg-champagne-200/60'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setRentalMode('DAILY')}
                      className={`py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                        rentalMode === 'DAILY'
                          ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 font-bold shadow-sm'
                          : isDarkMode ? 'text-champagne-300 hover:text-ivory-50' : 'text-obsidian-700 hover:text-obsidian-950'
                      }`}
                    >
                      Daily Rate (PKR/day)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRentalMode('HOURLY')}
                      className={`py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                        rentalMode === 'HOURLY'
                          ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 font-bold shadow-sm'
                          : isDarkMode ? 'text-champagne-300 hover:text-ivory-50' : 'text-obsidian-700 hover:text-obsidian-950'
                      }`}
                    >
                      Hourly Rate (PKR/hr)
                    </button>
                  </div>

                  {/* Hourly selector buttons if hourly mode is active */}
                  {rentalMode === 'HOURLY' && (
                    <div className="pt-2 border-t border-gold-500/20 flex items-center justify-between gap-2">
                      <span className={`text-[11px] font-medium ${isDarkMode ? 'text-champagne-300' : 'text-obsidian-700'}`}>
                        Select Hours:
                      </span>
                      <div className="flex items-center space-x-1.5">
                        {[2, 4, 6, 8, 12, 24].map((hrs) => (
                          <button
                            key={hrs}
                            onClick={() => setRentalHours(hrs)}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                              rentalHours === hrs
                                ? 'bg-gold-500 text-obsidian-950 shadow-sm scale-105'
                                : isDarkMode
                                ? 'bg-white/10 text-champagne-200 hover:bg-white/20'
                                : 'bg-white text-obsidian-700 border border-champagne-300 hover:bg-champagne-200'
                            }`}
                          >
                            {hrs}h
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. DATE SELECTION WITH CUSTOM DATEPICKERS */}
                <div className={`p-4 border rounded-2xl space-y-3 ${
                  isDarkMode
                    ? 'bg-[#14141E] border-gold-500/20'
                    : 'bg-[#FAF7F2] border-champagne-300/70'
                }`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <CustomDatePicker
                      label="Event Start Date"
                      required
                      minDate={todayStr}
                      value={eventDate}
                      onChange={handleEventDateChange}
                      align="left"
                      error={checkoutErrors.eventDate}
                    />
                    <CustomDatePicker
                      label="Return Date"
                      required
                      minDate={eventDate || todayStr}
                      value={returnDate}
                      onChange={handleReturnDateChange}
                      align="right"
                      error={checkoutErrors.returnDate}
                    />
                  </div>

                  {returnDate && eventDate && returnDate < eventDate && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs flex items-center gap-2 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>Return date cannot be earlier than event start date. Please select a valid return date.</span>
                    </div>
                  )}
                </div>

                {/* 3. PROMO CODE INPUT BOX */}
                <div className={`p-3.5 border rounded-2xl space-y-2 ${
                  isDarkMode
                    ? 'bg-[#14141E] border-gold-500/30'
                    : 'bg-[#FAF7F2] border-gold-400/40'
                }`}>
                  <form onSubmit={handleApplyPromoCode} className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-gold-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Promo Code (e.g. LUMIERE15)"
                        className={`w-full pl-8 pr-3 py-2 text-xs rounded-xl border uppercase tracking-wider font-mono font-medium focus:outline-none focus:border-gold-500 ${
                          isDarkMode
                            ? 'bg-[#181824] text-ivory-50 border-white/15 placeholder-champagne-400/40'
                            : 'bg-white text-obsidian-950 border-champagne-300 placeholder-champagne-600/50'
                        }`}
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-gold-500 to-amber-500 text-obsidian-950 rounded-xl text-xs uppercase tracking-wider font-bold hover:scale-105 transition-all shadow-sm"
                    >
                      Apply
                    </button>
                  </form>

                  {effectiveDiscount > 0 && (
                    <div className="flex items-center justify-between text-[11px] text-gold-500 bg-gold-500/10 px-2.5 py-1.5 rounded-lg border border-gold-500/20">
                      <span className="flex items-center font-medium">
                        <Sparkles className="w-3 h-3 mr-1 text-gold-400" />
                        {userPromoCode ? `Promo "${userPromoCode}" Applied` : 'Seasonal Promotion Active'}
                      </span>
                      <span className="font-bold">{effectiveDiscount}% OFF</span>
                    </div>
                  )}

                  {promoStatus && !promoStatus.success && (
                    <p className="text-[10px] text-red-500 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {promoStatus.message}
                    </p>
                  )}
                </div>

                {/* 4. ITEMS LIST WITH HOURLY / DAILY RATES */}
                <div className="space-y-3 divide-y divide-gold-500/15">
                  {cartItems.map((item) => {
                    const itemUnitRate = calculateItemUnitRate(item);
                    const itemTotal = itemUnitRate * item.quantity;
                    const isHourly = rentalMode === 'HOURLY';

                    return (
                      <div key={item.id} className="pt-3 first:pt-0 flex items-center space-x-3">
                        <div className="w-16 h-16 relative rounded-xl overflow-hidden bg-obsidian-900 flex-shrink-0 border border-gold-500/30">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gold-400">
                              No Img
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h5 className="font-serif text-sm truncate font-medium">{item.name}</h5>
                          <p className={`text-[11px] font-medium ${isDarkMode ? 'text-champagne-300' : 'text-[#3D352A]'}`}>
                            {isHourly ? (
                              <span>
                                PKR {Math.round(item.hourlyRate || item.rentalPrice * 0.2).toLocaleString()}/hr × {rentalHours}h = PKR {Math.round(itemUnitRate).toLocaleString()}
                              </span>
                            ) : (
                              <span>
                                PKR {Math.round(item.rentalPrice).toLocaleString()}/day {daysCount > 1 ? `× ${daysCount}d` : ''}
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-gold-500">
                            Deposit: PKR {Math.round(item.depositAmount || item.rentalPrice * 0.25).toLocaleString()}/ea
                          </p>

                          <div className="flex items-center space-x-2 mt-1.5">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className={`p-1 rounded transition-colors ${
                                isDarkMode ? 'bg-white/10 hover:bg-white/20 text-ivory-50' : 'bg-champagne-200 hover:bg-champagne-300 text-obsidian-800'
                              }`}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-semibold px-2">{item.quantity}</span>
                            <button
                              disabled={item.availableQuantity !== undefined && item.quantity >= item.availableQuantity}
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className={`p-1 rounded transition-colors ${
                                item.availableQuantity !== undefined && item.quantity >= item.availableQuantity
                                  ? 'opacity-40 cursor-not-allowed'
                                  : isDarkMode ? 'bg-white/10 hover:bg-white/20 text-ivory-50' : 'bg-champagne-200 hover:bg-champagne-300 text-obsidian-800'
                              }`}
                              title={item.availableQuantity !== undefined && item.quantity >= item.availableQuantity ? 'Max available quantity reached' : 'Add 1 unit'}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            {item.availableQuantity !== undefined && (
                              <span className="text-[10px] text-gold-500 font-mono">
                                (Stock: {item.availableQuantity})
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end justify-between h-16">
                          <span className="font-semibold text-sm text-gold-gradient">
                            PKR {Math.round(itemTotal).toLocaleString()}
                          </span>
                          <button
                            onClick={() => handleRemoveItem(item.id, item.name)}
                            className="text-red-500 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      clearCart();
                      showToast('Rental cart cleared.', 'info');
                    }}
                    className={`text-[11px] hover:text-red-500 transition-colors underline ${
                      isDarkMode ? 'text-champagne-400/60' : 'text-obsidian-400'
                    }`}
                  >
                    Clear All Items
                  </button>
                </div>
              </>
            ) : (
              /* Checkout Form Step with Validation */
              <form onSubmit={handleSubmitCheckout} id="rental-checkout-form" className="space-y-4">
                <div className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                  isDarkMode ? 'bg-[#14141E] border border-gold-500/20' : 'bg-[#FAF7F2] border border-champagne-300'
                }`}>
                  <p className="font-semibold text-gold-500">
                    Mode: {rentalMode === 'HOURLY' ? `${rentalHours} Hours Rental` : `${daysCount} Day(s) Rental`}
                  </p>
                  <p className={`text-[11px] ${isDarkMode ? 'text-champagne-200' : 'text-obsidian-700'}`}>
                    Dates: {eventDate} to {returnDate}
                  </p>
                  {discountSavings > 0 && (
                    <p className="text-[11px] text-gold-400 font-bold">
                      🎉 Promo Savings: -PKR {discountSavings.toFixed(2)} ({effectiveDiscount}% OFF)
                    </p>
                  )}
                  <p className={`text-[10px] pt-1 ${isDarkMode ? 'text-champagne-400/60' : 'text-obsidian-500'}`}>
                    A refundable security deposit of PKR {totalDeposit.toFixed(2)} is held and returned upon safe inventory return.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (checkoutErrors.name) setCheckoutErrors({ ...checkoutErrors, name: null });
                    }}
                    className={`${inputClass} ${
                      checkoutErrors.name ? 'border-red-500 ring-2 ring-red-500/20 bg-red-500/5' : ''
                    }`}
                    placeholder="e.g. Eleanor Vance"
                  />
                  {checkoutErrors.name && (
                    <p className="text-xs font-semibold text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                      {checkoutErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (checkoutErrors.email) setCheckoutErrors({ ...checkoutErrors, email: null });
                    }}
                    className={`${inputClass} ${
                      checkoutErrors.email ? 'border-red-500 ring-2 ring-red-500/20 bg-red-500/5' : ''
                    }`}
                    placeholder="you@example.com"
                  />
                  {checkoutErrors.email && (
                    <p className="text-xs font-semibold text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                      {checkoutErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>
                    Phone Number (Pakistan 🇵🇰) *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (checkoutErrors.phone) setCheckoutErrors({ ...checkoutErrors, phone: null });
                    }}
                    className={`${inputClass} ${
                      checkoutErrors.phone ? 'border-red-500 ring-2 ring-red-500/20 bg-red-500/5' : ''
                    }`}
                    placeholder="03140660985 or +923140660985"
                  />
                  {checkoutErrors.phone && (
                    <p className="text-xs font-semibold text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                      {checkoutErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <LocationPicker
                    label="Customer Venue / Delivery Location"
                    value={formData.location || ''}
                    onChange={(loc) => {
                      setFormData({ ...formData, location: loc });
                      if (checkoutErrors.location) setCheckoutErrors({ ...checkoutErrors, location: null });
                    }}
                    placeholder="Search delivery address or click GPS/Map..."
                    error={checkoutErrors.location}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Event Venue & Delivery Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className={inputClass}
                    placeholder="Specify gate code, delivery timing or special access instructions..."
                  />
                </div>
              </form>
            )}
          </div>

          {/* Footer Calculations & CTA */}
          {cartItems.length > 0 && (
            <div className={`p-5 sm:p-6 border-t space-y-3 sm:space-y-4 ${
              isDarkMode
                ? 'bg-[#14141E] border-gold-500/20'
                : 'bg-[#FAF7F2] border-champagne-200'
            }`}>
              <div className={`space-y-1.5 text-xs ${isDarkMode ? 'text-champagne-300' : 'text-[#3D352A]'}`}>
                <div className="flex justify-between">
                  <span>Gross Subtotal ({rentalMode.toLowerCase()})</span>
                  <span className="font-semibold">PKR {Math.round(rawSubtotal).toLocaleString()}</span>
                </div>

                {discountSavings > 0 && (
                  <div className="flex justify-between text-gold-500 font-semibold">
                    <span className="flex items-center">
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      Discount ({effectiveDiscount}% OFF)
                    </span>
                    <span>-PKR {Math.round(discountSavings).toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-gold-500">
                  <span className="flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    Refundable Security Deposit
                  </span>
                  <span className="font-semibold">PKR {Math.round(totalDeposit).toLocaleString()}</span>
                </div>

                <div className={`pt-2 border-t flex justify-between items-baseline font-bold ${
                  isDarkMode ? 'border-white/10 text-ivory-50' : 'border-champagne-300 text-obsidian-950'
                }`}>
                  <span className="text-sm">Total Due</span>
                  <span className="font-serif text-xl text-gold-gradient">PKR {Math.round(totalAmount).toLocaleString()}</span>
                </div>
              </div>

              {checkoutStep === 'cart' ? (
                <button
                  disabled={!eventDate || !returnDate || returnDate < eventDate || eventDate < todayStr}
                  onClick={() => {
                    if (!eventDate || !returnDate || returnDate < eventDate || eventDate < todayStr) return;
                    setCheckoutStep('checkout');
                  }}
                  className={`w-full py-4 rounded-full font-medium text-xs uppercase tracking-[0.2em] flex items-center justify-center space-x-2 transition-all shadow-md ${
                    !eventDate || !returnDate || returnDate < eventDate || eventDate < todayStr
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
                      : 'btn-festivity-pill shadow-glow-pill hover:scale-[1.01]'
                  }`}
                >
                  <span>
                    {!eventDate || !returnDate
                      ? 'Select Dates to Proceed'
                      : eventDate < todayStr
                      ? 'Event Date Cannot Be in Past'
                      : returnDate < eventDate
                      ? 'Invalid Return Date'
                      : 'Proceed to Checkout'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('cart')}
                    className={`w-1/3 py-3 rounded-full border text-xs uppercase tracking-wider font-semibold transition-colors ${
                      isDarkMode
                        ? 'border-white/20 text-champagne-200 hover:bg-white/10'
                        : 'border-champagne-400 text-obsidian-700 hover:bg-champagne-200/50'
                    }`}
                  >
                    Back
                  </button>
                  <button
                    form="rental-checkout-form"
                    type="submit"
                    disabled={submitting}
                    className="w-2/3 py-3 rounded-full btn-festivity-pill text-xs uppercase tracking-widest font-bold shadow-glow-pill flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin text-obsidian-950" />
                        <span>Submitting Order...</span>
                      </>
                    ) : (
                      <span>Confirm Rental Booking</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
