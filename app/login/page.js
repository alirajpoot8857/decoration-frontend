'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/context/AuthContext';
import { Sparkles, Lock, Mail, ArrowRight, Shield, User, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === 'ADMIN' || loggedInUser.role === 'STAFF') {
        router.push('/admin');
      } else {
        router.push('/portal');
      }
    } catch (err) {
      // Error toast shown in context
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen bg-ivory-100 flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-ivory-50 border border-champagne-300 p-8 sm:p-10 rounded-3xl shadow-luxury-lg relative overflow-hidden">
        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-bl-full pointer-events-none" />

        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 text-gold-700 text-xs uppercase tracking-[0.25em] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Atelier Access</span>
          </div>
          <h2 className="font-serif text-3xl text-obsidian-950 font-light">
            Sign In to Lumière
          </h2>
          <p className="text-xs text-obsidian-500 font-light">
            Enter your credentials to manage your bookings and rentals.
          </p>
        </div>

        {/* Quick Demo Login Buttons */}
        <div className="p-3.5 bg-champagne-50 rounded-2xl border border-champagne-300/80 space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-gold-800 font-bold text-center">
            ⚡ 1-Click Demo Logins
          </p>
          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@lumieredecor.com', 'Admin@123456')}
              className="py-1.5 px-2 bg-white border border-champagne-300 rounded-lg hover:border-gold-500 text-obsidian-800 font-medium truncate"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('staff@lumieredecor.com', 'Staff@123456')}
              className="py-1.5 px-2 bg-white border border-champagne-300 rounded-lg hover:border-gold-500 text-obsidian-800 font-medium truncate"
            >
              🛠️ Staff
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('customer@example.com', 'Customer@123456')}
              className="py-1.5 px-2 bg-white border border-champagne-300 rounded-lg hover:border-gold-500 text-obsidian-800 font-medium truncate"
            >
              💎 Customer
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-obsidian-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-champagne-300 bg-white text-sm focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-obsidian-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-champagne-300 bg-white text-sm focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-gold-600 via-gold-500 to-champagne-500 text-obsidian-950 font-semibold text-xs uppercase tracking-[0.2em] shadow-md hover:shadow-glow-gold transition-all flex items-center justify-center"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin text-obsidian-950" />
                Authenticating...
              </>
            ) : (
              'Sign In to Atelier'
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-obsidian-500 space-y-2">
          <p>
            Don’t have an account yet?{' '}
            <Link href="/register" className="text-gold-700 font-semibold hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
