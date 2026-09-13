'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRentalCart } from '../../context/RentalCartContext';
import { useAuth } from '../../context/AuthContext';
import { useDiscount } from '../../context/DiscountContext';
import { useToast } from '../../context/ToastContext';
import CustomDatePicker from '../ui/CustomDatePicker';
import LocationPicker from '../ui/LocationPicker';
import { isValidPakistaniPhone } from '../../lib/validation';
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

// Smoothly animated drawer component

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
    }

    if (!returnDate) {
      errors.returnDate = 'Return date is required.';
    }

    setCheckoutErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetFormState = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: '',
      notes: '',
    });
    setPromoInput('');
    setPromoStatus(null);
    setCheckoutErrors({});
    setCheckoutStep('cart');
  };

  const handleSubmitCheckout = async (e) => {
    e.preventDefault();
    if (!validateCheckout()) {
      showToast('Please fix the errors in your contact details before submitting.', 'error');
      return;
    }
    try {
      await submitRentalOrder(formData);
      resetFormState();
    } catch (err) {
      // Error handled by submitRentalOrder toast
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ${
        isCartOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible'
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-obsidian-950/70 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
          isCartOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div
          className={`w-screen max-w-md sm:max-w-lg bg-ivory-50 text-obsidian-900 border-l border-champagne-300 shadow-2xl flex flex-col justify-between overflow-visible transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isCartOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-champagne-200 flex items-center justify-between bg-champagne-100/70">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-gold-500/10 text-gold-700 rounded-full">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg tracking-wide text-obsidian-900">
                  {checkoutStep === 'cart' ? 'Rental Cart & Duration' : 'Confirm Rental Request'}
                </h3>
                <p className="text-xs text-obsidian-500 font-sans">
                  {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} • Mode: {rentalMode}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-obsidian-400 hover:text-obsidian-800 rounded-full hover:bg-champagne-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-5">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 mx-auto bg-champagne-100 rounded-full flex items-center justify-center text-champagne-600">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-lg text-obsidian-800">Your rental cart is empty</h4>
                <p className="text-xs text-obsidian-500 max-w-xs mx-auto">
                  Browse our catalog of luxury chairs, floral arches, chandeliers, and banquet centerpieces.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 px-6 py-2.5 bg-obsidian-900 text-ivory-50 rounded-full text-xs uppercase tracking-widest hover:bg-gold-600 transition-colors shadow-md"
                >
                  Browse Catalog
                </button>
              </div>
            ) : checkoutStep === 'cart' ? (
              <>
                {/* 1. DURATION MODE SELECTOR (HOURLY VS DAILY) */}
                <div className="p-4 bg-champagne-100/60 border border-champagne-300 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gold-800 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1.5" />
                      Rental Rate Calculation
                    </span>
                    <span className="text-[10px] text-obsidian-500 font-medium">
                      {rentalMode === 'HOURLY' ? `${rentalHours} Hours Tier` : `${daysCount} Day(s)`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-champagne-200/60 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setRentalMode('DAILY')}
                      className={`py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                        rentalMode === 'DAILY'
                          ? 'bg-obsidian-900 text-ivory-50 shadow-sm'
                          : 'text-obsidian-700 hover:text-obsidian-950'
                      }`}
                    >
                      Daily Rate ($/day)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRentalMode('HOURLY')}
                      className={`py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                        rentalMode === 'HOURLY'
                          ? 'bg-obsidian-900 text-ivory-50 shadow-sm'
                          : 'text-obsidian-700 hover:text-obsidian-950'
                      }`}
                    >
                      Hourly Rate ($/hr)
                    </button>
                  </div>

                  {/* Hourly selector buttons if hourly mode is active */}
                  {rentalMode === 'HOURLY' && (
                    <div className="pt-2 border-t border-champagne-200 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-obsidian-600 font-medium">Select Hours:</span>
                      <div className="flex items-center space-x-1.5">
                        {[2, 4, 6, 8, 12, 24].map((hrs) => (
                          <button
                            key={hrs}
                            onClick={() => setRentalHours(hrs)}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                              rentalHours === hrs
                                ? 'bg-gold-500 text-obsidian-950 shadow-sm'
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
                <div className="p-4 bg-champagne-50 border border-champagne-300/60 rounded-2xl space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <CustomDatePicker
                      label="Event Start Date"
                      required
                      minDate={todayStr}
                      value={eventDate}
                      onChange={setEventDate}
                      align="left"
                    />
                    <CustomDatePicker
                      label="Return Date"
                      required
                      minDate={eventDate || todayStr}
                      value={returnDate}
                      onChange={setReturnDate}
                      align="right"
                    />
                  </div>
                </div>

                {/* 3. PROMO CODE INPUT BOX */}
                <div className="p-3.5 bg-ivory-100 border border-gold-400/40 rounded-2xl space-y-2">
                  <form onSubmit={handleApplyPromoCode} className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-gold-600 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Enter Promo Code (e.g. LUMIERE15)"
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-champagne-300 bg-white uppercase tracking-wider font-mono font-medium focus:outline-none focus:border-gold-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-obsidian-900 text-ivory-50 rounded-xl text-xs uppercase tracking-wider font-semibold hover:bg-gold-600 hover:text-obsidian-950 transition-colors shadow-sm"
                    >
                      Apply
                    </button>
                  </form>

                  {effectiveDiscount > 0 && (
                    <div className="flex items-center justify-between text-[11px] text-gold-800 bg-gold-500/10 px-2.5 py-1 rounded-lg border border-gold-500/20">
                      <span className="flex items-center font-medium">
                        <Sparkles className="w-3 h-3 mr-1 text-gold-600" />
                        {userPromoCode ? `Promo "${userPromoCode}" Applied` : 'Sitewide Promotion Active'}
                      </span>
                      <span className="font-bold">{effectiveDiscount}% OFF</span>
                    </div>
                  )}

                  {promoStatus && !promoStatus.success && (
                    <p className="text-[10px] text-red-600 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {promoStatus.message}
                    </p>
                  )}
                </div>

                {/* 4. ITEMS LIST WITH HOURLY / DAILY RATES */}
                <div className="space-y-3 divide-y divide-champagne-200">
                  {cartItems.map((item) => {
                    const itemUnitRate = calculateItemUnitRate(item);
                    const itemTotal = itemUnitRate * item.quantity;
                    const isHourly = rentalMode === 'HOURLY';

                    return (
                      <div key={item.id} className="pt-3 first:pt-0 flex items-center space-x-3 transition-opacity">
                        <div className="w-16 h-16 relative rounded-xl overflow-hidden bg-champagne-200 flex-shrink-0 border border-champagne-300">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-obsidian-400">
                              No Img
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h5 className="font-serif text-sm text-obsidian-900 truncate">{item.name}</h5>
                          <p className="text-[11px] text-obsidian-600 font-medium">
                            {isHourly ? (
                              <span>
                                PKR {(item.hourlyRate || item.rentalPrice * 0.2).toFixed(2)}/hr × {rentalHours}h = PKR {itemUnitRate.toFixed(2)}
                              </span>
                            ) : (
                              <span>
                                PKR {item.rentalPrice.toFixed(2)}/day {daysCount > 1 ? `× ${daysCount}d` : ''}
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-gold-700">
                            Deposit: PKR ${(item.depositAmount || item.rentalPrice * 0.3).toFixed(2)}/ea
                          </p>

                          <div className="flex items-center space-x-2 mt-1.5">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 rounded bg-champagne-200 hover:bg-champagne-300 text-obsidian-800 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-semibold px-2">{item.quantity}</span>
                            <button
                              disabled={item.availableQuantity !== undefined && item.quantity >= item.availableQuantity}
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className={`p-1 rounded transition-colors ${
                                item.availableQuantity !== undefined && item.quantity >= item.availableQuantity
                                  ? 'bg-champagne-100 text-obsidian-300 cursor-not-allowed opacity-50'
                                  : 'bg-champagne-200 hover:bg-champagne-300 text-obsidian-800'
                              }`}
                              title={item.availableQuantity !== undefined && item.quantity >= item.availableQuantity ? 'Max available quantity reached' : 'Add 1 unit'}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            {item.availableQuantity !== undefined && (
                              <span className="text-[10px] text-obsidian-500 font-mono">
                                (Max: {item.availableQuantity})
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end justify-between h-16">
                          <span className="font-semibold text-sm text-obsidian-900">
                            PKR {itemTotal.toFixed(2)}
                          </span>
                          <button
                            onClick={() => handleRemoveItem(item.id, item.name)}
                            className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
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
                    className="text-[11px] text-obsidian-400 hover:text-red-600 transition-colors underline"
                  >
                    Clear All Items
                  </button>
                </div>
              </>
            ) : (
              /* Checkout Form Step with Validation */
              <form onSubmit={handleSubmitCheckout} id="rental-checkout-form" className="space-y-4">
                <div className="p-3.5 bg-champagne-100/60 rounded-2xl text-xs text-obsidian-700 space-y-1">
                  <p className="font-semibold text-obsidian-950">
                    Mode: {rentalMode === 'HOURLY' ? `${rentalHours} Hours Rental` : `${daysCount} Day(s) Rental`}
                  </p>
                  <p className="text-[11px] text-obsidian-600">
                    Dates: {eventDate} to {returnDate}
                  </p>
                  {discountSavings > 0 && (
                    <p className="text-[11px] text-gold-700 font-bold">
                      🎉 Promo Savings: -PKR {discountSavings.toFixed(2)} ({effectiveDiscount}% OFF)
                    </p>
                  )}
                  <p className="text-[10px] text-obsidian-500 pt-1">
                    A refundable security deposit of PKR {totalDeposit.toFixed(2)} is held and returned upon safe return of inventory.
                  </p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-obsidian-700 font-medium mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (checkoutErrors.name) setCheckoutErrors({ ...checkoutErrors, name: null });
                    }}
                    className={`w-full text-xs p-3 rounded-xl border bg-white focus:outline-none transition-colors ${
                      checkoutErrors.name
                        ? 'border-red-400 focus:border-red-500 ring-1 ring-red-300'
                        : 'border-champagne-300 focus:border-gold-500'
                    }`}
                    placeholder="e.g. Eleanor Vance"
                  />
                  {checkoutErrors.name && (
                    <p className="text-[10px] text-red-600 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {checkoutErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-obsidian-700 font-medium mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (checkoutErrors.email) setCheckoutErrors({ ...checkoutErrors, email: null });
                    }}
                    className={`w-full text-xs p-3 rounded-xl border bg-white focus:outline-none transition-colors ${
                      checkoutErrors.email
                        ? 'border-red-400 focus:border-red-500 ring-1 ring-red-300'
                        : 'border-champagne-300 focus:border-gold-500'
                    }`}
                    placeholder="you@example.com"
                  />
                  {checkoutErrors.email && (
                    <p className="text-[10px] text-red-600 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {checkoutErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-obsidian-700 font-medium mb-1">
                    Phone Number (Pakistan 🇵🇰) *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (checkoutErrors.phone) setCheckoutErrors({ ...checkoutErrors, phone: null });
                    }}
                    className={`w-full text-xs p-3 rounded-xl border bg-white focus:outline-none transition-colors ${
                      checkoutErrors.phone
                        ? 'border-red-400 focus:border-red-500 ring-1 ring-red-300'
                        : 'border-champagne-300 focus:border-gold-500'
                    }`}
                    placeholder="03140660985 or +923140660985"
                  />
                  {checkoutErrors.phone && (
                    <p className="text-[10px] text-red-600 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
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
                  <label className="block text-xs uppercase tracking-wider text-obsidian-700 font-medium mb-1">
                    Event Venue & Delivery Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-champagne-300 bg-white focus:outline-none focus:border-gold-500"
                    placeholder="Specify gate code, delivery timing or special access instructions..."
                  />
                </div>
              </form>
            )}
          </div>

          {/* Footer Calculations & CTA */}
          {cartItems.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-champagne-200 bg-champagne-50/90 space-y-3 sm:space-y-4">
              <div className="space-y-1.5 text-xs text-obsidian-600">
                <div className="flex justify-between">
                  <span>Gross Subtotal ({rentalMode.toLowerCase()})</span>
                  <span className="font-semibold text-obsidian-900">PKR {rawSubtotal.toFixed(2)}</span>
                </div>

                {discountSavings > 0 && (
                  <div className="flex justify-between text-gold-700 font-semibold">
                    <span className="flex items-center">
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      Discount ({effectiveDiscount}% OFF)
                    </span>
                    <span>-PKR {discountSavings.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gold-700">
                  <span className="flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    Refundable Security Deposit
                  </span>
                  <span className="font-semibold">PKR {totalDeposit.toFixed(2)}</span>
                </div>

                <div className="pt-2 border-t border-champagne-300 flex justify-between items-baseline font-bold text-obsidian-950">
                  <span className="text-sm">Total Due</span>
                  <span className="font-serif text-xl text-gold-800">PKR {totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {checkoutStep === 'cart' ? (
                <button
                  disabled={!eventDate || !returnDate}
                  onClick={() => setCheckoutStep('checkout')}
                  className={`w-full py-3.5 rounded-full font-medium text-xs uppercase tracking-[0.2em] flex items-center justify-center space-x-2 transition-all shadow-md ${
                    !eventDate || !returnDate
                      ? 'bg-obsidian-200 text-obsidian-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-gold-600 to-champagne-500 text-obsidian-950 hover:shadow-glow-gold hover:scale-[1.01]'
                  }`}
                >
                  <span>{!eventDate || !returnDate ? 'Select Dates to Proceed' : 'Proceed to Checkout'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('cart')}
                    className="w-1/3 py-3 rounded-full border border-champagne-400 text-xs uppercase tracking-wider font-medium text-obsidian-700 hover:bg-champagne-200/50"
                  >
                    Back
                  </button>
                  <button
                    form="rental-checkout-form"
                    type="submit"
                    disabled={submitting}
                    className="w-2/3 py-3 rounded-full bg-gradient-to-r from-gold-600 to-champagne-500 text-obsidian-950 font-semibold text-xs uppercase tracking-widest shadow-md hover:shadow-glow-gold flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin text-obsidian-950" />
                        Submitting Order...
                      </>
                    ) : (
                      'Confirm Rental Booking'
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
