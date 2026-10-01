'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../src/context/AuthContext';
import { useToast } from '../../src/context/ToastContext';
import {
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  Shield,
  Crown,
  Wrench,
  User,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

const ROLE_CONFIGS = {
  customer: {
    id: 'customer',
    roleKey: 'CUSTOMER',
    label: 'Customer Portal',
    badge: 'Private Client',
    icon: User,
    color: 'from-amber-400 via-gold-500 to-champagne-400',
    activeTabClass: 'bg-gradient-to-r from-gold-500 to-champagne-500 text-obsidian-950 shadow-glow-pill font-bold',
    title: 'Client Atelier Portal',
    subtitle: 'Sign in to access your event bookings, 3D floor plans, invoices, and luxury rental orders.',
    placeholderEmail: 'client@example.com',
    features: [
      'Live Event Staging Timelines',
      'Download Invoices & Digital Receipts',
      'Saved Rentals & Event Wishlist',
    ],
  },
  staff: {
    id: 'staff',
    roleKey: 'STAFF',
    label: 'Staff Terminal',
    badge: 'Operations & Logistics',
    icon: Wrench,
    color: 'from-emerald-400 via-teal-500 to-gold-400',
    activeTabClass: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-ivory-50 shadow-md font-bold',
    title: 'Staff Operations Terminal',
    subtitle: 'Sign in to manage warehouse inventory, staging schedules, dispatches, and inquiry responses.',
    placeholderEmail: 'staff@lumieredecor.com',
    features: [
      'Real-Time Warehouse Stock Check',
      'Staging Logistics & Delivery Schedules',
      'Inquiry Response & Follow-up Center',
    ],
  },
  admin: {
    id: 'admin',
    roleKey: 'ADMIN',
    label: 'Executive Admin',
    badge: 'Studio Director',
    icon: Crown,
    color: 'from-gold-500 via-amber-500 to-yellow-300',
    activeTabClass: 'bg-gradient-to-r from-gold-600 via-gold-500 to-amber-500 text-obsidian-950 shadow-glow-pill font-bold',
    title: 'Executive Admin Suite',
    subtitle: 'Sign in for master control over collections, financial reports, user permissions, and audit logs.',
    placeholderEmail: 'admin@lumieredecor.com',
    features: [
      'Studio Analytics & Revenue Reports',
      'Master Décor Packages & Pricing',
      'User Roles, Settings & Audit Logs',
    ],
  },
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { showToast } = useToast();

  const paramRole = searchParams.get('role')?.toLowerCase();
  const initialRole = ['customer', 'staff', 'admin'].includes(paramRole) ? paramRole : 'customer';

  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (paramRole && ['customer', 'staff', 'admin'].includes(paramRole)) {
      setSelectedRole(paramRole);
    }
  }, [paramRole]);

  const activeConfig = ROLE_CONFIGS[selectedRole] || ROLE_CONFIGS.customer;
  const ActiveIcon = activeConfig.icon;

  const handleRoleTabChange = (roleId) => {
    setSelectedRole(roleId);
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!email.trim()) {
      setFormError('Please enter your email address.');
      return;
    }
    if (!password) {
      setFormError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      // Send real email, password, and expected role to backend authentication
      const loggedInUser = await login(email.trim(), password, activeConfig.roleKey);
      const redirectParam = searchParams.get('redirect');

      if (redirectParam) {
        router.push(redirectParam);
        return;
      }

      // Route according to user role
      if (loggedInUser.role === 'ADMIN' || loggedInUser.role === 'STAFF') {
        router.push('/admin');
      } else {
        router.push('/portal');
      }
    } catch (err) {
      const msg = err.data?.message || err.message || 'Authentication failed. Please check your credentials.';
      setFormError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-ivory-50 flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-gold-500 selection:text-obsidian-950">
      {/* Radiant Luxury Glow Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(229,168,59,0.1),transparent_70%)] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full space-y-6 sm:space-y-7 bg-[#0C0C12] border border-gold-500/30 p-6 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Top Decorative Gold Accent Line */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${activeConfig.color}`} />

        {/* 1. Multi-Role Segmented Switcher Tabs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-champagne-300 font-semibold px-1">
            <span>Select Account Role</span>
            <span className="text-gold-400">Database Verified</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#14141C] rounded-2xl border border-gold-500/25">
            {Object.values(ROLE_CONFIGS).map((tab) => {
              const TabIcon = tab.icon;
              const isActive = selectedRole === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleRoleTabChange(tab.id)}
                  className={`flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                    isActive
                      ? tab.activeTabClass
                      : 'text-champagne-200 hover:text-gold-300 hover:bg-white/[0.04]'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="text-[11px] sm:text-xs truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Portal Header with Dynamic Role Identity */}
        <div className="text-center space-y-2 pt-1">
          <div className="inline-flex items-center space-x-2 text-gold-400 text-[11px] uppercase tracking-[0.25em] font-bold bg-gold-500/10 px-4 py-1.5 rounded-full border border-gold-500/30 shadow-sm">
            <ActiveIcon className="w-3.5 h-3.5 text-gold-400" />
            <span>{activeConfig.badge}</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl text-ivory-50 font-light">
            {activeConfig.title}
          </h1>

          <p className="text-xs text-champagne-200/80 font-light leading-relaxed max-w-md mx-auto">
            {activeConfig.subtitle}
          </p>
        </div>

        {/* 3. Role Key Capabilities Pills */}
        <div className="p-3 bg-white/[0.03] rounded-2xl border border-gold-500/20 space-y-1.5">
          <p className="text-[10px] uppercase tracking-widest text-gold-400/80 font-bold px-1">
            ✦ Included Portal Privileges
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10.5px] text-champagne-200">
            {activeConfig.features.map((feat, i) => (
              <div key={i} className="flex items-start space-x-1.5 bg-black/20 p-1.5 rounded-lg">
                <CheckCircle2 className="w-3 h-3 text-gold-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Error Alert Banner (if backend authentication fails) */}
        {formError && (
          <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start space-x-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block text-red-300 mb-0.5">Authentication Error</span>
              <p className="leading-relaxed">{formError}</p>
            </div>
          </div>
        )}

        {/* 5. Clean Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gold-400 font-semibold mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gold-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formError) setFormError(null);
                }}
                placeholder={activeConfig.placeholderEmail}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gold-500/30 bg-[#14141C] text-ivory-50 placeholder:text-ivory-600 text-xs focus:outline-none focus:border-gold-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs uppercase tracking-wider text-gold-400 font-semibold">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-champagne-400 hover:text-gold-300 flex items-center space-x-1"
              >
                {showPassword ? (
                  <>
                    <EyeOff className="w-3 h-3" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" />
                    <span>Show</span>
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gold-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formError) setFormError(null);
                }}
                placeholder="Enter your account password"
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-gold-500/30 bg-[#14141C] text-ivory-50 placeholder:text-ivory-600 text-xs focus:outline-none focus:border-gold-400 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-gold-500 via-amber-500 to-champagne-500 text-obsidian-950 font-bold text-xs uppercase tracking-[0.2em] shadow-md hover:brightness-110 shadow-glow-pill transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-obsidian-950" />
                <span>Verifying Account Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to {activeConfig.label}</span>
                <ArrowRight className="w-4 h-4 text-obsidian-950" />
              </>
            )}
          </button>
        </form>

        {/* 6. Contextual Footer Links & Role Routing */}
        <div className="pt-2 text-center text-xs text-champagne-300/80 space-y-3 border-t border-gold-500/20">
          {selectedRole === 'customer' ? (
            <p>
              New event client?{' '}
              <Link href="/register" className="text-gold-400 font-semibold hover:underline">
                Create Private Client Account →
              </Link>
            </p>
          ) : (
            <p className="text-[11px] text-champagne-400/70 flex items-center justify-center space-x-1">
              <Shield className="w-3.5 h-3.5 text-gold-400" />
              <span>Internal staff & administrator verification. Access is monitored and logged in studio audit records.</span>
            </p>
          )}

          <div className="flex items-center justify-center space-x-4 text-[11px] text-ivory-400">
            <Link href="/" className="hover:text-gold-400 transition-colors">
              ← Return to Main Atelier
            </Link>
            <span>•</span>
            <Link href="/packages" className="hover:text-gold-400 transition-colors">
              Browse Collections
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070709] flex items-center justify-center text-ivory-50">
          <div className="text-gold-400 text-xs uppercase tracking-widest animate-pulse font-serif">
            Loading Authentication Terminal...
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
