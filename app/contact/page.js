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
    <div className="bg-ivory-100 text-obsidian-900 pt-28 pb-20">
      {/* Header */}
      <section className="py-16 bg-champagne-50 border-b border-champagne-300/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 text-gold-700 text-xs uppercase tracking-[0.3em] font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Private Concierge</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl text-obsidian-950 font-light">
            Contact Lumière Decor
          </h1>
          <p className="text-sm sm:text-base text-obsidian-600 max-w-2xl mx-auto font-light leading-relaxed">
            Begin your journey toward an extraordinary celebration. Reach out to our design atelier for commissions and consultations.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Contact Information Cards */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-[0.25em] text-gold-700 font-semibold">
                Studio Headquarters
              </span>
              <h2 className="font-serif text-3xl text-obsidian-950 font-light">
                Our Flagship Atelier
              </h2>
              <p className="text-xs text-obsidian-600 font-light leading-relaxed">
                By appointment only. We welcome couples, wedding planners, and corporate producers to our Beverly Hills design studio.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-5 bg-ivory-50 border border-champagne-300 rounded-2xl flex items-start space-x-4 shadow-sm">
                <div className="p-3 bg-gold-500/10 text-gold-600 rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-sm font-semibold text-obsidian-900">Address</h4>
                  <p className="text-xs text-obsidian-600 font-light leading-relaxed">
                    9450 Wilshire Blvd, Suite 800<br />
                    Beverly Hills, CA 90212
                  </p>
                </div>
              </div>

              <div className="p-5 bg-ivory-50 border border-champagne-300 rounded-2xl flex items-start space-x-4 shadow-sm">
                <div className="p-3 bg-gold-500/10 text-gold-600 rounded-xl">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-sm font-semibold text-obsidian-900">Direct Concierge</h4>
                  <p className="text-xs text-obsidian-600 font-light">+92 (314) 0660985</p>
                  <p className="text-[10px] text-gold-700 font-medium">WhatsApp: 03140660985</p>
                </div>
              </div>

              <div className="p-5 bg-ivory-50 border border-champagne-300 rounded-2xl flex items-start space-x-4 shadow-sm">
                <div className="p-3 bg-gold-500/10 text-gold-600 rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-sm font-semibold text-obsidian-900">Inquiries Email</h4>
                  <p className="text-xs text-obsidian-600 font-light">umerIjaz960@gmail.com</p>
                  <p className="text-[10px] text-obsidian-400">Response within 24 business hours</p>
                </div>
              </div>

              <div className="p-5 bg-ivory-50 border border-champagne-300 rounded-2xl flex items-start space-x-4 shadow-sm">
                <div className="p-3 bg-gold-500/10 text-gold-600 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-sm font-semibold text-obsidian-900">Studio Hours</h4>
                  <p className="text-xs text-obsidian-600 font-light">Monday – Friday: 9:00 AM – 6:00 PM</p>
                  <p className="text-xs text-obsidian-600 font-light">Saturday: 10:00 AM – 4:00 PM (By Appt)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Inquiry Form */}
          <div className="lg:col-span-7 bg-ivory-50 border border-champagne-300 rounded-3xl p-8 sm:p-10 shadow-luxury">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 mx-auto bg-gold-500/10 text-gold-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl text-obsidian-950 font-light">
                  Inquiry Received
                </h3>
                <p className="text-xs text-obsidian-600 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out to Lumière Decor. One of our event designers will review your vision and connect with you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 bg-obsidian-900 text-ivory-50 rounded-full text-xs uppercase tracking-widest hover:bg-gold-600 transition-colors shadow-md"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1 mb-6">
                  <h3 className="font-serif text-2xl text-obsidian-950 font-light">
                    Send an Inquiry
                  </h3>
                  <p className="text-xs text-obsidian-500 font-light">
                    Please provide your event date and design requirements.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: null });
                      }}
                      placeholder="e.g. Lady Victoria Spencer"
                      className={`w-full text-xs p-3 rounded-xl border bg-white focus:outline-none transition-colors ${
                        errors.name
                          ? 'border-red-400 focus:border-red-500 ring-1 ring-red-300'
                          : 'border-champagne-300 focus:border-gold-500'
                      }`}
                    />
                    {errors.name && (
                      <p className="text-[10px] text-red-600 mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
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
                      className={`w-full text-xs p-3 rounded-xl border bg-white focus:outline-none transition-colors ${
                        errors.email
                          ? 'border-red-400 focus:border-red-500 ring-1 ring-red-300'
                          : 'border-champagne-300 focus:border-gold-500'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-[10px] text-red-600 mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
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
                      className={`w-full text-xs p-3 rounded-xl border bg-white focus:outline-none transition-colors ${
                        errors.phone
                          ? 'border-red-400 focus:border-red-500 ring-1 ring-red-300'
                          : 'border-champagne-300 focus:border-gold-500'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-[10px] text-red-600 mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
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
                  <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
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
                    className={`w-full text-xs p-3 rounded-xl border bg-white focus:outline-none transition-colors ${
                      errors.message
                        ? 'border-red-400 focus:border-red-500 ring-1 ring-red-300'
                        : 'border-champagne-300 focus:border-gold-500'
                    }`}
                  />
                  {errors.message && (
                    <p className="text-[10px] text-red-600 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-full bg-gradient-to-r from-gold-600 via-gold-500 to-champagne-500 text-obsidian-950 font-semibold text-xs uppercase tracking-[0.2em] shadow-md hover:shadow-glow-gold hover:scale-[1.01] transition-all flex items-center justify-center"
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
