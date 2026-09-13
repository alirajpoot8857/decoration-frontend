'use client';

import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import CustomSelect from './CustomSelect';
import CustomDatePicker from './CustomDatePicker';
import LocationPicker from './LocationPicker';
import { isValidPakistaniPhone } from '../../lib/validation';
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
      newErrors.venue = 'Please enter your venue, hotel, or city location.';
    }

    if (Number(formData.guestCount) <= 0) {
      newErrors.guestCount = 'Guest count must be greater than 0.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 bg-obsidian-950/75 backdrop-blur-md">
      <div className="relative bg-ivory-50 border border-gold-500/30 rounded-3xl shadow-luxury-lg max-w-2xl w-full p-6 sm:p-8 text-obsidian-900 overflow-visible">
        {/* Subtle gilded corner decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-bl-full pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-obsidian-400 hover:text-obsidian-800 rounded-full hover:bg-champagne-200/50 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {successBooking ? (
          <div className="text-center py-10 space-y-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gold-500/10 text-gold-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-light text-obsidian-900">
              Your Experience Begins
            </h3>
            <div className="inline-block px-4 py-1.5 bg-champagne-200 text-gold-900 font-bold text-xs uppercase tracking-widest rounded-full">
              Booking Reference: {successBooking.bookingNumber}
            </div>
            <p className="text-xs sm:text-sm text-obsidian-600 max-w-md mx-auto leading-relaxed">
              Thank you, <strong className="text-obsidian-950">{successBooking.customerName}</strong>. Our senior creative director and event scenographer will review your vision and reach out within 24 hours to schedule your private design consultation.
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="px-8 py-3 bg-obsidian-900 text-ivory-50 text-xs uppercase tracking-widest rounded-full hover:bg-gold-600 transition-colors shadow-md"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-5 space-y-1">
              <div className="flex items-center space-x-2 text-gold-700 text-xs uppercase tracking-[0.2em] font-semibold">
                <Crown className="w-4 h-4" />
                <span>Bespoke Scénographie</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl text-obsidian-950">
                Book Your Private Event Consultation
              </h3>
              <p className="text-xs text-obsidian-500 font-light">
                Tell us your vision. We transform extraordinary spaces into unforgettable memories.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => {
                      setFormData({ ...formData, customerName: e.target.value });
                      if (errors.customerName) setErrors({ ...errors, customerName: null });
                    }}
                    className={`w-full text-xs p-3 rounded-xl border bg-white focus:outline-none transition-colors ${
                      errors.customerName
                        ? 'border-red-400 focus:border-red-500 ring-1 ring-red-300'
                        : 'border-champagne-300 focus:border-gold-500'
                    }`}
                    placeholder="e.g. Eleanor Vance"
                  />
                  {errors.customerName && (
                    <p className="text-[10px] text-red-600 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.customerName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => {
                      setFormData({ ...formData, customerEmail: e.target.value });
                      if (errors.customerEmail) setErrors({ ...errors, customerEmail: null });
                    }}
                    className={`w-full text-xs p-3 rounded-xl border bg-white focus:outline-none transition-colors ${
                      errors.customerEmail
                        ? 'border-red-400 focus:border-red-500 ring-1 ring-red-300'
                        : 'border-champagne-300 focus:border-gold-500'
                    }`}
                    placeholder="you@example.com"
                  />
                  {errors.customerEmail && (
                    <p className="text-[10px] text-red-600 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.customerEmail}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone and Event Type (CustomSelect) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                    Phone Number (Pakistan 🇵🇰) *
                  </label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => {
                      setFormData({ ...formData, customerPhone: e.target.value });
                      if (errors.customerPhone) setErrors({ ...errors, customerPhone: null });
                    }}
                    className={`w-full text-xs p-3 rounded-xl border bg-white focus:outline-none transition-colors ${
                      errors.customerPhone
                        ? 'border-red-400 focus:border-red-500 ring-1 ring-red-300'
                        : 'border-champagne-300 focus:border-gold-500'
                    }`}
                    placeholder="03140660985 or +923140660985"
                  />
                  {errors.customerPhone && (
                    <p className="text-[10px] text-red-600 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
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
                  <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                    Guest Count
                  </label>
                  <div className="relative">
                    <Users className="w-3.5 h-3.5 text-obsidian-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={10}
                      value={formData.guestCount}
                      onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                      className="w-full text-xs pl-8 pr-3 py-3 rounded-xl border border-champagne-300 bg-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                    Budget Estimate (PKR)
                  </label>
                  <div className="relative">
                    <span className="text-[10px] font-bold text-obsidian-400 absolute left-3 top-1/2 -translate-y-1/2 font-mono">PKR</span>
                    <input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full text-xs pl-10 pr-3 py-3 rounded-xl border border-champagne-300 bg-white focus:outline-none focus:border-gold-500"
                      placeholder="e.g. 6500"
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
                <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                  Design Vision & Special Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-champagne-300 bg-white focus:outline-none focus:border-gold-500"
                  placeholder="Floral palette preferences, structural staging requests, ceiling installations, lighting..."
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-gold-600 via-gold-500 to-champagne-500 text-obsidian-950 font-semibold text-xs uppercase tracking-[0.2em] shadow-luxury hover:shadow-glow-gold hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin text-obsidian-950" />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Submit Event Booking Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
