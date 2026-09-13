'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../src/lib/api';
import { useToast } from '../../../src/context/ToastContext';
import { useTheme } from '../../../src/context/ThemeContext';
import { useDiscount } from '../../../src/context/DiscountContext';
import LuxurySpinner from '../../../src/components/ui/LuxurySpinner';
import { isValidPakistaniPhone } from '../../../src/lib/validation';
import {
  Settings,
  Save,
  Palette,
  CheckCircle2,
  AlertCircle,
  Mail,
  Send,
  Phone,
  MapPin,
  Tag,
  DollarSign,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Crown,
  Layers,
  Search,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const { siteName, tagline, colorTheme, themesList, updateBrandAndTheme, setColorTheme } = useTheme();
  const { refreshSettings } = useDiscount();

  const [themeFilter, setThemeFilter] = useState('ALL'); // 'ALL' | 'DARK' | 'LIGHT'
  const [themeCategoryFilter, setThemeCategoryFilter] = useState('ALL');
  const [themeSearchQuery, setThemeSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState(null);
  const [errors, setErrors] = useState({});

  const [settings, setSettings] = useState({
    siteName: 'LUMIÈRE DECOR',
    tagline: 'Haute Scénographie & Luxury Event Decoration',
    colorTheme: 'royalGold',
    contact_email: 'concierge@lumieredecor.com',
    contact_phone: '03140660985',
    studio_address: '9450 Wilshire Blvd, Suite 800, Beverly Hills, CA 90212',
    admin_notification_email: 'work443366@gmail.com',
    admin_whatsapp: '03140660985',
    default_deposit_rate: '0.30',
    sales_tax_rate: '0.08',
    currency: 'PKR',
    // Custom SMTP
    smtp_host: '',
    smtp_port: '587',
    smtp_user: '',
    smtp_pass: '',
    smtp_secure: 'false',
    gmail_user: '',
    gmail_app_password: '',
    // Discount & Promotion Settings
    sitewide_discount_percentage: '15',
    sitewide_discount_active: 'true',
    sitewide_discount_banner: '✨ Grand Season Offer: Enjoy 15% OFF across all Luxury Packages & Rental Catalog! Use code LUMIERE15',
    promo_code: 'LUMIERE15',
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.getSettings();
      if (res && res.settings) {
        setSettings((prev) => ({
          ...prev,
          ...res.settings,
          siteName: res.settings.siteName || res.settings.site_name || prev.siteName,
          colorTheme: res.settings.colorTheme || res.settings.color_theme || prev.colorTheme,
          admin_notification_email: res.settings.admin_notification_email || 'work443366@gmail.com',
          admin_whatsapp: res.settings.admin_whatsapp || '03140660985',
        }));
      }
    } catch (e) {
      console.warn('Failed to load settings', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!settings.siteName || !settings.siteName.trim()) {
      newErrors.siteName = 'Site/Brand name cannot be empty.';
    }
    if (settings.contact_email && settings.contact_email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(settings.contact_email.trim())) {
        newErrors.contact_email = 'Please provide a valid contact email.';
      }
    }
    if (settings.contact_phone && settings.contact_phone.trim() && !isValidPakistaniPhone(settings.contact_phone)) {
      newErrors.contact_phone = 'Please provide a valid Pakistani phone number (e.g. 03140660985 or +923140660985).';
    }
    const pct = Number(settings.sitewide_discount_percentage);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      newErrors.sitewide_discount_percentage = 'Discount must be between 0% and 100%.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectTheme = (themeId) => {
    setSettings((prev) => ({ ...prev, colorTheme: themeId }));
    setColorTheme(themeId);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please fix configuration errors before saving.', 'error');
      return;
    }

    setSaving(true);
    try {
      // 1. Update Context and local storage
      await updateBrandAndTheme(settings.siteName, settings.colorTheme, settings.tagline);

      // 2. Save all settings to backend database
      await api.updateSettings({
        ...settings,
        site_name: settings.siteName,
        color_theme: settings.colorTheme,
      });

      await refreshSettings();
      showToast('Site configuration, brand name & color theme saved and applied sitewide!', 'success');
      setErrors({});
    } catch (e) {
      showToast('Failed to save settings to database', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    setTestingEmail(true);
    setEmailTestResult(null);
    try {
      const target = settings.admin_notification_email || 'work443366@gmail.com';
      const res = await api.sendTestNotificationEmail(target);
      if (res.success) {
        setEmailTestResult({
          success: true,
          message: `Live test notification email dispatched to ${target}!`,
          previewUrl: res.previewUrl,
          providerName: res.providerName,
          isRealDelivery: res.isRealDelivery,
        });
        showToast(`Test email successfully sent to ${target}!`, 'success');
      } else {
        setEmailTestResult({
          success: false,
          message: res.message || 'Failed to dispatch test email',
        });
        showToast(res.message || 'Test email failed', 'error');
      }
    } catch (err) {
      setEmailTestResult({
        success: false,
        message: err.message || 'Failed to connect to email transport',
      });
      showToast('Failed to dispatch test email', 'error');
    } finally {
      setTestingEmail(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 text-gold-700 text-[10px] uppercase tracking-[0.25em] font-semibold">
          <Settings className="w-3.5 h-3.5" />
          <span>Atelier Command & Brand Control</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-obsidian-950 font-light">
          Brand Name, Color Themes & Notification Settings
        </h1>
        <p className="text-xs text-obsidian-500 font-light mt-1">
          Customize your website brand name, select color themes, configure real-time order email notifications, and manage rental policies.
        </p>
      </div>

      {loading ? (
        <div className="py-20">
          <LuxurySpinner size="lg" text="Loading studio settings & brand configuration..." />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8">
          {/* ========================================================================= */}
          {/* 1. BRAND IDENTITY & SITE NAME CUSTOMIZATION                               */}
          {/* ========================================================================= */}
          <div className="bg-white border border-champagne-300/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center space-x-3 border-b border-champagne-200 pb-3">
              <div className="p-2 rounded-full bg-gold-500/10 text-gold-800">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-medium text-obsidian-950">
                  Website Name & Brand Identity
                </h3>
                <p className="text-xs text-obsidian-500">
                  Whatever site name you enter here will automatically update and appear across the entire website, navigation, footer, and dashboard.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-obsidian-800 font-semibold mb-1">
                  Website Name * (Dynamic Sitewide)
                </label>
                <input
                  type="text"
                  required
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  placeholder="e.g. Lumière Décor"
                  className={`w-full text-sm p-3 rounded-xl border bg-white focus:outline-none focus:border-gold-500 font-serif ${
                    errors.siteName ? 'border-red-400' : 'border-champagne-300'
                  }`}
                />
                {errors.siteName && <p className="text-[10px] text-red-600 mt-1">{errors.siteName}</p>}
                <span className="text-[10px] text-obsidian-400 mt-1 block">
                  Displayed in navigation bar, headers, page titles, footer, and admin drawer.
                </span>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-obsidian-800 font-semibold mb-1">
                  Brand Tagline & Subtitle
                </label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  placeholder="Haute Scénographie & Luxury Event Decoration"
                  className="w-full text-sm p-3 rounded-xl border border-champagne-300 bg-white focus:outline-none focus:border-gold-500"
                />
                <span className="text-[10px] text-obsidian-400 mt-1 block">
                  Featured under brand logo across the site.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-champagne-100">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                  Concierge Inquiries Email
                </label>
                <input
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                  placeholder="concierge@lumieredecor.com"
                  className="w-full text-xs p-3 rounded-xl border border-champagne-300 bg-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                  Studio Phone / WhatsApp (Pakistan 🇵🇰)
                </label>
                <input
                  type="text"
                  value={settings.contact_phone}
                  onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                  placeholder="03140660985"
                  className={`w-full text-xs p-3 rounded-xl border bg-white focus:outline-none focus:border-gold-500 ${
                    errors.contact_phone ? 'border-red-400' : 'border-champagne-300'
                  }`}
                />
                {errors.contact_phone && <p className="text-[10px] text-red-600 mt-1">{errors.contact_phone}</p>}
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                Flagship Studio / Atelier Address
              </label>
              <input
                type="text"
                value={settings.studio_address}
                onChange={(e) => setSettings({ ...settings, studio_address: e.target.value })}
                placeholder="9450 Wilshire Blvd, Suite 800, Beverly Hills, CA 90212"
                className="w-full text-xs p-3 rounded-xl border border-champagne-300 bg-white focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. COLOR THEME SELECTOR                                                   */}
          {/* ========================================================================= */}
          <div className="bg-white border border-champagne-300/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-champagne-200 pb-4 gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-gold-500/10 text-gold-800">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-medium text-obsidian-950 flex items-center gap-2">
                    Luxury Color Theme Library <span className="text-xs bg-gold-500/20 text-gold-900 font-sans font-bold px-2.5 py-0.5 rounded-full">{themesList.length} Themes</span>
                  </h3>
                  <p className="text-xs text-obsidian-500">
                    Explore 52 curated palettes spanning Golds, Jewels, Florals, Botanicals, Modern Darks, and Soft Lights.
                  </p>
                </div>
              </div>

              <span className="px-3.5 py-1.5 bg-champagne-100 text-obsidian-900 text-xs rounded-full font-bold uppercase tracking-wider border border-champagne-300 self-start sm:self-auto flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active: {themesList.find((t) => t.id === settings.colorTheme)?.name || 'Royal Gold'}
              </span>
            </div>

            {/* Search and Filter Bar */}
            <div className="space-y-3 pt-1">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-obsidian-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={themeSearchQuery}
                    onChange={(e) => setThemeSearchQuery(e.target.value)}
                    placeholder="Search 52 themes (e.g. Ruby, Sage, Gold, Dark)..."
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-champagne-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500 transition-all"
                  />
                  {themeSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setThemeSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-obsidian-400 hover:text-obsidian-700"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Mode Selector */}
                <div className="flex items-center space-x-1.5 bg-champagne-100/70 p-1 rounded-xl text-[11px] font-semibold uppercase tracking-wider self-stretch sm:self-auto justify-center">
                  <button
                    type="button"
                    onClick={() => setThemeFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      themeFilter === 'ALL'
                        ? 'bg-obsidian-950 text-gold-300 font-bold shadow-sm'
                        : 'text-obsidian-600 hover:text-obsidian-950'
                    }`}
                  >
                    All ({themesList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setThemeFilter('DARK')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      themeFilter === 'DARK'
                        ? 'bg-obsidian-950 text-gold-300 font-bold shadow-sm'
                        : 'text-obsidian-600 hover:text-obsidian-950'
                    }`}
                  >
                    🌙 Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => setThemeFilter('LIGHT')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      themeFilter === 'LIGHT'
                        ? 'bg-obsidian-950 text-gold-300 font-bold shadow-sm'
                        : 'text-obsidian-600 hover:text-obsidian-950'
                    }`}
                  >
                    ☀️ Light
                  </button>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px] font-semibold scrollbar-thin">
                {[
                  { id: 'ALL', label: 'All Collections', icon: '👑' },
                  { id: 'GOLDS', label: 'Golds & Metallics', icon: '🌟' },
                  { id: 'JEWELS', label: 'Jewels & Royal', icon: '💎' },
                  { id: 'FLORALS', label: 'Florals & Romance', icon: '🌹' },
                  { id: 'BOTANICALS', label: 'Botanicals & Earth', icon: '🌿' },
                  { id: 'DARKS', label: 'Modern Dark', icon: '🌙' },
                  { id: 'LIGHTS', label: 'Soft Ivory', icon: '☀️' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setThemeCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                      themeCategoryFilter === cat.id
                        ? 'bg-gold-500 text-obsidian-950 font-bold shadow-sm'
                        : 'bg-ivory-100 text-obsidian-600 hover:bg-champagne-100 hover:text-obsidian-900 border border-champagne-200/60'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Fixed-Height Theme Grid */}
            <div className="max-h-[500px] overflow-y-auto pr-2 border border-champagne-200/80 rounded-2xl p-3 bg-ivory-50/40">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {themesList
                  .filter((theme) => {
                    // Category filter
                    if (themeCategoryFilter !== 'ALL' && theme.category !== themeCategoryFilter) {
                      return false;
                    }
                    // Mode filter
                    if (themeFilter === 'DARK' && theme.mode !== 'DARK') return false;
                    if (themeFilter === 'LIGHT' && theme.mode !== 'LIGHT') return false;
                    // Search query
                    if (themeSearchQuery.trim()) {
                      const q = themeSearchQuery.toLowerCase();
                      const matchName = theme.name.toLowerCase().includes(q);
                      const matchDesc = theme.description && theme.description.toLowerCase().includes(q);
                      const matchId = theme.id.toLowerCase().includes(q);
                      const matchCat = theme.category && theme.category.toLowerCase().includes(q);
                      return matchName || matchDesc || matchId || matchCat;
                    }
                    return true;
                  })
                  .map((theme) => {
                    const isSelected = settings.colorTheme === theme.id;
                    return (
                      <div
                        key={theme.id}
                        onClick={() => handleSelectTheme(theme.id)}
                        className={`cursor-pointer rounded-2xl p-3.5 border-2 transition-all relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? 'border-gold-600 bg-white shadow-md ring-2 ring-gold-400/50 scale-[1.01]'
                            : 'border-champagne-200/90 bg-white hover:border-gold-400 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-2.5">
                            <div
                              className="w-8 h-8 rounded-full shadow-inner border border-black/15 flex-shrink-0 mt-0.5"
                              style={{ backgroundColor: theme.primary }}
                            />
                            <div>
                              <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                                <h4 className="font-serif text-xs font-bold text-obsidian-950 leading-snug">
                                  {theme.name}
                                </h4>
                                <span
                                  className={`text-[7.5px] font-bold px-1.5 py-0.5 rounded font-mono uppercase ${
                                    theme.mode === 'DARK'
                                      ? 'bg-obsidian-900 text-gold-300'
                                      : 'bg-champagne-200 text-obsidian-800'
                                  }`}
                                >
                                  {theme.mode || 'DARK'}
                                </span>
                              </div>
                              <p className="text-[9.5px] text-obsidian-500 mt-1 line-clamp-2 leading-relaxed">
                                {theme.description}
                              </p>
                            </div>
                          </div>

                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-gold-600 flex-shrink-0 ml-1.5" />
                          )}
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-champagne-100 flex items-center justify-between">
                          <div className="flex items-center space-x-1.5">
                            <span
                              className="w-3 h-3 rounded-full shadow-xs"
                              style={{ backgroundColor: theme.primary }}
                            />
                            <span
                              className="w-3 h-3 rounded-full shadow-xs"
                              style={{ backgroundColor: theme.primaryHover }}
                            />
                            <span
                              className="w-3 h-3 rounded-full shadow-xs"
                              style={{ backgroundColor: theme.primaryDark }}
                            />
                          </div>
                          <span className="text-[8.5px] uppercase tracking-wider text-obsidian-400 font-mono">
                            {theme.id}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. ORDER NOTIFICATION & MAIL TRANSPORT SETTINGS CARD                      */}
          {/* ========================================================================= */}
          <div className="bg-white border border-champagne-300/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-champagne-200 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-full bg-champagne-100 text-gold-700">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-medium text-obsidian-950">
                    Order Notification & Real-Time Email Delivery
                  </h3>
                  <p className="text-xs text-obsidian-500">
                    Configure the destination Gmail address and SMTP mail transport provider for automated order alerts.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={testingEmail}
                className="px-5 py-2.5 bg-obsidian-950 hover:bg-gold-600 text-ivory-50 hover:text-obsidian-950 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 shadow-md active:scale-95 flex-shrink-0"
              >
                {testingEmail ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-gold-400" />
                    <span>Sending Test...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-gold-400" />
                    <span>Send Live Test Email</span>
                  </>
                )}
              </button>
            </div>

            {/* Test result message */}
            {emailTestResult && (
              <div
                className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  !emailTestResult.success
                    ? 'bg-red-50 text-red-900 border-red-300'
                    : emailTestResult.isRealDelivery
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300 shadow-sm'
                    : 'bg-amber-50 text-amber-950 border-amber-300 shadow-sm'
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  {emailTestResult.isRealDelivery ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <span className="font-bold block text-sm">
                      {emailTestResult.isRealDelivery
                        ? '✅ Real Inbox Email Successfully Delivered!'
                        : '⚠️ Test Sandbox Generated (Real Gmail Inbox Delivery Pending)'}
                    </span>
                    <span className="text-[11px] text-obsidian-700 block mt-1 leading-relaxed">
                      {emailTestResult.isRealDelivery ? (
                        <span>Email was delivered directly to <strong>{settings.admin_notification_email || 'work443366@gmail.com'}</strong> inbox. Check your Gmail app!</span>
                      ) : (
                        <span>Email engine generated the HTML email successfully, but to deliver to your real Gmail inbox, Google requires your <strong>16-Character Google App Password</strong> below.</span>
                      )}
                    </span>
                    {emailTestResult.providerName && (
                      <span className="text-[10px] text-obsidian-500 block mt-1">
                        Mail Provider: <strong>{emailTestResult.providerName}</strong>
                      </span>
                    )}
                  </div>
                </div>
                {emailTestResult.previewUrl && (
                  <a
                    href={emailTestResult.previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 font-bold text-xs flex-shrink-0 transition-colors shadow-sm"
                  >
                    <span>View Generated Email Preview</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                  </a>
                )}
              </div>
            )}

            {/* Primary Recipient Coordinates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-obsidian-800 font-bold mb-1">
                  Recipient Admin Gmail Address (Destination) *
                </label>
                <input
                  type="email"
                  required
                  value={settings.admin_notification_email}
                  onChange={(e) =>
                    setSettings({ ...settings, admin_notification_email: e.target.value })
                  }
                  className="w-full text-xs p-3 rounded-xl border border-gold-400/60 bg-gold-50/20 font-bold text-obsidian-950 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-400"
                  placeholder="work443366@gmail.com"
                />
                <span className="text-[10px] text-obsidian-500 mt-1 block">
                  All new Rental orders and Gallery bespoke commission alerts are routed to this address.
                </span>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-obsidian-800 font-bold mb-1">
                  Recipient WhatsApp Concierge Number *
                </label>
                <input
                  type="text"
                  required
                  value={settings.admin_whatsapp}
                  onChange={(e) => setSettings({ ...settings, admin_whatsapp: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-champagne-300 bg-white font-mono font-semibold text-obsidian-950 focus:outline-none focus:border-gold-500"
                  placeholder="03140660985"
                />
                <span className="text-[10px] text-obsidian-500 mt-1 block">
                  Format: 03140660985 (+923140660985) for instant 1-click WhatsApp order dispatch.
                </span>
              </div>
            </div>

            {/* Live Mail Transport Credentials (Gmail / Custom SMTP) */}
            <div className="p-5 bg-champagne-50/70 border border-champagne-300/70 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-obsidian-900 font-bold flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-gold-600" />
                    <span>Direct Gmail Inbox Delivery Configuration</span>
                  </h4>
                  <p className="text-[11px] text-obsidian-500 mt-0.5">
                    To deliver directly to your actual Gmail inbox, enter your Google App Password or SMTP credentials below.
                  </p>
                </div>
                {(settings.gmail_app_password && settings.gmail_user) || (settings.smtp_host && settings.smtp_user && settings.smtp_pass) ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 self-start sm:self-auto">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                    Live Inbox Delivery Configured
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 self-start sm:self-auto">
                    <AlertCircle className="w-3 h-3 mr-1 text-amber-600" />
                    Pending App Password Setup
                  </span>
                )}
              </div>

              {/* Option 1: Gmail Service */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-obsidian-700 font-bold mb-1">
                    Gmail Sender Address
                  </label>
                  <input
                    type="email"
                    value={settings.gmail_user || ''}
                    onChange={(e) => setSettings({ ...settings, gmail_user: e.target.value })}
                    placeholder="work443366@gmail.com"
                    className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-obsidian-700 font-bold mb-1">
                    Google 16-Character App Password
                  </label>
                  <input
                    type="password"
                    value={settings.gmail_app_password || ''}
                    onChange={(e) => setSettings({ ...settings, gmail_app_password: e.target.value })}
                    placeholder="xxxx xxxx xxxx xxxx"
                    className="w-full text-xs p-2.5 rounded-xl border border-champagne-300 bg-white font-mono focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-white/80 rounded-xl border border-champagne-200 text-[11px] text-obsidian-600 leading-relaxed">
                💡 <strong>How to get Google App Password in 30 seconds:</strong> Go to your Google Account (<a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="text-gold-700 underline font-bold">myaccount.google.com/security</a>) &rarr; Enable 2-Step Verification &rarr; Search "App Passwords" &rarr; Create App named "Lumiere Atelier" &rarr; Paste the 16 letters above and click Save.
              </div>

              {/* Option 2: Custom SMTP */}
              <div className="pt-2 border-t border-champagne-200">
                <p className="text-[11px] font-bold text-obsidian-700 uppercase tracking-wider mb-2">
                  Or Custom SMTP Server (Hostinger, cPanel, Brevo, SendGrid):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-obsidian-500 mb-1">Host</label>
                    <input
                      type="text"
                      value={settings.smtp_host || ''}
                      onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                      placeholder="smtp.example.com"
                      className="w-full text-xs p-2 rounded-lg border border-champagne-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-obsidian-500 mb-1">Port</label>
                    <input
                      type="text"
                      value={settings.smtp_port || '587'}
                      onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value })}
                      placeholder="587"
                      className="w-full text-xs p-2 rounded-lg border border-champagne-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-obsidian-500 mb-1">Username</label>
                    <input
                      type="text"
                      value={settings.smtp_user || ''}
                      onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value })}
                      placeholder="user@example.com"
                      className="w-full text-xs p-2 rounded-lg border border-champagne-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-obsidian-500 mb-1">Password</label>
                    <input
                      type="password"
                      value={settings.smtp_pass || ''}
                      onChange={(e) => setSettings({ ...settings, smtp_pass: e.target.value })}
                      placeholder="••••••••"
                      className="w-full text-xs p-2 rounded-lg border border-champagne-300 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. SITEWIDE PROMOTIONS & DISCOUNT MANAGEMENT CARD                         */}
          {/* ========================================================================= */}
          <div className="bg-gradient-to-br from-ivory-50 to-champagne-100/60 border-2 border-gold-500/50 rounded-3xl p-6 sm:p-8 shadow-luxury space-y-5">
            <div className="flex items-center justify-between border-b border-gold-500/30 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-full bg-gold-500/20 text-gold-700">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-medium text-obsidian-950">
                    Sitewide Discount & Seasonal Promotions
                  </h3>
                  <p className="text-[11px] text-gold-800">
                    Set a percentage discount that dynamically applies across the entire catalog and checkout.
                  </p>
                </div>
              </div>

              {/* Active Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.sitewide_discount_active === 'true'}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      sitewide_discount_active: e.target.checked ? 'true' : 'false',
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-champagne-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-600"></div>
                <span className="ml-2 text-xs font-semibold text-obsidian-900 uppercase tracking-wider">
                  {settings.sitewide_discount_active === 'true' ? 'Active' : 'Disabled'}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-obsidian-800 font-semibold mb-1">
                  Sitewide Discount Percentage (%)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={Number(settings.sitewide_discount_percentage) || 0}
                    onChange={(e) =>
                      setSettings({ ...settings, sitewide_discount_percentage: e.target.value })
                    }
                    className="flex-1 accent-gold-600"
                  />
                  <div className="w-16 px-2.5 py-2 bg-white border border-gold-400 rounded-xl text-center font-bold text-sm text-gold-800 shadow-sm">
                    {settings.sitewide_discount_percentage}%
                  </div>
                </div>
                <span className="text-[10px] text-obsidian-500 mt-1 block">
                  e.g. 15% discount subtracts 15% from all rentals and orders
                </span>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-obsidian-800 font-semibold mb-1">
                  Active Promo Coupon Code
                </label>
                <input
                  type="text"
                  value={settings.promo_code}
                  onChange={(e) =>
                    setSettings({ ...settings, promo_code: e.target.value.toUpperCase() })
                  }
                  className="w-full text-xs p-3 rounded-xl border border-gold-400/60 bg-white uppercase font-mono font-bold tracking-wider"
                  placeholder="LUMIERE15"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-obsidian-800 font-semibold mb-1">
                Top Announcement Banner Message
              </label>
              <input
                type="text"
                value={settings.sitewide_discount_banner}
                onChange={(e) =>
                  setSettings({ ...settings, sitewide_discount_banner: e.target.value })
                }
                className="w-full text-xs p-3 rounded-xl border border-gold-400/60 bg-white"
                placeholder="Special Offer: Enjoy 15% OFF across all Luxury Packages & Rental Catalog!"
              />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 5. FINANCIAL & RENTAL POLICIES                                            */}
          {/* ========================================================================= */}
          <div className="bg-white border border-champagne-300/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-medium text-obsidian-950 border-b border-champagne-200 pb-3">
              Rental & Financial Policies
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                  Security Deposit (%)
                </label>
                <input
                  type="number"
                  required
                  step="0.05"
                  value={settings.default_deposit_rate}
                  onChange={(e) =>
                    setSettings({ ...settings, default_deposit_rate: e.target.value })
                  }
                  className="w-full text-xs p-3 rounded-xl border border-champagne-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                  Sales Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={settings.sales_tax_rate}
                  onChange={(e) => setSettings({ ...settings, sales_tax_rate: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-champagne-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold mb-1">
                  Currency Symbol (e.g. PKR)
                </label>
                <input
                  type="text"
                  required
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  placeholder="PKR"
                  className="w-full text-xs p-3 rounded-xl border border-champagne-300 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 bg-gradient-to-r from-gold-600 via-gold-500 to-champagne-500 text-obsidian-950 rounded-full font-bold text-xs uppercase tracking-[0.2em] shadow-md hover:shadow-glow-gold transition-all flex items-center"
            >
              {saving ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin text-obsidian-950" />
                  Applying Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Site Name, Color Theme & Settings
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
