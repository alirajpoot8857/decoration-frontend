'use client';

import React, { useState, useEffect } from 'react';
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
      router.push('/login');
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
      <div className="min-h-screen bg-ivory-100 flex items-center justify-center">
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
        return 'bg-sage-100 text-sage-800 border-sage-300';
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'IN_PROGRESS':
      case 'RENTED':
        return 'bg-gold-100 text-gold-900 border-gold-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-champagne-200 text-obsidian-800 border-champagne-300';
    }
  };

  return (
    <div className="bg-ivory-100 text-obsidian-900 pt-24 sm:pt-28 pb-16 sm:pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="bg-ivory-50 border border-champagne-300 rounded-3xl p-5 sm:p-8 lg:p-10 shadow-luxury mb-8 sm:mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="inline-flex items-center space-x-2 text-gold-700 text-xs uppercase tracking-[0.25em] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Client Portal</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-obsidian-950 font-light">
              Welcome, {user?.name || 'Valued Client'}
            </h1>
            <p className="text-xs text-obsidian-500 font-light">
              Manage your event consultations, décor booking requests, and rental orders.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex-1 sm:flex-initial text-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs uppercase tracking-widest font-semibold transition-all ${
                activeTab === 'bookings'
                  ? 'bg-obsidian-900 text-ivory-50 shadow-md'
                  : 'bg-white border border-champagne-300 text-obsidian-700 hover:bg-champagne-100'
              }`}
            >
              Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('rentals')}
              className={`flex-1 sm:flex-initial text-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs uppercase tracking-widest font-semibold transition-all ${
                activeTab === 'rentals'
                  ? 'bg-obsidian-900 text-ivory-50 shadow-md'
                  : 'bg-white border border-champagne-300 text-obsidian-700 hover:bg-champagne-100'
              }`}
            >
              Rentals ({rentals.length})
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 sm:flex-initial text-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs uppercase tracking-widest font-semibold transition-all ${
                activeTab === 'profile'
                  ? 'bg-obsidian-900 text-ivory-50 shadow-md'
                  : 'bg-white border border-champagne-300 text-obsidian-700 hover:bg-champagne-100'
              }`}
            >
              Profile
            </button>
          </div>
        </div>

        {/* Tab 1: Bookings */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <h3 className="font-serif text-2xl text-obsidian-950 font-light">
              Your Event Bookings
            </h3>

            {loadingData ? (
              <div className="py-16">
                <LuxurySpinner size="md" text="Loading event bookings..." />
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-ivory-50 border border-champagne-300 rounded-3xl p-12 text-center space-y-3">
                <Calendar className="w-12 h-12 text-champagne-500 mx-auto" />
                <h4 className="font-serif text-xl text-obsidian-800">No event bookings yet</h4>
                <p className="text-xs text-obsidian-500 max-w-sm mx-auto">
                  Ready to design your wedding or gala? Reserve a package or submit a consultation inquiry.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-ivory-50 border border-champagne-300 rounded-3xl p-6 sm:p-8 shadow-luxury space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-gold-700">
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

                      <h4 className="font-serif text-xl text-obsidian-950">
                        {booking.eventType} Celebration
                      </h4>

                      <div className="space-y-2 text-xs text-obsidian-600 font-light">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gold-600 flex-shrink-0" />
                          <span>Date: {new Date(booking.eventDate).toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gold-600 flex-shrink-0" />
                          <span>Venue: {booking.venue}</span>
                        </div>
                        {booking.packageName && (
                          <div className="flex items-center space-x-2">
                            <Sparkles className="w-4 h-4 text-gold-600 flex-shrink-0" />
                            <span>Package: {booking.packageName}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <Tag className="w-4 h-4 text-gold-600 flex-shrink-0" />
                          <span>Budget / Amount: PKR {booking.totalAmount.toLocaleString()}</span>
                        </div>
                      </div>

                      {booking.specialRequests && (
                        <p className="text-xs italic bg-champagne-100/50 p-3 rounded-xl text-obsidian-700">
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
            <h3 className="font-serif text-2xl text-obsidian-950 font-light">
              Your Rental Requests
            </h3>

            {loadingData ? (
              <div className="py-16">
                <LuxurySpinner size="md" text="Loading rental requests..." />
              </div>
            ) : rentals.length === 0 ? (
              <div className="bg-ivory-50 border border-champagne-300 rounded-3xl p-12 text-center space-y-3">
                <ShoppingBag className="w-12 h-12 text-champagne-500 mx-auto" />
                <h4 className="font-serif text-xl text-obsidian-800">No rental requests submitted</h4>
                <p className="text-xs text-obsidian-500 max-w-sm mx-auto">
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
                      className="bg-ivory-50 border border-champagne-300 rounded-3xl p-6 sm:p-8 shadow-luxury space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-gold-700">
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

                      <div className="text-xs text-obsidian-600 space-y-1">
                        <p>
                          <strong>Dates:</strong> {new Date(rental.eventDate).toLocaleDateString()} to{' '}
                          {new Date(rental.returnDate).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Total Items:</strong> {items.reduce((s, i) => s + i.quantity, 0)} units
                        </p>
                      </div>

                      <div className="p-3 bg-champagne-50 rounded-2xl space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-obsidian-500">Rental Subtotal</span>
                          <span className="font-semibold">PKR {rental.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gold-700">
                          <span>Security Deposit</span>
                          <span className="font-semibold">PKR {rental.deposit.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-champagne-200 pt-1 flex justify-between font-bold text-obsidian-950">
                          <span>Total Amount</span>
                          <span>PKR {rental.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Items Mini-list */}
                      <div className="space-y-1.5 pt-2">
                        <p className="text-[10px] uppercase tracking-widest text-obsidian-500 font-bold">
                          Reserved Items:
                        </p>
                        <ul className="text-xs text-obsidian-700 space-y-1">
                          {items.map((it, idx) => (
                            <li key={idx} className="flex justify-between">
                              <span>• {it.name} (x{it.quantity})</span>
                              <span className="font-medium">PKR {it.total?.toFixed(2)}</span>
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
          <div className="max-w-xl mx-auto bg-ivory-50 border border-champagne-300 rounded-3xl p-8 shadow-luxury space-y-6">
            <h3 className="font-serif text-2xl text-obsidian-950 font-light">
              Client Profile Settings
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full text-sm p-3 rounded-xl border border-champagne-300 bg-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full text-sm p-3 rounded-xl border border-champagne-200 bg-champagne-100 text-obsidian-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                  Phone Number (Pakistan 🇵🇰)
                </label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full text-sm p-3 rounded-xl border border-champagne-300 bg-white focus:outline-none focus:border-gold-500"
                  placeholder="03140660985 or +923140660985"
                />
              </div>

              <div className="pt-4 border-t border-champagne-200 space-y-4">
                <p className="text-xs uppercase tracking-widest text-gold-700 font-bold">
                  Change Password (Optional)
                </p>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={profileForm.currentPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                    className="w-full text-sm p-3 rounded-xl border border-champagne-300 bg-white focus:outline-none focus:border-gold-500"
                    placeholder="Enter current password to change"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    minLength={6}
                    value={profileForm.newPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                    className="w-full text-sm p-3 rounded-xl border border-champagne-300 bg-white focus:outline-none focus:border-gold-500"
                    placeholder="New password (min 6 characters)"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-gold-600 to-champagne-500 text-obsidian-950 font-semibold text-xs uppercase tracking-[0.2em] shadow-md hover:shadow-glow-gold transition-all flex items-center justify-center"
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
