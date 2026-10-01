'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/context/AuthContext';
import { useToast } from '../../src/context/ToastContext';
import api from '../../src/lib/api';
import { isValidPakistaniPhone } from '../../src/lib/validation';
import LuxurySpinner from '../../src/components/ui/LuxurySpinner';
import {
  Calendar,
  ShoppingBag,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MapPin,
  Tag,
  ShieldCheck,
} from 'lucide-react';

export default function CustomerPortalPage() {
  const router = useRouter();
  const { user, loading: authLoading, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'rentals' | 'profile'
  const [bookings, setBookings] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?role=customer&redirect=/portal');
    } else if (user) {
      setProfileForm((prev) => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
      }));
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setLoadingData(true);
        try {
          const [bRes, rRes] = await Promise.all([
            api.getBookings(),
            api.getRentalRequests(),
          ]);
          if (bRes.bookings) setBookings(bRes.bookings);
          if (rRes.rentalRequests) setRentals(rRes.rentalRequests);
        } catch (e) {
          console.warn('Failed to load customer portal data', e);
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (profileForm.phone && profileForm.phone.trim() && !isValidPakistaniPhone(profileForm.phone)) {
      showToast('Please enter a valid Pakistani phone number (e.g. 03140660985 or +923140660985).', 'error');
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        currentPassword: profileForm.currentPassword || undefined,
        newPassword: profileForm.newPassword || undefined,
      });
      setProfileForm((prev) => ({ ...prev, currentPassword: '', newPassword: '' }));
    } catch (e) {
      // Toast handled
    } finally {
      setSavingProfile(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#070709] flex items-center justify-center">
        <LuxurySpinner size="lg" text="Accessing client sanctuary..." />
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
      case 'APPROVED':
      case 'COMPLETED':
      case 'RETURNED':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40';
      case 'PENDING':
        return 'bg-amber-950/80 text-amber-400 border-amber-500/40';
      case 'IN_PROGRESS':
      case 'RENTED':
        return 'bg-gold-500/20 text-gold-300 border-gold-500/50';
      case 'CANCELLED':
        return 'bg-red-950/80 text-red-400 border-red-500/40';
      default:
        return 'bg-[#181824] text-ivory-300 border-gold-500/20';
    }
  };

  return (
    <div className="bg-[#070709] text-ivory-50 pt-24 sm:pt-28 pb-16 sm:pb-20 min-h-screen selection:bg-gold-500 selection:text-obsidian-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Studio Operator Notice (if admin or staff) */}
        {(user.role === 'ADMIN' || user.role === 'STAFF') && (
          <div className="p-3.5 bg-gradient-to-r from-gold-500/15 via-amber-500/10 to-transparent border border-gold-500/35 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 text-gold-400">
              <Sparkles className="w-4 h-4 text-gold-400 shrink-0" />
              <span>
                You are currently viewing as <strong className="text-ivory-50">{user.role} ({user.name})</strong>.
              </span>
            </div>
            <Link
              href="/admin"
              className="px-3.5 py-1.5 rounded-full bg-gold-500 text-obsidian-950 font-bold uppercase tracking-wider text-[10px] hover:brightness-110 shadow-sm shrink-0"
            >
              Open {user.role === 'ADMIN' ? 'Admin Suite' : 'Staff Terminal'} →
            </Link>
          </div>
        )}

        {/* Welcome Header */}
        <div className="bg-[#0C0C12] border border-gold-500/30 rounded-3xl p-5 sm:p-8 lg:p-10 shadow-2xl mb-8 sm:mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="inline-flex items-center space-x-2 text-gold-400 text-xs uppercase tracking-[0.25em] font-semibold bg-gold-500/10 px-3.5 py-1 rounded-full border border-gold-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Client Portal</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-ivory-50 font-light">
              Welcome, {user?.name || 'Valued Client'}
            </h1>
            <p className="text-xs text-ivory-400 font-light">
              Manage your event consultations, décor booking requests, and rental orders in Pakistan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex-1 sm:flex-initial text-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs uppercase tracking-widest font-semibold transition-all ${
                activeTab === 'bookings'
                  ? 'bg-gradient-to-r from-gold-500 to-champagne-500 text-obsidian-950 shadow-md font-bold'
                  : 'bg-[#14141C] border border-gold-500/20 text-ivory-300 hover:bg-[#1A1A26]'
              }`}
            >
              Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('rentals')}
              className={`flex-1 sm:flex-initial text-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs uppercase tracking-widest font-semibold transition-all ${
                activeTab === 'rentals'
                  ? 'bg-gradient-to-r from-gold-500 to-champagne-500 text-obsidian-950 shadow-md font-bold'
                  : 'bg-[#14141C] border border-gold-500/20 text-ivory-300 hover:bg-[#1A1A26]'
              }`}
            >
              Rentals ({rentals.length})
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 sm:flex-initial text-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs uppercase tracking-widest font-semibold transition-all ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-gold-500 to-champagne-500 text-obsidian-950 shadow-md font-bold'
                  : 'bg-[#14141C] border border-gold-500/20 text-ivory-300 hover:bg-[#1A1A26]'
              }`}
            >
              Profile
            </button>
          </div>
        </div>

        {/* Tab 1: Bookings */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <h3 className="font-serif text-2xl text-ivory-50 font-light">
              Your Event Bookings
            </h3>

            {loadingData ? (
              <div className="py-16">
                <LuxurySpinner size="md" text="Loading event bookings..." />
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-[#0C0C12] border border-gold-500/20 rounded-3xl p-12 text-center space-y-3">
                <Calendar className="w-12 h-12 text-gold-400/50 mx-auto" />
                <h4 className="font-serif text-xl text-ivory-200">No event bookings yet</h4>
                <p className="text-xs text-ivory-400 max-w-sm mx-auto">
                  Ready to design your wedding or gala? Reserve a package or submit a consultation inquiry.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="festivity-card-dark bg-[#0C0C12] border border-gold-500/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-gold-400">
                          #{booking.bookingNumber}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full border ${getStatusBadge(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <h4 className="font-serif text-xl text-ivory-50">
                        {booking.eventType} Celebration
                      </h4>

                      <div className="space-y-2 text-xs text-ivory-300 font-light">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gold-400 flex-shrink-0" />
                          <span>Date: {new Date(booking.eventDate).toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gold-400 flex-shrink-0" />
                          <span>Venue: {booking.venue}</span>
                        </div>
                        {booking.packageName && (
                          <div className="flex items-center space-x-2">
                            <Sparkles className="w-4 h-4 text-gold-400 flex-shrink-0" />
                            <span>Package: {booking.packageName}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <Tag className="w-4 h-4 text-gold-400 flex-shrink-0" />
                          <span>Budget / Amount: PKR {booking.totalAmount.toLocaleString()}</span>
                        </div>
                      </div>

                      {booking.specialRequests && (
                        <p className="text-xs italic bg-[#14141C] border border-gold-500/20 p-3 rounded-xl text-ivory-300">
                          "{booking.specialRequests}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Rentals */}
        {activeTab === 'rentals' && (
          <div className="space-y-6">
            <h3 className="font-serif text-2xl text-ivory-50 font-light">
              Your Rental Requests
            </h3>

            {loadingData ? (
              <div className="py-16">
                <LuxurySpinner size="md" text="Loading rental requests..." />
              </div>
            ) : rentals.length === 0 ? (
              <div className="bg-[#0C0C12] border border-gold-500/20 rounded-3xl p-12 text-center space-y-3">
                <ShoppingBag className="w-12 h-12 text-gold-400/50 mx-auto" />
                <h4 className="font-serif text-xl text-ivory-200">No rental requests submitted</h4>
                <p className="text-xs text-ivory-400 max-w-sm mx-auto">
                  Browse our catalog of chairs, arches, chandeliers, and centerpieces to submit a request.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rentals.map((rental) => {
                  const items = Array.isArray(rental.items)
                    ? rental.items
                    : typeof rental.itemsJson === 'string'
                    ? JSON.parse(rental.itemsJson || '[]')
                    : [];

                  return (
                    <div
                      key={rental.id}
                      className="festivity-card-dark bg-[#0C0C12] border border-gold-500/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-gold-400">
                          #{rental.rentalNumber}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full border ${getStatusBadge(
                            rental.status
                          )}`}
                        >
                          {rental.status}
                        </span>
                      </div>

                      <div className="text-xs text-ivory-300 space-y-1">
                        <p>
                          <strong>Dates:</strong> {new Date(rental.eventDate).toLocaleDateString()} to{' '}
                          {new Date(rental.returnDate).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Total Items:</strong> {items.reduce((s, i) => s + i.quantity, 0)} units
                        </p>
                      </div>

                      <div className="p-3 bg-[#14141C] border border-gold-500/20 rounded-2xl space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-ivory-400">Rental Subtotal</span>
                          <span className="font-semibold text-ivory-100">PKR {rental.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gold-400">
                          <span>Security Deposit</span>
                          <span className="font-semibold">PKR {rental.deposit.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-gold-500/20 pt-1 flex justify-between font-bold text-gold-gradient">
                          <span>Total Amount</span>
                          <span>PKR {rental.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Items Mini-list */}
                      <div className="space-y-1.5 pt-2">
                        <p className="text-[10px] uppercase tracking-widest text-gold-400 font-bold">
                          Reserved Items:
                        </p>
                        <ul className="text-xs text-ivory-300 space-y-1">
                          {items.map((it, idx) => (
                            <li key={idx} className="flex justify-between">
                              <span>• {it.name} (x{it.quantity})</span>
                              <span className="font-medium text-ivory-200">PKR {it.total?.toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Profile Settings */}
        {activeTab === 'profile' && (
          <div className="max-w-xl mx-auto bg-[#0C0C12] border border-gold-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <h3 className="font-serif text-2xl text-ivory-50 font-light">
              Client Profile Settings
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gold-400 font-semibold mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-gold-500/30 bg-[#14141C] text-ivory-50 focus:outline-none focus:border-gold-400"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gold-400 font-semibold mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full text-xs p-3 rounded-xl border border-gold-500/20 bg-[#181822] text-ivory-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gold-400 font-semibold mb-1">
                  Phone Number (Pakistan 🇵🇰)
                </label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-gold-500/30 bg-[#14141C] text-ivory-50 focus:outline-none focus:border-gold-400"
                  placeholder="03140660985 or +923140660985"
                />
              </div>

              <div className="pt-4 border-t border-gold-500/20 space-y-4">
                <p className="text-xs uppercase tracking-widest text-gold-400 font-bold">
                  Change Password (Optional)
                </p>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gold-400 font-semibold mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={profileForm.currentPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-gold-500/30 bg-[#14141C] text-ivory-50 focus:outline-none focus:border-gold-400"
                    placeholder="Enter current password to change"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gold-400 font-semibold mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    minLength={6}
                    value={profileForm.newPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-gold-500/30 bg-[#14141C] text-ivory-50 focus:outline-none focus:border-gold-400"
                    placeholder="New password (min 6 characters)"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-gold-500 to-champagne-500 text-obsidian-950 font-bold text-xs uppercase tracking-[0.2em] shadow-md hover:brightness-110 shadow-glow-pill transition-all flex items-center justify-center"
              >
                {savingProfile ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin text-obsidian-950" />
                    Saving Changes...
                  </>
                ) : (
                  'Save Profile Details'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
