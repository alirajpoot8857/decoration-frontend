'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Search, X, Check, Sparkles, Compass } from 'lucide-react';

export default function LocationPicker({
  label = 'Event Venue / Delivery Location',
  value = '',
  onChange,
  placeholder = 'Enter venue address or city...',
  required = false,
  error = null,
  autoDetect = true,
  className = '',
}) {
  const [detecting, setDetecting] = useState(false);
  const [detectedCity, setDetectedCity] = useState('');
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [coords, setCoords] = useState({ lat: 34.0736, lng: -118.4004 }); // Default to Beverly Hills
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMapAddress, setSelectedMapAddress] = useState(value || '');

  // Auto-detect location on mount if value is empty and autoDetect is true
  useEffect(() => {
    if (autoDetect && !value && typeof window !== 'undefined' && 'geolocation' in navigator) {
      handleDetectLocation(false);
    }
  }, []);

  // Reverse geocode lat/lng to readable address via OpenStreetMap Nominatim
  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.suburb ||
            data.address?.county ||
            'Detected Location';
          const road = data.address?.road || '';
          const state = data.address?.state || '';
          const postcode = data.address?.postcode || '';

          const cleanParts = [road, city, state, postcode].filter(Boolean);
          const formatted = cleanParts.length > 0 ? cleanParts.join(', ') : data.display_name;

          return { full: formatted, city };
        }
      }
    } catch (e) {
      console.warn('Reverse geocoding error:', e);
    }
    return { full: `Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}`, city: 'GPS Location' };
  };

  const handleDetectLocation = (showErrors = true) => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      if (showErrors) console.warn('Geolocation is not supported by your browser.');
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });

        const geo = await reverseGeocode(latitude, longitude);
        setDetectedCity(geo.city);
        setSelectedMapAddress(geo.full);
        onChange(geo.full);
        setDetecting(false);
      },
      (err) => {
        setDetecting(false);
        if (showErrors) {
          console.warn('Geolocation access denied or unavailable:', err.message);
          // If denied, prompt map modal
          setMapModalOpen(true);
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Search places via Nominatim
  const handleSearchPlaces = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data || []);
      }
    } catch (err) {
      console.warn('Places search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSearchResult = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setCoords({ lat, lng: lon });
    setSelectedMapAddress(result.display_name);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleConfirmMapLocation = () => {
    if (selectedMapAddress) {
      onChange(selectedMapAddress);
    }
    setMapModalOpen(false);
  };

  // Map embed URL with dynamic marker
  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.015}%2C${coords.lat - 0.015}%2C${coords.lng + 0.015}%2C${coords.lat + 0.015}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-[11px] uppercase tracking-wider text-obsidian-700 font-semibold">
            {label} {required && <span className="text-gold-700">*</span>}
          </label>
          {detectedCity && (
            <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>GPS: {detectedCity}</span>
            </span>
          )}
        </div>
      )}

      {/* Input container with Detect GPS & Interactive Map buttons */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold-600 flex items-center">
          <MapPin className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-24 py-2.5 sm:py-3 text-xs rounded-xl border bg-ivory-50 text-obsidian-950 focus:outline-none transition-all duration-200 shadow-sm ${
            error
              ? 'border-red-400 focus:border-red-500 ring-1 ring-red-300'
              : 'border-champagne-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 hover:border-gold-400'
          }`}
        />

        {/* Action icons on right of input */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1.5">
          {/* 1. Quick GPS Detect Button */}
          <button
            type="button"
            onClick={() => handleDetectLocation(true)}
            title="Auto-detect current location"
            className="p-1.5 rounded-lg bg-champagne-200/70 hover:bg-gold-500 hover:text-obsidian-950 text-obsidian-700 transition-colors flex items-center space-x-1 text-[10px] font-semibold"
          >
            <Navigation className={`w-3.5 h-3.5 ${detecting ? 'animate-spin text-gold-600' : ''}`} />
            <span className="hidden sm:inline">{detecting ? 'Detecting...' : 'GPS'}</span>
          </button>

          {/* 2. Interactive Map Picker Button */}
          <button
            type="button"
            onClick={() => {
              setSelectedMapAddress(value || selectedMapAddress);
              setMapModalOpen(true);
            }}
            title="Open Interactive Map"
            className="p-1.5 rounded-lg bg-obsidian-900 hover:bg-gold-600 text-ivory-50 hover:text-obsidian-950 transition-colors flex items-center space-x-1 text-[10px] font-semibold shadow-sm"
          >
            <Compass className="w-3.5 h-3.5 text-gold-400" />
            <span className="hidden sm:inline">Map</span>
          </button>
        </div>
      </div>

      {error && <p className="text-[10px] text-red-600 mt-0.5">{error}</p>}

      {/* LUXURY INTERACTIVE MAP SELECTION MODAL */}
      {mapModalOpen && (
        <div className="fixed inset-0 z-[99999] overflow-y-auto flex items-center justify-center p-3 sm:p-6 bg-obsidian-950/85 backdrop-blur-md">
          <div
            className="relative bg-ivory-50 text-obsidian-950 border border-gold-500/60 rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full flex flex-col space-y-4 p-5 sm:p-6 select-none"
            style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6), 0 0 25px rgba(212,175,55,0.3)' }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-champagne-300/80 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gold-500/10 text-gold-700 rounded-full">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-medium text-obsidian-950">
                    Pin Your Event Venue / Location
                  </h3>
                  <p className="text-[11px] text-obsidian-500 font-light">
                    Search an address or click anywhere to position your venue pin.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMapModalOpen(false)}
                className="p-2 rounded-full hover:bg-champagne-200 text-obsidian-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Address Search Bar inside Map Modal */}
            <div className="space-y-2">
              <form onSubmit={handleSearchPlaces} className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-obsidian-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search venue name, hotel, street address, or city..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-champagne-300 bg-white focus:outline-none focus:border-gold-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching}
                  className="px-4 py-2 bg-obsidian-900 hover:bg-gold-600 hover:text-obsidian-950 text-ivory-50 rounded-xl text-xs uppercase font-semibold tracking-wider transition-colors"
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDetectLocation(true)}
                  className="px-3 py-2 bg-champagne-200 hover:bg-gold-500 hover:text-obsidian-950 text-obsidian-800 rounded-xl text-xs font-semibold flex items-center space-x-1"
                >
                  <Navigation className="w-3.5 h-3.5 text-gold-700" />
                  <span>GPS</span>
                </button>
              </form>

              {/* Search Suggestions Dropdown */}
              {searchResults.length > 0 && (
                <div className="bg-white border border-gold-400 rounded-xl shadow-lg divide-y divide-champagne-200 max-h-36 overflow-y-auto">
                  {searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSearchResult(item)}
                      className="w-full text-left p-2.5 hover:bg-champagne-100/70 text-xs text-obsidian-800 flex items-start space-x-2 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-gold-600 flex-shrink-0 mt-0.5" />
                      <span className="truncate">{item.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive OpenStreetMap Frame */}
            <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-champagne-300 shadow-inner bg-champagne-100">
              <iframe
                title="Location Map"
                src={mapEmbedUrl}
                className="w-full h-full border-0"
                loading="lazy"
              />

              {/* Luxury Venue Coordinates Badge */}
              <div className="absolute top-2.5 right-2.5 bg-obsidian-950/85 text-ivory-50 text-[10px] px-3 py-1 rounded-full border border-gold-500/40 backdrop-blur-sm shadow-md font-mono">
                {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° W
              </div>
            </div>

            {/* Selected Address Preview */}
            <div className="p-3 bg-champagne-100/70 rounded-2xl border border-champagne-300/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-gold-800 tracking-wider flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-gold-600" />
                <span>Selected Destination Address:</span>
              </span>
              <p className="text-xs text-obsidian-900 font-medium line-clamp-2">
                {selectedMapAddress || 'Click GPS or search to select address'}
              </p>
            </div>

            {/* Quick Luxury Presets */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-[10px] text-obsidian-600">
              <span className="font-semibold text-gold-800 uppercase flex-shrink-0">Popular Hubs:</span>
              {[
                { name: 'Beverly Hills, CA', lat: 34.0736, lng: -118.4004 },
                { name: 'Manhattan, NYC', lat: 40.7831, lng: -73.9712 },
                { name: 'Miami Beach, FL', lat: 25.7907, lng: -80.1300 },
                { name: 'Mayfair, London', lat: 51.5098, lng: -0.1504 },
                { name: 'Downtown Dubai', lat: 25.1972, lng: 55.2744 },
              ].map((hub) => (
                <button
                  key={hub.name}
                  type="button"
                  onClick={async () => {
                    setCoords({ lat: hub.lat, lng: hub.lng });
                    const res = await reverseGeocode(hub.lat, hub.lng);
                    setSelectedMapAddress(res.full);
                  }}
                  className="flex-shrink-0 px-2.5 py-1 rounded-full bg-white border border-champagne-300 hover:border-gold-500 hover:bg-gold-50 text-obsidian-800 transition-colors"
                >
                  {hub.name}
                </button>
              ))}
            </div>

            {/* Footer Action Buttons */}
            <div className="flex justify-end space-x-3 pt-3 border-t border-champagne-300">
              <button
                type="button"
                onClick={() => setMapModalOpen(false)}
                className="px-5 py-2 rounded-full border border-champagne-300 text-xs uppercase tracking-wider text-obsidian-600 hover:bg-champagne-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMapLocation}
                className="px-6 py-2 bg-gradient-to-r from-gold-600 via-gold-500 to-champagne-500 text-obsidian-950 font-bold text-xs uppercase tracking-widest rounded-full shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Venue Location</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
