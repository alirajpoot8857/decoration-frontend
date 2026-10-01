'use client';

import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import CustomSelect from './CustomSelect';
import CustomDatePicker from './CustomDatePicker';
import LocationPicker from './LocationPicker';
import { isValidPakistaniPhone } from '../../lib/validation';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';
import {
  X,
  Crown,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Users,
  DollarSign,
} from 'lucide-react';

const EVENT_TYPES = [
  { value: 'Wedding', label: 'Luxury Wedding Styling' },
  { value: 'Birthday', label: 'Celebrity Milestone Birthday' },
  { value: 'Corporate', label: 'Corporate Gala & Summit' },
  { value: 'Engagement', label: 'Engagement & Proposal' },
  { value: 'Mehndi', label: 'Mehndi & Sangeet Soirée' },
  { value: 'Reception', label: 'Grand Reception' },
  { value: 'Other', label: 'Bespoke Private Event' },
];

export default function ConsultationModal({ isOpen, onClose, defaultPackageId = null }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { isDarkMode } = useTheme();
  useBodyScrollLock(isOpen);

  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successBooking, setSuccessBooking] = useState(null);

  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: (user?.phone && isValidPakistaniPhone(user?.phone)) ? user.phone : '03140660985',
    eventType: 'Wedding',
    eventDate: '',
    venue: '',
    guestCount: 150,
    budget: '',
    packageId: defaultPackageId || '',
    specialRequests: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: user.name || prev.customerName,
        customerEmail: user.email || prev.customerEmail,
        customerPhone: (user.phone && isValidPakistaniPhone(user.phone)) ? user.phone : '03140660985',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (defaultPackageId) {
      setFormData((prev) => ({ ...prev, packageId: defaultPackageId }));
    }
  }, [defaultPackageId]);

  useEffect(() => {
    if (isOpen) {
      setSuccessBooking(null);
      setErrors({});
      const fetchPackages = async () => {
        try {
          const res = await api.getPackages();
          if (res.packages) setPackages(res.packages);
        } catch (e) {
          console.warn('Failed to load packages for booking modal', e);
        } finally {
          setLoadingPackages(false);
        }
      };
      fetchPackages();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Please enter your full name.';
    } else if (formData.customerName.trim().length < 3) {
      newErrors.customerName = 'Name must be at least 3 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Please provide your email address.';
    } else if (!emailRegex.test(formData.customerEmail.trim())) {
      newErrors.customerEmail = 'Please enter a valid email format (e.g. name@example.com).';
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Pakistani contact phone number is required.';
    } else if (!isValidPakistaniPhone(formData.customerPhone)) {
      newErrors.customerPhone = 'Please enter a valid Pakistani phone number (e.g. 03140660985 or +923140660985).';
    }

    if (!formData.eventDate) {
      newErrors.eventDate = 'Please select your target event date.';
    } else {
      const selected = new Date(formData.eventDate + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        newErrors.eventDate = 'Event date cannot be in the past.';
      }
    }

    if (!formData.venue.trim()) {
      newErrors.venue = 'Please specify or select your event venue in Pakistan.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    setSuccessBooking(null);
    setErrors({});
    setFormData({
      customerName: user?.name || '',
      customerEmail: user?.email || '',
      customerPhone: (user?.phone && isValidPakistaniPhone(user?.phone)) ? user.phone : '03140660985',
      eventType: 'Wedding',
      eventDate: '',
      venue: '',
      guestCount: 150,
      budget: '',
      packageId: defaultPackageId || '',
      specialRequests: '',
    });
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Please fix the highlighted errors before submitting.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const selectedPkg = packages.find((p) => p.id === formData.packageId);
      const res = await api.createBooking({
        ...formData,
        packageName: selectedPkg?.name,
        budget: formData.budget ? Number(formData.budget) : selectedPkg?.price || 0,
      });

      setSuccessBooking(res.booking);
      showToast(`Consultation booking #${res.booking.bookingNumber} confirmed!`, 'success');

      // Reset / empty all form inputs upon successful submission
      setFormData({
        customerName: user?.name || '',
        customerEmail: user?.email || '',
        customerPhone: (user?.phone && isValidPakistaniPhone(user?.phone)) ? user.phone : '03140660985',
        eventType: 'Wedding',
        eventDate: '',
        venue: '',
        guestCount: 150,
        budget: '',
        packageId: '',
        specialRequests: '',
      });
      setErrors({});
    } catch (error) {
      const msg = error.data?.message || error.message || 'Failed to submit booking request';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const packageOptions = [
    { value: '', label: 'Custom / Undecided' },
    ...packages.map((pkg) => ({
      value: pkg.id,
      label: `${pkg.name} (PKR ${pkg.price.toLocaleString()})`,
    })),
  ];

  const inputClass = `w-full text-xs p-3 rounded-xl border focus:outline-none transition-colors ${
    isDarkMode
      ? 'bg-[#181822] text-[#FAF8F5] border-white/15 focus:border-gold-500 placeholder-champagne-400/40'
      : 'bg-white text-[#141210] border-champagne-300 focus:border-gold-500 placeholder-champagne-600/50'
  }`;

  const labelClass = `block text-[11px] uppercase tracking-wider font-semibold mb-1 ${
    isDarkMode ? 'text-gold-400' : 'text-gold-800'
  }`;

  return (
    <div className="fixed inset-0 z-[99999] overflow-hidden flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-obsidian-950/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative border rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92dvh] sm:max-h-[90dvh] flex flex-col overflow-hidden transition-colors duration-300 ${
          isDarkMode
            ? 'bg-[#0E0E14] border-gold-500/35 text-ivory-50'
            : 'bg-white border-gold-500/30 text-[#141210]'
        }`}
      >
        {/* Subtle gilded corner decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-bl-full pointer-events-none" />

        {/* Modal Header */}
        <div className={`p-4 sm:p-6 pb-3 sm:pb-4 border-b flex items-start justify-between flex-shrink-0 relative z-10 ${
          isDarkMode ? 'bg-[#0E0E14] border-gold-500/20' : 'bg-[#FAF7F2] border-champagne-200'
        }`}>
          <div className="space-y-1 pr-6">
            <div className="flex items-center space-x-2 text-gold-500 text-xs uppercase tracking-[0.2em] font-semibold">
              <Crown className="w-4 h-4 text-gold-500" />
              <span>Bespoke Scénographie</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-light">
              Book Your Private Event Consultation
            </h3>
            <p className={`text-xs font-light ${isDarkMode ? 'text-champagne-200/80' : 'text-[#52473A]'}`}>
              Tell us your vision. We transform extraordinary spaces into unforgettable memories.
            </p>
          </div>

          <button
            onClick={handleClose}
            className={`p-2 rounded-full transition-colors flex-shrink-0 ${
              isDarkMode
                ? 'text-champagne-300 hover:text-gold-400 hover:bg-white/10'
                : 'text-obsidian-400 hover:text-obsidian-800 hover:bg-champagne-200/50'
            }`}
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4 text-xs overscroll-contain">
          {successBooking ? (
            <div className="text-center py-8 space-y-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gold-500/15 text-gold-500 rounded-full flex items-center justify-center shadow-glow-gold">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-light">
                Your Experience Begins
              </h3>
              <div className="inline-block px-4 py-1.5 bg-gold-500/20 text-gold-400 border border-gold-500/40 font-bold text-xs uppercase tracking-widest rounded-full">
                Booking Reference: #{successBooking.bookingNumber}
              </div>
              <p className={`text-xs sm:text-sm max-w-md mx-auto leading-relaxed ${isDarkMode ? 'text-champagne-200/85' : 'text-[#3D352A]'}`}>
                Thank you, <strong className={isDarkMode ? 'text-ivory-50' : 'text-[#141210]'}>{successBooking.customerName}</strong>. Our senior creative director and event scenographer will review your vision and reach out within 24 hours to schedule your private design consultation.
              </p>
              <div className="pt-4">
                <button
                  onClick={handleClose}
                  className="btn-festivity-pill px-8 py-3 text-xs uppercase tracking-widest rounded-full transition-transform hover:scale-105"
                >
                  Close & Return
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={labelClass}>
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => {
                      setFormData({ ...formData, customerName: e.target.value });
                      if (errors.customerName) setErrors({ ...errors, customerName: null });
                    }}
                    className={`${inputClass} ${
                      errors.customerName ? 'border-red-500 ring-2 ring-red-500/20 bg-red-500/5' : ''
                    }`}
                    placeholder="e.g. Eleanor Vance"
                  />
                  {errors.customerName && (
                    <p className="text-xs font-semibold text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                      {errors.customerName}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => {
                      setFormData({ ...formData, customerEmail: e.target.value });
                      if (errors.customerEmail) setErrors({ ...errors, customerEmail: null });
                    }}
                    className={`${inputClass} ${
                      errors.customerEmail ? 'border-red-500 ring-2 ring-red-500/20 bg-red-500/5' : ''
                    }`}
                    placeholder="you@example.com"
                  />
                  {errors.customerEmail && (
                    <p className="text-xs font-semibold text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                      {errors.customerEmail}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone and Event Type (CustomSelect) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={labelClass}>
                    Phone Number (Pakistan 🇵🇰) *
                  </label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => {
                      setFormData({ ...formData, customerPhone: e.target.value });
                      if (errors.customerPhone) setErrors({ ...errors, customerPhone: null });
                    }}
                    className={`${inputClass} ${
                      errors.customerPhone ? 'border-red-500 ring-2 ring-red-500/20 bg-red-500/5' : ''
                    }`}
                    placeholder="03140660985 or +923140660985"
                  />
                  {errors.customerPhone && (
                    <p className="text-xs font-semibold text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                      {errors.customerPhone}
                    </p>
                  )}
                </div>

                <div>
                  <CustomSelect
                    label="Event Type"
                    required
                    value={formData.eventType}
                    onChange={(val) => setFormData({ ...formData, eventType: val })}
                    options={EVENT_TYPES}
                  />
                </div>
              </div>

              {/* Event Date (CustomDatePicker) and Venue */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <CustomDatePicker
                    label="Target Event Date"
                    required
                    minDate={todayStr}
                    value={formData.eventDate}
                    onChange={(val) => {
                      setFormData({ ...formData, eventDate: val });
                      if (errors.eventDate) setErrors({ ...errors, eventDate: null });
                    }}
                    error={errors.eventDate}
                    align="left"
                  />
                </div>

                <div>
                  <LocationPicker
                    label="Venue or Location"
                    required
                    value={formData.venue}
                    onChange={(val) => {
                      setFormData({ ...formData, venue: val });
                      if (errors.venue) setErrors({ ...errors, venue: null });
                    }}
                    placeholder="Search venue or click GPS/Map..."
                    error={errors.venue}
                  />
                </div>
              </div>

              {/* Guest Count, Budget & Preferred Package (CustomSelect) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className={labelClass}>
                    Guest Count
                  </label>
                  <div className="relative">
                    <Users className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                      isDarkMode ? 'text-champagne-400/60' : 'text-obsidian-400'
                    }`} />
                    <input
                      type="number"
                      min={10}
                      value={formData.guestCount}
                      onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Budget Estimate (PKR)
                  </label>
                  <div className="relative">
                    <span className="text-[10px] font-bold text-gold-500 absolute left-3 top-1/2 -translate-y-1/2 font-mono">PKR</span>
                    <input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className={`${inputClass} pl-10`}
                      placeholder="e.g. 180000"
                    />
                  </div>
                </div>

                <div>
                  <CustomSelect
                    label="Preferred Collection"
                    value={formData.packageId}
                    onChange={(val) => setFormData({ ...formData, packageId: val })}
                    options={packageOptions}
                    placeholder="Custom / Undecided"
                  />
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className={labelClass}>
                  Design Vision & Special Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  className={inputClass}
                  placeholder="Floral palette preferences, structural staging requests, ceiling installations, lighting..."
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-full btn-festivity-pill text-xs uppercase tracking-[0.2em] font-bold shadow-glow-pill transition-all flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin text-obsidian-950" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      <span>Submit Event Booking Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
