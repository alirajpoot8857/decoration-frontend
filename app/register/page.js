'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/context/AuthContext';
import { isValidPakistaniPhone } from '../../src/lib/validation';
import { Sparkles, Lock, Mail, User, Phone, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
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
      newErrors.email = 'Please enter a valid email format (e.g. name@domain.com).';
    }

    if (formData.phone && formData.phone.trim() && !isValidPakistaniPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid Pakistani phone number (e.g. 03140660985 or +923140660985).';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      router.push('/portal');
    } catch (err) {
      // Toast notification is handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-ivory-50 flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Radiant Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(229,168,59,0.08),transparent_70%)] pointer-events-none" />

      <div className="max-w-md w-full space-y-6 sm:space-y-7 bg-[#0C0C12] border border-gold-500/30 p-6 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-bl-full pointer-events-none" />

        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 text-gold-400 text-xs uppercase tracking-[0.25em] font-semibold bg-gold-500/10 px-3.5 py-1 rounded-full border border-gold-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join Lumière</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-ivory-50 font-light">
            Create Client Account
          </h2>
          <p className="text-xs text-ivory-400 font-light">
            Register to request custom bookings and track your rental orders.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gold-400 font-semibold mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gold-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
                placeholder="e.g. Marcus Sterling"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-[#14141C] text-ivory-50 placeholder:text-ivory-600 text-xs focus:outline-none transition-colors ${
                  errors.name
                    ? 'border-red-400 focus:border-red-500 ring-1 ring-red-400/30'
                    : 'border-gold-500/30 focus:border-gold-400'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-[10px] text-red-400 mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gold-400 font-semibold mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gold-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                placeholder="you@example.com"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-[#14141C] text-ivory-50 placeholder:text-ivory-600 text-xs focus:outline-none transition-colors ${
                  errors.email
                    ? 'border-red-400 focus:border-red-500 ring-1 ring-red-400/30'
                    : 'border-gold-500/30 focus:border-gold-400'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-[10px] text-red-400 mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gold-400 font-semibold mb-1">
              Phone Number (Pakistan 🇵🇰 - Optional)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gold-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (errors.phone) setErrors({ ...errors, phone: null });
                }}
                placeholder="03140660985 or +923140660985"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-[#14141C] text-ivory-50 placeholder:text-ivory-600 text-xs focus:outline-none transition-colors ${
                  errors.phone
                    ? 'border-red-400 focus:border-red-500 ring-1 ring-red-400/30'
                    : 'border-gold-500/30 focus:border-gold-400'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-[10px] text-red-400 mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.phone}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gold-400 font-semibold mb-1">
              Password (min 6 characters) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gold-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-[#14141C] text-ivory-50 placeholder:text-ivory-600 text-xs focus:outline-none transition-colors ${
                  errors.password
                    ? 'border-red-400 focus:border-red-500 ring-1 ring-red-400/30'
                    : 'border-gold-500/30 focus:border-gold-400'
                }`}
              />
            </div>
            {errors.password && (
              <p className="text-[10px] text-red-400 mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.password}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gold-400 font-semibold mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gold-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value });
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                }}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-[#14141C] text-ivory-50 placeholder:text-ivory-600 text-xs focus:outline-none transition-colors ${
                  errors.confirmPassword
                    ? 'border-red-400 focus:border-red-500 ring-1 ring-red-400/30'
                    : 'border-gold-500/30 focus:border-gold-400'
                }`}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-[10px] text-red-400 mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-gold-500 to-champagne-500 text-obsidian-950 font-bold text-xs uppercase tracking-[0.2em] shadow-md hover:brightness-110 shadow-glow-pill transition-all flex items-center justify-center"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin text-obsidian-950" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-ivory-400 space-y-2 border-t border-gold-500/20">
          <p>
            Already have a Client account?{' '}
            <Link href="/login?role=customer" className="text-gold-400 font-semibold hover:underline">
              Sign In to Client Portal
            </Link>
          </p>
          <p className="text-[11px] text-champagne-400/80">
            Studio team member?{' '}
            <Link href="/login?role=staff" className="text-emerald-400 font-semibold hover:underline">
              Staff Terminal
            </Link>{' '}
            or{' '}
            <Link href="/login?role=admin" className="text-gold-400 font-semibold hover:underline">
              Admin Suite
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
