'use client';

import React, { useState } from 'react';
import api from '../../src/lib/api';
import { useToast } from '../../src/context/ToastContext';
import CustomSelect from '../../src/components/ui/CustomSelect';
import CustomDatePicker from '../../src/components/ui/CustomDatePicker';
import LocationPicker from '../../src/components/ui/LocationPicker';
import { isValidPakistaniPhone } from '../../src/lib/validation';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const EVENT_TYPE_OPTIONS = [
  { value: 'Wedding', label: 'Luxury Wedding Styling' },
  { value: 'Birthday', label: 'Milestone Birthday Gala' },
  { value: 'Corporate', label: 'Corporate Prestige Summit' },
  { value: 'Engagement', label: 'Engagement & Mehndi' },
  { value: 'Other', label: 'Bespoke Private Production' },
];

export default function ContactPage() {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    eventType: 'Wedding',
    eventDate: '',
    message: '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Please enter your full name.';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Please provide your email address.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address (e.g. name@example.com).';
    }

    if (formData.phone && formData.phone.trim() && !isValidPakistaniPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid Pakistani phone number (e.g. 03140660985 or +923140660985).';
    }

    if (formData.eventDate) {
      const selected = new Date(formData.eventDate + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        newErrors.eventDate = 'Event date cannot be in the past.';
      }
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please provide details about your event requirements.';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Please fix the errors in the inquiry form.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.submitInquiry(formData);
      setSubmitted(true);
      showToast('Your message has been received by our concierge!', 'success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        location: '',
        eventType: 'Wedding',
        eventDate: '',
        message: '',
      });
      setErrors({});
    } catch (err) {
      const msg = err.data?.message || err.message || 'Failed to submit inquiry';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-[#070709] text-ivory-50 pt-24 sm:pt-28 pb-16 sm:pb-20 w-full overflow-hidden min-h-screen">
      {/* Header */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-[#0D0D14] via-[#09090D] to-[#070709] border-b border-gold-500/20 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(229,168,59,0.08),transparent_70%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 sm:space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 text-gold-400 text-[11px] sm:text-xs uppercase tracking-[0.3em] font-semibold bg-gold-500/10 px-4 py-1.5 rounded-full border border-gold-500/30">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span>Private Concierge</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-ivory-50 font-light tracking-tight">
            Contact Lumière Decor
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-ivory-300 max-w-2xl mx-auto font-light leading-relaxed">
            Begin your journey toward an extraordinary celebration in Pakistan. Reach out to our design atelier for commissions and consultations.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Contact Information Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[0.25em] text-gold-400 font-semibold">
                Studio Headquarters
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-ivory-50 font-light">
                Our Flagship Atelier
              </h2>
              <p className="text-xs text-ivory-300 font-light leading-relaxed">
                By appointment only. We welcome couples, wedding planners, and corporate hosts to our design studios across Pakistan.
              </p>
            </div>

            <div className="space-y-3.5">
              <div className="p-4 sm:p-5 bg-[#0D0D14] border border-gold-500/30 rounded-2xl flex items-start space-x-4 shadow-md hover:border-gold-400 transition-colors">
                <div className="p-3 bg-gold-500/15 border border-gold-500/30 text-gold-400 rounded-xl flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-sm font-semibold text-ivory-50">Headquarters</h4>
                  <p className="text-xs text-ivory-300 font-light leading-relaxed">
                    Gulberg III / DHA Phase 5, Lahore, Pakistan<br />
                    Serving Islamabad, Karachi, Rawalpindi & Nationwide
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-[#0D0D14] border border-gold-500/30 rounded-2xl flex items-start space-x-4 shadow-md hover:border-gold-400 transition-colors">
                <div className="p-3 bg-gold-500/15 border border-gold-500/30 text-gold-400 rounded-xl flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-sm font-semibold text-ivory-50">Direct Concierge</h4>
                  <p className="text-xs text-ivory-300 font-light">+92 (314) 0660985</p>
                  <p className="text-[10px] text-gold-400 font-medium">WhatsApp: 03140660985</p>
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-[#0D0D14] border border-gold-500/30 rounded-2xl flex items-start space-x-4 shadow-md hover:border-gold-400 transition-colors">
                <div className="p-3 bg-gold-500/15 border border-gold-500/30 text-gold-400 rounded-xl flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-sm font-semibold text-ivory-50">Inquiries Email</h4>
                  <p className="text-xs text-ivory-300 font-light">alirajpoot8857@gmail.com</p>
                  <p className="text-[10px] text-ivory-400">Response within 24 business hours</p>
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-[#0D0D14] border border-gold-500/30 rounded-2xl flex items-start space-x-4 shadow-md hover:border-gold-400 transition-colors">
                <div className="p-3 bg-gold-500/15 border border-gold-500/30 text-gold-400 rounded-xl flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-sm font-semibold text-ivory-50">Studio Hours</h4>
                  <p className="text-xs text-ivory-300 font-light">Monday – Friday: 9:00 AM – 8:00 PM</p>
                  <p className="text-xs text-ivory-300 font-light">Saturday – Sunday: 10:00 AM – 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Inquiry Form */}
          <div className="lg:col-span-7 bg-[#0C0C12] border border-gold-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 mx-auto bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl text-ivory-50 font-light">
                  Inquiry Received
                </h3>
                <p className="text-xs text-ivory-300 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out to Lumière Decor. One of our lead scenographers will review your vision and connect with you shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      location: '',
                      eventType: 'Wedding',
                      eventDate: '',
                      message: '',
                    });
                    setErrors({});
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-gold-500 to-champagne-500 text-obsidian-950 rounded-full text-xs uppercase tracking-widest font-bold hover:brightness-110 transition-colors shadow-md"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div className="space-y-1 mb-4">
                  <h3 className="font-serif text-2xl text-ivory-50 font-light">
                    Send an Inquiry
                  </h3>
                  <p className="text-xs text-ivory-400 font-light">
                    Please provide your event date and design requirements.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gold-400 font-semibold mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: null });
                      }}
                      placeholder="e.g. Marcus Sterling"
                      className={`w-full text-xs p-3 rounded-xl border bg-[#14141C] text-ivory-50 placeholder:text-ivory-600 focus:outline-none transition-colors ${
                        errors.name
                          ? 'border-red-500 ring-2 ring-red-500/20 bg-red-500/5'
                          : 'border-gold-500/30 focus:border-gold-400'
                      }`}
                    />
                    {errors.name && (
                      <p className="text-xs font-semibold text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gold-400 font-semibold mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: null });
                      }}
                      placeholder="you@example.com"
                      className={`w-full text-xs p-3 rounded-xl border bg-[#14141C] text-ivory-50 placeholder:text-ivory-600 focus:outline-none transition-colors ${
                        errors.email
                          ? 'border-red-500 ring-2 ring-red-500/20 bg-red-500/5'
                          : 'border-gold-500/30 focus:border-gold-400'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-xs font-semibold text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gold-400 font-semibold mb-1">
                      Phone Number (Pakistan 🇵🇰)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (errors.phone) setErrors({ ...errors, phone: null });
                      }}
                      placeholder="03140660985 or +923140660985"
                      className={`w-full text-xs p-3 rounded-xl border bg-[#14141C] text-ivory-50 placeholder:text-ivory-600 focus:outline-none transition-colors ${
                        errors.phone
                          ? 'border-red-500 ring-2 ring-red-500/20 bg-red-500/5'
                          : 'border-gold-500/30 focus:border-gold-400'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-xs font-semibold text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <CustomSelect
                      label="Event Type"
                      value={formData.eventType}
                      onChange={(val) => setFormData({ ...formData, eventType: val })}
                      options={EVENT_TYPE_OPTIONS}
                    />
                  </div>

                  <div>
                    <CustomDatePicker
                      label="Event Date (Optional)"
                      minDate={todayStr}
                      value={formData.eventDate}
                      onChange={(val) => {
                        setFormData({ ...formData, eventDate: val });
                        if (errors.eventDate) setErrors({ ...errors, eventDate: null });
                      }}
                      error={errors.eventDate}
                      align="right"
                    />
                  </div>
                </div>

                <div>
                  <LocationPicker
                    label="Target Event Venue / City"
                    value={formData.location}
                    onChange={(val) => setFormData({ ...formData, location: val })}
                    placeholder="Search venue or click GPS/Map..."
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gold-400 font-semibold mb-1">
                    Your Message / Design Requirements *
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      if (errors.message) setErrors({ ...errors, message: null });
                    }}
                    placeholder="Tell us about the venue, guest count, theme inspirations, or preferred floral arrangements..."
                    className={`w-full text-xs p-3 rounded-xl border bg-[#14141C] text-ivory-50 placeholder:text-ivory-600 focus:outline-none transition-colors ${
                      errors.message
                        ? 'border-red-500 ring-2 ring-red-500/20 bg-red-500/5'
                        : 'border-gold-500/30 focus:border-gold-400'
                    }`}
                  />
                  {errors.message && (
                    <p className="text-xs font-semibold text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                      {errors.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-full bg-gradient-to-r from-gold-500 to-champagne-500 text-obsidian-950 font-bold text-xs uppercase tracking-[0.2em] shadow-md hover:brightness-110 shadow-glow-pill transition-all flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin text-obsidian-950" />
                      Sending Inquiry...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Private Inquiry
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
